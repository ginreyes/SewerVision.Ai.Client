export const CATEGORIES = [
  'PACP Defect Codes',
  'AI Detection Review',
  'Safety Protocols',
  'Report Writing',
  'Equipment Operation',
];

export const DIFFICULTY_CONFIG = {
  beginner: { label: 'Beginner', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '🌱' },
  intermediate: { label: 'Intermediate', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '⚡' },
  advanced: { label: 'Advanced', color: 'bg-red-100 text-red-700 border-red-200', icon: '🔥' },
};

export const ASSIGNMENT_STATUS_COLORS = {
  assigned: 'bg-blue-100 text-blue-700 border-blue-200',
  'in-progress': 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  overdue: 'bg-red-100 text-red-700 border-red-200',
};

export const EMPTY_QUESTION = {
  question: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
  explanation: '',
};
