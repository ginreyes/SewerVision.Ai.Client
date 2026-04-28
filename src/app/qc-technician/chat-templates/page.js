"use client";

import React, { useState, useCallback } from "react";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  Copy,
  Loader2,
  Tag,
  Globe,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/components/providers/UserContext";
import { useAlert } from "@/components/providers/AlertProvider";
import EmptySewerComponent from "@/components/shared/EmptySewerComponent";
import {
  useCannedResponses,
  useCreateCannedResponse,
  useUpdateCannedResponse,
  useDeleteCannedResponse,
} from "@/hooks/useQueryHooks";

/**
 * QC Chat Templates — personal + team-shared library used by the project
 * chat composer. Mirrors the customer-rep template page pattern but tagged
 * with `type: 'qc'` so the two libraries don't bleed into each other.
 *
 * Categories align with the AIModelConfig per-class threshold buckets, so
 * the auto-suggest endpoint can match templates to detection types
 * directly via category in addition to the free-form detectionTags field.
 */
const CATEGORIES = [
  { value: "fractures", label: "Fractures" },
  { value: "cracks", label: "Cracks" },
  { value: "broken_pipes", label: "Broken Pipes" },
  { value: "roots", label: "Roots" },
  { value: "corrosion", label: "Corrosion" },
  { value: "blockages", label: "Blockages" },
  { value: "qc-decision", label: "QC Decision" },
  { value: "general", label: "General" },
];

const CATEGORY_COLORS = {
  fractures: "bg-red-100 text-red-700 border-red-200",
  cracks: "bg-orange-100 text-orange-700 border-orange-200",
  broken_pipes: "bg-amber-100 text-amber-700 border-amber-200",
  roots: "bg-emerald-100 text-emerald-700 border-emerald-200",
  corrosion: "bg-purple-100 text-purple-700 border-purple-200",
  blockages: "bg-blue-100 text-blue-700 border-blue-200",
  "qc-decision": "bg-teal-100 text-teal-700 border-teal-200",
  general: "bg-gray-100 text-gray-700 border-gray-200",
};

const PLACEHOLDERS = [
  { tag: "{{projectName}}", desc: "Project name" },
  { tag: "{{detectionType}}", desc: "Detected defect type" },
  { tag: "{{severity}}", desc: "Detection severity" },
  { tag: "{{pacpCode}}", desc: "PACP code" },
  { tag: "{{technicianName}}", desc: "Your name" },
  { tag: "{{date}}", desc: "Today's date" },
];

const SEVERITY_TAGS = ["severity:critical", "severity:high", "severity:medium", "severity:low"];

export default function QcChatTemplates() {
  const { userId } = useUser();
  const { showAlert } = useAlert();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formCategory, setFormCategory] = useState("general");
  const [formShortcut, setFormShortcut] = useState("");
  const [formShared, setFormShared] = useState(false);
  const [formTags, setFormTags] = useState([]);

  const { data: templates, isLoading } = useCannedResponses(userId, { type: "qc" }, { refetchInterval: 30000 });
  const createMutation = useCreateCannedResponse();
  const updateMutation = useUpdateCannedResponse();
  const deleteMutation = useDeleteCannedResponse();

  const filteredTemplates = (Array.isArray(templates) ? templates : []).filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      t.title.toLowerCase().includes(q) ||
      t.body.toLowerCase().includes(q) ||
      (t.detectionTags || []).some((tag) => tag.toLowerCase().includes(q));
    const matchCategory = filterCategory === "all" || t.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const openCreate = useCallback(() => {
    setEditingTemplate(null);
    setFormTitle("");
    setFormBody("");
    setFormCategory("general");
    setFormShortcut("");
    setFormShared(false);
    setFormTags([]);
    setShowDialog(true);
  }, []);

  const openEdit = useCallback((t) => {
    setEditingTemplate(t);
    setFormTitle(t.title);
    setFormBody(t.body);
    setFormCategory(t.category || "general");
    setFormShortcut(t.shortcut || "");
    setFormShared(t.isShared || false);
    setFormTags(Array.isArray(t.detectionTags) ? t.detectionTags : []);
    setShowDialog(true);
  }, []);

  const toggleTag = useCallback((tag) => {
    setFormTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (!formTitle.trim() || !formBody.trim()) {
      showAlert("Title and body are required", "error");
      return;
    }
    const payload = {
      title: formTitle.trim(),
      body: formBody.trim(),
      category: formCategory,
      shortcut: formShortcut.trim(),
      isShared: formShared,
      type: "qc",
      detectionTags: formTags,
    };
    try {
      if (editingTemplate) {
        await updateMutation.mutateAsync({ id: editingTemplate._id, ...payload });
        showAlert("Template updated", "success");
      } else {
        await createMutation.mutateAsync({ ...payload, createdBy: userId });
        showAlert("Template created", "success");
      }
      setShowDialog(false);
    } catch (e) {
      showAlert(e.message, "error");
    }
  }, [formTitle, formBody, formCategory, formShortcut, formShared, formTags, editingTemplate, userId, createMutation, updateMutation, showAlert]);

  const handleDelete = useCallback(
    async (id) => {
      if (!confirm("Delete this template? This can't be undone.")) return;
      try {
        await deleteMutation.mutateAsync(id);
        showAlert("Template deleted", "success");
      } catch (e) {
        showAlert(e.message, "error");
      }
    },
    [deleteMutation, showAlert]
  );

  const handleCopy = useCallback(
    (body) => {
      navigator.clipboard.writeText(body);
      showAlert("Copied to clipboard", "success");
    },
    [showAlert]
  );

  const insertPlaceholder = useCallback((tag) => {
    setFormBody((prev) => prev + tag);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">QC Chat Templates</h1>
              <p className="text-sm text-gray-500">
                Personal + team-shared snippets used in project chat. Tag with detection class to enable auto-suggest.
              </p>
            </div>
          </div>
          <Button size="sm" onClick={openCreate} className="bg-rose-600 hover:bg-rose-700">
            <Plus className="w-4 h-4 mr-1.5" /> New Template
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search templates…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="rounded-xl border border-gray-200 py-16">
            <EmptySewerComponent
              variant="no-tickets"
              title="No QC templates yet"
              subtitle="Create your first template — handy for repetitive QC chat replies"
              size="md"
              action={{ label: "Create Template", onClick: openCreate }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((t) => {
              const isMine = t.createdBy?._id === userId || t.createdBy === userId;
              return (
                <Card
                  key={t._id}
                  className="group border border-gray-200 shadow-sm hover:shadow-lg hover:border-rose-200 transition-all overflow-hidden"
                >
                  <div className={`h-1.5 ${CATEGORY_COLORS[t.category]?.split(" ")[0] || "bg-gray-200"}`} />
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold truncate">{t.title}</CardTitle>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <Badge className={`text-[10px] px-2 py-0.5 ${CATEGORY_COLORS[t.category] || CATEGORY_COLORS.general}`}>
                            <Tag className="w-2.5 h-2.5 mr-0.5" />
                            {t.category}
                          </Badge>
                          {t.isShared ? (
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 gap-0.5">
                              <Globe className="w-2.5 h-2.5" /> Shared
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 gap-0.5 text-gray-500">
                              <Lock className="w-2.5 h-2.5" /> Personal
                            </Badge>
                          )}
                          {t.shortcut && (
                            <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-mono">
                              /{t.shortcut}
                            </Badge>
                          )}
                          {(t.detectionTags || []).slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0.5 text-rose-700 border-rose-200">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 space-y-3">
                    <p className="text-xs text-gray-600 line-clamp-3 whitespace-pre-wrap break-words">
                      {t.body}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-[10px] text-gray-400">
                        Used {t.usageCount || 0}× · {isMine ? "You" : t.createdBy?.username || "Team"}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleCopy(t.body)} title="Copy body">
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        {isMine && (
                          <>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(t)} title="Edit">
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(t._id)}
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create / Edit dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? "Edit Template" : "New QC Template"}</DialogTitle>
              <DialogDescription>
                Define a reusable snippet. Tag it with detection classes / severities so it surfaces on the right detections.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Title</Label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Critical fracture flagged"
                  className="h-9"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Category</Label>
                  <Select value={formCategory} onValueChange={setFormCategory}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Shortcut</Label>
                  <Input
                    value={formShortcut}
                    onChange={(e) => setFormShortcut(e.target.value)}
                    placeholder="e.g. crit-frac"
                    className="h-9 font-mono"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Body</Label>
                <Textarea
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  rows={5}
                  placeholder="Hi team — confirming {{detectionType}} at {{pacpCode}} on {{projectName}}…"
                />
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {PLACEHOLDERS.map((p) => (
                    <button
                      key={p.tag}
                      type="button"
                      onClick={() => insertPlaceholder(p.tag)}
                      className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 text-gray-700 hover:bg-rose-50 hover:border-rose-200"
                      title={p.desc}
                    >
                      {p.tag}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Severity tags (optional — auto-suggest hint)</Label>
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  {SEVERITY_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        formTags.includes(tag)
                          ? "bg-rose-600 text-white border-rose-600"
                          : "bg-white text-gray-600 border-gray-200 hover:border-rose-200"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <div>
                  <Label className="text-xs font-medium">Share with QC team</Label>
                  <p className="text-[10px] text-gray-500">Other QC techs can use it (read-only).</p>
                </div>
                <Switch checked={formShared} onCheckedChange={setFormShared} />
              </div>
              {formShared && (
                <div className="flex items-start gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>Shared templates are visible to every QC technician. Don&apos;t include client-specific or sensitive details.</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-rose-600 hover:bg-rose-700"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                )}
                {editingTemplate ? "Save Changes" : "Create Template"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
