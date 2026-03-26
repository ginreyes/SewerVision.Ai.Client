"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  ClipboardCheck, Plus, CheckCircle2, Search, Camera,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import { useOperatorChecklists, useToggleChecklistItem } from "@/hooks/useQueryHooks";
import { ChecklistItem, STATUS_CONFIG } from "@/components/operator/checklists";

export default function FieldChecklist() {
  const { showAlert } = useAlert();
  const { userId } = useUser();

  const { data: checklists = [], isLoading } = useOperatorChecklists(userId);
  const toggleMutation = useToggleChecklistItem();

  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      checklists.filter(
        (c) =>
          !search ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.project?.toLowerCase().includes(search.toLowerCase())
      ),
    [checklists, search]
  );

  const selectedList = useMemo(
    () => checklists.find((c) => c.id === selected) || checklists[0] || null,
    [checklists, selected]
  );

  const handleToggle = useCallback(
    (itemId) => {
      if (!selectedList) return;
      toggleMutation.mutate(
        { checklistId: selectedList.id, itemIndex: itemId },
        {
          onError: () => showAlert("Failed to toggle item", "error"),
        }
      );
    },
    [selectedList, toggleMutation, showAlert]
  );

  const handleSelect = useCallback((id) => setSelected(id), []);

  const doneCount = selectedList?.items?.filter((i) => i.done).length || 0;
  const totalCount = selectedList?.items?.length || 0;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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

      {checklists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <ClipboardCheck className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm font-medium">No checklists found</p>
          <p className="text-xs mt-1">Create a new checklist to get started</p>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* List panel */}
          <div className="w-72 shrink-0 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search checklists..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
            {filtered.map((c) => {
              const done = c.items?.filter((i) => i.done).length || 0;
              const total = c.items?.length || 0;
              const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
              return (
                <button key={c.id} onClick={() => handleSelect(c.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${(selected || checklists[0]?.id) === c.id ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-200"}`}>
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
                    <Badge variant="outline" className={`${(STATUS_CONFIG[selectedList.status] || STATUS_CONFIG.pending).color}`}>
                      {(STATUS_CONFIG[selectedList.status] || STATUS_CONFIG.pending).label}
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
                  {selectedList.items?.map((item, index) => (
                    <ChecklistItem key={item.id} item={item} index={index} onToggle={handleToggle} />
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
      )}
    </div>
  );
}
