"use client";

import React from "react";
import { useUser } from "@/components/providers/UserContext";
import { RepActivityDashboard } from "@/components/shared/rep-activity";

export default function CustomerRepPerformance() {
  const { userId } = useUser();
  return <RepActivityDashboard mode="self" repId={userId} accent="purple" />;
}
