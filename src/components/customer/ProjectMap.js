"use client";

import React, { useEffect, useRef, memo, useMemo } from "react";
import { MapPin, Navigation } from "lucide-react";

const STATUS_COLORS = {
  "in-progress": "#3b82f6", // blue
  completed: "#10b981",     // emerald
  pending: "#9ca3af",       // gray
};

/**
 * ProjectMap — Leaflet + OpenStreetMap map component.
 * Dynamically loaded (no SSR) since Leaflet requires window/document.
 * Shows project markers with status-colored pins.
 */
const ProjectMap = memo(function ProjectMap({ projects = [], selected, onSelectProject, height = 220 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Parse coordinates from location string or use defaults
  const projectsWithCoords = useMemo(() => {
    return projects.map(p => {
      let lat = null, lng = null;

      // Try to extract coordinates from location field
      if (p.latitude && p.longitude) {
        lat = parseFloat(p.latitude);
        lng = parseFloat(p.longitude);
      } else if (p.coordinates) {
        lat = p.coordinates.lat || p.coordinates[0];
        lng = p.coordinates.lng || p.coordinates[1];
      } else if (p.location && typeof p.location === 'string') {
        // Try to parse "lat,lng" format
        const match = p.location.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
        if (match) {
          lat = parseFloat(match[1]);
          lng = parseFloat(match[2]);
        }
      }

      // If no valid coords, assign a spread position based on index
      // This gives a visual spread for demo purposes
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        // Default to a US location with slight offsets per project
        const idx = projects.indexOf(p);
        lat = 34.0522 + (idx * 0.015);
        lng = -118.2437 + (idx * 0.02);
      }

      return { ...p, lat, lng };
    });
  }, [projects]);

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;

    // Dynamically import Leaflet (avoid SSR)
    const loadMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      // Only create map once
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
          attributionControl: false,
        }).setView([34.0522, -118.2437], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
            width: ${isSelected ? '18px' : '14px'};
            height: ${isSelected ? '18px' : '14px'};
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ${isSelected ? 'animation: pulse 1.5s infinite;' : ''}
          "></div>`,
          className: '',
          iconSize: [isSelected ? 18 : 14, isSelected ? 18 : 14],
          iconAnchor: [isSelected ? 9 : 7, isSelected ? 9 : 7],
        });

        const marker = L.marker([p.lat, p.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: system-ui; min-width: 160px;">
              <p style="font-weight: 600; margin: 0 0 4px 0; font-size: 13px;">${p.name || 'Project'}</p>
              <p style="color: #6b7280; margin: 0; font-size: 11px;">${p.location || 'No location'}</p>
              <p style="margin: 6px 0 0 0;">
                <span style="background: ${color}; color: white; font-size: 10px; padding: 2px 8px; border-radius: 12px;">
                  ${p.status || 'pending'}
                </span>
              </p>
            </div>
          `);

        marker.on('click', () => {
          if (onSelectProject) onSelectProject(p._id);
        });

        if (isSelected) {
          marker.openPopup();
        }

        markersRef.current.push(marker);
      });

      // Fit bounds to all markers
      if (projectsWithCoords.length > 0) {
        const bounds = L.latLngBounds(projectsWithCoords.map(p => [p.lat, p.lng]));
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
      }
    };

    loadMap();
  }, [projectsWithCoords, selected, onSelectProject]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200" style={{ zIndex: 0 }}>
      <div ref={mapRef} style={{ height, width: '100%' }} />
      {/* Overlay info */}
      {projectsWithCoords.length > 0 && (
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 text-xs text-emerald-700 px-2.5 py-1 rounded-lg shadow z-[5]">
          <Navigation className="w-3 h-3" />
          {projectsWithCoords.filter(p => p.status === 'in-progress').length > 0
            ? 'Team is on-site'
            : `${projectsWithCoords.length} project${projectsWithCoords.length > 1 ? 's' : ''}`}
        </div>
      )}
      {/* CSS for pulse animation */}
      <style jsx global>{`
        @keyframes pulse {
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
