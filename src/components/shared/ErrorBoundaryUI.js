"use client";

import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shared error boundary UI — shown when a page crashes.
 * Used by each role's error.js file.
 */
export default function ErrorBoundaryUI({ error, reset, rolePath = "/" }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 mb-6">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset} className="gap-1.5">
            <RefreshCw className="w-4 h-4" /> Try Again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = rolePath} className="gap-1.5">
            <Home className="w-4 h-4" /> Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
