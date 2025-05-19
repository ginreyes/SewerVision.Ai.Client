"use client";

import React, { createContext, useContext, useState } from "react";

const LoadingOverlayContext = createContext();

export function LoadingOverlayProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  return (
    <LoadingOverlayContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {isLoading && <LoadingOverlay />}
    </LoadingOverlayContext.Provider>
  );
}

export function useLoadingOverlay() {
  const context = useContext(LoadingOverlayContext);
  if (!context) {
    throw new Error("useLoadingOverlay must be used within a LoadingOverlayProvider");
  }
  return context;
}

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="animate-spin-slow">
        {/* Your custom animated SVG goes here */}
        <AnimatedSVG />
      </div>
    </div>
  );
}
