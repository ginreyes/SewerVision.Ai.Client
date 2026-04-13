"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import dynamic from "next/dynamic";
import { MapPin, Search, Loader2, X, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/**
 * LocationPicker — Address search with geocoding + interactive Leaflet map.
 * User can type an address (Nominatim geocodes it) or click on the map.
 *
 * Props:
 *   location: string — current address text
 *   latitude: number | null
 *   longitude: number | null
 *   onLocationChange: (location, lat, lng) => void
 *   height: number (map height, default 200)
 */
const LocationPicker = memo(function LocationPicker({
  location = "",
  latitude = null,
  longitude = null,
  onLocationChange,
  height = 200,
}) {
  const [query, setQuery] = useState(location);
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced search
  const searchAddress = useCallback(async (q) => {
    if (!q || q.length < 3) { setSuggestions([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`${NOMINATIM_URL}?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=us`);
      const data = await res.json();
      setSuggestions(data.map(d => ({
        display: d.display_name,
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lon),
        short: d.display_name.split(",").slice(0, 3).join(","),
      })));
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleInputChange = useCallback((e) => {
    const val = e.target.value;
    setQuery(val);
    onLocationChange?.(val, latitude, longitude);

    // Debounce geocoding search
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddress(val), 400);
  }, [searchAddress, onLocationChange, latitude, longitude]);

  const handleSelectSuggestion = useCallback((suggestion) => {
    setQuery(suggestion.short);
    setSuggestions([]);
    onLocationChange?.(suggestion.short, suggestion.lat, suggestion.lng);

    // Update map marker
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([suggestion.lat, suggestion.lng]);
      mapInstanceRef.current.setView([suggestion.lat, suggestion.lng], 14);
    }
    setShowMap(true);
  }, [onLocationChange]);

  const handleClearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  // Initialize map when showMap is true
  useEffect(() => {
    if (!showMap || !mapRef.current || typeof window === "undefined") return;

    const loadMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!mapInstanceRef.current) {
        const defaultLat = latitude || 34.0522;
        const defaultLng = longitude || -118.2437;

        mapInstanceRef.current = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
        }).setView([defaultLat, defaultLng], latitude ? 14 : 10);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);

        // Add draggable marker
        markerRef.current = L.marker([defaultLat, defaultLng], {
          draggable: true,
        }).addTo(mapInstanceRef.current);

        // On marker drag end — reverse geocode
        markerRef.current.on("dragend", async (e) => {
          const pos = e.target.getLatLng();
          onLocationChange?.(query, pos.lat, pos.lng);

          // Reverse geocode
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`);
            const data = await res.json();
            if (data.display_name) {
              const short = data.display_name.split(",").slice(0, 3).join(",");
              setQuery(short);
              onLocationChange?.(short, pos.lat, pos.lng);
            }
          } catch {}
        });

        // On map click — move marker
        mapInstanceRef.current.on("click", async (e) => {
          const { lat, lng } = e.latlng;
          markerRef.current.setLatLng([lat, lng]);
          onLocationChange?.(query, lat, lng);

          // Reverse geocode
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data.display_name) {
              const short = data.display_name.split(",").slice(0, 3).join(",");
              setQuery(short);
              onLocationChange?.(short, lat, lng);
            }
          } catch {}
        });
      } else if (latitude && longitude) {
        mapInstanceRef.current.setView([latitude, longitude], 14);
        markerRef.current.setLatLng([latitude, longitude]);
      }
    };

    loadMap();
  }, [showMap, latitude, longitude]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-2">
      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={query}
            onChange={handleInputChange}
            onFocus={() => { if (!showMap && (latitude || longitude)) setShowMap(true); }}
            placeholder="Type an address to search..."
            className="pl-9 pr-20 h-10"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searching && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
            {!showMap ? (
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1 text-indigo-600"
                onClick={() => setShowMap(true)}>
                <Navigation className="w-3 h-3" />Map
              </Button>
            ) : (
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-gray-400"
                onClick={() => setShowMap(false)}>
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#18181b] border border-gray-200 dark:border-[#27272a] rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button key={i} type="button" onClick={() => handleSelectSuggestion(s)}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-indigo-50 dark:hover:bg-[#27272a] transition-colors flex items-start gap-2 border-b border-gray-50 dark:border-[#1e1e22] last:border-0">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-[#fafafa] truncate">{s.short}</p>
                  <p className="text-[10px] text-gray-400 dark:text-[#71717a] truncate">{s.display}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Coordinates display */}
      {latitude && longitude && (
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <Navigation className="w-3 h-3 text-indigo-400" />
          <span>Lat: {latitude.toFixed(6)}</span>
          <span>Lng: {longitude.toFixed(6)}</span>
        </div>
      )}

      {/* Map */}
      {showMap && (
        <div className="rounded-xl overflow-hidden border border-gray-200" style={{ zIndex: 0 }}>
          <div ref={mapRef} style={{ height, width: "100%" }} />
          <p className="text-[10px] text-gray-400 text-center py-1 bg-gray-50">
            Click on the map or drag the marker to set location
          </p>
          <style jsx global>{`
            .leaflet-pane { z-index: 1 !important; }
            .leaflet-top, .leaflet-bottom { z-index: 2 !important; }
            .leaflet-popup-pane { z-index: 3 !important; }
          `}</style>
        </div>
      )}
    </div>
  );
});

export default LocationPicker;
