//src/app/admin/users/[user_id]/page.js
'use client'

import { api } from "@/lib/helper"
import { useParams } from "next/navigation"
import React, { useEffect, useRef, useState } from "react"
import {
  FaUserShield, FaUser, FaUserTag, FaCheckCircle, FaTimesCircle,
  FaEdit, FaArrowLeft, FaCamera, FaCog, FaTools,
  FaBuilding,FaStar, FaCrown, FaEnvelope, FaIdCard,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { SeparatorVertical } from "@/components/ui/separator"
import CustomerDetailed from "../components/CustomerDetailed"
import QcTechnicianDetailed from "../components/QcTechnicianDetailed"
import TeamLeadDetailed from "../components/TeamLeadDetailed"
import OperatorDetailed, { OperatorWorkspaceOverview } from "../components/OperatorDetailed"

const roleOptions = [
  {
    value: "admin",
    label: "Admin",
    icon: <FaUserShield className="h-4 w-4" />,
    color: "bg-red-100 text-red-800 border-red-200",
    description: "Full system access"
  },
  {
    value: "customer",
    label: "Customer",
    icon: <FaBuilding className="h-4 w-4" />,
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    description: "Client account"
  },
  {
    value: "Qc-Technician",
    label: "QC Technician",
    icon: <FaCog className="h-4 w-4" />,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Quality control"
  },
  {
    value: "Operator",
    label: "Operator",
    icon: <FaTools className="h-4 w-4" />,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    description: "Equipment operation"
  },
  {
    value: "user",
    label: "Management User (Team Lead)",
    icon: <FaUserTag className="h-4 w-4" />,
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    description: "Team lead / management workspace"
  }
]

const accountTypeOptions = [
  { value: "trial", label: "Trial Account", icon: <FaStar className="text-amber-500" /> },
  { value: "standard", label: "Standard Plan", icon: <FaUser className="text-blue-500" /> },
  { value: "premium", label: "Premium Plan", icon: <FaCrown className="text-yellow-500" /> },
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
    certification: "", license_number: "", experience_years: "",
    shift_preference: "", equipment_experience: "",
    company_name: "", industry: "", phone_number: "", address: "",
    account_type: "standard", company_size: "", tax_id: "", billing_contact: "",
  })

  // Team lead → members they manage
  const [managedMembers, setManagedMembers] = useState([])
  const [availableMembers, setAvailableMembers] = useState([])
  const [selectedMemberId, setSelectedMemberId] = useState("")

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api(`/api/users/get-user-details/${user_id}`, "GET");
        const u = response.data.user;

        setUser(u);
        setManagedMembers(Array.isArray(u.managedMembers) ? u.managedMembers : []);
        setForm({
          first_name: u.first_name || "", last_name: u.last_name || "",
          email: u.email || "", username: u.username || "",
          role: u.role || "", active: u.active ?? false,
          avatar: u.avatar || "default_avatar.png",
          // Role fields
          certification: u.certification || "", license_number: u.license_number || "", experience_years: u.experience_years || "",
          shift_preference: u.shift_preference || "", equipment_experience: u.equipment_experience || "",
          company_name: u.company_name || "", industry: u.industry || "", phone_number: u.phone_number || "", address: u.address || "",
          account_type: u.account_type || "standard", company_size: u.company_size || "", tax_id: u.tax_id || "", billing_contact: u.billing_contact || "",
        });

        // Load potential team members (operators & QC techs)
        const { ok, data } = await api("/api/users/get-all-user?limit=200", "GET");
        if (ok && Array.isArray(data.users)) {
          const candidates = data.users.filter(
            (m) =>
              m._id !== u._id &&
              m.role !== "admin" &&
              m.role !== "customer"
          );
          setAvailableMembers(candidates);
        } else {
          setAvailableMembers([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        showAlert("Failed to load user profile", "error");
      } finally {
        setLoading(false);
      }
    };

    if (user_id) fetchUser();
  }, [user_id]);

  const handleSave = async () => {
    // Prepare payload
    const payload = {
      user_id: user_id,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      username: form.username.trim(),
      role: form.role,
      active: form.active,
      avatar: form.avatar,
      // Pass all potential fields, backend should handle filtering or ignoring extra
      certification: form.certification,
      license_number: form.license_number,
      experience_years: form.experience_years,
      shift_preference: form.shift_preference,
      equipment_experience: form.equipment_experience,
      company_name: form.company_name,
      industry: form.industry,
      phone_number: form.phone_number,
      address: form.address,
      account_type: form.account_type,
      company_size: form.company_size,
      tax_id: form.tax_id,
      billing_contact: form.billing_contact,
      managedMembers: managedMembers.map((m) => m._id || m.user_id)
    };

    showProfile({
      title: "Save Profile Changes?",
      description: "This will update the user's information and access permissions.",
      onConfirm: async () => {
        try {
          if (selectedAvatar) {
            const avatarForm = new FormData();
            avatarForm.append("avatar", selectedAvatar);
            avatarForm.append("username", payload.username);
            const { ok, data } = await api("/api/users/upload-avatar", "POST", avatarForm);
            if (!ok) throw new Error(data?.message || "Avatar upload failed");
            payload.avatar = data.avatarUrl;
          }

          const { ok: updateOk, data: updateData } = await api("/api/users/change-info", "PUT", payload);
          if (!updateOk) throw new Error(updateData?.message || "Failed to update user");

          setUser((prev) => ({ ...prev, ...form, managedMembers }));
          setIsEdit(false);
          showAlert("User profile updated successfully", "success");
        } catch (err) {
          showAlert(err.message, "error");
        }
      },
      onCancel: () => { },
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setForm(prev => ({ ...prev, avatar: URL.createObjectURL(file) }));
      setSelectedAvatar(file);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500"></div></div>;
  if (!user) return <div className="text-center py-20 font-medium text-gray-500">User not found.</div>;

  const normalizedRole = (user.role || "").toLowerCase();
  const currentRole =
    roleOptions.find(
      (r) => (r.value || "").toLowerCase() === normalizedRole
    ) || { label: user.role, color: "bg-gray-100 text-gray-800" };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-sm py-4 border-b border-gray-100 -mx-6 px-6">
        <Button onClick={() => window.history.back()} variant="ghost" className="text-gray-600 hover:text-rose-600">
          <FaArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
        </Button>
        <div className="flex gap-3">
          {isEdit ? (
            <>
              <Button variant="outline" onClick={() => setIsEdit(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-rose-600 hover:bg-rose-700 text-white shadow-md">
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEdit(true)} variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50">
              <FaEdit className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Avatar & Quick Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="overflow-hidden border-rose-100 shadow-lg">
            <div
              className="h-32 relative"
              style={(() => {
                if (normalizedRole === 'operator') {
                  return {
                    backgroundImage:
                      "url('/background_pictures/operator_background.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  };
                }
                if (normalizedRole === 'customer') {
                  return {
                    backgroundImage:
                      "url('/background_pictures/customer_background.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  };
                }
                if (normalizedRole === 'qc-technician') {
                  return {
                    backgroundImage:
                      "url('/background_pictures/qc-techinician_background.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  };
                }
                if (normalizedRole === 'user') {
                  return {
                    backgroundImage:
                      "url('/background_pictures/user-team_background.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  };
                }
                return {
                  backgroundImage:
                    'linear-gradient(to right, #f43f5e, #ec4899)',
                };
              })()}
            >
              <div className="absolute top-4 right-4">
                <Badge className={`${user.active ? 'bg-green-500' : 'bg-red-500'} text-white border-none shadow-sm`}>
                  {user.active ? <><FaCheckCircle className="mr-1" /> Active</> : <><FaTimesCircle className="mr-1" /> Inactive</>}
                </Badge>
              </div>
            </div>
            <CardContent className="relative pt-0 px-6 pb-6 text-center">
              <div className="relative -mt-16 mb-4 inline-block">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                  <AvatarImage src={form.avatar} />
                  <AvatarFallback className="text-3xl bg-gray-100 font-bold text-gray-400">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                {isEdit && (
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full shadow-lg bg-rose-500 hover:bg-rose-600 text-white h-9 w-9"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FaCamera className="h-4 w-4" />
                  </Button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </div>

              <h2 className="text-2xl font-bold text-gray-900">{form.first_name} {form.last_name}</h2>
              <p className="text-gray-500 font-medium">@{form.username}</p>

              <div className="flex justify-center gap-2 mt-4">
                <Badge variant="outline" className={`${currentRole.color} py-1 px-3`}>
                  {currentRole.label}
                </Badge>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 text-left">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">User ID</p>
                  <p className="text-sm font-mono text-gray-700 truncate" title={user._id}>...{user._id?.slice(-8)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Joined</p>
                  <p className="text-sm font-medium text-gray-700">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status Control */}
          {isEdit && (
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-md font-semibold">Account Status</CardTitle>
                <CardDescription>Manage user access</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">Active Status</span>
                  <span className="text-xs text-gray-500">Disable to block access</span>
                </div>
                <Switch
                  checked={form.active}
                  onCheckedChange={(c) => setForm(prev => ({ ...prev, active: c }))}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Details Forms */}
        <div className="lg:col-span-8 space-y-6">

          {/* General Information */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-50 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><FaIdCard /></div>
                <div>
                  <CardTitle className="text-lg">General Information</CardTitle>
                  <CardDescription>Basic personal details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    disabled={!isEdit}
                    value={form.first_name}
                    onChange={e => setForm({ ...form, first_name: e.target.value })}
                    className={!isEdit ? "bg-gray-50" : "bg-white"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    disabled={!isEdit}
                    value={form.last_name}
                    onChange={e => setForm({ ...form, last_name: e.target.value })}
                    className={!isEdit ? "bg-gray-50" : "bg-white"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-3 text-gray-400 text-xs" />
                    <Input
                      disabled={!isEdit}
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className={`pl-8 ${!isEdit ? "bg-gray-50" : "bg-white"}`}
                    />
                  </div>
                </div>

                {/* Right column: either role selector or operator workspace overview */}
                {normalizedRole === 'operator' ? (
                  <div className="space-y-2">
                    <Label>Operator Workspace Overview</Label>
                    <OperatorWorkspaceOverview operatorId={user._id} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      disabled={!isEdit}
                      value={form.role}
                      onValueChange={v => setForm({ ...form, role: v })}
                    >
                      <SelectTrigger className={!isEdit ? "bg-gray-50" : "bg-white"}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role Specific Modules */}
          {normalizedRole === 'customer' && (
            <CustomerDetailed
              form={form}
              isEdit={isEdit}
              setForm={setForm}
              accountTypeOptions={accountTypeOptions}
            />
          )}

          {normalizedRole === 'qc-technician' && (
            <QcTechnicianDetailed
              user={user}
              form={form}
              isEdit={isEdit}
              setForm={setForm}
            />
          )}

          {normalizedRole === 'operator' && (
            <OperatorDetailed
              user={user}
              form={form}
              isEdit={isEdit}
              setForm={setForm}
            />
          )}

          {/* Management User (Team Lead) */}
          {normalizedRole === 'user' && (
            <TeamLeadDetailed
              user={user}
              isEdit={isEdit}
              managedMembers={managedMembers}
              setManagedMembers={setManagedMembers}
              availableMembers={availableMembers}
              selectedMemberId={selectedMemberId}
              setSelectedMemberId={setSelectedMemberId}
            />
          )}

        </div>
      </div>
    </div>
  )
}

const OperatorCurrentProjects = ({ operatorId }) => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [uploadCount, setUploadCount] = useState(null);
  const [leaderName, setLeaderName] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!operatorId) return;
      try {
        setLoading(true);
        // Load projects scoped to operator
        const projectParams = new URLSearchParams({
          page: "1",
          limit: "5",
          assignedOperatorId: String(operatorId),
        });
        const { ok: okProjects, data: projectData } = await api(
          `/api/projects/get-all-projects?${projectParams.toString()}`,
          "GET"
        );
        if (okProjects && Array.isArray(projectData.data)) {
          setProjects(projectData.data);
        } else if (Array.isArray(projectData)) {
          setProjects(projectData);
        } else {
          setProjects([]);
        }

        // Load detailed operator profile to get leader + uploads
        const { data: detail } = await api(
          `/api/users/get-user-details/${operatorId}`,
          "GET"
        );
        const u = detail?.user;
        if (u?.leader) {
          setLeaderName(
            u.leader.name ||
              u.leader.username ||
              u.leader.email ||
              "Team Lead"
          );
        } else {
          setLeaderName("No team lead assigned");
        }
        if (u?.uploadStats && typeof u.uploadStats.totalUploads === "number") {
          setUploadCount(u.uploadStats.totalUploads);
        }
      } catch (err) {
        console.error("Failed to load operator projects", err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [operatorId]);

  if (loading) {
    return (
      <div className="h-[78px] flex items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-xs text-gray-500">
        Loading projects...
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3 space-y-3 max-h-64 overflow-y-auto">
      {/* Leader & uploads summary */}
      <div className="flex items-center justify-between gap-3 text-[11px]">
        <div className="min-w-0">
          <p className="font-semibold text-blue-900 truncate">
            Team Lead
          </p>
          <p className="text-[11px] text-blue-800 truncate">
            {leaderName || "No team lead assigned"}
          </p>
        </div>
        {uploadCount !== null && (
          <div className="text-right">
            <p className="text-[10px] text-blue-900 uppercase tracking-wide">
              Uploads
            </p>
            <p className="text-sm font-semibold text-blue-800">
              {uploadCount}
            </p>
          </div>
        )}
      </div>

      <SeparatorVertical className="my-1 border-blue-100" />

      {/* Current projects list (can be empty) */}
      {projects.length ? (
        <>
          <p className="text-[11px] font-semibold text-blue-900 uppercase tracking-wide">
            Current Projects
          </p>
          <div className="space-y-1.5">
            {projects.slice(0, 4).map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {p.name || "Untitled Project"}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {p.location || p.client || p.workOrder}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white text-blue-700 border border-blue-200">
                  {(p.status || "").replace("-", " ").toUpperCase()}
                </span>
              </div>
            ))}
            {projects.length > 4 && (
              <p className="text-[11px] text-gray-500">
                +{projects.length - 4} more project
                {projects.length - 4 > 1 ? "s" : ""} assigned.
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="h-[60px] flex items-center justify-center rounded-lg border border-dashed border-blue-100 bg-blue-50 text-[11px] text-blue-700">
          No projects assigned to this operator yet.
        </div>
      )}

      {/* Applications / modules the operator can use */}
      <div className="pt-2 border-t border-blue-100 space-y-1.5">
        <p className="text-[11px] font-semibold text-blue-900 uppercase tracking-wide">
          Applications Available
        </p>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <span className="px-2 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200">
            Operator Dashboard
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200">
            Inspection Projects
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200">
            Reports Workspace
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200">
            Activity Logs
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200">
            Equipment & Devices
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200">
            Notifications
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserProfile