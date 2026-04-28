'use client';

import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@/components/providers/UserContext';
import {
  useProjectConversations,
  useOpenProjectDm,
} from '@/hooks/shared/useProjectChatHooks';
import ConversationView from './ConversationView';

const senderLabel = (user) => {
  if (!user) return 'Unknown';
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return name || user.username || user.email || 'Unknown';
};

const roleColor = (role) => {
  const map = {
    admin: 'bg-violet-50 text-violet-700',
    user: 'bg-rose-50 text-rose-700',
    operator: 'bg-amber-50 text-amber-700',
    'qc-tech': 'bg-emerald-50 text-emerald-700',
    'qc-technician': 'bg-emerald-50 text-emerald-700',
  };
  return map[role] || 'bg-gray-100 text-gray-700';
};

/**
 * @param {object} props
 * @param {string} props.projectId
 * @param {object} [props.activeDetection] — pass when this panel is mounted
 *   inside a QC review surface; enables detection-aware template auto-suggest.
 */
export default function ProjectChatPanel({ projectId, activeDetection }) {
  const { userData } = useUser();
  const { data: conversations = [], isLoading } = useProjectConversations(projectId);
  const openDm = useOpenProjectDm();
  const [activeId, setActiveId] = useState(null);

  // Default-select the group conversation on first load.
  useEffect(() => {
    if (activeId || !conversations.length) return;
    const group = conversations.find((c) => c.kind === 'group');
    setActiveId((group || conversations[0])._id);
  }, [conversations, activeId]);

  const groupConv = useMemo(() => conversations.find((c) => c.kind === 'group'), [conversations]);
  const dmConvs = useMemo(() => conversations.filter((c) => c.kind === 'dm'), [conversations]);
  const activeConv = useMemo(
    () => conversations.find((c) => c._id === activeId) || null,
    [conversations, activeId]
  );

  // Other participants in the group conversation, used to offer DM targets.
  const dmTargets = useMemo(() => {
    if (!groupConv || !userData) return [];
    return (groupConv.participants || [])
      .map((p) => p.userId)
      .filter((u) => u && u._id !== userData._id);
  }, [groupConv, userData]);

  const dmAlreadyOpen = (otherId) =>
    dmConvs.some((c) =>
      (c.participants || []).some((p) => (p.userId?._id || p.userId) === otherId)
    );

  const handleOpenDm = async (other) => {
    const result = await openDm.mutateAsync({ projectId, otherUserId: other._id });
    if (result?._id) setActiveId(result._id);
  };

  return (
    <div className="flex h-full min-h-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      {/* Left rail */}
      <aside className="w-64 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-3 py-3 border-b border-gray-200">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Project Chat</div>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {isLoading && (
            <div className="px-3 py-4 text-xs text-gray-400">Loading…</div>
          )}

          {/* Group */}
          {groupConv && (
            <button
              type="button"
              onClick={() => setActiveId(groupConv._id)}
              className={`w-full text-left px-3 py-2 flex items-start gap-2 hover:bg-rose-50 transition-colors ${
                activeId === groupConv._id ? 'bg-rose-50' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-semibold shrink-0">
                G
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">Group</div>
                <div className="text-xs text-gray-500 truncate">
                  {groupConv.lastMessage || 'No messages yet'}
                </div>
              </div>
              {(() => {
                const me = (groupConv.participants || []).find(
                  (p) => (p.userId?._id || p.userId) === userData?._id
                );
                const unread = me?.unreadCountHint || 0;
                return unread > 0 ? (
                  <span className="text-[10px] font-bold bg-rose-600 text-white rounded-full px-1.5 py-0.5">
                    {unread > 99 ? '99+' : unread}
                  </span>
                ) : null;
              })()}
            </button>
          )}

          {/* DMs */}
          {dmConvs.length > 0 && (
            <div className="px-3 mt-3 mb-1 text-[10px] uppercase tracking-wider text-gray-400">
              Direct Messages
            </div>
          )}
          {dmConvs.map((c) => {
            const other = (c.participants || [])
              .map((p) => p.userId)
              .find((u) => u && u._id !== userData?._id);
            const me = (c.participants || []).find((p) => (p.userId?._id || p.userId) === userData?._id);
            const unread = me?.unreadCountHint || 0;
            return (
              <button
                key={c._id}
                type="button"
                onClick={() => setActiveId(c._id)}
                className={`w-full text-left px-3 py-2 flex items-start gap-2 hover:bg-rose-50 transition-colors ${
                  activeId === c._id ? 'bg-rose-50' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${roleColor(other?.role)}`}>
                  {(other?.first_name?.[0] || '?').toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">{senderLabel(other)}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {c.lastMessage || 'No messages yet'}
                  </div>
                </div>
                {unread > 0 && (
                  <span className="text-[10px] font-bold bg-rose-600 text-white rounded-full px-1.5 py-0.5">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </button>
            );
          })}

          {/* Open DM with someone not yet in dmConvs */}
          {dmTargets.length > 0 && (
            <div className="px-3 mt-3 mb-1 text-[10px] uppercase tracking-wider text-gray-400">
              Start a DM
            </div>
          )}
          {dmTargets.map((other) => {
            if (dmAlreadyOpen(other._id)) return null;
            return (
              <button
                key={other._id}
                type="button"
                disabled={openDm.isPending}
                onClick={() => handleOpenDm(other)}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-rose-50 transition-colors disabled:opacity-50"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${roleColor(other.role)}`}>
                  {(other.first_name?.[0] || '?').toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-gray-700 truncate">{senderLabel(other)}</div>
                  <div className="text-xs text-gray-400">{other.role || 'team'}</div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Right pane */}
      <ConversationView conversation={activeConv} activeDetection={activeDetection} />
    </div>
  );
}
