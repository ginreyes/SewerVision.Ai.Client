"use client";

import { Download, X, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

const ReportPreview = ({ project, detections = [], observations = [], onClose }) => {
  if (!project) return null;

  const totalDefects = detections.length || project?.aiDetections?.total || 0;
  const avgConfidence = project?.confidence
    ? (project.confidence > 1 ? project.confidence : Math.round(project.confidence * 100))
    : 0;

  const severityCounts = {
    critical: detections.filter((d) => d.severity === "critical").length,
    high: detections.filter((d) => d.severity === "high").length,
    medium: detections.filter((d) => d.severity === "medium").length,
    low: detections.filter((d) => d.severity === "low").length,
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html><html><head><title>PACP Inspection Report — ${project.name}</title>
    <style>
      @page { size: A4; margin: 20mm; }
      body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a2e; margin: 0; padding: 0; }
      .header { background: linear-gradient(135deg, #be123c, #e11d48); color: white; padding: 30px; border-radius: 0 0 12px 12px; }
      .header h1 { font-size: 22px; margin: 0 0 4px; }
      .header p { font-size: 12px; opacity: 0.85; margin: 0; }
      .logo { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; opacity: 0.7; margin-bottom: 12px; }
      .section { margin: 20px 0; }
      .section-title { font-size: 14px; font-weight: 700; color: #be123c; border-bottom: 2px solid #fecdd3; padding-bottom: 6px; margin-bottom: 12px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .stat-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center; }
      .stat-value { font-size: 24px; font-weight: 700; color: #1a1a2e; }
      .stat-label { font-size: 10px; color: #6b7280; margin-top: 2px; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th { background: #f3f4f6; padding: 8px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
      td { padding: 8px; border-bottom: 1px solid #f3f4f6; }
      tr:nth-child(even) { background: #fafafa; }
      .severity { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; }
      .sev-critical { background: #fef2f2; color: #dc2626; }
      .sev-high { background: #fff7ed; color: #ea580c; }
      .sev-medium { background: #fffbeb; color: #d97706; }
      .sev-low { background: #f0fdf4; color: #16a34a; }
      .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center; }
      .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px; }
      .info-label { color: #6b7280; } .info-value { font-weight: 600; color: #1a1a2e; }
    </style></head><body>
    <div class="header">
      <div class="logo">SewerVision.ai</div>
      <h1>PACP Inspection Report</h1>
      <p>${project.name} — ${project.location || 'N/A'}</p>
    </div>
    <div style="padding: 20px;">
      <div class="section">
        <div class="section-title">Project Information</div>
        <div class="info-row"><span class="info-label">Project Name</span><span class="info-value">${project.name}</span></div>
        <div class="info-row"><span class="info-label">Location</span><span class="info-value">${project.location || 'N/A'}</span></div>
        <div class="info-row"><span class="info-label">Work Order</span><span class="info-value">${project.workOrder || 'N/A'}</span></div>
        <div class="info-row"><span class="info-label">Status</span><span class="info-value">${project.status}</span></div>
        <div class="info-row"><span class="info-label">AI Confidence</span><span class="info-value">${avgConfidence}%</span></div>
        <div class="info-row"><span class="info-label">Report Date</span><span class="info-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
      </div>
      <div class="section">
        <div class="section-title">Defect Summary</div>
        <div class="grid">
          <div class="stat-card"><div class="stat-value">${totalDefects}</div><div class="stat-label">Total Defects</div></div>
          <div class="stat-card"><div class="stat-value">${avgConfidence}%</div><div class="stat-label">AI Confidence</div></div>
          <div class="stat-card"><div class="stat-value">${severityCounts.critical + severityCounts.high}</div><div class="stat-label">Critical + High</div></div>
          <div class="stat-card"><div class="stat-value">${observations.length}</div><div class="stat-label">Observations</div></div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Severity Breakdown</div>
        <div class="grid">
          <div class="stat-card"><div class="stat-value" style="color:#dc2626">${severityCounts.critical}</div><div class="stat-label">Critical</div></div>
          <div class="stat-card"><div class="stat-value" style="color:#ea580c">${severityCounts.high}</div><div class="stat-label">High</div></div>
          <div class="stat-card"><div class="stat-value" style="color:#d97706">${severityCounts.medium}</div><div class="stat-label">Medium</div></div>
          <div class="stat-card"><div class="stat-value" style="color:#16a34a">${severityCounts.low}</div><div class="stat-label">Low</div></div>
        </div>
      </div>
      ${observations.length > 0 ? `
      <div class="section">
        <div class="section-title">Observations</div>
        <table>
          <thead><tr><th>#</th><th>Distance</th><th>PACP Code</th><th>Observation</th><th>Severity</th><th>Time</th></tr></thead>
          <tbody>${observations.slice(0, 50).map((obs, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${obs.distance || ''}</td>
              <td>${obs.pacpCode || ''}</td>
              <td>${obs.observation || ''}</td>
              <td><span class="severity sev-${obs.severity || 'low'}">${obs.severity || 'low'}</span></td>
              <td>${obs.time || ''}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : ''}
      <div class="footer">
        <p>Generated by SewerVision.ai — ${new Date().toLocaleString()}</p>
        <p>This report is confidential and intended for authorized personnel only.</p>
      </div>
    </div>
    </body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[700px] max-w-[95vw] max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <div className="text-white">
            <p className="text-[10px] uppercase tracking-[3px] text-rose-200">SewerVision.ai</p>
            <h3 className="text-sm font-bold">PACP Inspection Report</h3>
            <p className="text-xs text-rose-100">{project.name}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        {/* Preview Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-xl"><p className="text-xl font-bold text-gray-900">{totalDefects}</p><p className="text-[10px] text-gray-500">Total Defects</p></div>
            <div className="text-center p-3 bg-gray-50 rounded-xl"><p className="text-xl font-bold text-violet-700">{avgConfidence}%</p><p className="text-[10px] text-gray-500">Confidence</p></div>
            <div className="text-center p-3 bg-red-50 rounded-xl"><p className="text-xl font-bold text-red-700">{severityCounts.critical + severityCounts.high}</p><p className="text-[10px] text-gray-500">Critical+High</p></div>
            <div className="text-center p-3 bg-blue-50 rounded-xl"><p className="text-xl font-bold text-blue-700">{observations.length}</p><p className="text-[10px] text-gray-500">Observations</p></div>
          </div>
          <p className="text-xs text-gray-500">Preview of the report that will be generated. Click "Download PDF" to print/save.</p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={onClose}>Close</Button>
          <Button size="sm" className="text-xs bg-rose-600 hover:bg-rose-700 text-white" onClick={handlePrint}>
            <Download className="w-3 h-3 mr-1" /> Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;
