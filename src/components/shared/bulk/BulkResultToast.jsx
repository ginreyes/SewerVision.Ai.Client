"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, X } from "lucide-react";

/**
 * BulkResultToast — renders a success/partial-failure summary after a bulk op.
 *
 * The parent renders this conditionally when a mutation settles with a
 * `{ succeeded, failed }` payload. Hides itself via `onDismiss`.
 *
 * Not wired to any global toast queue — it is a dismissable inline panel so
 * users can expand the failure list without racing the auto-dismiss timer
 * of a normal toast.
 */
export default function BulkResultToast({ result, onDismiss }) {
  const [expanded, setExpanded] = useState(false);
  if (!result) return null;

  const { succeeded = [], failed = [] } = result;
  const hasFailures = failed.length > 0;
  const total = succeeded.length + failed.length;

  return (
    <div
      className={`fixed bottom-24 right-6 z-40 min-w-[320px] max-w-[400px] rounded-xl shadow-xl border px-4 py-3 ${
        hasFailures
          ? "bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30"
          : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30"
      }`}
    >
      <div className="flex items-start gap-3">
        {hasFailures ? (
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {hasFailures
              ? `${succeeded.length} done · ${failed.length} failed`
              : `${succeeded.length} of ${total} done`}
          </p>
          {hasFailures && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-xs text-gray-700 dark:text-gray-300 inline-flex items-center gap-1 hover:underline"
            >
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              {expanded ? "Hide details" : "View failures"}
            </button>
          )}
          {expanded && hasFailures && (
            <ul className="mt-2 max-h-40 overflow-y-auto text-xs text-gray-700 dark:text-gray-300 space-y-1 border-t border-amber-200/60 dark:border-amber-500/20 pt-2">
              {failed.map((f) => (
                <li key={f.id} className="truncate">
                  <span className="font-mono text-[10px] opacity-60">
                    {String(f.id).slice(-8)}
                  </span>{" "}
                  — {f.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
          title="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
