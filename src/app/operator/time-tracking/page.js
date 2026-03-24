"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Clock, Play, Square, Plus, Download, Calendar,
  MapPin, CheckCircle2, Timer, TrendingUp, BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlert } from "@/components/providers/AlertProvider";

const SEED_ENTRIES = [
  { id: "1", date: "2026-03-25", project: "PRJ-0087", type: "Inspection", start: "07:00", end: "11:30", hours: 4.5, notes: "Segment A complete" },
  { id: "2", date: "2026-03-25", project: "PRJ-0087", type: "Travel", start: "06:30", end: "07:00", hours: 0.5, notes: "Drive to site" },
  { id: "3", date: "2026-03-24", project: "PRJ-0088", type: "Inspection", start: "08:00", end: "12:00", hours: 4, notes: "Oak Ave junction" },
  { id: "4", date: "2026-03-24", project: "PRJ-0088", type: "Setup", start: "07:30", end: "08:00", hours: 0.5, notes: "Equipment setup" },
  { id: "5", date: "2026-03-23", project: "PRJ-0085", type: "Inspection", start: "07:00", end: "15:00", hours: 8, notes: "Full day — River Rd" },
];

const TYPE_COLORS = {
  Inspection: "bg-blue-100 text-blue-700 border-blue-200",
  Travel: "bg-amber-100 text-amber-700 border-amber-200",
  Setup: "bg-purple-100 text-purple-700 border-purple-200",
  Maintenance: "bg-orange-100 text-orange-700 border-orange-200",
  Admin: "bg-gray-100 text-gray-600 border-gray-200",
};

function formatElapsed(seconds) {
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

export default function TimeTracking() {
  const { showAlert } = useAlert();
  const [entries, setEntries] = useState(SEED_ENTRIES);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeType, setActiveType] = useState("Inspection");
  const [activeProject, setActiveProject] = useState("PRJ-0087");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  function handleClockIn() {
    setIsRunning(true);
    setElapsed(0);
    showAlert("Clock-in started", "success");
  }

  function handleClockOut() {
    setIsRunning(false);
    const hours = Math.round((elapsed / 3600) * 10) / 10;
    if (hours > 0) {
      const now = new Date();
      const start = new Date(now - elapsed * 1000);
      setEntries(prev => [{
        id: String(Date.now()),
        date: now.toISOString().slice(0,10),
        project: activeProject,
        type: activeType,
        start: start.toTimeString().slice(0,5),
        end: now.toTimeString().slice(0,5),
        hours,
        notes: "",
      }, ...prev]);
      showAlert(`Clocked out — ${hours}h logged`, "success");
    }
    setElapsed(0);
  }

  const todayEntries = entries.filter(e => e.date === new Date().toISOString().slice(0,10));
  const todayHours = todayEntries.reduce((s, e) => s + e.hours, 0);
  const weekHours = entries.reduce((s, e) => s + e.hours, 0);

  const grouped = entries.reduce((map, e) => {
    if (!map[e.date]) map[e.date] = [];
    map[e.date].push(e);
    return map;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Time Tracking</h1>
            <p className="text-sm text-gray-500">Clock in/out per project and generate timesheets</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="w-4 h-4" /> Export Timesheet
        </Button>
      </div>

      {/* Clock widget */}
      <Card className={`border-2 mb-5 ${isRunning ? "border-blue-400 bg-blue-50" : "border-gray-200"}`}>
        <CardContent className="p-5">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className={`text-4xl font-mono font-bold tracking-widest ${isRunning ? "text-blue-700" : "text-gray-700"}`}>{formatElapsed(elapsed)}</p>
              <p className="text-xs text-gray-400 mt-1">{isRunning ? "Running…" : "Stopped"}</p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Project</label>
                <select value={activeProject} onChange={e => setActiveProject(e.target.value)} disabled={isRunning}
                  className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-1 focus:ring-blue-300 disabled:opacity-50">
                  {["PRJ-0085","PRJ-0087","PRJ-0088","PRJ-0089","PRJ-0090"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Activity Type</label>
                <select value={activeType} onChange={e => setActiveType(e.target.value)} disabled={isRunning}
                  className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-1 focus:ring-blue-300 disabled:opacity-50">
                  {Object.keys(TYPE_COLORS).map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {!isRunning ? (
                <Button onClick={handleClockIn} className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 px-6">
                  <Play className="w-4 h-4" /> Clock In
                </Button>
              ) : (
                <Button onClick={handleClockOut} className="bg-red-500 hover:bg-red-600 text-white gap-1.5 px-6">
                  <Square className="w-4 h-4" /> Clock Out
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Today", value: `${todayHours}h`, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "This Week", value: `${weekHours}h`, icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50" },
          { label: "Entries", value: entries.length, icon: BarChart2, color: "text-purple-600", bg: "bg-purple-50" },
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

      {/* Entries grouped by date */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([date, dayEntries]) => {
          const total = dayEntries.reduce((s, e) => s + e.hours, 0);
          return (
            <div key={date}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{date}</span>
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs font-bold text-gray-700">{total}h total</span>
              </div>
              <div className="space-y-1.5">
                {dayEntries.map(e => (
                  <div key={e.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${TYPE_COLORS[e.type]}`}>{e.type}</Badge>
                    <span className="text-xs font-mono text-gray-500 shrink-0">{e.start} – {e.end}</span>
                    <span className="text-xs font-bold text-gray-900 shrink-0">{e.hours}h</span>
                    <span className="text-xs text-gray-500 flex-1 truncate">{e.project}</span>
                    {e.notes && <span className="text-xs text-gray-400 italic truncate max-w-xs">{e.notes}</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
