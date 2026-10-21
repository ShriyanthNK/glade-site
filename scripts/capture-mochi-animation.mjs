// Captures Mochi's real animation from the Claude Buddy app and writes sprite sheets.
//
//   node scripts/capture-mochi-animation.mjs                 writes public/mochi/*.png and
//                                                            src/lib/mochi-animation.generated.ts
//   node scripts/capture-mochi-animation.mjs --contact DIR   also writes a contact sheet per
//                                                            animation (every frame) into DIR
//
// Dev-time only, like extract-sprites.mjs: it needs the Claude Buddy app installed locally,
// because every frame is rendered by the app's own `claude-buddy snapshot` command:
//   claude-buddy snapshot FILE.png [wait|done] [AGE] [ENTER_SECONDS]
// (580x800 PNG, grey background, 12 px per art pixel, bubble at the top, Mochi at the bottom).
// The CLI is looked up in $CLAUDE_BUDDY_CLI, then ~/.claude-buddy/bin/claude-buddy.
//
// How the app animates (measured with this CLI, see README "Mochi animation"):
// - Every frame is a deterministic function of AGE (seconds since Mochi appeared) and
//   ENTER_SECONDS (seconds since the window opened; omitted = entrance finished).
// - The entrance lasts 1.1 s of ENTER; the confetti burst is driven by AGE and is gone by 1.5 s.
//   In the app both clocks start together, so the entrance is captured as snapshot(t, t).
// - The loops are layered procedural animations (stepped layers at 6, 8 and 16 fps plus smooth
//   hops and bobs), so no mood repeats exactly within a sheet-sized window. Each loop below is a
//   real stretch of app frames whose last frame flows into its first: the start ages and lengths
//   were picked by searching for the window whose seam (six frames either side) differs least.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";
import { PNG } from "pngjs";

const CLI = process.env.CLAUDE_BUDDY_CLI || path.join(os.homedir(), ".claude-buddy/bin/claude-buddy");
const CACHE = path.join(os.tmpdir(), "mochi-capture-cache");
const SRC_W = 580, SRC_H = 800;
const ART = 12;   // source px per art pixel
const K = 3;      // downsample factor: sheet px = 3 source px, so an art pixel is 4 sheet px
const CENTER_X = 364; // Mochi's body centre in the app window (on the art grid, x = 4 mod 12)
const BOTTOM_Y = 800; // the window bottom clips Mochi; every sheet is anchored here

// id: sheet name, mood: CLI mood, fps, frames, start: AGE of the first frame,
// enter: capture the entrance (AGE and ENTER advance together).
// Frame i is AGE start + i / fps, i.e. the middle of each 1/fps bin, never on a step edge.
const ENTER_END = 1.7208; // the done loop starts exactly where the entrance ends
const ANIMS = [
  { id: "enter", mood: "done", sheet: "done", fps: 24, frames: 41, start: ENTER_END - 41 / 24, enter: true, loop: false },
  { id: "done", mood: "done", sheet: "done", fps: 24, frames: 94, start: ENTER_END, loop: true },
  { id: "calm", mood: "wait", sheet: "calm", fps: 24, frames: 180, start: 9.1458, loop: true },
  { id: "annoyed", mood: "wait", sheet: "annoyed", fps: 24, frames: 144, start: 62.8125, loop: true },
  { id: "angry", mood: "wait", sheet: "angry", fps: 32, frames: 64, start: 123.7656, loop: true },
];
// The static snapshot each mood's resting frame should look most like (also used by extract-sprites).
const REST_REF = { done: ["done", 90], calm: ["wait", 0], annoyed: ["wait", 90], angry: ["wait", 170] };

// Exact colours of Mochi, his sign and the particles (confetti: yellow y, light blue u, teal t,
// pink b; sparkles y; puffs w; sweat u). Same letters as src/lib/sprites.ts.
const PALETTE = {
  o: "#3d2236", p: "#ffd9b8", s: "#f0a487", h: "#fff3e4", g: "#62c46d", d: "#2f8f4e",
  b: "#ff8fa3", r: "#ff4d5e", w: "#ffffff", u: "#6ec6ff", y: "#ffd23f", t: "#3fd0c0",
  n: "#b8794a", m: "#b03a52", k: "#ff7eb6", c: "#fff6dc",
};
const KEYS = Object.keys(PALETTE);
const RGB = KEYS.map((k) => [1, 3, 5].map((i) => parseInt(PALETTE[k].slice(i, i + 2), 16)));
const OUTLINE = KEYS.indexOf("o") + 1;
const CREAM = KEYS.indexOf("c") + 1; // sign face: the same colour as the bubble paper
const WHITE = KEYS.indexOf("w") + 1; // puffs: the same colour as the project chip text
// Body colours: an outline pixel next to one of these (within one art pixel) is Mochi's outline.
const BODY = new Set(["p", "s", "h", "g", "d", "m", "k", "n", "c", "r"].map((k) => KEYS.indexOf(k) + 1));

// ---------- capture ----------
fs.mkdirSync(CACHE, { recursive: true });
function snapshot(mood, age, enter) {
  const a = age.toFixed(4), e = enter === undefined ? "x" : enter.toFixed(4);
  const file = path.join(CACHE, `${mood}_${a}_${e}.png`);
  if (!fs.existsSync(file)) execFileSync(CLI, ["snapshot", file, mood, a, ...(enter === undefined ? [] : [e])]);
  const png = PNG.sync.read(fs.readFileSync(file));
  if (png.width !== SRC_W || png.height !== SRC_H) throw new Error(`unexpected snapshot size ${png.width}x${png.height}`);
  return png.data;
}
const rgbAt = (d, i) => (d[i * 4] << 16) | (d[i * 4 + 1] << 8) | d[i * 4 + 2];

// 0 = transparent, n = palette index n-1. Exact match only.
const EXACT = new Map(RGB.map(([r, g, b], i) => [(r << 16) | (g << 8) | b, i + 1]));
function nearest(v) {
  const r = v >> 16, g = (v >> 8) & 255, b = v & 255;
  let best = 0, bd = Infinity;
  RGB.forEach(([R, G, B], i) => { const dd = (R - r) ** 2 + (G - g) ** 2 + (B - b) ** 2; if (dd < bd) { bd = dd; best = i + 1; } });
  return Math.sqrt(bd) < 40 ? best : 0; // grey background, soft shadows and blends become transparent
}

// The speech bubble as it looks when nothing is drawn over it. Mochi hops over it for many
// frames, so a plain per-pixel mode can pick his sprout; instead take the frames where his body
// (the bottom of the window) is in its most common pose, the resting pose that sits clear of the
// bubble, and use the per-pixel mode of those (that drops sparkles drifting over it).
function plainMode(frames) {
  const out = new Int32Array(SRC_W * SRC_H);
  const counts = new Map();
  for (let i = 0; i < out.length; i++) {
    counts.clear();
    let best = 0, bn = 0;
    for (const f of frames) { const v = rgbAt(f, i); const n = (counts.get(v) || 0) + 1; counts.set(v, n); if (n > bn) { bn = n; best = v; } }
    out[i] = best;
  }
  return out;
}
function modeImage(frames) {
  const key = (f) => crypto.createHash("md5").update(f.subarray(560 * SRC_W * 4)).digest("hex");
  const groups = new Map();
  for (const f of frames) { const k = key(f); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(f); }
  const rest = [...groups.values()].sort((p, q) => q.length - p.length)[0];
  return plainMode(rest.length >= 3 ? rest : frames);
}

// The bubble region, found geometrically in the reference (which also holds Mochi's most common
// pose, so "not background" is not enough): the largest connected patch of bubble paper, grown by
// the border, plus the tail flood-filled down from the box. Inside it a pixel is Mochi only if it
// has an exact palette colour that differs from the bubble; outside it the nearest palette colour
// is used, which drops the grey background, the soft shadows and anti-aliased blends.
const PAPER = 0xfff6dc, BORDER = [0x3d2236, 0x452d3f, PAPER];
function bubbleGeometry(ref) {
  const N = SRC_W * SRC_H, seen = new Uint8Array(N);
  const comps = [];
  for (let i = 0; i < N; i++) {
    if (seen[i] || ref[i] !== PAPER) continue;
    const stack = [i]; seen[i] = 1;
    let n = 0, x0 = SRC_W, y0 = SRC_H, x1 = 0, y1 = 0;
    while (stack.length) {
      const j = stack.pop(); n++;
      const x = j % SRC_W, y = (j / SRC_W) | 0;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (const k of [j - 1, j + 1, j - SRC_W, j + SRC_W])
        if (k >= 0 && k < N && !seen[k] && ref[k] === PAPER && Math.abs((k % SRC_W) - x) <= 1) { seen[k] = 1; stack.push(k); }
    }
    comps.push({ n, x0, y0, x1, y1 });
  }
  // Mochi's sprout can cut the paper in two while he overlaps the bubble: merge every large
  // patch on the same rows as the largest one.
  comps.sort((p, q) => q.n - p.n);
  let best = comps[0];
  if (!best || best.n < 30) return null; // no bubble on screen
  best = { ...best };
  for (const c of comps.slice(1)) {
    if (c.n < 300) break;
    const overlap = Math.min(c.y1, best.y1) - Math.max(c.y0, best.y0);
    if (overlap > 0.5 * (c.y1 - c.y0)) { best.x0 = Math.min(best.x0, c.x0); best.x1 = Math.max(best.x1, c.x1); best.y0 = Math.min(best.y0, c.y0); best.y1 = Math.max(best.y1, c.y1); }
  }
  // Grow the paper box by the border: each side moves out while that row/column is mostly
  // border colour in the reference (Mochi touching the bubble cannot pass for a whole border row).
  // border = dark pixels (exact outline, or its anti-aliased edge while the bubble scales in)
  const isB = (x, y) => { if (x < 0 || y < 0 || x >= SRC_W || y >= SRC_H) return false; const v = ref[y * SRC_W + x]; return (v >> 16) + ((v >> 8) & 255) + (v & 255) < 330; };
  const rowFrac = (y, x0, x1) => { let n = 0; for (let x = x0; x <= x1; x++) if (isB(x, y)) n++; return n / (x1 - x0 + 1); };
  const colFrac = (x, y0, y1) => { let n = 0; for (let y = y0; y <= y1; y++) if (isB(x, y)) n++; return n / (y1 - y0 + 1); };
  let { x0: bx0, x1: bx1, y0: by0, y1: by1 } = best;
  while (by0 > 0 && rowFrac(by0 - 1, bx0, bx1) > 0.6) by0--;
  while (by1 < SRC_H - 1 && rowFrac(by1 + 1, bx0, bx1) > 0.6) by1++;
  while (bx0 > 0 && colFrac(bx0 - 1, by0, by1) > 0.6) bx0--;
  while (bx1 < SRC_W - 1 && colFrac(bx1 + 1, by0, by1) > 0.6) bx1++;
  // a few px more for the anti-aliased edge of a bubble that is still scaling in
  bx0 = Math.max(0, bx0 - 8); bx1 = Math.min(SRC_W - 1, bx1 + 8); by0 = Math.max(0, by0 - 8); by1 = Math.min(SRC_H - 1, by1 + 2);
  const mask = new Uint8Array(N);
  for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) mask[y * SRC_W + x] = 1;
  // Tail: it starts at the lowest narrow run of paper inside the box (the tail's own paper),
  // grown by the border; then each row down keeps the widest border run inside the previous
  // row's span (the tail only narrows) until a row has none, at most 16 px below the box.
  let span = null, tipY = -1, tx0 = 0, tx1 = 0;
  for (let y = by1; y > by0 && !span; y--) {
    let x = bx0;
    while (x <= bx1 && !span) {
      if (ref[y * SRC_W + x] !== PAPER) { x++; continue; }
      let e = x; while (e + 1 <= bx1 && ref[y * SRC_W + e + 1] === PAPER) e++;
      if (e - x < 120) span = [Math.max(bx0, x - 14), Math.min(bx1, e + 14)];
      x = e + 1;
    }
  }
  for (let y = by1 + 1; span && y < Math.min(SRC_H, by1 + 17); y++) {
    let run = null;
    for (let x = span[0]; x <= span[1]; x++) {
      if (!BORDER.includes(ref[y * SRC_W + x])) continue;
      let e = x; while (e + 1 <= span[1] && BORDER.includes(ref[y * SRC_W + e + 1])) e++;
      if (!run || e - x > run[1] - run[0]) run = [x, e];
      x = e;
    }
    if (!run) break;
    span = run;
    for (let k = run[0]; k <= run[1]; k++) mask[y * SRC_W + k] = 2; // 2 = tail
    tipY = y; tx0 = run[0]; tx1 = run[1];
  }
  return { mask, tip: tipY >= 0 ? { x: (tx0 + tx1 + 1) / 2, y: tipY + 1 } : null };
}
const bubbleMask = (ref) => bubbleGeometry(ref)?.mask ?? null;

function classify(data, ref, mask) {
  const N = SRC_W * SRC_H, idx = new Uint8Array(N);
  const outl = []; // outline-coloured pixels on the bubble: its border and text use the same colour
  for (let i = 0; i < N; i++) {
    const v = rgbAt(data, i);
    if (!mask || !mask[i]) { idx[i] = nearest(v); continue; }
    const e = EXACT.get(v) || 0;
    if (e === OUTLINE) { if (mask[i] !== 2) outl.push(i); } // the tail tip sits on the sprout: never restore it
    else if (e && (ref ? v !== ref[i] : e !== CREAM && e !== WHITE)) idx[i] = e;
  }
  if (!mask) return dropStrayOutline(idx);
  // Peach on the bubble is either Mochi's head (which always reaches below the bubble) or the
  // bubble's own close box (while it pops in): drop peach patches that never leave the bubble.
  const PEACHY = new Set(["p", "s", "h"].map((k) => KEYS.indexOf(k) + 1));
  const seen = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    if (!mask[i] || seen[i] || !PEACHY.has(idx[i])) continue;
    const comp = [i], stack = [i]; seen[i] = 1; let escapes = false;
    while (stack.length) {
      const j = stack.pop(); const x = j % SRC_W;
      for (const k of [j - 1, j + 1, j - SRC_W, j + SRC_W]) {
        if (k < 0 || k >= N || seen[k] || Math.abs((k % SRC_W) - x) > 1 || !PEACHY.has(idx[k])) continue;
        if (!mask[k]) { escapes = true; continue; }
        seen[k] = 1; stack.push(k); comp.push(k);
      }
    }
    if (!escapes) for (const j of comp) idx[j] = 0;
  }
  // Mochi's outline is one art pixel thick around his body: keep an outline pixel on the bubble
  // only if a body colour sits within one art pixel of it along a row or column.
  for (const i of outl) {
    const x = i % SRC_W, y = (i / SRC_W) | 0;
    let near = false;
    for (let d = 1; d < ART - 1 && !near; d++)
      for (const [X, Y] of [[x + d, y], [x - d, y], [x, y + d], [x, y - d]])
        if (X >= 0 && Y >= 0 && X < SRC_W && Y < SRC_H && BODY.has(idx[Y * SRC_W + X])) { near = true; break; }
    if (near) idx[i] = OUTLINE;
  }
  return dropStrayOutline(idx);
}

// Mochi's (and his sign's) outline always borders a body colour; outline-coloured pixels with no
// body colour within one art pixel are bubble-border edges that a scaling bubble left behind.
function dropStrayOutline(idx) {
  const drop = [];
  for (let i = 0; i < idx.length; i++) {
    if (idx[i] !== OUTLINE) continue;
    const x = i % SRC_W, y = (i / SRC_W) | 0;
    let near = false;
    for (let d = 1; d <= ART && !near; d++)
      for (const [X, Y] of [[x + d, y], [x - d, y], [x, y + d], [x, y - d]])
        if (X >= 0 && Y >= 0 && X < SRC_W && Y < SRC_H && BODY.has(idx[Y * SRC_W + X])) { near = true; break; }
    if (!near) drop.push(i);
  }
  for (const i of drop) idx[i] = 0;
  return idx;
}

// Downsample by K: the most common index in each K x K block (ties go to the centre pixel).
function downsample(idx, box) {
  const [x0, y0, x1, y1] = box;
  const w = (x1 - x0) / K, h = (y1 - y0) / K;
  const out = new Uint8Array(w * h);
  const c = new Uint16Array(KEYS.length + 1);
  for (let by = 0; by < h; by++) for (let bx = 0; bx < w; bx++) {
    c.fill(0);
    for (let dy = 0; dy < K; dy++) for (let dx = 0; dx < K; dx++) {
      const X = x0 + bx * K + dx, Y = y0 + by * K + dy;
      c[X >= 0 && X < SRC_W && Y >= 0 && Y < SRC_H ? idx[Y * SRC_W + X] : 0]++;
    }
    const cx = x0 + bx * K + (K >> 1), cy = y0 + by * K + (K >> 1);
    let best = cx >= 0 && cx < SRC_W && cy >= 0 && cy < SRC_H ? idx[cy * SRC_W + cx] : 0;
    for (let v = 0; v < c.length; v++) if (c[v] > c[best]) best = v;
    out[by * w + bx] = best;
  }
  return { w, h, data: out };
}

// ---------- indexed PNG writer (pngjs only writes truecolour) ----------
const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = (buf) => { let c = -1; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function writeIndexedPng(file, w, h, pix, used) {
  // compact palette: index 0 transparent, then only the colours this sheet uses
  const map = new Uint8Array(KEYS.length + 1);
  const pal = [[0, 0, 0]];
  used.forEach((u) => { map[u] = pal.length; pal.push(RGB[u - 1]); });
  const depth = pal.length <= 2 ? 1 : pal.length <= 4 ? 2 : pal.length <= 16 ? 4 : 8;
  const perByte = 8 / depth, stride = Math.ceil(w / perByte);
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0; // filter: none (best for flat indexed art)
    for (let x = 0; x < w; x++) {
      const v = map[pix[y * w + x]];
      const o = y * (stride + 1) + 1 + Math.floor(x / perByte);
      raw[o] |= v << (8 - depth * (1 + (x % perByte)));
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = depth; ihdr[9] = 3; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("PLTE", Buffer.from(pal.flat())),
    chunk("tRNS", Buffer.from([0])),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9, memLevel: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  fs.writeFileSync(file, png);
  return png.length;
}

// ---------- main ----------
const args = process.argv.slice(2);
const contactDir = args[0] === "--contact" ? args[1] : null;

const frameTimes = (a) => Array.from({ length: a.frames }, (_, i) => +(a.start + i / a.fps).toFixed(4));
const grab = (a, t) => (a.enter ? snapshot(a.mood, t, t) : snapshot(a.mood, t));

// 1. classify every frame at full resolution
const results = {};
const loopRefs = {};
for (const a of ANIMS.filter((x) => !x.enter)) {
  const frames = frameTimes(a).map((t) => grab(a, t));
  const ref = modeImage(frames);
  loopRefs[a.id] = ref;
  const mask = bubbleMask(ref);
  results[a.id] = { frames: frames.map((f) => classify(f, ref, mask)), ref };
}
{
  const a = ANIMS.find((x) => x.enter);
  // From ENTER 1.1 s the bubble is the done loop's bubble. While it pops in and types it is
  // anchored to Mochi's head, so there is no fixed reference: find it in the frame itself. Mochi
  // is drawn in front of it; on the bubble keep his exact colours except the paper cream and the
  // chip-text white (done Mochi has no sign and no puffs), outline by adjacency.
  const doneRef = results.done.ref, doneMask = bubbleMask(doneRef);
  const frames = frameTimes(a).map((t) => {
    const f = grab(a, t);
    if (t >= 1.1) return classify(f, doneRef, doneMask);
    const own = new Int32Array(SRC_W * SRC_H).map((_, i) => rgbAt(f, i));
    return classify(f, null, bubbleMask(own));
  });
  results.enter = { frames };
}

// 2. one crop box for every sheet: same width and bottom, centred on Mochi's body; the
//    entrance is taller (he jumps clear of the window bottom).
function extent(frames) {
  let x0 = SRC_W, x1 = 0, y0 = SRC_H;
  for (const f of frames) for (let i = 0; i < f.length; i++) if (f[i]) {
    const x = i % SRC_W, y = (i / SRC_W) | 0;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y;
  }
  return { x0, x1, y0 };
}
const ext = Object.fromEntries(Object.entries(results).map(([id, r]) => [id, extent(r.frames)]));
const up = (v) => Math.ceil(v / ART) * ART;
const half = up(Math.max(...Object.values(ext).map((e) => Math.max(CENTER_X - e.x0, e.x1 + 1 - CENTER_X))));
const loopTop = Math.min(...ANIMS.filter((a) => !a.enter).map((a) => ext[a.id].y0));
const loopH = up(BOTTOM_Y - loopTop);
const enterH = Math.max(loopH, up(BOTTOM_Y - ext.enter.y0));
const boxFor = (a) => [CENTER_X - half, BOTTOM_Y - (a.enter ? enterH : loopH), CENTER_X + half, BOTTOM_Y];

// Where the app's bubble tail points, in sheet px from the frame's top-left.
function bubbleTip(ref, box) {
  const tip = bubbleGeometry(ref)?.tip;
  return tip ? { x: +((tip.x - box[0]) / K).toFixed(2), y: +((tip.y - box[1]) / K).toFixed(2) } : null;
}

// Resting (reduced-motion) frame: the frame closest to the static snapshot of that mood.
function restFrame(a, sheetFrames, box) {
  if (a.enter) return sheetFrames.length - 1; // settled at the end of the entrance
  const [mood, age] = REST_REF[a.id];
  const ref = results[a.id].ref;
  const target = downsample(classify(snapshot(mood, age), ref, bubbleMask(ref)), box).data;
  let best = 0, bd = Infinity;
  sheetFrames.forEach((f, i) => { let d = 0; for (let j = 0; j < f.length; j++) if (f[j] !== target[j]) d++; if (d < bd) { bd = d; best = i; } });
  return best;
}

fs.mkdirSync("public/mochi", { recursive: true });
const manifest = {};
let total = 0;
for (const a of ANIMS) {
  const box = boxFor(a);
  const small = results[a.id].frames.map((f) => downsample(f, box));
  const fw = small[0].w, fh = small[0].h, n = small.length;
  const sheet = new Uint8Array(fw * n * fh);
  const used = new Set();
  small.forEach((f, i) => { for (let y = 0; y < fh; y++) for (let x = 0; x < fw; x++) { const v = f.data[y * fw + x]; sheet[y * fw * n + i * fw + x] = v; if (v) used.add(v); } });
  const file = `public/mochi/${a.id === "enter" ? "enter" : `${a.id}-loop`}.png`;
  const bytes = writeIndexedPng(file, fw * n, fh, sheet, [...used].sort((x, y) => x - y));
  total += bytes;
  const tipRef = a.enter ? results.done.ref : results[a.id].ref;
  manifest[a.id] = {
    src: "/" + file.replace(/^public\//, ""),
    frames: n,
    frameWidth: fw,
    frameHeight: fh,
    // one art pixel is `sheetPxPerArtPx` sheet px: at PixelSprite scale s, a sheet px is s / 4 CSS px
    sheetPxPerArtPx: ART / K,
    fps: a.fps,
    durationMs: Math.round((n / a.fps) * 1000),
    loop: a.loop,
    restFrame: restFrame(a, small.map((s) => s.data), box),
    bubbleTip: bubbleTip(tipRef, box),
    bytes,
  };
  console.log(`${file}: ${n} frames ${fw}x${fh} @${a.fps}fps, ${(bytes / 1024).toFixed(1)} KB, rest frame ${manifest[a.id].restFrame}`);

  if (contactDir) {
    fs.mkdirSync(contactDir, { recursive: true });
    const cols = 12, Z = 2, pad = 4, rows = Math.ceil(n / cols);
    const out = new PNG({ width: cols * (fw * Z + pad), height: rows * (fh * Z + pad) });
    for (let i = 0; i < out.data.length; i += 4) { out.data[i] = 0xff; out.data[i + 1] = 0xff; out.data[i + 2] = 0xff; out.data[i + 3] = 255; }
    small.forEach((f, i) => {
      const ox = (i % cols) * (fw * Z + pad), oy = Math.floor(i / cols) * (fh * Z + pad);
      for (let y = 0; y < fh * Z; y++) for (let x = 0; x < fw * Z; x++) {
        const v = f.data[Math.floor(y / Z) * fw + Math.floor(x / Z)];
        const o = ((oy + y) * out.width + ox + x) * 4;
        const c = v ? RGB[v - 1] : (((x >> 3) + (y >> 3)) & 1 ? [0x9a, 0x9a, 0x9a] : [0x8c, 0x8c, 0x8c]);
        out.data[o] = c[0]; out.data[o + 1] = c[1]; out.data[o + 2] = c[2];
      }
    });
    fs.writeFileSync(path.join(contactDir, `contact-${a.id}.png`), PNG.sync.write(out));
  }
}
console.log(`total ${(total / 1024).toFixed(1)} KB`);

const body = `// Generated by scripts/capture-mochi-animation.mjs from real claude-buddy frames. Do not edit.
import type { MoodId } from "./moods";

export interface MochiSheet {
  /** URL of the horizontal sprite sheet (frames laid out left to right). */
  src: string;
  frames: number;
  /** One frame, in sheet px. Every sheet shares the same width and bottom edge (Mochi's base). */
  frameWidth: number;
  frameHeight: number;
  /** Sheet px per art pixel: at PixelSprite scale s, one sheet px is s / sheetPxPerArtPx CSS px. */
  sheetPxPerArtPx: number;
  fps: number;
  durationMs: number;
  loop: boolean;
  /** Frame shown when motion is reduced. */
  restFrame: number;
  /** Where the app's speech-bubble tail points, in sheet px from the frame's top-left. */
  bubbleTip: { x: number; y: number } | null;
  bytes: number;
}

export const MOCHI_LOOPS: Record<MoodId, MochiSheet> = ${JSON.stringify({ done: manifest.done, calm: manifest.calm, annoyed: manifest.annoyed, angry: manifest.angry }, null, 2)};

/** The entrance (done mood): Mochi rises from the window bottom with a confetti burst. */
export const MOCHI_ENTER: MochiSheet = ${JSON.stringify(manifest.enter, null, 2)};
`;
fs.writeFileSync("src/lib/mochi-animation.generated.ts", body);
console.log("wrote src/lib/mochi-animation.generated.ts");
