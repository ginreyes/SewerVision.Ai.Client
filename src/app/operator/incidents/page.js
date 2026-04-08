"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  AlertTriangle, Plus, Search,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import { useOperatorIncidents, useCreateIncident, useUpdateIncident } from "@/hooks/useQueryHooks";
import { IncidentCard, TYPE_OPTIONS } from "@/components/operator/incidents";
import { ListSkeleton } from '@/components/shared/SkeletonLoading';

const EMPTY_FORM = { title: "", type: "Equipment Failure", severity: "medium", location: "", description: "" };

export default function IncidentReports() {
  const { showAlert } = useAlert();
  const { userId } = useUser();

  const { data: incidents = [], isLoading } = useOperatorIncidents(userId);
  const createMutation = useCreateIncident();
  const updateMutation = useUpdateIncident();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      incidents.filter(
        (i) =>
          !search ||
          i.title?.toLowerCase().includes(search.toLowerCase()) ||
          i.location?.toLowerCase().includes(search.toLowerCase())
      ),
    [incidents, search]
  );

  const stats = useMemo(
    () => [
      { label: "Total", value: incidents.length, bg: "bg-orange-50", color: "text-orange-600" },
      { label: "Open", value: incidents.filter((i) => i.status === "open").length, bg: "bg-amber-50", color: "text-amber-600" },
      { label: "Under Review", value: incidents.filter((i) => i.status === "under-review").length, bg: "bg-blue-50", color: "text-blue-600" },
      { label: "Resolved", value: incidents.filter((i) => i.status === "resolved").length, bg: "bg-emerald-50", color: "text-emerald-600" },
    ],
    [incidents]
  );

  const handleSubmit = useCallback(() => {
    if (!form.title.trim() || !form.description.trim()) {
      showAlert("Title and description required", "error");
      return;
    }
    createMutation.mutate(
      { ...form, operatorId: userId, status: "open", date: new Date().toISOString().slice(0, 16), notified: true },
      {
        onSuccess: () => {
          showAlert("Incident reported — admin notified", "success");
          setShowForm(false);
          setForm(EMPTY_FORM);
        },
        onError: () => showAlert("Failed to submit incident", "error"),
      }
    );
  }, [form, createMutation, userId, showAlert]);

  const handleOpenForm = useCallback(() => setShowForm(true), []);
  const handleCloseForm = useCallback(() => setShowForm(false), []);

  return (<ListSkeleton />)

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-md">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Incident Reports</h1>
            <p className="text-sm text-gray-500">Log field incidents with photos, location, and severity</p>
          </div>
        </div>
        <Button onClick={handleOpenForm} className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5">
          <Plus className="w-4 h-4" /> Report Incident
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {stats.map((s) => (
          <Card key={s.label} className="border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}>
                <AlertTriangle className={`w-4 h-4 ${s.color}`} />
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
        <Input placeholder="Search incidents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
      </div>

      {/* List */}
      {filtered.length === 0 && !search ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <AlertTriangle className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm font-medium">No incidents reported</p>
          <p className="text-xs mt-1">Tap "Report Incident" to log a new one</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inc) => (
            <IncidentCard key={inc.id} incident={inc} />
          ))}
          {filtered.length === 0 && search && (
            <p className="text-center text-sm text-gray-400 py-8">No incidents match your search</p>
          )}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Report Field Incident</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Incident Title</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Brief description of the incident..." className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPE_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severity</Label>
                <Select value={form.severity} onValueChange={(v) => setForm((f) => ({ ...f, severity: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Site name or address..." className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Detailed description of what happened..." rows={3} className="mt-1" />
            </div>
            <p className="text-xs text-gray-400">Admin will be automatically notified for high/critical incidents.</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleCloseForm}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending} className="bg-orange-600 hover:bg-orange-700 text-white">
                {createMutation.isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
