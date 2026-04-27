"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  CheckCircle2,
  PlayCircle,
  Plus,
  Save,
  Loader2,
  GitCompare,
  Sliders,
  ListTree,
  AlertCircle,
} from "lucide-react";
import {
  useAIModelConfigs,
  useCreateAIModelConfig,
  useUpdateAIModelConfig,
  useActivateAIModelConfig,
  useCompareAIModelConfigs,
} from "@/hooks/useQueryHooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CLASS_KEYS = ["fractures", "cracks", "broken_pipes", "roots", "corrosion", "blockages"];
const CLASS_LABELS = {
  fractures: "Fractures",
  cracks: "Cracks",
  broken_pipes: "Broken pipes",
  roots: "Roots",
  corrosion: "Corrosion",
  blockages: "Blockages",
};

function fmtPct(v) {
  if (v == null || isNaN(v)) return "—";
  return (v <= 1 ? v * 100 : v).toFixed(1) + "%";
}

function ThresholdSlider({ value, onChange, disabled }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-rose-500"
      />
      <span className="w-10 text-right text-xs font-mono text-gray-700">
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  );
}

// ── Section A: Registry ──
function RegistrySection({ configs, onActivate, isActivating, activeId, onCreate, isCreating }) {
  const [showCreate, setShowCreate] = useState(false);
  const [version, setVersion] = useState("");
  const [notes, setNotes] = useState("");

  const submit = () => {
    const v = version.trim();
    if (!v) return;
    onCreate({ modelVersion: v, notes: notes.trim() || undefined });
    setVersion("");
    setNotes("");
    setShowCreate(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListTree className="w-4 h-4 text-rose-600" />
          <h3 className="text-sm font-semibold text-gray-900">Model Version Registry</h3>
          <Badge variant="outline" className="text-[10px]">{configs.length}</Badge>
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => setShowCreate((v) => !v)}>
          <Plus className="w-3.5 h-3.5" />New version
        </Button>
      </div>

      {showCreate && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <Input
            placeholder="Model version (e.g. roboflow-v12)"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="h-8 text-sm md:col-span-1"
          />
          <Input
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-8 text-sm md:col-span-1"
          />
          <Button size="sm" onClick={submit} disabled={!version.trim() || isCreating} className="h-8">
            {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
            Add to registry
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500">
              <th className="text-left py-2 px-2 font-semibold">Version</th>
              <th className="text-left py-2 px-2 font-semibold">Deployed</th>
              <th className="text-left py-2 px-2 font-semibold">Deployed by</th>
              <th className="text-left py-2 px-2 font-semibold">Accuracy</th>
              <th className="text-left py-2 px-2 font-semibold">Status</th>
              <th className="text-right py-2 px-2 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {configs.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-400">
                  No configs yet — add one above.
                </td>
              </tr>
            )}
            {configs.map((c) => {
              const active = c.isActive || c._id === activeId;
              return (
                <tr key={c._id} className={`border-b border-gray-100 ${active ? "bg-rose-50/40" : ""}`}>
                  <td className="py-2 px-2 font-mono font-semibold text-gray-900">{c.modelVersion}</td>
                  <td className="py-2 px-2 text-gray-600">
                    {c.deployedAt ? new Date(c.deployedAt).toLocaleString() : "—"}
                  </td>
                  <td className="py-2 px-2 text-gray-600">
                    {c.deployedBy?.username || c.deployedBy?.email || "—"}
                  </td>
                  <td className="py-2 px-2 text-gray-600">{fmtPct(c.accuracySnapshot?.overall)}</td>
                  <td className="py-2 px-2">
                    {active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                        <CheckCircle2 className="w-2.5 h-2.5" />Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400">Inactive</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {!active && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 text-rose-600"
                        disabled={isActivating}
                        onClick={() => onActivate(c._id)}
                      >
                        <PlayCircle className="w-3.5 h-3.5" />Activate
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Section B: Threshold Matrix ──
function ThresholdMatrixSection({ activeConfig, onSave, isSaving }) {
  const [draft, setDraft] = useState(() => ({}));
  const dirty = useMemo(() => {
    if (!activeConfig) return false;
    return CLASS_KEYS.some((k) => {
      const t = draft[k];
      const orig = activeConfig.thresholds?.[k];
      return typeof t === "number" && Math.abs((orig ?? 0) - t) > 1e-6;
    });
  }, [draft, activeConfig]);

  // Reset draft when active config changes
  useEffect(() => {
    if (!activeConfig) return;
    const next = {};
    for (const k of CLASS_KEYS) {
      next[k] = typeof activeConfig.thresholds?.[k] === "number" ? activeConfig.thresholds[k] : 0.6;
    }
    setDraft(next);
  }, [activeConfig?._id]);

  const handleSave = () => {
    if (!activeConfig) return;
    onSave({ id: activeConfig._id, thresholds: draft });
  };

  if (!activeConfig) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="w-4 h-4 text-rose-600" />
          <h3 className="text-sm font-semibold text-gray-900">Confidence Threshold Matrix</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 py-6 justify-center">
          <AlertCircle className="w-4 h-4" />
          No active config — activate one in the registry above.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-rose-600" />
          <h3 className="text-sm font-semibold text-gray-900">Confidence Threshold Matrix</h3>
          <span className="text-[10px] text-gray-400 font-mono">({activeConfig.modelVersion})</span>
        </div>
        <Button size="sm" disabled={!dirty || isSaving} onClick={handleSave} className="h-8 gap-1">
          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save thresholds
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
        {CLASS_KEYS.map((k) => (
          <div key={k} className="flex items-center gap-3">
            <span className="w-28 text-xs font-medium text-gray-700">{CLASS_LABELS[k]}</span>
            <ThresholdSlider value={draft[k] ?? 0.6} onChange={(v) => setDraft((d) => ({ ...d, [k]: v }))} disabled={isSaving} />
          </div>
        ))}
      </div>

      <p className="text-[11px] text-gray-400 mt-4">
        Detections below the per-class threshold will be filtered before they reach the QC queue.
      </p>
    </div>
  );
}

// ── Section C: A/B Comparator (Chart.js) ──
function ABComparatorSection({ configs }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [sample, setSample] = useState(200);
  const compareMutation = useCompareAIModelConfigs();
  const result = compareMutation.data;
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const run = () => {
    if (!a || !b || a === b) return;
    compareMutation.mutate({ configIdA: a, configIdB: b, sampleSize: sample });
  };

  // Render the chart on result change. We dynamically import chart.js/auto so this
  // matches the rest of the dashboard's lazy-loaded chart pattern.
  useEffect(() => {
    if (!result || !canvasRef.current) return;
    let cancelled = false;
    (async () => {
      const mod = await import("chart.js/auto");
      if (cancelled) return;
      const ChartCtor = mod.default;
      if (chartRef.current) {
        chartRef.current.destroy();
      }
      const labels = CLASS_KEYS.map((k) => CLASS_LABELS[k]);
      const dataA = CLASS_KEYS.map((k) => result.configA?.perClass?.[k]?.kept ?? 0);
      const dataB = CLASS_KEYS.map((k) => result.configB?.perClass?.[k]?.kept ?? 0);
      chartRef.current = new ChartCtor(canvasRef.current.getContext("2d"), {
        type: "bar",
        data: {
          labels,
          datasets: [
            { label: result.configA?.modelVersion || "Config A", data: dataA, backgroundColor: "#fb7185" },
            { label: result.configB?.modelVersion || "Config B", data: dataB, backgroundColor: "#6366f1" },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
          scales: { y: { beginAtZero: true, title: { display: true, text: "Kept detections" } } },
        },
      });
    })();
    return () => {
      cancelled = true;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [result]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-rose-600" />
          <h3 className="text-sm font-semibold text-gray-900">A/B Comparator</h3>
          <span className="text-[10px] text-gray-400">read-only against the latest detections</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        <select value={a} onChange={(e) => setA(e.target.value)} className="h-8 rounded-md border border-gray-200 bg-white px-2 text-sm">
          <option value="">Config A…</option>
          {configs.map((c) => (
            <option key={c._id} value={c._id}>{c.modelVersion}{c.isActive ? " (active)" : ""}</option>
          ))}
        </select>
        <select value={b} onChange={(e) => setB(e.target.value)} className="h-8 rounded-md border border-gray-200 bg-white px-2 text-sm">
          <option value="">Config B…</option>
          {configs.map((c) => (
            <option key={c._id} value={c._id}>{c.modelVersion}{c.isActive ? " (active)" : ""}</option>
          ))}
        </select>
        <select value={sample} onChange={(e) => setSample(Number(e.target.value))} className="h-8 rounded-md border border-gray-200 bg-white px-2 text-sm">
          <option value={100}>Last 100</option>
          <option value={200}>Last 200</option>
          <option value={500}>Last 500</option>
        </select>
        <Button size="sm" onClick={run} disabled={!a || !b || a === b || compareMutation.isPending} className="h-8 gap-1">
          {compareMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
          Run comparison
        </Button>
      </div>

      {compareMutation.isError && (
        <div className="text-xs text-red-600 mb-2">{compareMutation.error?.message}</div>
      )}

      {result && (
        <>
          <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-600">
            <span><b>Sampled:</b> {result.sampleSize}</span>
            <span><b>Unmapped types:</b> {result.unmappedTypes}</span>
            <span><b>{result.configA.modelVersion}</b> kept {result.configA.totals.kept} / filtered {result.configA.totals.filtered}</span>
            <span><b>{result.configB.modelVersion}</b> kept {result.configB.totals.kept} / filtered {result.configB.totals.filtered}</span>
          </div>
          <div className="h-72">
            <canvas ref={canvasRef} />
          </div>
        </>
      )}

      {!result && !compareMutation.isPending && (
        <p className="text-xs text-gray-400 text-center py-6">
          Pick two configs and run the comparison to see how each set of thresholds would have filtered the latest detections.
        </p>
      )}
    </div>
  );
}

export default function AIControlPlane() {
  const { data: configs = [], isLoading, isError } = useAIModelConfigs();
  const createMutation = useCreateAIModelConfig();
  const updateMutation = useUpdateAIModelConfig();
  const activateMutation = useActivateAIModelConfig();

  const activeConfig = useMemo(() => configs.find((c) => c.isActive) || null, [configs]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
        Could not load AI model configs.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RegistrySection
        configs={configs}
        activeId={activeConfig?._id}
        onActivate={(id) => activateMutation.mutate(id)}
        isActivating={activateMutation.isPending}
        onCreate={(payload) => createMutation.mutate(payload)}
        isCreating={createMutation.isPending}
      />
      <ThresholdMatrixSection
        activeConfig={activeConfig}
        onSave={(payload) => updateMutation.mutate(payload)}
        isSaving={updateMutation.isPending}
      />
      <ABComparatorSection configs={configs} />
    </div>
  );
}
