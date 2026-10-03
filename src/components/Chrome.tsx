"use client";

import { useNavigation } from "@/lib/navigation";
import { useIsMobile } from "@/lib/media";
import { NAV_ZONES } from "@/lib/zones";

const STEPS = ["hub", ...NAV_ZONES.map((z) => z.id)] as const;

export function Chrome() {
  const { active, setActive, progress } = useNavigation();
  const mobile = useIsMobile();
  const index = Math.max(0, STEPS.indexOf(active));

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)]">
      <div className="pointer-events-auto flex items-start justify-between px-4 py-3 sm:px-5 sm:py-5 md:px-10">
        <button
          type="button"
          onClick={() => setActive("hub")}
          className="min-h-11 touch-manipulation text-left"
        >
          <span className="display block text-xs tracking-[0.22em] text-foam sm:text-sm">
            DIXOR
          </span>
          <span className="mt-1 block text-[10px] tracking-[0.2em] text-muted">
            {active === "hub" ? "CREATIVE STUDIO" : "IN ROOM"}
          </span>
        </button>

        <div className="flex flex-col items-end gap-1.5 sm:gap-2">
          <span className="text-[10px] tracking-[0.18em] text-muted">
            {mobile ? "SWIPE · TILT" : "SCROLL TO MOVE"}
          </span>
          <div
            className="flex items-center gap-1.5"
            aria-label={`Zone ${index + 1} of ${STEPS.length}`}
          >
            {STEPS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                className={`min-h-8 min-w-8 touch-manipulation items-center justify-center transition-all sm:min-h-0 sm:min-w-0 ${
                  active === id
                    ? "flex after:block after:h-1.5 after:w-5 after:bg-signal"
                    : "flex after:block after:h-1.5 after:w-1.5 after:bg-foam/25"
                }`}
                aria-label={id === "hub" ? "Hub" : id}
              />
            ))}
          </div>
          <div className="mt-0.5 h-px w-14 overflow-hidden bg-line sm:w-16">
            <div
              className="h-full bg-signal transition-[width] duration-500 ease-out"
              style={{ width: `${Math.max(8, progress * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
