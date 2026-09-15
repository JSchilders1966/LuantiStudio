// ─────────────────────────────────────────────
// LuantiStudio — main app
// ─────────────────────────────────────────────

applyStaticTranslations();

// Grotere magneet-afstand om blokken aan elkaar te koppelen. De default
// (28) is prima voor puzzelstukjes-verbindingen, maar C-vormige
// statement-sockets (zoals "Andere zijden" op Registreer node) hebben
// een veel kleiner effectief doelgebied en zijn daardoor met de
// standaardwaarde lastig te raken tijdens het slepen.
if (Blockly.config) {
  Blockly.config.snapRadius = 48;
  Blockly.config.connectingSnapRadius = 48;
}

// Shared texture registry (read by blocks.js dropdown)
window.luantiTextures = []; // [{name, dataUrl, file}]
// Shared sound registry (read by blocks.js dropdown). `name` is the
// base name WITHOUT extension — Minetest's sound_play() looks sounds
// up by base name, the .ogg extension is never part of the Lua string.
window.luantiSounds = []; // [{name, fileName, dataUrl, file}]

// ── Live mod-name sync ────────────────────────
// Fields in blocks that hold `<modname>:<something>` values
const MOD_NAME_FIELDS = ['NAME', 'OUTPUT', 'ITEM'];

let prevModName = document.getElementById('mod-name').value.trim() || 'mymod';

document.getElementById('mod-name').addEventListener('input', () => {
  const newName = (document.getElementById('mod-name').value.trim() || 'mymod')
    .replace(/[^a-z0-9_]/gi, '_').toLowerCase();
  if (newName === prevModName) return;

  workspace.getAllBlocks(false).forEach(block => {
    MOD_NAME_FIELDS.forEach(fieldName => {
      const field = block.getField(fieldName);
      if (!field) return;
      const val = field.getValue();
      if (val.startsWith(prevModName + ':')) {
        field.setValue(newName + ':' + val.slice(prevModName.length + 1));
      }
    });
  });

  prevModName = newName;
  updateCodePreview();
});

// ── Toolbox (vertaald) ────────────────────────
function buildToolbox() {
  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category', name: t('toolbox.nodes'), colour: '#5b80a5',
        contents: [
          { kind: 'block', type: 'luanti_register_node' },
          { kind: 'block', type: 'luanti_side_texture' },
          { kind: 'block', type: 'luanti_on_event' },
          { kind: 'block', type: 'luanti_on_near' },
          { kind: 'block', type: 'luanti_action_play_sound' },
          { kind: 'block', type: 'luanti_action_set_node' },
          { kind: 'block', type: 'luanti_action_wait' },
          { kind: 'block', type: 'luanti_node_groups' },
          { kind: 'block', type: 'luanti_node_drop' },
        ],
      },
      {
        kind: 'category', name: t('toolbox.items'), colour: '#a55b5b',
        contents: [
          { kind: 'block', type: 'luanti_register_craftitem' },
          { kind: 'block', type: 'luanti_register_tool' },
          { kind: 'block', type: 'luanti_tool_caps' },
        ],
      },
      {
        kind: 'category', name: t('toolbox.crafting'), colour: '#5ba55b',
        contents: [
          { kind: 'block', type: 'luanti_craft_shaped' },
          { kind: 'block', type: 'luanti_craft_shapeless' },
          { kind: 'block', type: 'luanti_craft_fuel' },
        ],
      },
      {
        kind: 'category', name: t('toolbox.owncode'), colour: '#6a6a8a',
        contents: [
          { kind: 'block', type: 'luanti_raw_lua' },
        ],
      },
      {
        kind: 'category', name: t('toolbox.values'), colour: '#a57c00',
        contents: [
          { kind: 'block', type: 'text', fields: { TEXT: 'default:stone' } },
          { kind: 'block', type: 'math_number', fields: { NUM: 1 } },
          { kind: 'block', type: 'luanti_texture_picker' },
          { kind: 'block', type: 'luanti_texture_color' },
        ],
      },
    ],
  };
}

// ── Blockly init ─────────────────────────────
const workspace = Blockly.inject('blockly-div', {
  toolbox: buildToolbox(),
  grid: { spacing: 20, length: 3, colour: '#2a2a3e', snap: true },
  zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 2, minScale: 0.4, scaleSpeed: 1.1 },
  theme: Blockly.Theme.defineTheme('luanti', {
    base: Blockly.Themes.Classic,
    componentStyles: {
      workspaceBackgroundColour: '#1e1e2e',
      toolboxBackgroundColour: '#2a2a3e',
      toolboxForegroundColour: '#cdd6f4',
      flyoutBackgroundColour: '#252535',
      flyoutForegroundColour: '#cdd6f4',
      flyoutOpacity: 0.95,
      scrollbarColour: '#3a3a54',
      insertionMarkerColour: '#7c6af0',
      insertionMarkerOpacity: 0.3,
      scrollbarOpacity: 0.6,
      cursorColour: '#7c6af0',
    },
  }),
  trashcan: true,
  move: { scrollbars: true, drag: true, wheel: false },
});

// Resize Blockly when window resizes
function resizeBlockly() {
  const area = document.getElementById('blockly-area');
  const div  = document.getElementById('blockly-div');
  div.style.width  = area.offsetWidth  + 'px';
  div.style.height = area.offsetHeight + 'px';
  Blockly.svgResize(workspace);
}
window.addEventListener('resize', resizeBlockly);
resizeBlockly();

// ── Code preview (CodeMirror: syntax highlighting + regelnummers) ──
const luaCM = CodeMirror(document.getElementById('lua-cm-host'), {
  mode: 'lua',
  theme: 'luanti',
  lineNumbers: true,
  readOnly: true,
  matchBrackets: true,
  value: t('lua.placeholder'),
});

function updateCodePreview() {
  const code = generateLuaCode(workspace);
  const text = code || t('lua.empty');
  if (luaCM.getValue() !== text) luaCM.setValue(text);
}

workspace.addChangeListener(updateCodePreview);

// ── Taal ──────────────────────────────────────
// Blok-labels/tooltips worden bepaald in elke blocks.js init() via
// t(...); die tekst staat al vast zodra een blok wordt aangemaakt. Om
// bestaande blokken op de workspace ook te vertalen: serialiseren,
// workspace + toolbox opnieuw opbouwen, en de state terugladen — dat
// laat elk blok zijn init() opnieuw draaien met de nieuwe taal.
function reloadWorkspaceForLanguage() {
  const state = Blockly.serialization.workspaces.save(workspace);
  workspace.clear();
  workspace.updateToolbox(buildToolbox());
  Blockly.serialization.workspaces.load(state, workspace);
  updateCodePreview();
}

onLanguageChange(() => reloadWorkspaceForLanguage());

const langSelect = document.getElementById('lang-select');
langSelect.value = getLanguage();
langSelect.addEventListener('change', () => setLanguage(langSelect.value));

// ── Tabs ─────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.querySelectorAll('.tab-content').forEach(c =>
      c.classList.toggle('active', c.id === `tab-${tab}`)
    );
    if (tab === 'code') {
      updateCodePreview();
      // CodeMirror meet zijn afmetingen niet goed terwijl de tab
      // verborgen was (display:none) — na zichtbaar worden opnieuw meten.
      luaCM.refresh();
    }
  });
});

// ── Copy code ────────────────────────────────
document.getElementById('btn-copy-code').addEventListener('click', () => {
  navigator.clipboard.writeText(luaCM.getValue()).then(() => {
    const btn = document.getElementById('btn-copy-code');
    const original = t('lua.copy');
    btn.textContent = t('lua.copied');
    setTimeout(() => { btn.textContent = original; }, 1500);
  });
});

// ── Lua-code vergroten ────────────────────────
// Opent de gegenereerde code in een groot, alleen-lezen CodeMirror-venster
// (zelfde stijl als de andere modals) — handig omdat het zijpaneel maar
// 320px breed is.
document.getElementById('btn-expand-code').addEventListener('click', () => {
  showExpandedCodeModal();
});

function showExpandedCodeModal() {
  const overlay = document.createElement('div');
  overlay.style.cssText =
    'position:fixed;inset:0;background:rgba(0,0,0,.75);' +
    'display:flex;align-items:center;justify-content:center;z-index:9999;';

  const box = document.createElement('div');
  box.style.cssText =
    'background:#1e1e2e;border:1px solid #3a3a54;border-radius:12px;' +
    'padding:16px;width:min(1100px, 94vw);height:min(760px, 90vh);' +
    'display:flex;flex-direction:column;gap:12px;';

  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;flex-shrink:0;';

  const title = document.createElement('div');
  title.textContent = t('tabs.lua');
  title.style.cssText = 'color:#cdd6f4;font-weight:600;font-size:.95rem;';

  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:8px;';

  const btnCopy = document.createElement('button');
  btnCopy.className = 'btn-icon';
  btnCopy.textContent = t('lua.copy');

  const btnClose = document.createElement('button');
  btnClose.className = 'btn-secondary';
  btnClose.textContent = t('common.close');

  btnRow.append(btnCopy, btnClose);
  toolbar.append(title, btnRow);

  const cmHost = document.createElement('div');
  cmHost.style.cssText =
    'flex:1;min-height:0;border:1px solid #3a3a54;border-radius:8px;overflow:hidden;';

  box.append(toolbar, cmHost);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const close = () => {
    if (overlay.parentNode) document.body.removeChild(overlay);
    document.removeEventListener('keydown', onKeydown);
  };
  const onKeydown = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKeydown);
  btnClose.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  const bigCM = CodeMirror(cmHost, {
    mode: 'lua',
    theme: 'luanti',
    lineNumbers: true,
    readOnly: true,
    matchBrackets: true,
    value: luaCM.getValue(),
  });
  bigCM.setSize('100%', '100%');
  setTimeout(() => bigCM.refresh(), 0);

  btnCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(bigCM.getValue()).then(() => {
      const original = t('lua.copy');
      btnCopy.textContent = t('lua.copied');
      setTimeout(() => { btnCopy.textContent = original; }, 1500);
    });
  });
}

// ── Texture management ────────────────────────
function renderTextureList() {
  const list = document.getElementById('texture-list');
  list.innerHTML = '';
  window.luantiTextures.forEach((tex, idx) => {
    const item = document.createElement('div');
    item.className = 'texture-item';
    item.innerHTML = `
      <img src="${tex.dataUrl}" alt="${tex.name}">
      <span class="texture-name" title="${tex.name}">${tex.name}</span>
      <button title="${t('textures.remove')}" data-idx="${idx}">✕</button>
    `;
    item.querySelector('button').addEventListener('click', () => {
      window.luantiTextures.splice(idx, 1);
      renderTextureList();
      updateCodePreview();
    });
    list.appendChild(item);
  });
}

function addTextureFiles(files) {
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    // Sanitize filename: spaces → underscores, lowercase
    const safeName = file.name.toLowerCase().replace(/\s+/g, '_');
    // Avoid duplicates
    if (window.luantiTextures.find(tex => tex.name === safeName)) return;

    const reader = new FileReader();
    reader.onload = e => {
      window.luantiTextures.push({ name: safeName, dataUrl: e.target.result, file });
      renderTextureList();
      // Refresh blocks that use texture dropdowns
      workspace.getAllBlocks(false).forEach(b => {
        if (b.type === 'luanti_texture_picker') {
          b.getField('TEX').getOptions(false); // force re-read
        }
      });
      updateCodePreview();
    };
    reader.readAsDataURL(file);
  });
}

// File input
document.getElementById('texture-input').addEventListener('change', e => {
  addTextureFiles(e.target.files);
  e.target.value = '';
});
document.getElementById('btn-choose-textures').addEventListener('click', () => {
  document.getElementById('texture-input').click();
});

// Drag and drop
const dropZone = document.getElementById('texture-drop-zone');
['dragenter','dragover'].forEach(ev => {
  dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.add('dragover'); });
});
['dragleave','drop'].forEach(ev => {
  dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.remove('dragover'); });
});
dropZone.addEventListener('drop', e => {
  addTextureFiles(e.dataTransfer.files);
});
dropZone.addEventListener('click', () => document.getElementById('texture-input').click());

// ── Sound management ──────────────────────────
function renderSoundList() {
  const list = document.getElementById('sound-list');
  list.innerHTML = '';
  window.luantiSounds.forEach((snd, idx) => {
    const item = document.createElement('div');
    item.className = 'texture-item';
    item.innerHTML = `
      <button class="sound-play-btn" title="${t('sounds.play')}">▶</button>
      <span class="texture-name" title="${snd.fileName}">${snd.name}</span>
      <button title="${t('textures.remove')}" data-idx="${idx}">✕</button>
    `;
    const audio = new Audio(snd.dataUrl);
    item.querySelector('.sound-play-btn').addEventListener('click', () => {
      audio.currentTime = 0;
      audio.play();
    });
    item.querySelector('button:last-child').addEventListener('click', () => {
      window.luantiSounds.splice(idx, 1);
      renderSoundList();
      updateCodePreview();
    });
    list.appendChild(item);
  });
}

function addSoundFiles(files) {
  Array.from(files).forEach(file => {
    if (!/\.ogg$/i.test(file.name)) return; // Minetest ondersteunt alleen OGG Vorbis
    const fileName = file.name.toLowerCase().replace(/\s+/g, '_');
    const baseName = fileName.replace(/\.ogg$/i, '');
    if (window.luantiSounds.find(s => s.name === baseName)) return;

    const reader = new FileReader();
    reader.onload = e => {
      window.luantiSounds.push({ name: baseName, fileName, dataUrl: e.target.result, file });
      renderSoundList();
      workspace.getAllBlocks(false).forEach(b => {
        if (b.type === 'luanti_action_play_sound') {
          b.getField('SOUND').getOptions(false); // force re-read
        }
      });
      updateCodePreview();
    };
    reader.readAsDataURL(file);
  });
}

document.getElementById('sound-input').addEventListener('change', e => {
  addSoundFiles(e.target.files);
  e.target.value = '';
});
document.getElementById('btn-choose-sounds').addEventListener('click', () => {
  document.getElementById('sound-input').click();
});

const soundDropZone = document.getElementById('sound-drop-zone');
['dragenter','dragover'].forEach(ev => {
  soundDropZone.addEventListener(ev, e => { e.preventDefault(); soundDropZone.classList.add('dragover'); });
});
['dragleave','drop'].forEach(ev => {
  soundDropZone.addEventListener(ev, e => { e.preventDefault(); soundDropZone.classList.remove('dragover'); });
});
soundDropZone.addEventListener('drop', e => {
  addSoundFiles(e.dataTransfer.files);
});
soundDropZone.addEventListener('click', () => document.getElementById('sound-input').click());

// ── Voorbeelden dropdown ──────────────────────
const btnEx   = document.getElementById('btn-examples');
const menuEx  = document.getElementById('examples-menu');

btnEx.addEventListener('click', e => {
  e.stopPropagation();
  menuEx.classList.toggle('open');
});
document.addEventListener('click', () => menuEx.classList.remove('open'));

menuEx.addEventListener('click', async e => {
  const li = e.target.closest('li[data-example]');
  if (!li) return;
  menuEx.classList.remove('open');
  const loaded = await laadVoorbeeld(li.dataset.example, workspace);
  if (loaded) updateCodePreview();
});

// ── Projectmenu: opslaan/openen op naam ───────
const btnProject  = document.getElementById('btn-project');
const menuProject = document.getElementById('project-menu');

btnProject.addEventListener('click', e => {
  e.stopPropagation();
  menuProject.classList.toggle('open');
});
document.addEventListener('click', () => menuProject.classList.remove('open'));

menuProject.addEventListener('click', async e => {
  const li = e.target.closest('li[data-action]');
  if (!li) return;
  menuProject.classList.remove('open');
  if (li.dataset.action === 'save') await doSaveProject();
  else if (li.dataset.action === 'open') await openProjectPicker();
});

async function doSaveProject() {
  const defaultName = document.getElementById('mod-name').value.trim() || 'mymod';
  const name = await showPromptModal(t('project.savePromptTitle'), defaultName);
  if (name === null) return;
  const trimmed = name.trim();
  if (!trimmed) { showToast(t('project.nameRequired')); return; }

  const data = {
    modName: document.getElementById('mod-name').value,
    modDesc: document.getElementById('mod-desc').value,
    modAuthor: document.getElementById('mod-author').value,
    workspaceState: Blockly.serialization.workspaces.save(workspace),
    textures: window.luantiTextures.map(tex => ({ name: tex.name, dataUrl: tex.dataUrl })),
    sounds: window.luantiSounds.map(snd => ({ name: snd.name, fileName: snd.fileName, dataUrl: snd.dataUrl })),
  };
  await saveProject(trimmed, data);
  showToast(t('project.savedToast', { name: trimmed }));
}

async function openProjectPicker() {
  const projects = await listProjects();
  showProjectListModal(projects);
}

function showProjectListModal(projects) {
  const overlay = document.createElement('div');
  overlay.style.cssText =
    'position:fixed;inset:0;background:rgba(0,0,0,.75);' +
    'display:flex;align-items:center;justify-content:center;z-index:9999;';

  const box = document.createElement('div');
  box.style.cssText =
    'background:#1e1e2e;border:1px solid #3a3a54;border-radius:12px;' +
    'padding:20px;width:420px;max-width:92vw;max-height:80vh;' +
    'display:flex;flex-direction:column;gap:14px;';

  const title = document.createElement('div');
  title.textContent = t('project.openTitle');
  title.style.cssText = 'color:#cdd6f4;font-weight:600;font-size:.95rem;flex-shrink:0;';

  const list = document.createElement('div');
  list.style.cssText = 'overflow-y:auto;display:flex;flex-direction:column;gap:6px;flex:1;min-height:0;';

  if (projects.length === 0) {
    const empty = document.createElement('div');
    empty.textContent = t('project.noProjects');
    empty.style.cssText = 'color:#7f849c;font-size:.85rem;';
    list.appendChild(empty);
  }

  const close = () => { if (overlay.parentNode) document.body.removeChild(overlay); };

  projects.forEach(p => {
    const row = document.createElement('div');
    row.style.cssText =
      'display:flex;align-items:center;gap:8px;background:#2a2a3e;' +
      'border-radius:8px;padding:8px 10px;';

    const info = document.createElement('div');
    info.style.cssText = 'flex:1;min-width:0;';
    const nameEl = document.createElement('div');
    nameEl.textContent = p.name;
    nameEl.style.cssText =
      'color:#cdd6f4;font-size:.88rem;font-weight:600;overflow:hidden;' +
      'text-overflow:ellipsis;white-space:nowrap;';
    const dateEl = document.createElement('div');
    const locale = getLanguage() === 'nl' ? 'nl-NL' : 'en-GB';
    dateEl.textContent = t('project.savedAt', { date: new Date(p.savedAt).toLocaleString(locale) });
    dateEl.style.cssText = 'color:#7f849c;font-size:.72rem;';
    info.append(nameEl, dateEl);

    const btnLoad = document.createElement('button');
    btnLoad.textContent = t('common.load');
    btnLoad.style.cssText =
      'background:#7c6af0;color:#fff;border:none;border-radius:6px;' +
      'padding:5px 10px;cursor:pointer;font-size:.8rem;font-weight:600;flex-shrink:0;';

    const btnDel = document.createElement('button');
    btnDel.textContent = '✕';
    btnDel.title = t('common.delete');
    btnDel.style.cssText =
      'background:transparent;border:1px solid #3a3a54;color:#f38ba8;' +
      'border-radius:6px;padding:5px 9px;cursor:pointer;font-size:.8rem;flex-shrink:0;';

    btnLoad.addEventListener('click', async () => {
      const ok = await showConfirmModal(t('project.confirmOverwrite', { name: p.name }));
      if (!ok) return;
      close();
      await applyProjectData(p);
    });

    btnDel.addEventListener('click', async () => {
      const ok = await showConfirmModal(t('project.confirmDelete', { name: p.name }));
      if (!ok) return;
      await deleteProject(p.name);
      close();
      openProjectPicker();
    });

    row.append(info, btnLoad, btnDel);
    list.appendChild(row);
  });

  const btnClose = document.createElement('button');
  btnClose.textContent = t('common.close');
  btnClose.style.cssText =
    'align-self:flex-end;background:transparent;border:1px solid #3a3a54;' +
    'color:#7f849c;border-radius:6px;padding:6px 14px;cursor:pointer;font-size:.85rem;flex-shrink:0;';
  btnClose.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  box.append(title, list, btnClose);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

async function applyProjectData(p) {
  document.getElementById('mod-name').value = p.modName || 'mymod';
  document.getElementById('mod-desc').value = p.modDesc || '';
  document.getElementById('mod-author').value = p.modAuthor || '';
  prevModName = (p.modName || 'mymod').trim() || 'mymod';

  window.luantiTextures = (p.textures || []).map(tex => ({ name: tex.name, dataUrl: tex.dataUrl }));
  renderTextureList();

  window.luantiSounds = (p.sounds || []).map(snd => ({ name: snd.name, fileName: snd.fileName, dataUrl: snd.dataUrl }));
  renderSoundList();

  workspace.clear();
  if (p.workspaceState) {
    Blockly.serialization.workspaces.load(p.workspaceState, workspace);
  }
  updateCodePreview();
}

// ── Mod-bestanden opbouwen (gedeeld door zip-download en "Test in Luanti") ──
// Geeft { modName, files } terug, met files als platte map van
// pad -> inhoud (string voor tekstbestanden, Blob voor textures/sounds).
async function buildModFiles() {
  const modName  = (document.getElementById('mod-name').value.trim() || 'mymod')
                    .replace(/[^a-z0-9_]/gi, '_').toLowerCase();
  const modDesc  = document.getElementById('mod-desc').value.trim()   || 'My mod';
  const modAuthor = document.getElementById('mod-author').value.trim() || '';

  const luaCode = generateLuaCode(workspace);

  let conf = `name = ${modName}\ndescription = ${modDesc}\n`;
  if (modAuthor) conf += `author = ${modAuthor}\n`;
  conf += `release = 1\n`;

  const header = `-- ${modName} — generated by LuantiStudio\n-- ${modDesc}\n\n`;

  // Companion bestand met de volledige Blockly-workspace: Luanti negeert
  // dit gewoon (het scant alleen mod.conf/init.lua/textures/sounds/...),
  // maar bij opnieuw importeren in LuantiStudio kunnen we hiermee de
  // ECHTE blokken terugzetten i.p.v. terug te vallen op één ruwe
  // Lua-blok (zie importModFromFolder).
  const projectFile = {
    format: 'luantistudio-project',
    version: 1,
    modName: document.getElementById('mod-name').value,
    modDesc: document.getElementById('mod-desc').value,
    modAuthor: document.getElementById('mod-author').value,
    workspaceState: Blockly.serialization.workspaces.save(workspace),
  };

  const files = {
    'mod.conf': conf,
    'init.lua': header + (luaCode || t('lua.empty')),
    'luantistudio.json': JSON.stringify(projectFile, null, 2),
  };

  for (const tex of window.luantiTextures) {
    const resp = await fetch(tex.dataUrl);
    files[`textures/${tex.name}`] = await resp.blob();
  }
  for (const snd of window.luantiSounds) {
    const resp = await fetch(snd.dataUrl);
    files[`sounds/${snd.fileName}`] = await resp.blob();
  }

  return { modName, files };
}

// ── Download mod zip ─────────────────────────
document.getElementById('btn-download').addEventListener('click', async () => {
  const { modName, files } = await buildModFiles();

  const zip = new JSZip();
  const folder = zip.folder(modName);
  for (const [path, content] of Object.entries(files)) {
    folder.file(path, content);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = `${modName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// ── Test in Luanti: direct naar een lokale mods-map schrijven ──
// Gebruikt de File System Access API (Chrome/Edge) om één keer om
// toestemming voor een map te vragen en die daarna te onthouden, zodat
// elke volgende klik de mod direct bijwerkt — geen download/uitpakken
// meer nodig. Niet ondersteund in Firefox/Safari; de knop blijft dan
// verborgen en "Download mod (.zip)" is het alternatief.
const testDropdownEl = document.getElementById('test-dropdown');
const fsAccessSupported = 'showDirectoryPicker' in window;
if (fsAccessSupported) testDropdownEl.hidden = false;

async function getModsFolderHandle() {
  const handle = await loadSetting('modsFolderHandle');
  if (!handle) return null;
  try {
    let perm = await handle.queryPermission({ mode: 'readwrite' });
    if (perm !== 'granted') perm = await handle.requestPermission({ mode: 'readwrite' });
    return perm === 'granted' ? handle : null;
  } catch (e) {
    return null; // handle niet meer geldig (bv. map verwijderd)
  }
}

async function pickModsFolder() {
  const handle = await window.showDirectoryPicker({ id: 'luanti-mods-folder', mode: 'readwrite' });
  await saveSetting('modsFolderHandle', handle);
  return handle;
}

async function writeModToFolder(modsHandle, modName, files) {
  // Eerst de bestaande mod-map wissen zodat verwijderde bestanden (bv.
  // een oude texture) niet blijven hangen — daarna alles vers opbouwen.
  try {
    await modsHandle.removeEntry(modName, { recursive: true });
  } catch (e) { /* bestond nog niet — prima */ }
  const modDir = await modsHandle.getDirectoryHandle(modName, { create: true });

  for (const [path, content] of Object.entries(files)) {
    const parts = path.split('/');
    const fileName = parts.pop();
    let dir = modDir;
    for (const part of parts) {
      dir = await dir.getDirectoryHandle(part, { create: true });
    }
    const fileHandle = await dir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }
}

async function testInLuanti(forcePickFolder) {
  try {
    let handle = forcePickFolder ? null : await getModsFolderHandle();
    if (!handle) handle = await pickModsFolder();

    const { modName, files } = await buildModFiles();
    await writeModToFolder(handle, modName, files);
    showToast(t('test.done', { name: modName }));
  } catch (e) {
    if (e.name === 'AbortError') return; // gebruiker annuleerde de mappenkiezer
    console.error(e);
    showToast(t('test.error'));
  }
}

// ── Mod importeren uit een map ────────────────
// LuantiStudio genereert Lua vanuit blokken, maar heeft geen Lua-parser
// om willekeurige bestaande code terug om te zetten in losse blokken —
// dat is voor handgeschreven Lua niet betrouwbaar te doen. In plaats
// daarvan wordt de volledige init.lua als één "Eigen code"-blok
// geïmporteerd (meteen bewerkbaar met de CodeMirror-editor), en worden
// mod.conf-velden, textures/ en sounds/ wél gewoon overgenomen.
function parseModConf(text) {
  const result = {};
  text.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    result[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  });
  return result;
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function listModsInFolder(modsHandle) {
  const mods = [];
  for await (const [name, handle] of modsHandle.entries()) {
    if (handle.kind === 'directory') mods.push(name);
  }
  return mods.sort((a, b) => a.localeCompare(b));
}

async function readFilesInDir(dirHandle) {
  const files = [];
  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === 'file') files.push({ name, file: await handle.getFile() });
  }
  return files;
}

function pickModFromList(mods) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,.75);' +
      'display:flex;align-items:center;justify-content:center;z-index:9999;';

    const box = document.createElement('div');
    box.style.cssText =
      'background:#1e1e2e;border:1px solid #3a3a54;border-radius:12px;' +
      'padding:20px;width:360px;max-width:92vw;max-height:80vh;' +
      'display:flex;flex-direction:column;gap:14px;';

    const title = document.createElement('div');
    title.textContent = t('import.pickTitle');
    title.style.cssText = 'color:#cdd6f4;font-weight:600;font-size:.95rem;flex-shrink:0;';

    const list = document.createElement('div');
    list.style.cssText = 'overflow-y:auto;display:flex;flex-direction:column;gap:6px;flex:1;min-height:0;';

    const close = result => { if (overlay.parentNode) document.body.removeChild(overlay); resolve(result); };

    if (mods.length === 0) {
      const empty = document.createElement('div');
      empty.textContent = t('import.noMods');
      empty.style.cssText = 'color:#7f849c;font-size:.85rem;';
      list.appendChild(empty);
    }

    mods.forEach(name => {
      const row = document.createElement('button');
      row.textContent = name;
      row.style.cssText =
        'text-align:left;background:#2a2a3e;border:1px solid #3a3a54;border-radius:8px;' +
        'padding:9px 12px;color:#cdd6f4;font-size:.85rem;cursor:pointer;';
      row.addEventListener('mouseenter', () => row.style.borderColor = 'var(--accent)');
      row.addEventListener('mouseleave', () => row.style.borderColor = '#3a3a54');
      row.addEventListener('click', () => close(name));
      list.appendChild(row);
    });

    const btnCancel = document.createElement('button');
    btnCancel.textContent = t('common.cancel');
    btnCancel.style.cssText =
      'align-self:flex-end;background:transparent;border:1px solid #3a3a54;' +
      'color:#7f849c;border-radius:6px;padding:6px 14px;cursor:pointer;font-size:.85rem;flex-shrink:0;';
    btnCancel.addEventListener('click', () => close(null));
    overlay.addEventListener('click', e => { if (e.target === overlay) close(null); });

    box.append(title, list, btnCancel);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  });
}

async function importModFromFolder() {
  try {
    let modsHandle = await getModsFolderHandle();
    if (!modsHandle) modsHandle = await pickModsFolder();

    const modNames = await listModsInFolder(modsHandle);
    const chosen = await pickModFromList(modNames);
    if (!chosen) return;

    const modDir = await modsHandle.getDirectoryHandle(chosen);

    let confText = '';
    try {
      const confFile = await (await modDir.getFileHandle('mod.conf')).getFile();
      confText = await confFile.text();
    } catch (e) { /* geen mod.conf — val terug op mapnaam */ }
    const conf = parseModConf(confText);

    let luaCode;
    try {
      const initFile = await (await modDir.getFileHandle('init.lua')).getFile();
      luaCode = await initFile.text();
    } catch (e) {
      showToast(t('import.error'));
      return;
    }

    // Companion-bestand van een eerdere LuantiStudio-export: bevat de
    // volledige Blockly-workspace, waarmee we de ECHTE blokken kunnen
    // terugzetten i.p.v. terug te vallen op één ruw Lua-blok.
    let workspaceState = null;
    try {
      const projFile = await (await modDir.getFileHandle('luantistudio.json')).getFile();
      const parsed = JSON.parse(await projFile.text());
      if (parsed && parsed.format === 'luantistudio-project' && parsed.workspaceState) {
        workspaceState = parsed.workspaceState;
      }
    } catch (e) { /* geen (geldig) luantistudio.json — val terug op ruwe Lua-import */ }

    const displayName = conf.name || chosen;
    const confirmKey = workspaceState ? 'import.confirmOverwriteBlocks' : 'import.confirmOverwrite';
    const ok = await showConfirmModal(t(confirmKey, { name: displayName }));
    if (!ok) return;

    // textures/ en sounds/ overnemen (indien aanwezig)
    let textures = [];
    try {
      const texDir = await modDir.getDirectoryHandle('textures');
      const texFiles = await readFilesInDir(texDir);
      textures = await Promise.all(texFiles.map(async ({ name, file }) => ({
        name, dataUrl: await fileToDataURL(file),
      })));
    } catch (e) { /* geen textures-map */ }

    let sounds = [];
    try {
      const soundDir = await modDir.getDirectoryHandle('sounds');
      const soundFiles = await readFilesInDir(soundDir);
      sounds = await Promise.all(soundFiles
        .filter(({ name }) => /\.ogg$/i.test(name))
        .map(async ({ name, file }) => ({
          name: name.replace(/\.ogg$/i, ''), fileName: name, dataUrl: await fileToDataURL(file),
        })));
    } catch (e) { /* geen sounds-map */ }

    // Alles toepassen
    document.getElementById('mod-name').value = displayName;
    document.getElementById('mod-desc').value = conf.description || '';
    document.getElementById('mod-author').value = conf.author || '';
    prevModName = displayName;

    window.luantiTextures = textures;
    renderTextureList();
    window.luantiSounds = sounds;
    renderSoundList();

    workspace.clear();
    let blocksRestored = false;
    if (workspaceState) {
      try {
        Blockly.serialization.workspaces.load(workspaceState, workspace);
        blocksRestored = true;
      } catch (e) {
        // luantistudio.json hoort bij een incompatibele/oudere versie
        // (onbekend bloktype e.d.) — val netjes terug op ruwe Lua-import.
        console.error('Kon luantistudio.json niet laden, val terug op ruwe Lua-import:', e);
        workspace.clear();
      }
    }
    if (!blocksRestored) {
      const rawBlock = workspace.newBlock('luanti_raw_lua');
      rawBlock.setFieldValue(t('import.comment', { name: displayName }) + luaCode, 'CODE');
      rawBlock.initSvg();
      rawBlock.render();
      rawBlock.moveBy(40, 40);
    }
    updateCodePreview();

    showToast(t(blocksRestored ? 'import.doneBlocks' : 'import.done', { name: displayName }));
  } catch (e) {
    if (e.name === 'AbortError') return; // gebruiker annuleerde de mappenkiezer
    console.error(e);
    showToast(t('import.error'));
  }
}

if (fsAccessSupported) {
  const btnTest  = document.getElementById('btn-test');
  const menuTest = document.getElementById('test-menu');

  btnTest.addEventListener('click', e => {
    e.stopPropagation();
    menuTest.classList.toggle('open');
  });
  document.addEventListener('click', () => menuTest.classList.remove('open'));

  menuTest.addEventListener('click', async e => {
    const li = e.target.closest('li[data-action]');
    if (!li) return;
    menuTest.classList.remove('open');
    if (li.dataset.action === 'run') await testInLuanti(false);
    else if (li.dataset.action === 'import') await importModFromFolder();
    else if (li.dataset.action === 'choose-folder') await testInLuanti(true);
  });
}

// ── PWA: service worker registreren (offline + installeerbaar) ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // Offline-ondersteuning is optioneel; de app werkt ook zonder.
    });
  });
}
