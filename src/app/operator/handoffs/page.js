"use client";

import React, { useMemo, useState } from "react";
import { ClipboardCheck, ArrowDownToLine, ArrowUpFromLine, Loader2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useUser } from "@/components/providers/UserContext";
import { useOperatorRecentShiftHandoffs } from "@/hooks/useOperatorHooks";
import HandoffCard from "@/components/operator/handoffs/HandoffCard";
import ShiftHandoffModal from "@/components/operator/ShiftHandoffModal";

/**
 * Operator → Shift Handoffs.
 *
 * Lists the operator's outgoing handoffs AND incoming ones a teammate left
 * for them. The "End shift" button opens the existing ShiftHandoffModal —
 * we don't duplicate that flow here.
 *
 * Filtering uses a memoized split rather than a network call so the user
 * can flip between tabs without re-fetching.
 */
export default function OperatorHandoffsPage() {
  const { userId } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const { data: handoffs = [], isLoading, refetch } = useOperatorRecentShiftHandoffs(userId, 50);

  const { incoming, outgoing } = useMemo(() => splitHandoffs(handoffs, userId), [handoffs, userId]);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <Header onEndShift={() => setModalOpen(true)} />

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-fit">
            <TabsTrigger value="all">All ({handoffs.length})</TabsTrigger>
            <TabsTrigger value="incoming">Incoming ({incoming.length})</TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing ({outgoing.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <HandoffList list={handoffs} loading={isLoading} userId={userId} emptyHint="No handoffs in the last 50 shifts." />
          </TabsContent>
          <TabsContent value="incoming">
            <HandoffList list={incoming} loading={isLoading} userId={userId} emptyHint="Nothing has been handed off to you yet." />
          </TabsContent>
          <TabsContent value="outgoing">
            <HandoffList list={outgoing} loading={isLoading} userId={userId} emptyHint="You haven't logged any shift handoffs yet — tap End Shift when you finish." />
          </TabsContent>
        </Tabs>
      </div>

      <ShiftHandoffModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onComplete={() => {
          setModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}

function Header({ onEndShift }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
          <ClipboardCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Shift Handoffs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            What you left for the next shift, and what they left for you.
          </p>
        </div>
      </div>
      <Button onClick={onEndShift} className="bg-blue-600 hover:bg-blue-700">
        <Plus className="w-4 h-4 mr-2" />
        End shift
      </Button>
    </div>
  );
}

function HandoffList({ list, loading, userId, emptyHint }) {
  if (loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 flex flex-col items-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading recent handoffs…</span>
        </CardContent>
      </Card>
    );
  }
  if (list.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-sm text-gray-500">
          {emptyHint}
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {list.map((handoff) => (
        <HandoffCard key={handoff._id} handoff={handoff} currentUserId={userId} />
      ))}
    </div>
  );
}

function splitHandoffs(handoffs, userId) {
  const incoming = [];
  const outgoing = [];
  const me = String(userId || "");
  for (const h of handoffs) {
    const writer = typeof h.operatorId === "string" ? h.operatorId : String(h.operatorId?._id || "");
    if (writer === me) outgoing.push(h);
    else incoming.push(h);
  }
  return { incoming, outgoing };
}
