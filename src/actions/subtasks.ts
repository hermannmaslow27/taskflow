"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { subtasks, tasks, activityLogs } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { assertProjectRole } from "@/lib/rbac";
import {
  createSubtaskSchema,
  toggleSubtaskSchema,
  reorderSubtaskSchema,
  type CreateSubtaskInput,
  type ToggleSubtaskInput,
} from "@/lib/validations/subtask";
import { revalidateTag } from "next/cache";

export async function createSubtaskAction(input: CreateSubtaskInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  const parsed = createSubtaskSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Données invalides" };
  }

  const { taskId, title } = parsed.data;

  try {
    const parentTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!parentTask) {
      return { success: false, error: "Tâche introuvable" };
    }

    await assertProjectRole(session.user.id, parentTask.projectId, "editor");

    const lastSubtask = await db.query.subtasks.findFirst({
      where: eq(subtasks.taskId, taskId),
      orderBy: [desc(subtasks.position)],
    });

    const position = lastSubtask ? lastSubtask.position + 1000 : 1000;
    const subtaskId = parsed.data.id || crypto.randomUUID();

    await db.insert(subtasks).values({
      id: subtaskId,
      taskId,
      title,
      isDone: false,
      position,
    });

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      taskId,
      actorId: session.user.id,
      action: `Ajout sous-tâche: "${title}"`,
    });

    revalidateTag(`tasks-${parentTask.projectId}`, "default");
    return { success: true, data: { id: subtaskId } };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur de création de sous-tâche" };
  }
}

export async function toggleSubtaskAction(input: ToggleSubtaskInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  const parsed = toggleSubtaskSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Données invalides" };
  }

  const { id, taskId, isDone } = parsed.data;

  try {
    const parentTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!parentTask) {
      return { success: false, error: "Tâche introuvable" };
    }

    await assertProjectRole(session.user.id, parentTask.projectId, "editor");

    await db
      .update(subtasks)
      .set({ isDone })
      .where(eq(subtasks.id, id));

    revalidateTag(`tasks-${parentTask.projectId}`, "default");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur de mise à jour" };
  }
}

export async function deleteSubtaskAction(id: string, taskId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const parentTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!parentTask) {
      return { success: false, error: "Tâche introuvable" };
    }

    await assertProjectRole(session.user.id, parentTask.projectId, "editor");

    await db.delete(subtasks).where(eq(subtasks.id, id));

    revalidateTag(`tasks-${parentTask.projectId}`, "default");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur de suppression" };
  }
}
