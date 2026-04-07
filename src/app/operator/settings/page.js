'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, Loader2, LogOut } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { getCookie } from '@/lib/helper';
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
          ? (userData.avatar.startsWith('http') ? userData.avatar : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/users/avatar/${userData._id}?t=${Date.now()}`)
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/users/upload-avatar/${userData._id}`, {
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
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operator Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account preferences and operational configurations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-gray-600" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleSaveSettings} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <Card className="lg:w-64 h-fit border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {SETTINGS_TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-100">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </nav>
          </CardContent>
        </Card>

        <div className="flex-1 min-w-0">
          <Tabs value={activeTab}>
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
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default function OperatorSettingsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
      <OperatorSettingsContent />
    </Suspense>
  );
}
