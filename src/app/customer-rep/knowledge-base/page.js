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

const CATEGORIES = ["General", "Billing", "Technical", "Onboarding", "Troubleshooting", "Policies"];
const SEED_ARTICLES = [
  { id: "1", title: "How to reset your password", category: "General", tags: ["account","security"], views: 342, helpful: 89, shared: false, pinned: true, body: "To reset your password, go to the login page and click 'Forgot password'. Enter your email and follow the instructions sent to your inbox.", updatedAt: "2026-03-20" },
  { id: "2", title: "Understanding your invoice", category: "Billing", tags: ["billing","invoice"], views: 211, helpful: 74, shared: true, pinned: false, body: "Your invoice is generated on the 1st of each month. It includes a breakdown of services used, applicable taxes, and the due date.", updatedAt: "2026-03-18" },
  { id: "3", title: "Common connectivity issues", category: "Technical", tags: ["connectivity","device"], views: 567, helpful: 132, shared: true, pinned: false, body: "If your device is not connecting, try restarting the router and the device. Ensure the firmware is up to date.", updatedAt: "2026-03-15" },
  { id: "4", title: "Getting started with the platform", category: "Onboarding", tags: ["onboarding","guide"], views: 891, helpful: 204, shared: true, pinned: true, body: "Welcome! This guide walks you through setting up your account, inviting team members, and starting your first project.", updatedAt: "2026-03-10" },
  { id: "5", title: "SLA breach escalation process", category: "Policies", tags: ["sla","escalation"], views: 128, helpful: 41, shared: false, pinned: false, body: "When an SLA breach occurs, the assigned agent must immediately escalate the ticket to their supervisor and update the ticket status.", updatedAt: "2026-03-08" },
];

const EMPTY_FORM = { title: "", category: "General", tags: "", body: "", shared: false };

export default function KnowledgeBase() {
  const { showAlert } = useAlert();
  const [articles, setArticles] = useState(SEED_ARTICLES);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = useMemo(() => articles.filter(a => {
    if (catFilter !== "all" && a.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q) ||
        a.tags.some(t => t.includes(q));
    }
    return true;
  }), [articles, search, catFilter]);

  const stats = useMemo(() => ({
    total: articles.length,
    shared: articles.filter(a => a.shared).length,
    pinned: articles.filter(a => a.pinned).length,
    views: articles.reduce((s, a) => s + a.views, 0),
  }), [articles]);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }
  function openEdit(a) { setEditing(a.id); setForm({ title: a.title, category: a.category, tags: a.tags.join(", "), body: a.body, shared: a.shared }); setShowForm(true); }

  function handleSave() {
    if (!form.title.trim() || !form.body.trim()) { showAlert("Title and content required", "error"); return; }
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    if (editing) {
      setArticles(prev => prev.map(a => a.id === editing ? { ...a, ...form, tags, updatedAt: new Date().toISOString().slice(0,10) } : a));
      showAlert("Article updated", "success");
    } else {
      setArticles(prev => [{ id: String(Date.now()), ...form, tags, views: 0, helpful: 0, pinned: false, updatedAt: new Date().toISOString().slice(0,10) }, ...prev]);
      showAlert("Article created", "success");
    }
    setShowForm(false);
  }

  function handleDelete(id) {
    setArticles(prev => prev.filter(a => a.id !== id));
    showAlert("Article deleted", "success");
  }

  function handleHelpful(id) {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, helpful: a.helpful + 1 } : a));
  }

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
          {["all", ...CATEGORIES].map(c => (
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
          {filtered.map(a => (
            <Card key={a.id} className="border-gray-200 hover:border-teal-200 hover:shadow-md transition-all">
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
                    <button onClick={() => handleDelete(a.id)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <button className="text-left w-full group" onClick={() => setViewing(a)}>
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-teal-700 transition-colors mb-1">{a.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{a.body}</p>
                </button>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {a.tags.map(t => (
                    <span key={t} className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">#{t}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{a.views} views</span>
                  <button onClick={() => handleHelpful(a.id)} className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                    <ThumbsUp className="w-3 h-3" />{a.helpful} helpful
                  </button>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.updatedAt}</span>
                </div>
              </CardContent>
            </Card>
          ))}
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
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
              <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700 text-white">
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
            {viewing?.tags.map(t => <span key={t} className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">#{t}</span>)}
          </div>
          <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
            <span>{viewing?.views} views · {viewing?.helpful} helpful</span>
            <span>Updated {viewing?.updatedAt}</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
