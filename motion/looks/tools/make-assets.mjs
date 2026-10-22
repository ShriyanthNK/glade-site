// Builds the images the "photo to pixel scene" motion graphic uses. Run: node tools/make-assets.mjs
//  - assets/photo.png      a generated sunset landscape standing in for "your photo" (no real photo is used)
//  - assets/mosaic-*.png   the photo averaged into coarse blocks (the pixelating steps)
//  - assets/final.png      the REAL output of the Glade app's look pipeline (glade look add --out), scaled 4x
//  - assets/hoot-*.png     Hoot's "done" mood, drawn by the same mascot code as the app and site
// Needs the glade app repo next to the site repo (../glade) with a built CLI: `swift build` there.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
const req = createRequire(new URL("../../../package.json", import.meta.url));
const { PNG } = req("pngjs");
const W = 1920, H = 1080, HORIZON = 640;

// ---- deterministic noise
let s = 0x9e3779b9; const rnd = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hash = (x, y) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const sm = (t) => t * t * (3 - 2 * t);
const vnoise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = sm(x - xi), yf = sm(y - yi); const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf; };
const fbm = (x, y, o = 4) => { let v = 0, a = 0.5, f = 1; for (let i = 0; i < o; i++) { v += a * vnoise(x * f, y * f); a /= 2; f *= 2; } return v; };
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const grad = (stops, t) => { t = Math.min(1, Math.max(0, t)); for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) { const [t0, c0] = stops[i - 1], [t1, c1] = stops[i]; return mixc(hex(c0), hex(c1), (t - t0) / (t1 - t0)); } return hex(stops[stops.length - 1][1]); };
const SKY = [[0, "#171748"], [0.42, "#5e3688"], [0.72, "#dc5778"], [0.9, "#ffae66"], [1, "#ffe0a0"]];
const skyAt = (y) => grad(SKY, y / HORIZON);

const png = new PNG({ width: W, height: H });
const ridge = (x, base, amp, freq, seed) => base - amp * fbm(x * freq + seed, seed, 5);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  let c;
  if (y < HORIZON) {
    c = skyAt(y);
    const d = Math.hypot(x - 1280, (y - 590) * 1.1);
    c = mixc(c, hex("#fff1c8"), Math.min(1, Math.exp(-d / 210) * 0.9));
    if (d < 62) c = hex("#fffbe8");
    const cl = fbm(x * 0.0024, y * 0.011 + 3, 5);
    if (y > 180 && y < 520 && cl > 0.52) c = mixc(c, hex("#ffb0a0"), Math.min(0.55, (cl - 0.52) * 3.2));
  } else {
    // lake: the sky mirrored, rippled and darkened
    const ry = HORIZON - (y - HORIZON) * 0.9 + 14 * Math.sin(x * 0.045 + y * 0.12) * (1 - (y - HORIZON) / 440);
    c = mixc(skyAt(Math.max(0, ry)), hex("#1c2442"), 0.35);
    const d = Math.hypot(x - 1280, (y - 700) * 0.3); c = mixc(c, hex("#ffe9b0"), Math.min(0.7, Math.exp(-d / 120) * 0.8));
  }
  // three mountain ridges, far to near, with haze
  const ridges = [[610, 95, 0.0032, 11, "#8a5f9e"], [655, 125, 0.0026, 29, "#4c3c7a"], [700, 150, 0.0021, 47, "#243050"]];
  for (const [b, a, f, sd, col] of ridges) if (y < HORIZON + 70 && y > ridge(x, b, a, f, sd) && y < HORIZON + 6) c = mixc(hex(col), skyAt(HORIZON), b === 610 ? 0.35 : 0.12);
  png.data[(y * W + x) * 4] = c[0]; png.data[(y * W + x) * 4 + 1] = c[1]; png.data[(y * W + x) * 4 + 2] = c[2]; png.data[(y * W + x) * 4 + 3] = 255;
}
// foreground pines (dark silhouettes) on both sides
const pine = (cx, base, h, w) => { for (let y = base - h; y <= base; y++) { const t = (y - (base - h)) / h, tier = (t * 7) % 1, half = w * (0.12 + t * 0.88) * (0.62 + 0.38 * tier); for (let x = Math.floor(cx - half); x <= cx + half; x++) if (x >= 0 && x < W && y >= 0 && y < H) { const i = (y * W + x) * 4; png.data[i] = 14; png.data[i + 1] = 22; png.data[i + 2] = 34; } } };
for (const [cx, b, h, w] of [[70, 1080, 760, 130], [200, 1080, 560, 105], [350, 1080, 400, 80], [1830, 1080, 700, 125], [1690, 1080, 520, 100], [1560, 1080, 380, 78], [470, 1080, 250, 60]]) pine(cx, b, h, w);
// photographic grain and a vignette
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, g = (rnd() - 0.5) * 12, v = 1 - 0.34 * Math.pow(Math.hypot((x - W / 2) / (W / 2), (y - H / 2) / (H / 2)) / 1.4, 2); for (let k = 0; k < 3; k++) png.data[i + k] = Math.max(0, Math.min(255, (png.data[i + k] + g) * v)); }
fs.mkdirSync("assets", { recursive: true });
const write = (p, im) => fs.writeFileSync(p, PNG.sync.write(im, { deflateLevel: 9 }));
write("assets/photo.png", png);

// ---- coarse mosaics: average blocks, scale back up with no smoothing
const mosaic = (n) => { const bw = W / n, bh = H / (n * 9 / 16), out = new PNG({ width: W, height: H }); for (let by = 0; by < H; by += bh) for (let bx = 0; bx < W; bx += bw) { const acc = [0, 0, 0]; for (let y = by; y < by + bh; y++) for (let x = bx; x < bx + bw; x++) for (let k = 0; k < 3; k++) acc[k] += png.data[(y * W + x) * 4 + k]; for (let y = by; y < by + bh; y++) for (let x = bx; x < bx + bw; x++) { const i = (y * W + x) * 4; for (let k = 0; k < 3; k++) out.data[i + k] = acc[k] / (bw * bh); out.data[i + 3] = 255; } } return out; };
for (const n of [96, 160, 240]) write(`assets/mosaic-${n}.png`, mosaic(n));

// ---- the real pipeline: Glade's look command, then 4x nearest-neighbour
const CLI = process.env.GLADE_CLI || path.resolve(new URL("../../../../glade/.build/debug/glade", import.meta.url).pathname);
const tmp = path.join(os.tmpdir(), "looks-final-480.png");
console.log(execFileSync(CLI, ["look", "add", path.resolve("assets/photo.png"), "--out", tmp], { encoding: "utf8" }).trim());
const small = PNG.sync.read(fs.readFileSync(tmp)), big = new PNG({ width: W, height: H });
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const si = (Math.floor(y / 4) * small.width + Math.floor(x / 4)) * 4, di = (y * W + x) * 4; for (let k = 0; k < 4; k++) big.data[di + k] = small.data[si + k]; }
write("assets/final.png", big);

// ---- Hoot, done mood, four wave frames, 10x
const { drawOwl } = req(path.resolve(new URL("../../../../glade/design/mascots/mascots.js", import.meta.url).pathname));
[0.1, 0.35, 0.6, 0.85].forEach((t, k) => { const { px, pal } = drawOwl("done", t), sc = 10, im = new PNG({ width: 32 * sc, height: 32 * sc }); for (let y = 0; y < 32 * sc; y++) for (let x = 0; x < 32 * sc; x++) { const idx = px[Math.floor(y / sc) * 32 + Math.floor(x / sc)]; if (!idx) continue; const [r, g, b] = hex(pal[idx]), i = (y * im.width + x) * 4; im.data[i] = r; im.data[i + 1] = g; im.data[i + 2] = b; im.data[i + 3] = 255; } write(`assets/hoot-${k}.png`, im); });
for (const f of fs.readdirSync("assets").filter((f) => f.endsWith(".png"))) console.log(f.padEnd(18), (fs.statSync("assets/" + f).size / 1024).toFixed(0) + " KB");
