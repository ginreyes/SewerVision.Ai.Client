"use client";

import React from "react";
import { useUser } from "@/components/providers/UserContext";
import { ClockWorkspace } from "@/components/shared/time-tracking";

export default function CustomerRepClock() {
  const { userId } = useUser();

  return (
    <ClockWorkspace
      userId={userId}
      accent="purple"
      title="Clock"
      description="Clock in and out for your shift"
      showProject={false}
      showExport={false}
      typeOptions={["Shift", "Support", "Meeting", "Training", "Break"]}
      defaultType="Shift"
    />
  );
}
