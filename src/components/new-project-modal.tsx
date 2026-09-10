"use client";

import { useState } from "react";
import { X, FolderPlus } from "lucide-react";
import { createProjectAction } from "@/actions/projects";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (newProjectId: string) => void;
}

const COLOR_OPTIONS = [
  "#6366F1", // Indigo
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#EF4444", // Red
];

export function NewProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
}: NewProjectModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366F1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await createProjectAction({
        name: name.trim(),
        color,
      });

      if (res.success && res.data) {
        setName("");
        onProjectCreated(res.data.id);
        onClose();
      } else {
        setError(res.error || "Impossible de créer le projet");
      }
    } catch (err: any) {
      setError(err.message || "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-card-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-card-border">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base text-card-foreground">
              Nouveau projet
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:bg-muted-bg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted block mb-1.5 uppercase tracking-wider">
              Nom du projet
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Refonte taskflow v2"
              className="w-full bg-muted-bg/50 border border-card-border rounded-xl px-3.5 py-2.5 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-2 uppercase tracking-wider">
              Couleur d&apos;accent
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition cursor-pointer ${
                    color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-card-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-muted hover:text-card-foreground cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-5 py-2 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer le projet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
