export const STATUS_COLORS = {
  open: 'bg-amber-100 text-amber-700 border-amber-200',
  'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
  resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
};

export const PRIORITY_COLORS = {
  low: 'text-green-600',
  medium: 'text-amber-600',
  high: 'text-red-600',
};

export const FILTER_OPTIONS = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { label: 'All', value: 'all' },
      { label: 'Open', value: 'open' },
      { label: 'In Progress', value: 'in-progress' },
      { label: 'Resolved', value: 'resolved' },
      { label: 'Closed', value: 'closed' },
    ],
  },
  {
    key: 'priority',
    label: 'Priority',
    options: [
      { label: 'All', value: 'all' },
      { label: 'High', value: 'high' },
      { label: 'Medium', value: 'medium' },
      { label: 'Low', value: 'low' },
    ],
  },
];

export const TABLE_COLUMNS = [
  { key: 'subject', name: 'Subject' },
  { key: 'customer', name: 'Customer' },
  { key: 'assignedTo', name: 'Assigned To' },
  { key: 'category', name: 'Category' },
  { key: 'priority', name: 'Priority' },
  { key: 'status', name: 'Status' },
  { key: 'createdAt', name: 'Created' },
];
