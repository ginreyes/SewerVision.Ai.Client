"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * UploadStatusBanners — shows upload error / uploading banners under the
 * DetailHeader. Shared across admin/user/operator ProjectDetail.
 *
 * Parent owns the dismiss handler so we don't leak API concerns into a
 * presentational component.
 */
export default function UploadStatusBanners({ project, onDismissError }) {
  if (!project) return null;

  return (
    <>
      {project.uploadError && (
        <div className="mb-4 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">
              Video Upload Failed
            </p>
            <p className="text-xs text-red-600 dark:text-red-300 truncate">
              {project.uploadError}
            </p>
          </div>
          {onDismissError && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-red-300 text-red-600 hover:bg-red-100"
              onClick={onDismissError}
            >
              Dismiss
            </Button>
          )}
        </div>
      )}

      {project.status === "uploading" && !project.uploadError && (
        <div className="mb-4 flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
              Video Uploading
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300">
              Your video is being uploaded in the background. You can continue
              working.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
