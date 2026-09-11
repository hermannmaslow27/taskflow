"use client";

import { useState, useEffect, useCallback } from "react";
import { AppHeader } from "./app-header";
import { Sidebar } from "./sidebar";
import { OfflineIndicator } from "./offline-indicator";
import { CommandPalette } from "./command-palette";
import { KanbanView } from "./views/kanban-view";
import { ListView } from "./views/list-view";
import { CalendarView } from "./views/calendar-view";
import { TrashView } from "./views/trash-view";
import { TaskDetailModal, type TaskDetailData } from "./task-detail-modal";
import { NewProjectModal } from "./new-project-modal";
import { InviteMemberModal } from "./invite-member-modal";
import { ProfileModal } from "./profile-modal";
import { ProjectSettingsModal } from "./project-settings-modal";
import { usePrompt, useConfirm } from "./dialogs";
import { getTasksAction, createTaskAction } from "@/actions/tasks";
import { getProjectsAction, deleteProjectAction } from "@/actions/projects";
import { Plus } from "lucide-react";
import { syncEngine } from "@/lib/sync-client";

interface DashboardClientProps {
  initialUser: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  initialProjects: any[];
}

export function DashboardClient({
  initialUser,
  initialProjects,
}: DashboardClientProps) {
  const [projects, setProjects] = useState<any[]>(initialProjects);
  const [activeProjectId, setActiveProjectId] = useState<string>(
    initialProjects[0]?.id || ""
  );
  const [activeView, setActiveView] = useState<"kanban" | "list" | "calendar" | "trash">("kanban");

  const [tasks, setTasks] = useState<any[]>([]);
  const [deletedTasks, setDeletedTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskDetailData | null>(null);

  // Modals
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [projectSettingsId, setProjectSettingsId] = useState<string | null>(null);

  // Custom dialogs
  const { prompt, PromptDialog } = usePrompt();
  const { confirm, ConfirmDialog } = useConfirm();

  // Local user state
  const [localUser, setLocalUser] = useState(initialUser);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setIsSidebarCollapsed(true);
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  const fetchTasks = useCallback(async () => {
    if (!activeProjectId) return;
    try {
      const activeRes = await getTasksAction({ projectId: activeProjectId, includeDeleted: false });
      if (activeRes.success && activeRes.data) setTasks(activeRes.data);

      const deletedRes = await getTasksAction({ projectId: activeProjectId, includeDeleted: true });
      if (deletedRes.success && deletedRes.data) setDeletedTasks(deletedRes.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  }, [activeProjectId]);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await getProjectsAction();
      if (res.success && res.data) setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const handleDeleteProject = async (id: string) => {
    const ok = await confirm({
      title: "Supprimer le projet ?",
      message: "Toutes les tâches, sous-tâches et commentaires seront supprimés définitivement. Cette action est irréversible.",
      confirmLabel: "Supprimer",
      variant: "danger",
    });
    if (!ok) return;
    const res = await deleteProjectAction(id);
    if (res.success) {
      const remaining = projects.filter((p) => p.id !== id);
      setProjects(remaining);
      if (activeProjectId === id) {
        setActiveProjectId(remaining[0]?.id || "");
        setActiveView("kanban");
      }
    }
  };

  const handleQuickNewTask = async () => {
    if (!activeProjectId) return;
    const title = await prompt({
      title: "Nouvelle tâche",
      placeholder: "Titre de la tâche...",
      confirmLabel: "Créer",
    });
    if (!title || !title.trim()) return;
    try {
      const payload = {
        projectId: activeProjectId,
        title: title.trim(),
        status: "todo" as const,
        priority: "medium" as const,
      };
      if (!navigator.onLine) {
        await syncEngine.queueMutation("task", "create", payload);
      } else {
        await createTaskAction(payload);
      }
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader
        user={localUser}
        activeProject={activeProject}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onQuickNewTask={handleQuickNewTask}
      />

      <OfflineIndicator />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={(id) => {
            setActiveProjectId(id);
            setActiveView("kanban");
          }}
          activeView={activeView}
          onSelectView={setActiveView}
          onOpenNewProject={() => setIsNewProjectOpen(true)}
          onOpenInviteMember={() => setIsInviteMemberOpen(true)}
          onDeleteProject={handleDeleteProject}
          onOpenProjectSettings={(id) => setProjectSettingsId(id)}
          deletedTasksCount={deletedTasks.length}
          collapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        <main className="flex-1 overflow-y-auto p-6 flex flex-col">
          {activeProject && (
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: activeProject.color || "#6366F1" }}
                />
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-card-foreground">
                    {activeProject.name}
                  </h1>
                  <span className="text-xs text-muted">
                    {tasks.length} tâche(s) active(s) · {deletedTasks.length} corbeille
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleQuickNewTask}
                  className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-primary/20 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvelle tâche</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex-1">
            {activeView === "kanban" && (
              <KanbanView tasks={tasks} projectId={activeProjectId} onTaskClick={(t) => setSelectedTask(t)} onTasksChange={fetchTasks} />
            )}
            {activeView === "list" && (
              <ListView tasks={tasks} projectId={activeProjectId} onTaskClick={(t) => setSelectedTask(t)} onTasksChange={fetchTasks} />
            )}
            {activeView === "calendar" && (
              <CalendarView tasks={tasks} projectId={activeProjectId} onTaskClick={(t) => setSelectedTask(t)} onTasksChange={fetchTasks} />
            )}
            {activeView === "trash" && (
              <TrashView deletedTasks={deletedTasks} projectId={activeProjectId} onTasksChange={fetchTasks} />
            )}
          </div>
        </main>
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          availableTags={activeProject?.tags || []}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={fetchTasks}
          currentUserId={localUser.id}
        />
      )}

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onProjectCreated={(id) => {
          fetchProjects();
          setActiveProjectId(id);
        }}
      />

      <InviteMemberModal
        isOpen={isInviteMemberOpen}
        projectId={activeProjectId}
        onClose={() => setIsInviteMemberOpen(false)}
        onMemberInvited={fetchProjects}
      />

      <CommandPalette
        onNewTaskClick={handleQuickNewTask}
        onNewProjectClick={() => setIsNewProjectOpen(true)}
        onSelectView={setActiveView}
        projects={projects}
        onSelectProject={(id) => {
          setActiveProjectId(id);
          setActiveView("kanban");
        }}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={localUser}
        onUserUpdated={(updated) => {
          setLocalUser((prev) => ({ ...prev, ...updated }));
          setIsProfileOpen(false);
        }}
      />

      <ProjectSettingsModal
        isOpen={!!projectSettingsId}
        onClose={() => setProjectSettingsId(null)}
        project={projects.find((p) => p.id === projectSettingsId) ?? null}
        currentUserId={localUser.id}
      />

      {/* Custom dialogs */}
      <PromptDialog />
      <ConfirmDialog />
    </div>
  );
}
