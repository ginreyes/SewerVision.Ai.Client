"use client";

import React, { useState } from "react";
import {
  MessageSquare, Plus, Send, ChevronRight, FileText,
  CheckCircle2, Clock, AlertCircle, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import { useCustomerReports, useReportAnnotations, useCreateAnnotation } from "@/hooks/useQueryHooks";

export default function ReportAnnotations() {
  const { showAlert } = useAlert();
  const { userId, userData } = useUser();

  const { data: reports = [], isLoading: reportsLoading } = useCustomerReports(userId);
  const [selectedReport, setSelectedReport] = useState(null);

  // Auto-select first report once loaded
  const activeReportId = selectedReport || reports[0]?._id;
  const report = reports.find(r => r._id === activeReportId);

  const { data: annotations = [], isLoading: annotationsLoading } = useReportAnnotations(activeReportId);
  const createMutation = useCreateAnnotation();

  const [newSection, setNewSection] = useState("");
  const [newText, setNewText] = useState("");
  const [showForm, setShowForm] = useState(false);

  function handleSubmit() {
    if (!newText.trim()) {
      showAlert("Comment required", "error");
      return;
    }
    createMutation.mutate(
      {
        reportId: activeReportId,
        customerId: userId,
        section: newSection || "General",
        text: newText,
        author: userId,
        authorName: userData?.first_name ? `${userData.first_name} ${userData.last_name || ""}`.trim() : "Customer",
      },
      {
        onSuccess: () => {
          setNewText("");
          setNewSection("");
          setShowForm(false);
          showAlert("Annotation submitted", "success");
        },
        onError: (err) => showAlert(err.message || "Failed to submit annotation", "error"),
      }
    );
  }

  if (reportsLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm text-gray-500">Loading reports…</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Report Annotations</h1>
            <p className="text-sm text-gray-500">Comment on and annotate your delivered inspection reports</p>
          </div>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FileText className="w-10 h-10 mb-2 opacity-30" />
          <p className="text-sm">No reports available yet</p>
        </div>
      ) : (
        <>
          {/* Report selector */}
          <div className="flex items-center gap-2 mb-5 overflow-x-auto">
            {reports.map(r => (
              <button key={r._id} onClick={() => setSelectedReport(r._id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all whitespace-nowrap ${activeReportId === r._id ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-gray-200 bg-white text-gray-700 hover:border-emerald-200"}`}>
                <FileText className="w-4 h-4" />
                <span className="font-medium">{r.projectName || r.name || "Report"}</span>
                <Badge variant="outline" className="text-[10px]">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                </Badge>
              </button>
            ))}
          </div>

          {/* Annotations */}
          {annotationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              {annotations.map(ann => {
                const authorDisplay = ann.author?.first_name
                  ? `${ann.author.first_name} ${ann.author.last_name || ""}`
                  : ann.authorName || "Customer";
                return (
                  <Card key={ann._id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold shrink-0">
                          {authorDisplay[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-gray-900">{authorDisplay}</span>
                            <span className="text-[10px] text-gray-400">
                              {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                            </span>
                            <Badge variant="outline" className={`text-[10px] ${ann.status === "resolved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                              {ann.status}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-emerald-700 font-medium mb-1 flex items-center gap-1"><ChevronRight className="w-3 h-3" />{ann.section}</p>
                          <p className="text-sm text-gray-800">{ann.text}</p>
                          {ann.reply && (
                            <div className="mt-3 pl-3 border-l-2 border-emerald-300">
                              <p className="text-[10px] text-gray-500 font-medium mb-0.5">
                                {ann.repliedBy?.first_name ? `${ann.repliedBy.first_name} replied:` : "Support Team replied:"}
                              </p>
                              <p className="text-xs text-gray-700">{ann.reply}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {annotations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">No annotations yet</p>
                </div>
              )}
            </div>
          )}

          {/* Add annotation */}
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} variant="outline" className="gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
              <Plus className="w-4 h-4" /> Add Comment or Question
            </Button>
          ) : (
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardContent className="p-4 space-y-3">
                <input value={newSection} onChange={e => setNewSection(e.target.value)} placeholder="Section reference (optional, e.g. Section 3.2)"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-1 focus:ring-emerald-300" />
                <Textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="Your comment, question, or clarification request…" rows={3} />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSubmit} disabled={createMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                    <Send className="w-3.5 h-3.5" /> {createMutation.isPending ? "Submitting…" : "Submit"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
