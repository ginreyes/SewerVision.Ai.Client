"use client";

import React, { useState } from "react";
import {
  Layers, ChevronLeft, ChevronRight, ZoomIn, CheckCircle2, XCircle,
  Eye, AlertTriangle, Maximize2, Minimize2, RotateCcw, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import { useQCAssignments, useProjectDetections, useReviewDetection } from "@/hooks/useQueryHooks";

const CONF_COLOR = (c) => c >= 85 ? "text-emerald-600 bg-emerald-50 border-emerald-200" : c >= 70 ? "text-amber-600 bg-amber-50 border-amber-200" : "text-red-600 bg-red-50 border-red-200";
const GRADE_COLORS = {
  "Grade 1": "bg-gray-100 text-gray-600", "Grade 2": "bg-blue-100 text-blue-700",
  "Grade 3": "bg-amber-100 text-amber-700", "Grade 4": "bg-orange-100 text-orange-700", "Grade 5": "bg-red-100 text-red-700",
};

function FramePlaceholder({ label, color }) {
  return (
    <div className={`relative rounded-xl flex items-center justify-center ${color}`} style={{ height: 260 }}>
      <div className="text-center opacity-50">
        <Eye className="w-10 h-10 mx-auto mb-2" />
        <p className="text-sm font-medium">{label}</p>
      </div>
      {/* Simulated detection box */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="border-2 border-yellow-400 rounded" style={{ width: 100, height: 60, position: "absolute", top: "35%", left: "35%" }}>
          <span className="absolute -top-4 left-0 text-[10px] bg-yellow-400 text-yellow-900 px-1 rounded font-medium">Detection</span>
        </div>
      </div>
    </div>
  );
}

export default function ComparisonViewer() {
  const { showAlert } = useAlert();
  const { user } = useUser();
  const userId = user?._id || user?.id;

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [splitMode, setSplitMode] = useState("side-by-side");
  const [notes, setNotes] = useState("");

  const { data: assignments = [], isLoading: assignmentsLoading } = useQCAssignments(userId, "all");
  const { data: detectionsData, isLoading: detectionsLoading } = useProjectDetections(
    selectedProjectId, "all"
  );

  const reviewMutation = useReviewDetection();

  const detections = detectionsData?.data || detectionsData || [];
  const reviews = Array.isArray(detections) ? detections : [];

  // Auto-select first project if none selected
  React.useEffect(() => {
    if (!selectedProjectId && assignments.length > 0) {
      const projId = assignments[0]?.projectId?._id || assignments[0]?.projectId;
      if (projId) setSelectedProjectId(projId);
    }
  }, [assignments, selectedProjectId]);

  // Auto-select first detection
  React.useEffect(() => {
    if (!selectedId && reviews.length > 0) {
      setSelectedId(reviews[0]?.id || reviews[0]?._id);
    }
  }, [reviews, selectedId]);

  const review = reviews.find(r => (r.id || r._id) === selectedId);
  const pending = reviews.filter(r => r.status === "pending" || r.qcStatus === "pending");

  function handleDecision(decision) {
    const detectionId = review?.id || review?._id;
    reviewMutation.mutate(
      { detectionId, status: decision, notes },
      {
        onSuccess: () => {
          showAlert(decision === "approved" ? "Detection approved" : "Detection rejected", decision === "approved" ? "success" : "error");
          const next = pending.find(r => (r.id || r._id) !== selectedId);
          if (next) setSelectedId(next.id || next._id);
        },
      }
    );
  }

  if (assignmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Comparison Viewer</h1>
            <p className="text-sm text-gray-500">Side-by-side AI detection vs manual review with annotation tools</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Project selector */}
          {assignments.length > 1 && (
            <select
              value={selectedProjectId || ""}
              onChange={e => { setSelectedProjectId(e.target.value); setSelectedId(null); }}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white mr-2"
            >
              {assignments.map(a => {
                const pId = a.projectId?._id || a.projectId;
                const pName = a.projectId?.name || pId;
                return <option key={pId} value={pId}>{pName}</option>;
              })}
            </select>
          )}
          {["side-by-side","overlay"].map(m => (
            <button key={m} onClick={() => setSplitMode(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize ${splitMode === m ? "bg-rose-600 text-white border-rose-600" : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"}`}>
              {m.replace("-"," ")}
            </button>
          ))}
        </div>
      </div>

      {detectionsLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
        </div>
      ) : (
        <div className="flex gap-4">
          {/* Review queue */}
          <div className="w-64 shrink-0 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Review Queue ({pending.length} pending)</p>
            {reviews.map(r => {
              const rId = r.id || r._id;
              const rStatus = r.qcStatus || r.status || "pending";
              return (
                <button key={rId} onClick={() => setSelectedId(rId)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${selectedId === rId ? "border-rose-300 bg-rose-50" : "border-gray-200 bg-white hover:border-rose-200"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-500">{r.project || r.projectId?.name || ""} #{r.frame || r.frameNumber || ""}</span>
                    {rStatus === "approved" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    {rStatus === "rejected" && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                    {rStatus === "pending" && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <p className="text-xs font-medium text-gray-900">{r.aiLabel || r.label || r.defectType || ""}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant="outline" className={`text-[10px] ${GRADE_COLORS[r.grade] || ""}`}>{r.grade || ""}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${CONF_COLOR(r.aiConfidence || r.confidence || 0)}`}>{r.aiConfidence || r.confidence || 0}%</Badge>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main viewer */}
          <div className="flex-1 min-w-0 space-y-3">
            {review && (
              <>
                {/* Detection info */}
                <Card className="border-gray-200">
                  <CardContent className="p-3.5 flex items-center gap-4 flex-wrap">
                    <div><span className="text-xs text-gray-500">Project:</span> <span className="text-xs font-bold text-gray-900 ml-1">{review.project || review.projectId?.name || ""}</span></div>
                    <div><span className="text-xs text-gray-500">Frame:</span> <span className="text-xs font-bold text-gray-900 ml-1">#{review.frame || review.frameNumber || ""}</span></div>
                    <div><span className="text-xs text-gray-500">AI Label:</span> <span className="text-xs font-bold text-gray-900 ml-1">{review.aiLabel || review.label || review.defectType || ""}</span></div>
                    <Badge variant="outline" className={`text-[10px] ${CONF_COLOR(review.aiConfidence || review.confidence || 0)}`}>AI Confidence: {review.aiConfidence || review.confidence || 0}%</Badge>
                    <Badge variant="outline" className={`text-[10px] ${GRADE_COLORS[review.grade] || ""}`}>{review.grade || ""}</Badge>
                    <Badge variant="outline" className={`text-[10px] capitalize ${(review.qcStatus || review.status) === "approved" ? "bg-emerald-50 text-emerald-700" : (review.qcStatus || review.status) === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{review.qcStatus || review.status || "pending"}</Badge>
                  </CardContent>
                </Card>

                {/* Frame viewer */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-blue-500" />AI Detection View</p>
                    <FramePlaceholder label="AI Annotated Frame" color="bg-blue-50 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-rose-500" />Manual Review View</p>
                    <FramePlaceholder label="Original Frame" color="bg-rose-50 text-rose-400" />
                  </div>
                </div>

                {/* Notes + decision */}
                <Card className="border-gray-200">
                  <CardContent className="p-3.5">
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add reviewer notes…"
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:ring-1 focus:ring-rose-300 mb-3" rows={2} />
                    {(review.qcStatus || review.status) === "pending" && (
                      <div className="flex items-center gap-3">
                        <Button onClick={() => handleDecision("approved")} disabled={reviewMutation.isPending} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </Button>
                        <Button onClick={() => handleDecision("rejected")} disabled={reviewMutation.isPending} className="flex-1 bg-red-500 hover:bg-red-600 text-white gap-1.5">
                          <XCircle className="w-4 h-4" /> Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
