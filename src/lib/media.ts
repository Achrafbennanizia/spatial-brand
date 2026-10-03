"use client";

import { useSyncExternalStore } from "react";

/** True below the md breakpoint (768px). SSR/hydration always false. */
export function useIsMobile(breakpoint = 768) {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches,
    () => false,
  );
}
