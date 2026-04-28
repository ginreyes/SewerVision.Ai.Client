'use client';

/**
 * MentionPicker — inline autocomplete that appears when the user types `@`
 * in the composer. Filters the conversation's participants by the partial
 * username and inserts `@username ` on selection.
 *
 * Driven entirely by props; the parent owns the textarea and pop state.
 * Keyboard: ↑/↓ to navigate, Enter/Tab to confirm, Esc to dismiss.
 */
import { useEffect, useRef } from 'react';

export default function MentionPicker({ candidates, activeIndex, onSelect, onClose, anchorRef }) {
  const listRef = useRef(null);

  useEffect(() => {
    // Keep the active item in view as the user arrows through.
    const el = listRef.current?.children?.[activeIndex];
    el?.scrollIntoView?.({ block: 'nearest' });
  }, [activeIndex]);

  if (!candidates || candidates.length === 0) return null;

  return (
    <div
      role="listbox"
      ref={listRef}
      className="absolute bottom-full left-2 mb-1 w-64 max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-30"
      onMouseDown={(e) => e.preventDefault()}
    >
      {candidates.map((u, idx) => {
        const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || u.username || u.email;
        const sub = u.username ? `@${u.username}` : u.role;
        return (
          <button
            key={u._id}
            type="button"
            role="option"
            aria-selected={idx === activeIndex}
            onClick={() => onSelect(u)}
            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 ${
              idx === activeIndex ? 'bg-rose-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-[10px] font-semibold flex items-center justify-center shrink-0">
              {(u.first_name?.[0] || u.username?.[0] || '?').toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-gray-900 truncate">{name}</div>
              <div className="text-[10px] text-gray-500 truncate">{sub}</div>
            </div>
          </button>
        );
      })}
      <button
        type="button"
        onClick={onClose}
        className="w-full text-left px-3 py-1 text-[10px] text-gray-400 border-t border-gray-100 hover:bg-gray-50"
      >
        Esc to close
      </button>
    </div>
  );
}
