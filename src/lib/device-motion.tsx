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

export type MotionOffset = {
  x: number;
  y: number;
  enabled: boolean;
  needsPermission: boolean;
};

type Ctx = {
  offset: MotionOffset;
  requestPermission: () => Promise<boolean>;
  recalibrate: () => void;
};

const DeviceMotionContext = createContext<Ctx | null>(null);

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

const FALLBACK: Ctx = {
  offset: { x: 0, y: 0, enabled: false, needsPermission: false },
  requestPermission: async () => false,
  recalibrate: () => {},
};

export function useDeviceMotion() {
  return useContext(DeviceMotionContext) ?? FALLBACK;
}

export function DeviceMotionProvider({
  enabled = true,
  children,
}: {
  enabled?: boolean;
  children: ReactNode;
}) {
  const [offset, setOffset] = useState<MotionOffset>({
    x: 0,
    y: 0,
    enabled: false,
    needsPermission: false,
  });
  const [listening, setListening] = useState(false);
  const base = useRef<{ beta: number; gamma: number } | null>(null);
  const smooth = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  const hasPermissionApi =
    typeof window !== "undefined" &&
    typeof (
      DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      }
    ).requestPermission === "function";

  useEffect(() => {
    if (!enabled) return;

    if (hasPermissionApi && !listening) {
      setOffset((o) => ({ ...o, needsPermission: true, enabled: false }));
      return;
    }

    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      if (!base.current) base.current = { beta: e.beta, gamma: e.gamma };
      const db = clamp((e.beta - base.current.beta) / 26, -1, 1);
      const dg = clamp((e.gamma - base.current.gamma) / 26, -1, 1);
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        smooth.current.x += (dg - smooth.current.x) * 0.14;
        smooth.current.y += (db - smooth.current.y) * 0.14;
        setOffset({
          x: smooth.current.x,
          y: smooth.current.y,
          enabled: true,
          needsPermission: false,
        });
      });
    };

    window.addEventListener("deviceorientation", onOrient, true);
    // Non-iOS: try listening immediately
    if (!hasPermissionApi) {
      setOffset((o) => ({ ...o, enabled: true, needsPermission: false }));
    }

    return () => {
      window.removeEventListener("deviceorientation", onOrient, true);
      cancelAnimationFrame(raf.current);
    };
  }, [enabled, hasPermissionApi, listening]);

  const requestPermission = useCallback(async () => {
    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    if (typeof DOE.requestPermission === "function") {
      try {
        const result = await DOE.requestPermission();
        if (result === "granted") {
          base.current = null;
          setListening(true);
          setOffset((o) => ({
            ...o,
            enabled: true,
            needsPermission: false,
          }));
          return true;
        }
        setOffset((o) => ({ ...o, needsPermission: false, enabled: false }));
        return false;
      } catch {
        setOffset((o) => ({ ...o, needsPermission: false, enabled: false }));
        return false;
      }
    }
    setListening(true);
    return true;
  }, []);

  const recalibrate = useCallback(() => {
    base.current = null;
    smooth.current = { x: 0, y: 0 };
    setOffset((o) => ({ ...o, x: 0, y: 0 }));
  }, []);

  const value = useMemo(
    () => ({ offset, requestPermission, recalibrate }),
    [offset, requestPermission, recalibrate],
  );

  return (
    <DeviceMotionContext.Provider value={value}>
      {children}
    </DeviceMotionContext.Provider>
  );
}
