# Claude Buddy launch page

Next.js launch page for Claude Buddy and Mochi. "Claude Buddy" is a working name; see "Product name" below.

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
