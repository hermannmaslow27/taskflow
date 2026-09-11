"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  ListTodo,
  Calendar,
  Trash2,
  Moon,
  Sun,
  Laptop,
  PlusCircle,
  CheckSquare,
  FolderPlus,
  Search,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onNewTaskClick?: () => void;
  onNewProjectClick?: () => void;
  onSelectView?: (view: "kanban" | "list" | "calendar" | "trash") => void;
  projects?: Array<{ id: string; name: string }>;
  onSelectProject?: (projectId: string) => void;
}

export function CommandPalette({
  isOpen: externalOpen,
  onClose,
  onOpenChange,
  onNewTaskClick,
  onNewProjectClick,
  onSelectView,
  projects = [],
  onSelectProject,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    if (externalOpen !== undefined) {
      setInternalOpen(externalOpen);
    }
  }, [externalOpen]);

  const setOpen = (val: boolean | ((prev: boolean) => boolean)) => {
    setInternalOpen((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      onOpenChange?.(next);
      if (!next && onClose) onClose();
      return next;
    });
  };

  const open = externalOpen !== undefined ? externalOpen : internalOpen;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-24 px-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-card border border-card-border rounded-xl shadow-2xl overflow-hidden animate-fade-in text-card-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          label="Palette de commandes"
          className="w-full"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              setOpen(false);
            }
          }}
        >
          <div className="flex items-center border-b border-card-border px-3">
            <Search className="w-4 h-4 text-muted shrink-0 mr-2" />
            <Command.Input
              placeholder="Rechercher une action, une tâche, un projet... (Échap pour fermer)"
              className="w-full py-3.5 bg-transparent text-sm outline-none placeholder:text-muted"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[11px] font-medium px-2 py-0.5 rounded bg-muted-bg text-muted hover:text-card-foreground border border-card-border transition shrink-0 ml-2 cursor-pointer"
              title="Fermer (Échap)"
            >
              Échap
            </button>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 text-sm">
            <Command.Empty className="py-6 text-center text-xs text-muted">
              Aucun résultat trouvé.
            </Command.Empty>

            <Command.Group heading="Actions rapides" className="text-xs font-semibold text-muted px-2 py-1">
              <Command.Item
                onSelect={() => {
                  setOpen(false);
                  onNewTaskClick?.();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition"
              >
                <PlusCircle className="w-4 h-4 text-primary" />
                <span>Créer une nouvelle tâche</span>
                <span className="ml-auto text-xs text-muted">N</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setOpen(false);
                  onNewProjectClick?.();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition"
              >
                <FolderPlus className="w-4 h-4 text-indigo-400" />
                <span>Créer un nouveau projet</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Vues" className="text-xs font-semibold text-muted px-2 py-1 mt-2">
              <Command.Item
                onSelect={() => {
                  setOpen(false);
                  onSelectView?.("kanban");
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Vue Kanban</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setOpen(false);
                  onSelectView?.("list");
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition"
              >
                <ListTodo className="w-4 h-4" />
                <span>Vue Liste</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setOpen(false);
                  onSelectView?.("calendar");
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition"
              >
                <Calendar className="w-4 h-4" />
                <span>Vue Calendrier</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setOpen(false);
                  onSelectView?.("trash");
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Corbeille</span>
              </Command.Item>
            </Command.Group>

            {projects.length > 0 && (
              <Command.Group heading="Projets" className="text-xs font-semibold text-muted px-2 py-1 mt-2">
                {projects.map((proj) => (
                  <Command.Item
                    key={proj.id}
                    onSelect={() => {
                      setOpen(false);
                      onSelectProject?.(proj.id);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition"
                  >
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                    <span>{proj.name}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Thème" className="text-xs font-semibold text-muted px-2 py-1 mt-2">
              <Command.Item
                onSelect={() => {
                  setTheme("light");
                  setOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition"
              >
                <Sun className="w-4 h-4" />
                <span>Mode Clair</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setTheme("dark");
                  setOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition"
              >
                <Moon className="w-4 h-4" />
                <span>Mode Sombre</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setTheme("system");
                  setOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground transition"
              >
                <Laptop className="w-4 h-4" />
                <span>Système</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="border-t border-card-border px-3 py-2 flex items-center justify-between text-xs text-muted bg-muted-bg/30">
            <span>Navigation: ↑ ↓ | Valider: Entrée</span>
            <span>Fermer: Échap</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
