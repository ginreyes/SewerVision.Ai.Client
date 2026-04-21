'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const SLABadge = ({ hoursInStage, targetHours, isOverdue, percentUsed }) => {
  if (targetHours === Infinity) return null;

  let config;
  if (isOverdue) {
    config = { icon: AlertTriangle, className: 'bg-red-100 text-red-700 border-red-200', label: 'Overdue' };
  } else if (percentUsed > 75) {
    config = { icon: Clock, className: 'bg-amber-100 text-amber-700 border-amber-200', label: `${Math.round(targetHours - hoursInStage)}h left` };
  } else {
    config = { icon: CheckCircle, className: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'On Track' };
  }

  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`text-[10px] gap-0.5 ${config.className}`}>
      <Icon className="w-2.5 h-2.5" />
      {config.label}
    </Badge>
  );
};

export default SLABadge;
