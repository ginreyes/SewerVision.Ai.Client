export const AVATAR_COLORS = [
  "bg-teal-500", "bg-blue-500", "bg-purple-500", "bg-rose-500",
  "bg-amber-500", "bg-emerald-500", "bg-indigo-500", "bg-cyan-500",
];

export const getAvatarColor = (id) => {
  if (!id) return AVATAR_COLORS[0];
  const hash = id.toString().split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay < 7) return `${diffDay}d`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const getInitials = (user) => {
  if (!user) return "?";
  const f = user.first_name?.[0] || "";
  const l = user.last_name?.[0] || "";
  return (f + l).toUpperCase() || user.email?.[0]?.toUpperCase() || "?";
};

export const getUserName = (user) => {
  if (!user) return "Unknown";
  if (user.first_name) return `${user.first_name} ${user.last_name || ""}`.trim();
  return user.email || user.username || "Unknown";
};
