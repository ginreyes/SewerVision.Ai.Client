"use client";

import React, { useState } from "react";
import {
  Workflow, Plus, Play, Pause, Trash2, Edit, ChevronRight, ChevronDown,
  GripVertical, CheckCircle2, Mail, MessageSquare, Tag, Clock, User,
  ArrowRight, Circle, Zap, Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAlert } from "@/components/providers/AlertProvider";

const STEP_TYPES = [
  { value: "send_email", label: "Send Email", icon: Mail, color: "bg-blue-100 text-blue-700" },
  { value: "send_message", label: "Send Message", icon: MessageSquare, color: "bg-teal-100 text-teal-700" },
  { value: "assign_agent", label: "Assign Agent", icon: User, color: "bg-purple-100 text-purple-700" },
  { value: "add_tag", label: "Add Tag", icon: Tag, color: "bg-amber-100 text-amber-700" },
  { value: "wait", label: "Wait", icon: Clock, color: "bg-gray-100 text-gray-700" },
  { value: "close_ticket", label: "Close Ticket", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
];

const SEED_WORKFLOWS = [
  {
    id: "1", name: "New Customer Onboarding", description: "Welcome sequence for new customers", active: true, runs: 47,
    steps: [
      { id: "s1", type: "send_email", label: "Welcome email", detail: "Subject: Welcome to Concertina!" },
      { id: "s2", type: "wait", label: "Wait 1 day", detail: "24 hours" },
      { id: "s3", type: "send_message", label: "Check-in message", detail: "How are you settling in?" },
      { id: "s4", type: "add_tag", label: "Tag: onboarded", detail: "onboarded" },
    ],
  },
  {
    id: "2", name: "Billing Dispute Handling", description: "Standard flow for billing complaints", active: true, runs: 23,
    steps: [
      { id: "s1", type: "assign_agent", label: "Assign billing agent", detail: "Billing Team" },
      { id: "s2", type: "send_email", label: "Acknowledgment email", detail: "We've received your dispute" },
      { id: "s3", type: "wait", label: "Wait 2 days", detail: "48 hours" },
      { id: "s4", type: "close_ticket", label: "Close ticket", detail: "If resolved" },
    ],
  },
  {
    id: "3", name: "Post-Resolution Follow Up", description: "Survey and close after resolution", active: false, runs: 89,
    steps: [
      { id: "s1", type: "wait", label: "Wait 1 hour", detail: "1 hour after resolution" },
      { id: "s2", type: "send_email", label: "Satisfaction survey", detail: "How did we do?" },
      { id: "s3", type: "add_tag", label: "Tag: surveyed", detail: "surveyed" },
    ],
  },
];

const EMPTY_WORKFLOW = { name: "", description: "", active: true };

function StepBadge({ type }) {
  const s = STEP_TYPES.find(t => t.value === type) || STEP_TYPES[0];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5 ${s.color}`}>
      <s.icon className="w-2.5 h-2.5" />{s.label}
    </span>
  );
}

export default function CannedWorkflows() {
  const { showAlert } = useAlert();
  const [workflows, setWorkflows] = useState(SEED_WORKFLOWS);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_WORKFLOW);
  const [editing, setEditing] = useState(null);

  const selectedWf = selected ? workflows.find(w => w.id === selected) : null;

  function toggleActive(id) {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, active: !w.active } : w));
    showAlert("Workflow status updated", "success");
  }

  function handleDuplicate(wf) {
    setWorkflows(prev => [...prev, { ...wf, id: String(Date.now()), name: wf.name + " (copy)", runs: 0 }]);
    showAlert("Workflow duplicated", "success");
  }

  function handleDelete(id) {
    setWorkflows(prev => prev.filter(w => w.id !== id));
    if (selected === id) setSelected(null);
    showAlert("Workflow deleted", "success");
  }

  function openCreate() { setEditing(null); setForm(EMPTY_WORKFLOW); setShowForm(true); }
  function openEdit(wf) { setEditing(wf.id); setForm({ name: wf.name, description: wf.description, active: wf.active }); setShowForm(true); }

  function handleSave() {
    if (!form.name.trim()) { showAlert("Workflow name required", "error"); return; }
    if (editing) {
      setWorkflows(prev => prev.map(w => w.id === editing ? { ...w, ...form } : w));
      showAlert("Workflow updated", "success");
    } else {
      const id = String(Date.now());
      setWorkflows(prev => [...prev, { id, ...form, runs: 0, steps: [] }]);
      setSelected(id);
      showAlert("Workflow created", "success");
    }
    setShowForm(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Workflow className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Canned Workflows</h1>
            <p className="text-sm text-gray-500">Multi-step automated workflows for common support scenarios</p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="w-4 h-4 mr-1.5" /> New Workflow
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total Workflows", value: workflows.length, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Active", value: workflows.filter(w => w.active).length, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Runs", value: workflows.reduce((s, w) => s + w.runs, 0), color: "text-teal-600", bg: "bg-teal-50" },
        ].map(s => (
          <Card key={s.label} className="border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}>
                <Zap className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Workflow list */}
        <div className="w-72 shrink-0 space-y-2">
          {workflows.map(wf => (
            <button key={wf.id} onClick={() => setSelected(wf.id === selected ? null : wf.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${selected === wf.id ? "border-teal-300 bg-teal-50" : "border-gray-200 bg-white hover:border-teal-200"}`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-900 leading-snug">{wf.name}</p>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${wf.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                  {wf.active ? "Active" : "Off"}
                </Badge>
              </div>
              <p className="text-xs text-gray-400 line-clamp-1">{wf.description}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                <span>{wf.steps.length} steps</span>
                <span>{wf.runs} runs</span>
              </div>
            </button>
          ))}
        </div>

        {/* Workflow detail */}
        {selectedWf ? (
          <div className="flex-1 min-w-0">
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{selectedWf.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-0.5">{selectedWf.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDuplicate(selectedWf)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-teal-600 transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEdit(selectedWf)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-teal-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(selectedWf.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Button size="sm" variant="outline" onClick={() => toggleActive(selectedWf.id)}
                      className={selectedWf.active ? "border-amber-300 text-amber-700 hover:bg-amber-50" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}>
                      {selectedWf.active ? <><Pause className="w-3.5 h-3.5 mr-1" />Pause</> : <><Play className="w-3.5 h-3.5 mr-1" />Activate</>}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Workflow Steps</h3>
                {selectedWf.steps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-300 border-2 border-dashed border-gray-200 rounded-xl">
                    <Workflow className="w-8 h-8 mb-2" />
                    <p className="text-xs">No steps yet — add steps to build your workflow</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedWf.steps.map((step, i) => (
                      <div key={step.id} className="flex items-start gap-3">
                        <div className="flex flex-col items-center shrink-0">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">{i + 1}</div>
                          {i < selectedWf.steps.length - 1 && <div className="w-px h-6 bg-gray-200 mt-1" />}
                        </div>
                        <div className="flex-1 p-3 rounded-lg border border-gray-100 bg-gray-50 mb-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <StepBadge type={step.type} />
                              <span className="text-sm font-medium text-gray-900">{step.label}</span>
                            </div>
                            <GripVertical className="w-3.5 h-3.5 text-gray-300" />
                          </div>
                          {step.detail && <p className="text-xs text-gray-500 mt-1">{step.detail}</p>}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 mt-2 pl-10">
                      <div className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-gray-300" />
                      </div>
                      <span className="text-xs text-gray-400">Workflow complete</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <div className="text-center">
              <Workflow className="w-10 h-10 mb-2 mx-auto opacity-30" />
              <p className="text-sm">Select a workflow to view its steps</p>
            </div>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Workflow" : "New Workflow"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Workflow Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. New Customer Onboarding" className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What does this workflow do?" rows={2} className="mt-1" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="wf-active" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded" />
              <Label htmlFor="wf-active" className="cursor-pointer">Activate immediately</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700 text-white">{editing ? "Save" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
