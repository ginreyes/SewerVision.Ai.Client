"use client";

import React from "react";
import { CheckCircle2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ACCENT = {
  indigo: { icon: "text-indigo-600", stroke: "text-indigo-600", bar: "from-indigo-500 via-indigo-600 to-purple-600" },
  blue: { icon: "text-blue-600", stroke: "text-blue-600", bar: "from-blue-500 via-blue-600 to-indigo-600" },
};

/**
 * UploadProgressDialog — non-dismissible dialog showing in-progress video upload.
 *
 * @param {{
 *   open: boolean,
 *   progress: number,
 *   accent?: "indigo" | "blue",
 * }} props
 */
export default function UploadProgressDialog({ open, progress, accent = "indigo" }) {
  const theme = ACCENT[accent] || ACCENT.indigo;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className={`w-5 h-5 ${theme.icon}`} />
            Uploading Video
          </DialogTitle>
          <DialogDescription>Please wait while your video is being uploaded...</DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Progress Circle */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * progress) / 100}
                  className={`${theme.stroke} transition-all duration-300`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">{progress}%</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${theme.bar} transition-all duration-300 ease-out`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Uploading...</span>
              <span>{progress}% complete</span>
            </div>
          </div>

          {/* Processing indicator */}
          {progress === 100 && (
            <div className="flex items-center justify-center gap-2 mt-4 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Processing video...</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
