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
    if (reduced) {
      setShown(LINES.length);
      setPhase("done");
      return;
    }
    setPhase("working");
    setShown(0);
    const timers = LINES.map((_, i) => window.setTimeout(() => setShown(i + 1), 500 + i * 550));
    timers.push(window.setTimeout(() => setPhase("done"), 500 + LINES.length * 550 + 300));
    return () => timers.forEach(clearTimeout);
  }, [run]);

  const m = MOODS.done;
  const done = phase === "done";
  return (
    <div
      className="relative mx-auto aspect-[4/5] w-full max-w-3xl overflow-hidden rounded-2xl border-4 border-outline shadow-2xl sm:aspect-[16/10]"
      style={{ background: "linear-gradient(135deg, #5a3d6e 0%, #3a2a47 55%, #2c2038 100%)" }}
    >
      {/* macOS menu bar */}
      <div aria-hidden className="flex items-center justify-between bg-black/40 px-4 py-1.5 text-xs text-paper/80">
        <span className="flex items-center gap-4">
          <span className="font-bold">Terminal</span>
          <span className="hidden sm:inline">Shell</span>
          <span className="hidden sm:inline">Edit</span>
        </span>
        <span>Tue 9:41</span>
      </div>

      {/* terminal window */}
      <div className="m-4 w-[min(24rem,92%)] overflow-hidden rounded-lg border border-white/15 bg-ink/90 shadow-xl sm:ml-8 sm:mt-6">
        <div className="flex items-center gap-2 bg-black/30 px-3 py-2 font-mono text-xs text-paper/70">
          <span aria-hidden className="h-3 w-3 rounded-full bg-alert" />
          <span aria-hidden className="h-3 w-3 rounded-full bg-sparkle" />
          <span aria-hidden className="h-3 w-3 rounded-full bg-sprout" />
          <span className="ml-3">claude: my-project</span>
        </div>
        <div
          className="min-h-[7.5rem] p-4 font-mono text-xs leading-6 text-paper sm:text-sm"
          role="img"
          aria-label="Mock terminal: Claude Code refactoring an auth middleware, then finishing"
        >
          {LINES.map((l, i) => (
            <span key={l} aria-hidden className={i < shown ? "block" : "hidden motion-reduce:block"}>{l}</span>
          ))}
          {!done && <span aria-hidden className="block text-sparkle motion-reduce:hidden">working...</span>}
          <span aria-hidden className={`text-sprout ${done ? "block" : "hidden motion-reduce:block"}`}>done</span>
        </div>
      </div>

      {/* Mochi: bottom-anchored, slides up from the bottom edge */}
      <div
        className={`absolute bottom-0 right-3 flex origin-bottom-right scale-[.55] flex-col items-center gap-4 transition-transform duration-500 ease-out min-[420px]:scale-75 sm:right-8 sm:scale-100 motion-reduce:translate-y-0 motion-reduce:transition-none ${done ? "translate-y-0" : "translate-y-[120%]"}`}
      >
        <div aria-hidden className="relative z-10">
          <Bubble title={m.title} />
        </div>
        <PixelSprite mood="done" scale={6} className="mochi-bob" title={done ? "Mochi" : undefined} />
      </div>
      {/* Narrow live region: only the bubble text is announced */}
      <p role="status" className="sr-only">{done ? m.title : ""}</p>

      <button
        type="button"
        onClick={() => setRun((r) => r + 1)}
        className="absolute bottom-4 left-4 motion-reduce:hidden border-4 border-paper/70 bg-ink/60 px-3 py-1 font-mono text-xs font-extrabold text-paper hover:bg-paper hover:text-outline"
      >
        Replay
      </button>
    </div>
  );
}
