'use client';

import React, { useEffect, useState } from "react";
import {
  FaTools,
  FaUserTag,
} from "react-icons/fa";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/helper";

/**
 * Operator-specific detail panel on the admin user profile page.
 * Shows certification, shift preferences, and equipment expertise.
 */
const OperatorDetailed = ({ user, form, isEdit, setForm }) => {
  return (
    <Card className="border-orange-100 shadow-sm">
      <CardHeader className="border-b border-orange-50 bg-orange-50/30">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
            <FaTools />
          </div>
          <div>
            <CardTitle className="text-lg">Operational Data</CardTitle>
            <CardDescription>
              Shift preferences, certifications, and equipment expertise
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Certification</Label>
            <Input
              disabled={!isEdit}
              value={form.certification}
              onChange={(e) =>
                setForm({ ...form, certification: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Preferred Shift</Label>
            <Select
              disabled={!isEdit}
              value={form.shift_preference}
              onValueChange={(v) => setForm({ ...form, shift_preference: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day Shift</SelectItem>
                <SelectItem value="night">Night Shift</SelectItem>
                <SelectItem value="rotating">Rotating</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>Equipment Expertise</Label>
            <Textarea
              disabled={!isEdit}
              value={form.equipment_experience}
              onChange={(e) =>
                setForm({ ...form, equipment_experience: e.target.value })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Compact operator workspace overview for the General Information card.
 * Shows team lead, upload count, and a short list of projects.
 */
export const OperatorWorkspaceOverview = ({ operatorId }) => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [uploadCount, setUploadCount] = useState(null);
  const [leaderName, setLeaderName] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!operatorId) return;
      try {
        setLoading(true);
        // Load projects scoped to operator
        const projectParams = new URLSearchParams({
          page: "1",
          limit: "5",
          assignedOperatorId: String(operatorId),
        });
        const { ok: okProjects, data: projectData } = await api(
          `/api/projects/get-all-projects?${projectParams.toString()}`,
          "GET"
        );
        if (okProjects && Array.isArray(projectData.data)) {
          setProjects(projectData.data);
        } else if (Array.isArray(projectData)) {
          setProjects(projectData);
        } else {
          setProjects([]);
        }

        // Load detailed operator profile to get leader + uploads
        const { data: detail } = await api(
          `/api/users/get-user-details/${operatorId}`,
          "GET"
        );
        const u = detail?.user;
        if (u?.leader) {
          setLeaderName(
            u.leader.name ||
              u.leader.username ||
              u.leader.email ||
              "Team Lead"
          );
        } else {
          setLeaderName("No team lead assigned");
        }
        if (u?.uploadStats && typeof u.uploadStats.totalUploads === "number") {
          setUploadCount(u.uploadStats.totalUploads);
        }
      } catch (err) {
        console.error("Failed to load operator workspace overview", err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [operatorId]);

  if (loading) {
    return (
      <div className="h-[78px] flex items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-xs text-gray-500">
        Loading workspace...
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3 space-y-3 max-h-64 overflow-y-auto">
      {/* Leader & uploads summary */}
      <div className="flex items-center justify-between gap-3 text-[11px]">
        <div className="min-w-0">
          <p className="font-semibold text-blue-900 truncate">Team Lead</p>
          <p className="text-[11px] text-blue-800 truncate">
            {leaderName || "No team lead assigned"}
          </p>
        </div>
        {uploadCount !== null && (
          <div className="text-right">
            <p className="text-[10px] text-blue-900 uppercase tracking-wide">
              Uploads
            </p>
            <p className="text-sm font-semibold text-blue-800">
              {uploadCount}
            </p>
          </div>
        )}
      </div>

      <Separator className="my-1 bg-blue-100" />

      {/* Current projects list (can be empty) */}
      {projects.length ? (
        <>
          <p className="text-[11px] font-semibold text-blue-900 uppercase tracking-wide">
            Current Projects
          </p>
          <div className="space-y-1.5">
            {projects.slice(0, 4).map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {p.name || "Untitled Project"}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {p.location || p.client || p.workOrder}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white text-blue-700 border border-blue-200">
                  {(p.status || "").replace("-", " ").toUpperCase()}
                </span>
              </div>
            ))}
            {projects.length > 4 && (
              <p className="text-[11px] text-gray-500">
                +{projects.length - 4} more project
                {projects.length - 4 > 1 ? "s" : ""} assigned.
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="h-[60px] flex items-center justify-center rounded-lg border border-dashed border-blue-100 bg-blue-50 text-[11px] text-blue-700">
          No projects assigned to this operator yet.
        </div>
      )}

      {/* Applications / modules the operator can use */}
      <div className="pt-2 border-t border-blue-100 space-y-1.5">
        <p className="text-[11px] font-semibold text-blue-900 uppercase tracking-wide">
          Applications Available
        </p>
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <span className="px-2 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200">
            Operator Dashboard
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200">
            Inspection Projects
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200">
            Reports Workspace
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200">
            Activity Logs
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200">
            Equipment &amp; Devices
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200">
            Notifications
          </span>
        </div>
      </div>
    </div>
  );
};

export default OperatorDetailed;

