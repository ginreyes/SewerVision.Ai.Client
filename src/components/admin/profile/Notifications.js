"use client";

import React from "react";
import { Bell, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Notifications() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="w-4 h-4" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">
          Notification preferences are managed in the{" "}
          <a href="/admin/settings" className="text-rose-600 hover:text-rose-700 font-medium underline">
            Settings
          </a>{" "}
          page under the Notifications tab.
        </p>
      </CardContent>
    </Card>
  );
}
