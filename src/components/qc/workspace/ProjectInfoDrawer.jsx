"use client";

/**
 * ProjectInfoDrawer
 * ─────────────────
 * Collapsible bottom-sheet / inline panel shown inside the QC Review Workspace's
 * top-bar. Opens from the Info (ℹ) button. Surfaces the project metadata the
 * tech used to see on the old /qc-technician/project/[id] page (device, work
 * order, pipeline, operator, recording date, etc.) without taking them out of
 * the review flow.
 *
 * Props:
 *   - open        boolean   controlled open state
 *   - onClose     fn        called when user clicks the backdrop or close btn
 *   - project     object    the active project record
 *                           (expects shape from getQCAssignments populate:
 *                            { name, client, location, status, priority,
 *                              totalLength, estimated_completion, assignedDevice,
 *                              assignedOperator, pipeline info, … })
 *
 * The component is null-safe — every row only renders when the backing field
 * is populated, so missing data collapses silently instead of showing "—".
 */

import React from "react";
import {
  X, Monitor, Calendar, Ruler, MapPin, Building2, User,
  Wrench, FileText, Clock, Activity,
} from "lucide-react";

function Row({ icon: Icon, label, value, mono = false }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-b-0">
      <div className="w-5 h-5 rounded bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3 h-3 text-red-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-sm text-gray-800 truncate ${mono ? "font-mono tabular-nums" : ""}`} title={String(value)}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default function ProjectInfoDrawer({ open, onClose, project }) {
  if (!open) return null;

  // Normalize — `project` may be the assignment wrapper or the project itself
  const p = project?.projectId && typeof project.projectId === "object"
    ? project.projectId
    : project;
  if (!p) {
    return null;
  }

  const device = p.assignedDevice;
  const deviceName = device && typeof device === "object"
    ? [device.name, device.model].filter(Boolean).join(" · ")
    : null;

  const operator = p.assignedOperator?.userId || p.assignedOperator;
  const operatorName = operator && typeof operator === "object"
    ? [operator.first_name, operator.last_name].filter(Boolean).join(" ") || operator.email
    : null;

  const qcTech = p.qcTechnician?.userId || p.qcTechnician;
  const qcName = qcTech && typeof qcTech === "object"
    ? [qcTech.first_name, qcTech.last_name].filter(Boolean).join(" ") || qcTech.email
    : null;

  const recordingDate = p.recordingDate || p.recording_date;
  const dueDate = p.estimated_completion;
  const createdDate = p.created_at || p.createdAt;

  // Pipeline fields — name varies across the project schema
  const pipelineMaterial = p.pipelineMaterial || p.pipeMaterial || p.pipe_material;
  const pipelineShape = p.pipelineShape || p.pipeShape || p.pipe_shape;
  const upstreamMH = p.upstreamMH || p.upstream_mh;
  const downstreamMH = p.downstreamMH || p.downstream_mh;
  const workOrder = p.workOrder || p.work_order || p.workOrderNumber;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel — absolute inside the workspace top bar region */}
      <div className="fixed top-20 right-4 w-96 max-h-[70vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
        <div className="sticky top-0 bg-gradient-to-r from-red-700 to-amber-500 px-4 py-3 flex items-center justify-between rounded-t-2xl">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">Project Info</p>
            <h3 className="text-sm font-bold text-white truncate" title={p.name || "Project"}>{p.name || "Project"}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-0">
          <Row icon={Building2} label="Client" value={p.client} />
          <Row icon={MapPin} label="Location" value={p.location} />
          <Row icon={FileText} label="Work order" value={workOrder} />
          <Row icon={Activity} label="Status" value={p.status ? p.status.replace(/-/g, " ") : null} />
          <Row icon={Ruler} label="Total length" value={p.totalLength} />
          <Row icon={Wrench} label="Pipeline material" value={pipelineMaterial} />
          <Row icon={Wrench} label="Pipeline shape" value={pipelineShape} />
          <Row icon={MapPin} label="Upstream MH" value={upstreamMH} />
          <Row icon={MapPin} label="Downstream MH" value={downstreamMH} />
          <Row icon={Monitor} label="Device" value={deviceName} />
          <Row icon={User} label="Operator" value={operatorName} />
          <Row icon={User} label="QC technician" value={qcName} />
          <Row icon={Calendar} label="Recording date" value={recordingDate ? new Date(recordingDate).toLocaleDateString() : null} />
          <Row icon={Calendar} label="Due date" value={dueDate ? new Date(dueDate).toLocaleDateString() : null} />
          <Row icon={Clock} label="Created" value={createdDate ? new Date(createdDate).toLocaleDateString() : null} />
        </div>
      </div>
    </>
  );
}
