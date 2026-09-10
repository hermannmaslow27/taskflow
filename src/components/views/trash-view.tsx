"use client";

import { useState } from "react";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Calendar,
  XCircle,
} from "lucide-react";
import { restoreTaskAction, permanentDeleteTaskAction } from "@/actions/tasks";

interface TrashViewProps {
  deletedTasks: any[];
  projectId: string;
  onTasksChange: () => void;
}

export function TrashView({
  deletedTasks,
  projectId,
  onTasksChange,
}: TrashViewProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRestore = async (taskId: string) => {
    setLoadingId(taskId);
    try {
      await restoreTaskAction(taskId);
      onTasksChange();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const handlePermanentDelete = async (taskId: string) => {
    if (
      confirm(
        "Cette action est irréversible. Voulez-vous supprimer définitivement cette tâche ?"
      )
    ) {
      setLoadingId(taskId);
      try {
        await permanentDeleteTaskAction(taskId);
        onTasksChange();
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingId(null);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Purge Notice Banner */}
      <div className="bg-muted-bg/50 border border-card-border p-4 rounded-xl flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Les éléments placés dans la corbeille sont automatiquement et définitivement purgés après 30 jours par le job Inngest.
          </span>
        </div>
        <span className="font-semibold text-card-foreground">
          {deletedTasks.length} élément(s)
        </span>
      </div>

      {/* Deleted Tasks List */}
      <div className="bg-card border border-card-border rounded-xl shadow-xs divide-y divide-card-border/60 overflow-hidden">
        {deletedTasks.map((task) => (
          <div
            key={task.id}
            className="p-4 flex items-center justify-between hover:bg-muted-bg/30 transition group"
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-card-foreground line-through opacity-80">
                {task.title}
              </span>
              <div className="flex items-center gap-3 text-xs text-muted">
                {task.deletedAt && (
                  <span className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3 h-3" />
                    Supprimé le{" "}
                    {new Date(task.deletedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
                <span className="bg-muted-bg px-2 py-0.5 rounded text-[10px] uppercase font-medium">
                  {task.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRestore(task.id)}
                disabled={loadingId === task.id}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurer
              </button>

              <button
                onClick={() => handlePermanentDelete(task.id)}
                disabled={loadingId === task.id}
                className="p-1.5 rounded-lg text-muted hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer disabled:opacity-50"
                title="Supprimer définitivement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {deletedTasks.length === 0 && (
          <div className="py-16 text-center text-xs text-muted">
            La corbeille est vide.
          </div>
        )}
      </div>
    </div>
  );
}
