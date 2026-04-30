'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardCheck, MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '@/lib/helper';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';

/**
 * End-of-shift handoff modal. Pre-fills counts from the day's observations
 * (via /shift-handoff/today-stats) so the operator just adds context and
 * optionally picks the next operator. Submits to /shift-handoff which creates
 * the record and notifies the recipient.
 */
export default function ShiftHandoffModal({ open, onOpenChange, teamMembers = [], onComplete }) {
  const { userId } = useUser();
  const { showAlert } = useAlert();

  const [stats, setStats] = useState({ observationsCreated: 0, incidentsLogged: 0, projectIds: [] });
  const [loadingStats, setLoadingStats] = useState(false);
  const [notes, setNotes] = useState('');
  const [nextShiftFor, setNextShiftFor] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !userId) return;
    setNotes('');
    setNextShiftFor('');
    setLoadingStats(true);
    (async () => {
      try {
        const res = await api(`/api/operations/shift-handoff/today-stats?operatorId=${userId}`, 'GET');
        if (res.ok && res.data?.data) setStats(res.data.data);
      } catch {
        // Non-fatal — modal still functional with zeroes.
      } finally {
        setLoadingStats(false);
      }
    })();
  }, [open, userId]);

  const handleSubmit = async () => {
    if (!userId || submitting) return;
    setSubmitting(true);
    try {
      const res = await api('/api/operations/shift-handoff', 'POST', {
        operatorId: userId,
        shiftEnd: new Date().toISOString(),
        projectIds: stats.projectIds,
        observationsCreated: stats.observationsCreated,
        incidentsLogged: stats.incidentsLogged,
        notes,
        nextShiftFor: nextShiftFor || undefined,
      });
      if (!res.ok) throw new Error(res.data?.message || 'Failed to save handoff');
      showAlert('Shift handoff saved', 'success');
      onOpenChange?.(false);
      onComplete?.();
    } catch (err) {
      showAlert(err?.message || 'Failed to save handoff', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-blue-600" />
            End of Shift
          </DialogTitle>
          <DialogDescription className="text-xs">
            Leave a quick summary so the next shift can pick up smoothly.
          </DialogDescription>
        </DialogHeader>

        {/* Today's running totals */}
        <div className="grid grid-cols-3 gap-2 py-2">
          <StatBox
            icon={MapPin}
            label="Observations"
            value={loadingStats ? '…' : stats.observationsCreated}
            color="blue"
          />
          <StatBox
            icon={AlertTriangle}
            label="Incidents"
            value={loadingStats ? '…' : stats.incidentsLogged}
            color="amber"
          />
          <StatBox
            icon={ClipboardCheck}
            label="Projects"
            value={loadingStats ? '…' : (stats.projectIds?.length || 0)}
            color="indigo"
          />
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="handoff-notes" className="text-sm">Notes for next shift</Label>
            <Textarea
              id="handoff-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Upstream MH-12 needs rebar repair before re-entry. Client called about access at 5pm."
              rows={4}
              className="mt-1 text-sm"
            />
          </div>

          {teamMembers.length > 0 && (
            <div>
              <Label className="text-sm">Hand off to (optional)</Label>
              <Select value={nextShiftFor || '__none__'} onValueChange={(v) => setNextShiftFor(v === '__none__' ? '' : v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="No one specific" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No one specific</SelectItem>
                  {teamMembers.map((m) => {
                    const id = m._id || m.id || m.user_id;
                    const name = m.name || [m.first_name, m.last_name].filter(Boolean).join(' ').trim() || m.username;
                    return (
                      <SelectItem key={id} value={String(id)}>{name}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange?.(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            End shift
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatBox({ icon: Icon, label, value, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };
  return (
    <div className={`rounded-lg border p-3 ${colorMap[color] || colorMap.blue}`}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold opacity-75">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}
