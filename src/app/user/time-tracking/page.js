"use client";

import React, { useMemo } from "react";
import { useUser } from "@/components/providers/UserContext";
import { useUserProjects } from "@/hooks/useQueryHooks";
import { ClockWorkspace } from "@/components/shared/time-tracking";

export default function UserTimeTracking() {
  const { userId } = useUser();
  const { data: projectsData } = useUserProjects(userId, { page: 1, limit: 100 });
  const projects = useMemo(() => {
    const raw = projectsData?.data || projectsData || [];
    return Array.isArray(raw) ? raw : [];
  }, [projectsData]);

  return (
    <ClockWorkspace
      userId={userId}
      projects={projects}
      accent="indigo"
      title="Time Tracking"
      description="Clock in/out and review your attendance history"
    />
  );
}
