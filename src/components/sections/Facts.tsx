const FACTS = [
  "Lives in your menu bar, with its own window for settings.",
  "Crop your photo and pick pixel art or not, all on your Mac. The app has no networking code.",
  "Connects to Claude Code's hooks.",
];

export function Facts() {
  return (
    <section aria-label="Quick facts" className="scrim-band">
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
