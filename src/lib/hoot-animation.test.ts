import fs from "node:fs";
import path from "node:path";
// @ts-expect-error pngjs (dev dependency) ships no type declarations
import { PNG } from "pngjs";
import { HOOT_ENTER, HOOT_LOOPS, type HootSheet } from "./hoot-animation.generated";

const sheets: [string, HootSheet][] = [...Object.entries(HOOT_LOOPS), ["enter", HOOT_ENTER]];
const file = (s: HootSheet) => path.join(process.cwd(), "public", s.src);

describe("Hoot animation manifest", () => {
  for (const [id, s] of sheets) {
    describe(id, () => {
      it("points at a sheet that exists under public/", () => {
        expect(s.src).toMatch(/^\/hoot\/[a-z-]+\.png$/);
        expect(fs.existsSync(file(s))).toBe(true);
      });
      it("has a PNG laid out as frames x frameWidth by frameHeight", () => {
        const png = PNG.sync.read(fs.readFileSync(file(s)));
        expect(png.width).toBe(s.frames * s.frameWidth);
        expect(png.height).toBe(s.frameHeight);
        expect(s.bytes).toBe(fs.statSync(file(s)).size);
      });
      it("has consistent timing and a valid resting frame", () => {
        expect(s.frames).toBeGreaterThan(1);
        expect(s.durationMs).toBe(Math.round((s.frames / s.fps) * 1000));
        expect(s.restFrame).toBeGreaterThanOrEqual(0);
        expect(s.restFrame).toBeLessThan(s.frames);
        expect(s.loop).toBe(id !== "enter");
      });
    });
  }

  it("shares one frame width and art scale, so moods swap without jitter", () => {
    const widths = new Set(sheets.map(([, s]) => s.frameWidth));
    const loopHeights = new Set(Object.values(HOOT_LOOPS).map((s) => s.frameHeight));
    expect(widths.size).toBe(1);
    expect(loopHeights.size).toBe(1);
    expect(new Set(sheets.map(([, s]) => s.sheetPxPerArtPx)).size).toBe(1);
    expect(HOOT_ENTER.frameHeight).toBeGreaterThanOrEqual([...loopHeights][0]);
  });

  it("keeps every new asset small (under 400 KB in total)", () => {
    const total = sheets.reduce((n, [, s]) => n + fs.statSync(file(s)).size, 0);
    expect(total).toBeLessThan(400 * 1024);
  });

  it("knows where each mood's bubble tail points", () => {
    for (const s of Object.values(HOOT_LOOPS)) {
      expect(s.bubbleTip).not.toBeNull();
      expect(s.bubbleTip!.y).toBeGreaterThan(0);
      expect(s.bubbleTip!.y).toBeLessThan(s.frameHeight);
    }
  });
});
