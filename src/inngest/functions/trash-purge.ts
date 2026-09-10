import { inngest } from "../client";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { and, isNotNull, lte } from "drizzle-orm";

export const trashPurgeCron = inngest.createFunction(
  { id: "purge-expired-trash", triggers: [{ cron: "0 3 * * *" }] },
  async ({ step }) => {
    const deletedCount = await step.run("purge-old-tasks", async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await db
        .delete(tasks)
        .where(and(isNotNull(tasks.deletedAt), lte(tasks.deletedAt, thirtyDaysAgo)));

      return { purged: true };
    });

    return deletedCount;
  }
);
