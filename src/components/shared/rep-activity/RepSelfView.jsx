"use client";

import React from "react";
import {
  Ticket,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Gauge,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getWorkloadConfig } from "./workloadConfig";

const memberName = (rep) => {
  if (!rep) return "You";
  const full = [rep.first_name, rep.last_name].filter(Boolean).join(" ").trim();
  return full || rep.username || rep.email || "You";
};

const MetricRow = ({ icon: Icon, label, value, color, bg }) => (
  <div className="flex items-center gap-3 py-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{value}</p>
    </div>
  </div>
);

export default function RepSelfView({ data }) {
  if (!data) return null;

  const rep = data.rep || {};
  const wl = getWorkloadConfig(data.workload);
  const slaPct =
    typeof data.slaCompliance === "number" ? `${Math.round(data.slaCompliance * 100)}%` : "—";
  const avgResp =
    typeof data?.tickets?.avgResponseHours === "number"
      ? `${data.tickets.avgResponseHours}h`
      : "—";

  return (
    <div className="space-y-4">
      <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardContent className="p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {memberName(rep)}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Your activity across tickets, complaints and overtime — last 7 days
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${wl.className}`}
            >
              <span className={`w-2 h-2 rounded-full ${wl.dot}`} />
              {wl.label} workload
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardContent className="p-4">
            <h3 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-1">
              Tickets
            </h3>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <MetricRow
                icon={Ticket}
                label="Open"
                value={data.tickets?.open ?? 0}
                color="text-indigo-600 dark:text-indigo-400"
                bg="bg-indigo-50 dark:bg-indigo-900/30"
              />
              <MetricRow
                icon={CheckCircle2}
                label="Resolved (7d)"
                value={data.tickets?.resolved7d ?? 0}
                color="text-emerald-600 dark:text-emerald-400"
                bg="bg-emerald-50 dark:bg-emerald-900/30"
              />
              <MetricRow
                icon={Clock}
                label="Avg response time"
                value={avgResp}
                color="text-amber-600 dark:text-amber-400"
                bg="bg-amber-50 dark:bg-amber-900/30"
              />
              <MetricRow
                icon={Gauge}
                label="SLA compliance"
                value={slaPct}
                color="text-violet-600 dark:text-violet-400"
                bg="bg-violet-50 dark:bg-violet-900/30"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardContent className="p-4">
            <h3 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold mb-1">
              Complaints & Overtime
            </h3>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <MetricRow
                icon={AlertOctagon}
                label="Open complaints"
                value={data.complaints?.open ?? 0}
                color="text-rose-600 dark:text-rose-400"
                bg="bg-rose-50 dark:bg-rose-900/30"
              />
              <MetricRow
                icon={CheckCircle2}
                label="Complaints resolved (7d)"
                value={data.complaints?.resolved7d ?? 0}
                color="text-emerald-600 dark:text-emerald-400"
                bg="bg-emerald-50 dark:bg-emerald-900/30"
              />
              <MetricRow
                icon={Zap}
                label="Overtime pending"
                value={`${data.overtime?.pendingHours ?? 0}h`}
                color="text-amber-600 dark:text-amber-400"
                bg="bg-amber-50 dark:bg-amber-900/30"
              />
              <MetricRow
                icon={Zap}
                label="Overtime approved (7d)"
                value={`${data.overtime?.approvedHours7d ?? 0}h`}
                color="text-indigo-600 dark:text-indigo-400"
                bg="bg-indigo-50 dark:bg-indigo-900/30"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
