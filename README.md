# 🧱 LuantiStudio

A visual Blockly editor for putting together a working [Luanti](https://www.luanti.org/)/Minetest mod without typing Lua. Drag blocks for nodes, items, tools, crafting recipes, and node behavior (sound, timers, replacing nodes) together, upload your own textures and sounds, and download an installable mod folder as a `.zip`.

Built for classroom use (De Twijn / TechDeck) — the generated Lua code always stays visible and readable, so students can connect the blocks to the code.

## Features

- **Node editor** — name, description, light, diggable/climbable, drawtype, dig groups, drop item
- **Textures** — upload `.png`/`.jpg` files, or pick a solid color (no image needed); one default texture for all sides with optional per-side overrides
- **Sounds** — upload `.ogg` files with a preview play button
- **Events** — "When this node is hit / pressed / dug" or "when a player comes within X blocks" (runs on an ABM), with actions: play sound, replace node, wait (with nested follow-up actions) — great for buttons, doors, traps, and surprise effects
- **Items, tools & crafting** — craftitems, tools with tool capabilities, shaped/shapeless recipes, furnace fuel
- **Custom Lua code block** — with syntax highlighting (CodeMirror) for anyone who wants to go beyond the blocks
- **Examples** — ready-made mods to load and explore (growing tree, sound node, color-changing node, confetti)
- **Two languages** — Dutch / English, switchable instantly; blocks on the workspace re-translate live
- **Save/open projects** — save your work under a name you choose (IndexedDB, stays in the browser)
- **PWA** — installable as an app, works offline thanks to a service worker
- **One-click download** — generates a complete mod folder (`mod.conf`, `init.lua`, `textures/`, `sounds/`) as a `.zip`

## Getting started

No build step — plain static files.

```bash
./start.sh          # starts on http://localhost:8080
./start.sh 8099      # or a different port
```

Or open `index.html` through any local web server (needed for the service worker and the script load order; opening it directly as `file://` doesn't fully work).

## Usage

1. Drag blocks from the categories on the left (**Nodes**, **Items & Tools**, **Crafting**, **Custom code**, **Values**) into the workspace and click them together.
2. Upload textures and sounds via the tabs in the top-right side panel.
3. Watch the generated Lua code live in the **Lua code** tab.
4. Click **⬇ Download mod (.zip)** and unpack the folder into your Luanti/Minetest installation's `mods/` directory.

## Project structure

```
index.html          Layout, Blockly toolbox mount point, CDN includes
style.css            Styling (dark theme)
manifest.json / sw.js   PWA manifest and service worker
js/
  i18n.js            Translation dictionary (NL/EN) + language helpers
  ui.js              Shared modals (confirm, prompt, toast) — no native browser dialogs
  storage.js         IndexedDB wrapper for saved projects
  blocks.js           Blockly block definitions + custom fields (color picker, Lua code editor)
  generator.js         Block → Lua code generator
  examples.js          Ready-made example mods
  app.js               Wiring: workspace, tabs, uploads, project menu, zip download
icons/                PWA icons
```

## Tech

No build tooling — every library loads via CDN:

- [Blockly](https://developers.google.com/blockly) — block editor
- [CodeMirror 5](https://codemirror.net/5/) — Lua syntax highlighting in the custom-code block
- [JSZip](https://stuk.github.io/jszip/) — assembles the downloadable zip file

## Known limitations

- Sounds must be `.ogg` (Luanti doesn't support other audio formats)
- Solid-color textures use Luanti's `[fill` texture modifier — don't add a closing `]`, that syntax has no terminator
