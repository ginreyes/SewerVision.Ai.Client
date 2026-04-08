"use client";

import React from "react";
import { Users, Loader2 } from "lucide-react";
import { useManagedTeam, useSupportTeam } from "@/hooks/useQueryHooks";
import { useUser } from "@/components/providers/UserContext";
import EmptySewerComponent from "@/components/shared/EmptySewerComponent";

// Extracted components
import TeamStats from "@/components/customer-rep/team/TeamStats";
import TeamMemberCard from "@/components/customer-rep/team/TeamMemberCard";
import { GridSkeleton } from '@/components/shared/SkeletonLoading';

export default function CustomerRepTeam() {
  const { userData } = useUser();
  const userId = userData?._id || userData?.id;

  // Fetch managed members for this customer-rep
  const { data: managedRaw, isLoading: managedLoading } = useManagedTeam(userId, { refetchInterval: 60000 });
  // Fallback: if no managed members, show all team
  const { data: allTeamRaw, isLoading: allLoading } = useSupportTeam({ refetchInterval: 60000 });

  const managedTeam = Array.isArray(managedRaw) ? managedRaw : [];
  const allTeam = Array.isArray(allTeamRaw) ? allTeamRaw : [];

  // Show managed members if this rep has any, otherwise show the full team
  const hasManaged = managedTeam.length > 0;
  const team = hasManaged ? managedTeam : allTeam;
  const isLoading = hasManaged ? managedLoading : (managedLoading || allLoading);

  return (<GridSkeleton count={6} />)

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {hasManaged ? "My Team" : "Support Team"}
            </h1>
            <p className="text-sm text-gray-500">
              {hasManaged
                ? "Members assigned under your management"
                : "Team workload and availability overview"}
            </p>
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
              subtitle="Customer-rep users will appear here once they are assigned to you"
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
