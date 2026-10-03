"use client";

import * as THREE from "three";

type TextureSet = {
  albedo: THREE.CanvasTexture;
  roughness: THREE.DataTexture;
  normal: THREE.DataTexture;
  ao: THREE.DataTexture;
};

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function fbm(x: number, y: number, seed: number) {
  let v = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < 4; i++) {
    v += a * hash(x * f * 12.9898 + y * f * 78.233 + seed + i * 19.1);
    a *= 0.5;
    f *= 2.05;
  }
  return v;
}

function makeDataTexture(
  size: number,
  fill: (x: number, y: number) => [number, number, number],
) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const [r, g, b] = fill(x, y);
      const o = (y * size + x) * 4;
      data[o] = r;
      data[o + 1] = g;
      data[o + 2] = b;
      data[o + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function heightToNormal(height: Float32Array, size: number, strength = 1.1) {
  return makeDataTexture(size, (x, y) => {
    const left = height[y * size + ((x - 1 + size) % size)];
    const right = height[y * size + ((x + 1) % size)];
    const up = height[((y - 1 + size) % size) * size + x];
    const down = height[((y + 1) % size) * size + x];
    const dx = (right - left) * strength;
    const dy = (down - up) * strength;
    const inv = 1 / Math.sqrt(dx * dx + dy * dy + 1);
    return [
      (-dx * inv * 0.5 + 0.5) * 255,
      (-dy * inv * 0.5 + 0.5) * 255,
      inv * 255,
    ];
  });
}

function finish(
  tex: THREE.Texture,
  repeat: [number, number],
  srgb = false,
) {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = 8;
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** Brushed metal finish set (img2threejs brushed-steel). */
export function createBrushedMetalSet(tint = "#9eb8b4"): TextureSet {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y++) {
    const a = 0.02 + hash(y * 1.3) * 0.08;
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.fillRect(0, y, size, 1);
    ctx.fillStyle = `rgba(0,0,0,${a * 0.55})`;
    ctx.fillRect(0, y + 1, size, 1);
  }

  const albedo = new THREE.CanvasTexture(canvas);
  finish(albedo, [2.2, 2.2], true);

  const height = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      height[y * size + x] =
        0.5 + fbm(x * 0.55, y * 0.012, 7) * 0.18 + fbm(x * 0.04, y * 0.04, 19) * 0.05;
    }
  }

  const roughness = makeDataTexture(size, (x, y) => {
    const h = height[y * size + x];
    const v = (0.3 + (1 - h) * 0.18 + fbm(x, y, 3) * 0.05) * 255;
    return [v, v, v];
  });
  finish(roughness, [2.2, 2.2]);

  const normal = heightToNormal(height, size, 1.4);
  finish(normal, [2.2, 2.2]);

  const ao = makeDataTexture(size, (x, y) => {
    const v = (0.72 + height[y * size + x] * 0.28) * 255;
    return [v, v, v];
  });
  finish(ao, [2.2, 2.2]);
  ao.channel = 0;

  return { albedo, roughness, normal, ao };
}

/** Panel / deck plating with subtle grid. */
export function createPanelSet(base = "#14303a", edge = "#1f4a58"): TextureSet {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, edge);
  g.addColorStop(0.45, base);
  g.addColorStop(1, "#0b1c24");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(93,206,166,0.16)";
  ctx.lineWidth = 1.5;
  for (let i = 32; i < size; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }
  // rivet dots
  for (let gy = 32; gy < size; gy += 64) {
    for (let gx = 32; gx < size; gx += 64) {
      ctx.fillStyle = "rgba(232,242,240,0.12)";
      ctx.beginPath();
      ctx.arc(gx, gy, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const albedo = new THREE.CanvasTexture(canvas);
  finish(albedo, [1.5, 1.5], true);

  const height = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const panel = ((x % 32 < 2 ? 0.08 : 0) + (y % 32 < 2 ? 0.08 : 0));
      const rivet =
        (x + 32) % 64 < 4 && (y + 32) % 64 < 4 ? 0.2 : 0;
      height[y * size + x] =
        0.52 + panel * 0.55 + rivet * 0.45 + fbm(x * 0.025, y * 0.025, 12) * 0.04;
    }
  }

  const roughness = makeDataTexture(size, (x, y) => {
    const v = (0.58 + fbm(x * 0.06, y * 0.06, 8) * 0.12) * 255;
    return [v, v, v];
  });
  finish(roughness, [1.5, 1.5]);

  const normal = heightToNormal(height, size, 1.6);
  finish(normal, [1.5, 1.5]);

  const ao = makeDataTexture(size, (x, y) => {
    const h = height[y * size + x];
    const v = Math.min(255, Math.max(120, (0.7 + h * 0.3) * 255));
    return [v, v, v];
  });
  finish(ao, [1.5, 1.5]);
  ao.channel = 0;

  return { albedo, roughness, normal, ao };
}

/**
 * Ops-floor albedo for Meridian — void base, nodal grid, signal veins.
 * Matches brand tokens: void / signal / amber.
 */
export function createOpsFloorSet(): TextureSet {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Void base with slight radial lift toward center
  const radial = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.05,
    size / 2,
    size / 2,
    size * 0.55,
  );
  radial.addColorStop(0, "#0c222c");
  radial.addColorStop(0.45, "#081820");
  radial.addColorStop(1, "#040d14");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, size, size);

  // Fine cartographic grain
  for (let i = 0; i < 1800; i++) {
    const x = hash(i * 1.7) * size;
    const y = hash(i * 3.1) * size;
    ctx.fillStyle = `rgba(93,206,166,${0.015 + hash(i) * 0.03})`;
    ctx.fillRect(x, y, 1, 1);
  }

  // Major grid (section)
  ctx.strokeStyle = "rgba(42,90,90,0.55)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i <= size; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  // Minor cells
  ctx.strokeStyle = "rgba(26,58,68,0.4)";
  ctx.lineWidth = 0.75;
  for (let i = 0; i <= size; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  // Concentric nodal rings (map metaphor)
  const cx = size / 2;
  const cy = size / 2;
  for (const [r, a] of [
    [48, 0.35],
    [110, 0.28],
    [175, 0.22],
    [230, 0.16],
  ] as const) {
    ctx.strokeStyle = `rgba(93,206,166,${a})`;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Amber bearing ticks at cardinals
  ctx.strokeStyle = "rgba(230,195,92,0.35)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 168, cy + Math.sin(a) * 168);
    ctx.lineTo(cx + Math.cos(a) * 198, cy + Math.sin(a) * 198);
    ctx.stroke();
  }

  // Hub node
  ctx.fillStyle = "rgba(93,206,166,0.2)";
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(230,195,92,0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, Math.PI * 2);
  ctx.stroke();

  const albedo = new THREE.CanvasTexture(canvas);
  finish(albedo, [1, 1], true);

  const height = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) / (size * 0.5);
      const ring =
        Math.abs(Math.sin(dist * Math.PI * 4)) < 0.06 ? 0.12 : 0;
      const cell = x % 16 < 1 || y % 16 < 1 ? 0.05 : 0;
      height[y * size + x] =
        0.5 + ring + cell + fbm(x * 0.02, y * 0.02, 5) * 0.03;
    }
  }

  const roughness = makeDataTexture(size, (x, y) => {
    const h = height[y * size + x];
    const v = (0.62 + (1 - h) * 0.2 + fbm(x * 0.05, y * 0.05, 2) * 0.08) * 255;
    return [v, v, v];
  });
  finish(roughness, [1, 1]);

  const normal = heightToNormal(height, size, 1.2);
  finish(normal, [1, 1]);

  const ao = makeDataTexture(size, (x, y) => {
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) / (size * 0.5);
    const v = (0.78 + (1 - dist) * 0.18) * 255;
    return [v, v, v];
  });
  finish(ao, [1, 1]);
  ao.channel = 0;

  return { albedo, roughness, normal, ao };
}

/** Dark night sky for the backdrop dome (zenith → horizon) with baked stars. */
export function createHorizonTexture() {
  const w = 2048;
  const h = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Near-black night sky
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#000104");
  g.addColorStop(0.4, "#01030a");
  g.addColorStop(0.7, "#030812");
  g.addColorStop(0.88, "#071420");
  g.addColorStop(1, "#0a1a28");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Soft milky haze
  for (let i = 0; i < 80; i++) {
    const x = hash(i * 3.1) * w;
    const y = hash(i * 7.7) * h * 0.75;
    const r = 40 + hash(i * 2.2) * 120;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(120,160,200,${0.02 + hash(i) * 0.03})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Dense star field
  for (let i = 0; i < 3200; i++) {
    const x = hash(i * 12.7) * w;
    const y = hash(i * 4.3) * h * 0.88;
    const bright = 0.45 + hash(i * 9.1) * 0.55;
    const r = hash(i * 2.2) > 0.94 ? 2.2 : hash(i * 3.3) > 0.75 ? 1.4 : 0.8;
    ctx.fillStyle = `rgba(235,245,255,${bright})`;
    ctx.fillRect(x, y, r, r);
  }

  // Bright accent stars
  for (let i = 0; i < 80; i++) {
    const x = hash(i * 77.1) * w;
    const y = hash(i * 51.3) * h * 0.78;
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.beginPath();
    ctx.arc(x, y, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(180,220,255,0.35)";
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Horizon signal wash
  const band = ctx.createLinearGradient(0, h * 0.85, 0, h);
  band.addColorStop(0, "rgba(93,206,166,0)");
  band.addColorStop(0.55, "rgba(93,206,166,0.08)");
  band.addColorStop(1, "rgba(8,24,36,0.3)");
  ctx.fillStyle = band;
  ctx.fillRect(0, h * 0.85, w, h * 0.15);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/** Legacy single-map helpers. */
export function createBrushedMetalMap(tint = "#9eb8b4") {
  return createBrushedMetalSet(tint).albedo;
}
export function createNoiseRoughnessMap(base = 140, variance = 70) {
  return makeDataTexture(128, (x, y) => {
    const v = Math.max(
      0,
      Math.min(255, base + (hash(x * 11.1 + y * 7.3) - 0.5) * variance),
    );
    return [v, v, v];
  });
}
export function createPanelAlbedo(base = "#14303a", edge = "#1f4a58") {
  return createPanelSet(base, edge).albedo;
}
