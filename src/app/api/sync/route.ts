import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { tasks, subtasks, comments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { syncBatchSchema } from "@/lib/validations/sync";
import { assertProjectRole } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = syncBatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Batch de synchronisation invalide", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { mutations } = parsed.data;
    const conflicts: string[] = [];
    const processedIds: string[] = [];

    // Process mutations sequentially
    for (const mut of mutations) {
      try {
        if (mut.entity === "task") {
          if (mut.action === "create") {
            const payload = mut.payload;
            await assertProjectRole(session.user.id, payload.projectId, "editor");

            await db.insert(tasks).values({
              id: payload.id || mut.id,
              projectId: payload.projectId,
              title: payload.title,
              descriptionMd: payload.descriptionMd || "",
              dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
              dueTime: payload.dueTime || null,
              priority: payload.priority || "medium",
              status: payload.status || "todo",
              position: payload.position ?? 1000,
              assigneeId: payload.assigneeId || null,
              updatedAt: new Date(mut.clientUpdatedAt),
            });
            processedIds.push(mut.id);
          } else if (mut.action === "update" || mut.action === "reorder") {
            const taskId = mut.payload.id || mut.payload.taskId;
            const existing = await db.query.tasks.findFirst({
              where: eq(tasks.id, taskId),
            });

            if (existing) {
              await assertProjectRole(session.user.id, existing.projectId, "editor");

              const serverUpdatedTime = existing.updatedAt.getTime();
              const clientUpdatedTime = new Date(mut.clientUpdatedAt).getTime();

              // Conflict check: Last-Write-Wins based on updatedAt
              if (serverUpdatedTime > clientUpdatedTime) {
                conflicts.push(
                  `Conflit résolu (LWW) : La tâche "${existing.title}" avait été modifiée sur le serveur. La version serveur la plus récente a été conservée.`
                );
              } else {
                // Client is newer
                const updatePayload: any = { updatedAt: new Date(mut.clientUpdatedAt) };
                if (mut.payload.title !== undefined) updatePayload.title = mut.payload.title;
                if (mut.payload.status !== undefined) updatePayload.status = mut.payload.status;
                if (mut.payload.position !== undefined) updatePayload.position = mut.payload.position;
                if (mut.payload.priority !== undefined) updatePayload.priority = mut.payload.priority;
                if (mut.payload.descriptionMd !== undefined) updatePayload.descriptionMd = mut.payload.descriptionMd;

                await db.update(tasks).set(updatePayload).where(eq(tasks.id, taskId));
              }
            }
            processedIds.push(mut.id);
          } else if (mut.action === "delete") {
            const taskId = mut.payload.id || mut.payload.taskId;
            const existing = await db.query.tasks.findFirst({
              where: eq(tasks.id, taskId),
            });
            if (existing) {
              await assertProjectRole(session.user.id, existing.projectId, "editor");
              await db
                .update(tasks)
                .set({ deletedAt: new Date() })
                .where(eq(tasks.id, taskId));
            }
            processedIds.push(mut.id);
          }
        }
      } catch (err: any) {
        console.error("Erreur sync mutation:", mut.id, err);
        conflicts.push(`Erreur sur l'opération ${mut.action}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      processedIds,
      conflicts,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erreur générale /api/sync:", error);
    return NextResponse.json({ error: "Erreur interne de synchronisation" }, { status: 500 });
  }
}
