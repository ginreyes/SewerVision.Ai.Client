"use client";

import React, { useState, useCallback } from "react";
import {
  X, Plus, Trash2, GripVertical, CheckCircle2, Loader2,
  BookOpen, HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, DIFFICULTY_CONFIG, EMPTY_QUESTION } from "./DataTypes";

export default function ModuleFormModal({ open, editing, form, setForm, saving, onSave, onClose }) {
  if (!open) return null;

  function addQuestion() {
    setForm(f => ({ ...f, questions: [...f.questions, { ...EMPTY_QUESTION, options: ['', '', '', ''] }] }));
  }

  function removeQuestion(idx) {
    setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== idx) }));
  }

  function updateQuestion(idx, field, value) {
    setForm(f => ({
      ...f,
      questions: f.questions.map((q, i) => i === idx ? { ...q, [field]: value } : q),
    }));
  }

  function updateOption(qIdx, oIdx, value) {
    setForm(f => ({
      ...f,
      questions: f.questions.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.map((o, j) => j === oIdx ? value : o) } : q
      ),
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-500 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{editing ? "Edit Training Module" : "Create Training Module"}</h2>
              <p className="text-xs text-amber-100">{form.questions.length} question{form.questions.length !== 1 ? "s" : ""} added</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Module info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-sm font-semibold">Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. PACP Defect Code Basics" className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label className="text-sm font-semibold">Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What will QC techs learn from this module?" rows={2} className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Difficulty</Label>
              <Select value={form.difficulty} onValueChange={v => setForm(f => ({ ...f, difficulty: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(DIFFICULTY_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Passing Score (%)</Label>
              <div className="flex items-center gap-3 mt-1">
                <input type="range" min={50} max={100} step={5} value={form.passingScore}
                  onChange={e => setForm(f => ({ ...f, passingScore: Number(e.target.value) }))}
                  className="flex-1 accent-red-600" />
                <span className="text-sm font-bold text-red-700 w-10 text-right">{form.passingScore}%</span>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-semibold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-red-600" />Questions
              </Label>
              <Button variant="outline" size="sm" onClick={addQuestion} className="gap-1 text-xs border-amber-200 text-red-700 hover:bg-amber-50">
                <Plus className="w-3 h-3" /> Add Question
              </Button>
            </div>

            <div className="space-y-4">
              {form.questions.map((q, qIdx) => (
                <div key={qIdx} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-red-700 flex items-center justify-center text-[10px] font-bold">
                        {qIdx + 1}
                      </span>
                      Question {qIdx + 1}
                    </span>
                    <button onClick={() => removeQuestion(qIdx)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Input value={q.question} onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                    placeholder="Enter the question..." className="mb-3 text-sm" />

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input type="radio" name={`correct-${qIdx}`} checked={q.correctAnswer === oIdx}
                          onChange={() => updateQuestion(qIdx, 'correctAnswer', oIdx)}
                          className="accent-red-600 shrink-0" />
                        <Input value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                          className={`text-xs h-8 ${q.correctAnswer === oIdx ? "border-emerald-300 bg-emerald-50" : ""}`} />
                      </div>
                    ))}
                  </div>

                  <Input value={q.explanation || ''} onChange={e => updateQuestion(qIdx, 'explanation', e.target.value)}
                    placeholder="Explanation (shown after answering, optional)" className="text-xs h-8 text-gray-500" />
                </div>
              ))}

              {form.questions.length === 0 && (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No questions yet</p>
                  <p className="text-xs mt-1">Click "Add Question" to start building the quiz</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          <p className="text-xs text-gray-400">{form.questions.length} question{form.questions.length !== 1 ? "s" : ""} · Pass at {form.passingScore}%</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onSave} disabled={saving} className="bg-red-700 hover:bg-red-800 text-white px-6">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              {editing ? "Save Changes" : "Create Module"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
