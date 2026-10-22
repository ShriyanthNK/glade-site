"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import type { MoodId } from "@/lib/moods";
import { HOOT_ENTER, HOOT_LOOPS, type HootSheet } from "@/lib/hoot-animation.generated";

interface Props {
  mood: MoodId;
  /** CSS px per art pixel, like PixelSprite. A parent can override it with --hoot-scale-px. */
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

const vars = (s: HootSheet, iter: string) =>
  ({
    "--hoot-src": `url("${s.src}")`,
    "--hoot-n": String(s.frames),
    "--hoot-fw": String(s.frameWidth),
    "--hoot-fh": String(s.frameHeight),
    "--hoot-dur": `${s.durationMs}ms`,
    "--hoot-iter": iter,
    "--hoot-rest": String(s.restFrame),
  }) as React.CSSProperties;

/**
 * Hoot as captured from the app: a sprite sheet stepped through with a CSS steps() animation
 * (no per-frame JS). The layout box is the loop frame; the taller entrance frame overflows
 * upward from the same bottom-centre anchor, so moods and phases never shift the layout.
 */
export function AnimatedHoot({ mood, scale = 8, phase = "loop", onEnterEnd, className = "", title }: Props) {
  const reduced = useSyncExternalStore(subscribe, getReduced, getReducedServer);
  const loop = HOOT_LOOPS[mood];
  const entering = phase === "enter" && !reduced;
  const sheet = entering ? HOOT_ENTER : loop;
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
      className={`hoot-anim ${className}`}
      style={
        {
          "--hoot-px-base": `${px}px`,
          "--hoot-box-w": String(loop.frameWidth),
          "--hoot-box-h": String(loop.frameHeight),
        } as React.CSSProperties
      }
    >
      <div
        data-hoot-sheet={entering ? "enter" : reduced ? "static" : "loop"}
        className="hoot-anim-sheet"
        style={vars(sheet, entering ? "1" : "infinite")}
        ref={sheetRef}
      />
    </div>
  );
}
