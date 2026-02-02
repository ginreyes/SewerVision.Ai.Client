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

const WHATS_NEW_VERSION_KEY = 'sewervision_whats_new_last_viewed_version';

// Notification type configurations
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
}) => {
  const config = notificationTypeConfig[notification.type] || notificationTypeConfig.system;
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
        group relative p-4 border-b border-gray-100 transition-all duration-200
        hover:bg-gray-50/80 cursor-pointer
        ${!notification.read ? 'bg-gradient-to-r from-blue-50/50 to-transparent' : ''}
      `}
      onClick={handleClick}
    >
      {/* Unread indicator bar */}
      {!notification.read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-violet-500 rounded-r" />
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

            {/* Unread dot */}
            {!notification.read && (
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1 animate-pulse" />
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
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 
                         hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
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
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500 
                       hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative ${className}`}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
              <span className="relative inline-flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
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
          console.log(`[Security] Rewriting notification URL: ${url} -> ${targetUrl}`);
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
    <div className="bg-white rounded-2xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
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
                const basePath = pathname.split('/').slice(0, 2).join('/');
                router.push(`${basePath}/settings?tab=preferences`);
              }}
              className="h-8 w-8 text-gray-500 hover:text-gray-700"
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
                className="text-xs h-7 px-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
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
        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
          <Button
            variant="ghost"
            className="w-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white"
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