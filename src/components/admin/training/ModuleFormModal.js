"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Save, CheckCircle2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAlert } from "@/components/providers/AlertProvider";
import {
  useCreateTrainingModule, useUpdateTrainingModule,
} from "@/hooks/useQueryHooks";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

const blankQuestion = () => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  explanation: "",
});

/**
 * Create/edit modal for a training module. The backend
 * (training.controller createModule/updateModule) accepts
 * { title, description, category, difficulty, passingScore, questions[] }
 * where each question is { question, options[], correctAnswer (index), explanation }.
 */
export default function ModuleFormModal({ open, onClose, module = null }) {
  const isEdit = !!module?._id;
  const { showAlert } = useAlert();
  const createMutation = useCreateTrainingModule();
  const updateMutation = useUpdateTrainingModule();
  const saving = createMutation.isPending || updateMutation.isPending;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState([blankQuestion()]);

  useEffect(() => {
    if (!open) return;
    if (module) {
      setTitle(module.title || "");
      setDescription(module.description || "");
      setCategory(module.category || "");
      setDifficulty(module.difficulty || "beginner");
      setPassingScore(module.passingScore ?? 70);
      setQuestions(
        Array.isArray(module.questions) && module.questions.length
          ? module.questions.map((q) => ({
              question: q.question || "",
              options: q.options?.length ? [...q.options] : ["", "", "", ""],
              correctAnswer: q.correctAnswer ?? 0,
              explanation: q.explanation || "",
            }))
          : [blankQuestion()]
      );
    } else {
      setTitle(""); setDescription(""); setCategory("");
      setDifficulty("beginner"); setPassingScore(70); setQuestions([blankQuestion()]);
    }
  }, [open, module]);

  const updateQuestion = (idx, patch) =>
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  const updateOption = (qIdx, oIdx, val) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.map((o, j) => (j === oIdx ? val : o)) } : q
      )
    );
  const addQuestion = () => setQuestions((prev) => [...prev, blankQuestion()]);
  const removeQuestion = (idx) =>
    setQuestions((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  function validate() {
    if (!title.trim()) return "Title is required";
    if (!category.trim()) return "Category is required";
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) return `Question ${i + 1} text is required`;
      const filled = q.options.filter((o) => o.trim());
      if (filled.length < 2) return `Question ${i + 1} needs at least 2 options`;
      if (!q.options[q.correctAnswer]?.trim()) return `Question ${i + 1}: the correct option is empty`;
    }
    return null;
  }

  async function handleSave() {
    const err = validate();
    if (err) { showAlert(err, "error"); return; }

    // Drop empty trailing options so the saved module stays clean.
    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      difficulty,
      passingScore: Number(passingScore) || 70,
      questions: questions.map((q) => ({
        question: q.question.trim(),
        options: q.options.map((o) => o.trim()).filter(Boolean),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation?.trim() || "",
      })),
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: module._id, ...payload });
        showAlert("Module updated", "success");
      } else {
        await createMutation.mutateAsync(payload);
        showAlert("Module created", "success");
      }
      onClose?.();
    } catch (e) {
      showAlert(e?.message || "Failed to save module", "error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose?.(); }}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Training Module" : "New Training Module"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">Title <span className="text-red-500">*</span></Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., PACP Defect Coding Basics" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="resize-none" placeholder="What this module covers..." />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category <span className="text-red-500">*</span></Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Defect Classification" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Passing Score (%)</Label>
              <Input type="number" min={0} max={100} value={passingScore} onChange={(e) => setPassingScore(e.target.value)} />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Questions ({questions.length})</Label>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="gap-1.5 h-8">
                <Plus className="w-3.5 h-3.5" /> Add question
              </Button>
            </div>

            {questions.map((q, qIdx) => (
              <div key={qIdx} className="rounded-lg border border-gray-200 p-3 space-y-3 bg-gray-50/40">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-gray-400 mt-2.5">{qIdx + 1}.</span>
                  <Input
                    value={q.question}
                    onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                    placeholder="Question text"
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(qIdx)}
                    disabled={questions.length === 1} className="text-gray-400 hover:text-red-600 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-5">
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = q.correctAnswer === oIdx;
                    return (
                      <div key={oIdx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuestion(qIdx, { correctAnswer: oIdx })}
                          title="Mark as correct answer"
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isCorrect ? "bg-emerald-500 border-emerald-500" : "border-gray-300 hover:border-emerald-400"
                          }`}
                        >
                          {isCorrect && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </button>
                        <Input
                          value={opt}
                          onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${oIdx + 1}`}
                          className={`h-8 text-sm ${isCorrect ? "border-emerald-300" : ""}`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="pl-5">
                  <Input
                    value={q.explanation}
                    onChange={(e) => updateQuestion(qIdx, { explanation: e.target.value })}
                    placeholder="Explanation (optional) — shown after answering"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            ))}
            <p className="text-[11px] text-gray-400 pl-1">Click the circle next to an option to mark it as the correct answer.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? "Save Changes" : "Create Module"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
