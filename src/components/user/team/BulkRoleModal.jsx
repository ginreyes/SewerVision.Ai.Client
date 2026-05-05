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

const TEAM_LEAD_ROLES = [
  { value: 'operator', label: 'Operator' },
  { value: 'qc-technician', label: 'QC Technician' },
];

export default function BulkRoleModal({
  open,
  onClose,
  selectedCount,
  isPending = false,
  onConfirm,
}) {
  const [role, setRole] = useState('operator');

  const handleConfirm = () => {
    if (!role) return;
    onConfirm({ role });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose?.() : null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change role</DialogTitle>
          <DialogDescription>
            Apply a new role to {selectedCount} team member{selectedCount === 1 ? '' : 's'}.
            Team leads can only assign Operator or QC Technician.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label htmlFor="bulk-role-select">New role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="bulk-role-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEAM_LEAD_ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
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
