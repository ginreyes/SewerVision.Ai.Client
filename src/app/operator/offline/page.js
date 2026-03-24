"use client";

import React, { useState } from "react";
import {
  WifiOff, Download, RefreshCw, CheckCircle2, Clock, HardDrive,
  FolderOpen, ClipboardCheck, AlertTriangle, Wifi, Cloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlert } from "@/components/providers/AlertProvider";

const CACHED_ITEMS = [
  { id: "1", type: "project", name: "PRJ-0087 — Main St Segment A", size: "2.4 MB", cached: true, lastSync: "2026-03-25 07:00" },
  { id: "2", type: "checklist", name: "Pre-Inspection Safety Check", size: "12 KB", cached: true, lastSync: "2026-03-25 07:00" },
  { id: "3", type: "checklist", name: "Equipment Verification", size: "10 KB", cached: true, lastSync: "2026-03-25 07:00" },
  { id: "4", type: "project", name: "PRJ-0088 — Oak Ave Junction", size: "1.8 MB", cached: false, lastSync: null },
  { id: "5", type: "project", name: "PRJ-0089 — River Rd Culvert", size: "3.1 MB", cached: false, lastSync: null },
];

const PENDING_SYNC = [
  { id: "s1", action: "Submitted incident report: Camera Cable Snapped", timestamp: "2026-03-25 10:22", size: "4 KB" },
  { id: "s2", action: "Completed checklist: Pre-Inspection Safety Check (PRJ-0087)", timestamp: "2026-03-25 09:55", size: "2 KB" },
  { id: "s3", action: "Time entry: 4.5h Inspection on PRJ-0087", timestamp: "2026-03-25 11:30", size: "1 KB" },
];

const TYPE_ICONS = { project: FolderOpen, checklist: ClipboardCheck };
const TYPE_COLORS = { project: "bg-blue-100 text-blue-700", checklist: "bg-teal-100 text-teal-700" };

export default function OfflineMode() {
  const { showAlert } = useAlert();
  const [items, setItems] = useState(CACHED_ITEMS);
  const [syncing, setSyncing] = useState(false);
  const [isOnline] = useState(true);

  async function handleSync() {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    setSyncing(false);
    showAlert(`${PENDING_SYNC.length} items synced successfully`, "success");
  }

  function toggleCache(id) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, cached: !i.cached, lastSync: i.cached ? null : new Date().toLocaleString().slice(0,16) } : i));
    showAlert("Cache preference saved", "success");
  }

  const cachedSize = items.filter(i => i.cached).reduce((s, i) => s + parseFloat(i.size), 0);

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
          <Button onClick={handleSync} disabled={syncing || !isOnline} className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />{syncing ? "Syncing…" : "Sync Now"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Cached Items", value: items.filter(i => i.cached).length, icon: HardDrive, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "Pending Sync", value: PENDING_SYNC.length, icon: Cloud, bg: "bg-amber-50", color: "text-amber-600" },
          { label: "Cache Size", value: `${cachedSize.toFixed(1)} MB`, icon: HardDrive, bg: "bg-teal-50", color: "text-teal-600" },
        ].map(s => (
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
          <CardHeader className="pb-2"><CardTitle className="text-sm">Cached for Offline Use</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-2">
            {items.map(item => {
              const Icon = TYPE_ICONS[item.type] || FolderOpen;
              return (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:border-blue-100 transition-colors">
                  <span className={`p-1.5 rounded-lg ${TYPE_COLORS[item.type]}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-400">{item.size}{item.lastSync && ` · Synced ${item.lastSync}`}</p>
                  </div>
                  <button onClick={() => toggleCache(item.id)}
                    className={`shrink-0 w-8 h-5 rounded-full transition-colors ${item.cached ? "bg-blue-600" : "bg-gray-200"}`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform mx-auto ${item.cached ? "translate-x-1.5" : "-translate-x-1.5"}`} />
                  </button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Pending sync */}
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Pending Sync</CardTitle>
              {PENDING_SYNC.length > 0 && <Badge className="bg-amber-100 text-amber-700 border-amber-200">{PENDING_SYNC.length}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {PENDING_SYNC.map(s => (
              <div key={s.id} className="p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-xs text-gray-800">{s.action}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                  <Clock className="w-3 h-3" />{s.timestamp}
                  <span>· {s.size}</span>
                </div>
              </div>
            ))}
            {PENDING_SYNC.length === 0 && (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">All synced</p>
              </div>
            )}
            {PENDING_SYNC.length > 0 && (
              <p className="text-[11px] text-gray-400 text-center pt-2">Will auto-sync when connected</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
