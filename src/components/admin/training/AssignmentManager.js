"use client";

import React, { useState, useMemo, memo } from "react";
import {
  Send, Users, CheckCircle2, Clock, AlertTriangle, Loader2,
  Calendar, BookOpen, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/components/providers/AlertProvider";

const STATUS_COLORS = {
  assigned: "bg-blue-100 text-blue-700 border-blue-200",
  "in-progress": "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
};

export default function AssignmentManager({ modules, progress, assignments, assignMutation, isLoading }) {
  const { showAlert } = useAlert();
  const [selectedModules, setSelectedModules] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dueDate, setDueDate] = useState("");

  const mods = Array.isArray(modules) ? modules : [];
  const team = Array.isArray(progress) ? progress : [];
  const allAssignments = Array.isArray(assignments) ? assignments : [];

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

      {/* Assignment list */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-rose-500" /> Active Assignments ({allAssignments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {allAssignments.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Module</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Assigned To</th>
                  <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Due</th>
                </tr>
              </thead>
              <tbody>
                {allAssignments.map(a => (
                  <tr key={a._id} className="border-b border-gray-50 hover:bg-gray-50/60">
                    <td className="px-4 py-3 text-xs font-medium text-gray-900">{a.moduleId?.title || "Unknown"}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      {a.assignedTo?.first_name ? `${a.assignedTo.first_name} ${a.assignedTo.last_name || ""}` : "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={`text-[10px] capitalize ${STATUS_COLORS[a.status] || ""}`}>{a.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400">
                      {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-400"><p className="text-xs">No assignments yet</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
