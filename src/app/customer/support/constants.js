import {
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const TICKET_STATUS_COLORS = {
  open: 'bg-amber-100 text-amber-700 border-amber-200',
  'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
  resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
};

export const TICKET_STATUS_ICONS = {
  open: AlertCircle,
  'in-progress': Clock,
  resolved: CheckCircle,
  closed: XCircle,
};

export const TICKET_CATEGORIES = [
  { value: 'report', label: 'Report Issue' },
  { value: 'project', label: 'Project Inquiry' },
  { value: 'account', label: 'Account Help' },
  { value: 'billing', label: 'Billing' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'other', label: 'Other' },
];

export const COMPLAINT_STATUS_COLORS = {
  new: 'bg-amber-100 text-amber-700 border-amber-200',
  investigating: 'bg-blue-100 text-blue-700 border-blue-200',
  'action-required': 'bg-orange-100 text-orange-700 border-orange-200',
  resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  dismissed: 'bg-gray-100 text-gray-600 border-gray-200',
};

export const COMPLAINT_STATUS_LABELS = {
  new: 'Submitted',
  investigating: 'Under Review',
  'action-required': 'Action Required',
  resolved: 'Resolved',
  dismissed: 'Closed',
};

export const COMPLAINT_STATUS_ICONS = {
  new: AlertCircle,
  investigating: Clock,
  'action-required': AlertCircle,
  resolved: CheckCircle,
  dismissed: XCircle,
};

export const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-green-100 text-green-700',
};

export const COMPLAINT_CATEGORIES = [
  { value: 'service', label: 'Service Issue' },
  { value: 'billing', label: 'Billing Problem' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'delivery', label: 'Delivery Problem' },
  { value: 'quality', label: 'Quality Concern' },
  { value: 'communication', label: 'Communication Issue' },
  { value: 'other', label: 'Other' },
];

export const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low — Minor inconvenience' },
  { value: 'medium', label: 'Medium — Noticeable impact' },
  { value: 'high', label: 'High — Significant impact' },
  { value: 'critical', label: 'Critical — Urgent attention needed' },
];
