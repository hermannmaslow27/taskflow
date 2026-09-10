"use server";

import { db } from "@/db";
import { users, projects, projectMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/password";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { signIn, signOut, auth } from "@/auth";

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

export async function updateProfileAction(input: {
  name: string;
  image?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non authentifié." };
  }

  const name = input.name.trim();
  if (!name || name.length < 2) {
    return { success: false, error: "Le nom doit contenir au moins 2 caractères." };
  }
  if (name.length > 60) {
    return { success: false, error: "Le nom ne peut pas dépasser 60 caractères." };
  }

  try {
    const updateData: { name: string; image?: string | null } = { name };
    if (input.image !== undefined) {
      updateData.image = input.image && input.image.trim() !== "" ? input.image.trim() : null;
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id));

    return { success: true };
  } catch (error) {
    console.error("Erreur updateProfileAction:", error);
    return { success: false, error: "Impossible de mettre à jour le profil." };
  }
}

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Non authentifié." };
  }

  if (input.newPassword.length < 8) {
    return { success: false, error: "Le nouveau mot de passe doit contenir au moins 8 caractères." };
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: "Aucun mot de passe défini sur ce compte (connexion OAuth)." };
    }

    const isValid = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Mot de passe actuel incorrect." };
    }

    const newHash = await hashPassword(input.newPassword);
    await db
      .update(users)
      .set({ passwordHash: newHash })
      .where(eq(users.id, session.user.id));

    return { success: true };
  } catch (error) {
    console.error("Erreur changePasswordAction:", error);
    return { success: false, error: "Impossible de changer le mot de passe." };
  }
}
