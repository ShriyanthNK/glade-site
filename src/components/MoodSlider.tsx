"use client";
import { useState } from "react";
import { MAX_WAIT_SECONDS, moodForWait, type MoodId } from "@/lib/moods";
import { MochiStage } from "./MochiStage";

export function MoodSlider() {
  const [age, setAge] = useState(0);
  const [done, setDone] = useState(false);
  const mood: MoodId = done ? "done" : moodForWait(age);

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
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
          className="mt-4 w-full accent-[var(--sparkle)] disabled:opacity-40"
        />
        <p className="mt-2 text-sm" aria-hidden>{done ? "finished" : `${age}s`}</p>
        <button
          type="button"
          aria-pressed={done}
          onClick={() => setDone((d) => !d)}
          className="mt-6 border-4 border-paper px-4 py-2 text-sm font-extrabold aria-pressed:bg-paper aria-pressed:text-outline"
        >
          Claude finished
        </button>
      </div>
      <MochiStage mood={mood} scale={8} />
    </div>
  );
}
