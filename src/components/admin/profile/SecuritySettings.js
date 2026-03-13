"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDialog } from "@/components/providers/DialogProvider";
import { useAlert } from "@/components/providers/AlertProvider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/helper";

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
        \u26a0\ufe0f Take note: You can only change your password up to 3 times per month.
        You will need to verify your account again after changing your password.
        Are you sure you want to proceed? \ud83d\udd12
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

export default SecuritySettings;
