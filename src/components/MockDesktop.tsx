"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { preload } from "react-dom";
import { Bubble } from "./Bubble";
import { MOODS } from "@/lib/moods";
import { AnimatedMochi } from "./AnimatedMochi";
import { MOCHI_ENTER, MOCHI_LOOPS } from "@/lib/mochi-animation.generated";

// Mochi is drawn at scale 6 on phones (the whole stack is then scaled down to fit) and 8 from sm
// up: 1.5 and 2 CSS px per sheet px (the sheets hold 4 sheet px per art pixel).
// The bubble's 24px tail is zoomed with the bubble (.7 at sm, .8 from 900px), and Mochi's frame
// is pulled up under it so the tail tip sits where the app's tail points.
const TIP_Y = MOCHI_LOOPS.done.bubbleTip?.y ?? 0;

const LINES = [
  "> refactor the auth middleware",
  "Reading src/middleware.ts",
  "Editing src/middleware.ts",
  "Running tests... 42 passed",
];

const RM_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(RM_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getReduced = () => window.matchMedia(RM_QUERY).matches;
const getReducedServer = () => false;

export function MockDesktop() {
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, getReducedServer);
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<"working" | "done">("working");
  const [shown, setShown] = useState(0);
  const [mochiPhase, setMochiPhase] = useState<"enter" | "loop">("enter");
  preload(MOCHI_ENTER.src, { as: "image" });
  preload(MOCHI_LOOPS.done.src, { as: "image" });

  useEffect(() => {
    if (reduced) return;
    const timers = LINES.map((_, i) => window.setTimeout(() => setShown(i + 1), 500 + i * 550));
    timers.push(window.setTimeout(() => setPhase("done"), 500 + LINES.length * 550 + 300));
    return () => timers.forEach(clearTimeout);
  }, [run, reduced]);

  const m = MOODS.done;
  const done = reduced || phase === "done";
  const visible = reduced ? LINES.length : shown;
  return (
    <div
      className="relative mx-auto aspect-[4/5] w-full max-w-3xl overflow-hidden rounded-2xl border-4 border-outline shadow-2xl sm:aspect-[16/11]"
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
            <span key={l} aria-hidden className={i < visible ? "block" : "hidden motion-reduce:block"}>{l}</span>
          ))}
          {!done && <span aria-hidden className="block text-sparkle motion-reduce:hidden">working...</span>}
          <span aria-hidden className={`text-sprout ${done ? "block" : "hidden motion-reduce:block"}`}>done</span>
        </div>
      </div>

      {/* Mochi: bottom-anchored; once Claude is done he plays the app's entrance (rising from the
          bottom edge with confetti), the bubble pops in and types, then the done loop runs. */}
      <div
        className={`absolute bottom-0 right-3 flex origin-bottom-right scale-[.55] flex-col items-center [--mochi-scale-px:1.5px] [--mochi-tail:24px] min-[420px]:scale-75 sm:-bottom-2 sm:right-6 sm:scale-100 sm:[--mochi-scale-px:2px] sm:[--mochi-tail:16.8px] min-[900px]:[--mochi-tail:19.2px] ${done ? "" : "invisible motion-reduce:visible"}`}
      >
        <div key={`b${run}-${done}`} aria-hidden className="relative z-10 sm:[zoom:.7] min-[900px]:[zoom:.8]">
          <Bubble title={m.title} reveal={done && !reduced} />
        </div>
        <div className="relative z-20" style={{ marginTop: `calc(var(--mochi-tail) - ${TIP_Y} * var(--mochi-scale-px))` }}>
          <AnimatedMochi
            key={`m${run}-${done}`}
            mood="done"
            scale={6}
            phase={done ? mochiPhase : "loop"}
            onEnterEnd={() => setMochiPhase("loop")}
            title={done ? "Mochi" : undefined}
          />
        </div>
      </div>
      {/* Narrow live region: only the bubble text is announced */}
      <p role="status" className="sr-only">{done ? m.title : ""}</p>

      <button
        type="button"
        onClick={() => { setPhase("working"); setShown(0); setMochiPhase("enter"); setRun((r) => r + 1); }}
        className="absolute bottom-4 left-4 motion-reduce:hidden border-4 border-paper/70 bg-ink/60 px-3 py-1 font-mono text-xs font-extrabold text-paper hover:bg-paper hover:text-outline"
      >
        Replay
      </button>
    </div>
  );
}
