import { z } from "zod";

export const createCommentSchema = z.object({
  id: z.string().optional(),
  taskId: z.string().min(1),
  bodyMd: z.string().min(1, "Le commentaire ne peut pas être vide").max(5000),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
