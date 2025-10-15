import request from 'supertest';
import { app, pool } from './server.js'; // Import the Express app and database pool
import { createTaskInputSchema } from './schema.js';

// Setup and teardown hooks for database testing
beforeAll(async () => {
  // Initialize database connection or pool, and set up initial test data if necessary
});

afterAll(async () => {
  // Clean up database connections or other resources
  await pool.end();
});

describe('User Management API Endpoints', () => {
  test('POST /auth/register - Successful user registration', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ email: 'testuser@example.com', password_hash: 'password123', name: 'Test User' });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('auth_token');
    expect(response.body).toHaveProperty('user');
  });

  test('POST /auth/register - Fail with missing fields', async () => {
    const response = await request(app).post('/auth/register').send({ email: 'testuser2@example.com' });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('POST /auth/login - Successful login', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'testuser@example.com', password: 'password123' });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('auth_token');
    expect(response.body).toHaveProperty('user');
  });

  test('POST /auth/logout - Successful logout', async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ email: 'testuser@example.com', password: 'password123' });
    const response = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${loginResponse.body.auth_token}`);
    expect(response.statusCode).toBe(204);
  });

  test('POST /auth/password-recovery - Initiate password recovery', async () => {
    const response = await request(app).post('/auth/password-recovery').send({ email: 'testuser@example.com' });
    expect(response.statusCode).toBe(200);
  });
});

describe('Task Management API Endpoints', () => {
  let authToken;
  beforeEach(async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'testuser@example.com', password: 'password123' });
    authToken = response.body.auth_token;
  });

  test('POST /tasks - Create a new task', async () => {
    const validTaskData = {
      title: 'New Task',
      description: 'This is a new task',
      priority: 'medium',
    };

    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send(validTaskData);

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject(validTaskData);
  });

  test('GET /tasks - Retrieve all tasks', async () => {
    const response = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${authToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  test('PUT /tasks/:task_id - Update task', async () => {
    const taskResponse = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Task to update',
        description: 'Update this task',
      });

    const updatedData = { title: 'Updated Task' };
    const updateResponse = await request(app)
      .put(`/tasks/${taskResponse.body.task_id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedData);

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.title).toBe(updatedData.title);
  });

  test('DELETE /tasks/:task_id - Delete a task', async () => {
    const taskResponse = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Temporary Task',
        description: 'Delete this task',
      });

    const response = await request(app)
      .delete(`/tasks/${taskResponse.body.task_id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(204);
  });
});

describe('Task List Management API Endpoints', () => {
  let authToken;
  beforeEach(async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'testuser@example.com',
      password: 'password123',
    });
    authToken = response.body.auth_token;
  });

  test('POST /task-lists - Create a new task list', async () => {
    const response = await request(app).post('/task-lists').set('Authorization', `Bearer ${authToken}`).send({
      name: 'New Task List',
    });
    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe('New Task List');
  });

  test('GET /task-lists - Retrieve all task lists', async () => {
    const response = await request(app).get('/task-lists').set('Authorization', `Bearer ${authToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  test('PUT /task-lists/:list_id - Update a task list', async () => {
    const listResponse = await request(app).post('/task-lists').set('Authorization', `Bearer ${authToken}`).send({
      name: 'List to Update',
    });

    const updatedData = { name: 'Updated List' };
    const updateResponse = await request(app).put(`/task-lists/${listResponse.body.list_id}`).set('Authorization', `Bearer ${authToken}`).send(updatedData);
    
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body.name).toBe(updatedData.name);
  });

  test('DELETE /task-lists/:list_id - Delete a task list', async () => {
    const listResponse = await request(app).post('/task-lists').set('Authorization', `Bearer ${authToken}`).send({
      name: 'Temporary List',
    });

    const deleteResponse = await request(app).delete(`/task-lists/${listResponse.body.list_id}`).set('Authorization', `Bearer ${authToken}`);
    expect(deleteResponse.statusCode).toBe(204);
  });
});