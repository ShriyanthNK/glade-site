// @vitest-environment node
import { BACKDROP_HEIGHT, BACKDROP_WIDTH, encodeBackdrop, renderBackdrop } from "./make-backdrop.mjs";

const lin = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = (r: number, g: number, b: number) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

describe("renderBackdrop", () => {
  it("has the expected virtual resolution", () => {
    const img = renderBackdrop();
    expect(img.width).toBe(BACKDROP_WIDTH);
    expect(img.height).toBe(BACKDROP_HEIGHT);
    expect(img.width / img.height).toBeCloseTo(16 / 9, 2);
    expect(img.data.length).toBe(img.width * img.height * 4);
  });

  it("is deterministic", () => {
    const a = encodeBackdrop(renderBackdrop());
    const b = encodeBackdrop(renderBackdrop());
    expect(Buffer.compare(a, b)).toBe(0);
  });

  it("uses a restrained palette", () => {
    const { data } = renderBackdrop();
    const colours = new Set<number>();
    for (let i = 0; i < data.length; i += 4) colours.add((data[i] << 16) | (data[i + 1] << 8) | data[i + 2]);
    expect(colours.size).toBeGreaterThanOrEqual(12);
    expect(colours.size).toBeLessThanOrEqual(24);
  });

  it("stays dark enough for light copy (no pixel above the luminance budget)", () => {
    const { data, width, height } = renderBackdrop();
    let max = 0;
    let maxFooter = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const l = luminance(data[i], data[i + 1], data[i + 2]);
        max = Math.max(max, l);
        if (y >= height - 32) maxFooter = Math.max(maxFooter, l);
      }
    }
    expect(max).toBeLessThanOrEqual(0.16);
    expect(maxFooter).toBeLessThanOrEqual(0.09);
  });

  it("encodes to a small, opaque PNG of the same size", () => {
    const buf = encodeBackdrop(renderBackdrop());
    expect(buf.length).toBeLessThan(200 * 1024);
    expect(buf.subarray(1, 4).toString("latin1")).toBe("PNG");
    // IHDR: width and height are big-endian u32 at bytes 16 and 20.
    expect(buf.readUInt32BE(16)).toBe(BACKDROP_WIDTH);
    expect(buf.readUInt32BE(20)).toBe(BACKDROP_HEIGHT);
  });
});
