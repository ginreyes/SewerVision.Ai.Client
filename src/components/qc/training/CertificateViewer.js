"use client";

import { Award, Download, CheckCircle, Calendar, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const CERT_PRINT_STYLES = `
  @page { size: landscape; margin: 0; }
  body { margin: 0; font-family: 'Georgia', serif; background: white; }
  .cert { width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; box-sizing: border-box; position: relative; overflow: hidden; }
  .cert::before { content: ''; position: absolute; inset: 20px; border: 3px solid #be123c; border-radius: 8px; }
  .cert::after { content: ''; position: absolute; inset: 25px; border: 1px solid #fecdd3; border-radius: 6px; }
  .logo { font-size: 14px; color: #be123c; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 8px; }
  .title { font-size: 42px; font-weight: 700; color: #1a1a2e; margin: 16px 0 8px; }
  .subtitle { font-size: 16px; color: #6b7280; margin-bottom: 32px; }
  .name { font-size: 32px; font-weight: 700; color: #be123c; border-bottom: 2px solid #fecdd3; padding-bottom: 8px; margin-bottom: 24px; }
  .path { font-size: 20px; color: #374151; margin-bottom: 8px; }
  .details { font-size: 14px; color: #6b7280; margin-bottom: 4px; }
  .id { font-size: 11px; color: #9ca3af; margin-top: 24px; letter-spacing: 2px; }
  .footer { position: absolute; bottom: 40px; display: flex; gap: 80px; text-align: center; }
  .footer div { font-size: 12px; color: #6b7280; }
  .footer .line { width: 160px; border-top: 1px solid #d1d5db; margin-bottom: 8px; }
`;

function formatLongDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function fullName(user) {
  if (!user) return "";
  return `${user.first_name || ""} ${user.last_name || ""}`.trim();
}

function buildCertificateHtml(certificate) {
  return `
    <!DOCTYPE html>
    <html><head><title>SewerVision.ai Certificate</title>
    <style>${CERT_PRINT_STYLES}</style></head><body>
    <div class="cert">
      <div class="logo">SewerVision.ai</div>
      <div class="title">Certificate of Completion</div>
      <div class="subtitle">This certifies that</div>
      <div class="name">${fullName(certificate.user)}</div>
      <div class="path">has successfully completed</div>
      <div class="path" style="font-weight:700;color:#1a1a2e;">${certificate.path || "Learning Path"}</div>
      <div class="details">Average Score: ${certificate.averageScore || 0}% · ${certificate.modulesCompleted || 0} of ${certificate.totalModules || 0} modules</div>
      <div class="details">Completed on ${formatLongDate(certificate.completedAt)}</div>
      <div class="id">${certificate.certificateId || ""}</div>
      <div class="footer">
        <div><div class="line"></div>Program Director</div>
        <div><div class="line"></div>Date Issued</div>
      </div>
    </div>
    </body></html>
  `;
}

function printCertificate(certificate) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(buildCertificateHtml(certificate));
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
}

export default function CertificateViewer({ certificate, onClose }) {
  const open = Boolean(certificate);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose?.()}>
      <DialogContent className="max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-red-700 to-amber-500 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-white text-sm font-bold">
            <Award className="w-5 h-5" />
            Certificate of Completion
          </DialogTitle>
          <DialogDescription className="sr-only">
            Preview and download the SewerVision.ai certificate of completion.
          </DialogDescription>
        </DialogHeader>

        {certificate && (
          <div className="p-8 text-center">
            <p className="text-[10px] text-red-600 uppercase tracking-[4px] font-medium">SewerVision.ai</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-3">Certificate of Completion</h2>
            <p className="text-sm text-gray-500 mt-1">This certifies that</p>

            <p className="text-xl font-bold text-red-700 mt-4 border-b-2 border-amber-100 pb-2 inline-block">
              {fullName(certificate.user)}
            </p>

            <p className="text-sm text-gray-600 mt-4">has successfully completed</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{certificate.path}</p>

            <div className="flex items-center justify-center gap-6 mt-5 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-500" /> Score: {certificate.averageScore}%
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {certificate.completedAt ? new Date(certificate.completedAt).toLocaleDateString() : "—"}
              </span>
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3" /> {certificate.certificateId}
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="px-6 py-4 border-t border-gray-100 sm:justify-end gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={onClose}>
            Close
          </Button>
          <Button
            size="sm"
            className="text-xs bg-red-700 hover:bg-red-800 text-white"
            onClick={() => certificate && printCertificate(certificate)}
          >
            <Download className="w-3 h-3 mr-1" /> Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
