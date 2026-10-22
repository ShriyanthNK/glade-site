import { siteConfig } from "../../../site.config";
import { MockDesktop } from "../MockDesktop";

export function Hero() {
  return (
    <section id="top" className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-10 md:pt-16">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl">
          Stop watching the terminal.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-paper/80">
          Hoot pops up when Claude Code finishes or needs your OK, then gets out of the way.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a id="download" href={siteConfig.downloadUrl} className="bg-sparkle px-6 py-3 text-lg font-bold text-outline">
            Download for Mac
          </a>
          <span className="text-sm text-paper/70">macOS 13+</span>
        </div>
      </div>
      <MockDesktop />
    </section>
  );
}
