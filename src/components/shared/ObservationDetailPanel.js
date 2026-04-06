"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Edit3, Save, X, PlayCircle, Trash2, Bot, Clock,
  Ruler, MapPin, RotateCcw, Percent, ChevronRight, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet, SheetContent, SheetTitle,
} from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { api } from "@/lib/helper";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const severityConfig = {
  high:   { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", label: "High" },
  medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", label: "Medium" },
  low:    { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500", label: "Low" },
};

function getSnapshotSrc(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${BACKEND_URL}/api/videos/snapshot/${url}`;
}

/** Parse "HH:MM:SS" to total seconds */
function timeToSeconds(t) {
  if (!t) return 0;
  const parts = String(t).split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

// ── Before/After Comparison Slider ──────────────────────────────────
function BeforeAfterViewer({ beforeSrc, afterSrc, pacpCode, confidence }) {
  const containerRef = useRef(null);
  const [sliderPos, setSliderPos] = useState(50);
  const dragging = useRef(false);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  useEffect(() => {
    const onMove = (e) => { if (dragging.current) handleMove(e.touches ? e.touches[0].clientX : e.clientX); };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [handleMove]);

  if (!afterSrc) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-400">
        No snapshot available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-medium">
        <span className="text-emerald-600">Clean Frame</span>
        <span className="text-red-600">Defect — {pacpCode}{confidence != null ? ` (${confidence}%)` : ""}</span>
      </div>
      <div
        ref={containerRef}
        className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 cursor-col-resize select-none bg-gray-900"
        onMouseDown={() => { dragging.current = true; }}
        onTouchStart={() => { dragging.current = true; }}
      >
        {/* After (full background) */}
        <img src={afterSrc} alt="Defect frame" className="absolute inset-0 w-full h-full object-cover" draggable={false} />

        {/* Before (clipped by slider) */}
        {beforeSrc ? (
          <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
            <img src={beforeSrc} alt="Clean frame" className="absolute inset-0 w-full h-full object-cover" style={{ width: containerRef.current?.offsetWidth || "100%" }} draggable={false} />
          </div>
        ) : (
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center bg-gray-800/80" style={{ width: `${sliderPos}%` }}>
            <span className="text-xs text-gray-400">No clean reference</span>
          </div>
        )}

        {/* Slider line + handle */}
        <div className="absolute top-0 bottom-0" style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}>
          <div className="w-0.5 h-full bg-white/90 shadow-md" />
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg border-2 border-gray-300 flex items-center justify-center">
            <ChevronRight className="h-3 w-3 text-gray-500 -ml-0.5" />
            <ChevronRight className="h-3 w-3 text-gray-500 rotate-180 -mr-0.5" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-600/80 text-white text-[10px] font-medium">
          Before
        </div>
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-red-600/80 text-white text-[10px] font-medium">
          After
        </div>
      </div>
    </div>
  );
}

// ── Info field display ──────────────────────────────────────────────
function InfoField({ icon: Icon, label, value, editing, onChange, type = "text" }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        {editing ? (
          <Input value={value || ""} onChange={(e) => onChange(e.target.value)} className="h-7 text-sm" type={type} />
        ) : (
          <p className="text-sm text-gray-800 font-medium">{value || "—"}</p>
        )}
      </div>
    </div>
  );
}

// ── Main Detail Panel ───────────────────────────────────────────────
export default function ObservationDetailPanel({
  open,
  onOpenChange,
  observation,
  projectId,
  videoRef,
  onDelete,
  onUpdate,
  onGoToTime,
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [beforeFrame, setBeforeFrame] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reset state when observation changes
  useEffect(() => {
    if (observation) {
      setForm({ ...observation });
      setEditing(false);
      setBeforeFrame(null);
      captureCleanFrame(observation);
    }
  }, [observation?._id]);

  // Capture a "clean" frame from video by seeking a few seconds before the defect
  const captureCleanFrame = useCallback((obs) => {
    if (!videoRef?.current || !obs?.time) return;
    const video = videoRef.current;
    const defectTime = timeToSeconds(obs.time);
    const cleanTime = Math.max(0, defectTime - 3);

    const prevTime = video.currentTime;
    const onSeeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setBeforeFrame(canvas.toDataURL("image/jpeg", 0.85));
      } catch {}
      video.removeEventListener("seeked", onSeeked);
      video.currentTime = prevTime;
    };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = cleanTime;
  }, [videoRef]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { ok } = await api(`/api/observations/update-observation/${form._id}`, "PUT", {
        distance: form.distance,
        pacpCode: form.pacpCode,
        observation: form.observation,
        time: form.time,
        remarks: form.remarks,
        severity: form.severity,
        clockPosition: form.clockPosition,
        length: form.length,
        width: form.width,
        percentage: form.percentage,
        joint: form.joint,
        continuous: form.continuous,
      });
      if (ok) {
        setEditing(false);
        onUpdate?.(form);
      }
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { ok } = await api(`/api/observations/delete-observation/${observation._id}`, "DELETE");
      if (ok) { onDelete?.(observation._id); onOpenChange(false); }
    } catch {} finally { setDeleting(false); setDeleteConfirm(false); }
  };

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  if (!observation) return null;

  const sev = severityConfig[form.severity] || severityConfig.low;
  const confidence = observation.confidence != null
    ? (observation.confidence > 1 ? observation.confidence : Math.round(observation.confidence * 100))
    : null;
  const snapshotSrc = getSnapshotSrc(observation.snapshotUrl);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl p-0 overflow-y-auto" showCloseButton={false}>
        <VisuallyHidden.Root><SheetTitle>Observation Details</SheetTitle></VisuallyHidden.Root>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                {form.pacpCode || "—"}
              </span>
              {observation.aiGenerated && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-violet-50 text-violet-600 border border-violet-100">
                  <Bot className="h-2.5 w-2.5" />
                  AI{confidence != null ? ` ${confidence}%` : ""}
                </span>
              )}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${sev.bg} ${sev.text} ${sev.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                {sev.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {!editing ? (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(true)}>
                  <Edit3 className="h-4 w-4 text-gray-500" />
                </Button>
              ) : (
                <>
                  <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={saving}>
                    <Save className="h-3 w-3 mr-1" />{saving ? "Saving..." : "Save"}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setEditing(false); setForm({ ...observation }); }}>
                    Cancel
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1.5 truncate">{form.observation || "Observation details"}</p>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            <InfoField icon={Ruler} label="Distance" value={form.distance} editing={editing} onChange={(v) => setField("distance", v)} />
            <InfoField icon={Clock} label="Time" value={form.time} editing={editing} onChange={(v) => setField("time", v)} />
            <InfoField icon={MapPin} label="Clock Position" value={form.clockPosition} editing={editing} onChange={(v) => setField("clockPosition", v)} />
            <InfoField icon={Layers} label="Joint" value={form.joint} editing={editing} onChange={(v) => setField("joint", v)} />
            <InfoField icon={Ruler} label="Length" value={form.length} editing={editing} onChange={(v) => setField("length", v)} />
            <InfoField icon={Ruler} label="Width" value={form.width} editing={editing} onChange={(v) => setField("width", v)} />
            <InfoField icon={Percent} label="Percentage" value={form.percentage} editing={editing} onChange={(v) => setField("percentage", v)} />
            <InfoField icon={RotateCcw} label="Continuous" value={form.continuous ? "Yes" : "No"} editing={false} />
          </div>

          {/* Severity selector in edit mode */}
          {editing && (
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Severity</p>
              <div className="flex gap-2">
                {(["low", "medium", "high"]).map((s) => {
                  const sc = severityConfig[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setField("severity", s)}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                        form.severity === s
                          ? `${sc.bg} ${sc.text} ${sc.border} ring-2 ring-offset-1 ring-${s === "high" ? "red" : s === "medium" ? "amber" : "green"}-200`
                          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {sc.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Description</p>
            {editing ? (
              <Textarea value={form.observation || ""} onChange={(e) => setField("observation", e.target.value)} className="text-sm min-h-[60px]" />
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed">{form.observation || "—"}</p>
            )}
          </div>

          {/* Remarks */}
          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Remarks</p>
            {editing ? (
              <Textarea value={form.remarks || ""} onChange={(e) => setField("remarks", e.target.value)} className="text-sm min-h-[60px]" />
            ) : (
              <p className="text-sm text-gray-500 leading-relaxed">{form.remarks || "No remarks"}</p>
            )}
          </div>

          {/* Before/After Snapshot Viewer */}
          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Snapshot Comparison</p>
            <BeforeAfterViewer
              beforeSrc={beforeFrame}
              afterSrc={snapshotSrc}
              pacpCode={observation.pacpCode}
              confidence={confidence}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => { onGoToTime?.(observation); onOpenChange(false); }}
            >
              <PlayCircle className="h-3.5 w-3.5 mr-1.5" />
              Go to Time
            </Button>
            <div className="flex-1" />
            {!deleteConfirm ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setDeleteConfirm(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600 font-medium">Delete?</span>
                <Button size="sm" className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "..." : "Yes"}
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setDeleteConfirm(false)}>
                  No
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
