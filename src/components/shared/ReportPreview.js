"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STAT_CARD_CLASS = "text-center p-3 bg-gray-50 rounded-xl";
const STAT_VALUE_CLASS = "text-xl font-bold";
const STAT_LABEL_CLASS = "text-[10px] text-gray-500";

const normalizeConfidence = (raw) => {
  if (raw == null) return 0;
  return raw > 1 ? raw : Math.round(raw * 100);
};

const countBySeverity = (detections, severity) =>
  detections.filter((d) => d.severity === severity).length;

const formatLongDate = (date) =>
  date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const buildPrintHtml = ({ project, detections, observations, summary }) => {
  const { totalDefects, avgConfidence, severityCounts } = summary;

  const observationRows = observations
    .slice(0, 50)
    .map(
      (obs, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${obs.distance || ""}</td>
          <td>${obs.pacpCode || ""}</td>
          <td>${obs.observation || ""}</td>
          <td><span class="severity sev-${obs.severity || "low"}">${obs.severity || "low"}</span></td>
          <td>${obs.time || ""}</td>
        </tr>`
    )
    .join("");

  const observationsSection =
    observations.length > 0
      ? `
        <div class="section">
          <div class="section-title">Observations</div>
          <table>
            <thead><tr><th>#</th><th>Distance</th><th>PACP Code</th><th>Observation</th><th>Severity</th><th>Time</th></tr></thead>
            <tbody>${observationRows}</tbody>
          </table>
        </div>`
      : "";

  return `<!DOCTYPE html><html><head><title>PACP Inspection Report — ${project.name}</title>
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
      <p>${project.name} — ${project.location || "N/A"}</p>
    </div>
    <div style="padding: 20px;">
      <div class="section">
        <div class="section-title">Project Information</div>
        <div class="info-row"><span class="info-label">Project Name</span><span class="info-value">${project.name}</span></div>
        <div class="info-row"><span class="info-label">Location</span><span class="info-value">${project.location || "N/A"}</span></div>
        <div class="info-row"><span class="info-label">Work Order</span><span class="info-value">${project.workOrder || "N/A"}</span></div>
        <div class="info-row"><span class="info-label">Status</span><span class="info-value">${project.status}</span></div>
        <div class="info-row"><span class="info-label">AI Confidence</span><span class="info-value">${avgConfidence}%</span></div>
        <div class="info-row"><span class="info-label">Report Date</span><span class="info-value">${formatLongDate(new Date())}</span></div>
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
      ${observationsSection}
      <div class="footer">
        <p>Generated by SewerVision.ai — ${new Date().toLocaleString()}</p>
        <p>This report is confidential and intended for authorized personnel only.</p>
      </div>
    </div>
    </body></html>`;
};

const printReport = ({ project, detections, observations, summary }) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = buildPrintHtml({ project, detections, observations, summary });
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
};

const ReportPreview = ({ project, detections = [], observations = [], onClose }) => {
  if (!project) return null;

  const summary = {
    totalDefects: detections.length || project?.aiDetections?.total || 0,
    avgConfidence: normalizeConfidence(project?.confidence),
    severityCounts: {
      critical: countBySeverity(detections, "critical"),
      high: countBySeverity(detections, "high"),
      medium: countBySeverity(detections, "medium"),
      low: countBySeverity(detections, "low"),
    },
  };

  const handleOpenChange = (open) => {
    if (!open) onClose?.();
  };

  const handlePrint = () => {
    printReport({ project, detections, observations, summary });
  };

  const criticalAndHigh = summary.severityCounts.critical + summary.severityCounts.high;

  return (
    <Dialog open onOpenChange={handleOpenChange}>
      <DialogContent size="modal-large" className="p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-rose-600 to-pink-600 px-6 py-4">
          <p className="text-[10px] uppercase tracking-[3px] text-rose-200">
            SewerVision.ai
          </p>
          <DialogTitle className="text-sm font-bold text-white">
            PACP Inspection Report
          </DialogTitle>
          <DialogDescription className="text-xs text-rose-100">
            {project.name}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className={STAT_CARD_CLASS}>
              <p className={`${STAT_VALUE_CLASS} text-gray-900`}>{summary.totalDefects}</p>
              <p className={STAT_LABEL_CLASS}>Total Defects</p>
            </div>
            <div className={STAT_CARD_CLASS}>
              <p className={`${STAT_VALUE_CLASS} text-violet-700`}>{summary.avgConfidence}%</p>
              <p className={STAT_LABEL_CLASS}>Confidence</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl">
              <p className={`${STAT_VALUE_CLASS} text-red-700`}>{criticalAndHigh}</p>
              <p className={STAT_LABEL_CLASS}>Critical+High</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className={`${STAT_VALUE_CLASS} text-blue-700`}>{observations.length}</p>
              <p className={STAT_LABEL_CLASS}>Observations</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Preview of the report that will be generated. Click &quot;Download PDF&quot; to print/save.
          </p>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-100">
          <Button variant="outline" size="sm" className="text-xs" onClick={onClose}>
            Close
          </Button>
          <Button
            size="sm"
            className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
            onClick={handlePrint}
          >
            <Download className="w-3 h-3 mr-1" /> Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPreview;
