'use client';

import { useState } from 'react';
import EmojiPicker from '@/components/shared/EmojiPicker';

/**
 * MessageReactions — renders the pill row under a message and the +emoji
 * picker. Pills aggregate by emoji with a count and highlight when the
 * current user has reacted. Clicking an existing pill toggles the user's
 * reaction; clicking + opens the EmojiPicker.
 */
export default function MessageReactions({ reactions = [], currentUserId, onToggle, isMine }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  // Group by emoji.
  const groups = reactions.reduce((acc, r) => {
    const key = r.emoji;
    acc[key] = acc[key] || { emoji: key, count: 0, mine: false };
    acc[key].count += 1;
    if (r.userId === currentUserId || r.userId?.toString?.() === currentUserId) {
      acc[key].mine = true;
    }
    return acc;
  }, {});
  const groupList = Object.values(groups);

  if (groupList.length === 0 && !pickerOpen) {
    // Empty case — render a button only on hover (the parent toggles a class).
    return (
      <div className={`flex gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="opacity-0 group-hover/msg:opacity-100 transition-opacity text-[10px] px-1.5 py-0.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
          title="Add reaction"
        >
          +😊
        </button>
        {pickerOpen && (
          <EmojiPicker
            onSelect={(emoji) => { onToggle?.(emoji); setPickerOpen(false); }}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`flex gap-1 flex-wrap mt-1 ${isMine ? 'justify-end' : 'justify-start'} relative`}>
      {groupList.map((g) => (
        <button
          key={g.emoji}
          type="button"
          onClick={() => onToggle?.(g.emoji)}
          className={`text-xs px-1.5 py-0.5 rounded-full border transition-colors ${
            g.mine
              ? 'bg-rose-50 border-rose-300 text-rose-700'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
          title={g.mine ? 'Click to remove' : 'Click to add yours'}
        >
          {g.emoji} <span className="text-[10px] tabular-nums">{g.count}</span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="text-[10px] px-1.5 py-0.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
        title="Add reaction"
      >
        +
      </button>
      {pickerOpen && (
        <div className="absolute bottom-full mb-1 z-30">
          <EmojiPicker
            onSelect={(emoji) => { onToggle?.(emoji); setPickerOpen(false); }}
            onClose={() => setPickerOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
