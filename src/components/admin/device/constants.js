import {
  Camera,
  Smartphone,
  Tablet,
  Monitor,
  Brain,
  Cloud,
  FileText,
  CheckCircle,
  Clock,
  Upload as UploadIcon,
} from "lucide-react";

export const DEVICE_ICON_BY_TYPE = {
  camera: Camera,
  tablet: Tablet,
  smartphone: Smartphone,
  console: Monitor,
  "ai-server": Brain,
  storage: Cloud,
  workstation: FileText,
  scanner: Smartphone,
  default: Monitor,
};

export const getDeviceIcon = (type) =>
  DEVICE_ICON_BY_TYPE[(type || "").toLowerCase()] || DEVICE_ICON_BY_TYPE.default;

export const DEVICE_COLOR_BY_TYPE = {
  camera: "bg-gradient-to-br from-blue-500 to-purple-600",
  tablet: "bg-gradient-to-br from-green-500 to-emerald-600",
  smartphone: "bg-gradient-to-br from-gray-500 to-gray-700",
  console: "bg-gradient-to-br from-orange-500 to-red-600",
  "ai-server": "bg-gradient-to-br from-purple-500 to-pink-600",
  storage: "bg-gradient-to-br from-blue-500 to-cyan-600",
  workstation: "bg-gradient-to-br from-indigo-500 to-blue-600",
  default: "bg-gradient-to-br from-gray-400 to-gray-600",
};

export const getDeviceColor = (type) =>
  DEVICE_COLOR_BY_TYPE[(type || "").toLowerCase()] || DEVICE_COLOR_BY_TYPE.default;

export const DEVICE_STATUS_TEXT_COLOR = {
  online: "text-green-600 dark:text-green-400",
  recording: "text-red-600 dark:text-red-400",
  processing: "text-amber-600 dark:text-amber-400",
  uploading: "text-blue-600 dark:text-blue-400",
  active: "text-green-600 dark:text-green-400",
  offline: "text-gray-500 dark:text-gray-400",
  completed: "text-purple-600 dark:text-purple-400",
};

export const getDeviceStatusColor = (status) =>
  DEVICE_STATUS_TEXT_COLOR[status] || "text-gray-500 dark:text-gray-400";

/** Render a small status icon element from a status string */
export function renderDeviceStatusIcon(status) {
  switch (status) {
    case "recording":
      return (
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-hidden />
      );
    case "processing":
      return <Clock className="w-4 h-4 text-amber-500 animate-spin" aria-hidden />;
    case "uploading":
      return <UploadIcon className="w-4 h-4 text-blue-500" aria-hidden />;
    case "completed":
      return <CheckCircle className="w-4 h-4 text-purple-500" aria-hidden />;
    case "online":
    case "active":
      return <div className="w-2 h-2 bg-green-500 rounded-full" aria-hidden />;
    default:
      return <div className="w-2 h-2 bg-gray-400 rounded-full" aria-hidden />;
  }
}

export function formatLastSeen(lastSeen) {
  if (!lastSeen || lastSeen === "Never") return "Never";
  try {
    const d = new Date(lastSeen);
    if (Number.isNaN(d.getTime())) return lastSeen;
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} h ago`;
    if (diffDays < 7) return `${diffDays} d ago`;
    return d.toLocaleDateString();
  } catch {
    return String(lastSeen);
  }
}

export function teamLeaderLabel(device) {
  const tl = device?.teamLeader;
  if (!tl) return "Unassigned";
  if (typeof tl === "object") {
    return (
      [tl.first_name, tl.last_name].filter(Boolean).join(" ") ||
      tl.username ||
      "Team Leader"
    );
  }
  return "Unassigned";
}
