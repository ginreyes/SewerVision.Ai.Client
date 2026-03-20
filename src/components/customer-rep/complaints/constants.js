import {
  AlertCircle,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  ShieldAlert,
} from "lucide-react";

export const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Investigating", value: "investigating" },
  { label: "Action Required", value: "action-required" },
  { label: "Resolved", value: "resolved" },
  { label: "Dismissed", value: "dismissed" },
];

export const SEVERITY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

export const CATEGORY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Service", value: "service" },
  { label: "Billing", value: "billing" },
  { label: "Technical", value: "technical" },
  { label: "Delivery", value: "delivery" },
  { label: "Quality", value: "quality" },
  { label: "Communication", value: "communication" },
  { label: "Other", value: "other" },
];

export const SOURCE_OPTIONS = [
  { label: "Phone", value: "phone" },
  { label: "Email", value: "email" },
  { label: "Walk-in", value: "walk-in" },
  { label: "Social Media", value: "social-media" },
  { label: "Portal", value: "portal" },
  { label: "Other", value: "other" },
];

export const STATUS_ICONS = {
  new: AlertCircle,
  investigating: Search,
  "action-required": ShieldAlert,
  resolved: CheckCircle,
  dismissed: XCircle,
};

export const STATUS_COLORS = {
  new: "bg-amber-100 text-amber-700 border-amber-200",
  investigating: "bg-blue-100 text-blue-700 border-blue-200",
  "action-required": "bg-red-100 text-red-700 border-red-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  dismissed: "bg-gray-100 text-gray-600 border-gray-200",
};

export const SEVERITY_COLORS = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

export const CATEGORY_COLORS = {
  service: "text-teal-600 bg-teal-50",
  billing: "text-amber-600 bg-amber-50",
  technical: "text-blue-600 bg-blue-50",
  delivery: "text-purple-600 bg-purple-50",
  quality: "text-rose-600 bg-rose-50",
  communication: "text-indigo-600 bg-indigo-50",
  other: "text-gray-600 bg-gray-50",
};

export const SOURCE_COLORS = {
  phone: "text-green-600 bg-green-50",
  email: "text-blue-600 bg-blue-50",
  "walk-in": "text-purple-600 bg-purple-50",
  "social-media": "text-pink-600 bg-pink-50",
  portal: "text-teal-600 bg-teal-50",
  other: "text-gray-600 bg-gray-50",
};

export const COLUMNS = [
  { key: "title", name: "Title" },
  { key: "customer", name: "Customer" },
  { key: "category", name: "Category" },
  { key: "severity", name: "Severity" },
  { key: "status", name: "Status" },
  { key: "source", name: "Source" },
  { key: "createdAt", name: "Created" },
];

export const COLUMN_DEFAULTS = {
  title: 220,
  customer: 150,
  category: 110,
  severity: 100,
  status: 130,
  source: 100,
  createdAt: 130,
};

export const FILTER_OPTIONS = [
  {
    key: "status",
    label: "Status",
    options: STATUS_OPTIONS,
  },
  {
    key: "severity",
    label: "Severity",
    options: SEVERITY_OPTIONS,
  },
];
