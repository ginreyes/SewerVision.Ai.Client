"use client";

import React, { useState } from "react";
import {
  Layers, Plus, Copy, Trash2, Edit, Play, Users, ClipboardList,
  Calendar, CheckCircle2, ChevronRight, Star, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAlert } from "@/components/providers/AlertProvider";

const SEED_TEMPLATES = [
  {
    id: "1", name: "Standard Pipeline Inspection", type: "Sewer", starred: true, usedCount: 23,
    team: ["1 Operator", "1 QC Technician"],
    milestones: ["Site setup (Day 1)", "CCTV inspection (Day 1-3)", "QC review (Day 4-5)", "Report delivery (Day 6)"],
    tasks: ["Safety checklist", "Equipment setup", "Run camera survey", "Log all defects", "QC sign-off", "Generate PACP report"],
  },
  {
    id: "2", name: "Emergency Response Inspection", type: "Emergency", starred: false, usedCount: 8,
    team: ["2 Operators", "1 QC Technician"],
    milestones: ["Mobilize within 4h", "Rapid survey (Day 1)", "Preliminary report (Day 1)"],
    tasks: ["Emergency site assessment", "Fast-track camera run", "Immediate defect log", "Preliminary findings report"],
  },
  {
    id: "3", name: "Large Diameter Survey", type: "Large Diameter", starred: true, usedCount: 5,
    team: ["2 Operators", "2 QC Technicians"],
    milestones: ["Pre-job survey", "Multi-day inspection (Day 1-7)", "Full QC review (Day 8-10)", "Final report (Day 12)"],
    tasks: ["Confined space permits", "Special equipment check", "Multi-pass inspection", "Detailed defect mapping", "PACP + MACP reporting"],
  },
];

export default function ProjectTemplates() {
  const { showAlert } = useAlert();
  const [templates, setTemplates] = useState(SEED_TEMPLATES);
  const [selected, setSelected] = useState("1");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "", description: "" });

  const selectedTemplate = templates.find(t => t.id === selected);

  function handleDuplicate(t) {
    setTemplates(prev => [...prev, { ...t, id: String(Date.now()), name: t.name + " (copy)", usedCount: 0, starred: false }]);
    showAlert("Template duplicated", "success");
  }

  function handleDelete(id) {
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (selected === id) setSelected(null);
    showAlert("Template deleted", "success");
  }

  function toggleStar(id) { setTemplates(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t)); }

  function handleCreate() {
    if (!form.name.trim()) { showAlert("Name required", "error"); return; }
    const id = String(Date.now());
    setTemplates(prev => [...prev, { id, name: form.name, type: form.type || "General", starred: false, usedCount: 0, team: [], milestones: [], tasks: [] }]);
    setSelected(id);
    setShowForm(false);
    showAlert("Template created", "success");
  }

  function useTemplate(t) {
    setTemplates(prev => prev.map(x => x.id === t.id ? { ...x, usedCount: x.usedCount + 1 } : x));
    showAlert(`Template "${t.name}" applied to new project`, "success");
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-md">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Project Templates</h1>
            <p className="text-sm text-gray-500">Save project configurations as reusable templates</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
          <Plus className="w-4 h-4" /> New Template
        </Button>
      </div>

      <div className="flex gap-4">
        {/* Template list */}
        <div className="w-72 shrink-0 space-y-2">
          {templates.map(t => (
            <button key={t.id} onClick={() => setSelected(t.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${selected === t.id ? "border-indigo-300 bg-indigo-50" : "border-gray-200 bg-white hover:border-indigo-200"}`}>
              <div className="flex items-start justify-between gap-1 mb-1">
                <p className="text-sm font-semibold text-gray-900 leading-snug">{t.name}</p>
                <button onClick={e => { e.stopPropagation(); toggleStar(t.id); }} className="shrink-0">
                  <Star className={`w-3.5 h-3.5 ${t.starred ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                </button>
              </div>
              <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 mb-1">{t.type}</Badge>
              <p className="text-[10px] text-gray-400">Used {t.usedCount} times · {t.tasks.length} tasks · {t.milestones.length} milestones</p>
            </button>
          ))}
        </div>

        {/* Template detail */}
        {selectedTemplate ? (
          <div className="flex-1 min-w-0">
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{selectedTemplate.name}</CardTitle>
                    <Badge variant="outline" className="mt-1 text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">{selectedTemplate.type}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleDuplicate(selectedTemplate)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(selectedTemplate.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Button onClick={() => useTemplate(selectedTemplate)} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
                      <Play className="w-3.5 h-3.5" /> Use Template
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 grid grid-cols-3 gap-4">
                {/* Team */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1"><Users className="w-3.5 h-3.5" />Team</p>
                  {selectedTemplate.team.map((t, i) => (
                    <p key={i} className="text-xs text-gray-700 py-1 border-b border-gray-50 last:border-0">{t}</p>
                  ))}
                  {selectedTemplate.team.length === 0 && <p className="text-xs text-gray-400">No team defined</p>}
                </div>
                {/* Milestones */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Milestones</p>
                  {selectedTemplate.milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-1.5 py-1 border-b border-gray-50 last:border-0">
                      <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0" />
                      <p className="text-xs text-gray-700">{m}</p>
                    </div>
                  ))}
                </div>
                {/* Tasks */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1"><ClipboardList className="w-3.5 h-3.5" />Tasks</p>
                  {selectedTemplate.tasks.map((t, i) => (
                    <div key={i} className="flex items-center gap-1.5 py-1 border-b border-gray-50 last:border-0">
                      <CheckCircle2 className="w-3 h-3 text-gray-300 shrink-0" />
                      <p className="text-xs text-gray-700">{t}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-sm">Select a template</p>
          </div>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Project Template</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Template Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Standard Pipeline Inspection" className="mt-1" />
            </div>
            <div>
              <Label>Type</Label>
              <Input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} placeholder="e.g. Sewer, Emergency, Large Diameter…" className="mt-1" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
