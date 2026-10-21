const FACTS = [
  "Menu-bar only. No Dock icon.",
  "Listens to Claude Code through its hooks, on your Mac.",
  "macOS 13 or later.",
];

export function Facts() {
  return (
    <section aria-label="Quick facts" className="border-y-4 border-outline bg-[#33202e]">
      <ul className="mx-auto grid max-w-6xl gap-4 px-5 py-7 sm:grid-cols-3 sm:gap-10">
        {FACTS.map((f) => (
          <li key={f} className="flex items-start gap-3 text-base font-semibold text-paper/90">
            <span aria-hidden className="mt-2 h-2.5 w-2.5 shrink-0 bg-sprout" />
            {f}
          </li>
        ))}
      </ul>
    </section>
  );
}
