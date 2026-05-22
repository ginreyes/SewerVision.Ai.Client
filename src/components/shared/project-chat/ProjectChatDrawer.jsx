'use client';

import { useState, useEffect } from 'react';
import { useProjectChatUnreadTotal } from '@/hooks/shared/useProjectChatHooks';
import ProjectChatPanel from './ProjectChatPanel';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Floating-button drawer for project chat. Mounted on per-role project
 * detail pages so team members can chat without leaving the project view.
 *
 * The unread badge here shows the user's GLOBAL unread total across all
 * projects, not just this one — that nudges users to context-switch when
 * something is waiting for them elsewhere.
 */
export default function ProjectChatDrawer({ projectId, activeDetection }) {
  const [open, setOpen] = useState(false);
  const { data: unreadTotal = 0 } = useProjectChatUnreadTotal();

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full bg-rose-600 text-white shadow-lg hover:bg-rose-700 transition-colors"
        aria-label="Open project chat"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="text-sm font-medium">Chat</span>
        {unreadTotal > 0 && (
          <span className="text-[10px] font-bold bg-white text-rose-700 rounded-full px-1.5 py-0.5 ml-1">
            {unreadTotal > 99 ? '99+' : unreadTotal}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-40 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.6 }}
              className="relative w-full max-w-[520px] h-full bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">Project Chat</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-gray-100 text-gray-500"
                  aria-label="Close"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 min-h-0 p-2">
                <ProjectChatPanel projectId={projectId} activeDetection={activeDetection} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
