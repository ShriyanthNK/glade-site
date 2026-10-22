import type { MoodId } from "./moods";
import { SPRITES as GENERATED, HOOT_PALETTE } from "./sprites.generated";

export interface SpriteFrame { width: number; height: number; rows: string[] }
export interface Rect { x: number; y: number; w: number; h: number; fill: string }

// One char per art pixel (the palette index in base 36); see HOOT_PALETTE in sprites.generated.ts.
export const PALETTE: Record<string, string> = HOOT_PALETTE;

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
