"use client";

import React, { useMemo } from "react";
import { MapPin, RefreshCw } from "lucide-react";
import SewerTable from "@/components/ui/SewerTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFileTypeIcon, getStatusColor } from "@/lib/utils";
import { formatFileSize, getFileTypeBadge } from "./constants";

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
            <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
            <Badge className={`text-[10px] px-1.5 py-0 mt-0.5 ${getFileTypeBadge(item.file.type)}`}>
              {item.file.type}
            </Badge>
          </div>
        </div>
      );
    }
    if (col.key === "size") {
      return <span className="text-sm text-gray-600 font-mono">{item.size}</span>;
    }
    if (col.key === "status") {
      return (
        <Badge
          variant="outline"
          className={`${getStatusColor(item.status)} text-xs font-semibold capitalize`}
        >
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
