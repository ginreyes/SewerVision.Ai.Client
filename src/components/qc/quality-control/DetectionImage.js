"use client";

import React, { memo } from "react";
import { Eye, Image as ImageIcon } from "lucide-react";
import { getSnapshotUrl } from "@/lib/getVideoUrl";

const DetectionImage = memo(({ detection, label, colorClass, showOverlay = true }) => {
  // Prefer a frame explicitly tagged as 'original'/'raw' if the backend ever stores one;
  // otherwise fall back to the single stored snapshot.
  const rawImage = showOverlay
    ? (detection?.images?.find(i => i?.type === "annotated") || detection?.images?.[0])
    : (detection?.images?.find(i => i?.type === "original" || i?.type === "raw") || detection?.images?.[0]);
  const imageUrl = rawImage?.url
    ? getSnapshotUrl(rawImage.url)
    : null;

  // Bounding box is only drawn on the AI Detection side.
  const bbox = showOverlay ? detection?.boundingBox : null;
  const hasBBox = bbox && (bbox.width || bbox.height);

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
        <Eye className={`w-3.5 h-3.5 ${colorClass}`} />{label}
      </p>
      <div
        className={`relative rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center ${imageUrl ? "bg-gray-900" : "bg-gray-50"}`}
        style={{ height: 280 }}
      >
        {imageUrl ? (
          <>
            <img src={imageUrl} alt={label} className="w-full h-full object-contain" />
            {hasBBox && (
              <div
                className="absolute border-2 border-amber-400 pointer-events-none rounded-sm shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
                style={{
                  left: `${(bbox.x || 0) * 100}%`,
                  top: `${(bbox.y || 0) * 100}%`,
                  width: `${(bbox.width || 0) * 100}%`,
                  height: `${(bbox.height || 0) * 100}%`,
                }}
              />
            )}
          </>
        ) : (
          <div className="text-center opacity-40">
            <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-400">No image available</p>
          </div>
        )}
        {detection && imageUrl && showOverlay && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg">
            {detection.type || "Detection"} · {detection.confidence != null ? (detection.confidence <= 1 ? Math.round(detection.confidence * 100) : Math.round(detection.confidence)) : 0}%
          </div>
        )}
      </div>
    </div>
  );
});

DetectionImage.displayName = "DetectionImage";
export default DetectionImage;
