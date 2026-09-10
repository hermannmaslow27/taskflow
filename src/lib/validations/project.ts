import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Le nom du projet est obligatoire").max(100),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Couleur hexadécimale invalide")
    .default("#6366F1"),
});

export const updateProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Le nom du projet est obligatoire").max(100).optional(),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Couleur hexadécimale invalide")
    .optional(),
  isArchived: z.boolean().optional(),
});

export const inviteMemberSchema = z.object({
  projectId: z.string().min(1),
  email: z.string().email("Adresse email invalide"),
  role: z.enum(["owner", "editor", "viewer"]).default("editor"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
