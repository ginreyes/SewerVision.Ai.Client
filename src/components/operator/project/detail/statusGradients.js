// Status-based gradient color maps for ProjectDetail
export const STATUS_GRADIENTS = {
  'planning': {
    banner: 'from-blue-50 via-indigo-50 to-blue-50',
    bannerBorder: 'border-blue-200',
    accent: 'blue',
    progressBg: 'from-blue-500 via-blue-600 to-indigo-600',
    text: 'text-blue-600',
    textGradient: 'from-blue-600 to-indigo-600',
    dot: 'bg-blue-400',
  },
  'in-progress': {
    banner: 'from-emerald-50 via-green-50 to-emerald-50',
    bannerBorder: 'border-emerald-200',
    accent: 'emerald',
    progressBg: 'from-emerald-500 via-green-500 to-teal-600',
    text: 'text-emerald-600',
    textGradient: 'from-emerald-600 to-teal-600',
    dot: 'bg-emerald-400',
  },
  'ai-processing': {
    banner: 'from-violet-50 via-purple-50 to-violet-50',
    bannerBorder: 'border-violet-200',
    accent: 'violet',
    progressBg: 'from-violet-500 via-purple-500 to-fuchsia-600',
    text: 'text-violet-600',
    textGradient: 'from-violet-600 to-fuchsia-600',
    dot: 'bg-violet-400',
  },
  'completed': {
    banner: 'from-amber-50 via-yellow-50 to-amber-50',
    bannerBorder: 'border-amber-200',
    accent: 'amber',
    progressBg: 'from-amber-500 via-yellow-500 to-orange-500',
    text: 'text-amber-600',
    textGradient: 'from-amber-600 to-orange-600',
    dot: 'bg-amber-400',
  },
  'on-hold': {
    banner: 'from-slate-50 via-gray-50 to-slate-50',
    bannerBorder: 'border-slate-200',
    accent: 'slate',
    progressBg: 'from-slate-500 via-gray-500 to-zinc-600',
    text: 'text-slate-600',
    textGradient: 'from-slate-600 to-zinc-600',
    dot: 'bg-slate-400',
  },
  'review': {
    banner: 'from-cyan-50 via-sky-50 to-cyan-50',
    bannerBorder: 'border-cyan-200',
    accent: 'cyan',
    progressBg: 'from-cyan-500 via-sky-500 to-blue-500',
    text: 'text-cyan-600',
    textGradient: 'from-cyan-600 to-blue-600',
    dot: 'bg-cyan-400',
  },
  'default': {
    banner: 'from-rose-50 via-pink-50 to-rose-50',
    bannerBorder: 'border-rose-200',
    accent: 'rose',
    progressBg: 'from-rose-500 via-pink-500 to-red-500',
    text: 'text-rose-600',
    textGradient: 'from-rose-600 to-pink-600',
    dot: 'bg-rose-400',
  },
};

export const getStatusGradient = (status) => {
  const key = (status || '').toLowerCase();
  return STATUS_GRADIENTS[key] || STATUS_GRADIENTS['default'];
};

// Simple color mapping for snapshot labels
export const SNAPSHOT_COLOR_MAP = {
  MWL: 'bg-purple-500',
  TFA: 'bg-orange-500',
  CM: 'bg-yellow-500',
  SAM: 'bg-purple-400',
  CRK: 'bg-red-500',
  RIN: 'bg-green-500',
  DEF: 'bg-blue-500',
  OBS: 'bg-gray-500',
};

export const getSnapshotColorFor = (label) => {
  if (!label) return 'bg-gray-400';
  const labelUpper = String(label).toUpperCase();
  for (const [key, color] of Object.entries(SNAPSHOT_COLOR_MAP)) {
    if (labelUpper.includes(key)) return color;
  }
  return 'bg-gray-400';
};

// Time formatting helper (seconds -> HH:MM:SS)
export const formatTime = (timeSec) => {
  if (!timeSec) return '00:00:00';
  const date = new Date(timeSec * 1000);
  return date.toISOString().substr(11, 8);
};

// File size helper
export const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
};
