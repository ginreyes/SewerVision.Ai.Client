"use client";

import React from "react";
import { getOvertimeStatusConfig } from "@/components/user/constants";

export default function OvertimeStatusBadge({ status, className = "" }) {
  const cfg = getOvertimeStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full border ${cfg.className} ${cfg.darkClassName} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
