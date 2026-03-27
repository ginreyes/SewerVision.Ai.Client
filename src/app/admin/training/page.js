"use client";

import React from "react";
import { GraduationCap, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useTrainingModules, useTeamTrainingProgress,
  useAllTrainingAssignments, useAssignTrainingModules,
} from "@/hooks/useQueryHooks";
import { TrainingOverview, AssignmentManager } from "@/components/admin/training";

export default function AdminTrainingCenter() {
  const { data: modulesRaw = [], isLoading: modulesLoading } = useTrainingModules();
  const { data: progress, isLoading: progressLoading } = useTeamTrainingProgress();
  const { data: assignments = [], isLoading: assignmentsLoading } = useAllTrainingAssignments();
  const assignMutation = useAssignTrainingModules();

  const modules = Array.isArray(modulesRaw) ? modulesRaw : [];
  const isLoading = modulesLoading || progressLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center text-white shadow-md">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Training Center</h1>
          <p className="text-sm text-gray-500">Monitor QC technician training progress and assign modules</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-5 bg-gray-100/80 p-1 rounded-xl h-auto">
          <TabsTrigger value="overview" className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <GraduationCap className="w-4 h-4 shrink-0" /><span className="text-sm font-medium">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <GraduationCap className="w-4 h-4 shrink-0" /><span className="text-sm font-medium">Assignments</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <TrainingOverview modules={modules} progress={progress} />
        </TabsContent>

        <TabsContent value="assignments" className="mt-0">
          <AssignmentManager
            modules={modules}
            progress={progress}
            assignments={assignments}
            assignMutation={assignMutation}
            isLoading={assignmentsLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
