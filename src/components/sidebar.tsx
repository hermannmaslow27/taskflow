"use client";

import {
  LayoutDashboard,
  ListTodo,
  Calendar,
  Trash2,
  FolderPlus,
  UserPlus,
  ChevronRight,
  Folder,
  CheckCircle2,
} from "lucide-react";

interface SidebarProps {
  projects: any[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  activeView: "kanban" | "list" | "calendar" | "trash";
  onSelectView: (view: "kanban" | "list" | "calendar" | "trash") => void;
  onOpenNewProject: () => void;
  onOpenInviteMember: () => void;
  deletedTasksCount?: number;
}

export function Sidebar({
  projects,
  activeProjectId,
  onSelectProject,
  activeView,
  onSelectView,
  onOpenNewProject,
  onOpenInviteMember,
  deletedTasksCount = 0,
}: SidebarProps) {
  const activeProject = projects.find((p) => p.id === activeProjectId);

  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar shrink-0 flex flex-col h-[calc(100vh-64px)] p-4 select-none">
      {/* Views Navigation */}
      <div className="space-y-1 mb-6">
        <span className="text-[10px] font-bold text-muted uppercase tracking-wider px-3 mb-1 block">
          Vues
        </span>

        <button
          onClick={() => onSelectView("kanban")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeView === "kanban"
              ? "bg-primary text-white shadow-sm"
              : "text-muted hover:text-card-foreground hover:bg-muted-bg"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Tableau Kanban</span>
        </button>

        <button
          onClick={() => onSelectView("list")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeView === "list"
              ? "bg-primary text-white shadow-sm"
              : "text-muted hover:text-card-foreground hover:bg-muted-bg"
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Vue Liste</span>
        </button>

        <button
          onClick={() => onSelectView("calendar")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeView === "calendar"
              ? "bg-primary text-white shadow-sm"
              : "text-muted hover:text-card-foreground hover:bg-muted-bg"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendrier</span>
        </button>

        <button
          onClick={() => onSelectView("trash")}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeView === "trash"
              ? "bg-primary text-white shadow-sm"
              : "text-muted hover:text-card-foreground hover:bg-muted-bg"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Trash2 className="w-4 h-4" />
            <span>Corbeille</span>
          </div>
          {deletedTasksCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeView === "trash"
                  ? "bg-white/20 text-white"
                  : "bg-muted-bg text-muted"
              }`}
            >
              {deletedTasksCount}
            </span>
          )}
        </button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto space-y-1">
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

        {projects.map((proj) => {
          const isActive = proj.id === activeProjectId;
          return (
            <button
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer group ${
                isActive
                  ? "bg-muted-bg text-card-foreground font-semibold"
                  : "text-muted hover:text-card-foreground hover:bg-muted-bg/50"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: proj.color || "#6366F1" }}
                />
                <span className="truncate">{proj.name}</span>
              </div>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-muted shrink-0" />
              )}
            </button>
          );
        })}

        {projects.length === 0 && (
          <div className="text-center py-6 text-xs text-muted">
            Aucun projet. Créez-en un pour commencer !
          </div>
        )}
      </div>

      {/* Team / Project Members Button */}
      {activeProject && (
        <div className="pt-3 border-t border-sidebar-border mt-auto">
          <button
            onClick={onOpenInviteMember}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-card-border bg-card hover:bg-muted-bg text-xs font-semibold text-card-foreground transition cursor-pointer shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-primary" />
            <span>Inviter dans ce projet</span>
          </button>
        </div>
      )}
    </aside>
  );
}
