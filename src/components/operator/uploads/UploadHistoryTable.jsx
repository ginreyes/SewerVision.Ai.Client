"use client";

import React, { useMemo } from "react";
import { MapPin, RefreshCw, HardDrive } from "lucide-react";
import SewerTable from "@/components/ui/SewerTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFileTypeIcon, getStatusColor } from "@/lib/utils";
import { formatFileSize, getFileTypeBadge } from "./constants";

// IDB-local statuses don't map cleanly to the server's getStatusColor() palette
// — they're transient operator-side states, so we give them their own
// amber/rose/blue tones to make them visually distinct from completed/server
// rows. The "draining" colour intentionally matches the active-sync banner on
// UploadSummaryCard so the operator can connect cause and effect.
const LOCAL_STATUS_TONE = {
  queued: "bg-amber-50 text-amber-700 border-amber-200",
  draining: "bg-blue-50 text-blue-700 border-blue-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
};

const COLUMNS = [
  { key: "file", name: "File" },
  { key: "size", name: "Size" },
  { key: "status", name: "Status" },
  { key: "location", name: "Location" },
  { key: "uploadedAt", name: "Date" },
];

const COLUMN_DEFAULTS = {
  file: 280,
  size: 100,
  status: 120,
  location: 180,
  uploadedAt: 140,
};

/**
 * UploadHistoryTable — wraps SewerTable with the upload history schema.
 *
 * @param {{
 *   uploads: Array<any>,
 *   loading: boolean,
 *   search: string,
 *   onSearch: (q: string) => void,
 *   onRefresh: () => void,
 * }} props
 */
export default function UploadHistoryTable({ uploads, loading, search, onSearch, onRefresh }) {
  const data = useMemo(() => {
    return uploads.map((u) => ({
      _id: u._id,
      file: { name: u.originalName || u.filename, type: u.type },
      size: u.size || formatFileSize(u.sizeBytes),
      status: u.status,
      location: u.location || "—",
      uploadedAt: u.uploadedAt,
      isLocal: !!u.isLocal,
      lastError: u.lastError || null,
    }));
  }, [uploads]);

  const renderCell = (item, col) => {
    if (col.key === "file") {
      return (
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0">
            {getFileTypeIcon(item.file.type)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
              {item.isLocal && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1 py-0 border-amber-300 bg-amber-50 text-amber-700 flex items-center gap-0.5"
                  title="This file is queued in your browser and has not finished uploading yet"
                >
                  <HardDrive className="w-2.5 h-2.5" />
                  local
                </Badge>
              )}
            </div>
            <Badge className={`text-[10px] px-1.5 py-0 mt-0.5 ${getFileTypeBadge(item.file.type)}`}>
              {item.file.type}
            </Badge>
            {item.isLocal && item.lastError && (
              <p
                className="text-[10px] text-rose-600 mt-0.5 truncate"
                title={item.lastError}
              >
                {item.lastError}
              </p>
            )}
          </div>
        </div>
      );
    }
    if (col.key === "size") {
      return <span className="text-sm text-gray-600 font-mono">{item.size}</span>;
    }
    if (col.key === "status") {
      const tone = item.isLocal
        ? LOCAL_STATUS_TONE[item.status] || "bg-gray-50 text-gray-700 border-gray-200"
        : getStatusColor(item.status);
      return (
        <Badge variant="outline" className={`${tone} text-xs font-semibold capitalize`}>
          {item.status}
        </Badge>
      );
    }
    if (col.key === "location") {
      return (
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {item.location}
        </span>
      );
    }
    if (col.key === "uploadedAt") {
      if (!item.uploadedAt) return <span className="text-sm text-gray-400">—</span>;
      const date = new Date(item.uploadedAt);
      return (
        <div>
          <p className="text-sm text-gray-900">{date.toLocaleDateString()}</p>
          <p className="text-[11px] text-gray-400">{date.toLocaleTimeString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <SewerTable
      data={data}
      columns={COLUMNS}
      search={search}
      onSearch={onSearch}
      loading={loading}
      renderCell={renderCell}
      showCheckbox={false}
      showActions={false}
      showCsvActions={false}
      emptyMessage="No uploads yet"
      emptySubtext="Upload files to see them here"
      columnDefaults={COLUMN_DEFAULTS}
      rowsPerPageOptions={[10, 20, 50]}
      ButtonPlacement={
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      }
    />
  );
}
