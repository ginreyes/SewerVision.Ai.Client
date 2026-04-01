"use client";

import React, { useEffect, useRef, memo, useState } from "react";
import { Navigation } from "lucide-react";

const STATUS_COLORS = {
  "in-progress": "#3b82f6",
  completed: "#10b981",
  pending: "#9ca3af",
};

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/**
 * ProjectMap — Leaflet + OpenStreetMap map component.
 * Geocodes addresses when lat/lng not available.
 */
const ProjectMap = memo(function ProjectMap({ projects = [], selected, onSelectProject, height = 220 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [geocodedProjects, setGeocodedProjects] = useState([]);

  // Geocode projects that don't have coordinates
  useEffect(() => {
    if (projects.length === 0) return;

    const geocodeAll = async () => {
      const results = await Promise.all(projects.map(async (p, idx) => {
        let lat = null, lng = null;

        // Try existing coordinates
        if (p.latitude && p.longitude) {
          lat = parseFloat(p.latitude);
          lng = parseFloat(p.longitude);
        } else if (p.coordinates) {
          lat = p.coordinates.lat || p.coordinates[0];
          lng = p.coordinates.lng || p.coordinates[1];
        } else if (p.location && typeof p.location === "string") {
          // Try "lat,lng" format
          const match = p.location.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
          if (match) {
            lat = parseFloat(match[1]);
            lng = parseFloat(match[2]);
          }
        }

        // Geocode if no coords but has address
        if ((!lat || !lng || isNaN(lat) || isNaN(lng)) && p.location && typeof p.location === "string" && p.location.length > 2) {
          try {
            // Rate limit: 1 req/sec for Nominatim
            if (idx > 0) await new Promise(r => setTimeout(r, idx * 1100));
            const res = await fetch(`${NOMINATIM_URL}?format=json&q=${encodeURIComponent(p.location)}&limit=1`);
            const data = await res.json();
            if (data[0]) {
              lat = parseFloat(data[0].lat);
              lng = parseFloat(data[0].lon);
            }
          } catch { /* silent */ }
        }

        // Final fallback — no valid location at all
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
          lat = null;
          lng = null;
        }

        return { ...p, lat, lng };
      }));

      setGeocodedProjects(results);
    };

    geocodeAll();
  }, [projects]);

  // Render map
  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined" || geocodedProjects.length === 0) return;

    const loadMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      const projectsWithCoords = geocodedProjects.filter(p => p.lat && p.lng);

      if (!mapInstanceRef.current) {
        const defaultCenter = projectsWithCoords.length > 0
          ? [projectsWithCoords[0].lat, projectsWithCoords[0].lng]
          : [39.8283, -98.5795]; // Center of US

        mapInstanceRef.current = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
          attributionControl: false,
        }).setView(defaultCenter, projectsWithCoords.length > 0 ? 12 : 4);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);
      }

      const map = mapInstanceRef.current;

      // Clear existing markers
      markersRef.current.forEach(m => map.removeLayer(m));
      markersRef.current = [];

      if (projectsWithCoords.length === 0) return;

      // Add markers
      projectsWithCoords.forEach(p => {
        const color = STATUS_COLORS[p.status] || STATUS_COLORS.pending;
        const isSelected = p._id === selected;

        const icon = L.divIcon({
          html: `<div style="
            width: ${isSelected ? "18px" : "14px"};
            height: ${isSelected ? "18px" : "14px"};
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ${isSelected ? "animation: mapPulse 1.5s infinite;" : ""}
          "></div>`,
          className: "",
          iconSize: [isSelected ? 18 : 14, isSelected ? 18 : 14],
          iconAnchor: [isSelected ? 9 : 7, isSelected ? 9 : 7],
        });

        const marker = L.marker([p.lat, p.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: system-ui; min-width: 160px;">
              <p style="font-weight: 600; margin: 0 0 4px 0; font-size: 13px;">${p.name || "Project"}</p>
              <p style="color: #6b7280; margin: 0; font-size: 11px;">${p.location || "No location"}</p>
              <p style="margin: 6px 0 0 0;">
                <span style="background: ${color}; color: white; font-size: 10px; padding: 2px 8px; border-radius: 12px;">
                  ${p.status || "pending"}
                </span>
              </p>
            </div>
          `);

        marker.on("click", () => {
          if (onSelectProject) onSelectProject(p._id);
        });

        if (isSelected) marker.openPopup();
        markersRef.current.push(marker);
      });

      // Fit bounds
      if (projectsWithCoords.length > 0) {
        const bounds = L.latLngBounds(projectsWithCoords.map(p => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
      }
    };

    loadMap();
  }, [geocodedProjects, selected, onSelectProject]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const projectsWithCoords = geocodedProjects.filter(p => p.lat && p.lng);
  const projectsWithoutCoords = geocodedProjects.filter(p => !p.lat || !p.lng);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200" style={{ zIndex: 0 }}>
      <div ref={mapRef} style={{ height, width: "100%" }} />
      {/* Info overlay */}
      {projectsWithCoords.length > 0 && (
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 text-xs text-emerald-700 px-2.5 py-1 rounded-lg shadow z-[5]">
          <Navigation className="w-3 h-3" />
          {projectsWithCoords.filter(p => p.status === "in-progress").length > 0
            ? "Team is on-site"
            : `${projectsWithCoords.length} project${projectsWithCoords.length > 1 ? "s" : ""}`}
        </div>
      )}
      {/* Warning for projects without coordinates */}
      {projectsWithoutCoords.length > 0 && (
        <div className="absolute top-3 right-3 bg-amber-50 text-amber-700 text-[10px] px-2 py-1 rounded-lg border border-amber-200 z-[5]">
          {projectsWithoutCoords.length} project{projectsWithoutCoords.length > 1 ? "s" : ""} without location
        </div>
      )}
      <style jsx global>{`
        @keyframes mapPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        .leaflet-pane { z-index: 1 !important; }
        .leaflet-top, .leaflet-bottom { z-index: 2 !important; }
        .leaflet-popup-pane { z-index: 3 !important; }
      `}</style>
    </div>
  );
});

export default ProjectMap;
