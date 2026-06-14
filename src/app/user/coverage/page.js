"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/helper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// June 18 — Team Coverage Calendar (team-lead / user).
// PTO + training-due + on-call overlaid into one calendar so leads see
// availability gaps before scheduling. First pass renders a list-of-days
// table; native calendar wiring lives in [src/components/user/coverage/]
// next pass.

export default function UserCoveragePage() {
  const [from, setFrom] = useState("2026-06-15");
  const [toExclusive, setToExclusive] = useState("2026-06-20");
  const [teamSize, setTeamSize] = useState(4);

  const { data, isLoading } = useQuery({
    queryKey: ["team-coverage", from, toExclusive, teamSize],
    queryFn: () => api(`/api/june18/team-coverage?from=${from}&toExclusive=${toExclusive}&teamSize=${teamSize}`),
  });

  const days = Object.values(data?.data?.days || {}).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-4 p-6">
      <header className="flex items-end gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Team Coverage Calendar</h1>
          <p className="text-sm text-zinc-500">PTO, training-due, and on-call overlaid per day.</p>
        </div>
        <Field label="From" value={from} onChange={setFrom} type="date" />
        <Field label="To (excl)" value={toExclusive} onChange={setToExclusive} type="date" />
        <Field label="Team size" value={teamSize} onChange={(v) => setTeamSize(Number(v))} type="number" />
      </header>

      <Card>
        <CardHeader><CardTitle className="text-sm">Daily roll-up</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-zinc-500">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-center">PTO</th>
                    <th className="px-3 py-2 text-center">Training due</th>
                    <th className="px-3 py-2 text-center">On call</th>
                    <th className="px-3 py-2 text-left">Flags</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((d) => (
                    <tr key={d.date} className="border-t">
                      <td className="px-3 py-2 font-medium">{d.date}</td>
                      <td className="px-3 py-2 text-center">{d.ptoCount}</td>
                      <td className="px-3 py-2 text-center">{d.trainingDueCount}</td>
                      <td className="px-3 py-2 text-center">{d.onCallCount}</td>
                      <td className="px-3 py-2">
                        {d.flags.map((f, i) => (
                          <span
                            key={i}
                            className={`mr-1 inline-block rounded px-2 py-0.5 text-xs ${
                              f.severity === "danger"
                                ? "bg-rose-100 text-rose-700"
                                : f.severity === "warn"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-sky-100 text-sky-700"
                            }`}
                          >
                            {f.message}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase text-zinc-500">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="rounded border px-2 py-1" />
    </div>
  );
}
