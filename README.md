# Claude Buddy launch page

Next.js launch page for Claude Buddy and Mochi.

## Run
```bash
npm install
npm run dev      # http://localhost:3000
npm test
npm run lint
npm run build
```

## Edit before launch
`site.config.ts`: download URL, GitHub URL, version, price.

## Sprites
```bash
node scripts/extract-sprites.mjs   # regenerates src/lib/sprites.generated.ts from scripts/snapshots/*.png
node scripts/make-icon.mjs         # regenerates src/app/icon.svg from the "done" sprite
```
Snapshots are made with `claude-buddy snapshot FILE.png [wait|done] [AGE]`.

## Build setup
The Tailwind/Turbopack setup in `next.config.ts` came from the Next.js scaffold; nothing else is customised.

## Deploy
Import the repo in Vercel. No env vars, no config.
