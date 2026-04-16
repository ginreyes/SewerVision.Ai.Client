/**
 * Static command/action registry, grouped by role.
 * These are the "always available" actions that don't require a search query.
 * Dynamic entity search (projects/users/reports) comes from the backend.
 */

import {
  LayoutDashboard,
  FolderKanban,
  Users,
  ClipboardList,
  Bell,
  Settings,
  MapPin,
  Upload,
  Video,
  FileText,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Plus,
  RefreshCw,
  Calendar,
  BarChart3,
  Wrench,
  Ticket,
  AlertTriangle,
  MessageSquare,
  GraduationCap,
  Award,
  BookOpen,
  GitBranch,
  Columns3,
  Shield,
  Activity,
} from 'lucide-react';

// ─── Navigation commands per role ──────────────────────────────────────────

const NAV_ADMIN = [
  { id: 'nav-admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', group: 'Navigation' },
  { id: 'nav-admin-projects', label: 'Projects', icon: FolderKanban, path: '/admin/project', group: 'Navigation' },
  { id: 'nav-admin-users', label: 'Users', icon: Users, path: '/admin/users', group: 'Navigation' },
  { id: 'nav-admin-uploads', label: 'Uploads', icon: Upload, path: '/admin/uploads', group: 'Navigation' },
  { id: 'nav-admin-devices', label: 'Devices', icon: Wrench, path: '/admin/devices', group: 'Navigation' },
  { id: 'nav-admin-calendar', label: 'Calendar', icon: Calendar, path: '/admin/calendar', group: 'Navigation' },
  { id: 'nav-admin-audit', label: 'Audit Log', icon: Shield, path: '/admin/audit-log', group: 'Navigation' },
  { id: 'nav-admin-system', label: 'System Management', icon: Activity, path: '/admin/system-management', group: 'Navigation' },
  { id: 'nav-admin-email', label: 'Email Templates', icon: FileText, path: '/admin/email-templates', group: 'Navigation' },
  { id: 'nav-admin-settings', label: 'Settings', icon: Settings, path: '/admin/settings', group: 'Navigation' },
];

const NAV_OPERATOR = [
  { id: 'nav-op-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/operator/dashboard', group: 'Navigation' },
  { id: 'nav-op-projects', label: 'Projects', icon: FolderKanban, path: '/operator/project', group: 'Navigation' },
  { id: 'nav-op-calendar', label: 'Calendar', icon: Calendar, path: '/operator/calendar', group: 'Navigation' },
  { id: 'nav-op-routes', label: 'Route Planner', icon: MapPin, path: '/operator/route-planner', group: 'Navigation' },
  { id: 'nav-op-analytics', label: 'Analytics', icon: BarChart3, path: '/operator/analytics', group: 'Navigation' },
  { id: 'nav-op-settings', label: 'Settings', icon: Settings, path: '/operator/settings', group: 'Navigation' },
];

const NAV_QC = [
  { id: 'nav-qc-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/qc-technician/dashboard', group: 'Navigation' },
  { id: 'nav-qc-review', label: 'Review Queue', icon: ClipboardList, path: '/qc-technician/review-queue', group: 'Navigation' },
  { id: 'nav-qc-quality', label: 'Quality Control', icon: Shield, path: '/qc-technician/quality-control', group: 'Navigation' },
  { id: 'nav-qc-reports', label: 'Reports', icon: FileText, path: '/qc-technician/reports', group: 'Navigation' },
  { id: 'nav-qc-training', label: 'Training', icon: GraduationCap, path: '/qc-technician/training', group: 'Navigation' },
  { id: 'nav-qc-certs', label: 'Certifications', icon: Award, path: '/qc-technician/certifications', group: 'Navigation' },
  { id: 'nav-qc-devices', label: 'Devices', icon: Wrench, path: '/qc-technician/devices', group: 'Navigation' },
  { id: 'nav-qc-settings', label: 'Settings', icon: Settings, path: '/qc-technician/settings', group: 'Navigation' },
];

const NAV_USER = [
  { id: 'nav-u-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/user/dashboard', group: 'Navigation' },
  { id: 'nav-u-projects', label: 'Projects', icon: FolderKanban, path: '/user/project', group: 'Navigation' },
  { id: 'nav-u-team', label: 'Team', icon: Users, path: '/user/team', group: 'Navigation' },
  { id: 'nav-u-devices', label: 'Device Assignments', icon: Wrench, path: '/user/device-assignments', group: 'Navigation' },
  { id: 'nav-u-client', label: 'Client Hub', icon: MessageSquare, path: '/user/client-hub', group: 'Navigation' },
  { id: 'nav-u-notes', label: 'Notes', icon: BookOpen, path: '/user/notes', group: 'Navigation' },
  { id: 'nav-u-training', label: 'Training', icon: GraduationCap, path: '/user/training', group: 'Navigation' },
  { id: 'nav-u-settings', label: 'Settings', icon: Settings, path: '/user/settings', group: 'Navigation' },
];

const NAV_CUSTOMER = [
  { id: 'nav-c-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/customer/dashboard', group: 'Navigation' },
  { id: 'nav-c-projects', label: 'Projects', icon: FolderKanban, path: '/customer/projects', group: 'Navigation' },
  { id: 'nav-c-support', label: 'Support', icon: HelpCircle, path: '/customer/support', group: 'Navigation' },
  { id: 'nav-c-notifications', label: 'Notifications', icon: Bell, path: '/customer/notifications', group: 'Navigation' },
  { id: 'nav-c-settings', label: 'Settings', icon: Settings, path: '/customer/settings', group: 'Navigation' },
];

const NAV_CUSTOMER_REP = [
  { id: 'nav-cr-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/customer-rep/dashboard', group: 'Navigation' },
  { id: 'nav-cr-tickets', label: 'Tickets', icon: Ticket, path: '/customer-rep/tickets', group: 'Navigation' },
  { id: 'nav-cr-complaints', label: 'Complaints', icon: AlertTriangle, path: '/customer-rep/complaints', group: 'Navigation' },
  { id: 'nav-cr-tasks', label: 'Tasks', icon: ClipboardList, path: '/customer-rep/tasks', group: 'Navigation' },
  { id: 'nav-cr-projects', label: 'Project Overview', icon: Columns3, path: '/customer-rep/projects/overview', group: 'Navigation' },
  { id: 'nav-cr-templates', label: 'Templates', icon: FileText, path: '/customer-rep/templates', group: 'Navigation' },
  { id: 'nav-cr-settings', label: 'Settings', icon: Settings, path: '/customer-rep/settings', group: 'Navigation' },
];

const NAV_BY_ROLE = {
  admin: NAV_ADMIN,
  operator: NAV_OPERATOR,
  'qc-technician': NAV_QC,
  user: NAV_USER,
  customer: NAV_CUSTOMER,
  'customer-rep': NAV_CUSTOMER_REP,
};

// ─── Action commands per role ──────────────────────────────────────────────

const ACTION_TOGGLE_THEME = {
  id: 'action-toggle-theme',
  label: 'Toggle Dark Mode',
  icon: Moon,
  group: 'Actions',
  // action is wired at use-site since it needs access to theme context
  actionType: 'toggle-theme',
};

const ACTION_LOGOUT = {
  id: 'action-logout',
  label: 'Sign Out',
  icon: LogOut,
  group: 'Actions',
  actionType: 'logout',
};

const ACTION_REFRESH = {
  id: 'action-refresh',
  label: 'Refresh Current Page',
  icon: RefreshCw,
  group: 'Actions',
  actionType: 'refresh',
};

const COMMON_ACTIONS = [ACTION_TOGGLE_THEME, ACTION_REFRESH, ACTION_LOGOUT];

const ACTIONS_BY_ROLE = {
  admin: [
    { id: 'action-new-project-admin', label: 'Create New Project', icon: Plus, group: 'Actions', path: '/admin/project/createProject' },
    ...COMMON_ACTIONS,
  ],
  operator: [...COMMON_ACTIONS],
  'qc-technician': [...COMMON_ACTIONS],
  user: [
    { id: 'action-new-project-user', label: 'Create New Project', icon: Plus, group: 'Actions', path: '/user/project/create' },
    ...COMMON_ACTIONS,
  ],
  customer: [...COMMON_ACTIONS],
  'customer-rep': [
    { id: 'action-new-ticket', label: 'Create New Ticket', icon: Plus, group: 'Actions', path: '/customer-rep/tickets' },
    ...COMMON_ACTIONS,
  ],
};

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Get all static commands (navigation + actions) for a given role.
 */
export function getStaticCommands(role) {
  if (!role) return [];
  return [
    ...(NAV_BY_ROLE[role] || []),
    ...(ACTIONS_BY_ROLE[role] || []),
  ];
}
