'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

/* Keyboard cheat sheet for the QC quality-control workspace. Pressing `?`
 * anywhere outside an input toggles this dialog; the actual key handling
 * lives in the workspace page's keydown effect. */
const SHORTCUT_GROUPS = [
  {
    title: 'Navigation',
    rows: [
      { keys: ['J', '↓'], desc: 'Next detection' },
      { keys: ['K', '↑'], desc: 'Previous detection' },
      { keys: ['Esc'], desc: 'Deselect' },
    ],
  },
  {
    title: 'Review',
    rows: [
      { keys: ['A'], desc: 'Approve selected detection' },
      { keys: ['R'], desc: 'Reject selected detection' },
      { keys: ['F'], desc: 'Flag for second opinion (needs review)' },
    ],
  },
  {
    title: 'General',
    rows: [
      { keys: ['?'], desc: 'Toggle this cheat sheet' },
    ],
  },
];

function Kbd({ children }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded border border-gray-300 bg-gray-50 text-[11px] font-mono font-semibold text-gray-700 shadow-sm">
      {children}
    </kbd>
  );
}

export default function KeyboardShortcutsDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-purple-600" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription className="text-xs">
            Speed up review without leaving the keyboard.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                {group.title}
              </h4>
              <div className="space-y-1.5">
                {group.rows.map((row) => (
                  <div key={row.desc} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{row.desc}</span>
                    <span className="flex items-center gap-1">
                      {row.keys.map((k, i) => (
                        <span key={k} className="flex items-center gap-1">
                          {i > 0 && <span className="text-gray-300 text-xs">/</span>}
                          <Kbd>{k}</Kbd>
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
