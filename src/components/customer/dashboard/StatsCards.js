'use client';

import {
  FolderOpen,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const cards = [
  {
    key: 'total',
    label: 'Total Projects',
    icon: FolderOpen,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    key: 'active',
    label: 'Active',
    icon: Activity,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: CheckCircle2,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    key: 'totalDefects',
    label: 'Total Defects',
    icon: AlertTriangle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
];

const StatsCards = ({ stats }) => {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4" data-tour="customer-stats">
      {cards.map(({ key, label, icon: Icon, iconBg, iconColor }) => (
        <Card key={key} className="relative overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`rounded-lg p-2.5 ${iconBg}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold">{stats[key] ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
