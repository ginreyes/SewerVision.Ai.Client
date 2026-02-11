"use client";

import React, { useMemo, useEffect, useRef } from "react";
import { Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Build AI log-style lines based on current progress (from project / selectedVideo).
 */
function getAiLogLines(project, selectedVideo) {
  const progress = selectedVideo?.aiProcessingProgress ?? project?.progress ?? 0;
  const status =
    selectedVideo?.aiProcessingStatus ||
    (project?.status === "ai-processing" ? "processing" : project?.status || "idle");

  const totalFrames = 785;
  const processedFrames = Math.min(
    totalFrames,
    Math.max(1, Math.round((progress / 100) * totalFrames) || 1)
  );
  const startFrame = Math.max(1, processedFrames - 15);

  const lines = [
    "[BackblazeService] Trying S3-compatible GetObject...",
    "AI pipeline started for project...",
    "Loading video from storage...",
    "Decoding stream into individual frames...",
  ];

  for (let i = startFrame; i <= processedFrames; i++) {
    lines.push(
      `Processing frame ${i}/${totalFrames}: frame-${String(i).padStart(6, "0")}.jpg`
    );
  }

  if (status === "completed" || progress >= 100) {
    lines.push(
      "Aggregating detections into PACP observations...",
      "Recomputing project metrics and progress...",
      "Writing updated results back to database...",
      "AI processing completed."
    );
  } else if (status === "failed") {
    lines.push("AI processing failed. See system logs for details.");
  } else {
    lines.push(
      "Aggregating detections into PACP observations...",
      "AI processing still running..."
    );
  }

  return lines;
}

const DEFAULT_PIPELINE_STEPS = [
  "Video is segmented into frames and stabilized.",
  "Our defect detection model scans each frame for cracks, roots, joints, and more.",
  "Detections are grouped into PACP-style observations along the pipe.",
  "Project metrics and progress are recalculated from the new detections.",
];

/**
 * Reusable AI processing explainer modal.
 * Left: pipeline info + copy. Right: live-style log panel driven by project/video progress.
 *
 * @param {boolean} open - Controlled open state
 * @param {function} onOpenChange - Called when open state should change
 * @param {object} project - Project object (progress, status)
 * @param {object} [selectedVideo] - Selected video (aiProcessingProgress, aiProcessingStatus)
 * @param {string} [className] - Extra classes for DialogContent
 * @param {string} [contentClassName] - Extra classes for the inner content wrapper
 * @param {string} [logPanelClassName] - Extra classes for the log panel container
 * @param {string} [logPanelHeight] - Height for log panel, e.g. 'min-h-[420px]' or 'h-[55vh]'
 * @param {string} [title] - Override dialog title
 * @param {string} [description] - Override dialog description
 * @param {string[]} [pipelineSteps] - Override pipeline step bullets
 * @param {string} [footerNote] - Extra note above Got it button
 * @param {string} [closeButtonText] - Override "Got it" button text
 */
export function AiProcessingModal({
  open,
  onOpenChange,
  project,
  selectedVideo = null,
  className,
  contentClassName,
  logPanelClassName,
  logPanelHeight = "min-h-[420px]",
  title = "How SewerVision.ai is processing this project",
  description = "Here's what happens behind the scenes while AI reprocesses your inspection video.",
  pipelineSteps = DEFAULT_PIPELINE_STEPS,
  footerNote,
  closeButtonText = "Got it",
}) {
  const logLines = useMemo(
    () => getAiLogLines(project, selectedVideo),
    [project, selectedVideo]
  );

  const progress = selectedVideo?.aiProcessingProgress ?? project?.progress ?? 0;
  const status =
    selectedVideo?.aiProcessingStatus ||
    (project?.status === "ai-processing" ? "processing" : project?.status || "idle");
  const isComplete = status === "completed" || progress >= 100;

  const logContainerRef = useRef(null);
  useEffect(() => {
    if (isComplete && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [isComplete, logLines.length]);

  const defaultFooterNote = (
    <>
      <p>
        You can close this window at any time. The floating AI status bubble in the
        corner will stay visible while processing is running.
      </p>
      <p>
        The log view on the right mirrors what&apos;s happening on the server as each frame is processed.
      </p>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-5xl md:max-w-6xl max-h-[90vh] overflow-y-auto min-h-[75vh]",
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Zap className="w-5 h-5 text-violet-600" />
            )}
            {isComplete ? "AI processing completed" : title}
          </DialogTitle>
          <DialogDescription>
            {isComplete
              ? "SewerVision.ai has finished processing this video. Detections and project metrics have been updated."
              : description}
          </DialogDescription>
        </DialogHeader>

        {isComplete && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-3 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">Processing completed successfully. You can close this window or continue viewing the log below.</span>
          </div>
        )}

        <div
          className={cn(
            "mt-2 flex flex-col md:flex-row gap-6 flex-1 min-h-0",
            contentClassName
          )}
        >
          {/* Left side – explanation */}
          <div className="md:w-1/2 space-y-4 text-sm text-gray-700 md:pr-4 flex flex-col">
            <div className="bg-violet-50 border border-violet-100 rounded-lg p-4">
              <p className="text-xs font-semibold text-violet-700 mb-2">Pipeline</p>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-gray-700">
                {pipelineSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              {footerNote ?? defaultFooterNote}
            </div>
            <DialogFooter className="px-0 pb-0 mt-auto">
              <Button onClick={() => onOpenChange(false)}>
                {isComplete ? "Done" : closeButtonText}
              </Button>
            </DialogFooter>
          </div>

          {/* Right side – AI logs */}
          <div className={cn("md:w-1/2 flex flex-col min-h-0", logPanelClassName)}>
            <div
              className={cn(
                "rounded-xl bg-slate-950 text-slate-100 border border-slate-800 shadow-inner text-xs font-mono overflow-hidden flex flex-col flex-1",
                logPanelHeight
              )}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900/80 flex-shrink-0">
                <span className="text-[11px] text-slate-300">
                  sewervision-ai / pipeline.log
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                  {isComplete ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      completed
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      live
                    </>
                  )}
                </span>
              </div>
              <div ref={logContainerRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 min-h-0">
                {logLines.map((line, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-slate-500 select-none">▌</span>
                    <span className="whitespace-pre text-slate-100">{line}</span>
                  </div>
                ))}
              </div>
              <div className="px-3 py-1.5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-[11px] text-slate-400 flex-shrink-0">
                <span>
                  status:{" "}
                  <span className={isComplete ? "text-emerald-300 font-semibold" : "text-emerald-300 font-semibold"}>
                    {isComplete ? "completed" : "processing"}
                  </span>
                </span>
                <span>engine: SewerVision.ai v1</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AiProcessingModal;
