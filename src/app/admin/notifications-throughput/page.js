"use client";
import React, { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/helper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// June 18 — admin Notifications Throughput tab.
// Last-24h rolling chart-style table by channel (push / email / in-app),
// plus the top 10 suppression/error reasons. First pass posts events via the
// textarea so the UI smoke test runs without a live NotificationDispatchLog
// model; production swap replaces the textarea with a fetch.

export default function NotificationsThroughputPage() {
  const [raw, setRaw] = useState("");

  const mutation = useMutation({
    mutationFn: (events) =>
      api("/api/june18/notifications/throughput", { method: "POST", body: JSON.stringify({ events }) }),
  });

  function handleRun() {
    const events = raw
      .split(/\n/)
      .map((line) => {
        const [channel, outcome, at, reason] = line.split(/\t|,/).map((s) => s.trim());
        if (!channel || !outcome || !at) return null;
        return { channel, outcome, at, reason };
      })
      .filter(Boolean);
    mutation.mutate(events);
  }

  const result = mutation.data?.data;

  const byChannel = useMemo(() => {
    if (!result) return {};
    const out = { push: 0, email: 0, "in-app": 0 };
    for (const b of result.buckets) out[b.channel] = (out[b.channel] || 0) + b.sent;
    return out;
  }, [result]);

  return (
    <div className="space-y-4 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Notification Throughput</h1>
        <p className="text-sm text-zinc-500">Last 24 hours · sent / suppressed / error per channel.</p>
      </header>

      <Card>
        <CardHeader><CardTitle className="text-sm">Dispatch events (channel, outcome, ISO timestamp, reason)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={5} className="w-full rounded border px-2 py-1 font-mono text-xs" placeholder="push, sent, 2026-06-18T08:00:00Z" />
          <Button onClick={handleRun} disabled={mutation.isPending}>
            {mutation.isPending ? "Computing…" : "Run rollup"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader><CardTitle className="text-sm">Sent totals · 24h</CardTitle></CardHeader>
            <CardContent className="flex gap-3">
              {Object.entries(byChannel).map(([k, v]) => (
                <div key={k} className="rounded border bg-white p-3 text-center">
                  <div className="text-xs uppercase text-zinc-500">{k}</div>
                  <div className="text-2xl font-semibold">{v}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Top suppression / error reasons</CardTitle></CardHeader>
            <CardContent>
              {result.topReasons.length === 0 ? (
                <div className="text-xs text-zinc-500">No suppression / error rows in the window.</div>
              ) : (
                <table className="min-w-full text-xs">
                  <thead className="text-xs uppercase text-zinc-500">
                    <tr><th className="px-2 py-1 text-left">Reason</th><th className="px-2 py-1 text-right">Count</th></tr>
                  </thead>
                  <tbody>
                    {result.topReasons.map((r) => (
                      <tr key={r.reason} className="border-t">
                        <td className="px-2 py-1">{r.reason}</td>
                        <td className="px-2 py-1 text-right font-medium">{r.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
