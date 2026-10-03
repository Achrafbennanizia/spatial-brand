"use client";

import { WorldCanvas } from "@/components/canvas/WorldCanvas";
import { Chrome } from "@/components/Chrome";
import { ZonePanel } from "@/components/ZonePanel";
import { MotionPrompt } from "@/components/MotionPrompt";
import { NavigationProvider } from "@/lib/navigation";
import { DeviceMotionProvider } from "@/lib/device-motion";

export default function Home() {
  return (
    <NavigationProvider>
      <DeviceMotionProvider enabled>
        <div className="atmosphere" aria-hidden />
        <WorldCanvas />
        <Chrome />
        <ZonePanel />
        <MotionPrompt />
      </DeviceMotionProvider>
    </NavigationProvider>
  );
}
