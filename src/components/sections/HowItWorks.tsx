import { siteConfig } from "../../../site.config";
const STEPS = [
  { title: `Download ${siteConfig.name}`, body: "It lives in your menu bar and opens a window when you click it." },
  { title: "Connect Claude Code", body: `One click. ${siteConfig.name} adds its hooks to Claude Code's settings after saving a backup, and only touches its own.` },
  { title: "Pick a look", body: `Choose a scene, open a ${siteConfig.name} terminal, and let Claude work. Hoot taps you when it matters.` },
];

const CONTROLS = [
  ["glade open looks", "Open the Looks page"],
  ["glade look add photo.jpg", "Make a look from a photo"],
  ["glade snooze 30", "Quiet for 30 minutes"],
  ["glade statusline install", "Put Hoot in the status line"],
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-24 md:py-32">
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
        <div>
          <h3 className="text-3xl font-extrabold tracking-tight">Prefer the command line?</h3>
          <p className="mt-3 max-w-sm text-paper/80">Everything in the window is also a <code className="bg-ink/85 px-1 font-mono font-bold text-sprout">glade</code> command.</p>
        </div>
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
