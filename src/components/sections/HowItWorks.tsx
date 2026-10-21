const STEPS = [
  { title: "Install it", body: "Mochi lives in your menu bar." },
  { title: "Let Claude work", body: "Go read, build, or make tea. Mochi stays out of sight." },
  { title: "He taps you", body: "When Claude finishes or needs your OK, he pops up with the project name." },
];

const CONTROLS = [
  ["claude-buddy snooze 30", "Quiet for 30 minutes"],
  ["claude-buddy chime on", "Add a soft chime"],
  ["claude-buddy delays 5 20", "Set wait and done delays (seconds)"],
  ["claude-buddy test done", "Preview Mochi right now"],
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 md:py-32">
      <h2 className="text-4xl font-extrabold tracking-tight sm:text-6xl">How it works</h2>
      <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-12">
        {STEPS.map((s, i) => (
          <li key={s.title} className="border-t-4 border-sparkle pt-5">
            <p className="text-sm font-extrabold uppercase tracking-widest text-sparkle">Step {i + 1}</p>
            <h3 className="mt-2 text-2xl font-bold">{s.title}</h3>
            <p className="mt-2 text-paper/80">{s.body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-24 grid gap-8 md:grid-cols-[1fr_1.6fr] md:gap-16">
        <h3 className="text-3xl font-extrabold tracking-tight">You&apos;re in control</h3>
        <dl className="divide-y-4 divide-outline border-4 border-outline bg-surface">
          {CONTROLS.map(([cmd, what]) => (
            <div key={cmd} className="grid gap-1 p-4 sm:grid-cols-[auto_1fr] sm:items-baseline sm:gap-6">
              <dt className="break-words font-mono text-sm font-extrabold text-sprout">{cmd}</dt>
              <dd className="text-sm text-paper/80 sm:text-right">{what}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
