"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import {
  X,
  Calendar,
  Clock,
  Tag as TagIcon,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  MessageSquare,
  Repeat,
  AlertCircle,
  Eye,
  Edit3,
} from "lucide-react";
import { updateTaskAction, deleteTaskAction } from "@/actions/tasks";
import { createSubtaskAction, toggleSubtaskAction, deleteSubtaskAction } from "@/actions/subtasks";
import { createCommentAction } from "@/actions/comments";
import { syncEngine } from "@/lib/sync-client";

interface SubtaskItem {
  id: string;
  title: string;
  isDone: boolean;
  position: number;
}

interface TagItem {
  id: string;
  name: string;
  color: string;
}

interface CommentItem {
  id: string;
  bodyMd: string;
  createdAt: Date | string;
  author?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export interface TaskDetailData {
  id: string;
  projectId: string;
  title: string;
  descriptionMd: string;
  dueDate?: Date | string | null;
  dueTime?: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: "backlog" | "todo" | "in_progress" | "in_review" | "done";
  recurrenceRule?: string | null;
  subtasks?: SubtaskItem[];
  tags?: TagItem[];
  comments?: CommentItem[];
}

interface TaskDetailModalProps {
  task: TaskDetailData | null;
  availableTags?: TagItem[];
  onClose: () => void;
  onTaskUpdated?: () => void;
}

export function TaskDetailModal({
  task,
  availableTags = [],
  onClose,
  onTaskUpdated,
}: TaskDetailModalProps) {
  if (!task) return null;

  const [title, setTitle] = useState(task.title);
  const [descriptionMd, setDescriptionMd] = useState(task.descriptionMd || "");
  const [previewMarkdown, setPreviewMarkdown] = useState(false);
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);
  const [dueDate, setDueDate] = useState<string>(
    task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] ?? "" : ""
  );
  const [dueTime, setDueTime] = useState<string>(task.dueTime || "");
  const [recurrenceRule, setRecurrenceRule] = useState<string>(task.recurrenceRule || "");

  // Subtasks local state
  const [subtasksList, setSubtasksList] = useState<SubtaskItem[]>(task.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Comments local state
  const [commentsList, setCommentsList] = useState<CommentItem[]>(task.comments || []);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveMainDetails = async () => {
    setIsSaving(true);
    try {
      const payload = {
        id: task.id,
        projectId: task.projectId,
        title,
        descriptionMd,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        dueTime: dueTime || null,
        recurrenceRule: recurrenceRule || null,
      };

      if (!navigator.onLine) {
        await syncEngine.queueMutation("task", "update", payload);
      } else {
        await updateTaskAction(payload);
      }

      onTaskUpdated?.();
      onClose();
    } catch (err) {
      console.error("Save task error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const tempId = crypto.randomUUID();
    const newSub: SubtaskItem = {
      id: tempId,
      title: newSubtaskTitle.trim(),
      isDone: false,
      position: (subtasksList.length + 1) * 1000,
    };

    setSubtasksList([...subtasksList, newSub]);
    setNewSubtaskTitle("");

    try {
      await createSubtaskAction({
        id: tempId,
        taskId: task.id,
        title: newSub.title,
      });
      onTaskUpdated?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, currentStatus: boolean) => {
    setSubtasksList(
      subtasksList.map((s) => (s.id === subtaskId ? { ...s, isDone: !currentStatus } : s))
    );

    try {
      await toggleSubtaskAction({
        id: subtaskId,
        taskId: task.id,
        isDone: !currentStatus,
      });
      onTaskUpdated?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    setSubtasksList(subtasksList.filter((s) => s.id !== subtaskId));
    try {
      await deleteSubtaskAction(subtaskId, task.id);
      onTaskUpdated?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const tempComment: CommentItem = {
      id: crypto.randomUUID(),
      bodyMd: newCommentText.trim(),
      createdAt: new Date().toISOString(),
      author: { name: "Vous" },
    };

    setCommentsList([tempComment, ...commentsList]);
    const body = newCommentText.trim();
    setNewCommentText("");

    try {
      await createCommentAction({
        taskId: task.id,
        bodyMd: body,
      });
      onTaskUpdated?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async () => {
    if (confirm("Déplacer cette tâche vers la corbeille ?")) {
      try {
        if (!navigator.onLine) {
          await syncEngine.queueMutation("task", "delete", { id: task.id });
        } else {
          await deleteTaskAction(task.id);
        }
        onTaskUpdated?.();
        onClose();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-card-border rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-card-border">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted-bg text-muted">
              {status.toUpperCase()}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                priority === "urgent"
                  ? "bg-rose-500/20 text-rose-400"
                  : priority === "high"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-indigo-500/20 text-indigo-400"
              }`}
            >
              Priorité: {priority}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteTask}
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 cursor-pointer transition"
              title="Mettre à la corbeille"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:bg-muted-bg cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wider block mb-1">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-bold bg-transparent border-b border-transparent hover:border-card-border focus:border-primary focus:outline-none transition py-1 text-card-foreground"
              placeholder="Titre de la tâche..."
            />
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-muted-bg/50 border border-card-border">
            {/* Status */}
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-card border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">À faire</option>
                <option value="in_progress">En cours</option>
                <option value="in_review">En révision</option>
                <option value="done">Terminé</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Priorité</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-card border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Échéance</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-card border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Recurrence */}
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Récurrence</label>
              <select
                value={recurrenceRule}
                onChange={(e) => setRecurrenceRule(e.target.value)}
                className="w-full bg-card border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="">Aucune</option>
                <option value="FREQ=DAILY;INTERVAL=1">Chaque jour</option>
                <option value="FREQ=WEEKDAYS">Jours ouvrés</option>
                <option value="FREQ=WEEKLY;INTERVAL=1">Chaque semaine</option>
                <option value="FREQ=MONTHLY;INTERVAL=1">Chaque mois</option>
              </select>
            </div>
          </div>

          {/* Description (Markdown with Live Sanitize Preview) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                Description (Markdown supporté)
              </label>
              <div className="flex items-center gap-1 bg-muted-bg rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewMarkdown(false)}
                  className={`px-2 py-1 text-xs rounded-md transition cursor-pointer flex items-center gap-1 ${
                    !previewMarkdown
                      ? "bg-card text-card-foreground shadow-xs font-semibold"
                      : "text-muted hover:text-card-foreground"
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  Édition
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMarkdown(true)}
                  className={`px-2 py-1 text-xs rounded-md transition cursor-pointer flex items-center gap-1 ${
                    previewMarkdown
                      ? "bg-card text-card-foreground shadow-xs font-semibold"
                      : "text-muted hover:text-card-foreground"
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  Aperçu
                </button>
              </div>
            </div>

            {!previewMarkdown ? (
              <textarea
                value={descriptionMd}
                onChange={(e) => setDescriptionMd(e.target.value)}
                rows={5}
                placeholder="Rédigez la description avec mise en forme Markdown (# Titre, - listes, **gras**, etc.)..."
                className="w-full bg-muted-bg/30 border border-card-border rounded-xl p-3 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            ) : (
              <div className="w-full min-h-[120px] bg-muted-bg/20 border border-card-border rounded-xl p-4 text-sm prose prose-invert max-w-none text-card-foreground">
                {descriptionMd.trim() ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                  >
                    {descriptionMd}
                  </ReactMarkdown>
                ) : (
                  <p className="text-muted italic">Aucune description saisie.</p>
                )}
              </div>
            )}
          </div>

          {/* Subtasks Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                Sous-tâches (
                {subtasksList.filter((s) => s.isDone).length}/{subtasksList.length})
              </label>
            </div>

            {/* Subtasks Progress Bar */}
            {subtasksList.length > 0 && (
              <div className="w-full h-1.5 bg-muted-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${
                      (subtasksList.filter((s) => s.isDone).length /
                        subtasksList.length) *
                      100
                    }%`,
                  }}
                />
              </div>
            )}

            <div className="space-y-1.5 pt-1">
              {subtasksList.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted-bg/30 hover:bg-muted-bg/60 border border-card-border/50 group transition"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(sub.id, sub.isDone)}
                    className="flex items-center gap-2.5 text-left flex-1 cursor-pointer"
                  >
                    {sub.isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        sub.isDone ? "line-through text-muted" : "text-card-foreground"
                      }`}
                    >
                      {sub.title}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="text-muted hover:text-rose-400 opacity-0 group-hover:opacity-100 p-1 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask Form */}
            <form onSubmit={handleAddSubtask} className="flex gap-2 mt-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Ajouter une sous-tâche..."
                className="flex-1 bg-muted-bg/40 border border-card-border rounded-lg px-3 py-1.5 text-xs text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter
              </button>
            </form>
          </div>

          {/* Comments Section */}
          <div className="space-y-3 pt-2 border-t border-card-border">
            <label className="text-xs font-medium text-muted uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Commentaires ({commentsList.length})
            </label>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Écrire un commentaire..."
                className="flex-1 bg-muted-bg/40 border border-card-border rounded-lg px-3 py-2 text-xs text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition"
              >
                Publier
              </button>
            </form>

            <div className="space-y-2 mt-3">
              {commentsList.map((comm) => (
                <div
                  key={comm.id}
                  className="p-3 rounded-xl bg-muted-bg/40 border border-card-border text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-muted text-[11px]">
                    <span className="font-semibold text-card-foreground">
                      {comm.author?.name || "Membre"}
                    </span>
                    <span>
                      {typeof comm.createdAt === "string"
                        ? new Date(comm.createdAt).toLocaleString("fr-FR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : comm.createdAt.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-card-foreground prose prose-invert text-xs">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSanitize]}
                    >
                      {comm.bodyMd}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-card-border flex items-center justify-end gap-3 bg-muted-bg/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-muted hover:text-card-foreground hover:bg-muted-bg transition cursor-pointer"
          >
            Fermer
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveMainDetails}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-primary hover:bg-primary-hover text-white transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
