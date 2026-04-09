"use client";

import React, { useMemo } from "react";
import { useUser } from "@/components/providers/UserContext";
import { useOperatorProjects } from "@/hooks/useQueryHooks";
import { ClockWorkspace } from "@/components/shared/time-tracking";

export default function TimeTracking() {
  const { userId } = useUser();
  const { data: projectsData } = useOperatorProjects(userId);
  const projects = useMemo(() => {
    const raw = projectsData?.data || projectsData || [];
    return Array.isArray(raw) ? raw : [];
  }, [projectsData]);

  return (
    <ClockWorkspace
      userId={userId}
      projects={projects}
      accent="blue"
      title="Time Tracking"
      description="Clock in/out per project and generate timesheets"
    />
  );
}
