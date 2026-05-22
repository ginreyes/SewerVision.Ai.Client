"use client";

import { useState } from "react";
import { Download, FileText, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const DEFAULT_SELECTED = SECTIONS.map((s) => s.key);
const EXCEL_FILE_NAME = "sewervision-analytics";
const EXCEL_COLUMNS = ["Section", "Metric", "Value"];

const FORMATS = {
  pdf: { key: "pdf", label: "PDF", icon: FileText, activeClass: "bg-red-50 text-red-700 border border-red-200" },
  excel: { key: "excel", label: "Excel", icon: Table, activeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
};

const buildKpiSection = (kpiData) => `
  <div class="section-title">Key Performance Indicators</div>
  <div class="grid">
    ${(kpiData || [])
      .map((k) => `<div class="card"><div class="card-value">${k.value}</div><div class="card-label">${k.label}</div></div>`)
      .join("")}
  </div>
`;

const buildProjectsSection = (projects) => `
  <div class="section-title">Project Statistics</div>
  <div class="grid">
    <div class="card"><div class="card-value">${projects.total}</div><div class="card-label">Total Projects</div></div>
    ${Object.entries(projects.statusBreakdown || {})
      .map(([k, v]) => `<div class="card"><div class="card-value">${v}</div><div class="card-label">${k}</div></div>`)
      .join("")}
  </div>
`;

const buildAiPerformanceSection = (detections) => `
  <div class="section-title">AI Performance</div>
  <div class="grid">
    <div class="card"><div class="card-value">${detections.total}</div><div class="card-label">Total Detections</div></div>
    ${Object.entries(detections.qcStatusBreakdown || {})
      .map(([k, v]) => `<div class="card"><div class="card-value">${v}</div><div class="card-label">${k}</div></div>`)
      .join("")}
  </div>
`;

const buildPdfHtml = ({ rangeLabel, selectedSections, analyticsData, kpiData }) => {
  const sections = [];
  if (selectedSections.has("kpis") && kpiData) sections.push(buildKpiSection(kpiData));
  if (selectedSections.has("projects") && analyticsData?.projects) sections.push(buildProjectsSection(analyticsData.projects));
  if (selectedSections.has("aiPerformance") && analyticsData?.detections) sections.push(buildAiPerformanceSection(analyticsData.detections));

  return `<!DOCTYPE html><html><head><title>SewerVision.ai Analytics Report</title>
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
      <p>Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
    </div>
    <div class="content">
      ${sections.join("")}
      <div class="footer">SewerVision.ai — Confidential Analytics Report — ${new Date().toLocaleString()}</div>
    </div>
    </body></html>`;
};

const buildExcelRows = ({ selectedSections, analyticsData, kpiData }) => {
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
  return rows;
};

const printPdf = ({ rangeLabel, selectedSections, analyticsData, kpiData }) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = buildPdfHtml({ rangeLabel, selectedSections, analyticsData, kpiData });
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
};

const FormatButton = ({ format, isActive, onClick }) => {
  const Icon = format.icon;
  const inactiveClass = "bg-gray-100 text-gray-600";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
        isActive ? format.activeClass : inactiveClass
      }`}
    >
      <Icon className="w-3 h-3" /> {format.label}
    </button>
  );
};

const AnalyticsExport = ({ open, onClose, analyticsData, kpiData }) => {
  const [dateRange, setDateRange] = useState("month");
  const [selectedSections, setSelectedSections] = useState(new Set(DEFAULT_SELECTED));
  const [format, setFormat] = useState("pdf");

  const toggleSection = (key) => {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) onClose?.();
  };

  const handleExport = () => {
    if (format === "pdf") {
      const rangeLabel = DATE_RANGES.find((r) => r.value === dateRange)?.label || dateRange;
      printPdf({ rangeLabel, selectedSections, analyticsData, kpiData });
    } else {
      const rows = buildExcelRows({ selectedSections, analyticsData, kpiData });
      exportToExcel(rows, EXCEL_COLUMNS, EXCEL_FILE_NAME);
    }
    onClose?.();
  };

  return (
    <Dialog open={!!open} onOpenChange={handleOpenChange}>
      <DialogContent size="md" className="p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <DialogTitle className="text-sm font-bold text-gray-900">
            Export Analytics Report
          </DialogTitle>
          <DialogDescription className="text-[10px] text-gray-400">
            Choose sections and format
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5">
          <div>
            <Label className="text-xs font-medium text-gray-600 mb-2 block">Date Range</Label>
            <div className="flex gap-2">
              {DATE_RANGES.map((r) => {
                const isActive = dateRange === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setDateRange(r.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-600 mb-2 block">Include Sections</Label>
            <div className="space-y-2">
              {SECTIONS.map((section) => (
                <div key={section.key} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
                  <Checkbox
                    checked={selectedSections.has(section.key)}
                    onCheckedChange={() => toggleSection(section.key)}
                  />
                  <div>
                    <p className="text-xs font-medium text-gray-800">{section.label}</p>
                    <p className="text-[10px] text-gray-400">{section.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-600 mb-2 block">Format</Label>
            <div className="flex gap-2">
              {Object.values(FORMATS).map((f) => (
                <FormatButton
                  key={f.key}
                  format={f}
                  isActive={format === f.key}
                  onClick={() => setFormat(f.key)}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-100">
          <Button variant="outline" size="sm" className="text-xs" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleExport}
            disabled={selectedSections.size === 0}
          >
            <Download className="w-3 h-3 mr-1" /> Export {format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnalyticsExport;
