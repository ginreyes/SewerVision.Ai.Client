'use client';

import { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  Clock,
  AlertCircle,
  Mail,
  Info,
  FileText,
  Loader2,
  Trash2,
  RefreshCw,
  CheckCheck,
  BellRing,
  Settings,
  Filter,
  Zap,
  Brain,
  Upload,
  AlertTriangle,
  MessageSquare,
  ChevronRight
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUser } from '@/components/providers/UserContext';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { useAlert } from '@/components/providers/AlertProvider';

// Compact Stat Card
const StatCard = ({ icon: Icon, value, label, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    orange: 'from-orange-500 to-amber-600',
    red: 'from-red-500 to-rose-600',
    purple: 'from-purple-500 to-indigo-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
};

// Notification Item Component
const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const getTypeConfig = (type) => {
    const configs = {
      report_ready: { icon: FileText, color: 'bg-blue-100 text-blue-600', label: 'Report' },
      ai_complete: { icon: Brain, color: 'bg-green-100 text-green-600', label: 'AI' },
      defect_found: { icon: AlertTriangle, color: 'bg-red-100 text-red-600', label: 'Alert' },
      status_update: { icon: Clock, color: 'bg-orange-100 text-orange-600', label: 'Update' },
      qc_review: { icon: CheckCheck, color: 'bg-purple-100 text-purple-600', label: 'QC' },
      upload_complete: { icon: Upload, color: 'bg-indigo-100 text-indigo-600', label: 'Upload' },
      default: { icon: Bell, color: 'bg-gray-100 text-gray-600', label: 'Info' }
    };
    return configs[type] || configs.default;
  };

  const formatDate = (dateString) => {
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
  };

  const config = getTypeConfig(notification.type);
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl transition-all ${!notification.read
          ? 'bg-blue-50/50 border border-blue-100'
          : 'bg-gray-50 hover:bg-gray-100'
        }`}
    >
      {/* Icon */}
      <div className={`p-2 rounded-lg ${config.color}`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 text-sm truncate">{notification.title}</h4>
              {!notification.read && (
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">
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
              className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => onMarkAsRead(notification._id)}
            >
              <Check className="w-3 h-3 mr-1" />
              Mark read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(notification._id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Toggle Setting Component
const ToggleSetting = ({ id, label, description, checked, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex-1 min-w-0 mr-4">
      <Label htmlFor={id} className="text-sm font-medium text-gray-900 cursor-pointer">
        {label}
      </Label>
      {description && (
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      )}
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onChange} />
  </div>
);

// Main Component
const NotificationPageOperator = () => {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    reportReady: true,
    aiComplete: true,
    statusUpdate: true,
    qcReview: true,
    defectFound: true,
  });

  useEffect(() => {
    if (userId) {
      fetchNotifications(true);
    }
  }, [userId, fetchNotifications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(true);
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      showAlert('Notification marked as read', 'success');
    } catch (err) {
      console.error('Error marking as read:', err);
      showAlert('Failed to mark notification as read', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      showAlert('All notifications marked as read', 'success');
    } catch (err) {
      console.error('Error marking all as read:', err);
      showAlert('Failed to mark notifications as read', 'error');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      showAlert('Notification deleted', 'success');
    } catch (err) {
      console.error('Error deleting notification:', err);
      showAlert('Failed to delete notification', 'error');
    }
  };

  const togglePreference = async (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPreferences);
    try {
      showAlert('Preferences updated', 'success');
    } catch (err) {
      console.error('Error updating preferences:', err);
      showAlert('Failed to update preferences', 'error');
      setPreferences(preferences);
    }
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const todayCount = notifications.filter(n => {
    const date = new Date(n.createdAt);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 hover:bg-red-600">{unreadCount} new</Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Stay updated on your operations</p>
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
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Bell} value={notifications.length} label="Total" color="blue" />
        <StatCard icon={BellRing} value={unreadCount} label="Unread" color="red" />
        <StatCard icon={Clock} value={todayCount} label="Today" color="orange" />
        <StatCard icon={CheckCheck} value={notifications.length - unreadCount} label="Read" color="green" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  Recent Notifications
                </CardTitle>
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${filter === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${filter === 'unread' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
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
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">
                    {filter === 'unread' ? 'All caught up!' : 'No notifications'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {filter === 'unread' ? 'You have no unread notifications' : 'Notifications will appear here'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Delivery Settings */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-gray-100">
              <ToggleSetting
                id="email"
                label="Email Notifications"
                description="Get notified via email"
                checked={preferences.email}
                onChange={() => togglePreference('email')}
              />
              <ToggleSetting
                id="push"
                label="Push Notifications"
                description="Browser alerts"
                checked={preferences.push}
                onChange={() => togglePreference('push')}
              />
            </CardContent>
          </Card>

          {/* Alert Types */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Alert Types
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-gray-100">
              <ToggleSetting
                id="report-ready"
                label="New Reports"
                checked={preferences.reportReady}
                onChange={() => togglePreference('reportReady')}
              />
              <ToggleSetting
                id="ai-complete"
                label="AI Processing"
                checked={preferences.aiComplete}
                onChange={() => togglePreference('aiComplete')}
              />
              <ToggleSetting
                id="status-update"
                label="Status Updates"
                checked={preferences.statusUpdate}
                onChange={() => togglePreference('statusUpdate')}
              />
              <ToggleSetting
                id="qc-review"
                label="QC Reviews"
                checked={preferences.qcReview}
                onChange={() => togglePreference('qcReview')}
              />
              <ToggleSetting
                id="defect-found"
                label="Defect Alerts"
                checked={preferences.defectFound}
                onChange={() => togglePreference('defectFound')}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationPageOperator;
