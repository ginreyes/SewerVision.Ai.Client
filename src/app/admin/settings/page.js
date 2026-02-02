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
  Shield,
  Eye,
  EyeOff,
  LogOut,
  Upload,
  CheckCircle2,
  Pencil,
  Server,
  Activity,
  BrainCircuit,
  Settings as SettingsIcon,
  RefreshCcw,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { api } from '@/lib/helper';
import settingsApi from '@/data/settingsApi';

// --- Components ---

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

function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData, logout, updateUserData, userId } = useUser();
  const { showAlert } = useAlert();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    role: 'Admin',
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

  const fileInputRef = useRef(null);

  // --- Admin Settings State ---
  const [confidenceThreshold, setConfidenceThreshold] = useState([75]);
  const [selectedModels, setSelectedModels] = useState({
    fractures: true,
    cracks: true,
    brokenPipes: true,
    roots: true,
    corrosion: false,
    blockages: false,
  });
  const [streamQuality, setStreamQuality] = useState('high');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [qcWorkflow, setQcWorkflow] = useState({
    defaultReviewPriority: 'high-confidence',
    annotationTools: {
      defectTags: true,
      measurements: true,
      severityRatings: true,
      repairRecommendations: true,
    },
    autoAssignMethod: 'round-robin',
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationChannels, setNotificationChannels] = useState({
    email: true,
    sms: false,
    inApp: true,
  });
  const [adminAlerts, setAdminAlerts] = useState({
    aiProcessingErrors: true,
    qcReviewBacklog: true,
    storageUsageHigh: false,
  });
  const [feedbackLoopEnabled, setFeedbackLoopEnabled] = useState(true);
  const [trainingFrequency, setTrainingFrequency] = useState('weekly');
  const [minAnnotations, setMinAnnotations] = useState(50);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    accuracy: 92.4,
    falsePositiveRate: 6.1,
    lastModelUpdate: null,
    nextTrainingScheduled: null,
  });
  const [modelVersion, setModelVersion] = useState('v2.1.4');
  const [uploadedModel, setUploadedModel] = useState(null);
  const [systemAdmin, setSystemAdmin] = useState({
    maintenanceMode: false,
    debugMode: false,
    logRetentionDays: 30,
  });
  const [awsConfig, setAwsConfig] = useState({
    bucket: '',
    region: 'us-east-1',
    accessKey: '',
    secretKey: '',
    showSecret: false,
  });
  const [logs, setLogs] = useState([
    { id: 1, timestamp: '2025-04-04 10:22:01', level: 'INFO', message: 'AI model v2.1.4 loaded successfully' },
    { id: 2, timestamp: '2025-04-04 09:45:33', level: 'WARN', message: 'High latency detected in stream segment #8812' },
    { id: 3, timestamp: '2025-04-04 08:30:12', level: 'ERROR', message: 'Failed to upload video segment #7709 – retrying...' },
  ]);

  // Sync URL param changes to state
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
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
        role: userData.role || 'Admin',
        avatar: userData.avatar || null
      });
    }
  }, [userData]);

  // Fetch Admin Settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsApi.getSettings();
      const settings = response.data || {}; // Ensure settings is an object

      if (settings.aiModels) {
        setSelectedModels(settings.aiModels.selectedModels || {});
        setConfidenceThreshold([settings.aiModels.confidenceThreshold || 75]);
      }
      if (settings.cloudStreaming) {
        setStreamQuality(settings.cloudStreaming.streamQuality || 'high');
        setAutoSaveEnabled(settings.cloudStreaming.autoSaveEnabled ?? true);
      }
      if (settings.qcWorkflow) {
        setQcWorkflow(settings.qcWorkflow || {});
      }
      if (settings.notifications) {
        setNotificationsEnabled(settings.notifications.notifyCustomerOnDeliverables ?? true);
        setNotificationChannels(settings.notifications.channels || {});
        setAdminAlerts(settings.notifications.adminAlerts || {});
      }
      if (settings.aiLearning) {
        setFeedbackLoopEnabled(settings.aiLearning.feedbackLoopEnabled ?? true);
        setTrainingFrequency(settings.aiLearning.trainingFrequency || 'weekly');
        setMinAnnotations(settings.aiLearning.minAnnotationsPerDefect || 50);
        if (settings.aiLearning.performanceMetrics) {
          setPerformanceMetrics(prev => ({
            ...prev,
            ...settings.aiLearning.performanceMetrics
          }));
        }
      }
      if (settings.awsConfig) {
        setAwsConfig(prev => ({
          ...prev,
          bucket: settings.awsConfig.bucket || '',
          region: settings.awsConfig.region || 'us-east-1',
          accessKey: settings.awsConfig.accessKeyId || '',
          secretKey: settings.awsConfig.secretAccessKey || '',
        }));
      }
      if (settings.systemAdmin) {
        setModelVersion(settings.systemAdmin.currentModelVersion || 'v2.1.4');
        setSystemAdmin({
          maintenanceMode: settings.systemAdmin.maintenanceMode ?? false,
          debugMode: settings.systemAdmin.debugMode ?? false,
          logRetentionDays: settings.systemAdmin.logRetentionDays || 30,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Instead of alerting, just log it, as default values are already set
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // --- Profile Handlers ---

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert('Image size must be less than 5MB', 'error');
      return;
    }

    try {
      setSaving(true);
      const username = localStorage.getItem('username');
      if (!username) throw new Error("No username found");

      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('username', username);

      const token = localStorage.getItem('token');
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
      setSaving(false);
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

  // --- Admin Settings Handlers ---
  const saveSettings = async (section) => {
    if (!userId) {
      showAlert('User not logged in', 'error');
      return;
    }
    setSaving(true);
    try {
      switch (section) {
        case 'ai-models':
          await settingsApi.updateAIModels({ selectedModels, confidenceThreshold: confidenceThreshold[0] }, userId);
          break;
        case 'cloud-streaming':
          await settingsApi.updateCloudStreaming({ streamQuality, autoSaveEnabled }, userId);
          break;
        case 'qc-workflow':
          await settingsApi.updateQCWorkflow(qcWorkflow, userId);
          break;
        case 'notifications':
          await settingsApi.updateNotifications({ notifyCustomerOnDeliverables: notificationsEnabled, channels: notificationChannels, adminAlerts }, userId);
          break;
        case 'ai-learning':
          await settingsApi.updateAILearning({ feedbackLoopEnabled, trainingFrequency, minAnnotationsPerDefect: minAnnotations }, userId);
          break;
        case 'aws-config':
          await settingsApi.updateAWSConfig({ bucket: awsConfig.bucket, region: awsConfig.region, accessKeyId: awsConfig.accessKey, secretAccessKey: awsConfig.secretKey }, userId);
          break;
        case 'system-admin':
          await settingsApi.updateSystemAdmin({ currentModelVersion: modelVersion, maintenanceMode: systemAdmin.maintenanceMode, debugMode: systemAdmin.debugMode, logRetentionDays: systemAdmin.logRetentionDays }, userId);
          break;
      }
      showAlert('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings', error);
      showAlert('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSection = async (section) => {
    if (!userId) return;
    try {
      await settingsApi.resetSettings(section, userId);
      fetchSettings();
      showAlert('Settings reset to defaults', 'success');
    } catch (e) {
      showAlert('Failed to reset settings', 'error');
    }
  }

  const handleModelToggle = (key) => {
    setSelectedModels(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedModel(file);
      showAlert(`Model file "${file.name}" selected. Click Deploy to apply.`, 'info');
    }
  };

  const toggleSecretKey = () => setAwsConfig(prev => ({ ...prev, showSecret: !prev.showSecret }));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-500 mt-1">Manage system configurations and personal preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-gray-600 gap-2" onClick={fetchSettings}>
            <RefreshCcw className="w-4 h-4" /> Refresh
          </Button>
          <Button onClick={() => {
            // Redirect to active tab's save handler or generic save
            if (activeTab === 'profile') {
              if (isEditingProfile) handleSaveProfile();
            } else {
              saveSettings(activeTab);
            }
          }} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
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
                { id: 'ai-models', label: 'AI Models', icon: BrainCircuit },
                { id: 'cloud-streaming', label: 'Cloud & Stream', icon: HardDrive },
                { id: 'qc-workflow', label: 'QC Workflow', icon: Activity },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'ai-learning', label: 'AI Learning', icon: Cpu },
                { id: 'aws-config', label: 'AWS Config', icon: Server },
                { id: 'system-admin', label: 'System Admin', icon: SettingsIcon },
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
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center sm:flex-row gap-6">
                    <div className="relative group">
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarFileChange} />
                      <Avatar className="w-24 h-24 border-4 border-white shadow-lg cursor-pointer" onClick={handleAvatarClick}>
                        <AvatarImage src={profile.avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                          {profile.firstName?.[0]}{profile.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleAvatarClick}>
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h3>
                      <p className="text-sm text-gray-500">{profile.role} • {profile.department || 'Administration'}</p>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">Super Admin</Badge>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  {/* Profile Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input name="firstName" value={profile.firstName} onChange={handleProfileChange} disabled={!isEditingProfile} />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input name="lastName" value={profile.lastName} onChange={handleProfileChange} disabled={!isEditingProfile} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input name="email" value={profile.email} disabled className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input name="phone" value={profile.phone} onChange={handleProfileChange} disabled={!isEditingProfile} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Card */}
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
                        <Input type={showPassword.current ? 'text' : 'password'} value={passwordForm.currentPassword} onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))} />
                        <button type="button" onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))} className="absolute right-3 top-2.5 text-gray-400">
                          {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <div className="relative">
                        <Input type={showPassword.new ? 'text' : 'password'} value={passwordForm.newPassword} onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))} />
                        <button type="button" onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))} className="absolute right-3 top-2.5 text-gray-400">
                          {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <div className="relative">
                        <Input type={showPassword.confirm ? 'text' : 'password'} value={passwordForm.confirmPassword} onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))} />
                        <button type="button" onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))} className="absolute right-3 top-2.5 text-gray-400">
                          {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword}>Update Password</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- AI Models Tab --- */}
            <TabsContent value="ai-models" className="space-y-6 mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <SectionHeader icon={BrainCircuit} title="AI Detection Models" description="Configure detection models and sensitivity" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {Object.entries(selectedModels).map(([key, enabled]) => (
                      <ToggleSetting key={key} label={key.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase())} checked={enabled} onCheckedChange={() => handleModelToggle(key)} description={`Enable detection for ${key}`} />
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Confidence Threshold: {confidenceThreshold[0]}%</Label>
                    <Slider value={confidenceThreshold} onValueChange={setConfidenceThreshold} min={50} max={99} step={1} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={() => handleResetSection('aiModels')} className="gap-2"><RotateCcw className="w-4 h-4" /> Reset Defaults</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* --- Cloud & Streaming --- */}
            <TabsContent value="cloud-streaming" className="space-y-6 mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <SectionHeader icon={HardDrive} title="Cloud & Streaming" description="Manage data upload and stream quality" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Stream Quality</Label>
                    <Select value={streamQuality} onValueChange={setStreamQuality}>
                      <SelectTrigger><SelectValue placeholder="Select Quality" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Faster)</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High (Best Quality)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <ToggleSetting label="Auto-Save Processed Data" description="Automatically save data to cloud" checked={autoSaveEnabled} onCheckedChange={setAutoSaveEnabled} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- QC Workflow --- */}
            <TabsContent value="qc-workflow" className="space-y-6 mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <SectionHeader icon={Activity} title="QC Workflow" description="Configure Quality Control review process" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Default Review Priority</Label>
                    <Select value={qcWorkflow.defaultReviewPriority} onValueChange={(val) => setQcWorkflow(prev => ({ ...prev, defaultReviewPriority: val }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high-confidence">High Confidence First</SelectItem>
                        <SelectItem value="low-confidence">Low Confidence First</SelectItem>
                        <SelectItem value="chronological">Chronological</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Annotation Tools</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(qcWorkflow.annotationTools).map(([key, enabled]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Switch checked={enabled} onCheckedChange={(val) => setQcWorkflow(prev => ({ ...prev, annotationTools: { ...prev.annotationTools, [key]: val } }))} />
                          <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- Notifications --- */}
            <TabsContent value="notifications" className="space-y-6 mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <SectionHeader icon={Bell} title="System Notifications" description="Manage alerts and notifications" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <ToggleSetting label="Notify Customer on Deliverables" description="Auto-email customer when report ready" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                  <Separator />
                  <div className="space-y-2">
                    <Label>Admin Alerts</Label>
                    <div className="space-y-2">
                      {Object.entries(adminAlerts).map(([key, enabled]) => (
                        <ToggleSetting key={key} label={key.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase())} checked={enabled} onCheckedChange={(val) => setAdminAlerts(prev => ({ ...prev, [key]: val }))} description="Enable system alert" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- AI Learning --- */}
            <TabsContent value="ai-learning" className="space-y-6 mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <SectionHeader icon={Cpu} title="AI Learning Loop" description="Configure continuous learning parameters" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <ToggleSetting label="Feedback Loop" description="Enable automated training from QC data" checked={feedbackLoopEnabled} onCheckedChange={setFeedbackLoopEnabled} />
                  <div className="space-y-2">
                    <Label>Training Frequency</Label>
                    <Select value={trainingFrequency} onValueChange={setTrainingFrequency}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Metrics</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>Accuracy: {performanceMetrics.accuracy}%</li>
                      <li>FPR: {performanceMetrics.falsePositiveRate}%</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- AWS Config --- */}
            <TabsContent value="aws-config" className="space-y-6 mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <SectionHeader icon={Server} title="AWS Storage Config" description="S3 Bucket and credentials" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bucket Name</Label>
                      <Input value={awsConfig.bucket} onChange={e => setAwsConfig(prev => ({ ...prev, bucket: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Region</Label>
                      <Select value={awsConfig.region} onValueChange={val => setAwsConfig(prev => ({ ...prev, region: val }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us-east-1">us-east-1</SelectItem>
                          <SelectItem value="us-west-2">us-west-2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Access Key ID</Label>
                    <Input value={awsConfig.accessKey} onChange={e => setAwsConfig(prev => ({ ...prev, accessKey: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Secret Access Key</Label>
                    <div className="flex">
                      <Input type={awsConfig.showSecret ? "text" : "password"} value={awsConfig.secretKey} onChange={e => setAwsConfig(prev => ({ ...prev, secretKey: e.target.value }))} className="flex-1" />
                      <Button variant="outline" size="icon" onClick={toggleSecretKey} className="ml-2">{awsConfig.showSecret ? '🙈' : '👁️'}</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- System Admin --- */}
            <TabsContent value="system-admin" className="space-y-6 mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <SectionHeader icon={SettingsIcon} title="System Maintenance" description="Advanced controls and logs" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <ToggleSetting label="Maintenance Mode" description="Disable public access" checked={systemAdmin.maintenanceMode} onCheckedChange={(val) => setSystemAdmin(prev => ({ ...prev, maintenanceMode: val }))} />
                  <ToggleSetting label="Debug Mode" description="Enable verbose logging" checked={systemAdmin.debugMode} onCheckedChange={(val) => setSystemAdmin(prev => ({ ...prev, debugMode: val }))} />
                  <Separator />
                  <div>
                    <Label>System Logs</Label>
                    <div className="mt-2 border rounded-md max-h-48 overflow-auto">
                      <Table>
                        <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Level</TableHead><TableHead>Message</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {logs.map(log => (
                            <TableRow key={log.id}>
                              <TableCell className="text-xs">{log.timestamp}</TableCell>
                              <TableCell><Badge variant={log.level === 'INFO' ? 'default' : log.level === 'WARN' ? 'secondary' : 'destructive'}>{log.level}</Badge></TableCell>
                              <TableCell className="text-sm">{log.message}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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

const SettingsPageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Loader2 className="animate-spin h-8 w-8 text-blue-500 mx-auto" />
      <span className="ml-2 mt-2 block text-gray-500">Loading settings...</span>
    </div>
  </div>
);

const SettingsPage = () => {
  return (
    <Suspense fallback={<SettingsPageLoading />}>
      <SettingsPageContent />
    </Suspense>
  );
};

export default SettingsPage;