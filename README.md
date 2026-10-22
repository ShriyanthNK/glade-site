# Psst launch page

Next.js launch page for Psst and its mascot Mochi.

## Run
```bash
npm install
npm run dev      # http://localhost:3000
npm test
npm run lint
npm run build
```

## Edit before launch
`site.config.ts`: product name, download URL, GitHub URL, version, price.

### Product name
`siteConfig.name` is the single source for the brand text (nav, footer, page title, share image).
Changing it is a one-line edit; then re-run `node scripts/make-og.mjs` so the share image picks it up.
`src/lib/brand-name.test.ts` fails if the name is hard-coded anywhere else in `src/`.
This README's title is static text, so update it by hand. CLI commands (`claude-buddy ...`) are real
command names and are not part of the brand setting.

## Sprites
```bash
node scripts/extract-sprites.mjs   # regenerates src/lib/sprites.generated.ts from scripts/snapshots/*.png
node scripts/make-icon.mjs         # regenerates src/app/icon.svg from the "done" sprite
```
Snapshots are made with `claude-buddy snapshot FILE.png [wait|done] [AGE]`.

## Mochi animation
The animated Mochi (hero, mood slider, final CTA, 404) plays real frames captured from the app.
`scripts/capture-mochi-animation.mjs` renders every frame with the app's own
`claude-buddy snapshot FILE.png [wait|done] [AGE] [ENTER_SECONDS]`, so it needs the Claude Buddy
app installed locally (CLI in `$CLAUDE_BUDDY_CLI` or `~/.claude-buddy/bin/claude-buddy`); it is a
dev-time script, the site itself only ships the PNGs. It masks out the app's speech bubble (the
site draws its own), drops the grey background and soft shadows, downsamples 3x (4 sheet px per
art pixel) and writes indexed sprite sheets plus `src/lib/mochi-animation.generated.ts`
(frame size, fps, duration, resting frame, where the bubble tail points). Do not edit that file.
```bash
node scripts/capture-mochi-animation.mjs                  # rewrites public/mochi/*.png + manifest
node scripts/capture-mochi-animation.mjs --contact DIR    # also writes contact sheets of every frame
```
| Sheet | What | Frames | Size |
| --- | --- | --- | --- |
| `enter.png` | entrance (done): rises from the bottom with confetti | 41 @ 24 fps, 1.71 s | 13.4 KB |
| `done-loop.png` | hop and wave, sparkles | 94 @ 24 fps, 3.92 s | 20.0 KB |
| `calm-loop.png` | breathing, wave, blinks | 180 @ 24 fps, 7.5 s | 7.8 KB |
| `annoyed-loop.png` | "?" sign, sweat drop, lean | 144 @ 24 fps, 6.0 s | 6.7 KB |
| `angry-loop.png` | "!!" sign, puffs, stomping | 64 @ 32 fps, 2.0 s | 5.8 KB |

About 54 KB in total. `src/components/AnimatedMochi.tsx` steps through a sheet with a CSS
`steps()` animation (no per-frame JS) and shows the resting frame under reduced motion. The app's
loops are layered and never repeat exactly; each sheet is a real stretch of frames chosen so its
last frame runs into its first. `Bubble`'s `reveal` prop copies the app's bubble entrance (pop
with overshoot, title typed at 50 characters per second, then the project row).

## Backdrop
The fixed night-forest scene behind the page is pixel art drawn by `scripts/make-backdrop.mjs`
(480x270, ~23 colours, seeded so re-runs are byte-identical) and scaled up with
`image-rendering: pixelated` by `src/components/Backdrop.tsx`, which also draws the CSS fireflies.
The art is kept low in value so the copy stays WCAG AA over every pixel.
```bash
node scripts/make-backdrop.mjs     # regenerates public/backdrop.png
```

## Share image (Open Graph and Twitter)
`src/app/opengraph-image.png` and `src/app/twitter-image.png` (1200x630, identical, under 300KB) are
built by `scripts/make-og.mjs`: the backdrop scaled 3x with nearest-neighbour, the `done` sprite, the speech
bubble, and the headline in Bricolage Grotesque / JetBrains Mono (latin subsets in `scripts/fonts/`, both OFL).
It renders HTML in headless Chromium, so it needs Playwright, which is deliberately not a project dependency:
```bash
npm i --no-save playwright && npx playwright install chromium
node scripts/make-og.mjs           # rewrites both PNGs
```
Alt text lives in the matching `*.alt.txt` files.

### metadataBase
`src/app/layout.tsx` builds `metadataBase` from Vercel's built-in `VERCEL_PROJECT_PRODUCTION_URL` /
`VERCEL_URL` (no variable to set) and falls back to `http://localhost:3000`, so share-image URLs are
absolute. Once the real domain is known, set `metadataBase` to it directly.

## Build setup
The Tailwind/Turbopack setup in `next.config.ts` came from the Next.js scaffold; nothing else is customised.

## Deploy
Import the repo in Vercel. No env vars, no config.
