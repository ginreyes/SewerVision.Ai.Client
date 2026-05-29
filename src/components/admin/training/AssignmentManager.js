"use client";

import React, { useState, useMemo, memo } from "react";
import {
  Send, Users, CheckCircle2, Clock, AlertTriangle, Loader2,
  Calendar, BookOpen, Trash2, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/components/providers/AlertProvider";
import { useTrainingAssignmentsOverview, useRemindTrainingAssignment } from "@/hooks/useQueryHooks";

const STATUS_COLORS = {
  assigned: "bg-blue-100 text-blue-700 border-blue-200",
  "in-progress": "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_FILTERS = ["all", "assigned", "in-progress", "completed", "overdue"];

const ROLE_FILTERS = [
  { value: "all",            label: "All roles" },
  { value: "qc-technician",  label: "QC Tech" },
  { value: "operator",       label: "Operator" },
  { value: "user",           label: "Team Lead" },
];

export default function AssignmentManager({ modules, progress, assignments, assignMutation, isLoading }) {
  const { showAlert } = useAlert();
  const [selectedModules, setSelectedModules] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [remindingId, setRemindingId] = useState(null);

  // Live overview (computes isOverdue + promotes past-due rows) and the
  // reminder fan-out. Falls back to the prop list if the overview is loading.
  const { data: overview } = useTrainingAssignmentsOverview(roleFilter === "all" ? undefined : roleFilter);
  const remindMutation = useRemindTrainingAssignment();

  const mods = Array.isArray(modules) ? modules : [];
  const team = Array.isArray(progress) ? progress : [];
  const counts = overview?.counts;
  const summary = overview?.summary;

  const allAssignments = useMemo(() => {
    const overviewAssignments = Array.isArray(overview?.assignments) ? overview.assignments : null;
    return overviewAssignments ?? (Array.isArray(assignments) ? assignments : []);
  }, [overview, assignments]);

  const visibleAssignments = useMemo(() => {
    if (statusFilter === "all") return allAssignments;
    if (statusFilter === "overdue") return allAssignments.filter((a) => a.isOverdue || a.status === "overdue");
    return allAssignments.filter((a) => a.status === statusFilter);
  }, [allAssignments, statusFilter]);

  async function handleRemind(id) {
    setRemindingId(id);
    try {
      await remindMutation.mutateAsync(id);
      showAlert("Reminder sent", "success");
    } catch (e) {
      showAlert(e?.message || "Failed to send reminder", "error");
    } finally {
      setRemindingId(null);
    }
  }

  function toggleModule(id) {
    setSelectedModules(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  }
  function toggleUser(id) {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  }
  function selectAllUsers() { setSelectedUsers(team.map(t => t.user?._id).filter(Boolean)); }

  async function handleAssign() {
    if (selectedModules.length === 0 || selectedUsers.length === 0) {
      showAlert("Select at least one module and one technician", "error");
      return;
    }
    try {
      await assignMutation.mutateAsync({
        moduleIds: selectedModules,
        userIds: selectedUsers,
        dueDate: dueDate || undefined,
      });
      showAlert(`Assigned ${selectedModules.length} module(s) to ${selectedUsers.length} tech(s)`, "success");
      setSelectedModules([]);
      setSelectedUsers([]);
      setDueDate("");
    } catch (err) {
      showAlert(err.message || "Failed to assign", "error");
    }
  }

  return (
    <div className="space-y-5">
      {/* Assign form */}
      <Card className="border-rose-200 bg-rose-50/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Send className="w-4 h-4 text-rose-500" />Assign Training Modules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Select modules */}
          <div>
            <Label className="text-xs font-semibold">Select Modules</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {mods.map(mod => {
                const id = mod._id || mod.id;
                const active = selectedModules.includes(id);
                return (
                  <button key={id} onClick={() => toggleModule(id)}
                    className={`text-left p-2.5 rounded-lg border text-xs transition-all ${active ? "border-rose-300 bg-rose-50" : "border-gray-200 bg-white hover:border-rose-200"}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${active ? "bg-rose-500 border-rose-500" : "border-gray-300"}`}>
                        {active && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-medium text-gray-800">{mod.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Select users */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Select QC Technicians</Label>
              <button onClick={selectAllUsers} className="text-[11px] text-rose-600 hover:text-rose-700 font-medium">Select All</button>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {team.map(t => {
                const id = t.user?._id;
                if (!id) return null;
                const active = selectedUsers.includes(id);
                return (
                  <button key={id} onClick={() => toggleUser(id)}
                    className={`text-left p-2.5 rounded-lg border text-xs transition-all ${active ? "border-rose-300 bg-rose-50" : "border-gray-200 bg-white hover:border-rose-200"}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${active ? "bg-rose-500 border-rose-500" : "border-gray-300"}`}>
                        {active && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-medium text-gray-800">{t.user?.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due date + assign */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Label className="text-xs font-semibold">Due Date (optional)</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 h-9" />
            </div>
            <Button onClick={handleAssign} disabled={assignMutation?.isPending || selectedModules.length === 0 || selectedUsers.length === 0}
              className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5 h-9">
              {assignMutation?.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Assign ({selectedModules.length} × {selectedUsers.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assignment list + overdue tracking */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-500" /> Assignments ({allAssignments.length})
            </CardTitle>
            {counts?.overdue > 0 && (
              <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200 gap-1">
                <AlertTriangle className="w-3 h-3" /> {counts.overdue} overdue
              </Badge>
            )}
          </div>
          {/* Summary strip — served by GET /api/training/assignments-overview's `summary` block */}
          {summary && summary.total > 0 && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              <div className="rounded border border-gray-200 bg-white px-2.5 py-1.5">
                <div className="text-[10px] uppercase tracking-wide text-gray-500">Total</div>
                <div className="font-semibold tabular-nums">{summary.total}</div>
              </div>
              <div className="rounded border border-red-200 bg-red-50 px-2.5 py-1.5">
                <div className="text-[10px] uppercase tracking-wide text-red-700">Overdue</div>
                <div className="font-semibold tabular-nums text-red-700">{summary.overdue}</div>
              </div>
              <div className="rounded border border-amber-200 bg-amber-50 px-2.5 py-1.5">
                <div className="text-[10px] uppercase tracking-wide text-amber-700">In Progress</div>
                <div className="font-semibold tabular-nums text-amber-700">{summary.inProgress}</div>
              </div>
              <div className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1.5">
                <div className="text-[10px] uppercase tracking-wide text-emerald-700">Completed</div>
                <div className="font-semibold tabular-nums text-emerald-700">{summary.completed}</div>
              </div>
              <div className="rounded border border-gray-200 bg-gray-50 px-2.5 py-1.5">
                <div className="text-[10px] uppercase tracking-wide text-gray-500">Avg days to complete</div>
                <div className="font-semibold tabular-nums">{summary.avgCompletionDays || "—"}</div>
              </div>
            </div>
          )}
          {/* Role filter chips */}
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wide text-gray-400 mr-1">Role</span>
            {ROLE_FILTERS.map((r) => (
              <button key={r.value} onClick={() => setRoleFilter(r.value)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  roleFilter === r.value ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:bg-gray-100"
                }`}>
                {r.label}
              </button>
            ))}
          </div>
          {/* Status filter chips */}
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {STATUS_FILTERS.map((s) => {
              const n = s === "all" ? counts?.total
                : s === "in-progress" ? counts?.inProgress
                : counts?.[s];
              return (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors ${
                    statusFilter === s ? "bg-rose-100 text-rose-700" : "text-gray-500 hover:bg-gray-100"
                  }`}>
                  {s}{typeof n === "number" ? ` (${n})` : ""}
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {visibleAssignments.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Module</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Assigned To</th>
                  <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Due</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {visibleAssignments.map(a => {
                  const isOverdue = a.isOverdue || a.status === "overdue";
                  const canRemind = a.status !== "completed";
                  return (
                    <tr key={a._id} className={`border-b border-gray-50 hover:bg-gray-50/60 ${isOverdue ? "bg-red-50/30" : ""}`}>
                      <td className="px-4 py-3 text-xs font-medium text-gray-900">{a.moduleId?.title || "Unknown"}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {a.assignedTo?.first_name ? `${a.assignedTo.first_name} ${a.assignedTo.last_name || ""}` : "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className={`text-[10px] capitalize ${STATUS_COLORS[isOverdue ? "overdue" : a.status] || ""}`}>
                          {isOverdue ? "overdue" : a.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-400">
                        {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canRemind && (
                          <Button variant="ghost" size="sm" onClick={() => handleRemind(a._id)}
                            disabled={remindingId === a._id}
                            className="h-7 px-2 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1">
                            {remindingId === a._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3" />}
                            Remind
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-400"><p className="text-xs">No assignments{statusFilter !== "all" ? ` with status "${statusFilter}"` : " yet"}</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
