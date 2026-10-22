import { siteConfig } from "../../../site.config";
const LINES = [
  ["{o,o}", "all good", "█░░░░░░░░░ 12%", "text-sprout", "Under 60% of Claude's context used"],
  ["{-,-}", "still here...", "███████░░░ 70%", "text-peach", "From 60%"],
  ["{>,<}", "HELLOOO?", "█████████░ 92%", "text-alert", "From 85%"],
] as const;

export function StatusLine() {
  return (
    <section id="status-line" className="mx-auto grid max-w-6xl gap-10 px-5 py-24 md:grid-cols-[1fr_1.5fr] md:items-center md:gap-16 md:py-32">
      <div>
        <h2 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">Hoot in your status line.</h2>
        <p className="mt-5 max-w-md text-lg text-paper/80">
          Optional. Hoot&apos;s mood follows how full Claude&apos;s context window is, so you see it coming.
          If you already have a status line, {siteConfig.name} asks first and puts yours back when you turn Hoot&apos;s off.
        </p>
      </div>
      <div className="min-w-0 border-4 border-outline bg-ink/90 p-5 font-mono text-[11px] leading-6 shadow-[8px_8px_0_rgba(0,0,0,.35)] sm:text-sm"
           role="img" aria-label="Three status lines: Hoot calm at 12 percent, impatient at 70 percent, worried at 92 percent">
        {LINES.map(([face, word, bar, color, note], i) => (
          <div key={face} className={i ? "mt-4" : ""}>
            <div aria-hidden className="flex flex-wrap items-baseline gap-x-3">
              <span className="whitespace-nowrap"><span>🦉</span><span className="text-peach">{face} </span><span className={`font-extrabold ${color}`}>{word}</span></span>
              <span className="whitespace-nowrap text-paper/70">Opus · my-project</span>
              <span className={`whitespace-nowrap ${color}`}>{bar}</span>
            </div>
            <p aria-hidden className="text-xs text-paper/60">{note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
