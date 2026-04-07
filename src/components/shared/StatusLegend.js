"use client";

import React, { useState, memo } from "react";
import { Info, X, ArrowRight } from "lucide-react";

const STATUS_ITEMS = [
  { status: "Planning", color: "bg-slate-500", light: "bg-slate-50", text: "text-slate-700", description: "Project created, awaiting site preparation", step: 1 },
  { status: "Field Capture", color: "bg-blue-500", light: "bg-blue-50", text: "text-blue-700", description: "Operator is on-site performing CCTV inspection", step: 2 },
  { status: "Uploading", color: "bg-cyan-500", light: "bg-cyan-50", text: "text-cyan-700", description: "Inspection video is being uploaded to cloud storage", step: 3 },
  { status: "AI Processing", color: "bg-violet-500", light: "bg-violet-50", text: "text-violet-700", description: "SewerVision AI is analyzing video frames for defects", step: 4 },
  { status: "QC Review", color: "bg-amber-500", light: "bg-amber-50", text: "text-amber-700", description: "QC Technician is reviewing AI detections", step: 5 },
  { status: "Completed", color: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700", description: "All reviews done, report ready for delivery", step: 6 },
  { status: "Customer Notified", color: "bg-green-600", light: "bg-green-50", text: "text-green-700", description: "Report delivered to the customer", step: 7 },
  { status: "On Hold", color: "bg-red-400", light: "bg-red-50", text: "text-red-600", description: "Project paused — awaiting resolution", step: null },
];

const StatusLegend = memo(function StatusLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
          open ? "bg-gray-100 border-gray-300 text-gray-700 shadow-sm" : "border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300"
        }`}
      >
        <Info className="w-3.5 h-3.5" />
        <span>Status Guide</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
              <div>
                <p className="text-xs font-bold text-gray-800">Project Workflow</p>
                <p className="text-[10px] text-gray-400">Status progression from start to delivery</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Status list */}
            <div className="p-3 space-y-1">
              {STATUS_ITEMS.map((item, i) => (
                <div key={item.status} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:${item.light}`}>
                  {/* Step indicator */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${item.light}`}>
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-xs font-semibold ${item.text}`}>{item.status}</p>
                      {item.step && (
                        <span className="text-[9px] text-gray-300 font-medium">Step {item.step}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed">{item.description}</p>
                  </div>

                  {/* Arrow to next step */}
                  {item.step && i < STATUS_ITEMS.length - 2 && (
                    <ArrowRight className="w-3 h-3 text-gray-200 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 text-center">Projects flow through these stages automatically as work progresses</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default StatusLegend;
