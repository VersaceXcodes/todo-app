import { z } from 'zod';

// User Schemas
export const userSchema = z.object({
  user_id: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  name: z.string().nullable(),
  created_at: z.coerce.date(),
  email_verified: z.boolean(),
});

export const createUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string().nullable(),
});

export const updateUserInputSchema = z.object({
  user_id: z.string(),
  email: z.string().email().optional(),
  password_hash: z.string().optional(),
  name: z.string().nullable().optional(),
  email_verified: z.boolean().optional(),
});

export const searchUserInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['email', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// Task Schemas
export const taskSchema = z.object({
  task_id: z.string(),
  user_id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  is_completed: z.boolean(),
  priority: z.enum(['high', 'medium', 'low']),
  due_date: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
});

export const createTaskInputSchema = z.object({
  user_id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  is_completed: z.boolean().default(false),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  due_date: z.coerce.date().nullable(),
});

export const updateTaskInputSchema = z.object({
  task_id: z.string(),
  user_id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  is_completed: z.boolean().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  due_date: z.coerce.date().nullable().optional(),
});

export const searchTaskInputSchema = z.object({
  query: z.string().optional(),
  user_id: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['title', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// Task List Schemas
export const taskListSchema = z.object({
  list_id: z.string(),
  user_id: z.string(),
  name: z.string(),
});

export const createTaskListInputSchema = z.object({
  user_id: z.string(),
  name: z.string(),
});

export const updateTaskListInputSchema = z.object({
  list_id: z.string(),
  user_id: z.string().optional(),
  name: z.string().optional(),
});

export const searchTaskListInputSchema = z.object({
  query: z.string().optional(),
  user_id: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['name']).default('name'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
});

// Task List Relation Schemas
export const taskListRelationSchema = z.object({
  list_id: z.string(),
  task_id: z.string(),
});

// Tag Schemas
export const tagSchema = z.object({
  tag_id: z.string(),
  user_id: z.string(),
  name: z.string(),
});

export const createTagInputSchema = z.object({
  user_id: z.string(),
  name: z.string(),
});

export const updateTagInputSchema = z.object({
  tag_id: z.string(),
  user_id: z.string().optional(),
  name: z.string().optional(),
});

export const searchTagInputSchema = z.object({
  query: z.string().optional(),
  user_id: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['name']).default('name'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
});

// Task Tag Schemas
export const taskTagSchema = z.object({
  task_id: z.string(),
  tag_id: z.string(),
});

// Task Collaboration Schemas
export const taskCollaborationSchema = z.object({
  task_id: z.string(),
  collaborator_email: z.string(),
});

export const createTaskCollaborationInputSchema = z.object({
  task_id: z.string(),
  collaborator_email: z.string().email(),
});

// Task Comment Schemas
export const taskCommentSchema = z.object({
  comment_id: z.string(),
  task_id: z.string(),
  user_id: z.string(),
  content: z.string(),
  created_at: z.coerce.date(),
});

export const createTaskCommentInputSchema = z.object({
  task_id: z.string(),
  user_id: z.string(),
  content: z.string().min(1),
});

// Reminder Schemas
export const reminderSchema = z.object({
  reminder_id: z.string(),
  task_id: z.string(),
  remind_at: z.coerce.date(),
  method: z.enum(['email', 'push']),
});

export const createReminderInputSchema = z.object({
  task_id: z.string(),
  remind_at: z.coerce.date(),
  method: z.enum(['email', 'push']).default('email'),
});

// Types inferred from Zod schemas
export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
export type SearchUserInput = z.infer<typeof searchUserInputSchema>;

export type Task = z.infer<typeof taskSchema>;
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
export type SearchTaskInput = z.infer<typeof searchTaskInputSchema>;

export type TaskList = z.infer<typeof taskListSchema>;
export type CreateTaskListInput = z.infer<typeof createTaskListInputSchema>;
export type UpdateTaskListInput = z.infer<typeof updateTaskListInputSchema>;
export type SearchTaskListInput = z.infer<typeof searchTaskListInputSchema>;

export type TaskListRelation = z.infer<typeof taskListRelationSchema>;

export type Tag = z.infer<typeof tagSchema>;
export type CreateTagInput = z.infer<typeof createTagInputSchema>;
export type UpdateTagInput = z.infer<typeof updateTagInputSchema>;
export type SearchTagInput = z.infer<typeof searchTagInputSchema>;

export type TaskTag = z.infer<typeof taskTagSchema>;

export type TaskCollaboration = z.infer<typeof taskCollaborationSchema>;
export type CreateTaskCollaborationInput = z.infer<typeof createTaskCollaborationInputSchema>;

export type TaskComment = z.infer<typeof taskCommentSchema>;
export type CreateTaskCommentInput = z.infer<typeof createTaskCommentInputSchema>;

export type Reminder = z.infer<typeof reminderSchema>;
export type CreateReminderInput = z.infer<typeof createReminderInputSchema>;