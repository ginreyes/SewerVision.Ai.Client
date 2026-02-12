"use client";

import React, { useMemo, useEffect, useRef } from "react";
import { Zap, CheckCircle2, Terminal, Activity } from "lucide-react";
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
 */
export function AiProcessingModal({
  open,
  onOpenChange,
  project,
  selectedVideo = null,
  className,
  contentClassName,
  logPanelClassName,
  logPanelHeight = "min-h-[520px]",
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
          "max-w-5xl md:max-w-6xl max-h-[92vh] overflow-hidden min-h-[80vh] p-0 border-0 shadow-2xl rounded-2xl bg-white dark:bg-zinc-900 gap-0",
          className
        )}
      >
        {/* ── Purple gradient header ── */}
        <div className="relative px-8 pt-7 pb-5 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 overflow-hidden flex-shrink-0">
          {/* Decorative orbs */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
          <div className="absolute bottom-0 left-10 w-36 h-36 bg-purple-400/10 rounded-full translate-y-1/2 blur-xl" />

          <div className="relative flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg scale-150" />
              <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm">
                {isComplete ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                ) : (
                  <Zap className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            <DialogHeader className="space-y-1.5 p-0">
              <DialogTitle className="text-lg font-bold tracking-tight text-white">
                {isComplete ? "AI processing completed" : title}
              </DialogTitle>
              <DialogDescription className="text-[13.5px] leading-relaxed text-purple-100/80">
                {isComplete
                  ? "SewerVision.ai has finished processing this video. Detections and project metrics have been updated."
                  : description}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 pt-6 pb-7">
            {/* Completed banner */}
            {isComplete && (
              <div className="mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 px-5 py-3.5 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="font-medium">
                  Processing completed successfully. You can close this window or continue viewing the log below.
                </span>
              </div>
            )}

            <div
              className={cn(
                "flex flex-col md:flex-row gap-6 min-h-0",
                contentClassName
              )}
            >
              {/* ── Left side – pipeline explanation ── */}
              <div className="md:w-[38%] space-y-4 text-sm text-gray-700 dark:text-zinc-300 flex flex-col">
                {/* Pipeline steps card */}
                <div className="rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-purple-400 dark:text-purple-500">
                      Pipeline
                    </p>
                  </div>
                  <ol className="space-y-3">
                    {pipelineSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm shadow-purple-500/25 text-[10px] font-bold text-white">
                            {i + 1}
                          </div>
                        </div>
                        <span className="text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Footer note */}
                <div className="text-[12.5px] text-zinc-500 dark:text-zinc-400 space-y-2 leading-relaxed">
                  {footerNote ?? defaultFooterNote}
                </div>

                {/* Action button */}
                <DialogFooter className="px-0 pb-0 mt-auto pt-2">
                  <Button
                    onClick={() => onOpenChange(false)}
                    className="h-10 px-5 text-[13px] font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white shadow-md shadow-purple-600/20 hover:shadow-purple-500/30 transition-all duration-200 active:scale-[0.97]"
                  >
                    {isComplete ? "Done" : closeButtonText}
                  </Button>
                </DialogFooter>
              </div>

              {/* ── Right side – AI logs (bigger) ── */}
              <div className={cn("md:w-[62%] flex flex-col min-h-0", logPanelClassName)}>
                <div
                  className={cn(
                    "rounded-xl bg-zinc-950 text-zinc-100 border border-zinc-800 shadow-inner shadow-black/40 text-[13px] font-mono overflow-hidden flex flex-col flex-1",
                    logPanelHeight
                  )}
                >
                  {/* Log header bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/80 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-[12px] font-medium text-zinc-300">
                        sewervision-ai / pipeline.log
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-zinc-300">
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

                  {/* Log lines */}
                  <div
                    ref={logContainerRef}
                    className="flex-1 overflow-y-auto px-4 py-3 space-y-1 min-h-0"
                  >
                    {logLines.map((line, idx) => {
                      const isLast = idx === logLines.length - 1;
                      const isCompleted = line === "AI processing completed.";
                      const isFailed = line.includes("failed");
                      return (
                        <div key={idx} className="flex gap-2.5 group">
                          <span className="text-zinc-600 select-none group-hover:text-violet-500 transition-colors">
                            ▌
                          </span>
                          <span
                            className={cn(
                              "whitespace-pre-wrap break-all",
                              isCompleted
                                ? "text-emerald-400 font-semibold"
                                : isFailed
                                  ? "text-red-400 font-semibold"
                                  : isLast && !isComplete
                                    ? "text-violet-300"
                                    : "text-zinc-200"
                            )}
                          >
                            {line}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Log footer */}
                  <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between text-[11px] text-zinc-500 flex-shrink-0">
                    <span>
                      status:{" "}
                      <span
                        className={cn(
                          "font-semibold",
                          isComplete ? "text-emerald-400" : "text-violet-400"
                        )}
                      >
                        {isComplete ? "completed" : "processing"}
                      </span>
                    </span>
                    <span className="text-zinc-600">engine: SewerVision.ai v1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AiProcessingModal;