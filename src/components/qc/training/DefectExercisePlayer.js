"use client";

import { useState, useEffect, useRef } from "react";
import { Target, Undo2, Send, Eye, Clock, Award, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BoundingBoxCanvas from "./BoundingBoxCanvas";

const PACP_TYPES = [
  { code: "FSL", label: "Fracture - Longitudinal", type: "fracture" },
  { code: "CL", label: "Crack - Longitudinal", type: "crack" },
  { code: "CC", label: "Crack - Circumferential", type: "crack" },
  { code: "RO", label: "Root - Fine", type: "root" },
  { code: "ROB", label: "Root - Ball", type: "root" },
  { code: "DE", label: "Deposit - Settled", type: "blockage" },
  { code: "OB", label: "Obstruction", type: "blockage" },
  { code: "CR", label: "Corrosion", type: "corrosion" },
  { code: "BL", label: "Broken Pipe", type: "broken_pipe" },
  { code: "IS", label: "Infiltration - Seeper", type: "infiltration" },
  { code: "ACB", label: "Access Point - Catch Basin", type: "access_point_manhole" },
];

export default function DefectExercisePlayer({ exercise, onSubmit, onBack }) {
  const [userMarks, setUserMarks] = useState([]);
  const [selectedCode, setSelectedCode] = useState("FSL");
  const [pendingBox, setPendingBox] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timer, setTimer] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const timerRef = useRef(null);

  // Start timer
  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleBoxDrawn = (box) => {
    setPendingBox(box);
  };

  const confirmMark = () => {
    if (!pendingBox) return;
    const codeInfo = PACP_TYPES.find(p => p.code === selectedCode) || PACP_TYPES[0];
    setUserMarks(prev => [...prev, {
      type: codeInfo.type,
      pacpCode: selectedCode,
      label: codeInfo.label,
      boundingBox: pendingBox,
    }]);
    setPendingBox(null);
  };

  const removeMark = (idx) => {
    setUserMarks(prev => prev.filter((_, i) => i !== idx));
  };

  const undoLast = () => {
    if (pendingBox) { setPendingBox(null); return; }
    setUserMarks(prev => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    setSubmitted(true);

    if (onSubmit) {
      const res = await onSubmit({
        exerciseId: exercise._id || exercise.id,
        userMarks,
        timeSpent: timer,
      });
      if (res) setResult(res);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const allBoxes = pendingBox
    ? [...userMarks, { type: "pending", pacpCode: selectedCode, boundingBox: pendingBox }]
    : userMarks;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const imgUrl = exercise?.imageUrl?.startsWith("http")
    ? exercise.imageUrl
    : `${backendUrl}/api/videos/snapshot/${exercise?.imageUrl}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">{exercise?.title || "Defect Identification"}</h3>
          <p className="text-xs text-gray-500">{exercise?.description || "Identify and classify all defects in this image"}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
            <Clock className="w-3 h-3" /> {formatTime(timer)}
          </span>
          <span className="text-xs text-gray-500">{exercise?.defectCount || "?"} defects to find</span>
        </div>
      </div>

      {/* Canvas */}
      <BoundingBoxCanvas
        imageUrl={imgUrl}
        boxes={allBoxes}
        groundTruth={result?.groundTruth || []}
        matchedIndices={result?.matchedIndices || []}
        showGroundTruth={submitted}
        onBoxDrawn={handleBoxDrawn}
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
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
          <strong>Hints:</strong>
          <ul className="mt-1 space-y-0.5 list-disc pl-4">
            {exercise.hints.map((h, i) => <li key={i}>{h.type}: {h.hint}</li>)}
          </ul>
        </div>
      )}

      {/* User Marks List */}
      {userMarks.length > 0 && !submitted && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-500">Your Marks ({userMarks.length})</p>
          {userMarks.map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-xs bg-gray-50 px-3 py-2 rounded-lg">
              <span className="w-5 h-5 rounded bg-red-100 text-red-700 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
              <span className="font-semibold text-gray-700">{m.pacpCode}</span>
              <span className="text-gray-400">{m.label}</span>
              <div className="flex-1" />
              <button onClick={() => removeMark(i)} className="text-gray-400 hover:text-red-500">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {submitted && result && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${result.attempt?.score >= 70 ? "bg-emerald-100" : "bg-red-100"}`}>
              <Award className={`w-6 h-6 ${result.attempt?.score >= 70 ? "text-emerald-600" : "text-red-600"}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">Score: {result.attempt?.score}%</p>
              <p className="text-xs text-gray-500">Accuracy: {result.attempt?.accuracy}% · Time: {formatTime(timer)}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-emerald-50 rounded-lg p-3">
              <p className="text-lg font-bold text-emerald-700">{(result.groundTruth?.length || 0) - (result.attempt?.missedDefects || 0)}</p>
              <p className="text-[10px] text-emerald-600">Found</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-lg font-bold text-amber-700">{result.attempt?.missedDefects || 0}</p>
              <p className="text-[10px] text-amber-600">Missed</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-lg font-bold text-red-700">{result.attempt?.falsePositives || 0}</p>
              <p className="text-[10px] text-red-600">False +</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={onBack}>Back to Training</Button>
          </div>
        </div>
      )}
    </div>
  );
}
