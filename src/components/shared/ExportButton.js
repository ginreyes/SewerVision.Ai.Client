"use client";

import React, { memo, useState } from "react";
import { Download, Loader2, FileSpreadsheet, FileText, File, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToExcel, exportToCSV } from "@/lib/csvExport";

/**
 * ExportButton — dropdown with format options: Excel, CSV, PDF.
 */
const ExportButton = memo(function ExportButton({
  data = [],
  columns = [],
  filename = "export",
  label = "Export",
  variant = "outline",
  size = "sm",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  function handleExport(format) {
    if (!data.length || !columns.length) return;
    setExporting(true);
    setOpen(false);
    try {
      switch (format) {
        case "excel":
          exportToExcel(data, columns, filename);
          break;
        case "csv":
          exportToCSV(data, columns, filename);
          break;
        case "pdf":
          exportToPDF(data, columns, filename);
          break;
        default:
          exportToExcel(data, columns, filename);
      }
    } finally {
      setTimeout(() => setExporting(false), 500);
    }
  }

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        className="gap-1.5"
        disabled={disabled || data.length === 0 || exporting}
        onClick={() => setOpen(p => !p)}
      >
        {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
        {label}
        <ChevronDown className="w-3 h-3 ml-0.5" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-40 w-48">
            <button onClick={() => handleExport("excel")}
              className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium">Excel (.xlsx)</p>
                <p className="text-[10px] text-gray-400">Spreadsheet with formatting</p>
              </div>
            </button>
            <button onClick={() => handleExport("csv")}
              className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">CSV (.csv)</p>
                <p className="text-[10px] text-gray-400">Comma-separated values</p>
              </div>
            </button>
            <button onClick={() => handleExport("pdf")}
              className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                <File className="w-3.5 h-3.5 text-red-600" />
              </div>
              <div>
                <p className="font-medium">PDF (.pdf)</p>
                <p className="text-[10px] text-gray-400">Printable document</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
});

/**
 * Enhanced PDF export — branded report with header, summary stats, styled table.
 */
function exportToPDF(data, columns, filename) {
  if (!data || data.length === 0) return;

  const cols = columns.map(col => {
    if (typeof col === 'string') return { key: col, label: col, format: null };
    return { key: col.key, label: col.label || col.key, format: col.format || null };
  });

  const getVal = (obj, path) => {
    if (!obj || !path) return '';
    return path.split('.').reduce((acc, key) => acc?.[key] ?? '', obj);
  };

  const title = filename.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const date = new Date();
  const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const headerRow = cols.map(c =>
    `<th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e5e7eb;background:#f9fafb;">${c.label}</th>`
  ).join('');

  const bodyRows = data.map((row, idx) => {
    const bgColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
    const cells = cols.map(col => {
      let val = getVal(row, col.key);
      if (col.format) val = col.format(val, row);
      const displayVal = val ?? '';
      // Style status values
      const isStatus = col.key === 'status' || col.label?.toLowerCase() === 'status';
      const statusStyle = isStatus ? 'display:inline-block;padding:2px 10px;border-radius:12px;font-size:10px;font-weight:600;background:#f0fdf4;color:#15803d;' : '';
      return `<td style="padding:9px 14px;font-size:11px;color:#4b5563;border-bottom:1px solid #f3f4f6;${isStatus ? '' : ''}">
        ${isStatus ? `<span style="${statusStyle}">${displayVal}</span>` : displayVal}
      </td>`;
    }).join('');
    return `<tr style="background:${bgColor};">${cells}</tr>`;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} — SewerVision.ai</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          @page { margin: 15mm; size: landscape; }
        }
      </style>
    </head>
    <body style="font-family:'Segoe UI',system-ui,-apple-system,sans-serif;margin:0;padding:0;color:#111827;">

      <!-- Header Banner -->
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 32px;color:white;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <h1 style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.3px;">SewerVision.ai</h1>
            <p style="margin:4px 0 0 0;font-size:12px;opacity:0.85;">AI-Powered Pipeline Inspection Platform</p>
          </div>
          <div style="text-align:right;">
            <p style="margin:0;font-size:11px;opacity:0.75;">Report Generated</p>
            <p style="margin:2px 0 0 0;font-size:13px;font-weight:600;">${dateStr}</p>
            <p style="margin:2px 0 0 0;font-size:11px;opacity:0.75;">${timeStr}</p>
          </div>
        </div>
      </div>

      <!-- Report Title & Summary -->
      <div style="padding:24px 32px 16px 32px;">
        <h2 style="margin:0 0 6px 0;font-size:18px;font-weight:700;color:#111827;">${title}</h2>
        <div style="display:flex;gap:24px;margin-bottom:20px;">
          <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:8px;height:8px;border-radius:50%;background:#6366f1;"></div>
            <span style="font-size:11px;color:#6b7280;">Total Records: <strong style="color:#111827;">${data.length}</strong></span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:8px;height:8px;border-radius:50%;background:#10b981;"></div>
            <span style="font-size:11px;color:#6b7280;">Columns: <strong style="color:#111827;">${cols.length}</strong></span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:8px;height:8px;border-radius:50%;background:#f59e0b;"></div>
            <span style="font-size:11px;color:#6b7280;">Format: <strong style="color:#111827;">PDF Report</strong></span>
          </div>
        </div>

        <!-- Data Table -->
        <table style="border-collapse:collapse;width:100%;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <thead>
            <tr>${headerRow}</tr>
          </thead>
          <tbody>
            ${bodyRows}
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div style="padding:16px 32px;border-top:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <p style="margin:0;font-size:10px;color:#9ca3af;">Generated by SewerVision.ai · Confidential</p>
          <p style="margin:2px 0 0 0;font-size:9px;color:#d1d5db;">This report was auto-generated. Data is accurate as of ${timeStr} on ${dateStr}.</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;font-size:10px;color:#9ca3af;">Page 1 of 1</p>
        </div>
      </div>

      <!-- Print button (hidden in print) -->
      <div class="no-print" style="padding:16px 32px;text-align:center;">
        <button onclick="window.print()" style="padding:10px 24px;background:#6366f1;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">
          Print / Save as PDF
        </button>
        <button onclick="window.close()" style="padding:10px 24px;background:#f3f4f6;color:#374151;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;margin-left:8px;">
          Close
        </button>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

export default ExportButton;
