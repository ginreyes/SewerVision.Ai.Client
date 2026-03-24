"use client";

import React, { useState } from "react";
import {
  MapPin, Navigation, Clock, Route, CheckCircle2, Circle,
  ChevronRight, Car, AlertTriangle, Fuel, Search, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SITES = [
  { id: "1", name: "Main St Sewer Segment A", address: "245 Main St, Northdale", project: "PRJ-0087", status: "pending", distance: "3.2 km", eta: "8 min", priority: "high", lat: 40.712, lng: -74.005 },
  { id: "2", name: "Oak Ave Junction", address: "78 Oak Ave, Northdale", project: "PRJ-0088", status: "completed", distance: "5.7 km", eta: "14 min", priority: "medium", lat: 40.714, lng: -74.010 },
  { id: "3", name: "River Rd Culvert", address: "River Rd & 3rd St, Northdale", project: "PRJ-0089", status: "pending", distance: "8.1 km", eta: "20 min", priority: "high", lat: 40.720, lng: -74.001 },
  { id: "4", name: "Industrial Park Catchment", address: "1200 Industrial Blvd", project: "PRJ-0090", status: "in-progress", distance: "11.4 km", eta: "28 min", priority: "medium", lat: 40.708, lng: -73.998 },
  { id: "5", name: "Westfield Residential", address: "Westfield Drive, Block 4", project: "PRJ-0091", status: "pending", distance: "15.2 km", eta: "35 min", priority: "low", lat: 40.730, lng: -74.015 },
];

const STATUS_CONFIG = {
  pending: { color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  "in-progress": { color: "bg-blue-100 text-blue-700", dot: "bg-blue-500 animate-pulse" },
  completed: { color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

const PRIORITY_COLORS = { high: "text-red-500", medium: "text-amber-500", low: "text-gray-400" };

export default function RoutePlanner() {
  const [selected, setSelected] = useState("1");
  const selectedSite = SITES.find(s => s.id === selected);
  const pending = SITES.filter(s => s.status !== "completed").length;
  const totalKm = SITES.filter(s => s.status !== "completed").reduce((s, r) => s + parseFloat(r.distance), 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">GPS Route Planner</h1>
            <p className="text-sm text-gray-500">Map view of assigned inspection sites with optimized routes</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Navigation className="w-4 h-4" /> Open in Maps
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Sites Today", value: SITES.length, icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Remaining", value: pending, icon: Circle, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Total Distance", value: `${totalKm.toFixed(1)} km`, icon: Route, color: "text-teal-600", bg: "bg-teal-50" },
          { label: "Completed", value: SITES.filter(s => s.status === "completed").length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
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
        {/* Site list */}
        <div className="w-80 shrink-0 space-y-2">
          {SITES.map((site, i) => {
            const cfg = STATUS_CONFIG[site.status];
            return (
              <button key={site.id} onClick={() => setSelected(site.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${selected === site.id ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-200"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5 ${site.status === "completed" ? "bg-emerald-500" : site.status === "in-progress" ? "bg-blue-500" : "bg-gray-400"}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-xs font-semibold text-gray-900 truncate">{site.name}</p>
                      <span className={`text-[10px] font-medium ${PRIORITY_COLORS[site.priority]}`}>●</span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">{site.address}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
                      <span className="flex items-center gap-0.5"><Car className="w-3 h-3" />{site.distance}</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{site.eta}</span>
                      <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>{site.status}</Badge>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Map placeholder + detail */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Map placeholder */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50" style={{ height: 280 }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-blue-300">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Interactive Map</p>
                <p className="text-xs opacity-70">Connects to GPS / Google Maps API</p>
              </div>
            </div>
            {/* Simulated route dots */}
            {SITES.map((site, i) => (
              <div key={site.id}
                className={`absolute w-5 h-5 rounded-full border-2 border-white shadow flex items-center justify-center text-[9px] font-bold text-white cursor-pointer transition-transform hover:scale-125 ${site.status === "completed" ? "bg-emerald-500" : selected === site.id ? "bg-blue-600 scale-125" : "bg-gray-400"}`}
                style={{ left: `${20 + i * 14}%`, top: `${30 + (i % 3) * 20}%` }}
                onClick={() => setSelected(site.id)}>
                {i + 1}
              </div>
            ))}
            <div className="absolute bottom-3 right-3 flex items-center gap-2 text-[10px] text-blue-600 bg-white/80 rounded-lg px-2 py-1 shadow">
              <Navigation className="w-3 h-3" />Optimized route active
            </div>
          </div>

          {/* Selected site detail */}
          {selectedSite && (
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{selectedSite.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{selectedSite.address}</p>
                  </div>
                  <Badge variant="outline" className={STATUS_CONFIG[selectedSite.status].color}>{selectedSite.status}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-bold text-blue-700">{selectedSite.distance}</p>
                    <p className="text-[10px] text-gray-500">Distance</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-bold text-teal-700">{selectedSite.eta}</p>
                    <p className="text-[10px] text-gray-500">ETA</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                    <p className="text-sm font-bold text-gray-700 capitalize">{selectedSite.priority}</p>
                    <p className="text-[10px] text-gray-500">Priority</p>
                  </div>
                </div>
                <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white gap-2 text-sm">
                  <Navigation className="w-4 h-4" /> Navigate to Site
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
