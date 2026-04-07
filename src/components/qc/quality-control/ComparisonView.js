"use client";

import React, { useState, memo, useCallback } from "react";
import {
  CheckCircle2, XCircle, AlertTriangle, Eye, Loader2, Hash, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import DetectionImage from "./DetectionImage";
import {
  normalizeConfidence,
  getConfidenceColor,
  getSeverityStyle,
} from "@/components/qc/constants";

const STATUS_ICON = {
  approved: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  rejected: <XCircle className="w-3.5 h-3.5 text-red-500" />,
  pending: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
};

const QueueItem = memo(({ detection, isSelected, onClick }) => {
  const status = detection.qcStatus || detection.status || "pending";
  const conf = normalizeConfidence(detection.confidence);
  const confColor = getConfidenceColor(conf);
  const label = detection.type || detection.defectType || "Detection";

  return (
    <button onClick={() => onClick(detection)}
      className={`w-full text-left p-3 rounded-xl border transition-all ${isSelected ? "border-amber-300 bg-amber-50 shadow-sm" : "border-gray-200 bg-white hover:border-amber-200"}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-mono text-gray-500 flex items-center gap-1">
          <Hash className="w-3 h-3" />{detection.frameNumber || 0}
        </span>
        {STATUS_ICON[status]}
      </div>
      <p className="text-xs font-semibold text-gray-900 truncate">{label}</p>
      <div className="flex items-center gap-1.5 mt-1.5">
        <Badge variant="outline" className={`text-[10px] ${confColor.bg} ${confColor.text} ${confColor.border}`}>
          {conf}%
        </Badge>
        {detection.severity && (
          <Badge variant="outline" className={`text-[10px] ${getSeverityStyle(detection.severity)?.bg || ""} ${getSeverityStyle(detection.severity)?.text || ""}`}>
            {detection.severity}
          </Badge>
        )}
      </div>
    </button>
  );
});
QueueItem.displayName = "QueueItem";

/**
 * ComparisonView — Side-by-side AI detection vs original frame viewer
 * Used as a view mode inside the Quality Control page.
 */
const ComparisonView = memo(({
  detections,
  selectedDetection,
  onSelectDetection,
  onReview,
  reviewingId,
}) => {
  const [notes, setNotes] = useState("");

  const pending = detections.filter(d => (d.qcStatus || d.status) === "pending");
  const status = selectedDetection ? (selectedDetection.qcStatus || selectedDetection.status || "pending") : null;
  const conf = selectedDetection ? normalizeConfidence(selectedDetection.confidence) : 0;
  const confColor = selectedDetection ? getConfidenceColor(conf) : {};

  const handleApprove = useCallback(() => {
    if (!selectedDetection) return;
    onReview(selectedDetection._id, "approved");
    setNotes("");
  }, [selectedDetection, onReview]);

  const handleReject = useCallback(() => {
    if (!selectedDetection) return;
    onReview(selectedDetection._id, "rejected");
    setNotes("");
  }, [selectedDetection, onReview]);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Detection queue sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-0">
        <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex-none">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-xs flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />Review Queue
            </h3>
            <span className="text-[10px] font-medium px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
              {pending.length} pending
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {detections.map(d => (
            <QueueItem
              key={d._id}
              detection={d}
              isSelected={selectedDetection?._id === d._id}
              onClick={onSelectDetection}
            />
          ))}
          {detections.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Eye className="w-6 h-6 mx-auto mb-1 opacity-30" />
              <p className="text-xs">No detections</p>
            </div>
          )}
        </div>
      </div>

      {/* Main comparison area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {selectedDetection ? (
          <>
            {/* Detection info bar */}
            <Card className="border-gray-200">
              <CardContent className="p-3 flex items-center gap-3 flex-wrap">
                <span className="text-sm font-bold text-gray-900">{selectedDetection.type || "Detection"}</span>
                <Badge variant="outline" className={`text-[10px] ${confColor.bg} ${confColor.text} ${confColor.border}`}>
                  Confidence: {conf}%
                </Badge>
                {selectedDetection.severity && (
                  <Badge variant="outline" className={`text-[10px] ${getSeverityStyle(selectedDetection.severity)?.bg || ""} ${getSeverityStyle(selectedDetection.severity)?.text || ""}`}>
                    {selectedDetection.severity}
                  </Badge>
                )}
                <Badge variant="outline" className={`text-[10px] capitalize ${status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : status === "rejected" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                  {status}
                </Badge>
                <span className="text-[10px] text-gray-400 ml-auto flex items-center gap-1">
                  <Hash className="w-3 h-3" />Frame {selectedDetection.frameNumber || 0}
                </span>
              </CardContent>
            </Card>

            {/* Side-by-side frames */}
            <div className="grid grid-cols-2 gap-3">
              <DetectionImage detection={selectedDetection} label="AI Detection View" colorClass="text-blue-500" />
              <DetectionImage detection={null} label="Original Frame" colorClass="text-red-600" />
            </div>

            {/* Notes + approve/reject */}
            <Card className="border-gray-200">
              <CardContent className="p-3.5">
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add reviewer notes (optional)…"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:ring-1 focus:ring-amber-300 mb-3"
                  rows={2}
                />
                {status === "pending" && (
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleApprove}
                      disabled={reviewingId === selectedDetection._id}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                    >
                      {reviewingId === selectedDetection._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Approve <kbd className="ml-1 text-[10px] opacity-60 font-mono bg-emerald-700/30 px-1 rounded">A</kbd>
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={reviewingId === selectedDetection._id}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white gap-1.5"
                    >
                      {reviewingId === selectedDetection._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Reject <kbd className="ml-1 text-[10px] opacity-60 font-mono bg-red-600/30 px-1 rounded">R</kbd>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Eye className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">Select a detection from the queue to compare</p>
            <p className="text-xs mt-1">Use <kbd className="font-mono border border-gray-300 rounded px-1 bg-white text-gray-600">↑</kbd><kbd className="font-mono border border-gray-300 rounded px-1 bg-white text-gray-600 ml-0.5">↓</kbd> to navigate</p>
          </div>
        )}
      </div>
    </div>
  );
});

ComparisonView.displayName = "ComparisonView";
export default ComparisonView;
