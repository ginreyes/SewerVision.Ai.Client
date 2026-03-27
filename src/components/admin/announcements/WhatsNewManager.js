"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles, Plus, Edit, Trash2, ChevronDown, ChevronUp,
  Loader2, Tag, Calendar, Globe, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAlert } from "@/components/providers/AlertProvider";
import { api } from "@/lib/helper";
import { ALL_ROLES, ROLE_LABELS } from "../constants";

const TYPE_COLORS = {
  feature: "bg-green-100 text-green-700 border-green-200",
  fix: "bg-red-100 text-red-700 border-red-200",
  ui: "bg-purple-100 text-purple-700 border-purple-200",
  improvement: "bg-blue-100 text-blue-700 border-blue-200",
  security: "bg-amber-100 text-amber-700 border-amber-200",
  planned: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

const ALL_UPDATE_ROLES = [...ALL_ROLES, "general"];

const EMPTY_UPDATE = { role: "general", type: "feature", title: "", description: "", details: [""] };

export default function WhatsNewManager() {
  const { showAlert } = useAlert();
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRelease, setExpandedRelease] = useState(null);
  const [showCreateRelease, setShowCreateRelease] = useState(false);
  const [newRelease, setNewRelease] = useState({ version: "", date: "", label: "Release" });
  const [saving, setSaving] = useState(false);

  // Add update form
  const [addingUpdateTo, setAddingUpdateTo] = useState(null);
  const [newUpdate, setNewUpdate] = useState(EMPTY_UPDATE);

  const fetchReleases = useCallback(async () => {
    try {
      const res = await api("/api/whats-new/all?role=admin", "GET");
      if (res.ok && res.data?.data) setReleases(res.data.data);
    } catch (err) {
      console.error("Failed to fetch releases:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReleases(); }, [fetchReleases]);

  async function handleCreateRelease() {
    if (!newRelease.version || !newRelease.date) {
      showAlert("Version and date are required", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await api("/api/whats-new/create", "POST", newRelease);
      if (res.ok) {
        showAlert("Release created", "success");
        setShowCreateRelease(false);
        setNewRelease({ version: "", date: "", label: "Release" });
        fetchReleases();
      } else {
        showAlert(res.data?.message || "Failed", "error");
      }
    } catch { showAlert("Failed to create release", "error"); }
    finally { setSaving(false); }
  }

  async function handleDeleteRelease(id) {
    try {
      const res = await api(`/api/whats-new/delete/${id}`, "DELETE");
      if (res.ok) { showAlert("Release deleted", "success"); fetchReleases(); }
    } catch { showAlert("Failed to delete", "error"); }
  }

  async function handleAddUpdate(releaseId) {
    if (!newUpdate.title || !newUpdate.description) {
      showAlert("Title and description are required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...newUpdate, details: newUpdate.details.filter(d => d.trim()) };
      const res = await api(`/api/whats-new/${releaseId}/add-update`, "POST", payload);
      if (res.ok) {
        showAlert("Update added", "success");
        setAddingUpdateTo(null);
        setNewUpdate(EMPTY_UPDATE);
        fetchReleases();
      } else {
        showAlert(res.data?.message || "Failed", "error");
      }
    } catch { showAlert("Failed to add update", "error"); }
    finally { setSaving(false); }
  }

  async function handleRemoveUpdate(releaseId, updateId) {
    try {
      const res = await api(`/api/whats-new/${releaseId}/remove-update/${updateId}`, "DELETE");
      if (res.ok) { showAlert("Update removed", "success"); fetchReleases(); }
    } catch { showAlert("Failed to remove", "error"); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" /> What's New Releases
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">{releases.length} releases published</p>
        </div>
        <Button onClick={() => setShowCreateRelease(true)} className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5">
          <Plus className="w-4 h-4" /> New Release
        </Button>
      </div>

      {/* Create Release Form */}
      {showCreateRelease && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Version</Label>
                <Input value={newRelease.version} onChange={e => setNewRelease(f => ({ ...f, version: e.target.value }))} placeholder="e.g. v2.1.0" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Date</Label>
                <Input value={newRelease.date} onChange={e => setNewRelease(f => ({ ...f, date: e.target.value }))} placeholder="e.g. March 28, 2026" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Label</Label>
                <Input value={newRelease.label} onChange={e => setNewRelease(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Major Release" className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCreateRelease(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreateRelease} disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
                {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null} Create Release
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Release List */}
      {releases.map(release => {
        const isExpanded = expandedRelease === release._id;
        const updates = release.updates || [];
        return (
          <Card key={release._id} className="border-gray-200">
            <CardContent className="p-0">
              {/* Release Header */}
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50/50"
                onClick={() => setExpandedRelease(isExpanded ? null : release._id)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{release.version}</span>
                      {release.isNew && <Badge className="bg-purple-500 text-white text-[10px]">LATEST</Badge>}
                      <Badge variant="outline" className="text-[10px]">{release.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                      <Calendar className="w-3 h-3" />{release.date}
                      <span className="mx-1">·</span>
                      <Tag className="w-3 h-3" />{updates.length} updates
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteRelease(release._id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {/* Expanded Updates */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                  {updates.map(u => (
                    <div key={u._id} className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50/80 group">
                      <Badge variant="outline" className={`text-[10px] capitalize shrink-0 ${TYPE_COLORS[u.type] || ""}`}>{u.type}</Badge>
                      <Badge variant="outline" className="text-[10px] shrink-0 bg-gray-100">
                        {u.role === "general" ? <Globe className="w-3 h-3 mr-0.5 inline" /> : null}
                        {ROLE_LABELS[u.role] || u.role}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900">{u.title}</p>
                        <p className="text-[11px] text-gray-500 line-clamp-1">{u.description}</p>
                      </div>
                      <button onClick={() => handleRemoveUpdate(release._id, u._id)}
                        className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add Update Form */}
                  {addingUpdateTo === release._id ? (
                    <div className="border border-purple-200 rounded-lg p-3 bg-purple-50/30 space-y-3 mt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Target Role</Label>
                          <Select value={newUpdate.role} onValueChange={v => setNewUpdate(f => ({ ...f, role: v }))}>
                            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {ALL_UPDATE_ROLES.map(r => (
                                <SelectItem key={r} value={r} className="text-xs">{ROLE_LABELS[r] || r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Type</Label>
                          <Select value={newUpdate.type} onValueChange={v => setNewUpdate(f => ({ ...f, type: v }))}>
                            <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["feature", "fix", "ui", "improvement", "security", "planned"].map(t => (
                                <SelectItem key={t} value={t} className="text-xs capitalize">{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Title</Label>
                        <Input value={newUpdate.title} onChange={e => setNewUpdate(f => ({ ...f, title: e.target.value }))} className="mt-1 h-8 text-xs" placeholder="Update title" />
                      </div>
                      <div>
                        <Label className="text-xs">Description</Label>
                        <Textarea value={newUpdate.description} onChange={e => setNewUpdate(f => ({ ...f, description: e.target.value }))} className="mt-1 text-xs" rows={2} placeholder="Brief description" />
                      </div>
                      <div>
                        <Label className="text-xs">Details (one per line)</Label>
                        <Textarea
                          value={newUpdate.details.join("\n")}
                          onChange={e => setNewUpdate(f => ({ ...f, details: e.target.value.split("\n") }))}
                          className="mt-1 text-xs" rows={3} placeholder="Bullet point details..." />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => { setAddingUpdateTo(null); setNewUpdate(EMPTY_UPDATE); }}>Cancel</Button>
                        <Button size="sm" className="text-xs h-7 bg-purple-600 hover:bg-purple-700 text-white" disabled={saving}
                          onClick={() => handleAddUpdate(release._id)}>
                          {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null} Add Update
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="text-xs gap-1 border-purple-200 text-purple-600 hover:bg-purple-50 mt-1"
                      onClick={() => setAddingUpdateTo(release._id)}>
                      <Plus className="w-3 h-3" /> Add Update
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {releases.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <Sparkles className="w-10 h-10 mb-2 opacity-30" />
          <p className="text-sm">No releases yet</p>
          <p className="text-xs mt-1">Create your first release to get started</p>
        </div>
      )}
    </div>
  );
}
