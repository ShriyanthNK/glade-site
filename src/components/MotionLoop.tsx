"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

interface Props {
  src: string;
  poster: string;
  /** What the piece shows, for people who cannot see it. The same story is also written out next to it on the page. */
  label: string;
  className?: string;
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

/**
 * A muted looping motion graphic. Under reduced motion it is just the poster. Otherwise it plays only while it is on
 * screen, and a visible control pauses it (moving content that starts by itself must be stoppable).
 */
export function MotionLoop({ src, poster, label, className = "" }: Props) {
  const reduced = useSyncExternalStore(subscribe, getReduced, () => false);
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el || typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (visible && !paused) void el.play?.()?.catch?.(() => {});
    else el.pause?.();
  }, [visible, paused, reduced]);

  const frame = "relative aspect-video w-full overflow-hidden border-4 border-outline bg-ink shadow-[8px_8px_0_rgba(0,0,0,.35)]";
  if (reduced) {
    return (
      <div className={`${frame} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poster} alt={label} className="h-full w-full object-cover" style={{ imageRendering: "pixelated" }} />
      </div>
    );
  }
  return (
    <div className={`${frame} ${className}`}>
      <video
        ref={video}
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={label}
        className="h-full w-full object-cover"
      >
        <source src={src} type="video/mp4" />
      </video>
      <button
        type="button"
        aria-pressed={paused}
        onClick={() => setPaused((p) => !p)}
        className="absolute bottom-3 right-3 min-h-11 border-4 border-paper/70 bg-ink/80 px-3 font-mono text-xs font-extrabold text-paper hover:bg-paper hover:text-outline"
      >
        {paused ? "Play animation" : "Pause animation"}
      </button>
    </div>
  );
}
