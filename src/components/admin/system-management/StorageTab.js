"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  HardDrive,
  FolderOpen,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
  Video,
  FileText,
  Archive,
  Cloud,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  PlayCircle,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useStorageConfig,
  useStorageUsage,
  useUpdateStorageConfig,
  useStartMigration,
  useCancelMigration,
} from "@/hooks/useQueryHooks";
import MigrationProgressModal from "@/components/admin/uploads/MigrationProgressModal";
import { useSyncContext } from "@/components/providers/SyncContext";

const FOLDER_ICONS = {
  videos: Video,
  avatars: ImageIcon,
  "chat-attachments": ImageIcon,
  certifications: FileText,
  complaints: Archive,
  updates: ImageIcon,
  devices: ImageIcon,
  snapshots: ImageIcon,
};

const FOLDER_COLORS = {
  videos: { color: "text-blue-500", bg: "bg-blue-50" },
  avatars: { color: "text-purple-500", bg: "bg-purple-50" },
  "chat-attachments": { color: "text-emerald-500", bg: "bg-emerald-50" },
  certifications: { color: "text-amber-500", bg: "bg-amber-50" },
  complaints: { color: "text-red-500", bg: "bg-red-50" },
  devices: { color: "text-teal-500", bg: "bg-teal-50" },
  snapshots: { color: "text-indigo-500", bg: "bg-indigo-50" },
};

const PROVIDER_LABELS = {
  b2: "Backblaze B2",
  s3: "Amazon S3",
  dual: "Dual-Write (Both)",
};

const PROVIDER_BADGE = {
  b2: "bg-blue-100 text-blue-700 border-blue-200",
  s3: "bg-amber-100 text-amber-700 border-amber-200",
  dual: "bg-purple-100 text-purple-700 border-purple-200",
};

function UsageBar({ used, total, label, accent = "rose" }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const danger = pct > 80;
  const barColor = danger ? "bg-red-500" : accent === "rose" ? "bg-rose-500" : accent === "blue" ? "bg-blue-500" : "bg-amber-500";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">{label}</span>
        <span className={`text-xs font-bold ${danger ? "text-red-600" : "text-gray-900"}`}>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function StorageTab() {
  const { data: config, isLoading: configLoading, refetch: refetchConfig } = useStorageConfig();
  const { data: usage, isLoading: usageLoading, refetch: refetchUsage, isFetching } = useStorageUsage();
  const updateConfig = useUpdateStorageConfig();
  const startMigration = useStartMigration();
  const cancelMigration = useCancelMigration();
  const { setActiveJobId: setGlobalJobId } = useSyncContext();

  const [quickProvider, setQuickProvider] = useState(null);
  const [migrationDirection, setMigrationDirection] = useState("b2-to-s3");
  const [activeJobId, setActiveJobId] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  useEffect(() => {
    if (config && quickProvider === null) {
      setQuickProvider(config.active || "b2");
    }
  }, [config, quickProvider]);

  const handleQuickSwitch = async () => {
    setActionMsg(null);
    try {
      await updateConfig.mutateAsync({
        provider: quickProvider,
        // keep existing primaryRead + s3 creds — only toggle provider
      });
      setActionMsg({ type: "success", text: `Active provider set to ${PROVIDER_LABELS[quickProvider]}.` });
      refetchConfig();
      refetchUsage();
    } catch (err) {
      setActionMsg({ type: "error", text: err?.message || "Failed to switch provider." });
    }
  };

  const handleStartSync = async () => {
    setActionMsg(null);
    try {
      const res = await startMigration.mutateAsync(migrationDirection);
      setActiveJobId(res.jobId);
      // Register globally so the floating bubble shows up on every page
      setGlobalJobId(res.jobId);
    } catch (err) {
      setActionMsg({ type: "error", text: err?.message || "Failed to start sync." });
    }
  };

  // Folder breakdown for the ACTIVE / primary provider (for the existing folders table)
  const activeUsage = useMemo(() => {
    if (!usage) return null;
    if (config?.active === "s3") return usage.s3;
    if (config?.active === "dual" && config?.primaryRead === "s3") return usage.s3;
    return usage.b2;
  }, [usage, config]);

  const folders = useMemo(() => {
    if (!activeUsage?.byPrefix) return [];
    return Object.entries(activeUsage.byPrefix)
      .map(([name, info]) => ({
        name: name.endsWith("/") ? name : `${name}/`,
        key: name.replace("/", ""),
        files: info.count || 0,
        size: info.formatted || "—",
        sizeBytes: info.bytes || 0,
      }))
      .sort((a, b) => b.sizeBytes - a.sizeBytes);
  }, [activeUsage]);

  const totalBytes = activeUsage?.totalBytes || 0;
  const totalFiles = activeUsage?.fileCount || 0;
  const totalFormatted = activeUsage?.totalFormatted || "—";
  const capacityBytes = 10 * 1024 * 1024 * 1024; // 10GB visual reference

  const bothConfigured = !!(config?.providers?.b2?.configured && config?.providers?.s3?.configured);

  if (configLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Provider Switcher + Sync Actions ── */}
      <Card className="border-rose-100 bg-gradient-to-r from-rose-50/40 to-orange-50/40">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm border border-rose-100">
                <Cloud className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Storage Provider</h3>
                <p className="text-xs text-gray-600">
                  Currently active destination for new file uploads.
                </p>
              </div>
            </div>
            <Badge className={PROVIDER_BADGE[config?.active] || "bg-gray-100 text-gray-700"}>
              {PROVIDER_LABELS[config?.active] || "Unknown"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Switch Active Provider</label>
              <Select value={quickProvider || "b2"} onValueChange={setQuickProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="b2">Backblaze B2</SelectItem>
                  <SelectItem value="s3">Amazon S3</SelectItem>
                  <SelectItem value="dual">Dual-Write (both)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleQuickSwitch}
                disabled={updateConfig.isPending || quickProvider === config?.active}
              >
                {updateConfig.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Apply Switch
              </Button>
            </div>
          </div>

          <p className="text-[11px] text-gray-500">
            To configure S3 credentials, go to <strong>Admin → Uploads → Storage</strong>. Only admins
            can change storage settings; every change is audited.
          </p>

          {actionMsg && (
            <Alert className={actionMsg.type === "success" ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}>
              <AlertDescription className={actionMsg.type === "success" ? "text-emerald-800" : "text-red-800"}>
                {actionMsg.text}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* ── Sync Between Providers ── */}
      <Card className="border-purple-100 bg-gradient-to-r from-purple-50/40 to-indigo-50/40">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm border border-purple-100">
                <ArrowRightLeft className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Sync Between Providers</h3>
                <p className="text-xs text-gray-600">
                  Copy all files from one provider to the other. Already-copied files are skipped.
                </p>
              </div>
            </div>
            {!bothConfigured && (
              <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Both providers required
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Direction</label>
              <Select value={migrationDirection} onValueChange={setMigrationDirection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="b2-to-s3">Backblaze B2 → Amazon S3</SelectItem>
                  <SelectItem value="s3-to-b2">Amazon S3 → Backblaze B2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handleStartSync}
                disabled={!bothConfigured || startMigration.isPending}
              >
                {startMigration.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <PlayCircle className="w-4 h-4 mr-2" />
                )}
                Start Sync
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Usage overview — ACTIVE provider ── */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-gray-200 col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">
                  {activeUsage === usage?.s3 ? "Amazon S3 Storage" : "Backblaze B2 Storage"}
                </h3>
                <p className="text-[11px] text-gray-500">Showing the active primary-read provider.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => refetchUsage()}
                disabled={usageLoading || isFetching}
              >
                <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} />Refresh
              </Button>
            </div>
            <UsageBar used={totalBytes} total={capacityBytes} label="Storage Used" accent="rose" />
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 flex-wrap">
              <span>Used: <span className="font-medium text-gray-700">{totalFormatted}</span></span>
              <span>Files: <span className="font-medium text-gray-700">{totalFiles.toLocaleString()}</span></span>
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

      {/* ── Both providers side-by-side mini-stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <MiniProviderCard
          title="Backblaze B2"
          usage={usage?.b2}
          loading={usageLoading}
          accent="blue"
          isActive={config?.active === "b2" || (config?.active === "dual" && config?.primaryRead === "b2")}
        />
        <MiniProviderCard
          title="Amazon S3"
          usage={usage?.s3}
          loading={usageLoading}
          accent="amber"
          isActive={config?.active === "s3" || (config?.active === "dual" && config?.primaryRead === "s3")}
        />
      </div>

      {/* ── Folder breakdown ── */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-rose-500" />
            Storage Folders ({folders.length})
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

      {/* Migration modal */}
      {activeJobId && (
        <MigrationProgressModal
          jobId={activeJobId}
          onClose={() => {
            setActiveJobId(null);
            refetchUsage();
          }}
          onCancel={() => cancelMigration.mutate(activeJobId)}
        />
      )}
    </div>
  );
}

function MiniProviderCard({ title, usage, loading, accent, isActive }) {
  const dotColor = accent === "blue" ? "bg-blue-500" : "bg-amber-500";
  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${dotColor}`} />
            <h4 className="text-xs font-semibold text-gray-700">{title}</h4>
          </div>
          {isActive && (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] h-4">Active</Badge>
          )}
        </div>
        {loading ? (
          <div className="space-y-2">
            <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
        ) : !usage ? (
          <p className="text-xs text-gray-400 italic">Not configured</p>
        ) : (
          <>
            <p className="text-lg font-bold text-gray-900">{usage.totalFormatted}</p>
            <p className="text-[11px] text-gray-500">{usage.fileCount.toLocaleString()} files</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
