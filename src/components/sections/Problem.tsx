export function Problem() {
  return (
    <section id="alerts" className="mx-auto grid max-w-6xl gap-8 px-5 py-24 md:grid-cols-[1.3fr_1fr] md:items-end md:gap-16 md:py-32">
      <h2 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
        You tab away. Claude stops and asks.
      </h2>
      <p className="max-w-md text-lg text-paper/80">
        A permission prompt sits there for ten minutes while you read something else.
        Hoot taps you when it happens, tells you what Claude wants, and tries again if you keep ignoring it.
      </p>
    </section>
  );
}
