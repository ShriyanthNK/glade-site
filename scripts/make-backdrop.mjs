// Draws the pixel-art night-forest backdrop and writes public/backdrop.png.
// Deterministic: seeded PRNG, no Math.random, no timestamps. Run: node scripts/make-backdrop.mjs
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { PNG } from "pngjs";

export const BACKDROP_WIDTH = 480;
export const BACKDROP_HEIGHT = 270;
const W = BACKDROP_WIDTH;
const H = BACKDROP_HEIGHT;

// The whole scene sits in a low value range so light page copy stays AA over any pixel.
// Light comes from the moon (top, right of centre).
export const PALETTE = {
  sky0: "#2a1a26", // ink plum
  sky1: "#2d1c2e",
  sky2: "#2c2134",
  sky3: "#292738",
  sky4: "#232d3c",
  sky5: "#1d323d", // deep teal horizon
  glow1: "#3a2c3c",
  glow2: "#4a3a46", // also dim stars
  star: "#625850", // peach-cream star
  moonLight: "#6e695e", // paper cream, held down in value
  moonBase: "#656157",
  moonShade: "#55514a",
  crater: "#5c584f",
  far: "#2d4b51",
  farRim: "#3a5d60",
  mist: "#33525a",
  mid: "#1c3439",
  midRim: "#305650", // also rock highlight
  near: "#0e1c20",
  nearRim: "#2a4f46",
  rock: "#1f2a2c",
  grass: "#1a3a26",
  grassLit: "#2c5c38", // a touch of sprout
};
const KEYS = Object.keys(PALETTE);
const IDX = Object.fromEntries(KEYS.map((k, i) => [k, i]));
const RGB = KEYS.map((k) => {
  const h = PALETTE[k];
  return [1, 3, 5].map((o) => parseInt(h.slice(o, o + 2), 16));
});
const SKY = ["sky0", "sky1", "sky2", "sky3", "sky4", "sky5"].map((k) => IDX[k]);

const MOON = { x: 242, y: 26, r: 11 };
const HORIZON = 206;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const thr = (x, y) => (BAYER[y & 3][x & 3] + 0.5) / 16;
const clamp01 = (v) => Math.min(1, Math.max(0, v));

function noise1d(rng, step) {
  const knots = Array.from({ length: Math.ceil(W / step) + 2 }, () => rng());
  return (x) => {
    const u = x / step;
    const i = Math.max(0, Math.floor(u));
    const f = u - i;
    const s = f * f * (3 - 2 * f);
    return knots[i] * (1 - s) + knots[i + 1] * s;
  };
}

function makeCanvas() {
  const px = new Uint8Array(W * H);
  const set = (x, y, c) => {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && x < W && y >= 0 && y < H) px[y * W + x] = c;
  };
  const get = (x, y) => px[y * W + x];
  return { px, set, get };
}

function drawSky(cv) {
  for (let y = 0; y < H; y++) {
    const t = clamp01(y / HORIZON) ** 1.15;
    const v = t * (SKY.length - 1);
    const base = Math.floor(v);
    // Solid bands with a dithered transition zone between them.
    const f = clamp01((v - base - 0.5) / 0.45 + 0.5);
    for (let x = 0; x < W; x++) {
      const i = Math.min(SKY.length - 1, base + (f > thr(x, y) ? 1 : 0));
      cv.set(x, y, SKY[i]);
    }
  }
}

function drawMoon(cv) {
  const { x: mx, y: my, r } = MOON;
  const glowR = 28;
  for (let y = 0; y < my + r + glowR; y++) {
    for (let x = mx - r - glowR; x < mx + r + glowR; x++) {
      const dx = x + 0.5 - mx;
      const dy = y + 0.5 - my;
      const d = Math.hypot(dx, dy);
      if (d <= r) continue;
      const g = clamp01(1 - (d - r) / glowR) ** 1.7 * 2;
      const lvl = Math.floor(g) + (g - Math.floor(g) > thr(x, y) ? 1 : 0);
      if (lvl >= 2) cv.set(x, y, IDX.glow2);
      else if (lvl === 1) cv.set(x, y, IDX.glow1);
    }
  }
  const L = [0.6, -0.55, 0.55];
  const ln = Math.hypot(...L);
  for (let y = my - r; y <= my + r; y++) {
    for (let x = mx - r; x <= mx + r; x++) {
      const nx = (x + 0.5 - mx) / r;
      const ny = (y + 0.5 - my) / r;
      const q = nx * nx + ny * ny;
      if (q > 1) continue;
      const nz = Math.sqrt(1 - q);
      const s = (nx * L[0] + ny * L[1] + nz * L[2]) / ln;
      const t = thr(x, y) * 0.16 - 0.08;
      let c = IDX.moonShade;
      if (s + t > 0.86) c = IDX.moonLight;
      else if (s + t > 0.5) c = IDX.moonBase;
      cv.set(x, y, c);
    }
  }
  // Craters: small irregular blobs (offsets from the moon centre), each with a lit lower-right lip.
  const craters = [
    [-5, -3, ["##.", "###", ".#."]],
    [2, 2, [".##", "###", "##."]],
    [-2, 6, ["##"]],
    [5, -5, ["#"]],
    [-7, 3, ["#", "#"]],
  ];
  for (const [ox, oy, rows] of craters) {
    rows.forEach((row, ry) => {
      [...row].forEach((ch, rx) => {
        if (ch === "#") cv.set(mx + ox + rx, my + oy + ry, IDX.crater);
      });
    });
    const last = rows.length - 1;
    const lw = rows[last].length;
    if (rows.length > 1) cv.set(mx + ox + lw, my + oy + last, IDX.moonLight);
  }
}

function drawStars(cv, rng) {
  for (let n = 0; n < 90; n++) {
    const x = Math.floor(rng() * W);
    const y = Math.floor(rng() ** 1.5 * 150);
    const big = rng();
    if (Math.hypot(x - MOON.x, y - MOON.y) < MOON.r + 26) continue;
    if (big > 0.94) {
      cv.set(x, y, IDX.star);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) cv.set(x + dx, y + dy, IDX.glow2);
    } else if (big > 0.75) {
      cv.set(x, y, IDX.star);
    } else {
      cv.set(x, y, IDX.glow2);
    }
  }
}

// A tiered pine. cx/baseY are the trunk foot; h is the full height.
function pine(cv, rng, cx, baseY, h, col, skirt = 0.1) {
  cx = Math.round(cx);
  const top = baseY - h;
  const crownBot = baseY - Math.max(2, Math.round(h * skirt));
  const crownH = crownBot - top;
  const n = Math.min(11, 3 + Math.floor(h / 24));
  const maxW = h * (0.2 + rng() * 0.06);
  const tw = Math.max(1, Math.round(h / 45));
  for (let y = crownBot - 2; y <= baseY; y++) {
    for (let x = -Math.floor(tw / 2); x < tw - Math.floor(tw / 2); x++) cv.set(cx + x, y, col);
  }
  for (let i = 0; i < n; i++) {
    const y0 = Math.round(top + crownH * (i / n) * (i === 0 ? 0 : 0.86));
    const y1 = Math.round(top + (crownH * (i + 1)) / n);
    const wBot = maxW * ((i + 1) / n) ** 0.85 + 1;
    const wTop = i === 0 ? 0 : wBot * 0.3;
    for (let y = y0; y <= y1; y++) {
      const t = (y - y0) / Math.max(1, y1 - y0);
      const hw = Math.round(wTop + (wBot - wTop) * t ** 1.1 + (rng() < 0.25 ? 1 : 0) - (rng() < 0.15 ? 1 : 0));
      for (let x = -hw; x <= hw; x++) cv.set(cx + x, y, col);
    }
    // Drooping branch tips.
    const tip = Math.round(wBot);
    cv.set(cx - tip - 1, y1 + 1, col);
    cv.set(cx + tip + 1, y1 + 1, col);
    cv.set(cx - tip, y1 + 1, col);
    cv.set(cx + tip, y1 + 1, col);
  }
  // Pointed tip.
  cv.set(cx, top - 1, col);
}

// Rim light: exposed edges of a layer that face the moon (sideways or upward) pick up the rim colour.
function rimPass(cv, rng, col, rim, p, yMax) {
  const snap = cv.px.slice();
  const at = (x, y) => (x < 0 || x >= W || y < 0 || y >= H ? -1 : snap[y * W + x]);
  for (let y = 1; y < yMax; y++) {
    const fall = 1 - y / yMax; // brighter higher up
    for (let x = 0; x < W; x++) {
      if (at(x, y) !== col) continue;
      const side = x < MOON.x ? 1 : -1;
      const sideOpen = at(x + side, y) !== col;
      const topOpen = at(x, y - 1) !== col && at(x + side, y - 1) !== col;
      if ((sideOpen && rng() < p * (0.35 + fall)) || (topOpen && rng() < p * 0.6 * fall)) cv.set(x, y, rim);
    }
  }
}

function fillBelow(cv, baseFn, col) {
  for (let x = 0; x < W; x++) {
    for (let y = Math.round(baseFn(x)); y < H; y++) cv.set(x, y, col);
  }
}

function mistBand(cv, rng, centre, half, strength, onto) {
  const n1 = noise1d(rng, 40);
  const n2 = noise1d(rng, 13);
  for (let y = Math.max(0, centre - half); y < Math.min(H, centre + half); y++) {
    const f = (1 - Math.abs(y - centre) / half) * strength;
    for (let x = 0; x < W; x++) {
      const drift = Math.round(3 * Math.sin(y / 3));
      const wav = (n1(x + drift) - 0.5) * 0.9 + (n2(x - drift) - 0.5) * 0.35;
      if (onto.has(cv.get(x, y)) && f * clamp01(0.55 + wav * 1.3) > thr(x, y)) cv.set(x, y, IDX.mist);
    }
  }
}

function rockAt(cv, cx, cy, rw, rh) {
  for (let y = -rh; y <= 0; y++) {
    for (let x = -rw; x <= rw; x++) {
      const e = (x * x) / (rw * rw) + ((y + 0.5) * (y + 0.5)) / (rh * rh);
      if (e > 1) continue;
      // Top-right shoulder catches the moonlight.
      const edge = e > 0.42 && y < 0 && x > -rw * 0.2 && y < -rh * 0.25;
      cv.set(cx + x, cy + y, edge ? IDX.midRim : IDX.rock);
    }
  }
}

function tuft(cv, rng, x, y) {
  const blades = 2 + Math.floor(rng() * 3);
  for (let b = 0; b < blades; b++) {
    const bx = x + b * 2 - blades + 1;
    const bh = 2 + Math.floor(rng() * 4);
    const lean = bx < x ? -1 : bx > x ? 1 : 0;
    for (let k = 0; k < bh; k++) {
      const px = bx + (k >= bh - 1 ? lean : 0);
      cv.set(px, y - k, k === bh - 1 && rng() < 0.7 ? IDX.grassLit : IDX.grass);
    }
  }
}

const FERN = [
  "..l.....l..",
  ".g..l.l..g.",
  "g...g.g...g",
  "..g.g.g.g..",
  "....ggg....",
  ".....g.....",
];
function fern(cv, x, y, dir) {
  FERN.forEach((row, ry) => {
    [...row].forEach((ch, rx) => {
      if (ch === ".") return;
      const px = dir > 0 ? x + rx - 5 : x - rx + 5;
      cv.set(px, y - FERN.length + 1 + ry, ch === "l" ? IDX.grassLit : IDX.grass);
    });
  });
}

export function renderBackdrop() {
  const rng = mulberry32(0x6d6f6368); // "moch"
  const cv = makeCanvas();
  drawSky(cv);
  drawStars(cv, rng);
  drawMoon(cv);

  // Far ridge: small dense pines, lightest and lowest contrast.
  const farBase = (x) => 198 + 3 * Math.sin(x / 37) + 2 * Math.sin(x / 13 + 1);
  fillBelow(cv, farBase, IDX.far);
  for (let x = -8; x < W + 8; x += 4 + Math.floor(rng() * 6)) {
    const h = 14 + rng() * 22 + (rng() < 0.18 ? 14 : 0);
    pine(cv, rng, x, farBase(x) + 2, h, IDX.far);
  }
  rimPass(cv, rng, IDX.far, IDX.farRim, 0.5, 205);
  mistBand(cv, rng, 201, 13, 0.95, new Set([IDX.far, IDX.farRim, ...SKY]));

  // Mid ridge: fewer, larger pines.
  const midBase = (x) => 240 + 3 * Math.sin(x / 51 + 2) + 2 * Math.sin(x / 17);
  fillBelow(cv, midBase, IDX.mid);
  for (let x = -6; x < W + 10; x += 13 + Math.floor(rng() * 14)) {
    const h = 44 + rng() * 46;
    pine(cv, rng, x, midBase(x) + 2, h, IDX.mid);
  }
  rimPass(cv, rng, IDX.mid, IDX.midRim, 0.6, 236);
  // Ground fog drifting through the mid trunks.
  mistBand(cv, rng, 236, 9, 0.6, new Set([IDX.mid, IDX.midRim, IDX.far]));

  // Near ground and framing pines.
  const nearBase = (x) => 250 + 4 * Math.sin(x / 43 + 4) + 2 * Math.sin(x / 13);
  fillBelow(cv, nearBase, IDX.near);
  const nearTrees = [
    [-6, 238], [22, 206], [58, 158], [94, 92],
    [406, 118], [438, 192], [472, 234],
    [164, 40], [204, 26], [334, 48], [368, 30],
  ];
  for (const [x, h] of nearTrees) pine(cv, rng, x, nearBase(x) + 3, h, IDX.near, 0.035);
  rimPass(cv, rng, IDX.near, IDX.nearRim, 0.7, 250);

  // Ground details along the very bottom.
  for (const [x, y, rw, rh] of [[124, 263, 7, 5], [134, 265, 4, 3], [262, 261, 5, 3], [350, 266, 8, 5], [448, 262, 5, 3]]) {
    rockAt(cv, x, y, rw, rh);
  }
  for (let x = 2; x < W; x += 6 + Math.floor(rng() * 16)) {
    if (rng() < 0.3) continue;
    tuft(cv, rng, x, Math.round(nearBase(x)) + 1);
  }
  for (const [x, y] of [[40, 268], [86, 262], [188, 266], [228, 269], [300, 264], [392, 268], [420, 263]]) tuft(cv, rng, x, y);
  for (const [x, y, d] of [[108, 268, 1], [146, 269, -1], [238, 266, 1], [310, 269, -1], [378, 267, 1], [462, 269, -1]]) {
    fern(cv, x, y, d);
  }

  const data = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    const [r, g, b] = RGB[cv.px[i]];
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  return { width: W, height: H, data };
}

export function encodeBackdrop({ width, height, data }) {
  const png = new PNG({ width, height });
  png.data.set(data);
  return PNG.sync.write(png, { colorType: 2, deflateLevel: 9 });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const out = new URL("../public/backdrop.png", import.meta.url);
  fs.mkdirSync(new URL("../public/", import.meta.url), { recursive: true });
  const buf = encodeBackdrop(renderBackdrop());
  fs.writeFileSync(out, buf);
  console.log(`wrote public/backdrop.png (${W}x${H}, ${buf.length} bytes)`);
}
