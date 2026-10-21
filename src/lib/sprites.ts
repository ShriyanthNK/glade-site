import type { MoodId } from "./moods";
import { SPRITES as GENERATED } from "./sprites.generated";

export interface SpriteFrame { width: number; height: number; rows: string[] }
export interface Rect { x: number; y: number; w: number; h: number; fill: string }

// One char per art pixel. Exact colours sampled from the claude-buddy snapshots.
// Keep in sync with scripts/extract-sprites.mjs.
export const PALETTE: Record<string, string> = {
  o: "#3d2236", // outline
  p: "#ffd9b8", // peach
  s: "#f0a487", // peach shadow
  h: "#fff3e4", // highlight
  g: "#62c46d", // sprout light
  d: "#2f8f4e", // sprout dark
  b: "#ff8fa3", // blush
  r: "#ff4d5e", // sprite's own red (angry blush, sign marks)
  w: "#ffffff", // white
  u: "#6ec6ff", // sweat blue
  y: "#ffd23f", // sparkle
  n: "#b8794a", // sign wood
  m: "#b03a52", // mouth dark
  k: "#ff7eb6", // tongue
  c: "#fff6dc", // sign face cream
};

export const SPRITES: Record<MoodId, SpriteFrame> = GENERATED;

export function spriteToRects(frame: SpriteFrame, palette: Record<string, string>): Rect[] {
  const rects: Rect[] = [];
  frame.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === ".") { x++; continue; }
      const fill = palette[ch];
      if (!fill) throw new Error(`Unknown palette char "${ch}" at ${x},${y}`);
      let run = 1;
      while (x + run < row.length && row[x + run] === ch) run++;
      rects.push({ x, y, w: run, h: 1, fill });
      x += run;
    }
  });
  return rects;
}
