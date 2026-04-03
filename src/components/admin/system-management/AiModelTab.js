"use client";

import React from "react";
import { Brain } from "lucide-react";
import AiModelsTab from "@/components/admin/dashboard/AiModelsTab";

/**
 * AI Model Management tab — reuses the existing AiModelsTab from the dashboard
 * which already has the Roboflow viewer, confidence thresholds, and performance chart.
 */
export default function AiModelTab({ aiDetections = [], getCanvasRef }) {
  return (
    <div className="space-y-4">
      <AiModelsTab aiDetections={aiDetections} getCanvasRef={getCanvasRef || (() => null)} />
    </div>
  );
}
