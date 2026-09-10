import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { recurringTasksCron } from "@/inngest/functions/recurring-tasks";
import { dueRemindersCron } from "@/inngest/functions/due-reminders";
import { trashPurgeCron } from "@/inngest/functions/trash-purge";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [recurringTasksCron, dueRemindersCron, trashPurgeCron],
});
