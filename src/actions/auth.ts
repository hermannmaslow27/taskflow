"use server";

import { db } from "@/db";
import { users, projects, projectMembers, passwordResetTokens } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/password";
import { sendPasswordResetEmail } from "@/lib/email";
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

/**
 * 1. Demande d'envoi d'un code OTP à 6 chiffres pour réinitialiser le mot de passe
 */
export async function requestPasswordResetOtpAction(email: string) {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { success: false, error: "Veuillez renseigner une adresse email valide." };
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    if (!user) {
      return {
        success: false,
        error: "Aucun compte n'est associé à cette adresse e-mail.",
      };
    }

    // Génération d'un code numérique sécurisé à 6 chiffres
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Supprimer les anciens jetons de cet email
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.email, normalizedEmail));

    // Insérer le nouveau jeton
    await db.insert(passwordResetTokens).values({
      id: crypto.randomUUID(),
      email: normalizedEmail,
      otp,
      expiresAt,
    });

    const emailResult = await sendPasswordResetEmail(normalizedEmail, otp);
    if (!emailResult.success) {
      return {
        success: false,
        error: "Erreur lors de l'envoi de l'e-mail. Veuillez réessayer.",
      };
    }

    return {
      success: true,
      message: "Un code de validation à 6 chiffres a été envoyé.",
    };

    return {
      success: true,
      message: "Un code de validation à 6 chiffres a été envoyé.",
      devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
    };
  } catch (error) {
    console.error("Erreur requestPasswordResetOtpAction:", error);
    return {
      success: false,
      error: "Impossible d'envoyer le code de réinitialisation. Veuillez réessayer.",
    };
  }
}

/**
 * 2. Vérification de la validité du code OTP
 */
export async function verifyResetOtpAction(input: {
  email: string;
  otp: string;
}) {
  const normalizedEmail = input.email?.trim().toLowerCase();
  const cleanedOtp = input.otp?.trim();

  if (!normalizedEmail || !cleanedOtp || cleanedOtp.length !== 6) {
    return { success: false, error: "Le code doit comporter 6 chiffres." };
  }

  try {
    const tokenRecord = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.email, normalizedEmail),
        eq(passwordResetTokens.otp, cleanedOtp),
        gt(passwordResetTokens.expiresAt, new Date())
      ),
    });

    if (!tokenRecord) {
      return {
        success: false,
        error: "Code de validation invalide ou expiré.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Erreur verifyResetOtpAction:", error);
    return { success: false, error: "Erreur lors de la vérification du code." };
  }
}

/**
 * 3. Réinitialisation effective du mot de passe avec l'OTP vérifié
 */
export async function resetPasswordWithOtpAction(input: {
  email: string;
  otp: string;
  newPassword: string;
}) {
  const normalizedEmail = input.email?.trim().toLowerCase();
  const cleanedOtp = input.otp?.trim();

  if (!normalizedEmail || !cleanedOtp) {
    return { success: false, error: "Données de validation manquantes." };
  }

  if (!input.newPassword || input.newPassword.length < 8) {
    return {
      success: false,
      error: "Le nouveau mot de passe doit contenir au moins 8 caractères.",
    };
  }

  try {
    const tokenRecord = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.email, normalizedEmail),
        eq(passwordResetTokens.otp, cleanedOtp),
        gt(passwordResetTokens.expiresAt, new Date())
      ),
    });

    if (!tokenRecord) {
      return {
        success: false,
        error: "Le code de validation est invalide ou a expiré. Veuillez refaire une demande.",
      };
    }

    // Hasher le nouveau mot de passe
    const newPasswordHash = await hashPassword(input.newPassword);

    // Mettre à jour l'utilisateur
    await db
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.email, normalizedEmail));

    // Supprimer le token utilisé
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.email, normalizedEmail));

    return {
      success: true,
      message: "Votre mot de passe a été mis à jour avec succès !",
    };
  } catch (error) {
    console.error("Erreur resetPasswordWithOtpAction:", error);
    return {
      success: false,
      error: "Impossible de réinitialiser le mot de passe. Veuillez réessayer.",
    };
  }
}

