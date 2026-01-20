"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface OfflineManagerProps {
  isOnline: boolean;
  pendingChanges: number;
  lastSyncTime: Date | null;
  onSync: () => void;
  onClearCache: () => void;
}

export function OfflineManager({
  isOnline: initialOnline,
  pendingChanges,
  lastSyncTime,
  onSync,
  onClearCache,
}: OfflineManagerProps) {
  const [isOnline, setIsOnline] = useState(initialOnline);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");

  useEffect(() => {
    setIsOnline(initialOnline);
  }, [initialOnline]);

  const handleSync = async () => {
    if (!isOnline || syncing) return;
    setSyncing(true);
    setSyncStatus("syncing");

    try {
      await onSync();
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 2000);
    } catch {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 2000);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Cloud className="w-5 h-5 text-green-400" />
          ) : (
            <CloudOff className="w-5 h-5 text-red-400" />
          )}
          <h3 className="text-lg font-semibold text-text-primary">Sync Status</h3>
        </div>
        <Badge variant={isOnline ? "success" : "danger"}>
          {isOnline ? "Online" : "Offline"}
        </Badge>
      </div>

      {/* Connection Status */}
      <div
        className={`p-4 rounded-xl mb-4 ${
          isOnline
            ? "bg-green-500/10 border border-green-500/30"
            : "bg-red-500/10 border border-red-500/30"
        }`}
      >
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Wifi className="w-8 h-8 text-green-400" />
          ) : (
            <WifiOff className="w-8 h-8 text-red-400" />
          )}
          <div>
            <p className="font-medium text-text-primary">
              {isOnline ? "Connected" : "No Internet Connection"}
            </p>
            <p className="text-sm text-text-muted">
              {isOnline
                ? "Your data is syncing automatically"
                : "Changes will sync when online"}
            </p>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">Last Sync</span>
          <span className="text-sm text-text-muted">
            {lastSyncTime
              ? lastSyncTime.toLocaleTimeString()
              : "Never"}
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">Pending Changes</span>
          <Badge variant={pendingChanges > 0 ? "warning" : "default"}>
            {pendingChanges} items
          </Badge>
        </div>
      </div>

      {/* Pending Changes List */}
      <AnimatePresence>
        {pendingChanges > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-text-primary">
                {pendingChanges} pending changes
              </span>
            </div>
            <p className="text-xs text-text-muted">
              These changes will be synced when you&apos;re back online.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          onClick={handleSync}
          disabled={!isOnline || syncing}
          className="w-full"
        >
          {syncing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2 inline-block"
              />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2 inline-block" />
              Sync Now
            </>
          )}
        </Button>

        {syncStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-green-400"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Sync completed!</span>
          </motion.div>
        )}

        {syncStatus === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-red-400"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Sync failed. Try again.</span>
          </motion.div>
        )}
      </div>

      {/* Offline Mode Info */}
      <div className="mt-4 pt-4 border-t border-dark-tertiary">
        <h4 className="text-sm font-medium text-text-primary mb-2">📴 Offline Mode</h4>
        <div className="space-y-2 text-xs text-text-muted">
          <p>• View cached tasks</p>
          <p>• Create new tasks (sync later)</p>
          <p>• Complete tasks offline</p>
          <p>• Timer continues in background</p>
        </div>
      </div>
    </Card>
  );
}
