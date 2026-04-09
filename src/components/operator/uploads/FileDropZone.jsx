"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  Upload,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatFileSize, getFileType, getFileIcon, getFileTypeBadge } from "./constants";

/**
 * FileDropZone — Step 2 card showing the drop area and the staged file list.
 *
 * @param {{
 *   files: File[],
 *   uploading: boolean,
 *   uploadProgress: Record<number, number>,
 *   onAddFiles: (files: File[]) => void,
 *   onRemoveFile: (index: number) => void,
 *   onClearAll: () => void,
 * }} props
 */
export default function FileDropZone({
  files,
  uploading,
  uploadProgress,
  onAddFiles,
  onRemoveFile,
  onClearAll,
}) {
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e) => {
    onAddFiles(Array.from(e.target.files));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.length > 0) onAddFiles(dropped);
    },
    [onAddFiles]
  );

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const completedCount = Object.values(uploadProgress).filter((v) => v === 100).length;
  const overallProgress =
    files.length > 0 && uploading ? Math.round((completedCount / files.length) * 100) : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
            2
          </div>
          Add Files
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-blue-400 bg-blue-50/80 scale-[1.01]"
              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50/50"
          } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <div className="flex flex-col items-center gap-3">
            <div className={`p-4 rounded-full ${isDragging ? "bg-blue-100" : "bg-gray-100"}`}>
              <Upload className={`w-8 h-8 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {isDragging ? "Drop files here" : "Drag & drop files here"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                or <span className="text-blue-500 font-medium">browse</span> to select files
              </p>
            </div>
            <p className="text-[11px] text-gray-400">
              Video, documents, images, archives — single or multiple files
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {files.length} file{files.length !== 1 ? "s" : ""}
                </span>
                <Badge variant="outline" className="text-xs text-gray-500">
                  {formatFileSize(totalSize)}
                </Badge>
              </div>
              {!uploading && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3 h-3 mr-1" /> Add more
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-red-500 h-7"
                    onClick={onClearAll}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Clear
                  </Button>
                </div>
              )}
            </div>

            {uploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    Uploading... {completedCount}/{files.length}
                  </span>
                  <span>{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            )}

            <div className="border rounded-lg divide-y divide-gray-100 max-h-52 overflow-y-auto">
              {files.map((file, index) => {
                const type = getFileType(file);
                const progress = uploadProgress[index];
                const isComplete = progress === 100;
                const isFailed = progress === -1;

                return (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className={`flex items-center gap-3 px-3 py-2.5 ${
                      isComplete
                        ? "bg-emerald-50/50"
                        : isFailed
                        ? "bg-red-50/50"
                        : "hover:bg-gray-50/50"
                    }`}
                  >
                    {getFileIcon(type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-gray-400">{formatFileSize(file.size)}</span>
                        <Badge className={`text-[10px] px-1.5 py-0 ${getFileTypeBadge(type)}`}>
                          {type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isComplete && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                      {isFailed && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      {uploading && !isComplete && !isFailed && progress !== undefined && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      )}
                      {!uploading && (
                        <button
                          onClick={() => onRemoveFile(index)}
                          className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
