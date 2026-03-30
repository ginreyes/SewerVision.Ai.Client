"use client";

import { memo, useState } from "react";

const EMOJI_CATEGORIES = [
  { label: "Smileys", emojis: ["😀","😂","🤣","😊","😍","🥰","😘","😜","🤗","😎","🥺","😢","😤","🤔","🙄","😴","🤯","🥳","😇","🫡"] },
  { label: "Gestures", emojis: ["👍","👎","👋","🤝","✌️","🤞","👏","🙏","💪","🫶","❤️","🔥","⭐","✅","❌","💯","🎉","🎊","💬","📌"] },
  { label: "Objects", emojis: ["📷","📎","📁","📊","🔧","⚙️","🔍","💡","📞","📧","🏗️","🚰","🪠","📋","🗓️","⏰","🔔","🏆","📝","🗺️"] },
];

const EmojiPicker = memo(function EmojiPicker({ onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="absolute bottom-full right-0 mb-2 w-[280px] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
      {/* Category tabs */}
      <div className="flex border-b border-gray-100 px-2 pt-2 gap-1">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button key={cat.label} onClick={() => setActiveCategory(i)}
            className={`px-2.5 py-1.5 text-[10px] font-medium rounded-t-lg transition-colors ${
              i === activeCategory ? "bg-gray-100 text-gray-900" : "text-gray-400 hover:text-gray-600"
            }`}>{cat.label}</button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="p-2 grid grid-cols-8 gap-0.5 max-h-[160px] overflow-y-auto">
        {EMOJI_CATEGORIES[activeCategory].emojis.map(emoji => (
          <button key={emoji} onClick={() => { onSelect(emoji); onClose(); }}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded-lg transition-colors">
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
});

export default EmojiPicker;
