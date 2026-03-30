"use client";

import React from "react";
import { HardDrive, FolderOpen, Image, Video, FileText, Archive, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STORAGE_FOLDERS = [
  { name: "videos/", icon: Video, size: "—", files: 0, color: "text-blue-500", bg: "bg-blue-50" },
  { name: "avatars/", icon: Image, size: "—", files: 0, color: "text-purple-500", bg: "bg-purple-50" },
  { name: "chat-attachments/", icon: Image, size: "—", files: 0, color: "text-emerald-500", bg: "bg-emerald-50" },
  { name: "certifications/", icon: FileText, size: "—", files: 0, color: "text-amber-500", bg: "bg-amber-50" },
  { name: "complaints/", icon: Archive, size: "—", files: 0, color: "text-red-500", bg: "bg-red-50" },
  { name: "updates/", icon: Image, size: "—", files: 0, color: "text-teal-500", bg: "bg-teal-50" },
];

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

export default function StorageTab({ data }) {
  const folders = data?.folders || STORAGE_FOLDERS;
  const usage = data?.usage || {};
  const totalUsed = usage.used || 0;
  const totalCapacity = usage.capacity || 10 * 1024 * 1024 * 1024; // 10GB default

  return (
    <div className="space-y-4">
      {/* Usage overview */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-gray-200 col-span-2">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Backblaze B2 Storage</h3>
            <UsageBar used={totalUsed} total={totalCapacity} label="Storage Used" />
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span>Used: {usage.usedFormatted || "—"}</span>
              <span>Available: {usage.availableFormatted || "—"}</span>
              <span>Bucket: {usage.bucketName || "sewerai-storage"}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-5 flex flex-col items-center justify-center">
            <HardDrive className="w-8 h-8 text-rose-400 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{folders.reduce((s, f) => s + (f.files || 0), 0)}</p>
            <p className="text-xs text-gray-500">Total Files</p>
          </CardContent>
        </Card>
      </div>

      {/* Folders */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-rose-500" />Storage Folders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {["Folder", "Files", "Size", "Last Modified"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {folders.map(f => {
                const Icon = f.icon || FolderOpen;
                return (
                  <tr key={f.name} className="border-b border-gray-50 hover:bg-gray-50/60">
                    <td className="px-4 py-3 flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${f.bg}`}>
                        <Icon className={`w-3.5 h-3.5 ${f.color}`} />
                      </div>
                      <span className="text-xs font-mono font-medium text-gray-900">{f.name}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">{f.files?.toLocaleString() || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{f.size || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{f.lastModified || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
