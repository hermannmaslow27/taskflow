import { z } from "zod";

export const createSubtaskSchema = z.object({
  id: z.string().optional(),
  taskId: z.string().min(1),
  title: z.string().min(1, "Le titre est obligatoire").max(255),
  position: z.number().optional(),
});

export const toggleSubtaskSchema = z.object({
  id: z.string().min(1),
  taskId: z.string().min(1),
  isDone: z.boolean(),
});

export const reorderSubtaskSchema = z.object({
  id: z.string().min(1),
  taskId: z.string().min(1),
  newPosition: z.number(),
});

export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;
export type ToggleSubtaskInput = z.infer<typeof toggleSubtaskSchema>;
