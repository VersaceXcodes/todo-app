import { z } from 'zod'

export const searchTaskInputSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  filters: z.object({
    priority: z.enum(['low', 'medium', 'high']).optional(),
    status: z.enum(['pending', 'in_progress', 'completed']).optional(),
    due_date: z.date().optional(),
  }).optional(),
})

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['pending', 'in_progress', 'completed']),
  due_date: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
})

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(1, 'Message is required'),
})

export type SearchTaskInput = z.infer<typeof searchTaskInputSchema>
export type Task = z.infer<typeof taskSchema>
export type Contact = z.infer<typeof contactSchema>