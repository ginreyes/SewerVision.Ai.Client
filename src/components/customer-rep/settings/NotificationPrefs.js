"use client";

import React from "react";
import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const ITEMS = [
  { key: "emailNotifications", label: "Email Notifications", desc: "Receive notifications via email" },
  { key: "ticketAssigned", label: "Ticket Assigned", desc: "When a ticket is assigned to you" },
  { key: "ticketUpdated", label: "Ticket Updated", desc: "When a ticket you're handling gets updated" },
  { key: "newTicket", label: "New Ticket", desc: "When a new support ticket is created" },
];

export default function NotificationPrefs({ notifications, onChange }) {
  return (
    <Card className="border-0 shadow-sm max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4" /> Notification Preferences</CardTitle>
        <CardDescription>Choose what notifications you receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {ITEMS.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <Switch
              checked={notifications[item.key]}
              onCheckedChange={(v) => onChange({ ...notifications, [item.key]: v })}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
