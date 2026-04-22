"use client";

import {
  Building2,
  Calendar,
  Loader2,
  MapPin,
  Ruler,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * ProjectInfoBanner — shared across admin/user/operator ProjectDetail.
 *
 * The `statusGradient` prop is a small config object that callers already
 * compute locally (keeps status-color logic with the parent where it lives
 * next to other status-aware code).
 */
export default function ProjectInfoBanner({
  project,
  statusGradient = {
    banner: "from-gray-50 to-gray-100",
    bannerBorder: "border-gray-200",
    text: "text-gray-700",
    textGradient: "from-gray-700 to-gray-900",
    progressBg: "from-blue-500 to-indigo-500",
  },
  isReprocessing = false,
}) {
  if (!project) return null;

  const dueDate = project.estimatedCompletion || project.estimated_completion;

  return (
    <div
      className={`border rounded-2xl p-6 mb-6 transition-all duration-300 shadow-sm backdrop-blur-sm ${
        isReprocessing
          ? "bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 border-blue-200 shadow-lg shadow-blue-100/50"
          : `bg-gradient-to-r ${statusGradient.banner} ${statusGradient.bannerBorder}`
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {project.name}
            </h2>
            <Badge
              variant="outline"
              className={`${statusGradient.text} border-current`}
            >
              {project.status?.replace("-", " ").toUpperCase() || "ACTIVE"}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-3">
            <InfoPill icon={MapPin} label={project.location} />
            <InfoPill icon={Building2} label={project.client} />
            <InfoPill icon={Ruler} label={project.totalLength} />
            {dueDate && (
              <div className="flex items-center gap-2 bg-white/60 dark:bg-[#18181b]/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Due: {new Date(dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right min-w-[100px]">
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Progress
            </div>
            {isReprocessing ? (
              <div className="flex items-center justify-end gap-2">
                <div className="flex space-x-1">
                  <span
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span className="text-sm font-semibold text-blue-600">
                  Processing
                </span>
              </div>
            ) : project.status === "ai-processing" ? (
              <div className="flex items-center justify-end gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                <span className="text-lg font-bold text-violet-600">
                  AI Active
                </span>
              </div>
            ) : (
              <div
                className={`text-2xl font-bold bg-gradient-to-r ${statusGradient.textGradient} bg-clip-text text-transparent`}
              >
                {project.progress}%
              </div>
            )}
          </div>
        </div>
      </div>

      {(isReprocessing || project.status === "ai-processing") && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-[#27272a] rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full bg-gradient-to-r ${statusGradient.progressBg} animate-pulse`}
              style={{
                width: isReprocessing ? "30%" : `${project.progress}%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
            {isReprocessing
              ? "Starting AI reprocessing..."
              : "AI is analyzing the video footage"}
          </p>
        </div>
      )}
    </div>
  );
}

function InfoPill({ icon: Icon, label }) {
  if (!label) return null;
  return (
    <div className="flex items-center gap-2 bg-white/60 dark:bg-[#18181b]/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 dark:border-[#27272a] shadow-sm">
      <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </span>
    </div>
  );
}
