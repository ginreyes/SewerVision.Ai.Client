'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Lock,
  Save,
  Loader2,
  Camera,
  Mail,
  Phone,
  Building,
  Building2,
  Eye,
  EyeOff,
  LogOut,
  Upload,
  CheckCircle2,
  Pencil,
  X,
  Shield,
  MapPin,
  Factory,
  Users,
  Receipt,
  CreditCard,
  ImagePlus,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { api, getCookie } from '@/lib/helper';

function CustomerSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData, logout, updateUserData, refetchUser } = useUser();
  const { showAlert } = useAlert();

  const [activeSection, setActiveSection] = useState(searchParams.get('section') || 'profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileSnapshot, setProfileSnapshot] = useState(null);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    role: 'customer',
    avatar: null,
    companyName: '',
    industry: '',
    address: '',
    companySize: '',
    taxId: '',
    billingContact: '',
    companyLogo: null
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

  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    const section = searchParams.get('section');
    if (section) setActiveSection(section);
  }, [searchParams]);

  // Sync profile from UserContext — skip while user is editing or saving to avoid overwriting their changes
  useEffect(() => {
    if (userData && !isEditingProfile && !saving) {
      setProfile({
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone_number || '',
        department: userData.department || '',
        role: userData.role || 'customer',
        avatar: userData?.avatar || null,
        companyName: userData.company_name || '',
        industry: userData.industry || '',
        address: userData.address || '',
        companySize: userData.company_size || '',
        taxId: userData.tax_id || '',
        billingContact: userData.billing_contact || '',
        companyLogo: userData.company_logo || null
      });
    }
  }, [userData, isEditingProfile, saving]);

  const handleSectionChange = (value) => {
    setActiveSection(value);
    const params = new URLSearchParams(searchParams);
    params.set('section', value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Profile edit handlers
  const handleEditProfile = () => {
    setProfileSnapshot(JSON.parse(JSON.stringify(profile)));
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    if (profileSnapshot) setProfile(profileSnapshot);
    setProfileSnapshot(null);
    setIsEditingProfile(false);
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
        department: profile.department,
        company_name: profile.companyName,
        industry: profile.industry,
        address: profile.address,
        company_size: profile.companySize,
        tax_id: profile.taxId,
        billing_contact: profile.billingContact
      });

      if (response.ok) {
        if (updateUserData && response.data?.data) {
          updateUserData(response.data.data);
        }
        showAlert('Profile updated successfully', 'success');
        setProfileSnapshot(null);
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

    const userId = userData?._id;
    const username = userData?.username || getCookie('username');
    if (!userId && !username) {
      showAlert('Please refresh the page or log in again to update your avatar.', 'error');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      if (username) formData.append('username', username);

      const token = getCookie('authToken');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const uploadUrl = userId
        ? `${backendUrl}/api/users/upload-avatar/${userId}`
        : `${backendUrl}/api/users/upload-avatar`;
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json();

      if (res.ok) {
        const avatarUrlWithBust = `${data.avatarUrl}${data.avatarUrl?.includes('?') ? '&' : '?'}t=${Date.now()}`;
        setProfile((prev) => ({ ...prev, avatar: avatarUrlWithBust }));
        if (updateUserData) updateUserData({ ...userData, avatar: data.avatarUrl });
        if (refetchUser) await refetchUser();
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

  const handleLogoClick = () => logoInputRef.current?.click();

  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showAlert('Image size must be less than 5MB', 'error');
      return;
    }

    const userId = userData?._id;
    const username = userData?.username || getCookie('username');
    if (!userId && !username) {
      showAlert('Please refresh the page or log in again.', 'error');
      return;
    }

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('avatar', file);
      if (username) formData.append('username', username);

      const token = getCookie('authToken');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const uploadUrl = userId
        ? `${backendUrl}/api/users/upload-company-logo/${userId}`
        : `${backendUrl}/api/users/upload-company-logo`;
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json();

      if (res.ok) {
        const logoUrlWithBust = `${data.logoUrl}${data.logoUrl?.includes('?') ? '&' : '?'}t=${Date.now()}`;
        setProfile((prev) => ({ ...prev, companyLogo: logoUrlWithBust }));
        if (updateUserData) updateUserData({ ...userData, company_logo: data.filename });
        if (refetchUser) await refetchUser();
        showAlert('Company logo uploaded successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to upload company logo');
      }
    } catch (error) {
      console.error('Company logo upload error:', error);
      showAlert(error.message, 'error');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const getCompanyLogoUrl = () => {
    if (!profile.companyLogo) return null;
    if (profile.companyLogo.startsWith('http')) return profile.companyLogo;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    return `${backendUrl}/api/users/company-logo/${userData?._id}`;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showAlert('New passwords do not match', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showAlert('Password must be at least 6 characters', 'error');
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

  const sidebarItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8" data-tour="customer-settings">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account and personal information</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="text-gray-600" onClick={() => router.push('/customer/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <Card className="lg:w-64 h-fit border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-4 h-4 mr-3 ${activeSection === item.id ? 'text-teal-600' : 'text-gray-400'}`} />
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

        {/* Main Content */}
        <div className="flex-1 space-y-6">

          {/* ── Profile Section ── */}
          {activeSection === 'profile' && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      {isEditingProfile
                        ? 'Edit your profile details below.'
                        : 'View your details. Click Edit to make changes.'}
                    </CardDescription>
                  </div>
                  {!isEditingProfile ? (
                    <Button variant="outline" size="sm" onClick={handleEditProfile} className="gap-1.5">
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCancelEditProfile} className="gap-1.5">
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveProfile} disabled={saving} className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Avatar Section */}
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
                      <AvatarFallback className="bg-teal-100 text-teal-600 text-2xl">
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
                    <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-md border border-gray-100 pointer-events-none">
                      {loading ? <Loader2 className="w-4 h-4 text-teal-600 animate-spin" /> : <Upload className="w-4 h-4 text-gray-600" />}
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Customer {profile.department ? `\u2022 ${profile.department}` : ''}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                      <Badge variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-100">
                        Customer Portal
                      </Badge>
                      {userData?._id && (
                        <Badge variant="outline" className="text-gray-600">
                          ID: {String(userData._id).slice(-6).toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleAvatarClick} disabled={loading} className="flex-shrink-0">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Upload className="w-4 h-4 mr-1.5" />}
                    Update avatar
                  </Button>
                </div>

                <Separator />

                {/* Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-500">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleProfileChange}
                        className={`pl-9 ${isEditingProfile ? '' : 'bg-gray-50'}`}
                        disabled={!isEditingProfile}
                        readOnly={!isEditingProfile}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleProfileChange}
                        className={`pl-9 ${isEditingProfile ? '' : 'bg-gray-50'}`}
                        disabled={!isEditingProfile}
                        readOnly={!isEditingProfile}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        name="email"
                        value={profile.email}
                        className="pl-9 bg-gray-50"
                        disabled
                        readOnly
                        title="Contact admin to change email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                        className={`pl-9 ${isEditingProfile ? '' : 'bg-gray-50'}`}
                        placeholder="+1 (555) 000-0000"
                        disabled={!isEditingProfile}
                        readOnly={!isEditingProfile}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Company / Department</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        name="department"
                        value={profile.department}
                        onChange={handleProfileChange}
                        className={`pl-9 ${isEditingProfile ? '' : 'bg-gray-50'}`}
                        placeholder="e.g. Public Works"
                        disabled={!isEditingProfile}
                        readOnly={!isEditingProfile}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Company Section ── */}
          {activeSection === 'company' && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <Building2 className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <CardTitle>Company Information</CardTitle>
                      <CardDescription>
                        {isEditingProfile
                          ? 'Update your company details below.'
                          : 'Your organization details. Click Edit to make changes.'}
                      </CardDescription>
                    </div>
                  </div>
                  {!isEditingProfile ? (
                    <Button variant="outline" size="sm" onClick={handleEditProfile} className="gap-1.5">
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCancelEditProfile} className="gap-1.5">
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveProfile} disabled={saving} className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Logo */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <input
                    type="file"
                    ref={logoInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                  />
                  <div
                    className="relative group w-28 h-28 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-teal-300 transition-colors"
                    onClick={handleLogoClick}
                  >
                    {getCompanyLogoUrl() ? (
                      <>
                        <img
                          src={getCompanyLogoUrl()}
                          alt="Company Logo"
                          className="w-full h-full object-contain p-2"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-2">
                        {uploadingLogo ? (
                          <Loader2 className="w-6 h-6 text-teal-500 animate-spin mx-auto" />
                        ) : (
                          <>
                            <ImagePlus className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                            <span className="text-[10px] text-gray-400">Add Logo</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {profile.companyName || 'Your Company'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {profile.industry || 'Add your industry'}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                      <Button variant="outline" size="sm" onClick={handleLogoClick} disabled={uploadingLogo} className="text-xs">
                        {uploadingLogo ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Upload className="w-3 h-3 mr-1" />}
                        {getCompanyLogoUrl() ? 'Change Logo' : 'Upload Logo'}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-500">Company Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        name="companyName"
                        value={profile.companyName}
                        onChange={handleProfileChange}
                        className={`pl-9 ${isEditingProfile ? '' : 'bg-gray-50'}`}
                        placeholder="e.g. Acme Corp"
                        disabled={!isEditingProfile}
                        readOnly={!isEditingProfile}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Industry</Label>
                    <div className="relative">
                      <Factory className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        name="industry"
                        value={profile.industry}
                        onChange={handleProfileChange}
                        className={`pl-9 ${isEditingProfile ? '' : 'bg-gray-50'}`}
                        placeholder="e.g. Municipal Water, Construction"
                        disabled={!isEditingProfile}
                        readOnly={!isEditingProfile}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-500">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        name="address"
                        value={profile.address}
                        onChange={handleProfileChange}
                        className={`pl-9 ${isEditingProfile ? '' : 'bg-gray-50'}`}
                        placeholder="e.g. 123 Main St, Miami, FL 33101"
                        disabled={!isEditingProfile}
                        readOnly={!isEditingProfile}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Company Size</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      {isEditingProfile ? (
                        <Select
                          value={profile.companySize || "none"}
                          onValueChange={(val) => handleProfileChange({ target: { name: 'companySize', value: val === 'none' ? '' : val } })}
                        >
                          <SelectTrigger className="w-full pl-9">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Select size</SelectItem>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="200+">200+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={profile.companySize || 'Not specified'}
                          className="pl-9 bg-gray-50"
                          disabled
                          readOnly
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Tax ID</Label>
                    <div className="relative">
                      <Receipt className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        name="taxId"
                        value={profile.taxId}
                        onChange={handleProfileChange}
                        className={`pl-9 ${isEditingProfile ? '' : 'bg-gray-50'}`}
                        placeholder="e.g. 12-3456789"
                        disabled={!isEditingProfile}
                        readOnly={!isEditingProfile}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-500">Billing Contact Email</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        name="billingContact"
                        value={profile.billingContact}
                        onChange={handleProfileChange}
                        className={`pl-9 ${isEditingProfile ? '' : 'bg-gray-50'}`}
                        placeholder="billing@company.com"
                        disabled={!isEditingProfile}
                        readOnly={!isEditingProfile}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Security Section ── */}
          {activeSection === 'security' && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Shield className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                  </div>
                </div>
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
                  {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-sm text-red-500">Passwords do not match</p>
                  )}
                  <Button
                    type="submit"
                    disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}

export default function CustomerSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>}>
      <CustomerSettingsContent />
    </Suspense>
  );
}
