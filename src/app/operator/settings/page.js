'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { getCookie } from '@/lib/helper';
import { BACKEND_URL } from '@/lib/config';
import {
  useOperatorDashboardStats,
  useUpdateOperatorProfile,
  useChangeOperatorPassword,
  useSaveOperatorSettings,
} from '@/hooks/useQueryHooks';
import {
  ProfileTab, DataSyncTab, VideoAITab, NotificationsTab, PreferencesTab,
  SETTINGS_TABS, DEFAULT_PROFILE, DEFAULT_PASSWORD, DEFAULT_SETTINGS,
} from '@/components/operator/settings';
import AppearanceSettings from '@/components/shared/AppearanceSettings';
import SettingsPageShell from '@/components/shared/SettingsPageShell';

const OperatorSettingsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData, logout, updateUserData, refetchUser } = useUser();
  const { showAlert } = useAlert();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({ ...DEFAULT_PROFILE });
  const [passwordForm, setPasswordForm] = useState({ ...DEFAULT_PASSWORD });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [changingPassword, setChangingPassword] = useState(false);

  const fileInputRef = useRef(null);

  const { data: dashboardData } = useOperatorDashboardStats(userData?._id, { staleTime: 5 * 60 * 1000 });
  const updateProfileMutation = useUpdateOperatorProfile();
  const changePasswordMutation = useChangeOperatorPassword();
  const saveSettingsMutation = useSaveOperatorSettings();

  const stats = {
    inspections: dashboardData?.operationalStats?.activeOperations ?? 0,
    uploads: dashboardData?.recentActivity?.length ?? 0,
    completionRate: dashboardData?.operationalStats?.systemUptime ?? 0,
    hours: dashboardData?.operationalStats?.maintenanceDue ?? 0,
  };

  useEffect(() => {
    if (userData) {
      setProfile({
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        department: userData.department || '',
        role: userData.role || 'Operator',
        avatar: userData.avatar
          ? (userData.avatar.startsWith('http') ? userData.avatar : `${BACKEND_URL}/api/users/avatar/${userData._id}?t=${Date.now()}`)
          : null,
      });
    }
  }, [userData]);

  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab && SETTINGS_TABS.some((t) => t.id === tab)) setActiveTab(tab);
  }, [searchParams]);

  const handleProfileChange = (e) => setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const updateSetting = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));
  const handlePasswordChange = (e) => setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const togglePassword = (key) => setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const token = getCookie('authToken');
      const res = await fetch(`${BACKEND_URL}/api/users/upload-avatar/${userData._id}`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      if (res.ok) { showAlert('Avatar updated', 'success'); refetchUser?.(); }
      else showAlert('Failed to upload avatar', 'error');
    } catch { showAlert('Avatar upload failed', 'error'); }
    finally { setLoading(false); }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfileMutation.mutateAsync({
        userId: userData._id,
        data: { first_name: profile.firstName, last_name: profile.lastName, phone: profile.phone, department: profile.department },
      });
      showAlert('Profile saved', 'success');
      updateUserData?.({ ...userData, first_name: profile.firstName, last_name: profile.lastName, phone: profile.phone, department: profile.department });
    } catch { showAlert('Failed to save profile', 'error'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { showAlert('Passwords do not match', 'error'); return; }
    if (passwordForm.newPassword.length < 6) { showAlert('Password must be at least 6 characters', 'error'); return; }
    setChangingPassword(true);
    try {
      await changePasswordMutation.mutateAsync({ userId: userData._id, data: passwordForm });
      showAlert('Password changed', 'success');
      setPasswordForm({ ...DEFAULT_PASSWORD });
    } catch { showAlert('Failed to change password', 'error'); }
    finally { setChangingPassword(false); }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      if (activeTab === 'profile') { await handleSaveProfile(); return; }
      await saveSettingsMutation.mutateAsync({ userId: userData._id, settings });
      showAlert('Settings saved', 'success');
    } catch { showAlert('Failed to save settings', 'error'); }
    finally { setSaving(false); }
  };

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <SettingsPageShell
      title="Operator Settings"
      subtitle="Manage your account preferences and operational configurations"
      accentColor="blue"
      tabs={SETTINGS_TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      saving={saving}
      onSave={handleSaveSettings}
      onLogout={handleLogout}
    >
      <TabsContent value="profile" className="mt-0">
        <ProfileTab profile={profile} stats={stats} userData={userData} loading={loading}
          onProfileChange={handleProfileChange} onAvatarClick={handleAvatarClick}
          onAvatarFileChange={handleAvatarFileChange} fileInputRef={fileInputRef}
          passwordForm={passwordForm} showPassword={showPassword}
          onPasswordChange={handlePasswordChange} onTogglePassword={togglePassword}
          onChangePassword={handleChangePassword} changingPassword={changingPassword} />
      </TabsContent>
      <TabsContent value="data" className="mt-0">
        <DataSyncTab settings={settings} updateSetting={updateSetting} />
      </TabsContent>
      <TabsContent value="video" className="mt-0">
        <VideoAITab settings={settings} updateSetting={updateSetting} />
      </TabsContent>
      <TabsContent value="notifications" className="mt-0">
        <NotificationsTab settings={settings} updateSetting={updateSetting} />
      </TabsContent>
      <TabsContent value="preferences" className="mt-0">
        <PreferencesTab settings={settings} updateSetting={updateSetting} />
      </TabsContent>
      <TabsContent value="appearance" className="mt-0">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <AppearanceSettings />
          </CardContent>
        </Card>
      </TabsContent>
    </SettingsPageShell>
  );
};

export default function OperatorSettingsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
      <OperatorSettingsContent />
    </Suspense>
  );
}
