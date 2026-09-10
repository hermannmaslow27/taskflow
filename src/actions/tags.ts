"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { tags } from "@/db/schema";
import { eq } from "drizzle-orm";
import { assertProjectRole } from "@/lib/rbac";
import { revalidateTag } from "next/cache";

export async function getTagsAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await assertProjectRole(session.user.id, projectId, "viewer");
    const projectTags = await db.query.tags.findMany({
      where: eq(tags.projectId, projectId),
    });
    return { success: true, data: projectTags };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur récupération tags" };
  }
}

export async function createTagAction(projectId: string, name: string, color: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await assertProjectRole(session.user.id, projectId, "editor");
    const id = crypto.randomUUID();
    await db.insert(tags).values({
      id,
      projectId,
      name,
      color,
    });
    revalidateTag(`tags-${projectId}`, "default");
    return { success: true, data: { id, name, color } };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur création tag" };
  }
}
