"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./UserContext";

const UploadServiceWorkerContext = createContext({
  ready: false,
  error: null,
  registration: null,
});

export function UploadServiceWorkerProvider({ children }) {
  const { userData } = useUser();
  const [state, setState] = useState({ ready: false, error: null, registration: null });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (userData?.role !== "operator") return;

    let cancelled = false;

    navigator.serviceWorker
      .register("/sw-uploads.js", { scope: "/api/uploads/" })
      .then((registration) => {
        if (cancelled) return;
        setState({ ready: true, error: null, registration });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({ ready: false, error, registration: null });
      });

    return () => {
      cancelled = true;
    };
  }, [userData?.role]);

  return (
    <UploadServiceWorkerContext.Provider value={state}>
      {children}
    </UploadServiceWorkerContext.Provider>
  );
}

export function useUploadServiceWorker() {
  return useContext(UploadServiceWorkerContext);
}
