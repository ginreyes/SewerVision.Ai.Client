"use client";

import React, { useState, useMemo, memo } from "react";
import {
  Users, TrendingUp, AlertTriangle, CheckCircle2, ChevronDown,
  ChevronUp, Loader2, Filter, Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAllOnboarding } from "@/hooks/useQueryHooks";
import { ALL_ROLES, ROLE_LABELS } from "@/components/admin/constants";

const PROGRESS_COLOR = (pct) => pct === 100 ? "bg-emerald-500" : pct >= 60 ? "bg-blue-500" : pct >= 30 ? "bg-amber-500" : "bg-red-500";

const UserRow = memo(({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const user = item.userId || {};
  const name = user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user.username || user.email || "Unknown";
  const pct = item.overallProgress || 0;
  const stepsCompleted = (item.steps || []).filter(s => s.completed).length;
  const totalSteps = (item.steps || []).length;

  return (
    <div className="border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50/50 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-xs font-bold shrink-0">
          {name[0]?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{name}</p>
          <p className="text-[11px] text-gray-400">{user.email}</p>
        </div>
        <Badge variant="outline" className="text-[10px] capitalize">{ROLE_LABELS[item.role] || item.role}</Badge>
        <div className="w-28 shrink-0">
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-gray-500">{stepsCompleted}/{totalSteps}</span>
            <span className="text-[10px] font-bold text-gray-700">{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${PROGRESS_COLOR(pct)}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="w-24 text-right shrink-0">
          <p className="text-xs text-gray-400">
            {item.startedAt ? new Date(item.startedAt).toLocaleDateString() : "—"}
          </p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </div>

      {expanded && (
        <div className="px-4 pb-3 pl-16">
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            {(item.steps || []).map(step => (
              <div key={step.key} className="flex items-center gap-3 text-xs">
                {step.completed
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  : <Clock className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                <span className={`flex-1 ${step.completed ? "text-gray-500 line-through" : "text-gray-700"}`}>{step.label}</span>
                {step.completedAt && <span className="text-gray-400">{new Date(step.completedAt).toLocaleDateString()}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
UserRow.displayName = "UserRow";

export default function OnboardingStatus() {
  const [roleFilter, setRoleFilter] = useState("all");
  const { data: response, isLoading } = useAllOnboarding(roleFilter);

  const items = useMemo(() => {
    const raw = response?.data || response;
    return Array.isArray(raw) ? raw : [];
  }, [response]);

  const stats = response?.stats || {};

  if (isLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-rose-500" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-rose-50"><Users className="w-4 h-4 text-rose-600" /></div>
            <div><p className="text-lg font-bold text-gray-900">{stats.total || 0}</p><p className="text-xs text-gray-500">Total Users</p></div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-50"><TrendingUp className="w-4 h-4 text-emerald-600" /></div>
            <div><p className="text-lg font-bold text-gray-900">{stats.avgProgress || 0}%</p><p className="text-xs text-gray-500">Avg Progress</p></div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50"><CheckCircle2 className="w-4 h-4 text-blue-600" /></div>
            <div><p className="text-lg font-bold text-gray-900">{items.filter(i => i.overallProgress === 100).length}</p><p className="text-xs text-gray-500">Completed</p></div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-50"><AlertTriangle className="w-4 h-4 text-red-600" /></div>
            <div><p className="text-lg font-bold text-gray-900">{stats.stuck || 0}</p><p className="text-xs text-gray-500">Stuck ({`<`}50% after 7d)</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Role filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-gray-400" />
        {["all", ...ALL_ROLES].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border capitalize transition-colors ${roleFilter === r ? "bg-rose-600 text-white border-rose-600" : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"}`}>
            {r === "all" ? "All Roles" : ROLE_LABELS[r] || r}
          </button>
        ))}
      </div>

      {/* User list */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="flex items-center gap-4 px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            <div className="w-8 shrink-0" />
            <div className="flex-1">User</div>
            <div className="w-20 shrink-0 text-center">Role</div>
            <div className="w-28 shrink-0 text-center">Progress</div>
            <div className="w-24 shrink-0 text-right">Started</div>
            <div className="w-4 shrink-0" />
          </div>
          {items.map(item => <UserRow key={item._id || item.userId?._id} item={item} />)}
          {items.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No onboarding data</p>
              <p className="text-xs mt-1">Onboarding is initialized when users are created</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
