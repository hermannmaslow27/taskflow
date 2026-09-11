"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
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
  GripVertical,
} from "lucide-react";
import { reorderTaskAction, createTaskAction } from "@/actions/tasks";
import { getPositionAtIndex } from "@/lib/fractional-indexing";
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
    opacity: isDragging ? 0.35 : 1,
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
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-card border border-card-border rounded-xl p-3.5 shadow-sm hover:border-primary/50 transition duration-150 flex flex-col gap-2.5 cursor-grab active:cursor-grabbing select-none group ${
        isOverlay ? "shadow-2xl ring-2 ring-primary rotate-1 cursor-grabbing z-50 bg-card" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div
            className="text-muted/40 group-hover:text-muted hover:text-primary transition p-0.5 shrink-0"
            title="Glisser pour réordonner"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-sm text-card-foreground leading-snug line-clamp-2">
            {task.title}
          </span>
        </div>
        <div className="shrink-0">
          {getPriorityBadge(task.priority)}
        </div>
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

interface KanbanColumnProps {
  column: { id: TaskDetailData["status"]; title: string; color: string };
  tasks: any[];
  onTaskClick: (task: any) => void;
  quickCreateColumn: string | null;
  setQuickCreateColumn: (col: string | null) => void;
  quickTitle: string;
  setQuickTitle: (val: string) => void;
  handleQuickCreate: (colId: TaskDetailData["status"]) => void;
}

function KanbanColumn({
  column,
  tasks,
  onTaskClick,
  quickCreateColumn,
  setQuickCreateColumn,
  quickTitle,
  setQuickTitle,
  handleQuickCreate,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      columnId: column.id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-80 shrink-0 bg-muted-bg/30 border rounded-2xl p-3 flex flex-col max-h-full transition-colors ${
        isOver ? "border-primary/60 bg-primary/5 ring-1 ring-primary/30" : "border-card-border/80"
      }`}
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
            {tasks.length}
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
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5 min-h-[160px]">
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}

          {tasks.length === 0 && (
            <div className="h-28 border border-dashed border-card-border/70 rounded-xl flex items-center justify-center text-xs text-muted/70">
              Déposer une tâche ici
            </div>
          )}
        </div>
      </SortableContext>
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
  const [localTasks, setLocalTasks] = useState<any[]>(tasks);
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [quickCreateColumn, setQuickCreateColumn] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState("");

  // Sync external tasks changes
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = localTasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const currentTask = localTasks.find((t) => t.id === activeId);
    if (!currentTask) return;

    let targetStatus: TaskDetailData["status"] = currentTask.status;
    let targetPosition = currentTask.position;

    const isOverColumn = COLUMNS.some((c) => c.id === overId);

    if (isOverColumn) {
      targetStatus = overId as TaskDetailData["status"];
      const columnTasks = localTasks
        .filter((t) => t.status === targetStatus && t.id !== activeId)
        .sort((a, b) => a.position - b.position);

      targetPosition = getPositionAtIndex(columnTasks, columnTasks.length);
    } else {
      const overTask = localTasks.find((t) => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status;
        const columnTasks = localTasks
          .filter((t) => t.status === targetStatus && t.id !== activeId)
          .sort((a, b) => a.position - b.position);

        const overIndex = columnTasks.findIndex((t) => t.id === overId);
        targetPosition = getPositionAtIndex(columnTasks, overIndex >= 0 ? overIndex : columnTasks.length);
      }
    }

    // No change detected
    if (currentTask.status === targetStatus && Math.abs(currentTask.position - targetPosition) < 0.001) {
      return;
    }

    // Optimistically update local state immediately
    const previousTasks = [...localTasks];
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.id === activeId
          ? { ...t, status: targetStatus, position: targetPosition }
          : t
      )
    );

    try {
      if (!navigator.onLine) {
        await syncEngine.queueMutation("task", "reorder", {
          taskId: activeId,
          projectId,
          targetStatus,
          newPosition: targetPosition,
        });
      } else {
        const res = await reorderTaskAction({
          taskId: activeId,
          projectId,
          targetStatus,
          newPosition: targetPosition,
        });
        if (!res.success) {
          throw new Error(res.error);
        }
      }
      onTasksChange();
    } catch (err) {
      console.error("Erreur réordonnancement:", err);
      // Rollback on failure
      setLocalTasks(previousTasks);
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
          const columnTasks = localTasks
            .filter((t) => t.status === column.id)
            .sort((a, b) => a.position - b.position);

          return (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
              onTaskClick={onTaskClick}
              quickCreateColumn={quickCreateColumn}
              setQuickCreateColumn={setQuickCreateColumn}
              quickTitle={quickTitle}
              setQuickTitle={setQuickTitle}
              handleQuickCreate={handleQuickCreate}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeTask ? (
          <KanbanCard task={activeTask} onClick={() => {}} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
