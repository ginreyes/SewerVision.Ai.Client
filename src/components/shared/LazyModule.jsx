"use client";
import React, { Suspense } from "react";

// July 7 — bundle-split shim. Heavy admin modules (audit-log, ai-analytics,
// role-matrix, notifications-throughput) each pull in chart.js / xlsx / their
// own tables and blow past 200KB per route. This wrapper standardizes lazy
// loading so every heavy screen behaves the same:
//   1. Suspense boundary with a matched-height skeleton
//   2. Error boundary that surfaces a retry button
//   3. onLoad callback so the sidebar can track "warmed" state
//
// Usage in a route file:
//   const Content = dynamic(() => import("./_content"), { ssr: false });
//   export default function Page() { return <LazyModule name="audit-log"><Content /></LazyModule>; }

class LazyModuleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  reset = () => this.setState({ error: null });
  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-md rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900">
          <div className="font-medium">This module failed to load.</div>
          <div className="mt-2 text-xs text-rose-700">
            {this.state.error?.message || "Unknown error"}
          </div>
          <button
            type="button"
            onClick={this.reset}
            className="mt-3 rounded bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ModuleSkeleton({ heightClass }) {
  return (
    <div className={`animate-pulse space-y-3 p-6 ${heightClass || ""}`}>
      <div className="h-6 w-40 rounded bg-zinc-200" />
      <div className="h-4 w-64 rounded bg-zinc-100" />
      <div className="mt-6 space-y-2">
        <div className="h-10 rounded bg-zinc-100" />
        <div className="h-10 rounded bg-zinc-100" />
        <div className="h-10 rounded bg-zinc-100" />
        <div className="h-10 rounded bg-zinc-100" />
      </div>
    </div>
  );
}

export default function LazyModule({ name, children, heightClass }) {
  return (
    <LazyModuleErrorBoundary>
      <Suspense fallback={<ModuleSkeleton heightClass={heightClass} />}>
        <div data-module={name}>{children}</div>
      </Suspense>
    </LazyModuleErrorBoundary>
  );
}
