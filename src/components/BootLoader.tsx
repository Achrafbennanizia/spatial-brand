"use client";

import { AnimatePresence, motion } from "motion/react";

type Props = {
  ready: boolean;
  progress: number;
};

/** Full-viewport boot screen until the 3D world is ready. */
export function BootLoader({ ready, progress }: Props) {
  const pct = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <AnimatePresence>
      {!ready && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-void"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          aria-busy="true"
          aria-live="polite"
          role="status"
        >
          <p className="display text-xs tracking-[0.32em] text-foam sm:text-sm">
            DIXOR
          </p>
          <p className="mt-3 text-[10px] tracking-[0.28em] text-muted uppercase">
            Loading the studio
          </p>

          <div className="mt-10 w-[min(240px,70vw)]">
            <div className="h-px w-full overflow-hidden bg-line">
              <motion.div
                className="h-full bg-signal"
                initial={{ width: "0%" }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.25, ease: "linear" }}
              />
            </div>
            <p className="mt-3 text-center font-mono text-[11px] tracking-[0.18em] text-foam/70">
              {pct}%
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
