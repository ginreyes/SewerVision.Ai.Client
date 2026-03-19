"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SecurityForm({ onSubmit, saving }) {
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = () => {
    onSubmit(passwords, () => setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" }));
  };

  return (
    <Card className="border-0 shadow-sm max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Lock className="w-4 h-4" /> Change Password</CardTitle>
        <CardDescription>Ensure your account stays secure</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Current Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={passwords.currentPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
              placeholder="Enter current password"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <Label>New Password</Label>
          <Input type="password" value={passwords.newPassword} onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))} placeholder="Enter new password" />
        </div>
        <div>
          <Label>Confirm New Password</Label>
          <Input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))} placeholder="Confirm new password" />
        </div>
        <Separator />
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
            Update Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
