import { z } from "zod";

export const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
export const taskStatusSchema = z.enum([
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "done",
]);

export const createTaskSchema = z.object({
  id: z.string().optional(), // allow client-generated UUID for offline
  projectId: z.string().min(1, "Projet requis"),
  title: z.string().min(1, "Le titre est obligatoire").max(255),
  descriptionMd: z.string().optional().default(""),
  dueDate: z.string().nullable().optional(), // ISO string or null
  dueTime: z.string().nullable().optional(),
  priority: taskPrioritySchema.default("medium"),
  status: taskStatusSchema.default("todo"),
  position: z.number().optional(),
  assigneeId: z.string().nullable().optional(),
  recurrenceRule: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional().default([]),
});

export const updateTaskSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1).optional(),
  title: z.string().min(1).max(255).optional(),
  descriptionMd: z.string().optional(),
  dueDate: z.string().nullable().optional(),
  dueTime: z.string().nullable().optional(),
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
  position: z.number().optional(),
  assigneeId: z.string().nullable().optional(),
  recurrenceRule: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
  updatedAt: z.string().optional(),
});

export const reorderTaskSchema = z.object({
  taskId: z.string().min(1),
  projectId: z.string().min(1),
  targetStatus: taskStatusSchema,
  newPosition: z.number(),
});

export const taskFilterSchema = z.object({
  projectId: z.string().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  search: z.string().optional(),
  tagId: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDateRange: z.enum(["today", "this_week", "overdue", "upcoming"]).optional(),
  includeDeleted: z.boolean().optional().default(false),
});

export type CreateTaskInput = z.input<typeof createTaskSchema>;
export type UpdateTaskInput = z.input<typeof updateTaskSchema>;
export type ReorderTaskInput = z.input<typeof reorderTaskSchema>;
export type TaskFilterInput = z.input<typeof taskFilterSchema>;
