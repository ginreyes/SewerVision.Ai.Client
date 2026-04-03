"use client";

import React, { useState, useMemo } from "react";
import {
  UserCircle, Search, Ticket, MessageSquareWarning, Star, Phone,
  Mail, Calendar, ChevronRight, Clock, TrendingUp, Filter,
  BarChart2, CheckCircle2, AlertCircle, Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/components/providers/UserContext";
import {
  useSupportAllTickets,
} from "@/hooks/useQueryHooks";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
}
const COLORS = ["bg-teal-500","bg-blue-500","bg-purple-500","bg-amber-500","bg-rose-500","bg-indigo-500","bg-emerald-500","bg-cyan-500"];
function avatarColor(id) { return COLORS[id?.charCodeAt(0) % COLORS.length] || COLORS[0]; }

function getCustomerName(c) {
  if (!c) return "Unknown";
  if (typeof c === "string") return c;
  if (c.first_name && c.last_name) return `${c.first_name} ${c.last_name}`;
  if (c.first_name) return c.first_name;
  if (c.name) return c.name;
  if (c.username) return c.username;
  if (c.email) return c.email.split("@")[0];
  return "Unknown";
}

function getCustomerEmail(c) {
  if (!c) return "";
  if (typeof c === "string") return "";
  return c.email || "";
}

function buildProfiles(tickets) {
  const map = {};
  tickets.forEach(t => {
    const cust = t.customerId;
    if (!cust) return;
    const id = typeof cust === "string" ? cust : cust._id;
    if (!id) return;
    if (!map[id]) {
      map[id] = {
        id,
        name: getCustomerName(cust),
        email: getCustomerEmail(cust),
        tickets: [],
        totalTickets: 0,
        openTickets: 0,
        resolvedTickets: 0,
        satisfaction: null,
        lastContact: null,
      };
    }
    map[id].tickets.push(t);
    map[id].totalTickets++;
    if (t.status === "open" || t.status === "in-progress") map[id].openTickets++;
    if (t.status === "resolved" || t.status === "closed") map[id].resolvedTickets++;
    const d = new Date(t.created_at || t.createdAt);
    if (!map[id].lastContact || d > new Date(map[id].lastContact)) map[id].lastContact = t.created_at || t.createdAt;
  });
  return Object.values(map).sort((a, b) => b.totalTickets - a.totalTickets);
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CustomerProfiles() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: ticketsRaw, isLoading } = useSupportAllTickets();
  const tickets = useMemo(() => {
    if (Array.isArray(ticketsRaw)) return ticketsRaw;
    if (ticketsRaw?.data && Array.isArray(ticketsRaw.data)) return ticketsRaw.data;
    if (ticketsRaw?.tickets && Array.isArray(ticketsRaw.tickets)) return ticketsRaw.tickets;
    return [];
  }, [ticketsRaw]);
  const profiles = useMemo(() => buildProfiles(tickets), [tickets]);

  const filtered = useMemo(() => profiles.filter(p => {
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
    }
    if (statusFilter === "active") return p.openTickets > 0;
    if (statusFilter === "resolved") return p.openTickets === 0 && p.totalTickets > 0;
    return true;
  }), [profiles, search, statusFilter]);

  const selectedProfile = selected ? profiles.find(p => p.id === selected) : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
          <UserCircle className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Customer Profiles</h1>
          <p className="text-sm text-gray-500">Centralized view of each customer's history and interactions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Customers", value: profiles.length, color: "text-teal-600", bg: "bg-teal-50", icon: UserCircle },
          { label: "Active (Open Tickets)", value: profiles.filter(p => p.openTickets > 0).length, color: "text-amber-600", bg: "bg-amber-50", icon: AlertCircle },
          { label: "Resolved All", value: profiles.filter(p => p.openTickets === 0 && p.totalTickets > 0).length, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
          { label: "Total Interactions", value: tickets.length, color: "text-blue-600", bg: "bg-blue-50", icon: Ticket },
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

      <div className="flex gap-4">
        {/* Left: list */}
        <div className={`flex flex-col gap-3 ${selected ? "w-80 shrink-0" : "flex-1"}`}>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search customers…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
            {["all","active","resolved"].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-2.5 py-1 text-xs font-medium rounded-full border capitalize transition-colors ${statusFilter === f ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"}`}>
                {f}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <UserCircle className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No customers found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(p => (
                <button key={p.id} onClick={() => setSelected(p.id === selected ? null : p.id)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${selected === p.id ? "border-teal-300 bg-teal-50" : "border-gray-200 bg-white hover:border-teal-200 hover:shadow-sm"}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColor(p.id)}`}>
                    {getInitials(p.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 truncate">{p.email || "No email"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-gray-900">{p.totalTickets}</p>
                    <p className="text-[10px] text-gray-400">tickets</p>
                  </div>
                  {p.openTickets > 0 && (
                    <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: detail */}
        {selectedProfile && (
          <div className="flex-1 min-w-0">
            <Card className="border-gray-200">
              <CardContent className="p-5">
                {/* Profile header */}
                <div className="flex items-start gap-4 mb-5 pb-5 border-b border-gray-100">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0 ${avatarColor(selectedProfile.id)}`}>
                    {getInitials(selectedProfile.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900">{selectedProfile.name}</h2>
                    {selectedProfile.email && (
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5" />{selectedProfile.email}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                      <Clock className="w-3 h-3" />Last contact: {formatDate(selectedProfile.lastContact)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedProfile.openTickets > 0
                      ? <Badge className="bg-amber-100 text-amber-700 border-amber-200">{selectedProfile.openTickets} open</Badge>
                      : <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">All resolved</Badge>}
                  </div>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: "Total Tickets", value: selectedProfile.totalTickets, color: "text-teal-600", bg: "bg-teal-50" },
                    { label: "Open", value: selectedProfile.openTickets, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Resolved", value: selectedProfile.resolvedTickets, color: "text-emerald-600", bg: "bg-emerald-50" },
                  ].map(s => (
                    <div key={s.label} className={`rounded-lg p-3 text-center ${s.bg}`}>
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent tickets */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Tickets</h3>
                  <div className="space-y-2">
                    {selectedProfile.tickets.slice(0, 8).map(t => (
                      <div key={t._id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:border-teal-100 transition-colors">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${t.status === "open" ? "bg-amber-400" : t.status === "in-progress" ? "bg-blue-400" : t.status === "resolved" ? "bg-emerald-400" : "bg-gray-300"}`} />
                        <p className="text-sm text-gray-700 flex-1 min-w-0 truncate">{t.subject || "No subject"}</p>
                        <Badge variant="outline" className="text-[10px] capitalize shrink-0">{t.status}</Badge>
                        <span className="text-[10px] text-gray-400 shrink-0">{formatDate(t.created_at || t.createdAt)}</span>
                      </div>
                    ))}
                    {selectedProfile.tickets.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No tickets yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
