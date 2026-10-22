# Glade launch page

Next.js launch page for Glade and its mascot Hoot.

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
This README's title is static text, so update it by hand. CLI commands (`glade ...`) are real
command names and are not part of the brand setting.

## Hoot (the mascot)
Hoot, the owl, is drawn in code. The art was designed and reviewed in the glade app repo
(`design/mascots/mascots.js`); the macOS app ports that drawing code line for line and tests it pixel for
pixel, and this site exports from the same file, so the two cannot disagree. `scripts/export-hoot.mjs` is a
dev-time script (the site only ships its output):
```bash
node scripts/export-hoot.mjs                      # needs ../glade next to this repo, or --source PATH / $HOOT_SOURCE
node scripts/make-icon.mjs                        # src/app/icon.svg from the resting sprite
node scripts/make-og.mjs                          # share image (see below)
```
It writes `public/hoot/*.png` (indexed-colour sprite sheets, 24 fps, 4 sheet px per art pixel),
`src/lib/hoot-animation.generated.ts` (frame size, fps, duration, resting frame, where a bubble tail should
point) and `src/lib/sprites.generated.ts` (static pixel maps and the palette). Do not edit those by hand.

| Sheet | What | Frames |
| --- | --- | --- |
| `enter.png` | the app's pop-up entrance (rises from below with squash and stretch), Hoot in its "done" mood | 24, 1.0 s |
| `done.png` | happy, wings up, sparkles | 144, 6 s loop |
| `calm.png` | the app's first waiting tier: wide-eyed, foot tap, a wave | 144, 6 s loop |
| `annoyed.png` | half-lidded, brows, sweat drop and "?" | 144, 6 s loop |
| `angry.png` | glaring, puffing up, "!!" and steam | 144, 6 s loop |

About 66 KB in total. Every loop is seamless: the drawing code snaps all its periodic motion to the loop length,
and a test in the app repo checks that frame t and frame t + 6 s are identical. `src/components/AnimatedHoot.tsx`
steps through a sheet with a CSS `steps()` animation (no per-frame JS) and shows the resting frame under reduced
motion. `Bubble`'s `reveal` prop copies the app's bubble entrance (pop with overshoot, title typed at 50 characters
per second, then the project row).

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
built by `scripts/make-og.mjs`: the backdrop scaled 3x with nearest-neighbour, the `done` Hoot sprite, the speech
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
