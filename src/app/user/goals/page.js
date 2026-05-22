"use client";

import React, { useMemo, useState } from "react";
import {
  Target,
  Plus,
  Loader2,
  Inbox,
  CheckCircle2,
  AlertTriangle,
  Ban,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlert } from "@/components/providers/AlertProvider";
import {
  useTeamGoals,
  useCreateTeamGoal,
  useUpdateTeamGoal,
  useDeleteTeamGoal,
} from "@/hooks/useSharedHooks";

/**
 * User → Goals.
 *
 * Quarterly objectives the team lead owns. Each goal can be team-wide
 * (memberId = null) or assigned to a specific member. Distinct from
 * Performance Reviews — that view is retrospective; this one is
 * forward-looking with explicit status transitions
 * (on_track / at_risk / blocked / completed / archived).
 *
 * Backend: GET /api/user/goals?quarter=YYYY-Qn&status=&memberId=
 *          POST /api/user/goals
 *          PATCH /api/user/goals/:id
 *          DELETE /api/user/goals/:id
 */

const STATUS_TONES = {
  on_track: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300",
  at_risk: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300",
  blocked: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300",
  completed: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300",
  archived: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400",
};

const STATUS_OPTIONS = [
  { value: "on_track", label: "On track" },
  { value: "at_risk", label: "At risk" },
  { value: "blocked", label: "Blocked" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

function currentQuarter() {
  const d = new Date();
  return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
}

export default function UserGoalsPage() {
  const { showAlert } = useAlert();
  const [quarter] = useState(currentQuarter());
  const [modalOpen, setModalOpen] = useState(false);

  const filters = useMemo(() => ({ quarter }), [quarter]);
  const { data, isLoading, isError, error } = useTeamGoals(filters);

  const createMutation = useCreateTeamGoal();
  const updateMutation = useUpdateTeamGoal();
  const deleteMutation = useDeleteTeamGoal();

  const goals = data?.goals || [];
  const counts = data?.counts || {
    total: 0,
    onTrack: 0,
    atRisk: 0,
    blocked: 0,
    completed: 0,
  };

  const handleCreate = async (draft) => {
    try {
      await createMutation.mutateAsync({ ...draft, quarter });
      showAlert("Goal created", "success");
      setModalOpen(false);
    } catch (err) {
      showAlert(err?.message || "Failed to create goal", "error");
      throw err;
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateMutation.mutateAsync({ id, payload: { status } });
    } catch (err) {
      showAlert(err?.message || "Failed to update goal", "error");
    }
  };

  const handleProgressChange = async (id, progress) => {
    try {
      await updateMutation.mutateAsync({ id, payload: { progress } });
    } catch (err) {
      showAlert(err?.message || "Failed to update goal", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this goal? This cannot be undone.")) return;
    try {
      await deleteMutation.mutateAsync(id);
      showAlert("Goal deleted", "success");
    } catch (err) {
      showAlert(err?.message || "Failed to delete goal", "error");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <Header quarter={quarter} onAdd={() => setModalOpen(true)} />

        <SummaryCards counts={counts} loading={isLoading} />

        {isError ? (
          <Card className="border-rose-200 dark:border-rose-900/40">
            <CardContent className="py-6 text-sm text-rose-700 dark:text-rose-300">
              Failed to load goals — {error?.message || "unknown error"}.
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card className="border-dashed">
            <CardContent className="py-10 flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading goals…</span>
            </CardContent>
          </Card>
        ) : goals.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 flex flex-col items-center gap-2 text-gray-500">
              <Inbox className="w-6 h-6" />
              <span className="text-sm text-center">
                No goals for {quarter} yet. Click &ldquo;Add goal&rdquo; to create one.
              </span>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => (
              <GoalRow
                key={goal._id}
                goal={goal}
                onStatusChange={handleStatusChange}
                onProgressChange={handleProgressChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <CreateGoalModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreate={handleCreate}
        quarter={quarter}
      />
    </div>
  );
}

function Header({ quarter, onAdd }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center text-white shadow-md">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Goals
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quarterly objectives for your team. Quarter: <span className="font-semibold">{quarter}</span>
          </p>
        </div>
      </div>
      <Button onClick={onAdd} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">
        <Plus className="w-4 h-4 mr-2" />
        Add goal
      </Button>
    </div>
  );
}

function SummaryCards({ counts, loading }) {
  const cards = [
    {
      icon: Target,
      label: "Total",
      value: counts.total ?? 0,
      tone: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300",
    },
    {
      icon: CheckCircle2,
      label: "On track",
      value: counts.onTrack ?? 0,
      tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
    {
      icon: AlertTriangle,
      label: "At risk",
      value: counts.atRisk ?? 0,
      tone: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    },
    {
      icon: Ban,
      label: "Blocked",
      value: counts.blocked ?? 0,
      tone: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

function GoalRow({ goal, onStatusChange, onProgressChange, onDelete }) {
  const tone = STATUS_TONES[goal.status] || STATUS_TONES.on_track;
  const assigneeName =
    goal.memberId && typeof goal.memberId === "object"
      ? [goal.memberId.first_name, goal.memberId.last_name]
          .filter(Boolean)
          .join(" ")
          .trim() || goal.memberId.username
      : null;

  return (
    <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {goal.title}
              </h3>
              <Badge variant="outline" className={`text-[10px] h-4 px-1.5 ${tone}`}>
                {goal.status.replace(/_/g, " ")}
              </Badge>
              {assigneeName ? (
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-normal">
                  {assigneeName}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-normal">
                  team-wide
                </Badge>
              )}
            </div>
            {goal.description ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {goal.description}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Select
              value={goal.status}
              onValueChange={(v) => onStatusChange(goal._id, v)}
            >
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-900/20"
              onClick={() => onDelete(goal._id)}
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span className="tabular-nums">{goal.progress ?? 0}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={goal.progress ?? 0}
            onChange={(e) => onProgressChange(goal._id, Number(e.target.value))}
            className="w-full accent-fuchsia-600"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function CreateGoalModal({ open, onOpenChange, onCreate, quarter }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("on_track");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setStatus("on_track");
    setSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        progress: 0,
      });
      reset();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !submitting) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New goal</DialogTitle>
          <DialogDescription>
            Quarterly objective for {quarter}. You can assign it to a member later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="goal-title">Title</Label>
            <Input
              id="goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Reduce QC rework rate to under 5%"
              autoFocus
              disabled={submitting}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="goal-description">Description (optional)</Label>
            <Textarea
              id="goal-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Context, success criteria, anything the team should know."
              disabled={submitting}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Initial status</Label>
            <Select value={status} onValueChange={setStatus} disabled={submitting}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.filter((o) => o.value !== "archived").map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !title.trim()}
              className="bg-fuchsia-600 hover:bg-fuchsia-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Create goal"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
