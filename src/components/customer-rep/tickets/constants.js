import { AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";

export const STATUS_ICONS = {
  open: AlertCircle,
  "in-progress": Clock,
  resolved: CheckCircle,
  closed: XCircle,
};

export const STATUS_COLORS = {
  open: "bg-amber-100 text-amber-700 border-amber-200",
  "in-progress": "bg-blue-100 text-blue-700 border-blue-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200",
};

export const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-red-100 text-red-700 border-red-200",
};

export const FILTER_OPTIONS = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "All", value: "all" },
      { label: "Open", value: "open" },
      { label: "In Progress", value: "in-progress" },
      { label: "Resolved", value: "resolved" },
      { label: "Closed", value: "closed" },
    ],
  },
  {
    key: "priority",
    label: "Priority",
    options: [
      { label: "All", value: "all" },
      { label: "High", value: "high" },
      { label: "Medium", value: "medium" },
      { label: "Low", value: "low" },
    ],
  },
];

export const COLUMNS = [
  { key: "subject", name: "Subject" },
  { key: "customer", name: "Customer" },
  { key: "category", name: "Category" },
  { key: "priority", name: "Priority" },
  { key: "status", name: "Status" },
  { key: "responses", name: "Replies" },
  { key: "createdAt", name: "Created" },
];

export const COLUMN_DEFAULTS = {
  subject: 220,
  customer: 150,
  category: 110,
  priority: 100,
  status: 120,
  responses: 80,
  createdAt: 130,
};
