'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProjectTimeline from '@/components/customer/ProjectTimeline';

/**
 * ProjectTimelineDrawer — right-side drawer wrapping the existing
 * customer/ProjectTimeline component. Renders status history + AI
 * processing milestones for the given project. Data already lives on
 * the Project model so no new endpoint is required.
 *
 * Mount points: admin/user/customer-rep project detail surfaces.
 */
export default function ProjectTimelineDrawer({ open, onClose, project }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.6 }}
            className="relative w-full max-w-[480px] h-full bg-white shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Project Timeline</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded hover:bg-gray-100 text-gray-500"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {project ? (
                <ProjectTimeline project={project} />
              ) : (
                <div className="text-sm text-gray-400">No project selected.</div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
