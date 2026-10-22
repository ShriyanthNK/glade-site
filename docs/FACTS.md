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
| Photos are fitted to the terminal automatically; you can crop (move the box, drag a corner, zoom) and choose pixel art (480x270, limited palette) or a smooth picture (1280x720); either way it is darkened just enough that text keeps 4.5:1 contrast | `LookPipeline`, `CropRegion`, `CropEditor.swift`, `LookPipelineTests`, `CropRegionTests` |
| The app contains no networking code | grep of `Sources/` for URLSession, NWConnection etc. (none); source is public |
| Glade adds five hooks (Notification, PermissionRequest, Stop, UserPromptSubmit, PostToolUse) to Claude Code's settings.json, saves a backup first and only touches its own entries | `HookInstaller`, `HookInstallerTests` |
| An optional Hoot status line: calm under 60 % context, impatient from 60 %, worried from 85 %; it never overwrites another status line unless asked and restores it when removed | `StatusLine.swift`, `StatusLineTests` |
| Uninstall is in the app (About) and removes hooks, status line (restoring a replaced one), looks and settings | `Uninstaller`, `UninstallerTests` |
| Glade is an independent project, not affiliated with or endorsed by Anthropic | owner's decision, `Footer.tsx` |
| Alerts work with any terminal Claude Code runs in; clicking Hoot jumps back to it | `Controller.activateTerminal`, `knownTerminalBundles` |
| An optional soft chime plays when Hoot appears (off by default) | `Config.chime`, Alerts page, `Controller.show` |
| Connecting Claude Code is one button in the app (the Get started checklist on Home, or the Claude Code page) | `HomePage.swift`, `ClaudeCodePage.swift`, `HookInstaller` |
| Nothing leaves your Mac from Glade's own code: the app has no networking code, so a photo cannot be uploaded by it | grep of `Sources/`; public source |
| Snooze from the menu bar item (30 minutes, 1 hour, 2 hours, until turned off) and from the Alerts page | `StatusItemController.swift`, `AlertsPage.swift` |
| The Claude Code page connects and disconnects the hooks; About > Uninstall removes everything | `ClaudeCodePage.swift`, `AboutPage.swift`, `Uninstaller` |
| Glade opens Terminal.app in a "Glade" profile (Hoot's colors, see-through background) with a scene behind it; the built-in scene is Night Forest | `TerminalProfile.swift`, `TerminalBridge.openGladeWindow`, `LookStore.builtins` |
| Photos are read with the system's image decoder (JPEG, PNG, HEIC and the other formats macOS supports) | `LookPipeline.load` (ImageIO) |
| Glade's own code has no networking, so it cannot upload a photo | grep of `Sources/`; public source |
| The status line shows Hoot's face and mood word, the model name, the project folder and a context bar with a percentage | `StatusLine.swift` script |
| Glade does not replace an existing status line unless you choose to; it keeps the old one and restores it when Hoot's is removed | `StatusLineInstaller`, `StatusLineTests` |
| Glade's source is public on GitHub | `github.com/ShriyanthNK/glade` |
| Alerts get more insistent the longer Claude waits (waiting, annoyed, angry) | `Views.swift` tiers |
| You can choose the font and size (10 to 24 pt) for Glade terminals: any installed monospaced font, with a live preview; JetBrains Mono can be installed with one click into your own Fonts folder, and uninstalling removes only what Glade added | `TerminalFonts.swift`, `TerminalFontCard.swift`, `TerminalFontsTests` |
| The app and this page are set in Bricolage Grotesque, Pixelify Sans and JetBrains Mono (open fonts, SIL OFL) | `Resources/Fonts` with license texts; `BrandFontsTests` |
| The scenes animation shows a generated sample picture (not a real photo) going through the app's real look pipeline | `motion/looks/tools/make-assets.mjs` (its last stage ran the app's look pipeline through a command-line export that has since been removed, so the script no longer runs; the rendered video is kept) |
