"use client";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsListAlt,
  TabsTriggerAlt,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useEffect, useRef, useState } from "react";
import { FaUser, FaLock, FaBell, FaCreditCard } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDialog } from "@/components/providers/DialogProvider";
import { useAlert } from "@/components/providers/AlertProvider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { use } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/helper";


const AccountSettings = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    avatar:'',
  });

  const [avatar, setAvatar] = useState("/avatar_default.png");
  const [isDirty, setIsDirty] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  const { showAlert, showDelete , showSuccess} = useDialog();
  const {showConfirm}= useDialog()

  const fileInputRef = useRef(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsDirty(true);
  };

  

  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData);
    }
    setAvatar("/avatar_default.png"); 
    setIsDirty(false);
  };

 
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    const username = localStorage.getItem("username");
    

  
    if (!file) return;
    if (!username) {
      showAlert("You are not logged in.", "error");
      return;
    }
    if (!file.type.startsWith("image/")) {
      showAlert("Only image files are accepted", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showAlert("File size should be under 5MB.", "error");
      return;
    }
  
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("username", username);
  
    try {
      const { ok, data } = await api("/api/users/upload-avatar", "POST", formData);
  
      if (ok) {
        showSuccess("Avatar uploaded successfully");
        setAvatar(data.avatarUrl);
        setIsDirty(true);
      } else {
        showAlert(data?.message || "Failed to upload avatar", "error");
      }
    } catch (err) {
      console.error(err);
      showAlert(err.message || "Error uploading avatar", "error");
    }
  };
  
  
  

  
  const handleAvatarReset = () => {
    setAvatar("/avatar_default.png");
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      const username = localStorage.getItem("username");
      if (!username) return;
  
      const payload = {
        usernameOrEmail: username,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
        avatar: avatar,
      };
  
      const { ok, data } = await api('/api/users/change-account', 'POST', payload);
  
      if (ok) {
        showSuccess("Account is already Updated.");
        setIsDirty(false);
        setOriginalData(formData);
      } else {
        showAlert(data?.message || "Failed to change Account.", "error");
      }
    } catch (err) {
      console.error(err);
      showAlert(err.message || "Failed to change Account.", "error");
    }
  };
  
  

  const confirmDelete = (event) => {
    event.preventDefault();
    if (!isChecked) return;
  
    showDelete({
      title: "Delete Account",
      description: "Once you delete your account, there is no going back. Please be certain.",
      onConfirm: () => {
        deleteAccount(event);
      },
      onCancel: () => {
        console.log("Account deletion cancelled");
      }
    });
  };

  const ConfirmSave = (event) => {
    event.preventDefault();
  
    if(!isDirty) return;
  
    showConfirm({
      title: "Do you want to save changes?",
      description:
        "Please confirm you want to save the changes to your account. This action will update your account information.",
      onConfirm: () => {
        handleSave(); 
      },
    });
  };
  

  const deleteAccount = async (event) => {
    event.preventDefault();

    const usernameOrEmail = localStorage.getItem('username');

    if (!usernameOrEmail) return;
  
    try {
      const res = await api('/api/users/delete-account','DELETE');
  
      const data = await res.json();
  
      if (res.ok) {
        showAlert("Account Delete Is successful", "success");
        localStorage.clear();
        window.location.href = '/login'; 
      } 
      else {
        showAlert(`Delete failed: ${data.message}`, "error");
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };
  
  
  useEffect(() => {
    const getUser = async () => {
      const username = localStorage.getItem("username");
      if (!username) return;
  
      try {
        const { ok, data } = await api(`/api/users/get-user/${username}`, "GET");
  
        if (ok) {
          const user = data.user;
          const userData = {
            firstName: user.first_name || "",
            lastName: user.last_name || "",
            email: user.email || "",
            role: user.role || "",
            avatar:user.avatar || '',
          };
          setFormData(userData);
          setOriginalData(userData);
  
          if (user.avatar) {
            setAvatar(user.avatar);
          }
        } else {
          console.error(data?.message || "Failed to fetch user");
        }
      } catch (err) {
        console.error("Fetch error:", err.message || err);
      }
    };
  
    getUser();
  }, []);
  

  return (
    <>
    <Card className="p-4">
      <CardContent className="flex gap-6 items-start">
        {/* Avatar Box */}
        <div className="flex flex-col items-center p-4 border rounded-md">
        <Avatar className="w-32 h-32">
          <img src={avatar || "/avatar_default.png"} alt="User Avatar" />
        </Avatar>
        </div>

        {/* Upload Section on the Right Side of Avatar */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between gap-2">
            <Button onClick={triggerFileInput} variant="rose" text="Upload new photo" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            {/* Reset Button on the Right */}
            <Button
              variant="secondary"
              onClick={handleAvatarReset}
              text="Reset"
            />
          </div>

          {/* File Format Info */}
          <p className="text-gray-500 text-sm mt-1 text-center">
            Allowed: JPG, GIF, PNG. Max size: 2MB.
          </p>
        </div>
      </CardContent>

      {/* User Information */}
      <CardContent className="pt-4">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium">
              First Name
            </label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="First Name"
              className="w-full"
              value={formData.firstName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium">
              Last Name
            </label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Last Name"
              className="w-full"
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              className="w-full"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium">
              Role
            </label>
            <select
              id="role"
              name="role"
              className="w-full p-2 border rounded-md"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="guest">Guest</option>
            </select>
          </div>
        </form>
      </CardContent>

      {isDirty && (
        <CardFooter className="flex justify-start gap-2 pt-4">
          <Button onClick={ConfirmSave} variant="rose" text="Save Changes" />
          <Button variant="secondary" onClick={handleCancel} text="Cancel" />
        </CardFooter>
      )}
    </Card>

    <div className="pt-5">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Delete Account</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="bg-[#fff2d6] rounded-2xl">
            <CardHeader>
              <h1 className="text-[#ffb725] font-bold text-2xl">
                Are you sure you want to delete your account?
              </h1>
              <p className="text-[#ffb725] font-bold">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </CardHeader>
          </Card>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm-delete"
              checked={isChecked}
              onCheckedChange={(checked) => setIsChecked(!!checked)}
            />
            <label
              htmlFor="confirm-delete"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I confirm my account deactivation
            </label>
          </div>

          {isChecked && (
            <Button 
              variant="destructive" 
              className="mt-2" 
              text='Delete Account'
              onClick={confirmDelete}
            />
   
          )}
        </CardContent>
      </Card>
    </div>
    

    </>
  );
};

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmVisible, setShowConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false)

  const {showAlert} = useAlert(); 

  const { showConfirm  } = useDialog();
  const { showSessionExpiredDialog } = useDialog();
  
  const hasChanges =
    currentPassword !== "" || newPassword !== "" || confirmPassword !== "";

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirmVisible(false);
  };

  const confirmBeforeSubmit = (event) => {
    event.preventDefault();
    if (!hasChanges) return;
  
    showConfirm({
      title: "Confirm Password Change",
      description: `
        ⚠️ Take note: You can only change your password up to 3 times per month. 
        You will need to verify your account again after changing your password. 
        Are you sure you want to proceed? 🔒
      `,
      onConfirm: () => {
        handlePasswordChange(event);
      },
    });
  };
  
  const handlePasswordChange = async (event) => {
    event.preventDefault();
  
    if (newPassword !== confirmPassword) {
      showAlert("New password and confirm password do not match.", "error");
      return;
    }
  
    const passwordValid = /^(?=.*[a-z])(?=.*[\d\W]).{8,}$/.test(newPassword);
    if (!passwordValid) {
      showAlert(
        "Password must be at least 8 characters long and contain a lowercase letter and a digit or symbol.",
        "error"
      );
      return;
    }
  
    const usernameOrEmail = localStorage.getItem("username");
    const token = localStorage.getItem("authToken");
  
    if (!usernameOrEmail || !token) {
      showSessionExpiredDialog();
      return;
    }
  
    try {
      setLoading(true);
  
      const payload = {
        isChangePassword: true,
        currentPassword,
        newPassword,
        usernameOrEmail,
      };
  
      const { ok, data } = await api(
        "/api/auth/change-password",
        "POST",
        payload,
        {
          Authorization: `Bearer ${token}`,
        }
      );
  
      if (ok) {
        showAlert("Password changed successfully!", "success");
        resetForm();
      } else {
        if (
          data?.message?.toLowerCase().includes("expired") ||
          data?.message?.toLowerCase().includes("unauthorized")
        ) {
          showSessionExpiredDialog();
        } else {
          showAlert(data?.message || "Failed to change password.", "error");
        }
      }
    } catch (err) {
      console.error("Error changing password:", err);
      showAlert(err.message || "Failed to change password.", "error");
    } finally {
      setLoading(false);
    }
  };
  
  
  
  
  return (
    <>
    <Card className='pb-5'> 
      <CardContent>
        <form onSubmit={confirmBeforeSubmit} className="space-y-6 max-w-xl ">
          <h2 className="text-lg font-semibold">Change Password</h2>

          {/* Current Password: fixed width same as combined width of new + confirm */}
          <div className="w-full">
            <label
              htmlFor="current-password"
              className="block font-medium mb-1"
            >
              Current Password
            </label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input input-bordered w-full pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showCurrent ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* New + Confirm Password side by side, fills the same width as current */}
          <div className="flex gap-6 w-full">
            {/* New Password */}
            <div className="flex-1">
              <label htmlFor="new-password" className="block font-medium mb-1">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input input-bordered w-full pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showNew ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="flex-1">
              <label
                htmlFor="confirm-password"
                className="block font-medium mb-1"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input input-bordered w-full pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmVisible(!showConfirmVisible)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showConfirmVisible ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="text-sm text-gray-500 space-y-1">
            <p>Password Requirements:</p>
            <ul className="list-disc list-inside">
              <li>Minimum 8 characters long - the more, the better</li>
              <li>At least one lowercase character</li>
              <li>At least one number, symbol, or whitespace character</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={!hasChanges}
              onClick={confirmBeforeSubmit}
              variant="rose"
              text="Save Changes"
              className={`${
                !hasChanges ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
            <Button
              type="button"
              disabled={!hasChanges}
              onClick={resetForm}
              variant="secondary"
              text="Reset"
              className={`${
                !hasChanges ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
          </div>
        </form>
      </CardContent>
    </Card>

    <div className="pt-5"> 
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Two-steps verification</h2>
          <h2 className="text-lg font-semibold text-black">Two factor authentication is not enabled yet.</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="two-fa-toggle">Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to log in.</Label>
            <Switch
              id="two-fa-toggle"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          {enabled && (
            <Button variant="rose" 
              onClick={() => alert('2FA Setup Process')} 
              text='Enable Two Factor Authentication'
            />
          )}
        </CardContent>
      </Card>
    </div>
    
    </>
  );
};

const Notifications = () => {
    const [emailNotifications, setEmailNotifications] = useState(true);
    
    return (
        <Card className='p-7'>
            <CardContent>
                <h2 className="text-lg font-semibold">Notifications</h2>
                <p>Manage your notification settings here.</p>
            </CardContent>
        </Card>
    )
};

const Settings = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex pb-6">
        <h1 className="font-bold text-3xl md:text-5xl">Settings</h1>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Tabs defaultValue="account" className="w-full pb-4">
          <TabsListAlt className="flex justify-center gap-4 w-full ">
            <TabsTriggerAlt
              className="w-1/4 flex items-center gap-2"
              value="account"
            >
              <FaUser className="text-lg" />
              Account
            </TabsTriggerAlt>
            <TabsTriggerAlt
              className="w-1/4 flex items-center gap-2"
              value="security"
            >
              <FaLock className="text-lg" />
              Security
            </TabsTriggerAlt>
            <TabsTriggerAlt
              className="w-1/4 flex items-center gap-2"
              value="notifications"
            >
              <FaBell className="text-lg" />
              Notifications
            </TabsTriggerAlt>
            <TabsTriggerAlt
              className="w-1/4 flex items-center gap-2"
              value="billing"
            >
              <FaCreditCard className="text-lg" />
              Billing
            </TabsTriggerAlt>
          </TabsListAlt>

          <div className="pt-4">
            <TabsContent value="account">
              <AccountSettings />
            </TabsContent>

            <TabsContent value="security">
              <SecuritySettings />
            </TabsContent>

            <TabsContent value ='notifications'>
              <Notifications />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
