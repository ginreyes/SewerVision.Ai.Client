"use client";

import React from "react";
import {
  Megaphone, X, CheckCircle2, Users, Loader2,
  Wrench, Sparkles, FileText, AlertTriangle, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ALL_ROLES, ROLE_LABELS, ANNOUNCEMENT_TYPE_CONFIG } from "../constants";

const TYPE_ICONS = {
  maintenance: Wrench,
  feature: Sparkles,
  policy: FileText,
  alert: AlertTriangle,
  general: Bell,
};

export default function AnnouncementFormModal({
  open,
  editing,
  form,
  setForm,
  saving,
  onSave,
  onClose,
}) {
  if (!open) return null;

  function toggleRole(role) {
    setForm(f => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter(r => r !== role) : [...f.roles, role],
    }));
  }

  function selectAllRoles() {
    setForm(f => ({ ...f, roles: [...ALL_ROLES] }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-rose-600 via-red-500 to-rose-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{editing ? "Edit Announcement" : "New Announcement"}</h2>
                <p className="text-xs text-rose-100">{editing ? "Update the announcement details below" : "Compose and target your announcement"}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[calc(100vh-220px)] overflow-y-auto">
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Title</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Scheduled Maintenance: Mar 29"
              className="h-11 text-sm border-gray-200 focus:ring-rose-300 focus:border-rose-400" />
          </div>

          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Content</Label>
            <Textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Write the full announcement body…"
              rows={5}
              className="text-sm border-gray-200 focus:ring-rose-300 focus:border-rose-400 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-1.5 block">Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="h-10 border-gray-200"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(ANNOUNCEMENT_TYPE_CONFIG).map(key => {
                    const Icon = TYPE_ICONS[key] || Bell;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2 capitalize"><Icon className="w-3.5 h-3.5" />{key}</div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div className={`w-10 h-5 rounded-full flex items-center transition-colors ${form.pinned ? "bg-rose-500" : "bg-gray-200"}`}
                  onClick={() => setForm(f => ({ ...f, pinned: !f.pinned }))}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform mx-0.5 ${form.pinned ? "translate-x-5" : "translate-x-0"}`} />
                </div>
                <span className="text-sm text-gray-700 font-medium">Pin to top</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold text-gray-700">Target Audience</Label>
              <button onClick={selectAllRoles} className="text-[11px] text-rose-600 hover:text-rose-700 font-medium">Select All</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ALL_ROLES.map(r => {
                const active = form.roles.includes(r);
                return (
                  <button key={r} onClick={() => toggleRole(r)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${active
                      ? "bg-rose-50 border-rose-300 text-rose-700 shadow-sm"
                      : "bg-white border-gray-200 text-gray-500 hover:border-rose-200 hover:bg-rose-50/30"}`}>
                    <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-colors ${active ? "bg-rose-500 border-rose-500" : "border-gray-300"}`}>
                      {active && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="font-medium">{ROLE_LABELS[r]}</span>
                  </button>
                );
              })}
            </div>
            {form.roles.length === 0 && (
              <p className="text-xs text-red-500 mt-1.5">Please select at least one role</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Users className="w-3.5 h-3.5" />
            <span>{form.roles.length} of {ALL_ROLES.length} roles selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} className="px-5">Cancel</Button>
            <Button onClick={onSave} disabled={saving}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 shadow-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
              {editing ? "Save Changes" : "Save as Draft"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
