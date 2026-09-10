"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  MoreVertical,
  Layers,
  GripVertical,
} from "lucide-react";
import { reorderTaskAction, createTaskAction } from "@/actions/tasks";
import { calculatePosition } from "@/lib/fractional-indexing";
import { syncEngine } from "@/lib/sync-client";
import type { TaskDetailData } from "../task-detail-modal";

const COLUMNS: { id: TaskDetailData["status"]; title: string; color: string }[] = [
  { id: "backlog", title: "Backlog", color: "#64748B" },
  { id: "todo", title: "À faire", color: "#3B82F6" },
  { id: "in_progress", title: "En cours", color: "#EAB308" },
  { id: "in_review", title: "En révision", color: "#A855F7" },
  { id: "done", title: "Terminé", color: "#10B981" },
];

interface KanbanCardProps {
  task: any;
  onClick: () => void;
  isOverlay?: boolean;
}

function KanbanCard({ task, onClick, isOverlay = false }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <span className="bg-rose-500/20 text-rose-400 text-[10px] font-semibold px-2 py-0.5 rounded">Urgent</span>;
      case "high":
        return <span className="bg-amber-500/20 text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded">Haute</span>;
      case "low":
        return <span className="bg-slate-500/20 text-slate-400 text-[10px] font-semibold px-2 py-0.5 rounded">Basse</span>;
      default:
        return <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-semibold px-2 py-0.5 rounded">Moyenne</span>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border border-card-border rounded-xl p-3.5 shadow-sm hover:border-primary/50 transition duration-150 flex flex-col gap-2.5 cursor-pointer group ${
        isOverlay ? "shadow-2xl ring-2 ring-primary rotate-1" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="text-muted/40 group-hover:text-muted hover:text-primary transition p-0.5 cursor-grab active:cursor-grabbing"
            title="Glisser pour réordonner"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-sm text-card-foreground leading-snug line-clamp-2">
            {task.title}
          </span>
        </div>
        {getPriorityBadge(task.priority)}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag: any) => (
            <span
              key={tag.id}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                border: `1px solid ${tag.color}40`,
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Meta info footer */}
      <div className="flex items-center justify-between text-xs text-muted pt-1 border-t border-card-border/60">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div className="flex items-center gap-1 text-[11px]">
              <Calendar className="w-3 h-3 text-muted" />
              <span>
                {new Date(task.dueDate).toLocaleDateString("fr-FR", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}

          {task.subtasksTotal > 0 && (
            <div className="flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>
                {task.subtasksCompleted}/{task.subtasksTotal}
              </span>
            </div>
          )}
        </div>

        {task.assignee?.name && (
          <div
            className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center"
            title={task.assignee.name}
          >
            {task.assignee.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}

interface KanbanViewProps {
  tasks: any[];
  projectId: string;
  onTaskClick: (task: any) => void;
  onTasksChange: () => void;
}

export function KanbanView({
  tasks,
  projectId,
  onTaskClick,
  onTasksChange,
}: KanbanViewProps) {
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [quickCreateColumn, setQuickCreateColumn] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const currentTask = tasks.find((t) => t.id === activeId);
    if (!currentTask) return;

    // Check if dropped onto a column header or an item
    let targetStatus: TaskDetailData["status"] = currentTask.status;
    let targetPosition = currentTask.position;

    const isOverColumn = COLUMNS.some((c) => c.id === overId);

    if (isOverColumn) {
      targetStatus = overId as TaskDetailData["status"];
      const columnTasks = tasks.filter((t) => t.status === targetStatus && t.id !== activeId);
      const lastTask = columnTasks[columnTasks.length - 1];
      targetPosition = lastTask ? lastTask.position + 1000 : 1000;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status;
        const columnTasks = tasks
          .filter((t) => t.status === targetStatus && t.id !== activeId)
          .sort((a, b) => a.position - b.position);

        const overIndex = columnTasks.findIndex((t) => t.id === overId);
        const prevTask = columnTasks[overIndex - 1];
        const nextTask = columnTasks[overIndex];

        targetPosition = calculatePosition(prevTask?.position, nextTask?.position);
      }
    }

    // Apply mutation optimistically
    try {
      if (!navigator.onLine) {
        await syncEngine.queueMutation("task", "reorder", {
          taskId: activeId,
          projectId,
          targetStatus,
          newPosition: targetPosition,
        });
      } else {
        await reorderTaskAction({
          taskId: activeId,
          projectId,
          targetStatus,
          newPosition: targetPosition,
        });
      }
      onTasksChange();
    } catch (err) {
      console.error("Erreur réordonnancement:", err);
      onTasksChange();
    }
  };

  const handleQuickCreate = async (columnId: TaskDetailData["status"]) => {
    if (!quickTitle.trim()) return;

    try {
      const payload = {
        projectId,
        title: quickTitle.trim(),
        status: columnId,
        priority: "medium" as const,
      };

      if (!navigator.onLine) {
        await syncEngine.queueMutation("task", "create", payload);
      } else {
        await createTaskAction(payload);
      }

      setQuickTitle("");
      setQuickCreateColumn(null);
      onTasksChange();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 w-full min-h-[calc(100vh-200px)]">
        {COLUMNS.map((column) => {
          const columnTasks = tasks
            .filter((t) => t.status === column.id)
            .sort((a, b) => a.position - b.position);

          return (
            <div
              key={column.id}
              className="w-80 shrink-0 bg-muted-bg/30 border border-card-border/80 rounded-2xl p-3 flex flex-col max-h-full"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 px-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <span className="font-semibold text-sm text-card-foreground">
                    {column.title}
                  </span>
                  <span className="text-xs bg-muted-bg text-muted px-2 py-0.5 rounded-full font-medium">
                    {columnTasks.length}
                  </span>
                </div>

                <button
                  onClick={() =>
                    setQuickCreateColumn(quickCreateColumn === column.id ? null : column.id)
                  }
                  className="p-1 rounded-md text-muted hover:text-card-foreground hover:bg-muted-bg cursor-pointer transition"
                  title="Ajouter une tâche"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Add Form */}
              {quickCreateColumn === column.id && (
                <div className="mb-3 p-2 bg-card border border-card-border rounded-xl shadow-sm">
                  <input
                    type="text"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleQuickCreate(column.id);
                      if (e.key === "Escape") setQuickCreateColumn(null);
                    }}
                    placeholder="Titre de la tâche..."
                    className="w-full text-xs bg-transparent text-card-foreground focus:outline-none py-1"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-card-border">
                    <button
                      onClick={() => setQuickCreateColumn(null)}
                      className="px-2 py-1 text-xs text-muted hover:text-card-foreground cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleQuickCreate(column.id)}
                      className="px-3 py-1 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded-md cursor-pointer"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              )}

              {/* Tasks List Drop Area */}
              <SortableContext
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5 min-h-[150px]">
                  {columnTasks.map((task) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      onClick={() => onTaskClick(task)}
                    />
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="h-24 border border-dashed border-card-border rounded-xl flex items-center justify-center text-xs text-muted">
                      Aucune tâche
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <KanbanCard task={activeTask} onClick={() => {}} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
