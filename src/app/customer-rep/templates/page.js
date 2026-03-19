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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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

const CATEGORIES = [
  { value: "greeting", label: "Greeting" },
  { value: "closing", label: "Closing" },
  { value: "troubleshooting", label: "Troubleshooting" },
  { value: "billing", label: "Billing" },
  { value: "status-update", label: "Status Update" },
  { value: "follow-up", label: "Follow Up" },
  { value: "general", label: "General" },
];

const CATEGORY_COLORS = {
  greeting: "bg-emerald-100 text-emerald-700 border-emerald-200",
  closing: "bg-blue-100 text-blue-700 border-blue-200",
  troubleshooting: "bg-amber-100 text-amber-700 border-amber-200",
  billing: "bg-purple-100 text-purple-700 border-purple-200",
  "status-update": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "follow-up": "bg-orange-100 text-orange-700 border-orange-200",
  general: "bg-gray-100 text-gray-700 border-gray-200",
};

const PLACEHOLDERS = [
  { tag: "{{customerName}}", desc: "Customer's full name" },
  { tag: "{{ticketId}}", desc: "Support ticket ID" },
  { tag: "{{agentName}}", desc: "Your name" },
  { tag: "{{date}}", desc: "Today's date" },
];

export default function CustomerRepTemplates() {
  const { userId } = useUser();
  const { showAlert } = useAlert();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // Form
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formCategory, setFormCategory] = useState("general");
  const [formShortcut, setFormShortcut] = useState("");
  const [formShared, setFormShared] = useState(false);

  const { data: templates, isLoading } = useCannedResponses(userId, { refetchInterval: 30000 });
  const createMutation = useCreateCannedResponse();
  const updateMutation = useUpdateCannedResponse();
  const deleteMutation = useDeleteCannedResponse();

  const filteredTemplates = (Array.isArray(templates) ? templates : []).filter((t) => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.body.toLowerCase().includes(search.toLowerCase());
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
    setShowDialog(true);
  }, []);

  const openEdit = useCallback((t) => {
    setEditingTemplate(t);
    setFormTitle(t.title);
    setFormBody(t.body);
    setFormCategory(t.category || "general");
    setFormShortcut(t.shortcut || "");
    setFormShared(t.isShared || false);
    setShowDialog(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formTitle.trim() || !formBody.trim()) {
      showAlert("Title and body are required", "error");
      return;
    }
    try {
      if (editingTemplate) {
        await updateMutation.mutateAsync({
          id: editingTemplate._id,
          title: formTitle.trim(),
          body: formBody.trim(),
          category: formCategory,
          shortcut: formShortcut.trim(),
          isShared: formShared,
        });
        showAlert("Template updated", "success");
      } else {
        await createMutation.mutateAsync({
          title: formTitle.trim(),
          body: formBody.trim(),
          category: formCategory,
          shortcut: formShortcut.trim(),
          isShared: formShared,
          createdBy: userId,
        });
        showAlert("Template created", "success");
      }
      setShowDialog(false);
    } catch (e) {
      showAlert(e.message, "error");
    }
  }, [formTitle, formBody, formCategory, formShortcut, formShared, editingTemplate, userId, createMutation, updateMutation, showAlert]);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      showAlert("Template deleted", "success");
    } catch (e) {
      showAlert(e.message, "error");
    }
  }, [deleteMutation, showAlert]);

  const handleCopy = useCallback((body) => {
    navigator.clipboard.writeText(body);
    showAlert("Copied to clipboard", "success");
  }, [showAlert]);

  const insertPlaceholder = useCallback((tag) => {
    setFormBody((prev) => prev + tag);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Response Templates</h1>
              <p className="text-sm text-gray-500">Create and manage canned responses for quick replies</p>
            </div>
          </div>
          <Button size="sm" onClick={openCreate} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-1.5" /> New Template
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
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

        {/* Templates Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="rounded-xl border border-gray-200 py-16">
            <EmptySewerComponent
              variant="no-tickets"
              title="No templates yet"
              subtitle="Create your first response template for quick replies"
              size="md"
              action={{ label: "Create Template", onClick: openCreate }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((t) => (
              <Card key={t._id} className="group border border-gray-200 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all duration-200 overflow-hidden">
                {/* Color strip at top */}
                <div className={`h-1.5 ${CATEGORY_COLORS[t.category]?.split(" ")[0] || "bg-gray-200"}`} />
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold truncate">{t.title}</CardTitle>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <Badge className={`text-[10px] px-2 py-0.5 ${CATEGORY_COLORS[t.category] || CATEGORY_COLORS.general}`}>
                          <Tag className="w-2.5 h-2.5 mr-0.5" /> {t.category}
                        </Badge>
                        {t.isShared && (
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 gap-0.5">
                            <Globe className="w-2.5 h-2.5" /> Shared
                          </Badge>
                        )}
                        {t.shortcut && (
                          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-mono">
                            /{t.shortcut}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-1 pb-4">
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">{t.body}</p>
                  <Separator className="mb-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Used <strong className="text-gray-600">{t.usageCount || 0}</strong> times</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-teal-50" onClick={() => handleCopy(t.body)} title="Copy">
                        <Copy className="w-4 h-4 text-gray-400 hover:text-teal-600" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50" onClick={() => openEdit(t)} title="Edit">
                        <Edit className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-50" onClick={() => handleDelete(t._id)} title="Delete">
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          {/* Dialog Header with gradient */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4">
            <DialogHeader className="text-white">
              <DialogTitle className="text-white text-lg">
                {editingTemplate ? "Edit Template" : "Create New Template"}
              </DialogTitle>
              <DialogDescription className="text-white/70">
                {editingTemplate ? "Update this response template" : "Build a reusable response for quick customer replies"}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Template Name <span className="text-red-500">*</span></Label>
                <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g., Welcome Response" className="h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Response Body <span className="text-red-500">*</span></Label>
                <div className="flex items-center gap-1 bg-gray-50 rounded-md px-2 py-1">
                  <span className="text-[10px] text-gray-400 mr-1">Variables:</span>
                  {PLACEHOLDERS.map((p) => (
                    <Button
                      key={p.tag}
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] px-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50"
                      onClick={() => insertPlaceholder(p.tag)}
                      title={p.desc}
                    >
                      {p.tag.replace(/\{\{|\}\}/g, "")}
                    </Button>
                  ))}
                </div>
              </div>
              <Textarea
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                placeholder="Hi {{customerName}},&#10;&#10;Thank you for reaching out..."
                rows={8}
                className="resize-none font-mono text-sm border-gray-200 focus:border-teal-300"
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Quick Shortcut</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500 text-sm font-mono">/</span>
                  <Input
                    value={formShortcut}
                    onChange={(e) => setFormShortcut(e.target.value.replace(/\s/g, "").toLowerCase())}
                    placeholder="greet"
                    className="pl-7 h-10 font-mono"
                  />
                </div>
                <p className="text-xs text-gray-400">Type <code className="bg-gray-100 px-1 rounded text-teal-600">/{formShortcut || "shortcut"}</code> to quick-insert</p>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50/50">
                <div>
                  <p className="text-sm font-medium">Share with team</p>
                  <p className="text-xs text-gray-500">Visible to all support reps</p>
                </div>
                <Switch checked={formShared} onCheckedChange={setFormShared} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-teal-600 hover:bg-teal-700 px-6"
              >
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                {editingTemplate ? "Save Changes" : "Create Template"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
