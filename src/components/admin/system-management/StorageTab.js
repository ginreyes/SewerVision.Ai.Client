"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { HardDrive, FolderOpen, RefreshCw, Loader2, Image, Video, FileText, Archive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/helper";

const FOLDER_ICONS = {
  videos: Video,
  avatars: Image,
  "chat-attachments": Image,
  certifications: FileText,
  complaints: Archive,
  updates: Image,
};

const FOLDER_COLORS = {
  videos: { color: "text-blue-500", bg: "bg-blue-50" },
  avatars: { color: "text-purple-500", bg: "bg-purple-50" },
  "chat-attachments": { color: "text-emerald-500", bg: "bg-emerald-50" },
  certifications: { color: "text-amber-500", bg: "bg-amber-50" },
  complaints: { color: "text-red-500", bg: "bg-red-50" },
  updates: { color: "text-teal-500", bg: "bg-teal-50" },
};

function UsageBar({ used, total, label }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const danger = pct > 80;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">{label}</span>
        <span className={`text-xs font-bold ${danger ? "text-red-600" : "text-gray-900"}`}>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${danger ? "bg-red-500" : "bg-rose-500"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function StorageTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsage = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await api("/api/uploads/storage-usage", "GET");
      if (res.ok) setData(res.data?.data || res.data);
    } catch (err) {
      console.error("Failed to fetch storage usage:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  const folders = useMemo(() => {
    if (!data?.byPrefix) return [];
    return Object.entries(data.byPrefix)
      .map(([name, info]) => ({
        name: name.endsWith("/") ? name : `${name}/`,
        key: name.replace("/", ""),
        files: info.count || 0,
        size: info.formatted || "—",
        sizeBytes: info.bytes || 0,
      }))
      .sort((a, b) => b.sizeBytes - a.sizeBytes);
  }, [data]);

  const totalBytes = data?.totalBytes || 0;
  const totalFiles = data?.fileCount || 0;
  const totalFormatted = data?.totalFormatted || "—";
  // Assume 10GB capacity (configurable)
  const capacityBytes = 10 * 1024 * 1024 * 1024;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-rose-500" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Usage overview */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-gray-200 col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Backblaze B2 Storage</h3>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => fetchUsage(true)} disabled={refreshing}>
                <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />Refresh
              </Button>
            </div>
            <UsageBar used={totalBytes} total={capacityBytes} label="Storage Used" />
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span>Used: <span className="font-medium text-gray-700">{totalFormatted}</span></span>
              <span>Files: <span className="font-medium text-gray-700">{totalFiles.toLocaleString()}</span></span>
              <span>Bucket: <span className="font-mono text-gray-600">sewerai-storage</span></span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-5 flex flex-col items-center justify-center">
            <HardDrive className="w-8 h-8 text-rose-400 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{totalFiles.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Files</p>
          </CardContent>
        </Card>
      </div>

      {/* Folders */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-rose-500" />Storage Folders ({folders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {["Folder", "Files", "Size", "% of Total"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {folders.map(f => {
                const Icon = FOLDER_ICONS[f.key] || FolderOpen;
                const colors = FOLDER_COLORS[f.key] || { color: "text-gray-500", bg: "bg-gray-50" };
                const pct = totalBytes > 0 ? ((f.sizeBytes / totalBytes) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={f.name} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-2.5 flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors.bg}`}>
                        <Icon className={`w-3.5 h-3.5 ${colors.color}`} />
                      </div>
                      <span className="text-xs font-mono font-medium text-gray-900">{f.name}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-700 font-medium">{f.files.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{f.size}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-400 rounded-full" style={{ width: `${Math.min(parseFloat(pct), 100)}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {folders.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">No storage data available</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
