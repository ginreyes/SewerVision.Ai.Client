"use client";
import React, { useState } from "react";
import { api } from "@/lib/helper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// June 18 — operator Pre-Shift Equipment Self-Check.
// 60-second flag-picker + photo URL inputs + free-text note. Submits to
// /api/june18/pre-shift-check; severity result drives a clear "go / hold /
// stop" indicator.

const FLAGS = [
  { key: "battery_low", label: "Battery low" },
  { key: "cable_damage", label: "Cable damage" },
  { key: "reel_misalignment", label: "Reel misalignment" },
  { key: "crawler_traction_loss", label: "Crawler traction loss" },
  { key: "light_failure", label: "Light failure" },
  { key: "audio_failure", label: "Audio failure" },
  { key: "control_lag", label: "Control lag" },
  { key: "water_intrusion", label: "Water intrusion" },
];

export default function PreShiftCheckPage() {
  const [selected, setSelected] = useState(new Set());
  const [photoUrls, setPhotoUrls] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function toggle(key) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setResult(null);
    try {
      const r = await api("/api/june18/pre-shift-check", {
        method: "POST",
        body: JSON.stringify({
          flags: Array.from(selected),
          photoUrls: photoUrls.split(/[\n,]/).map((s) => s.trim()).filter(Boolean),
          operatorNote: note,
        }),
      });
      setResult(r?.data);
    } finally {
      setSubmitting(false);
    }
  }

  const tone =
    result?.severity === "block"
      ? "bg-rose-100 text-rose-800 border-rose-300"
      : result?.severity === "major"
        ? "bg-amber-100 text-amber-800 border-amber-300"
        : result?.severity === "minor"
          ? "bg-sky-100 text-sky-800 border-sky-300"
          : "bg-emerald-100 text-emerald-800 border-emerald-300";

  return (
    <div className="space-y-4 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Pre-Shift Equipment Self-Check</h1>
        <p className="text-sm text-zinc-500">60 seconds before you connect the device. Be honest — flagged conditions feed the Equipment Issues queue.</p>
      </header>

      <Card>
        <CardHeader><CardTitle className="text-sm">Condition flags</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          {FLAGS.map((f) => (
            <label key={f.key} className="flex items-center gap-2 rounded border p-2">
              <input type="checkbox" checked={selected.has(f.key)} onChange={() => toggle(f.key)} />
              <span>{f.label}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Photos + note</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <label className="mb-1 block text-xs uppercase text-zinc-500">Photo URLs (one per line)</label>
            <textarea value={photoUrls} onChange={(e) => setPhotoUrls(e.target.value)} rows={3} className="w-full rounded border px-2 py-1" />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase text-zinc-500">Note</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="w-full rounded border px-2 py-1" />
          </div>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit self-check"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className={`border-2 ${tone}`}>
          <CardHeader>
            <CardTitle className="text-sm uppercase">
              {result.severity === "none" ? "All clear — go" : result.severity === "minor" ? "Minor — logged, go" : result.severity === "major" ? "Major — supervisor review" : "Blocking — do not deploy"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ul className="list-disc pl-5">
              {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
            {result.issueDraft && (
              <pre className="rounded bg-white/60 p-2 text-xs">{JSON.stringify(result.issueDraft, null, 2)}</pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
