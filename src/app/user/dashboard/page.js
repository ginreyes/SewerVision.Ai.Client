'use client';

import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  Calendar as CalendarIcon,
  FolderOpen,
  Inbox,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/providers/UserContext";
import { useAlert } from "@/components/providers/AlertProvider";
import { api } from "@/lib/helper";
import Link from "next/link";

/**
 * Management dashboard for the advanced "User" role.
 * Focuses on team performance, schedule, tasks, projects, and inbox overview.
 */
export default function UserManagementDashboard() {
  const { userId, userData } = useUser();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(true);
  const [projectSummary, setProjectSummary] = useState({
    total: 0,
    inProgress: 0,
    qcPending: 0,
    completed: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [taskSummary, setTaskSummary] = useState({
    active: 0,
    scheduled: 0,
    completed: 0,
  });
  const [upcomingItems, setUpcomingItems] = useState([]);

  const displayName =
    (userData &&
      `${userData.first_name || ""} ${userData.last_name || ""}`.trim()) ||
    userData?.username ||
    "Team Manager";

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch projects managed by this User
        const projectsRes = await api(
          `/api/projects/get-all-projects?managerId=${userId}&limit=12`,
          "GET"
        );

        let managedProjects = [];
        if (projectsRes.ok && projectsRes.data?.data) {
          managedProjects = projectsRes.data.data;
        }

        const totalProjects = managedProjects.length;
        const inProgress = managedProjects.filter(
          (p) =>
            p.status !== "completed" &&
            p.status !== "customer-notified" &&
            p.status !== "planning"
        ).length;
        const qcPending = managedProjects.filter(
          (p) => p.qcStatus === "pending" || p.status === "qc-review"
        ).length;
        const completed = managedProjects.filter(
          (p) => p.status === "completed" || p.status === "customer-notified"
        ).length;

        setProjectSummary({
          total: totalProjects,
          inProgress,
          qcPending,
          completed,
        });

        // Sort by createdAt/created_at and take latest 4
        const projectsSorted = [...managedProjects].sort((a, b) => {
          const aDate = new Date(a.createdAt || a.created_at || 0).getTime();
          const bDate = new Date(b.createdAt || b.created_at || 0).getTime();
          return bDate - aDate;
        });
        setRecentProjects(projectsSorted.slice(0, 4));

        // Fetch maintenance tasks for schedule/task summary
        const tasksRes = await api(
          `/api/maintenance/tasks?status=all&priority=all`,
          "GET"
        );

        let tasks = [];
        if (tasksRes.ok && tasksRes.data?.data) {
          tasks = tasksRes.data.data;
        }

        const activeTasks = tasks.filter((t) =>
          ["in-progress", "pending"].includes(t.status)
        );
        const scheduledTasks = tasks.filter((t) => t.status === "scheduled");
        const completedTasks = tasks.filter((t) => t.status === "completed");

        setTaskSummary({
          active: activeTasks.length,
          scheduled: scheduledTasks.length,
          completed: completedTasks.length,
        });

        // Upcoming items: next few scheduled tasks by estimatedCompletion
        const upcoming = [...scheduledTasks]
          .sort((a, b) => {
            const aDate = new Date(a.estimatedCompletion || 0).getTime();
            const bDate = new Date(b.estimatedCompletion || 0).getTime();
            return aDate - bDate;
          })
          .slice(0, 5);
        setUpcomingItems(upcoming);
      } catch (err) {
        console.error("Failed to load user dashboard data:", err);
        showAlert(
          "Failed to load dashboard data. Some metrics may be missing.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userId, showAlert]);

  const formatNumber = (value) =>
    typeof value === "number" && !Number.isNaN(value) ? value : "—";

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Team & Project Overview
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {displayName}. You&apos;re overseeing your team&apos;s
            projects, tasks, and schedules from here.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/user/project">
            <Button size="sm" className="gap-2">
              <FolderOpen className="w-4 h-4" />
              Projects
            </Button>
          </Link>
          <Link href="/user/tasks">
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="w-4 h-4" />
              Tasks
            </Button>
          </Link>
          <Link href="/user/inbox">
            <Button variant="outline" size="sm" className="gap-2">
              <Inbox className="w-4 h-4" />
              Inbox
            </Button>
          </Link>
        </div>
      </div>

      {/* Top stats: Projects + Tasks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-50 to-pink-50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Managed Projects
            </CardTitle>
            <FolderOpen className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(projectSummary.total)}
            </p>
            <p className="text-xs text-gray-500">
              Projects where you are the project lead.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              In Progress
            </CardTitle>
            <LayoutDashboard className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(projectSummary.inProgress)}
            </p>
            <p className="text-xs text-gray-500">
              Active projects currently being worked on.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              QC Pending
            </CardTitle>
            <ClipboardCheck className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(projectSummary.qcPending)}
            </p>
            <p className="text-xs text-gray-500">
              Projects waiting for QC review or sign-off.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-sky-50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Team Tasks Today
            </CardTitle>
            <CalendarIcon className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(taskSummary.scheduled)}
            </p>
            <p className="text-xs text-gray-500">
              Scheduled maintenance & system tasks impacting operations.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Middle: Schedule & Tasks snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule / Upcoming */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-base font-semibold">
                Upcoming Schedule
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-xs text-gray-500">Loading schedule...</p>
            ) : upcomingItems.length === 0 ? (
              <p className="text-xs text-gray-500">
                No scheduled maintenance tasks. Your schedule is clear for now.
              </p>
            ) : (
              upcomingItems.map((task) => (
                <div
                  key={task.taskId}
                  className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2 text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">
                      {task.task}
                    </span>
                    <span className="text-gray-500">
                      {task.assignedTo} •{" "}
                      {task.category?.charAt(0).toUpperCase() +
                        task.category?.slice(1)}
                    </span>
                  </div>
                  <div className="text-right text-gray-500">
                    <div>
                      {task.estimatedCompletion
                        ? new Date(
                            task.estimatedCompletion
                          ).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide">
                      {task.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Tasks Snapshot */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-500" />
              <CardTitle className="text-base font-semibold">
                Task Snapshot
              </CardTitle>
            </div>
            <Link href="/user/tasks">
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-gray-700">
            <div className="flex justify-between">
              <span>Active / Pending</span>
              <span className="font-semibold">
                {formatNumber(taskSummary.active)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Scheduled</span>
              <span className="font-semibold">
                {formatNumber(taskSummary.scheduled)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Completed</span>
              <span className="font-semibold">
                {formatNumber(taskSummary.completed)}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-2">
              Detailed task management is available in the Tasks view, including
              filtering and prioritization.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom: Projects & Inbox summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Overview snippet */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-500" />
              <CardTitle className="text-base font-semibold">
                Projects Overview
              </CardTitle>
            </div>
            <Link href="/user/project">
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                View projects
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {loading ? (
              <p className="text-gray-500">Loading projects...</p>
            ) : recentProjects.length === 0 ? (
              <p className="text-gray-500">
                No projects found. Create your first project from the Projects
                page.
              </p>
            ) : (
              recentProjects.map((project) => (
                <div
                  key={project._id}
                  className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2 hover:bg-gray-50 transition"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">
                      {project.name}
                    </span>
                    <span className="text-gray-500">
                      {project.client} • {project.location}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-gray-500">
                    <div className="uppercase tracking-wide">
                      {String(project.status || "")
                        .replace("-", " ")
                        .toUpperCase() || "N/A"}
                    </div>
                    <div>Progress {project.progress ?? 0}%</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Inbox summary */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-rose-500" />
              <CardTitle className="text-base font-semibold">
                Inbox & Notifications
              </CardTitle>
            </div>
            <Link href="/user/inbox">
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                Open inbox
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-gray-700">
            <p>
              The inbox will aggregate notifications about task updates, project
              changes, and admin approvals (including project delete requests).
            </p>
            <p className="text-[11px] text-gray-500">
              For now, use the Projects and Tasks pages for detailed activity.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

