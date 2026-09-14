# 🧱 LuantiStudio

Een visuele Blockly-editor waarmee je zonder Lua te typen een werkende [Luanti](https://www.luanti.org/)/Minetest-mod in elkaar klikt. Sleep blokken voor nodes, items, tools, crafting-recepten en node-gedrag (geluid, timers, node vervangen) in elkaar, upload je eigen textures en geluiden, en download direct een installeerbare mod-map als `.zip`.

Gebouwd voor onderwijsgebruik (De Twijn / TechDeck) — de gegenereerde Lua-code blijft altijd zichtbaar en leesbaar, zodat leerlingen de link tussen blokken en code leggen.

## Functies

- **Node-editor** — naam, beschrijving, licht, diggable/climbable, drawtype, dig-groepen, drop-item
- **Textures** — upload `.png`/`.jpg` bestanden, óf kies een effen kleur (geen plaatje nodig); één standaard-texture rondom met optionele per-zijde uitzonderingen
- **Geluiden** — upload `.ogg` bestanden met voorbeeld-afspeelknop
- **Gebeurtenissen** — "Wanneer deze node wordt geraakt / ingedrukt / afgebroken" of "wanneer een speler binnen X blokken komt" (draait op een ABM), met acties: geluid afspelen, node vervangen, wachten (met geneste vervolgacties) — ideaal voor knoppen, deuren, vallen en verrassingseffecten
- **Items, tools & crafting** — craftitems, tools met tool-capabilities, shaped/shapeless recepten, furnace fuel
- **Eigen Lua-code blok** — met syntax highlighting (CodeMirror) voor wie verder wil dan de blokken
- **Voorbeelden** — kant-en-klare mods om te laden en te verkennen (groeiende boom, geluidsnode, kleurwisselende node, confetti)
- **Twee talen** — Nederlands / English, direct omschakelbaar; live vertaling van blokken op de workspace
- **Projecten opslaan/openen** — bewaar je werk onder een zelfgekozen naam (IndexedDB, blijft in de browser)
- **PWA** — installeerbaar als app, werkt offline dankzij een service worker
- **Direct downloaden** — genereert een complete modmap (`mod.conf`, `init.lua`, `textures/`, `sounds/`) als `.zip`

## Starten

Geen build-stap nodig — puur statische bestanden.

```bash
./start.sh          # start op http://localhost:8080
./start.sh 8099      # of op een andere poort
```

Of open `index.html` via een willekeurige lokale webserver (nodig voor de service worker en module-achtige script-laadvolgorde; direct openen als `file://` werkt niet volledig betrouwbaar).

## Gebruik

1. Sleep blokken uit de categorieën links (**Nodes**, **Items & Tools**, **Crafting**, **Eigen code**, **Waarden**) de werkruimte in en klik ze aan elkaar.
2. Upload textures en geluiden via de tabs rechtsboven in het zijpaneel.
3. Bekijk de gegenereerde Lua-code live in de tab **Lua code**.
4. Klik **⬇ Download mod (.zip)** en pak de map uit in de `mods/`-map van je Luanti/Minetest-installatie.

## Projectstructuur

```
index.html          Layout, Blockly-toolbox-plek, CDN-includes
style.css            Styling (donker thema)
manifest.json / sw.js   PWA-manifest en service worker
js/
  i18n.js            Vertaalwoordenboek (NL/EN) + taal-helpers
  ui.js              Gedeelde modals (bevestigen, invoer, toast) — geen native browser-dialogs
  storage.js         IndexedDB-wrapper voor opgeslagen projecten
  blocks.js           Blockly-blokdefinities + eigen velden (kleurenkiezer, Lua-code-editor)
  generator.js         Blok → Lua-codegenerator
  examples.js          Kant-en-klare voorbeeldmods
  app.js               Wiring: workspace, tabs, uploads, project­menu, zip-download
icons/                PWA-iconen
```

## Techniek

Geen build-tooling — alle libraries laden via CDN:

- [Blockly](https://developers.google.com/blockly) — blokkeneditor
- [CodeMirror 5](https://codemirror.net/5/) — Lua-syntax-highlighting in het eigen-code-blok
- [JSZip](https://stuk.github.io/jszip/) — zip-bestand samenstellen voor download

## Bekende beperkingen

- Geluiden moeten `.ogg` zijn (Luanti ondersteunt geen andere audioformaten)
- Effen kleuren als texture gebruiken Luanti's `[fill`-texture-modifier — geen sluithaakje `]` toevoegen, die syntax kent geen afsluiting
