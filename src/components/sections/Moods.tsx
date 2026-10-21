import { MoodSlider } from "../MoodSlider";

export function Moods() {
  return (
    <section id="moods" className="border-y-4 border-outline bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
        <h2 className="max-w-xl text-3xl font-extrabold tracking-tight sm:text-5xl">He gets less patient.</h2>
        <p className="mt-4 max-w-xl text-paper/80">
          Drag the slider to see how Mochi reacts the longer Claude waits.
        </p>
        <div className="mt-12"><MoodSlider /></div>
      </div>
    </section>
  );
}
