"use client";

import React from "react";
import { CloudUpload, Loader2, AlertTriangle, Inbox, RefreshCw, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "./constants";

/**
 * UploadSummaryCard — sticky-style summary panel with the primary upload action.
 *
 * @param {{
 *   files: File[],
 *   selectedProject: { name?: string } | null,
 *   uploading: boolean,
 *   completedCount: number,
 *   canSubmit: boolean,
 *   onUpload: () => void,
 *   queue?: { queued: number, draining: number, failed: number, total: number } | null,
 *   onRetryFailed?: () => void,
 *   resuming?: boolean,
 * }} props
 */
export default function UploadSummaryCard({
  files,
  selectedProject,
  uploading,
  completedCount,
  canSubmit,
  onUpload,
  queue,
  onRetryFailed,
  resuming = false,
}) {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const queueLines = renderQueueLines(queue);

  return (
    <Card className={`border-0 shadow-sm ${files.length > 0 ? "ring-1 ring-blue-100 bg-blue-50/30" : ""}`}>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2 text-sm">
          <SummaryRow label="Project" value={selectedProject?.name} placeholder="Not selected" />
          <SummaryRow label="Files" value={`${files.length} file${files.length !== 1 ? "s" : ""}`} />
          <SummaryRow label="Total Size" value={formatFileSize(totalSize)} />
        </div>

        {queueLines && (
          <div className="rounded-md border border-amber-200 bg-amber-50/60 p-3 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-medium">
              <Inbox className="w-3.5 h-3.5" />
              Offline queue
            </div>
            <div className="space-y-1 text-amber-900">
              {queueLines.map((line) => (
                <div key={line.label} className="flex justify-between">
                  <span>{line.label}</span>
                  <span className="font-semibold tabular-nums">{line.value}</span>
                </div>
              ))}
            </div>
            {(queue?.failed > 0 || queue?.queued > 0) && onRetryFailed && (
              <Button
                type="button"
                onClick={onRetryFailed}
                disabled={resuming}
                variant="outline"
                size="sm"
                className="w-full mt-1 h-7 text-xs border-amber-300 hover:bg-amber-100"
              >
                {resuming ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                    Resuming…
                  </>
                ) : queue?.failed > 0 ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1.5" />
                    Resume failed uploads
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 mr-1.5" />
                    Resume queued uploads
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        <Button
          onClick={onUpload}
          disabled={!canSubmit || uploading}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading... {completedCount}/{files.length}
            </>
          ) : (
            <>
              <CloudUpload className="w-4 h-4 mr-2" />
              Upload {files.length > 0 ? `${files.length} File${files.length !== 1 ? "s" : ""}` : "Files"}
            </>
          )}
        </Button>

        {queue?.failed > 0 && !uploading && (
          <div className="flex items-start gap-2 text-xs text-amber-700">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              {queue.failed} upload{queue.failed === 1 ? "" : "s"} failed and stayed in the local queue. They will retry automatically when you go back online.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value, placeholder }) {
  const hasValue = value !== undefined && value !== null && value !== "";
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium ${hasValue ? "text-gray-900" : "text-gray-400"}`}>
        {hasValue ? value : placeholder}
      </span>
    </div>
  );
}

function renderQueueLines(queue) {
  if (!queue || queue.total === 0) return null;
  const lines = [];
  if (queue.queued > 0) lines.push({ label: "Queued", value: queue.queued });
  if (queue.draining > 0) lines.push({ label: "Draining", value: queue.draining });
  if (queue.failed > 0) lines.push({ label: "Failed", value: queue.failed });
  return lines.length > 0 ? lines : null;
}
