"use client";

import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBulkActions } from "./bulkConfig";

/**
 * BulkActionBar — fixed-bottom action bar shown when selection > 0.
 *
 * Keeps its own markup minimal; opening a modal for ops that require payload
 * (assign, status, tag) is the caller's responsibility. This bar only fires
 * `onAction(op)`; the caller decides whether to prompt for payload, then
 * calls the bulk mutation.
 *
 * `accent` controls the pill color (matches the role theme).
 */
export default function BulkActionBar({
  entity,
  selectedCount,
  onAction,
  onClear,
  isPending = false,
  accent = "indigo",
  allowedOps, // optional Set<string> — if provided, only these ops are shown
}) {
  if (!selectedCount) return null;

  const actions = getBulkActions(entity).filter(
    (a) => !allowedOps || allowedOps.has(a.op)
  );

  const accentMap = {
    indigo: "bg-indigo-600 hover:bg-indigo-700",
    rose: "bg-rose-600 hover:bg-rose-700",
    amber: "bg-amber-600 hover:bg-amber-700",
    emerald: "bg-emerald-600 hover:bg-emerald-700",
    blue: "bg-blue-600 hover:bg-blue-700",
  };
  const accentCls = accentMap[accent] || accentMap.indigo;

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 max-w-[min(92vw,900px)]"
    >
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-white text-xs font-bold ${accentCls}`}
        >
          {selectedCount}
        </span>
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
          selected
        </span>
      </div>

      <div className="h-6 w-px bg-gray-200 dark:bg-[#27272a]" />

      <div className="flex items-center gap-1 flex-wrap">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Button
              key={a.op}
              size="sm"
              variant={a.destructive ? "outline" : "ghost"}
              disabled={isPending}
              onClick={() => onAction?.(a.op, a)}
              className={`h-8 text-xs gap-1.5 ${
                a.destructive
                  ? "text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-500/10"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#27272a]"
              }`}
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
              {a.label}
            </Button>
          );
        })}
      </div>

      <div className="h-6 w-px bg-gray-200 dark:bg-[#27272a]" />

      <Button
        size="sm"
        variant="ghost"
        onClick={onClear}
        disabled={isPending}
        className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900 dark:hover:text-white"
        title="Clear selection (Esc)"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
