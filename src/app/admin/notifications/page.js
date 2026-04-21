'use client';

import { useEffect } from 'react';
import { Mail } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUser } from '@/components/providers/UserContext';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { useAlert } from '@/components/providers/AlertProvider';
import {
  useUserNotificationPreferences,
  useUpdateUserNotificationPreferences,
} from '@/hooks/useQueryHooks';
import NotificationCenter from '@/components/shared/NotificationCenter';

const NotificationPageAdmin = () => {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const { fetchNotifications } = useNotifications();

  const DEFAULT_PREFS = {
    email: true,
    push: true,
    reportReady: true,
    aiComplete: true,
    statusUpdate: true,
    qcReview: true,
    defectFound: true,
  };

  const { data: prefsData } = useUserNotificationPreferences(userId);
  const updatePrefsMutation = useUpdateUserNotificationPreferences();

  const preferences = prefsData
    ? {
        email: prefsData.email ?? true,
        push: prefsData.push ?? true,
        reportReady: prefsData.reportReady ?? true,
        aiComplete: prefsData.aiComplete ?? true,
        statusUpdate: prefsData.statusUpdate ?? true,
        qcReview: prefsData.qcReview ?? true,
        defectFound: prefsData.defectFound ?? true,
      }
    : DEFAULT_PREFS;

  useEffect(() => {
    if (userId) {
      fetchNotifications(true);
    }
  }, [userId, fetchNotifications]);

  const togglePreference = (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };

    updatePrefsMutation.mutate(
      { userId, preferences: newPreferences },
      {
        onSuccess: () => showAlert('Preferences updated', 'success'),
        onError: () => showAlert('Failed to update preferences', 'error'),
      }
    );
  };

  return (
    <div className="p-4 md:p-6">
      <NotificationCenter role="admin">
        {/* Notification Preferences */}
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
      </NotificationCenter>
    </div>
  );
};

export default NotificationPageAdmin;
