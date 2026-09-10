import { z } from "zod";

export const pendingMutationSchema = z.object({
  id: z.string().min(1),
  entity: z.enum(["task", "subtask", "comment"]),
  action: z.enum(["create", "update", "delete", "reorder"]),
  payload: z.record(z.string(), z.any()),
  timestamp: z.number(),
  clientUpdatedAt: z.string(),
});

export const syncBatchSchema = z.object({
  mutations: z.array(pendingMutationSchema),
  lastSyncedAt: z.string().optional(),
});

export type PendingMutation = z.infer<typeof pendingMutationSchema>;
export type SyncBatchInput = z.infer<typeof syncBatchSchema>;
