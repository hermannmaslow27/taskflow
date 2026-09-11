"use client";

import { Lock, Check } from "lucide-react";

interface NewPasswordStepProps {
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function NewPasswordStep({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onSubmit,
  isLoading,
}: NewPasswordStepProps) {
  const isMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const isLengthOk = newPassword.length >= 8;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted block mb-1.5 uppercase tracking-wider">
          Nouveau mot de passe
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-muted absolute left-3.5 top-3" />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Au moins 8 caractères"
            className="w-full bg-muted-bg/50 border border-card-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            autoFocus
            required
          />
        </div>
        <p className="text-[11px] text-muted mt-1">Minimum 8 caractères</p>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted block mb-1.5 uppercase tracking-wider">
          Confirmer le mot de passe
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-muted absolute left-3.5 top-3" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Répétez le mot de passe"
            className="w-full bg-muted-bg/50 border border-card-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !isLengthOk || !isMatch}
        className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl font-semibold text-sm transition shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {isLoading ? (
          "Enregistrement..."
        ) : (
          <>
            <span>Changer mon mot de passe</span>
            <Check className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
