"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/helper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// June 18 — customer-rep Customer Health Score.
// Minimal first pass: takes a customerId in the URL hash and lets the rep
// preview the score by toggling the input numbers. Production wiring (live
// Customer + Complaint + Survey lookups) replaces the inputs on the next pass.

export default function CustomerHealthPage() {
  const [openComplaints, setOpenComplaints] = useState(0);
  const [avgResponseMinutes, setAvg] = useState(15);
  const [escalationsLast30d, setEsc] = useState(0);
  const [trend, setTrend] = useState("flat");

  const { data, isLoading } = useQuery({
    queryKey: ["customer-health", openComplaints, avgResponseMinutes, escalationsLast30d, trend],
    queryFn: () =>
      api(
        `/api/june18/customer-health/preview?openComplaints=${openComplaints}&avgResponseMinutes=${avgResponseMinutes}&escalationsLast30d=${escalationsLast30d}&satisfactionTrend=${trend}`,
      ),
  });

  const score = data?.data?.score ?? null;
  const bucket = data?.data?.bucket;
  const tone = bucket === "critical" ? "bg-rose-100 text-rose-700"
             : bucket === "at-risk" ? "bg-amber-100 text-amber-700"
             : "bg-emerald-100 text-emerald-700";

  return (
    <div className="space-y-4 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Customer Health</h1>
        <p className="text-sm text-zinc-500">Composite score (complaints, response time, escalations, satisfaction trend).</p>
      </header>

      <Card>
        <CardHeader><CardTitle className="text-sm">Score</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-zinc-500">Computing…</div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="text-5xl font-semibold">{score ?? "—"}</div>
              <Badge className={`${tone} text-xs uppercase`}>{bucket || "—"}</Badge>
            </div>
          )}

          {data?.data?.breakdown?.length > 0 && (
            <ul className="space-y-1 rounded border p-3 text-xs">
              {data.data.breakdown.map((b, i) => (
                <li key={i} className="flex justify-between">
                  <span>{b.reason}</span>
                  <span className={b.delta < 0 ? "text-rose-600" : "text-emerald-600"}>{b.delta > 0 ? "+" : ""}{b.delta}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Inputs</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <Field label="Open complaints" value={openComplaints} onChange={setOpenComplaints} type="number" />
          <Field label="Avg response (min)" value={avgResponseMinutes} onChange={setAvg} type="number" />
          <Field label="Escalations (30d)" value={escalationsLast30d} onChange={setEsc} type="number" />
          <div>
            <label className="mb-1 block text-xs uppercase text-zinc-500">Trend</label>
            <select value={trend} onChange={(e) => setTrend(e.target.value)} className="w-full rounded border px-2 py-1">
              <option value="up">up</option>
              <option value="flat">flat</option>
              <option value="down">down</option>
              <option value="unknown">unknown</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase text-zinc-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
        className="w-full rounded border px-2 py-1"
      />
    </div>
  );
}
