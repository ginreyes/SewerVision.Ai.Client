'use client';

import {
  Bell,
  Check,
  Clock,
  AlertCircle,
  Info,
  FileText,
  Loader2,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import {
  useCustomerNotifications,
  useCustomerNotificationPreferences,
  useMarkCustomerNotificationRead,
  useMarkAllCustomerNotificationsRead,
  useDeleteCustomerNotification,
  useUpdateCustomerNotificationPreferences,
} from '@/hooks/useQueryHooks';

import NotificationItem from '@/components/customer/notifications/NotificationItem';
import NotificationPreferences from '@/components/customer/notifications/NotificationPreferences';

// Helper Icons
const FileTextIcon = () => <FileText className="h-4 w-4 text-blue-500" />;
const BotIcon = () => <AlertCircle className="h-4 w-4 text-green-500" />;
const UpdateIcon = () => <Clock className="h-4 w-4 text-orange-500" />;

const NotificationPageCustomer = () => {
  const { userId } = useUser();
  const { showAlert } = useAlert();

  // TanStack Query hooks
  const {
    data: notificationsData,
    isLoading: loading,
  } = useCustomerNotifications(userId);

  const {
    data: preferencesData,
  } = useCustomerNotificationPreferences(userId);

  const markReadMutation = useMarkCustomerNotificationRead();
  const markAllReadMutation = useMarkAllCustomerNotificationsRead();
  const deleteMutation = useDeleteCustomerNotification();
  const updatePrefsMutation = useUpdateCustomerNotificationPreferences();

  const notifications = notificationsData?.data || [];
  const unreadCount = notificationsData?.unreadCount || 0;
  const preferences = preferencesData || {
    email: true,
    push: true,
    reportReady: true,
    aiComplete: true,
    statusUpdate: true,
    qcReview: true,
    defectFound: true,
  };

  const markAsRead = async (notificationId) => {
    try {
      await markReadMutation.mutateAsync({ notificationId, userId });
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllReadMutation.mutateAsync({ userId });
      showAlert('All notifications marked as read', 'success');
    } catch (err) {
      console.error('Error marking all as read:', err);
      showAlert('Failed to mark notifications as read', 'error');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await deleteMutation.mutateAsync({ notificationId, userId });
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

    try {
      await updatePrefsMutation.mutateAsync({ userId, preferences: newPreferences });
      showAlert('Preferences updated', 'success');
    } catch (err) {
      console.error('Error updating preferences:', err);
      showAlert('Failed to update preferences', 'error');
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
    <div className="space-y-6 p-4 md:p-6" data-tour="customer-notifications">
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
        <Button
          variant="outline"
          size="sm"
          onClick={markAllAsRead}
          disabled={unreadCount === 0 || markAllReadMutation.isPending}
        >
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
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkRead={markAsRead}
                    onDelete={deleteNotification}
                    getIcon={getNotificationIcon}
                    formatDate={formatDate}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notification Preferences */}
        <NotificationPreferences
          preferences={preferences}
          onToggle={togglePreference}
        />
      </div>
    </div>
  );
};

export default NotificationPageCustomer;
