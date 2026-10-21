import { siteConfig } from "../../site.config";

export function Footer() {
  return (
    <footer className="border-t-4 border-outline">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-8 text-sm text-paper/70">
        <span>Claude Buddy {siteConfig.version}</span>
        <a href={siteConfig.githubUrl} className="underline-offset-4 hover:underline">GitHub</a>
      </div>
    </footer>
  );
}
