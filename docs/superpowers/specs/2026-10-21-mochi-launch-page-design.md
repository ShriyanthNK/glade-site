# Mochi launch page: design

Date: 2026-10-21

## Goal

A launch page for Claude Buddy, a macOS menu-bar app whose mascot, Mochi, alerts you when Claude Code finishes or needs input. The page should convert visitors into downloads and make Mochi the memorable part. Runs on localhost first; deployable to Vercel unchanged.

## Product facts (verified from the app)

- Menu-bar only (`LSUIElement`), no Dock icon. macOS 13+.
- Hooks into Claude Code events (Notification, Stop, UserPromptSubmit, PostToolUse) and forwards them to a local Unix socket.
- Mochi is absent until Claude finishes or needs input, then pops up with a speech bubble and a project tag.
- Moods (rendered by `claude-buddy snapshot`):
  - done: closed-eye grin, arms up, sparkles. Bubble: "CLAUDE'S DONE, YOUR TURN".
  - wait, 0 to ~30s: neutral. Bubble: "CLAUDE'S WAITING ON YOU", body "Claude needs your permission to use Bash".
  - wait, ~90s: flat annoyed face, sweat drop, "?" sign. Bubble: "STILL WAITING...".
  - wait, ~170s: angry brows, "!!" sign, puff clouds. Bubble (red): "HELLOOO? CLAUDE NEEDS YOU".
- CLI: `claude-buddy test [wait|done] [--age SECONDS]`, `snooze MINUTES|forever|clear`, `hide`, `chime on|off`, `delays WAIT DONE` (defaults 5 20), `snapshot`, `quit`.
- Config: chime, doneDelay, waitDelay, giveUpAfter (180), snoozeUntil.

Unverified, so not claimed on the page until confirmed: privacy and data handling, price, license, install method, download URL.

## Audience and job

Developers who run Claude Code and tab away while it works. The page's job: show what the app does in the first screen, then get one click on Download.

## Conversion principles applied

From research (vendor guides, treated as opinion):

- Hero states the outcome, one subhead, one specifically-labeled button, and shows the real product.
- One primary action, repeated once at the bottom.
- Developer friction is cost and access: show price and install plainly once known.
- Social proof sits under the hero and is only real. No invented testimonials or counts.
- Plain, short copy.

## Visual system

- Color: ink plum `#2A1A26` (page), outline plum `#3B2230`, paper `#FFF4DC`, peach `#FFD9B8` / shadow `#EFA68A`, sprout green `#5DC46A`, teal `#2BA89A`, alert red `#C8203A`, sparkle yellow `#FFD23F`, blush `#FF8FA8`. Dark page so the cream bubble is the brightest element.
- Type: JetBrains Mono 800 for Mochi's voice only (bubbles, tags, CLI snippets); Bricolage Grotesque for everything else. Headlines large and left-aligned. Body lines under 70 characters.
- Pixel grid: one 8px unit shared by sprites, bubble borders, sparkles.
- Sprites: extracted pixel-for-pixel from real `claude-buddy snapshot` renders into ASCII pixel maps, rendered as SVG.
- Motion: only the hero pop-in, the mood slider, and an idle sprout bob. No scroll fades, no per-card hover effects. `prefers-reduced-motion` shows static end states.

## Page structure

1. Hero. Nav (wordmark, GitHub, Download). Headline "Stop watching the terminal." Subhead "Mochi pops up when Claude Code finishes or needs your OK, then gets out of the way." One button, "Download for Mac" (placeholder href), with "macOS 13+" beside it. A mock desktop: terminal works, then Mochi pops in with the done bubble; replay button.
2. Facts strip. Menu-bar only, runs locally via Claude Code hooks, macOS 13+. Real proof slot reserved, empty until real data exists.
3. Problem. Two lines about tabbing away while Claude waits on a permission prompt.
4. Mood slider. Range 0 to 170s with a done toggle. Keyboard-operable, labelled, announces the current state.
5. How it works. Three steps (install, Claude works, Mochi taps you) and real CLI controls.
6. FAQ. Verified answers only; privacy wording gated on the owner's confirmation.
7. Final CTA. Same single button, Mochi waving, footer.

## Architecture

- Next.js App Router, TypeScript, CSS variables plus Tailwind. Static output, no server code, no env vars. Vercel-ready.
- Units, each with one purpose:
  - `lib/sprites`: pixel maps and palette per mood; pure data.
  - `components/PixelSprite`: renders a pixel map to SVG at a given scale.
  - `components/Bubble`: pixel-bordered speech bubble (title, body, project tag, tone).
  - `components/MockDesktop`: hero demo sequence and replay.
  - `components/MoodSlider`: age to mood mapping and controls.
  - `lib/moods`: age thresholds and copy, matching the app.
  - Section components for hero, facts, problem, how-it-works, FAQ, final CTA.
- Placeholders live in one `site.config.ts` (download URL, GitHub URL, price, version) so wiring real values is a one-file change.

## Accessibility and quality floor

Responsive to phone width, visible keyboard focus, reduced motion respected, contrast checked against the plum background, meaningful alt text for sprites, Lighthouse accessibility and performance checks before handoff.

## Testing

- Unit tests for age-to-mood mapping and sprite rendering (pixel map to expected rects).
- Visual check of every mood against the app snapshots.
- `next build` passes; manual pass in a browser at desktop and phone widths.

## Delivery

Local repo in `~/mochi-launch`, pushed to a new GitHub repo under the owner's account. Vercel import is the owner's follow-up.

## Open items for the owner

- Real download URL and install method.
- Price and license.
- Privacy statement wording.
- Repo visibility (private or public) at creation.
