'use client'

import { api } from "@/lib/helper"
import { useParams } from "next/navigation"
import React, { useEffect, useRef, useState } from "react"
import {
  FaUserShield, FaUser, FaUserTag, FaCheckCircle, FaTimesCircle,
  FaEdit, FaSave, FaTimes, FaArrowLeft, FaCamera, FaCog, FaTools,
  FaBuilding, FaPhone, FaMapMarkerAlt, FaBriefcase, FaCalendarAlt,
  FaChartLine, FaFileAlt, FaStar, FaCrown
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
import { Textarea } from "@/components/ui/textarea"

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
    value: "customer", 
    label: "Customer", 
    icon: <FaBuilding className="text-rose-500" />,
    color: "bg-rose-50 text-rose-700 border-rose-200",
    description: "Client account"
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

const accountTypeOptions = [
  { value: "trial", label: "Trial", icon: <FaStar className="text-gray-500" /> },
  { value: "standard", label: "Standard", icon: <FaUser className="text-blue-500" /> },
  { value: "premium", label: "Premium", icon: <FaCrown className="text-yellow-500" /> },
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
    // Role-specific fields - QC Technician
    certification: "",
    license_number: "",
    experience_years: "",
    // Role-specific fields - Operator
    shift_preference: "",
    equipment_experience: "",
    // Role-specific fields - Customer
    company_name: "",
    industry: "",
    phone_number: "",
    address: "",
    account_type: "standard",
    company_size: "",
    tax_id: "",
    billing_contact: "",
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api(`/api/users/get-user-details/${user_id}`, "GET");
        console.log("API response:", response);
        const data = response.data.user
        const u = data;

        setUser(u);
        setForm({
          first_name: u.first_name || "",
          last_name: u.last_name || "",
          email: u.email || "",
          username: u.username || "",
          role: u.role || "",
          active: u.active ?? false,
          avatar: u.avatar || "",
          // QC Technician fields
          certification: u.certification || "",
          license_number: u.license_number || "",
          experience_years: u.experience_years || "",
          // Operator fields
          shift_preference: u.shift_preference || "",
          equipment_experience: u.equipment_experience || "",
          // Customer fields
          company_name: u.company_name || "",
          industry: u.industry || "",
          phone_number: u.phone_number || "",
          address: u.address || "",
          account_type: u.account_type || "standard",
          company_size: u.company_size || "",
          tax_id: u.tax_id || "",
          billing_contact: u.billing_contact || "",
        });
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

    // Add role-specific fields based on role
    if (form.role === 'Qc-Technician') {
      payload.certification = form.certification;
      payload.license_number = form.license_number;
      payload.experience_years = form.experience_years;
    } else if (form.role === 'Operator') {
      payload.certification = form.certification;
      payload.shift_preference = form.shift_preference;
      payload.equipment_experience = form.equipment_experience;
    } else if (form.role === 'customer') {
      payload.company_name = form.company_name;
      payload.industry = form.industry;
      payload.phone_number = form.phone_number;
      payload.address = form.address;
      payload.account_type = form.account_type;
      payload.company_size = form.company_size;
      payload.tax_id = form.tax_id;
      payload.billing_contact = form.billing_contact;
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
      case "customer":
        return (
          <div className="space-y-6">
            {/* Company Information Card */}
            <Card className="border-rose-200 bg-gradient-to-br from-rose-50/50 to-white">
              <CardHeader className="pb-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="text-base flex items-center gap-2">
                  <FaBuilding className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {isEdit ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label className="flex items-center gap-2">
                        <FaBuilding className="text-rose-500" />
                        Company Name
                      </Label>
                      <Input
                        value={form.company_name}
                        onChange={(e) => setForm(prev => ({ ...prev, company_name: e.target.value }))}
                        placeholder="Enter company name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-2">
                        <FaBriefcase className="text-rose-500" />
                        Industry
                      </Label>
                      <Input
                        value={form.industry}
                        onChange={(e) => setForm(prev => ({ ...prev, industry: e.target.value }))}
                        placeholder="e.g., Construction, Infrastructure"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-2">
                        <FaUser className="text-rose-500" />
                        Company Size
                      </Label>
                      <Select 
                        value={form.company_size} 
                        onValueChange={(value) => setForm(prev => ({ ...prev, company_size: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="500+">500+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="flex items-center gap-2">
                        <FaPhone className="text-rose-500" />
                        Phone Number
                      </Label>
                      <Input
                        value={form.phone_number}
                        onChange={(e) => setForm(prev => ({ ...prev, phone_number: e.target.value }))}
                        placeholder="+961 1 234 567"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-2">
                        <FaFileAlt className="text-rose-500" />
                        Tax ID / Registration Number
                      </Label>
                      <Input
                        value={form.tax_id}
                        onChange={(e) => setForm(prev => ({ ...prev, tax_id: e.target.value }))}
                        placeholder="Enter tax ID"
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-rose-500" />
                        Address
                      </Label>
                      <Textarea
                        value={form.address}
                        onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter company address"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-rose-100 rounded-lg">
                        <FaBuilding className="text-rose-600 h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Company Name</span>
                        <p className="text-gray-900 font-medium">{user.company_name || "Not specified"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-rose-100 rounded-lg">
                        <FaBriefcase className="text-rose-600 h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Industry</span>
                        <p className="text-gray-900 font-medium">{user.industry || "Not specified"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-rose-100 rounded-lg">
                        <FaUser className="text-rose-600 h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Company Size</span>
                        <p className="text-gray-900 font-medium">{user.company_size || "Not specified"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-rose-100 rounded-lg">
                        <FaPhone className="text-rose-600 h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Phone Number</span>
                        <p className="text-gray-900 font-medium">{user.phone_number || "Not specified"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-rose-100 rounded-lg">
                        <FaFileAlt className="text-rose-600 h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Tax ID</span>
                        <p className="text-gray-900 font-medium">{user.tax_id || "Not specified"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 md:col-span-2">
                      <div className="p-2 bg-rose-100 rounded-lg">
                        <FaMapMarkerAlt className="text-rose-600 h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Address</span>
                        <p className="text-gray-900 font-medium">{user.address || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Details Card */}
            <Card className="border-pink-200 bg-gradient-to-br from-pink-50/50 to-white">
              <CardHeader className="pb-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-t-lg">
                <CardTitle className="text-base flex items-center gap-2">
                  <FaCrown className="h-5 w-5" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {isEdit ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <FaCrown className="text-pink-500" />
                        Account Type
                      </Label>
                      <Select 
                        value={form.account_type} 
                        onValueChange={(value) => setForm(prev => ({ ...prev, account_type: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {accountTypeOptions.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                {type.icon}
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="flex items-center gap-2">
                        <FaUser className="text-pink-500" />
                        Billing Contact
                      </Label>
                      <Input
                        value={form.billing_contact}
                        onChange={(e) => setForm(prev => ({ ...prev, billing_contact: e.target.value }))}
                        placeholder="Billing contact email"
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        {accountTypeOptions.find(t => t.value === user.account_type)?.icon || <FaStar className="text-pink-600 h-5 w-5" />}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Account Type</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-gradient-to-r from-pink-500 to-rose-600 text-white border-0">
                            {accountTypeOptions.find(t => t.value === user.account_type)?.label || "Standard"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <FaCalendarAlt className="text-pink-600 h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Member Since</span>
                        <p className="text-gray-900 font-medium">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                          }) : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 md:col-span-2">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <FaUser className="text-pink-600 h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Billing Contact</span>
                        <p className="text-gray-900 font-medium">{user.billing_contact || "Same as account email"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics Card - Only shown in view mode */}
            {!isEdit && (
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
                <CardHeader className="pb-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-t-lg">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FaChartLine className="h-5 w-5" />
                    Account Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <FaFileAlt className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                      <div className="text-2xl font-bold text-blue-900">{user.total_projects || 0}</div>
                      <div className="text-sm text-blue-600 font-medium">Total Projects</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <FaCheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                      <div className="text-2xl font-bold text-green-900">{user.completed_inspections || 0}</div>
                      <div className="text-sm text-green-600 font-medium">Completed Inspections</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <FaChartLine className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                      <div className="text-2xl font-bold text-purple-900">{user.active_projects || 0}</div>
                      <div className="text-sm text-purple-600 font-medium">Active Projects</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          onClick={() => window.history.back()}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <FaArrowLeft className="h-4 w-4" />
          Back to Users
        </Button>
        
        {!isEdit && (
          <Button 
            onClick={() => setIsEdit(true)} 
            className="bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2"
          >
            <FaEdit className="h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Main Profile Card with enhanced design */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="h-32 "></div>
        <CardContent className="p-8 -mt-16">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-2xl ring-4 ring-rose-100">
                  <AvatarImage 
                    src={form.avatar} 
                    alt={`${user.first_name} ${user.last_name}`} 
                  />
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 text-white">
                    {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEdit && (
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full h-10 w-10 p-0 shadow-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
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
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                  <Badge className={`${currentRole?.color} px-3 py-1`}>
                    {currentRole?.icon}
                    <span className="ml-1 font-medium">{currentRole?.label}</span>
                  </Badge>
                  <Badge className={`${currentStatus?.color} px-3 py-1`}>
                    {currentStatus?.icon}
                    <span className="ml-1 font-medium">{currentStatus?.label}</span>
                  </Badge>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="flex-1 space-y-6">
              {/* Name Section */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
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
                <p className="text-gray-600 text-lg">@{user.username}</p>
              </div>

              {/* Role and Status Controls */}
              {isEdit && (
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <Label className="text-sm font-semibold">Role</Label>
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
                    <Label className="text-sm font-semibold">Status</Label>
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
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FaUser className="h-5 w-5 text-rose-600" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isEdit ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold">Username</Label>
                <Input
                  value={form.username}
                  onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Username"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold">Email</Label>
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
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-100 rounded-lg">
                  <FaUser className="text-rose-600 h-5 w-5" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Username</span>
                  <p className="text-gray-900 font-medium">{user.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-100 rounded-lg">
                  <FaUser className="text-rose-600 h-5 w-5" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Email</span>
                  <p className="text-gray-900 font-medium">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role-specific Information */}
      {getRoleSpecificFields()}

      {/* Action Buttons */}
      {isEdit && (
        <div className="flex justify-end gap-3 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border">
          <Button variant="outline" onClick={() => setIsEdit(false)} className="flex items-center gap-2">
            <FaTimes className="h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 flex items-center gap-2">
            <FaSave className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;