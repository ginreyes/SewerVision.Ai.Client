"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  WifiOff, RefreshCw, CheckCircle2, HardDrive, Wifi, Cloud,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import {
  useOperatorCachedItems, useOperatorPendingSyncs, useOperatorOfflineStats,
  useToggleCache, useSyncAll,
} from "@/hooks/useQueryHooks";
import { CachedItemRow, PendingSyncItem } from "@/components/operator/offline";

export default function OfflineMode() {
  const { showAlert } = useAlert();
  const { userId } = useUser();

  const { data: items = [], isLoading: loadingItems } = useOperatorCachedItems(userId);
  const { data: pendingSyncs = [], isLoading: loadingSyncs } = useOperatorPendingSyncs(userId);
  const { data: offlineStats } = useOperatorOfflineStats(userId);
  const toggleCacheMutation = useToggleCache();
  const syncAllMutation = useSyncAll();

  const [isOnline] = useState(true);

  const isLoading = loadingItems || loadingSyncs;

  const handleSync = useCallback(() => {
    syncAllMutation.mutate(userId, {
      onSuccess: () => showAlert("All items synced successfully", "success"),
      onError: () => showAlert("Sync failed", "error"),
    });
  }, [syncAllMutation, userId, showAlert]);

  const handleToggleCache = useCallback(
    (id) => {
      toggleCacheMutation.mutate(id, {
        onSuccess: () => showAlert("Cache preference saved", "success"),
        onError: () => showAlert("Failed to update cache", "error"),
      });
    },
    [toggleCacheMutation, showAlert]
  );

  const cachedSize = useMemo(
    () => items.filter((i) => i.cached).reduce((s, i) => s + parseFloat(i.size || 0), 0),
    [items]
  );

  const statsCards = useMemo(
    () => [
      { label: "Cached Items", value: items.filter((i) => i.cached).length, icon: HardDrive, bg: "bg-blue-50", color: "text-blue-600" },
      { label: "Pending Sync", value: pendingSyncs.length, icon: Cloud, bg: "bg-amber-50", color: "text-amber-600" },
      { label: "Cache Size", value: `${cachedSize.toFixed(1)} MB`, icon: HardDrive, bg: "bg-teal-50", color: "text-teal-600" },
    ],
    [items, pendingSyncs.length, cachedSize]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Offline Mode</h1>
            <p className="text-sm text-gray-500">Cache projects and checklists locally for fieldwork without connectivity</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${isOnline ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isOnline ? "Online" : "Offline"}
          </div>
          <Button onClick={handleSync} disabled={syncAllMutation.isPending || !isOnline} className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
            <RefreshCw className={`w-4 h-4 ${syncAllMutation.isPending ? "animate-spin" : ""}`} />
            {syncAllMutation.isPending ? "Syncing..." : "Sync Now"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {statsCards.map((s) => (
          <Card key={s.label} className="border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Cached items */}
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cached for Offline Use</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {items.length === 0 ? (
              <div className="text-center py-6">
                <HardDrive className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No items available to cache</p>
              </div>
            ) : (
              items.map((item) => (
                <CachedItemRow key={item.id} item={item} onToggle={handleToggleCache} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Pending sync */}
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Pending Sync</CardTitle>
              {pendingSyncs.length > 0 && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">{pendingSyncs.length}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {pendingSyncs.map((s) => (
              <PendingSyncItem key={s.id} sync={s} />
            ))}
            {pendingSyncs.length === 0 && (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">All synced</p>
              </div>
            )}
            {pendingSyncs.length > 0 && (
              <p className="text-[11px] text-gray-400 text-center pt-2">Will auto-sync when connected</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
