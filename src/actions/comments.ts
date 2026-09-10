"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { comments, tasks, activityLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { assertProjectRole } from "@/lib/rbac";
import { createCommentSchema, type CreateCommentInput } from "@/lib/validations/comment";
import { revalidateTag } from "next/cache";

export async function getCommentsAction(taskId: string) {
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

    await assertProjectRole(session.user.id, parentTask.projectId, "viewer");

    const taskComments = await db.query.comments.findMany({
      where: eq(comments.taskId, taskId),
      orderBy: [desc(comments.createdAt)],
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return { success: true, data: taskComments };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur récupération commentaires" };
  }
}

export async function createCommentAction(input: CreateCommentInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  const parsed = createCommentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Commentaire invalide" };
  }

  const { taskId, bodyMd } = parsed.data;

  try {
    const parentTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!parentTask) {
      return { success: false, error: "Tâche introuvable" };
    }

    await assertProjectRole(session.user.id, parentTask.projectId, "editor");

    const commentId = parsed.data.id || crypto.randomUUID();

    await db.insert(comments).values({
      id: commentId,
      taskId,
      authorId: session.user.id,
      bodyMd,
    });

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      taskId,
      actorId: session.user.id,
      action: "Nouveau commentaire ajouté",
    });

    revalidateTag(`tasks-${parentTask.projectId}`, "default");
    return { success: true, data: { id: commentId } };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur création commentaire" };
  }
}
