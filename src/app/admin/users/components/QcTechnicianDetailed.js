'use client';

import React from "react";
import { FaCog, FaChartLine } from "react-icons/fa";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

/**
 * QC Technician-specific detail panel on the admin user profile page.
 * Shows qualifications and a small workload summary.
 */
const QcTechnicianDetailed = ({ user, form, isEdit, setForm }) => {
  const stats = user?.projectStats?.asQc || {
    totalProjects: 0,
    activeProjects: 0,
  };
  const active = stats.activeProjects || 0;
  const total = stats.totalProjects || 0;
  const vacant = active === 0;

  return (
    <>
      <Card className="border-purple-100 shadow-sm">
        <CardHeader className="border-b border-purple-50 bg-purple-50/30">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <FaCog />
            </div>
            <div>
              <CardTitle className="text-lg">Qualification Data</CardTitle>
              <CardDescription>Certifications and experience</CardDescription>
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
              <Label>License #</Label>
              <Input
                disabled={!isEdit}
                value={form.license_number}
                onChange={(e) =>
                  setForm({ ...form, license_number: e.target.value })
                }
              />
            </div>
            <div className="col-span-2">
              <Label>Experience (Years)</Label>
              <Input
                type="number"
                disabled={!isEdit}
                value={form.experience_years}
                onChange={(e) =>
                  setForm({ ...form, experience_years: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-100 shadow-sm">
        <CardHeader className="border-b border-emerald-50 bg-emerald-50/40">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <FaChartLine />
            </div>
            <div>
              <CardTitle className="text-base">QC Workload Overview</CardTitle>
              <CardDescription>
                Projects this QC technician is currently assigned to.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Active / Total QC Projects
            </p>
            <p className="text-xl font-semibold text-gray-900">
              {active} <span className="text-gray-400">/ {total}</span>
            </p>
          </div>
          <div className="text-right">
            <p
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                vacant
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-purple-50 text-purple-700 border border-purple-200"
              }`}
            >
              {vacant ? "Vacant (no active projects)" : "Assigned to active projects"}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Includes projects where this user is set as QC technician.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default QcTechnicianDetailed;

