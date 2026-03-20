/** Shared constants for the customer-rep role modules */

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

export const CATEGORY_COLORS = {
  report: "text-blue-600",
  project: "text-teal-600",
  account: "text-purple-600",
  billing: "text-amber-600",
  feature: "text-emerald-600",
  complaint: "text-red-600",
  other: "text-gray-600",
};

export const getUserName = (user) => {
  if (!user) return "Unknown";
  if (user.first_name) return `${user.first_name} ${user.last_name || ""}`.trim();
  return user.email || user.username || "Unknown";
};

export const getInitials = (user) => {
  if (!user) return "?";
  const f = user.first_name?.[0] || "";
  const l = user.last_name?.[0] || "";
  return (f + l).toUpperCase() || user.email?.[0]?.toUpperCase() || "?";
};

export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const AVATAR_COLORS = [
  "bg-teal-500", "bg-blue-500", "bg-purple-500", "bg-rose-500",
  "bg-amber-500", "bg-emerald-500", "bg-indigo-500", "bg-cyan-500",
];

export const getAvatarColor = (id) => {
  if (!id) return AVATAR_COLORS[0];
  const hash = id.toString().split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};
