import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { siteConfig } from "../../site.config";
import { Backdrop } from "@/components/Backdrop";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "800"], variable: "--font-jetbrains" });

// Vercel exposes its own system variables at build time; no variable needs to be set by hand.
// The share image comes from src/app/opengraph-image.png and twitter-image.png (scripts/make-og.mjs).
// TODO(owner): once the real domain is known, set metadataBase to it directly.
const host = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const metadataBase = new URL(host ? `https://${host}` : "http://localhost:3000");

const title = `${siteConfig.name}: give your terminal a forest`;
const description =
  "A Mac app that puts a pixel scene, or your own photo, behind Claude Code, and Hoot the owl to tap you when it finishes or needs your OK.";
export const metadata: Metadata = {
  metadataBase,
  title,
  description,
  openGraph: { title, description, type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        <Backdrop />
        {children}
      </body>
    </html>
  );
}
