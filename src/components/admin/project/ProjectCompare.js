"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  GitCompare, TrendingUp, TrendingDown, Minus, ArrowRightLeft,
  MapPin, Calendar, Ruler, FileVideo, Eye, AlertTriangle,
  CheckCircle2, XCircle, Clock, Loader2, BarChart3, Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/helper";

// ── Data hooks ─────────────────────────────────────────────
const useProjects = () =>
  useQuery({
    queryKey: ["all-projects-for-compare"],
    queryFn: async () => {
      const { data } = await api("/api/projects/get-all-projects?limit=999");
      const projects = Array.isArray(data?.data) ? data.data : data?.projects || [];
      return projects;
    },
    staleTime: 1000 * 60 * 5,
  });

const useComparison = (idA, idB) =>
  useQuery({
    queryKey: ["project-compare", idA, idB],
    queryFn: async () => {
      const response = await api(`/api/projects/compare?projectA=${idA}&projectB=${idB}`);
      if (!response.ok) {
        // 403 = token expired/invalid — not a compare bug, just session issue
        const msg = response.data?.error || response.data?.message || `HTTP ${response.status}`;
        throw new Error(msg);
      }
      return response.data?.data || null;
    },
    enabled: !!(idA && idB),
    retry: false, // Don't retry auth failures
  });

// ── Helpers ────────────────────────────────────────────────
const DeltaChip = ({ value, suffix = "", invert = false }) => {
  if (value == null || value === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-[#27272a] px-2 py-0.5 rounded-full">
        <Minus className="w-2.5 h-2.5" /> Same
      </span>
    );
  }
  const isGood = invert ? value < 0 : value > 0;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
      isGood
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
        : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400"
    }`}>
      {value > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
      {value > 0 ? "+" : ""}{value}{suffix}
    </span>
  );
};

const StatCompareRow = ({ icon: Icon, label, valueA, valueB, delta, suffix = "", invert = false }) => (
  <div className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-[#18181b] transition-colors">
    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#27272a] flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-gray-500 dark:text-[#a1a1aa]" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-500 dark:text-[#a1a1aa]">{label}</p>
    </div>
    <div className="w-20 text-right">
      <p className="text-sm font-bold text-rose-600">{valueA ?? "—"}{suffix}</p>
    </div>
    <div className="w-16 flex justify-center">
      <DeltaChip value={delta} suffix={suffix} invert={invert} />
    </div>
    <div className="w-20 text-right">
      <p className="text-sm font-bold text-blue-600">{valueB ?? "—"}{suffix}</p>
    </div>
  </div>
);

const ProjectHeader = ({ project, color }) => {
  if (!project) return null;
  const isRose = color === "rose";
  return (
    <div className={`rounded-xl p-4 border ${
      isRose
        ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20"
        : "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20"
    }`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className={`text-sm font-bold truncate ${isRose ? "text-rose-900 dark:text-rose-300" : "text-blue-900 dark:text-blue-300"}`}>
            {project.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant="secondary" className={`text-[10px] ${
              isRose ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300" : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
            }`}>
              {project.status?.replace(/-/g, " ")}
            </Badge>
            {project.location && (
              <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-[#71717a]">
                <MapPin className="w-2.5 h-2.5" /> {project.location}
              </span>
            )}
          </div>
        </div>
        <div className={`text-2xl font-black ${isRose ? "text-rose-600" : "text-blue-600"}`}>
          {project.progress ?? 0}%
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────
export default function ProjectCompare({ projects: externalProjects }) {
  const { data: fetchedProjects = [], isLoading: projectsLoading } = useProjects();
  const projects = externalProjects?.length ? externalProjects : fetchedProjects;

  const [idA, setIdA] = useState("");
  const [idB, setIdB] = useState("");

  const { data: comparison, isLoading: comparing, error: compareError } = useComparison(idA, idB);
  const pA = comparison?.projectA;
  const pB = comparison?.projectB;
  const deltas = comparison?.deltas;

  const handleSwap = () => {
    const temp = idA;
    setIdA(idB);
    setIdB(temp);
  };

  return (
    <div className="space-y-6">
      {/* Selector Row */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            {/* Project A */}
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Project A</label>
              <Select value={idA} onValueChange={setIdA}>
                <SelectTrigger className="h-10 border-rose-200 dark:border-rose-500/30 focus:ring-rose-500">
                  <SelectValue placeholder="Select first project..." />
                </SelectTrigger>
                <SelectContent>
                  {projectsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  ) : projects.map((p) => (
                    <SelectItem key={p._id} value={p._id} disabled={p._id === idB}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.name}</span>
                        <Badge variant="outline" className="text-[9px] px-1.5">{p.status?.replace(/-/g, " ")}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Swap button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwap}
              disabled={!idA || !idB}
              className="h-10 w-10 shrink-0 rounded-xl"
              title="Swap projects"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </Button>

            {/* Project B */}
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Project B</label>
              <Select value={idB} onValueChange={setIdB}>
                <SelectTrigger className="h-10 border-blue-200 dark:border-blue-500/30 focus:ring-blue-500">
                  <SelectValue placeholder="Select second project..." />
                </SelectTrigger>
                <SelectContent>
                  {projectsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                  ) : projects.map((p) => (
                    <SelectItem key={p._id} value={p._id} disabled={p._id === idA}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.name}</span>
                        <Badge variant="outline" className="text-[9px] px-1.5">{p.status?.replace(/-/g, " ")}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {!idA || !idB ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-[#52525b]">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#18181b] flex items-center justify-center mb-4">
              <GitCompare className="w-8 h-8 opacity-40" />
            </div>
            <p className="text-sm font-medium">Select two projects to compare</p>
            <p className="text-xs mt-1 max-w-xs text-center">Choose Project A and Project B above to see a side-by-side analysis of their inspection data, defects, and AI processing results.</p>
          </CardContent>
        </Card>
      ) : comparing ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-3" />
            <p className="text-sm text-gray-500">Comparing projects...</p>
          </CardContent>
        </Card>
      ) : pA && pB ? (
        <div className="space-y-5">
          {/* Project Headers side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProjectHeader project={pA} color="rose" />
            <ProjectHeader project={pB} color="blue" />
          </div>

          {/* Key Metrics Comparison */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="pb-0 px-5 pt-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                Key Metrics
              </CardTitle>
              <CardDescription className="text-xs">Side-by-side performance comparison</CardDescription>
            </CardHeader>
            <CardContent className="px-2 pt-3 pb-2">
              {/* Column headers */}
              <div className="flex items-center gap-4 px-4 py-2 text-[10px] font-semibold text-gray-400 dark:text-[#52525b] uppercase tracking-wider">
                <div className="w-8" />
                <div className="flex-1">Metric</div>
                <div className="w-20 text-right text-rose-500">Project A</div>
                <div className="w-16 text-center">Delta</div>
                <div className="w-20 text-right text-blue-500">Project B</div>
              </div>
              <Separator className="mb-1" />
              <StatCompareRow icon={AlertTriangle} label="Total Defects" valueA={pA.totalDefects} valueB={pB.totalDefects} delta={deltas?.defects} invert />
              <StatCompareRow icon={Eye} label="AI Confidence" valueA={pA.avgConfidence} valueB={pB.avgConfidence} delta={deltas?.confidence} suffix="%" />
              <StatCompareRow icon={FileVideo} label="Observations" valueA={pA.observations} valueB={pB.observations} delta={deltas?.observations} invert />
              <StatCompareRow icon={CheckCircle2} label="Progress" valueA={pA.progress} valueB={pB.progress} delta={pA.progress - pB.progress} suffix="%" />
              {pA.totalLength != null && (
                <StatCompareRow icon={Ruler} label="Total Length" valueA={pA.totalLength} valueB={pB.totalLength} delta={(pA.totalLength || 0) - (pB.totalLength || 0)} />
              )}
            </CardContent>
          </Card>

          {/* Defect Type Breakdown */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-400" />
                Defect Type Breakdown
              </CardTitle>
              <CardDescription className="text-xs">Detection count comparison by defect category</CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {(() => {
                const typesA = pA.detectionsByType || [];
                const typesB = pB.detectionsByType || [];
                const allTypes = [...new Set([...typesA.map(d => d.type), ...typesB.map(d => d.type)])];

                if (allTypes.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-400 dark:text-[#52525b]">
                      <Eye className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">No detection data available for comparison</p>
                    </div>
                  );
                }

                const maxCount = Math.max(...allTypes.map(type => {
                  const a = typesA.find(d => d.type === type)?.count || 0;
                  const b = typesB.find(d => d.type === type)?.count || 0;
                  return Math.max(a, b);
                }), 1);

                return (
                  <div className="space-y-4">
                    {allTypes.map((type) => {
                      const a = typesA.find(d => d.type === type)?.count || 0;
                      const b = typesB.find(d => d.type === type)?.count || 0;
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-gray-700 dark:text-[#d4d4d8] capitalize truncate max-w-[200px]">
                              {type?.replace(/_/g, " ")}
                            </span>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="font-bold text-rose-600 w-6 text-right">{a}</span>
                              <span className="text-gray-300 dark:text-[#3f3f46]">vs</span>
                              <span className="font-bold text-blue-600 w-6">{b}</span>
                            </div>
                          </div>
                          <div className="flex gap-0.5 h-2.5 rounded-full overflow-hidden bg-gray-100 dark:bg-[#18181b]">
                            <div className="flex justify-end flex-1">
                              <div
                                className="bg-gradient-to-r from-rose-400 to-rose-500 rounded-l-full transition-all duration-500"
                                style={{ width: `${(a / maxCount) * 100}%` }}
                              />
                            </div>
                            <div className="w-px bg-gray-200 dark:bg-[#3f3f46]" />
                            <div className="flex-1">
                              <div
                                className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-r-full transition-all duration-500"
                                style={{ width: `${(b / maxCount) * 100}%` }}
                              />
                            </div>
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
      ) : compareError ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
            <AlertTriangle className="w-8 h-8 mb-2 text-amber-400 opacity-60" />
            <p className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa]">
              {compareError.message?.includes('expired') || compareError.message?.includes('token')
                ? 'Session expired — please log in again'
                : 'Failed to load comparison'}
            </p>
            <p className="text-xs mt-1">{compareError.message}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
            <XCircle className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm font-medium">Comparison data unavailable</p>
            <p className="text-xs mt-1">The comparison API did not return data for these projects.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
