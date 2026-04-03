"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  GraduationCap, Play, CheckCircle2, XCircle, Target, TrendingUp,
  Clock, Award, AlertTriangle, RotateCcw, ChevronRight, Loader2,
  Plus, Edit, Trash2, Users, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import {
  useTrainingModules, useSubmitTrainingAttempt, useTrainingStats,
  useCreateTrainingModule, useUpdateTrainingModule, useDeleteTrainingModule,
  useTeamTrainingProgress, useTrainingAssignments,
} from "@/hooks/useQueryHooks";
import { ModuleFormModal, TeamProgressView, DIFFICULTY_CONFIG, CATEGORIES, EMPTY_QUESTION } from "@/components/qc/training";

const DIFF_COLORS = { beginner: "bg-emerald-100 text-emerald-700", intermediate: "bg-amber-100 text-amber-700", advanced: "bg-red-100 text-red-700" };
const EMPTY_FORM = { title: "", description: "", category: CATEGORIES[0], difficulty: "beginner", passingScore: 70, questions: [] };

export default function TrainingCalibration() {
  const { showAlert } = useAlert();
  const { userId } = useUser();

  const { data: modulesRaw = [], isLoading } = useTrainingModules();
  const { data: stats } = useTrainingStats(userId);
  const { data: teamProgress, isLoading: teamLoading } = useTeamTrainingProgress();
  const { data: myAssignmentsRaw = [] } = useTrainingAssignments(userId);
  const submitAttempt = useSubmitTrainingAttempt();
  const createModule = useCreateTrainingModule();
  const updateModule = useUpdateTrainingModule();
  const deleteModule = useDeleteTrainingModule();

  const modules = useMemo(() => Array.isArray(modulesRaw) ? modulesRaw : [], [modulesRaw]);

  // Learn tab state
  const [activeModule, setActiveModule] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Create tab state
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const questions = activeModule?.questions || [];

  function startModule(mod) { setActiveModule(mod); setCurrentQ(0); setAnswers({}); setSubmitted(false); }
  function selectAnswer(qId, idx) { if (!submitted) setAnswers(a => ({ ...a, [qId]: idx })); }

  function handleSubmit() {
    setSubmitted(true);
    const correct = questions.filter(q => answers[q._id || q.id] === q.correctAnswer).length;
    const score = Math.round((correct / questions.length) * 100);
    showAlert(`Score: ${score}% (${correct}/${questions.length} correct)`, score >= (activeModule.passingScore || 70) ? "success" : "error");
    submitAttempt.mutate({ userId, moduleId: activeModule._id || activeModule.id, score, answers });
  }

  // Create/Edit handlers
  function openCreate() { setEditingModule(null); setForm(EMPTY_FORM); setShowForm(true); }
  function openEdit(mod) {
    setEditingModule(mod._id || mod.id);
    setForm({
      title: mod.title, description: mod.description || "", category: mod.category || CATEGORIES[0],
      difficulty: mod.difficulty || "beginner", passingScore: mod.passingScore || 70,
      questions: (mod.questions || []).map(q => ({
        question: q.question || q.prompt || "", options: q.options || ['', '', '', ''],
        correctAnswer: q.correctAnswer ?? q.correct ?? 0, explanation: q.explanation || "",
      })),
    });
    setShowForm(true);
  }

  async function handleSaveModule() {
    if (!form.title.trim()) { showAlert("Title is required", "error"); return; }
    if (form.questions.length === 0) { showAlert("Add at least one question", "error"); return; }
    setSaving(true);
    try {
      if (editingModule) {
        await updateModule.mutateAsync({ id: editingModule, ...form, createdBy: userId });
        showAlert("Module updated", "success");
      } else {
        await createModule.mutateAsync({ ...form, createdBy: userId });
        showAlert("Module created", "success");
      }
      setShowForm(false);
    } catch (err) {
      showAlert(err.message || "Failed to save", "error");
    } finally { setSaving(false); }
  }

  async function handleDeleteModule(id) {
    try {
      await deleteModule.mutateAsync(id);
      showAlert("Module deleted", "success");
    } catch { showAlert("Failed to delete", "error"); }
  }

  const myAssignments = useMemo(() => {
    const raw = Array.isArray(myAssignmentsRaw) ? myAssignmentsRaw : (myAssignmentsRaw?.data || []);
    return raw.map(a => {
      const mod = modules.find(m => (m._id || m.id) === (a.moduleId?._id || a.moduleId));
      return { ...a, module: a.moduleId?.title ? a.moduleId : mod || a.moduleId };
    });
  }, [myAssignmentsRaw, modules]);

  const pendingAssignments = useMemo(() => myAssignments.filter(a => a.status !== 'completed'), [myAssignments]);

  const completedCount = stats?.modulesCompleted ?? 0;
  const avgScore = stats?.avgScore ?? NaN;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>;
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
          <p className="text-sm text-gray-500">Practice, create modules, and track team progress</p>
        </div>
      </div>

      <Tabs defaultValue={pendingAssignments.length > 0 ? "assignments" : "learn"} className="w-full">
        <TabsList className="mb-5 bg-gray-100/80 p-1 rounded-xl h-auto">
          <TabsTrigger value="assignments" className="flex items-center gap-1.5 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-rose-700 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <Target className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">My Assignments</span>
            {pendingAssignments.length > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">{pendingAssignments.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="learn" className="flex items-center gap-1.5 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-rose-700 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <Play className="w-4 h-4 shrink-0" /><span className="text-sm font-medium">Learn</span>
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-1.5 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-rose-700 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <BookOpen className="w-4 h-4 shrink-0" /><span className="text-sm font-medium">Manage Modules</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-1.5 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-rose-700 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <Users className="w-4 h-4 shrink-0" /><span className="text-sm font-medium">Team Progress</span>
          </TabsTrigger>
        </TabsList>

        {/* ── My Assignments Tab ── */}
        <TabsContent value="assignments" className="mt-0">
          {pendingAssignments.length === 0 && myAssignments.filter(a => a.status === 'completed').length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Target className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No training assignments yet</p>
              <p className="text-xs mt-1">Your admin will assign modules when ready</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pending assignments */}
              {pendingAssignments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Pending ({pendingAssignments.length})
                  </h3>
                  <div className="space-y-2">
                    {pendingAssignments.map(a => {
                      const modTitle = a.module?.title || 'Training Module';
                      const modDifficulty = a.module?.difficulty || 'beginner';
                      const isOverdue = a.dueDate && new Date(a.dueDate) < new Date();
                      const linkedModule = modules.find(m => (m._id || m.id) === (a.moduleId?._id || a.moduleId));
                      return (
                        <Card key={a._id} className={`border-gray-200 ${isOverdue ? 'border-l-4 border-l-red-400' : ''}`}>
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOverdue ? 'bg-red-50' : 'bg-rose-50'}`}>
                              <GraduationCap className={`w-5 h-5 ${isOverdue ? 'text-red-500' : 'text-rose-500'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900">{modTitle}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className={`text-[10px] ${DIFF_COLORS[modDifficulty] || ''}`}>{modDifficulty}</Badge>
                                <Badge variant="outline" className={`text-[10px] capitalize ${a.status === 'overdue' || isOverdue ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                  {isOverdue ? 'Overdue' : a.status}
                                </Badge>
                                {a.dueDate && (
                                  <span className={`text-[10px] flex items-center gap-0.5 ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                                    <Clock className="w-3 h-3" />Due {new Date(a.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            {linkedModule && (
                              <Button size="sm" onClick={() => startModule(linkedModule)}
                                className="bg-rose-500 hover:bg-rose-600 text-white gap-1">
                                <Play className="w-3.5 h-3.5" /> Start
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Completed assignments */}
              {myAssignments.filter(a => a.status === 'completed').length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Completed ({myAssignments.filter(a => a.status === 'completed').length})
                  </h3>
                  <div className="space-y-2">
                    {myAssignments.filter(a => a.status === 'completed').map(a => {
                      const modTitle = a.module?.title || 'Training Module';
                      return (
                        <Card key={a._id} className="border-gray-200 opacity-70">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-700">{modTitle}</p>
                              <span className="text-[10px] text-gray-400">
                                Completed {a.completedAt ? new Date(a.completedAt).toLocaleDateString() : ''}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Done</Badge>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ── Learn Tab ── */}
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
                      <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {questions.slice(currentQ, currentQ + 1).map(q => {
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
                                className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${isCorrect ? "border-emerald-400 bg-emerald-50 text-emerald-800" : isWrong ? "border-red-300 bg-red-50 text-red-800" : isSelected ? "border-rose-400 bg-rose-50" : "border-gray-200 hover:border-rose-300"}`}>
                                <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                                {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 inline ml-2" />}
                                {isWrong && <XCircle className="w-4 h-4 text-red-500 inline ml-2" />}
                              </button>
                            );
                          })}
                        </div>
                        {submitted && q.explanation && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 text-xs text-blue-800">
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {!submitted ? (
                            currentQ < questions.length - 1 ? (
                              <Button onClick={() => setCurrentQ(q => q + 1)} disabled={answers[qId] === undefined} className="bg-rose-600 hover:bg-rose-700 text-white">Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
                            ) : (
                              <Button onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length} className="bg-rose-600 hover:bg-rose-700 text-white">Submit Answers</Button>
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
            <>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Completed", value: `${completedCount}/${modules.length}`, icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600" },
                  { label: "Avg Score", value: isNaN(avgScore) ? "—" : `${Math.round(avgScore)}%`, icon: Target, bg: "bg-rose-50", color: "text-rose-600" },
                  { label: "Level", value: avgScore >= 90 ? "Expert" : avgScore >= 75 ? "Proficient" : "Developing", icon: Award, bg: "bg-amber-50", color: "text-amber-600" },
                ].map(s => (
                  <Card key={s.label} className="border-gray-200">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}><s.icon className={`w-4 h-4 ${s.color}`} /></div>
                      <div><p className="text-lg font-bold text-gray-900">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="space-y-3">
                {modules.map(mod => (
                  <Card key={mod._id || mod.id} className="border-gray-200 hover:border-rose-200 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
                        <GraduationCap className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900">{mod.title}</h3>
                          <Badge variant="outline" className={`text-[10px] capitalize ${DIFF_COLORS[mod.difficulty] || ""}`}>{mod.difficulty}</Badge>
                          <Badge variant="outline" className="text-[10px]">{mod.category}</Badge>
                        </div>
                        <p className="text-xs text-gray-500">{mod.questions?.length || 0} questions · Pass at {mod.passingScore || 70}%</p>
                      </div>
                      <Button onClick={() => startModule(mod)} className="bg-rose-600 hover:bg-rose-700 text-white" size="sm">
                        <Play className="w-3.5 h-3.5 mr-1" />Start
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {modules.length === 0 && (
                  <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No training modules available</p>
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Manage Modules Tab ── */}
        <TabsContent value="create" className="mt-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{modules.length} module{modules.length !== 1 ? "s" : ""} available</p>
            <Button onClick={openCreate} className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5">
              <Plus className="w-4 h-4" /> New Module
            </Button>
          </div>
          <div className="space-y-3">
            {modules.map(mod => (
              <Card key={mod._id || mod.id} className="border-gray-200">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-50">
                    <BookOpen className="w-5 h-5 text-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">{mod.title}</h3>
                      <Badge variant="outline" className={`text-[10px] capitalize ${DIFF_COLORS[mod.difficulty] || ""}`}>{mod.difficulty}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{mod.category} · {mod.questions?.length || 0} questions · Pass at {mod.passingScore || 70}%</p>
                    {mod.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{mod.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(mod)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-rose-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteModule(mod._id || mod.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {modules.length === 0 && (
              <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No modules created yet</p>
                <p className="text-xs mt-1">Click "New Module" to create your first training module</p>
              </div>
            )}
          </div>
          <ModuleFormModal open={showForm} editing={editingModule} form={form} setForm={setForm} saving={saving} onSave={handleSaveModule} onClose={() => setShowForm(false)} />
        </TabsContent>

        {/* ── Team Progress Tab ── */}
        <TabsContent value="progress" className="mt-0">
          <TeamProgressView progress={teamProgress} isLoading={teamLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
