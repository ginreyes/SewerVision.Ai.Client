'use client';

import { useEffect, useState } from 'react';
import { Undo2, X } from 'lucide-react';

/**
 * Sticky bottom-right toast that appears for ~5 minutes after a bulk QC action.
 * Shows the count of affected detections and a countdown; clicking Undo fires
 * the bulk-undo mutation, dismissing the toast on success. Auto-hides when
 * the window expires.
 */
export default function BulkUndoToast({ entry, onUndo, onDismiss, busy = false }) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((entry.expiresAt - Date.now()) / 1000))
  );

  useEffect(() => {
    if (!entry) return undefined;
    const tick = () => {
      const next = Math.max(0, Math.floor((entry.expiresAt - Date.now()) / 1000));
      setSecondsLeft(next);
      if (next <= 0) onDismiss?.(entry.undoToken);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [entry, onDismiss]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const countdown = `${mins}:${String(secs).padStart(2, '0')}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {entry.count} detection{entry.count === 1 ? '' : 's'} {entry.action === 'approved' ? 'approved' : 'rejected'}
        </p>
        <p className="text-xs text-gray-400">Undo expires in {countdown}</p>
      </div>
      <button
        type="button"
        onClick={() => onUndo(entry)}
        disabled={busy || secondsLeft <= 0}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:opacity-50 text-xs font-semibold transition-colors"
      >
        <Undo2 className="h-3.5 w-3.5" />
        Undo
      </button>
      <button
        type="button"
        onClick={() => onDismiss?.(entry.undoToken)}
        className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
