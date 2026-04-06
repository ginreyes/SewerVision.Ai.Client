"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  MapPin, Navigation, Clock, Route, CheckCircle2, Circle, Car, CloudUpload,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/components/providers/UserContext";
import { useRouter } from "next/navigation";
import { useOperatorRouteSites, useCompleteRouteSite } from "@/hooks/useQueryHooks";
import { SiteCard, STATUS_CONFIG } from "@/components/operator/route-planner";

const ProjectMap = dynamic(() => import("@/components/customer/ProjectMap"), { ssr: false });

export default function RoutePlanner() {
  const { userId } = useUser();
  const router = useRouter();
  const { data: sites = [], isLoading } = useOperatorRouteSites(userId);
  const completeMutation = useCompleteRouteSite();

  const [selected, setSelected] = useState(null);

  const selectedSite = useMemo(
    () => sites.find((s) => s.id === selected) || sites[0] || null,
    [sites, selected]
  );

  const pending = useMemo(() => sites.filter((s) => s.status !== "completed").length, [sites]);
  const totalKm = useMemo(
    () => sites.filter((s) => s.status !== "completed").reduce((s, r) => s + parseFloat(r.distance || 0), 0),
    [sites]
  );
  const completedCount = useMemo(() => sites.filter((s) => s.status === "completed").length, [sites]);

  const handleSelect = useCallback((id) => setSelected(id), []);

  const statsCards = useMemo(
    () => [
      { label: "Sites Today", value: sites.length, icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "Remaining", value: pending, icon: Circle, color: "text-amber-600", bg: "bg-amber-50" },
      { label: "Total Distance", value: `${totalKm.toFixed(1)} km`, icon: Route, color: "text-teal-600", bg: "bg-teal-50" },
      { label: "Completed", value: completedCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    ],
    [sites.length, pending, totalKm, completedCount]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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
        <Button variant="outline" size="sm" className="gap-1.5"
          onClick={() => {
            const addresses = sites.filter(s => s.address).map(s => encodeURIComponent(s.address));
            if (addresses.length === 0) return;
            const origin = addresses[0];
            const destination = addresses[addresses.length - 1];
            const waypoints = addresses.slice(1, -1).join('|');
            const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}`;
            window.open(url, '_blank');
          }}>
          <Navigation className="w-4 h-4" /> Open in Maps
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {statsCards.map((s) => (
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

      {sites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <MapPin className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm font-medium">No sites assigned</p>
          <p className="text-xs mt-1">Sites will appear here when assigned to your route</p>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* Site list */}
          <div className="w-80 shrink-0 space-y-2">
            {sites.map((site, i) => (
              <SiteCard
                key={site.id}
                site={site}
                index={i}
                isSelected={(selected || sites[0]?.id) === site.id}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Map placeholder + detail */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Real Map with Leaflet */}
            <ProjectMap
              projects={sites.map(s => ({
                _id: s.id || s._id,
                name: s.name,
                location: s.address,
                latitude: s.latitude,
                longitude: s.longitude,
                status: s.status === "completed" ? "completed" : "in-progress",
              }))}
              selected={selected || sites[0]?.id}
              onSelectProject={handleSelect}
              height={280}
            />

            {/* Selected site detail */}
            {selectedSite && (
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{selectedSite.name}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />{selectedSite.address}
                      </p>
                    </div>
                    <Badge variant="outline" className={(STATUS_CONFIG[selectedSite.status] || STATUS_CONFIG.pending).color}>
                      {selectedSite.status}
                    </Badge>
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
                  <div className="flex gap-2 mt-3">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2 text-sm"
                      onClick={() => {
                        const address = selectedSite.address || selectedSite.name;
                        if (address) window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
                      }}>
                      <Navigation className="w-4 h-4" /> Navigate
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2 text-sm border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => router.push(`/operator/uploads?projectId=${selectedSite.projectId || ''}`)}>
                      <CloudUpload className="w-4 h-4" /> Upload Video
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
