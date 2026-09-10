import Dexie, { type Table } from "dexie";

export interface LocalTask {
  id: string;
  projectId: string;
  title: string;
  descriptionMd: string;
  dueDate: string | null;
  dueTime: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: "backlog" | "todo" | "in_progress" | "in_review" | "done";
  position: number;
  assigneeId?: string | null;
  deletedAt?: string | null;
  updatedAt: string;
  isSynced?: boolean;
}

export interface LocalProject {
  id: string;
  name: string;
  color: string;
  ownerId: string;
  isArchived: boolean;
}

export interface DexiePendingMutation {
  id: string;
  entity: "task" | "subtask" | "comment";
  action: "create" | "update" | "delete" | "reorder";
  payload: any;
  timestamp: number;
  clientUpdatedAt: string;
}

export class TaskFlowDexieDB extends Dexie {
  tasks!: Table<LocalTask, string>;
  projects!: Table<LocalProject, string>;
  pendingMutations!: Table<DexiePendingMutation, string>;

  constructor() {
    super("TaskFlowOfflineDB");
    this.version(1).stores({
      tasks: "id, projectId, status, priority, position, deletedAt, updatedAt",
      projects: "id, name, ownerId",
      pendingMutations: "id, entity, action, timestamp",
    });
  }
}

export const offlineDb = typeof window !== "undefined" ? new TaskFlowDexieDB() : null;
