"use client";

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-center space-x-4 mb-6">
    <div className="p-2 bg-blue-100 rounded-lg">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

export const ToggleSetting = ({ label, description, checked, onCheckedChange }) => (
  <div className="flex items-center justify-between py-4">
    <div className="space-y-0.5">
      <Label className="text-base font-medium text-gray-900">{label}</Label>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

export const ProfileStats = ({ stats }) => (
  <div className="grid grid-cols-4 gap-3 py-4">
    {[
      { label: 'Inspections', value: stats.inspections, icon: '🔍', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
      { label: 'Uploads', value: stats.uploads, icon: '📤', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
      { label: 'Completion', value: `${stats.completionRate}%`, icon: '✅', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100' },
      { label: 'Hours', value: stats.hours, icon: '⏱️', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
    ].map((s) => (
      <div key={s.label} className={`text-center p-4 ${s.bg} rounded-xl border ${s.border}`}>
        <p className="text-lg mb-1">{s.icon}</p>
        <p className={`text-xl font-bold ${s.text}`}>{s.value}</p>
        <p className="text-[10px] text-gray-500 font-medium mt-0.5">{s.label}</p>
      </div>
    ))}
  </div>
);
