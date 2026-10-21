"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import type { MoodId } from "@/lib/moods";
import { MOCHI_ENTER, MOCHI_LOOPS, type MochiSheet } from "@/lib/mochi-animation.generated";

interface Props {
  mood: MoodId;
  /** CSS px per art pixel, like PixelSprite. A parent can override it with --mochi-scale-px. */
  scale?: number;
  phase?: "enter" | "loop";
  onEnterEnd?: () => void;
  className?: string;
  title?: string;
}

const RM_QUERY = "(prefers-reduced-motion: reduce)";
const hasMM = () => typeof window !== "undefined" && typeof window.matchMedia === "function";
function subscribe(cb: () => void) {
  if (!hasMM()) return () => {};
  const mq = window.matchMedia(RM_QUERY);
  mq.addEventListener?.("change", cb);
  return () => mq.removeEventListener?.("change", cb);
}
const getReduced = () => hasMM() && window.matchMedia(RM_QUERY).matches;
const getReducedServer = () => false;

const vars = (s: MochiSheet, iter: string) =>
  ({
    "--mochi-src": `url("${s.src}")`,
    "--mochi-n": String(s.frames),
    "--mochi-fw": String(s.frameWidth),
    "--mochi-fh": String(s.frameHeight),
    "--mochi-dur": `${s.durationMs}ms`,
    "--mochi-iter": iter,
    "--mochi-rest": String(s.restFrame),
  }) as React.CSSProperties;

/**
 * Mochi as captured from the app: a sprite sheet stepped through with a CSS steps() animation
 * (no per-frame JS). The layout box is the loop frame; the taller entrance frame overflows
 * upward from the same bottom-centre anchor, so moods and phases never shift the layout.
 */
export function AnimatedMochi({ mood, scale = 8, phase = "loop", onEnterEnd, className = "", title }: Props) {
  const reduced = useSyncExternalStore(subscribe, getReduced, getReducedServer);
  const loop = MOCHI_LOOPS[mood];
  const entering = phase === "enter" && !reduced;
  const sheet = entering ? MOCHI_ENTER : loop;
  const px = scale / loop.sheetPxPerArtPx;

  // Reduced motion: the entrance never plays, so end it right away (the hero timeline moves on).
  const ended = useRef(false);
  const end = () => {
    if (ended.current) return;
    ended.current = true;
    onEnterEnd?.();
  };
  useEffect(() => {
    if (phase === "enter" && reduced) end();
  });
  // A native listener (React's onAnimationEnd depends on vendor-prefix sniffing).
  const sheetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sheetRef.current;
    if (!entering || !el) return;
    const onEnd = (e: Event) => { if (e.target === el) end(); };
    el.addEventListener("animationend", onEnd);
    return () => el.removeEventListener("animationend", onEnd);
  });

  return (
    <div
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={`mochi-anim ${className}`}
      style={
        {
          "--mochi-px-base": `${px}px`,
          "--mochi-box-w": String(loop.frameWidth),
          "--mochi-box-h": String(loop.frameHeight),
        } as React.CSSProperties
      }
    >
      <div
        data-mochi-sheet={entering ? "enter" : reduced ? "static" : "loop"}
        className="mochi-anim-sheet"
        style={vars(sheet, entering ? "1" : "infinite")}
        ref={sheetRef}
      />
    </div>
  );
}
