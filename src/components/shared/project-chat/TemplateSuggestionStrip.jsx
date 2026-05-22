'use client';

import { Sparkles, X } from 'lucide-react';
import { useCannedResponseSuggestions } from '@/hooks/useQueryHooks';

/**
 * TemplateSuggestionStrip — when the QC tech is reviewing a specific
 * detection, this strip shows the top-ranked QC templates above the chat
 * composer. Click to insert into the textarea (parent owns the insert).
 *
 * Renders nothing when there's no detection context or no suggestions.
 */
export default function TemplateSuggestionStrip({
  userId,
  detectionType,
  severity,
  onInsert,
  onDismiss,
}) {
  const { data: suggestions = [], isLoading } = useCannedResponseSuggestions(userId, {
    detectionType,
    severity,
  });

  if (!detectionType || isLoading) return null;
  // Cap to top 3 so the strip stays compact.
  const top = (suggestions || []).slice(0, 3);
  if (top.length === 0) return null;

  return (
    <div className="border-t border-gray-100 bg-rose-50/40 px-3 py-2 flex items-center gap-2 overflow-x-auto">
      <div className="flex items-center gap-1 text-[10px] font-semibold text-rose-700 shrink-0">
        <Sparkles className="w-3 h-3" />
        Suggested for {detectionType}
      </div>
      <div className="flex gap-1.5">
        {top.map((t) => (
          <button
            key={t._id}
            type="button"
            onClick={() => onInsert?.(t)}
            className="text-xs px-2 py-1 rounded-md bg-white border border-rose-200 text-rose-800 hover:bg-rose-50 whitespace-nowrap"
            title={t.body}
          >
            {t.title}
          </button>
        ))}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-auto p-1 rounded hover:bg-rose-100 text-rose-700 shrink-0"
          aria-label="Dismiss suggestions"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
