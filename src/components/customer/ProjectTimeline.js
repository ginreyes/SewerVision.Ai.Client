"use client";

import {
  CheckCircle, Circle, Clock, Upload, Zap, Shield,
  FileText, Bell, Pause, MapPin,
} from "lucide-react";

const STATUS_CONFIG = {
  planning:           { icon: Circle,      color: "text-slate-500",   bg: "bg-slate-100",   line: "bg-slate-300",  label: "Planning" },
  "field-capture":    { icon: MapPin,      color: "text-blue-600",    bg: "bg-blue-100",    line: "bg-blue-400",   label: "Field Capture" },
  uploading:          { icon: Upload,      color: "text-cyan-600",    bg: "bg-cyan-100",    line: "bg-cyan-400",   label: "Uploading" },
  "ai-processing":   { icon: Zap,         color: "text-violet-600",  bg: "bg-violet-100",  line: "bg-violet-400", label: "AI Processing" },
  "qc-review":       { icon: Shield,      color: "text-amber-600",   bg: "bg-amber-100",   line: "bg-amber-400",  label: "QC Review" },
  completed:          { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100", line: "bg-emerald-400",label: "Completed" },
  "customer-notified":{ icon: Bell,        color: "text-green-600",   bg: "bg-green-100",   line: "bg-green-400",  label: "Customer Notified" },
  "on-hold":          { icon: Pause,       color: "text-red-500",     bg: "bg-red-100",     line: "bg-red-300",    label: "On Hold" },
};

const formatDate = (d) => {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const getDuration = (from, to) => {
  if (!from || !to) return null;
  const ms = new Date(to).getTime() - new Date(from).getTime();
  if (ms < 0) return null;
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
};

const ProjectTimeline = ({ project }) => {
  const history = project?.statusHistory || [];
  const currentStatus = project?.status;

  // Build timeline from statusHistory, or fallback to milestone dates
  const steps = history.length > 0
    ? history.map((h, i) => ({
        status: h.status,
        date: h.changedAt,
        duration: i > 0 ? getDuration(history[i - 1].changedAt, h.changedAt) : null,
        isCurrent: i === history.length - 1 && h.status === currentStatus,
      }))
    : buildFallbackSteps(project);

  if (steps.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No timeline data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const cfg = STATUS_CONFIG[step.status] || STATUS_CONFIG.planning;
        const Icon = cfg.icon;
        const isLast = i === steps.length - 1;

        return (
          <div key={i} className="flex gap-4">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center w-8 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cfg.bg} ${step.isCurrent ? 'ring-2 ring-offset-2 ring-emerald-400' : ''}`}>
                <Icon className={`w-4 h-4 ${cfg.color}`} />
              </div>
              {!isLast && <div className={`w-0.5 flex-1 min-h-[32px] ${cfg.line}`} />}
            </div>

            {/* Content */}
            <div className={`pb-6 flex-1 ${isLast ? '' : ''}`}>
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${step.isCurrent ? 'text-emerald-700' : 'text-gray-800'}`}>
                  {cfg.label}
                </p>
                {step.isCurrent && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Current</span>
                )}
              </div>
              {step.date && (
                <p className="text-xs text-gray-500 mt-0.5">{formatDate(step.date)}</p>
              )}
              {step.duration && (
                <p className="text-[10px] text-gray-400 mt-0.5">Duration: {step.duration}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Fallback: build steps from milestone date fields when no statusHistory exists
const buildFallbackSteps = (project) => {
  if (!project) return [];
  const steps = [];

  steps.push({ status: "planning", date: project.created_at || project.createdAt, isCurrent: project.status === "planning" });

  if (project.uploaded_at) {
    steps.push({ status: "uploading", date: project.uploaded_at, duration: getDuration(project.created_at, project.uploaded_at) });
  }

  if (project.ai_processing_start) {
    steps.push({ status: "ai-processing", date: project.ai_processing_start, duration: getDuration(project.uploaded_at || project.created_at, project.ai_processing_start) });
  }

  if (project.ai_processing_complete) {
    steps.push({ status: "qc-review", date: project.ai_processing_complete, duration: getDuration(project.ai_processing_start, project.ai_processing_complete) });
  }

  if (project.status === "completed" || project.status === "customer-notified") {
    steps.push({ status: project.status, date: project.updated_at || project.updatedAt, isCurrent: true });
  }

  // Mark last step as current if not already
  if (steps.length > 0 && !steps.some((s) => s.isCurrent)) {
    steps[steps.length - 1].isCurrent = true;
  }

  return steps;
};

export default ProjectTimeline;
