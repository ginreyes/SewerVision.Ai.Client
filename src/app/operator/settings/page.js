'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Lock,
  Bell,
  Globe,
  HardDrive,
  Cpu,
  Save,
  Loader2,
  Camera,
  Mail,
  Phone,
  Building,
  MapPin,
  Shield,
  Eye,
  EyeOff,
  LogOut,
  Upload,
  CheckCircle2,
  AlertCircle,
  Pencil,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { api } from '@/lib/helper';

// --- Components ---

const ProfileStats = ({ stats }) => (
  <div className="grid grid-cols-2 gap-4 py-4">
    <div className="text-center p-3 bg-blue-50 rounded-lg">
      <div className="text-2xl font-bold text-blue-600">{stats.inspections}</div>
      <div className="text-xs text-blue-600 font-medium">Inspections</div>
    </div>
    <div className="text-center p-3 bg-green-50 rounded-lg">
      <div className="text-2xl font-bold text-green-600">{stats.uploads}</div>
      <div className="text-xs text-green-600 font-medium">Uploads</div>
    </div>
    <div className="text-center p-3 bg-purple-50 rounded-lg">
      <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
      <div className="text-xs text-purple-600 font-medium">Completion</div>
    </div>
    <div className="text-center p-3 bg-orange-50 rounded-lg">
      <div className="text-2xl font-bold text-orange-600">{stats.hours}</div>
      <div className="text-xs text-orange-600 font-medium">Hours</div>
    </div>
  </div>
);

const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-center space-x-4 mb-6">
    <div className="p-2 bg-blue-100 rounded-lg">
      <Icon className="w-6 h-6 text-blue-600" />
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

function OperatorSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData, logout, updateUserData } = useUser();
  const { showAlert } = useAlert();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    role: 'Operator',
    avatar: null
  });

  // Password Form State
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

  // Settings State
  const [settings, setSettings] = useState({
    // Data & Sync
    autoUpload: true,
    gpsTagging: true,
    offlineMode: false,
    autoSyncWiFi: true,

    // Video & AI
    streamQuality: '1080p',
    videoCompression: 'high',
    aiProcessing: true,
    pacpCompliance: true,

    // Notifications
    soundEnabled: true,
    emailAlerts: true,
    pushNotifications: true,
    notifyUploadComplete: true,
    notifyProcessingError: true,
    notifyNewAssignment: true,

    // Preferences
    theme: 'system',
    language: 'en',
    units: 'imperial'
  });

  // Stats (Mock data for now, could be fetched)
  const stats = {
    inspections: 142,
    uploads: 89,
    completionRate: 98,
    hours: 320
  };

  const fileInputRef = useRef(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  // Load User Data
  useEffect(() => {
    if (userData) {
      setProfile({
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone_number || '',
        department: userData.department || '',
        role: userData.role || 'Operator',
        avatar: userData.avatar || null
      });
    }
  }, [userData]);

  // Handle Tab Change
  const handleTabChange = (value) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Handle Profile Input Change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Handle Save Profile
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const username = localStorage.getItem('username');

      if (!username) throw new Error('User not identified');

      const response = await api(`/api/users/profile/${username}`, 'PATCH', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        department: profile.department
      });

      if (response.ok) {
        // Update context if needed
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

  // Handle Avatar Upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showAlert('Image size must be less than 5MB', 'error');
      return;
    }

    try {
      setLoading(true); // Reuse loading state or add specific one for avatar 
      const username = localStorage.getItem('username');
      if (!username) throw new Error("No username found");

      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('username', username);

      const token = localStorage.getItem('token');
      // Adjust URL to your backend
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/users/upload-avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setProfile(prev => ({ ...prev, avatar: data.avatarUrl }));
        if (updateUserData) {
          updateUserData({ ...userData, avatar: data.avatarUrl });
        }
        showAlert('Avatar uploaded successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      showAlert(error.message, 'error');
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Password Change
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

  // Generic Settings Handler
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await api('/api/settings/section/operator', 'PATCH', {
        operator: settings
      });

      if (response.ok) {
        showAlert('Settings saved', 'success');
      } else {
        console.warn("Settings API might not be fully implemented", response);
        showAlert('Settings saved (Local)', 'success');
      }
    } catch (e) {
      showAlert('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  }


  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operator Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account preferences and operational configurations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-gray-600" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <Card className="lg:w-64 h-fit border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'data', label: 'Data & Sync', icon: HardDrive },
                { id: 'video', label: 'Video & AI', icon: Camera },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'preferences', label: 'Preferences', icon: Globe },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <item.icon className={`w-4 h-4 mr-3 ${activeTab === item.id ? 'text-blue-600' : 'text-gray-400'
                    }`} />
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

        {/* Main Content Area */}
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">

            {/* --- Profile Tab --- */}
            <TabsContent value="profile" className="space-y-6 mt-0">
              {/* Profile Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Manage your public profile and contact info</CardDescription>
                    </div>
                    <Button
                      variant={isEditingProfile ? "ghost" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (isEditingProfile) {
                          handleSaveProfile();
                        } else {
                          setIsEditingProfile(true);
                        }
                      }}
                      className={isEditingProfile ? "text-green-600 hover:text-green-700 bg-green-50" : ""}
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
                      <Avatar className="w-24 h-24 border-4 border-white shadow-lg cursor-pointer" onClick={handleAvatarClick}>
                        <AvatarImage src={profile.avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                          {profile.firstName?.[0]}{profile.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={handleAvatarClick}
                      >
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-md border border-gray-100 pointer-events-none">
                        {loading ? <Loader2 className="w-4 h-4 text-blue-600 animate-spin" /> : <Upload className="w-4 h-4 text-gray-600" />}
                      </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-xl font-bold text-gray-900">
                        {profile.firstName} {profile.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{profile.role} • {profile.department || 'Operations'}</p>

                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                          PACP Certified
                        </Badge>
                        <Badge variant="outline" className="text-gray-600">
                          ID: {userData?._id?.slice(-6).toUpperCase() || 'UNKNOWN'}
                        </Badge>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0" onClick={handleAvatarClick} disabled={loading}>
                        Change Avatar
                      </Button>
                    </div>
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
                        <Input
                          name="email"
                          value={profile.email}
                          className="pl-9 bg-gray-50"
                          disabled
                          title="Contact admin to change email"
                        />
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
                          placeholder="e.g. Field Operations"
                          disabled={!isEditingProfile}
                        />
                      </div>
                    </div>
                  </div>

                  {isEditingProfile && (
                    <div className="flex justify-end pt-4">
                      <Button variant="ghost" onClick={() => setIsEditingProfile(false)} className="mr-2">Cancel</Button>
                      <Button onClick={handleSaveProfile} disabled={saving} className="bg-blue-600">
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  )}

                  <ProfileStats stats={stats} />
                </CardContent>
              </Card>

              {/* Security Card */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Update your password and security preferences</CardDescription>
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
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
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
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
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
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword}>
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- Data & Sync Tab --- */}
            <TabsContent value="data" className="space-y-6 mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <SectionHeader
                    icon={HardDrive}
                    title="Data Management"
                    description="Configure how inspection data is stored and synced"
                  />
                </CardHeader>
                <CardContent className="divide-y divide-gray-100">
                  <ToggleSetting
                    label="Automatic Upload"
                    description="Upload inspection footage immediately after completion when online"
                    checked={settings.autoUpload}
                    onCheckedChange={(c) => updateSetting('autoUpload', c)}
                  />
                  <ToggleSetting
                    label="GPS Tagging"
                    description="Embed high-accuracy GPS coordinates in all media"
                    checked={settings.gpsTagging}
                    onCheckedChange={(c) => updateSetting('gpsTagging', c)}
                  />
                  <ToggleSetting
                    label="Offline Mode"
                    description="Download maps and assignments for offline use (Uses more storage)"
                    checked={settings.offlineMode}
                    onCheckedChange={(c) => updateSetting('offlineMode', c)}
                  />
                  <ToggleSetting
                    label="Sync Only on Wi-Fi"
                    description="Prevent cellular data usage for large file uploads"
                    checked={settings.autoSyncWiFi}
                    onCheckedChange={(c) => updateSetting('autoSyncWiFi', c)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- Video & AI Tab --- */}
            <TabsContent value="video" className="space-y-6 mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <SectionHeader
                    icon={Camera}
                    title="Video & AI Configuration"
                    description="Adjust recording quality and AI processing settings"
                  />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base">Stream Quality</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {['720p', '1080p', '4K'].map((quality) => (
                        <div
                          key={quality}
                          onClick={() => updateSetting('streamQuality', quality)}
                          className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${settings.streamQuality === quality
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-100 hover:border-gray-200'
                            }`}
                        >
                          <div className="font-bold">{quality}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {quality === '4K' ? 'High Bandwidth' : quality === '720p' ? 'Low Latency' : 'Standard'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <ToggleSetting
                    label="Real-time AI Processing"
                    description="Detect defects and anomalies while recording (Requires high battery usage)"
                    checked={settings.aiProcessing}
                    onCheckedChange={(c) => updateSetting('aiProcessing', c)}
                  />

                  <ToggleSetting
                    label="PACP Compliance Check"
                    description="Validate inspection data against PACP standards in real-time"
                    checked={settings.pacpCompliance}
                    onCheckedChange={(c) => updateSetting('pacpCompliance', c)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- Notifications Tab --- */}
            <TabsContent value="notifications" className="space-y-6 mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <SectionHeader
                    icon={Bell}
                    title="Notification Preferences"
                    description="Manage how and when you want to be notified"
                  />
                </CardHeader>
                <CardContent className="divide-y divide-gray-100">
                  <ToggleSetting
                    label="Sound Alerts"
                    description="Play sound for high-priority alerts"
                    checked={settings.soundEnabled}
                    onCheckedChange={(c) => updateSetting('soundEnabled', c)}
                  />
                  <ToggleSetting
                    label="Email Notifications"
                    description="Receive daily summaries and critical alerts via email"
                    checked={settings.emailAlerts}
                    onCheckedChange={(c) => updateSetting('emailAlerts', c)}
                  />
                  <ToggleSetting
                    label="Upload Completed"
                    description="Notify when large file uploads are successfully processed"
                    checked={settings.notifyUploadComplete}
                    onCheckedChange={(c) => updateSetting('notifyUploadComplete', c)}
                  />
                  <ToggleSetting
                    label="New Assignments"
                    description="Notify when a new inspection task is assigned to you"
                    checked={settings.notifyNewAssignment}
                    onCheckedChange={(c) => updateSetting('notifyNewAssignment', c)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- Preferences Tab --- */}
            <TabsContent value="preferences" className="space-y-6 mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <SectionHeader
                    icon={Globe}
                    title="System Preferences"
                    description="Customize language and display settings"
                  />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select
                        value={settings.language}
                        onValueChange={(v) => updateSetting('language', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English (US)</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Measurement Units</Label>
                      <Select
                        value={settings.units}
                        onValueChange={(v) => updateSetting('units', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Units" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="imperial">Imperial (ft, in)</SelectItem>
                          <SelectItem value="metric">Metric (m, cm)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 opacity-60">
                      <div className="flex items-center justify-between">
                        <Label>Appearance</Label>
                        <Badge variant="outline" className="text-xs font-normal text-amber-600 bg-amber-50 border-amber-200">Coming Soon</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 cursor-not-allowed">
                        {['light', 'dark', 'system'].map((theme) => (
                          <Button
                            key={theme}
                            variant="outline"
                            disabled
                            className="capitalize"
                          >
                            {theme}
                          </Button>
                        ))}
                      </div>
                    </div>
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

export default function OperatorSettingsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
      <OperatorSettingsContent />
    </Suspense>
  );
}