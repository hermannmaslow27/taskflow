"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { tasks, taskTags, subtasks, activityLogs, projects } from "@/db/schema";
import { eq, and, isNull, isNotNull, ilike, desc, asc, or, inArray } from "drizzle-orm";
import { assertProjectRole } from "@/lib/rbac";
import {
  createTaskSchema,
  updateTaskSchema,
  reorderTaskSchema,
  taskFilterSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
  type ReorderTaskInput,
  type TaskFilterInput,
} from "@/lib/validations/task";
import { revalidateTag } from "next/cache";

export async function getTasksAction(filters: TaskFilterInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const whereConditions = [];

    // Filter by project
    if (filters.projectId) {
      await assertProjectRole(session.user.id, filters.projectId, "viewer");
      whereConditions.push(eq(tasks.projectId, filters.projectId));
    }

    // Soft delete filter
    if (filters.includeDeleted) {
      whereConditions.push(isNotNull(tasks.deletedAt));
    } else {
      whereConditions.push(isNull(tasks.deletedAt));
    }

    // Status filter
    if (filters.status) {
      whereConditions.push(eq(tasks.status, filters.status));
    }

    // Priority filter
    if (filters.priority) {
      whereConditions.push(eq(tasks.priority, filters.priority));
    }

    // Assignee filter
    if (filters.assigneeId) {
      whereConditions.push(eq(tasks.assigneeId, filters.assigneeId));
    }

    // Search query filter
    if (filters.search && filters.search.trim() !== "") {
      const q = `%${filters.search.trim()}%`;
      whereConditions.push(
        or(ilike(tasks.title, q), ilike(tasks.descriptionMd, q))
      );
    }

    const fetchedTasks = await db.query.tasks.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      orderBy: [asc(tasks.position), desc(tasks.createdAt)],
      with: {
        assignee: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        subtasks: {
          orderBy: [asc(subtasks.position)],
        },
        taskTags: {
          with: {
            tag: true,
          },
        },
        comments: {
          columns: {
            id: true,
          },
        },
      },
    });

    const formatted = fetchedTasks.map((t) => ({
      ...t,
      tags: t.taskTags.map((tt) => tt.tag),
      commentsCount: t.comments.length,
      subtasksCompleted: t.subtasks.filter((s) => s.isDone).length,
      subtasksTotal: t.subtasks.length,
    }));

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error("Erreur récupération tâches:", error);
    return { success: false, error: error.message || "Impossible de récupérer les tâches" };
  }
}

export async function createTaskAction(input: CreateTaskInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Données invalides" };
  }

  const data = parsed.data;

  try {
    await assertProjectRole(session.user.id, data.projectId, "editor");

    const taskId = data.id || crypto.randomUUID();

    // Determine position if not provided: place at end of current column
    let position = data.position;
    if (position === undefined) {
      const lastTask = await db.query.tasks.findFirst({
        where: and(
          eq(tasks.projectId, data.projectId),
          eq(tasks.status, data.status),
          isNull(tasks.deletedAt)
        ),
        orderBy: [desc(tasks.position)],
      });
      position = lastTask ? lastTask.position + 1000 : 1000;
    }

    await db.insert(tasks).values({
      id: taskId,
      projectId: data.projectId,
      title: data.title,
      descriptionMd: data.descriptionMd || "",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      dueTime: data.dueTime || null,
      priority: data.priority,
      status: data.status,
      position,
      assigneeId: data.assigneeId || null,
      recurrenceRule: data.recurrenceRule || null,
    });

    // Insert tags
    if (data.tagIds && data.tagIds.length > 0) {
      for (const tagId of data.tagIds) {
        await db.insert(taskTags).values({
          taskId,
          tagId,
        });
      }
    }

    // Activity log
    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      taskId,
      actorId: session.user.id,
      action: "Création de la tâche",
      diff: { title: data.title, status: data.status, priority: data.priority },
    });

    revalidateTag(`tasks-${data.projectId}`, "default");
    return { success: true, data: { id: taskId } };
  } catch (error: any) {
    console.error("Erreur création tâche:", error);
    return { success: false, error: error.message || "Erreur de création de tâche" };
  }
}

export async function updateTaskAction(input: UpdateTaskInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  const parsed = updateTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Données invalides" };
  }

  const data = parsed.data;

  try {
    const existing = await db.query.tasks.findFirst({
      where: eq(tasks.id, data.id),
    });

    if (!existing) {
      return { success: false, error: "Tâche introuvable" };
    }

    await assertProjectRole(session.user.id, existing.projectId, "editor");

    const updateValues: Partial<typeof tasks.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updateValues.title = data.title;
    if (data.descriptionMd !== undefined) updateValues.descriptionMd = data.descriptionMd;
    if (data.dueDate !== undefined) updateValues.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.dueTime !== undefined) updateValues.dueTime = data.dueTime;
    if (data.priority !== undefined) updateValues.priority = data.priority;
    if (data.status !== undefined) updateValues.status = data.status;
    if (data.position !== undefined) updateValues.position = data.position;
    if (data.assigneeId !== undefined) updateValues.assigneeId = data.assigneeId;
    if (data.recurrenceRule !== undefined) updateValues.recurrenceRule = data.recurrenceRule;

    await db.update(tasks).set(updateValues).where(eq(tasks.id, data.id));

    // Update tags if provided
    if (data.tagIds !== undefined) {
      await db.delete(taskTags).where(eq(taskTags.taskId, data.id));
      for (const tagId of data.tagIds) {
        await db.insert(taskTags).values({
          taskId: data.id,
          tagId,
        });
      }
    }

    // Activity log
    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      taskId: data.id,
      actorId: session.user.id,
      action: "Mise à jour de la tâche",
      diff: data,
    });

    revalidateTag(`tasks-${existing.projectId}`, "default");
    return { success: true };
  } catch (error: any) {
    console.error("Erreur mise à jour tâche:", error);
    return { success: false, error: error.message || "Erreur de mise à jour" };
  }
}

export async function reorderTaskAction(input: ReorderTaskInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  const parsed = reorderTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Données de réordonnancement invalides" };
  }

  const { taskId, projectId, targetStatus, newPosition } = parsed.data;

  try {
    await assertProjectRole(session.user.id, projectId, "editor");

    await db
      .update(tasks)
      .set({
        status: targetStatus,
        position: newPosition,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId));

    revalidateTag(`tasks-${projectId}`, "default");
    return { success: true };
  } catch (error: any) {
    console.error("Erreur réordonnancement:", error);
    return { success: false, error: error.message || "Impossible de réordonner" };
  }
}

export async function deleteTaskAction(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const existing = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!existing) {
      return { success: false, error: "Tâche introuvable" };
    }

    await assertProjectRole(session.user.id, existing.projectId, "editor");

    // Soft delete
    await db
      .update(tasks)
      .set({ deletedAt: new Date() })
      .where(eq(tasks.id, taskId));

    // Activity log
    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      taskId,
      actorId: session.user.id,
      action: "Déplacement vers la corbeille",
    });

    revalidateTag(`tasks-${existing.projectId}`, "default");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur de suppression" };
  }
}

export async function restoreTaskAction(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const existing = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!existing) {
      return { success: false, error: "Tâche introuvable" };
    }

    await assertProjectRole(session.user.id, existing.projectId, "editor");

    await db
      .update(tasks)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(eq(tasks.id, taskId));

    // Activity log
    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      taskId,
      actorId: session.user.id,
      action: "Restauration depuis la corbeille",
    });

    revalidateTag(`tasks-${existing.projectId}`, "default");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur de restauration" };
  }
}

export async function permanentDeleteTaskAction(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const existing = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!existing) {
      return { success: false, error: "Tâche introuvable" };
    }

    await assertProjectRole(session.user.id, existing.projectId, "owner");

    await db.delete(tasks).where(eq(tasks.id, taskId));

    revalidateTag(`tasks-${existing.projectId}`, "default");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur de suppression définitive" };
  }
}
