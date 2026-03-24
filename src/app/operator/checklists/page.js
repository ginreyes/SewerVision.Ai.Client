"use client";

import React, { useState } from "react";
import {
  ClipboardCheck, Plus, CheckCircle2, Circle, Camera, AlertTriangle,
  ChevronDown, ChevronRight, Trash2, Edit, Search, Clock, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlert } from "@/components/providers/AlertProvider";

const SEED_CHECKLISTS = [
  {
    id: "1", name: "Pre-Inspection Safety Check", project: "PRJ-0087", status: "in-progress", completedAt: null,
    items: [
      { id: "i1", label: "Confirm PPE is available and worn", done: true, requiresPhoto: false },
      { id: "i2", label: "Verify site access clearance", done: true, requiresPhoto: false },
      { id: "i3", label: "Check camera equipment battery level", done: true, requiresPhoto: true, photo: "battery_check.jpg" },
      { id: "i4", label: "Test cable connectivity to device", done: false, requiresPhoto: false },
      { id: "i5", label: "Record ambient temperature and conditions", done: false, requiresPhoto: true },
    ],
  },
  {
    id: "2", name: "Equipment Verification", project: "PRJ-0092", status: "completed", completedAt: "2026-03-24 09:12",
    items: [
      { id: "i1", label: "Inspect camera lens for damage", done: true, requiresPhoto: true, photo: "lens_check.jpg" },
      { id: "i2", label: "Verify cable spool is full and undamaged", done: true, requiresPhoto: false },
      { id: "i3", label: "Check mainframe display and controls", done: true, requiresPhoto: false },
    ],
  },
  {
    id: "3", name: "Post-Job Site Checklist", project: "PRJ-0085", status: "pending", completedAt: null,
    items: [
      { id: "i1", label: "Pack all equipment securely", done: false, requiresPhoto: false },
      { id: "i2", label: "Restore manhole covers and signage", done: false, requiresPhoto: true },
      { id: "i3", label: "Log final GPS coordinates", done: false, requiresPhoto: false },
      { id: "i4", label: "Submit completion photos", done: false, requiresPhoto: true },
    ],
  },
];

const STATUS_CONFIG = {
  pending: { color: "bg-gray-100 text-gray-600 border-gray-200", label: "Pending" },
  "in-progress": { color: "bg-blue-100 text-blue-700 border-blue-200", label: "In Progress" },
  completed: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Completed" },
};

export default function FieldChecklist() {
  const { showAlert } = useAlert();
  const [checklists, setChecklists] = useState(SEED_CHECKLISTS);
  const [selected, setSelected] = useState("1");
  const [search, setSearch] = useState("");

  const selectedList = checklists.find(c => c.id === selected);
  const filtered = checklists.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.project.toLowerCase().includes(search.toLowerCase()));

  function toggleItem(checklistId, itemId) {
    setChecklists(prev => prev.map(c => {
      if (c.id !== checklistId) return c;
      const items = c.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i);
      const allDone = items.every(i => i.done);
      return { ...c, items, status: allDone ? "completed" : items.some(i => i.done) ? "in-progress" : "pending", completedAt: allDone ? new Date().toLocaleString() : null };
    }));
  }

  const doneCount = selectedList?.items.filter(i => i.done).length || 0;
  const totalCount = selectedList?.items.length || 0;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Field Checklists</h1>
            <p className="text-sm text-gray-500">Pre-inspection safety and equipment verification checklists</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
          <Plus className="w-4 h-4" /> New Checklist
        </Button>
      </div>

      <div className="flex gap-4">
        {/* List panel */}
        <div className="w-72 shrink-0 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search checklists…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          {filtered.map(c => {
            const done = c.items.filter(i => i.done).length;
            const total = c.items.length;
            const cfg = STATUS_CONFIG[c.status];
            return (
              <button key={c.id} onClick={() => setSelected(c.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${selected === c.id ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-200"}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{c.name}</p>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${cfg.color}`}>{cfg.label}</Badge>
                </div>
                <p className="text-[11px] text-gray-400 mb-2">{c.project}</p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{done}/{total} items</p>
              </button>
            );
          })}
        </div>

        {/* Checklist detail */}
        {selectedList ? (
          <div className="flex-1 min-w-0">
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{selectedList.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-0.5">{selectedList.project}</p>
                  </div>
                  <Badge variant="outline" className={`${STATUS_CONFIG[selectedList.status].color}`}>
                    {STATUS_CONFIG[selectedList.status].label}
                  </Badge>
                </div>
                {/* Progress */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-600">{doneCount} of {totalCount} completed</span>
                    <span className="font-bold text-blue-600">{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {selectedList.items.map(item => (
                  <button key={item.id} onClick={() => toggleItem(selectedList.id, item.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${item.done ? "border-emerald-200 bg-emerald-50" : "border-gray-100 hover:border-blue-200 hover:bg-blue-50/30"}`}>
                    {item.done
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      : <Circle className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${item.done ? "text-gray-400 line-through" : "text-gray-800"}`}>{item.label}</p>
                      {item.requiresPhoto && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                          <Camera className="w-3 h-3" />Photo required
                          {item.photo && <span className="text-emerald-600">— {item.photo} ✓</span>}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
                {selectedList.completedAt && (
                  <div className="flex items-center gap-2 pt-3 text-xs text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed at {selectedList.completedAt}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-sm">Select a checklist</p>
          </div>
        )}
      </div>
    </div>
  );
}
