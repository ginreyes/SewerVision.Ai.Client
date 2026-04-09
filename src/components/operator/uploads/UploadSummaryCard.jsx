"use client";

import React from "react";
import { CloudUpload, Loader2 } from "lucide-react";
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
 * }} props
 */
export default function UploadSummaryCard({
  files,
  selectedProject,
  uploading,
  completedCount,
  canSubmit,
  onUpload,
}) {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <Card className={`border-0 shadow-sm ${files.length > 0 ? "ring-1 ring-blue-100 bg-blue-50/30" : ""}`}>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Project</span>
            <span
              className={`font-medium ${
                selectedProject ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {selectedProject?.name || "Not selected"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Files</span>
            <span className="font-medium text-gray-900">
              {files.length} file{files.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total Size</span>
            <span className="font-medium text-gray-900">{formatFileSize(totalSize)}</span>
          </div>
        </div>

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
      </CardContent>
    </Card>
  );
}
