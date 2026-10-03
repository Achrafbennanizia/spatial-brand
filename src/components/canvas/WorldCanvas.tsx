"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useBoot } from "@/lib/boot";

const WorldScene = dynamic(
  () => import("./WorldScene").then((m) => m.WorldScene),
  { ssr: false },
);

export function WorldCanvas() {
  const { setProgress } = useBoot();

  useEffect(() => {
    setProgress(18);
  }, [setProgress]);

  return <WorldScene />;
}
