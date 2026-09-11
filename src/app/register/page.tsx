"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { registerAction } from "@/actions/auth";
import { signIn } from "next-auth/react";
import { CheckCircle2, Lock, Mail, User, ArrowRight } from "lucide-react";
import { SocialAuthButtons } from "@/components/social-auth-buttons";

export default function RegisterPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await registerAction(data);

      if (!res.success) {
        setErrorMsg(res.error || "Impossible de créer le compte.");
        setIsLoading(false);
        return;
      }

      // Automatically sign in the user
      const loginRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginRes?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg("Une erreur inattendue est survenue.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-card border border-card-border rounded-2xl shadow-2xl p-8 space-y-6 animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-3">
            <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-card-foreground">
            Créer un compte TaskFlow
          </h1>
          <p className="text-xs text-muted mt-1">
            Rejoignez l&apos;espace de collaboration et de gestion haute performance
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Social Logins */}
        <SocialAuthButtons callbackUrl="/dashboard" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted block mb-1.5 uppercase tracking-wider">
              Nom complet
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-muted absolute left-3.5 top-3" />
              <input
                {...register("name")}
                type="text"
                placeholder="Alex Dupont"
                className="w-full bg-muted-bg/50 border border-card-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            {errors.name && (
              <p className="text-rose-400 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1.5 uppercase tracking-wider">
              Adresse Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted absolute left-3.5 top-3" />
              <input
                {...register("email")}
                type="email"
                placeholder="alex@exemple.com"
                className="w-full bg-muted-bg/50 border border-card-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            {errors.email && (
              <p className="text-rose-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1.5 uppercase tracking-wider">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-3" />
              <input
                {...register("password")}
                type="password"
                placeholder="Au moins 6 caractères"
                className="w-full bg-muted-bg/50 border border-card-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            {errors.password && (
              <p className="text-rose-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl font-semibold text-sm transition shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              "Création du compte..."
            ) : (
              <>
                <span>Créer mon compte</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-muted pt-2 border-t border-card-border">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
