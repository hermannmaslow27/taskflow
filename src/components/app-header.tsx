"use client";

import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Search,
  CheckCircle2,
  LogOut,
  Sparkles,
  Command,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";

interface AppHeaderProps {
  onOpenCommandPalette: () => void;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function AppHeader({ onOpenCommandPalette, user }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 border-b border-card-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Search */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            TaskFlow
          </span>
        </div>

        {/* Command palette search trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2.5 bg-muted-bg/60 hover:bg-muted-bg border border-card-border px-3.5 py-1.5 rounded-xl text-xs text-muted transition cursor-pointer group"
        >
          <Search className="w-3.5 h-3.5 group-hover:text-primary transition" />
          <span>Recherche rapide ou commande...</span>
          <kbd className="bg-card border border-card-border text-[10px] font-mono px-1.5 py-0.5 rounded text-muted shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* User & Theme actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-xl text-muted hover:text-card-foreground hover:bg-muted-bg border border-transparent hover:border-card-border transition cursor-pointer"
          title="Changer de thème"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {user && (
          <div className="flex items-center gap-3 pl-2 border-l border-card-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-card-foreground leading-none">
                  {user.name || "Utilisateur"}
                </span>
                <span className="text-[10px] text-muted leading-tight truncate max-w-[120px]">
                  {user.email}
                </span>
              </div>
            </div>

            <button
              onClick={() => logoutAction()}
              className="p-2 rounded-xl text-muted hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
