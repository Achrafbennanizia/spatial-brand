"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { NAV_ZONES, type ZoneId } from "./zones";

type NavigationContextValue = {
  active: ZoneId;
  reducedMotion: boolean;
  setActive: (id: ZoneId) => void;
  goNext: () => void;
  goPrev: () => void;
  progress: number;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}

const ORDER: ZoneId[] = ["hub", ...NAV_ZONES.map((z) => z.id)];

function isUiTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "button, a, input, textarea, select, [data-no-swipe], nav, header",
    ),
  );
}

function isScrollableTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  let el: Element | null = target;
  while (el && el !== document.body) {
    const style = window.getComputedStyle(el);
    const oy = style.overflowY;
    if (
      (oy === "auto" || oy === "scroll" || oy === "overlay") &&
      el.scrollHeight > el.clientHeight + 1
    ) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

function zoneFromHash(): ZoneId {
  if (typeof window === "undefined") return "hub";
  const hash = window.location.hash.replace("#", "") as ZoneId;
  return ORDER.includes(hash) ? hash : "hub";
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [active, setActiveState] = useState<ZoneId>(zoneFromHash);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const activeRef = useRef(active);
  const lockedUntil = useRef(0);
  const wheelAcc = useRef(0);
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const setActive = useCallback((id: ZoneId) => {
    setActiveState(id);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", id === "hub" ? "#" : `#${id}`);
    }
  }, []);

  const goNext = useCallback(() => {
    const i = ORDER.indexOf(activeRef.current);
    setActive(ORDER[Math.min(i + 1, ORDER.length - 1)]);
  }, [setActive]);

  const goPrev = useCallback(() => {
    const i = ORDER.indexOf(activeRef.current);
    setActive(ORDER[Math.max(i - 1, 0)]);
  }, [setActive]);

  const stepFromDelta = useCallback(
    (delta: number) => {
      const now = performance.now();
      if (now < lockedUntil.current) return;

      wheelAcc.current += delta;
      const threshold = 42;
      if (Math.abs(wheelAcc.current) < threshold) return;

      const dir = wheelAcc.current > 0 ? 1 : -1;
      wheelAcc.current = 0;
      lockedUntil.current = now + (reducedMotion ? 180 : 650);

      if (dir > 0) goNext();
      else goPrev();
    },
    [goNext, goPrev, reducedMotion],
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    media.addEventListener("change", sync);

    const onHash = () => {
      const hash = window.location.hash.replace("#", "") as ZoneId;
      if (ORDER.includes(hash)) setActiveState(hash);
    };
    window.addEventListener("hashchange", onHash);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "1") setActive("product");
      if (e.key === "2") setActive("story");
      if (e.key === "3") setActive("customers");
      if (e.key === "4") setActive("careers");
      if (e.key === "0" || e.key === "Escape") setActive("hub");
    };

    const onWheel = (e: WheelEvent) => {
      if (isScrollableTarget(e.target) || isUiTarget(e.target)) return;
      e.preventDefault();
      stepFromDelta(e.deltaY + e.deltaX * 0.35);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (isScrollableTarget(e.target) || isUiTarget(e.target)) {
        touchStart.current = null;
        return;
      }
      const t = e.touches[0];
      if (!t) return;
      touchStart.current = { x: t.clientX, y: t.clientY, t: performance.now() };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = touchStart.current.x - t.clientX;
      const dy = touchStart.current.y - t.clientY;
      const dt = performance.now() - touchStart.current.t;
      touchStart.current = null;

      // Prefer dominant axis; allow quick flicks
      if (dt > 900) return;
      if (Math.abs(dy) >= Math.abs(dx) && Math.abs(dy) > 36) {
        stepFromDelta(dy);
      } else if (Math.abs(dx) > 48) {
        // swipe left → next, swipe right → prev
        stepFromDelta(dx);
      }
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [goNext, goPrev, setActive, stepFromDelta]);

  const progress = ORDER.indexOf(active) / Math.max(1, ORDER.length - 1);

  const value = useMemo(
    () => ({ active, reducedMotion, setActive, goNext, goPrev, progress }),
    [active, reducedMotion, setActive, goNext, goPrev, progress],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}
