"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  flexRender,
  type SortingState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  Circle,
  Search,
  Filter,
  Trash2,
} from "lucide-react";
import { updateTaskAction } from "@/actions/tasks";
import { syncEngine } from "@/lib/sync-client";

interface ListViewProps {
  tasks: any[];
  projectId: string;
  onTaskClick: (task: any) => void;
  onTasksChange: () => void;
}

export function ListView({
  tasks,
  projectId,
  onTaskClick,
  onTasksChange,
}: ListViewProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredData = useMemo(() => {
    return tasks.filter((t) => {
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (
        globalFilter.trim() &&
        !t.title.toLowerCase().includes(globalFilter.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [tasks, priorityFilter, statusFilter, globalFilter]);

  const handleToggleDone = async (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = task.status === "done" ? "todo" : "done";

    try {
      if (!navigator.onLine) {
        await syncEngine.queueMutation("task", "update", {
          id: task.id,
          status: nextStatus,
        });
      } else {
        await updateTaskAction({
          id: task.id,
          status: nextStatus,
        });
      }
      onTasksChange();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "select",
        header: "",
        size: 40,
        cell: ({ row }) => {
          const isDone = row.original.status === "done";
          return (
            <button
              onClick={(e) => handleToggleDone(row.original, e)}
              className="text-muted hover:text-primary transition p-1 cursor-pointer"
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </button>
          );
        },
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold text-xs text-muted hover:text-card-foreground cursor-pointer"
          >
            <span>Titre</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => {
          const isDone = row.original.status === "done";
          return (
            <div className="flex flex-col">
              <span
                className={`text-sm font-medium ${
                  isDone ? "line-through text-muted" : "text-card-foreground"
                }`}
              >
                {row.original.title}
              </span>
              {row.original.tags && row.original.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {row.original.tags.map((tag: any) => (
                    <span
                      key={tag.id}
                      className="text-[9px] font-medium px-1.5 py-0.2 rounded-full"
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold text-xs text-muted hover:text-card-foreground cursor-pointer"
          >
            <span>Statut</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <span className="text-xs bg-muted-bg text-muted px-2 py-0.5 rounded-full font-medium capitalize">
              {status.replace("_", " ")}
            </span>
          );
        },
      },
      {
        accessorKey: "priority",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold text-xs text-muted hover:text-card-foreground cursor-pointer"
          >
            <span>Priorité</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => {
          const priority = row.original.priority;
          return (
            <span
              className={`text-xs px-2 py-0.5 rounded font-semibold capitalize ${
                priority === "urgent"
                  ? "bg-rose-500/20 text-rose-400"
                  : priority === "high"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-indigo-500/20 text-indigo-400"
              }`}
            >
              {priority}
            </span>
          );
        },
      },
      {
        accessorKey: "dueDate",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold text-xs text-muted hover:text-card-foreground cursor-pointer"
          >
            <span>Échéance</span>
            <ArrowUpDown className="w-3 h-3" />
          </button>
        ),
        cell: ({ row }) => {
          const due = row.original.dueDate;
          if (!due) return <span className="text-xs text-muted">—</span>;
          return (
            <span className="text-xs text-muted flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(due).toLocaleDateString("fr-FR")}
            </span>
          );
        },
      },
      {
        id: "subtasks",
        header: "Sous-tâches",
        cell: ({ row }) => {
          const total = row.original.subtasksTotal || 0;
          const completed = row.original.subtasksCompleted || 0;
          if (total === 0) return <span className="text-xs text-muted">—</span>;
          return (
            <span className="text-xs text-muted flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              {completed}/{total}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4 w-full">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-card-border p-3 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px] bg-muted-bg/50 border border-card-border rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-muted shrink-0" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Filtrer les tâches..."
            className="w-full text-xs bg-transparent text-card-foreground outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-muted-bg/50 border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-card-foreground cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="backlog">Backlog</option>
            <option value="todo">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="in_review">En révision</option>
            <option value="done">Terminé</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-muted-bg/50 border border-card-border rounded-lg px-2.5 py-1.5 text-xs text-card-foreground cursor-pointer"
          >
            <option value="all">Toutes les priorités</option>
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
      </div>

      {/* TanStack Table Container */}
      <div className="bg-card border border-card-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-card-border bg-muted-bg/40"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-xs font-semibold text-muted"
                      style={{ width: header.getSize() }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onTaskClick(row.original)}
                  className="border-b border-card-border/50 hover:bg-muted-bg/30 transition cursor-pointer group"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}

              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-xs text-muted"
                  >
                    Aucune tâche correspondant aux filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
