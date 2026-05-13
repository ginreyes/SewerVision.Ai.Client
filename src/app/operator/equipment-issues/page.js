"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
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
import { useOperatorDevices } from "@/hooks/useQueryHooks";
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
 * see it land in the Open list. Maintenance team picks it up from the
 * back-office (rendered separately, lands May 14).
 *
 * MAY 13 SCOPE — frontend only. The list is seeded with mock data and
 * any new reports live in component state for the session. The
 * persistence + backend wiring lands on May 14:
 *   - POST  /api/maintenance/equipment-issues          create
 *   - GET   /api/maintenance/equipment-issues          list (operator-scoped)
 *   - PATCH /api/maintenance/equipment-issues/:id/ack  acknowledge
 *
 * The component shape is already laid out for that swap — only the
 * useState seed + the local-mutation handlers need to be replaced with
 * a TanStack mutation + invalidation. The card props match the API
 * shape so EquipmentIssueCard does not need to change.
 */
const LOCAL_STORAGE_KEY = "operator-equipment-issues-draft-v1";

const SEED_ISSUES = [
  {
    id: "seed-1",
    deviceName: "CAM-04",
    category: "camera",
    severity: "high",
    status: "open",
    title: "Lens fogging within 10min of submersion",
    description:
      "Started after lunch. Wiped + restarted, still fogs. Pressure-test seal recommended.",
    reportedAt: hoursAgo(2.5),
    resolvedAt: null,
    projectName: "Maple Ave Sewer Inspection",
  },
  {
    id: "seed-2",
    deviceName: "BAT-12",
    category: "battery",
    severity: "medium",
    status: "acknowledged",
    title: "Battery drops to 0% from 35% under load",
    description:
      "Happens only when recording 4K. Likely a cell — pulled from rotation.",
    reportedAt: hoursAgo(28),
    resolvedAt: null,
    projectName: "Industrial Park Mainline",
  },
  {
    id: "seed-3",
    deviceName: "CBL-07",
    category: "cable",
    severity: "low",
    status: "resolved",
    title: "Outer jacket fraying near connector",
    description:
      "Replaced with CBL-09 from spares; sent CBL-07 to repair shelf.",
    reportedAt: hoursAgo(72),
    resolvedAt: hoursAgo(48),
    projectName: null,
  },
];

export default function OperatorEquipmentIssuesPage() {
  const { userId, userData } = useUser();
  const { showAlert } = useAlert();
  const [modalOpen, setModalOpen] = useState(false);
  const [issues, setIssues] = useState(SEED_ISSUES);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage so reports survive a tab refresh during
  // the frontend-only phase. Hydration runs in useEffect to keep SSR/CSR
  // trees identical (no hydration mismatch on the first paint).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setIssues(parsed);
        }
      }
    } catch {
      // Corrupt JSON — ignore, fall back to seed.
    }
    setHydrated(true);
  }, []);

  // Persist whenever the list mutates (after hydration; before that the
  // initial render would overwrite anything the user already had).
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(issues));
    } catch {
      // Quota / private-mode — silently drop.
    }
  }, [issues, hydrated]);

  // Device picker source — feeds the modal's <select>.
  const { data: devicesRaw, isLoading: loadingDevices } = useOperatorDevices(userId);
  const devices = useMemo(() => {
    const list = Array.isArray(devicesRaw) ? devicesRaw : devicesRaw?.data ?? [];
    return list.map((device) => ({
      id: device._id || device.id,
      name: device.name || "Unnamed device",
    }));
  }, [devicesRaw]);

  const handleCreate = useCallback(
    async (draft) => {
      const next = {
        id: `local-${Date.now()}`,
        deviceName: draft.deviceName,
        category: draft.category,
        severity: draft.severity,
        status: "open",
        title: draft.title,
        description: draft.description,
        reportedAt: new Date().toISOString(),
        resolvedAt: null,
        projectName: null,
        reportedBy: userData?.username || "operator",
      };
      setIssues((prev) => [next, ...prev]);
      showAlert("Issue logged — saved locally until backend is wired", "success");
    },
    [showAlert, userData]
  );

  const handleAcknowledge = useCallback(
    (id) => {
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === id ? { ...issue, status: "acknowledged" } : issue
        )
      );
      showAlert("Issue acknowledged", "success");
    },
    [showAlert]
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
        <Header onReport={() => setModalOpen(true)} loadingDevices={loadingDevices} />

        <SummaryCards
          openCount={open.length}
          activeCount={active.length}
          resolvedCount={resolved.length}
        />

        <Tabs defaultValue="open" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-fit">
            <TabsTrigger value="open">Open ({open.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="open">
            <IssueList
              list={open}
              emptyHint="Nothing open — nice clean kit."
              onAcknowledge={handleAcknowledge}
            />
          </TabsContent>
          <TabsContent value="active">
            <IssueList
              list={active}
              emptyHint="No active issues — everything is either fresh or resolved."
              onAcknowledge={handleAcknowledge}
            />
          </TabsContent>
          <TabsContent value="resolved">
            <IssueList
              list={resolved}
              emptyHint="No resolved issues yet — fixes show up here once maintenance closes them out."
            />
          </TabsContent>
        </Tabs>
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

function SummaryCards({ openCount, activeCount, resolvedCount }) {
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
                {value}
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

function IssueList({ list, emptyHint, onAcknowledge }) {
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

// Helpers — keep the mock data realistic-looking on every render.
function hoursAgo(hours) {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}
