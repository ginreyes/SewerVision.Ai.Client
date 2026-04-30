"use client";

import React, { useMemo, useState } from "react";
import { Clock, Zap, ClipboardCheck } from "lucide-react";
import { useUser } from "@/components/providers/UserContext";
import { useOperatorProjects } from "@/hooks/useQueryHooks";
import { ClockWorkspace } from "@/components/shared/time-tracking";
import { OvertimePanel } from "@/components/shared/overtime";
import FadeIn from "@/components/shared/FadeIn";
import ShiftHandoffModal from "@/components/operator/ShiftHandoffModal";

const TABS = [
  { key: "clock", label: "Clock In/Out", icon: Clock },
  { key: "overtime", label: "Overtime", icon: Zap },
];

export default function OperatorTimeTracking() {
  const { userId } = useUser();
  const [tab, setTab] = useState("clock");
  const [handoffOpen, setHandoffOpen] = useState(false);
  const { data: projectsData } = useOperatorProjects(userId);
  const projects = useMemo(() => {
    const raw = projectsData?.data || projectsData || [];
    return Array.isArray(raw) ? raw : [];
  }, [projectsData]);

  return (
    <div>
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="flex items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5">
            {TABS.map((t) => {
              const active = tab === t.key;
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    active
                      ? "border-blue-600 text-blue-700 dark:text-blue-300"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setHandoffOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 mb-1 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            End shift
          </button>
        </div>
      </div>

      <ShiftHandoffModal open={handoffOpen} onOpenChange={setHandoffOpen} />

      <FadeIn key={tab} duration={180}>
        {tab === "clock" && (
          <ClockWorkspace
            userId={userId}
            projects={projects}
            accent="blue"
            title="Time Tracking"
            description="Clock in/out per project and generate timesheets"
          />
        )}

        {tab === "overtime" && (
          <div className="max-w-6xl mx-auto px-6 py-6">
            <OvertimePanel userId={userId} projects={projects} accent="blue" showProject />
          </div>
        )}
      </FadeIn>
    </div>
  );
}
