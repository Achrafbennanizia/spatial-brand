"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Grid, Stars } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useNavigation } from "@/lib/navigation";
import { useDeviceMotion } from "@/lib/device-motion";
import { useIsMobile } from "@/lib/media";
import { getZone, ZONES } from "@/lib/zones";
import { MaterialsProvider, ZoneStructure } from "./ZoneStructures";
import { createHorizonTexture, createOpsFloorSet } from "@/lib/materials";

function CameraRig() {
  const { active, reducedMotion } = useNavigation();
  const { offset } = useDeviceMotion();
  const mobile = useIsMobile();
  const { camera } = useThree();
  const zone = getZone(active);

  const targetPos = useMemo(() => {
    const [x, y, z] = zone.camera;
    if (!mobile) return new THREE.Vector3(x, y, z);
    // Pull back + raise for phone framing (UI sheet eats the bottom)
    return new THREE.Vector3(x * 1.22, y * 1.18 + 0.55, z * 1.22);
  }, [zone.camera, mobile]);

  const look = useMemo(
    () =>
      new THREE.Vector3(
        zone.position[0],
        zone.position[1] + (mobile ? 0.35 : 0.65),
        zone.position[2],
      ),
    [zone.position, mobile],
  );
  const lookCurrent = useRef(new THREE.Vector3(0, 0.8, 0));
  const vel = useRef(new THREE.Vector3());
  const goal = useRef(new THREE.Vector3());
  const lookGoal = useRef(new THREE.Vector3());

  useEffect(() => {
    if (mobile) {
      (camera as THREE.PerspectiveCamera).fov = 48;
    } else {
      (camera as THREE.PerspectiveCamera).fov = 40;
    }
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [mobile, camera]);

  useFrame((state, delta) => {
    if (reducedMotion) {
      state.camera.position.copy(targetPos);
      lookCurrent.current.copy(look);
      state.camera.lookAt(lookCurrent.current);
      return;
    }
    const damp = 1 - Math.exp(-delta * 2.6);
    const tiltX = offset.enabled ? offset.x * (mobile ? 0.85 : 0.35) : 0;
    const tiltY = offset.enabled ? offset.y * (mobile ? 0.55 : 0.22) : 0;

    goal.current.copy(targetPos);
    goal.current.x += tiltX * 1.4;
    goal.current.y += tiltY * 0.9;

    state.camera.position.x += (goal.current.x - state.camera.position.x) * damp;
    state.camera.position.y += (goal.current.y - state.camera.position.y) * damp;
    state.camera.position.z += (goal.current.z - state.camera.position.z) * damp;

    if (!offset.enabled) {
      vel.current.set(
        Math.sin(state.clock.elapsedTime * 0.25) * 0.018,
        Math.cos(state.clock.elapsedTime * 0.2) * 0.01,
        0,
      );
      state.camera.position.addScaledVector(vel.current, delta * 8);
    }

    lookGoal.current.copy(look);
    lookGoal.current.x += tiltX * 0.9;
    lookGoal.current.y += tiltY * 0.45;
    lookCurrent.current.lerp(lookGoal.current, damp);
    state.camera.lookAt(lookCurrent.current);
  });

  return null;
}

/** Dark night sky dome with baked + live stars. */
function Backdrop() {
  const mobile = useIsMobile();
  const sky = useMemo(() => {
    if (typeof document === "undefined") return null;
    return createHorizonTexture();
  }, []);

  return (
    <group>
      {/* Solid dark clear color fallback behind everything */}
      <color attach="background" args={["#000104"]} />

      {/* Sky dome — dark gradient + dense baked stars */}
      <mesh scale={[-1, 1, 1]} renderOrder={-10}>
        <sphereGeometry args={[120, mobile ? 32 : 64, mobile ? 24 : 48]} />
        <meshBasicMaterial
          map={sky ?? undefined}
          color="#ffffff"
          side={THREE.BackSide}
          fog={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Extra live star layers for depth / twinkle */}
      <Stars
        radius={85}
        depth={55}
        count={mobile ? 1800 : 4500}
        factor={5}
        saturation={0}
        fade
        speed={0.05}
      />
      <Stars
        radius={60}
        depth={30}
        count={mobile ? 400 : 1100}
        factor={7}
        saturation={0.15}
        fade
        speed={0.025}
      />
    </group>
  );
}

function Ground() {
  const floor = useMemo(() => {
    if (typeof document === "undefined") return null;
    return createOpsFloorSet();
  }, []);

  return (
    <group>
      {/* Background terrain — fills horizon beyond the ops deck */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.12, 0]}
        receiveShadow
      >
        <circleGeometry args={[80, 96]} />
        <meshStandardMaterial
          color="#050e14"
          roughness={1}
          metalness={0}
          envMapIntensity={0.1}
        />
      </mesh>

      {/* Soft terrain wash toward horizon */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <ringGeometry args={[18, 70, 96]} />
        <meshBasicMaterial
          color="#0a1c24"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, 0]}>
        <ringGeometry args={[40, 78, 64]} />
        <meshBasicMaterial
          color="#061018"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Distant terrain grid (fades into fog) */}
      <Grid
        position={[0, -0.085, 0]}
        args={[120, 120]}
        cellSize={2}
        cellThickness={0.35}
        cellColor="#0f2a32"
        sectionSize={8}
        sectionThickness={0.7}
        sectionColor="#1a4a48"
        fadeDistance={55}
        fadeStrength={1.2}
        infiniteGrid
      />

      {/* Mid apron between terrain and deck */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
        <ringGeometry args={[12.2, 22, 96]} />
        <meshStandardMaterial
          color="#081820"
          roughness={0.95}
          metalness={0.08}
        />
      </mesh>

      {/* Primary ops floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.02, 0]}
        receiveShadow
      >
        <circleGeometry args={[12, 128]} />
        <meshPhysicalMaterial
          map={floor?.albedo}
          color="#07141c"
          metalness={0.18}
          roughness={0.92}
          roughnessMap={floor?.roughness}
          normalMap={floor?.normal}
          normalScale={new THREE.Vector2(0.12, 0.12)}
          envMapIntensity={0.2}
        />
      </mesh>

      {/* Outer deck ring — brand signal edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <ringGeometry args={[11.4, 12.05, 128]} />
        <meshPhysicalMaterial
          color="#1a4a52"
          metalness={0.55}
          roughness={0.4}
          emissive="#3a1810"
          emissiveIntensity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Mid orbit ring (zone radius) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <ringGeometry args={[4.95, 5.25, 128]} />
        <meshPhysicalMaterial
          color="#ff5c35"
          metalness={0.4}
          roughness={0.35}
          emissive="#ff5c35"
          emissiveIntensity={0.45}
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Hub pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.35, 1.55, 64]} />
        <meshPhysicalMaterial
          color="#e6c35c"
          metalness={0.45}
          roughness={0.32}
          emissive="#e6c35c"
          emissiveIntensity={0.4}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Grid
        position={[0, 0.014, 0]}
        args={[24, 24]}
        cellSize={0.5}
        cellThickness={0.22}
        cellColor="#143038"
        sectionSize={2}
        sectionThickness={0.55}
        sectionColor="#5a3a2a"
        fadeDistance={20}
        fadeStrength={1.8}
        infiniteGrid={false}
      />
    </group>
  );
}

function PathSpokes() {
  const { active } = useNavigation();

  return (
    <group>
      {ZONES.filter((z) => z.id !== "hub").map((zone) => {
        const [x, , z] = zone.position;
        const length = Math.hypot(x, z);
        const angle = Math.atan2(x, z);
        const on = active === zone.id || active === "hub";
        return (
          <group key={zone.id}>
            <mesh
              position={[x / 2, 0.03, z / 2]}
              rotation={[-Math.PI / 2, 0, -angle]}
            >
              <planeGeometry args={[0.16, length - 1.35]} />
              <meshStandardMaterial
                color="#ff5c35"
                emissive="#ff5c35"
                emissiveIntensity={on ? (active === zone.id ? 0.8 : 0.4) : 0.2}
                transparent
                opacity={on ? 0.55 : 0.3}
              />
            </mesh>
            {/* Zone node pad */}
            <mesh
              position={[x, 0.025, z]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <ringGeometry args={[1.05, 1.2, 48]} />
              <meshStandardMaterial
                color="#ff5c35"
                emissive="#ff5c35"
                emissiveIntensity={active === zone.id ? 0.55 : 0.12}
                transparent
                opacity={active === zone.id ? 0.65 : 0.28}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function SceneContents() {
  const { setActive } = useNavigation();

  return (
    <>
      <fog attach="fog" args={["#030812", 40, 85]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#f0ebe3", "#0a0a0b", 0.8]} />
      <directionalLight
        position={[8, 16, 6]}
        intensity={2.5}
        color="#fff8f2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      />
      <directionalLight
        position={[-6, 5, -4]}
        intensity={0.85}
        color="#ffb090"
      />
      <spotLight
        position={[-4, 9, 2]}
        intensity={36}
        angle={0.5}
        penumbra={0.75}
        color="#ff8a60"
      />
      <pointLight
        position={[0, 4, 0]}
        intensity={12}
        color="#f0c14a"
        distance={16}
      />
      <Environment preset="city" environmentIntensity={0.7} />

      <Backdrop />

      <MaterialsProvider>
        <Ground />
        <PathSpokes />

        <ZoneStructure id="hub" position={[0, 0, 0]} label="Hub" />
        {ZONES.filter((z) => z.id !== "hub").map((zone) => (
          <ZoneStructure
            key={zone.id}
            id={zone.id}
            position={zone.position}
            label={zone.label}
          />
        ))}
      </MaterialsProvider>

      <mesh
        position={[0, -0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={() => setActive("hub")}
      >
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.6}
        scale={24}
        blur={2.8}
        far={10}
        color="#020608"
      />
      <CameraRig />
    </>
  );
}

export function WorldScene() {
  const mobile = useIsMobile();

  return (
    <div className="fixed inset-0 z-[1] touch-none">
      <Canvas
        camera={{ position: [0, 5.6, 12.5], fov: mobile ? 48 : 40, near: 0.1, far: 80 }}
        dpr={mobile ? [1, 1.35] : [1, 1.85]}
        gl={{
          antialias: !mobile,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          powerPreference: mobile ? "low-power" : "high-performance",
        }}
        shadows={!mobile}
        onPointerMissed={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <Suspense fallback={null}>
          <SceneContents />
        </Suspense>
      </Canvas>
    </div>
  );
}
