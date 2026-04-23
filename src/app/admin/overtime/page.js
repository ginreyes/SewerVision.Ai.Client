"use client";

import React from "react";
import { OvertimeApprovalList } from "@/components/shared/overtime";

export default function AdminOvertime() {
  return (
    <OvertimeApprovalList
      approverTier="admin"
      title="Overtime Approvals"
      description="Review team-lead and customer-rep overtime requests"
      accent="rose"
    />
  );
}
