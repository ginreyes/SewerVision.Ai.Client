"use client";

/**
 * /qc-technician/project/[id]
 * ───────────────────────────
 * REDIRECT STUB.
 *
 * The dedicated project console (with its own video player) has been
 * merged into the Review Workspace. The Workspace now has a "Video"
 * view mode that shows the player, lets the tech seek to any detection,
 * and anchors manual-detection entries to the current video time — all
 * without leaving the queue.
 *
 * This stub forwards the legacy URL, preserving the project id as a
 * query param so the Workspace can auto-select it on hydration.
 */

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function QcProjectDetailRedirect() {
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const target = id
      ? `/qc-technician/quality-control?project=${encodeURIComponent(id)}&view=video`
      : "/qc-technician/quality-control";
    router.replace(target);
  }, [router, id]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin mb-2 text-red-600" />
      <p className="text-sm">Opening Review Workspace…</p>
    </div>
  );
}
