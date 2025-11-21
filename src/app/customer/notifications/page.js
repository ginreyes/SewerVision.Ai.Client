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
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUser } from '@/components/providers/UserContext';
import { api } from '@/lib/helper';
import { useAlert } from '@/components/providers/AlertProvider';

// Helper Icons
const FileTextIcon = () => <FileText className="h-4 w-4 text-blue-500" />;
const BotIcon = () => <AlertCircle className="h-4 w-4 text-green-500" />;
const UpdateIcon = () => <Clock className="h-4 w-4 text-orange-500" />;

const NotificationPageCustomer = () => {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    reportReady: true,
    aiComplete: true,
    statusUpdate: true,
    qcReview: true,
    defectFound: true,
  });
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const { data, ok, error } = await api(
          `/api/customer/notifications/${userId}?limit=50`,
          'GET'
        );

        if (ok && data) {
          setNotifications(data.data || []);
          setUnreadCount(data.unreadCount || 0);
        } else {
          console.error('Error fetching notifications:', error);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  // Fetch preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!userId) return;

      try {
        const { data, ok } = await api(
          `/api/customer/notification-preferences/${userId}`,
          'GET'
        );

        if (ok && data?.data) {
          setPreferences(data.data);
        }
      } catch (err) {
        console.error('Error fetching preferences:', err);
      }
    };

    fetchPreferences();
  }, [userId]);

  const markAsRead = async (notificationId) => {
    try {
      const { ok } = await api(
        `/api/customer/notifications/${notificationId}/read`,
        'PUT',
        { userId }
      );

      if (ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { ok } = await api(
        `/api/customer/notifications/${userId}/read-all`,
        'PUT'
      );

      if (ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        showAlert('All notifications marked as read', 'success');
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
      showAlert('Failed to mark notifications as read', 'error');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const { ok } = await api(
        `/api/customer/notifications/${notificationId}`,
        'DELETE',
        { userId }
      );

      if (ok) {
        setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
        showAlert('Notification deleted', 'success');
      }
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
      const { ok } = await api(
        `/api/customer/notification-preferences/${userId}`,
        'PUT',
        newPreferences
      );

      if (ok) {
        showAlert('Preferences updated', 'success');
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
      showAlert('Failed to update preferences', 'error');
      // Revert on error
      setPreferences(preferences);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'report_ready':
        return <FileTextIcon />;
      case 'ai_complete':
      case 'defect_found':
        return <BotIcon />;
      case 'status_update':
      case 'qc_review':
        return <UpdateIcon />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">Manage alerts and view recent updates</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
          <Check className="h-4 w-4 mr-2" />
          Mark All as Read
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Notifications List */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Loading notifications...</span>
                </div>
              ) : notifications.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No notifications yet</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`flex items-start gap-3 p-3 rounded-md border transition-colors ${
                      !notification.read ? 'bg-accent/30 border-primary/20' : 'border-transparent hover:bg-accent/10'
                    }`}
                  >
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.createdAt)}
                        </span>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1"
                              onClick={() => markAsRead(notification._id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 text-destructive hover:text-destructive"
                            onClick={() => deleteNotification(notification._id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email" className="flex flex-col">
                  <span>Email Notifications</span>
                  <span className="text-xs text-muted-foreground">Receive emails for alerts</span>
                </Label>
                <Switch
                  id="email"
                  checked={preferences.email}
                  onCheckedChange={() => togglePreference('email')}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="push" className="flex flex-col">
                  <span>Push Notifications</span>
                  <span className="text-xs text-muted-foreground">Browser notifications</span>
                </Label>
                <Switch
                  id="push"
                  checked={preferences.push}
                  onCheckedChange={() => togglePreference('push')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alert Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="report-ready" className="text-sm">
                  New Reports Ready
                </Label>
                <Switch
                  id="report-ready"
                  checked={preferences.reportReady}
                  onCheckedChange={() => togglePreference('reportReady')}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="ai-complete" className="text-sm">
                  AI Processing Complete
                </Label>
                <Switch
                  id="ai-complete"
                  checked={preferences.aiComplete}
                  onCheckedChange={() => togglePreference('aiComplete')}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="status-update" className="text-sm">
                  Project Status Updates
                </Label>
                <Switch
                  id="status-update"
                  checked={preferences.statusUpdate}
                  onCheckedChange={() => togglePreference('statusUpdate')}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="qc-review" className="text-sm">
                  QC Review Updates
                </Label>
                <Switch
                  id="qc-review"
                  checked={preferences.qcReview}
                  onCheckedChange={() => togglePreference('qcReview')}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="defect-found" className="text-sm">
                  Defect Alerts
                </Label>
                <Switch
                  id="defect-found"
                  checked={preferences.defectFound}
                  onCheckedChange={() => togglePreference('defectFound')}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationPageCustomer;