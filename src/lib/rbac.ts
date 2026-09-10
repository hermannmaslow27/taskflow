import { db } from "@/db";
import { projectMembers, projects } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export type ProjectRole = "owner" | "editor" | "viewer";

export const ROLE_HIERARCHY: Record<ProjectRole, number> = {
  owner: 3,
  editor: 2,
  viewer: 1,
};

export function hasPermission(userRole: ProjectRole, requiredRole: ProjectRole): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 99);
}

export async function assertProjectRole(
  userId: string,
  projectId: string,
  minRole: ProjectRole = "viewer"
): Promise<{ role: ProjectRole; projectId: string; userId: string }> {
  if (!userId) {
    throw new Error("Non authentifié : utilisateur requis.");
  }

  // Check if user is the project owner directly
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    throw new Error("Projet introuvable.");
  }

  if (project.ownerId === userId) {
    return { role: "owner", projectId, userId };
  }

  // Check membership table
  const member = await db.query.projectMembers.findFirst({
    where: and(
      eq(projectMembers.projectId, projectId),
      eq(projectMembers.userId, userId)
    ),
  });

  if (!member) {
    throw new Error("Accès refusé : vous ne faites pas partie de ce projet.");
  }

  const role = member.role as ProjectRole;

  if (!hasPermission(role, minRole)) {
    throw new Error(
      `Permission insuffisante : rôle '${minRole}' requis, vous avez '${role}'.`
    );
  }

  return { role, projectId, userId };
}
