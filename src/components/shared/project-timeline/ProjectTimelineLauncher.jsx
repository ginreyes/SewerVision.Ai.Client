'use client';

import { useState } from 'react';
import ProjectTimelineDrawer from './ProjectTimelineDrawer';

/**
 * Floating button + drawer pair, mirroring ProjectChatDrawer's pattern.
 * Sits one slot above the chat button on project detail pages so both
 * are reachable without overlapping.
 */
export default function ProjectTimelineLauncher({ project }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-[5.5rem] right-6 z-30 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-rose-700 border border-rose-200 shadow hover:bg-rose-50 transition-colors"
        aria-label="Open project timeline"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="text-sm font-medium">Timeline</span>
      </button>
      <ProjectTimelineDrawer open={open} onClose={() => setOpen(false)} project={project} />
    </>
  );
}
