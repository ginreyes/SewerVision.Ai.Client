'use client';

import { useMemo, useState } from 'react';
import { useUser } from '@/components/providers/UserContext';
import { useMyProjectConversations } from '@/hooks/shared/useProjectChatHooks';
import ProjectChatPanel from './ProjectChatPanel';

const formatRelative = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/**
 * Top-level "All my project chats" view — used by user / operator /
 * qc-tech index routes. Lists projects the user is a participant in with
 * combined unread badges; clicking a project opens the full panel.
 */
export default function ProjectChatIndex() {
  const { userData } = useUser();
  const { data: conversations = [], isLoading } = useMyProjectConversations();
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Group conversations by project. Each group shows: project name, total
  // unread for the current user across that project's conversations, and
  // the most recent activity timestamp.
  const projects = useMemo(() => {
    const map = new Map();
    for (const c of conversations) {
      const proj = c.projectId;
      if (!proj || !proj._id) continue;
      const myParticipant = (c.participants || []).find(
        (p) => (p.userId?._id || p.userId) === userData?._id
      );
      const unread = myParticipant?.unreadCountHint || 0;
      if (!map.has(proj._id)) {
        map.set(proj._id, {
          projectId: proj._id,
          name: proj.name,
          workOrder: proj.workOrder,
          client: proj.client,
          status: proj.status,
          unread: 0,
          lastMessageAt: null,
        });
      }
      const entry = map.get(proj._id);
      entry.unread += unread;
      const at = c.lastMessageAt ? new Date(c.lastMessageAt).getTime() : 0;
      const cur = entry.lastMessageAt ? new Date(entry.lastMessageAt).getTime() : 0;
      if (at > cur) entry.lastMessageAt = c.lastMessageAt;
    }
    return Array.from(map.values()).sort((a, b) => {
      const at = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bt = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bt - at;
    });
  }, [conversations, userData]);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 h-[calc(100vh-80px)] min-h-0">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Project Chat</h1>
        <p className="text-sm text-gray-500">Conversations from every project you're a member of.</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
        <aside className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col min-h-0">
          <div className="px-3 py-2 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Projects
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="px-3 py-4 text-xs text-gray-400">Loading…</div>
            )}
            {!isLoading && projects.length === 0 && (
              <div className="px-3 py-4 text-xs text-gray-400">
                You're not a member of any project chats yet.
              </div>
            )}
            {projects.map((p) => (
              <button
                key={p.projectId}
                type="button"
                onClick={() => setSelectedProjectId(p.projectId)}
                className={`w-full text-left px-3 py-2.5 border-b border-gray-100 hover:bg-rose-50 transition-colors ${
                  selectedProjectId === p.projectId ? 'bg-rose-50' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {p.workOrder || '—'} · {p.client || '—'}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {formatRelative(p.lastMessageAt)}
                    </div>
                  </div>
                  {p.unread > 0 && (
                    <span className="text-[10px] font-bold bg-rose-600 text-white rounded-full px-1.5 py-0.5">
                      {p.unread > 99 ? '99+' : p.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="min-h-0">
          {selectedProjectId ? (
            <ProjectChatPanel projectId={selectedProjectId} />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-400 bg-white border border-gray-200 rounded-lg">
              Pick a project on the left.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
