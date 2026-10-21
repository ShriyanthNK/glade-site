import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "800"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Claude Buddy: Mochi taps you when Claude Code is done",
  description:
    "A menu-bar Mac app. Mochi pops up when Claude Code finishes or needs your OK, then gets out of the way.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
