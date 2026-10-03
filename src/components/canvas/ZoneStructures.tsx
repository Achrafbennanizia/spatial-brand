"use client";

import { createContext, useContext, useMemo, useRef, useState } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { useNavigation } from "@/lib/navigation";
import type { ZoneId } from "@/lib/zones";
import { createBrushedMetalSet, createPanelSet } from "@/lib/materials";

type Maps = {
  brushed: ReturnType<typeof createBrushedMetalSet>;
  panel: ReturnType<typeof createPanelSet>;
};

const MapsContext = createContext<Maps | null>(null);

export function MaterialsProvider({ children }: { children: React.ReactNode }) {
  const maps = useMemo(() => {
    if (typeof document === "undefined") return null;
    return {
      brushed: createBrushedMetalSet("#d8d2c8"),
      panel: createPanelSet("#1c1c1e", "#2a2a2e"),
    };
  }, []);
  return (
    <MapsContext.Provider value={maps}>{children}</MapsContext.Provider>
  );
}

function useMaps() {
  return useContext(MapsContext);
}

type StructureProps = {
  id: ZoneId;
  position: [number, number, number];
  label: string;
};

function HitPad({
  id,
  children,
}: {
  id: ZoneId;
  children: React.ReactNode;
}) {
  const { setActive } = useNavigation();
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        setActive(id);
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {children}
    </group>
  );
}

/** Hub — studio emblem (interlocking creative mark). */
function StudioMark({ active }: { active: boolean }) {
  const maps = useMaps();
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.2;
  });

  return (
    <group ref={group}>
      <mesh castShadow>
        <torusGeometry args={[0.95, 0.08, 24, 80]} />
        <meshPhysicalMaterial
          map={maps?.brushed.albedo}
          color="#f0ebe3"
          metalness={0.85}
          roughness={0.25}
          emissive="#ff5c35"
          emissiveIntensity={active ? 0.35 : 0.12}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.7, 0.06, 20, 64]} />
        <meshPhysicalMaterial
          color="#ff5c35"
          metalness={0.7}
          roughness={0.28}
          emissive="#ff5c35"
          emissiveIntensity={active ? 0.9 : 0.4}
        />
      </mesh>
      <mesh castShadow>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshPhysicalMaterial
          map={maps?.panel.albedo}
          color="#222226"
          metalness={0.4}
          roughness={0.4}
          clearcoat={0.4}
        />
      </mesh>
      <mesh position={[0, 0, 0.32]}>
        <boxGeometry args={[0.28, 0.28, 0.04]} />
        <meshStandardMaterial
          color="#ff5c35"
          emissive="#ff5c35"
          emissiveIntensity={active ? 1.2 : 0.5}
        />
      </mesh>
    </group>
  );
}

const SERVICE_FLOATS = [
  {
    n: "01",
    title: "BRAND",
    line: "Identity that",
    sub: "sells trust",
    bullets: ["Logo + type system", "Voice & guidelines", "Sales-ready assets"],
    metric: "Buyers remember you",
    accent: false,
  },
  {
    n: "02",
    title: "PRODUCT",
    line: "UI built to",
    sub: "convert",
    bullets: ["Funnel UX flows", "High-signal screens", "Path-to-yes polish"],
    metric: "Shorter path to yes",
    accent: true,
  },
  {
    n: "03",
    title: "LAUNCH",
    line: "Campaigns with",
    sub: "one KPI",
    bullets: ["Landing systems", "One conversion goal", "Proof for budget"],
    metric: "Tied to one metric",
    accent: false,
  },
] as const;

function createServiceScreenTexture() {
  const w = 1600;
  const h = 1000;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // High-contrast cream panel (reads at distance)
  ctx.fillStyle = "#f4f1ea";
  ctx.fillRect(0, 0, w, h);

  // Coral top stripe
  ctx.fillStyle = "#ff5c35";
  ctx.fillRect(0, 0, w, 18);

  // Eyebrow
  ctx.fillStyle = "#ff5c35";
  ctx.font = "700 36px sans-serif";
  ctx.fillText("DIXOR  ·  SERVICES", 72, 100);

  // Exact theme headline — large & wrap-friendly
  ctx.fillStyle = "#0a0a0b";
  ctx.font = "700 78px Georgia, serif";
  ctx.fillText("Brand, product, and", 72, 220);
  ctx.fillText("launches built to", 72, 310);
  ctx.fillStyle = "#ff5c35";
  ctx.fillText("convert.", 72, 400);

  // Three huge pillars
  const pillars = [
    { n: "01", t: "BRAND", d: "Systems people\nremember" },
    { n: "02", t: "PRODUCT", d: "Interfaces that\nclose the path" },
    { n: "03", t: "LAUNCH", d: "Sites tied to\none metric" },
  ];
  pillars.forEach((p, i) => {
    const x = 72 + i * 500;
    const y = 480;
    ctx.fillStyle = "#0a0a0b";
    ctx.fillRect(x, y, 460, 420);

    ctx.fillStyle = "#ff5c35";
    ctx.font = "700 32px sans-serif";
    ctx.fillText(p.n, x + 36, y + 70);

    ctx.fillStyle = "#f4f1ea";
    ctx.font = "700 56px sans-serif";
    ctx.fillText(p.t, x + 36, y + 150);

    ctx.fillStyle = "#c8c4bc";
    ctx.font = "500 34px Georgia, serif";
    p.d.split("\n").forEach((line, li) => {
      ctx.fillText(line, x + 36, y + 240 + li * 48);
    });

    // Accent bar under title
    ctx.fillStyle = "#ff5c35";
    ctx.fillRect(x + 36, y + 170, 120, 6);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function createServiceCardTexture(card: (typeof SERVICE_FLOATS)[number]) {
  // Compact landscape — matches small satellite panels by the laptop
  const w = 640;
  const h = 400;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const bg = card.accent ? "#ff5c35" : "#f4f1ea";
  const ink = "#0a0a0b";
  const coral = card.accent ? "#0a0a0b" : "#ff5c35";
  const mute = card.accent ? "rgba(10,10,11,0.55)" : "#6a6660";

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = coral;
  ctx.fillRect(0, 0, w, 8);

  ctx.fillStyle = coral;
  ctx.font = "700 22px sans-serif";
  ctx.fillText(`${card.n}  ${card.title}`, 28, 48);

  ctx.fillStyle = ink;
  ctx.font = "700 40px Georgia, serif";
  ctx.fillText(card.line, 28, 120);
  ctx.fillText(card.sub, 28, 168);

  ctx.fillStyle = coral;
  ctx.fillRect(28, 190, 72, 4);

  // Compact deliverable chips
  card.bullets.forEach((b, i) => {
    const y = 230 + i * 36;
    ctx.fillStyle = coral;
    ctx.beginPath();
    ctx.arc(36, y - 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = mute;
    ctx.font = "600 22px sans-serif";
    ctx.fillText(b, 52, y);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function createServiceCardBackTexture(card: (typeof SERVICE_FLOATS)[number]) {
  const w = 640;
  const h = 400;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#0a0a0b";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#ff5c35";
  ctx.fillRect(0, 0, w, 8);

  ctx.fillStyle = "#ff5c35";
  ctx.font = "700 20px sans-serif";
  ctx.fillText("DIXOR", 28, 52);

  ctx.fillStyle = "#f4f1ea";
  ctx.font = "700 56px sans-serif";
  ctx.fillText(card.n, 28, 150);

  ctx.fillStyle = "#f4f1ea";
  ctx.font = "700 48px Georgia, serif";
  ctx.fillText(card.title, 28, 230);

  ctx.fillStyle = "#9a9690";
  ctx.font = "600 22px sans-serif";
  ctx.fillText(card.metric, 28, 320);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/** Services — laptop + floating offer cards (content reveals when selected). */
function ServiceLaptop({ active }: { active: boolean }) {
  const maps = useMaps();
  const cards = useRef<THREE.Group>(null);
  const flips = useRef<(THREE.Group | null)[]>([]);
  const flipAmt = useRef(0);

  const screenMap = useMemo(() => {
    if (typeof document === "undefined") return null;
    return createServiceScreenTexture();
  }, []);

  const cardMaps = useMemo(() => {
    if (typeof document === "undefined") return [];
    return SERVICE_FLOATS.map(createServiceCardTexture);
  }, []);

  const cardBackMaps = useMemo(() => {
    if (typeof document === "undefined") return [];
    return SERVICE_FLOATS.map(createServiceCardBackTexture);
  }, []);

  useFrame((state, delta) => {
    if (cards.current) {
      // Subtle drift — stays locked to the laptop composition
      cards.current.position.y =
        0.95 + Math.sin(state.clock.elapsedTime * 1.1) * 0.025;
      cards.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.35) * 0.04;
    }
    const target = active ? Math.PI : 0;
    const k = 1 - Math.exp(-delta * 5.5);
    flipAmt.current += (target - flipAmt.current) * k;
    flips.current.forEach((g) => {
      if (g) g.rotation.y = flipAmt.current;
    });
  });

  // Tight satellites around the screen — small, integrated
  const cardPose: [number, number, number, number][] = [
    [-0.92, 0.12, -0.05, -0.22],
    [0.92, 0.22, -0.08, 0.22],
    [0.55, -0.28, 0.28, 0.12],
  ];

  return (
    <group>
      <mesh position={[0, 0.08, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.9, 0.1, 1.35]} />
        <meshPhysicalMaterial
          map={maps?.panel.albedo}
          color="#1a1a1d"
          metalness={0.35}
          roughness={0.55}
        />
      </mesh>

      <mesh position={[0, 0.2, 0.1]} castShadow>
        <boxGeometry args={[1.35, 0.06, 0.9]} />
        <meshPhysicalMaterial
          map={maps?.brushed.albedo}
          color="#cfc9c0"
          metalness={0.9}
          roughness={0.28}
        />
      </mesh>
      <mesh position={[0, 0.24, 0.18]}>
        <boxGeometry args={[1.15, 0.02, 0.55]} />
        <meshStandardMaterial color="#111113" roughness={0.7} />
      </mesh>

      {/* Screen bezel */}
      <mesh position={[0, 0.78, -0.28]} rotation={[0.28, 0, 0]} castShadow>
        <boxGeometry args={[1.5, 0.98, 0.05]} />
        <meshPhysicalMaterial
          map={maps?.brushed.albedo}
          color="#bdb7ae"
          metalness={0.88}
          roughness={0.3}
        />
      </mesh>
      {/* Screen UI — bright, readable, theme-locked */}
      <mesh position={[0, 0.78, -0.248]} rotation={[0.28, 0, 0]}>
        <planeGeometry args={[1.38, 0.88]} />
        <meshBasicMaterial
          map={screenMap ?? undefined}
          color="#ffffff"
          toneMapped={false}
        />
      </mesh>

      {/* Small offer panels — orbit the laptop, not dominate it */}
      <group ref={cards} position={[0, 0.95, 0.05]}>
        {cardPose.map(([x, y, z, rot], i) => (
          <group key={i} position={[x, y, z]} rotation={[0.12, rot, 0.02]}>
            <group
              ref={(el) => {
                flips.current[i] = el;
              }}
            >
              <mesh castShadow>
                <boxGeometry args={[0.52, 0.34, 0.02]} />
                <meshPhysicalMaterial
                  map={maps?.brushed.albedo}
                  color="#d8d2c8"
                  metalness={0.3}
                  roughness={0.45}
                />
              </mesh>
              <mesh position={[0, 0, -0.012]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[0.48, 0.3]} />
                <meshBasicMaterial
                  map={cardBackMaps[i] ?? undefined}
                  color="#ffffff"
                  toneMapped={false}
                />
              </mesh>
              <mesh position={[0, 0, 0.012]}>
                <planeGeometry args={[0.48, 0.3]} />
                <meshBasicMaterial
                  map={cardMaps[i] ?? undefined}
                  color="#ffffff"
                  toneMapped={false}
                />
              </mesh>
            </group>
          </group>
        ))}
      </group>
    </group>
  );
}

const CASE_CARDS = [
  {
    title: "SaaS relaunch",
    line: "path-to-demo",
    sub: "cut in half.",
    metric: "+38% demos",
    tag: "PRODUCT",
  },
  {
    title: "Brand system",
    line: "sales can",
    sub: "defend in-room.",
    metric: "8-wk ship",
    tag: "IDENTITY",
  },
  {
    title: "Launch site",
    line: "tied to one",
    sub: "conversion KPI.",
    metric: "2.4× CVR",
    tag: "CAMPAIGN",
  },
] as const;

function createCaseCardTexture(card: (typeof CASE_CARDS)[number]) {
  const w = 512;
  const h = 640;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#121214";
  ctx.fillRect(0, 0, w, h);

  // Coral accent strip
  ctx.fillStyle = "#ff5c35";
  ctx.fillRect(0, 0, 28, h);

  // Tag
  ctx.fillStyle = "rgba(255,92,53,0.2)";
  ctx.fillRect(56, 48, 160, 36);
  ctx.fillStyle = "#ff5c35";
  ctx.font = "600 22px sans-serif";
  ctx.fillText(card.tag, 68, 74);

  // Headline
  ctx.fillStyle = "#f4f1ea";
  ctx.font = "600 48px Georgia, serif";
  ctx.fillText(card.title, 56, 180);
  ctx.fillText(card.line, 56, 240);
  ctx.fillStyle = "#ff5c35";
  ctx.fillText(card.sub, 56, 300);

  // Metric block
  ctx.fillStyle = "#1c1c1e";
  ctx.fillRect(56, 400, w - 112, 140);
  ctx.fillStyle = "#9a9690";
  ctx.font = "500 20px sans-serif";
  ctx.fillText("RESULT", 80, 445);
  ctx.fillStyle = "#f4f1ea";
  ctx.font = "600 52px Georgia, serif";
  ctx.fillText(card.metric, 80, 510);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** Work — portfolio frames that flip 180° when the zone is selected. */
function WorkGallery({ active }: { active: boolean }) {
  const maps = useMaps();
  const sway = useRef<THREE.Group>(null);
  const flips = useRef<(THREE.Group | null)[]>([]);
  const lifts = useRef<(THREE.Group | null)[]>([]);
  const flipAmt = useRef(0);
  const hoverAmt = useRef([0, 0, 0]);
  const [hovered, setHovered] = useState<number | null>(null);

  const faces = useMemo(() => {
    if (typeof document === "undefined") return [];
    return CASE_CARDS.map(createCaseCardTexture);
  }, []);

  useFrame((state, delta) => {
    if (sway.current) {
      sway.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.1;
    }
    // Ease toward 180° (π) when selected, else 0
    const target = active ? Math.PI : 0;
    const k = 1 - Math.exp(-delta * 5.5);
    flipAmt.current += (target - flipAmt.current) * k;
    flips.current.forEach((g) => {
      if (g) g.rotation.y = flipAmt.current;
    });

    // Hover: lift card toward camera + scale so it reads in front
    const hk = 1 - Math.exp(-delta * 12);
    for (let i = 0; i < 3; i++) {
      const want = hovered === i ? 1 : 0;
      hoverAmt.current[i] += (want - hoverAmt.current[i]) * hk;
      const t = hoverAmt.current[i];
      const lift = lifts.current[i];
      if (!lift) continue;
      // Toward Work camera (zone looks from -Z)
      lift.position.z = -t * 0.55;
      lift.position.y = t * 0.1;
      lift.scale.setScalar(1 + t * 0.14);
      lift.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          obj.renderOrder = Math.round(t * 10);
        }
      });
    }
  });

  const frames: [number, number, number, number][] = [
    [-0.55, 0.95, 0.1, -0.25],
    [0.15, 1.25, -0.15, 0.15],
    [0.65, 0.85, 0.2, 0.35],
  ];

  const onCardOver = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(i);
    document.body.style.cursor = "pointer";
  };

  const onCardOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(null);
    document.body.style.cursor = "auto";
  };

  return (
    <group>
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.05, 1.15, 0.16, 48]} />
        <meshPhysicalMaterial
          map={maps?.panel.albedo}
          color="#1c1c1e"
          metalness={0.4}
          roughness={0.5}
        />
      </mesh>
      <group ref={sway}>
        {frames.map(([x, y, z, rot], i) => (
          <group key={i} position={[x, y, z]} rotation={[0.05, rot, 0]}>
            {/* Lift pivot — hover brings card in front of the stack */}
            <group
              ref={(el) => {
                lifts.current[i] = el;
              }}
              onPointerOver={onCardOver(i)}
              onPointerOut={onCardOut}
            >
              {/* Flip pivot — 180° on select reveals case face */}
              <group
                ref={(el) => {
                  flips.current[i] = el;
                }}
              >
                {/* Frame body */}
                <mesh castShadow>
                  <boxGeometry args={[0.85, 1.05, 0.06]} />
                  <meshPhysicalMaterial
                    map={maps?.brushed.albedo}
                    color="#e8e2d8"
                    metalness={0.35}
                    roughness={0.4}
                  />
                </mesh>

                {/* Back (idle facing camera) */}
                <mesh position={[0, 0, -0.035]} rotation={[0, Math.PI, 0]}>
                  <planeGeometry args={[0.72, 0.9]} />
                  <meshPhysicalMaterial
                    map={maps?.brushed.albedo}
                    color="#d8d2c8"
                    metalness={0.4}
                    roughness={0.45}
                  />
                </mesh>

                {/* Front — case card (shown after 180° flip) */}
                <mesh position={[0, 0, 0.035]}>
                  <planeGeometry args={[0.72, 0.9]} />
                  <meshStandardMaterial
                    map={faces[i] ?? undefined}
                    color="#f4f1ea"
                    roughness={0.55}
                    metalness={0.05}
                    emissive="#ff5c35"
                    emissiveIntensity={
                      hovered === i ? 0.28 : active ? 0.12 : 0.02
                    }
                  />
                </mesh>
              </group>
            </group>
          </group>
        ))}
      </group>
    </group>
  );
}

/** Clients — rising metric bars. */
function ClientMetrics({ active }: { active: boolean }) {
  const maps = useMaps();
  const bars = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!bars.current) return;
    bars.current.children.forEach((child, i) => {
      const pulse = 0.92 + Math.sin(state.clock.elapsedTime * 1.5 + i) * 0.04;
      child.scale.y = pulse;
    });
  });

  const heights = [0.7, 1.1, 0.9, 1.45, 1.2];

  return (
    <group>
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.8, 0.14, 1.2]} />
        <meshPhysicalMaterial
          map={maps?.panel.albedo}
          color="#1a1a1d"
          metalness={0.4}
          roughness={0.5}
        />
      </mesh>
      <group ref={bars} position={[0, 0.18, 0]}>
        {heights.map((h, i) => (
          <mesh
            key={i}
            position={[(i - 2) * 0.32, h / 2, 0]}
            castShadow
          >
            <boxGeometry args={[0.22, h, 0.22]} />
            <meshPhysicalMaterial
              color={i === 3 ? "#ff5c35" : "#d8d2c8"}
              metalness={0.55}
              roughness={0.35}
              emissive={i === 3 ? "#ff5c35" : "#000"}
              emissiveIntensity={i === 3 ? (active ? 0.85 : 0.35) : 0}
              map={i === 3 ? undefined : maps?.brushed.albedo}
            />
          </mesh>
        ))}
      </group>
      {/* Orbiting node */}
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial
          color="#f0c14a"
          emissive="#f0c14a"
          emissiveIntensity={active ? 1.4 : 0.6}
        />
      </mesh>
    </group>
  );
}

const TEAM_ROLES = [
  {
    n: "01",
    role: "DESIGN",
    line: "Critique",
    sub: "in public",
    detail: "Taste + judgment",
  },
  {
    n: "02",
    role: "ENG",
    line: "Ship the",
    sub: "sprint",
    detail: "Metric literacy",
  },
  {
    n: "03",
    role: "PRODUCER",
    line: "Result line",
    sub: "before deck",
    detail: "Reporting discipline",
  },
] as const;

function createTeamRoleTexture(role: (typeof TEAM_ROLES)[number], dark: boolean) {
  const w = 640;
  const h = 400;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = dark ? "#0a0a0b" : "#f4f1ea";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#ff5c35";
  ctx.fillRect(0, 0, w, 10);

  ctx.fillStyle = "#ff5c35";
  ctx.font = "700 22px sans-serif";
  ctx.fillText(`${role.n}  ${role.role}`, 32, 56);

  ctx.fillStyle = dark ? "#f4f1ea" : "#0a0a0b";
  ctx.font = "700 48px Georgia, serif";
  ctx.fillText(role.line, 32, 150);
  ctx.fillText(role.sub, 32, 210);

  ctx.fillStyle = dark ? "#9a9690" : "#6a6660";
  ctx.font = "600 24px sans-serif";
  ctx.fillText(role.detail, 32, 290);

  // Mini UI chrome so it reads as a real work surface
  if (dark) {
    ctx.fillStyle = "#1c1c1e";
    ctx.fillRect(32, 320, 220, 36);
    ctx.fillStyle = "#ff5c35";
    ctx.fillRect(32, 320, 8, 36);
    ctx.fillStyle = "#c8c4bc";
    ctx.font = "600 18px monospace";
    ctx.fillText("git push · ok", 52, 344);
  } else {
    ctx.strokeStyle = "#0a0a0b";
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 318, 180, 40);
    ctx.fillStyle = "#ff5c35";
    ctx.fillRect(40, 326, 24, 24);
    ctx.fillStyle = "#0a0a0b";
    ctx.font = "600 18px sans-serif";
    ctx.fillText("Artboard", 74, 346);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function createSprintBoardTexture() {
  const w = 480;
  const h = 640;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#f4f1ea";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#ff5c35";
  ctx.fillRect(0, 0, w, 12);

  ctx.fillStyle = "#ff5c35";
  ctx.font = "700 22px sans-serif";
  ctx.fillText("SPRINT BOARD", 28, 56);

  ctx.fillStyle = "#0a0a0b";
  ctx.font = "700 36px Georgia, serif";
  ctx.fillText("Who ships", 28, 120);
  ctx.fillText("the proof", 28, 168);

  const lanes = [
    { t: "DESIGN", d: "Critique pass" },
    { t: "ENG", d: "Build + metric" },
    { t: "PROD", d: "Result line" },
  ];
  lanes.forEach((lane, i) => {
    const y = 220 + i * 120;
    ctx.fillStyle = "#0a0a0b";
    ctx.fillRect(28, y, w - 56, 100);
    ctx.fillStyle = "#ff5c35";
    ctx.font = "700 20px sans-serif";
    ctx.fillText(lane.t, 48, y + 38);
    ctx.fillStyle = "#f4f1ea";
    ctx.font = "600 28px sans-serif";
    ctx.fillText(lane.d, 48, y + 74);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/** Team — Design / Eng / Producer workstations on one desk. */
function TeamDesk({ active }: { active: boolean }) {
  const maps = useMaps();
  const bob = useRef<THREE.Group>(null);

  const roleMaps = useMemo(() => {
    if (typeof document === "undefined") return [];
    return [
      createTeamRoleTexture(TEAM_ROLES[0], false),
      createTeamRoleTexture(TEAM_ROLES[1], true),
    ];
  }, []);

  const boardMap = useMemo(() => {
    if (typeof document === "undefined") return null;
    return createSprintBoardTexture();
  }, []);

  useFrame((state) => {
    if (bob.current) {
      bob.current.position.y =
        Math.sin(state.clock.elapsedTime * 1.15) * 0.02;
    }
  });

  return (
    <group>
      {/* Shared workbench */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.05, 0.08, 1.15]} />
        <meshPhysicalMaterial
          map={maps?.brushed.albedo}
          color="#c4a882"
          metalness={0.25}
          roughness={0.55}
        />
      </mesh>
      {[
        [-0.88, -0.42],
        [0.88, -0.42],
        [-0.88, 0.42],
        [0.88, 0.42],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.36, z]} castShadow>
          <boxGeometry args={[0.08, 0.72, 0.08]} />
          <meshPhysicalMaterial color="#1a1a1d" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}

      <group ref={bob}>
        {/* DESIGN — cream artboard / tablet */}
        <group position={[-0.62, 1.02, -0.08]} rotation={[0.35, 0.28, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.58, 0.02, 0.4]} />
            <meshPhysicalMaterial
              map={maps?.brushed.albedo}
              color="#d8d2c8"
              metalness={0.4}
              roughness={0.4}
            />
          </mesh>
          <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.52, 0.34]} />
            <meshBasicMaterial
              map={roleMaps[0] ?? undefined}
              color="#ffffff"
              toneMapped={false}
            />
          </mesh>
          {/* Stylus */}
          <mesh position={[0.22, 0.03, 0.12]} rotation={[0, 0, 0.4]} castShadow>
            <cylinderGeometry args={[0.012, 0.01, 0.28, 8]} />
            <meshStandardMaterial
              color="#ff5c35"
              emissive="#ff5c35"
              emissiveIntensity={active ? 0.5 : 0.15}
            />
          </mesh>
        </group>

        {/* ENG — laptop with terminal */}
        <group position={[0.05, 0.78, 0.05]}>
          <mesh position={[0, 0.02, 0.08]} castShadow>
            <boxGeometry args={[0.62, 0.03, 0.42]} />
            <meshPhysicalMaterial
              map={maps?.brushed.albedo}
              color="#2a2a2e"
              metalness={0.7}
              roughness={0.35}
            />
          </mesh>
          <mesh position={[0, 0.28, -0.12]} rotation={[0.35, 0, 0]} castShadow>
            <boxGeometry args={[0.62, 0.4, 0.03]} />
            <meshPhysicalMaterial
              map={maps?.brushed.albedo}
              color="#b8b2a8"
              metalness={0.85}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 0.28, -0.1]} rotation={[0.35, 0, 0]}>
            <planeGeometry args={[0.54, 0.34]} />
            <meshBasicMaterial
              map={roleMaps[1] ?? undefined}
              color="#ffffff"
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* PRODUCER — upright sprint board */}
        <group position={[0.72, 1.05, -0.12]} rotation={[0.05, -0.35, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.58, 0.03]} />
            <meshPhysicalMaterial
              map={maps?.brushed.albedo}
              color="#e8e2d8"
              metalness={0.3}
              roughness={0.45}
            />
          </mesh>
          <mesh position={[0, 0, 0.018]}>
            <planeGeometry args={[0.36, 0.5]} />
            <meshBasicMaterial
              map={boardMap ?? undefined}
              color="#ffffff"
              toneMapped={false}
            />
          </mesh>
          {/* Clip */}
          <mesh position={[0, 0.32, 0.02]} castShadow>
            <boxGeometry args={[0.16, 0.05, 0.04]} />
            <meshStandardMaterial
              color="#ff5c35"
              metalness={0.6}
              roughness={0.3}
              emissive="#ff5c35"
              emissiveIntensity={active ? 0.4 : 0.1}
            />
          </mesh>
        </group>
      </group>

      {/* Role markers under desk edge */}
      {TEAM_ROLES.map((r, i) => (
        <mesh key={r.role} position={[-0.55 + i * 0.55, 0.78, 0.48]}>
          <boxGeometry args={[0.42, 0.02, 0.08]} />
          <meshStandardMaterial
            color={i === 1 ? "#ff5c35" : "#1a1a1d"}
            emissive={i === 1 ? "#ff5c35" : "#000"}
            emissiveIntensity={active && i === 1 ? 0.55 : 0}
          />
        </mesh>
      ))}

      {/* Seat */}
      <mesh position={[0, 0.45, 0.88]} castShadow>
        <cylinderGeometry args={[0.28, 0.32, 0.08, 24]} />
        <meshPhysicalMaterial color="#1c1c1e" metalness={0.3} roughness={0.55} />
      </mesh>
    </group>
  );
}

export function ZoneStructure({ id, position }: StructureProps) {
  const { active } = useNavigation();
  const isActive = active === id;

  return (
    <group position={position}>
      <HitPad id={id}>
        {id === "product" && <ServiceLaptop active={isActive} />}
        {id === "story" && <WorkGallery active={isActive} />}
        {id === "customers" && <ClientMetrics active={isActive} />}
        {id === "careers" && <TeamDesk active={isActive} />}
        {id === "hub" && (
          <group position={[0, 0.95, 0]}>
            <StudioMark active={isActive || active === "hub"} />
          </group>
        )}
      </HitPad>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.15, 1.28, 48]} />
        <meshBasicMaterial
          color="#ff5c35"
          transparent
          opacity={isActive ? 0.75 : 0.22}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
