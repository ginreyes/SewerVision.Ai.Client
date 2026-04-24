'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  StopCircle,
  AlertTriangle,
  FileText,
  List,
  Copy as CopyIcon,
  FileCheck2,
  Check,
  SkipForward,
  HelpCircle,
  Zap,
  Clock,
} from 'lucide-react';
import { useMigrationStatus } from '@/hooks/useQueryHooks';

const STATE_LABEL = {
  queued: 'Queued',
  running: 'Running',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Failed',
};

const STATE_COLOR = {
  queued: 'bg-gray-100 text-gray-700 border-gray-200',
  running: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-amber-100 text-amber-700 border-amber-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
};

// Phase pipeline — what the backend actually does, exposed to the user so they
// understand WHERE the delay is coming from (listing a huge bucket can take longer
// than copying a handful of files).
const PHASES = [
  {
    key: 'enumerating',
    label: 'Discover',
    icon: List,
    description: 'Listing every file in the source provider. For a large bucket this can take a minute.',
  },
  {
    key: 'copying',
    label: 'Copy',
    icon: CopyIcon,
    description: 'For each file: check if the destination already has it. If yes, skip. If no, download from source and upload to destination.',
  },
  {
    key: 'finalizing',
    label: 'Finalize',
    icon: FileCheck2,
    description: 'Writing the migration log file to disk and recording a single aggregate audit entry.',
  },
  {
    key: 'done',
    label: 'Done',
    icon: Check,
    description: 'Job is finished — completed, cancelled, or failed.',
  },
];

// Phase ordering for "is this phase active or already passed" logic
const PHASE_INDEX = { enumerating: 0, copying: 1, finalizing: 2, done: 3 };

const DIRECTION_LABEL = {
  'b2-to-s3': 'Backblaze B2 → Amazon S3',
  's3-to-b2': 'Amazon S3 → Backblaze B2',
};

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
};

const formatDuration = (ms) => {
  if (!ms || ms < 0) return '—';
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  if (m < 60) return rs ? `${m}m ${rs}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h}h ${rm}m` : `${h}h`;
};

/**
 * Full-screen modal tracking a migration job in near-real-time.
 * Polls via useMigrationStatus (2s while running; stops when terminal).
 *
 * Shows:
 *  - 4-phase timeline (Discover → Copy → Finalize → Done)
 *  - Human-readable status line for whatever phase is active
 *  - Distinct counters for Migrated (copied now) vs Skipped (already at destination)
 *  - Live throughput + ETA during the copy phase
 *  - Terminal error + downloadable log
 */
export default function MigrationProgressModal({ jobId, onClose, onCancel }) {
  const { data: job, isLoading } = useMigrationStatus(jobId);

  const isTerminal = job && ['completed', 'cancelled', 'failed'].includes(job.state);
  const currentPhaseIndex = job ? PHASE_INDEX[job.phase] ?? 0 : 0;

  // File progress percentage (count-based)
  const processed = job ? job.migrated + job.skipped + job.failed : 0;
  const filePct = job && job.total > 0 ? Math.round((processed / job.total) * 100) : 0;

  // Byte progress: reflects ACTUAL transfer work, excluding skipped files' bytes.
  // This is the more honest "how much work is left" measure during copy.
  const bytePct = job && job.bytesTotal > 0
    ? Math.round((job.bytesTransferred / job.bytesTotal) * 100)
    : 0;

  // Throughput + ETA derived from start time + bytes transferred
  const { throughput, eta } = React.useMemo(() => {
    if (!job || !job.startedAt || job.bytesTransferred <= 0) {
      return { throughput: null, eta: null };
    }
    const elapsedMs = Date.now() - new Date(job.startedAt).getTime();
    if (elapsedMs < 1000) return { throughput: null, eta: null };
    const bytesPerSec = (job.bytesTransferred / elapsedMs) * 1000;
    const remainingBytes = Math.max(0, job.bytesTotal - job.bytesTransferred);
    const etaMs = bytesPerSec > 0 ? (remainingBytes / bytesPerSec) * 1000 : null;
    return {
      throughput: `${formatBytes(bytesPerSec)}/s`,
      eta: etaMs,
    };
  }, [job]);

  const handleDownloadLog = () => {
    if (!job) return;
    const blob = new Blob([JSON.stringify(job, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `migration-${jobId}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const statusLine = buildStatusLine(job);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose?.(); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StateIcon state={job?.state} loading={isLoading || !job} />
            Storage Backup
            {job && (
              <Badge className={STATE_COLOR[job.state] || 'bg-gray-100 text-gray-700'}>
                {STATE_LABEL[job.state]}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {job ? DIRECTION_LABEL[job.direction] : 'Waiting for job to start...'}
          </DialogDescription>
        </DialogHeader>

        {!job ? (
          <div className="py-8 text-center text-sm text-gray-400">Loading job status...</div>
        ) : (
          <div className="space-y-5">
            {/* ── Phase Timeline ── */}
            <PhaseTimeline currentPhaseIndex={currentPhaseIndex} jobState={job.state} />

            {/* ── Current status line ── */}
            <div className="px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-sm text-blue-900 font-medium">{statusLine.title}</p>
              {statusLine.detail && (
                <p className="text-xs text-blue-700 mt-1">{statusLine.detail}</p>
              )}
            </div>

            {/* ── Progress bars ── */}
            {job.phase !== 'enumerating' && job.total > 0 && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 flex items-center gap-1">
                      Files
                      <InfoTip>
                        Counts every file whether it was copied, skipped, or failed.
                      </InfoTip>
                    </span>
                    <span className="font-medium text-gray-700">
                      {processed} / {job.total} · {filePct}%
                    </span>
                  </div>
                  <Progress value={filePct} className="h-2" />
                </div>

                {job.bytesTotal > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 flex items-center gap-1">
                        Data Transferred
                        <InfoTip>
                          Only counts bytes of files actually copied this run. Skipped files don&apos;t
                          add to this bar — they&apos;re already at the destination.
                        </InfoTip>
                      </span>
                      <span className="font-medium text-gray-700">
                        {formatBytes(job.bytesTransferred)} / {formatBytes(job.bytesTotal)} · {bytePct}%
                      </span>
                    </div>
                    <Progress value={bytePct} className="h-2 [&>div]:bg-emerald-500" />
                  </div>
                )}
              </div>
            )}

            {/* ── Live metrics (throughput + ETA) — only during active copy ── */}
            {job.phase === 'copying' && (throughput || eta !== null) && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Throughput</span>
                  </div>
                  <p className="text-base font-semibold text-gray-900 mt-0.5">
                    {throughput || '—'}
                  </p>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Estimated Time Remaining</span>
                  </div>
                  <p className="text-base font-semibold text-gray-900 mt-0.5">
                    {eta !== null && eta > 0 ? formatDuration(eta) : '—'}
                  </p>
                </div>
              </div>
            )}

            {/* ── Counters (distinct colors for each outcome) ── */}
            <div className="grid grid-cols-3 gap-3">
              <CounterCard
                label="Copied"
                value={job.migrated}
                subtitle="Transferred this run"
                icon={CheckCircle2}
                color="emerald"
                tip="Files that weren't at the destination, so this job downloaded them from the source and uploaded them fresh. Bytes transferred = sum of these file sizes."
              />
              <CounterCard
                label="Skipped"
                value={job.skipped}
                subtitle="Already at destination"
                icon={SkipForward}
                color="gray"
                tip="Files that were ALREADY present at the destination with matching size. The job didn't re-copy them — this is what makes the migration safe to re-run."
              />
              <CounterCard
                label="Failed"
                value={job.failed}
                subtitle="See log for errors"
                icon={XCircle}
                color="red"
                tip="Files that could not be copied due to network, permission, or data errors. Each failure is captured in the downloadable log with the specific error message."
              />
            </div>

            {/* ── Currently copying file ── */}
            {job.state === 'running' && job.phase === 'copying' && job.currentFile && (
              <div className="flex items-start gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                <FileText className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500">Currently Copying</p>
                  <p className="text-xs font-mono text-gray-800 truncate">{job.currentFile}</p>
                  {job.currentFileSize !== undefined && (
                    <p className="text-[11px] text-gray-500 mt-0.5">{formatBytes(job.currentFileSize)}</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Terminal error ── */}
            {job.state === 'failed' && job.errorMessage && (
              <div className="flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-md">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-red-800">Job failed during {job.phase || 'unknown phase'}</p>
                  <p className="text-xs text-red-700 mt-0.5">{job.errorMessage}</p>
                </div>
              </div>
            )}

            {/* ── Failed file list (terminal) ── */}
            {isTerminal && job.failed > 0 && job.results && (
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                  View {job.failed} failed file{job.failed === 1 ? '' : 's'}
                </summary>
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded p-2 space-y-1">
                  {job.results
                    .filter((r) => r.action === 'failed')
                    .map((r, i) => (
                      <div key={i} className="font-mono text-[11px] text-gray-700 truncate">
                        <span className="text-red-600">✗</span> {r.fileName}: {r.error}
                      </div>
                    ))}
                </div>
              </details>
            )}

            {/* ── Completion summary ── */}
            {job.state === 'completed' && (
              <div className="flex items-start gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-emerald-900">
                    Backup complete in {formatDuration(
                      job.completedAt ? new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime() : 0
                    )}
                  </p>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    {job.migrated} copied · {job.skipped} skipped · {job.failed} failed ·{' '}
                    {formatBytes(job.bytesTransferred)} transferred
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {!isTerminal && onCancel && job?.phase !== 'finalizing' && (
            <Button variant="outline" onClick={onCancel}>
              <StopCircle className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
          {isTerminal && (
            <Button variant="outline" onClick={handleDownloadLog}>
              <FileText className="w-4 h-4 mr-2" />
              Download Log
            </Button>
          )}
          <Button onClick={onClose}>{isTerminal ? 'Close' : 'Hide'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────────────────────────────────────────────────────────────────

function StateIcon({ state, loading }) {
  if (loading) return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
  if (state === 'completed') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
  if (state === 'failed') return <XCircle className="w-5 h-5 text-red-500" />;
  if (state === 'cancelled') return <StopCircle className="w-5 h-5 text-amber-500" />;
  return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
}

/**
 * Horizontal timeline: Discover → Copy → Finalize → Done.
 * Active phase is blue/pulsing; passed phases are emerald/checked; upcoming are muted.
 */
function PhaseTimeline({ currentPhaseIndex, jobState }) {
  return (
    <div className="flex items-center gap-1">
      {PHASES.map((phase, i) => {
        const isActive = i === currentPhaseIndex && !['completed', 'cancelled', 'failed'].includes(jobState);
        const isPassed = i < currentPhaseIndex || (i === currentPhaseIndex && ['completed', 'cancelled', 'failed'].includes(jobState));
        const isTerminalFailure = i === currentPhaseIndex && jobState === 'failed';
        const isTerminalCancel = i === currentPhaseIndex && jobState === 'cancelled';
        const Icon = phase.icon;

        const color = isTerminalFailure
          ? 'bg-red-100 text-red-700 border-red-300'
          : isTerminalCancel
            ? 'bg-amber-100 text-amber-700 border-amber-300'
            : isActive
              ? 'bg-blue-100 text-blue-700 border-blue-300 ring-2 ring-blue-200 ring-offset-1 animate-pulse'
              : isPassed
                ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                : 'bg-gray-50 text-gray-400 border-gray-200';

        return (
          <React.Fragment key={phase.key}>
            <div
              title={phase.description}
              className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border cursor-help transition-all ${color}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-semibold truncate">{phase.label}</span>
            </div>
            {i < PHASES.length - 1 && (
              <div className={`h-px w-2 ${isPassed ? 'bg-emerald-300' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/**
 * Produce a human-readable sentence about what the job is doing RIGHT NOW.
 * The user shouldn't have to interpret "phase: enumerating" — tell them plainly.
 */
function buildStatusLine(job) {
  if (!job) return { title: '', detail: '' };

  const dirLabel = DIRECTION_LABEL[job.direction] || '';

  if (job.state === 'completed') {
    return {
      title: 'Backup finished successfully.',
      detail: `${job.migrated} files copied, ${job.skipped} were already at the destination, ${job.failed} failed.`,
    };
  }
  if (job.state === 'cancelled') {
    return {
      title: 'Backup was cancelled.',
      detail: `${job.migrated} files had already been copied before cancellation.`,
    };
  }
  if (job.state === 'failed') {
    return {
      title: 'Backup stopped due to an error.',
      detail: job.errorMessage || 'See the log for details.',
    };
  }

  // Running / queued — describe the phase
  switch (job.phase) {
    case 'enumerating':
      return {
        title: `Discovering files (${dirLabel.split(' → ')[0]})…`,
        detail: "Listing every object in the source bucket. For large buckets this can take a while — no files are being touched yet.",
      };
    case 'copying': {
      const tail = job.total > 0 ? ` (${job.migrated + job.skipped + job.failed} of ${job.total})` : '';
      return {
        title: `Copying files${tail}`,
        detail: "For each file: check if the destination already has it. If yes → skip. If no → download from source and re-upload to destination.",
      };
    }
    case 'finalizing':
      return {
        title: 'Finalizing backup…',
        detail: 'Writing the migration log and recording the audit entry. Almost done.',
      };
    case 'done':
      return { title: 'Done.', detail: '' };
    default:
      return { title: 'Preparing…', detail: '' };
  }
}

function CounterCard({ label, value, subtitle, icon: Icon, color, tip }) {
  const palette = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', value: 'text-emerald-900', icon: 'text-emerald-500' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', value: 'text-gray-800', icon: 'text-gray-400' },
    red: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', value: 'text-red-900', icon: 'text-red-500' },
  }[color] || {};

  return (
    <div className={`p-3 ${palette.bg} ${palette.border} border rounded-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${palette.icon}`} />
          <p className={`text-[11px] font-medium uppercase tracking-wide ${palette.text}`}>{label}</p>
        </div>
        <InfoTip>{tip}</InfoTip>
      </div>
      <p className={`text-xl font-bold mt-1 ${palette.value}`}>{value ?? 0}</p>
      <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>
    </div>
  );
}

function InfoTip({ children }) {
  // Native title attribute — no extra dependency. Shows on hover universally.
  return (
    <span title={typeof children === 'string' ? children : ''} className="inline-flex">
      <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
    </span>
  );
}
