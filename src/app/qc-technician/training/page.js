"use client";

import React, { useState } from "react";
import {
  GraduationCap, Play, CheckCircle2, XCircle, Target, TrendingUp,
  Clock, Award, AlertTriangle, RotateCcw, ChevronRight, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import { useTrainingModules, useSubmitTrainingAttempt, useTrainingStats } from "@/hooks/useQueryHooks";

const DIFF_COLORS = { Beginner: "bg-emerald-100 text-emerald-700", Intermediate: "bg-amber-100 text-amber-700", Advanced: "bg-red-100 text-red-700" };

export default function TrainingCalibration() {
  const { showAlert } = useAlert();
  const { user } = useUser();
  const userId = user?._id || user?.id;

  const { data: modulesRaw = [], isLoading } = useTrainingModules();
  const { data: stats } = useTrainingStats(userId);
  const submitAttempt = useSubmitTrainingAttempt();

  const modules = Array.isArray(modulesRaw) ? modulesRaw : [];

  const [activeModule, setActiveModule] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const questions = activeModule?.questions || [];

  function startModule(mod) { setActiveModule(mod); setCurrentQ(0); setAnswers({}); setSubmitted(false); }
  function selectAnswer(qId, idx) { if (!submitted) setAnswers(a => ({ ...a, [qId]: idx })); }

  function handleSubmit() {
    setSubmitted(true);
    const correct = questions.filter(q => answers[q.id || q._id] === q.correct).length;
    const score = Math.round((correct / questions.length) * 100);
    showAlert(`Score: ${score}% (${correct}/${questions.length} correct)`, score >= 80 ? "success" : "error");
    submitAttempt.mutate({
      userId,
      moduleId: activeModule.id || activeModule._id,
      score,
      answers,
    });
  }

  const completedCount = stats?.completedModules ?? modules.filter(m => m.completed).length;
  const avgScore = stats?.averageScore ?? (
    modules.filter(m => m.score).length > 0
      ? modules.filter(m => m.score).reduce((s, m) => s + m.score, 0) / modules.filter(m => m.score).length
      : NaN
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Training & Calibration</h1>
          <p className="text-sm text-gray-500">Practice with known-answer samples to maintain detection accuracy</p>
        </div>
      </div>

      {activeModule ? (
        /* Practice mode */
        <div className="max-w-2xl mx-auto">
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{activeModule.title}</CardTitle>
                <button onClick={() => setActiveModule(null)} className="text-xs text-gray-400 hover:text-gray-600">← Back</button>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span>Question {currentQ + 1} of {questions.length}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {questions.slice(currentQ, currentQ + 1).map(q => {
                const qId = q.id || q._id;
                return (
                  <div key={qId}>
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <p className="text-sm text-gray-800 leading-relaxed">{q.prompt}</p>
                    </div>
                    <div className="space-y-2 mb-4">
                      {(q.options || []).map((opt, i) => {
                        const isSelected = answers[qId] === i;
                        const isCorrect = submitted && i === q.correct;
                        const isWrong = submitted && isSelected && i !== q.correct;
                        return (
                          <button key={i} onClick={() => selectAnswer(qId, i)}
                            className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${isCorrect ? "border-emerald-400 bg-emerald-50 text-emerald-800" : isWrong ? "border-red-300 bg-red-50 text-red-800" : isSelected ? "border-rose-400 bg-rose-50" : "border-gray-200 hover:border-rose-300"}`}>
                            <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                            {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 inline ml-2" />}
                            {isWrong && <XCircle className="w-4 h-4 text-red-500 inline ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      {!submitted ? (
                        <>
                          {currentQ < questions.length - 1 ? (
                            <Button onClick={() => setCurrentQ(q => q + 1)} disabled={!answers[qId] && answers[qId] !== 0} className="bg-rose-600 hover:bg-rose-700 text-white">Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
                          ) : (
                            <Button onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length} className="bg-rose-600 hover:bg-rose-700 text-white">Submit Answers</Button>
                          )}
                        </>
                      ) : (
                        <Button onClick={() => setActiveModule(null)} variant="outline" className="gap-1.5"><RotateCcw className="w-4 h-4" />Try Again</Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Completed", value: `${completedCount}/${modules.length}`, icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600" },
              { label: "Avg Score", value: isNaN(avgScore) ? "—" : `${Math.round(avgScore)}%`, icon: Target, bg: "bg-rose-50", color: "text-rose-600" },
              { label: "Calibration Level", value: avgScore >= 90 ? "Expert" : avgScore >= 75 ? "Proficient" : "Developing", icon: Award, bg: "bg-amber-50", color: "text-amber-600" },
            ].map(s => (
              <Card key={s.label} className="border-gray-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Modules */}
          <div className="space-y-3">
            {modules.map(mod => {
              const modId = mod.id || mod._id;
              return (
                <Card key={modId} className="border-gray-200 hover:border-rose-200 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mod.completed ? "bg-emerald-100" : "bg-gray-100"}`}>
                      {mod.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <GraduationCap className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">{mod.title}</h3>
                        <Badge variant="outline" className={`text-[10px] ${DIFF_COLORS[mod.difficulty] || ""}`}>{mod.difficulty}</Badge>
                      </div>
                      <p className="text-xs text-gray-500">{mod.defectType} · {mod.questions?.length || mod.questionCount || 0} questions</p>
                    </div>
                    {mod.score && (
                      <div className="text-center">
                        <p className={`text-lg font-bold ${mod.score >= 80 ? "text-emerald-600" : "text-amber-600"}`}>{mod.score}%</p>
                        <p className="text-[10px] text-gray-400">Last score</p>
                      </div>
                    )}
                    <Button onClick={() => startModule(mod)} variant={mod.completed ? "outline" : "default"}
                      className={mod.completed ? "" : "bg-rose-600 hover:bg-rose-700 text-white"} size="sm">
                      {mod.completed ? <><RotateCcw className="w-3.5 h-3.5 mr-1" />Retry</> : <><Play className="w-3.5 h-3.5 mr-1" />Start</>}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
