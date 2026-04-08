"use client";

import React, { useState, useMemo } from "react";
import {
  AlertTriangle, Plus, ChevronRight, Clock, Flame, Bell, CheckCircle2,
  Shield, Timer, Users, ArrowUpCircle, Search, Settings, Trash2, Edit, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import {
  useSupportAllTickets,
  useEscalationRules,
  useCreateEscalationRule,
  useUpdateEscalationRule,
  useDeleteEscalationRule,
  useToggleEscalationRule,
} from "@/hooks/useQueryHooks";
import { ListSkeleton } from '@/components/shared/SkeletonLoading';

const TRIGGER_TYPES = ["SLA Breach", "Priority High", "No Response 2h", "No Response 8h", "Customer VIP", "Repeat Contact"];
const ACTIONS = ["Notify Supervisor", "Reassign Agent", "Escalate to Manager", "Send Alert Email", "Flag for Review"];
const PRIORITY_COLORS = { high: "bg-red-100 text-red-700 border-red-200", medium: "bg-amber-100 text-amber-700 border-amber-200", low: "bg-blue-100 text-blue-700 border-blue-200" };
const EMPTY_RULE = { name: "", trigger: "SLA Breach", condition: "", action: "Notify Supervisor", priority: "medium", active: true };

export default function EscalationManager() {
  const { showAlert } = useAlert();
  const { userId } = useUser();
  const { data: rules = [], isLoading } = useEscalationRules();
  const createMutation = useCreateEscalationRule();
  const updateMutation = useUpdateEscalationRule();
  const deleteMutation = useDeleteEscalationRule();
  const toggleMutation = useToggleEscalationRule();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_RULE);

  const { data: ticketsRaw } = useSupportAllTickets();
  const tickets = useMemo(() => {
    if (Array.isArray(ticketsRaw)) return ticketsRaw;
    if (ticketsRaw?.data && Array.isArray(ticketsRaw.data)) return ticketsRaw.data;
    return [];
  }, [ticketsRaw]);

  const escalated = useMemo(() => {
    const now = Date.now();
    return tickets.filter(t => {
      const h = (now - new Date(t.created_at || t.createdAt).getTime()) / 3600000;
      return h > 24 && (t.status === "open" || t.status === "in-progress");
    });
  }, [tickets]);

  const filtered = rules.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()));

  function openCreate() { setEditing(null); setForm(EMPTY_RULE); setShowForm(true); }
  function openEdit(r) { setEditing(r._id); setForm({ name: r.name, trigger: r.trigger, condition: r.condition, action: r.action, priority: r.priority, active: r.active }); setShowForm(true); }

  function handleSave() {
    if (!form.name.trim()) { showAlert("Rule name required", "error"); return; }
    if (editing) {
      updateMutation.mutate({ id: editing, ...form }, {
        onSuccess: () => { showAlert("Rule updated", "success"); setShowForm(false); },
        onError: (e) => showAlert(e.message, "error"),
      });
    } else {
      createMutation.mutate({ ...form, createdBy: userId }, {
        onSuccess: () => { showAlert("Rule created", "success"); setShowForm(false); },
        onError: (e) => showAlert(e.message, "error"),
      });
    }
  }

  function handleToggle(id) {
    toggleMutation.mutate(id, {
      onSuccess: (data) => showAlert(`Rule ${data?.active ? 'activated' : 'paused'}`, "success"),
      onError: (e) => showAlert(e.message, "error"),
    });
  }

  function handleDelete(id) {
    if (!confirm('Delete this item? This action cannot be undone.')) return;
    deleteMutation.mutate(id, {
      onSuccess: () => showAlert("Rule deleted", "success"),
      onError: (e) => showAlert(e.message, "error"),
    });
  }

  return (<ListSkeleton />)

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-md">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Escalation Manager</h1>
            <p className="text-sm text-gray-500">Define rules to auto-escalate tickets based on conditions</p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="w-4 h-4 mr-1.5" /> New Rule
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Rules", value: rules.length, color: "text-teal-600", bg: "bg-teal-50", icon: Shield },
          { label: "Active Rules", value: rules.filter(r => r.active).length, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
          { label: "Total Triggered", value: rules.reduce((s, r) => s + (r.triggeredCount || 0), 0), color: "text-amber-600", bg: "bg-amber-50", icon: Bell },
          { label: "Escalated Tickets", value: escalated.length, color: "text-red-600", bg: "bg-red-50", icon: ArrowUpCircle },
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

      <div className="grid grid-cols-3 gap-4">
        {/* Rules list */}
        <div className="col-span-2 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search rules…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <Shield className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No escalation rules yet</p>
            </div>
          )}
          {filtered.map(r => (
            <Card key={r._id} className={`border-gray-200 ${!r.active ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-sm font-semibold text-gray-900">{r.name}</h3>
                      <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[r.priority] || ""}`}>{r.priority}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${r.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {r.active ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Timer className="w-3 h-3 text-amber-500" />{r.trigger}</span>
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                      <span className="flex items-center gap-1"><Bell className="w-3 h-3 text-blue-500" />{r.action}</span>
                    </div>
                    {r.condition && <p className="text-[11px] text-gray-400 mt-1">Condition: {r.condition}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs font-bold text-gray-500 mr-2">{r.triggeredCount || 0}×</span>
                    <button onClick={() => handleToggle(r._id)} disabled={toggleMutation.isPending}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-teal-600 transition-colors">
                      {r.active ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openEdit(r)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-teal-600 transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(r._id)} disabled={deleteMutation.isPending}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Escalated tickets */}
        <div>
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Currently Escalated
                {escalated.length > 0 && <Badge className="bg-red-100 text-red-700 border-red-200 ml-auto">{escalated.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {escalated.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                  <p className="text-xs text-gray-400">No escalated tickets</p>
                </div>
              ) : escalated.slice(0, 8).map(t => (
                <div key={t._id} className="p-2.5 rounded-lg bg-red-50 border border-red-100">
                  <p className="text-xs font-medium text-gray-900 truncate">{t.subject || "No subject"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] bg-red-100 text-red-700 border-red-200 capitalize">{t.priority}</Badge>
                    <span className="text-[10px] text-red-600 flex items-center gap-0.5"><Timer className="w-2.5 h-2.5" />SLA breached</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Rule" : "New Escalation Rule"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Rule Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. SLA Critical Breach" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Trigger</Label>
                <Select value={form.trigger} onValueChange={v => setForm(f => ({ ...f, trigger: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{TRIGGER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Action</Label>
                <Select value={form.action} onValueChange={v => setForm(f => ({ ...f, action: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{ACTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Condition (optional)</Label>
                <Input value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} placeholder="e.g. After 24h" className="mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded" />
              <Label htmlFor="active" className="cursor-pointer">Activate rule immediately</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700 text-white">
                {(createMutation.isPending || updateMutation.isPending) ? "Saving…" : editing ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
