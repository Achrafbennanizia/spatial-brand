"use client";

import { useState } from "react";
import { useDeviceMotion } from "@/lib/device-motion";
import { useIsMobile } from "@/lib/media";

export function MotionPrompt() {
  const mobile = useIsMobile();
  const { offset, requestPermission } = useDeviceMotion();
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!mobile || dismissed || !offset.needsPermission) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(4.5rem+env(safe-area-inset-top))] z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-sm items-center gap-3 border border-line bg-void/90 px-3 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <p className="flex-1 text-[11px] leading-snug tracking-[0.04em] text-muted">
          Tilt your phone to look around the world.
        </p>
        <button
          type="button"
          disabled={busy}
          className="btn-signal min-h-10 shrink-0 px-3 text-[10px] touch-manipulation"
          onClick={async () => {
            setBusy(true);
            const ok = await requestPermission();
            setBusy(false);
            if (ok) setDismissed(true);
          }}
        >
          Enable
        </button>
        <button
          type="button"
          className="min-h-10 px-2 text-[10px] tracking-[0.12em] text-muted touch-manipulation"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
