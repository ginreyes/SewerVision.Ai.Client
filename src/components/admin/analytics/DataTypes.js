/**
 * Analytics module seed/default data.
 * Replace with API calls when live endpoints are available.
 */

export const MONTHLY_PROJECTS = [65, 78, 55, 90, 102, 88, 110, 95, 120, 105, 130, 118];
export const AI_ACCURACY = [81, 83, 85, 84, 87, 89, 88, 91, 90, 93, 92, 94];

export const KPI_METRICS = [
  { key: 'projects', label: 'Total Projects', value: '1,248', trend: '+12%', iconName: 'FolderOpen', color: 'text-rose-600', bg: 'bg-rose-50', up: true },
  { key: 'users', label: 'Active Users', value: '342', trend: '+8%', iconName: 'Users', color: 'text-blue-600', bg: 'bg-blue-50', up: true },
  { key: 'completed', label: 'Completed', value: '894', trend: '+15%', iconName: 'CheckCircle2', color: 'text-emerald-600', bg: 'bg-emerald-50', up: true },
  { key: 'duration', label: 'Avg Duration', value: '4.2d', trend: '-6%', iconName: 'Clock', color: 'text-amber-600', bg: 'bg-amber-50', up: false },
];

export const TEAM_PRODUCTIVITY = [
  { name: 'QC Team', score: 94, completed: 312, avg: '3.1d' },
  { name: 'Operators', score: 87, completed: 445, avg: '4.8d' },
  { name: 'Team Leads', score: 91, completed: 137, avg: '2.5d' },
  { name: 'Support Reps', score: 89, completed: 1204, avg: '1.2d' },
];
