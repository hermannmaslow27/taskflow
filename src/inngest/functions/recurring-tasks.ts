import { inngest } from "../client";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { isNotNull, isNull, and, eq } from "drizzle-orm";
import { computeNextOccurrence, parseRecurrenceRule } from "@/lib/recurrence";

export const recurringTasksCron = inngest.createFunction(
  { id: "generate-recurring-tasks", triggers: [{ cron: "0 0 * * *" }] },
  async ({ step }) => {
    const parentTasks = await step.run("fetch-recurring-templates", async () => {
      return await db.query.tasks.findMany({
        where: and(
          isNotNull(tasks.recurrenceRule),
          isNull(tasks.deletedAt),
          isNull(tasks.parentRecurringTaskId)
        ),
      });
    });

    const results = await step.run("generate-occurrences", async () => {
      let createdCount = 0;

      for (const master of parentTasks) {
        if (!master.recurrenceRule) continue;
        const rule = parseRecurrenceRule(master.recurrenceRule);
        if (!rule) continue;

        const baseDate = master.dueDate ? new Date(master.dueDate) : new Date(master.createdAt);
        const nextDate = computeNextOccurrence(baseDate, rule);

        if (!nextDate) continue;

        const existingChild = await db.query.tasks.findFirst({
          where: and(
            eq(tasks.parentRecurringTaskId, master.id),
            eq(tasks.dueDate, nextDate)
          ),
        });

        if (!existingChild) {
          await db.insert(tasks).values({
            id: crypto.randomUUID(),
            projectId: master.projectId,
            title: master.title,
            descriptionMd: master.descriptionMd,
            dueDate: nextDate,
            dueTime: master.dueTime,
            priority: master.priority,
            status: "todo",
            position: master.position,
            assigneeId: master.assigneeId,
            parentRecurringTaskId: master.id,
          });
          createdCount++;
        }
      }

      return { createdCount };
    });

    return results;
  }
);
