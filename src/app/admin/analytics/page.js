"use client";

import React from "react";
import {
  BarChart2, TrendingUp, Users, FolderOpen, CheckCircle2, Clock,
  Download, Zap, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CHART_MONTHS } from "@/components/admin/constants";
import {
  BarChart,
  DonutRing,
  TeamProductivityTable,
} from "@/components/admin/analytics";
import { useAdminAnalytics } from "@/hooks/useQueryHooks";
import { DashboardSkeleton } from '@/components/shared/SkeletonLoading';

const ICON_MAP = { FolderOpen, Users, CheckCircle2, Clock };

export default function AdminAnalytics() {
  const { data: analytics, isLoading } = useAdminAnalytics();

  if (isLoading) return (<DashboardSkeleton />)
  const kpiMetrics = analytics?.kpiMetrics || [];
  const monthlyProjects = analytics?.monthlyProjects || [];
  const aiAccuracy = analytics?.aiAccuracy || [];
  const teamProductivity = analytics?.teamProductivity || [];
  const aiDetection = analytics?.aiDetection || {};

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center text-white shadow-md">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Analytics & Insights</h1>
            <p className="text-sm text-gray-500">Platform-wide productivity, AI accuracy, and project trends</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="w-4 h-4" /> Export Report
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {kpiMetrics.map(m => {
          const Icon = ICON_MAP[m.iconName] || FolderOpen;
          return (
            <Card key={m.key} className="border-gray-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${m.bg}`}>
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-gray-900">{m.value}</p>
                  <p className="text-xs text-gray-500">{m.label}</p>
                </div>
                <span className={`text-[11px] font-semibold ${m.up ? "text-emerald-600" : "text-red-500"}`}>{m.trend}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Monthly projects chart */}
        <Card className="border-gray-200 col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FolderOpen className="w-4 h-4 text-rose-500" />Project Completions (12 Months)</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <BarChart data={monthlyProjects} labels={CHART_MONTHS} color="bg-rose-500" height={100} />
            <div className="flex justify-between mt-2">
              {CHART_MONTHS.map(m => <span key={m} className="text-[9px] text-gray-400">{m}</span>)}
            </div>
          </CardContent>
        </Card>

        {/* AI Accuracy donuts */}
        <Card className="border-gray-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" />AI Detection Accuracy</CardTitle></CardHeader>
          <CardContent className="pt-0 flex flex-wrap justify-around gap-3">
            <DonutRing pct={aiDetection.thisMonth ?? 0} color="#10b981" size={70} label="This Month" />
            <DonutRing pct={aiDetection.lastMonth ?? 0} color="#3b82f6" size={70} label="Last Month" />
            <DonutRing pct={aiDetection.q1Avg ?? 0} color="#f59e0b" size={70} label="Q1 Avg" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* AI Accuracy trend */}
        <Card className="border-gray-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" />AI Accuracy Trend (%)</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <BarChart data={aiAccuracy} labels={CHART_MONTHS} color="bg-emerald-500" height={80} />
            <div className="flex justify-between mt-2">
              {CHART_MONTHS.map(m => <span key={m} className="text-[9px] text-gray-400">{m}</span>)}
            </div>
          </CardContent>
        </Card>

        {/* Team productivity */}
        <Card className="border-gray-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" />Team Productivity</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <TeamProductivityTable data={teamProductivity} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
