import {
  Archive,
  ArchiveRestore,
  Download,
  Tag,
  Trash2,
  UserCheck,
  ShieldAlert,
  MailPlus,
  RefreshCw,
  CircleOff,
  Flag,
  CheckCircle,
} from "lucide-react";

/**
 * Registry of bulk actions per entity. Each entry describes a single row in
 * the BulkActionBar; `op` maps to the backend `op` field, `destructive`
 * drives the confirm modal, `permission` is a role-name list for gating.
 *
 * Keeping icons + labels + ops in one place here (not inlined in the bar)
 * means new ops can be added without touching BulkActionBar.jsx.
 */
export const BULK_ACTIONS = {
  project: [
    { op: "assign", label: "Assign operator", icon: UserCheck, requiresPayload: true },
    { op: "status", label: "Change status", icon: RefreshCw, requiresPayload: true },
    { op: "tag", label: "Add tag", icon: Tag, requiresPayload: true },
    { op: "archive", label: "Archive", icon: Archive },
    { op: "unarchive", label: "Unarchive", icon: ArchiveRestore },
    { op: "export", label: "Export CSV", icon: Download, clientOnly: true },
    { op: "delete", label: "Delete", icon: Trash2, destructive: true },
  ],
  user: [
    { op: "role", label: "Change role", icon: ShieldAlert, requiresPayload: true },
    { op: "deactivate", label: "Deactivate", icon: CircleOff, destructive: true },
    { op: "resend-invite", label: "Resend invite", icon: MailPlus },
    { op: "export", label: "Export CSV", icon: Download, clientOnly: true },
  ],
  report: [
    { op: "status", label: "Change status", icon: RefreshCw, requiresPayload: true },
    { op: "reassign", label: "Reassign reviewer", icon: UserCheck, requiresPayload: true },
    { op: "export", label: "Export PDF", icon: Download, clientOnly: true },
  ],
  ticket: [
    { op: "priority", label: "Change priority", icon: Flag, requiresPayload: true },
    { op: "reassign", label: "Reassign", icon: UserCheck, requiresPayload: true },
    { op: "close", label: "Close tickets", icon: CircleOff, destructive: true },
  ],
  device: [
    { op: "status", label: "Change status", icon: RefreshCw, requiresPayload: true },
    { op: "unassign", label: "Unassign", icon: CircleOff },
    { op: "export", label: "Export CSV", icon: Download, clientOnly: true },
    { op: "delete", label: "Delete", icon: Trash2, destructive: true },
  ],
  upload: [
    { op: "approve", label: "Mark approved", icon: CheckCircle, requiresPayload: false },
    { op: "archive", label: "Archive", icon: Archive },
    { op: "export", label: "Export CSV", icon: Download, clientOnly: true },
    { op: "delete", label: "Delete", icon: Trash2, destructive: true },
  ],
};

export function getBulkActions(entity) {
  return BULK_ACTIONS[entity] || [];
}
