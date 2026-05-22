'use client';

import { Check, CheckCheck } from 'lucide-react';

const initials = (user) => {
  if (!user) return '?';
  const f = user.first_name?.[0] || '';
  const l = user.last_name?.[0] || '';
  return (f + l).toUpperCase() || (user.username?.[0] || '?').toUpperCase();
};

const colorFor = (id) => {
  // Stable hash → bg color so the same user gets the same chip color across
  // renders. Pinned to a small palette so contrast stays readable.
  const palette = [
    'bg-violet-200 text-violet-700',
    'bg-amber-200 text-amber-700',
    'bg-emerald-200 text-emerald-700',
    'bg-sky-200 text-sky-700',
    'bg-pink-200 text-pink-700',
    'bg-indigo-200 text-indigo-700',
  ];
  const s = String(id || '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return palette[Math.abs(h) % palette.length];
};

/**
 * Read-receipt indicator rendered next to the timestamp on the sender's
 * most recent message. Reads two sources:
 *   - conversation.participants[].lastReadAt — per-participant cursor
 *   - message.readBy[]                       — explicit per-message acks
 * A participant is "read" if either signal is past the message createdAt.
 *
 * Visual states:
 *   ✓        sent (no other participant has read yet)
 *   ✓✓ + avatars  read by at least one other participant
 */
export default function ReadReceipt({ message, conversation, currentUserId }) {
  const others = (conversation?.participants || []).filter(
    (p) => (p.userId?._id || p.userId) !== currentUserId
  );
  if (others.length === 0) {
    return <Check className="w-3 h-3 text-gray-400" />;
  }

  const created = new Date(message.createdAt).getTime();
  const readByMap = new Map();
  for (const r of message.readBy || []) {
    const uid = r.userId?._id || r.userId;
    if (!uid) continue;
    readByMap.set(String(uid), new Date(r.readAt).getTime());
  }

  const readers = [];
  for (const p of others) {
    const uid = p.userId?._id || p.userId;
    if (!uid) continue;
    const lastReadAt = p.lastReadAt ? new Date(p.lastReadAt).getTime() : 0;
    const explicit = readByMap.get(String(uid)) || 0;
    if (lastReadAt > created || explicit >= created) {
      readers.push(p.userId);
    }
  }

  if (readers.length === 0) {
    return <Check className="w-3 h-3 text-gray-400" />;
  }

  return (
    <span className="inline-flex items-center gap-0.5">
      <CheckCheck className="w-3 h-3 text-rose-500" />
      <span className="flex -space-x-1.5 ml-0.5">
        {readers.slice(0, 3).map((u) => {
          const id = u?._id || u;
          return (
            <span
              key={String(id)}
              title={[u?.first_name, u?.last_name].filter(Boolean).join(' ') || u?.username || 'Read'}
              className={`w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center ring-1 ring-white ${colorFor(id)}`}
            >
              {initials(u)}
            </span>
          );
        })}
        {readers.length > 3 && (
          <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-600 text-[8px] font-bold flex items-center justify-center ring-1 ring-white">
            +{readers.length - 3}
          </span>
        )}
      </span>
    </span>
  );
}
