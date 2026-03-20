"use client";

import React from "react";
import { Mail, Phone, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function ProfileForm({ profile, onChange, onSave, saving }) {
  return (
    <Card className="lg:col-span-2 border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Personal Information</CardTitle>
        <CardDescription>Update your profile details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>First Name</Label>
            <Input value={profile.first_name} onChange={(e) => onChange({ ...profile, first_name: e.target.value })} placeholder="First name" />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input value={profile.last_name} onChange={(e) => onChange({ ...profile, last_name: e.target.value })} placeholder="Last name" />
          </div>
        </div>
        <div>
          <Label className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</Label>
          <Input value={profile.email} disabled className="bg-gray-50" />
          <p className="text-xs text-gray-400 mt-1">Contact admin to change email</p>
        </div>
        <div>
          <Label className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</Label>
          <Input value={profile.phone_number} onChange={(e) => onChange({ ...profile, phone_number: e.target.value })} placeholder="+63..." />
        </div>
        <Separator />
        <div className="flex justify-end">
          <Button onClick={onSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
