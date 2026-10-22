// Exports Hoot, the owl mascot, from the code the art was designed and reviewed in.
//
//   node scripts/export-hoot.mjs [--source PATH]
//
// Writes public/hoot/*.png (horizontal sprite sheets), src/lib/hoot-animation.generated.ts and
// src/lib/sprites.generated.ts. Dev-time only: it needs the glade app repo next to this one, because the
// sprite is drawn by design/mascots/mascots.js there (the same drawing code the macOS app ports line for line
// and tests pixel for pixel). Default source: ../glade/design/mascots/mascots.js, or $HOOT_SOURCE.
//
// Animation: every mood loops seamlessly over LOOP_T seconds. The entrance is the app's own pop-up motion
// (hop up from below with squash and stretch) applied to Hoot's "done" mood.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import zlib from "node:zlib";

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined; };
const SOURCE = path.resolve(arg("--source") || process.env.HOOT_SOURCE || "../glade/design/mascots/mascots.js");
if (!fs.existsSync(SOURCE)) { console.error(`Cannot find ${SOURCE}. Clone the glade app repo next to this one, or pass --source.`); process.exit(1); }
const { drawOwl, LOOP_T } = createRequire(import.meta.url)(SOURCE);

const FPS = 24, ART = 4;            // sheet px per art pixel
const FW = 160, FH_LOOP = 128;      // frame width is shared by every sheet; the entrance frame is taller
const ENTER_SECONDS = 1.0, ENTER_PAD = 48, FH_ENTER = FH_LOOP + ENTER_PAD;
const APP_SCALE = 6;                // the macOS pop-up draws 6 px per art pixel; entrance offsets are in those px

// The app's entrance keyframes (Sources/Glade/Views.swift: enterKeys): dy in app px (down), x/y squash and stretch.
const ENTER_KEYS = [
  { t: 0.00, dy: 240, sx: 0.90, sy: 1.15 }, { t: 0.26, dy: -16, sx: 0.88, sy: 1.22 }, { t: 0.38, dy: 0, sx: 1.24, sy: 0.72 },
  { t: 0.52, dy: -8, sx: 0.92, sy: 1.10 }, { t: 0.64, dy: 0, sx: 1.08, sy: 0.92 }, { t: 0.82, dy: 0, sx: 1, sy: 1 },
];
function sampleKeys(keys, t) {
  if (t <= keys[0].t) return keys[0];
  const last = keys[keys.length - 1];
  if (t >= last.t) return last;
  let i = 0; while (keys[i + 1].t < t) i++;
  const a = keys[i], b = keys[i + 1], x = (t - a.t) / (b.t - a.t), u = x * x * (3 - 2 * x);
  return { dy: a.dy + (b.dy - a.dy) * u, sx: a.sx + (b.sx - a.sx) * u, sy: a.sy + (b.sy - a.sy) * u };
}

// site mood -> Hoot mood ("calm" on the site is the app's first waiting tier)
const SITE_MOODS = { done: "done", calm: "waiting", annoyed: "annoyed", angry: "angry" };
const hexRgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

function renderFrame(hootMood, t, fh, tr) {
  const { px } = drawOwl(hootMood, t);
  const out = new Uint8Array(FW * fh);   // palette indexes, 0 = transparent
  const dy = (tr.dy * ART) / APP_SCALE;
  for (let Y = 0; Y < fh; Y++) for (let X = 0; X < FW; X++) {
    const x = (X + 0.5 - FW / 2) / tr.sx, y = (Y + 0.5 - (fh + dy)) / tr.sy;
    const u = Math.floor((x + 16 * ART) / ART), v = Math.floor((y + 32 * ART) / ART);
    if (u < 0 || u >= 32 || v < 0 || v >= 32) continue;
    out[Y * FW + X] = px[v * 32 + u];
  }
  return out;
}

// Hoot uses 16 colours, so the sheets are written as indexed PNGs (about a quarter of the size of RGBA).
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0); out.write(type, 4, "ascii"); Buffer.from(data).copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
function writeSheet(file, frames, fh) {
  const width = frames.length * FW, pal = drawOwl("calm", 0).pal;
  const raw = Buffer.alloc((width + 1) * fh);
  for (let y = 0; y < fh; y++) {
    raw[y * (width + 1)] = 0;   // filter: none (identical frames compress as repeats)
    frames.forEach((f, k) => Buffer.from(f.buffer, f.byteOffset + y * FW, FW).copy(raw, y * (width + 1) + 1 + k * FW));
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(fh, 4); ihdr[8] = 8; ihdr[9] = 3;
  const plte = Buffer.alloc(pal.length * 3), trns = Buffer.alloc(pal.length, 255); trns[0] = 0;
  pal.forEach((c, i) => { const [r, g, b] = c ? hexRgb(c) : [0, 0, 0]; plte[i * 3] = r; plte[i * 3 + 1] = g; plte[i * 3 + 2] = b; });
  const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("PLTE", plte), chunk("tRNS", trns),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9, memLevel: 9 })), chunk("IEND", Buffer.alloc(0))]);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, png);
  return png.length;
}

const IDENT = { dy: 0, sx: 1, sy: 1 };
const sheets = {};
// entrance: Hoot's "done" mood while the app's pop-up motion plays
{
  const n = Math.round(ENTER_SECONDS * FPS), frames = [];
  for (let i = 0; i < n; i++) { const t = (i + 0.37) / FPS; frames.push(renderFrame("done", t, FH_ENTER, sampleKeys(ENTER_KEYS, t))); }
  sheets.enter = { file: "enter", frames: n, fh: FH_ENTER, loop: false, bytes: writeSheet("public/hoot/enter.png", frames, FH_ENTER), rest: n - 1 };
}
// loops: the done loop starts where the entrance ends, so the hero flows from one into the other
for (const [site, hoot] of Object.entries(SITE_MOODS)) {
  const n = Math.round(LOOP_T * FPS), t0 = site === "done" ? ENTER_SECONDS : 0, frames = [];
  for (let i = 0; i < n; i++) frames.push(renderFrame(hoot, t0 + (i + 0.37) / FPS, FH_LOOP, IDENT));
  sheets[site] = { file: site, frames: n, fh: FH_LOOP, loop: true, bytes: writeSheet(`public/hoot/${site}.png`, frames, FH_LOOP), rest: Math.round(0.4 * FPS) };
}

const entry = (id, s) => {
  const top = (s.fh - FH_LOOP) + 12;    // Hoot's ear tufts start about 3 art px from the top of the 128 px sprite box
  return `  ${JSON.stringify(id)}: {
    "src": "/hoot/${s.file}.png",
    "frames": ${s.frames},
    "frameWidth": ${FW},
    "frameHeight": ${s.fh},
    "sheetPxPerArtPx": ${ART},
    "fps": ${FPS},
    "durationMs": ${Math.round((s.frames / FPS) * 1000)},
    "loop": ${s.loop},
    "restFrame": ${s.rest},
    "bubbleTip": { "x": ${FW / 2}, "y": ${top} },
    "bytes": ${s.bytes}
  }`;
};
fs.writeFileSync("src/lib/hoot-animation.generated.ts", `// Generated by scripts/export-hoot.mjs from the glade app's mascot source. Do not edit.
import type { MoodId } from "./moods";

export interface HootSheet {
  /** URL of the horizontal sprite sheet (frames laid out left to right). */
  src: string;
  frames: number;
  /** One frame, in sheet px. Every sheet shares the same width and bottom edge (Hoot's feet). */
  frameWidth: number;
  frameHeight: number;
  /** Sheet px per art pixel: at PixelSprite scale s, one sheet px is s / sheetPxPerArtPx CSS px. */
  sheetPxPerArtPx: number;
  fps: number;
  durationMs: number;
  loop: boolean;
  /** Frame shown when motion is reduced. */
  restFrame: number;
  /** Where a speech bubble's tail should point (just above Hoot's head), in sheet px from the frame's top-left. */
  bubbleTip: { x: number; y: number } | null;
  bytes: number;
}

export const HOOT_LOOPS: Record<MoodId, HootSheet> = {
${Object.keys(SITE_MOODS).map((m) => entry(m, sheets[m])).join(",\n")}
};

export const HOOT_ENTER: HootSheet = ${entry("enter", sheets.enter).trim().replace(/^"enter": /, "")};
`);

// static sprites (PixelSprite, favicon, share image): one resting frame per mood
const PAL = drawOwl("calm", 0).pal;
const palEntries = PAL.map((c, i) => (c ? `  ${i.toString(36)}: ${JSON.stringify(c)},` : null)).filter(Boolean).join("\n");
const frameOf = (m) => {
  const { px } = drawOwl(m, 0.4), rows = [];
  for (let y = 0; y < 32; y++) rows.push([...px.slice(y * 32, y * 32 + 32)].map((v) => (v ? v.toString(36) : ".")).join(""));
  return `  ${JSON.stringify(Object.keys(SITE_MOODS).find((k) => SITE_MOODS[k] === m))}: { "width": 32, "height": 32, "rows": ${JSON.stringify(rows, null, 6).replace(/\n\s*\]/, "\n    ]")} }`;
};
fs.writeFileSync("src/lib/sprites.generated.ts", `// Generated by scripts/export-hoot.mjs from the glade app's mascot source. Do not edit.
import type { MoodId } from "./moods";
import type { SpriteFrame } from "./sprites";

/** One char per art pixel: the char is the palette index in base 36. "." is transparent. */
export const HOOT_PALETTE: Record<string, string> = {
${palEntries}
};

export const SPRITES: Record<MoodId, SpriteFrame> = {
${Object.values(SITE_MOODS).map(frameOf).join(",\n")}
};
`);
let total = 0; for (const s of Object.values(sheets)) { total += s.bytes; console.log(`${s.file}: ${s.frames} frames, ${(s.bytes / 1024).toFixed(0)} KB`); }
console.log(`total ${(total / 1024).toFixed(0)} KB`);
