// Builds the 1200x630 share image: node scripts/make-og.mjs
// Needs Playwright, which is NOT a project dependency: run `npm i --no-save playwright` first
// (and `npx playwright install chromium` if no browser is installed).
// Output: src/app/opengraph-image.png and src/app/twitter-image.png (identical).
import fs from "node:fs";
import { createRequire } from "node:module";
const read = (p) => fs.readFileSync(new URL(p, import.meta.url));
const { chromium } = createRequire(import.meta.url)("playwright");
const { PNG } = createRequire(import.meta.url)("pngjs");

const W = 1200, H = 630, BG_SCALE = 3; // backdrop is 480x270: 3x keeps nearest-neighbour crisp
const name = /name:\s*"([^"]+)"/.exec(read("../site.config.ts").toString())[1];
const sprites = read("../src/lib/sprites.generated.ts").toString();
const frame = JSON.parse(
  sprites.slice(sprites.indexOf("{", sprites.indexOf("export const SPRITES")), sprites.lastIndexOf("}") + 1).replace(/,(\s*[}\]])/g, "$1"),
).done;
const pal = Object.fromEntries(
  [...read("../src/lib/sprites.generated.ts").toString().matchAll(/^\s+(\w): "(#[0-9a-fA-F]{6})"/gm)].map((m) => [m[1], m[2]]),
);
let rects = "";
frame.rows.forEach((row, y) => {
  for (let x = 0; x < row.length; ) {
    const ch = row[x];
    if (ch === ".") { x++; continue; }
    let run = 1;
    while (row[x + run] === ch) run++;
    rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${pal[ch]}"/>`;
    x += run;
  }
});
const b64 = (p) => read(p).toString("base64");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Bricolage;font-weight:200 800;src:url(data:font/woff2;base64,${b64("./fonts/bricolage-grotesque-latin.woff2")})}
@font-face{font-family:Mono;font-weight:500 800;src:url(data:font/woff2;base64,${b64("./fonts/jetbrains-mono-latin.woff2")})}
:root{--outline:#3b2230;--paper:#fff4dc;--teal:#2ba89a;--sparkle:#ffd23f}
*{box-sizing:border-box;margin:0}
body{width:${W}px;height:${H}px;overflow:hidden;position:relative;background:#2a1a26;font-family:Bricolage,sans-serif;color:var(--paper)}
.bg{position:absolute;left:-${(480 * BG_SCALE - W) / 2}px;top:0;width:${480 * BG_SCALE}px;height:${270 * BG_SCALE}px;image-rendering:pixelated;background:url(data:image/png;base64,${b64("../public/backdrop.png")}) 0 0/100% 100%}
.scrim{position:absolute;inset:0;background:linear-gradient(90deg,rgba(42,26,38,.8) 0%,rgba(42,26,38,.62) 48%,rgba(42,26,38,.1) 72%,rgba(42,26,38,0) 100%)}
.copy{position:absolute;left:72px;top:172px;width:720px}
.brand{font-size:40px;font-weight:800;letter-spacing:-.01em;color:var(--sparkle)}
h1{margin-top:14px;font-size:94px;font-weight:800;line-height:1.02;letter-spacing:-.03em}
.hoot{position:absolute;left:880px;top:290px;image-rendering:pixelated}
.bubble{position:absolute;left:770px;top:52px;width:380px;filter:drop-shadow(0 8px 0 rgba(0,0,0,.28))}
.bubble .box{background:var(--paper);color:var(--outline);padding:24px 28px;font-family:Mono,monospace;box-shadow:0 -8px 0 var(--outline),0 8px 0 var(--outline),-8px 0 0 var(--outline),8px 0 0 var(--outline)}
.bubble .row{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}
.bubble .t{font-size:33px;font-weight:800;line-height:1.12}
.bubble .x{width:34px;height:34px;flex:none;border:4px solid var(--outline);background:#ffd9b8;font-weight:800;font-size:18px;display:grid;place-items:center}
.chip{display:inline-block;margin-top:16px;background:var(--teal);color:var(--outline);padding:5px 12px;font-size:22px;font-weight:800}
.tail{position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:8px}
.tail i{display:block;margin:0 auto;height:8px;background:var(--outline)}
</style><body>
<div class="bg"></div><div class="scrim"></div>
<div class="copy"><div class="brand">${esc(name)}</div><h1>Give your<br>terminal a<br>forest.</h1></div>
<div class="bubble"><div class="box"><div class="row"><div class="t">CLAUDE'S DONE, YOUR TURN</div><div class="x">x</div></div><div class="chip">&gt; my-project</div></div>
<div class="tail"><i style="width:24px"></i><i style="width:16px"></i><i style="width:8px"></i></div></div>
<svg class="hoot" width="${frame.width * 10}" height="${frame.height * 10}" viewBox="0 0 ${frame.width} ${frame.height}" shape-rendering="crispEdges">${rects}</svg>
</body>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
const raw = await page.screenshot({ type: "png" });
await browser.close();

// Re-encode as a 256-colour indexed PNG (frequent colours kept, the rest snapped to the nearest):
// the page is flat pixel art plus a soft scrim, so this is visually lossless and a fraction of the size.
import zlib from "node:zlib";
const img = PNG.sync.read(raw);
const counts = new Map();
for (let i = 0; i < img.data.length; i += 4) { const k = img.data.readUInt32BE(i) >>> 8; counts.set(k, (counts.get(k) ?? 0) + 1); }
const palette = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]).slice(0, 256).map(([k]) => k);
const rgb = (k) => [k >> 16, (k >> 8) & 255, k & 255];
const nearest = new Map();
const indexOf = (k) => {
  if (nearest.has(k)) return nearest.get(k);
  const [r, g, b] = rgb(k);
  let best = 0, bd = Infinity;
  palette.forEach((pk, i) => { const [pr, pg, pb] = rgb(pk); const d = (pr - r) ** 2 + (pg - g) ** 2 + (pb - b) ** 2; if (d < bd) { bd = d; best = i; } });
  nearest.set(k, best);
  return best;
};
const rows = Buffer.alloc((W + 1) * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) rows[y * (W + 1) + 1 + x] = indexOf(img.data.readUInt32BE((y * W + x) * 4) >>> 8);
const chunk = (type, data) => {
  const head = Buffer.alloc(8); head.writeUInt32BE(data.length); head.write(type, 4);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(Buffer.concat([head.subarray(4), data])));
  return Buffer.concat([head, data, crc]);
};
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 3;
const out = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("PLTE", Buffer.from(palette.flatMap(rgb))),
  chunk("IDAT", zlib.deflateSync(rows, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);
for (const f of ["opengraph-image.png", "twitter-image.png"]) fs.writeFileSync(new URL(`../src/app/${f}`, import.meta.url), out);
console.log(`wrote og/twitter images (${(out.length / 1024).toFixed(0)} KB)`);
