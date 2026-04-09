"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  GitCompare, ArrowLeft, TrendingUp, TrendingDown, Minus,
  Shield, Target, Eye, AlertTriangle, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { api } from "@/lib/helper";
import { DashboardSkeleton } from "@/components/shared/SkeletonLoading";

const useProjects = () =>
  useQuery({
    queryKey: ["all-projects-for-compare"],
    queryFn: async () => {
      const { data } = await api("/api/projects/get-all-projects");
      return data?.data || data?.projects || [];
    },
  });

const useComparison = (idA, idB) =>
  useQuery({
    queryKey: ["project-compare", idA, idB],
    queryFn: async () => {
      const { data } = await api(`/api/projects/compare?projectA=${idA}&projectB=${idB}`);
      return data?.data || null;
    },
    enabled: !!(idA && idB),
  });

const DeltaIndicator = ({ value, suffix = "", invert = false }) => {
  if (value === 0) return <Minus className="w-3 h-3 text-gray-400" />;
  const isGood = invert ? value < 0 : value > 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${isGood ? "text-emerald-600" : "text-red-500"}`}>
      {value > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {value > 0 ? "+" : ""}{value}{suffix}
    </span>
  );
};

const CompareCard = ({ label, valueA, valueB, delta, suffix = "", invert = false }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4">
    <p className="text-[10px] text-gray-400 uppercase font-medium mb-2">{label}</p>
    <div className="flex items-center justify-between">
      <div className="text-center">
        <p className="text-lg font-bold text-rose-600">{valueA}{suffix}</p>
        <p className="text-[9px] text-gray-400">Project A</p>
      </div>
      <DeltaIndicator value={delta} suffix={suffix} invert={invert} />
      <div className="text-center">
        <p className="text-lg font-bold text-blue-600">{valueB}{suffix}</p>
        <p className="text-[9px] text-gray-400">Project B</p>
      </div>
    </div>
  </div>
);

export default function ProjectComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();

  const [idA, setIdA] = useState(searchParams?.get("a") || "");
  const [idB, setIdB] = useState(searchParams?.get("b") || "");

  const { data: comparison, isLoading: comparing } = useComparison(idA, idB);
  const pA = comparison?.projectA;
  const pB = comparison?.projectB;
  const deltas = comparison?.deltas;

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center text-white shadow-md">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Project Comparison</h1>
            <p className="text-sm text-gray-500">Side-by-side analysis of two inspection projects</p>
          </div>
        </div>
      </div>

      {/* Project Selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-rose-600">Project A</label>
          <Select value={idA} onValueChange={setIdA}>
            <SelectTrigger className="border-rose-200 focus:ring-rose-500"><SelectValue placeholder="Select project..." /></SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p._id} value={p._id} disabled={p._id === idB}>
                  {p.name} — {p.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-blue-600">Project B</label>
          <Select value={idB} onValueChange={setIdB}>
            <SelectTrigger className="border-blue-200 focus:ring-blue-500"><SelectValue placeholder="Select project..." /></SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p._id} value={p._id} disabled={p._id === idA}>
                  {p.name} — {p.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Comparison Results */}
      {!idA || !idB ? (
        <div className="text-center py-20 text-gray-400">
          <GitCompare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select two projects to compare</p>
        </div>
      ) : comparing ? (
        <DashboardSkeleton />
      ) : pA && pB ? (
        <div className="space-y-6">
          {/* Project Headers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
              <h3 className="text-sm font-bold text-rose-800">{pA.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-rose-100 text-rose-700 text-[10px]">{pA.status}</Badge>
                <span className="text-[10px] text-rose-500">{pA.location}</span>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="text-sm font-bold text-blue-800">{pB.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-blue-100 text-blue-700 text-[10px]">{pB.status}</Badge>
                <span className="text-[10px] text-blue-500">{pB.location}</span>
              </div>
            </div>
          </div>

          {/* Delta Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CompareCard label="Total Defects" valueA={pA.totalDefects} valueB={pB.totalDefects} delta={deltas.defects} invert />
            <CompareCard label="AI Confidence" valueA={pA.avgConfidence} valueB={pB.avgConfidence} delta={deltas.confidence} suffix="%" />
            <CompareCard label="Observations" valueA={pA.observations} valueB={pB.observations} delta={deltas.observations} invert />
            <CompareCard label="Progress" valueA={pA.progress} valueB={pB.progress} delta={pA.progress - pB.progress} suffix="%" />
          </div>

          {/* Defect Type Comparison */}
          <Card className="border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-gray-800">Defect Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const allTypes = [...new Set([
                  ...pA.detectionsByType.map((d) => d.type),
                  ...pB.detectionsByType.map((d) => d.type),
                ])];
                return allTypes.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No detection data</p>
                ) : (
                  <div className="space-y-3">
                    {allTypes.map((type) => {
                      const a = pA.detectionsByType.find((d) => d.type === type);
                      const b = pB.detectionsByType.find((d) => d.type === type);
                      const maxCount = Math.max(a?.count || 0, b?.count || 0, 1);
                      return (
                        <div key={type} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-700 capitalize w-28">{type?.replace(/_/g, " ")}</span>
                            <span className="text-rose-600 font-bold">{a?.count || 0}</span>
                            <span className="text-gray-300">vs</span>
                            <span className="text-blue-600 font-bold">{b?.count || 0}</span>
                          </div>
                          <div className="flex gap-1 h-2">
                            <div className="flex-1 flex justify-end"><div className="bg-rose-400 rounded-l h-full" style={{ width: `${((a?.count || 0) / maxCount) * 100}%` }} /></div>
                            <div className="flex-1"><div className="bg-blue-400 rounded-r h-full" style={{ width: `${((b?.count || 0) / maxCount) * 100}%` }} /></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
