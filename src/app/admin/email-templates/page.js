"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mail, Plus, Edit, Trash2, Eye, CheckCircle2, XCircle,
  Loader2, Search, ToggleLeft, ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlert } from "@/components/providers/AlertProvider";
import EmptyState from '@/components/shared/EmptyState';
import { api } from "@/lib/helper";
import { TemplateEditor } from "@/components/admin/email-templates";
import { ListSkeleton } from '@/components/shared/SkeletonLoading';

const CATEGORY_COLORS = {
  system: "bg-blue-100 text-blue-700 border-blue-200",
  notification: "bg-amber-100 text-amber-700 border-amber-200",
  marketing: "bg-purple-100 text-purple-700 border-purple-200",
  custom: "bg-gray-100 text-gray-600 border-gray-200",
};

const TEMPLATES_KEY = ["admin", "email-templates"];

export default function EmailTemplatesPage() {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null = list view, 'new' = create, template obj = edit

  const { data: templatesData, isLoading: loading } = useQuery({
    queryKey: TEMPLATES_KEY,
    queryFn: async () => {
      const res = await api("/api/email-templates", "GET");
      if (!res.ok) throw new Error("Failed to fetch email templates");
      return res.data;
    },
    staleTime: 1000 * 60,
  });

  const templates = templatesData?.data || [];

  const filtered = templates.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()));

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const isEdit = editing && editing !== "new";
      return isEdit
        ? api(`/api/email-templates/${editing._id}`, "PUT", data)
        : api("/api/email-templates", "POST", data);
    },
    onSuccess: (res) => {
      if (res.ok) {
        const isEdit = editing && editing !== "new";
        showAlert(isEdit ? "Template updated" : "Template created", "success");
        setEditing(null);
        queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY });
      } else {
        showAlert(res.data?.message || "Failed to save", "error");
      }
    },
    onError: () => showAlert("Failed to save", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api(`/api/email-templates/${id}`, "DELETE"),
    onSuccess: (res) => {
      if (res.ok) {
        showAlert("Template deleted", "success");
        queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY });
      } else {
        showAlert(res.data?.message || "Failed to delete", "error");
      }
    },
    onError: () => showAlert("Failed to delete", "error"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, nextActive }) => api(`/api/email-templates/${id}`, "PUT", { active: nextActive }),
    onSuccess: (res, variables) => {
      if (res.ok) {
        showAlert(`Template ${variables.nextActive ? "activated" : "deactivated"}`, "success");
        queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY });
      } else {
        showAlert(res.data?.message || "Failed to toggle", "error");
      }
    },
    onError: () => showAlert("Failed to toggle", "error"),
  });

  const handleSave = (data) => saveMutation.mutate(data);

  const handleDelete = (id) => {
    if (!confirm('Delete this template? This action cannot be undone.')) return;
    deleteMutation.mutate(id);
  };

  const handleToggle = (id, currentActive) =>
    toggleMutation.mutate({ id, nextActive: !currentActive });

  const saving = saveMutation.isPending;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>;
  }

  // Editor view
  if (editing) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center text-white shadow-md">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{editing === "new" ? "New Email Template" : "Edit Template"}</h1>
            <p className="text-sm text-gray-500">Design your email with dynamic variables</p>
          </div>
        </div>
        <Card className="border-gray-200">
          <CardContent className="p-5">
            <TemplateEditor
              template={editing !== "new" ? editing : null}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
              saving={saving}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // List view
  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center text-white shadow-md">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Email Templates</h1>
            <p className="text-sm text-gray-500">Manage reusable email templates with dynamic variables</p>
          </div>
        </div>
        <Button onClick={() => setEditing("new")} className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5">
          <Plus className="w-4 h-4" />New Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Templates", value: templates.length, icon: Mail, bg: "bg-rose-50", color: "text-rose-600" },
          { label: "Active", value: templates.filter(t => t.active).length, icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "System", value: templates.filter(t => t.category === "system").length, icon: Mail, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "Custom", value: templates.filter(t => t.category === "custom").length, icon: Mail, bg: "bg-purple-50", color: "text-purple-600" },
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

      {/* Search */}
      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search templates…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
      </div>

      {/* Template list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <EmptyState icon={Mail} title="No email templates yet" description="Create your first template to get started" actionLabel="New Template" onAction={() => setEditing("new")} />
        ) : filtered.map(t => (
          <Card key={t._id} className={`border-gray-200 hover:shadow-sm transition-all ${!t.active ? "opacity-60" : ""}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-semibold text-gray-900">{t.name}</h3>
                  <Badge variant="outline" className={`text-[10px] capitalize ${CATEGORY_COLORS[t.category] || ""}`}>{t.category}</Badge>
                  {!t.active && <Badge variant="outline" className="text-[10px] bg-gray-50 text-gray-500">Inactive</Badge>}
                </div>
                <p className="text-xs text-gray-500 truncate">{t.subject}</p>
                {t.variables?.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {t.variables.slice(0, 4).map(v => (
                      <span key={v} className="text-[9px] font-mono bg-gray-100 text-gray-500 rounded px-1 py-0.5">{`{{${v}}}`}</span>
                    ))}
                    {t.variables.length > 4 && <span className="text-[9px] text-gray-400">+{t.variables.length - 4}</span>}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleToggle(t._id, t.active)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                  {t.active ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button onClick={() => setEditing(t)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-rose-600 transition-colors">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(t._id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
