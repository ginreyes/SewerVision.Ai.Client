'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DEVICE_STATUSES = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'decommissioned', label: 'Decommissioned' },
];

export default function BulkDeviceStatusModal({
  open,
  onClose,
  selectedCount,
  isPending = false,
  onConfirm,
}) {
  const [status, setStatus] = useState('online');

  const handleConfirm = () => {
    if (!status) return;
    onConfirm({ status });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose?.() : null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change device status</DialogTitle>
          <DialogDescription>
            Apply a new status to {selectedCount} device{selectedCount === 1 ? '' : 's'}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label htmlFor="bulk-device-status-select">New status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="bulk-device-status-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEVICE_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
