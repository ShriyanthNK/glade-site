import Link from "next/link";
import { siteConfig } from "../../../site.config";

export function Nav() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
      <Link href="/#top" className="text-xl font-extrabold tracking-tight">{siteConfig.name}</Link>
      <nav aria-label="Primary" className="flex items-center gap-6 text-sm">
        <a href={siteConfig.githubUrl} className="underline-offset-4 hover:underline">GitHub</a>
        <a href={siteConfig.downloadUrl} className="bg-paper px-4 py-2 font-semibold text-outline">Download</a>
      </nav>
    </header>
  );
}
