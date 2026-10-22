import { MoodSlider } from "../MoodSlider";

const SMART = [
  ["Stays quiet when you're already there", "If the terminal is in front and you are typing, Hoot stays away. If you look away, it comes back."],
  ["Says what Claude wants", "Not just \"waiting\": Run: npm test, Edit: Views.swift. When Claude finishes, one line on what it did."],
  ["Gives up on its own", "After three minutes by default. You can change that, snooze it, or turn the chime on."],
];

export function Moods() {
  return (
    <section id="moods" className="scrim-band">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <h2 className="max-w-xl text-3xl font-extrabold tracking-tight sm:text-5xl">Hoot gets less patient.</h2>
        <p className="mt-4 max-w-xl text-paper/80">
          Drag the slider to see how Hoot reacts the longer Claude waits.
        </p>
        <div className="mt-12"><MoodSlider /></div>
        <ul className="mt-20 grid gap-8 md:grid-cols-3 md:gap-12">
          {SMART.map(([title, body]) => (
            <li key={title} className="border-t-4 border-sparkle pt-5">
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-2 text-paper/80">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
