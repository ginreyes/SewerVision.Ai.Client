"use client";

import React, { useEffect, useState } from "react";

/**
 * FadeIn — lightweight CSS-only fade + slight-rise transition. Used after
 * a skeleton is swapped out so the real content doesn't pop in harshly.
 *
 * No framer-motion dependency — just Tailwind transitions triggered by a
 * state flip on mount. Duration defaults to 200ms which is short enough to
 * feel instant but long enough to register as a transition.
 */
export default function FadeIn({
  children,
  duration = 200,
  translateY = 4,
  className = "",
  delay = 0,
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      delay > 0 ? setTimeout(() => setShown(true), delay) : setShown(true)
    );
    return () => cancelAnimationFrame(id);
  }, [delay]);

  return (
    <div
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : `translateY(${translateY}px)`,
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
