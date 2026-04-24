"use client";

import React, { useState } from "react";
import { Clock, Zap } from "lucide-react";
import { useUser } from "@/components/providers/UserContext";
import { ClockWorkspace } from "@/components/shared/time-tracking";
import { OvertimePanel } from "@/components/shared/overtime";
import FadeIn from "@/components/shared/FadeIn";

const TABS = [
  { key: "clock", label: "Clock In/Out", icon: Clock },
  { key: "overtime", label: "Overtime", icon: Zap },
];

export default function QcTechnicianClock() {
  const { userId } = useUser();
  const [tab, setTab] = useState("clock");

  return (
    <div>
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-1.5 border-b border-gray-200 dark:border-gray-700">
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
                    ? "border-red-600 text-red-700 dark:text-red-300"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <FadeIn key={tab} duration={180}>
        {tab === "clock" && (
          <ClockWorkspace
            userId={userId}
            accent="red"
            title="Clock"
            description="Clock in and out for your shift"
            showProject={false}
            showExport={false}
            typeOptions={["Shift", "Review", "Training", "Meeting", "Break"]}
            defaultType="Shift"
          />
        )}

        {tab === "overtime" && (
          <div className="max-w-6xl mx-auto px-6 py-6">
            <OvertimePanel userId={userId} projects={[]} accent="red" showProject={false} />
          </div>
        )}
      </FadeIn>
    </div>
  );
}
