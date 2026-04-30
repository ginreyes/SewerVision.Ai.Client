'use client';

import { useEffect } from 'react';
import { Mail, Settings } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUser } from '@/components/providers/UserContext';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { useAlert } from '@/components/providers/AlertProvider';
import {
  useOperatorNotificationPreferences,
  useUpdateOperatorNotificationPreferences,
} from '@/hooks/useQueryHooks';
import NotificationCenter from '@/components/shared/NotificationCenter';
import ChatNotificationPreferences from '@/components/shared/notifications/ChatNotificationPreferences';

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

const NotificationPageOperator = () => {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const { fetchNotifications } = useNotifications();

  // ── Notification preferences via TanStack Query ──
  const { data: prefsData } = useOperatorNotificationPreferences(userId);
  const updatePrefsMutation = useUpdateOperatorNotificationPreferences();

  const preferences = {
    email: prefsData?.email ?? true,
    push: prefsData?.push ?? true,
    reportReady: prefsData?.reportReady ?? true,
    aiComplete: prefsData?.aiComplete ?? true,
    statusUpdate: prefsData?.statusUpdate ?? true,
    qcReview: prefsData?.qcReview ?? true,
    defectFound: prefsData?.defectFound ?? true,
    chatMention: prefsData?.chatMention ?? true,
    chatReply: prefsData?.chatReply ?? true,
    chatPin: prefsData?.chatPin ?? true,
    chatMessage: prefsData?.chatMessage ?? false,
    chatReaction: prefsData?.chatReaction ?? false,
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications(true);
    }
  }, [userId, fetchNotifications]);

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <NotificationCenter role="operator" showStats showRefresh>
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

        <ChatNotificationPreferences
          preferences={preferences}
          onToggle={togglePreference}
          accent="blue"
        />
      </NotificationCenter>
    </div>
  );
};

export default NotificationPageOperator;
