"use client";

import { useRef, useState } from 'react';
import { User, Mail, Phone, Building, Camera, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { ProfileStats } from './SettingsUI';

const ProfileTab = ({
  profile, stats, userData, loading,
  onProfileChange, onAvatarClick, onAvatarFileChange, fileInputRef,
  passwordForm, showPassword, onPasswordChange, onTogglePassword, onChangePassword, changingPassword,
}) => (
  <div className="space-y-5">
    {/* Profile Hero Card */}
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="h-28 relative overflow-hidden">
        <img src="/background_pictures/operator_background.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-600/50" />
        <div className="absolute top-4 right-4">
          <Badge className="bg-white/20 text-white border border-white/30 backdrop-blur-sm text-[10px]">
            ID: {userData?._id?.slice(-6).toUpperCase() || 'UNKNOWN'}
          </Badge>
        </div>
      </div>
      <div className="px-6 pb-6 pt-5">
        <div className="flex items-center gap-5 mb-5">
          <div className="relative group flex-shrink-0">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onAvatarFileChange} />
            <Avatar className="w-16 h-16 border-3 border-white shadow-md cursor-pointer" onClick={onAvatarClick}>
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-bold">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={onAvatarClick}>
              <Camera className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900">{profile.firstName} {profile.lastName}</h3>
            <p className="text-xs text-gray-500">{profile.role} · {profile.department || 'Operations'}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge className="bg-blue-50 text-blue-700 text-[10px] border border-blue-100">PACP Certified</Badge>
              <Badge variant="outline" className="text-[10px] text-gray-500">{profile.email}</Badge>
            </div>
          </div>
          <Button size="sm" variant="outline" className="text-xs flex-shrink-0" onClick={onAvatarClick} disabled={loading}>
            <Camera className="w-3 h-3 mr-1" /> Change Photo
          </Button>
        </div>
        <ProfileStats stats={stats} />
      </div>
    </div>

    {/* Form Fields */}
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-800 mb-4">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-500">First Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input name="firstName" value={profile.firstName} onChange={onProfileChange} className="pl-9 h-10 text-sm" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-500">Last Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input name="lastName" value={profile.lastName} onChange={onProfileChange} className="pl-9 h-10 text-sm" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-500">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input name="email" value={profile.email} className="pl-9 h-10 text-sm bg-gray-50" disabled />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-500">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input name="phone" value={profile.phone} onChange={onProfileChange} className="pl-9 h-10 text-sm" placeholder="+1 (555) 000-0000" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-gray-500">Department</Label>
          <div className="relative">
            <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input name="department" value={profile.department} onChange={onProfileChange} className="pl-9 h-10 text-sm" placeholder="e.g. Field Operations" />
          </div>
        </div>
      </div>
    </div>

    {/* Security Card */}
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Lock className="w-4 h-4 text-gray-400" /> Security
      </h3>
      <div className="space-y-4">
        {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => {
          const labels = { currentPassword: 'Current Password', newPassword: 'New Password', confirmPassword: 'Confirm New Password' };
          const key = field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm';
          return (
            <div key={field} className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500">{labels[field]}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type={showPassword[key] ? 'text' : 'password'}
                  name={field}
                  value={passwordForm[field]}
                  onChange={onPasswordChange}
                  className="pl-9 pr-10 h-10 text-sm"
                />
                <button type="button" className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => onTogglePassword(key)}>
                  {showPassword[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
        <Button onClick={onChangePassword} disabled={changingPassword} className="bg-blue-600 hover:bg-blue-700 text-white text-xs" size="sm">
          {changingPassword ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Lock className="w-3 h-3 mr-1" />}
          Change Password
        </Button>
      </div>
    </div>
  </div>
);

export default ProfileTab;
