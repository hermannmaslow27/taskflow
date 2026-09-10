"use client";

import { useRef, useState, useCallback } from "react";
import {
  Upload,
  X,
  File,
  Image as ImageIcon,
  FileText,
  Film,
  Archive,
  Loader2,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { addAttachmentAction, deleteAttachmentAction } from "@/actions/attachments";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface AttachmentItem {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: Date | string;
  uploadedById: string;
  uploadedBy?: { name?: string | null; email?: string | null } | null;
}

interface FileUploadZoneProps {
  taskId?: string;
  projectId?: string;
  existingAttachments?: AttachmentItem[];
  currentUserId: string;
  onAttachmentsChange?: () => void;
}

function getMimeIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
  if (mimeType.startsWith("video/")) return <Film className="w-4 h-4" />;
  if (mimeType.includes("pdf") || mimeType.includes("text")) return <FileText className="w-4 h-4" />;
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar")) return <Archive className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function FileUploadZone({
  taskId,
  projectId,
  existingAttachments = [],
  currentUserId,
  onAttachmentsChange,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]); // filenames being uploaded
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setUploading((prev) => [...prev, file.name]);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "folder",
          taskId ? `taskflow/tasks/${taskId}` : `taskflow/projects/${projectId}`
        );

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const { error: msg } = await uploadRes.json();
          throw new Error(msg || "Upload échoué");
        }

        const { url } = await uploadRes.json();

        const saveRes = await addAttachmentAction({
          taskId,
          projectId,
          url,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
        });

        if (!saveRes.success) throw new Error(saveRes.error);
        onAttachmentsChange?.();
      } catch (err: any) {
        setError(err.message || "Erreur lors de l'upload");
      } finally {
        setUploading((prev) => prev.filter((n) => n !== file.name));
      }
    },
    [taskId, projectId, onAttachmentsChange]
  );

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await deleteAttachmentAction(id);
    setDeletingId(null);
    if (!res.success) {
      setError(res.error || "Erreur de suppression");
    } else {
      onAttachmentsChange?.();
    }
  };

  const isUploading = uploading.length > 0;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-card-border hover:border-primary/50 hover:bg-muted-bg/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
        />

        {isUploading ? (
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        ) : (
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition ${
            isDragging ? "bg-primary/15 text-primary" : "bg-muted-bg text-muted group-hover:bg-primary/10 group-hover:text-primary"
          }`}>
            <Upload className="w-5 h-5" />
          </div>
        )}

        <div className="text-center">
          {isUploading ? (
            <p className="text-sm font-medium text-primary">
              Upload en cours : {uploading.join(", ")}
            </p>
          ) : (
            <>
              <p className="text-sm font-semibold text-card-foreground">
                Glissez vos fichiers ici
              </p>
              <p className="text-xs text-muted mt-0.5">
                ou cliquez pour sélectionner · Max 10 Mo par fichier
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20">
          <X className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Existing attachments */}
      {existingAttachments.length > 0 && (
        <ul className="space-y-2">
          {existingAttachments.map((att) => (
            <li
              key={att.id}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-card-border bg-muted-bg/40 group/att hover:bg-muted-bg transition"
            >
              {/* Icon */}
              <div className="w-8 h-8 rounded-lg bg-card border border-card-border flex items-center justify-center text-muted shrink-0">
                {att.mimeType.startsWith("image/") ? (
                  <img
                    src={att.url}
                    alt={att.fileName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  getMimeIcon(att.mimeType)
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-card-foreground truncate">
                  {att.fileName}
                </p>
                <p className="text-[10px] text-muted">
                  {formatBytes(att.size)} ·{" "}
                  {formatDistanceToNow(new Date(att.createdAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                  {att.uploadedBy && ` · ${att.uploadedBy.name || att.uploadedBy.email}`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition"
                  title="Ouvrir"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                {att.uploadedById === currentUserId && (
                  <button
                    onClick={() => handleDelete(att.id)}
                    disabled={deletingId === att.id}
                    className="p-1.5 rounded-lg text-muted hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Supprimer"
                  >
                    {deletingId === att.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {existingAttachments.length === 0 && !isUploading && (
        <p className="text-center text-xs text-muted py-2">
          Aucun fichier joint pour le moment.
        </p>
      )}
    </div>
  );
}
