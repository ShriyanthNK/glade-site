import { siteConfig } from "../../../site.config";
const STEPS = [
  { title: `Download ${siteConfig.name}`, body: "It lives in your menu bar and opens a window when you click it." },
  { title: "Connect Claude Code", body: `One click. ${siteConfig.name} adds its hooks to Claude Code's settings after saving a backup, and only touches its own.` },
  { title: "Pick a look", body: `Choose a scene, open a ${siteConfig.name} terminal, and let Claude work. Hoot taps you when it matters.` },
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
    </section>
  );
}
