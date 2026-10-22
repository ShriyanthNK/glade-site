import { MotionLoop } from "../MotionLoop";
import { siteConfig } from "../../../site.config";
const BACKDROP = { backgroundImage: "url(/backdrop.png)", backgroundSize: "cover", backgroundPosition: "bottom", imageRendering: "pixelated" as const };

const STEPS = [
  ["Drop in a photo", "A view, a game screenshot, your cat. It is fitted to your terminal for you, and you can crop it."],
  ["Pixel art, or keep it as it is", `You choose. It is all done on your Mac, and ${siteConfig.name}'s own code has no networking, so it cannot upload your photo.`],
  ["Your text stays readable", "It is darkened just enough to keep clear contrast behind the terminal."],
];

/** A drawn stand-in for the app's Looks page: the preview behind sample terminal text, and the look cards. */
function LooksMock() {
  return (
    <div className="border-4 border-outline bg-surface shadow-[8px_8px_0_rgba(0,0,0,.35)]" role="img"
         aria-label={`The Looks page in ${siteConfig.name}: Night Forest selected, with tiles for adding your own photos`}>
      <div className="grid gap-5 p-5 md:grid-cols-[1.35fr_1fr] md:p-6">
        <div className="relative aspect-video overflow-hidden border-2 border-line" style={BACKDROP}>
          <div className="absolute inset-0 bg-ink/50" />
          <div className="relative p-4 font-mono text-xs leading-6 text-paper sm:text-sm">
            <span className="block">~/my-project $ claude</span>
            <span className="block">Claude&apos;s done, your turn.</span>
            <span className="block text-sparkle">&gt; _</span>
          </div>
        </div>
        <div className="grid grid-cols-2 content-start gap-3">
          <div>
            <div className="aspect-video border-4 border-sparkle" style={BACKDROP} />
            <p className="mt-1 flex items-center gap-2 text-sm font-bold"><span aria-hidden className="h-2 w-2 bg-sparkle" />Night Forest</p>
          </div>
          <div>
            <div className="grid aspect-video place-items-center border-2 border-dashed border-paper/40 text-2xl font-bold text-paper/60">+</div>
            <p className="mt-1 text-sm text-paper/70">Add a photo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Looks() {
  return (
    <section id="looks" className="mx-auto max-w-6xl px-5 py-24 md:py-32">
      <div className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-end md:gap-16">
        <h2 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">A scene behind your terminal.</h2>
        <p className="max-w-xl text-lg text-paper/80">
          {siteConfig.name} opens Terminal.app in Hoot&apos;s colors with a see-through background and puts a scene behind it.
          Pick the built-in Night Forest, or make a look from one of your own photos, cropped the way you like and pixelated or not. Choose your terminal font and size too.
        </p>
      </div>
      <div className="mt-12">
        <MotionLoop
          src="/motion/looks.mp4"
          poster="/motion/looks-poster.jpg"
          label="A picture of a sunset turns into pixel art, a terminal sits on it with readable text, then Hoot the owl pops up saying Claude is done."
        />
      </div>
      <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-12">
        {STEPS.map(([title, body], i) => (
          <li key={title} className="border-t-4 border-sparkle pt-5">
            <p className="text-sm font-extrabold uppercase tracking-widest text-sparkle">{i + 1}</p>
            <h3 className="mt-2 text-xl font-bold">{title}</h3>
            <p className="mt-2 text-paper/80">{body}</p>
          </li>
        ))}
      </ol>
      <h3 className="mt-24 text-2xl font-extrabold tracking-tight">In the app</h3>
      <div className="mt-6"><LooksMock /></div>
    </section>
  );
}
