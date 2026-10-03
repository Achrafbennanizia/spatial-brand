"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type BootContextValue = {
  ready: boolean;
  progress: number;
  setProgress: (n: number) => void;
  markReady: () => void;
};

const BootContext = createContext<BootContextValue | null>(null);

export function useBoot() {
  const ctx = useContext(BootContext);
  if (!ctx) throw new Error("useBoot must be used within BootProvider");
  return ctx;
}

export function BootProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [progress, setProgressState] = useState(8);

  const setProgress = useCallback((n: number) => {
    setProgressState((p) => Math.max(p, Math.min(100, n)));
  }, []);

  const markReady = useCallback(() => {
    setProgressState(100);
    // Short hold so the bar reads as complete before fade
    window.setTimeout(() => setReady(true), 320);
  }, []);

  const value = useMemo(
    () => ({ ready, progress, setProgress, markReady }),
    [ready, progress, setProgress, markReady],
  );

  return <BootContext.Provider value={value}>{children}</BootContext.Provider>;
}
