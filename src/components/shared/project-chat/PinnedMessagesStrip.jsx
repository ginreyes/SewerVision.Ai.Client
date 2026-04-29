'use client';

import { useState } from 'react';
import { Pin, ChevronDown, ChevronUp, X } from 'lucide-react';
import { usePinnedProjectMessages, useTogglePinProjectMessage } from '@/hooks/shared/useProjectChatHooks';

const senderLabel = (sender) => {
  if (!sender) return 'Unknown';
  const name = [sender.first_name, sender.last_name].filter(Boolean).join(' ').trim();
  return name || sender.username || 'Unknown';
};

/**
 * Pinned-messages strip rendered above the message list. Up to 5 most-recent
 * pins, click-to-scroll the corresponding bubble into view, X-to-unpin.
 */
export default function PinnedMessagesStrip({ conversationId, scrollerRef }) {
  const { data: pins = [] } = usePinnedProjectMessages(conversationId);
  const toggle = useTogglePinProjectMessage(conversationId);
  const [collapsed, setCollapsed] = useState(false);

  if (!pins.length) return null;

  const scrollTo = (messageId) => {
    const el = scrollerRef?.current?.querySelector?.(`[data-message-id="${messageId}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="border-b border-amber-200 bg-amber-50/60">
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-amber-800 hover:bg-amber-100/60"
      >
        <span className="flex items-center gap-1.5 font-medium">
          <Pin className="w-3 h-3" />
          {pins.length} pinned message{pins.length === 1 ? '' : 's'}
        </span>
        {collapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </button>
      {!collapsed && (
        <div className="px-3 pb-2 space-y-1">
          {pins.map((p) => (
            <div
              key={p._id}
              className="flex items-start gap-2 bg-white border border-amber-200 rounded-lg px-2 py-1.5 group"
            >
              <button
                type="button"
                onClick={() => scrollTo(p._id)}
                className="flex-1 min-w-0 text-left"
              >
                <div className="text-[10px] font-semibold text-amber-700 truncate">
                  {senderLabel(p.sender)}
                </div>
                <div className="text-xs text-gray-700 truncate">
                  {p.text || (p.attachments?.length ? `📎 ${p.attachments[0].filename}` : '—')}
                </div>
              </button>
              <button
                type="button"
                onClick={() => toggle.mutate(p._id)}
                disabled={toggle.isPending}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-amber-700 hover:bg-amber-100"
                title="Unpin"
                aria-label="Unpin message"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
