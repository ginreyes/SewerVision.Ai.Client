'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Bell,
  Check,
  Clock,
  AlertTriangle,
  FileText,
  Loader2,
  Trash2,
  RefreshCw,
  CheckCheck,
  BellRing,
  Brain,
  Upload,
  ClipboardList,
  Ticket,
  MessageSquare,
  Zap,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { useAlert } from '@/components/providers/AlertProvider';
import { ROLE_BADGE_CLASSES, getRoleTheme } from '@/lib/roleThemes';

// ── Role accent color mapping (derives from central roleThemes) ──
function buildRoleColors(role) {
  const theme = getRoleTheme(role);
  return {
    accent: theme.primary,
    unreadBg: `${theme.activeBg} border ${theme.cardBorder}`,
    badgeBg: ROLE_BADGE_CLASSES[role] || theme.badge,
    loader: theme.primary,
    iconAccent: theme.iconText,
  };
}

// ── Notification type icon/label configs per role ──
const DEFAULT_TYPE_CONFIG = {
  report_ready: { icon: FileText, color: 'bg-blue-100 text-blue-600', label: 'Report' },
  ai_complete: { icon: Brain, color: 'bg-green-100 text-green-600', label: 'AI' },
  defect_found: { icon: AlertTriangle, color: 'bg-red-100 text-red-600', label: 'Alert' },
  status_update: { icon: Clock, color: 'bg-orange-100 text-orange-600', label: 'Update' },
  qc_review: { icon: CheckCheck, color: 'bg-purple-100 text-purple-600', label: 'QC' },
  upload_complete: { icon: Upload, color: 'bg-indigo-100 text-indigo-600', label: 'Upload' },
  task_assignment: { icon: ClipboardList, color: 'bg-blue-100 text-blue-600', label: 'Task' },
  delete_request: { icon: Trash2, color: 'bg-red-100 text-red-600', label: 'Delete' },
  ticket_assigned: { icon: Ticket, color: 'bg-teal-100 text-teal-600', label: 'Assigned' },
  ticket_updated: { icon: Clock, color: 'bg-cyan-100 text-cyan-600', label: 'Updated' },
  new_ticket: { icon: MessageSquare, color: 'bg-blue-100 text-blue-600', label: 'New Ticket' },
  sla_breach: { icon: AlertTriangle, color: 'bg-red-100 text-red-600', label: 'SLA' },
  system: { icon: Zap, color: 'bg-gray-100 text-gray-600', label: 'System' },
  default: { icon: Bell, color: 'bg-gray-100 text-gray-600', label: 'Info' },
};

// ── Format date helper ──
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

// ── Single Notification Item ──
function NotificationRow({ notification, roleColors, onMarkAsRead, onDelete }) {
  const config = DEFAULT_TYPE_CONFIG[notification.type] || DEFAULT_TYPE_CONFIG.default;
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl transition-all ${
        !notification.read
          ? roleColors.unreadBg
          : 'bg-gray-50 hover:bg-gray-100 dark:bg-[#2b2a33] dark:hover:bg-[#32313b]'
      }`}
    >
      {/* Icon */}
      <div className={`p-2 rounded-lg shrink-0 ${config.color}`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-200 text-sm truncate">
                {notification.title}
              </h4>
              {!notification.read && (
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {notification.message}
            </p>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
            {formatDate(notification.createdAt)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary" className="text-xs">
            {config.label}
          </Badge>
          <div className="flex-1" />
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
              onClick={() => onMarkAsRead(notification._id)}
            >
              <Check className="w-3 h-3 mr-1" />
              Mark read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            onClick={() => onDelete(notification._id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Stat Card (optional) ──
function StatCard({ icon: Icon, value, label, color = 'from-blue-500 to-blue-600' }) {
  return (
    <div className="bg-white dark:bg-[#2b2a33] rounded-xl border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-200">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Main NotificationCenter Component
// ══════════════════════════════════════════════════════════════
export default function NotificationCenter({
  role = 'admin',
  notifications: externalNotifications,
  unreadCount: externalUnreadCount,
  isLoading: externalIsLoading,
  onMarkAsRead: externalMarkAsRead,
  onMarkAllAsRead: externalMarkAllAsRead,
  onDelete: externalDelete,
  onDeleteAll: externalDeleteAll,
  showStats = false,
  showRefresh = false,
  className = '',
  children,
}) {
  // Use provider notifications by default, allow override via props (for customer)
  const providerNotifications = useNotificationsSafe();

  const notifications = externalNotifications ?? providerNotifications?.notifications ?? [];
  const unreadCount = externalUnreadCount ?? providerNotifications?.unreadCount ?? 0;
  const isLoading = externalIsLoading ?? providerNotifications?.isLoading ?? false;
  const fetchNotifications = providerNotifications?.fetchNotifications;
  const deleteAllNotifications = providerNotifications?.deleteAllNotifications;

  const { showAlert } = useAlert();
  const roleColors = buildRoleColors(role);

  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.read);
    return notifications;
  }, [notifications, filter]);

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return notifications.filter(
      (n) => new Date(n.createdAt).toDateString() === today
    ).length;
  }, [notifications]);

  // ── Handlers ──
  const handleMarkAsRead = useCallback(
    async (notificationId) => {
      try {
        if (externalMarkAsRead) {
          await externalMarkAsRead(notificationId);
        } else if (providerNotifications?.markAsRead) {
          await providerNotifications.markAsRead(notificationId);
          showAlert('Notification marked as read', 'success');
        }
      } catch (err) {
        console.error('Error marking as read:', err);
        showAlert('Failed to mark notification as read', 'error');
      }
    },
    [externalMarkAsRead, providerNotifications, showAlert]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      if (externalMarkAllAsRead) {
        await externalMarkAllAsRead();
      } else if (providerNotifications?.markAllAsRead) {
        await providerNotifications.markAllAsRead();
        showAlert('All notifications marked as read', 'success');
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
      showAlert('Failed to mark notifications as read', 'error');
    }
  }, [externalMarkAllAsRead, providerNotifications, showAlert]);

  const handleDelete = useCallback(
    async (notificationId) => {
      try {
        if (externalDelete) {
          await externalDelete(notificationId);
        } else if (providerNotifications?.deleteNotification) {
          await providerNotifications.deleteNotification(notificationId);
          showAlert('Notification deleted', 'success');
        }
      } catch (err) {
        console.error('Error deleting notification:', err);
        showAlert('Failed to delete notification', 'error');
      }
    },
    [externalDelete, providerNotifications, showAlert]
  );

  const handleDeleteAll = useCallback(async () => {
    if (notifications.length === 0) return;
    if (typeof window !== 'undefined' && !window.confirm('Delete all notifications? This cannot be undone.')) return;
    try {
      setDeletingAll(true);
      if (externalDeleteAll) {
        await externalDeleteAll();
      } else if (deleteAllNotifications) {
        await deleteAllNotifications();
        showAlert('All notifications deleted', 'success');
      }
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      showAlert('Failed to delete all notifications', 'error');
    } finally {
      setDeletingAll(false);
    }
  }, [notifications.length, externalDeleteAll, deleteAllNotifications, showAlert]);

  const handleRefresh = useCallback(async () => {
    if (!fetchNotifications) return;
    setRefreshing(true);
    await fetchNotifications(true);
    setRefreshing(false);
  }, [fetchNotifications]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <Badge className={roleColors.badgeBg}>
                {unreadCount} new
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage alerts and view recent updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            size="sm"
            disabled={unreadCount === 0}
            className="gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
          {externalDeleteAll || deleteAllNotifications ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAll}
              disabled={notifications.length === 0 || deletingAll}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {deletingAll ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete All
            </Button>
          ) : null}
          {showRefresh && (
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {/* ── Stats (optional) ── */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Bell}
            value={notifications.length}
            label="Total"
            color={role === 'customer-rep' ? 'from-teal-500 to-teal-600' : 'from-blue-500 to-blue-600'}
          />
          <StatCard
            icon={BellRing}
            value={unreadCount}
            label="Unread"
            color="from-red-500 to-rose-600"
          />
          <StatCard
            icon={Clock}
            value={todayCount}
            label="Today"
            color="from-amber-500 to-orange-600"
          />
          <StatCard
            icon={CheckCheck}
            value={notifications.length - unreadCount}
            label="Read"
            color="from-green-500 to-emerald-600"
          />
        </div>
      )}

      {/* ── Main Content Grid ── */}
      <div className={`grid grid-cols-1 ${children ? 'lg:grid-cols-3' : ''} gap-6`}>
        {/* Notification List */}
        <div className={children ? 'lg:col-span-2' : ''}>
          <Card className="border-0 shadow-sm dark:bg-[#2b2a33] dark:border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2 dark:text-gray-200">
                  <Bell className={`w-5 h-5 ${roleColors.iconAccent}`} />
                  Recent Notifications
                </CardTitle>
                <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-[#3b3a43] rounded-lg">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      filter === 'all'
                        ? 'bg-white dark:bg-[#2b2a33] shadow-sm text-gray-900 dark:text-gray-200'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      filter === 'unread'
                        ? 'bg-white dark:bg-[#2b2a33] shadow-sm text-gray-900 dark:text-gray-200'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    Unread
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className={`w-8 h-8 animate-spin ${roleColors.loader}`} />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 dark:text-gray-200 mb-1">
                    {filter === 'unread' ? 'All caught up!' : 'No notifications'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {filter === 'unread'
                      ? 'You have no unread notifications'
                      : 'Notifications will appear here'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationRow
                    key={notification._id}
                    notification={notification}
                    roleColors={roleColors}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Role-specific sidebar (preferences etc.) passed as children */}
        {children && <div className="space-y-6">{children}</div>}
      </div>
    </div>
  );
}

// Safe hook that returns null if not within NotificationProvider
function useNotificationsSafe() {
  try {
    return useNotifications();
  } catch {
    return null;
  }
}
