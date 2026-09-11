"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { projects, projectMembers, users, tasks, tags } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { assertProjectRole } from "@/lib/rbac";
import {
  createProjectSchema,
  updateProjectSchema,
  inviteMemberSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
  type InviteMemberInput,
} from "@/lib/validations/project";
import { revalidateTag } from "next/cache";
import { sendProjectInvitationEmail } from "@/lib/email";

export async function getProjectsAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  const userId = session.user.id;

  try {
    // Get projects owned or member of
    const memberships = await db.query.projectMembers.findMany({
      where: eq(projectMembers.userId, userId),
      with: {
        project: {
          with: {
            members: {
              with: {
                user: {
                  columns: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
            tags: true,
          },
        },
      },
    });

    const userProjects = memberships
      .map((m) => ({
        ...m.project,
        currentUserRole: m.role,
      }))
      .filter((p) => !p.isArchived);

    return { success: true, data: userProjects };
  } catch (error) {
    console.error("Erreur récupération projets:", error);
    return { success: false, error: "Impossible de récupérer les projets" };
  }
}

export async function createProjectAction(input: CreateProjectInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Données invalides" };
  }

  const userId = session.user.id;
  const projectId = crypto.randomUUID();

  try {
    await db.insert(projects).values({
      id: projectId,
      name: parsed.data.name,
      color: parsed.data.color,
      ownerId: userId,
    });

    await db.insert(projectMembers).values({
      projectId,
      userId,
      role: "owner",
    });

    // Create a few default tags for the project
    const defaultTags = [
      { name: "Frontend", color: "#3B82F6" },
      { name: "Backend", color: "#10B981" },
      { name: "Design", color: "#EC4899" },
      { name: "Bug", color: "#EF4444" },
    ];

    for (const tag of defaultTags) {
      await db.insert(tags).values({
        id: crypto.randomUUID(),
        projectId,
        name: tag.name,
        color: tag.color,
      });
    }

    revalidateTag(`projects-${userId}`, "default");
    return { success: true, data: { id: projectId } };
  } catch (error) {
    console.error("Erreur création projet:", error);
    return { success: false, error: "Impossible de créer le projet" };
  }
}

export async function updateProjectAction(input: UpdateProjectInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  const parsed = updateProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Données invalides" };
  }

  try {
    await assertProjectRole(session.user.id, parsed.data.id, "editor");

    const updateData: Partial<typeof projects.$inferInsert> = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.color !== undefined) updateData.color = parsed.data.color;
    if (parsed.data.isArchived !== undefined) updateData.isArchived = parsed.data.isArchived;

    await db.update(projects).set(updateData).where(eq(projects.id, parsed.data.id));

    revalidateTag(`project-${parsed.data.id}`, "default");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur de mise à jour" };
  }
}

export async function deleteProjectAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await assertProjectRole(session.user.id, projectId, "owner");
    await db.delete(projects).where(eq(projects.id, projectId));
    revalidateTag(`projects-${session.user.id}`, "default");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Impossible de supprimer le projet" };
  }
}

export async function inviteMemberAction(input: InviteMemberInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non autorisé" };
  }

  const parsed = inviteMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Données invalides" };
  }

  try {
    const roleCheck = await assertProjectRole(session.user.id, parsed.data.projectId, "owner");

    // Récupérer le nom du projet et de l'utilisateur qui invite pour le mail
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, parsed.data.projectId),
    });

    const invitedUser = await db.query.users.findFirst({
      where: eq(users.email, parsed.data.email.toLowerCase()),
    });

    if (!invitedUser) {
      return { success: false, error: "Aucun utilisateur trouvé avec cette adresse email." };
    }

    const existing = await db.query.projectMembers.findFirst({
      where: and(
        eq(projectMembers.projectId, parsed.data.projectId),
        eq(projectMembers.userId, invitedUser.id)
      ),
    });

    if (existing) {
      return { success: false, error: "Cet utilisateur est déjà membre du projet." };
    }

    await db.insert(projectMembers).values({
      projectId: parsed.data.projectId,
      userId: invitedUser.id,
      role: parsed.data.role,
    });

    // Envoyer l'e-mail d'invitation
    if (project) {
      await sendProjectInvitationEmail({
        to: invitedUser.email,
        projectName: project.name,
        inviterName: session.user.name || "Un utilisateur",
        role: parsed.data.role,
      });
    }

    revalidateTag(`project-${parsed.data.projectId}`, "default");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erreur lors de l'invitation" };
  }
}
