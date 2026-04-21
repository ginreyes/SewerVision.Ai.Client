"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Target, Undo2, Send, Eye, Clock, Award, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import BoundingBoxCanvas from "./BoundingBoxCanvas";
import { getSnapshotUrl } from "@/lib/getVideoUrl";
import { PACP_TYPES } from "./constants";

/**
 * DefectExercisePlayer — interactive defect identification exercise.
 * The user draws bounding boxes on a pipeline image and classifies each
 * with a PACP code. On submit, the server scores the attempt against
 * the ground truth.
 *
 * Props:
 *   exercise — { _id, title, description, imageUrl, defectCount, hints[] }
 *   onSubmit — async ({ exerciseId, userMarks, timeSpent }) => result
 *   onBack   — () => void
 */
export default function DefectExercisePlayer({ exercise, onSubmit, onBack }) {
  const [userMarks, setUserMarks] = useState([]);
  const [selectedCode, setSelectedCode] = useState(PACP_TYPES[0]?.code || "FSL");
  const [pendingBox, setPendingBox] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timer, setTimer] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const timerRef = useRef(null);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const imgUrl = useMemo(
    () => getSnapshotUrl(exercise?.imageUrl),
    [exercise?.imageUrl]
  );

  const confirmMark = useCallback(() => {
    if (!pendingBox) return;
    const codeInfo = PACP_TYPES.find(p => p.code === selectedCode) || PACP_TYPES[0];
    setUserMarks(prev => [...prev, {
      type: codeInfo.type,
      pacpCode: selectedCode,
      label: codeInfo.label,
      boundingBox: pendingBox,
    }]);
    setPendingBox(null);
  }, [pendingBox, selectedCode]);

  const removeMark = useCallback((idx) => {
    setUserMarks(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const undoLast = useCallback(() => {
    if (pendingBox) { setPendingBox(null); return; }
    setUserMarks(prev => prev.slice(0, -1));
  }, [pendingBox]);

  const handleSubmit = useCallback(async () => {
    clearInterval(timerRef.current);
    setSubmitted(true);
    if (onSubmit) {
      const res = await onSubmit({
        exerciseId: exercise?._id || exercise?.id,
        userMarks,
        timeSpent: timer,
      });
      if (res) setResult(res);
    }
  }, [onSubmit, exercise, userMarks, timer]);

  const allBoxes = useMemo(() => {
    if (!pendingBox) return userMarks;
    return [...userMarks, { type: "pending", pacpCode: selectedCode, boundingBox: pendingBox }];
  }, [userMarks, pendingBox, selectedCode]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">{exercise?.title || "Defect Identification"}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{exercise?.description || "Identify and classify all defects in this image"}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-xs gap-1">
            <Clock className="w-3 h-3" /> {formatTime(timer)}
          </Badge>
          <span className="text-xs text-gray-500 dark:text-gray-400">{exercise?.defectCount || "?"} defects to find</span>
        </div>
      </div>

      {/* Canvas */}
      <BoundingBoxCanvas
        imageUrl={imgUrl}
        boxes={allBoxes}
        groundTruth={result?.groundTruth || []}
        matchedIndices={result?.matchedIndices || []}
        showGroundTruth={submitted}
        onBoxDrawn={setPendingBox}
        editable={!submitted}
      />

      {/* Tools */}
      {!submitted && (
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={selectedCode} onValueChange={setSelectedCode}>
            <SelectTrigger className="w-[220px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PACP_TYPES.map(p => (
                <SelectItem key={p.code} value={p.code} className="text-xs">
                  <span className="font-bold">{p.code}</span> — {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {pendingBox && (
            <Button size="sm" className="h-8 text-xs bg-red-700 hover:bg-red-800 text-white" onClick={confirmMark}>
              <Target className="w-3 h-3 mr-1" /> Add as {selectedCode}
            </Button>
          )}

          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={undoLast} disabled={userMarks.length === 0 && !pendingBox}>
            <Undo2 className="w-3 h-3 mr-1" /> Undo
          </Button>

          {exercise?.hints?.length > 0 && (
            <Button size="sm" variant="ghost" className="h-8 text-xs text-amber-600" onClick={() => setShowHints(!showHints)}>
              <Eye className="w-3 h-3 mr-1" /> {showHints ? "Hide" : "Show"} Hints
            </Button>
          )}

          <div className="flex-1" />

          <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit} disabled={userMarks.length === 0}>
            <Send className="w-3 h-3 mr-1" /> Submit ({userMarks.length} marks)
          </Button>
        </div>
      )}

      {/* Hints */}
      {showHints && exercise?.hints?.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300">
          <strong>Hints:</strong>
          <ul className="mt-1 space-y-0.5 list-disc pl-4">
            {exercise.hints.map((h, i) => <li key={i}>{h.type}: {h.hint}</li>)}
          </ul>
        </div>
      )}

      {/* User Marks List */}
      {userMarks.length > 0 && !submitted && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Your Marks ({userMarks.length})</p>
          {userMarks.map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-xs bg-gray-50 dark:bg-[#1e1d26] px-3 py-2 rounded-lg border border-gray-100 dark:border-[#374151]">
              <span className="w-5 h-5 rounded bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
              <span className="font-semibold text-gray-700 dark:text-gray-200">{m.pacpCode}</span>
              <span className="text-gray-400">{m.label}</span>
              <div className="flex-1" />
              <button onClick={() => removeMark(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {submitted && result && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                result.attempt?.score >= 70
                  ? "bg-emerald-100 dark:bg-emerald-500/15"
                  : "bg-red-100 dark:bg-red-500/15"
              }`}>
                <Award className={`w-6 h-6 ${
                  result.attempt?.score >= 70 ? "text-emerald-600" : "text-red-600"
                }`} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">Score: {result.attempt?.score}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Accuracy: {result.attempt?.accuracy}% · Time: {formatTime(timer)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Found", value: (result.groundTruth?.length || 0) - (result.attempt?.missedDefects || 0), color: "emerald" },
                { label: "Missed", value: result.attempt?.missedDefects || 0, color: "amber" },
                { label: "False +", value: result.attempt?.falsePositives || 0, color: "red" },
              ].map((stat) => (
                <div key={stat.label} className={`bg-${stat.color}-50 dark:bg-${stat.color}-500/10 rounded-lg p-3`}>
                  <p className={`text-lg font-bold text-${stat.color}-700 dark:text-${stat.color}-400`}>{stat.value}</p>
                  <p className={`text-[10px] text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.label}</p>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" className="text-xs" onClick={onBack}>
              Back to Training
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
