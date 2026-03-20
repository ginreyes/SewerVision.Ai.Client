"use client";

import { Mail, Settings, Ticket, MessageSquare, Clock, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const ToggleSetting = ({ id, label, description, icon: Icon, checked, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-gray-500" />
        </div>
      )}
      <div>
        <Label htmlFor={id} className="text-sm font-medium text-gray-900 cursor-pointer">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onChange} />
  </div>
);

export default function NotificationPreferences({ preferences, onToggle }) {
  return (
    <div className="space-y-6">
      {/* Delivery Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Mail className="w-5 h-5 text-teal-600" />
            Delivery
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          <ToggleSetting
            id="email"
            label="Email Notifications"
            description="Receive email alerts for ticket activity"
            icon={Mail}
            checked={preferences.emailNotifications}
            onChange={() => onToggle("emailNotifications")}
          />
          <ToggleSetting
            id="push"
            label="Push Notifications"
            description="Browser push alerts"
            icon={Bell}
            checked={preferences.push}
            onChange={() => onToggle("push")}
          />
        </CardContent>
      </Card>

      {/* Support Alert Types */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-600" />
            Support Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100">
          <ToggleSetting
            id="ticket-assigned"
            label="Ticket Assigned"
            description="When a ticket is assigned to you"
            icon={Ticket}
            checked={preferences.ticketAssigned}
            onChange={() => onToggle("ticketAssigned")}
          />
          <ToggleSetting
            id="ticket-updated"
            label="Ticket Updated"
            description="When a ticket you handle gets updated"
            icon={Clock}
            checked={preferences.ticketUpdated}
            onChange={() => onToggle("ticketUpdated")}
          />
          <ToggleSetting
            id="new-ticket"
            label="New Ticket"
            description="When a new support ticket is created"
            icon={MessageSquare}
            checked={preferences.newTicket}
            onChange={() => onToggle("newTicket")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
