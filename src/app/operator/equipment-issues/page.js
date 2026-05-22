"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  Wrench,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Inbox,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useUser } from "@/components/providers/UserContext";
import {
  useOperatorDevices,
} from "@/hooks/useQueryHooks";
import {
  useOperatorEquipmentIssues,
  useCreateEquipmentIssue,
  useAcknowledgeEquipmentIssue,
} from "@/hooks/useOperatorHooks";
import { useAlert } from "@/components/providers/AlertProvider";
import {
  EquipmentIssueCard,
  ReportIssueModal,
} from "@/components/operator/equipment-issues";

/**
 * Operator → Equipment Issues.
 *
 * Field-side log of broken gear so maintenance knows what to fix without
 * a Slack scrum. Operators tap "Report issue", fill a short form, and
 * see it land in the Open list. Backend wired May 14:
 *   - POST  /api/maintenance/equipment-issues          create
 *   - GET   /api/maintenance/equipment-issues          list (role-scoped)
 *   - PATCH /api/maintenance/equipment-issues/:id/ack  acknowledge
 *   - PATCH /api/maintenance/equipment-issues/:id/resolve
 *
 * The card props match the API shape directly so EquipmentIssueCard
 * doesn't need a translation layer.
 */
export default function OperatorEquipmentIssuesPage() {
  const { userId, userData } = useUser();
  const { showAlert } = useAlert();
  const [modalOpen, setModalOpen] = useState(false);

  const {
    data: rawIssues = [],
    isLoading,
    isError,
    error,
  } = useOperatorEquipmentIssues(userId);

  const createMutation = useCreateEquipmentIssue();
  const acknowledgeMutation = useAcknowledgeEquipmentIssue();

  // Device picker source — feeds the modal's <select>.
  const { data: devicesRaw, isLoading: loadingDevices } = useOperatorDevices(userId);
  const devices = useMemo(() => {
    const list = Array.isArray(devicesRaw) ? devicesRaw : devicesRaw?.data ?? [];
    return list.map((device) => ({
      id: device._id || device.id,
      name: device.name || "Unnamed device",
    }));
  }, [devicesRaw]);

  // Normalize the API shape onto the EquipmentIssueCard prop contract.
  // The card already keys off `id`, `deviceName`, `projectName`,
  // `reportedAt` — we just flatten a couple of populated refs.
  const issues = useMemo(
    () =>
      (rawIssues || []).map((row) => ({
        id: row._id || row.id,
        deviceName: row.deviceName || row.deviceId?.name || null,
        projectName: row.projectId?.name || row.projectName || null,
        category: row.category,
        severity: row.severity,
        status: row.status,
        title: row.title,
        description: row.description,
        reportedAt: row.reportedAt,
        resolvedAt: row.resolvedAt || null,
      })),
    [rawIssues]
  );

  const handleCreate = useCallback(
    async (draft) => {
      try {
        await createMutation.mutateAsync({
          title: draft.title,
          category: draft.category,
          severity: draft.severity,
          deviceName: draft.deviceName || undefined,
          description: draft.description || undefined,
        });
        showAlert("Issue reported — maintenance will pick it up", "success");
      } catch (err) {
        showAlert(err?.message || "Failed to report issue", "error");
        throw err;
      }
    },
    [createMutation, showAlert]
  );

  const handleAcknowledge = useCallback(
    async (id) => {
      try {
        await acknowledgeMutation.mutateAsync(id);
        showAlert("Issue acknowledged", "success");
      } catch (err) {
        showAlert(err?.message || "Failed to acknowledge issue", "error");
      }
    },
    [acknowledgeMutation, showAlert]
  );

  const open = useMemo(() => issues.filter((i) => i.status === "open"), [issues]);
  const active = useMemo(
    () => issues.filter((i) => i.status !== "resolved"),
    [issues]
  );
  const resolved = useMemo(
    () => issues.filter((i) => i.status === "resolved"),
    [issues]
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <Header
          onReport={() => setModalOpen(true)}
          loadingDevices={loadingDevices}
          username={userData?.username}
        />

        <SummaryCards
          openCount={open.length}
          activeCount={active.length}
          resolvedCount={resolved.length}
          loading={isLoading}
        />

        {isError ? (
          <Card className="border-rose-200 dark:border-rose-900/40">
            <CardContent className="py-6 text-sm text-rose-700 dark:text-rose-300">
              Failed to load equipment issues — {error?.message || "unknown error"}.
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="open" className="space-y-4">
            <TabsList className="grid grid-cols-3 w-fit">
              <TabsTrigger value="open">Open ({open.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="open">
              <IssueList
                list={open}
                loading={isLoading}
                emptyHint="Nothing open — nice clean kit."
                onAcknowledge={handleAcknowledge}
              />
            </TabsContent>
            <TabsContent value="active">
              <IssueList
                list={active}
                loading={isLoading}
                emptyHint="No active issues — everything is either fresh or resolved."
                onAcknowledge={handleAcknowledge}
              />
            </TabsContent>
            <TabsContent value="resolved">
              <IssueList
                list={resolved}
                loading={isLoading}
                emptyHint="No resolved issues yet — fixes show up here once maintenance closes them out."
              />
            </TabsContent>
          </Tabs>
        )}
      </div>

      <ReportIssueModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreate={handleCreate}
        devices={devices}
      />
    </div>
  );
}

function Header({ onReport, loadingDevices }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center text-white shadow-md">
          <Wrench className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Equipment Issues
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Log broken gear in the field so maintenance can pick it up.
          </p>
        </div>
      </div>
      <Button
        onClick={onReport}
        disabled={loadingDevices}
        className="bg-rose-600 hover:bg-rose-700 text-white"
      >
        {loadingDevices ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Plus className="w-4 h-4 mr-2" />
        )}
        Report issue
      </Button>
    </div>
  );
}

function SummaryCards({ openCount, activeCount, resolvedCount, loading }) {
  const cards = [
    {
      icon: AlertTriangle,
      label: "Open",
      value: openCount,
      tone: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    },
    {
      icon: Wrench,
      label: "Active",
      value: activeCount,
      tone: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    },
    {
      icon: CheckCircle2,
      label: "Resolved",
      value: resolvedCount,
      tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map(({ icon: Icon, label, value, tone }) => (
        <Card key={label} className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${tone}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  value
                )}
              </div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                {label}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function IssueList({ list, emptyHint, onAcknowledge, loading }) {
  if (loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading issues…</span>
        </CardContent>
      </Card>
    );
  }
  if (list.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 flex flex-col items-center gap-2 text-gray-500">
          <Inbox className="w-6 h-6" />
          <span className="text-sm text-center">{emptyHint}</span>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {list.map((issue) => (
        <EquipmentIssueCard
          key={issue.id}
          issue={issue}
          onAcknowledge={onAcknowledge}
        />
      ))}
    </div>
  );
}
