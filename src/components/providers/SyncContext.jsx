'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { uploadsApi } from '@/data/uploadsApi';

/**
 * Tracks the currently-active storage migration job across the whole app.
 *
 * The job itself lives on the backend (migrationService), so on page reload we
 * re-discover it by calling /migrate/list and grabbing the newest non-terminal
 * job. That way the bubble survives refresh, navigation, or closing the modal.
 */
const SyncContext = createContext(null);

const STORAGE_KEY = 'sewervision:activeMigrationJobId';

export function SyncProvider({ children, enabled = false }) {
  const [activeJobId, setActiveJobIdState] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // Persist the tracked jobId so navigation within SPA doesn't lose context.
  const setActiveJobId = useCallback((id) => {
    setActiveJobIdState(id);
    try {
      if (id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage may be unavailable (SSR / private mode) — non-fatal
    }
  }, []);

  // On mount: hydrate from localStorage, then verify against backend.
  // If the persisted job is already terminal, clear it.
  useEffect(() => {
    if (!enabled) {
      setHydrated(true);
      return;
    }

    let cancelled = false;

    const hydrate = async () => {
      let candidateId = null;
      try {
        candidateId = localStorage.getItem(STORAGE_KEY);
      } catch {
        // ignore
      }

      // If nothing persisted, still poll the backend in case the user left the job
      // running from another device/tab.
      try {
        const jobs = await uploadsApi.listMigrations();
        if (cancelled) return;

        const active = Array.isArray(jobs)
          ? jobs.find((j) => j.state === 'running' || j.state === 'queued')
          : null;

        if (active) {
          setActiveJobIdState(active.id);
          try { localStorage.setItem(STORAGE_KEY, active.id); } catch {}
        } else if (candidateId) {
          // Persisted id exists but no active job on server → clean up.
          try { localStorage.removeItem(STORAGE_KEY); } catch {}
          setActiveJobIdState(null);
        }
      } catch {
        // Network/API failure — fall back to the persisted id if we have one.
        // The bubble will poll and self-correct once the user is online.
        if (candidateId && !cancelled) {
          setActiveJobIdState(candidateId);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    };

    hydrate();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const value = {
    activeJobId,
    setActiveJobId,
    clearActiveJob: () => setActiveJobId(null),
    enabled,
    hydrated,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSyncContext() {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    // Safe fallback when provider isn't mounted (e.g. login page).
    // Consumers check .enabled before acting.
    return { activeJobId: null, setActiveJobId: () => {}, clearActiveJob: () => {}, enabled: false, hydrated: true };
  }
  return ctx;
}
