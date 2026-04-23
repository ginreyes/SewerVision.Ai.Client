"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getWorkloadConfig } from "./workloadConfig";

const memberName = (rep) => {
  if (!rep) return "Unknown";
  const full = [rep.first_name, rep.last_name].filter(Boolean).join(" ").trim();
  return full || rep.username || rep.email || "Unknown";
};

const getInitials = (rep) => {
  const full = [rep?.first_name, rep?.last_name].filter(Boolean).join(" ").trim();
  if (full) return full.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const u = rep?.username || rep?.email || "?";
  return u[0]?.toUpperCase() || "?";
};

const SORT_KEYS = [
  { key: "name", label: "Rep" },
  { key: "openTickets", label: "Open tickets" },
  { key: "openComplaints", label: "Open complaints" },
  { key: "sla", label: "SLA" },
  { key: "overtimePending", label: "OT pending" },
  { key: "workload", label: "Workload" },
];

const WORKLOAD_ORDER = { heavy: 0, balanced: 1, low: 2 };

export default function RepTable({ entries = [], onSelect }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("openTickets");
  const [sortDir, setSortDir] = useState("desc");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = entries
      .map((e) => ({
        ...e,
        _sortName: memberName(e.rep).toLowerCase(),
        _openTickets: e.tickets?.open || 0,
        _openComplaints: e.complaints?.open || 0,
        _sla: typeof e.slaCompliance === "number" ? e.slaCompliance : -1,
        _overtimePending: e.overtime?.pendingHours || 0,
      }))
      .filter((e) => !q || memberName(e.rep).toLowerCase().includes(q));

    const dir = sortDir === "asc" ? 1 : -1;
    base.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return dir * a._sortName.localeCompare(b._sortName);
        case "openTickets":
          return dir * (a._openTickets - b._openTickets);
        case "openComplaints":
          return dir * (a._openComplaints - b._openComplaints);
        case "sla":
          return dir * (a._sla - b._sla);
        case "overtimePending":
          return dir * (a._overtimePending - b._overtimePending);
        case "workload":
          return (
            dir * ((WORKLOAD_ORDER[a.workload] ?? 1) - (WORKLOAD_ORDER[b.workload] ?? 1))
          );
        default:
          return 0;
      }
    });
    return base;
  }, [entries, search, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Rep activity
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reps…"
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                {SORT_KEYS.map((s) => (
                  <th key={s.key} className="py-2 px-3">
                    <button
                      type="button"
                      onClick={() => toggleSort(s.key)}
                      className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      {s.label}
                      {sortKey === s.key && (
                        <span className="text-[10px]">{sortDir === "asc" ? "▲" : "▼"}</span>
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={SORT_KEYS.length}
                    className="py-10 text-center text-gray-400 dark:text-gray-500 text-sm"
                  >
                    No reps match your search.
                  </td>
                </tr>
              ) : (
                rows.map((e) => {
                  const wl = getWorkloadConfig(e.workload);
                  const slaPct =
                    typeof e.slaCompliance === "number"
                      ? `${Math.round(e.slaCompliance * 100)}%`
                      : "—";
                  return (
                    <tr
                      key={e.rep?._id}
                      className="border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer"
                      onClick={() => onSelect?.(e)}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {getInitials(e.rep)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {memberName(e.rep)}
                            </p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                              {e.rep?.email || e.rep?.username || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-gray-800 dark:text-gray-200">
                        {e._openTickets}
                      </td>
                      <td className="py-3 px-3 font-semibold text-gray-800 dark:text-gray-200">
                        {e._openComplaints}
                      </td>
                      <td className="py-3 px-3 text-gray-700 dark:text-gray-300">{slaPct}</td>
                      <td className="py-3 px-3 text-gray-700 dark:text-gray-300">
                        {e._overtimePending}h
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${wl.className}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${wl.dot}`} />
                          {wl.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
