'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { X, ArrowRight, Loader2, CheckSquare } from 'lucide-react';
import { useBatchUpdateStatus, useBatchAssign } from '@/data/pipelineApi';
import { useAlert } from '@/components/providers/AlertProvider';
import { useUser } from '@/components/providers/UserContext';

const STATUSES = [
  { value: 'planning', label: 'Planning' },
  { value: 'field-capture', label: 'Field Capture' },
  { value: 'uploading', label: 'Uploading' },
  { value: 'ai-processing', label: 'AI Processing' },
  { value: 'qc-review', label: 'QC Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'customer-notified', label: 'Customer Notified' },
];

const BulkActionsToolbar = ({ selectedIds, onClear }) => {
  const { showAlert } = useAlert();
  const { userId } = useUser();
  const batchStatus = useBatchUpdateStatus();
  const batchAssign = useBatchAssign();

  const count = selectedIds.length;
  if (count === 0) return null;

  const handleStatusChange = (status) => {
    batchStatus.mutate(
      { projectIds: selectedIds, status, userId },
      {
        onSuccess: (res) => {
          if (res?.ok) {
            showAlert(`${count} project(s) moved to ${status}`, 'success');
            onClear();
          } else {
            showAlert(res?.data?.message || 'Failed to update', 'error');
          }
        },
        onError: () => showAlert('Failed to update status', 'error'),
      }
    );
  };

  const isPending = batchStatus.isPending || batchAssign.isPending;

  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 shadow-sm">
      <Badge className="bg-rose-600 text-white text-xs px-3 py-1">
        <CheckSquare className="w-3 h-3 mr-1" />
        {count} selected
      </Badge>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" disabled={isPending}>
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
            Move to…
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {STATUSES.map((s) => (
            <DropdownMenuItem key={s.value} onClick={() => handleStatusChange(s.value)}>
              {s.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1" />

      <Button size="sm" variant="ghost" onClick={onClear} className="text-xs text-gray-600 gap-1">
        <X className="w-3 h-3" /> Clear
      </Button>
    </div>
  );
};

export default BulkActionsToolbar;
