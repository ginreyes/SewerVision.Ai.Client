"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Upload } from "lucide-react";

// July 2 — drag-drop visual affordance over the chat drawer. The actual
// upload path already exists (uploadAttachment); this just adds the visible
// drop zone so the user discovers the feature.
//
// Props:
//   containerRef: ref to the chat drawer DOM node (drop only fires inside it)
//   onDrop(files): caller wires up the existing upload path

export default function DropOverlay({ containerRef, onDrop }) {
  const [active, setActive] = useState(false);
  const [counter, setCounter] = useState(0);

  const onEnter = useCallback((e) => {
    if (!e.dataTransfer?.types?.includes("Files")) return;
    e.preventDefault();
    setCounter((c) => c + 1);
    setActive(true);
  }, []);

  const onLeave = useCallback(() => {
    setCounter((c) => {
      const next = Math.max(0, c - 1);
      if (next === 0) setActive(false);
      return next;
    });
  }, []);

  const onOver = useCallback((e) => {
    if (!e.dataTransfer?.types?.includes("Files")) return;
    e.preventDefault();
  }, []);

  const onDropFn = useCallback(
    (e) => {
      e.preventDefault();
      setActive(false);
      setCounter(0);
      const files = Array.from(e.dataTransfer?.files || []);
      if (files.length > 0) onDrop?.(files);
    },
    [onDrop],
  );

  useEffect(() => {
    const node = containerRef?.current;
    if (!node) return undefined;
    node.addEventListener("dragenter", onEnter);
    node.addEventListener("dragleave", onLeave);
    node.addEventListener("dragover", onOver);
    node.addEventListener("drop", onDropFn);
    return () => {
      node.removeEventListener("dragenter", onEnter);
      node.removeEventListener("dragleave", onLeave);
      node.removeEventListener("dragover", onOver);
      node.removeEventListener("drop", onDropFn);
    };
  }, [containerRef, onEnter, onLeave, onOver, onDropFn]);

  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-indigo-500/15 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-indigo-500 bg-white px-6 py-4 shadow-lg">
        <Upload size={28} className="text-indigo-600" />
        <div className="text-sm font-medium text-indigo-700">Drop to attach</div>
      </div>
    </div>
  );
}
