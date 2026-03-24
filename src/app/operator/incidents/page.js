"use client";

import React, { useState } from "react";
import {
  AlertTriangle, Plus, Camera, MapPin, Clock, Shield,
  CheckCircle2, ChevronRight, Search, Filter, Flame, Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAlert } from "@/components/providers/AlertProvider";

const SEVERITY_COLORS = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-gray-100 text-gray-600 border-gray-200",
};
const STATUS_COLORS = {
  open: "bg-amber-100 text-amber-700 border-amber-200",
  "under-review": "bg-blue-100 text-blue-700 border-blue-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const INCIDENT_TYPES = ["Equipment Failure","Safety Hazard","Access Issue","Site Damage","Weather Delay","Other"];

const SEED = [
  { id: "1", title: "Camera Head Cable Snapped", type: "Equipment Failure", severity: "high", status: "open", location: "Main St Seg A", description: "Camera head cable snapped 30m into pipe. Equipment retrieved but requires replacement.", date: "2026-03-25 08:40", notified: true },
  { id: "2", title: "Manhole Cover Unstable", type: "Safety Hazard", severity: "critical", status: "under-review", location: "Oak Ave Junction", description: "Manhole cover was not properly secured by previous contractor. Immediate safety risk identified.", date: "2026-03-24 14:22", notified: true },
  { id: "3", title: "Site Access Denied by Resident", type: "Access Issue", severity: "medium", status: "resolved", location: "Westfield Dr Block 4", description: "Resident refused access. Supervisor contacted, rescheduled for next week.", date: "2026-03-23 10:15", notified: false },
];

const EMPTY_FORM = { title: "", type: "Equipment Failure", severity: "medium", location: "", description: "" };

export default function IncidentReports() {
  const { showAlert } = useAlert();
  const [incidents, setIncidents] = useState(SEED);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");

  const filtered = incidents.filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.location.toLowerCase().includes(search.toLowerCase()));

  function handleSubmit() {
    if (!form.title.trim() || !form.description.trim()) { showAlert("Title and description required", "error"); return; }
    setIncidents(prev => [{
      id: String(Date.now()), ...form, status: "open",
      date: new Date().toLocaleString().slice(0,16), notified: true,
    }, ...prev]);
    showAlert("Incident reported — admin notified", "success");
    setShowForm(false);
    setForm(EMPTY_FORM);
  }

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
        <Button onClick={() => setShowForm(true)} className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5">
          <Plus className="w-4 h-4" /> Report Incident
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total", value: incidents.length, bg: "bg-orange-50", color: "text-orange-600" },
          { label: "Open", value: incidents.filter(i => i.status === "open").length, bg: "bg-amber-50", color: "text-amber-600" },
          { label: "Under Review", value: incidents.filter(i => i.status === "under-review").length, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "Resolved", value: incidents.filter(i => i.status === "resolved").length, bg: "bg-emerald-50", color: "text-emerald-600" },
        ].map(s => (
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
        <Input placeholder="Search incidents…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map(inc => (
          <Card key={inc.id} className="border-gray-200 hover:border-orange-200 hover:shadow-sm transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Badge variant="outline" className={`text-[10px] ${SEVERITY_COLORS[inc.severity]}`}>{inc.severity}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[inc.status]}`}>{inc.status.replace("-", " ")}</Badge>
                    <span className="text-[10px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">{inc.type}</span>
                    {inc.notified && <span className="text-[10px] text-emerald-600 flex items-center gap-0.5"><Shield className="w-2.5 h-2.5" />Admin notified</span>}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{inc.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{inc.description}</p>
                  <div className="flex items-center gap-4 text-[10px] text-gray-400">
                    <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{inc.location}</span>
                    <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{inc.date}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Report Field Incident</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Incident Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Brief description of the incident…" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{INCIDENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severity</Label>
                <Select value={form.severity} onValueChange={v => setForm(f => ({ ...f, severity: v }))}>
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
              <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Site name or address…" className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed description of what happened…" rows={3} className="mt-1" />
            </div>
            <p className="text-xs text-gray-400">Admin will be automatically notified for high/critical incidents.</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700 text-white">Submit Report</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
