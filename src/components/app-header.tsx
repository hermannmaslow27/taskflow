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
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Calendar,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Wifi,
  WifiOff,
  User,
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

const VIEW_METAS: Record<
  DashboardViewType,
  { label: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  kanban: { label: "Tableau Kanban", Icon: LayoutDashboard },
  list: { label: "Vue Liste", Icon: ListTodo },
  calendar: { label: "Calendrier", Icon: Calendar },
  trash: { label: "Corbeille", Icon: Trash2 },
};

export function AppHeader({
  onOpenCommandPalette,
  onOpenProfile,
  onOpenNewProject,
  onQuickNewTask,
  user,
  projects = [],
  activeProjectId,
  onSelectProject,
  activeView = "kanban",
  onSelectView,
  isSidebarCollapsed = false,
  onToggleSidebar,
}: AppHeaderProps) {
  const { theme, setTheme } = useTheme();

  // Dropdown states
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const viewDropdownRef = useRef<HTMLDivElement>(null);
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
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(target)) {
        setIsViewDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsProjectDropdownOpen(false);
        setIsViewDropdownOpen(false);
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
  const ActiveViewIcon = VIEW_METAS[activeView]?.Icon || LayoutDashboard;
  const activeViewLabel = VIEW_METAS[activeView]?.label || "Tableau";

  return (
    <header className="h-16 border-b border-card-border/80 bg-card/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-xs">
      {/* LEFT SECTION: Sidebar Toggle + Brand + Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Sidebar Collapse Toggle */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? "Développer le volet latéral" : "Réduire le volet latéral"}
            className="p-2 rounded-xl text-muted hover:text-card-foreground hover:bg-muted-bg border border-transparent hover:border-card-border transition cursor-pointer shrink-0"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-primary" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Brand Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="hidden sm:inline-block font-extrabold text-base tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            TaskFlow
          </span>
        </div>

        {/* Breadcrumb Separator */}
        <span className="text-muted/50 font-light text-sm hidden sm:inline-block">/</span>

        {/* Project Switcher Dropdown */}
        {projects.length > 0 && (
          <div className="relative min-w-0" ref={projectDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsProjectDropdownOpen((v) => !v);
                setIsViewDropdownOpen(false);
                setIsUserMenuOpen(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-muted-bg border border-transparent hover:border-card-border transition cursor-pointer text-xs font-semibold text-card-foreground max-w-[160px] sm:max-w-[200px] truncate"
              title="Changer de projet"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: activeProject?.color || "#6366F1" }}
              />
              <span className="truncate">{activeProject?.name || "Sélectionner un projet"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted shrink-0 ml-0.5" />
            </button>

            {isProjectDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-card border border-card-border rounded-xl shadow-xl p-1.5 z-50 animate-fade-in text-card-foreground">
                <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">
                  Mes Projets ({projects.length})
                </div>
                <div className="max-h-60 overflow-y-auto space-y-0.5 py-1">
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
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                          isSelected
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-card-foreground hover:bg-muted-bg"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: proj.color || "#6366F1" }}
                          />
                          <span className="truncate">{proj.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {onOpenNewProject && (
                  <div className="pt-1.5 mt-1 border-t border-card-border">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProjectDropdownOpen(false);
                        onOpenNewProject();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition cursor-pointer"
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

        {/* View Switcher Breadcrumb */}
        {onSelectView && (
          <>
            <span className="text-muted/50 font-light text-sm hidden md:inline-block">/</span>
            <div className="relative hidden md:block" ref={viewDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsViewDropdownOpen((v) => !v);
                  setIsProjectDropdownOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-muted-bg border border-transparent hover:border-card-border transition cursor-pointer text-xs font-medium text-muted hover:text-card-foreground"
                title="Changer de vue"
              >
                <ActiveViewIcon className="w-3.5 h-3.5 text-primary" />
                <span>{activeViewLabel}</span>
                <ChevronDown className="w-3 h-3 text-muted" />
              </button>

              {isViewDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-card border border-card-border rounded-xl shadow-xl p-1.5 z-50 animate-fade-in text-card-foreground">
                  {(Object.keys(VIEW_METAS) as DashboardViewType[]).map((vKey) => {
                    const meta = VIEW_METAS[vKey];
                    const IconComponent = meta.Icon;
                    const isSelected = activeView === vKey;
                    return (
                      <button
                        key={vKey}
                        type="button"
                        onClick={() => {
                          onSelectView(vKey);
                          setIsViewDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                          isSelected
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-card-foreground hover:bg-muted-bg"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-3.5 h-3.5" />
                          <span>{meta.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* CENTER SECTION: Command Palette Search Bar */}
      <div className="hidden lg:flex items-center justify-center flex-1 max-w-md mx-6">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between bg-muted-bg/60 hover:bg-muted-bg border border-card-border/80 hover:border-primary/40 px-3.5 py-2 rounded-xl text-xs text-muted transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="w-4 h-4 text-muted group-hover:text-primary transition" />
            <span className="truncate">Rechercher une tâche, un projet, une vue...</span>
          </div>
          <kbd className="hidden xl:inline-flex items-center gap-0.5 bg-card border border-card-border text-[10px] font-mono px-2 py-0.5 rounded text-muted shadow-2xs group-hover:border-primary/40 transition">
            <span>⌘</span>
            <span>K</span>
          </kbd>
        </button>
      </div>

      {/* RIGHT SECTION: Quick Actions + Status + Theme + User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search button on smaller screens */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="lg:hidden p-2 rounded-xl text-muted hover:text-card-foreground hover:bg-muted-bg border border-transparent hover:border-card-border transition cursor-pointer"
          title="Recherche rapide (⌘K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick New Task Button */}
        {onQuickNewTask && (
          <button
            type="button"
            onClick={onQuickNewTask}
            className="bg-primary hover:bg-primary-hover text-white px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-primary/20 transition cursor-pointer shrink-0"
            title="Créer une nouvelle tâche rapide"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden md:inline">Nouvelle tâche</span>
          </button>
        )}

        {/* Connectivity Status Indicator */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            isOnline
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}
          title={isOnline ? "Connecté en temps réel" : "Mode hors-ligne actif"}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
          />
          <span className="hidden xl:inline">{isOnline ? "En ligne" : "Hors-ligne"}</span>
        </div>

        {/* Theme Switcher Toggle */}
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-xl text-muted hover:text-card-foreground hover:bg-muted-bg border border-transparent hover:border-card-border transition cursor-pointer"
          title={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile Popover / Dropdown */}
        {user && (
          <div className="relative pl-1 sm:pl-2 border-l border-card-border/80" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsUserMenuOpen((v) => !v);
                setIsProjectDropdownOpen(false);
                setIsViewDropdownOpen(false);
              }}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-muted-bg border border-transparent hover:border-card-border transition cursor-pointer group"
              title="Menu du compte"
            >
              {user.image ? (
                <div
                  className="w-8 h-8 rounded-full border-2 border-primary/30 group-hover:border-primary/60 transition shadow-2xs"
                  style={{
                    backgroundImage: `url(${user.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center border-2 border-primary/30 group-hover:border-primary/60 transition shadow-2xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-card-foreground leading-tight truncate max-w-[110px]">
                  {user.name || "Utilisateur"}
                </span>
                <span className="text-[10px] text-muted leading-none">Espace actif</span>
              </div>
              <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-muted group-hover:text-primary transition" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-card border border-card-border rounded-2xl shadow-2xl p-2 z-50 animate-fade-in text-card-foreground">
                {/* User Summary Header */}
                <div className="p-3 bg-muted-bg/50 rounded-xl mb-1 border border-card-border/60 flex items-center gap-3">
                  {user.image ? (
                    <div
                      className="w-10 h-10 rounded-full border border-card-border shrink-0"
                      style={{
                        backgroundImage: `url(${user.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-card-foreground truncate">
                      {user.name || "Utilisateur"}
                    </p>
                    <p className="text-[11px] text-muted truncate">{user.email}</p>
                    <span className="inline-block text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded mt-1">
                      Membre actif
                    </span>
                  </div>
                </div>

                {/* Actions list */}
                <div className="space-y-0.5 pt-1">
                  {onOpenProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-card-foreground hover:bg-muted-bg transition cursor-pointer text-left"
                    >
                      <Settings className="w-4 h-4 text-muted" />
                      <span>Mon Profil & Avatar</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenCommandPalette();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-card-foreground hover:bg-muted-bg transition cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Command className="w-4 h-4 text-muted" />
                      <span>Palette de commandes</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted bg-muted-bg px-1.5 py-0.5 rounded border border-card-border">
                      ⌘K
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTheme(theme === "dark" ? "light" : "dark");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-card-foreground hover:bg-muted-bg transition cursor-pointer text-left"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-400" />
                        <span>Activer le mode clair</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-indigo-400" />
                        <span>Activer le mode sombre</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Logout Divider */}
                <div className="pt-1.5 mt-1.5 border-t border-card-border">
                  <button
                    type="button"
                    onClick={() => logoutAction()}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Se déconnecter</span>
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
