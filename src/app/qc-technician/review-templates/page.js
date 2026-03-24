"use client";

import React, { useState } from "react";
import {
  ClipboardCheck, Plus, Edit, Trash2, Copy, Search, CheckSquare,
  ChevronDown, ChevronRight, Star, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAlert } from "@/components/providers/AlertProvider";

const SEED_TEMPLATES = [
  {
    id: "1", name: "Standard Crack Review", defectType: "Cracks", starred: true,
    criteria: [
      { id: "c1", label: "Measure crack width and length", required: true },
      { id: "c2", label: "Identify crack direction (longitudinal/circumferential/spiral)", required: true },
      { id: "c3", label: "Assign PACP grade (1-5)", required: true },
      { id: "c4", label: "Capture before/after comparison screenshot", required: false },
    ],
  },
  {
    id: "2", name: "Root Intrusion Assessment", defectType: "Roots", starred: false,
    criteria: [
      { id: "c1", label: "Estimate % pipe blockage", required: true },
      { id: "c2", label: "Identify root entry point (joint/crack)", required: true },
      { id: "c3", label: "Recommend root cutting urgency", required: true },
      { id: "c4", label: "Note joint condition at entry point", required: false },
    ],
  },
  {
    id: "3", name: "Structural Deformation Check", defectType: "Structural", starred: true,
    criteria: [
      { id: "c1", label: "Measure % deformation from circular profile", required: true },
      { id: "c2", label: "Check for external loading signs (road/building above)", required: false },
      { id: "c3", label: "Assign rehabilitation urgency level", required: true },
    ],
  },
];

export default function QCReviewTemplates() {
  const { showAlert } = useAlert();
  const [templates, setTemplates] = useState(SEED_TEMPLATES);
  const [selected, setSelected] = useState("1");
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDefect, setNewDefect] = useState("Cracks");
  const [search, setSearch] = useState("");

  const selectedTemplate = templates.find(t => t.id === selected);
  const filtered = templates.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.defectType.toLowerCase().includes(search.toLowerCase()));

  function handleDuplicate(t) {
    setTemplates(prev => [...prev, { ...t, id: String(Date.now()), name: t.name + " (copy)", starred: false }]);
    showAlert("Template duplicated", "success");
  }

  function handleDelete(id) {
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (selected === id) setSelected(null);
    showAlert("Template deleted", "success");
  }

  function toggleStar(id) {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
  }

  function handleCreate() {
    if (!newName.trim()) { showAlert("Name required", "error"); return; }
    const id = String(Date.now());
    setTemplates(prev => [...prev, { id, name: newName, defectType: newDefect, starred: false, criteria: [] }]);
    setSelected(id);
    setShowForm(false);
    showAlert("Template created", "success");
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">QC Review Templates</h1>
            <p className="text-sm text-gray-500">Predefined review criteria templates per defect type</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5">
          <Plus className="w-4 h-4" /> New Template
        </Button>
      </div>

      <div className="flex gap-4">
        {/* Template list */}
        <div className="w-72 shrink-0 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search templates…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          {filtered.map(t => (
            <button key={t.id} onClick={() => setSelected(t.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${selected === t.id ? "border-rose-300 bg-rose-50" : "border-gray-200 bg-white hover:border-rose-200"}`}>
              <div className="flex items-start justify-between gap-1 mb-1">
                <p className="text-sm font-semibold text-gray-900 leading-snug">{t.name}</p>
                <button onClick={e => { e.stopPropagation(); toggleStar(t.id); }} className="shrink-0">
                  <Star className={`w-3.5 h-3.5 ${t.starred ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                </button>
              </div>
              <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-200">{t.defectType}</Badge>
              <p className="text-[10px] text-gray-400 mt-1">{t.criteria.length} criteria</p>
            </button>
          ))}
        </div>

        {/* Detail */}
        {selectedTemplate ? (
          <div className="flex-1 min-w-0">
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{selectedTemplate.name}</CardTitle>
                    <Badge variant="outline" className="mt-1 text-[10px] bg-rose-50 text-rose-700 border-rose-200">{selectedTemplate.defectType}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleDuplicate(selectedTemplate)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-rose-600 transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(selectedTemplate.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Review Criteria</p>
                {selectedTemplate.criteria.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <p className="text-sm text-gray-800 flex-1">{c.label}</p>
                    {c.required && <Badge variant="outline" className="text-[10px] bg-red-50 text-red-600 border-red-200 shrink-0">Required</Badge>}
                  </div>
                ))}
                {selectedTemplate.criteria.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-300 border-2 border-dashed border-gray-200 rounded-xl">
                    <ClipboardCheck className="w-8 h-8 mb-2" />
                    <p className="text-xs">No criteria defined</p>
                  </div>
                )}
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
          <DialogHeader><DialogTitle>New Review Template</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Template Name</Label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Standard Crack Review" className="mt-1" />
            </div>
            <div>
              <Label>Defect Type</Label>
              <select value={newDefect} onChange={e => setNewDefect(e.target.value)}
                className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
                {["Cracks","Roots","Joints","Structural","Infiltration","Surface"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-rose-600 hover:bg-rose-700 text-white">Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
