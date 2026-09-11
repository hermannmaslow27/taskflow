import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, otp: string) {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || "TaskFlow <onboarding@resend.dev>",
      to: email,
      subject: "Code de réinitialisation de mot de passe - TaskFlow",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px;">
          <h2 style="color: #18181b;">Réinitialisation de mot de passe</h2>
          <p style="color: #3f3f46;">Voici votre code de validation à 6 chiffres pour votre compte TaskFlow :</p>
          <div style="background: #f4f4f5; padding: 16px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 4px; border-radius: 8px; margin: 20px 0; color: #18181b;">
            ${otp}
          </div>
          <p style="color: #71717a; font-size: 14px;">Ce code est valable pendant 15 minutes. Si vous n'avez pas demandé cette modification, vous pouvez ignorer cet e-mail.</p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Erreur d'envoi d'e-mail Resend:", error);
    return { success: false, error };
  }
}

export async function sendProjectInvitationEmail({
  to,
  projectName,
  inviterName,
  role,
}: {
  to: string;
  projectName: string;
  inviterName: string;
  role: string;
}) {
  try {
    const roleLabel = role === "owner" ? "propriétaire" : role === "editor" ? "éditeur" : "lecteur";

    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || "TaskFlow <noreply@vondomaine.com>",
      to,
      subject: `Invitation au projet ${projectName} - TaskFlow`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px;">
          <h2 style="color: #18181b;">Invitation à un projet</h2>
          <p style="color: #3f3f46;"><strong>${inviterName}</strong> vous a invité à rejoindre le projet <strong>${projectName}</strong> en tant que <strong>${roleLabel}</strong>.</p>
          <div style="margin: 25px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="background: #6366f1; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Accéder au projet</a>
          </div>
          <p style="color: #71717a; font-size: 14px;">Si vous n'avez pas de compte ou si vous ne connaissez pas cette personne, vous pouvez ignorer cet e-mail.</p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Erreur d'envoi d'e-mail d'invitation Resend:", error);
    return { success: false, error };
  }
}