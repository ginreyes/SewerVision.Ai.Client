"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// July 7 — perf telemetry. Records the wall-clock between pathname change
// and next render so we can see whether the module-switching work is
// paying off in real user metrics.
//
// Writes to sessionStorage so a full session shows the histogram. Exposed
// via window.__moduleSwitchMetrics for a bookmarklet or devtools poke.

const KEY = "xmodswitch";
const MAX_ROWS = 200;

function push(row) {
  try {
    const raw = sessionStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(row);
    while (arr.length > MAX_ROWS) arr.shift();
    sessionStorage.setItem(KEY, JSON.stringify(arr));
    if (typeof window !== "undefined") {
      window.__moduleSwitchMetrics = arr;
    }
  } catch {
    // storage full / private mode — telemetry is best-effort
  }
}

export default function ModuleTransition() {
  const pathname = usePathname();
  const prev = useRef(pathname);
  const start = useRef(typeof performance !== "undefined" ? performance.now() : 0);

  useEffect(() => {
    if (prev.current !== pathname) {
      const now = typeof performance !== "undefined" ? performance.now() : 0;
      push({
        from: prev.current,
        to: pathname,
        ms: Math.round(now - start.current),
        at: new Date().toISOString(),
      });
      prev.current = pathname;
      start.current = now;
    }
  }, [pathname]);

  return null;
}
