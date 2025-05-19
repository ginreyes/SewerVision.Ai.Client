"use client";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsListAlt,
  TabsTriggerAlt,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useRef, useState } from "react";
import { FaUser, FaLock, FaBell, FaCreditCard } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDialog } from "@/components/providers/DialogProvider";
import { useAlert } from "@/components/providers/AlertProvider";

const AccountSettings = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });

  const [avatar, setAvatar] = useState("/avatar_default.png");
  const [isDirty, setIsDirty] = useState(false);

  const { showAlert } = useDialog();

  const fileInputRef = useRef(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsDirty(true);
  };

  

  const handleCancel = () => {
    setFormData({ firstName: "", lastName: "", email: "", role: "" });
    setIsDirty(false);
  };

 
  const handleAvatarUpload = (e) => {

    const file = e.target.files[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        showAlert({
          type: "error",
          title: "Invalid File",
          description: "Only image files are allowed.",
        });
        return;
      }
  
      if (file.size > 2 * 1024 * 1024) {
        ({
          type: "error",
          title: "File Too Large",
          description: "File size should be under 2MB.",
        });
        return;
      }
  
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
      setIsDirty(true);
    }
  };

  const handleSave = () => {
    try {
      
    } catch (error) {
      
    }
    setIsDirty(false);
  };
  
  

  const handleAvatarReset = () => {
    setAvatar("/avatar_default.png");
    setIsDirty(true);
  };

  return (
    <>
    <Card className="p-4">
      <CardContent className="flex gap-6 items-start">
        {/* Avatar Box */}
        <div className="flex flex-col items-center p-4 border rounded-md">
          <Avatar className="w-32 h-32">
            <img src={avatar} alt="User Avatar" className="rounded-md" />
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
          <Button onClick={handleSave} variant="rose" text="Save Changes" />
          <Button variant="secondary" onClick={handleCancel} text="Cancel" />
        </CardFooter>
      )}
    </Card>

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
  
    const passwordValid = /^(?=.*[a-z])(?=.*[\d\s\W]).{8,}$/.test(newPassword);
    if (!passwordValid) {
      showAlert("New password does not meet the requirements.", "error");
      return;
    }
  
    try {
      setLoading(true);
  
      const usernameOrEmail = localStorage.getItem("username");
  
      if (!usernameOrEmail) {
        showSessionExpiredDialog(); // 👈 if username is missing, maybe expired
        setLoading(false);
        return;
      }
  
      const response = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          isChangePassword: true,
          currentPassword,
          newPassword,
          usernameOrEmail,
        }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {

        if (response.status === 401 && result.message.includes("expired")) {
          showSessionExpiredDialog();
        }
        else {
          showAlert(result.message || "Failed to change password.", "error");
        }
  
        throw new Error(result.message || "Failed to change password.");
      }
  
      showAlert("Password changed successfully!", "success");
      resetForm();
    } 
    catch (e) {
      console.log(`Error: ${e.message}`);
    } 
    finally {
      setLoading(false);
    }
  };
  
  
  
  return (
    <Card>
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
  );
};

const Settings = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex pb-6">
        <h1 className="font-bold text-3xl md:text-5xl">Setting</h1>
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
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
