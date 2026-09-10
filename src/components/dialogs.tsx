"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Info, Trash2, X } from "lucide-react";

/* ─────────────────────────────────────────
   ConfirmDialog
   Usage:
     const { confirm, ConfirmDialog } = useConfirm();
     ...
     const ok = await confirm({ title: "...", message: "..." });
───────────────────────────────────────── */

type Variant = "danger" | "warning" | "info";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
}

interface PromptOptions {
  title: string;
  message?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  defaultValue?: string;
}

// ── ConfirmDialog ──────────────────────

export function useConfirm() {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((v: boolean) => void) | null>(null);

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setOpts(options);
    });
  };

  const handleClose = (result: boolean) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setOpts(null);
  };

  const ConfirmDialog = () => {
    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") handleClose(false);
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!opts) return null;

    const variant = opts.variant ?? "danger";
    const iconMap = {
      danger: <Trash2 className="w-5 h-5 text-rose-400" />,
      warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      info: <Info className="w-5 h-5 text-indigo-400" />,
    };
    const iconBgMap = {
      danger: "bg-rose-500/10 border-rose-500/20",
      warning: "bg-amber-500/10 border-amber-500/20",
      info: "bg-indigo-500/10 border-indigo-500/20",
    };
    const btnMap = {
      danger: "bg-rose-500 hover:bg-rose-600 shadow-rose-500/25",
      warning: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/25",
      info: "bg-primary hover:bg-primary-hover shadow-primary/25",
    };

    return (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        role="alertdialog"
        aria-modal="true"
      >
        <div
          className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          onClick={() => handleClose(false)}
        />
        <div className="relative w-full max-w-sm rounded-2xl border border-card-border bg-card p-6 shadow-2xl animate-fade-in">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto mb-4 ${iconBgMap[variant]}`}
          >
            {iconMap[variant]}
          </div>
          <h3 className="text-sm font-bold text-card-foreground text-center mb-1.5">
            {opts.title}
          </h3>
          <p className="text-xs text-muted text-center leading-relaxed mb-6">
            {opts.message}
          </p>
          <div className="flex gap-3">
            <button
              autoFocus
              onClick={() => handleClose(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-card-border text-xs font-semibold text-muted hover:text-card-foreground hover:bg-muted-bg transition cursor-pointer"
            >
              {opts.cancelLabel ?? "Annuler"}
            </button>
            <button
              onClick={() => handleClose(true)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-white text-xs font-semibold transition cursor-pointer shadow-lg ${btnMap[variant]}`}
            >
              {opts.confirmLabel ?? "Confirmer"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { confirm, ConfirmDialog };
}

// ── PromptDialog ──────────────────────

export function usePrompt() {
  const [opts, setOpts] = useState<PromptOptions | null>(null);
  const resolveRef = useRef<((v: string | null) => void) | null>(null);
  const [value, setValue] = useState("");

  const prompt = (options: PromptOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setValue(options.defaultValue ?? "");
      setOpts(options);
    });
  };

  const handleClose = (submit: boolean) => {
    resolveRef.current?.(submit ? value : null);
    resolveRef.current = null;
    setOpts(null);
    setValue("");
  };

  const PromptDialog = () => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      inputRef.current?.focus();
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") handleClose(false);
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!opts) return null;

    return (
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          onClick={() => handleClose(false)}
        />
        <div className="relative w-full max-w-sm rounded-2xl border border-card-border bg-card p-6 shadow-2xl animate-fade-in">
          <button
            onClick={() => handleClose(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-card-foreground hover:bg-muted-bg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <h3 className="text-sm font-bold text-card-foreground mb-1.5">
            {opts.title}
          </h3>
          {opts.message && (
            <p className="text-xs text-muted mb-3">{opts.message}</p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleClose(true);
            }}
            className="space-y-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={opts.placeholder}
              className="w-full bg-muted-bg border border-card-border rounded-xl px-3.5 py-2.5 text-sm text-card-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition"
            />
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-card-border text-xs font-semibold text-muted hover:text-card-foreground hover:bg-muted-bg transition cursor-pointer"
              >
                {opts.cancelLabel ?? "Annuler"}
              </button>
              <button
                type="submit"
                disabled={!value.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer shadow-lg shadow-primary/25"
              >
                {opts.confirmLabel ?? "Valider"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return { prompt, PromptDialog };
}
