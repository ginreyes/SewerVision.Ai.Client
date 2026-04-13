"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ProjectCompare from "@/components/admin/project/ProjectCompare";

export default function ProjectComparePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}>
      <div className="max-w-6xl mx-auto px-6 py-6">
        <ProjectCompare />
      </div>
    </Suspense>
  );
}
