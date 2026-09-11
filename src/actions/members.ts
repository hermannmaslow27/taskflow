"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { projectMembers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { assertProjectRole } from "@/lib/rbac";
import { revalidateTag } from "next/cache";
import { z } from "zod";

const updateRoleSchema = z.object({
  projectId: z.string().min(1),
  memberUserId: z.string().min(1),
  newRole: z.enum(["owner", "editor", "viewer"]),
});

const removeMemberSchema = z.object({
  projectId: z.string().min(1),
  memberUserId: z.string().min(1),
});

export async function getProjectMembersAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Non autorisé" };
  }

  try {
    await assertProjectRole(session.user.id, projectId, "viewer");

    const members = await db.query.projectMembers.findMany({
      where: eq(projectMembers.projectId, projectId),
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
    });

    const formatted = members.map((m) => ({
      userId: m.userId,
      role: m.role,
      invitedAt: m.invitedAt,
      acceptedAt: m.acceptedAt,
      user: m.user,
    }));

    return { success: true as const, data: formatted };
  } catch (error: any) {
    return { success: false as const, error: error.message || "Impossible de récupérer les membres" };
  }
}

export async function updateProjectMemberRoleAction(input: {
  projectId: string;
  memberUserId: string;
  newRole: "owner" | "editor" | "viewer";
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Non autorisé" };
  }

  const parsed = updateRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Données invalides" };
  }

  const { projectId, memberUserId, newRole } = parsed.data;

  try {
    await assertProjectRole(session.user.id, projectId, "owner");

    // Cannot downgrade self if you're the only owner
    if (memberUserId === session.user.id && newRole !== "owner") {
      // Check if there's another owner
      const otherOwners = await db.query.projectMembers.findMany({
        where: and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.role, "owner")
        ),
      });
      if (otherOwners.length <= 1) {
        return {
          success: false as const,
          error: "Vous êtes le seul propriétaire. Désignez un autre propriétaire d'abord.",
        };
      }
    }

    await db
      .update(projectMembers)
      .set({ role: newRole })
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, memberUserId)
        )
      );

    revalidateTag(`project-${projectId}`, "default");
    return { success: true as const };
  } catch (error: any) {
    return { success: false as const, error: error.message || "Impossible de modifier le rôle" };
  }
}

export async function removeProjectMemberAction(input: {
  projectId: string;
  memberUserId: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false as const, error: "Non autorisé" };
  }

  const parsed = removeMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Données invalides" };
  }

  const { projectId, memberUserId } = parsed.data;

  try {
    // Must be owner OR removing yourself (leave project)
    if (memberUserId !== session.user.id) {
      await assertProjectRole(session.user.id, projectId, "owner");
    } else {
      await assertProjectRole(session.user.id, projectId, "viewer");
    }

    // Cannot remove if you're the last owner
    const member = await db.query.projectMembers.findFirst({
      where: and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, memberUserId)
      ),
    });

    if (member?.role === "owner") {
      const owners = await db.query.projectMembers.findMany({
        where: and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.role, "owner")
        ),
      });
      if (owners.length <= 1) {
        return {
          success: false as const,
          error: "Impossible de retirer le seul propriétaire du projet.",
        };
      }
    }

    await db
      .delete(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, memberUserId)
        )
      );

    revalidateTag(`project-${projectId}`, "default");
    return { success: true as const };
  } catch (error: any) {
    return { success: false as const, error: error.message || "Impossible de retirer ce membre" };
  }
}
