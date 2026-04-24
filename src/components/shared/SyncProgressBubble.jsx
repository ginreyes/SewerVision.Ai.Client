'use client';

import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Loader2,
  CheckCircle2,
  XCircle,
  StopCircle,
  ChevronUp,
  ChevronDown,
  X,
  AlertTriangle,
  ExternalLink,
  List,
  Copy as CopyIcon,
  FileCheck2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSyncContext } from '@/components/providers/SyncContext';
import { useMigrationStatus } from '@/hooks/useQueryHooks';
import MigrationProgressModal from '@/components/admin/uploads/MigrationProgressModal';

const DIRECTION_SHORT = {
  'b2-to-s3': 'B2 → S3',
  's3-to-b2': 'S3 → B2',
};

const PHASE_META = {
  enumerating: { label: 'Discovering', icon: List, color: 'text-blue-600' },
  copying: { label: 'Copying', icon: CopyIcon, color: 'text-blue-600' },
  finalizing: { label: 'Finalizing', icon: FileCheck2, color: 'text-blue-600' },
  done: { label: 'Done', icon: Check, color: 'text-emerald-600' },
};

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
};

/**
 * Floating bubble anchored to the bottom-right of the screen.
 *
 * Lifecycle:
 *  1. Hidden by default.
 *  2. When a migration job is active (state = running/queued), bubble appears in EXPANDED mode.
 *  3. User can MINIMIZE to a pill, CLICK to reopen the full modal, or DISMISS after terminal.
 *  4. After terminal (completed/cancelled/failed), stays visible until dismissed — errors especially
 *     need to be noticed even if the user left the Storage tab.
 *
 * Survives navigation because it's mounted at the role layout level, and survives
 * page reload via SyncContext's localStorage hydration.
 */
export default function SyncProgressBubble() {
  const { activeJobId, clearActiveJob, enabled, hydrated } = useSyncContext();
  const [minimized, setMinimized] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Poll the job; stops automatically when terminal (the hook's refetchInterval handles this).
  const { data: job } = useMigrationStatus(activeJobId, {
    enabled: !!activeJobId && enabled,
  });

  // When a new job is picked up, reset dismissal + show expanded
  useEffect(() => {
    if (activeJobId) {
      setDismissed(false);
      setMinimized(false);
    }
  }, [activeJobId]);

  if (!enabled || !hydrated || !activeJobId || dismissed) return null;
  if (!job) {
    // Show a skeleton while we're waiting for the first status response
    return (
      <FloatingShell>
        <div className="flex items-center gap-2 px-3 py-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span className="text-xs text-gray-600">Loading backup status...</span>
        </div>
      </FloatingShell>
    );
  }

  const isTerminal = ['completed', 'cancelled', 'failed'].includes(job.state);
  const isError = job.state === 'failed';
  const isCancelled = job.state === 'cancelled';

  // Bar value — use byte progress when available, else file count
  const processed = job.migrated + job.skipped + job.failed;
  const filePct = job.total > 0 ? Math.round((processed / job.total) * 100) : 0;
  const bytePct = job.bytesTotal > 0 ? Math.round((job.bytesTransferred / job.bytesTotal) * 100) : 0;
  const displayPct = job.phase === 'enumerating' ? null : (bytePct || filePct);

  // Compact pill
  if (minimized) {
    return (
      <>
        <FloatingShell accent={isError ? 'red' : isTerminal ? 'emerald' : 'blue'}>
          <button
            onClick={() => setMinimized(false)}
            className="flex items-center gap-2 px-3 py-2 group"
          >
            <BubbleLeadingIcon job={job} />
            <span className={`text-xs font-medium ${isError ? 'text-red-700' : 'text-gray-800'}`}>
              {isError ? 'Backup failed' : isCancelled ? 'Cancelled' : isTerminal ? 'Backup complete' : `${displayPct ?? '…'}%`}
            </span>
            <ChevronUp className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
          </button>
        </FloatingShell>
        {modalOpen && (
          <MigrationProgressModal
            jobId={activeJobId}
            onClose={() => setModalOpen(false)}
            onCancel={undefined}
          />
        )}
      </>
    );
  }

  // Expanded mini-card
  return (
    <>
      <FloatingShell accent={isError ? 'red' : isTerminal ? 'emerald' : 'blue'} wide>
        <div className="p-3 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <BubbleLeadingIcon job={job} />
              <div className="min-w-0">
                <p className={`text-xs font-semibold truncate ${isError ? 'text-red-800' : 'text-gray-900'}`}>
                  {isError
                    ? 'Storage backup failed'
                    : isCancelled
                      ? 'Backup cancelled'
                      : isTerminal
                        ? 'Backup complete'
                        : 'Storage backup running'}
                </p>
                <p className="text-[10px] text-gray-500 truncate">
                  {DIRECTION_SHORT[job.direction] || job.direction}
                  {!isTerminal && job.phase && ` · ${PHASE_META[job.phase]?.label || job.phase}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                onClick={() => setMinimized(true)}
                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                title="Minimize"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {isTerminal && (
                <button
                  onClick={() => {
                    setDismissed(true);
                    clearActiveJob();
                  }}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Error body — most critical state, prominent */}
          {isError && (
            <div className="px-2 py-1.5 bg-red-50 border border-red-100 rounded text-[11px] text-red-700">
              <p className="font-medium">Error during {job.phase || 'backup'}:</p>
              <p className="truncate" title={job.errorMessage || 'Unknown error'}>
                {job.errorMessage || 'Unknown error'}
              </p>
              {job.failed > 0 && (
                <p className="mt-1 text-red-600">
                  {job.failed} file{job.failed === 1 ? '' : 's'} failed to copy.
                </p>
              )}
            </div>
          )}

          {/* Running body — show progress bar + counts */}
          {!isTerminal && (
            <>
              {job.phase === 'enumerating' ? (
                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Listing files in source bucket…</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">
                      {processed} / {job.total} files
                    </span>
                    <span className="font-medium text-gray-700">{displayPct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${displayPct || 0}%` }}
                    />
                  </div>
                  {job.bytesTotal > 0 && (
                    <p className="text-[10px] text-gray-400">
                      {formatBytes(job.bytesTransferred)} of {formatBytes(job.bytesTotal)} transferred
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Terminal summary — completed or cancelled (error shown above) */}
          {isTerminal && !isError && (
            <div className="text-[11px] text-gray-600 space-y-0.5">
              <p>
                <span className="text-emerald-700 font-medium">{job.migrated}</span> copied ·{' '}
                <span className="text-gray-500">{job.skipped}</span> skipped
                {job.failed > 0 && (
                  <>
                    {' · '}
                    <span className="text-red-600 font-medium">{job.failed} failed</span>
                  </>
                )}
              </p>
              {job.bytesTransferred > 0 && (
                <p className="text-[10px] text-gray-400">
                  {formatBytes(job.bytesTransferred)} transferred
                </p>
              )}
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center gap-1.5 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-[11px]"
              onClick={() => setModalOpen(true)}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View details
            </Button>
          </div>
        </div>
      </FloatingShell>

      {modalOpen && (
        <MigrationProgressModal
          jobId={activeJobId}
          onClose={() => setModalOpen(false)}
          onCancel={undefined}
        />
      )}
    </>
  );
}

/**
 * Shared floating shell — fixed position, consistent positioning + entrance animation.
 */
function FloatingShell({ children, accent = 'blue', wide = false }) {
  const border = {
    blue: 'border-blue-200 ring-blue-100',
    emerald: 'border-emerald-200 ring-emerald-100',
    red: 'border-red-200 ring-red-100',
  }[accent];

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 bg-white rounded-xl shadow-xl border ${border} ring-1 ${wide ? 'w-80' : 'min-w-0'} animate-in slide-in-from-bottom-2 duration-200`}
      role="status"
      aria-live="polite"
    >
      {children}
    </div>
  );
}

/**
 * State-aware leading icon: spinner while running, checkmark when done, X for failed.
 */
function BubbleLeadingIcon({ job }) {
  if (job.state === 'completed') {
    return (
      <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      </div>
    );
  }
  if (job.state === 'failed') {
    return (
      <div className="w-6 h-6 rounded-md bg-red-100 flex items-center justify-center flex-shrink-0">
        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
      </div>
    );
  }
  if (job.state === 'cancelled') {
    return (
      <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center flex-shrink-0">
        <StopCircle className="w-3.5 h-3.5 text-amber-600" />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
      <Cloud className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
    </div>
  );
}
