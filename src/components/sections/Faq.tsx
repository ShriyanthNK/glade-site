import { siteConfig } from "../../../site.config";
import type { ReactNode } from "react";

const Cmd = ({ children }: { children: ReactNode }) => (
  <code className="bg-ink/85 px-1 font-mono font-extrabold text-sprout">{children}</code>
);

const FAQ: [string, ReactNode][] = [
  [`What does ${siteConfig.name} change in my Claude Code settings?`, "It adds five hooks (Notification, PermissionRequest, Stop, UserPromptSubmit, PostToolUse) and, only if you turn it on, a status line. It saves a backup of settings.json first and only touches its own entries. You can remove them from the Claude Code page, or everything at once from About > Uninstall."],
  ["Does it upload my photos?", `No. They are turned into pixel art on your Mac, and ${siteConfig.name}'s own code has no networking, so it cannot upload them. The source is on GitHub.`],
  ["Will it nag me while I'm working?", "No. If your terminal is in front and you are typing, Hoot stays away. It also gives up after 3 minutes by default, and you can snooze it from the menu bar."],
  ["Does it work with iTerm2, Ghostty or VS Code?", "The alerts work with any terminal Claude Code runs in, and clicking Hoot jumps back to it. The scene behind your terminal works with Terminal.app today."],
  ["How do I uninstall it?", <>In the app, open About and choose Uninstall {siteConfig.name}. It removes its hooks and status line (and puts back one it replaced), your looks and settings, and the <Cmd>glade</Cmd> command.</>],
  ["Which macOS versions?", "macOS 13 or later."],
  ["Is this from Anthropic?", `No. ${siteConfig.name} is an independent project, not affiliated with or endorsed by Anthropic.`],
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto grid max-w-6xl gap-10 px-5 pb-24 md:grid-cols-[1fr_1.6fr] md:gap-16 md:pb-32">
      <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Questions</h2>
      <div className="divide-y-4 divide-outline border-y-4 border-outline">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold [&::-webkit-details-marker]:hidden">
              {q}
              <span
                aria-hidden
                className="relative h-4 w-4 shrink-0 before:absolute before:left-0 before:top-[6px] before:h-1 before:w-4 before:bg-sparkle after:absolute after:left-[6px] after:top-0 after:h-4 after:w-1 after:bg-sparkle group-open:after:hidden"
              />
            </summary>
            <p className="mt-3 max-w-xl break-words text-paper/80">{a}</p>
          </details>
        ))}
      </div>
      {/* TODO(owner): add price and license answers once confirmed. */}
    </section>
  );
}
