const FAQ = [
  ["Does it work with any Claude Code project?", "Yes. Mochi shows the name of the project that needs you."],
  ["Can I silence him?", "Yes. `claude-buddy snooze MINUTES|forever|clear`, or `claude-buddy hide`."],
  ["Does he nag forever?", "No. He gives up after 3 minutes by default."],
  ["Which macOS versions?", "macOS 13 or later."],
];

export function Faq() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-24 md:grid-cols-[1fr_1.6fr] md:gap-16 md:pb-32">
      <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Questions</h2>
      <div className="divide-y-4 divide-outline border-y-4 border-outline">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold [&::-webkit-details-marker]:hidden">
              {q}
              <span
                aria-hidden
                className="relative h-4 w-4 shrink-0 before:absolute before:left-0 before:top-[6px] before:h-1 before:w-4 before:bg-sparkle after:absolute after:left-[6px] after:top-0 after:h-4 after:w-1 after:bg-sparkle group-open:after:hidden"
              />
            </summary>
            <p className="mt-3 max-w-xl text-paper/80">{a}</p>
          </details>
        ))}
      </div>
      {/* TODO(owner): add privacy, price and license answers once confirmed. */}
    </section>
  );
}
