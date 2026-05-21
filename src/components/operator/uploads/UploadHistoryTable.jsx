"use client";

import React, { useMemo, useState } from "react";
import { MapPin, RefreshCw, HardDrive, Play, Trash2, AlertCircle } from "lucide-react";
import SewerTable from "@/components/ui/SewerTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getFileTypeIcon, getStatusColor } from "@/lib/utils";
import { formatFileSize, getFileTypeBadge } from "./constants";
import {
  resumeOneUpload,
  discardOneUpload,
  getUploadError,
} from "@/lib/chunkedUploader";
import { useAlert } from "@/components/providers/AlertProvider";

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
  { key: "actions", name: "Actions" },
];

const COLUMN_DEFAULTS = {
  file: 260,
  size: 90,
  status: 110,
  location: 160,
  uploadedAt: 130,
  actions: 170,
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
export default function UploadHistoryTable({ uploads, loading, search, onSearch, onRefresh, onRowAction }) {
  const { showAlert } = useAlert();
  const [busyId, setBusyId] = useState(null);
  const [errorDetail, setErrorDetail] = useState(null);
  const [confirmDiscardId, setConfirmDiscardId] = useState(null);

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

  const handleResume = async (uploadId) => {
    setBusyId(uploadId);
    try {
      const result = await resumeOneUpload(uploadId);
      const drained = result?.drained ?? 0;
      const failed = result?.failed ?? 0;
      if (drained > 0) {
        showAlert(`Resumed — ${drained} chunk${drained === 1 ? "" : "s"} sent`, "success");
      } else if (failed > 0) {
        showAlert("Still failing — check connectivity or open the error details", "error");
      } else {
        showAlert("Nothing to resume for this upload", "info");
      }
      onRowAction?.();
    } catch (err) {
      showAlert(err?.message || "Resume failed", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleDiscardConfirm = async () => {
    const uploadId = confirmDiscardId;
    if (!uploadId) return;
    setConfirmDiscardId(null);
    setBusyId(uploadId);
    try {
      await discardOneUpload(uploadId);
      showAlert("Upload discarded", "success");
      onRowAction?.();
    } catch (err) {
      showAlert(err?.message || "Discard failed", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleViewError = async (uploadId) => {
    try {
      const detail = await getUploadError(uploadId);
      setErrorDetail(detail || { uploadId, lastError: 'No error recorded for this row.' });
    } catch (err) {
      setErrorDetail({ uploadId, lastError: err?.message || 'Failed to read error' });
    }
  };

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
    if (col.key === "actions") {
      // Local rows: full Resume/Discard/View-error toolkit. Server rows: no
      // local-queue actions apply, so leave the cell empty rather than render
      // dead buttons.
      if (!item.isLocal) return <span className="text-xs text-gray-300">—</span>;
      const isBusy = busyId === item._id;
      const canResume = item.status === "queued" || item.status === "failed";
      const hasError = item.status === "failed" || item.lastError;
      return (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            disabled={isBusy || !canResume}
            onClick={() => handleResume(item._id)}
            title="Resume this upload"
            className="h-7 px-1.5"
          >
            <Play className="w-3.5 h-3.5" />
          </Button>
          {hasError && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  onClick={() => handleViewError(item._id)}
                  title="View error details"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="left" className="w-80">
                <p className="text-xs font-medium text-gray-900 mb-1">
                  {errorDetail?.originalName || item.file?.name || 'Upload'}
                </p>
                <p className="text-[11px] text-rose-700 break-words">
                  {errorDetail?.lastError || item.lastError || 'No error message recorded.'}
                </p>
                {errorDetail?.attempts ? (
                  <p className="text-[10px] text-gray-500 mt-1.5">
                    {errorDetail.attempts} attempt{errorDetail.attempts === 1 ? '' : 's'} so far
                  </p>
                ) : null}
              </PopoverContent>
            </Popover>
          )}
          <Button
            size="sm"
            variant="ghost"
            disabled={isBusy}
            onClick={() => setConfirmDiscardId(item._id)}
            title="Discard this upload"
            className="h-7 px-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <>
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

      <Dialog
        open={!!confirmDiscardId}
        onOpenChange={(open) => !open && setConfirmDiscardId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Discard local upload?</DialogTitle>
            <DialogDescription>
              This removes the staged file from your browser. If chunks were already sent to
              the server, the staging dir will be garbage-collected. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDiscardId(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleDiscardConfirm}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
