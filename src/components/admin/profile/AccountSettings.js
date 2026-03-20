"use client";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import React, { useEffect, useRef, useState } from "react";
import { useDialog } from "@/components/providers/DialogProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { api, getCookie } from "@/lib/helper";
import { useUser } from "@/components/providers/UserContext";

const AccountSettings = () => {
  const { userData } = useUser();
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
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showAlert("Only image files are accepted", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showAlert("File size should be under 5MB.", "error");
      return;
    }

    const userId = userData?._id;
    const username = userData?.username || getCookie("username");
    if (!userId && !username) {
      showAlert("Please refresh the page or log in again to update your avatar.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);
    if (username) formData.append("username", username);

    try {
      const uploadPath = userId
        ? `/api/users/upload-avatar/${userId}`
        : "/api/users/upload-avatar";
      const { ok, data } = await api(uploadPath, "POST", formData);

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
            <Select
              value={formData.role}
              onValueChange={(value) => {
                setFormData({ ...formData, role: value });
                setIsDirty(true);
              }}
              disabled
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="qc-technician">QC Technician</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="customer-rep">Customer Rep</SelectItem>
              </SelectContent>
            </Select>
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
          <Card className="bg-amber-50 border-amber-200 rounded-2xl">
            <CardHeader>
              <h1 className="text-amber-600 font-bold text-2xl">
                Are you sure you want to delete your account?
              </h1>
              <p className="text-amber-600 font-bold">
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

export default AccountSettings;
