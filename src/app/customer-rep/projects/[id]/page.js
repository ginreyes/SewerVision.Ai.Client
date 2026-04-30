"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, MapPin, Building2, Ruler, Calendar, User,
  CheckCircle2, Clock, FileVideo, Film, Eye, Loader2,
  ChevronUp, ChevronDown, Play, Pause, Maximize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/helper";
import { DashboardSkeleton } from "@/components/shared/SkeletonLoading";
import { getVideoUrl } from "@/lib/getVideoUrl";
import ProjectTimelineLauncher from "@/components/shared/project-timeline/ProjectTimelineLauncher";
import ProjectChatDrawer from "@/components/shared/project-chat/ProjectChatDrawer";
import ProjectStatusTimeline from "@/components/shared/project/ProjectStatusTimeline";
import ProjectMetadataPanel from "@/components/shared/project/ProjectMetadataPanel";

const STATUS_COLORS = {
  planning: "bg-blue-100 text-blue-700",
  "field-capture": "bg-rose-100 text-rose-700",
  "ai-processing": "bg-purple-100 text-purple-700",
  "qc-review": "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  "on-hold": "bg-gray-100 text-gray-600",
};

export default function CustomerRepProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: project, isLoading } = useQuery({
    queryKey: ["customer-rep", "project", id],
    queryFn: async () => {
      const { data } = await api(`/api/projects/get-project/${id}`);
      return data?.data || null;
    },
    enabled: !!id,
  });

  const { data: videos = [] } = useQuery({
    queryKey: ["customer-rep", "project-videos", id],
    queryFn: async () => {
      const { data } = await api(`/api/videos/project/${id}`);
      return data?.data || [];
    },
    enabled: !!id,
  });

  const { data: detections = [] } = useQuery({
    queryKey: ["customer-rep", "project-detections", id],
    queryFn: async () => {
      const { data } = await api(`/api/qc-technicians/projects/${id}/detections`);
      return data?.data || [];
    },
    enabled: !!id,
  });

  const [showDetections, setShowDetections] = useState(true);
  const latestVideo = videos[0] || null;

  if (isLoading) return <DashboardSkeleton />;
  if (!project) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-20 text-gray-400">
        <p className="text-sm">Project not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const operator = project.assignedOperator?.userId;
  const qcTech = project.qcTechnician?.userId;
  const operatorName = operator ? `${operator.first_name || ""} ${operator.last_name || ""}`.trim() : "—";
  const qcName = qcTech ? `${qcTech.first_name || ""} ${qcTech.last_name || ""}`.trim() : "—";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <ProjectTimelineLauncher project={project} />
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/customer-rep/projects")} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{project.name}</h1>
          <p className="text-sm text-gray-500">{project.location || "No location"} · {project.client || "No client"}</p>
        </div>
        <Badge className={`text-xs ${STATUS_COLORS[project.status] || STATUS_COLORS["on-hold"]}`}>
          {(project.status || "unknown").replace(/-/g, " ").toUpperCase()}
        </Badge>
      </div>

      {/* Project Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Ruler, label: "Length", value: project.totalLength || "—" },
          { icon: Calendar, label: "Created", value: project.created_at ? new Date(project.created_at).toLocaleDateString() : "—" },
          { icon: User, label: "Operator", value: operatorName },
          { icon: CheckCircle2, label: "Progress", value: `${project.progress || 0}%` },
        ].map((item, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
                <item.icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{item.label}</p>
                <p className="text-sm font-bold text-gray-900">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Video */}
          {latestVideo && (
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                <video
                  className="w-full h-full object-cover"
                  src={getVideoUrl(latestVideo._id)}
                  controls
                  playsInline
                />
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium text-gray-700 truncate">{latestVideo.originalName || latestVideo.filename}</p>
                <p className="text-xs text-gray-400">
                  {latestVideo.fileSize ? `${(latestVideo.fileSize / 1024 / 1024).toFixed(1)} MB` : ""} · {latestVideo.aiProcessingStatus || "pending"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Detections */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <button onClick={() => setShowDetections(v => !v)} className="flex items-center justify-between w-full">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Eye className="w-4 h-4 text-teal-500" />
                  AI Detections
                  <Badge variant="secondary" className="ml-1">{detections.length}</Badge>
                </CardTitle>
                {showDetections ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
            </CardHeader>
            {showDetections && (
              <CardContent className="pt-0">
                {detections.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No AI detections for this project</p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {detections.slice(0, 20).map((d) => (
                      <div key={d._id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 dark:border-[#374151] hover:bg-gray-50 dark:hover:bg-[#374151] transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0">
                          <Eye className="w-3.5 h-3.5 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{d.type || "Detection"}</p>
                          <p className="text-[10px] text-gray-400">
                            Frame #{d.frameNumber || "—"} · {d.severity || "—"} · {d.confidence != null ? `${Math.round(d.confidence <= 1 ? d.confidence * 100 : d.confidence)}%` : "—"}
                          </p>
                        </div>
                        <Badge variant="outline" className={`text-[9px] capitalize ${
                          d.qcStatus === "approved" ? "border-green-300 text-green-700" :
                          d.qcStatus === "rejected" ? "border-red-300 text-red-700" :
                          "border-amber-300 text-amber-700"
                        }`}>
                          {d.qcStatus || "pending"}
                        </Badge>
                      </div>
                    ))}
                    {detections.length > 20 && (
                      <p className="text-xs text-center text-gray-400 pt-2">
                        Showing 20 of {detections.length} detections
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="w-72 shrink-0 space-y-4">
          {/* Team */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-400">Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div>
                <p className="text-[10px] text-gray-400">Operator</p>
                <p className="text-sm font-medium text-gray-800">{operatorName}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400">QC Technician</p>
                <p className="text-sm font-medium text-gray-800">{qcName}</p>
              </div>
              {project.managerId && (
                <div>
                  <p className="text-[10px] text-gray-400">Manager</p>
                  <p className="text-sm font-medium text-gray-800">
                    {project.managerId.first_name || ""} {project.managerId.last_name || ""}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Videos */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Film className="w-3.5 h-3.5" /> Videos
                <Badge variant="secondary" className="text-[9px]">{videos.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {videos.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No videos</p>
              ) : videos.map((v) => (
                <div key={v._id} className="p-2.5 rounded-lg border border-gray-100 dark:border-[#374151]">
                  <p className="text-xs font-medium text-gray-700 truncate">{v.originalName || v.filename}</p>
                  <p className="text-[10px] text-gray-400">
                    {v.fileSize ? `${(v.fileSize / 1024 / 1024).toFixed(1)} MB` : ""} · {v.aiProcessingStatus || "pending"}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <ProjectMetadataPanel metadata={project.metadata} role="customer-rep" />

          <ProjectStatusTimeline statusHistory={project.statusHistory} role="customer-rep" />
        </div>
      </div>

      <ProjectChatDrawer projectId={id} />
    </div>
  );
}
