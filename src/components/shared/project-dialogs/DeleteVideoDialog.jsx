"use client";

import React from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const formatFileSize = (bytes) => {
  if (!bytes) return "Unknown";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
};

/**
 * DeleteVideoDialog — shared dialog confirming permanent video deletion.
 *
 * @param {{
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   video: { originalName?: string, filename?: string, fileSize?: number, uploadedAt?: string } | null,
 *   onConfirm: () => void,
 *   onCancel?: () => void,
 *   loading?: boolean,
 * }} props
 */
export default function DeleteVideoDialog({
  open,
  onOpenChange,
  video,
  onConfirm,
  onCancel,
  loading = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Video</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this video? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {video && (
          <div className="py-4">
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <p className="font-medium text-gray-900">{video.originalName || video.filename}</p>
              <p className="text-sm text-gray-500">Size: {formatFileSize(video.fileSize)}</p>
              {video.uploadedAt && (
                <p className="text-sm text-gray-500">
                  Uploaded: {new Date(video.uploadedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.();
              onOpenChange(false);
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Video
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
