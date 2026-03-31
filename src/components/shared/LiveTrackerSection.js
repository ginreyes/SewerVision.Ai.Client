"use client";

import React, { memo, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  MapPin, ChevronUp, ChevronDown, CheckCircle2, Circle, Clock,
  Users, Navigation, Loader2, Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Dynamic import — Leaflet needs window/document
const ProjectMap = dynamic(() => import("@/components/customer/ProjectMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl bg-gray-50 flex items-center justify-center" style={{ height: 180 }}>
      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
    </div>
  ),
});

const STATUS_STEPS = {
  planning: ["Project Created", "Planning", "Site Preparation", "CCTV Inspection", "QC Review", "Report Delivery"],
  "field-capture": ["Project Created", "Site Preparation", "CCTV Inspection", "QC Review", "Report Delivery"],
  uploading: ["Project Created", "CCTV Inspection", "Uploading Data", "AI Processing", "QC Review", "Report Delivery"],
  "ai-processing": ["Project Created", "CCTV Inspection", "AI Processing", "QC Review", "Report Delivery"],
  "qc-review": ["Project Created", "CCTV Inspection", "AI Processing", "QC Review", "Report Delivery"],
  completed: ["Project Created", "CCTV Inspection", "QC Review", "Report Delivered"],
  "customer-notified": ["Project Created", "CCTV Inspection", "QC Review", "Report Delivered"],
};

const STATUS_PCT = {
  planning: 10, "field-capture": 30, uploading: 45, "ai-processing": 55,
  "qc-review": 75, completed: 100, "customer-notified": 100, "on-hold": 0,
};

function buildTimeline(status) {
  const steps = STATUS_STEPS[status] || STATUS_STEPS["field-capture"];
  const pct = STATUS_PCT[status] ?? 0;
  const completedCount = Math.floor((pct / 100) * steps.length);
  return steps.map((label, idx) => ({
    label,
    done: idx < completedCount,
    active: idx === completedCount,
  }));
}

/**
 * LiveTrackerSection — collapsible map + timeline section for project detail pages.
 * Shared across Admin, Operator, User, and QC Technician roles.
 */
const LiveTrackerSection = memo(function LiveTrackerSection({
  project,
  expanded = false,
  onToggle,
  height = 180,
}) {
  if (!project) return null;

  const status = project.status || "planning";
  const pct = project.progress || STATUS_PCT[status] || 0;
  const timeline = useMemo(() => buildTimeline(status), [status]);

  const operatorName = project.assignedOperator?.userId
    ? `${project.assignedOperator.userId.first_name || ""} ${project.assignedOperator.userId.last_name || ""}`.trim()
    : null;
  const qcName = project.qcTechnician?.userId
    ? `${project.qcTechnician.userId.first_name || ""} ${project.qcTechnician.userId.last_name || ""}`.trim()
    : null;

  const isActive = ["field-capture", "uploading", "ai-processing", "qc-review"].includes(status);

  return (
    <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-xl border border-emerald-100/50 overflow-hidden">
      {/* Header */}
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-emerald-50/50 transition-colors">
        <div className="flex items-center gap-2">
          {expanded ? <ChevronUp className="w-4 h-4 text-emerald-500" /> : <ChevronDown className="w-4 h-4 text-emerald-500" />}
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-sm text-gray-800">LIVE TRACKER</span>
          {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
        </div>
        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
          {pct}%
        </Badge>
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Map */}
          <ProjectMap
            projects={[project]}
            selected={project._id}
            height={height}
          />

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">Progress</span>
              <span className="text-xs font-bold text-emerald-600">{pct}%</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden border border-emerald-100">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Team info */}
          {(operatorName || qcName) && (
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <Users className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>{[operatorName, qcName].filter(Boolean).join(" + ") || "Not assigned"}</span>
            </div>
          )}

          {/* Location */}
          {project.location && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Navigation className="w-3 h-3 text-emerald-500 shrink-0" />
              <span className="truncate">{project.location}</span>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Timeline</p>
            {timeline.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                {step.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : step.active ? (
                  <Activity className="w-3.5 h-3.5 text-blue-500 shrink-0 animate-pulse" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                )}
                <span className={`text-xs ${step.done ? "text-gray-400 line-through" : step.active ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default LiveTrackerSection;
