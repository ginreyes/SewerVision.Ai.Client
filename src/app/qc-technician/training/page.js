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
import LearningPathCard from "@/components/qc/training/LearningPathCard";
import { GridSkeleton } from "@/components/shared/SkeletonLoading";
import DefectExercisePlayer from "@/components/qc/training/DefectExercisePlayer";
import CertificateViewer from "@/components/qc/training/CertificateViewer";
import { useLearningPaths, useUserPathProgress, useEnrollInPath, useDefectExercises, useSubmitExercise, useCertificate } from "@/hooks/useTrainingPaths";

const DIFF_COLORS = { beginner: "bg-emerald-100 text-emerald-700", intermediate: "bg-amber-100 text-amber-700", advanced: "bg-red-100 text-red-700" };
const EMPTY_FORM = { title: "", description: "", category: CATEGORIES[0], difficulty: "beginner", passingScore: 70, questions: [] };

const CATEGORY_IMAGES = {
  'PACP Defect Codes': '/training_pictures/Papc_defect_codes.jpg',
  'AI Detection Review': '/training_pictures/interactive_exercise.jpg',
  'Safety Protocols': '/training_pictures/safety_protocols_modules.jpg',
  'Report Writing': '/training_pictures/report_writing_module.jpg',
  'Equipment Operation': '/training_pictures/equipement_operation_module.jpg',
};
const DEFAULT_MODULE_IMAGE = '/training_pictures/general_training_welcome.jpg';

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

  // LMS: Learning Paths + Exercises
  const { data: paths = [] } = useLearningPaths();
  const { data: pathProgress = [] } = useUserPathProgress(userId);
  const enrollInPath = useEnrollInPath();
  const { data: exercises = [] } = useDefectExercises();
  const submitExercise = useSubmitExercise();
  const [activeExercise, setActiveExercise] = useState(null);
  const [certData, setCertData] = useState(null);

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
    return <div className="max-w-6xl mx-auto px-6 py-6"><GridSkeleton count={6} withImage /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-700 to-amber-500 flex items-center justify-center text-white shadow-md">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Training & Calibration</h1>
          <p className="text-sm text-gray-500">Practice, create modules, and track team progress</p>
        </div>
      </div>

      <Tabs defaultValue={pendingAssignments.length > 0 ? "assignments" : "learn"} className="w-full">
        <TabsList className="mb-5 bg-gray-100/80 p-1 rounded-xl h-auto">
          <TabsTrigger value="assignments" className="flex items-center gap-1.5 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-red-800 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <Target className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">My Assignments</span>
            {pendingAssignments.length > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">{pendingAssignments.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="paths" className="flex items-center gap-1.5 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-red-800 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <Award className="w-4 h-4 shrink-0" /><span className="text-sm font-medium">Paths</span>
          </TabsTrigger>
          <TabsTrigger value="learn" className="flex items-center gap-1.5 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-red-800 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <Play className="w-4 h-4 shrink-0" /><span className="text-sm font-medium">Learn</span>
          </TabsTrigger>
          <TabsTrigger value="exercises" className="flex items-center gap-1.5 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-red-800 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <Target className="w-4 h-4 shrink-0" /><span className="text-sm font-medium">Exercises</span>
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-1.5 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-red-800 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <BookOpen className="w-4 h-4 shrink-0" /><span className="text-sm font-medium">Manage Modules</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-1.5 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-red-800 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
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
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOverdue ? 'bg-red-50' : 'bg-amber-50'}`}>
                              <GraduationCap className={`w-5 h-5 ${isOverdue ? 'text-red-500' : 'text-red-600'}`} />
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
                                className="bg-red-600 hover:bg-red-700 text-white gap-1">
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
                      <div className="h-full bg-red-600 rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {questions.length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-600">No questions available</p>
                      <p className="text-xs text-gray-400 mt-1">This module has no quiz questions yet.</p>
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => setActiveModule(null)}>
                        <RotateCcw className="w-3.5 h-3.5 mr-1" /> Back to Modules
                      </Button>
                    </div>
                  )}
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
                                className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${isCorrect ? "border-emerald-400 bg-emerald-50 text-emerald-800" : isWrong ? "border-red-300 bg-red-50 text-red-800" : isSelected ? "border-red-500 bg-amber-50" : "border-gray-200 hover:border-amber-300"}`}>
                                <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                                {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 inline ml-2" />}
                                {isWrong && <XCircle className="w-4 h-4 text-red-500 inline ml-2" />}
                              </button>
                            );
                          })}
                        </div>
                        {submitted && q.explanation && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-xs text-amber-800">
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {!submitted ? (
                            currentQ < questions.length - 1 ? (
                              <Button onClick={() => setCurrentQ(q => q + 1)} disabled={answers[qId] === undefined} className="bg-red-700 hover:bg-red-800 text-white">Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
                            ) : (
                              <Button onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length} className="bg-red-700 hover:bg-red-800 text-white">Submit Answers</Button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {modules.map(mod => {
                  const qCount = mod.questions?.length || 0;
                  const diffStyle = DIFF_COLORS[mod.difficulty] || "";
                  const imgSrc = CATEGORY_IMAGES[mod.category] || DEFAULT_MODULE_IMAGE;
                  return (
                    <div key={mod._id || mod.id} className="group bg-white rounded-2xl border border-gray-100 hover:border-amber-200 hover:shadow-xl transition-all overflow-hidden">
                      {/* Cover Image */}
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={imgSrc}
                          alt={mod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        {/* Difficulty badge on image */}
                        <div className="absolute top-3 left-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold backdrop-blur-sm border ${
                            mod.difficulty === 'advanced' ? 'bg-red-500/80 text-white border-red-400/50' :
                            mod.difficulty === 'intermediate' ? 'bg-amber-500/80 text-white border-amber-400/50' :
                            'bg-emerald-500/80 text-white border-emerald-400/50'
                          }`}>{mod.difficulty}</span>
                        </div>
                        {/* Category on image */}
                        <div className="absolute top-3 right-3">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-white/20 text-white backdrop-blur-sm border border-white/20">
                            {mod.category}
                          </span>
                        </div>
                        {/* Title overlay at bottom */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-sm font-bold text-white truncate drop-shadow-md">{mod.title}</h3>
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-4">
                        {mod.description && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{mod.description}</p>}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-[10px] text-gray-400">
                            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {qCount} questions</span>
                            <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Pass {mod.passingScore || 70}%</span>
                          </div>
                          <Button onClick={() => startModule(mod)} size="sm" className="h-8 text-xs bg-red-700 hover:bg-red-800 text-white rounded-lg shadow-sm">
                            <Play className="w-3 h-3 mr-1" /> Start
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {modules.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                  <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-600">No training modules available</p>
                  <p className="text-xs text-gray-400 mt-1">Check with your admin to add training content</p>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ── Manage Modules Tab ── */}
        <TabsContent value="create" className="mt-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{modules.length} module{modules.length !== 1 ? "s" : ""} available</p>
            <Button onClick={openCreate} className="bg-red-700 hover:bg-red-800 text-white gap-1.5">
              <Plus className="w-4 h-4" /> New Module
            </Button>
          </div>
          <div className="space-y-3">
            {modules.map(mod => (
              <div key={mod._id || mod.id} className="bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-red-600" />
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
                    <button onClick={() => openEdit(mod)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-700">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteModule(mod._id || mod.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
              </div>
            ))}
            {modules.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">No modules created yet</p>
                <p className="text-xs text-gray-400 mt-1">Click "New Module" to create your first training module</p>
              </div>
            )}
          </div>
          <ModuleFormModal open={showForm} editing={editingModule} form={form} setForm={setForm} saving={saving} onSave={handleSaveModule} onClose={() => setShowForm(false)} />
        </TabsContent>

        {/* ── Team Progress Tab ── */}
        <TabsContent value="progress" className="mt-0">
          <TeamProgressView progress={teamProgress} isLoading={teamLoading} />
        </TabsContent>

        {/* ── Learning Paths Tab ── */}
        <TabsContent value="paths" className="mt-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Learning Paths</h2>
                <p className="text-xs text-gray-500">Complete sequential modules to earn certificates</p>
              </div>
            </div>

            {paths.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-600">No learning paths available yet</p>
                <p className="text-xs text-gray-400 mt-1">Check back later or ask your admin to create one</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paths.map(p => {
                  const prog = pathProgress.find(pp => (pp.pathId?._id || pp.pathId) === (p._id || p.id));
                  return (
                    <LearningPathCard
                      key={p._id || p.id}
                      path={p}
                      progress={prog}
                      onEnroll={(path) => enrollInPath.mutate({ pathId: path._id || path.id, userId })}
                      onContinue={(path, prog) => {
                        const nextMod = prog?.moduleProgress?.find(m => m.status === 'available' || m.status === 'in-progress');
                        if (nextMod) {
                          const mod = modules.find(m => (m._id || m.id) === (nextMod.moduleId?._id || nextMod.moduleId));
                          if (mod) { setActiveModule(mod); setCurrentQ(0); setAnswers({}); setSubmitted(false); }
                        }
                      }}
                      onViewCertificate={(path, prog) => {
                        setCertData({ pathId: path._id || path.id, userId });
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Defect Exercises Tab ── */}
        <TabsContent value="exercises" className="mt-0">
          {activeExercise ? (
            <DefectExercisePlayer
              exercise={activeExercise}
              onSubmit={async (data) => {
                const result = await submitExercise.mutateAsync({ ...data, userId });
                return result;
              }}
              onBack={() => setActiveExercise(null)}
            />
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Interactive Exercises</h2>
                <p className="text-xs text-gray-500">Identify and classify defects in real inspection images</p>
              </div>

              {exercises.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-600">No exercises available yet</p>
                  <p className="text-xs text-gray-400 mt-1">Your admin can create interactive defect identification exercises</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {exercises.map(ex => {
                    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
                    const exerciseImg = ex.imageUrl
                      ? (ex.imageUrl.startsWith("http") ? ex.imageUrl : `${backendUrl}/api/videos/snapshot/${ex.imageUrl}`)
                      : '/training_pictures/interactive_exercise.jpg';
                    return (
                      <div key={ex._id || ex.id} className="group bg-white rounded-2xl border border-gray-100 hover:border-amber-200 hover:shadow-xl transition-all overflow-hidden cursor-pointer" onClick={() => setActiveExercise(ex)}>
                        {/* Cover Image */}
                        <div className="relative h-36 overflow-hidden">
                          <img src={exerciseImg} alt={ex.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                          <div className="absolute top-3 left-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold backdrop-blur-sm border ${
                              ex.difficulty === 'advanced' ? 'bg-red-500/80 text-white border-red-400/50' :
                              ex.difficulty === 'intermediate' ? 'bg-amber-500/80 text-white border-amber-400/50' :
                              'bg-emerald-500/80 text-white border-emerald-400/50'
                            }`}>{ex.difficulty}</span>
                          </div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="text-sm font-bold text-white truncate drop-shadow-md">{ex.title}</h3>
                          </div>
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/20 font-medium">
                              {ex.defectCount || '?'} defects
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          {ex.description && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{ex.description}</p>}
                          <div className="flex items-center justify-between">
                            <div className="text-[10px] text-gray-400">
                              {ex.timeLimit && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {Math.floor(ex.timeLimit / 60)} min</span>}
                            </div>
                            <Button size="sm" className="h-8 text-xs bg-red-700 hover:bg-red-800 text-white rounded-lg shadow-sm">
                              <Play className="w-3 h-3 mr-1" /> Start
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Certificate Viewer Modal */}
      {certData && (
        <CertificateViewerWrapper pathId={certData.pathId} userId={certData.userId} onClose={() => setCertData(null)} />
      )}
    </div>
  );
}

// Wrapper to fetch certificate data
function CertificateViewerWrapper({ pathId, userId, onClose }) {
  const { data: cert } = useCertificate(pathId, userId);
  return <CertificateViewer certificate={cert} onClose={onClose} />;
}
