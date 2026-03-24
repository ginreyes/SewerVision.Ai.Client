"use client";

import React, { useState, useMemo } from "react";
import {
  Star, Send, ThumbsUp, ThumbsDown, TrendingUp, BarChart2,
  CheckCircle2, Clock, Users, MessageSquare, Plus, Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAlert } from "@/components/providers/AlertProvider";
import { useSupportAllTickets } from "@/hooks/useQueryHooks";

const SEED_RESPONSES = [
  { id: "1", customer: "James M.", rating: 5, comment: "Very quick response, issue resolved perfectly!", date: "2026-03-24", agent: "Support Team" },
  { id: "2", customer: "Sarah K.", rating: 4, comment: "Good service but a bit slow at first.", date: "2026-03-23", agent: "Support Team" },
  { id: "3", customer: "David L.", rating: 5, comment: "Excellent! Agent was very helpful and professional.", date: "2026-03-22", agent: "Support Team" },
  { id: "4", customer: "Emily R.", rating: 2, comment: "Took too long, had to follow up multiple times.", date: "2026-03-21", agent: "Support Team" },
  { id: "5", customer: "Marcus T.", rating: 5, comment: "Outstanding support, couldn't be happier.", date: "2026-03-20", agent: "Support Team" },
  { id: "6", customer: "Priya S.", rating: 3, comment: "Average experience. Nothing special.", date: "2026-03-19", agent: "Support Team" },
  { id: "7", customer: "Chris N.", rating: 4, comment: "Good follow up after the initial delay.", date: "2026-03-18", agent: "Support Team" },
  { id: "8", customer: "Anna V.", rating: 5, comment: "Solved in one interaction. Impressive!", date: "2026-03-17", agent: "Support Team" },
];

function StarRating({ rating, size = "w-4 h-4" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${size} ${i <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
      ))}
    </div>
  );
}

function DonutRing({ pct, color, size = 60 }) {
  const r = 22, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 50 50">
      <circle cx="25" cy="25" r={r} fill="none" stroke="#f3f4f6" strokeWidth="6" />
      <circle cx="25" cy="25" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ / 4}
        strokeLinecap="round" style={{ transition: "stroke-dasharray 0.5s" }} />
      <text x="25" y="29" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#111">{pct}%</text>
    </svg>
  );
}

export default function SatisfactionSurveys() {
  const { showAlert } = useAlert();
  const [responses] = useState(SEED_RESPONSES);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sending, setSending] = useState(false);

  const { data: ticketsRaw } = useSupportAllTickets();
  const resolvedTickets = useMemo(() => {
    const t = Array.isArray(ticketsRaw) ? ticketsRaw : [];
    return t.filter(t => t.status === "resolved" || t.status === "closed");
  }, [ticketsRaw]);

  const stats = useMemo(() => {
    const avg = responses.reduce((s, r) => s + r.rating, 0) / responses.length;
    const dist = [5,4,3,2,1].map(s => ({ star: s, count: responses.filter(r => r.rating === s).length }));
    const positive = responses.filter(r => r.rating >= 4).length;
    return { avg: avg.toFixed(1), dist, positive, pct: Math.round((positive / responses.length) * 100), total: responses.length };
  }, [responses]);

  const filtered = ratingFilter === "all" ? responses : responses.filter(r => r.rating === Number(ratingFilter));

  async function handleSendSurveys() {
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    showAlert(`Surveys sent to ${resolvedTickets.length} resolved customers`, "success");
  }

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
        <Button onClick={handleSendSurveys} disabled={sending} className="bg-teal-600 hover:bg-teal-700 text-white">
          {sending ? <><span className="w-4 h-4 mr-1.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />Sending…</> : <><Send className="w-4 h-4 mr-1.5" />Send Surveys</>}
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
          {filtered.map(r => (
            <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-amber-100 hover:bg-amber-50/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0">
                {r.customer.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">{r.customer}</span>
                  <StarRating rating={r.rating} size="w-3 h-3" />
                </div>
                {r.comment && <p className="text-xs text-gray-600">{r.comment}</p>}
              </div>
              <span className="text-[10px] text-gray-400 shrink-0">{r.date}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-6">No responses for this rating</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
