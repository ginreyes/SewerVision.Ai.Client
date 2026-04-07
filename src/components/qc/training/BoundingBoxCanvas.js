"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const COLORS = {
  user: "rgba(239, 68, 68, 0.7)",      // red
  correct: "rgba(16, 185, 129, 0.7)",   // green
  missed: "rgba(251, 191, 36, 0.7)",    // amber
  ground: "rgba(59, 130, 246, 0.5)",    // blue
};

export default function BoundingBoxCanvas({
  imageUrl,
  boxes = [],
  groundTruth = [],
  matchedIndices = [],
  showGroundTruth = false,
  onBoxDrawn,
  editable = true,
  width = 640,
  height = 400,
}) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [currentPos, setCurrentPos] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Load image
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { imgRef.current = img; setImgLoaded(true); };
    img.src = imageUrl;
  }, [imageUrl]);

  // Draw everything
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    if (img) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw ground truth (after submit)
    if (showGroundTruth && groundTruth.length > 0) {
      groundTruth.forEach((gt, i) => {
        const bb = gt.boundingBox;
        const matched = matchedIndices.includes(i);
        ctx.strokeStyle = matched ? COLORS.correct : COLORS.missed;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.strokeRect(bb.x, bb.y, bb.width, bb.height);
        ctx.setLineDash([]);

        // Label
        ctx.font = "bold 11px sans-serif";
        ctx.fillStyle = matched ? COLORS.correct : COLORS.missed;
        ctx.fillText(`${gt.pacpCode} (${matched ? "Found" : "Missed"})`, bb.x, bb.y - 4);
      });
    }

    // Draw user boxes
    boxes.forEach((box, i) => {
      const bb = box.boundingBox;
      const isMatched = showGroundTruth && matchedIndices.includes(i);
      ctx.strokeStyle = isMatched ? COLORS.correct : COLORS.user;
      ctx.lineWidth = 2;
      ctx.strokeRect(bb.x, bb.y, bb.width, bb.height);

      // Label
      ctx.font = "bold 11px sans-serif";
      ctx.fillStyle = isMatched ? COLORS.correct : COLORS.user;
      ctx.fillText(box.pacpCode || `Mark ${i + 1}`, bb.x, bb.y - 4);
    });

    // Draw current drag rectangle
    if (drawing && startPos && currentPos) {
      ctx.strokeStyle = COLORS.user;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      const x = Math.min(startPos.x, currentPos.x);
      const y = Math.min(startPos.y, currentPos.y);
      const w = Math.abs(currentPos.x - startPos.x);
      const h = Math.abs(currentPos.y - startPos.y);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
    }
  }, [boxes, groundTruth, matchedIndices, showGroundTruth, drawing, startPos, currentPos, imgLoaded]);

  useEffect(() => { draw(); }, [draw]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.round((e.clientX - rect.left) * (canvas.width / rect.width)),
      y: Math.round((e.clientY - rect.top) * (canvas.height / rect.height)),
    };
  };

  const handleMouseDown = (e) => {
    if (!editable) return;
    setDrawing(true);
    setStartPos(getPos(e));
  };

  const handleMouseMove = (e) => {
    if (!drawing) return;
    setCurrentPos(getPos(e));
  };

  const handleMouseUp = () => {
    if (!drawing || !startPos || !currentPos) { setDrawing(false); return; }
    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const w = Math.abs(currentPos.x - startPos.x);
    const h = Math.abs(currentPos.y - startPos.y);

    if (w > 10 && h > 10) {
      onBoxDrawn?.({ x, y, width: w, height: h });
    }

    setDrawing(false);
    setStartPos(null);
    setCurrentPos(null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full rounded-lg border border-gray-200 cursor-crosshair"
      style={{ aspectRatio: `${width}/${height}` }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}
