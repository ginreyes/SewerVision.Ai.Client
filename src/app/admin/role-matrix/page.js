"use client";
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/helper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_BADGE_CLASSES } from "@/lib/roleThemes";

// June 17 — Role Capability Matrix admin page.
// Read-only grid showing every active SecurityModule × every role with an
// allowed/denied cell. Gated by FEATURE_ROLE_MATRIX on the backend; the
// page will render an "off" message if the endpoint returns 404.

const ROLES = ["admin", "user", "operator", "qc-technician", "customer-rep", "viewer", "customer"];

export default function RoleMatrixPage() {
  const [groupFilter, setGroupFilter] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["role-capability-matrix"],
    queryFn: () => api("/api/security-modules/capability-matrix"),
  });

  const offline = data?.message === "Not enabled";
  const matrix = data?.data?.matrix || [];
  const counts = data?.data?.counts;
  const anomalies = data?.data?.anomalies;

  const groups = useMemo(() => {
    const set = new Set(matrix.map((m) => m.group));
    return Array.from(set);
  }, [matrix]);

  const filtered = useMemo(
    () => (groupFilter ? matrix.filter((m) => m.group === groupFilter) : matrix),
    [matrix, groupFilter],
  );

  if (isLoading) return <div className="p-6 text-sm text-zinc-500">Loading capability matrix…</div>;
  if (error || offline) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader><CardTitle>Role Capability Matrix</CardTitle></CardHeader>
          <CardContent className="text-sm text-zinc-600">
            This page is gated behind <code>FEATURE_ROLE_MATRIX=1</code> on the backend. Flip the env var to enable.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Role Capability Matrix</h1>
          <p className="text-sm text-zinc-500">
            {counts?.total ?? 0} active modules · click a Permission Levels link to edit.
          </p>
        </div>
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          <option value="">All groups</option>
          {groups.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </header>

      {counts ? (
        <Card>
          <CardContent className="flex flex-wrap gap-3 p-4">
            {ROLES.map((r) => (
              <Badge key={r} className={`${ROLE_BADGE_CLASSES[r] || ""} text-xs`}>
                {r}: {counts.byRole?.[r] ?? 0}
              </Badge>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {anomalies && (anomalies.orphaned?.length > 0 || anomalies.visibleToAll?.length > 0) ? (
        <Card>
          <CardHeader><CardTitle className="text-sm">Things worth reviewing</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-xs">
            {anomalies.orphaned?.length > 0 && (
              <div>
                <strong className="text-rose-600">Orphaned (no roles):</strong>{" "}
                {anomalies.orphaned.join(", ")}
              </div>
            )}
            {anomalies.visibleToAll?.length > 0 && (
              <div>
                <strong className="text-amber-600">Visible to every internal role:</strong>{" "}
                {anomalies.visibleToAll.join(", ")}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <div className="overflow-x-auto rounded border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="sticky left-0 z-10 bg-zinc-50 px-3 py-2 text-left">Module</th>
              {ROLES.map((r) => (
                <th key={r} className="px-3 py-2 text-center">{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.key} className="border-t">
                <td className="sticky left-0 bg-white px-3 py-2">
                  <div className="font-medium">{row.label}</div>
                  <div className="text-xs text-zinc-400">{row.group}</div>
                </td>
                {row.cells.map((c) => (
                  <td key={c.role} className="px-3 py-2 text-center">
                    {c.allowed ? (
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" title="Allowed" />
                    ) : (
                      <span className="inline-block h-2 w-2 rounded-full bg-zinc-200" title="Denied" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
