"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen, Plus, Search, Tag, Eye, ThumbsUp, Edit, Trash2,
  ChevronRight, FileText, Star, Clock, Globe, Lock, Loader2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
  useKBArticles,
  useKBCategories,
  useCreateKBArticle,
  useUpdateKBArticle,
  useDeleteKBArticle,
} from "@/hooks/useQueryHooks";
import { GridSkeleton } from '@/components/shared/SkeletonLoading';

const EMPTY_FORM = { title: "", category: "General", tags: "", body: "", shared: false };

export default function KnowledgeBase() {
  const { showAlert } = useAlert();
  const { user } = useUser();
  const userId = user?._id || user?.id;

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: articlesData, isLoading } = useKBArticles({
    category: catFilter !== "all" ? catFilter : undefined,
    search: search || undefined,
  });
  const { data: categoriesRaw = [] } = useKBCategories();
  const createMutation = useCreateKBArticle();
  const updateMutation = useUpdateKBArticle();
  const deleteMutation = useDeleteKBArticle();

  const articles = articlesData?.data || articlesData || [];
  const allArticles = Array.isArray(articles) ? articles : [];
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : ["General", "Billing", "Technical", "Onboarding", "Troubleshooting", "Policies"];

  const filtered = allArticles;

  const stats = useMemo(() => ({
    total: allArticles.length,
    shared: allArticles.filter(a => a.shared).length,
    pinned: allArticles.filter(a => a.pinned).length,
    views: allArticles.reduce((s, a) => s + (a.views || 0), 0),
  }), [allArticles]);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }
  function openEdit(a) {
    setEditing(a.id || a._id);
    setForm({
      title: a.title,
      category: a.category,
      tags: (a.tags || []).join(", "),
      body: a.body,
      shared: a.shared,
    });
    setShowForm(true);
  }

  function handleSave() {
    if (!form.title.trim() || !form.body.trim()) { showAlert("Title and content required", "error"); return; }
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    if (editing) {
      updateMutation.mutate(
        { id: editing, ...form, tags },
        { onSuccess: () => { showAlert("Article updated", "success"); setShowForm(false); } }
      );
    } else {
      createMutation.mutate(
        { ...form, tags, createdBy: userId },
        { onSuccess: () => { showAlert("Article created", "success"); setShowForm(false); } }
      );
    }
  }

  function handleDelete(id) {
    if (!confirm('Delete this item? This action cannot be undone.')) return;
    deleteMutation.mutate(id, {
      onSuccess: () => showAlert("Article deleted", "success"),
    });
  }

  return (<GridSkeleton count={6} />)

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="text-sm text-gray-500">Help articles and FAQs for customers and agents</p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="w-4 h-4 mr-1.5" /> New Article
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Articles", value: stats.total, color: "text-teal-600", bg: "bg-teal-50", icon: FileText },
          { label: "Public", value: stats.shared, color: "text-blue-600", bg: "bg-blue-50", icon: Globe },
          { label: "Pinned", value: stats.pinned, color: "text-amber-600", bg: "bg-amber-50", icon: Star },
          { label: "Total Views", value: stats.views.toLocaleString(), color: "text-emerald-600", bg: "bg-emerald-50", icon: Eye },
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

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search articles…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {["all", ...categories].map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors capitalize ${catFilter === c ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"}`}>
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
      </div>

      {/* Articles grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <BookOpen className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-medium">No articles found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(a => {
            const aId = a.id || a._id;
            return (
              <Card key={aId} className="border-gray-200 hover:border-teal-200 hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] text-teal-700 border-teal-200 bg-teal-50">{a.category}</Badge>
                      {a.pinned && <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-200 bg-amber-50"><Star className="w-2.5 h-2.5 mr-0.5" />Pinned</Badge>}
                      {a.shared ? <Globe className="w-3.5 h-3.5 text-blue-400" /> : <Lock className="w-3.5 h-3.5 text-gray-300" />}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEdit(a)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-teal-600 transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(aId)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <button className="text-left w-full group" onClick={() => setViewing(a)}>
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-teal-700 transition-colors mb-1">{a.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{a.body}</p>
                  </button>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {(a.tags || []).map(t => (
                      <span key={t} className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">#{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{a.views || 0} views</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{a.helpful || 0} helpful</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.updatedAt || ""}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Article" : "New Article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Article title…" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tags <span className="text-gray-400 font-normal">(comma-separated)</span></Label>
                <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="billing, account…" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Content</Label>
              <Textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Write the article content…" rows={6} className="mt-1" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="shared" checked={form.shared} onChange={e => setForm(f => ({ ...f, shared: e.target.checked }))} className="rounded" />
              <Label htmlFor="shared" className="cursor-pointer">Make public (visible to customers)</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="bg-teal-600 hover:bg-teal-700 text-white">
                {editing ? "Save Changes" : "Create Article"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Article Dialog */}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-teal-700 border-teal-200 bg-teal-50">{viewing?.category}</Badge>
              {viewing?.shared ? <Globe className="w-3.5 h-3.5 text-blue-400" /> : <Lock className="w-3.5 h-3.5 text-gray-300" />}
            </div>
            <DialogTitle>{viewing?.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mt-2">{viewing?.body}</p>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            {(viewing?.tags || []).map(t => <span key={t} className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">#{t}</span>)}
          </div>
          <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
            <span>{viewing?.views || 0} views · {viewing?.helpful || 0} helpful</span>
            <span>Updated {viewing?.updatedAt || ""}</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
