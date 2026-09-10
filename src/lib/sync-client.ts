"use client";

import { offlineDb, type DexiePendingMutation, type LocalTask } from "./dexie";

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: Date | null;
  conflicts: string[];
}

type SyncListener = (state: SyncState) => void;

class SyncEngine {
  private listeners: Set<SyncListener> = new Set();
  private state: SyncState = {
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncedAt: null,
    conflicts: [],
  };

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.handleOnlineChange(true));
      window.addEventListener("offline", () => this.handleOnlineChange(false));
      this.refreshPendingCount();
    }
  }

  public subscribe(listener: SyncListener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener({ ...this.state });
    }
  }

  private async handleOnlineChange(online: boolean) {
    this.state.isOnline = online;
    this.notify();
    if (online) {
      await this.syncPending();
    }
  }

  public async refreshPendingCount() {
    if (!offlineDb) return;
    try {
      const count = await offlineDb.pendingMutations.count();
      this.state.pendingCount = count;
      this.notify();
    } catch {
      // IndexedDB might be unavailable in some private windows
    }
  }

  /**
   * Queue a mutation locally into Dexie
   */
  public async queueMutation(
    entity: "task" | "subtask" | "comment",
    action: "create" | "update" | "delete" | "reorder",
    payload: any
  ) {
    if (!offlineDb) return;

    const mutation: DexiePendingMutation = {
      id: crypto.randomUUID(),
      entity,
      action,
      payload,
      timestamp: Date.now(),
      clientUpdatedAt: new Date().toISOString(),
    };

    await offlineDb.pendingMutations.add(mutation);
    await this.refreshPendingCount();

    // If online, try syncing immediately
    if (this.state.isOnline) {
      await this.syncPending();
    }
  }

  /**
   * Replays pending mutations to /api/sync
   */
  public async syncPending(): Promise<void> {
    if (!offlineDb || this.state.isSyncing) return;

    const count = await offlineDb.pendingMutations.count();
    if (count === 0) return;

    this.state.isSyncing = true;
    this.notify();

    try {
      const mutations = await offlineDb.pendingMutations.orderBy("timestamp").toArray();

      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mutations }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.processedIds && Array.isArray(data.processedIds)) {
          await offlineDb.pendingMutations.bulkDelete(data.processedIds);
        }

        if (data.conflicts && data.conflicts.length > 0) {
          this.state.conflicts = [...this.state.conflicts, ...data.conflicts];
        }

        this.state.lastSyncedAt = new Date();
      }
    } catch (err) {
      console.error("Échec de la synchronisation:", err);
    } finally {
      this.state.isSyncing = false;
      await this.refreshPendingCount();
      this.notify();
    }
  }

  public clearConflicts() {
    this.state.conflicts = [];
    this.notify();
  }
}

export const syncEngine = new SyncEngine();
