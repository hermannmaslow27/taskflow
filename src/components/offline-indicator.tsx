"use client";

import { useEffect, useState } from "react";
import { syncEngine, type SyncState } from "@/lib/sync-client";
import { WifiOff, RefreshCw, AlertTriangle, CheckCircle2, X } from "lucide-react";

export function OfflineIndicator() {
  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncedAt: null,
    conflicts: [],
  });

  useEffect(() => {
    const unsub = syncEngine.subscribe((state) => {
      setSyncState(state);
    });
    return () => {
      unsub();
    };
  }, []);

  const handleManualSync = () => {
    syncEngine.syncPending();
  };

  const handleDismissConflicts = () => {
    syncEngine.clearConflicts();
  };

  if (syncState.isOnline && syncState.pendingCount === 0 && syncState.conflicts.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-1 z-50">
      {/* Offline Banner */}
      {!syncState.isOnline && (
        <div className="bg-amber-500/90 text-amber-950 px-4 py-2 text-sm font-medium flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-950" />
            <span>
              Mode hors-ligne activé. Vos modifications sont sauvegardées localement et seront synchronisées à la reconnexion.
            </span>
          </div>
          {syncState.pendingCount > 0 && (
            <span className="bg-amber-950/20 px-2 py-0.5 rounded text-xs font-semibold">
              {syncState.pendingCount} action(s) en attente
            </span>
          )}
        </div>
      )}

      {/* Online Syncing / Pending Mutations Banner */}
      {syncState.isOnline && (syncState.pendingCount > 0 || syncState.isSyncing) && (
        <div className="bg-indigo-600/90 text-white px-4 py-2 text-sm font-medium flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${syncState.isSyncing ? "animate-spin" : ""}`} />
            <span>
              {syncState.isSyncing
                ? "Synchronisation des modifications avec le serveur..."
                : `${syncState.pendingCount} modification(s) locale(s) en attente.`}
            </span>
          </div>
          {!syncState.isSyncing && (
            <button
              onClick={handleManualSync}
              className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded text-xs transition cursor-pointer"
            >
              Synchroniser maintenant
            </button>
          )}
        </div>
      )}

      {/* Conflict resolution alerts (Last-Write-Wins notification) */}
      {syncState.conflicts.length > 0 && (
        <div className="bg-rose-500/95 text-white px-4 py-2 text-sm font-medium flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-white shrink-0" />
            <div className="flex flex-col">
              {syncState.conflicts.map((msg, idx) => (
                <span key={idx}>{msg}</span>
              ))}
            </div>
          </div>
          <button
            onClick={handleDismissConflicts}
            className="text-white/80 hover:text-white p-1 cursor-pointer"
            title="Ignorer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
