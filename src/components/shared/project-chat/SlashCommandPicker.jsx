'use client';

/**
 * Slash-command palette for inserting templates. Mirrors MentionPicker's
 * keyboard-driven UX. The parent (ConversationView) owns the filtered
 * candidate list + activeIndex so keyboard nav stays consistent across
 * both pickers.
 */
export default function SlashCommandPicker({ candidates, activeIndex, onSelect }) {
  if (!candidates || candidates.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 mb-1 w-full max-w-md z-20 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
      <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
        Templates
      </div>
      {candidates.map((t, idx) => (
        <button
          key={t._id}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(t);
          }}
          className={`w-full text-left px-3 py-2 transition-colors ${
            idx === activeIndex ? 'bg-rose-50' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 truncate">
              {t.title || 'Untitled'}
            </span>
            {t.shortcut && (
              <span className="text-[10px] font-mono bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">
                /{t.shortcut}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 truncate">{t.body || ''}</div>
        </button>
      ))}
    </div>
  );
}
