"use client";

import { useRef, useEffect } from "react";
import { ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";

interface OtpStepProps {
  otp: string[];
  setOtp: (val: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBackToEmail: () => void;
  onResendOtp: () => void;
  resendCooldown: number;
  isLoading: boolean;
}

export function OtpStep({
  otp,
  setOtp,
  onSubmit,
  onBackToEmail,
  onResendOtp,
  resendCooldown,
  isLoading,
}: OtpStepProps) {
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    otpInputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    // Handle paste of multiple digits
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

    // Advance to next input
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const fullOtp = otp.join("");

  return (
    <form onSubmit={onSubmit} className="space-y-5">
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
        disabled={isLoading || fullOtp.length !== 6}
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
          onClick={onBackToEmail}
          className="text-muted hover:text-card-foreground flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Modifier l&apos;email</span>
        </button>

        <button
          type="button"
          disabled={resendCooldown > 0 || isLoading}
          onClick={onResendOtp}
          className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:no-underline"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>
            {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : "Renvoyer le code"}
          </span>
        </button>
      </div>
    </form>
  );
}
