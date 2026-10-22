"use client";
import { useState } from "react";
import { MAX_WAIT_SECONDS, MOODS, THRESHOLDS, moodForWait, type MoodId } from "@/lib/moods";
import { HootStage } from "./HootStage";

const TIER_NAME: Record<MoodId, string> = { calm: "waiting", annoyed: "annoyed", angry: "angry", done: "finished" };
// Where Hoot changes: the tick labels under the slider.
const TICKS: [number, string][] = [[0, "waiting"], [THRESHOLDS.annoyed, "annoyed"], [THRESHOLDS.angry, "angry"], [MAX_WAIT_SECONDS, "gives up"]];

export function MoodSlider() {
  const [age, setAge] = useState(0);
  const [done, setDone] = useState(false);
  const mood: MoodId = done ? "done" : moodForWait(age);

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
      <div className="max-w-md">
        <label htmlFor="wait" className="block text-xl font-semibold">
          How long Claude has waited
        </label>
        <input
          id="wait"
          type="range"
          min={0}
          max={MAX_WAIT_SECONDS}
          step={1}
          value={age}
          aria-valuetext={`${age} seconds`}
          disabled={done}
          onChange={(e) => setAge(Number(e.target.value))}
          className="mt-4 h-11 w-full cursor-pointer accent-[var(--sparkle)] disabled:opacity-40"
        />
        <div aria-hidden className="relative mt-2 h-14 text-xs text-paper/80 sm:h-10">
          {TICKS.map(([s, label], i) => (
            <span
              key={label}
              data-tick={s}
              className="absolute top-0 whitespace-nowrap text-xs font-medium sm:text-sm"
              style={{ left: `${(s / MAX_WAIT_SECONDS) * 100}%`, transform: `translateX(${i === 0 ? "0" : i === TICKS.length - 1 ? "-100%" : "-50%"})` }}
            >
              <span className={`block h-2 w-px bg-paper/60 ${i === 0 ? "mr-auto" : i === TICKS.length - 1 ? "ml-auto" : "mx-auto"}`} />
              <span className="block sm:inline">{s}s</span><span className="block sm:inline"> {label}</span>
            </span>
          ))}
        </div>
        <p className="mt-1 text-sm font-semibold" aria-hidden>{done ? "finished" : `${age}s · ${TIER_NAME[mood]}`}</p>
        <button
          type="button"
          aria-pressed={done}
          onClick={() => setDone((d) => !d)}
          className="mt-6 min-h-11 border-4 border-paper px-4 text-sm font-extrabold aria-pressed:bg-paper aria-pressed:text-outline"
        >
          Show Claude finished
        </button>
      </div>
      <HootStage mood={mood} scale={8} />
      <p role="status" className="sr-only">{MOODS[mood].spoken}</p>
    </div>
  );
}
