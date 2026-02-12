"use client";

import { Zap, ArrowRight, Check, X, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

const DEFAULT_TITLE = "Reprocess AI for this project?";
const DEFAULT_DESCRIPTION =
  "Reprocessing will send this project's video back through the AI pipeline. " +
  "This can take some time depending on video length and system load, but " +
  "you can safely continue working while it runs.";
const DEFAULT_BULLETS = [
  "Existing AI detections may be updated with the latest model.",
  "New detections can appear if the model finds additional issues.",
  "Project metrics and progress will refresh as processing completes.",
];
const DEFAULT_CONFIRM_LABEL = "Yes, start AI reprocess";

/**
 * Reusable confirmation modal for starting AI reprocess.
 * Use from admin, operator, or any role that can trigger reprocess.
 *
 * @param {boolean} open - Controlled open state
 * @param {function} onOpenChange - Called when open state should change (e.g. close)
 * @param {function} onConfirm - Called when user clicks the confirm button (then dialog typically closes)
 * @param {string} [title] - Optional custom title
 * @param {string} [description] - Optional custom description
 * @param {string[]} [bullets] - Optional list of bullet points (defaults to standard copy)
 * @param {string} [confirmLabel] - Optional confirm button label
 * @param {string} [confirmClassName] - Optional class for confirm button
 */
export function ReprocessModal({
  open,
  onOpenChange,
  onConfirm,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  bullets = DEFAULT_BULLETS,
  confirmLabel = DEFAULT_CONFIRM_LABEL,
  confirmClassName,
}) {
  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden border-0 shadow-2xl  bg-white dark:bg-zinc-900 gap-0">
        {/* Purple gradient header band */}
        <div className="relative px-8 pt-8 pb-6 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-xl" />
          <div className="relative flex items-start gap-4">
            {/* Icon with glow */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg scale-150" />
              <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm">
                <Cpu className="w-6 h-6 text-white" strokeWidth={2.5}
                />
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <DialogHeader className="space-y-2 p-0">
                <DialogTitle className="text-xl font-bold tracking-tight text-white">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-[14px] leading-relaxed text-purple-100/80">
                  {description}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {/* What will happen section */}
          <div className="rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-purple-400 dark:text-purple-500 mb-4">
              What will happen
            </p>
            <div className="space-y-3.5">
              {bullets.map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm shadow-purple-500/25">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  </div>
                  <span className="text-[13.5px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-7 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange?.(false)}
            className="h-11 px-5 text-[14px] font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className={
              confirmClassName ??
              "h-11 px-6 text-[14px] font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white shadow-lg shadow-purple-600/25 hover:shadow-purple-500/35 transition-all duration-200 active:scale-[0.97]"
            }
          >
            <Zap className="w-4 h-4 mr-2" />
            {confirmLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ReprocessModal;