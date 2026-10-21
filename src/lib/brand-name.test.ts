import { siteConfig } from "../../site.config";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const NAME = "Claude Buddy";

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

function stripComments(s: string) {
  return s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/\s\/\/ .*$/gm, "");
}

describe("product name has a single source", () => {
  it("is not hard-coded anywhere in src/", () => {
    const offenders = walk(ROOT)
      .filter((f) => /\.(tsx?|css|svg|json|md)$/.test(f) && !/\.test\.(tsx?)$/.test(f))
      .filter((f) => stripComments(fs.readFileSync(f, "utf8")).includes(NAME))
      .map((f) => path.relative(ROOT, f));
    expect(offenders).toEqual([]);
  });

  it("is defined in site.config.ts", () => {
    expect(siteConfig.name.trim().length).toBeGreaterThan(0);
  });
});
