'use client'
import React, { useState, useEffect, useRef, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Bell,
  User,
  Shield,
  Settings,
  Camera,
  Moon,
  Globe,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Save,
  CheckCircle2,
  RefreshCcw,
  Smartphone,
  Mail
} from 'lucide-react'
import { useUser } from '@/components/providers/UserContext'
import { useAlert } from '@/components/providers/AlertProvider'
import { api } from '@/lib/helper'
import { useSearchParams, useRouter } from 'next/navigation'

// Helper Components
const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-center space-x-4 mb-6">
    <div className="p-2 bg-rose-100 rounded-lg">
      <Icon className="w-6 h-6 text-rose-600" />
    </div>
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
)

const ToggleSetting = ({ label, description, checked, onCheckedChange, icon: Icon }) => (
  <div className="flex items-center justify-between py-4">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="w-4 h-4 text-gray-500" />}
      <div className="space-y-0.5">
        <Label className="text-base font-medium text-gray-900">{label}</Label>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
)

// Inner component logic
const SettingPageContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userData, logout } = useUser() // Added logout
  const { showAlert } = useAlert()
  const fileInputRef = useRef(null)

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile')

  // Sync with URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) setActiveTab(tab)
  }, [searchParams])

  const handleTabChange = (value) => {
    setActiveTab(value)
    // Update URL without reload
    const params = new URLSearchParams(searchParams)
    params.set('tab', value)
    router.replace(`?${params.toString()}`)
  }

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

  // Load Data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const username = localStorage.getItem('username')
        if (!username) {
          // If no username, maybe redirect or just wait
        } else {
          try {
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
          } catch (err) {
            console.error(err)
          }
        }
      } finally {
        setIsLoadingProfile(false)
      }
    }

    // Load LocalStorage Prefs
    try {
      const savedNotifications = localStorage.getItem('qc_notifications')
      const savedPreferences = localStorage.getItem('qc_preferences')
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications))
      if (savedPreferences) setPreferences(JSON.parse(savedPreferences))
    } catch (e) { console.error(e) }

    loadUserData()
  }, [])

  // --- Handlers ---

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    const username = localStorage.getItem('username')
    if (!file || !username) return

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
      showAlert('Error uploading avatar', 'error')
    }
  }

  const handleSaveProfile = async () => {
    const username = localStorage.getItem('username')
    if (!username) return showAlert('Please log in.', 'error')

    setIsSavingProfile(true)
    try {
      const payload = {
        usernameOrEmail: username,
        first_name: profile.firstName,
        last_name: profile.lastName,
        avatar: avatar,
      }
      if (profile.phoneNumber) payload.phone_number = profile.phoneNumber

      const { ok, data } = await api('/api/users/change-account', 'POST', payload)
      if (ok) {
        showAlert('Profile updated successfully!', 'success')
        if (userData) {
          userData.first_name = profile.firstName
          userData.last_name = profile.lastName
          userData.avatar = avatar
        }
      } else {
        showAlert(data?.message || 'Failed to update', 'error')
      }
    } catch (err) {
      showAlert('Error updating profile', 'error')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true)
    setTimeout(() => {
      localStorage.setItem('qc_notifications', JSON.stringify(notifications))
      setIsSavingNotifications(false)
      showAlert('Notification preferences saved', 'success')
    }, 500)
  }

  const handleSavePreferences = async () => {
    setIsSavingPreferences(true)
    setTimeout(() => {
      localStorage.setItem('qc_preferences', JSON.stringify(preferences))
      if (preferences.darkMode) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
      setIsSavingPreferences(false)
      showAlert('Preferences saved', 'success')
    }, 500)
  }

  const handleChangePassword = async () => {
    if (security.newPassword !== security.confirmPassword) return showAlert('Passwords do not match', 'error')

    // Simple validation
    if (security.newPassword.length < 8) return showAlert('Password must be at least 8 chars', 'error')

    const usernameOrEmail = localStorage.getItem('username')
    const token = localStorage.getItem('authToken') // Check if 'token' or 'authToken'

    // Fallback if authToken is missing but we're logged in (context might handle it differently)
    if (!usernameOrEmail) return showAlert('Please log in', 'error')

    setIsSavingPassword(true)
    try {
      // Assume API needs token in header
      const finalToken = token || localStorage.getItem('token')
      const { ok, data } = await api('/api/auth/change-password', 'POST', {
        isChangePassword: true,
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
        usernameOrEmail
      }, { Authorization: `Bearer ${finalToken}` })

      if (ok) {
        showAlert('Password updated successfully', 'success')
        setSecurity({ ...security, currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        showAlert(data?.message || 'Failed to change password', 'error')
      }
    } catch (e) {
      showAlert('Error changing password', 'error')
    } finally {
      setIsSavingPassword(false)
    }
  }

  const navigationItems = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Display & Preferences', icon: Settings },
    { id: 'security', label: 'Security & Login', icon: Shield },
  ]

  if (isLoadingProfile) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QC Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account and workstation preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Global Save Button could go here if we had a global form */}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <Card className="lg:w-64 h-fit border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {navigationItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id
                      ? 'bg-rose-50 text-rose-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <item.icon className={`w-4 h-4 mr-3 ${activeTab === item.id ? 'text-rose-600' : 'text-gray-400'}`} />
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
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <SectionHeader icon={User} title="Personal Information" description="Update your personal details and photo" />
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                    <div className="relative group">
                      <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                      <Avatar className="w-24 h-24 border-4 border-white shadow-lg cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <AvatarImage src={avatar} />
                        <AvatarFallback className="text-2xl">{profile.firstName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                      <h3 className="text-lg font-bold">{profile.firstName || 'User'} {profile.lastName}</h3>
                      <p className="text-sm text-gray-500">{userData.role || 'QC Technician'}</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => fileInputRef.current?.click()}>Change Avatar</Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={profile.email} disabled className="bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input value={profile.phoneNumber} onChange={e => setProfile({ ...profile, phoneNumber: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>License / Employee ID</Label>
                      <Input value={profile.employeeId} onChange={e => setProfile({ ...profile, employeeId: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="bg-rose-600 hover:bg-rose-700">
                      {isSavingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <SectionHeader icon={Bell} title="Notification Preferences" description="Manage how you receive alerts" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <ToggleSetting
                    icon={Mail}
                    label="Email Alerts"
                    description="Receive daily summaries and critical alerts via email"
                    checked={notifications.emailAlerts}
                    onCheckedChange={c => setNotifications({ ...notifications, emailAlerts: c })}
                  />
                  <Separator />
                  <ToggleSetting
                    icon={Smartphone}
                    label="SMS Alerts"
                    description="Get urgent notifications on your mobile device"
                    checked={notifications.smsAlerts}
                    onCheckedChange={c => setNotifications({ ...notifications, smsAlerts: c })}
                  />
                  <Separator />
                  <ToggleSetting
                    icon={CheckCircle2}
                    label="New Defect Assignments"
                    description="Notify when a new defect is assigned for review"
                    checked={notifications.defectAlerts}
                    onCheckedChange={c => setNotifications({ ...notifications, defectAlerts: c })}
                  />
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveNotifications} disabled={isSavingNotifications} className="ml-auto bg-rose-600 hover:bg-rose-700">
                    {isSavingNotifications ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <SectionHeader icon={Settings} title="System Preferences" description="Customize interface and units" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <Select value={preferences.language} onValueChange={v => setPreferences({ ...preferences, language: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English (US)</SelectItem>
                          <SelectItem value="tl">Filipino (Tagalog)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select value={preferences.timezone} onValueChange={v => setPreferences({ ...preferences, timezone: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Manila">Asia/Manila</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Measurement Unit</Label>
                      <Select value={preferences.measurementUnit} onValueChange={v => setPreferences({ ...preferences, measurementUnit: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="metric">Metric (Meters)</SelectItem>
                          <SelectItem value="imperial">Imperial (Feet)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Photo Upload Quality</Label>
                      <Select value={preferences.photoQuality} onValueChange={v => setPreferences({ ...preferences, photoQuality: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High (Original)</SelectItem>
                          <SelectItem value="medium">Medium (Compressed)</SelectItem>
                          <SelectItem value="low">Low (Fastest)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Separator />
                  <ToggleSetting
                    icon={Moon}
                    label="Dark Mode"
                    description="Reduce eye strain in low-light environments"
                    checked={preferences.darkMode}
                    onCheckedChange={c => setPreferences({ ...preferences, darkMode: c })}
                  />
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSavePreferences} disabled={isSavingPreferences} className="ml-auto bg-rose-600 hover:bg-rose-700">
                    {isSavingPreferences ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <SectionHeader icon={Shield} title="Security Settings" description="Protect your account" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input type="password" value={security.currentPassword} onChange={e => setSecurity({ ...security, currentPassword: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" value={security.newPassword} onChange={e => setSecurity({ ...security, newPassword: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input type="password" value={security.confirmPassword} onChange={e => setSecurity({ ...security, confirmPassword: e.target.value })} />
                    </div>
                    <div className="pt-2">
                      <Button onClick={handleChangePassword} disabled={isSavingPassword || !security.currentPassword} className="bg-rose-600 hover:bg-rose-700">
                        {isSavingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Update Password
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <ToggleSetting
                    label="Two-Factor Authentication (2FA)"
                    description="Add an extra layer of security (Coming Soon)"
                    checked={security.twoFactorEnabled}
                    onCheckedChange={c => setSecurity({ ...security, twoFactorEnabled: c })}
                  />
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  )
}

const SettingPageQcSide = () => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>}>
    <SettingPageContent />
  </Suspense>
)

export default SettingPageQcSide