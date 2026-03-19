"use client";

import React from "react";
import { Users, Loader2 } from "lucide-react";
import { useSupportTeam } from "@/hooks/useQueryHooks";
import EmptySewerComponent from "@/components/shared/EmptySewerComponent";

// Extracted components
import TeamStats from "@/components/customer-rep/team/TeamStats";
import TeamMemberCard from "@/components/customer-rep/team/TeamMemberCard";

export default function CustomerRepTeam() {
  const { data: teamRaw, isLoading } = useSupportTeam({ refetchInterval: 60000 });
  const team = Array.isArray(teamRaw) ? teamRaw : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support Team</h1>
            <p className="text-sm text-gray-500">Team workload and availability overview</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mb-8">
          <TeamStats team={team} />
        </div>

        {/* Team Grid */}
        {team.length === 0 ? (
          <div className="rounded-xl border border-gray-200 shadow-sm py-16 bg-gray-50 ">
            <EmptySewerComponent
              variant="no-data"
              title="No team members"
              subtitle="Customer-rep users will appear here once accounts are created"
              size="md"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map((member) => (
              <TeamMemberCard key={member._id} member={member} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
