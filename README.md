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
