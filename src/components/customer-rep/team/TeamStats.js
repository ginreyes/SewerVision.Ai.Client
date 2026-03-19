"use client";

import React from "react";
import { Users, Ticket, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function TeamStats({ team = [] }) {
  const totalOpen = team.reduce((sum, m) => sum + (m.ticketStats?.open || 0), 0);
  const totalResolved = team.reduce((sum, m) => sum + (m.ticketStats?.resolved || 0), 0);

  const cards = [
    { title: "Team Size", value: team.length, icon: Users, color: "text-teal-600", gradient: "bg-gradient-to-br from-teal-50 to-cyan-50" },
    { title: "Total Open", value: totalOpen, icon: Ticket, color: "text-amber-600", gradient: "bg-gradient-to-br from-amber-50 to-orange-50" },
    { title: "Total Resolved", value: totalResolved, icon: CheckCircle, color: "text-emerald-600", gradient: "bg-gradient-to-br from-emerald-50 to-green-50" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((c) => (
        <Card key={c.title} className={`border-0 shadow-sm ${c.gradient}`}>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">{c.title}</p>
              <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
            <c.icon className={`w-8 h-8 ${c.color} opacity-30`} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
