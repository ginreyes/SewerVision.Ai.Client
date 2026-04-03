"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Zap, CheckCircle2, Terminal, Activity, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getCookie } from "@/lib/helper";

const DEFAULT_PIPELINE_STEPS = [
  "Video is segmented into frames and stabilized.",
  "Our defect detection model scans each frame for cracks, roots, joints, and more.",
  "Detections are grouped into PACP-style observations along the pipe.",
  "Project metrics and progress are recalculated from the new detections.",
];

/**
 * Hook to connect to SSE log stream for a project.
 * Falls back to simulated logs if SSE fails or project is already complete.
 */
function useAiProcessingLogs(projectId, isProcessing) {
  const [logs, setLogs] = useState([]);
  const [sseConnected, setSseConnected] = useState(false);
  const [sseComplete, setSseComplete] = useState(false);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!projectId || !isProcessing) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const token = getCookie('authToken');
    const url = `${backendUrl}/api/ai/logs/${projectId}/stream?token=${token}`;

    // Use EventSource for SSE
    // Note: EventSource doesn't support Authorization header natively,
    // so we pass token as query param (the backend needs to accept this)
    try {
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = () => {
        setSseConnected(true);
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'connected') {
            // Connection confirmed
            return;
          }

          const logLine = {
            message: data.message,
            type: data.type, // info, success, error, progress, complete
            frameNumber: data.frameNumber,
            totalFrames: data.totalFrames,
            progress: data.progress,
            timestamp: data.timestamp,
          };

          setLogs(prev => [...prev, logLine]);

          if (data.type === 'complete') {
            setSseComplete(true);
            es.close();
          }
        } catch {
          // Ignore parse errors (keep-alive comments etc.)
        }
      };

      es.onerror = () => {
        // SSE connection failed — will use fallback
        setSseConnected(false);
        es.close();
      };

      return () => {
        es.close();
        eventSourceRef.current = null;
      };
    } catch {
      setSseConnected(false);
    }
  }, [projectId, isProcessing]);

  return { logs, sseConnected, sseComplete };
}

/**
 * Build fallback log lines when SSE is not available (project already processing when modal opens)
 */
function getFallbackLogLines(project, selectedVideo) {
  const progress = selectedVideo?.aiProcessingProgress ?? project?.progress ?? 0;
  const status =
    selectedVideo?.aiProcessingStatus ||
    (project?.status === "ai-processing" ? "processing" : project?.status || "idle");

  const lines = [
    { message: "[BackblazeService] Trying S3-compatible GetObject...", type: "info" },
    { message: "AI pipeline started for project...", type: "info" },
    { message: "Loading video from storage...", type: "info" },
    { message: "Decoding stream into individual frames...", type: "info" },
  ];

  if (progress > 0) {
    lines.push({ message: `AI processing ${progress}% complete...`, type: "progress", progress });
  }

  if (status === "completed" || progress >= 100) {
    lines.push(
      { message: "Aggregating detections into PACP observations...", type: "info" },
      { message: "AI processing completed.", type: "complete" },
    );
  } else if (status === "failed") {
    lines.push({ message: "AI processing failed. See system logs for details.", type: "error" });
  } else {
    lines.push({ message: "AI processing still running...", type: "info" });
  }

  return lines;
}

/**
 * Reusable AI processing explainer modal with real-time SSE log streaming.
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
  const projectId = project?._id || project?.id;
  const progress = selectedVideo?.aiProcessingProgress ?? project?.progress ?? 0;
  const status =
    selectedVideo?.aiProcessingStatus ||
    (project?.status === "ai-processing" ? "processing" : project?.status || "idle");
  const isProcessing = status === "processing" || (project?.status === "ai-processing" && progress < 100);
  const isComplete = status === "completed" || progress >= 100;

  // SSE real-time logs
  const { logs: sseLogs, sseConnected, sseComplete } = useAiProcessingLogs(
    open ? projectId : null,
    isProcessing
  );

  // Use SSE logs if available, otherwise fallback
  const logLines = sseConnected && sseLogs.length > 0
    ? sseLogs
    : getFallbackLogLines(project, selectedVideo);

  const displayComplete = isComplete || sseComplete;

  // Get current frame info from last progress log
  const lastProgress = [...logLines].reverse().find(l => l.type === 'progress');
  const currentFrame = lastProgress?.frameNumber;
  const totalFrames = lastProgress?.totalFrames;

  const logContainerRef = useRef(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logLines.length]);

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
          "max-w-5xl md:max-w-6xl h-[85vh] max-h-[85vh] overflow-hidden p-0 border-0 shadow-2xl rounded-2xl bg-white dark:bg-zinc-900 gap-0 flex flex-col",
          className
        )}
      >
        {/* ── Purple gradient header ── */}
        <div className="relative px-8 pt-7 pb-5 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
          <div className="absolute bottom-0 left-10 w-36 h-36 bg-purple-400/10 rounded-full translate-y-1/2 blur-xl" />

          <div className="relative flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg scale-150" />
              <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm">
                {displayComplete ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                ) : (
                  <Zap className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            <DialogHeader className="space-y-1.5 p-0">
              <DialogTitle className="text-lg font-bold tracking-tight text-white">
                {displayComplete ? "AI processing completed" : title}
              </DialogTitle>
              <DialogDescription className="text-[13.5px] leading-relaxed text-purple-100/80">
                {displayComplete
                  ? "SewerVision.ai has finished processing this video. Detections and project metrics have been updated."
                  : description}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="px-8 pt-6 pb-7 flex-1 flex flex-col min-h-0 overflow-hidden">
            {displayComplete && (
              <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-3.5 flex items-center gap-3 text-emerald-800 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="font-medium">
                  Processing completed successfully. You can close this window or continue viewing the log below.
                </span>
              </div>
            )}

            <div className={cn("flex flex-col md:flex-row gap-6 min-h-0 flex-1 overflow-hidden", contentClassName)}>
              {/* ── Left side – pipeline explanation ── */}
              <div className="md:w-[38%] space-y-4 text-sm text-gray-700 flex flex-col overflow-y-auto">
                <div className="rounded-xl bg-purple-50/70 border border-purple-100 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-purple-400">Pipeline</p>
                  </div>
                  <ol className="space-y-3">
                    {pipelineSteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm text-[10px] font-bold text-white">
                            {i + 1}
                          </div>
                        </div>
                        <span className="text-[13px] leading-relaxed text-zinc-600">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Progress info */}
                {totalFrames && !displayComplete && (
                  <div className="rounded-xl bg-violet-50 border border-violet-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-violet-700">Processing Progress</span>
                      <span className="text-xs font-bold text-violet-600">{currentFrame || 0}/{totalFrames} frames</span>
                    </div>
                    <div className="h-2 bg-violet-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${lastProgress?.progress || 0}%` }} />
                    </div>
                  </div>
                )}

                <div className="text-[12.5px] text-zinc-500 space-y-2 leading-relaxed">
                  {footerNote ?? defaultFooterNote}
                </div>

                <DialogFooter className="px-0 pb-0 mt-auto pt-2">
                  <Button
                    onClick={() => onOpenChange(false)}
                    className="h-10 px-5 text-[13px] font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white shadow-md"
                  >
                    {displayComplete ? "Done" : closeButtonText}
                  </Button>
                </DialogFooter>
              </div>

              {/* ── Right side – Real-time log panel ── */}
              <div className={cn("md:w-[62%] flex flex-col min-h-0 overflow-hidden", logPanelClassName)}>
                <div className="rounded-xl bg-zinc-950 text-zinc-100 border border-zinc-800 shadow-inner shadow-black/40 text-[13px] font-mono overflow-hidden flex flex-col flex-1">
                  {/* Log header */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/80 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-[12px] font-medium text-zinc-300">sewervision-ai / pipeline.log</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-zinc-300">
                      {displayComplete ? (
                        <><span className="w-2 h-2 rounded-full bg-emerald-400" />completed</>
                      ) : sseConnected ? (
                        <><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />live (SSE)</>
                      ) : (
                        <><span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />polling</>
                      )}
                    </span>
                  </div>

                  {/* Log lines */}
                  <div ref={logContainerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-1 min-h-0">
                    {logLines.map((line, idx) => {
                      const isLast = idx === logLines.length - 1;
                      const msg = typeof line === 'string' ? line : line.message;
                      const type = typeof line === 'string' ? 'info' : line.type;
                      return (
                        <div key={idx} className="flex gap-2.5 group">
                          <span className={cn("select-none transition-colors", {
                            "text-emerald-500": type === 'success' || type === 'complete',
                            "text-red-500": type === 'error',
                            "text-violet-500": type === 'progress',
                            "text-zinc-600 group-hover:text-violet-500": type === 'info',
                          })}>
                            {type === 'success' ? '✓' : type === 'error' ? '✗' : '▌'}
                          </span>
                          <span className={cn("whitespace-pre-wrap break-all", {
                            "text-emerald-400 font-semibold": type === 'complete',
                            "text-emerald-300": type === 'success',
                            "text-red-400 font-semibold": type === 'error',
                            "text-violet-300": isLast && !displayComplete,
                            "text-zinc-200": type === 'info' || type === 'progress',
                          })}>
                            {msg}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Log footer */}
                  <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between text-[11px] text-zinc-500 flex-shrink-0">
                    <span>
                      status:{" "}
                      <span className={cn("font-semibold", displayComplete ? "text-emerald-400" : "text-violet-400")}>
                        {displayComplete ? "completed" : "processing"}
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
