"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Database,
  Search,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Loader2,
  Link2,
  Hash,
  KeyRound,
  Type,
  Calendar,
  ToggleLeft,
  Braces,
  List,
  FileDown,
  Copy,
  CheckCheck,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/helper";

const FIELD_LIMIT_DEFAULT = 20;

const TYPE_ICON = {
  String: Type,
  Number: Hash,
  Date: Calendar,
  Boolean: ToggleLeft,
  ObjectId: KeyRound,
  Mixed: Braces,
  Array: List,
  Map: Braces,
  Buffer: Braces,
  Decimal128: Hash,
};

const TYPE_COLOR = {
  String: "text-blue-600 bg-blue-50",
  Number: "text-amber-600 bg-amber-50",
  Date: "text-violet-600 bg-violet-50",
  Boolean: "text-emerald-600 bg-emerald-50",
  ObjectId: "text-rose-600 bg-rose-50",
  Mixed: "text-gray-600 bg-gray-50",
  Array: "text-indigo-600 bg-indigo-50",
  Map: "text-gray-600 bg-gray-50",
  Buffer: "text-gray-600 bg-gray-50",
  Decimal128: "text-amber-600 bg-amber-50",
};

function FieldTypeChip({ field }) {
  const Icon = TYPE_ICON[field.type] || Braces;
  const cls = TYPE_COLOR[field.type] || "text-gray-600 bg-gray-50";
  return (
    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono font-medium ${cls}`}>
      <Icon className="w-3 h-3" />
      {field.isArray ? `${field.type}[]` : field.type}
    </span>
  );
}

function RefChip({ refName, onJump }) {
  return (
    <button
      type="button"
      onClick={() => onJump?.(refName)}
      className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-mono font-medium text-rose-700 hover:bg-rose-100 transition-colors"
      title={`Jump to ${refName}`}
    >
      <Link2 className="w-3 h-3" />
      {refName}
    </button>
  );
}

function buildTypeScriptInterface(model) {
  const lines = [`export interface I${model.name} {`];
  for (const f of model.fields) {
    let tsType;
    switch (f.type) {
      case "String": tsType = "string"; break;
      case "Number": case "Decimal128": tsType = "number"; break;
      case "Boolean": tsType = "boolean"; break;
      case "Date": tsType = "Date"; break;
      case "ObjectId": tsType = f.ref ? `Types.ObjectId /* ref: ${f.ref} */` : "Types.ObjectId"; break;
      case "Array": tsType = "any[]"; break;
      case "Mixed": tsType = "any"; break;
      default: tsType = "any";
    }
    if (f.isArray && f.type !== "Array") tsType = `${tsType}[]`;
    if (f.enum?.length) tsType = f.enum.map((v) => JSON.stringify(v)).join(" | ");
    const optional = f.isRequired ? "" : "?";
    lines.push(`  ${f.path}${optional}: ${tsType};`);
  }
  lines.push("}");
  return lines.join("\n");
}

function modelsToCSV(models) {
  const header = ["Model", "Domain", "Collection", "Documents", "Field Count", "Relationships", "Has Timestamps"];
  const rows = models.map((m) => [
    m.name,
    m.domain,
    m.collection,
    m.documentCount,
    m.fieldCount,
    m.relationships.join("|"),
    m.timestamps ? "yes" : "no",
  ]);
  return [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function fieldsToCSV(model) {
  const header = ["Field", "Type", "Array", "Required", "HasDefault", "Index", "Unique", "Ref", "Enum"];
  const rows = model.fields.map((f) => [
    f.path,
    f.type,
    f.isArray ? "yes" : "no",
    f.isRequired ? "yes" : "no",
    f.hasDefault ? "yes" : "no",
    f.isIndex ? "yes" : "no",
    f.isUnique ? "yes" : "no",
    f.ref || "",
    (f.enum || []).join("|"),
  ]);
  return [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function downloadFile(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function FieldTable({ fields, filter }) {
  const filtered = useMemo(() => {
    if (!filter) return fields;
    const q = filter.toLowerCase();
    return fields.filter(
      (f) =>
        f.path.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q) ||
        f.ref?.toLowerCase().includes(q) ||
        f.enum?.some((e) => String(e).toLowerCase().includes(q))
    );
  }, [fields, filter]);

  if (!filtered.length) {
    return <p className="text-xs text-gray-400 italic px-4 py-3">No fields match the current filter.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="text-left font-semibold text-gray-500 px-3 py-2">Field</th>
            <th className="text-left font-semibold text-gray-500 px-3 py-2">Type</th>
            <th className="text-left font-semibold text-gray-500 px-3 py-2">Flags</th>
            <th className="text-left font-semibold text-gray-500 px-3 py-2">Reference / Enum</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((f) => (
            <tr key={f.path} className="border-b border-gray-50 hover:bg-gray-50/40">
              <td className="px-3 py-1.5 font-mono text-gray-900 align-top">
                {f.path}
                {f.isRequired && <span className="ml-1 text-red-500">*</span>}
              </td>
              <td className="px-3 py-1.5 align-top">
                <FieldTypeChip field={f} />
              </td>
              <td className="px-3 py-1.5 align-top">
                <div className="flex flex-wrap gap-1">
                  {f.isUnique && <Badge variant="outline" className="text-[9px] py-0 px-1 border-emerald-200 text-emerald-700">unique</Badge>}
                  {f.isIndex && !f.isUnique && <Badge variant="outline" className="text-[9px] py-0 px-1 border-blue-200 text-blue-700">indexed</Badge>}
                  {f.hasDefault && <Badge variant="outline" className="text-[9px] py-0 px-1 border-gray-200 text-gray-600">default</Badge>}
                  {!f.isRequired && !f.hasDefault && <span className="text-[10px] text-gray-300">—</span>}
                </div>
              </td>
              <td className="px-3 py-1.5 align-top">
                {f.ref && <RefChip refName={f.ref} />}
                {f.enum?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {f.enum.slice(0, 6).map((v) => (
                      <code key={v} className="text-[9px] px-1 py-0.5 rounded bg-gray-100 text-gray-700">
                        {String(v)}
                      </code>
                    ))}
                    {f.enum.length > 6 && <span className="text-[9px] text-gray-400">+{f.enum.length - 6}</span>}
                  </div>
                )}
                {!f.ref && !f.enum?.length && <span className="text-[10px] text-gray-300">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ModelCard({ model, expanded, onToggle, onJump, onCopyTs, onExportCsv, copiedTs }) {
  const [showAll, setShowAll] = useState(model.fieldCount <= FIELD_LIMIT_DEFAULT);
  const [fieldFilter, setFieldFilter] = useState("");
  const visibleFields = showAll ? model.fields : model.fields.slice(0, FIELD_LIMIT_DEFAULT);

  return (
    <Card className="border-gray-200 transition-shadow hover:shadow-sm" data-model={model.name}>
      <CardHeader className="p-3 cursor-pointer select-none" onClick={() => onToggle(model.name)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {expanded ? <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />}
            <CardTitle className="text-sm font-semibold text-gray-900 truncate">{model.name}</CardTitle>
            <code className="text-[10px] text-gray-400 font-mono truncate">({model.collection})</code>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-gray-200 text-gray-600">{model.fieldCount} fields</Badge>
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-blue-200 text-blue-700">{model.documentCount.toLocaleString()} docs</Badge>
            {model.relationships.length > 0 && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-rose-200 text-rose-700 inline-flex items-center gap-1">
                <Link2 className="w-2.5 h-2.5" />{model.relationships.length}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="p-0 pt-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50/40">
            <div className="relative flex-1 min-w-[180px] max-w-[260px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                value={fieldFilter}
                onChange={(e) => setFieldFilter(e.target.value)}
                placeholder="Filter fields…"
                className="h-7 pl-7 text-xs"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex items-center gap-1.5">
              {model.relationships.length > 0 && (
                <div className="hidden md:flex items-center gap-1 mr-1">
                  <span className="text-[10px] text-gray-400">refs:</span>
                  {model.relationships.slice(0, 3).map((r) => (
                    <RefChip key={r} refName={r} onJump={onJump} />
                  ))}
                  {model.relationships.length > 3 && (
                    <span className="text-[10px] text-gray-400">+{model.relationships.length - 3}</span>
                  )}
                </div>
              )}
              <Button size="sm" variant="ghost" className="h-7 px-2 gap-1 text-xs" onClick={(e) => { e.stopPropagation(); onCopyTs(model); }}>
                {copiedTs ? <CheckCheck className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>TS</span>
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2 gap-1 text-xs" onClick={(e) => { e.stopPropagation(); onExportCsv(model); }}>
                <FileDown className="w-3 h-3" />
                <span>CSV</span>
              </Button>
            </div>
          </div>

          <FieldTable fields={visibleFields} filter={fieldFilter} />

          {model.fieldCount > FIELD_LIMIT_DEFAULT && !fieldFilter && (
            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/40">
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setShowAll((v) => !v)}>
                {showAll ? "Collapse" : `Show ${model.fieldCount - FIELD_LIMIT_DEFAULT} more fields`}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function ModelsExplorer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [expanded, setExpanded] = useState(() => new Set());
  const [copiedFor, setCopiedFor] = useState(null);
  const [error, setError] = useState(null);

  const fetchModels = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      try { await api("/api/system-health/models/refresh", "POST"); } catch { /* non-fatal */ }
    } else {
      setLoading(true);
    }
    try {
      const res = await api("/api/system-health/models", "GET");
      if (res.ok && res.data?.data) {
        setData(res.data.data);
        setError(null);
      } else {
        setError(res.data?.message || "Failed to load schema introspection");
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchModels(); }, [fetchModels]);

  const toggle = useCallback((name) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const expandAll = () => setExpanded(new Set((data?.models || []).map((m) => m.name)));
  const collapseAll = () => setExpanded(new Set());

  const jumpToModel = useCallback((name) => {
    setExpanded((prev) => new Set(prev).add(name));
    setTimeout(() => {
      const el = document.querySelector(`[data-model="${name}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }, []);

  const copyTsInterface = useCallback(async (model) => {
    const text = buildTypeScriptInterface(model);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFor(model.name);
      setTimeout(() => setCopiedFor((cur) => (cur === model.name ? null : cur)), 1500);
    } catch {
      // clipboard may be blocked — fall back to a download
      downloadFile(`${model.name}.ts`, text, "text/typescript");
    }
  }, []);

  const exportFieldsCsv = useCallback((model) => {
    downloadFile(`${model.name}_fields.csv`, fieldsToCSV(model), "text/csv");
  }, []);

  const exportSummaryCsv = () => {
    if (!data) return;
    downloadFile("models_summary.csv", modelsToCSV(data.models), "text/csv");
  };

  const filteredDomains = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.domains
      .filter((d) => domainFilter === "all" || d.domain === domainFilter)
      .map((d) => ({
        ...d,
        models: d.models.filter((m) => {
          if (!q) return true;
          if (m.name.toLowerCase().includes(q)) return true;
          if (m.collection.toLowerCase().includes(q)) return true;
          if (m.fields.some((f) => f.path.toLowerCase().includes(q))) return true;
          if (m.relationships.some((r) => r.toLowerCase().includes(q))) return true;
          return false;
        }),
      }))
      .filter((d) => d.models.length > 0);
  }, [data, search, domainFilter]);

  const totals = data?.totals;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4 text-sm text-red-700">
          Could not load schema introspection: {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <Card className="border-gray-200">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Braces className="w-4 h-4 text-rose-500" />
            Schema Explorer
            {totals && (
              <span className="text-xs font-normal text-gray-400">
                — {totals.modelCount} models · {totals.fieldCount.toLocaleString()} fields · {totals.relationshipCount} relationships
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-[360px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search models, fields, refs…"
                className="h-8 pl-8 text-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700"
            >
              <option value="all">All domains</option>
              {(data?.domains || []).map((d) => (
                <option key={d.domain} value={d.domain}>{d.domain} ({d.models.length})</option>
              ))}
            </select>

            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={expandAll}>
              <ChevronDown className="w-3.5 h-3.5" />Expand all
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={collapseAll}>
              <ChevronRight className="w-3.5 h-3.5" />Collapse all
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={exportSummaryCsv}>
              <FileDown className="w-3.5 h-3.5" />Summary CSV
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => fetchModels(true)} disabled={refreshing}>
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Domains */}
      {filteredDomains.length === 0 && (
        <Card className="border-dashed border-gray-200">
          <CardContent className="p-6 text-center text-sm text-gray-400">
            No models match the current filter.
          </CardContent>
        </Card>
      )}

      {filteredDomains.map((d) => (
        <div key={d.domain} className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Database className="w-3.5 h-3.5 text-gray-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {d.domain}
            </h4>
            <span className="text-[10px] text-gray-400">({d.models.length})</span>
            <div className="flex-1 border-t border-gray-100 ml-2" />
          </div>
          <div className="space-y-2">
            {d.models.map((m) => (
              <ModelCard
                key={m.name}
                model={m}
                expanded={expanded.has(m.name)}
                onToggle={toggle}
                onJump={jumpToModel}
                onCopyTs={copyTsInterface}
                onExportCsv={exportFieldsCsv}
                copiedTs={copiedFor === m.name}
              />
            ))}
          </div>
        </div>
      ))}

      {totals?.generatedAt && (
        <p className="text-[10px] text-gray-400 text-right pr-1">
          Snapshot generated {new Date(totals.generatedAt).toLocaleString()} · cached for 5 minutes server-side
        </p>
      )}
    </div>
  );
}
