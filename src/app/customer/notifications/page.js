'use client';

import { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  Clock,
  AlertCircle,
  Mail,
  Info,
  Eye,
  EyeOff,
  FileText,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Helper Icons
const FileTextIcon = () => <FileText className="h-4 w-4 text-blue-500" />;
const BotIcon = () => <Bot className="h-4 w-4 text-green-500" />;
const UpdateIcon = () => <Clock className="h-4 w-4 text-orange-500" />;
const Bot = ({ className }) => <AlertCircle className={className} />;

// Mock notifications data
const mockNotifications = [
  {
    id: 'notif-001',
    type: 'report_ready',
    title: 'New Inspection Report Ready',
    message: 'Your report for "Downtown Sewer Inspection" is now available.',
    projectId: 'proj-001',
    read: false,
    createdAt: '2025-11-10T14:30:00Z',
  },
  {
    id: 'notif-002',
    type: 'ai_complete',
    title: 'AI Processing Complete',
    message: 'AI analysis finished for "Industrial Zone Pipeline Scan".',
    projectId: 'proj-002',
    read: true,
    createdAt: '2025-11-08T09:15:00Z',
  },
  {
    id: 'notif-003',
    type: 'status_update',
    title: 'Project Status Updated',
    message: '"Residential Drain Survey" moved to QC Review.',
    projectId: 'proj-003',
    read: false,
    createdAt: '2025-11-12T11:20:00Z',
  },
  {
    id: 'notif-004',
    type: 'system',
    title: 'Scheduled Maintenance',
    message: 'System maintenance planned for Nov 15, 2–4 AM EET.',
    projectId: null,
    read: false,
    createdAt: '2025-11-07T16:00:00Z',
  },
];

// Mock user notification preferences
const mockPreferences = {
  email: true,
  push: true,
  reportReady: true,
  aiComplete: true,
  statusUpdate: false,
};

const NotificationPageCustomer = () => {
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState(mockPreferences);
  const [loading, setLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const loadNotifications = async () => {
      await new Promise((r) => setTimeout(r, 400));
      setNotifications(mockNotifications);
      setLoading(false);
    };
    loadNotifications();
  }, []);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const togglePreference = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'report_ready':
        return <FileTextIcon />;
      case 'ai_complete':
        return <BotIcon />;
      case 'status_update':
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
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Manage alerts and view recent updates</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead}>
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
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-md border">
                    <div className="mt-1">
                      <div className="h-2 w-2 rounded-full bg-muted" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 bg-muted rounded" />
                      <div className="h-3 w-2/3 bg-muted rounded" />
                      <div className="h-2 w-16 bg-muted rounded" />
                    </div>
                  </div>
                ))
              ) : notifications.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 rounded-md border ${
                      !notification.read ? 'bg-accent/30 border-primary/20' : 'border-transparent'
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
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};



export default NotificationPageCustomer;