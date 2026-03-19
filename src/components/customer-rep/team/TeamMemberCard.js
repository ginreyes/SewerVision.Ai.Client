"use client";

import React from "react";
import { Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserName } from "../constants";

export default function TeamMemberCard({ member }) {
  const name = getUserName(member);
  const stats = member.ticketStats || {};
  const totalActive = (stats.open || 0) + (stats.inProgress || 0);
  const avatarUrl = member.avatar
    ? `/api/users/avatar/${member._id}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0d9488&color=fff&size=80`;

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <img src={avatarUrl} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-teal-100" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
              <Mail className="w-3 h-3" /> {member.email}
            </p>
          </div>
          <Badge variant="outline" className="ml-auto bg-teal-50 text-teal-700 border-teal-200 text-[10px]">Active</Badge>
        </div>

        {/* Workload Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-amber-50">
            <p className="text-lg font-bold text-amber-600">{stats.open || 0}</p>
            <p className="text-[10px] text-gray-500">Open</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50">
            <p className="text-lg font-bold text-blue-600">{stats.inProgress || 0}</p>
            <p className="text-[10px] text-gray-500">In Progress</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50">
            <p className="text-lg font-bold text-emerald-600">{stats.resolved || 0}</p>
            <p className="text-[10px] text-gray-500">Resolved</p>
          </div>
        </div>

        {/* Workload Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Active Load</span>
            <span>{totalActive} ticket{totalActive !== 1 ? "s" : ""}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                totalActive > 10 ? "bg-red-500" : totalActive > 5 ? "bg-amber-500" : "bg-teal-500"
              }`}
              style={{ width: `${Math.min(totalActive * 10, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
