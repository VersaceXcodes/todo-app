-- Create 'users' table
CREATE TABLE users (
    user_id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    name VARCHAR,
    created_at VARCHAR NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create 'tasks' table
CREATE TABLE tasks (
    task_id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    title VARCHAR NOT NULL,
    description VARCHAR,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    priority VARCHAR NOT NULL DEFAULT 'medium',
    due_date VARCHAR,
    created_at VARCHAR NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create 'task_lists' table
CREATE TABLE task_lists (
    list_id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create 'task_list_relations' table
CREATE TABLE task_list_relations (
    list_id VARCHAR NOT NULL,
    task_id VARCHAR NOT NULL,
    FOREIGN KEY (list_id) REFERENCES task_lists(list_id),
    FOREIGN KEY (task_id) REFERENCES tasks(task_id)
);

-- Create 'tags' table
CREATE TABLE tags (
    tag_id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create 'task_tags' table
CREATE TABLE task_tags (
    task_id VARCHAR NOT NULL,
    tag_id VARCHAR NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id),
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id)
);

-- Create 'task_collaborations' table
CREATE TABLE task_collaborations (
    task_id VARCHAR NOT NULL,
    collaborator_email VARCHAR NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id)
);

-- Create 'task_comments' table
CREATE TABLE task_comments (
    comment_id VARCHAR PRIMARY KEY,
    task_id VARCHAR NOT NULL,
    user_id VARCHAR NOT NULL,
    content VARCHAR NOT NULL,
    created_at VARCHAR NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create 'reminders' table
CREATE TABLE reminders (
    reminder_id VARCHAR PRIMARY KEY,
    task_id VARCHAR NOT NULL,
    remind_at VARCHAR NOT NULL,
    method VARCHAR NOT NULL DEFAULT 'email',
    FOREIGN KEY (task_id) REFERENCES tasks(task_id)
);

-- Seed data for 'users' table
INSERT INTO users (user_id, email, password_hash, name, created_at, email_verified) VALUES
('user1', 'user1@example.com', 'password123', 'John Doe', '2023-03-01T10:00:00Z', TRUE),
('user2', 'user2@example.com', 'user123', 'Jane Smith', '2023-03-01T11:00:00Z', FALSE),
('user3', 'user3@example.com', 'admin123', 'Mark Brown', '2023-03-01T12:00:00Z', FALSE);

-- Seed data for 'tasks' table
INSERT INTO tasks (task_id, user_id, title, description, is_completed, priority, due_date, created_at) VALUES
('task1', 'user1', 'Task One', 'Description for task one', FALSE, 'high', '2023-04-15T12:00:00Z', '2023-03-01T10:05:00Z'),
('task2', 'user1', 'Task Two', 'Description for task two', TRUE, 'medium', NULL, '2023-03-01T10:06:00Z'),
('task3', 'user2', 'Task Three', 'Description for task three', FALSE, 'low', '2023-04-18T12:00:00Z', '2023-03-01T11:05:00Z');

-- Seed data for 'task_lists' table
INSERT INTO task_lists (list_id, user_id, name) VALUES
('list1', 'user1', 'Personal Tasks'),
('list2', 'user2', 'Work Tasks');

-- Seed data for 'task_list_relations' table
INSERT INTO task_list_relations (list_id, task_id) VALUES
('list1', 'task1'),
('list1', 'task2'),
('list2', 'task3');

-- Seed data for 'tags' table
INSERT INTO tags (tag_id, user_id, name) VALUES
('tag1', 'user1', 'Urgent'),
('tag2', 'user2', 'Home');

-- Seed data for 'task_tags' table
INSERT INTO task_tags (task_id, tag_id) VALUES
('task1', 'tag1'),
('task2', 'tag1'),
('task3', 'tag2');

-- Seed data for 'task_collaborations' table
INSERT INTO task_collaborations (task_id, collaborator_email) VALUES
('task1', 'collab1@example.com'),
('task3', 'collab2@example.com');

-- Seed data for 'task_comments' table
INSERT INTO task_comments (comment_id, task_id, user_id, content, created_at) VALUES
('comment1', 'task1', 'user2', 'This is a comment on task one.', '2023-03-01T10:10:00Z'),
('comment2', 'task3', 'user1', 'This is a comment on task three.', '2023-03-01T11:20:00Z');

-- Seed data for 'reminders' table
INSERT INTO reminders (reminder_id, task_id, remind_at, method) VALUES
('reminder1', 'task1', '2023-04-14T10:00:00Z', 'email'),
('reminder2', 'task3', '2023-04-17T09:00:00Z', 'push');