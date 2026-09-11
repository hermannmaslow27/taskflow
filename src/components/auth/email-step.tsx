"use client";

import { Mail, ArrowRight } from "lucide-react";

interface EmailStepProps {
  email: string;
  setEmail: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function EmailStep({ email, setEmail, onSubmit, isLoading }: EmailStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted block mb-1.5 uppercase tracking-wider">
          Adresse Email
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-muted absolute left-3.5 top-3" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nom@exemple.com"
            className="w-full bg-muted-bg/50 border border-card-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            autoFocus
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !email.trim()}
        className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl font-semibold text-sm transition shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {isLoading ? (
          "Envoi en cours..."
        ) : (
          <>
            <span>Recevoir le code de validation</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
