"use client";

import { useState } from "react";
import { X, UserPlus, Shield } from "lucide-react";
import { inviteMemberAction } from "@/actions/projects";
import { CustomSelect, type SelectOption } from "./custom-select";

const ROLE_OPTIONS: SelectOption[] = [
  {
    value: "viewer",
    label: "Lecteur",
    description: "Visualisation seule des tâches et du projet",
  },
  {
    value: "editor",
    label: "Éditeur",
    description: "Création, modification et déplacement de tâches",
  },
  {
    value: "owner",
    label: "Propriétaire",
    description: "Gestion complète du projet et des membres",
  },
];

interface InviteMemberModalProps {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onMemberInvited: () => void;
}

export function InviteMemberModal({
  isOpen,
  projectId,
  onClose,
  onMemberInvited,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "editor" | "viewer">("editor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await inviteMemberAction({
        projectId,
        email: email.trim(),
        role,
      });

      if (res.success) {
        setSuccessMsg("Membre invité avec succès !");
        setEmail("");
        onMemberInvited();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(res.error || "Impossible d'inviter ce membre.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-card-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-card-border">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base text-card-foreground">
              Inviter un collaborateur
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:bg-muted-bg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg">
              {successMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted block mb-1.5 uppercase tracking-wider">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collaborateur@taskflow.dev"
              className="w-full bg-muted-bg/50 border border-card-border rounded-xl px-3.5 py-2.5 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
              required
            />
          </div>

          <div>
            <CustomSelect
              label="Rôle RBAC"
              value={role}
              onChange={(val) => setRole(val as any)}
              options={ROLE_OPTIONS}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-card-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-muted hover:text-card-foreground cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="px-5 py-2 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Envoi..." : "Envoyer l'invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
