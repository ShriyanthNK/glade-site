# Mochi Launch Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and locally serve a Next.js launch page for Claude Buddy whose hero is a live demo of Mochi popping up, with a drag-to-age mood slider.

**Architecture:** Static Next.js App Router site. Sprites are extracted once from real `claude-buddy snapshot` PNGs into generated pixel-map data, rendered as SVG rects. Moods, copy and age thresholds live in one pure module that both the hero demo and the slider consume. All owner-supplied values (download URL, price, etc.) live in `site.config.ts`.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Vitest + Testing Library, `pngjs` (dev, extraction only), `next/font` (Bricolage Grotesque, JetBrains Mono).

**Spec:** `docs/superpowers/specs/2026-10-21-mochi-launch-page-design.md`

## Global Constraints

- Page background ink plum `#2A1A26`; outline plum `#3B2230`; paper `#FFF4DC`; peach `#FFD9B8`, shadow `#EFA68A`; sprout green `#5DC46A`; teal `#2BA89A`; alert red `#C8203A`; sparkle yellow `#FFD23F`; blush `#FF8FA8`.
- JetBrains Mono 800 only for Mochi's voice (bubbles, tags, CLI snippets); Bricolage Grotesque for everything else.
- One 8px grid unit shared by sprites, bubble borders, sparkles.
- Motion only: hero pop-in, mood slider, idle sprout bob. No scroll fades, no per-card hover effects. `prefers-reduced-motion` shows static end states.
- Exactly one primary action ("Download for Mac"), repeated once at the bottom. Hero copy: headline "Stop watching the terminal."; subhead "Mochi pops up when Claude Code finishes or needs your OK, then gets out of the way."
- No invented testimonials, counts, prices or privacy claims. Unverified items are placeholders in `site.config.ts`.
- Mood copy verbatim from the app: "CLAUDE'S DONE, YOUR TURN"; "CLAUDE'S WAITING ON YOU" with body "Claude needs your permission to use Bash"; "STILL WAITING..."; "HELLOOO? CLAUDE NEEDS YOU" (alert red).
- macOS 13+. Menu-bar only, no Dock icon.
- Responsive to phone width, visible focus, WCAG AA contrast.
- No server code, no env vars. Vercel-ready.

---

## File Structure

```
mochi-launch/
  package.json, tsconfig.json, next.config.ts, vitest.config.ts
  site.config.ts                    owner-supplied placeholders
  scripts/
    extract-sprites.mjs             PNG snapshot -> pixel maps
    snapshots/                      committed source PNGs (wait-0, wait-90, wait-170, done-0)
  src/
    app/
      layout.tsx                    fonts, metadata
      globals.css                   tokens, base
      page.tsx                      assembles sections
    lib/
      moods.ts                      MoodId, copy, thresholds, moodForAge
      moods.test.ts
      sprites.generated.ts          generated pixel maps (committed)
      sprites.ts                    palette + spriteToRects (pure)
      sprites.test.ts
    components/
      PixelSprite.tsx               SVG renderer
      Bubble.tsx                    pixel speech bubble
      MochiStage.tsx                sprite + bubble for a MoodId
      MockDesktop.tsx               hero demo
      MoodSlider.tsx                age slider + done toggle
      MoodSlider.test.tsx
      sections/
        Nav.tsx, Hero.tsx, Facts.tsx, Problem.tsx,
        HowItWorks.tsx, Faq.tsx, FinalCta.tsx
```

---

### Task 1: Scaffold, tokens, fonts, test runner

**Files:**
- Create: project via `create-next-app` in `~/mochi-launch`; `vitest.config.ts`; `site.config.ts`
- Modify: `src/app/layout.tsx`, `src/app/globals.css`, `package.json`
- Test: `src/lib/smoke.test.ts` (deleted at end of task)

**Interfaces:**
- Produces: `siteConfig` from `site.config.ts` (`{ downloadUrl: string; githubUrl: string; version: string; price: string | null }`); CSS variables `--ink --outline --paper --peach --peach-shadow --sprout --teal --alert --sparkle --blush`; font variables `--font-display`, `--font-mono`.

- [ ] **Step 1: Scaffold into the existing repo**

```bash
cd ~/mochi-launch
npx create-next-app@latest . --ts --app --tailwind --eslint --src-dir --import-alias "@/*" --use-npm --yes
```
Expected: app created; existing `docs/` kept. If it refuses because the directory is not empty, run it in `/tmp/mochi-scaffold` (use the scratchpad directory) and copy everything except `.git` into `~/mochi-launch`.

- [ ] **Step 2: Add test tooling**

```bash
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom pngjs
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

Create `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Add to `package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 3: Write a smoke test, run it**

`src/lib/smoke.test.ts`:

```ts
import { siteConfig } from "../../site.config";

test("site config exposes placeholders", () => {
  expect(siteConfig.downloadUrl).toBeTruthy();
});
```

Run: `npm test`
Expected: FAIL, cannot find `site.config`.

- [ ] **Step 4: Create `site.config.ts`**

```ts
// Owner-supplied values. Replace the placeholders before launch.
export const siteConfig = {
  downloadUrl: "#download", // TODO(owner): real .dmg / install link
  githubUrl: "https://github.com/ShriyanthNK/mochi-launch",
  version: "0.1",
  price: null as string | null, // null hides price copy until confirmed
};
```

- [ ] **Step 5: Run the test, expect PASS, then delete the smoke test**

Run: `npm test` → PASS. `rm src/lib/smoke.test.ts`.

- [ ] **Step 6: Tokens and fonts**

Replace `src/app/globals.css` with:

```css
@import "tailwindcss";

:root {
  --ink: #2a1a26;
  --outline: #3b2230;
  --paper: #fff4dc;
  --peach: #ffd9b8;
  --peach-shadow: #efa68a;
  --sprout: #5dc46a;
  --teal: #2ba89a;
  --alert: #c8203a;
  --sparkle: #ffd23f;
  --blush: #ff8fa8;
  --unit: 8px;
}

@theme inline {
  --color-ink: var(--ink);
  --color-outline: var(--outline);
  --color-paper: var(--paper);
  --color-peach: var(--peach);
  --color-peach-shadow: var(--peach-shadow);
  --color-sprout: var(--sprout);
  --color-teal: var(--teal);
  --color-alert: var(--alert);
  --color-sparkle: var(--sparkle);
  --color-blush: var(--blush);
  --font-display: var(--font-display);
  --font-mono: var(--font-mono);
}

html { background: var(--ink); color: var(--paper); }
body { font-family: var(--font-display), system-ui, sans-serif; line-height: 1.55; }
:focus-visible { outline: 3px solid var(--sparkle); outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "800"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Claude Buddy: Mochi taps you when Claude Code is done",
  description:
    "A menu-bar Mac app. Mochi pops up when Claude Code finishes or needs your OK, then gets out of the way.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Verify and commit**

Run: `npm run build`. Expected: build succeeds.

```bash
git add -A
git commit -m "feat: scaffold Next.js app with tokens, fonts, vitest"
```
(Commit messages in this repo end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.)

---

### Task 2: Mood model (age to mood, copy)

**Files:**
- Create: `src/lib/moods.ts`
- Test: `src/lib/moods.test.ts`

**Interfaces:**
- Produces:
  - `type MoodId = "done" | "calm" | "annoyed" | "angry"`
  - `interface MoodDef { id: MoodId; title: string; body?: string; tone: "normal" | "alert" }`
  - `const MOODS: Record<MoodId, MoodDef>`
  - `const THRESHOLDS: { annoyed: number; angry: number }` (seconds)
  - `function moodForWait(ageSeconds: number): MoodId`
  - `const MAX_WAIT_SECONDS = 180`

- [ ] **Step 1: Find the app's real thresholds**

```bash
S=scripts/snapshots/probe; mkdir -p $S
for a in 10 20 30 40 50 60 70 80 90 100 110 120 130 140 150 160 170; do
  ~/.claude-buddy/bin/claude-buddy snapshot $S/w-$a.png wait $a >/dev/null
done
md5 -r $S/*.png | sort -k2 -V
```
Expected: groups of identical hashes mark mood tiers (idle bob frames may differ slightly; compare hashes of adjacent ages and note where the group changes). Narrow each boundary by repeating at 1-second steps. Record the two boundary seconds. If frames never hash-match because of animation, compare visually with the Read tool on a few ages instead. Delete `scripts/snapshots/probe` afterwards.

- [ ] **Step 2: Write the failing test** (use the boundaries found; `60` and `150` below are placeholders to be replaced with the measured values)

```ts
import { MOODS, THRESHOLDS, moodForWait, MAX_WAIT_SECONDS } from "./moods";

describe("moodForWait", () => {
  it("is calm at the start", () => expect(moodForWait(0)).toBe("calm"));
  it("stays calm just below the annoyed threshold", () =>
    expect(moodForWait(THRESHOLDS.annoyed - 1)).toBe("calm"));
  it("is annoyed at the annoyed threshold", () =>
    expect(moodForWait(THRESHOLDS.annoyed)).toBe("annoyed"));
  it("is angry at the angry threshold", () =>
    expect(moodForWait(THRESHOLDS.angry)).toBe("angry"));
  it("is angry at the give-up age", () =>
    expect(moodForWait(MAX_WAIT_SECONDS)).toBe("angry"));
});

describe("MOODS copy", () => {
  it("matches the app verbatim", () => {
    expect(MOODS.done.title).toBe("CLAUDE'S DONE, YOUR TURN");
    expect(MOODS.calm.title).toBe("CLAUDE'S WAITING ON YOU");
    expect(MOODS.calm.body).toBe("Claude needs your permission to use Bash");
    expect(MOODS.annoyed.title).toBe("STILL WAITING...");
    expect(MOODS.angry.title).toBe("HELLOOO? CLAUDE NEEDS YOU");
    expect(MOODS.angry.tone).toBe("alert");
  });
});
```

Run: `npx vitest run src/lib/moods.test.ts` → FAIL (module missing).

- [ ] **Step 3: Implement** (substitute the measured thresholds)

```ts
export type MoodId = "done" | "calm" | "annoyed" | "angry";

export interface MoodDef {
  id: MoodId;
  title: string;
  body?: string;
  tone: "normal" | "alert";
}

const WAIT_BODY = "Claude needs your permission to use Bash";

export const MOODS: Record<MoodId, MoodDef> = {
  done: { id: "done", title: "CLAUDE'S DONE, YOUR TURN", tone: "normal" },
  calm: { id: "calm", title: "CLAUDE'S WAITING ON YOU", body: WAIT_BODY, tone: "normal" },
  annoyed: { id: "annoyed", title: "STILL WAITING...", body: WAIT_BODY, tone: "normal" },
  angry: { id: "angry", title: "HELLOOO? CLAUDE NEEDS YOU", body: WAIT_BODY, tone: "alert" },
};

// Seconds of waiting at which Mochi changes mood. Measured from `claude-buddy snapshot`.
export const THRESHOLDS = { annoyed: 60, angry: 150 };
export const MAX_WAIT_SECONDS = 180; // giveUpAfter default

export function moodForWait(ageSeconds: number): MoodId {
  if (ageSeconds >= THRESHOLDS.angry) return "angry";
  if (ageSeconds >= THRESHOLDS.annoyed) return "annoyed";
  return "calm";
}
```

- [ ] **Step 4: Run tests, expect PASS. Commit**

```bash
npx vitest run src/lib/moods.test.ts
git add src/lib/moods.ts src/lib/moods.test.ts && git commit -m "feat: mood model with app-verbatim copy"
```

---

### Task 3: Sprite extraction, pixel maps, renderer

**Files:**
- Create: `scripts/extract-sprites.mjs`, `scripts/snapshots/{done-0,wait-0,wait-90,wait-170}.png`, `src/lib/sprites.generated.ts`, `src/lib/sprites.ts`, `src/components/PixelSprite.tsx`
- Test: `src/lib/sprites.test.ts`

**Interfaces:**
- Consumes: `MoodId` from `src/lib/moods.ts`.
- Produces:
  - `interface SpriteFrame { width: number; height: number; rows: string[] }` (one char per art pixel; `.` is transparent)
  - `const PALETTE: Record<string, string>` (char to hex)
  - `const SPRITES: Record<MoodId, SpriteFrame>` (from `sprites.generated.ts`)
  - `interface Rect { x: number; y: number; w: number; h: number; fill: string }`
  - `function spriteToRects(frame: SpriteFrame, palette: Record<string,string>): Rect[]` (merges horizontal runs)
  - `<PixelSprite mood: MoodId; scale?: number; className?: string; title?: string />`

- [ ] **Step 1: Write the failing test for `spriteToRects`**

```ts
import { spriteToRects } from "./sprites";

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
```

Run: `npx vitest run src/lib/sprites.test.ts` → FAIL.

- [ ] **Step 2: Implement `src/lib/sprites.ts`**

```ts
import type { MoodId } from "./moods";
import { SPRITES as GENERATED } from "./sprites.generated";

export interface SpriteFrame { width: number; height: number; rows: string[] }
export interface Rect { x: number; y: number; w: number; h: number; fill: string }

// One char per art pixel. Keep in sync with scripts/extract-sprites.mjs.
export const PALETTE: Record<string, string> = {
  o: "#3b2230", // outline
  p: "#ffd9b8", // peach
  s: "#efa68a", // peach shadow
  h: "#fff4dc", // highlight
  g: "#5dc46a", // sprout light
  d: "#2f9a52", // sprout dark
  b: "#ff8fa8", // blush
  r: "#c8203a", // alert red
  w: "#ffffff", // white
  u: "#6cc4ff", // sweat blue
  y: "#ffd23f", // sparkle
  t: "#2ba89a", // teal
  n: "#b5764a", // sign wood
  m: "#a0304a", // mouth dark
  k: "#ff7aa0", // tongue
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
```

- [ ] **Step 3: Copy source snapshots into the repo**

```bash
S=/private/tmp/claude-501/-Users-shriyanthnandakumar/28be019a-ce96-4868-8ccf-2cfd01d896a5/scratchpad/mochi
mkdir -p scripts/snapshots
cp $S/done-0.png $S/wait-0.png $S/wait-90.png $S/wait-170.png scripts/snapshots/
```
If the scratchpad is gone, regenerate: `~/.claude-buddy/bin/claude-buddy snapshot scripts/snapshots/done-0.png done 0` (and `wait 0`, `wait 90`, `wait 170`).

- [ ] **Step 4: Write `scripts/extract-sprites.mjs`**

Approach: each snapshot is an upscaled pixel-art render on a flat grey background with a soft drop shadow. Find the art-pixel size, crop to the sprite (excluding the bubble), sample the centre of each cell, snap to the nearest palette colour, treat background and shadow as transparent.

```js
import fs from "node:fs";
import { PNG } from "pngjs";

// Usage: node scripts/extract-sprites.mjs --probe <png>
//        node scripts/extract-sprites.mjs --preview <png> <scale> <ox> <oy> <x0> <y0> <x1> <y1>
//        node scripts/extract-sprites.mjs            (writes src/lib/sprites.generated.ts)

const PALETTE = {
  o: "#3b2230", p: "#ffd9b8", s: "#efa68a", h: "#fff4dc", g: "#5dc46a", d: "#2f9a52",
  b: "#ff8fa8", r: "#c8203a", w: "#ffffff", u: "#6cc4ff", y: "#ffd23f", t: "#2ba89a",
  n: "#b5764a", m: "#a0304a", k: "#ff7aa0",
};

// Per-mood crop in source pixels, found with --preview. Fill after probing.
const JOBS = {
  done:    { file: "scripts/snapshots/done-0.png",  scale: 12, ox: 0, oy: 0, box: [180, 440, 560, 800] },
  calm:    { file: "scripts/snapshots/wait-0.png",  scale: 12, ox: 0, oy: 0, box: [180, 480, 560, 800] },
  annoyed: { file: "scripts/snapshots/wait-90.png", scale: 12, ox: 0, oy: 0, box: [180, 410, 560, 800] },
  angry:   { file: "scripts/snapshots/wait-170.png",scale: 12, ox: 0, oy: 0, box: [180, 410, 560, 800] },
};

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const PAL = Object.entries(PALETTE).map(([k, v]) => [k, hex(v)]);

function load(file) { return PNG.sync.read(fs.readFileSync(file)); }
function px(png, x, y) {
  const i = (png.width * y + x) * 4;
  return [png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3]];
}
function nearest(rgb) {
  let best = null, bestD = Infinity;
  for (const [k, c] of PAL) {
    const d = (c[0]-rgb[0])**2 + (c[1]-rgb[1])**2 + (c[2]-rgb[2])**2;
    if (d < bestD) { bestD = d; best = k; }
  }
  return { key: best, dist: Math.sqrt(bestD) };
}

function extract({ file, scale, ox, oy, box }) {
  const png = load(file);
  const [x0, y0, x1, y1] = box;
  const rows = [];
  for (let y = y0 + oy; y + scale <= y1; y += scale) {
    let row = "";
    for (let x = x0 + ox; x + scale <= x1; x += scale) {
      const c = px(png, x + (scale >> 1), y + (scale >> 1));
      const { key, dist } = nearest(c);
      row += dist < 40 ? key : "."; // far from every palette colour = bg or shadow
    }
    rows.push(row);
  }
  // Trim empty leading/trailing rows and shared empty columns.
  const keepRows = rows.filter((r) => /[^.]/.test(r));
  const width = Math.max(...keepRows.map((r) => r.length));
  let minC = width, maxC = 0;
  for (const r of keepRows) for (let i = 0; i < r.length; i++) if (r[i] !== ".") { minC = Math.min(minC, i); maxC = Math.max(maxC, i); }
  const trimmed = keepRows.map((r) => r.slice(minC, maxC + 1));
  return { width: maxC - minC + 1, height: trimmed.length, rows: trimmed };
}

const [, , flag, ...args] = process.argv;

if (flag === "--probe") {
  // Print the most common horizontal run lengths: the art-pixel size is their gcd-ish mode.
  const png = load(args[0]);
  const counts = new Map();
  for (let y = 0; y < png.height; y += 5) {
    let x = 0;
    while (x < png.width) {
      const c = px(png, x, y).join(); let n = 1;
      while (x + n < png.width && px(png, x + n, y).join() === c) n++;
      counts.set(n, (counts.get(n) ?? 0) + 1); x += n;
    }
  }
  console.log([...counts].sort((a, b) => b[1] - a[1]).slice(0, 8));
} else if (flag === "--preview") {
  const [file, scale, ox, oy, a, b, c, d] = args;
  const f = extract({ file, scale: +scale, ox: +ox, oy: +oy, box: [+a, +b, +c, +d] });
  console.log(`${f.width}x${f.height}`);
  console.log(f.rows.join("\n"));
} else {
  const out = {};
  for (const [mood, job] of Object.entries(JOBS)) out[mood] = extract(job);
  const body = `// Generated by scripts/extract-sprites.mjs from real claude-buddy snapshots. Do not edit.\nimport type { SpriteFrame } from "./sprites";\nimport type { MoodId } from "./moods";\n\nexport const SPRITES: Record<MoodId, SpriteFrame> = ${JSON.stringify(out, null, 2)};\n`;
  fs.writeFileSync("src/lib/sprites.generated.ts", body);
  console.log("wrote src/lib/sprites.generated.ts");
}
```

- [ ] **Step 5: Find the art-pixel size and alignment**

```bash
node scripts/extract-sprites.mjs --probe scripts/snapshots/done-0.png
```
Expected: the most common run length is a multiple of the art pixel (likely 12). Set `scale` accordingly. If sprite edges look shifted in the preview, adjust `ox`/`oy` (0 to scale-1) until outlines are continuous.

- [ ] **Step 6: Preview and tune each crop**

```bash
node scripts/extract-sprites.mjs --preview scripts/snapshots/done-0.png 12 0 0 180 440 560 800
```
Expected: ASCII art of Mochi. Check: outline `o` is continuous, eyes and mouth are intact, no bubble rows leak in (bubble outline would appear as an `o` frame above him). Adjust the `box` top edge to exclude the bubble tail, but keep sparkles (`y`) and signs (`n`). Repeat for `wait-0`, `wait-90`, `wait-170`, then put the final values into `JOBS`.

The bottom of the sprite is clipped by the snapshot window. That is expected: the hero shows him peeking up from the bottom edge of the screen.

- [ ] **Step 7: Generate the data and re-run the test**

```bash
node scripts/extract-sprites.mjs
npx vitest run src/lib/sprites.test.ts
```
Expected: `wrote src/lib/sprites.generated.ts`; tests PASS (`spriteToRects` throws on unknown chars, so unmapped colours would fail the render in Step 8).

- [ ] **Step 8: Add `PixelSprite`, check all four moods render**

`src/components/PixelSprite.tsx`:

```tsx
import type { MoodId } from "@/lib/moods";
import { PALETTE, SPRITES, spriteToRects } from "@/lib/sprites";

interface Props { mood: MoodId; scale?: number; className?: string; title?: string }

export function PixelSprite({ mood, scale = 8, className, title }: Props) {
  const frame = SPRITES[mood];
  const rects = spriteToRects(frame, PALETTE);
  return (
    <svg
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      width={frame.width * scale}
      height={frame.height * scale}
      viewBox={`0 0 ${frame.width} ${frame.height}`}
      shapeRendering="crispEdges"
      className={className}
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.fill} />
      ))}
    </svg>
  );
}
```

Temporarily render all four in `src/app/page.tsx`, run `npm run dev`, open http://localhost:3000, and compare each against the matching PNG in `scripts/snapshots/`. Fix extraction crops or palette until they match. Then revert `page.tsx`.

- [ ] **Step 9: Commit**

```bash
git add scripts src/lib src/components/PixelSprite.tsx
git commit -m "feat: extract Mochi sprites from app snapshots; SVG renderer"
```

---

### Task 4: Bubble and MochiStage

**Files:**
- Create: `src/components/Bubble.tsx`, `src/components/MochiStage.tsx`

**Interfaces:**
- Consumes: `MOODS`, `MoodId` from `@/lib/moods`; `PixelSprite`.
- Produces:
  - `<Bubble title: string; body?: string; project?: string; tone?: "normal" | "alert"; className?: string />`
  - `<MochiStage mood: MoodId; project?: string; scale?: number; bob?: boolean />` (bubble above sprite, tail pointing at him)

- [ ] **Step 1: Implement `Bubble`**

Pixel border via stacked box-shadows on an 8px unit; tail is an 8px-stepped triangle from three small blocks.

```tsx
interface Props {
  title: string;
  body?: string;
  project?: string;
  tone?: "normal" | "alert";
  className?: string;
}

export function Bubble({ title, body, project = "my-project", tone = "normal", className = "" }: Props) {
  return (
    <div className={`relative inline-block ${className}`} style={{ filter: "drop-shadow(0 8px 0 rgba(0,0,0,.25))" }}>
      <div
        className="font-mono bg-paper text-outline px-6 py-5 max-w-[34rem]"
        style={{
          boxShadow:
            "0 -8px 0 0 var(--outline), 0 8px 0 0 var(--outline), -8px 0 0 0 var(--outline), 8px 0 0 0 var(--outline)",
        }}
      >
        <div className="flex items-start justify-between gap-6">
          <p
            className="text-lg sm:text-xl font-extrabold leading-tight"
            style={{ fontWeight: 800, color: tone === "alert" ? "var(--alert)" : "var(--outline)" }}
          >
            {title}
          </p>
          <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center border-4 border-outline bg-peach text-sm font-extrabold">x</span>
        </div>
        {body && <p className="mt-2 text-sm sm:text-base font-medium opacity-80">{body}</p>}
        <p className="mt-3 inline-block bg-teal px-2 py-1 text-sm font-extrabold text-paper">&gt; {project}</p>
      </div>
      <div aria-hidden className="absolute left-1/2 top-full -translate-x-1/2">
        <div className="mx-auto h-2 w-6 bg-outline" />
        <div className="mx-auto h-2 w-4 bg-outline" />
        <div className="mx-auto h-2 w-2 bg-outline" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement `MochiStage`**

```tsx
import { MOODS, type MoodId } from "@/lib/moods";
import { Bubble } from "./Bubble";
import { PixelSprite } from "./PixelSprite";

interface Props { mood: MoodId; project?: string; scale?: number; bob?: boolean }

export function MochiStage({ mood, project, scale = 8, bob = true }: Props) {
  const m = MOODS[mood];
  return (
    <figure className="flex flex-col items-center gap-3" aria-live="polite">
      <Bubble title={m.title} body={m.body} tone={m.tone} project={project} />
      <PixelSprite mood={mood} scale={scale} className={bob ? "mochi-bob" : undefined} title={`Mochi, ${m.title.toLowerCase()}`} />
    </figure>
  );
}
```

Add to `globals.css`:

```css
@keyframes mochi-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.mochi-bob { animation: mochi-bob 1.6s steps(2, jump-none) infinite; }
```

- [ ] **Step 3: Visual check against snapshots**

Temporarily render `<MochiStage mood="done" />` and `mood="angry"` on the page; compare to `done-0.png` and `wait-170.png` (bubble colours, red title, tag). Revert.

- [ ] **Step 4: Commit**

```bash
git add src/components src/app/globals.css
git commit -m "feat: pixel Bubble and MochiStage"
```

---

### Task 5: Mood slider (tested)

**Files:**
- Create: `src/components/MoodSlider.tsx`
- Test: `src/components/MoodSlider.test.tsx`

**Interfaces:**
- Consumes: `moodForWait`, `MAX_WAIT_SECONDS`, `MOODS`, `MoodId`; `MochiStage`.
- Produces: `<MoodSlider />` (client component). A labelled range input `0 to MAX_WAIT_SECONDS`, a "Claude finished" toggle button (`aria-pressed`), a live status line, and a `MochiStage`.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { MoodSlider } from "./MoodSlider";
import { THRESHOLDS, MAX_WAIT_SECONDS } from "@/lib/moods";

describe("MoodSlider", () => {
  it("starts calm", () => {
    render(<MoodSlider />);
    expect(screen.getByText("CLAUDE'S WAITING ON YOU")).toBeInTheDocument();
  });

  it("changes mood as the wait grows", () => {
    render(<MoodSlider />);
    const slider = screen.getByRole("slider", { name: /how long claude has waited/i });
    fireEvent.change(slider, { target: { value: String(THRESHOLDS.annoyed) } });
    expect(screen.getByText("STILL WAITING...")).toBeInTheDocument();
    fireEvent.change(slider, { target: { value: String(MAX_WAIT_SECONDS) } });
    expect(screen.getByText("HELLOOO? CLAUDE NEEDS YOU")).toBeInTheDocument();
  });

  it("shows the done mood when toggled", () => {
    render(<MoodSlider />);
    fireEvent.click(screen.getByRole("button", { name: /claude finished/i }));
    expect(screen.getByText("CLAUDE'S DONE, YOUR TURN")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toBeDisabled();
  });
});
```

Run: `npx vitest run src/components/MoodSlider.test.tsx` → FAIL.

- [ ] **Step 2: Implement**

```tsx
"use client";
import { useState } from "react";
import { MAX_WAIT_SECONDS, moodForWait, type MoodId } from "@/lib/moods";
import { MochiStage } from "./MochiStage";

export function MoodSlider() {
  const [age, setAge] = useState(0);
  const [done, setDone] = useState(false);
  const mood: MoodId = done ? "done" : moodForWait(age);

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
      <div className="max-w-md">
        <label htmlFor="wait" className="block text-xl font-semibold">
          How long Claude has waited
        </label>
        <input
          id="wait"
          type="range"
          min={0}
          max={MAX_WAIT_SECONDS}
          step={1}
          value={age}
          disabled={done}
          onChange={(e) => setAge(Number(e.target.value))}
          className="mt-4 w-full accent-[var(--sparkle)] disabled:opacity-40"
        />
        <p className="mt-2 font-mono text-sm" aria-hidden>{done ? "finished" : `${age}s`}</p>
        <button
          type="button"
          aria-pressed={done}
          onClick={() => setDone((d) => !d)}
          className="mt-6 border-4 border-paper px-4 py-2 font-mono text-sm font-extrabold aria-pressed:bg-paper aria-pressed:text-outline"
        >
          Claude finished
        </button>
      </div>
      <MochiStage mood={mood} scale={8} />
    </div>
  );
}
```

Note: the `sr-only` live status comes from `MochiStage`'s `aria-live` region, so screen readers hear each new bubble title.

- [ ] **Step 3: Run tests, expect PASS. Commit**

```bash
npx vitest run src/components/MoodSlider.test.tsx
git add src/components/MoodSlider.tsx src/components/MoodSlider.test.tsx
git commit -m "feat: mood slider with done toggle"
```

---

### Task 6: Hero and mock-desktop demo

**Files:**
- Create: `src/components/MockDesktop.tsx`, `src/components/sections/Nav.tsx`, `src/components/sections/Hero.tsx`

**Interfaces:**
- Consumes: `siteConfig`, `MochiStage`/`Bubble`/`PixelSprite`.
- Produces: `<Nav />`, `<Hero />` (server components wrapping the client `<MockDesktop />`). `MockDesktop` runs: `working` for about 2.6s (terminal lines appear), then `done` (Mochi slides up from the bottom edge, bubble shown). Replay button resets. Under `prefers-reduced-motion`, it starts in `done`.

- [ ] **Step 1: Implement `MockDesktop`** (client)

```tsx
"use client";
import { useEffect, useState } from "react";
import { Bubble } from "./Bubble";
import { MOODS } from "@/lib/moods";
import { PixelSprite } from "./PixelSprite";

const LINES = [
  "> refactor the auth middleware",
  "Reading src/middleware.ts",
  "Editing src/middleware.ts",
  "Running tests... 42 passed",
];

export function MockDesktop() {
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<"working" | "done">("working");
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setShown(LINES.length); setPhase("done"); return; }
    setPhase("working"); setShown(0);
    const timers = LINES.map((_, i) => window.setTimeout(() => setShown(i + 1), 500 + i * 550));
    timers.push(window.setTimeout(() => setPhase("done"), 500 + LINES.length * 550 + 300));
    return () => timers.forEach(clearTimeout);
  }, [run]);

  const m = MOODS.done;
  return (
    <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border-4 border-outline bg-[#3a2a47] shadow-2xl" style={{ aspectRatio: "16 / 10" }}>
      <div className="flex items-center gap-2 bg-black/30 px-4 py-2 font-mono text-xs text-paper/70">
        <span aria-hidden className="h-3 w-3 rounded-full bg-alert" />
        <span aria-hidden className="h-3 w-3 rounded-full bg-sparkle" />
        <span aria-hidden className="h-3 w-3 rounded-full bg-sprout" />
        <span className="ml-3">claude: my-project</span>
      </div>
      <pre className="m-4 w-[min(22rem,70%)] rounded-lg bg-ink/80 p-4 font-mono text-xs leading-6 text-paper sm:text-sm">
        {LINES.slice(0, shown).map((l) => <span key={l} className="block">{l}</span>)}
        {phase === "working" && <span className="block text-sparkle">working...</span>}
        {phase === "done" && <span className="block text-sprout">done</span>}
      </pre>
      <div
        className={`absolute bottom-0 right-6 flex flex-col items-center gap-3 transition-transform duration-500 ease-out ${phase === "done" ? "translate-y-0" : "translate-y-[120%]"}`}
        aria-live="polite"
      >
        <Bubble title={m.title} className="scale-75 sm:scale-100 origin-bottom" />
        <PixelSprite mood="done" scale={6} className="mochi-bob" title="Mochi pops up: Claude's done" />
      </div>
      <button
        type="button"
        onClick={() => setRun((r) => r + 1)}
        className="absolute left-4 bottom-4 border-4 border-paper/70 px-3 py-1 font-mono text-xs font-extrabold text-paper hover:bg-paper hover:text-outline"
      >
        Replay
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Implement `Nav` and `Hero`**

`Nav.tsx`:

```tsx
import { siteConfig } from "../../../site.config";

export function Nav() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
      <a href="#top" className="text-xl font-extrabold tracking-tight">Claude Buddy</a>
      <nav className="flex items-center gap-6 text-sm">
        <a href={siteConfig.githubUrl} className="underline-offset-4 hover:underline">GitHub</a>
        <a href={siteConfig.downloadUrl} className="bg-paper px-4 py-2 font-semibold text-outline">Download</a>
      </nav>
    </header>
  );
}
```

`Hero.tsx`:

```tsx
import { siteConfig } from "../../../site.config";
import { MockDesktop } from "../MockDesktop";

export function Hero() {
  return (
    <section id="top" className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-10 md:pt-16">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl">
          Stop watching the terminal.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-paper/80">
          Mochi pops up when Claude Code finishes or needs your OK, then gets out of the way.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a id="download" href={siteConfig.downloadUrl} className="bg-sparkle px-6 py-3 text-lg font-bold text-outline">
            Download for Mac
          </a>
          <span className="font-mono text-sm text-paper/70">macOS 13+</span>
        </div>
      </div>
      <MockDesktop />
    </section>
  );
}
```

- [ ] **Step 3: Wire into `page.tsx` temporarily and check**

```tsx
import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";

export default function Page() {
  return (<><Nav /><main><Hero /></main></>);
}
```
Run `npm run dev`; at http://localhost:3000 confirm: the terminal lines appear, Mochi slides up with the done bubble, Replay works, and with OS "reduce motion" on the final state shows immediately. Check the layout at 390px wide.

- [ ] **Step 4: Commit**

```bash
git add src && git commit -m "feat: hero with mock-desktop demo"
```

---

### Task 7: Remaining sections and page assembly

**Files:**
- Create: `src/components/sections/{Facts,Problem,Moods,HowItWorks,Faq,FinalCta}.tsx`, `src/components/Footer.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `MoodSlider`, `PixelSprite`, `siteConfig`.
- Produces: section components with no props; `page.tsx` renders in order Nav, Hero, Facts, Problem, Moods, HowItWorks, Faq, FinalCta, Footer.

- [ ] **Step 1: Facts** (only verified claims)

```tsx
const FACTS = [
  "Menu-bar only. No Dock icon.",
  "Listens to Claude Code through its hooks, on your Mac.",
  "macOS 13 or later.",
];

export function Facts() {
  return (
    <section aria-label="Quick facts" className="border-y-4 border-outline bg-[#33202e]">
      <ul className="mx-auto grid max-w-6xl gap-3 px-5 py-6 sm:grid-cols-3">
        {FACTS.map((f) => <li key={f} className="font-mono text-sm text-paper/90">{f}</li>)}
      </ul>
    </section>
  );
}
```

Note: "on your Mac" is true of the Unix-socket hook design; the broader privacy statement stays out until the owner confirms.

- [ ] **Step 2: Problem**

```tsx
export function Problem() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-24">
      <h2 className="text-3xl font-extrabold sm:text-5xl">You tab away. Claude stops and asks.</h2>
      <p className="mt-6 max-w-xl text-lg text-paper/80">
        A permission prompt sits there for ten minutes while you read something else.
        Mochi taps you the moment it happens, and again if you keep ignoring him.
      </p>
    </section>
  );
}
```

- [ ] **Step 3: Moods section** (wraps the slider)

```tsx
import { MoodSlider } from "../MoodSlider";

export function Moods() {
  return (
    <section id="moods" className="mx-auto max-w-6xl px-5 py-24">
      <h2 className="max-w-xl text-3xl font-extrabold sm:text-5xl">He gets less patient.</h2>
      <p className="mt-4 max-w-xl text-paper/80">Drag the slider to see how Mochi reacts the longer Claude waits.</p>
      <div className="mt-12"><MoodSlider /></div>
    </section>
  );
}
```

- [ ] **Step 4: HowItWorks** (steps are a true sequence; CLI is real)

```tsx
const STEPS = [
  { title: "Install it", body: "Mochi lives in your menu bar. Nothing else to set up." },
  { title: "Let Claude work", body: "Go read, build, or make tea. Mochi stays out of sight." },
  { title: "He taps you", body: "When Claude finishes or needs your OK, he pops up with the project name." },
];

const CONTROLS = [
  ["claude-buddy snooze 30", "Quiet for 30 minutes"],
  ["claude-buddy chime on", "Add a soft chime"],
  ["claude-buddy delays 5 20", "Set wait and done delays (seconds)"],
  ["claude-buddy test done", "Preview Mochi right now"],
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24">
      <h2 className="text-3xl font-extrabold sm:text-5xl">How it works</h2>
      <ol className="mt-12 grid gap-10 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <p className="font-mono text-sm text-sparkle">Step {i + 1}</p>
            <h3 className="mt-1 text-2xl font-bold">{s.title}</h3>
            <p className="mt-2 text-paper/80">{s.body}</p>
          </li>
        ))}
      </ol>
      <h3 className="mt-20 text-2xl font-bold">You're in control</h3>
      <dl className="mt-6 grid gap-4 md:grid-cols-2">
        {CONTROLS.map(([cmd, what]) => (
          <div key={cmd} className="border-4 border-outline bg-[#33202e] p-4">
            <dt className="font-mono text-sm font-extrabold text-sprout">{cmd}</dt>
            <dd className="mt-1 text-sm text-paper/80">{what}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
```

- [ ] **Step 5: Faq** (verified answers only)

```tsx
const FAQ = [
  ["Does it work with any Claude Code project?", "Yes. Mochi shows the name of the project that needs you."],
  ["Can I silence him?", "Yes. `claude-buddy snooze MINUTES|forever|clear`, or `claude-buddy hide`."],
  ["Does he nag forever?", "No. He gives up after 3 minutes by default."],
  ["Which macOS versions?", "macOS 13 or later."],
];

export function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-24">
      <h2 className="text-3xl font-extrabold sm:text-5xl">Questions</h2>
      <div className="mt-10 divide-y-4 divide-outline">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group py-4">
            <summary className="cursor-pointer list-none text-lg font-semibold">{q}</summary>
            <p className="mt-2 max-w-xl text-paper/80">{a}</p>
          </details>
        ))}
      </div>
      {/* TODO(owner): add privacy, price and license answers once confirmed. */}
    </section>
  );
}
```

- [ ] **Step 6: FinalCta and Footer**

```tsx
import { siteConfig } from "../../../site.config";
import { PixelSprite } from "../PixelSprite";

export function FinalCta() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-5 py-24 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="max-w-xl text-4xl font-extrabold sm:text-6xl">Go make something. He'll tell you when it's done.</h2>
        <a href={siteConfig.downloadUrl} className="mt-8 inline-block bg-sparkle px-6 py-3 text-lg font-bold text-outline">
          Download for Mac
        </a>
      </div>
      <PixelSprite mood="done" scale={8} className="mochi-bob" title="Mochi waving" />
    </section>
  );
}
```

`Footer.tsx`:

```tsx
import { siteConfig } from "../../site.config";

export function Footer() {
  return (
    <footer className="border-t-4 border-outline">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-8 text-sm text-paper/70">
        <span>Claude Buddy {siteConfig.version}</span>
        <a href={siteConfig.githubUrl} className="underline-offset-4 hover:underline">GitHub</a>
      </div>
    </footer>
  );
}
```

- [ ] **Step 7: Assemble `page.tsx`**

```tsx
import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { Facts } from "@/components/sections/Facts";
import { Problem } from "@/components/sections/Problem";
import { Moods } from "@/components/sections/Moods";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Facts />
        <Problem />
        <Moods />
        <HowItWorks />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 8: Verify and commit**

Run: `npm test && npm run build`. Expected: all tests pass, build succeeds. Scroll the dev server end to end at desktop and 390px width.

```bash
git add src && git commit -m "feat: facts, problem, moods, how it works, FAQ, final CTA"
```

---

### Task 8: Polish, QA, README, push

**Files:**
- Modify: `src/app/page.tsx` or components as QA finds; Create: `README.md`

**Interfaces:** none new.

- [ ] **Step 1: Contrast and focus check**

Verify with a contrast checker: `paper` on `ink` (headings and body, body at 80% opacity), `outline` on `paper` (bubbles), `outline` on `sparkle` (buttons), `paper` on `teal` (project tag), `alert` on `paper` (angry title). Anything under 4.5:1 for body text or 3:1 for large text gets adjusted (raise opacity, or darken the text token). Tab through the page: every interactive element shows the yellow focus ring.

- [ ] **Step 2: Reduced motion and responsive pass**

In browser devtools emulate `prefers-reduced-motion: reduce`: hero starts in the done state, no bob, no slide. Check widths 390, 768, 1280: no horizontal scroll, bubble never overflows the mock desktop (adjust the `scale-75` breakpoint if it does).

- [ ] **Step 3: Lighthouse**

Run Lighthouse (Chrome devtools) on a production build: `npm run build && npm start`. Targets: accessibility 100, performance 90+. Fix what it flags.

- [ ] **Step 4: README**

```markdown
# Claude Buddy launch page

Next.js launch page for Claude Buddy and Mochi.

## Run
npm install
npm run dev      # http://localhost:3000
npm test
npm run build

## Edit before launch
`site.config.ts`: download URL, GitHub URL, version, price.

## Sprites
`node scripts/extract-sprites.mjs` regenerates `src/lib/sprites.generated.ts` from `scripts/snapshots/*.png`
(made with `claude-buddy snapshot FILE.png [wait|done] [AGE]`).

## Deploy
Import the repo in Vercel. No env vars, no config.
```

- [ ] **Step 5: Final verification and push**

Run: `npm test && npm run build`, expected all green.

```bash
git add -A
git commit -m "chore: polish, README"
git push
```
Report the localhost URL and the open owner items (download URL, price, license, privacy copy).
