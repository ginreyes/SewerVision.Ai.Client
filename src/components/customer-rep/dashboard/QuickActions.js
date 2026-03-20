"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Ticket, Users, BarChart2, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QuickActions() {
  const router = useRouter();

  const actions = [
    { label: "View All Tickets", icon: Ticket, color: "text-teal-600", path: "/customer-rep/tickets" },
    { label: "Team Workload", icon: Users, color: "text-blue-600", path: "/customer-rep/team" },
    { label: "SLA Monitoring", icon: BarChart2, color: "text-purple-600", path: "/customer-rep/monitoring" },
    { label: "Inbox", icon: Inbox, color: "text-gray-600", path: "/customer-rep/inbox" },
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((a) => (
          <Button
            key={a.path}
            variant="outline"
            className="w-full justify-start"
            onClick={() => router.push(a.path)}
          >
            <a.icon className={`w-4 h-4 mr-2 ${a.color}`} />
            {a.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
