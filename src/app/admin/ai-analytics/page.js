"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Brain, TrendingUp, TrendingDown, Shield, AlertTriangle,
  Target, BarChart3, Loader2, Eye, XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/helper";
import { DashboardSkeleton } from "@/components/shared/SkeletonLoading";

const useAIAnalytics = () =>
  useQuery({
    queryKey: ["ai-analytics"],
    queryFn: async () => {
      const { data } = await api("/api/ai-analytics/overview");
      return data?.data || null;
    },
    staleTime: 5 * 60 * 1000,
  });

const StatCard = ({ icon: Icon, label, value, suffix = "", trend, trendLabel, bg, color }) => (
  <div className={`${bg} rounded-2xl p-5 border border-gray-100`}>
    <div className="flex items-center justify-between mb-3">
      <Icon className={`w-5 h-5 ${color}`} />
      {trend !== undefined && trend !== 0 && (
        <span className={`flex items-center gap-0.5 text-[10px] font-medium ${trend > 0 ? "text-emerald-600" : "text-red-500"}`}>
          {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend > 0 ? "+" : ""}{Math.round(trend)}{suffix}
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}{suffix}</p>
    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
  </div>
);

const ConfidenceBar = ({ type, avgConfidence, count }) => {
  const pct = Math.min(100, avgConfidence);
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-xs font-medium text-gray-700 w-28 truncate capitalize">{type?.replace(/_/g, " ")}</span>
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-700 w-12 text-right">{pct}%</span>
      <span className="text-[10px] text-gray-400 w-10 text-right">{count}</span>
    </div>
  );
};

export default function AIAnalyticsPage() {
  const { data, isLoading } = useAIAnalytics();

  if (isLoading) return <DashboardSkeleton />;
  if (!data) return <div className="text-center py-20 text-gray-400">No analytics data available</div>;

  const { summary, byType, weeklyTrend, lowConfidence } = data;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-md">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI Detection Analytics</h1>
          <p className="text-sm text-gray-500">Model performance, confidence trends, and accuracy metrics</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Avg Confidence" value={summary.avgConfidence} suffix="%" trend={summary.confidenceTrend} bg="bg-violet-50" color="text-violet-600" />
        <StatCard icon={Shield} label="Approval Rate" value={summary.approvalRate} suffix="%" bg="bg-emerald-50" color="text-emerald-600" />
        <StatCard icon={XCircle} label="False Positive Rate" value={summary.falsePositiveRate} suffix="%" bg="bg-red-50" color="text-red-600" />
        <StatCard icon={Eye} label="Total Detections" value={summary.totalDetections} bg="bg-blue-50" color="text-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Confidence by Type (3/5) */}
        <div className="lg:col-span-3">
          <Card className="border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-gray-800">Confidence by Detection Type</CardTitle>
            </CardHeader>
            <CardContent>
              {byType.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No detection data</p>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-3 pb-1 border-b border-gray-100 text-[10px] text-gray-400 font-medium">
                    <span className="w-28">Type</span><span className="flex-1">Confidence</span><span className="w-12 text-right">Avg</span><span className="w-10 text-right">Count</span>
                  </div>
                  {byType.map((t) => <ConfidenceBar key={t.type} {...t} />)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Trend + Low Confidence (2/5) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-gray-800">Weekly Confidence Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyTrend.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No trend data</p>
              ) : (
                <div className="flex items-end gap-1 h-32">
                  {weeklyTrend.map((w, i) => {
                    const pct = Math.min(100, w.avgConfidence);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`Week ${w.week}: ${pct}% (${w.count} detections)`}>
                        <span className="text-[9px] text-gray-400">{pct}%</span>
                        <div className="w-full rounded-t" style={{ height: `${pct}%`, backgroundColor: pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444' }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Low Confidence Detections
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowConfidence.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No low-confidence detections</p>
              ) : (
                <div className="space-y-2">
                  {lowConfidence.map((d) => (
                    <div key={d._id} className="flex items-center gap-2 text-xs p-2 bg-amber-50 rounded-lg">
                      <span className="font-semibold text-gray-700 capitalize">{d.type?.replace(/_/g, " ")}</span>
                      <Badge className="bg-red-100 text-red-700 text-[9px]">{d.confidence}%</Badge>
                      <span className="flex-1 text-gray-400 truncate">{d.projectName}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
