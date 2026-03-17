'use client';

import React from "react";
import {
  FaUsers,
  FaUserPlus,
} from "react-icons/fa";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

/**
 * Management User (Team Lead) detail panel.
 * Shows team size, managed projects summary, and member management UI.
 */
const TeamLeadDetailed = ({
  user,
  isEdit,
  managedMembers,
  setManagedMembers,
  availableMembers,
  selectedMemberId,
  setSelectedMemberId,
}) => {
  const stats = user?.projectStats?.asManager || {
    totalProjects: 0,
    activeProjects: 0,
  };
  const active = stats.activeProjects || 0;
  const total = stats.totalProjects || 0;

  return (
    <>
      <Card className="border-red-100 shadow-sm">
        <CardHeader className="border-b border-red-50 bg-red-50/40">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg text-red-700">
              <FaUsers />
            </div>
            <div>
              <CardTitle className="text-base">Team Lead Overview</CardTitle>
              <CardDescription>
                Projects and members under this management user.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Team Size
            </p>
            <p className="text-xl font-semibold text-gray-900">
              {managedMembers.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Active / Total Managed Projects
            </p>
            <p className="text-xl font-semibold text-gray-900">
              {active} <span className="text-gray-400">/ {total}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-100 shadow-sm">
        <CardHeader className="border-b border-emerald-50 bg-emerald-50/30">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <FaUsers className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Team Members</CardTitle>
              <CardDescription>
                People who report to this management user (Team Lead).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 text-sm">
                Current Members ({managedMembers.length})
              </h4>
              {!isEdit && (
                <span className="text-xs text-gray-500">
                  Switch to edit mode to modify members.
                </span>
              )}
            </div>
            {managedMembers.length === 0 ? (
              <p className="text-sm text-gray-500">
                No team members assigned yet.
              </p>
            ) : (
              <div className="space-y-2">
                {managedMembers.map((m) => (
                  <div
                    key={m._id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 bg-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center text-xs font-semibold">
                        {((m.first_name || m.username || "?").charAt(0) || "")
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {(m.first_name || "") + " " + (m.last_name || "") ||
                            m.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {m.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          m.role === "operator"
                            ? "border-blue-200 text-blue-700 bg-blue-50"
                            : m.role === "qc-technician"
                            ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                            : "border-gray-200 text-gray-700 bg-gray-50"
                        }
                      >
                        {m.role}
                      </Badge>
                      {isEdit && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() =>
                            setManagedMembers((prev) =>
                              prev.filter((mm) => mm._id !== m._id)
                            )
                          }
                        >
                          <FaUserPlus className="h-3 w-3 rotate-45" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add member control */}
          {isEdit && (
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <FaUserPlus className="h-4 w-4 text-emerald-600" />
                Add Member
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 items-center">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">
                    Select an operator or QC technician to add under this Team
                    Lead.
                  </Label>
                  <Select
                    value={selectedMemberId}
                    onValueChange={setSelectedMemberId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose member to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMembers
                        .filter(
                          (cand) =>
                            !managedMembers.some((m) => m._id === cand._id)
                        )
                        .map((cand) => (
                          <SelectItem key={cand._id} value={cand._id}>
                            {cand.name || cand.username} — {cand.role}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  disabled={!selectedMemberId}
                  className="mt-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    if (!selectedMemberId) return;
                    const candidate = availableMembers.find(
                      (c) => c._id === selectedMemberId
                    );
                    if (!candidate) return;
                    setManagedMembers((prev) => [
                      ...prev,
                      {
                        _id: candidate._id,
                        first_name: candidate.first_name,
                        last_name: candidate.last_name,
                        username: candidate.username,
                        email: candidate.email,
                        role: candidate.role,
                        active: candidate.active,
                        avatar: candidate.avatar,
                      },
                    ]);
                    setSelectedMemberId("");
                  }}
                >
                  Add Member
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Changes to team members will be saved when you click{" "}
                <span className="font-semibold">Save Changes</span> at the top.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default TeamLeadDetailed;

