"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { KeyRound, ShieldCheck, AlertCircle, Check, ArrowLeft } from "lucide-react";
import {
  requestPasswordResetOtpAction,
  verifyResetOtpAction,
  resetPasswordWithOtpAction,
} from "@/actions/auth";
import { EmailStep } from "./email-step";
import { OtpStep } from "./otp-step";
import { NewPasswordStep } from "./new-password-step";
import { SuccessStep } from "./success-step";

type Step = "EMAIL" | "OTP" | "NEW_PASSWORD" | "SUCCESS";

export function ForgotPasswordWizard() {
  const [step, setStep] = useState<Step>("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

      {/* Progress Bar */}
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

      {/* Notifications */}
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

      {/* Dev OTP Helper */}
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
              onClick={() => setOtp(devOtp.split(""))}
              className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
            >
              Remplir automatiquement
            </button>
          </div>
        </div>
      )}

      {/* Step Components */}
      {step === "EMAIL" && (
        <EmailStep
          email={email}
          setEmail={setEmail}
          onSubmit={handleRequestOtp}
          isLoading={isLoading}
        />
      )}

      {step === "OTP" && (
        <OtpStep
          otp={otp}
          setOtp={setOtp}
          onSubmit={handleVerifyOtp}
          onBackToEmail={() => setStep("EMAIL")}
          onResendOtp={handleResendOtp}
          resendCooldown={resendCooldown}
          isLoading={isLoading}
        />
      )}

      {step === "NEW_PASSWORD" && (
        <NewPasswordStep
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          onSubmit={handleResetPassword}
          isLoading={isLoading}
        />
      )}

      {step === "SUCCESS" && <SuccessStep />}

      {/* Footer link */}
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
  );
}
