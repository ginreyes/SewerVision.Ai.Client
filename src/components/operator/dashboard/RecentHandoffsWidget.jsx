"use client";

import React, { useMemo } from "react";
import { ClipboardCheck, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/components/providers/UserContext";
import { useOperatorRecentShiftHandoffs } from "@/hooks/useOperatorHooks";
import HandoffCard from "@/components/operator/handoffs/HandoffCard";

/**
 * Dashboard-side "Recent handoffs" widget. Surfaces the most recent
 * shift-handoff rows the operator is a party to (incoming or outgoing).
 * Reuses HandoffCard so the Acknowledge action lives next to the row
 * without forcing the operator to navigate to /operator/handoffs to
 * clear an incoming one.
 *
 * The header pill counts pending incoming acknowledgements so the
 * operator can spot work the second they land on the dashboard.
 */
export default function RecentHandoffsWidget({ limit = 3 }) {
  const router = useRouter();
  const { userId } = useUser();
  const { data: handoffs = [], isLoading } = useOperatorRecentShiftHandoffs(userId, limit);

  const pendingIncoming = useMemo(
    () =>
      (handoffs || []).filter((h) => {
        const recipientId =
          typeof h.nextShiftFor === "object" && h.nextShiftFor
            ? h.nextShiftFor._id || h.nextShiftFor.id
            : h.nextShiftFor;
        return (
          recipientId &&
          String(recipientId) === String(userId) &&
          !h.acknowledgedAt
        );
      }),
    [handoffs, userId]
  );

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-indigo-600" />
          Recent handoffs
          {pendingIncoming.length > 0 ? (
            <Badge
              variant="outline"
              className="ml-1 h-5 px-1.5 text-[10px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-900/40"
            >
              {pendingIncoming.length} to acknowledge
            </Badge>
          ) : null}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => router.push("/operator/handoffs")}
        >
          View all
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 py-6 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading handoffs…
          </div>
        ) : handoffs.length === 0 ? (
          <div className="text-sm text-gray-500 py-6 text-center">
            No recent handoffs.
          </div>
        ) : (
          <div className="space-y-3">
            {handoffs.slice(0, limit).map((h) => (
              <HandoffCard key={h._id} handoff={h} currentUserId={userId} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
