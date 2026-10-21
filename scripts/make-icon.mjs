// Builds src/app/icon.svg from the "done" sprite (padded to a square). Run: node scripts/make-icon.mjs
import fs from "node:fs";
const src = fs.readFileSync(new URL("../src/lib/sprites.generated.ts", import.meta.url), "utf8");
const body = src.slice(src.indexOf("export const SPRITES"));
const frame = JSON.parse(body.slice(body.indexOf("{"), body.lastIndexOf("}") + 1).replace(/,(\s*[}\]])/g, "$1").replace(/^\{/, "{")).done;
const pal = fs.readFileSync(new URL("../src/lib/sprites.ts", import.meta.url), "utf8");
const P = Object.fromEntries([...pal.matchAll(/^\s+(\w): "(#[0-9a-fA-F]{6})"/gm)].map((m) => [m[1], m[2]]));
const size = Math.max(frame.width, frame.height);
const ox = Math.floor((size - frame.width) / 2), oy = size - frame.height;
let out = "";
frame.rows.forEach((row, y) => {
  for (let x = 0; x < row.length; ) {
    const ch = row[x];
    if (ch === ".") { x++; continue; }
    let run = 1;
    while (row[x + run] === ch) run++;
    out += `<rect x="${x + ox}" y="${y + oy}" width="${run}" height="1" fill="${P[ch]}"/>`;
    x += run;
  }
});
fs.writeFileSync(new URL("../src/app/icon.svg", import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${out}</svg>\n`);
