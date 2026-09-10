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
  ChevronDown,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  Wifi,
  WifiOff,
  FolderPlus,
  Command,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";

export interface ProjectSummary {
  id: string;
  name: string;
  color?: string | null;
}

export type DashboardViewType = "kanban" | "list" | "calendar" | "trash";

interface AppHeaderProps {
  onOpenCommandPalette: () => void;
  onOpenProfile?: () => void;
  onOpenNewProject?: () => void;
  onQuickNewTask?: () => void;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  projects?: ProjectSummary[];
  activeProjectId?: string;
  onSelectProject?: (projectId: string) => void;
  activeView?: DashboardViewType;
  onSelectView?: (view: DashboardViewType) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function AppHeader({
  onOpenCommandPalette,
  onOpenProfile,
  onOpenNewProject,
  onQuickNewTask,
  user,
  projects = [],
  activeProjectId,
  onSelectProject,
  isSidebarCollapsed = false,
  onToggleSidebar,
}: AppHeaderProps) {
  const { theme, setTheme } = useTheme();

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Monitor network online/offline state
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
      const target = e.target as Node;
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(target)
      ) {
        setIsProjectDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsProjectDropdownOpen(false);
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

  const activeProject = projects.find((p) => p.id === activeProjectId);

  return (
    <header className="h-14 border-b border-card-border/70 bg-card/85 backdrop-blur-md px-4 sm:px-5 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* LEFT: Sidebar Toggle & Project Context */}
      <div className="flex items-center gap-2 min-w-0">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? "Développer la barre latérale" : "Réduire la barre latérale"}
            className="p-1.5 rounded-lg text-muted hover:text-card-foreground hover:bg-muted-bg transition cursor-pointer shrink-0"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-primary" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Project Selector Pill */}
        {projects.length > 0 && (
          <div className="relative min-w-0 ml-1" ref={projectDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsProjectDropdownOpen((v) => !v);
                setIsUserMenuOpen(false);
              }}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted-bg text-xs font-semibold text-card-foreground max-w-[170px] sm:max-w-[220px] transition cursor-pointer"
              title="Changer de projet"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: activeProject?.color || "#6366F1" }}
              />
              <span className="truncate">{activeProject?.name || "Projet"}</span>
              <ChevronDown className="w-3 h-3 text-muted shrink-0 opacity-70" />
            </button>

            {isProjectDropdownOpen && (
              <div className="absolute left-0 mt-2 w-60 bg-card border border-card-border rounded-xl shadow-xl p-1.5 z-50 animate-fade-in text-card-foreground">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Projets ({projects.length})
                </div>
                <div className="max-h-56 overflow-y-auto space-y-0.5 py-1">
                  {projects.map((proj) => {
                    const isSelected = proj.id === activeProjectId;
                    return (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => {
                          onSelectProject?.(proj.id);
                          setIsProjectDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                          isSelected
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-card-foreground hover:bg-muted-bg"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: proj.color || "#6366F1" }}
                          />
                          <span className="truncate">{proj.name}</span>
                        </div>
                        {isSelected && <Check className="w-3 h-3 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {onOpenNewProject && (
                  <div className="pt-1 mt-1 border-t border-card-border">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProjectDropdownOpen(false);
                        onOpenNewProject();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition cursor-pointer"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>Nouveau projet</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CENTER: Compact, Subtle Search Trigger */}
      <div className="flex items-center justify-center flex-1 max-w-xs mx-4">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between bg-muted-bg/40 hover:bg-muted-bg/80 border border-card-border/60 hover:border-card-border px-2.5 py-1.5 rounded-lg text-xs text-muted transition cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-muted shrink-0" />
            <span className="truncate text-[11px]">Rechercher...</span>
          </div>
          <kbd className="hidden sm:inline-block text-[9px] font-mono bg-card border border-card-border px-1.5 py-0.2 rounded text-muted">
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
            className="bg-primary hover:bg-primary-hover text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            title="Créer une tâche"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Tâche</span>
          </button>
        )}

        {/* Profile Avatar with integrated status indicator */}
        {user && (
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsUserMenuOpen((v) => !v);
                setIsProjectDropdownOpen(false);
              }}
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

              {/* Status dot */}
              <span
                className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-card ${
                  isOnline ? "bg-emerald-400" : "bg-amber-400"
                }`}
                title={isOnline ? "En ligne" : "Hors-ligne"}
              />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-card-border rounded-xl shadow-xl p-1.5 z-50 animate-fade-in text-card-foreground">
                <div className="px-2.5 py-2 border-b border-card-border/60">
                  <p className="text-xs font-bold text-card-foreground truncate">
                    {user.name || "Utilisateur"}
                  </p>
                  <p className="text-[10px] text-muted truncate">{user.email}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-muted">
                    {isOnline ? (
                      <>
                        <Wifi className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">En ligne</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-400 font-medium">Mode hors-ligne</span>
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
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-card-foreground hover:bg-muted-bg transition cursor-pointer text-left"
                    >
                      <Settings className="w-3.5 h-3.5 text-muted" />
                      <span>Mon Profil</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setTheme(theme === "dark" ? "light" : "dark");
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-card-foreground hover:bg-muted-bg transition cursor-pointer text-left"
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
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-card-foreground hover:bg-muted-bg transition cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Command className="w-3.5 h-3.5 text-muted" />
                      <span>Commandes</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted">⌘K</span>
                  </button>
                </div>

                <div className="pt-1 mt-1 border-t border-card-border/60">
                  <button
                    type="button"
                    onClick={() => logoutAction()}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition cursor-pointer text-left"
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
