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
    console.log('Executing query:', text, params);
    const result = await db.query(text, params);
    console.log('Query result:', result);
    return {
      rows: result.rows,
      rowCount: result.rowCount
    };
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query text:', text);
    console.error('Query params:', params);
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

// Initialize database and start server
initializeDatabase().then(() => {
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
  
  // Authentication middleware
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
  
  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      console.log('Registration request received:', req.body);
      
      // Make sure name is handled properly
      const requestData = { ...req.body };
      if (requestData.name === undefined) {
        requestData.name = null;
      }
      
      console.log('Request data after name handling:', requestData);
      const validatedData = createUserInputSchema.parse(requestData);
      console.log('Validated data:', validatedData);
      const { email, password, name } = validatedData;
  
      // Check if user already exists
      console.log('Checking if user already exists:', email);
      const existingUser = await query('SELECT user_id FROM users WHERE email = $1', [email]);
      console.log('Existing user check result:', existingUser);
      
      if (existingUser.rows.length > 0) {
        console.log('User already exists');
        return res.status(400).json(createErrorResponse('User with this email already exists', null, 'USER_ALREADY_EXISTS'));
      }
  
      // Create new user (no password hashing for development)
      console.log('Creating new user');
      const user_id = uuidv4();
      const created_at = new Date().toISOString();
      
      const result = await query(
        'INSERT INTO users (user_id, email, password_hash, name, created_at, email_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [user_id, email.toLowerCase().trim(), password, name, created_at, false]
      );
      
      console.log('User creation result:', result);
  
      const user = result.rows[0];
  
      // Generate JWT token
      console.log('Generating JWT token');
      const auth_token = jwt.sign(
        { user_id: user.user_id, email: user.email }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );
      
      console.log('Sending response');
  
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
  
  // Start server
  app.listen(port, '0.0.0.0', () => {
    console.log(`TodoMaster server running on port ${port} and listening on 0.0.0.0`);
  });
}).catch((error) => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});