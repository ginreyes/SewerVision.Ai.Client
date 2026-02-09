'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Lock,
  Bell,
  Globe,
  Save,
  Loader2,
  Camera,
  Mail,
  Phone,
  Building,
  Eye,
  EyeOff,
  LogOut,
  Upload,
  CheckCircle2,
  Pencil
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { api, getCookie } from '@/lib/helper';

const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-center space-x-4 mb-6">
    <div className="p-2 bg-indigo-100 rounded-lg">
      <Icon className="w-6 h-6 text-indigo-600" />
    </div>
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

const ToggleSetting = ({ label, description, checked, onCheckedChange }) => (
  <div className="flex items-center justify-between py-4">
    <div className="space-y-0.5">
      <Label className="text-base font-medium text-gray-900">{label}</Label>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

function UserSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData, logout, updateUserData } = useUser();
  const { showAlert } = useAlert();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    role: 'user',
    avatar: null
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [settings, setSettings] = useState({
    emailProjectUpdates: true,
    emailTaskAssignments: true,
    emailDeleteRequestStatus: true,
    emailInboxAlerts: true,
    pushNotifications: true,
    theme: 'system',
    language: 'en'
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (userData) {
      setProfile({
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone_number || '',
        department: userData.department || '',
        role: userData.role || 'user',
        avatar: userData?.avatar || null
      });
    }
  }, [userData]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const username = getCookie('username');
      if (!username) throw new Error('User not identified');

      const response = await api(`/api/users/profile/${username}`, 'PATCH', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        department: profile.department
      });

      if (response.ok) {
        if (updateUserData && response.data?.data) {
          updateUserData(response.data.data);
        }
        showAlert('Profile updated successfully', 'success');
        setIsEditingProfile(false);
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert(error.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showAlert('Image size must be less than 5MB', 'error');
      return;
    }
    try {
      setLoading(true);
      const username = getCookie('username');
      if (!username) throw new Error('No username found');

      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('username', username);

      const token = getCookie('authToken');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/users/upload-avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();

      if (res.ok) {
        const avatarUrlWithBust = `${data.avatarUrl}${data.avatarUrl?.includes('?') ? '&' : '?'}t=${Date.now()}`;
        setProfile((prev) => ({ ...prev, avatar: avatarUrlWithBust }));
        if (updateUserData) updateUserData({ ...userData, avatar: data.avatarUrl });
        showAlert('Avatar uploaded successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      showAlert(error.message, 'error');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showAlert('New passwords do not match', 'error');
      return;
    }
    try {
      setSaving(true);
      const response = await api('/api/auth/change-password', 'POST', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      if (response.ok) {
        showAlert('Password changed successfully', 'success');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      showAlert(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await api('/api/settings/section/user', 'PATCH', { user: settings });
      if (response?.ok) {
        showAlert('Settings saved', 'success');
      } else {
        showAlert('Settings saved (local)', 'success');
      }
    } catch (e) {
      showAlert('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account and preferences as team lead</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-gray-600" onClick={() => router.push('/user/dashboard')}>
            Back to Dashboard
          </Button>
          <Button onClick={handleSaveSettings} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <Card className="lg:w-64 h-fit border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'preferences', label: 'Preferences', icon: Globe }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-4 h-4 mr-3 ${activeTab === item.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              ))}
              <Separator className="my-4" />
              <button
                onClick={logout}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </nav>
          </CardContent>
        </Card>

        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsContent value="profile" className="space-y-6 mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Your profile and contact details</CardDescription>
                    </div>
                    <Button
                      variant={isEditingProfile ? 'ghost' : 'outline'}
                      size="sm"
                      onClick={() => (isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true))}
                      className={isEditingProfile ? 'text-green-600 hover:text-green-700 bg-green-50' : ''}
                    >
                      {isEditingProfile ? (
                        <>
                          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                          Save Profile
                        </>
                      ) : (
                        <>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="flex flex-col items-center sm:flex-row gap-6">
                    <div className="relative group">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                      />
                      <Avatar
                        className="w-24 h-24 border-4 border-white shadow-lg cursor-pointer"
                        onClick={handleAvatarClick}
                      >
                        <AvatarImage src={profile.avatar} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600 text-2xl">
                          {profile.firstName?.[0]}
                          {profile.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={handleAvatarClick}
                      >
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-xl font-bold text-gray-900">
                        {profile.firstName} {profile.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Team Lead • {profile.department || 'Management'}
                      </p>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                          Management
                        </Badge>
                        {userData?._id && (
                          <Badge variant="outline" className="text-gray-600">
                            ID: {String(userData._id).slice(-6).toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleAvatarClick} disabled={loading}>
                      Change Avatar
                    </Button>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          name="firstName"
                          value={profile.firstName}
                          onChange={handleProfileChange}
                          className="pl-9"
                          disabled={!isEditingProfile}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          name="lastName"
                          value={profile.lastName}
                          onChange={handleProfileChange}
                          className="pl-9"
                          disabled={!isEditingProfile}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input name="email" value={profile.email} className="pl-9 bg-gray-50" disabled title="Contact admin to change email" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          name="phone"
                          value={profile.phone}
                          onChange={handleProfileChange}
                          className="pl-9"
                          placeholder="+1 (555) 000-0000"
                          disabled={!isEditingProfile}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          name="department"
                          value={profile.department}
                          onChange={handleProfileChange}
                          className="pl-9"
                          placeholder="e.g. Operations"
                          disabled={!isEditingProfile}
                        />
                      </div>
                    </div>
                  </div>

                  {isEditingProfile && (
                    <div className="flex justify-end pt-4">
                      <Button variant="ghost" onClick={() => setIsEditingProfile(false)} className="mr-2">
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={saving} className="bg-indigo-600">
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Update your password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          type={showPassword.current ? 'text' : 'password'}
                          className="pl-9 pr-10"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          type={showPassword.new ? 'text' : 'password'}
                          className="pl-9 pr-10"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <div className="relative">
                        <CheckCircle2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          type={showPassword.confirm ? 'text' : 'password'}
                          className="pl-9 pr-10"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    >
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <SectionHeader
                    icon={Bell}
                    title="Notification preferences"
                    description="Choose what updates you receive by email and in-app"
                  />
                </CardHeader>
                <CardContent className="space-y-2">
                  <ToggleSetting
                    label="Project updates"
                    description="Email when project status or progress changes"
                    checked={settings.emailProjectUpdates}
                    onCheckedChange={(v) => updateSetting('emailProjectUpdates', v)}
                  />
                  <Separator />
                  <ToggleSetting
                    label="Task assignments"
                    description="Email when new tasks are assigned to your team"
                    checked={settings.emailTaskAssignments}
                    onCheckedChange={(v) => updateSetting('emailTaskAssignments', v)}
                  />
                  <Separator />
                  <ToggleSetting
                    label="Delete request status"
                    description="Email when admin approves or rejects a project deletion request"
                    checked={settings.emailDeleteRequestStatus}
                    onCheckedChange={(v) => updateSetting('emailDeleteRequestStatus', v)}
                  />
                  <Separator />
                  <ToggleSetting
                    label="Inbox alerts"
                    description="Email for new messages or notifications in your inbox"
                    checked={settings.emailInboxAlerts}
                    onCheckedChange={(v) => updateSetting('emailInboxAlerts', v)}
                  />
                  <Separator />
                  <ToggleSetting
                    label="Browser notifications"
                    description="Show in-app or browser push notifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(v) => updateSetting('pushNotifications', v)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6 mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <SectionHeader
                    icon={Globe}
                    title="App preferences"
                    description="Theme and language"
                  />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <select
                      value={settings.theme}
                      onChange={(e) => updateSetting('theme', e.target.value)}
                      className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                    <p className="text-sm text-gray-500">Match your system or choose light/dark</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <select
                      value={settings.language}
                      onChange={(e) => updateSetting('language', e.target.value)}
                      className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="en">English</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default function UserSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>}>
      <UserSettingsContent />
    </Suspense>
  );
}
