"use client";

import React, { useState } from "react";
import { Award, Download, Loader2, GraduationCap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUserCertificates } from "@/hooks/useQueryHooks";
import { DIFF_COLORS } from "@/components/shared/training/constants";
import { qcApi } from "@/data/qcApi";

/**
 * Admin certificates view: pick a QC technician, see the modules they've
 * passed (their certificates), and export the whole team's progress as CSV.
 */
export default function CertificatesPanel({ progress }) {
  const team = Array.isArray(progress) ? progress : [];
  const { showAlert } = useAlert();
  const [selectedUser, setSelectedUser] = useState("");
  const [exporting, setExporting] = useState(false);

  const { data: certificates = [], isLoading } = useUserCertificates(selectedUser);

  async function handleExport() {
    setExporting(true);
    try {
      await qcApi.exportTeamProgressCsv();
      showAlert("Team progress exported", "success");
    } catch (e) {
      showAlert(e?.message || "Export failed", "error");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Technician</span>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="h-9 w-56"><SelectValue placeholder="Select a technician…" /></SelectTrigger>
            <SelectContent>
              {team.map((t) => (
                <SelectItem key={t.user?._id} value={t.user?._id || ""}>{t.user?.name || "Unknown"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting} className="gap-1.5">
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          Export Team Progress (CSV)
        </Button>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-rose-500" /> Earned Certificates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!selectedUser ? (
            <div className="text-center py-10 text-gray-400">
              <GraduationCap className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">Select a technician to view their passed modules</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-10 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">No certificates yet — this technician has not passed any modules</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
              {certificates.map((c) => (
                <div key={c.moduleId} className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Award className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{c.moduleTitle}</p>
                        <p className="text-[11px] text-gray-400">{c.category}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] capitalize ${DIFF_COLORS[c.difficulty] || ""}`}>{c.difficulty}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="font-bold text-emerald-700">{c.score}%</span>
                    <span className="text-gray-400">{c.passedAt ? new Date(c.passedAt).toLocaleDateString() : ""}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
