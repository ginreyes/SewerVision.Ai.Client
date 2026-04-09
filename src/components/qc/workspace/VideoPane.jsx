"use client";

/**
 * VideoPane
 * ─────────
 * Self-contained video player for the QC Review Workspace's "Video" view mode.
 * Extracted from the old /qc-technician/project/[id] page so the Workspace can
 * present the video without bouncing through a second route.
 *
 * Responsibilities
 *  - Render the HTML5 <video> element, overlay, and bespoke controls
 *  - Handle play/pause, seek, fullscreen, error fallback to a sample clip
 *  - Seek the player to `selectedDetection.timestamp` whenever the parent
 *    changes the selection (so clicking a detection in the queue jumps to it)
 *  - Surface the current playback time back to the parent via `onTimeChange`,
 *    so the manual-detection form can anchor new detections to the current
 *    frame regardless of view mode
 *
 * Props
 *  - videoUrl            string | null    full URL of the source video
 *  - selectedDetection   object | null    currently selected detection
 *  - onTimeChange        (t: number) => void  fires on every timeupdate
 *  - onRetry             () => void       "Retry" click when no video available
 *  - className           string           extra classes on the outer wrapper
 *
 * Keeps the exact visual style of the old project console so there is no
 * regression for QC techs who are used to it.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  Play, Pause, Maximize, Minimize2, Rewind, SkipBack, SkipForward,
  FastForward, FileVideo, RefreshCw,
} from "lucide-react";
import { SAMPLE_VIDEO, formatTime } from "@/components/qc/constants";

export default function VideoPane({
  videoUrl,
  selectedDetection,
  onTimeChange,
  onRetry,
  className = "",
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [usingFallbackVideo, setUsingFallbackVideo] = useState(false);
  const [videoLoadFailed, setVideoLoadFailed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reset failure state when the video URL changes (new project picked)
  useEffect(() => {
    setUsingFallbackVideo(false);
    setVideoLoadFailed(false);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, [videoUrl]);

  // Seek whenever the parent selects a new detection
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !selectedDetection || selectedDetection.timestamp == null) return;
    // Guard: only seek once metadata is loaded (duration > 0)
    const seekTo = Math.max(0, Number(selectedDetection.timestamp) || 0);
    if (v.readyState >= 1) {
      try { v.currentTime = seekTo; } catch { /* ignore */ }
      setCurrentTime(seekTo);
    } else {
      const onMeta = () => {
        try { v.currentTime = seekTo; } catch { /* ignore */ }
        setCurrentTime(seekTo);
        v.removeEventListener("loadedmetadata", onMeta);
      };
      v.addEventListener("loadedmetadata", onMeta);
      return () => v.removeEventListener("loadedmetadata", onMeta);
    }
  }, [selectedDetection?._id, selectedDetection?.timestamp]);

  // Fullscreen lifecycle
  useEffect(() => {
    const onFs = () => { if (!document.fullscreenElement) setIsFullscreen(false); };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused || v.ended) {
      v.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    setDuration(v.duration || 0);
    onTimeChange?.(v.currentTime);
  };

  const handleVideoError = () => {
    if (!usingFallbackVideo) {
      setUsingFallbackVideo(true);
    } else {
      setVideoLoadFailed(true);
    }
  };

  const onSeekClick = (e) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const newTime = pct * duration;
    v.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const skip = (delta) => {
    const v = videoRef.current;
    if (!v) return;
    const next = Math.max(0, Math.min((v.currentTime || 0) + delta, duration || Number.MAX_SAFE_INTEGER));
    v.currentTime = next;
    setCurrentTime(next);
  };

  const displayUrl = videoLoadFailed ? null : (usingFallbackVideo ? SAMPLE_VIDEO : videoUrl);

  return (
    <div className={`flex flex-col gap-0 ${className}`}>
      {/* Video player */}
      <div
        ref={containerRef}
        className="relative aspect-video bg-gradient-to-br from-gray-900 to-black rounded-t-2xl overflow-hidden flex flex-col shadow-xl border border-gray-800/50"
      >
        {displayUrl ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src={displayUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
              onError={handleVideoError}
              onEnded={() => setIsPlaying(false)}
              playsInline
              crossOrigin="anonymous"
              controls={false}
            />

            {usingFallbackVideo && (
              <div className="absolute top-3 right-3 bg-orange-500/90 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                Test Signal
              </div>
            )}

            {/* Bounding box overlay when a detection is selected */}
            {selectedDetection && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="border border-yellow-400/80 bg-yellow-400/10 w-40 h-40 rounded relative shadow-[0_0_12px_rgba(250,204,21,0.25)]">
                  <div className="absolute -top-2 left-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded">
                    {selectedDetection.type || "Detection"}
                  </div>
                </div>
              </div>
            )}

            {/* Click anywhere to play */}
            <div className="absolute inset-0 cursor-pointer z-10" onClick={togglePlay} aria-hidden="true">
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center hover:scale-105 transition-transform">
                    <Play className="w-6 h-6 text-white fill-current" />
                  </div>
                </div>
              )}
            </div>

            {/* In-video control strip */}
            <div
              className="absolute bottom-2 left-0 right-0 px-4 flex items-center space-x-4 bg-black/50 py-2 rounded z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" onClick={togglePlay} className="text-white hover:text-amber-300 transition-colors">
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <div className="flex-1 h-1 bg-gray-600 rounded cursor-pointer" onClick={onSeekClick} style={{ position: "relative" }}>
                <div className="h-1 bg-red-600 rounded" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
              </div>
              <div className="text-white text-sm font-mono tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              <button type="button" onClick={toggleFullscreen} className="text-white hover:text-amber-300 transition-colors">
                {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
              </button>
            </div>
          </>
        ) : (
          <div className="text-white text-lg font-semibold flex flex-col items-center justify-center h-full gap-2">
            <FileVideo className="w-12 h-12 text-gray-400" />
            <span>No video available</span>
            {onRetry && (
              <button
                type="button"
                onClick={() => {
                  setUsingFallbackVideo(false);
                  setVideoLoadFailed(false);
                  onRetry();
                }}
                className="text-sm text-amber-300 hover:text-amber-200 flex items-center gap-1.5 mt-1"
              >
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
            )}
          </div>
        )}
      </div>

      {/* Secondary control strip below the player (matches old project console) */}
      <div className="bg-white border border-t-0 border-gray-200 rounded-b-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-gray-700 font-mono tabular-nums">{formatTime(currentTime)}</div>
          <div className="flex items-center space-x-2">
            <button type="button" onClick={() => skip(-10)} className="p-1 hover:bg-gray-100 rounded" aria-label="Rewind 10s" title="Rewind 10s">
              <Rewind className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => skip(-5)} className="p-1 hover:bg-gray-100 rounded" aria-label="Back 5s" title="Back 5s">
              <SkipBack className="h-4 w-4" />
            </button>
            <button type="button" onClick={togglePlay} className="p-1 hover:bg-gray-100 rounded">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => skip(5)} className="p-1 hover:bg-gray-100 rounded" aria-label="Forward 5s" title="Forward 5s">
              <SkipForward className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => skip(10)} className="p-1 hover:bg-gray-100 rounded" aria-label="Fast forward 10s" title="Fast forward 10s">
              <FastForward className="h-4 w-4" />
            </button>
            <button type="button" onClick={toggleFullscreen} className="p-1 hover:bg-gray-100 rounded" aria-label="Fullscreen">
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 cursor-pointer" onClick={onSeekClick}>
          <div
            className="bg-red-600 h-2 rounded-full transition-all"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}
