"use server";

import { db } from "@/db";
import { users, projects, projectMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/password";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { signIn, signOut } from "@/auth";

export async function registerAction(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Données invalides" };
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existing) {
      return { success: false, error: "Cet email est déjà utilisé." };
    }

    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      name,
      email: email.toLowerCase(),
      passwordHash,
    });

    // Create a default project for the new user
    const defaultProjectId = crypto.randomUUID();
    await db.insert(projects).values({
      id: defaultProjectId,
      name: "Mon premier projet",
      color: "#6366F1",
      ownerId: userId,
    });

    await db.insert(projectMembers).values({
      projectId: defaultProjectId,
      userId,
      role: "owner",
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    return { success: false, error: "Impossible de créer le compte. Veuillez réessayer." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
