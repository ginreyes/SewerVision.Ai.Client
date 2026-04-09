"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Megaphone, Plus, Send, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import { api } from "@/lib/helper";
import { ALL_ROLES } from "@/components/admin/constants";
import { AnnouncementList, AnnouncementFormModal } from "@/components/admin/announcements";
import { ListSkeleton } from '@/components/shared/SkeletonLoading';

const EMPTY_FORM = { title: "", body: "", type: "general", roles: [...ALL_ROLES], pinned: false };

export default function Announcements() {
  const { showAlert } = useAlert();
  const { userId } = useUser();
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({ total: 0, sent: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(null);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await api("/api/announcements/all", "GET");
      if (res.ok) {
        setAnnouncements(res.data?.data || []);
        if (res.data?.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(a) {
    setEditing(a._id);
    setForm({ title: a.title, body: a.body, type: a.type, roles: [...a.roles], pinned: a.pinned });
    setShowForm(true);
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim()) { showAlert("Title and content required", "error"); return; }
    if (form.roles.length === 0) { showAlert("Select at least one role", "error"); return; }
    setSaving(true);
    try {
      const res = editing
        ? await api(`/api/announcements/update/${editing}`, "PUT", form)
        : await api("/api/announcements/create", "POST", { ...form, createdBy: userId });
      if (res.ok) {
        showAlert(editing ? "Announcement updated" : "Announcement saved as draft", "success");
        setShowForm(false);
        fetchAnnouncements();
      } else {
        showAlert(res.data?.message || "Failed", "error");
      }
    } catch { showAlert("Something went wrong", "error"); }
    finally { setSaving(false); }
  }

  const handleSend = async (id) => {
    setSending(id);
    try {
      const res = await api(`/api/announcements/send/${id}`, "PUT");
      if (res.ok) { showAlert("Announcement sent", "success"); fetchAnnouncements(); }
      else showAlert(res.data?.message || "Failed to send", "error");
    } catch { showAlert("Failed to send", "error"); }
    finally { setSending(null); }
  }

  async function handleDelete(id) {
    try {
      const res = await api(`/api/announcements/delete/${id}`, "DELETE");
      if (res.ok) { showAlert("Announcement deleted", "success"); fetchAnnouncements(); }
    } catch { showAlert("Failed to delete", "error"); }
  }

  if (loading) return (<ListSkeleton />)
  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center text-white shadow-md">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Announcement Center</h1>
            <p className="text-sm text-gray-500">Broadcast updates, alerts, and policy changes to users</p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5 shadow-md">
          <Plus className="w-4 h-4" /> New Announcement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total", value: stats.total, icon: Megaphone, bg: "bg-rose-50", color: "text-rose-600" },
          { label: "Sent", value: stats.sent, icon: Send, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "Total Views", value: stats.totalViews, icon: Eye, bg: "bg-blue-50", color: "text-blue-600" },
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

      {/* List */}
      <AnnouncementList
        announcements={announcements}
        sending={sending}
        onSend={handleSend}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {/* Form Modal */}
      <AnnouncementFormModal
        open={showForm}
        editing={editing}
        form={form}
        setForm={setForm}
        saving={saving}
        onSave={handleSave}
        onClose={() => setShowForm(false)}
      />
    </div>
  );
}
