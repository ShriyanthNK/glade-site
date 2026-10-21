import { siteConfig } from "../../site.config";

export function Footer() {
  return (
    <footer className="border-t-4 border-outline">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-8 text-sm text-paper/70">
        <span>{siteConfig.name}{siteConfig.version ? ` ${siteConfig.version}` : ""}</span>
        <a href={siteConfig.githubUrl} className="underline underline-offset-4 hover:no-underline">GitHub</a>
      </div>
      <p className="mx-auto max-w-6xl px-5 pb-8 text-sm text-paper/70">
        An independent project. Not affiliated with or endorsed by Anthropic.
      </p>
    </footer>
  );
}
