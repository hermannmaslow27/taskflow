"use client";

import { useState, useEffect } from "react";
import { X, FolderOpen, Loader2, Sparkles } from "lucide-react";
import { FileUploadZone } from "./file-upload-zone";
import { getAttachmentsAction } from "@/actions/attachments";

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    color?: string;
  } | null;
  currentUserId: string;
}

export function ProjectSettingsModal({
  isOpen,
  onClose,
  project,
  currentUserId,
}: ProjectSettingsModalProps) {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAttachments = async () => {
    if (!project) return;
    setLoading(true);
    try {
      const res = await getAttachmentsAction({ projectId: project.id });
      if (res.success && res.data) setAttachments(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && project) fetchAttachments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, project?.id]);

  if (!isOpen || !project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Documents du projet ${project.name}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl rounded-2xl border border-card-border overflow-hidden animate-fade-in"
        style={{
          background:
            "linear-gradient(135deg, var(--card) 0%, color-mix(in srgb, var(--card) 95%, var(--primary)) 100%)",
          boxShadow:
            "0 25px 60px -10px rgba(0,0,0,0.5), 0 0 0 1px var(--card-border), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Top accent bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-card-border">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: project.color || "#6366F1" }}
            >
              <FolderOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-card-foreground leading-none">
                Documents du projet
              </h2>
              <p className="text-[11px] text-muted mt-0.5">{project.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-card-foreground hover:bg-muted-bg transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            <FileUploadZone
              projectId={project.id}
              existingAttachments={attachments}
              currentUserId={currentUserId}
              onAttachmentsChange={fetchAttachments}
            />
          )}
        </div>
      </div>
    </div>
  );
}
