"use client";

import {
  ChevronDown,
  ChevronUp,
  Clock,
  Film,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * ProjectVideoList — sidebar panel that lists uploaded project videos,
 * highlights the selected one, and exposes upload + delete affordances.
 *
 * Parent owns all mutation state and handlers. `allowDelete` gates the
 * per-row delete button so non-admin roles cannot remove videos.
 */
export default function ProjectVideoList({
  videos = [],
  selectedVideo,
  onSelectVideo,
  onTriggerUpload,
  onRequestDelete,
  isVideosExpanded,
  onToggleExpanded,
  loading = false,
  isUploading = false,
  allowDelete = false,
  formatFileSize = (n) => `${n} B`,
}) {
  return (
    <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-500/5 dark:to-indigo-500/5 rounded-xl p-4 border border-blue-100/50 dark:border-blue-500/15">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleExpanded}
            className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {isVideosExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span className="font-semibold text-sm">PROJECT VIDEOS</span>
          </button>
          <Badge
            variant="secondary"
            className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
          >
            {videos.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 hover:bg-blue-100 dark:hover:bg-blue-500/15"
            onClick={onTriggerUpload}
            disabled={isUploading}
            title="Upload Video"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <Plus className="h-4 w-4 text-blue-600" />
            )}
          </Button>
        </div>
      </div>

      {isVideosExpanded && (
        <div className="space-y-2">
          {videos.length === 0 ? (
            <EmptyState
              onUpload={onTriggerUpload}
              isUploading={isUploading}
            />
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {videos.map((video) => (
                <VideoRow
                  key={video._id}
                  video={video}
                  isSelected={selectedVideo?._id === video._id}
                  onSelect={() => onSelectVideo?.(video)}
                  onDelete={
                    allowDelete
                      ? (e) => {
                          e.stopPropagation();
                          onRequestDelete?.(video);
                        }
                      : null
                  }
                  formatFileSize={formatFileSize}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ onUpload, isUploading }) {
  return (
    <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-[#18181b]/60 rounded-xl border-2 border-dashed border-gray-200 dark:border-[#27272a]">
      <div className="w-12 h-12 bg-gray-100 dark:bg-[#27272a] rounded-xl flex items-center justify-center mx-auto mb-3">
        <Film className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
        No videos uploaded
      </p>
      <p className="text-xs text-gray-400 mb-3">Upload a video to get started</p>
      <Button
        size="sm"
        variant="outline"
        className="border-blue-200 text-blue-600 hover:bg-blue-50"
        onClick={onUpload}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
        ) : (
          <Upload className="h-3.5 w-3.5 mr-1.5" />
        )}
        {isUploading ? "Uploading..." : "Upload Video"}
      </Button>
    </div>
  );
}

function VideoRow({ video, isSelected, onSelect, onDelete, formatFileSize }) {
  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm"
          : "border-gray-200 dark:border-[#27272a] hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-[#18181b]"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {video.originalName || video.filename}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(video.fileSize)}
            </span>
            <Badge
              variant={
                video.aiProcessingStatus === "completed"
                  ? "default"
                  : video.aiProcessingStatus === "processing"
                  ? "secondary"
                  : "outline"
              }
              className={`text-[10px] px-1.5 py-0 ${
                video.aiProcessingStatus === "pending"
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : ""
              }`}
            >
              {video.aiProcessingStatus === "pending"
                ? "Ready for AI"
                : video.aiProcessingStatus}
            </Badge>
          </div>

          {video.uploadedBy && (
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="w-5 h-5">
                <AvatarImage src={video.uploadedBy.avatar} />
                <AvatarFallback className="text-[10px]">
                  {video.uploadedBy.first_name?.[0] ||
                    video.uploadedBy.username?.[0] ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {video.uploadedBy.first_name
                  ? `${video.uploadedBy.first_name} ${video.uploadedBy.last_name || ""}`
                  : video.uploadedBy.username}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {new Date(video.uploadedAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isSelected && (
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Delete video"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
