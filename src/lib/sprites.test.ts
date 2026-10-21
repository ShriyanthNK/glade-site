import { PALETTE, SPRITES, spriteToRects } from "./sprites";
import type { MoodId } from "./moods";

const palette = { o: "#000000", p: "#ffffff" };

describe("spriteToRects", () => {
  it("skips transparent pixels and merges horizontal runs", () => {
    const rects = spriteToRects({ width: 4, height: 2, rows: [".oop", "o..."] }, palette);
    expect(rects).toEqual([
      { x: 1, y: 0, w: 2, h: 1, fill: "#000000" },
      { x: 3, y: 0, w: 1, h: 1, fill: "#ffffff" },
      { x: 0, y: 1, w: 1, h: 1, fill: "#000000" },
    ]);
  });
  it("throws on an unknown palette char", () => {
    expect(() => spriteToRects({ width: 1, height: 1, rows: ["z"] }, palette)).toThrow(/z/);
  });
});

describe("SPRITES integrity", () => {
  for (const id of Object.keys(SPRITES) as MoodId[]) {
    it(`${id} is rectangular and uses known palette chars`, () => {
      const f = SPRITES[id];
      expect(f.rows.length).toBe(f.height);
      f.rows.forEach((row) => {
        expect(row.length).toBe(f.width);
        for (const ch of row) expect(ch === "." || ch in PALETTE).toBe(true);
      });
      expect(() => spriteToRects(f, PALETTE)).not.toThrow();
    });
  }
});
