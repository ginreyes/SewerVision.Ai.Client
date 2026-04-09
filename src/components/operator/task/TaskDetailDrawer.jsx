"use client";

import React from "react";
import {
  MapPin,
  Camera,
  Clock,
  User,
  Calendar,
  Flag,
  Brain,
  Film,
  TrendingUp,
  Gauge,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  "in-progress": "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  urgent: "bg-red-100 text-red-700 border-red-200",
};

const PRIORITY_STYLES = {
  low: "bg-gray-100 text-gray-700 border-gray-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

const AI_STYLES = {
  pending: "bg-gray-100 text-gray-600",
  processing: "bg-blue-100 text-blue-700",
  ready: "bg-teal-100 text-teal-700",
  completed: "bg-emerald-100 text-emerald-700",
};

const formatDateTime = (value) => {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  } catch {
    return String(value);
  }
};

const DetailRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3 py-2.5">
    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-gray-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">{label}</p>
      <div className="text-sm text-gray-900 mt-0.5 break-words">{children || "—"}</div>
    </div>
  </div>
);

/**
 * TaskDetailDrawer — right-side sheet showing operator task details.
 *
 * @param {{
 *   open: boolean,
 *   onOpenChange: (open: boolean) => void,
 *   task: any | null,
 * }} props
 */
export default function TaskDetailDrawer({ open, onOpenChange, task }) {
  if (!task) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Task Details</SheetTitle>
            <SheetDescription>No task selected</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  const statusClass = STATUS_STYLES[task.status] || "bg-gray-100 text-gray-700 border-gray-200";
  const priorityClass =
    PRIORITY_STYLES[task.priority] || "bg-gray-100 text-gray-700 border-gray-200";
  const aiClass = AI_STYLES[task.aiProcessing] || "bg-gray-100 text-gray-600";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-lg leading-tight text-left">{task.title}</SheetTitle>
              {task.description && (
                <SheetDescription className="text-left mt-1">{task.description}</SheetDescription>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={`${statusClass} capitalize font-medium`}>
              {task.status === "completed" ? (
                <CheckCircle2 className="w-3 h-3 mr-1" />
              ) : task.status === "urgent" ? (
                <AlertCircle className="w-3 h-3 mr-1" />
              ) : (
                <Clock className="w-3 h-3 mr-1" />
              )}
              {task.status?.replace("-", " ")}
            </Badge>
            <Badge variant="outline" className={`${priorityClass} capitalize font-medium`}>
              <Flag className="w-3 h-3 mr-1" />
              {task.priority}
            </Badge>
            {task.type && (
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 capitalize">
                {task.type}
              </Badge>
            )}
          </div>
        </SheetHeader>

        {/* Progress */}
        {typeof task.progress === "number" && (
          <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Progress
              </span>
              <span className="text-sm font-bold text-blue-700">{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-2" />
          </div>
        )}

        {/* Details list */}
        <div className="mt-4 divide-y divide-gray-100">
          <DetailRow icon={User} label="Assignee">
            {task.assignee}
          </DetailRow>
          <DetailRow icon={MapPin} label="Location">
            {task.location}
          </DetailRow>
          <DetailRow icon={Camera} label="Device">
            {task.device}
          </DetailRow>
          <DetailRow icon={Calendar} label="Start Time">
            {formatDateTime(task.startTime)}
          </DetailRow>
          <DetailRow icon={Clock} label="Estimated Duration">
            {task.estimatedDuration}
          </DetailRow>
          {task.aiProcessing && (
            <DetailRow icon={Brain} label="AI Processing">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${aiClass}`}>
                {task.aiProcessing}
              </span>
            </DetailRow>
          )}
          {task.footage && (
            <DetailRow icon={Film} label="Footage">
              {task.footage}
            </DetailRow>
          )}
          {typeof task.confidence === "number" && (
            <DetailRow icon={Gauge} label="Confidence">
              {task.confidence}%
            </DetailRow>
          )}
          {typeof task.totalDetections === "number" && (
            <DetailRow icon={TrendingUp} label="Detections">
              {task.reviewedDetections ?? 0} / {task.totalDetections} reviewed
            </DetailRow>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
