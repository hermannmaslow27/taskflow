"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  FolderOpen,
  Loader2,
  Users,
  FileText,
  Settings,
  UserPlus,
  Crown,
  Edit3,
  Eye,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { FileUploadZone } from "./file-upload-zone";
import { getAttachmentsAction } from "@/actions/attachments";
import {
  getProjectMembersAction,
  updateProjectMemberRoleAction,
  removeProjectMemberAction,
} from "@/actions/members";
import { useConfirm } from "./dialogs";

interface ProjectMember {
  userId: string;
  role: "owner" | "editor" | "viewer";
  invitedAt: Date | string;
  acceptedAt: Date | string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    color?: string;
  } | null;
  currentUserId: string;
  onMembersChanged?: () => void;
  onInviteClick?: () => void;
}

const ROLE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  owner: {
    label: "Propriétaire",
    icon: <Crown className="w-3 h-3" />,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  editor: {
    label: "Éditeur",
    icon: <Edit3 className="w-3 h-3" />,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  viewer: {
    label: "Lecteur",
    icon: <Eye className="w-3 h-3" />,
    color: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  },
};

function RoleSelector({
  currentRole,
  onChange,
  disabled,
}: {
  currentRole: "owner" | "editor" | "viewer";
  onChange: (role: "owner" | "editor" | "viewer") => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const info = ROLE_LABELS[currentRole];

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-80"
        } ${info!.color}`}
      >
        {info!.icon}
        {info!.label}
        {!disabled && <ChevronDown className="w-3 h-3 opacity-60" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-card-border rounded-xl shadow-2xl z-20 py-1 overflow-hidden">
            {(["owner", "editor", "viewer"] as const).map((role) => {
              const ri = ROLE_LABELS[role]!;
              return (
                <button
                  key={role}
                  onClick={() => {
                    onChange(role);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium hover:bg-muted-bg transition cursor-pointer ${
                    role === currentRole ? "opacity-60" : ""
                  }`}
                >
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${ri.color}`}>
                    {ri.icon}
                    {ri.label}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function ProjectSettingsModal({
  isOpen,
  onClose,
  project,
  currentUserId,
  onMembersChanged,
  onInviteClick,
}: ProjectSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"members" | "files">("members");
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { confirm, ConfirmDialog } = useConfirm();

  const fetchMembers = useCallback(async () => {
    if (!project) return;
    setMembersLoading(true);
    try {
      const res = await getProjectMembersAction(project.id);
      if (res.success && res.data) setMembers(res.data as ProjectMember[]);
    } finally {
      setMembersLoading(false);
    }
  }, [project]);

  const fetchAttachments = useCallback(async () => {
    if (!project) return;
    setAttachmentsLoading(true);
    try {
      const res = await getAttachmentsAction({ projectId: project.id });
      if (res.success && res.data) setAttachments(res.data);
    } finally {
      setAttachmentsLoading(false);
    }
  }, [project]);

  useEffect(() => {
    if (isOpen && project) {
      fetchMembers();
      fetchAttachments();
    }
  }, [isOpen, project?.id]);

  if (!isOpen || !project) return null;

  const currentUserMember = members.find((m) => m.userId === currentUserId);
  const isOwner = currentUserMember?.role === "owner";

  const handleRoleChange = async (memberUserId: string, newRole: "owner" | "editor" | "viewer") => {
    setActionError("");
    setActionLoading(memberUserId);
    try {
      const res = await updateProjectMemberRoleAction({
        projectId: project.id,
        memberUserId,
        newRole,
      });
      if (res.success) {
        await fetchMembers();
        onMembersChanged?.();
      } else {
        setActionError(res.error || "Erreur lors du changement de rôle");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (member: ProjectMember) => {
    const isSelf = member.userId === currentUserId;
    const confirmed = await confirm({
      title: isSelf ? "Quitter le projet ?" : `Retirer ${member.user.name || member.user.email} ?`,
      message: isSelf
        ? "Vous perdrez l'accès à ce projet. Cette action est irréversible."
        : `${member.user.name || member.user.email} perdra l'accès à ce projet.`,
      confirmLabel: isSelf ? "Quitter" : "Retirer",
      variant: "danger",
    });
    if (!confirmed) return;

    setActionError("");
    setActionLoading(member.userId);
    try {
      const res = await removeProjectMemberAction({
        projectId: project.id,
        memberUserId: member.userId,
      });
      if (res.success) {
        await fetchMembers();
        onMembersChanged?.();
        if (isSelf) onClose();
      } else {
        setActionError(res.error || "Erreur lors du retrait");
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Paramètres du projet ${project.name}`}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-xl rounded-2xl border border-card-border overflow-hidden animate-fade-in"
        style={{
          background:
            "linear-gradient(135deg, var(--card) 0%, color-mix(in srgb, var(--card) 95%, var(--primary)) 100%)",
          boxShadow:
            "0 25px 60px -10px rgba(0,0,0,0.5), 0 0 0 1px var(--card-border), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Top accent */}
        <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />

        {/* Header */}
        <div className="px-6 pt-5 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: project.color || "#6366F1" }}
            >
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-card-foreground leading-none">
                Paramètres du projet
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

        {/* Tabs */}
        <div className="flex gap-1 px-6 mt-4 border-b border-card-border">
          <button
            onClick={() => setActiveTab("members")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition cursor-pointer -mb-px ${
              activeTab === "members"
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-card-foreground"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Membres
            <span className="ml-1 bg-muted-bg text-muted text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {members.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition cursor-pointer -mb-px ${
              activeTab === "files"
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-card-foreground"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Documents
            {attachments.length > 0 && (
              <span className="ml-1 bg-muted-bg text-muted text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {attachments.length}
              </span>
            )}
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {actionError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
              {actionError}
            </div>
          )}

          {/* MEMBERS TAB */}
          {activeTab === "members" && (
            <div className="space-y-3">
              {membersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : (
                <>
                  {members.map((member) => {
                    const isSelf = member.userId === currentUserId;
                    const isLoading = actionLoading === member.userId;
                    const canManage = isOwner && !isSelf;
                    const displayName = member.user.name || member.user.email;

                    return (
                      <div
                        key={member.userId}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                          isLoading
                            ? "opacity-60 bg-muted-bg/40 border-card-border"
                            : "bg-muted-bg/30 border-card-border/60 hover:border-card-border"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          {member.user.image ? (
                            <img
                              src={member.user.image}
                              alt={displayName || ""}
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-card-border"
                            />
                          ) : (
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                              style={{ backgroundColor: project.color || "#6366F1" }}
                            >
                              {(displayName || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          {member.role === "owner" && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                              <Crown className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-card-foreground truncate">
                              {displayName}
                            </span>
                            {isSelf && (
                              <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded font-semibold">
                                Vous
                              </span>
                            )}
                          </div>
                          {member.user.name && (
                            <p className="text-[11px] text-muted truncate">{member.user.email}</p>
                          )}
                        </div>

                        {/* Role selector */}
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        ) : (
                          <RoleSelector
                            currentRole={member.role}
                            onChange={(newRole) => handleRoleChange(member.userId, newRole)}
                            disabled={!canManage}
                          />
                        )}

                        {/* Remove button */}
                        {(canManage || isSelf) && !isLoading && (
                          <button
                            onClick={() => handleRemoveMember(member)}
                            title={isSelf ? "Quitter le projet" : "Retirer ce membre"}
                            className="p-1.5 rounded-lg text-muted hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {isOwner && (
                    <button
                      onClick={() => {
                        onClose();
                        onInviteClick?.();
                      }}
                      className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-primary/40 text-xs font-semibold text-primary hover:bg-primary/5 transition cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Inviter un collaborateur
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* FILES TAB */}
          {activeTab === "files" && (
            attachmentsLoading ? (
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
            )
          )}
        </div>
      </div>

      <ConfirmDialog />
    </div>
  );
}
