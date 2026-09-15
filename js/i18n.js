// ─────────────────────────────────────────────
// LuantiStudio — taal / i18n (NL / EN)
// ─────────────────────────────────────────────
// Let op: technische Minetest/Luanti-termen (drawtype-waarden, cracky,
// crumbly, groupcaps, full_punch_interval, ...) worden bewust NIET
// vertaald — dat zijn letterlijke Lua-API-namen die in de gegenereerde
// code terugkomen, en blijven zo herkenbaar voor wie de Lua-API leert.

const LANG_STORAGE_KEY = 'luantistudio_lang';

const I18N = {
  nl: {
    'common.cancel': 'Annuleren',
    'common.close': 'Sluiten',
    'common.delete': 'Verwijderen',
    'common.load': 'Laden',

    'header.modName': 'Mod naam:',
    'header.desc': 'Beschrijving:',
    'header.author': 'Auteur:',
    'header.authorPlaceholder': 'jouwnaam',
    'header.examplesBtn': '📂 Voorbeelden',
    'header.projectBtn': '💾 Project',
    'header.testBtn': '🎮 Test in Luanti',
    'header.download': '⬇ Download mod (.zip)',
    'header.langLabel': 'Taal',

    'test.menuRun': 'Testen (schrijf naar mods-map)',
    'test.menuChooseFolder': 'Andere mods-map kiezen…',
    'test.done': 'Mod "{name}" staat klaar in je mods-map. Herstart Luanti of laad de wereld opnieuw.',
    'test.error': 'Kon de mod niet wegschrijven. Probeer een andere map te kiezen.',
    'test.unsupported': 'Deze browser ondersteunt geen directe bestandstoegang. Gebruik "Download mod (.zip)" en pak die uit in je mods-map.',

    'examples.boom': '🌳 Groeiende boom',
    'examples.geluid': '🔊 Geluidsnode',
    'examples.kleur': '🎨 Kleurwisselende node',
    'examples.confetti': '🎉 Confetti node',
    'examples.confirmLoad': 'Workspace wissen en "{label}" laden?',
    'examples.confirmBtn': '✓ Laden',

    'tabs.textures': 'Textures',
    'tabs.sounds': 'Geluiden',
    'tabs.lua': 'Lua code',

    'textures.dropHtml': 'Sleep .png/.jpg bestanden hierheen<br>of',
    'textures.chooseFiles': 'Kies bestanden',
    'textures.remove': 'Verwijder',
    'textures.none': '(geen texture)',

    'sounds.dropHtml': 'Sleep .ogg bestanden hierheen<br>of',
    'sounds.none': '(geen geluid)',
    'sounds.play': 'Afspelen',

    'lua.copy': '📋 Kopieer',
    'lua.copied': '✓ Gekopieerd!',
    'lua.expand': '⛶ Vergroot',
    'lua.placeholder': '-- Voeg blokken toe in de workspace om Lua-code te genereren.',
    'lua.empty': '-- (workspace is leeg)',

    'toolbox.nodes': 'Nodes',
    'toolbox.items': 'Items & Tools',
    'toolbox.crafting': 'Crafting',
    'toolbox.owncode': 'Eigen code',
    'toolbox.values': 'Waarden',

    'blocks.texturePicker.label': 'texture',
    'blocks.texturePicker.tooltip': 'Kies een geüploade texture',

    'blocks.textureColor.label': 'texture kleur',
    'blocks.textureColor.tooltip': 'Effen kleur als texture — geen plaatje nodig',

    'blocks.sideTexture.label': 'zijde',
    'blocks.sideTexture.top': '↑ Boven',
    'blocks.sideTexture.bottom': '↓ Onder',
    'blocks.sideTexture.right': '→ Rechts',
    'blocks.sideTexture.left': '← Links',
    'blocks.sideTexture.back': '◀ Achter',
    'blocks.sideTexture.front': '▶ Voor',
    'blocks.sideTexture.tooltip': 'Geeft één zijde van de node een eigen texture (overschrijft de standaard)',

    'blocks.nodeGroups.title': 'Node groepen',
    'blocks.nodeGroups.tooltip': 'Stel dig-groepen in voor een node',

    'blocks.nodeDrop.label': 'drop item',
    'blocks.nodeDrop.count': 'aantal',
    'blocks.nodeDrop.tooltip': 'Item dat de node laat vallen bij afbreken',

    'blocks.registerNode.title': 'Registreer node',
    'blocks.registerNode.desc': 'Beschrijving',
    'blocks.registerNode.texturesHeader': '── Texturen ──────────────',
    'blocks.registerNode.textureDefault': 'Texture (rondom)',
    'blocks.registerNode.sideOverrides': 'Andere zijden (optioneel)',
    'blocks.registerNode.light': 'Licht niveau (0-14)',
    'blocks.registerNode.groups': 'Groepen',
    'blocks.registerNode.events': 'Gebeurtenissen (optioneel)',
    'blocks.registerNode.tooltip': 'Registreert een nieuwe node (blok) in de mod',

    'blocks.onEvent.label': 'Wanneer deze node wordt',
    'blocks.onEvent.hit': 'geraakt (hit)',
    'blocks.onEvent.rightclick': 'ingedrukt (rechtsklik)',
    'blocks.onEvent.dig': 'afgebroken (dig)',
    'blocks.onEvent.doLabel': 'doe:',
    'blocks.onEvent.tooltip': 'Voer acties uit wanneer een speler met deze node interacteert',

    'blocks.onNear.label': 'Wanneer een speler binnen',
    'blocks.onNear.radiusLabel': 'blokken komt',
    'blocks.onNear.tooltip': 'Voert acties uit zodra een speler binnen het opgegeven aantal blokken van deze node komt (controleert elke seconde)',

    'blocks.playSound.label': 'speel geluid',
    'blocks.playSound.volume': 'volume',
    'blocks.playSound.tooltip': 'Speelt een geüpload geluid af op de plek van de node',

    'blocks.setNode.label': 'vervang node door',
    'blocks.setNode.tooltip': 'Vervangt deze node door een andere node (bijv. "mymod:knop_uit" of "air")',

    'blocks.wait.label': 'wacht',
    'blocks.wait.secondsLabel': 'sec',
    'blocks.wait.doLabel': 'doe dan:',
    'blocks.wait.tooltip': 'Wacht een aantal seconden en voer dan acties uit',

    'blocks.registerCraftitem.title': 'Registreer craftitem',
    'blocks.registerCraftitem.desc': 'Beschrijving',
    'blocks.registerCraftitem.maxStack': 'Max stack',
    'blocks.registerCraftitem.invImage': 'Inventory image',
    'blocks.registerCraftitem.tooltip': 'Registreert een craftitem (ruwe resource/ingredient)',

    'blocks.toolCaps.tooltip': 'Stel tool capabilities in voor een tool',

    'blocks.registerTool.title': 'Registreer tool',
    'blocks.registerTool.desc': 'Beschrijving',
    'blocks.registerTool.invImage': 'Inventory image',
    'blocks.registerTool.toolCaps': 'Tool capabilities',
    'blocks.registerTool.tooltip': 'Registreert een tool (bijl, hak, schep, etc.)',

    'blocks.craftShaped.title': 'Shaped craft → output',
    'blocks.craftShaped.count': 'aantal',
    'blocks.craftShaped.emptyHint': '(leeg = lege plek)',
    'blocks.craftShaped.tooltip': 'Shaped crafting recept (3×3 grid). Gebruik item-namen zoals "default:stone".',

    'blocks.craftShapeless.title': 'Shapeless craft → output',
    'blocks.craftShapeless.count': 'aantal',
    'blocks.craftShapeless.ingredient': 'ingredient',
    'blocks.craftShapeless.emptyHint': '(laat leeg om te skippen)',
    'blocks.craftShapeless.tooltip': "Shapeless crafting recept — volgorde maakt niet uit",

    'blocks.craftFuel.title': 'Fuel recept — item',
    'blocks.craftFuel.burntime': 'brandtijd (sec)',
    'blocks.craftFuel.tooltip': 'Registreert een item als brandstof in een furnace',

    'blocks.rawLua.label': '📝 Lua',
    'blocks.rawLua.tooltip': 'Klik op de code-preview om de editor te openen. Wordt ongewijzigd in init.lua opgenomen.',
    'blocks.rawLua.previewEmpty': '(leeg)',
    'blocks.rawLua.previewExtraLines': '  [+{n} regels]',

    'fieldCode.title': '📝 Eigen Lua code',
    'fieldCode.hint': 'Tab = 2 spaties · Ctrl+Enter = opslaan',
    'fieldCode.save': '✓ Opslaan',

    'project.menuLabel': 'Project',
    'project.save': 'Opslaan als…',
    'project.open': 'Openen…',
    'project.savePromptTitle': 'Naam voor dit project',
    'project.saveBtn': '✓ Opslaan',
    'project.openTitle': 'Opgeslagen projecten',
    'project.noProjects': 'Nog geen opgeslagen projecten.',
    'project.savedAt': 'Opgeslagen op {date}',
    'project.confirmOverwrite': 'Huidige workspace vervangen door "{name}"?',
    'project.confirmDelete': 'Project "{name}" verwijderen?',
    'project.savedToast': 'Project "{name}" opgeslagen',
    'project.nameRequired': 'Geef een naam op',
  },

  en: {
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.delete': 'Delete',
    'common.load': 'Load',

    'header.modName': 'Mod name:',
    'header.desc': 'Description:',
    'header.author': 'Author:',
    'header.authorPlaceholder': 'yourname',
    'header.examplesBtn': '📂 Examples',
    'header.projectBtn': '💾 Project',
    'header.testBtn': '🎮 Test in Luanti',
    'header.download': '⬇ Download mod (.zip)',
    'header.langLabel': 'Language',

    'test.menuRun': 'Test (write to mods folder)',
    'test.menuChooseFolder': 'Choose a different mods folder…',
    'test.done': 'Mod "{name}" is ready in your mods folder. Restart Luanti or reload the world.',
    'test.error': 'Could not write the mod. Try choosing a different folder.',
    'test.unsupported': 'This browser doesn\'t support direct file access. Use "Download mod (.zip)" and extract it into your mods folder instead.',

    'examples.boom': '🌳 Growing tree',
    'examples.geluid': '🔊 Sound node',
    'examples.kleur': '🎨 Color-changing node',
    'examples.confetti': '🎉 Confetti node',
    'examples.confirmLoad': 'Clear workspace and load "{label}"?',
    'examples.confirmBtn': '✓ Load',

    'tabs.textures': 'Textures',
    'tabs.sounds': 'Sounds',
    'tabs.lua': 'Lua code',

    'textures.dropHtml': 'Drag .png/.jpg files here<br>or',
    'textures.chooseFiles': 'Choose files',
    'textures.remove': 'Remove',
    'textures.none': '(no texture)',

    'sounds.dropHtml': 'Drag .ogg files here<br>or',
    'sounds.none': '(no sound)',
    'sounds.play': 'Play',

    'lua.copy': '📋 Copy',
    'lua.copied': '✓ Copied!',
    'lua.expand': '⛶ Expand',
    'lua.placeholder': '-- Add blocks to the workspace to generate Lua code.',
    'lua.empty': '-- (workspace is empty)',

    'toolbox.nodes': 'Nodes',
    'toolbox.items': 'Items & Tools',
    'toolbox.crafting': 'Crafting',
    'toolbox.owncode': 'Custom code',
    'toolbox.values': 'Values',

    'blocks.texturePicker.label': 'texture',
    'blocks.texturePicker.tooltip': 'Pick an uploaded texture',

    'blocks.textureColor.label': 'texture color',
    'blocks.textureColor.tooltip': 'Solid color as texture — no image needed',

    'blocks.sideTexture.label': 'side',
    'blocks.sideTexture.top': '↑ Top',
    'blocks.sideTexture.bottom': '↓ Bottom',
    'blocks.sideTexture.right': '→ Right',
    'blocks.sideTexture.left': '← Left',
    'blocks.sideTexture.back': '◀ Back',
    'blocks.sideTexture.front': '▶ Front',
    'blocks.sideTexture.tooltip': "Gives one side of the node its own texture (overrides the default)",

    'blocks.nodeGroups.title': 'Node groups',
    'blocks.nodeGroups.tooltip': 'Set dig groups for a node',

    'blocks.nodeDrop.label': 'drop item',
    'blocks.nodeDrop.count': 'amount',
    'blocks.nodeDrop.tooltip': 'Item the node drops when dug',

    'blocks.registerNode.title': 'Register node',
    'blocks.registerNode.desc': 'Description',
    'blocks.registerNode.texturesHeader': '── Textures ──────────────',
    'blocks.registerNode.textureDefault': 'Texture (all sides)',
    'blocks.registerNode.sideOverrides': 'Other sides (optional)',
    'blocks.registerNode.light': 'Light level (0-14)',
    'blocks.registerNode.groups': 'Groups',
    'blocks.registerNode.events': 'Events (optional)',
    'blocks.registerNode.tooltip': 'Registers a new node (block) in the mod',

    'blocks.onEvent.label': 'When this node is',
    'blocks.onEvent.hit': 'hit',
    'blocks.onEvent.rightclick': 'pressed (right-click)',
    'blocks.onEvent.dig': 'dug',
    'blocks.onEvent.doLabel': 'do:',
    'blocks.onEvent.tooltip': 'Runs actions when a player interacts with this node',

    'blocks.onNear.label': 'When a player comes within',
    'blocks.onNear.radiusLabel': 'blocks',
    'blocks.onNear.tooltip': 'Runs actions when a player comes within the given number of blocks of this node (checks every second)',

    'blocks.playSound.label': 'play sound',
    'blocks.playSound.volume': 'volume',
    'blocks.playSound.tooltip': "Plays an uploaded sound at the node's position",

    'blocks.setNode.label': 'replace node with',
    'blocks.setNode.tooltip': 'Replaces this node with another node (e.g. "mymod:switch_off" or "air")',

    'blocks.wait.label': 'wait',
    'blocks.wait.secondsLabel': 'sec',
    'blocks.wait.doLabel': 'then do:',
    'blocks.wait.tooltip': 'Waits a number of seconds, then runs actions',

    'blocks.registerCraftitem.title': 'Register craftitem',
    'blocks.registerCraftitem.desc': 'Description',
    'blocks.registerCraftitem.maxStack': 'Max stack',
    'blocks.registerCraftitem.invImage': 'Inventory image',
    'blocks.registerCraftitem.tooltip': 'Registers a craftitem (raw resource/ingredient)',

    'blocks.toolCaps.tooltip': 'Set tool capabilities for a tool',

    'blocks.registerTool.title': 'Register tool',
    'blocks.registerTool.desc': 'Description',
    'blocks.registerTool.invImage': 'Inventory image',
    'blocks.registerTool.toolCaps': 'Tool capabilities',
    'blocks.registerTool.tooltip': 'Registers a tool (axe, pick, shovel, etc.)',

    'blocks.craftShaped.title': 'Shaped craft → output',
    'blocks.craftShaped.count': 'amount',
    'blocks.craftShaped.emptyHint': '(empty = empty slot)',
    'blocks.craftShaped.tooltip': 'Shaped crafting recipe (3×3 grid). Use item names like "default:stone".',

    'blocks.craftShapeless.title': 'Shapeless craft → output',
    'blocks.craftShapeless.count': 'amount',
    'blocks.craftShapeless.ingredient': 'ingredient',
    'blocks.craftShapeless.emptyHint': '(leave empty to skip)',
    'blocks.craftShapeless.tooltip': "Shapeless crafting recipe — order doesn't matter",

    'blocks.craftFuel.title': 'Fuel recipe — item',
    'blocks.craftFuel.burntime': 'burn time (sec)',
    'blocks.craftFuel.tooltip': 'Registers an item as furnace fuel',

    'blocks.rawLua.label': '📝 Lua',
    'blocks.rawLua.tooltip': 'Click the code preview to open the editor. Included as-is in init.lua.',
    'blocks.rawLua.previewEmpty': '(empty)',
    'blocks.rawLua.previewExtraLines': '  [+{n} lines]',

    'fieldCode.title': '📝 Custom Lua code',
    'fieldCode.hint': 'Tab = 2 spaces · Ctrl+Enter = save',
    'fieldCode.save': '✓ Save',

    'project.menuLabel': 'Project',
    'project.save': 'Save as…',
    'project.open': 'Open…',
    'project.savePromptTitle': 'Name for this project',
    'project.saveBtn': '✓ Save',
    'project.openTitle': 'Saved projects',
    'project.noProjects': 'No saved projects yet.',
    'project.savedAt': 'Saved on {date}',
    'project.confirmOverwrite': 'Replace current workspace with "{name}"?',
    'project.confirmDelete': 'Delete project "{name}"?',
    'project.savedToast': 'Project "{name}" saved',
    'project.nameRequired': 'Please enter a name',
  },
};

// Standaardtaal is Engels — alleen een eerder door de gebruiker gekozen
// taal (via de taalkiezer, onthouden in localStorage) overschrijft dit.
// Geen browsertaal-detectie: "default is Engels" moet ook echt de
// default zijn voor iedereen die nog niets gekozen heeft.
function detectInitialLanguage() {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored && I18N[stored]) return stored;
  } catch (e) { /* localStorage kan geblokkeerd zijn */ }
  return 'en';
}

let currentLang = detectInitialLanguage();
const langChangeListeners = [];

function t(key, vars) {
  let str = (I18N[currentLang] && I18N[currentLang][key]) || I18N.nl[key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, v);
    }
  }
  return str;
}

function getLanguage() {
  return currentLang;
}

function onLanguageChange(fn) {
  langChangeListeners.push(fn);
}

function setLanguage(lang) {
  if (!I18N[lang] || lang === currentLang) return;
  currentLang = lang;
  try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (e) { /* negeren */ }
  document.documentElement.lang = lang;
  applyStaticTranslations();
  langChangeListeners.forEach(fn => fn(lang));
}

// Vertaalt alle statische DOM-elementen met data-i18n / data-i18n-* attributen.
function applyStaticTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.getAttribute('data-i18n-title'));
  });
}

document.documentElement.lang = currentLang;
