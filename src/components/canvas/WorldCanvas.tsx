"use client";

import dynamic from "next/dynamic";

const WorldScene = dynamic(
  () => import("./WorldScene").then((m) => m.WorldScene),
  { ssr: false },
);

export function WorldCanvas() {
  return <WorldScene />;
}
