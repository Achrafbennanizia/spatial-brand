"use client";

import { WorldCanvas } from "@/components/canvas/WorldCanvas";
import { Chrome } from "@/components/Chrome";
import { ZonePanel } from "@/components/ZonePanel";
import { MotionPrompt } from "@/components/MotionPrompt";
import { BootLoader } from "@/components/BootLoader";
import { NavigationProvider } from "@/lib/navigation";
import { DeviceMotionProvider } from "@/lib/device-motion";
import { BootProvider, useBoot } from "@/lib/boot";

function StudioShell() {
  const { ready, progress } = useBoot();

  return (
    <main id="main" tabIndex={-1}>
      <BootLoader ready={ready} progress={progress} />
      <div className="atmosphere" aria-hidden />
      <WorldCanvas />
      {ready && (
        <>
          <Chrome />
          <ZonePanel />
          <MotionPrompt />
        </>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <BootProvider>
      <NavigationProvider>
        <DeviceMotionProvider enabled>
          <StudioShell />
        </DeviceMotionProvider>
      </NavigationProvider>
    </BootProvider>
  );
}
