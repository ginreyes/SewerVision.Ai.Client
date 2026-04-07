"use client";

import React, { useState, useMemo } from "react";
import {
  GraduationCap, Users, Play, Award, Target, BookOpen, Clock,
  CheckCircle2, XCircle, ChevronRight, Loader2, RotateCcw, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import {
  useTrainingModules, useSubmitTrainingAttempt, useTrainingStats,
  useTeamTrainingProgress, useAllTrainingAssignments, useAssignTrainingModules,
} from "@/hooks/useQueryHooks";
import { useLearningPaths, useUserPathProgress, useEnrollInPath } from "@/hooks/useTrainingPaths";
import LearningPathCard from "@/components/qc/training/LearningPathCard";
import { TeamProgressView } from "@/components/qc/training";

const DIFF_COLORS = { beginner: "bg-emerald-100 text-emerald-700", intermediate: "bg-amber-100 text-amber-700", advanced: "bg-red-100 text-red-700" };
const CATEGORY_IMAGES = {
  'PACP Defect Codes': '/training_pictures/Papc_defect_codes.jpg',
  'AI Detection Review': '/training_pictures/interactive_exercise.jpg',
  'Safety Protocols': '/training_pictures/safety_protocols_modules.jpg',
  'Report Writing': '/training_pictures/report_writing_module.jpg',
  'Equipment Operation': '/training_pictures/equipement_operation_module.jpg',
};
const DEFAULT_IMAGE = '/training_pictures/general_training_welcome.jpg';

const UserTrainingCenter = () => {
  const { showAlert } = useAlert();
  const { userId } = useUser();

  const { data: modulesRaw = [], isLoading } = useTrainingModules();
  const { data: stats } = useTrainingStats(userId);
  const { data: teamProgress, isLoading: teamLoading } = useTeamTrainingProgress();
  const { data: assignments = [] } = useAllTrainingAssignments();
  const assignModules = useAssignTrainingModules();
  const submitAttempt = useSubmitTrainingAttempt();
  const { data: paths = [] } = useLearningPaths();
  const { data: pathProgress = [] } = useUserPathProgress(userId);
  const enrollInPath = useEnrollInPath();

  const modules = useMemo(() => Array.isArray(modulesRaw) ? modulesRaw : [], [modulesRaw]);

  // Quiz state
  const [activeModule, setActiveModule] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const questions = activeModule?.questions || [];

  const startModule = (mod) => { setActiveModule(mod); setCurrentQ(0); setAnswers({}); setSubmitted(false); };
  const selectAnswer = (qId, optIdx) => { if (!submitted) setAnswers(prev => ({ ...prev, [qId]: optIdx })); };

  const handleSubmit = () => {
    setSubmitted(true);
    let correct = 0;
    questions.forEach((q) => {
      const qId = q._id || q.id || questions.indexOf(q);
      if (answers[qId] === (q.correctAnswer ?? q.correct ?? 0)) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    showAlert(`Score: ${score}% (${correct}/${questions.length})`, score >= (activeModule.passingScore || 70) ? "success" : "error");
    submitAttempt.mutate({ userId, moduleId: activeModule._id || activeModule.id, score, answers });
  };

  // Assignment state
  const [selectedModules, setSelectedModules] = useState(new Set());
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  const teamMembers = useMemo(() => {
    const raw = Array.isArray(teamProgress) ? teamProgress : [];
    return raw.filter((t) => t.role === 'qc-technician');
  }, [teamProgress]);

  const handleAssign = async () => {
    if (selectedModules.size === 0 || selectedUsers.size === 0) return;
    try {
      await assignModules.mutateAsync({
        moduleIds: [...selectedModules],
        userIds: [...selectedUsers],
      });
      showAlert(`Assigned ${selectedModules.size} module(s) to ${selectedUsers.size} technician(s)`, 'success');
      setSelectedModules(new Set());
      setSelectedUsers(new Set());
    } catch { showAlert('Failed to assign', 'error'); }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Training Center</h1>
          <p className="text-sm text-gray-500">Manage team training and develop your own skills</p>
        </div>
      </div>

      <Tabs defaultValue="team" className="w-full">
        <TabsList className="mb-5 bg-gray-100/80 p-1 rounded-xl h-auto">
          <TabsTrigger value="team" className="flex items-center gap-1.5 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <Users className="w-4 h-4 shrink-0" /><span className="text-sm font-medium">Team Progress</span>
          </TabsTrigger>
          <TabsTrigger value="assign" className="flex items-center gap-1.5 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <Target className="w-4 h-4 shrink-0" /><span className="text-sm font-medium">Assign Training</span>
          </TabsTrigger>
          <TabsTrigger value="paths" className="flex items-center gap-1.5 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <Award className="w-4 h-4 shrink-0" /><span className="text-sm font-medium">Learning Paths</span>
          </TabsTrigger>
          <TabsTrigger value="learn" className="flex items-center gap-1.5 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <Play className="w-4 h-4 shrink-0" /><span className="text-sm font-medium">My Training</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Team Progress ── */}
        <TabsContent value="team" className="mt-0">
          <TeamProgressView progress={teamProgress} isLoading={teamLoading} />
        </TabsContent>

        {/* ── Assign Training ── */}
        <TabsContent value="assign" className="mt-0">
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Select Modules */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Select Modules</h3>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {modules.map((mod) => {
                    const id = mod._id || mod.id;
                    const selected = selectedModules.has(id);
                    return (
                      <button key={id} onClick={() => setSelectedModules(prev => {
                        const next = new Set(prev); selected ? next.delete(id) : next.add(id); return next;
                      })} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${selected ? 'bg-indigo-50 border-indigo-200 border' : 'bg-gray-50 hover:bg-gray-100 border border-transparent'}`}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                          {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{mod.title}</p>
                          <p className="text-[10px] text-gray-400">{mod.category} · {mod.questions?.length || 0} Q</p>
                        </div>
                        <Badge variant="outline" className={`text-[9px] ${DIFF_COLORS[mod.difficulty] || ''}`}>{mod.difficulty}</Badge>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Select Technicians */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Select QC Technicians</h3>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {teamMembers.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-8">No QC technicians found</p>
                  ) : teamMembers.map((tech) => {
                    const id = tech.userId || tech._id;
                    const selected = selectedUsers.has(id);
                    return (
                      <button key={id} onClick={() => setSelectedUsers(prev => {
                        const next = new Set(prev); selected ? next.delete(id) : next.add(id); return next;
                      })} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${selected ? 'bg-indigo-50 border-indigo-200 border' : 'bg-gray-50 hover:bg-gray-100 border border-transparent'}`}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                          {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800">{tech.name || tech.email}</p>
                          <p className="text-[10px] text-gray-400">{tech.modulesCompleted || 0} modules · Avg {tech.avgScore || 0}%</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <Button onClick={handleAssign} disabled={selectedModules.size === 0 || selectedUsers.size === 0 || assignModules.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-4 h-4 mr-1.5" />
              Assign ({selectedModules.size} module{selectedModules.size !== 1 ? 's' : ''} × {selectedUsers.size} tech{selectedUsers.size !== 1 ? 's' : ''})
            </Button>
          </div>
        </TabsContent>

        {/* ── Learning Paths ── */}
        <TabsContent value="paths" className="mt-0">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Learning Paths</h2>
            {paths.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">No learning paths available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paths.map((p) => {
                  const prog = pathProgress.find((pp) => (pp.pathId?._id || pp.pathId) === (p._id || p.id));
                  return (
                    <LearningPathCard key={p._id || p.id} path={p} progress={prog}
                      onEnroll={(path) => enrollInPath.mutate({ pathId: path._id || path.id, userId })}
                      onContinue={(path, prog) => {
                        const nextMod = prog?.moduleProgress?.find((m) => m.status === 'available' || m.status === 'in-progress');
                        if (nextMod) {
                          const mod = modules.find((m) => (m._id || m.id) === (nextMod.moduleId?._id || nextMod.moduleId));
                          if (mod) startModule(mod);
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── My Training ── */}
        <TabsContent value="learn" className="mt-0">
          {activeModule ? (
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
                      <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {questions.length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-600">No questions available</p>
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => setActiveModule(null)}>← Back</Button>
                    </div>
                  )}
                  {questions.slice(currentQ, currentQ + 1).map((q) => {
                    const qId = q._id || q.id || currentQ;
                    return (
                      <div key={qId}>
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                          <p className="text-sm text-gray-800 leading-relaxed">{q.question || q.prompt}</p>
                        </div>
                        <div className="space-y-2 mb-4">
                          {(q.options || []).map((opt, i) => {
                            const isSelected = answers[qId] === i;
                            const correctIdx = q.correctAnswer ?? q.correct ?? 0;
                            const isCorrect = submitted && i === correctIdx;
                            const isWrong = submitted && isSelected && i !== correctIdx;
                            return (
                              <button key={i} onClick={() => selectAnswer(qId, i)}
                                className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${isCorrect ? "border-emerald-400 bg-emerald-50 text-emerald-800" : isWrong ? "border-red-300 bg-red-50 text-red-800" : isSelected ? "border-indigo-400 bg-indigo-50" : "border-gray-200 hover:border-indigo-300"}`}>
                                <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                              </button>
                            );
                          })}
                        </div>
                        {submitted && q.explanation && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 text-xs text-blue-800"><strong>Explanation:</strong> {q.explanation}</div>
                        )}
                        <div className="flex items-center gap-2">
                          {!submitted ? (
                            currentQ < questions.length - 1 ? (
                              <Button onClick={() => setCurrentQ((q) => q + 1)} disabled={answers[qId] === undefined} className="bg-indigo-600 hover:bg-indigo-700 text-white">Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
                            ) : (
                              <Button onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length} className="bg-indigo-600 hover:bg-indigo-700 text-white">Submit</Button>
                            )
                          ) : (
                            <Button onClick={() => setActiveModule(null)} variant="outline" className="gap-1.5"><RotateCcw className="w-4 h-4" />Back to Modules</Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {modules.map((mod) => {
                const imgSrc = CATEGORY_IMAGES[mod.category] || DEFAULT_IMAGE;
                return (
                  <div key={mod._id || mod.id} className="group bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all overflow-hidden">
                    <div className="relative h-36 overflow-hidden">
                      <img src={imgSrc} alt={mod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold backdrop-blur-sm border ${
                          mod.difficulty === 'advanced' ? 'bg-red-500/80 text-white border-red-400/50' :
                          mod.difficulty === 'intermediate' ? 'bg-amber-500/80 text-white border-amber-400/50' :
                          'bg-emerald-500/80 text-white border-emerald-400/50'
                        }`}>{mod.difficulty}</span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-sm font-bold text-white truncate drop-shadow-md">{mod.title}</h3>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">{mod.questions?.length || 0} questions · Pass {mod.passingScore || 70}%</span>
                        <Button onClick={() => startModule(mod)} size="sm" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                          <Play className="w-3 h-3 mr-1" /> Start
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {modules.length === 0 && (
                <div className="col-span-3 text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                  <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-600">No training modules available</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserTrainingCenter;
