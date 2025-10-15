import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import { PGlite } from '@electric-sql/pglite';

// Import Zod schemas
import {
  userSchema,
  createUserInputSchema,
  updateUserInputSchema,
  searchUserInputSchema,
  taskSchema,
  createTaskInputSchema,
  updateTaskInputSchema,
  searchTaskInputSchema,
  taskListSchema,
  createTaskListInputSchema,
  updateTaskListInputSchema,
  searchTaskListInputSchema,
  tagSchema,
  createTagInputSchema,
  updateTagInputSchema,
  searchTagInputSchema,
  taskTagSchema,
  taskCollaborationSchema,
  createTaskCollaborationInputSchema,
  taskCommentSchema,
  createTaskCommentInputSchema,
  reminderSchema,
  createReminderInputSchema
} from './schema.js';

dotenv.config();

// ESM workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Error response utility
interface ErrorResponse {
  success: false;
  message: string;
  error_code?: string;
  details?: any;
  timestamp: string;
}

function createErrorResponse(
  message: string,
  error?: any,
  errorCode?: string
): ErrorResponse {
  const response: ErrorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errorCode) {
    response.error_code = errorCode;
  }

  if (error) {
    response.details = {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  return response;
}

// Database configuration
const { JWT_SECRET = 'your-secret-key' } = process.env;

// Use PGlite for in-memory database
const db = new PGlite();

// Create a query function that matches the pg.Pool interface
const query = async (text, params?) => {
  try {
    const result = await db.query(text, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Initialize database with schema when the server starts
const initializeDatabase = async () => {
  try {
    // ESM workaround for __dirname
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Check if users table exists and has data
    try {
      const result = await query('SELECT COUNT(*) as count FROM users');
      if (result.rows[0].count > 0) {
        console.log('Database already initialized with data, skipping initialization');
        return;
      }
    } catch (error) {
      // Table doesn't exist, continue with initialization
      console.log('Database not initialized, proceeding with initialization');
    }
    
    // Read and split SQL commands
    const dbInitCommands = fs
      .readFileSync(path.join(__dirname, 'db.sql'), "utf-8")
      .toString()
      .split(/(?=CREATE TABLE |INSERT INTO)/);

    // Execute each command
    for (let cmd of dbInitCommands) {
      if (cmd.trim()) {
        await query(cmd);
      }
    }
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Initialize database immediately
await initializeDatabase();

const app = express();
const port = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }));
app.use(morgan('combined'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

/*
Authentication middleware for protected routes
Validates JWT token and loads user information
*/
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json(createErrorResponse('Access token required', null, 'AUTH_TOKEN_REQUIRED'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { user_id: string };
    const result = await query('SELECT user_id, email, name, created_at FROM users WHERE user_id = $1', [decoded.user_id]);
    
    if (result.rows.length === 0) {
      return res.status(401).json(createErrorResponse('Invalid token - user not found', null, 'AUTH_USER_NOT_FOUND'));
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json(createErrorResponse('Invalid or expired token', error, 'AUTH_TOKEN_INVALID'));
  }
};

/*
@@need:external-api: Email service API for sending password recovery emails to users
Mock function for password recovery email sending
*/
async function sendPasswordRecoveryEmail({ email }) {
  // Mock response - in production, this would integrate with an email service like SendGrid, AWS SES, etc.
  return {
    success: true,
    message_id: `msg_${Date.now()}`,
    email_sent_to: email,
    recovery_link: `https://todomaster.com/reset-password?token=mock_token_${Date.now()}`
  };
}

/*
@@need:external-api: Notification service API for sending reminders via email/push notifications
Mock function for sending reminders through various notification channels
*/
async function sendReminderNotification({ task_id, method, remind_at, task_title }) {
  // Mock response - in production, this would integrate with notification services
  return {
    success: true,
    notification_id: `notif_${Date.now()}`,
    method: method,
    scheduled_for: remind_at,
    message: `Reminder: ${task_title}`,
    delivery_status: 'scheduled'
  };
}

// Auth Routes

/*
User registration endpoint
Creates new user account with email and password, returns JWT token
*/
app.post('/api/auth/register', async (req, res) => {
  try {
    const validatedData = createUserInputSchema.parse(req.body);
    const { email, password, name } = validatedData;

    // Check if user already exists
    const existingUser = await query('SELECT user_id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json(createErrorResponse('User with this email already exists', null, 'USER_ALREADY_EXISTS'));
    }

    // Create new user (no password hashing for development)
    const user_id = uuidv4();
    const created_at = new Date().toISOString();
    
    const result = await query(
      'INSERT INTO users (user_id, email, password_hash, name, created_at, email_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [user_id, email.toLowerCase().trim(), password, name, created_at, false]
    );

    const user = result.rows[0];

    // Generate JWT token
    const auth_token = jwt.sign(
      { user_id: user.user_id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      auth_token,
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        email_verified: user.email_verified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json(createErrorResponse('Registration failed', error, 'REGISTRATION_ERROR'));
  }
});

/*
User login endpoint
Authenticates user credentials and returns JWT token
*/
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(createErrorResponse('Email and password are required', null, 'MISSING_CREDENTIALS'));
    }

    // Find user and verify password (direct comparison for development)
    const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(400).json(createErrorResponse('Invalid email or password', null, 'INVALID_CREDENTIALS'));
    }

    const user = result.rows[0];
    if (password !== user.password_hash) {
      return res.status(400).json(createErrorResponse('Invalid email or password', null, 'INVALID_CREDENTIALS'));
    }

    // Generate JWT token
    const auth_token = jwt.sign(
      { user_id: user.user_id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      auth_token,
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        email_verified: user.email_verified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(createErrorResponse('Login failed', error, 'LOGIN_ERROR'));
  }
});

/*
Password recovery endpoint
Initiates password recovery process by sending email to user
*/
app.post('/api/auth/password-recovery', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(createErrorResponse('Email is required', null, 'MISSING_EMAIL'));
    }

    // Check if user exists
    const result = await query('SELECT user_id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'Password recovery email sent if account exists' });
    }

    // Send password recovery email
    await sendPasswordRecoveryEmail({ email });

    res.json({ message: 'Password recovery email sent if account exists' });
  } catch (error) {
    console.error('Password recovery error:', error);
    res.status(500).json(createErrorResponse('Password recovery failed', error, 'PASSWORD_RECOVERY_ERROR'));
  }
});

/*
User logout endpoint
Invalidates the current session (client-side token removal)
*/
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  // In a stateless JWT setup, logout is handled client-side by removing the token
  // In production, you might maintain a blacklist of invalidated tokens
  res.status(204).send();
});

// User Routes

/*
Get user profile endpoint
Returns user information by user_id
*/
app.get('/api/users/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await query('SELECT user_id, email, name, created_at, email_verified FROM users WHERE user_id = $1', [user_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('User not found', null, 'USER_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json(createErrorResponse('Failed to get user profile', error, 'GET_USER_ERROR'));
  }
});

// Task Routes

/*
List/search tasks endpoint
Returns filtered and paginated tasks with search capability
*/
app.get('/api/tasks', async (req, res) => {
  try {
    const validatedQuery = searchTaskInputSchema.parse(req.query);
    const { query, user_id, limit, offset, sort_by, sort_order } = validatedQuery;

    let sql = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Add search filters
    if (query) {
      sql += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${query}%`);
      paramIndex++;
    }

    if (user_id) {
      sql += ` AND user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }

    // Add sorting
    sql += ` ORDER BY ${sort_by} ${sort_order}`;

    // Add pagination
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Transform date strings to proper format for response
    const tasks = result.rows.map(task => ({
      ...task,
      created_at: task.created_at,
      due_date: task.due_date
    }));

    res.json(tasks);
  } catch (error) {
    console.error('List tasks error:', error);
    res.status(500).json(createErrorResponse('Failed to list tasks', error, 'LIST_TASKS_ERROR'));
  }
});

/*
Create task endpoint
Creates a new task for the authenticated user
*/
app.post('/api/tasks', async (req, res) => {
  try {
    const validatedData = createTaskInputSchema.parse(req.body);
    const { user_id, title, description, is_completed, priority, due_date } = validatedData;

    const task_id = uuidv4();
    const created_at = new Date().toISOString();
    const due_date_str = due_date ? due_date.toISOString() : null;

    const result = await query(
      'INSERT INTO tasks (task_id, user_id, title, description, is_completed, priority, due_date, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [task_id, user_id, title, description, is_completed, priority, due_date_str, created_at]
    );

    const task = result.rows[0];
    res.status(201).json({
      ...task,
      created_at: task.created_at,
      due_date: task.due_date
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json(createErrorResponse('Failed to create task', error, 'CREATE_TASK_ERROR'));
  }
});

/*
Get single task endpoint
Returns detailed information for a specific task
*/
app.get('/api/tasks/:task_id', async (req, res) => {
  try {
    const { task_id } = req.params;

    const result = await query('SELECT * FROM tasks WHERE task_id = $1', [task_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Task not found', null, 'TASK_NOT_FOUND'));
    }

    const task = result.rows[0];
    res.json({
      ...task,
      created_at: task.created_at,
      due_date: task.due_date
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json(createErrorResponse('Failed to get task', error, 'GET_TASK_ERROR'));
  }
});

/*
Update task endpoint
Updates an existing task with new information
*/
app.put('/api/tasks/:task_id', async (req, res) => {
  try {
    const { task_id } = req.params;
    const validatedData = updateTaskInputSchema.parse({ ...req.body, task_id });

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (validatedData.title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      params.push(validatedData.title);
      paramIndex++;
    }

    if (validatedData.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(validatedData.description);
      paramIndex++;
    }

    if (validatedData.is_completed !== undefined) {
      updates.push(`is_completed = $${paramIndex}`);
      params.push(validatedData.is_completed);
      paramIndex++;
    }

    if (validatedData.priority !== undefined) {
      updates.push(`priority = $${paramIndex}`);
      params.push(validatedData.priority);
      paramIndex++;
    }

    if (validatedData.due_date !== undefined) {
      updates.push(`due_date = $${paramIndex}`);
      params.push(validatedData.due_date ? validatedData.due_date.toISOString() : null);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
    }

    params.push(task_id);
    const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE task_id = $${paramIndex} RETURNING *`;

    const result = await query(sql, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Task not found', null, 'TASK_NOT_FOUND'));
    }

    const task = result.rows[0];
    res.json({
      ...task,
      created_at: task.created_at,
      due_date: task.due_date
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json(createErrorResponse('Failed to update task', error, 'UPDATE_TASK_ERROR'));
  }
});

/*
Delete task endpoint
Removes a task and all associated data (tags, comments, etc.)
*/
app.delete('/api/tasks/:task_id', async (req, res) => {
  try {
    const { task_id } = req.params;

    // Delete related records first
    await query('DELETE FROM task_tags WHERE task_id = $1', [task_id]);
    await query('DELETE FROM task_list_relations WHERE task_id = $1', [task_id]);
    await query('DELETE FROM task_collaborations WHERE task_id = $1', [task_id]);
    await query('DELETE FROM task_comments WHERE task_id = $1', [task_id]);
    await query('DELETE FROM reminders WHERE task_id = $1', [task_id]);
    
    // Delete the task
    const result = await query('DELETE FROM tasks WHERE task_id = $1 RETURNING task_id', [task_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Task not found', null, 'TASK_NOT_FOUND'));
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json(createErrorResponse('Failed to delete task', error, 'DELETE_TASK_ERROR'));
  }
});

// Task List Routes

/*
List/search task lists endpoint
Returns filtered and paginated task lists
*/
app.get('/api/task-lists', async (req, res) => {
  try {
    const validatedQuery = searchTaskListInputSchema.parse(req.query);
    const { query, user_id, limit, offset, sort_by, sort_order } = validatedQuery;

    let sql = 'SELECT * FROM task_lists WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (query) {
      sql += ` AND name ILIKE $${paramIndex}`;
      params.push(`%${query}%`);
      paramIndex++;
    }

    if (user_id) {
      sql += ` AND user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }

    sql += ` ORDER BY ${sort_by} ${sort_order}`;
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('List task lists error:', error);
    res.status(500).json(createErrorResponse('Failed to list task lists', error, 'LIST_TASK_LISTS_ERROR'));
  }
});

/*
Create task list endpoint
Creates a new task list for organizing tasks
*/
app.post('/api/task-lists', async (req, res) => {
  try {
    const validatedData = createTaskListInputSchema.parse(req.body);
    const { user_id, name } = validatedData;

    const list_id = uuidv4();

    const result = await query(
      'INSERT INTO task_lists (list_id, user_id, name) VALUES ($1, $2, $3) RETURNING *',
      [list_id, user_id, name]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create task list error:', error);
    res.status(500).json(createErrorResponse('Failed to create task list', error, 'CREATE_TASK_LIST_ERROR'));
  }
});

/*
Get single task list endpoint
Returns detailed information for a specific task list
*/
app.get('/api/task-lists/:list_id', async (req, res) => {
  try {
    const { list_id } = req.params;

    const result = await query('SELECT * FROM task_lists WHERE list_id = $1', [list_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Task list not found', null, 'TASK_LIST_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get task list error:', error);
    res.status(500).json(createErrorResponse('Failed to get task list', error, 'GET_TASK_LIST_ERROR'));
  }
});

/*
Update task list endpoint
Updates an existing task list's information
*/
app.put('/api/task-lists/:list_id', async (req, res) => {
  try {
    const { list_id } = req.params;
    const validatedData = updateTaskListInputSchema.parse({ ...req.body, list_id });

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (validatedData.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      params.push(validatedData.name);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json(createErrorResponse('No fields to update', null, 'NO_UPDATE_FIELDS'));
    }

    params.push(list_id);
    const sql = `UPDATE task_lists SET ${updates.join(', ')} WHERE list_id = $${paramIndex} RETURNING *`;

    const result = await query(sql, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Task list not found', null, 'TASK_LIST_NOT_FOUND'));
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update task list error:', error);
    res.status(500).json(createErrorResponse('Failed to update task list', error, 'UPDATE_TASK_LIST_ERROR'));
  }
});

/*
Delete task list endpoint
Removes a task list and its task associations
*/
app.delete('/api/task-lists/:list_id', async (req, res) => {
  try {
    const { list_id } = req.params;

    // Delete task list relations first
    await query('DELETE FROM task_list_relations WHERE list_id = $1', [list_id]);
    
    // Delete the task list
    const result = await query('DELETE FROM task_lists WHERE list_id = $1 RETURNING list_id', [list_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Task list not found', null, 'TASK_LIST_NOT_FOUND'));
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete task list error:', error);
    res.status(500).json(createErrorResponse('Failed to delete task list', error, 'DELETE_TASK_LIST_ERROR'));
  }
});

// Tag Routes

/*
List/search tags endpoint
Returns filtered and paginated tags for categorizing tasks
*/
app.get('/api/tags', async (req, res) => {
  try {
    const validatedQuery = searchTagInputSchema.parse(req.query);
    const { query, user_id, limit, offset, sort_by, sort_order } = validatedQuery;

    let sql = 'SELECT * FROM tags WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (query) {
      sql += ` AND name ILIKE $${paramIndex}`;
      params.push(`%${query}%`);
      paramIndex++;
    }

    if (user_id) {
      sql += ` AND user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }

    sql += ` ORDER BY ${sort_by} ${sort_order}`;
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('List tags error:', error);
    res.status(500).json(createErrorResponse('Failed to list tags', error, 'LIST_TAGS_ERROR'));
  }
});

/*
Create tag endpoint
Creates a new tag for task categorization
*/
app.post('/api/tags', async (req, res) => {
  try {
    const validatedData = createTagInputSchema.parse(req.body);
    const { user_id, name } = validatedData;

    const tag_id = uuidv4();

    const result = await query(
      'INSERT INTO tags (tag_id, user_id, name) VALUES ($1, $2, $3) RETURNING *',
      [tag_id, user_id, name]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json(createErrorResponse('Failed to create tag', error, 'CREATE_TAG_ERROR'));
  }
});

/*
Delete tag endpoint
Removes a tag and all its task associations
*/
app.delete('/api/tags/:tag_id', async (req, res) => {
  try {
    const { tag_id } = req.params;

    // Delete task tag relations first
    await query('DELETE FROM task_tags WHERE tag_id = $1', [tag_id]);
    
    // Delete the tag
    const result = await query('DELETE FROM tags WHERE tag_id = $1 RETURNING tag_id', [tag_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Tag not found', null, 'TAG_NOT_FOUND'));
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json(createErrorResponse('Failed to delete tag', error, 'DELETE_TAG_ERROR'));
  }
});

// Task-Tag Association Routes

/*
Associate tag with task endpoint
Creates a many-to-many relationship between tasks and tags
*/
app.post('/api/task-tags', async (req, res) => {
  try {
    const { task_id, tag_id } = req.body;

    if (!task_id || !tag_id) {
      return res.status(400).json(createErrorResponse('Task ID and Tag ID are required', null, 'MISSING_IDS'));
    }

    // Check if association already exists
    const existing = await query('SELECT * FROM task_tags WHERE task_id = $1 AND tag_id = $2', [task_id, tag_id]);
    if (existing.rows.length > 0) {
      return res.status(400).json(createErrorResponse('Tag already associated with task', null, 'ASSOCIATION_EXISTS'));
    }

    await query('INSERT INTO task_tags (task_id, tag_id) VALUES ($1, $2)', [task_id, tag_id]);

    res.status(201).json({ message: 'Tag associated with task successfully' });
  } catch (error) {
    console.error('Associate tag error:', error);
    res.status(500).json(createErrorResponse('Failed to associate tag with task', error, 'ASSOCIATE_TAG_ERROR'));
  }
});

/*
Remove tag from task endpoint
Removes the association between a task and tag
*/
app.delete('/api/task-tags/:task_id/:tag_id', async (req, res) => {
  try {
    const { task_id, tag_id } = req.params;

    const result = await query('DELETE FROM task_tags WHERE task_id = $1 AND tag_id = $2 RETURNING *', [task_id, tag_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json(createErrorResponse('Tag association not found', null, 'ASSOCIATION_NOT_FOUND'));
    }

    res.status(204).send();
  } catch (error) {
    console.error('Remove tag error:', error);
    res.status(500).json(createErrorResponse('Failed to remove tag from task', error, 'REMOVE_TAG_ERROR'));
  }
});

// Reminder Routes

/*
Create reminder endpoint
Creates a notification reminder for a specific task
*/
app.post('/api/reminders', async (req, res) => {
  try {
    const validatedData = createReminderInputSchema.parse(req.body);
    const { task_id, remind_at, method } = validatedData;

    const reminder_id = uuidv4();

    const result = await query(
      'INSERT INTO reminders (reminder_id, task_id, remind_at, method) VALUES ($1, $2, $3, $4) RETURNING *',
      [reminder_id, task_id, remind_at.toISOString(), method]
    );

    // Get task details for notification
    const taskResult = await query('SELECT title FROM tasks WHERE task_id = $1', [task_id]);
    const task_title = taskResult.rows[0]?.title || 'Untitled Task';

    // Schedule the reminder notification
    await sendReminderNotification({
      task_id,
      method,
      remind_at: remind_at.toISOString(),
      task_title
    });

    const reminder = result.rows[0];
    res.status(201).json({
      ...reminder,
      remind_at: reminder.remind_at
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json(createErrorResponse('Failed to create reminder', error, 'CREATE_REMINDER_ERROR'));
  }
});

// Collaboration Routes

/*
Collaborate on task endpoint
Invites another user to collaborate on a task
*/
app.post('/api/task-collaborations', async (req, res) => {
  try {
    const validatedData = createTaskCollaborationInputSchema.parse(req.body);
    const { task_id, collaborator_email } = validatedData;

    // Check if collaboration already exists
    const existing = await query('SELECT * FROM task_collaborations WHERE task_id = $1 AND collaborator_email = $2', [task_id, collaborator_email]);
    if (existing.rows.length > 0) {
      return res.status(400).json(createErrorResponse('Collaborator already added to task', null, 'COLLABORATION_EXISTS'));
    }

    await query('INSERT INTO task_collaborations (task_id, collaborator_email) VALUES ($1, $2)', [task_id, collaborator_email]);

    res.status(201).json({
      task_id,
      collaborator_email,
      message: 'Collaboration invitation sent successfully'
    });
  } catch (error) {
    console.error('Create collaboration error:', error);
    res.status(500).json(createErrorResponse('Failed to create collaboration', error, 'CREATE_COLLABORATION_ERROR'));
  }
});

// Comment Routes

/*
Add comment to task endpoint
Allows users to add comments to tasks for collaboration
*/
app.post('/api/task-comments', async (req, res) => {
  try {
    const validatedData = createTaskCommentInputSchema.parse(req.body);
    const { task_id, user_id, content } = validatedData;

    const comment_id = uuidv4();
    const created_at = new Date().toISOString();

    const result = await query(
      'INSERT INTO task_comments (comment_id, task_id, user_id, content, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [comment_id, task_id, user_id, content, created_at]
    );

    const comment = result.rows[0];
    res.status(201).json({
      ...comment,
      created_at: comment.created_at
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json(createErrorResponse('Failed to create comment', error, 'CREATE_COMMENT_ERROR'));
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA catch-all route for client-side routing (excludes API routes)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export for testing and external usage
export { app, pool };

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`TodoMaster server running on port ${port} and listening on 0.0.0.0`);
});