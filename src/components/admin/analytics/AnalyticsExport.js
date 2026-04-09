"use client";

import { useState } from "react";
import { Download, X, FileText, Table, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { exportToExcel } from "@/lib/csvExport";

const DATE_RANGES = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
];

const SECTIONS = [
  { key: "kpis", label: "KPI Summary", desc: "Total projects, users, AI accuracy" },
  { key: "projects", label: "Project Statistics", desc: "Status breakdown, monthly completions" },
  { key: "aiPerformance", label: "AI Performance", desc: "Detection accuracy, confidence trends" },
  { key: "team", label: "Team Productivity", desc: "Completion counts, average scores" },
];

const AnalyticsExport = ({ open, onClose, analyticsData, kpiData }) => {
  const [dateRange, setDateRange] = useState("month");
  const [selectedSections, setSelectedSections] = useState(new Set(["kpis", "projects", "aiPerformance", "team"]));
  const [format, setFormat] = useState("pdf");

  if (!open) return null;

  const toggleSection = (key) => {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rangeLabel = DATE_RANGES.find((r) => r.value === dateRange)?.label || dateRange;

    printWindow.document.write(`<!DOCTYPE html><html><head><title>SewerVision.ai Analytics Report</title>
    <style>
      @page { size: landscape; margin: 15mm; }
      body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a2e; margin: 0; }
      .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 24px; border-radius: 0 0 12px 12px; }
      .header h1 { font-size: 20px; margin: 0 0 4px; } .header p { font-size: 11px; opacity: 0.8; margin: 0; }
      .logo { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; opacity: 0.6; margin-bottom: 8px; }
      .content { padding: 20px; }
      .section-title { font-size: 13px; font-weight: 700; color: #4f46e5; border-bottom: 2px solid #e0e7ff; padding-bottom: 4px; margin: 16px 0 8px; }
      .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
      .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center; }
      .card-value { font-size: 22px; font-weight: 700; } .card-label { font-size: 10px; color: #6b7280; }
      .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 9px; color: #9ca3af; text-align: center; }
    </style></head><body>
    <div class="header">
      <div class="logo">SewerVision.ai</div>
      <h1>Analytics Report — ${rangeLabel}</h1>
      <p>Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    <div class="content">
      ${selectedSections.has("kpis") && kpiData ? `
        <div class="section-title">Key Performance Indicators</div>
        <div class="grid">
          ${(kpiData || []).map((k) => `<div class="card"><div class="card-value">${k.value}</div><div class="card-label">${k.label}</div></div>`).join('')}
        </div>
      ` : ''}
      ${selectedSections.has("projects") && analyticsData?.projects ? `
        <div class="section-title">Project Statistics</div>
        <div class="grid">
          <div class="card"><div class="card-value">${analyticsData.projects.total}</div><div class="card-label">Total Projects</div></div>
          ${Object.entries(analyticsData.projects.statusBreakdown || {}).map(([k, v]) => `<div class="card"><div class="card-value">${v}</div><div class="card-label">${k}</div></div>`).join('')}
        </div>
      ` : ''}
      ${selectedSections.has("aiPerformance") && analyticsData?.detections ? `
        <div class="section-title">AI Performance</div>
        <div class="grid">
          <div class="card"><div class="card-value">${analyticsData.detections.total}</div><div class="card-label">Total Detections</div></div>
          ${Object.entries(analyticsData.detections.qcStatusBreakdown || {}).map(([k, v]) => `<div class="card"><div class="card-value">${v}</div><div class="card-label">${k}</div></div>`).join('')}
        </div>
      ` : ''}
      <div class="footer">SewerVision.ai — Confidential Analytics Report — ${new Date().toLocaleString()}</div>
    </div>
    </body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
    onClose();
  };

  const handleExportExcel = () => {
    const rows = [];
    if (selectedSections.has("kpis") && kpiData) {
      kpiData.forEach((k) => rows.push({ Section: "KPI", Metric: k.label, Value: k.value }));
    }
    if (selectedSections.has("projects") && analyticsData?.projects) {
      rows.push({ Section: "Projects", Metric: "Total", Value: analyticsData.projects.total });
      Object.entries(analyticsData.projects.statusBreakdown || {}).forEach(([k, v]) => {
        rows.push({ Section: "Projects", Metric: k, Value: v });
      });
    }
    exportToExcel(rows, ["Section", "Metric", "Value"], "sewervision-analytics");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[480px] max-w-[95vw] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Export Analytics Report</h3>
            <p className="text-[10px] text-gray-400">Choose sections and format</p>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Date Range */}
          <div>
            <Label className="text-xs font-medium text-gray-600 mb-2 block">Date Range</Label>
            <div className="flex gap-2">
              {DATE_RANGES.map((r) => (
                <button key={r.value} onClick={() => setDateRange(r.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${dateRange === r.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div>
            <Label className="text-xs font-medium text-gray-600 mb-2 block">Include Sections</Label>
            <div className="space-y-2">
              {SECTIONS.map((s) => (
                <div key={s.key} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
                  <Checkbox checked={selectedSections.has(s.key)} onCheckedChange={() => toggleSection(s.key)} />
                  <div><p className="text-xs font-medium text-gray-800">{s.label}</p><p className="text-[10px] text-gray-400">{s.desc}</p></div>
                </div>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <Label className="text-xs font-medium text-gray-600 mb-2 block">Format</Label>
            <div className="flex gap-2">
              <button onClick={() => setFormat("pdf")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${format === 'pdf' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-600'}`}>
                <FileText className="w-3 h-3" /> PDF
              </button>
              <button onClick={() => setFormat("excel")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${format === 'excel' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600'}`}>
                <Table className="w-3 h-3" /> Excel
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={format === "pdf" ? handleExportPDF : handleExportExcel}
            disabled={selectedSections.size === 0}>
            <Download className="w-3 h-3 mr-1" /> Export {format.toUpperCase()}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsExport;
