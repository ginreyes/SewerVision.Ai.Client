"use client";

import React, { useState, useMemo } from "react";
import {
  Star, Send, ThumbsUp, ThumbsDown, TrendingUp, BarChart2,
  CheckCircle2, Clock, Users, MessageSquare, Plus, Filter, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import {
  useSurveyResponses,
  useSurveyStats,
  useSendSurveys,
  useSurveyInvites,
  useSupportAllTickets,
} from "@/hooks/useQueryHooks";
import { ListSkeleton } from '@/components/shared/SkeletonLoading';
import { DonutRing } from "@/components/shared/charts";

function StarRating({ rating, size = "w-4 h-4" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${size} ${i <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
      ))}
    </div>
  );
}

export default function SatisfactionSurveys() {
  const { showAlert } = useAlert();
  const { userId } = useUser();
  const [ratingFilter, setRatingFilter] = useState("all");

  const { data: statsData } = useSurveyStats();
  const { data: responsesData, isLoading } = useSurveyResponses({
    rating: ratingFilter !== "all" ? ratingFilter : undefined,
  });
  const sendSurveysMutation = useSendSurveys();
  const { data: ticketsRaw } = useSupportAllTickets();
  const { data: invitesData } = useSurveyInvites();

  const resolvedTickets = useMemo(() => {
    const raw = ticketsRaw;
    const t = Array.isArray(raw) ? raw : (raw?.data && Array.isArray(raw.data)) ? raw.data : [];
    return t.filter(t => t.status === "resolved" || t.status === "closed");
  }, [ticketsRaw]);

  const invites = invitesData?.data || [];

  const responses = responsesData?.data || responsesData || [];
  const allResponses = Array.isArray(responses) ? responses : [];

  const stats = useMemo(() => {
    if (statsData) {
      // distribution from API can be an object {1:count, 2:count...} or array [{star,count}]
      let dist;
      if (Array.isArray(statsData.distribution)) {
        dist = statsData.distribution;
      } else if (statsData.distribution && typeof statsData.distribution === 'object') {
        dist = [5,4,3,2,1].map(s => ({ star: s, count: statsData.distribution[s] || 0 }));
      } else {
        dist = [5,4,3,2,1].map(s => ({ star: s, count: 0 }));
      }
      const total = statsData.totalResponses ?? 0;
      const positive = statsData.positiveCount ?? dist.filter(d => d.star >= 4).reduce((s, d) => s + d.count, 0);
      const pct = statsData.satisfactionPercent ?? (total > 0 ? Math.round((positive / total) * 100) : 0);
      return {
        avg: statsData.avgRating?.toFixed(1) ?? statsData.averageRating?.toFixed(1) ?? statsData.avg ?? "0.0",
        dist,
        positive,
        pct,
        total,
      };
    }
    // Fallback: compute from responses
    if (allResponses.length === 0) return { avg: "0.0", dist: [5,4,3,2,1].map(s => ({ star: s, count: 0 })), positive: 0, pct: 0, total: 0 };
    const avg = allResponses.reduce((s, r) => s + (r.rating || 0), 0) / allResponses.length;
    const dist = [5,4,3,2,1].map(s => ({ star: s, count: allResponses.filter(r => r.rating === s).length }));
    const positive = allResponses.filter(r => r.rating >= 4).length;
    return { avg: avg.toFixed(1), dist, positive, pct: Math.round((positive / allResponses.length) * 100), total: allResponses.length };
  }, [statsData, allResponses]);

  const filtered = allResponses;

  async function handleSendSurveys() {
    if (resolvedTickets.length === 0) { showAlert("No resolved tickets to send surveys for", "error"); return; }
    sendSurveysMutation.mutate(
      { ticketIds: resolvedTickets.map(t => t._id || t.id), sentBy: userId },
      {
        onSuccess: (data) => showAlert(`Sent ${data?.sent || 0} survey(s), skipped ${data?.skipped || 0}`, "success"),
        onError: (err) => showAlert(err.message || "Failed to send surveys", "error"),
      }
    );
  }

  if (isLoading) return (<ListSkeleton />)
  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Satisfaction Surveys</h1>
            <p className="text-sm text-gray-500">CSAT ratings, feedback trends, and post-resolution surveys</p>
          </div>
        </div>
        <Button onClick={handleSendSurveys} disabled={sendSurveysMutation.isPending || resolvedTickets.length === 0} className="bg-teal-600 hover:bg-teal-700 text-white">
          {sendSurveysMutation.isPending ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Sending…</> : <><Send className="w-4 h-4 mr-1.5" />Send Surveys ({resolvedTickets.length})</>}
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Avg Rating", value: stats.avg, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Positive (4-5★)", value: stats.positive, icon: ThumbsUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Responses", value: stats.total, icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Response Rate", value: `${stats.pct}%`, icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50" },
        ].map(s => (
          <Card key={s.label} className="border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* CSAT Donut */}
        <Card className="border-gray-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm">CSAT Score</CardTitle></CardHeader>
          <CardContent className="pt-0 flex flex-col items-center justify-center py-4">
            <DonutRing pct={stats.pct} color="#10b981" size={90} />
            <p className="text-xs text-gray-500 mt-3 text-center">
              {stats.positive} of {stats.total} customers satisfied
            </p>
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={Math.round(Number(stats.avg))} size="w-3.5 h-3.5" />
              <span className="text-sm font-bold text-gray-900">{stats.avg}</span>
            </div>
          </CardContent>
        </Card>

        {/* Rating distribution */}
        <Card className="border-gray-200 col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Rating Distribution</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-2">
            {stats.dist.map(({ star, count }) => {
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12 shrink-0">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium text-gray-700">{star}</span>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Responses */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Recent Responses</CardTitle>
            <div className="flex items-center gap-1.5">
              {["all","5","4","3","2","1"].map(f => (
                <button key={f} onClick={() => setRatingFilter(f)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${ratingFilter === f ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"}`}>
                  {f === "all" ? "All" : `${f}★`}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {filtered.map(r => {
            const rId = r.id || r._id;
            const customerName = r.customer || r.customerName || "Customer";
            return (
              <div key={rId} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-amber-100 hover:bg-amber-50/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0">
                  {customerName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{customerName}</span>
                    <StarRating rating={r.rating} size="w-3 h-3" />
                  </div>
                  {r.comment && <p className="text-xs text-gray-600">{r.comment}</p>}
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">{r.date || r.createdAt || ""}</span>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-6">No responses for this rating</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
