"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Mail,
  KeyRound,
  Lock,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  requestPasswordResetOtpAction,
  verifyResetOtpAction,
  resetPasswordWithOtpAction,
} from "@/actions/auth";

type Step = "EMAIL" | "OTP" | "NEW_PASSWORD" | "SUCCESS";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  // Countdown for resending OTP
  const [resendCooldown, setResendCooldown] = useState(0);

  // Refs for 6 digit OTP inputs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first OTP input when reaching OTP step
  useEffect(() => {
    if (step === "OTP") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Veuillez renseigner une adresse email valide.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      const res = await requestPasswordResetOtpAction(email);
      if (res.success) {
        setDevOtp(res.devOtp || null);
        setInfoMsg(res.message || "Un code à 6 chiffres a été envoyé.");
        setResendCooldown(60);
        setStep("OTP");
      } else {
        setErrorMsg(res.error || "Impossible d'envoyer le code.");
      }
    } catch (err) {
      setErrorMsg("Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle OTP input typing and paste
  const handleOtpChange = (index: number, value: string) => {
    // Handle paste of full 6 digits
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto advance
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setErrorMsg("Veuillez saisir le code complet à 6 chiffres.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await verifyResetOtpAction({ email, otp: fullOtp });
      if (res.success) {
        setErrorMsg("");
        setStep("NEW_PASSWORD");
      } else {
        setErrorMsg(res.error || "Code invalide ou expiré.");
      }
    } catch (err) {
      setErrorMsg("Erreur lors de la validation du code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await requestPasswordResetOtpAction(email);
      if (res.success) {
        setDevOtp(res.devOtp || null);
        setInfoMsg("Nouveau code envoyé avec succès.");
        setResendCooldown(60);
      } else {
        setErrorMsg(res.error || "Impossible de renvoyer le code.");
      }
    } catch (err) {
      setErrorMsg("Erreur de renvoi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMsg("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const fullOtp = otp.join("");
      const res = await resetPasswordWithOtpAction({
        email,
        otp: fullOtp,
        newPassword,
      });

      if (res.success) {
        setStep("SUCCESS");
      } else {
        setErrorMsg(res.error || "Impossible de réinitialiser le mot de passe.");
      }
    } catch (err) {
      setErrorMsg("Une erreur inattendue est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 selection:bg-primary/20">
      <div className="w-full max-w-md bg-card border border-card-border rounded-2xl shadow-2xl p-8 space-y-6 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-3">
            <KeyRound className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-card-foreground">
            Réinitialisation du mot de passe
          </h1>
          <p className="text-xs text-muted mt-1">
            {step === "EMAIL" && "Entrez votre email pour recevoir votre code de validation"}
            {step === "OTP" && `Saisissez le code à 6 chiffres envoyé à ${email}`}
            {step === "NEW_PASSWORD" && "Choisissez votre nouveau mot de passe sécurisé"}
            {step === "SUCCESS" && "Votre mot de passe a été mis à jour avec succès"}
          </p>
        </div>

        {/* Wizard Steps Indicator */}
        {step !== "SUCCESS" && (
          <div className="flex items-center justify-center gap-2 pt-1 pb-2">
            <div
              className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                step === "EMAIL" || step === "OTP" || step === "NEW_PASSWORD"
                  ? "bg-primary"
                  : "bg-muted-bg"
              }`}
            />
            <div
              className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                step === "OTP" || step === "NEW_PASSWORD"
                  ? "bg-primary"
                  : "bg-muted-bg"
              }`}
            />
            <div
              className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                step === "NEW_PASSWORD" ? "bg-primary" : "bg-muted-bg"
              }`}
            />
          </div>
        )}

        {/* Error and Info Alerts */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-primary" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Dev OTP Helper Banner */}
        {devOtp && step === "OTP" && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs space-y-1">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Code OTP de test :
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-base font-black tracking-widest text-emerald-300">
                {devOtp}
              </span>
              <button
                type="button"
                onClick={() => {
                  const digits = devOtp.split("");
                  setOtp(digits);
                }}
                className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                Remplir automatiquement
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: EMAIL */}
        {step === "EMAIL" && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
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
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === "OTP" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-muted block mb-2 text-center uppercase tracking-wider">
                Code à 6 chiffres
              </label>
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpInputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-10 sm:w-12 h-12 text-center text-lg font-black font-mono bg-muted-bg/60 border border-card-border rounded-xl text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-xs"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join("").length !== 6}
              className="w-full bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl font-semibold text-sm transition shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                "Vérification..."
              ) : (
                <>
                  <span>Valider le code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep("EMAIL")}
                className="text-muted hover:text-card-foreground flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Modifier l&apos;email</span>
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || isLoading}
                onClick={handleResendOtp}
                className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:no-underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>
                  {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : "Renvoyer le code"}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === "NEW_PASSWORD" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
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
              disabled={isLoading || !newPassword || newPassword !== confirmPassword}
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
        )}

        {/* STEP 4: SUCCESS */}
        {step === "SUCCESS" && (
          <div className="text-center space-y-4 py-2">
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
        )}

        {/* Back to login link */}
        {step !== "SUCCESS" && (
          <div className="text-center text-xs text-muted pt-2 border-t border-card-border">
            <Link
              href="/login"
              className="text-muted hover:text-card-foreground transition inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour à la connexion</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
