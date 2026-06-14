"use client";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/helper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// June 18 — QC Defect Pattern Heatmap.
// Week × defect-code grid with intensity coloring and a per-code trend
// indicator. First pass takes pasted observations; live wiring to the May 13
// defect-trends endpoint replaces the textarea on the next pass.

export default function DefectHeatmapPage() {
  const [raw, setRaw] = useState(
    [
      "PACP-1\tA\t2026-06-15",
      "PACP-1\tA\t2026-06-15",
      "PACP-2\tB\t2026-06-15",
      "PACP-1\tA\t2026-06-08",
      "PACP-3\tC\t2026-06-08",
    ].join("\n"),
  );

  const mutation = useMutation({
    mutationFn: (observations) =>
      api("/api/june18/defect-heatmap", { method: "POST", body: JSON.stringify({ observations }) }),
  });

  function handleRun() {
    const observations = raw
      .split(/\n/)
      .map((line) => line.split(/\t|,/).map((s) => s.trim()))
      .filter((parts) => parts.length >= 3)
      .map(([defectCode, projectSection, observedAt]) => ({ defectCode, projectSection, observedAt }));
    mutation.mutate(observations);
  }

  const result = mutation.data?.data;

  return (
    <div className="space-y-4 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Defect Pattern Heatmap</h1>
        <p className="text-sm text-zinc-500">Week-over-week defect-code rollup by project section.</p>
      </header>

      <Card>
        <CardHeader><CardTitle className="text-sm">Observations (one per line: defectCode, section, ISO date)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={6} className="w-full rounded border px-2 py-1 font-mono text-xs" />
          <Button onClick={handleRun} disabled={mutation.isPending}>
            {mutation.isPending ? "Computing…" : "Build heatmap"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Heatmap</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">Code</th>
                  {result.weeks.map((w) => (
                    <th key={w} className="px-2 py-1 text-center">{w}</th>
                  ))}
                  <th className="px-2 py-1 text-center">Trend</th>
                </tr>
              </thead>
              <tbody>
                {result.codes.map((code) => (
                  <tr key={code} className="border-t">
                    <td className="px-2 py-1 font-medium">{code}</td>
                    {result.weeks.map((w) => {
                      const cell = result.cells.find((c) => c.week === w && c.code === code);
                      const count = cell?.count || 0;
                      const intensity = Math.min(1, count / 10);
                      const bg = count === 0 ? "transparent" : `rgba(244, 63, 94, ${0.15 + intensity * 0.6})`;
                      return (
                        <td key={w} className="px-2 py-1 text-center" style={{ backgroundColor: bg }}>
                          {count || ""}
                        </td>
                      );
                    })}
                    <td className="px-2 py-1 text-center">
                      <TrendChip kind={result.trendByCode[code]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TrendChip({ kind }) {
  const map = {
    up: { bg: "bg-rose-100 text-rose-700", label: "▲ up" },
    down: { bg: "bg-emerald-100 text-emerald-700", label: "▼ down" },
    flat: { bg: "bg-zinc-100 text-zinc-700", label: "= flat" },
    sparse: { bg: "bg-zinc-50 text-zinc-400", label: "sparse" },
  };
  const cls = map[kind] || map.sparse;
  return <span className={`inline-block rounded px-2 py-0.5 text-xs ${cls.bg}`}>{cls.label}</span>;
}
