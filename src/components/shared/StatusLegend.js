"use client";

import React, { useState, memo } from "react";
import { Info, X } from "lucide-react";

const STATUS_ITEMS = [
  { status: "Planning", color: "bg-slate-500", description: "Project created, awaiting site preparation" },
  { status: "Field Capture", color: "bg-blue-500", description: "Operator is on-site performing CCTV inspection" },
  { status: "Uploading", color: "bg-cyan-500", description: "Inspection video is being uploaded to cloud storage" },
  { status: "AI Processing", color: "bg-violet-500", description: "SewerVision AI is analyzing video frames for defects" },
  { status: "QC Review", color: "bg-amber-500", description: "QC Technician is reviewing AI detections" },
  { status: "Completed", color: "bg-emerald-500", description: "All reviews done, report ready for delivery" },
  { status: "Customer Notified", color: "bg-emerald-500", description: "Report delivered to the customer" },
  { status: "On Hold", color: "bg-red-400", description: "Project paused — awaiting resolution" },
];

/**
 * StatusLegend — collapsible legend explaining project status colors.
 * Shown as a small info button that expands into a tooltip/panel.
 */
const StatusLegend = memo(function StatusLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
          open ? "bg-gray-100 border-gray-300 text-gray-700" : "border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300"
        }`}
      >
        <Info className="w-3.5 h-3.5" />
        <span>Status Guide</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-40 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-700">Project Status Colors</span>
              <button onClick={() => setOpen(false)} className="p-0.5 rounded hover:bg-gray-200 text-gray-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-2 max-h-[320px] overflow-y-auto">
              {STATUS_ITEMS.map(item => (
                <div key={item.status} className="flex items-start gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-3 h-3 rounded-full shrink-0 mt-0.5 ${item.color}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{item.status}</p>
                    <p className="text-[10px] text-gray-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default StatusLegend;
