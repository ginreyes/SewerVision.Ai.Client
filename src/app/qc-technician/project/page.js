"use client";

/**
 * /qc-technician/project
 * ──────────────────────
 * REDIRECT STUB.
 *
 * The old projects list page has been merged into the unified Review
 * Workspace at /qc-technician/quality-control, which shows the tech's
 * assigned projects in a dedicated left rail. This file stays alive so
 * any bookmarks or in-app links pointing here still land somewhere sensible.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function QcProjectListRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/qc-technician/quality-control");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin mb-2 text-red-600" />
      <p className="text-sm">Opening Review Workspace…</p>
    </div>
  );
}
