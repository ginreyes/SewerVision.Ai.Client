"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Layers, Plus, Copy, Trash2, Play, Users, ClipboardList,
  Calendar, CheckCircle2, ChevronRight, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import {
  useUserTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useToggleTemplateStar,
  useDuplicateTemplate,
  useDeleteTemplate,
  useUseTemplate,
} from "@/hooks/useQueryHooks";
import { TemplateCard } from "@/components/user/project-templates";
import { GridSkeleton } from '@/components/shared/SkeletonLoading';

export default function ProjectTemplates() {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const { data, isLoading } = useUserTemplates(userId);

  const templates = useMemo(() => Array.isArray(data) ? data : (data?.data || []), [data]);

  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "" });

  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const toggleStar = useToggleTemplateStar();
  const duplicateTemplate = useDuplicateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const useTemplateMutation = useUseTemplate();

  const selectedTemplate = useMemo(
    () => templates.find(t => t.id === selected) ?? null,
    [templates, selected]
  );

  const handleSelect = useCallback((id) => {
    setSelected(id);
  }, []);

  const handleToggleStar = useCallback(
    (id) => {
      toggleStar.mutate(id, {
        onError: () => showAlert("Failed to toggle star", "error"),
      });
    },
    [toggleStar, showAlert]
  );

  const handleDuplicate = useCallback(
    (t) => {
      duplicateTemplate.mutate(t.id, {
        onSuccess: () => showAlert("Template duplicated", "success"),
        onError: () => showAlert("Failed to duplicate template", "error"),
      });
    },
    [duplicateTemplate, showAlert]
  );

  const handleDelete = useCallback(
    (id) => {
      deleteTemplate.mutate(id, {
        onSuccess: () => {
          if (selected === id) setSelected(null);
          showAlert("Template deleted", "success");
        },
        onError: () => showAlert("Failed to delete template", "error"),
      });
    },
    [deleteTemplate, selected, showAlert]
  );

  const handleUseTemplate = useCallback(
    (t) => {
      useTemplateMutation.mutate(t.id, {
        onSuccess: () => showAlert(`Template "${t.name}" applied to new project`, "success"),
        onError: () => showAlert("Failed to use template", "error"),
      });
    },
    [useTemplateMutation, showAlert]
  );

  const handleCreate = useCallback(() => {
    if (!form.name.trim()) {
      showAlert("Name required", "error");
      return;
    }
    createTemplate.mutate(
      { name: form.name, type: form.type || "General" },
      {
        onSuccess: (res) => {
          if (res?.template?.id) setSelected(res.template.id);
          setShowForm(false);
          setForm({ name: "", type: "" });
          showAlert("Template created", "success");
        },
        onError: () => showAlert("Failed to create template", "error"),
      }
    );
  }, [form, createTemplate, showAlert]);

  if (isLoading) return (<GridSkeleton count={6} />)
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
        <Button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
        >
          <Plus className="w-4 h-4" /> New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <Layers className="w-8 h-8 mr-2 opacity-30" />
          <p className="text-sm">No templates yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* Template list */}
          <div className="w-72 shrink-0 space-y-2">
            {templates.map(t => (
              <TemplateCard
                key={t.id}
                template={t}
                isSelected={selected === t.id}
                onSelect={handleSelect}
                onToggleStar={handleToggleStar}
              />
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
                      <Badge
                        variant="outline"
                        className="mt-1 text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200"
                      >
                        {selectedTemplate.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDuplicate(selectedTemplate)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(selectedTemplate.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Button
                        onClick={() => handleUseTemplate(selectedTemplate)}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" /> Use Template
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 grid grid-cols-3 gap-4">
                  {/* Team */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />Team
                    </p>
                    {(selectedTemplate.team ?? []).map((t, i) => (
                      <p key={i} className="text-xs text-gray-700 py-1 border-b border-gray-50 last:border-0">
                        {t}
                      </p>
                    ))}
                    {(!selectedTemplate.team || selectedTemplate.team.length === 0) && (
                      <p className="text-xs text-gray-400">No team defined</p>
                    )}
                  </div>
                  {/* Milestones */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />Milestones
                    </p>
                    {(selectedTemplate.milestones ?? []).map((m, i) => (
                      <div key={i} className="flex items-center gap-1.5 py-1 border-b border-gray-50 last:border-0">
                        <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0" />
                        <p className="text-xs text-gray-700">{m}</p>
                      </div>
                    ))}
                  </div>
                  {/* Tasks */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <ClipboardList className="w-3.5 h-3.5" />Tasks
                    </p>
                    {(selectedTemplate.tasks ?? []).map((t, i) => (
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
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Project Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Template Name</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Standard Pipeline Inspection"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Input
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                placeholder="e.g. Sewer, Emergency, Large Diameter..."
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
