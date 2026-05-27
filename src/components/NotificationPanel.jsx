"use client";

import React, { useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  CheckCircle,
  Info,
  XCircle,
  FileText,
  Cpu,
  RefreshCcw,
  Shield,
  AlertTriangle,
  Loader2,
  Sparkles,
  Gift,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { whatsNewData } from '@/data/whatsNewData';
import { useUser } from '@/components/providers/UserContext';
import { getRoleTheme } from '@/lib/roleThemes';

const WHATS_NEW_VERSION_KEY = 'sewervision_whats_new_last_viewed_version';

// ── Per-role accent palette for the notification panel ──
// The base color tokens come from @/lib/roleThemes (admin=rose, operator=blue,
// qc-technician=purple, user/team-lead=indigo, customer=emerald,
// customer-rep=teal). Tailwind only ships classes it can see as literals, so
// the full class strings are spelled out per role here rather than templated.
// Used for: the "What's New" (new_update) notification accent, the unread
// left-bar gradient, the unread-row tint, and the "Mark read"/unread-dot color
// — everything that was previously a hardcoded purple/blue/violet.
const ROLE_ACCENTS = {
  admin: { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', dot: 'bg-rose-500', bar: 'from-rose-500 to-red-500', unreadRow: 'from-rose-50/50', markRead: 'text-rose-600 hover:text-rose-800 hover:bg-rose-50' },
  operator: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', bar: 'from-blue-500 to-indigo-500', unreadRow: 'from-blue-50/50', markRead: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50' },
  'qc-technician': { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500', bar: 'from-purple-500 to-pink-500', unreadRow: 'from-purple-50/50', markRead: 'text-purple-600 hover:text-purple-800 hover:bg-purple-50' },
  user: { text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', dot: 'bg-indigo-500', bar: 'from-indigo-500 to-purple-500', unreadRow: 'from-indigo-50/50', markRead: 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50' },
  customer: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', bar: 'from-emerald-500 to-green-500', unreadRow: 'from-emerald-50/50', markRead: 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50' },
  'customer-rep': { text: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', dot: 'bg-teal-500', bar: 'from-teal-500 to-cyan-500', unreadRow: 'from-teal-50/50', markRead: 'text-teal-600 hover:text-teal-800 hover:bg-teal-50' },
};

function getRoleAccent(role) {
  // Keep getRoleTheme as the source of truth for which roles exist; map to the
  // literal-class accent table above (defaulting to admin like roleThemes does).
  const key = getRoleTheme(role)?.key || 'admin';
  return ROLE_ACCENTS[key] || ROLE_ACCENTS.admin;
}

// Notification type configurations.
// Semantic types (report=green, defect=red, etc.) keep their meaning-based
// color. `new_update` ("What's New") is intentionally role-tinted at render
// time so it matches the signed-in role instead of a fixed purple.
const notificationTypeConfig = {
  report_ready: {
    icon: FileText,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  ai_complete: {
    icon: Cpu,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
  },
  status_update: {
    icon: RefreshCcw,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  system: {
    icon: Info,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
  },
  qc_review: {
    icon: Shield,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  defect_found: {
    icon: AlertTriangle,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
  new_update: {
    icon: Gift,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  }
};

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  onNavigate,
  accent,
}) => {
  const baseConfig = notificationTypeConfig[notification.type] || notificationTypeConfig.system;
  // The "What's New" pseudo-notification follows the active role's accent
  // instead of a fixed purple so the bell matches the rest of the role theme.
  const config =
    notification.type === 'new_update'
      ? { ...baseConfig, color: accent.text, bgColor: accent.bg, borderColor: accent.border }
      : baseConfig;
  const IconComponent = config.icon;

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification._id);
    }
    if (notification.actionUrl) {
      onNavigate(notification.actionUrl);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
    <div
      className={`
        group relative p-4 border-b border-gray-100 dark:border-[#1e1e22] transition-all duration-200
        hover:bg-gray-50/80 dark:hover:bg-[#18181b] cursor-pointer
        ${!notification.read ? `bg-gradient-to-r ${accent.unreadRow} to-transparent` : ''}
      `}
      onClick={handleClick}
    >
      {/* Unread indicator bar — role-tinted */}
      {!notification.read && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${accent.bar} rounded-r`} />
      )}

      <div className="flex items-start gap-3 pl-1">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-xl ${config.bgColor} ${config.borderColor}
          border flex items-center justify-center transition-transform
          group-hover:scale-105
        `}>
          <IconComponent className={`w-5 h-5 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-tight ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {notification.message}
              </p>

              {/* Metadata badges */}
              {notification.metadata?.severity && (
                <span className={`
                  inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2
                  ${notification.metadata.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    notification.metadata.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      notification.metadata.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'}
                `}>
                  {notification.metadata.severity.toUpperCase()}
                </span>
              )}

              <p className="text-xs text-gray-400 mt-1.5">{timeAgo}</p>
            </div>

            {/* Unread dot — role-tinted */}
            {!notification.read && (
              <div className={`w-2.5 h-2.5 ${accent.dot} rounded-full flex-shrink-0 mt-1 animate-pulse`} />
            )}
          </div>

          {/* Action buttons - show on hover */}
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notification.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification._id);
                }}
                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md transition-colors ${accent.markRead}`}
              >
                <Check className="w-3 h-3 mr-1" />
                Mark read
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification._id);
              }}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400
                       hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotificationBell = ({ className }) => {
  const { unreadCount, distinctUnreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  // Prefer rollup-aware distinct count when the provider exposes it; fall
  // back to the raw server unreadCount so older callers still render.
  const displayCount =
    typeof distinctUnreadCount === 'number' ? distinctUnreadCount : unreadCount;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${className}`}
          aria-label={`Notifications${displayCount > 0 ? ` (${displayCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {displayCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
              <span className="relative inline-flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-[10px] font-bold text-white">
                {displayCount > 99 ? '99+' : displayCount}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0 shadow-2xl border-0 rounded-2xl overflow-hidden"
        align="end"
        sideOffset={8}
      >
        <NotificationPanel onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
};

const NotificationPanel = ({ onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  // Theme the panel to the signed-in role. Prefer the user record, but fall
  // back to deriving the role from the URL base (/admin, /operator, …) so the
  // accent is still correct before userData resolves.
  const { userData } = useUser();
  const roleFromPath = pathname?.split('/')?.[1];
  const accent = getRoleAccent(userData?.role || roleFromPath);
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  const scrollRef = useRef(null);
  const [isClearing, setIsClearing] = useState(false);
  const [combinedNotifications, setCombinedNotifications] = React.useState([]);

  // Mix system notifications with API notifications
  React.useEffect(() => {
    let result = [...notifications];

    // Check for local "What's New" update
    if (typeof window !== 'undefined') {
      const lastViewedVersion = localStorage.getItem(WHATS_NEW_VERSION_KEY);
      const latestVersion = whatsNewData[0];

      if (lastViewedVersion !== latestVersion.id) {
        // Create a pseudo-notification
        const updateNotification = {
          _id: 'local_whats_new',
          type: 'new_update',
          title: `New Update ${latestVersion.id} Available!`,
          message: latestVersion.label || 'Check out the latest features and improvements.',
          read: false,
          createdAt: new Date().toISOString(),
          actionUrl: 'app://whats-new',
          metadata: { severity: 'medium' }
        };

        // Prepend to list
        result = [updateNotification, ...result];
      }
    }
    setCombinedNotifications(result);
  }, [notifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      await deleteAllNotifications();
    } catch (err) {
      console.error('Failed to clear all notifications:', err);
    } finally {
      setIsClearing(false);
    }
  };

  // Security: Rewrite notification URLs to match current user's role
  const handleNavigate = (url) => {
    onClose?.();

    if (url === 'app://whats-new') {
      window.dispatchEvent(new CustomEvent('openTourGuide', { detail: { tab: 'whats-new' } }));
      return;
    }

    // Get the current user's role base path from the pathname
    // e.g., /admin, /qc-technician, /operator, /customer
    const currentRoleBase = pathname.split('/').slice(0, 2).join('/');

    // Define role-specific route mappings
    const roleRouteMappings = {
      '/qc-technician': {
        // QC technicians should go to their project page, not admin
        '/admin/project': '/qc-technician/project',
        '/admin/projects': '/qc-technician/dashboard',
        '/admin/dashboard': '/qc-technician/dashboard',
        '/admin/quality-control': '/qc-technician/quality-control',
      },
      '/operator': {
        '/admin/project': '/operator/project',
        '/admin/projects': '/operator/dashboard',
        '/admin/dashboard': '/operator/dashboard',
        '/admin/uploads': '/operator/uploads',
      },
      '/customer': {
        '/admin/project': '/customer/project',
        '/admin/projects': '/customer/dashboard',
        '/admin/dashboard': '/customer/dashboard',
        '/admin/reports': '/customer/reports',
      },
      '/user': {
        '/admin/project': '/user/project',
        '/admin/projects': '/user/dashboard',
        '/admin/dashboard': '/user/dashboard',
        '/admin/reports': '/user/reports',
        '/admin/quality-control': '/user/dashboard',
      },
    };

    // Check if we need to rewrite the URL
    let targetUrl = url;

    // If the URL starts with a different role's path, rewrite it
    const roleMapping = roleRouteMappings[currentRoleBase];
    if (roleMapping) {
      // Find matching route prefix and replace
      for (const [fromPath, toPath] of Object.entries(roleMapping)) {
        if (url.startsWith(fromPath)) {
          targetUrl = url.replace(fromPath, toPath);
          break;
        }
      }
    }

    // Additional security: Ensure the URL matches the current role base or is allowed
    const isOwnRolePath = targetUrl.startsWith(currentRoleBase);
    const isAllowedPath = targetUrl.startsWith('/') && !targetUrl.includes('/admin') || currentRoleBase === '/admin';

    if (!isOwnRolePath && !isAllowedPath && currentRoleBase !== '/admin') {
      // Redirect to dashboard if trying to access unauthorized route
      console.warn(`[Security] Blocked navigation to unauthorized route: ${targetUrl}`);
      targetUrl = `${currentRoleBase}/dashboard`;
    }

    router.push(targetUrl);
  };

  const handleRefresh = () => {
    fetchNotifications(true);
  };

  // Infinite scroll
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !isLoading) {
      loadMore();
    }
  };

  return (
    <div className="bg-white dark:bg-[#0c0c0e] rounded-2xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-[#27272a] bg-gradient-to-r from-gray-50 to-white dark:from-[#18181b] dark:to-[#0c0c0e]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">
                {combinedNotifications.filter(n => !n.read).length} unread notification{combinedNotifications.filter(n => !n.read).length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 w-8 text-gray-500 hover:text-gray-700"
            >
              <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                onClose?.();
                const basePath = pathname.split('/').slice(0, 2).join('/');
                // Customer settings doesn't have a notifications tab —
                // route to the notifications page instead.
                if (basePath.includes('/customer/') && !basePath.includes('/customer-rep')) {
                  router.push(`${basePath}/notifications`);
                } else {
                  router.push(`${basePath}/settings?tab=notifications`);
                }
              }}
              className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Notification settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        {combinedNotifications.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className={`text-xs h-7 px-3 rounded-lg ${accent.markRead}`}
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
                Mark all read
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={isClearing}
              className="text-xs h-7 px-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              {isClearing ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              )}
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-100">
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="w-4 h-4" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <ScrollArea
        className="h-[400px]"
        ref={scrollRef}
        onScrollCapture={handleScroll}
      >
        {combinedNotifications.length > 0 ? (
          <>
            {combinedNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                onNavigate={handleNavigate}
                accent={accent}
              />
            ))}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            )}
            {!hasMore && combinedNotifications.length > 5 && (
              <div className="py-4 text-center text-sm text-gray-400">
                You've reached the end
              </div>
            )}
          </>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Loading notifications...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 px-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-base font-medium text-gray-600">All caught up!</p>
            <p className="text-sm text-gray-400 mt-1 text-center">
              You have no notifications at the moment
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {combinedNotifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 dark:border-[#27272a] bg-gray-50/50 dark:bg-[#18181b]/50">
          <Button
            variant="ghost"
            className="w-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#27272a]"
            onClick={() => {
              onClose?.();
              const basePath = pathname.split('/').slice(0, 2).join('/');
              router.push(`${basePath}/notifications`);
            }}
          >
            View all notifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;