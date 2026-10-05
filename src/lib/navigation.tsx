"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { NAV_ZONES, type ZoneId } from "./zones";

type NavigationContextValue = {
  active: ZoneId;
  reducedMotion: boolean;
  paused: boolean;
  togglePause: () => void;
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
const ZONE_EVENT = "dixor-zone";

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

function zoneFromLocation(): ZoneId {
  const hash = window.location.hash.replace("#", "") as ZoneId;
  return ORDER.includes(hash) ? hash : "hub";
}

function subscribeZone(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  window.addEventListener(ZONE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("hashchange", onStoreChange);
    window.removeEventListener(ZONE_EVENT, onStoreChange);
  };
}

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  // useSyncExternalStore: getServerSnapshot during SSR/hydration, then client snapshot
  const active = useSyncExternalStore(
    subscribeZone,
    zoneFromLocation,
    () => "hub" as ZoneId,
  );
  const systemReduced = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  const [paused, setPaused] = useState(false);
  const reducedMotion = systemReduced || paused;
  const togglePause = useCallback(() => setPaused((value) => !value), []);

  const activeRef = useRef(active);
  const lockedUntil = useRef(0);
  const wheelAcc = useRef(0);
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const setActive = useCallback((id: ZoneId) => {
    const next =
      id === "hub"
        ? `${window.location.pathname}${window.location.search}`
        : `#${id}`;
    window.history.replaceState(null, "", next);
    window.dispatchEvent(new Event(ZONE_EVENT));
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
      // Higher threshold + longer lock reduces accidental multi-zone jumps
      const threshold = 70;
      if (Math.abs(wheelAcc.current) < threshold) return;

      const dir = wheelAcc.current > 0 ? 1 : -1;
      wheelAcc.current = 0;
      lockedUntil.current = now + (reducedMotion ? 220 : 820);

      if (dir > 0) goNext();
      else goPrev();
    },
    [goNext, goPrev, reducedMotion],
  );

  useEffect(() => {
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
      // Ignore tiny trackpad noise; only lock the gesture when we may step
      const delta = e.deltaY + e.deltaX * 0.35;
      if (Math.abs(delta) < 1.5 && Math.abs(wheelAcc.current) < 8) return;
      e.preventDefault();
      stepFromDelta(delta);
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

      if (dt > 900) return;
      if (Math.abs(dy) >= Math.abs(dx) && Math.abs(dy) > 36) {
        stepFromDelta(dy);
      } else if (Math.abs(dx) > 48) {
        stepFromDelta(dx);
      }
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [goNext, goPrev, setActive, stepFromDelta]);

  const progress = ORDER.indexOf(active) / Math.max(1, ORDER.length - 1);

  const value = useMemo(
    () => ({
      active,
      reducedMotion,
      paused,
      togglePause,
      setActive,
      goNext,
      goPrev,
      progress,
    }),
    [active, reducedMotion, paused, togglePause, setActive, goNext, goPrev, progress],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}
