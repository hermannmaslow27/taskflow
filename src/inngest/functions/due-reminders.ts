import { inngest } from "../client";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { and, isNull, isNotNull, lte, gte } from "drizzle-orm";

export const dueRemindersCron = inngest.createFunction(
  { id: "send-due-task-reminders", triggers: [{ cron: "*/15 * * * *" }] },
  async ({ step }) => {
    const upcomingTasks = await step.run("fetch-due-tasks", async () => {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      return await db.query.tasks.findMany({
        where: and(
          isNull(tasks.deletedAt),
          isNotNull(tasks.dueDate),
          isNotNull(tasks.assigneeId),
          gte(tasks.dueDate, now),
          lte(tasks.dueDate, in24Hours)
        ),
        with: {
          assignee: true,
          project: true,
        },
      });
    });

    const sentResult = await step.run("dispatch-reminders", async () => {
      let notifiedCount = 0;

      for (const task of upcomingTasks) {
        if (!task.assignee?.email) continue;

        console.log(
          `[TaskFlow Reminder] Sending reminder to ${task.assignee.email} for task "${task.title}" (Due: ${task.dueDate})`
        );
        notifiedCount++;
      }

      return { notifiedCount };
    });

    return sentResult;
  }
);
