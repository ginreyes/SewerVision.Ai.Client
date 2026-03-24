"use client";

import React, { useState } from "react";
import {
  CalendarDays, Users, Plus, ChevronLeft, ChevronRight,
  CheckCircle2, AlertTriangle, Clock, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlert } from "@/components/providers/AlertProvider";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_DATES = ["Mar 24", "Mar 25", "Mar 26", "Mar 27", "Mar 28", "Mar 29", "Mar 30"];

const TEAM = [
  { id: "u1", name: "Alex Torres", role: "operator", avatar: "AT", color: "bg-blue-500" },
  { id: "u2", name: "Maria Chen", role: "qc-technician", avatar: "MC", color: "bg-pink-500" },
  { id: "u3", name: "James Park", role: "operator", avatar: "JP", color: "bg-indigo-500" },
  { id: "u4", name: "Priya Singh", role: "qc-technician", avatar: "PS", color: "bg-purple-500" },
  { id: "u5", name: "Tom Walsh", role: "operator", avatar: "TW", color: "bg-teal-500" },
];

const SCHEDULE = {
  "u1-0": { project: "PRJ-087", type: "Inspection", color: "bg-blue-100 text-blue-800 border-blue-200" },
  "u1-1": { project: "PRJ-087", type: "Inspection", color: "bg-blue-100 text-blue-800 border-blue-200" },
  "u1-3": { project: "PRJ-090", type: "Setup", color: "bg-amber-100 text-amber-800 border-amber-200" },
  "u2-0": { project: "PRJ-087 QC", type: "QC Review", color: "bg-pink-100 text-pink-800 border-pink-200" },
  "u2-2": { project: "PRJ-088 QC", type: "QC Review", color: "bg-pink-100 text-pink-800 border-pink-200" },
  "u2-4": { project: "PRJ-091 QC", type: "QC Review", color: "bg-pink-100 text-pink-800 border-pink-200" },
  "u3-1": { project: "PRJ-088", type: "Inspection", color: "bg-blue-100 text-blue-800 border-blue-200" },
  "u3-2": { project: "PRJ-088", type: "Inspection", color: "bg-blue-100 text-blue-800 border-blue-200" },
  "u3-4": { project: "PRJ-091", type: "Inspection", color: "bg-blue-100 text-blue-800 border-blue-200" },
  "u4-3": { project: "PRJ-089 QC", type: "QC Review", color: "bg-pink-100 text-pink-800 border-pink-200" },
  "u4-4": { project: "PRJ-089 QC", type: "QC Review", color: "bg-pink-100 text-pink-800 border-pink-200" },
  "u5-0": { project: "PRJ-089", type: "Inspection", color: "bg-blue-100 text-blue-800 border-blue-200" },
  "u5-1": { project: "PRJ-089", type: "Inspection", color: "bg-blue-100 text-blue-800 border-blue-200" },
  "u5-2": { project: "PRJ-089", type: "Inspection", color: "bg-blue-100 text-blue-800 border-blue-200" },
};

export default function ResourceScheduler() {
  const { showAlert } = useAlert();
  const [week, setWeek] = useState(0);

  const assignedCount = Object.keys(SCHEDULE).length;
  const freeSlots = TEAM.length * 5 - assignedCount;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-md">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Resource Scheduler</h1>
            <p className="text-sm text-gray-500">Visual calendar for assigning team members to projects</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeek(w => w - 1)}><ChevronLeft className="w-4 h-4" /></Button>
          <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">Week of {WEEK_DATES[0]}</span>
          <Button variant="outline" size="sm" onClick={() => setWeek(w => w + 1)}><ChevronRight className="w-4 h-4" /></Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 ml-2">
            <Plus className="w-4 h-4" /> Assign
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Team Members", value: TEAM.length, icon: Users, bg: "bg-indigo-50", color: "text-indigo-600" },
          { label: "Assignments This Week", value: assignedCount, icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "Available Slots", value: freeSlots, icon: Clock, bg: "bg-amber-50", color: "text-amber-600" },
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

      {/* Calendar grid */}
      <Card className="border-gray-200 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 min-w-[160px]">Team Member</th>
                  {DAYS.map((d, i) => (
                    <th key={d} className={`text-center text-xs font-semibold px-3 py-3 min-w-[110px] ${i < 5 ? "text-gray-700" : "text-gray-400"}`}>
                      <div>{d}</div>
                      <div className="text-[10px] font-normal text-gray-400">{WEEK_DATES[i]}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TEAM.map(member => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${member.color}`}>
                          {member.avatar}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{member.name}</p>
                          <p className="text-[10px] text-gray-400 capitalize">{member.role}</p>
                        </div>
                      </div>
                    </td>
                    {DAYS.map((_, dayIdx) => {
                      const key = `${member.id}-${dayIdx}`;
                      const slot = SCHEDULE[key];
                      return (
                        <td key={dayIdx} className={`px-1.5 py-2 text-center ${dayIdx >= 5 ? "bg-gray-50/50" : ""}`}>
                          {slot ? (
                            <div className={`rounded-lg border px-2 py-1.5 text-left cursor-pointer hover:opacity-80 transition-opacity ${slot.color}`}>
                              <p className="text-[10px] font-semibold truncate">{slot.project}</p>
                              <p className="text-[9px] opacity-75">{slot.type}</p>
                            </div>
                          ) : dayIdx < 5 ? (
                            <button onClick={() => showAlert("Click to assign (coming soon)", "success")}
                              className="w-full h-12 rounded-lg border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors flex items-center justify-center">
                              <Plus className="w-3.5 h-3.5 text-gray-300" />
                            </button>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
