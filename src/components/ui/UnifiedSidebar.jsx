'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  Mail,
  LayoutDashboard,
  FolderOpen,
  Calendar,
  CloudUpload,
  Upload,
  Monitor,
  ClipboardList,
  ClipboardCheck,
  BarChart2,
  StickyNote,
  BookOpen,
  Bell,
  Users,
  Settings,
  ChevronRight,
  ShieldCheck,
  SearchX,
  HardDrive,
  Link2,
  Wrench,
  FileText,
  Award,
  Inbox,
  Settings2,
  Ticket,
  Activity,
  MessageSquareWarning,
  Headphones,
  // New module icons
  BookMarked,
  UserCircle,
  AlertTriangle,
  Workflow,
  Star,
  Shield,
  CreditCard,
  Server,
  Megaphone,
  Navigation,
  WifiOff,
  AlertCircle,
  Clock,
  GraduationCap,
  Layers,
  Archive,
  CalendarDays,
  MessageCircle,
  TrendingUp,
  DollarSign,
  MapPin,
  Zap,
} from 'lucide-react';
import ModuleLoading from './SewerVisionLoadingAnimation';
import { useLoadingModuleSetting } from '@/hooks/useLoadingModuleSettings';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { api } from '@/lib/helper';

// ── Icon string → Lucide component map ──
const ICON_MAP = {
  LayoutDashboard,
  Mail,
  FolderOpen,
  Calendar,
  CloudUpload,
  Upload,
  Monitor,
  ClipboardList,
  ClipboardCheck,
  BarChart2,
  StickyNote,
  BookOpen,
  Bell,
  Users,
  Settings,
  Settings2,
  SearchX,
  HardDrive,
  Link2,
  Wrench,
  FileText,
  Award,
  Inbox,
  ShieldCheck,
  Ticket,
  Activity,
  MessageSquareWarning,
  Headphones,
  // New module icons
  BookMarked,
  UserCircle,
  AlertTriangle,
  Workflow,
  Star,
  Shield,
  CreditCard,
  Server,
  Megaphone,
  Navigation,
  WifiOff,
  AlertCircle,
  Clock,
  GraduationCap,
  Layers,
  Archive,
  CalendarDays,
  MessageCircle,
  TrendingUp,
  DollarSign,
  MapPin,
  Zap,
};

// ── Hardcoded admin sidebar (never filtered by permissions) ──
const ADMIN_MENU_GROUPS = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', icon: 'LayoutDashboard', path: '/admin/dashboard', module: 'dashboard' },
      { label: 'Projects', icon: 'FolderOpen', path: '/admin/project', module: 'projects' },
      { label: 'Calendar', icon: 'Calendar', path: '/admin/calendar', module: 'calendar' },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Users', icon: 'Users', path: '/admin/users', module: 'users' },
      { label: 'Uploads', icon: 'CloudUpload', path: '/admin/uploads', module: 'uploads' },
      { label: 'Devices', icon: 'Monitor', path: '/admin/devices', module: 'devices' },
      { label: 'Tasks', icon: 'ClipboardList', path: '/admin/task', module: 'tasks' },
      { label: 'Billing', icon: 'CreditCard', path: '/admin/billing', module: 'billing' },
      { label: 'Training Center', icon: 'GraduationCap', path: '/admin/training', module: 'admin-training' },
      { label: 'Announcements', icon: 'Megaphone', path: '/admin/announcements', module: 'announcements' },
    ],
  },
  {
    label: 'Records',
    items: [
      { label: 'Reports', icon: 'BarChart2', path: '/admin/report', module: 'reports' },
      { label: 'Notes', icon: 'StickyNote', path: '/admin/notes', module: 'notes' },
      { label: 'Support', icon: 'Inbox', path: '/admin/support', module: 'support' },
      { label: 'Analytics', icon: 'BarChart2', path: '/admin/analytics', module: 'analytics' },
      { label: 'AI Analytics', icon: 'Brain', path: '/admin/ai-analytics', key: 'ai-analytics' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'System Management', icon: 'Settings2', path: '/admin/system-management', module: 'system-management' },
      { label: 'Email Templates', icon: 'Mail', path: '/admin/email-templates', module: 'email-templates' },
      { label: 'Notifications', icon: 'Bell', path: '/admin/notifications', module: 'notifications' },
      { label: 'Settings', icon: 'Settings', path: '/admin/settings', module: 'settings' },
    ],
  },
];
const ROLE_THEMES = {
  admin: {
    gradient: 'from-rose-600 via-red-500 to-rose-700',
    activeBg: 'from-rose-50 to-red-50',
    activeText: 'text-rose-700',
    activeIcon: 'text-rose-600',
    activeBar: 'from-rose-500 to-red-500',
    hoverOverlay: 'group-hover:from-rose-500/5 group-hover:to-red-500/5',
    loaderColor: 'text-rose-500',
    chevronColor: 'text-rose-400',
    footerBg: 'from-rose-50 to-red-50',
    footerBorder: 'border-rose-200/50',
    footerText: 'text-rose-700',
    footerSub: 'text-rose-600/70',
    portal: 'Admin Console',
    title: 'Administrator',
    subtitle: 'Full System Access',
    footerIcon: ShieldCheck,
  },
  operator: {
    gradient: 'from-blue-600 via-indigo-500 to-blue-700',
    activeBg: 'from-blue-50 to-indigo-50',
    activeText: 'text-blue-700',
    activeIcon: 'text-blue-600',
    activeBar: 'from-blue-500 to-indigo-500',
    hoverOverlay: 'group-hover:from-blue-500/5 group-hover:to-indigo-500/5',
    loaderColor: 'text-blue-500',
    chevronColor: 'text-blue-400',
    footerBg: 'from-blue-50 to-indigo-50',
    footerBorder: 'border-blue-200/50',
    footerText: 'text-blue-700',
    footerSub: 'text-blue-600/70',
    portal: 'Operator Console',
    title: 'Operator',
    subtitle: 'Active Access',
  },
  'qc-technician': {
    gradient: 'from-red-700 via-red-600 to-amber-500',
    activeBg: 'from-amber-50 to-yellow-50',
    activeText: 'text-red-800',
    activeIcon: 'text-red-700',
    activeBar: 'from-red-700 to-amber-500',
    hoverOverlay: 'group-hover:from-red-500/5 group-hover:to-amber-500/5',
    loaderColor: 'text-red-600',
    chevronColor: 'text-red-600',
    footerBg: 'from-amber-50 to-yellow-50',
    footerBorder: 'border-amber-200/50',
    footerText: 'text-red-800',
    footerSub: 'text-amber-600/70',
    portal: 'QC Portal',
    title: 'QC Technician',
    subtitle: 'Active Access',
  },
  'customer-rep': {
    gradient: 'from-teal-600 via-cyan-500 to-teal-700',
    activeBg: 'from-teal-50 to-cyan-50',
    activeText: 'text-teal-700',
    activeIcon: 'text-teal-600',
    activeBar: 'from-teal-500 to-cyan-500',
    hoverOverlay: 'group-hover:from-teal-500/5 group-hover:to-cyan-500/5',
    loaderColor: 'text-teal-500',
    chevronColor: 'text-teal-400',
    footerBg: 'from-teal-50 to-cyan-50',
    footerBorder: 'border-teal-200/50',
    footerText: 'text-teal-700',
    footerSub: 'text-teal-600/70',
    portal: 'Support Console',
    title: 'Customer Rep',
    subtitle: 'Active Access',
  },
  user: {
    gradient: 'from-indigo-600 via-purple-500 to-indigo-700',
    activeBg: 'from-indigo-50 to-purple-50',
    activeText: 'text-indigo-700',
    activeIcon: 'text-indigo-600',
    activeBar: 'from-indigo-500 to-purple-500',
    hoverOverlay: 'group-hover:from-indigo-500/5 group-hover:to-purple-500/5',
    loaderColor: 'text-indigo-500',
    chevronColor: 'text-indigo-400',
    footerBg: 'from-indigo-50 to-purple-50',
    footerBorder: 'border-indigo-200/50',
    footerText: 'text-indigo-700',
    footerSub: 'text-indigo-600/70',
    portal: 'Team Console',
    title: 'Team Manager',
    subtitle: 'Active Access',
  },
  customer: {
    gradient: 'from-emerald-600 via-green-500 to-emerald-700',
    activeBg: 'from-emerald-50 to-green-50',
    activeText: 'text-emerald-700',
    activeIcon: 'text-emerald-600',
    activeBar: 'from-emerald-500 to-green-500',
    hoverOverlay: 'group-hover:from-emerald-500/5 group-hover:to-green-500/5',
    loaderColor: 'text-emerald-500',
    chevronColor: 'text-emerald-400',
    footerBg: 'from-emerald-50 to-green-50',
    footerBorder: 'border-emerald-200/50',
    footerText: 'text-emerald-700',
    footerSub: 'text-emerald-600/70',
    portal: 'Customer Portal',
    title: 'Customer',
    subtitle: 'Active Access',
  },
};

const FALLBACK_MENUS = {
  operator: [
    { label: 'Main', items: [
      { label: 'Dashboard', icon: 'LayoutDashboard', path: '/operator/dashboard', key: 'dashboard', locked: true },
      { label: 'Projects', icon: 'FolderOpen', path: '/operator/project', key: 'projects' },
      { label: 'Calendar', icon: 'Calendar', path: '/operator/calendar', key: 'calendar' },
    ]},
    { label: 'Field Work', items: [
      { label: 'Operations', icon: 'SearchX', path: '/operator/operations', key: 'operations' },
      { label: 'Checklists', icon: 'ClipboardCheck', path: '/operator/checklists', key: 'checklists' },
      { label: 'Route Planner', icon: 'Navigation', path: '/operator/route-planner', key: 'route-planner' },
      { label: 'Uploads', icon: 'Upload', path: '/operator/uploads', key: 'uploads' },
      { label: 'Tasks', icon: 'ClipboardList', path: '/operator/task', key: 'tasks' },
    ]},
    { label: 'Equipment', items: [
      { label: 'Equipment', icon: 'HardDrive', path: '/operator/equipement', key: 'equipment' },
      { label: 'Connect Device', icon: 'Link2', path: '/operator/connect-device', key: 'connect-device' },
      { label: 'Maintenance', icon: 'Wrench', path: '/operator/maintenance', key: 'maintenance' },
      { label: 'Offline Mode', icon: 'WifiOff', path: '/operator/offline', key: 'offline' },
    ]},
    { label: 'Records', items: [
      { label: 'Logs', icon: 'BookOpen', path: '/operator/logs', key: 'logs' },
      { label: 'Reports', icon: 'BarChart2', path: '/operator/reports', key: 'reports' },
      { label: 'Incidents', icon: 'AlertTriangle', path: '/operator/incidents', key: 'incidents' },
      { label: 'Time Tracking', icon: 'Clock', path: '/operator/time-tracking', key: 'time-tracking' },
      { label: 'Analytics', icon: 'BarChart2', path: '/operator/analytics', key: 'analytics' },
    ]},
    { label: 'Account', items: [
      { label: 'Notifications', icon: 'Bell', path: '/operator/notifications', key: 'notifications', locked: true },
      { label: 'Settings', icon: 'Settings', path: '/operator/settings', key: 'settings', locked: true },
    ]},
  ],
  'qc-technician': [
    { label: 'Main', items: [
      { label: 'Dashboard', icon: 'LayoutDashboard', path: '/qc-technician/dashboard', key: 'dashboard', locked: true },
      { label: 'Calendar', icon: 'Calendar', path: '/qc-technician/calendar', key: 'calendar' },
    ]},
    { label: 'Work', items: [
      { label: 'Tasks', icon: 'ClipboardList', path: '/qc-technician/task', key: 'tasks' },
      { label: 'Review Workspace', icon: 'ClipboardCheck', path: '/qc-technician/quality-control', key: 'quality-control' },
      { label: 'Review Templates', icon: 'FileText', path: '/qc-technician/review-templates', key: 'review-templates' },
      { label: 'Devices', icon: 'Monitor', path: '/qc-technician/devices', key: 'devices' },
    ]},
    { label: 'Knowledge', items: [
      { label: 'Defect Library', icon: 'BookMarked', path: '/qc-technician/defect-library', key: 'defect-library' },
      { label: 'Training', icon: 'GraduationCap', path: '/qc-technician/training', key: 'training' },
      { label: 'Review Analytics', icon: 'BarChart2', path: '/qc-technician/review-analytics', key: 'review-analytics' },
    ]},
    { label: 'Records', items: [
      { label: 'Reports', icon: 'FileText', path: '/qc-technician/reports', key: 'reports' },
      { label: 'Notes', icon: 'StickyNote', path: '/qc-technician/notes', key: 'notes' },
      { label: 'Certifications', icon: 'Award', path: '/qc-technician/certifications', key: 'certifications' },
    ]},
    { label: 'Account', items: [
      { label: 'Clock', icon: 'Clock', path: '/qc-technician/time-tracking', key: 'time-tracking' },
      { label: 'Notifications', icon: 'Bell', path: '/qc-technician/notifications', key: 'notifications', locked: true },
      { label: 'Settings', icon: 'Settings', path: '/qc-technician/settings', key: 'settings', locked: true },
    ]},
  ],
  user: [
    { label: 'Overview', items: [
      { label: 'Dashboard', icon: 'LayoutDashboard', path: '/user/dashboard', key: 'dashboard', locked: true },
      { label: 'My Projects', icon: 'FolderOpen', path: '/user/project', key: 'projects' },
      { label: 'Task Management', icon: 'ClipboardList', path: '/user/tasks', key: 'tasks' },
      { label: 'Notifications', icon: 'Bell', path: '/user/notifications', key: 'notifications' },
    ]},
    { label: 'Team & Assets', items: [
      { label: 'Team Management', icon: 'Users', path: '/user/team', key: 'team' },
      { label: 'Device Assignments', icon: 'Monitor', path: '/user/device-assignments', key: 'device-assignments' },
      { label: 'Resource Scheduler', icon: 'CalendarDays', path: '/user/resource-scheduler', key: 'resource-scheduler' },
      { label: 'Performance Reviews', icon: 'TrendingUp', path: '/user/performance-reviews', key: 'performance-reviews' },
    ]},
    { label: 'Management', items: [
      { label: 'Budget Tracker', icon: 'DollarSign', path: '/user/budget-tracker', key: 'budget-tracker' },
      { label: 'Project Templates', icon: 'Layers', path: '/user/project-templates', key: 'project-templates' },
      { label: 'Client Hub', icon: 'MessageCircle', path: '/user/client-hub', key: 'client-hub' },
    ]},
    { label: 'Tools & Settings', items: [
      { label: 'Training Center', icon: 'GraduationCap', path: '/user/training', key: 'training' },
      { label: 'Reports', icon: 'BarChart2', path: '/user/reports', key: 'reports' },
      { label: 'Notes', icon: 'StickyNote', path: '/user/notes', key: 'notes' },
      { label: 'Calendar', icon: 'Calendar', path: '/user/calendar', key: 'calendar' },
      { label: 'Time Tracking', icon: 'Clock', path: '/user/time-tracking', key: 'time-tracking' },
      { label: 'Settings', icon: 'Settings', path: '/user/settings', key: 'settings', locked: true },
    ]},
  ],
  customer: [
    { label: 'Main', items: [
      { label: 'Dashboard', icon: 'LayoutDashboard', path: '/customer/dashboard', key: 'dashboard', locked: true },
      { label: 'Projects', icon: 'FolderOpen', path: '/customer/projects', key: 'projects', locked: true },
      { label: 'Live Tracker', icon: 'MapPin', path: '/customer/live-tracker', key: 'live-tracker', locked: true },
      { label: 'Help Center', icon: 'Headphones', path: '/customer/support', key: 'customer-support', locked: true },
    ]},
    { label: 'Documents & Reports', items: [
      { label: 'Document Vault', icon: 'Archive', path: '/customer/document-vault', key: 'document-vault', locked: true },
      { label: 'Report Annotations', icon: 'MessageSquareWarning', path: '/customer/report-annotations', key: 'report-annotations', locked: true },
    ]},
    { label: 'Schedule', items: [
      { label: 'Appointments', icon: 'CalendarDays', path: '/customer/appointments', key: 'appointments', locked: true },
    ]},
    { label: 'Account', items: [
      { label: 'Dashboard Widgets', icon: 'LayoutDashboard', path: '/customer/dashboard-widgets', key: 'dashboard-widgets', locked: true },
      { label: 'Notifications', icon: 'Bell', path: '/customer/notifications', key: 'notifications', locked: true },
      { label: 'Settings', icon: 'Settings', path: '/customer/settings', key: 'settings', locked: true },
    ]},
  ],
  'customer-rep': [
    { label: 'Main', items: [
      { label: 'Dashboard', icon: 'LayoutDashboard', path: '/customer-rep/dashboard', key: 'dashboard', locked: true },
      { label: 'Projects', icon: 'FolderOpen', path: '/customer-rep/projects', key: 'projects' },
      { label: 'Inbox', icon: 'Inbox', path: '/customer-rep/inbox', key: 'inbox' },
    ]},
    { label: 'Support', items: [
      { label: 'Tickets', icon: 'Ticket', path: '/customer-rep/tickets', key: 'tickets' },
      { label: 'My Queue', icon: 'ClipboardCheck', path: '/customer-rep/tasks', key: 'tasks' },
      { label: 'Complaints', icon: 'MessageSquareWarning', path: '/customer-rep/complaints', key: 'rep-complaints' },
      { label: 'Templates', icon: 'FileText', path: '/customer-rep/templates', key: 'templates' },
      { label: 'Knowledge Base', icon: 'BookMarked', path: '/customer-rep/knowledge-base', key: 'knowledge-base' },
    ]},
    { label: 'Customers', items: [
      { label: 'Customer Profiles', icon: 'UserCircle', path: '/customer-rep/customer-profiles', key: 'customer-profiles' },
      { label: 'Escalations', icon: 'AlertTriangle', path: '/customer-rep/escalation', key: 'escalation' },
      { label: 'Workflows', icon: 'Workflow', path: '/customer-rep/workflows', key: 'workflows' },
      { label: 'Surveys', icon: 'Star', path: '/customer-rep/surveys', key: 'surveys' },
    ]},
    { label: 'Insights', items: [
      { label: 'Analytics', icon: 'BarChart2', path: '/customer-rep/analytics', key: 'analytics' },
      { label: 'Monitoring', icon: 'Activity', path: '/customer-rep/monitoring', key: 'monitoring' },
    ]},
    { label: 'Team', items: [
      { label: 'Team', icon: 'Users', path: '/customer-rep/team', key: 'team' },
    ]},
    { label: 'Account', items: [
      { label: 'Clock', icon: 'Clock', path: '/customer-rep/time-tracking', key: 'time-tracking' },
      { label: 'Notifications', icon: 'Bell', path: '/customer-rep/notifications', key: 'notifications', locked: true },
      { label: 'Settings', icon: 'Settings', path: '/customer-rep/settings', key: 'settings', locked: true },
    ]},
  ],
};

// ── Loading module setting keys per role ──
const LOADING_KEYS = {
  admin: 'admin',
  operator: 'operator',
  'qc-technician': 'qcTechnician',
  user: 'user',
  customer: 'customer',
  'customer-rep': 'customerRep',
};

const UnifiedSidebar = ({ isOpen, role, displayName }) => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [loadingItem, setLoadingItem] = useState(null);
  const showLoading = useLoadingModuleSetting(LOADING_KEYS[role] || 'admin');
  const [dbModules, setDbModules] = useState(null);
  const pathname = usePathname();
  const { hasAccess } = useModulePermissions();

  useEffect(() => {
    if (role === 'admin' || role === 'customer') return; 
    const fetchModules = async () => {
      try {
        const response = await api(`/api/security-modules/by-role/${role}`, 'GET');
        const raw = response?.data?.data ?? response?.data;
        if (response?.ok && Array.isArray(raw) && raw.length > 0) {
          setDbModules(raw);
        } 
        else {
          setDbModules(FALLBACK_MENUS[role] || []);
        }
      } catch (e) {
        console.error('Failed to fetch security modules, using fallback:', e);
        setDbModules(FALLBACK_MENUS[role] || []);
      }
    };
    fetchModules();
  }, [role]);

  const handleItemClick = (item) => {
    if (loadingItem) return;
    setLoadingItem(item);
    setActiveItem(item);
    setTimeout(() => setLoadingItem(null), 5000);
  };

  useEffect(() => {
    if (!pathname) return;
    const allItems = role === 'admin'
      ? ADMIN_MENU_GROUPS.flatMap((g) => g.items)
      : role === 'customer'
        ? (FALLBACK_MENUS.customer || []).flatMap((g) => g.items || [])
        : (dbModules || []).flatMap((g) => g.items || []);

    for (const item of allItems) {
      const path = item.path;
      if (path && pathname.startsWith(path)) {
        setActiveItem(item.label);
        break;
      }
    }
  }, [pathname, role, dbModules]);

  const menuGroups = useMemo(() => {
    if (role === 'admin') return ADMIN_MENU_GROUPS;
    if (role === 'customer') return FALLBACK_MENUS.customer || [];
    if (!dbModules) return []; 

    return dbModules
      .map((group) => ({
        ...group,
        items: (group.items || []).filter((item) => {
          if (item.locked) return true;
          return hasAccess(item.key || item.module);
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [role, dbModules, hasAccess]);

  const theme = ROLE_THEMES[role] || ROLE_THEMES.admin;
  const isActive = (path) => pathname?.startsWith(path);

  return (
    <>
      <ModuleLoading isVisible={showLoading && !!loadingItem} moduleName={loadingItem} />

      <nav
        className={cn(
          'h-full flex flex-col',
          'border-r border-gray-200/50 dark:border-[#27272a]',
          'bg-gray-200 dark:bg-[#0c0c0e]',
          'transition-all duration-300'
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center gap-3 px-4 py-5',
          'border-b border-gray-200/50 dark:border-[#27272a]',
          'transition-all duration-300',
          isOpen ? 'justify-start' : 'justify-center'
        )}>
          <div className={cn(
            'relative flex items-center justify-center',
            'w-10 h-10 rounded-xl',
            'transition-transform duration-300 hover:scale-105'
          )}>
            <Image src="/Logo.png" alt="Logo" width={24} height={24} className="object-contain" />
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <span className={`text-lg font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                SewerVision
              </span>
              <span className="text-xs text-gray-500">{theme.portal}</span>
            </div>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {menuGroups.map((group, groupIndex) => (
            <div key={group.label} className="space-y-1.5">
              {isOpen && (
                <div className="px-3 py-1">
                  <span className="text-[11px] font-semibold text-gray-400 dark:text-[#52525b] uppercase tracking-wider">
                    {group.label}
                  </span>
                </div>
              )}
              <div className="space-y-0.5">
                {(group.items || []).map((item, index) => {
                  const iconKey = item.icon;
                  const Icon = ICON_MAP[iconKey] || LayoutDashboard;
                  const itemPath = item.path;
                  const itemActive = isActive(itemPath);
                  const isItemLoading = loadingItem === item.label;

                  return (
                    <Link key={item.key || item.label} href={itemPath || '#'}>
                      <div
                        className={cn(
                          'group relative flex items-center gap-3',
                          'h-10 px-3 rounded-xl',
                          'transition-all duration-200',
                          'cursor-pointer select-none',
                          itemActive
                            ? `bg-gradient-to-r ${theme.activeBg} ${theme.activeText} font-semibold shadow-sm`
                            : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-[#18181b] hover:text-gray-900 dark:hover:text-white',
                          isItemLoading && 'pointer-events-none opacity-60',
                          !isOpen && 'justify-center'
                        )}
                        onClick={() => handleItemClick(item.label)}
                        style={{
                          animation: `slideIn 0.3s ease-out ${groupIndex * 80 + index * 40}ms both`,
                        }}
                      >
                        {/* Active indicator bar */}
                        {itemActive && (
                          <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b ${theme.activeBar} rounded-r-full`} />
                        )}

                        {/* Icon */}
                        <div className={cn(
                          'flex items-center justify-center w-5 h-5',
                          'transition-transform duration-200',
                          itemActive && 'scale-110',
                          !isOpen && 'w-6 h-6'
                        )}>
                          {isItemLoading ? (
                            <Loader2 className={`w-5 h-5 animate-spin ${theme.loaderColor}`} />
                          ) : (
                            <Icon
                              size={isOpen ? 18 : 22}
                              strokeWidth={itemActive ? 2.5 : 1.5}
                              className={cn(
                                'transition-colors duration-200',
                                itemActive ? theme.activeIcon : 'text-gray-500 dark:text-[#71717a] group-hover:text-gray-700 dark:group-hover:text-white'
                              )}
                            />
                          )}
                        </div>

                        {/* Label */}
                        {isOpen && (
                          <>
                            <span className={cn(
                              'flex-1 text-sm font-medium transition-colors duration-200',
                              itemActive ? theme.activeText : 'text-gray-700 dark:text-[#a1a1aa] group-hover:text-gray-900 dark:group-hover:text-white'
                            )}>
                              {item.label}
                            </span>
                            {itemActive && (
                              <ChevronRight size={14} className={`${theme.chevronColor} opacity-60`} />
                            )}
                          </>
                        )}

                        {/* Hover overlay */}
                        <div className={cn(
                          'absolute inset-0 rounded-xl',
                          'bg-gradient-to-r from-transparent to-transparent',
                          theme.hoverOverlay,
                          'transition-all duration-200 pointer-events-none',
                          itemActive && 'hidden'
                        )} />
                      </div>
                    </Link>
                  );
                })}
              </div>

              {groupIndex < menuGroups.length - 1 && isOpen && (
                <Separator className="my-1.5 opacity-40" />
              )}
            </div>
          ))}
        </div>

        {/* Footer — Role Indicator */}
        {isOpen && (
          <div className="px-3 py-4 border-t border-gray-200/50 bg-gray-50/50">
            <div className={cn(
              'flex items-center gap-2.5 px-3 py-2.5',
              `bg-gradient-to-r ${theme.footerBg}`,
              `rounded-xl border ${theme.footerBorder}`,
              'shadow-sm'
            )}>
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping opacity-75" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${theme.footerText}`}>
                  {displayName || theme.title}
                </p>
                <p className={`text-[10px] ${theme.footerSub} truncate`}>
                  {theme.subtitle}
                </p>
              </div>
              {theme.footerIcon && (
                <theme.footerIcon className={`w-4 h-4 ${theme.chevronColor}`} />
              )}
            </div>
          </div>
        )}
      </nav>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default UnifiedSidebar;
