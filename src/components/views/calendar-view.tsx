"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
} from "lucide-react";
import { createTaskAction } from "@/actions/tasks";
import { syncEngine } from "@/lib/sync-client";

interface CalendarViewProps {
  tasks: any[];
  projectId: string;
  onTaskClick: (task: any) => void;
  onTasksChange: () => void;
}

const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function CalendarView({
  tasks,
  projectId,
  onTaskClick,
  onTasksChange,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [quickTitle, setQuickTitle] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Compute days in month and starting offset
  const { daysInMonth, startOffset } = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get day of week (0=Sunday ... 6=Saturday) -> shift to 0=Monday
    const dayOfWeek = (firstDay.getDay() + 6) % 7;

    return {
      daysInMonth: lastDay.getDate(),
      startOffset: dayOfWeek,
    };
  }, [year, month]);

  // Group tasks by day number in current month
  const tasksByDay = useMemo(() => {
    const map: Record<number, any[]> = {};
    for (const t of tasks) {
      if (!t.dueDate) continue;
      const d = new Date(t.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day]!.push(t);
      }
    }
    return map;
  }, [tasks, year, month]);

  const handleQuickCreateOnDay = async (day: number) => {
    if (!quickTitle.trim()) return;

    const dueDate = new Date(year, month, day, 12, 0, 0);

    try {
      const payload = {
        projectId,
        title: quickTitle.trim(),
        dueDate: dueDate.toISOString(),
        status: "todo" as const,
        priority: "medium" as const,
      };

      if (!navigator.onLine) {
        await syncEngine.queueMutation("task", "create", payload);
      } else {
        await createTaskAction(payload);
      }

      setQuickTitle("");
      setSelectedDay(null);
      onTasksChange();
    } catch (err) {
      console.error(err);
    }
  };

  const today = new Date();
  const isCurrentMonthToday =
    today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="bg-card border border-card-border rounded-2xl p-5 shadow-xs space-y-4">
      {/* Calendar Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-card-foreground">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-muted-bg hover:bg-muted-bg/80 text-muted hover:text-card-foreground transition cursor-pointer"
          >
            Aujourd&apos;hui
          </button>
        </div>

        <div className="flex items-center gap-1 bg-muted-bg/50 border border-card-border rounded-lg p-1">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-md text-muted hover:text-card-foreground hover:bg-card transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-md text-muted hover:text-card-foreground hover:bg-card transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1 border-b border-card-border pb-2 text-center text-xs font-semibold text-muted">
        {WEEKDAYS.map((wd) => (
          <div key={wd}>{wd}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 min-h-[500px]">
        {/* Leading blank slots */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div
            key={`offset-${i}`}
            className="rounded-xl bg-muted-bg/10 border border-transparent p-2 opacity-30"
          />
        ))}

        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayTasks = tasksByDay[dayNum] || [];
          const isToday = isCurrentMonthToday && today.getDate() === dayNum;
          const isSelected = selectedDay === dayNum;

          return (
            <div
              key={`day-${dayNum}`}
              onClick={() => setSelectedDay(dayNum)}
              className={`min-h-[100px] rounded-xl border p-2 flex flex-col transition cursor-pointer group relative ${
                isToday
                  ? "border-primary/60 bg-primary/5"
                  : isSelected
                  ? "border-primary bg-muted-bg/40"
                  : "border-card-border/60 bg-muted-bg/20 hover:border-card-border hover:bg-muted-bg/30"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? "bg-primary text-white"
                      : "text-card-foreground group-hover:text-primary"
                  }`}
                >
                  {dayNum}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDay(dayNum);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-muted hover:text-primary transition p-0.5"
                  title="Ajouter une tâche ce jour"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Day Tasks Badges */}
              <div className="space-y-1 overflow-y-auto max-h-[80px]">
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick(t);
                    }}
                    className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-card border border-card-border/80 hover:border-primary/50 text-card-foreground truncate shadow-2xs transition"
                  >
                    {t.title}
                  </div>
                ))}
              </div>

              {/* Inline quick creation popup on click */}
              {isSelected && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-2 left-2 right-2 z-10 p-2 bg-card border border-card-border rounded-lg shadow-lg animate-fade-in"
                >
                  <input
                    type="text"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleQuickCreateOnDay(dayNum);
                      if (e.key === "Escape") setSelectedDay(null);
                    }}
                    placeholder="Tâche pour ce jour..."
                    className="w-full text-xs bg-muted-bg/50 border border-card-border rounded px-2 py-1 outline-none text-card-foreground mb-1"
                    autoFocus
                  />
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="px-2 py-0.5 text-[10px] text-muted hover:text-card-foreground cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleQuickCreateOnDay(dayNum)}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-primary text-white rounded cursor-pointer"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
