'use client'

import { api } from "@/lib/helper"
import { useParams } from "next/navigation"
import React, { useEffect, useRef, useState } from "react"
import {
  FaUserShield, FaUser, FaUserTag,
  FaCheckCircle, FaTimesCircle
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

const roleOptions = [
  { value: "admin", label: "Admin", icon: <FaUserShield className="inline mr-1 text" /> },
  { value: "user", label: "User", icon: <FaUser className="inline mr-1" /> },
  { value: "viewer", label: "Viewer", icon: <FaUserTag className="inline mr-1" /> }
]

const statusOptions = [
  { value: true, label: "Active", icon: <FaCheckCircle className="inline mr-1 text-green-500" /> },
  { value: false, label: "Inactive", icon: <FaTimesCircle className="inline mr-1 text-red-600" /> }
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
    avatar: ""
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
  
    showProfile({
      title: "Save Changes?",
      description: "Are you sure you want to save these changes to the user's profile?",
      onConfirm: async () => {
        try {
          // ✅ Upload avatar if selected
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
  
          // ✅ Update user info
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
  

  if (loading) return <div className="text-center py-10 text-lg">Loading user profile...</div>
  if (!user) return <div className="text-center py-10 text-lg">User not found.</div>

  const avatarUrl = form.avatar || `https://ui-avatars.com/api/?name=${form.first_name}+${form.last_name}`

  return (
    <>
     

      <div className="max-w-2xl mx-auto mt-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden">
        <div className="max-w-2xl mx-auto mt-6 px-4">
          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md px-4 py-2 flex items-center gap-2 border border-zinc-300 dark:border-zinc-700 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Users
          </Button>
        </div>
        <div className="p-8">

          <div className="flex flex-col items-center">
            <img
              src={form.avatar || "/default-avatar.png"}
              alt="User Avatar"
              className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover cursor-pointer hover:opacity-80 transition"
              onClick={() => isEdit && fileInputRef.current?.click()}
            />
            {isEdit && (
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleAvatarChange}
              />
            )}

            {isEdit ? (
              <div className="grid grid-cols-2 gap-4 mt-4 w-full">
                <Input
                  placeholder="First Name"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                />
                <Input
                  placeholder="Last Name"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                />
              </div>
            ) : (
              <>
                <h2 className="mt-6 text-2xl font-bold text-zinc-800 dark:text-white">{user.first_name} {user.last_name}</h2>
                <p className="text-base text-zinc-500">@{user.username}</p>
              </>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
              {isEdit ? (
                <>
                  <Select value={form.role} onValueChange={(val) => setForm({ ...form, role: val })}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map(r => (
                        <SelectItem key={r.value} value={r.value}>
                          <div className="flex items-center gap-2">{r.icon} {r.label}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={form.active.toString()} onValueChange={(val) => setForm({ ...form, active: val === "true" })}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(s => (
                        <SelectItem key={s.value.toString()} value={s.value.toString()}>
                          <div className="flex items-center gap-2">{s.icon} {s.label}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <span className={`px-4 py-1 text-sm rounded-full font-medium flex items-center gap-1 ${
                    user.role === "admin" ? "bg-red-100 text-red-600"
                    : user.role === "user" ? "bg-blue-100 text-blue-600"
                    : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {roleOptions.find(r => r.value === user.role)?.icon}
                    {user.role}
                  </span>

                  <span className={`px-4 py-1 text-sm rounded-full font-medium flex items-center gap-1 ${
                    user.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {user.active ? <FaCheckCircle /> : <FaTimesCircle />}
                    {user.active ? "Active" : "Inactive"}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="border-t dark:border-zinc-800 pt-6 text-base text-zinc-600 dark:text-zinc-300 space-y-4 mt-6">
            {isEdit ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Label className='font-bold'>Username:</Label>
                <Input
                  placeholder="Username"
                  value={form.username}
                  onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                />
                <Label className='font-bold'>Email:</Label>
                <Input
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="font-semibold">Username:</span>
                  <span>{user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Email:</span>
                  <span>{user.email}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="border-t dark:border-zinc-700 px-6 py-4 bg-zinc-50 dark:bg-zinc-800 flex justify-between">
          {isEdit ? (
            <>
              <Button variant="secondary" onClick={() => setIsEdit(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} variant='rose'>
                Save Changes
              </Button>

            </>
          ) : (
            <div className="text-right w-full">
              <Button onClick={() => setIsEdit(true)} variant='ghost'>
                ✏️ Edit Profile
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default UserProfile
