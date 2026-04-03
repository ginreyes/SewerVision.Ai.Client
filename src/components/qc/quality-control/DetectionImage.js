"use client";

import React, { memo } from "react";
import { Eye, Image as ImageIcon } from "lucide-react";

const DetectionImage = memo(({ detection, label, colorClass }) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const imageUrl = detection?.images?.[0]?.url
    ? `${backendUrl}/api/videos/snapshot/${detection.images[0].url}`
    : null;

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
          <img src={imageUrl} alt={label} className="w-full h-full object-contain" />
        ) : (
          <div className="text-center opacity-40">
            <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-400">No image available</p>
          </div>
        )}
        {detection && imageUrl && (
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
