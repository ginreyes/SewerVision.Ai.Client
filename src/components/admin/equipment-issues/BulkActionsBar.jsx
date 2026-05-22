"use client";

import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BulkActionsBar({
  selectedCount,
  onClear,
  onBulkAcknowledge,
  onBulkResolve,
  busy,
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-2 z-20 flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-white px-4 py-2 shadow-sm dark:border-rose-900/40 dark:bg-gray-900">
      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
        <span className="font-medium text-rose-700 dark:text-rose-300">
          {selectedCount}
        </span>
        selected
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={onBulkAcknowledge}
        >
          <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
          Acknowledge selected
        </Button>
        <Button
          type="button"
          size="sm"
          className="bg-emerald-600 text-white hover:bg-emerald-700"
          disabled={busy}
          onClick={onBulkResolve}
        >
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          Resolve selected
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={onClear}
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
