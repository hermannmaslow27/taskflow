"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ListTodo,
  Calendar,
  Trash2,
  FolderPlus,
  UserPlus,
  ChevronRight,
  Folder,
  MoreHorizontal,
  Trash,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
} from "lucide-react";

interface SidebarProps {
  projects: any[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  activeView: "kanban" | "list" | "calendar" | "trash";
  onSelectView: (view: "kanban" | "list" | "calendar" | "trash") => void;
  onOpenNewProject: () => void;
  onOpenInviteMember: () => void;
  onDeleteProject?: (id: string) => void;
  onOpenProjectSettings?: (id: string) => void;
  deletedTasksCount?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const VIEWS = [
  { id: "kanban" as const, label: "Tableau Kanban", Icon: LayoutDashboard },
  { id: "list" as const, label: "Vue Liste", Icon: ListTodo },
  { id: "calendar" as const, label: "Calendrier", Icon: Calendar },
  { id: "trash" as const, label: "Corbeille", Icon: Trash2 },
];

export function Sidebar({
  projects,
  activeProjectId,
  onSelectProject,
  activeView,
  onSelectView,
  onOpenNewProject,
  onOpenInviteMember,
  onDeleteProject,
  onOpenProjectSettings,
  deletedTasksCount = 0,
  collapsed: externalCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Persist collapse state if internal
  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setInternalCollapsed(true);
  }, []);

  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((v) => {
        localStorage.setItem("sidebar-collapsed", String(!v));
        return !v;
      });
    }
  };

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const handleDeleteProject = (id: string) => {
    setMenuOpenFor(null);
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      onDeleteProject?.(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <>
      <aside
        className={`border-r border-sidebar-border bg-sidebar shrink-0 flex flex-col h-[calc(100vh-64px)] select-none overflow-hidden transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Collapse toggle */}
        <div
          className={`flex items-center pt-4 px-3 pb-2 ${collapsed ? "justify-center" : "justify-end"}`}
        >
          <button
            onClick={toggleCollapse}
            title={collapsed ? "Développer la sidebar" : "Réduire la sidebar"}
            className="p-1.5 rounded-lg text-muted hover:text-card-foreground hover:bg-muted-bg transition cursor-pointer"
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Views Navigation */}
        <div className={`space-y-1 mb-6 ${collapsed ? "px-2" : "px-4"}`}>
          {!collapsed && (
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider px-3 mb-1 block">
              Vues
            </span>
          )}

          {VIEWS.map(({ id, label, Icon }) => {
            const isActive = activeView === id;
            const isTrash = id === "trash";
            return (
              <button
                key={id}
                onClick={() => onSelectView(id)}
                title={collapsed ? label : undefined}
                className={`w-full flex items-center gap-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  collapsed ? "justify-center p-2.5" : "px-3 py-2"
                } ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-card-foreground hover:bg-muted-bg"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{label}</span>
                    {isTrash && deletedTasksCount > 0 && (
                      <span
                        className={`text-[10px] px-1.5 rounded-full font-mono ${
                          isActive ? "bg-white/20 text-white" : "bg-muted-bg text-muted"
                        }`}
                      >
                        {deletedTasksCount}
                      </span>
                    )}
                  </>
                )}
                {collapsed && isTrash && deletedTasksCount > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Projects List */}
        <div className={`flex-1 overflow-y-auto space-y-1 ${collapsed ? "px-2" : "px-4"}`}>
          {!collapsed && (
            <div className="flex items-center justify-between px-3 mb-1">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                Projets ({projects.length})
              </span>
              <button
                onClick={onOpenNewProject}
                className="p-1 rounded-md text-muted hover:text-primary hover:bg-muted-bg transition cursor-pointer"
                title="Créer un projet"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {collapsed && (
            <button
              onClick={onOpenNewProject}
              title="Créer un projet"
              className="w-full flex justify-center p-2.5 rounded-xl text-muted hover:text-primary hover:bg-muted-bg transition cursor-pointer mb-1"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          )}

          {projects.map((proj) => {
            const isActive = proj.id === activeProjectId;
            return (
              <div key={proj.id} className="relative group/proj">
                <button
                  onClick={() => {
                    onSelectProject(proj.id);
                    setMenuOpenFor(null);
                  }}
                  title={collapsed ? proj.name : undefined}
                  className={`w-full flex items-center gap-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    collapsed ? "justify-center p-2.5" : "px-3 py-2"
                  } ${
                    isActive
                      ? "bg-muted-bg text-card-foreground font-semibold"
                      : "text-muted hover:text-card-foreground hover:bg-muted-bg/50"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: proj.color || "#6366F1" }}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1 text-left">{proj.name}</span>
                  )}
                  {!collapsed && isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-muted shrink-0 group-hover/proj:opacity-0 transition" />
                  )}
                </button>

                {/* Context menu trigger (visible on hover, not in collapsed mode) */}
                {!collapsed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenFor((cur) => (cur === proj.id ? null : proj.id));
                    }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-lg opacity-0 group-hover/proj:opacity-100 transition text-muted hover:text-card-foreground hover:bg-muted-bg cursor-pointer"
                    title="Options"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Dropdown menu */}
                {menuOpenFor === proj.id && !collapsed && (
                  <div
                    className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border border-card-border bg-card shadow-xl shadow-black/20 py-1 animate-fade-in"
                    onMouseLeave={() => setMenuOpenFor(null)}
                  >
                    {onOpenProjectSettings && (
                      <button
                        onClick={() => {
                          setMenuOpenFor(null);
                          onOpenProjectSettings(proj.id);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-card-foreground hover:bg-muted-bg transition cursor-pointer"
                      >
                        <Settings2 className="w-3.5 h-3.5 text-muted" />
                        Documents du projet
                      </button>
                    )}
                    <div className="mx-2 my-1 border-t border-card-border" />
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                      Supprimer le projet
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {projects.length === 0 && !collapsed && (
            <div className="text-center py-6 text-xs text-muted">
              Aucun projet. Créez-en un !
            </div>
          )}
        </div>

        {/* Invite member */}
        {activeProject && (
          <div className={`pt-3 border-t border-sidebar-border mt-auto ${collapsed ? "px-2 pb-4" : "px-4 pb-4"}`}>
            <button
              onClick={onOpenInviteMember}
              title={collapsed ? "Inviter un membre" : undefined}
              className={`w-full flex items-center gap-2 rounded-xl border border-card-border bg-card hover:bg-muted-bg text-xs font-semibold text-card-foreground transition cursor-pointer shadow-2xs ${
                collapsed ? "justify-center p-2.5" : "justify-center px-3 py-2"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-primary shrink-0" />
              {!collapsed && <span>Inviter dans ce projet</span>}
            </button>
          </div>
        )}
      </aside>

      {/* Confirm delete dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-card-border bg-card p-6 shadow-2xl animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="text-sm font-bold text-card-foreground text-center mb-1">
              Supprimer le projet ?
            </h3>
            <p className="text-xs text-muted text-center mb-6">
              Toutes les tâches, sous-tâches et commentaires seront supprimés définitivement. Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-card-border text-xs font-semibold text-muted hover:text-card-foreground hover:bg-muted-bg transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition cursor-pointer shadow-lg shadow-rose-500/25"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
