"use client";

import { useState, useRef, useTransition } from "react";
import {
  X,
  User,
  Lock,
  Camera,
  Check,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  Upload,
} from "lucide-react";
import { updateProfileAction, changePasswordAction } from "@/actions/auth";

type Tab = "profile" | "security";

const AVATAR_COLORS = [
  { bg: "from-indigo-500 to-purple-600", label: "Indigo" },
  { bg: "from-violet-500 to-pink-500", label: "Violet" },
  { bg: "from-sky-500 to-indigo-500", label: "Sky" },
  { bg: "from-emerald-500 to-teal-500", label: "Emerald" },
  { bg: "from-orange-500 to-rose-500", label: "Sunset" },
  { bg: "from-rose-500 to-pink-500", label: "Rose" },
  { bg: "from-amber-500 to-orange-500", label: "Amber" },
  { bg: "from-cyan-500 to-sky-500", label: "Cyan" },
];

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onUserUpdated: (updated: { name: string; image?: string | null }) => void;
}

export function ProfileModal({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  /* ── Profile state ── */
  const [name, setName] = useState(user.name || "");
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]!.bg);
  const [customImageUrl, setCustomImageUrl] = useState(user.image || "");
  const [useCustomImage, setUseCustomImage] = useState(!!user.image);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileMsg, setProfileMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [isProfilePending, startProfileTransition] = useTransition();

  /* ── Security state ── */
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [securityMsg, setSecurityMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [isSecurityPending, startSecurityTransition] = useTransition();

  if (!isOpen) return null;

  /* ── Helpers ── */
  const initials = (name || user.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleProfileSave = () => {
    setProfileMsg(null);
    startProfileTransition(async () => {
      const res = await updateProfileAction({
        name,
        image: useCustomImage && customImageUrl ? customImageUrl : null,
      });
      if (res.success) {
        setProfileMsg({ type: "ok", text: "Profil mis à jour avec succès !" });
        onUserUpdated({
          name,
          image: useCustomImage && customImageUrl ? customImageUrl : null,
        });
      } else {
        setProfileMsg({ type: "err", text: res.error || "Erreur inconnue." });
      }
    });
  };

  const handleAvatarUpload = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "taskflow/avatars");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Upload échoué");
      }
      const { url } = await res.json();
      setCustomImageUrl(url);
      setUseCustomImage(true);
    } catch (err: any) {
      setUploadError(err.message || "Erreur d'upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordChange = () => {
    setSecurityMsg(null);
    if (newPwd !== confirmPwd) {
      setSecurityMsg({
        type: "err",
        text: "Les mots de passe ne correspondent pas.",
      });
      return;
    }
    startSecurityTransition(async () => {
      const res = await changePasswordAction({
        currentPassword: currentPwd,
        newPassword: newPwd,
      });
      if (res.success) {
        setSecurityMsg({ type: "ok", text: "Mot de passe changé avec succès !" });
        setCurrentPwd("");
        setNewPwd("");
        setConfirmPwd("");
      } else {
        setSecurityMsg({ type: "err", text: res.error || "Erreur inconnue." });
      }
    });
  };

  /* ── Password strength ── */
  const pwdStrength = (() => {
    if (!newPwd) return 0;
    let score = 0;
    if (newPwd.length >= 8) score++;
    if (newPwd.length >= 12) score++;
    if (/[A-Z]/.test(newPwd)) score++;
    if (/[0-9]/.test(newPwd)) score++;
    if (/[^A-Za-z0-9]/.test(newPwd)) score++;
    return score;
  })();

  const pwdLabel =
    pwdStrength <= 1
      ? { text: "Très faible", colorBar: "bg-rose-500", colorText: "text-rose-400" }
      : pwdStrength === 2
        ? { text: "Faible", colorBar: "bg-orange-500", colorText: "text-orange-400" }
        : pwdStrength === 3
          ? { text: "Moyen", colorBar: "bg-amber-500", colorText: "text-amber-400" }
          : pwdStrength === 4
            ? { text: "Fort", colorBar: "bg-emerald-500", colorText: "text-emerald-400" }
            : { text: "Très fort", colorBar: "bg-teal-500", colorText: "text-teal-400" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Modifier le profil"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg rounded-2xl border border-card-border overflow-hidden animate-fade-in"
        style={{
          background:
            "linear-gradient(135deg, var(--card) 0%, color-mix(in srgb, var(--card) 95%, var(--primary)) 100%)",
          boxShadow:
            "0 25px 60px -10px rgba(0,0,0,0.5), 0 0 0 1px var(--card-border), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Top accent gradient bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-card-foreground leading-none">
                Mon profil
              </h2>
              <p className="text-[11px] text-muted mt-0.5">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-card-foreground hover:bg-muted-bg transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pb-0 flex gap-1 border-b border-card-border">
          {(
            [
              { id: "profile" as Tab, label: "Profil", Icon: User },
              { id: "security" as Tab, label: "Sécurité", Icon: Shield },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-t-lg transition cursor-pointer border-b-2 -mb-px ${
                activeTab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-card-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ══ PROFILE TAB ══ */}
        {activeTab === "profile" && (
          <div className="p-6 space-y-5">
            {/* Avatar preview + color picker */}
            <div className="flex items-center gap-5">
              <div className="relative group shrink-0">
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg ring-2 ring-white/10 transition-transform group-hover:scale-105 ${
                    useCustomImage && customImageUrl ? "" : `bg-gradient-to-br ${avatarColor}`
                  }`}
                  style={
                    useCustomImage && customImageUrl
                      ? {
                          backgroundImage: `url(${customImageUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : {}
                  }
                >
                  {!(useCustomImage && customImageUrl) && initials}
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 text-white pointer-events-none">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex-1 space-y-2.5">
                <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                  Couleur de l&apos;avatar
                </p>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c.bg}
                      title={c.label}
                      onClick={() => {
                        setAvatarColor(c.bg);
                        setUseCustomImage(false);
                      }}
                      className={`w-7 h-7 rounded-lg bg-gradient-to-br ${c.bg} transition-all cursor-pointer ${
                        avatarColor === c.bg && !useCustomImage
                          ? "ring-2 ring-white ring-offset-2 ring-offset-card scale-110"
                          : "opacity-60 hover:opacity-100 hover:scale-105"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Upload avatar button */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                Photo de profil
              </label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleAvatarUpload(f);
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-card-border bg-muted-bg hover:bg-muted-bg/80 text-xs font-semibold text-card-foreground transition cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <Upload className="w-4 h-4 text-primary" />
                  )}
                  {isUploading ? "Upload en cours..." : "Choisir une image"}
                </button>
                {useCustomImage && customImageUrl && (
                  <button
                    onClick={() => { setCustomImageUrl(""); setUseCustomImage(false); }}
                    className="p-2 rounded-xl border border-card-border text-muted hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {uploadError && (
                <p className="text-[10px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {uploadError}
                </p>
              )}
            </div>

            {/* Display Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-display-name"
                className="text-[10px] font-semibold text-muted uppercase tracking-wider"
              >
                Nom affiché
              </label>
              <input
                id="profile-display-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom complet"
                maxLength={60}
                className="w-full bg-muted-bg border border-card-border rounded-xl px-3.5 py-2.5 text-sm text-card-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition"
              />
              <p className="text-[10px] text-muted text-right">{name.length}/60</p>
            </div>

            {/* Email read-only */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                Adresse e-mail
              </label>
              <div className="flex items-center gap-2 bg-muted-bg/50 border border-card-border rounded-xl px-3.5 py-2.5">
                <span className="text-sm text-muted flex-1 truncate">{user.email}</span>
                <span className="shrink-0 text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                  Vérifié
                </span>
              </div>
            </div>

            {/* Feedback banner */}
            {profileMsg && (
              <div
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium border ${
                  profileMsg.type === "ok"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}
              >
                {profileMsg.type === "ok" ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                {profileMsg.text}
              </div>
            )}

            {/* Save button */}
            <button
              id="profile-save-btn"
              onClick={handleProfileSave}
              disabled={isProfilePending || !name.trim()}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition cursor-pointer"
            >
              {isProfilePending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {isProfilePending ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        )}

        {/* ══ SECURITY TAB ══ */}
        {activeTab === "security" && (
          <div className="p-6 space-y-5">
            {/* Info banner */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
              <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-xs text-muted leading-relaxed">
                Utilisez au moins <strong className="text-card-foreground">8 caractères</strong>{" "}
                avec des majuscules, chiffres et symboles pour un mot de passe sécurisé.
              </p>
            </div>

            {/* Current password */}
            <div className="space-y-1.5">
              <label
                htmlFor="current-password"
                className="text-[10px] font-semibold text-muted uppercase tracking-wider"
              >
                Mot de passe actuel
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrentPwd ? "text" : "password"}
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-muted-bg border border-card-border rounded-xl px-3.5 py-2.5 pr-11 text-sm text-card-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-card-foreground transition cursor-pointer"
                  aria-label={showCurrentPwd ? "Masquer" : "Afficher"}
                >
                  {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="space-y-1.5">
              <label
                htmlFor="new-password"
                className="text-[10px] font-semibold text-muted uppercase tracking-wider"
              >
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPwd ? "text" : "password"}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-muted-bg border border-card-border rounded-xl px-3.5 py-2.5 pr-11 text-sm text-card-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-card-foreground transition cursor-pointer"
                  aria-label={showNewPwd ? "Masquer" : "Afficher"}
                >
                  {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength meter */}
              {newPwd && (
                <div className="space-y-1 pt-0.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= pwdStrength ? pwdLabel.colorBar : "bg-muted-bg border border-card-border"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted">
                    Force :{" "}
                    <span className={`font-semibold ${pwdLabel.colorText}`}>
                      {pwdLabel.text}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirm-password"
                className="text-[10px] font-semibold text-muted uppercase tracking-wider"
              >
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPwd ? "text" : "password"}
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-muted-bg border rounded-xl px-3.5 py-2.5 pr-11 text-sm text-card-foreground placeholder-muted focus:outline-none focus:ring-2 transition ${
                    confirmPwd && confirmPwd !== newPwd
                      ? "border-rose-500/50 focus:ring-rose-500/30"
                      : confirmPwd && confirmPwd === newPwd
                        ? "border-emerald-500/50 focus:ring-emerald-500/30"
                        : "border-card-border focus:ring-primary/40 focus:border-primary/50"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-card-foreground transition cursor-pointer"
                  aria-label={showConfirmPwd ? "Masquer" : "Afficher"}
                >
                  {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {confirmPwd && confirmPwd === newPwd && (
                  <Check className="absolute right-10 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400 pointer-events-none" />
                )}
              </div>
              {confirmPwd && confirmPwd !== newPwd && (
                <p className="text-[10px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Les mots de passe ne correspondent pas.
                </p>
              )}
            </div>

            {/* Feedback banner */}
            {securityMsg && (
              <div
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium border ${
                  securityMsg.type === "ok"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}
              >
                {securityMsg.type === "ok" ? (
                  <Check className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                {securityMsg.text}
              </div>
            )}

            {/* Submit */}
            <button
              id="change-password-btn"
              onClick={handlePasswordChange}
              disabled={
                isSecurityPending ||
                !currentPwd ||
                !newPwd ||
                !confirmPwd ||
                newPwd !== confirmPwd
              }
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition cursor-pointer"
            >
              {isSecurityPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {isSecurityPending ? "Mise à jour..." : "Changer le mot de passe"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
