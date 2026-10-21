import { siteConfig } from "../../../site.config";
import { PixelSprite } from "../PixelSprite";

export function FinalCta() {
  return (
    <section className="border-t-4 border-outline bg-[#33202e]">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-10 px-5 py-24 md:flex-row md:items-end md:justify-between md:py-32">
        <div>
          <h2 className="max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Go make something. He&apos;ll tell you when it&apos;s done.
          </h2>
          <a href={siteConfig.downloadUrl} className="mt-8 inline-block bg-sparkle px-6 py-3 text-lg font-bold text-outline">
            Download for Mac
          </a>
        </div>
        <PixelSprite mood="done" scale={8} className="mochi-bob" title="Mochi waving" />
      </div>
    </section>
  );
}
