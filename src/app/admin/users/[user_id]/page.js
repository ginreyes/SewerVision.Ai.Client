'use client'

import { api } from "@/lib/helper"
import { useParams } from "next/navigation"
import React, { useEffect, useRef, useState } from "react"
import {
  FaUserShield, FaUser, FaUserTag, FaCheckCircle, FaTimesCircle,
  FaEdit, FaSave, FaTimes, FaArrowLeft, FaCamera, FaCog, FaTools
} from "react-icons/fa"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useAlert } from "@/components/providers/AlertProvider"
import { Label } from "@/components/ui/label"
import { useDialog } from "@/components/providers/DialogProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const roleOptions = [
  { 
    value: "admin", 
    label: "Admin", 
    icon: <FaUserShield className="text-red-500" />,
    color: "bg-red-50 text-red-700 border-red-200",
    description: "Full system access"
  },
  { 
    value: "user", 
    label: "User", 
    icon: <FaUser className="text-blue-500" />,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Standard access"
  },
  { 
    value: "viewer", 
    label: "Viewer", 
    icon: <FaUserTag className="text-green-500" />,
    color: "bg-green-50 text-green-700 border-green-200",
    description: "Read-only access"
  },
  { 
    value: "Qc-Technician", 
    label: "QC Technician", 
    icon: <FaCog className="text-purple-500" />,
    color: "bg-purple-50 text-purple-700 border-purple-200",
    description: "Quality control"
  },
  { 
    value: "Operator", 
    label: "Operator", 
    icon: <FaTools className="text-orange-500" />,
    color: "bg-orange-50 text-orange-700 border-orange-200",
    description: "Equipment operation"
  }
]

const statusOptions = [
  { 
    value: true, 
    label: "Active", 
    icon: <FaCheckCircle className="text-green-500" />,
    color: "bg-green-50 text-green-700 border-green-200"
  },
  { 
    value: false, 
    label: "Inactive", 
    icon: <FaTimesCircle className="text-red-500" />,
    color: "bg-red-50 text-red-700 border-red-200"
  }
]

const UserProfile = () => {
  const { user_id } = useParams()
  const fileInputRef = useRef(null)
  const { showAlert } = useAlert()
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEdit, setIsEdit] = useState(false)
  const { showProfile } = useDialog();

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "",
    username: "", role: "", active: false, 
    avatar: "",
    // Role-specific fields
    certification: "",
    license_number: "",
    experience_years: "",
    shift_preference: "",
    equipment_experience: "",
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { ok, data } = await api(`/api/users/get-user-details/${user_id}`, "GET");
  
        if (ok) {
          const u = data.user;

  
          setUser(u);
          setForm({
            first_name: u.first_name || "",
            last_name: u.last_name || "",
            email: u.email || "",
            username: u.username || "",
            role: u.role || "",
            active: u.active ?? false,
            avatar: u.avatar || "",
            // Role-specific fields
            certification: u.certification || "",
            license_number: u.license_number || "",
            experience_years: u.experience_years || "",
            shift_preference: u.shift_preference || "",
            equipment_experience: u.equipment_experience || "",
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
  
    if (user_id) fetchUser();
  }, [user_id]);
  
  const handleSave = async () => {
    const payload = {
      user_id: user_id,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      username: form.username.trim(),
      role: form.role,
      active: form.active,
      avatar: form.avatar,
    };

    // Add role-specific fields
    if (form.role === 'Qc-Technician') {
      payload.certification = form.certification;
      payload.license_number = form.license_number;
      payload.experience_years = form.experience_years;
    } else if (form.role === 'Operator') {
      payload.certification = form.certification;
      payload.shift_preference = form.shift_preference;
      payload.equipment_experience = form.equipment_experience;
    }
  
    showProfile({
      title: "Save Changes?",
      description: "Are you sure you want to save these changes to the user's profile?",
      onConfirm: async () => {
        try {
          // Upload avatar if selected
          if (selectedAvatar) {
            const avatarForm = new FormData();
            avatarForm.append("avatar", selectedAvatar);
            avatarForm.append("username", payload.username);
  
            const { ok, data } = await api("/api/users/upload-avatar", "POST", avatarForm);
  
            if (!ok) {
              throw new Error(data?.message || "Avatar upload failed");
            }
  
            payload.avatar = data.avatarUrl;
          }
  
          // Update user info
          const { ok: updateOk, data: updateData } = await api("/api/users/change-info", "PUT", payload);
  
          if (!updateOk) {
            throw new Error(updateData?.message || "Failed to update user");
          }
  
          setUser((prev) => ({ ...prev, ...form }));
          setIsEdit(false);
          showAlert("User profile updated successfully", "success");
        } catch (err) {
          console.error("Save error:", err);
          showAlert(`Error saving profile: ${err.message}`, "error");
        }
      },
      onCancel: () => {
        console.log("User cancelled the save operation.");
      },
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showAlert("Please select a valid image file", "warning");
        return;
      }
  
      const previewUrl = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, avatar: previewUrl }));
      setSelectedAvatar(file);
    }
  };

  const getRoleSpecificFields = () => {
    if (!user) return null;

    switch (user.role) {
      case "Qc-Technician":
        return (
          <Card className="border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FaCog className="text-purple-500" />
                QC Technician Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEdit ? (
                <>
                  <div>
                    <Label>Certification</Label>
                    <Input
                      value={form.certification}
                      onChange={(e) => setForm(prev => ({ ...prev, certification: e.target.value }))}
                      placeholder="Enter certification"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>License Number</Label>
                    <Input
                      value={form.license_number}
                      onChange={(e) => setForm(prev => ({ ...prev, license_number: e.target.value }))}
                      placeholder="Enter license number"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Years of Experience</Label>
                    <Input
                      type="number"
                      value={form.experience_years}
                      onChange={(e) => setForm(prev => ({ ...prev, experience_years: e.target.value }))}
                      placeholder="Enter years of experience"
                      className="mt-1"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Certification:</span>
                    <span>{user.certification || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">License Number:</span>
                    <span>{user.license_number || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Experience:</span>
                    <span>{user.experience_years ? `${user.experience_years} years` : "Not specified"}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );

      case "Operator":
        return (
          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FaTools className="text-orange-500" />
                Operator Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEdit ? (
                <>
                  <div>
                    <Label>Certification</Label>
                    <Input
                      value={form.certification}
                      onChange={(e) => setForm(prev => ({ ...prev, certification: e.target.value }))}
                      placeholder="Enter certification"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Shift Preference</Label>
                    <Select 
                      value={form.shift_preference} 
                      onValueChange={(value) => setForm(prev => ({ ...prev, shift_preference: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select shift preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day Shift</SelectItem>
                        <SelectItem value="night">Night Shift</SelectItem>
                        <SelectItem value="rotating">Rotating Shift</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Equipment Experience</Label>
                    <Input
                      value={form.equipment_experience}
                      onChange={(e) => setForm(prev => ({ ...prev, equipment_experience: e.target.value }))}
                      placeholder="Describe equipment experience"
                      className="mt-1"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Certification:</span>
                    <span>{user.certification || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Shift Preference:</span>
                    <span>{user.shift_preference ? user.shift_preference.charAt(0).toUpperCase() + user.shift_preference.slice(1) : "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Equipment Experience:</span>
                    <span>{user.equipment_experience || "Not specified"}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">User not found.</p>
        </div>
      </div>
    );
  }

  const currentRole = roleOptions.find(r => r.value === user.role);
  const currentStatus = statusOptions.find(s => s.value === user.active);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => window.history.back()}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <FaArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
        
        {!isEdit && (
          <Button onClick={() => setIsEdit(true)} variant="outline" className="flex items-center gap-2">
            <FaEdit className="h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Main Profile Card */}
      <Card>
        <CardContent className="p-8">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage 
                    src={form.avatar} 
                    alt={`${user.first_name} ${user.last_name}`} 
                  />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEdit && (
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FaCamera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {isEdit && (
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              )}
              
              <div className="mt-4 text-center md:text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={currentRole?.color}>
                    {currentRole?.icon}
                    <span className="ml-1">{currentRole?.label}</span>
                  </Badge>
                  <Badge className={currentStatus?.color}>
                    {currentStatus?.icon}
                    <span className="ml-1">{currentStatus?.label}</span>
                  </Badge>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="flex-1 space-y-6">
              {/* Name Section */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isEdit ? (
                    <div className="flex gap-3">
                      <Input
                        value={form.first_name}
                        onChange={(e) => setForm(prev => ({ ...prev, first_name: e.target.value }))}
                        placeholder="First Name"
                        className="text-2xl font-bold"
                      />
                      <Input
                        value={form.last_name}
                        onChange={(e) => setForm(prev => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Last Name"
                        className="text-2xl font-bold"
                      />
                    </div>
                  ) : (
                    `${user.first_name} ${user.last_name}`
                  )}
                </h1>
                <p className="text-gray-600">@{user.username}</p>
              </div>

              {/* Role and Status Controls */}
              {isEdit && (
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <Label>Role</Label>
                    <Select value={form.role} onValueChange={(val) => setForm(prev => ({ ...prev, role: val }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center gap-2">
                              {role.icon}
                              <div>
                                <div className="font-medium">{role.label}</div>
                                <div className="text-xs text-gray-500">{role.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <Label>Status</Label>
                    <Select value={form.active.toString()} onValueChange={(val) => setForm(prev => ({ ...prev, active: val === "true" }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(status => (
                          <SelectItem key={status.value.toString()} value={status.value.toString()}>
                            <div className="flex items-center gap-2">
                              {status.icon}
                              {status.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaUser className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEdit ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Username</Label>
                <Input
                  value={form.username}
                  onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Username"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email"
                  className="mt-1"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="font-medium text-gray-600">Username:</span>
                <p className="text-gray-900 mt-1">{user.username}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <p className="text-gray-900 mt-1">{user.email}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role-specific Information */}
      {getRoleSpecificFields()}

      {/* Action Buttons */}
      {isEdit && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsEdit(false)}>
            <FaTimes className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} variant="rose">
            <FaSave className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;