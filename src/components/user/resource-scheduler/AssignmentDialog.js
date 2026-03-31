"use client";

import React, { useState, memo } from "react";
import { X, Trash2, CalendarDays, FolderOpen, Wrench, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ASSIGNMENT_COLORS } from "./DataTypes";

const TYPES = ["Inspection", "QC Review", "Setup", "Maintenance"];
const TYPE_COLORS = {
  Inspection: "bg-blue-100 text-blue-700",
  "QC Review": "bg-rose-100 text-rose-700",
  Setup: "bg-emerald-100 text-emerald-700",
  Maintenance: "bg-amber-100 text-amber-700",
};

/**
 * Dialog for creating or viewing/deleting a resource assignment.
 * Shows as an overlay when clicking a schedule cell.
 */
const AssignmentDialog = memo(function AssignmentDialog({
  open,
  onClose,
  assignment, // null = create mode, object = view mode
  member,
  dayLabel,
  dayOfWeek,
  weekStart,
  projects = [],
  creating,
  deleting,
  onCreate,
  onDelete,
}) {
  const [projectId, setProjectId] = useState("");
  const [type, setType] = useState("Inspection");
  const [notes, setNotes] = useState("");

  if (!open) return null;

  const isViewMode = !!assignment;
  const selectedProject = projects.find(p => p._id === projectId);

  function handleCreate() {
    if (!projectId) return;
    const project = projects.find(p => p._id === projectId);
    const color = ASSIGNMENT_COLORS[type] || "bg-blue-500";
    onCreate({
      teamMember: member._id,
      projectId,
      projectCode: project?.workOrder || project?.name || "Project",
      type,
      dayOfWeek,
      weekStart,
      color,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                {isViewMode ? "Assignment Details" : "New Assignment"}
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                {member?.name} · {dayLabel}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          {isViewMode ? (
            /* View Mode */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className={`w-3 h-8 rounded-full ${assignment.color || 'bg-blue-500'}`} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{assignment.projectCode || assignment.project || "Project"}</p>
                  <Badge variant="outline" className={`text-[10px] mt-0.5 ${TYPE_COLORS[assignment.type] || ""}`}>{assignment.type}</Badge>
                </div>
              </div>

              {assignment.notes && (
                <div>
                  <Label className="text-xs text-gray-500">Notes</Label>
                  <p className="text-sm text-gray-700 mt-1">{assignment.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" onClick={onClose} className="px-4">Close</Button>
                <Button variant="destructive" size="sm" className="gap-1.5"
                  disabled={deleting}
                  onClick={() => onDelete(assignment._id)}>
                  {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            /* Create Mode */
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  <FolderOpen className="w-3.5 h-3.5 inline mr-1" />Project
                </Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select a project..." /></SelectTrigger>
                  <SelectContent>
                    {projects.map(p => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name || p.workOrder || "Project"} {p.workOrder ? `(${p.workOrder})` : ""}
                      </SelectItem>
                    ))}
                    {projects.length === 0 && (
                      <div className="px-3 py-2 text-xs text-gray-400">No projects available</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                  <Wrench className="w-3.5 h-3.5 inline mr-1" />Activity Type
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map(t => (
                      <SelectItem key={t} value={t}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${ASSIGNMENT_COLORS[t] || 'bg-gray-400'}`} />
                          {t}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Notes (optional)</Label>
                <Input value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Site A, morning shift..."
                  className="h-10" />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleCreate} disabled={!projectId || creating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CalendarDays className="w-3.5 h-3.5" />}
                  Assign
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default AssignmentDialog;
