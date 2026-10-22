import Link from "next/link";
import { siteConfig } from "../../../site.config";

export function Nav() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
      <Link href="/#top" className="text-2xl font-extrabold tracking-tight">{siteConfig.name}</Link>
      <nav aria-label="Primary" className="flex items-center gap-4 text-sm font-medium sm:gap-6">
        <a href="#looks" className="hidden min-h-11 items-center underline-offset-4 hover:underline sm:inline-flex">Scenes</a>
        <a href="#alerts" className="hidden min-h-11 items-center underline-offset-4 hover:underline sm:inline-flex">Alerts</a>
        <a href="#faq" className="hidden min-h-11 items-center underline-offset-4 hover:underline sm:inline-flex">FAQ</a>
        <a href={siteConfig.githubUrl} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">GitHub</a>
        <a href={siteConfig.downloadUrl} className="inline-flex min-h-11 items-center bg-paper px-4 font-semibold text-outline">Download</a>
      </nav>
    </header>
  );
}
