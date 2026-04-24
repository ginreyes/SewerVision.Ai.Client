"use client";

import React from "react";
import { useUser } from "@/components/providers/UserContext";
import { OvertimeApprovalList } from "@/components/shared/overtime";

export default function UserOvertimeApprovalPage() {
  const { userId } = useUser();

  return (
    <OvertimeApprovalList
      approverTier="team-lead"
      managedBy={userId}
      title="Team Overtime"
      description="Review overtime requests from operators and QC technicians you manage"
      accent="indigo"
    />
  );
}
