"use client";

import {
  ArrowLeft,
  Edit3,
  Loader2,
  RotateCcw,
  Square,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectSwitcher from "@/components/shared/ProjectSwitcher";

/**
 * DetailHeader — shared across admin/user/operator ProjectDetail.
 *
 * Role-specific affordances are toggled via the `role` prop and boolean
 * `actions.*` props. The parent owns all handlers and refs; this component
 * is purely presentational + wiring.
 */
export default function DetailHeader({
  role = "admin",
  project,
  allProjects = [],
  onBack,
  onSelectProject,
  fileInputRef,
  onVideoUpload,
  onStop,
  onReprocess,
  onReset,
  onEdit,
  isStopping = false,
  isReprocessing = false,
  isResetting = false,
  actions = {},
}) {
  const {
    showUpload = true,
    showStop = true,
    showReprocess = true,
    showReset = true,
    showEdit = true,
  } = actions;

  const status = project?.status;
  const statusBadge =
    status === "ai-processing"
      ? "bg-violet-100 text-violet-700"
      : status === "completed"
      ? "bg-emerald-100 text-emerald-700"
      : status === "on-hold"
      ? "bg-slate-100 text-slate-700"
      : status === "planning"
      ? "bg-blue-100 text-blue-700"
      : "bg-amber-100 text-amber-700";

  const editPathByRole = {
    admin: `/admin/project/editProject/${project?._id}`,
    user: `/user/project/editProject/${project?._id}`,
    operator: `/operator/project/editProject/${project?._id}`,
  };

  return (
    <div className="bg-white/80 dark:bg-[#0c0c0e]/80 backdrop-blur-sm border border-gray-200/50 dark:border-[#27272a] px-6 py-4 mb-6 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 group bg-gray-50 dark:bg-[#18181b] hover:bg-gray-100 dark:hover:bg-[#27272a] px-3 py-2 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm font-medium">Back to Projects</span>
          </button>

          <div className="h-6 w-px bg-gray-200 dark:bg-[#27272a]" />

          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              Project Console
            </h1>
            <ProjectSwitcher
              projects={allProjects}
              currentId={project?._id}
              onSelect={onSelectProject}
            />
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {project?.name || "Untitled Project"}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusBadge}`}
            >
              {status === "ai-processing" && <Zap className="w-3 h-3" />}
              {status === "completed" && <CheckCircle2 className="w-3 h-3" />}
              {status?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
                "In Progress"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {showUpload && (
            <input
              type="file"
              ref={fileInputRef}
              onChange={onVideoUpload}
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/mpeg,.mp4,.webm,.mov,.avi,.mpeg"
              className="hidden"
            />
          )}

          {showStop && status === "ai-processing" && (
            <Button
              onClick={onStop}
              disabled={isStopping}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              {isStopping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              <span>{isStopping ? "Stopping..." : "Stop AI"}</span>
            </Button>
          )}

          {showReprocess && status !== "planning" && status !== "in-progress" && (
            <Button
              onClick={onReprocess}
              disabled={isReprocessing}
              className={`flex items-center gap-2 transition-all duration-300 ${
                isReprocessing
                  ? "bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-200"
                  : "bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800"
              } text-white`}
            >
              {isReprocessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Reprocessing...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Reprocess AI</span>
                </>
              )}
            </Button>
          )}

          {showReset &&
            project?.aiDetections?.total > 0 &&
            status !== "ai-processing" && (
              <Button
                onClick={onReset}
                disabled={isResetting}
                variant="outline"
                className="flex items-center gap-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
              >
                {isResetting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                <span>{isResetting ? "Resetting..." : "Reset AI Data"}</span>
              </Button>
            )}

          {showEdit && (
            <Button
              onClick={onEdit || (() => (window.location.href = editPathByRole[role]))}
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 dark:hover:bg-[#27272a] rounded-xl"
              title="Edit Project"
            >
              <Edit3 className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
