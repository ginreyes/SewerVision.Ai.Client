"use client";

import React, { useRef } from "react";
import { Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function AvatarCard({ userId, profile, initials, onUpload }) {
  const fileInputRef = useRef(null);

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6 flex flex-col items-center">
        <div className="relative group">
          <Avatar className="w-24 h-24 border-4 border-teal-100">
            <AvatarImage src={userId ? `/api/users/avatar/${userId}` : ""} />
            <AvatarFallback className="bg-teal-100 text-teal-700 text-2xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera className="w-6 h-6 text-white" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onUpload} className="hidden" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mt-4">{profile.first_name} {profile.last_name}</h3>
        <p className="text-sm text-gray-500">{profile.email}</p>
        <Badge variant="outline" className="mt-2 bg-teal-50 text-teal-700 border-teal-200">Customer Rep</Badge>
      </CardContent>
    </Card>
  );
}
