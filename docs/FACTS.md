# What the page may say

Every claim on the launch page must be in this list, with where it is verified. If it is not here, it does not go on
the page. Price, license wording, download link, notarization and any numbers of users, stars or reviews are NOT here
on purpose: they are the owner's to confirm.

Evidence paths are in the glade app repo (`github.com/ShriyanthNK/glade`) unless marked site.

| Claim | Evidence |
| --- | --- |
| Glade is a macOS app; macOS 13 or later | `Package.swift` (`.macOS(.v13)`), `Info.plist` in `scripts/bundle.sh` |
| It lives in the menu bar and opens its own window (Home, Looks, Terminal, Alerts, Claude Code, About) | `StatusItemController.swift`, `AppWindow.swift`; screenshots in the design loop |
| Hoot, a pixel owl, pops up when Claude Code finishes or needs your OK | `Controller.swift` (Stop, Notification, PermissionRequest) |
| Hoot gets impatient: waiting, then annoyed after 60 s, then angry after 120 s, gives up after 180 s by default (configurable) | `Views.swift` tiers; `Config.giveUpAfter`; Alerts page |
| Hoot stays away while the terminal is in front and you are typing, and checks again every 3 s | `AlertPolicy`, `Controller.attempt`; `AlertContentTests` |
| The bubble says what Claude wants ("Run: npm test", "Edit: Views.swift") and, when done, a one-line summary of Claude's last message | `AlertContent`, `MessageTests`; pop-up snapshots |
| The glowing scene behind the terminal works with Terminal.app today | `SceneryController`, `TerminalProfile`; tested by hand and by `scripts/test-install.sh` (config only) |
| Photos become pixel art on your Mac and are darkened just enough that text keeps 4.5:1 contrast | `LookPipeline`, `LookPipelineTests` |
| The app contains no networking code | grep of `Sources/` for URLSession, NWConnection etc. (none); source is public |
| Glade adds five hooks (Notification, PermissionRequest, Stop, UserPromptSubmit, PostToolUse) to Claude Code's settings.json, saves a backup first and only touches its own entries | `HookInstaller`, `HookInstallerTests` |
| An optional Hoot status line: calm under 60 % context, impatient from 60 %, worried from 85 %; it never overwrites another status line unless asked and restores it when removed | `StatusLine.swift`, `StatusLineTests` |
| Uninstall is in the app (About) and removes hooks, status line (restoring a replaced one), looks, settings and the `glade` command | `Uninstaller`, `UninstallerTests` |
| There is a `glade` command (open, snooze, look add, statusline, test ...) | `Sources/Glade/main.swift` |
| Glade is an independent project, not affiliated with or endorsed by Anthropic | owner's decision, `Footer.tsx` |
| Alerts work with any terminal Claude Code runs in; clicking Hoot jumps back to it | `Controller.activateTerminal`, `knownTerminalBundles` |
| An optional soft chime plays when Hoot appears (off by default) | `Config.chime`, Alerts page, `Controller.show` |
| Connecting Claude Code is one button in the app (the Get started checklist on Home, or the Claude Code page) | `HomePage.swift`, `ClaudeCodePage.swift`, `HookInstaller` |
| Nothing leaves your Mac from Glade's own code: the app has no networking code, so a photo cannot be uploaded by it | grep of `Sources/`; public source |
