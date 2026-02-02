'use client'
import React, { useState, useEffect, useRef, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Bell, User, Shield, Settings, Camera, Moon, Globe, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useUser } from '@/components/providers/UserContext'
import { useAlert } from '@/components/providers/AlertProvider'
import { api } from '@/lib/helper'
import { useSearchParams } from 'next/navigation'

// Inner component that uses useSearchParams
const SettingPageContent = () => {
  const { userData } = useUser()
  const { showAlert } = useAlert()
  const fileInputRef = useRef(null)

  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile')

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Profile State
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    employeeId: '',
    avatar: ''
  })
  const [avatar, setAvatar] = useState('/avatar_default.png')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Notifications State
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    defectAlerts: true,
    inspectionReminders: true
  })
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)

  // Preferences State
  const [preferences, setPreferences] = useState({
    darkMode: false,
    language: 'en',
    timezone: 'Asia/Manila',
    measurementUnit: 'metric',
    photoQuality: 'high'
  })
  const [isSavingPreferences, setIsSavingPreferences] = useState(false)

  // Security State
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // Load user data and preferences on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const username = localStorage.getItem('username')
        if (!username) {
          showAlert('Please log in to view settings', 'error')
          setIsLoadingProfile(false)
          return
        }

        // Fetch user data
        const response = await api(`/api/users/get-user/${username}`, 'GET')
        if (response.ok && response.data?.user) {
          const user = response.data.user
          setProfile({
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            email: user.email || '',
            phoneNumber: user.phone_number || '',
            employeeId: user.license_number || '',
            avatar: user.avatar || ''
          })
          setAvatar(user.avatar || '/avatar_default.png')
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        showAlert('Failed to load user data', 'error')
      } finally {
        setIsLoadingProfile(false)
      }
    }

    // Load saved preferences from localStorage
    const savedNotifications = localStorage.getItem('qc_notifications')
    const savedPreferences = localStorage.getItem('qc_preferences')

    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (e) {
        console.error('Error parsing saved notifications:', e)
      }
    }

    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences))
      } catch (e) {
        console.error('Error parsing saved preferences:', e)
      }
    }

    loadUserData()
  }, [])

  // Profile Functions
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    const username = localStorage.getItem('username')

    if (!file) return
    if (!username) {
      showAlert('You are not logged in.', 'error')
      return
    }
    if (!file.type.startsWith('image/')) {
      showAlert('Only image files are accepted', 'error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showAlert('File size should be under 5MB.', 'error')
      return
    }

    const formData = new FormData()
    formData.append('avatar', file)
    formData.append('username', username)

    try {
      const { ok, data } = await api('/api/users/upload-avatar', 'POST', formData)

      if (ok) {
        showAlert('Avatar uploaded successfully', 'success')
        setAvatar(data.avatarUrl)
        setProfile(prev => ({ ...prev, avatar: data.avatarUrl }))
      } else {
        showAlert(data?.message || 'Failed to upload avatar', 'error')
      }
    } catch (err) {
      console.error(err)
      showAlert(err.message || 'Error uploading avatar', 'error')
    }
  }

  const handleSaveProfile = async () => {
    try {
      const username = localStorage.getItem('username')
      if (!username) {
        showAlert('You are not logged in.', 'error')
        return
      }

      setIsSavingProfile(true)

      const payload = {
        usernameOrEmail: username,
        first_name: profile.firstName,
        last_name: profile.lastName,
        avatar: avatar,
      }

      // If phone number exists in user model, add it
      if (profile.phoneNumber) {
        payload.phone_number = profile.phoneNumber
      }

      const { ok, data } = await api('/api/users/change-account', 'POST', payload)

      if (ok) {
        showAlert('Profile updated successfully!', 'success')
        // Update userData in context if available
        if (userData) {
          userData.first_name = profile.firstName
          userData.last_name = profile.lastName
          userData.avatar = avatar
        }
      } else {
        showAlert(data?.message || 'Failed to update profile', 'error')
      }
    } catch (err) {
      console.error(err)
      showAlert(err.message || 'Failed to update profile', 'error')
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Notifications Functions
  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true)
    try {
      // Save to localStorage (could be extended to backend API later)
      localStorage.setItem('qc_notifications', JSON.stringify(notifications))
      showAlert('Notification preferences saved successfully!', 'success')
    } catch (error) {
      showAlert('Failed to save notification preferences', 'error')
    } finally {
      setIsSavingNotifications(false)
    }
  }

  // Preferences Functions
  const handleSavePreferences = async () => {
    setIsSavingPreferences(true)
    try {
      // Save to localStorage (could be extended to backend API later)
      localStorage.setItem('qc_preferences', JSON.stringify(preferences))
      showAlert('Preferences saved successfully!', 'success')

      // Apply dark mode if changed
      if (preferences.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch (error) {
      showAlert('Failed to save preferences', 'error')
    } finally {
      setIsSavingPreferences(false)
    }
  }

  // Security Functions
  const handleChangePassword = async () => {
    if (security.newPassword !== security.confirmPassword) {
      showAlert('New password and confirm password do not match.', 'error')
      return
    }

    const passwordValid = /^(?=.*[a-z])(?=.*[\d\W]).{8,}$/.test(security.newPassword)
    if (!passwordValid) {
      showAlert(
        'Password must be at least 8 characters long and contain a lowercase letter and a digit or symbol.',
        'error'
      )
      return
    }

    const usernameOrEmail = localStorage.getItem('username')
    const token = localStorage.getItem('authToken')

    if (!usernameOrEmail || !token) {
      showAlert('Please log in to change password', 'error')
      return
    }

    try {
      setIsSavingPassword(true)

      const payload = {
        isChangePassword: true,
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
        usernameOrEmail,
      }

      const { ok, data } = await api(
        '/api/auth/change-password',
        'POST',
        payload,
        {
          Authorization: `Bearer ${token}`,
        }
      )

      if (ok) {
        showAlert('Password changed successfully!', 'success')
        setSecurity({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          twoFactorEnabled: security.twoFactorEnabled
        })
      } else {
        showAlert(data?.message || 'Failed to change password.', 'error')
      }
    } catch (err) {
      console.error('Error changing password:', err)
      showAlert(err.message || 'Failed to change password.', 'error')
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear the app cache? This will log you out.')) {
      localStorage.clear()
      window.location.href = '/login'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your QC technician preferences and account settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="w-4 h-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatar} alt="Profile" />
                  <AvatarFallback>
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 5MB</p>
                </div>
              </div>

              <Separator />

              {isLoadingProfile ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        placeholder="Juan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        placeholder="Dela Cruz"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-gray-50"
                      placeholder="juan.delacruz@company.com"
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phoneNumber}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      placeholder="+63 912 345 6789"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employee-id">License Number</Label>
                    <Input
                      id="employee-id"
                      value={profile.employeeId}
                      onChange={(e) => setProfile({ ...profile, employeeId: e.target.value })}
                      placeholder="QC-2024-001"
                    />
                  </div>
                  <Separator />
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="w-full sm:w-auto"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Alerts</Label>
                  <p className="text-sm text-gray-500">Receive inspection updates via email</p>
                </div>
                <Switch
                  checked={notifications.emailAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Alerts</Label>
                  <p className="text-sm text-gray-500">Get text messages for urgent issues</p>
                </div>
                <Switch
                  checked={notifications.smsAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, smsAlerts: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Defect Alerts</Label>
                  <p className="text-sm text-gray-500">Notify when defects are reported</p>
                </div>
                <Switch
                  checked={notifications.defectAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, defectAlerts: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Inspection Reminders</Label>
                  <p className="text-sm text-gray-500">Remind about scheduled inspections</p>
                </div>
                <Switch
                  checked={notifications.inspectionReminders}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, inspectionReminders: checked })}
                />
              </div>
              <Separator />
              <Button
                onClick={handleSaveNotifications}
                disabled={isSavingNotifications}
                className="w-full sm:w-auto"
              >
                {isSavingNotifications ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Preferences'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>QC Preferences</CardTitle>
              <CardDescription>Customize your inspection and display settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Dark Mode
                  </Label>
                  <p className="text-sm text-gray-500">Switch to dark theme</p>
                </div>
                <Switch
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, darkMode: checked })}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Language
                </Label>
                <Select value={preferences.language} onValueChange={(value) => setPreferences({ ...preferences, language: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="tl">Tagalog</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={preferences.timezone} onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Manila">Asia/Manila (PHT)</SelectItem>
                    <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Measurement Unit</Label>
                <Select value={preferences.measurementUnit} onValueChange={(value) => setPreferences({ ...preferences, measurementUnit: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metric (cm, kg)</SelectItem>
                    <SelectItem value="imperial">Imperial (in, lb)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Photo Quality
                </Label>
                <Select value={preferences.photoQuality} onValueChange={(value) => setPreferences({ ...preferences, photoQuality: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High (Best quality)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                    <SelectItem value="low">Low (Save storage)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <Button
                onClick={handleSavePreferences}
                disabled={isSavingPreferences}
                className="w-full sm:w-auto"
              >
                {isSavingPreferences ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Preferences'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={security.currentPassword}
                    onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={security.newPassword}
                    onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="rounded-lg bg-rose-50 p-4 border border-rose-200">
                <p className="text-sm font-semibold text-rose-900 mb-2">Password Requirements:</p>
                <ul className="text-xs text-rose-700 space-y-1 list-disc list-inside">
                  <li>Minimum 8 characters long</li>
                  <li>At least one lowercase letter</li>
                  <li>At least one number or symbol</li>
                </ul>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <Switch
                  checked={security.twoFactorEnabled}
                  onCheckedChange={(checked) => setSecurity({ ...security, twoFactorEnabled: checked })}
                />
              </div>
              {security.twoFactorEnabled && (
                <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
                  <p className="text-sm text-amber-800">
                    Two-factor authentication setup coming soon. This feature will require additional configuration.
                  </p>
                </div>
              )}
              <Separator />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleChangePassword}
                  disabled={isSavingPassword || !security.currentPassword || !security.newPassword || !security.confirmPassword}
                  className="flex-1"
                >
                  {isSavingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearCache}
                  className="flex-1"
                >
                  Clear App Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Loading fallback for Suspense
const SettingsPageLoading = () => (
  <div className="container mx-auto p-6 max-w-4xl">
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  </div>
)

// Main export wrapped in Suspense
const SettingPageQcSide = () => {
  return (
    <Suspense fallback={<SettingsPageLoading />}>
      <SettingPageContent />
    </Suspense>
  )
}

export default SettingPageQcSide