import Link from "next/link";
import { Nav } from "@/components/sections/Nav";
import { Footer } from "@/components/Footer";
import { PixelSprite } from "@/components/PixelSprite";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-start justify-center gap-6 px-5 py-16">
        <PixelSprite mood="annoyed" scale={6} className="mochi-bob" />
        <h1 className="max-w-3xl text-balance text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl">
          Mochi can&apos;t find that page.
        </h1>
        <p className="max-w-xl text-lg text-paper/80">
          The link may be old or mistyped. The start page has everything.
        </p>
        <Link href="/" className="bg-sparkle px-6 py-3 text-lg font-bold text-outline">
          Back to the start
        </Link>
      </main>
      <Footer />
    </>
  );
}
