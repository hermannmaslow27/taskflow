"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { attachments } from "@/db/schema";
import { eq, and, or, isNotNull } from "drizzle-orm";
import { assertProjectRole } from "@/lib/rbac";

export async function getAttachmentsAction(input: {
  taskId?: string;
  projectId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const results = await db.query.attachments.findMany({
      where: input.taskId
        ? eq(attachments.taskId, input.taskId)
        : input.projectId
          ? and(eq(attachments.projectId, input.projectId), isNotNull(attachments.projectId))
          : undefined,
      with: {
        uploadedBy: {
          columns: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: (a, { desc }) => [desc(a.createdAt)],
    });

    return { success: true, data: results };
  } catch (error) {
    console.error("getAttachmentsAction:", error);
    return { success: false, error: "Impossible de récupérer les fichiers" };
  }
}

export async function addAttachmentAction(input: {
  taskId?: string;
  projectId?: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  if (!input.taskId && !input.projectId) {
    return { success: false, error: "taskId ou projectId requis" };
  }

  // RBAC check
  if (input.projectId) {
    try {
      await assertProjectRole(session.user.id, input.projectId, "editor");
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  try {
    const id = crypto.randomUUID();
    await db.insert(attachments).values({
      id,
      taskId: input.taskId ?? null,
      projectId: input.projectId ?? null,
      url: input.url,
      fileName: input.fileName,
      mimeType: input.mimeType,
      size: input.size,
      uploadedById: session.user.id,
    });

    return { success: true, data: { id } };
  } catch (error) {
    console.error("addAttachmentAction:", error);
    return { success: false, error: "Impossible d'ajouter le fichier" };
  }
}

export async function deleteAttachmentAction(attachmentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    // Only the uploader can delete
    const att = await db.query.attachments.findFirst({
      where: eq(attachments.id, attachmentId),
    });

    if (!att) return { success: false, error: "Fichier introuvable" };
    if (att.uploadedById !== session.user.id) {
      return { success: false, error: "Vous ne pouvez supprimer que vos propres fichiers" };
    }

    await db.delete(attachments).where(eq(attachments.id, attachmentId));
    return { success: true };
  } catch (error) {
    console.error("deleteAttachmentAction:", error);
    return { success: false, error: "Impossible de supprimer le fichier" };
  }
}
