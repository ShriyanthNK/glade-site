import fs from "node:fs";
import path from "node:path";

// The page may only say what docs/FACTS.md lists. This is a tripwire for the claims we must not invent:
// price, notarization, social proof, and the like. Extend the list when something new must never appear.
const FILES = [
  "src/app/layout.tsx",
  ...fs.readdirSync("src/components/sections").map((f) => path.join("src/components/sections", f)),
  "src/components/Footer.tsx",
].filter((f) => f.endsWith(".tsx"));

const BANNED: [RegExp, string][] = [
  [/\bfree\b/i, "price claim"],
  [/\$\s?\d/, "price"],
  [/notariz/i, "notarization"],
  [/\bsigned\b/i, "signing"],
  [/app store/i, "store claim"],
  [/\b(trusted by|loved by|\d+\s*(users|stars|downloads|reviews))\b/i, "social proof"],
  [/\b(no tracking|zero telemetry|private by design|end-to-end)\b/i, "privacy claim beyond FACTS.md"],
  [/\bMochi\b/, "the old mascot"],
  [/claude-buddy/i, "the old name"],
];

describe("the page does not claim what it must not", () => {
  const text = FILES.map((f) => [f, fs.readFileSync(f, "utf8")] as const);
  for (const [re, why] of BANNED) {
    it(`never says: ${why}`, () => {
      const hits = text.filter(([, t]) => re.test(t)).map(([f]) => f);
      expect(hits).toEqual([]);
    });
  }
  it("keeps the independence disclaimer", () => {
    expect(fs.readFileSync("src/components/Footer.tsx", "utf8")).toMatch(/Not affiliated with or endorsed by Anthropic/);
  });
});
