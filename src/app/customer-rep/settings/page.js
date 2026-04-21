"use client";

import React, { useState, useEffect } from "react";
import { Settings, User, Lock, Bell, Monitor } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/components/providers/UserContext";
import { useAlert } from "@/components/providers/AlertProvider";
import { api, getCookie } from "@/lib/helper";

// Extracted components
import AvatarCard from "@/components/customer-rep/settings/AvatarCard";
import ProfileForm from "@/components/customer-rep/settings/ProfileForm";
import SecurityForm from "@/components/customer-rep/settings/SecurityForm";
import NotificationPrefs from "@/components/customer-rep/settings/NotificationPrefs";
import AppearanceSettings from "@/components/shared/AppearanceSettings";

export default function CustomerRepSettings() {
  const { userId, userData, refreshUserData } = useUser();
  const { showAlert } = useAlert();

  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({ first_name: "", last_name: "", email: "", phone_number: "" });
  const [notifications, setNotifications] = useState({
    emailNotifications: true, ticketAssigned: true, ticketUpdated: true, newTicket: true,
  });

  // Sync profile from UserContext — skip while saving to avoid overwriting changes
  useEffect(() => {
    if (userData && !saving) {
      setProfile({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        email: userData.email || "",
        phone_number: userData.phone_number || "",
      });
    }
  }, [userData, saving]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const username = userData?.username || getCookie("username");
      if (!username) throw new Error("User not identified");

      const res = await api(`/api/users/profile/${username}`, "PATCH", {
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number,
      });
      if (res?.ok) {
        if (res.data?.data) {
          // Update context but don't refetch immediately to avoid race
          refreshUserData?.();
        }
        showAlert("Profile updated successfully", "success");
      } else {
        showAlert(res?.message || "Failed to update profile", "error");
      }
    } catch (error) { showAlert("Failed to update profile", "error"); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (passwords, reset) => {
    if (passwords.newPassword !== passwords.confirmPassword) { showAlert("Passwords do not match", "error"); return; }
    if (passwords.newPassword.length < 6) { showAlert("Password must be at least 6 characters", "error"); return; }
    setSaving(true);
    try {
      const res = await api(`/api/users/change-password/${userId}`, "PUT", {
        currentPassword: passwords.currentPassword, newPassword: passwords.newPassword,
      });
      if (res?.ok) { showAlert("Password changed successfully", "success"); reset(); }
      else showAlert(res?.message || "Failed to change password", "error");
    } catch { showAlert("Failed to change password", "error"); }
    finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await api(`/api/users/upload-avatar/${userId}`, "POST", formData);
      if (res.ok) { showAlert("Avatar updated", "success"); refreshUserData?.(); }
    } catch { showAlert("Failed to upload avatar", "error"); }
  };

  const initials = `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase() || "CR";

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">Manage your account preferences</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-fit grid-cols-4 mb-6">
            <TabsTrigger value="profile"><User className="w-4 h-4 mr-1.5" /> Profile</TabsTrigger>
            <TabsTrigger value="security"><Lock className="w-4 h-4 mr-1.5" /> Security</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-1.5" /> Notifications</TabsTrigger>
            <TabsTrigger value="appearance"><Monitor className="w-4 h-4 mr-1.5" /> Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AvatarCard userId={userId} profile={profile} initials={initials} onUpload={handleAvatarUpload} />
              <ProfileForm profile={profile} onChange={setProfile} onSave={handleSaveProfile} saving={saving} />
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityForm onSubmit={handleChangePassword} saving={saving} />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationPrefs notifications={notifications} onChange={setNotifications} />
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <AppearanceSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
