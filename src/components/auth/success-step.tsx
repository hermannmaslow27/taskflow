"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export function SuccessStep() {
  return (
    <div className="text-center space-y-4 py-2 animate-fade-in">
      <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
        <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-card-foreground">
          Mot de passe mis à jour !
        </h3>
        <p className="text-xs text-muted mt-1 leading-relaxed">
          Votre nouveau mot de passe a été enregistré. Vous pouvez dès maintenant vous connecter à votre compte.
        </p>
      </div>

      <Link
        href="/login"
        className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl font-semibold text-sm transition shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer inline-flex"
      >
        <span>Aller à la page de connexion</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
