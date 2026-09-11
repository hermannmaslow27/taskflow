"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Search,
  CheckCircle2,
  LogOut,
  Settings,
  Plus,
  Wifi,
  WifiOff,
  Command,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";

export interface ProjectSummary {
  id: string;
  name: string;
  color?: string | null;
}

interface AppHeaderProps {
  onOpenCommandPalette: () => void;
  onOpenProfile?: () => void;
  onQuickNewTask?: () => void;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  activeProject?: ProjectSummary | null;
}

export function AppHeader({
  onOpenCommandPalette,
  onOpenProfile,
  onQuickNewTask,
  user,
  activeProject,
}: AppHeaderProps) {
  const { theme, setTheme } = useTheme();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Monitor online status
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Close menus on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="h-14 border-b border-card-border/70 bg-card/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* LEFT: Brand Logo & Active Project Name (clean, non-redundant) */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent hidden sm:inline-block">
            TaskFlow
          </span>
        </div>

        {activeProject && (
          <>
            <span className="text-muted/40 font-light text-sm hidden sm:inline-block">/</span>
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: activeProject.color || "#6366F1" }}
              />
              <span className="text-xs sm:text-sm font-semibold text-card-foreground truncate max-w-[150px] sm:max-w-[220px]">
                {activeProject.name}
              </span>
            </div>
          </>
        )}
      </div>

      {/* CENTER: Command Palette Search Bar (clickable) */}
      <div className="flex items-center justify-center flex-1 max-w-sm mx-4">
        <button
          type="button"
          onClick={() => onOpenCommandPalette()}
          className="w-full flex items-center justify-between bg-muted-bg/50 hover:bg-muted-bg border border-card-border/70 hover:border-primary/40 px-3 py-1.5 rounded-xl text-xs text-muted transition cursor-pointer shadow-2xs group"
          title="Ouvrir la recherche ou commande (⌘K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-muted group-hover:text-primary transition shrink-0" />
            <span className="truncate text-[11px] sm:text-xs">Rechercher une tâche, commande...</span>
          </div>
          <kbd className="hidden sm:inline-block text-[9px] font-mono bg-card border border-card-border px-1.5 py-0.5 rounded text-muted shadow-2xs group-hover:border-primary/40">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* RIGHT: Quick Task + Clean Profile Avatar */}
      <div className="flex items-center gap-2.5 shrink-0">
        {onQuickNewTask && (
          <button
            type="button"
            onClick={onQuickNewTask}
            className="bg-primary hover:bg-primary-hover text-white px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            title="Créer une nouvelle tâche rapide"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Tâche</span>
          </button>
        )}

        {/* Profile Avatar with status dot */}
        {user && (
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((v) => !v)}
              className="relative p-0.5 rounded-full hover:ring-2 hover:ring-primary/40 transition cursor-pointer"
              title="Menu utilisateur"
            >
              {user.image ? (
                <div
                  className="w-7 h-7 rounded-full border border-card-border"
                  style={{
                    backgroundImage: `url(${user.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center border border-card-border">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}

              {/* Status indicator dot */}
              <span
                className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-card ${
                  isOnline ? "bg-emerald-400" : "bg-amber-400"
                }`}
                title={isOnline ? "En ligne" : "Hors-ligne"}
              />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-card-border rounded-2xl shadow-xl p-1.5 z-50 animate-fade-in text-card-foreground">
                <div className="px-2.5 py-2 border-b border-card-border/60">
                  <p className="text-xs font-bold text-card-foreground truncate">
                    {user.name || "Utilisateur"}
                  </p>
                  <p className="text-[10px] text-muted truncate">{user.email}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                    {isOnline ? (
                      <>
                        <Wifi className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Connecté</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-400 font-medium">Hors-ligne</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-0.5 pt-1">
                  {onOpenProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-card-foreground hover:bg-muted-bg transition cursor-pointer text-left"
                    >
                      <Settings className="w-3.5 h-3.5 text-muted" />
                      <span>Mon Profil & Avatar</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setTheme(theme === "dark" ? "light" : "dark");
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-card-foreground hover:bg-muted-bg transition cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      {theme === "dark" ? (
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      )}
                      <span>{theme === "dark" ? "Mode clair" : "Mode sombre"}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenCommandPalette();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-card-foreground hover:bg-muted-bg transition cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Command className="w-3.5 h-3.5 text-muted" />
                      <span>Palette de commandes</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted">⌘K</span>
                  </button>
                </div>

                <div className="pt-1 mt-1 border-t border-card-border/60">
                  <button
                    type="button"
                    onClick={() => logoutAction()}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
