"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  CalendarDays, Users, Plus, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import {
  useUserWeekSchedule,
  useCreateAssignment,
  useDeleteAssignment,
  useUserTeamMembers,
} from "@/hooks/useQueryHooks";
import { ScheduleCell, DAYS } from "@/components/user/resource-scheduler";

function getWeekStart(offsetWeeks = 0) {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) + offsetWeeks * 7;
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
}

function formatWeekDate(weekStartStr, dayIdx) {
  const d = new Date(weekStartStr);
  d.setDate(d.getDate() + dayIdx);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ResourceScheduler() {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => getWeekStart(weekOffset), [weekOffset]);
  const weekDates = useMemo(
    () => DAYS.map((_, i) => formatWeekDate(weekStart, i)),
    [weekStart]
  );

  const { data, isLoading } = useUserWeekSchedule(weekStart);
  const { data: teamData, isLoading: teamLoading } = useUserTeamMembers();
  const createAssignment = useCreateAssignment();
  const deleteAssignment = useDeleteAssignment();

  const assignments = useMemo(() => Array.isArray(data) ? data : [], [data]);

  // Get team members from the team management API
  const team = useMemo(() => {
    const raw = Array.isArray(teamData) ? teamData : (teamData?.data || teamData?.members || []);
    return raw.map(m => ({
      _id: m._id || m.id,
      name: m.first_name ? `${m.first_name} ${m.last_name || ''}`.trim() : (m.name || m.username || 'Unknown'),
      role: m.role || 'operator',
    }));
  }, [teamData]);

  // Build schedule map: { "memberId-dayOfWeek": assignment }
  const schedule = useMemo(() => {
    const map = {};
    assignments.forEach(a => {
      const memberId = a.teamMember?._id || a.teamMember;
      const key = `${memberId}-${a.dayOfWeek}`;
      map[key] = a;
    });
    return map;
  }, [assignments]);

  const stats = useMemo(() => {
    const assignedCount = Object.keys(schedule).length;
    const freeSlots = team.length * 5 - assignedCount;
    return { teamCount: team.length, assignedCount, freeSlots };
  }, [team, schedule]);

  const handleCellClick = useCallback(
    (member, dayIdx, assignment) => {
      if (assignment) {
        showAlert(`Assignment: ${assignment.project} — ${assignment.type}`, "success");
      } else {
        showAlert("Click to assign (coming soon)", "success");
      }
    },
    [showAlert]
  );

  if (isLoading || teamLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

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
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
            Week of {weekDates[0]}
          </span>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 ml-2">
            <Plus className="w-4 h-4" /> Assign
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Team Members", value: stats.teamCount, icon: Users, bg: "bg-indigo-50", color: "text-indigo-600" },
          { label: "Assignments This Week", value: stats.assignedCount, icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "Available Slots", value: stats.freeSlots, icon: Clock, bg: "bg-amber-50", color: "text-amber-600" },
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
      {team.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="p-12 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No team members found for this week.</p>
          </CardContent>
        </Card>
      ) : (
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
                        <div className="text-[10px] font-normal text-gray-400">{weekDates[i]}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {team.map(member => (
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
                        const slot = schedule[key];
                        return (
                          <td key={dayIdx} className={`px-1.5 py-2 text-center ${dayIdx >= 5 ? "bg-gray-50/50" : ""}`}>
                            {dayIdx < 5 ? (
                              <ScheduleCell
                                assignment={slot || null}
                                onClick={(assignment) => handleCellClick(member, dayIdx, assignment)}
                              />
                            ) : slot ? (
                              <ScheduleCell
                                assignment={slot}
                                onClick={(assignment) => handleCellClick(member, dayIdx, assignment)}
                              />
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
      )}
    </div>
  );
}
