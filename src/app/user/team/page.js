'use client';

import React, { useEffect, useState } from "react";
import { Users, Shield, Briefcase } from "lucide-react";
import { api } from "@/lib/helper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAlert } from "@/components/providers/AlertProvider";

export default function UserTeamPage() {
  const { showAlert } = useAlert();
  const [operators, setOperators] = useState([]);
  const [qcTechs, setQcTechs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const { ok, data } = await api("/api/users/get-all-user?limit=200", "GET");
        if (!ok || !Array.isArray(data.users)) {
          setOperators([]);
          setQcTechs([]);
          return;
        }

        const ops = data.users.filter((u) => u.role === "operator");
        const qc = data.users.filter((u) => u.role === "qc-technician");

        setOperators(ops);
        setQcTechs(qc);
      } catch (err) {
        console.error("Failed to load team:", err);
        showAlert("Failed to load team members", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [showAlert]);

  const renderPersonRow = (u) => (
    <div
      key={u._id}
      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center text-xs font-semibold">
          {(u.name || u.username || "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {u.name || u.username}
          </p>
          <p className="text-xs text-gray-500 truncate">{u.email}</p>
        </div>
      </div>
      <Badge
        variant="outline"
        className={
          u.status === "Active"
            ? "border-green-200 text-green-700 bg-green-50"
            : "border-gray-200 text-gray-600 bg-gray-50"
        }
      >
        {u.status || "Pending"}
      </Badge>
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Overview</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            See your Operator and QC Technician teams in one view.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4 pb-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Operators</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {operators.length}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white">
              <Briefcase className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">QC Technicians</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {qcTechs.length}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
              <Shield className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Operator Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="text-sm text-gray-500 py-4">Loading operators...</p>
            ) : operators.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">
                No operators found yet.
              </p>
            ) : (
              operators.map(renderPersonRow)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">QC Technician Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="text-sm text-gray-500 py-4">Loading QC techs...</p>
            ) : qcTechs.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">
                No QC technicians found yet.
              </p>
            ) : (
              qcTechs.map(renderPersonRow)
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

