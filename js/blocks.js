// ─────────────────────────────────────────────
// Custom Blockly block definitions for Luanti
// ─────────────────────────────────────────────
// Vertaalbare labels/tooltips gaan via t('key') (js/i18n.js). Technische
// Minetest/Luanti-termen (drawtype-waarden, cracky/crumbly/choppy,
// full_punch_interval, groupcaps, ...) blijven bewust onvertaald — dat
// zijn letterlijke Lua-API-namen die in de gegenereerde code terugkomen.

// Returns the current mod name from the header input
function getModName() {
  const input = document.getElementById('mod-name');
  return (input ? input.value.trim() : '') || 'mymod';
}

// Shared sound name dropdown helper
// Dynamically populated from uploaded .ogg sounds
function getSoundOptions() {
  const sounds = window.luantiSounds || [];
  if (sounds.length === 0) return [[t('sounds.none'), '__NONE__']];
  return sounds.map(snd => [snd.name, snd.name]);
}

// Shared texture name dropdown helper
// Dynamically populated from uploaded textures
function getTextureOptions() {
  const textures = window.luantiTextures || [];
  if (textures.length === 0) return [[t('textures.none'), '__NONE__']];
  return textures.map(tex => [tex.name, tex.name]);
}

// ── luanti_texture_picker ─────────────────────
Blockly.Blocks['luanti_texture_picker'] = {
  init() {
    this.appendDummyInput()
      .appendField(t('blocks.texturePicker.label'))
      .appendField(new Blockly.FieldDropdown(() => getTextureOptions()), 'TEX');
    this.setOutput(true, 'String');
    this.setColour('#a57c00');
    this.setTooltip(() => t('blocks.texturePicker.tooltip'));
  }
};

// ── FieldColorSwatch — kleine kleurvlak-field ─────────────────
// Blockly's ingebouwde colour-field zit niet in deze build (unpkg
// levert alleen de kernblokken), dus een simpel eigen fieldje dat de
// native browser-kleurenkiezer opent — zelfde patroon als FieldCode.
class FieldColorSwatch extends Blockly.Field {
  constructor(value) {
    super(value || '#a05a2c');
    this.SERIALIZABLE = true;
    this.size_ = new Blockly.utils.Size(28, 16);
  }

  static fromJson(options) {
    return new FieldColorSwatch(options['color'] || '#a05a2c');
  }

  initView() {
    this.swatch_ = Blockly.utils.dom.createSvgElement(
      'rect',
      { x: 1, y: 1, width: 26, height: 14, rx: 3, stroke: 'rgba(0,0,0,.4)' },
      this.fieldGroup_
    );
    this.render_();
  }

  render_() {
    // Blockly's eigen thema-CSS stylet elke <rect> die direct kind is
    // van een field-group (".blocklyEditableField > rect") altijd wit
    // met fill-opacity 0.6 — dat wint van een fill-ATTRIBUUT (CSS gaat
    // voor presentatie-attributen). Daarom hier de fill/fill-opacity
    // als inline style zetten, dat wint wél van Blockly's stylesheet.
    if (this.swatch_) {
      this.swatch_.style.fill = this.getValue();
      this.swatch_.style.fillOpacity = '1';
    }
  }

  doValueUpdate_(newValue) {
    super.doValueUpdate_(newValue);
    if (this.swatch_) this.render_();
  }

  // Eigen kleurenkiezer-popover i.p.v. een verborgen native
  // <input type="color">. De native picker bleek onbetrouwbaar: de
  // browser/OS bepaalt zelf waar en hoe die opent (niet altijd naast
  // het blok) en het is niet uit te sluiten dat de popup de pagina op
  // een manier verlaat die input/change-events mist. Dit fieldje is nu
  // volledig eigen UI — zelfde patroon als de andere popovers/modals
  // in deze app — dus we hebben volledige controle over positie én
  // updates.
  showEditor_() {
    const PALETTE = [
      '#ffffff', '#c7c7c7', '#7f849c', '#1e1e2e', '#000000',
      '#f38ba8', '#fab387', '#f9e2af', '#a6e3a1', '#94e2d5',
      '#89dceb', '#89b4fa', '#cba6f7', '#a05a2c', '#5b3a1e',
    ];

    const rect = this.fieldGroup_.getBoundingClientRect();

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;';

    const panel = document.createElement('div');
    panel.style.cssText =
      'position:fixed;background:#1e1e2e;border:1px solid #3a3a54;border-radius:10px;' +
      'padding:12px;width:216px;box-shadow:0 10px 28px rgba(0,0,0,.5);' +
      'display:flex;flex-direction:column;gap:10px;';

    // Positioneer in het verlengde van het blok (net onder het
    // kleurvlakje), geklemd binnen het scherm.
    const panelWidth = 216, panelHeight = 128;
    let left = rect.left;
    let top = rect.bottom + 6;
    if (left + panelWidth > window.innerWidth - 8) left = window.innerWidth - panelWidth - 8;
    if (left < 8) left = 8;
    if (top + panelHeight > window.innerHeight - 8) top = rect.top - panelHeight - 6;
    if (top < 8) top = 8;
    panel.style.left = left + 'px';
    panel.style.top = top + 'px';

    const swatchGrid = document.createElement('div');
    swatchGrid.style.cssText = 'display:grid;grid-template-columns:repeat(5,1fr);gap:6px;';
    PALETTE.forEach(hex => {
      const sw = document.createElement('button');
      sw.type = 'button';
      sw.style.cssText =
        `width:100%;aspect-ratio:1;border-radius:5px;cursor:pointer;padding:0;` +
        `background:${hex};border:1px solid rgba(0,0,0,.35);`;
      sw.addEventListener('click', () => {
        this.setValue(hex);
        hexInput.value = hex;
        preview.style.background = hex;
      });
      swatchGrid.appendChild(sw);
    });

    const customRow = document.createElement('div');
    customRow.style.cssText = 'display:flex;gap:6px;align-items:center;';

    const preview = document.createElement('div');
    preview.style.cssText =
      `width:26px;height:26px;border-radius:6px;border:1px solid rgba(0,0,0,.35);` +
      `background:${this.getValue()};flex-shrink:0;`;

    const hexInput = document.createElement('input');
    hexInput.type = 'text';
    hexInput.value = this.getValue();
    hexInput.spellcheck = false;
    hexInput.style.cssText =
      'flex:1;min-width:0;background:#2a2a3e;border:1px solid #3a3a54;border-radius:6px;' +
      'color:#cdd6f4;padding:6px 8px;font-size:.8rem;font-family:"Cascadia Code","Fira Code",monospace;outline:none;';

    const applyHex = () => {
      const v = hexInput.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(v)) {
        preview.style.background = v;
        this.setValue(v);
      }
    };
    hexInput.addEventListener('input', applyHex);
    hexInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') close();
      if (e.key === 'Escape') close();
    });

    customRow.append(preview, hexInput);
    panel.append(swatchGrid, customRow);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    const close = () => { if (overlay.parentNode) document.body.removeChild(overlay); };
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    hexInput.focus();
    hexInput.select();
  }
}

Blockly.fieldRegistry.register('field_colorswatch', FieldColorSwatch);

// ── luanti_texture_color ──────────────────────
// Alternatief voor luanti_texture_picker: geen plaatje uploaden,
// gewoon een effen kleur kiezen. Genereert een Luanti "[fill" texture.
Blockly.Blocks['luanti_texture_color'] = {
  init() {
    this.appendDummyInput()
      .appendField(t('blocks.textureColor.label'))
      .appendField(new FieldColorSwatch('#a05a2c'), 'COLOR');
    this.setOutput(true, 'String');
    this.setColour('#a57c00');
    this.setTooltip(() => t('blocks.textureColor.tooltip'));
  }
};

// ── luanti_side_texture ───────────────────────
// Uitzondering op de standaard-texture van een node: koppel dit blok
// aan "Andere zijden" op Registreer node om één specifieke kant een
// eigen texture te geven.
Blockly.Blocks['luanti_side_texture'] = {
  init() {
    this.appendValueInput('TEX')
      .setCheck('String')
      .appendField(t('blocks.sideTexture.label'))
      .appendField(new Blockly.FieldDropdown([
        [t('blocks.sideTexture.top'),    'TOP'],
        [t('blocks.sideTexture.bottom'), 'BOTTOM'],
        [t('blocks.sideTexture.right'),  'RIGHT'],
        [t('blocks.sideTexture.left'),   'LEFT'],
        [t('blocks.sideTexture.back'),   'BACK'],
        [t('blocks.sideTexture.front'),  'FRONT'],
      ]), 'SIDE')
      .appendField('→');
    this.setPreviousStatement(true, 'SideTexture');
    this.setNextStatement(true, 'SideTexture');
    this.setColour('#5b80a5');
    this.setTooltip(() => t('blocks.sideTexture.tooltip'));
  }
};

// ── luanti_node_groups ────────────────────────
Blockly.Blocks['luanti_node_groups'] = {
  init() {
    this.appendDummyInput('TITLE').appendField(t('blocks.nodeGroups.title'));
    this.appendDummyInput()
      .appendField('cracky').appendField(new Blockly.FieldNumber(3, 0, 3, 1), 'CRACKY')
      .appendField('crumbly').appendField(new Blockly.FieldNumber(0, 0, 3, 1), 'CRUMBLY')
      .appendField('choppy').appendField(new Blockly.FieldNumber(0, 0, 3, 1), 'CHOPPY');
    this.appendDummyInput()
      .appendField('oddly_breakable_by_hand').appendField(new Blockly.FieldNumber(0, 0, 3, 1), 'OBH');
    this.setOutput(true, 'NodeGroups');
    this.setColour('#5b80a5');
    this.setTooltip(() => t('blocks.nodeGroups.tooltip'));
  }
};

// ── luanti_node_drop ──────────────────────────
Blockly.Blocks['luanti_node_drop'] = {
  init() {
    this.appendValueInput('ITEM')
      .setCheck('String')
      .appendField(t('blocks.nodeDrop.label'));
    this.appendDummyInput()
      .appendField(t('blocks.nodeDrop.count')).appendField(new Blockly.FieldNumber(1, 1, 99, 1), 'COUNT');
    this.setOutput(true, 'NodeDrop');
    this.setColour('#5b80a5');
    this.setTooltip(() => t('blocks.nodeDrop.tooltip'));
  }
};

// ── luanti_register_node ─────────────────────
Blockly.Blocks['luanti_register_node'] = {
  init() {
    this.appendDummyInput()
      .appendField(t('blocks.registerNode.title'))
      .appendField(new Blockly.FieldTextInput(getModName() + ':mynode'), 'NAME');
    this.appendDummyInput()
      .appendField(t('blocks.registerNode.desc')).appendField(new Blockly.FieldTextInput('My Node'), 'DESC');

    // Texture: één standaard-texture rondom, met optioneel per-zijde
    // uitzonderingen via aangekoppelde luanti_side_texture-blokjes.
    this.appendDummyInput().appendField(t('blocks.registerNode.texturesHeader'));
    this.appendValueInput('TEXTURE')
      .setCheck('String')
      .appendField(t('blocks.registerNode.textureDefault'));
    this.appendStatementInput('SIDE_OVERRIDES')
      .setCheck('SideTexture')
      .appendField(t('blocks.registerNode.sideOverrides'));

    this.appendDummyInput()
      .appendField(t('blocks.registerNode.light')).appendField(new Blockly.FieldNumber(0, 0, 14, 1), 'LIGHT');
    this.appendDummyInput()
      .appendField('Diggable').appendField(new Blockly.FieldCheckbox('TRUE'), 'DIGGABLE');
    this.appendDummyInput()
      .appendField('Climbable').appendField(new Blockly.FieldCheckbox('FALSE'), 'CLIMBABLE');
    this.appendDummyInput()
      .appendField('Sunlight propagates').appendField(new Blockly.FieldCheckbox('FALSE'), 'SUNLIGHT');
    this.appendDummyInput()
      .appendField('Drawtype').appendField(new Blockly.FieldDropdown([
        ['normal','normal'],['airlike','airlike'],['glasslike','glasslike'],
        ['allfaces','allfaces'],['plantlike','plantlike'],['torchlike','torchlike'],
        ['signlike','signlike'],['firelike','firelike'],['fencelike','fencelike'],
      ]), 'DRAWTYPE');
    this.appendValueInput('GROUPS')
      .setCheck('NodeGroups')
      .appendField(t('blocks.registerNode.groups'));
    this.appendValueInput('DROP')
      .setCheck('NodeDrop')
      .appendField('Drop');

    // Gebeurtenissen: optioneel één of meer "Wanneer ... " blokjes
    // (luanti_on_event) die acties uitvoeren zoals een geluid afspelen.
    this.appendStatementInput('EVENTS')
      .setCheck('NodeEvent')
      .appendField(t('blocks.registerNode.events'));

    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#5b80a5');
    this.setTooltip(() => t('blocks.registerNode.tooltip'));
  }
};

// ── luanti_on_event ────────────────────────────
// Koppel aan "Gebeurtenissen" op Registreer node. Bevat zelf een
// "doe:"-slot waar actie-blokjes (zoals luanti_action_play_sound) in
// passen — meerdere acties kunnen onder elkaar gestapeld worden.
Blockly.Blocks['luanti_on_event'] = {
  init() {
    this.appendDummyInput()
      .appendField(t('blocks.onEvent.label'))
      .appendField(new Blockly.FieldDropdown([
        [t('blocks.onEvent.hit'),        'HIT'],
        [t('blocks.onEvent.rightclick'), 'RIGHTCLICK'],
        [t('blocks.onEvent.dig'),        'DIG'],
      ]), 'EVENT');
    this.appendStatementInput('ACTIONS')
      .setCheck('NodeAction')
      .appendField(t('blocks.onEvent.doLabel'));
    this.setPreviousStatement(true, 'NodeEvent');
    this.setNextStatement(true, 'NodeEvent');
    this.setColour('#a55ba5');
    this.setTooltip(() => t('blocks.onEvent.tooltip'));
  }
};

// ── luanti_on_near ─────────────────────────────
// Koppel aan "Gebeurtenissen" op Registreer node, net als luanti_on_event.
// Minetest heeft geen directe "speler in de buurt"-callback op een node
// — dit genereert daarom een aparte minetest.register_abm() die elke
// seconde controleert of een speler binnen de opgegeven straal is.
Blockly.Blocks['luanti_on_near'] = {
  init() {
    this.appendDummyInput()
      .appendField(t('blocks.onNear.label'))
      .appendField(new Blockly.FieldNumber(3, 1, 100, 1), 'RADIUS')
      .appendField(t('blocks.onNear.radiusLabel'));
    this.appendStatementInput('ACTIONS')
      .setCheck('NodeAction')
      .appendField(t('blocks.onEvent.doLabel'));
    this.setPreviousStatement(true, 'NodeEvent');
    this.setNextStatement(true, 'NodeEvent');
    this.setColour('#a55ba5');
    this.setTooltip(() => t('blocks.onNear.tooltip'));
  }
};

// ── luanti_action_play_sound ──────────────────
// Actie-blokje voor in het "doe:"-slot van luanti_on_event.
Blockly.Blocks['luanti_action_play_sound'] = {
  init() {
    this.appendDummyInput()
      .appendField(t('blocks.playSound.label'))
      .appendField(new Blockly.FieldDropdown(() => getSoundOptions()), 'SOUND');
    this.appendDummyInput()
      .appendField(t('blocks.playSound.volume'))
      .appendField(new Blockly.FieldNumber(1, 0, 3, 0.1), 'GAIN');
    this.setPreviousStatement(true, 'NodeAction');
    this.setNextStatement(true, 'NodeAction');
    this.setColour('#8a4a8a');
    this.setTooltip(() => t('blocks.playSound.tooltip'));
  }
};

// ── luanti_action_set_node ────────────────────
// Actie-blokje voor in het "doe:"-slot van luanti_on_event.
Blockly.Blocks['luanti_action_set_node'] = {
  init() {
    this.appendDummyInput()
      .appendField(t('blocks.setNode.label'))
      .appendField(new Blockly.FieldTextInput('air'), 'NODENAME');
    this.setPreviousStatement(true, 'NodeAction');
    this.setNextStatement(true, 'NodeAction');
    this.setColour('#8a4a8a');
    this.setTooltip(() => t('blocks.setNode.tooltip'));
  }
};

// ── luanti_action_wait ────────────────────────
// Actie-blokje voor in het "doe:"-slot van luanti_on_event. Heeft zelf
// weer een "doe dan:"-slot met eigen actie-blokjes, dus acties kunnen
// vertraagd na elkaar uitgevoerd worden (bv. een knop die na 1 sec
// vanzelf terugklikt).
Blockly.Blocks['luanti_action_wait'] = {
  init() {
    this.appendDummyInput()
      .appendField(t('blocks.wait.label'))
      .appendField(new Blockly.FieldNumber(1, 0.1, 3600, 0.1), 'SECONDS')
      .appendField(t('blocks.wait.secondsLabel'));
    this.appendStatementInput('ACTIONS')
      .setCheck('NodeAction')
      .appendField(t('blocks.wait.doLabel'));
    this.setPreviousStatement(true, 'NodeAction');
    this.setNextStatement(true, 'NodeAction');
    this.setColour('#8a4a8a');
    this.setTooltip(() => t('blocks.wait.tooltip'));
  }
};

// ── luanti_register_craftitem ─────────────────
Blockly.Blocks['luanti_register_craftitem'] = {
  init() {
    this.appendDummyInput()
      .appendField(t('blocks.registerCraftitem.title'))
      .appendField(new Blockly.FieldTextInput(getModName() + ':myitem'), 'NAME');
    this.appendDummyInput()
      .appendField(t('blocks.registerCraftitem.desc')).appendField(new Blockly.FieldTextInput('My Item'), 'DESC');
    this.appendDummyInput()
      .appendField(t('blocks.registerCraftitem.maxStack')).appendField(new Blockly.FieldNumber(99, 1, 999, 1), 'STACK');
    this.appendValueInput('IMAGE')
      .setCheck('String')
      .appendField(t('blocks.registerCraftitem.invImage'));

    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#a55b5b');
    this.setTooltip(() => t('blocks.registerCraftitem.tooltip'));
  }
};

// ── luanti_tool_caps ──────────────────────────
Blockly.Blocks['luanti_tool_caps'] = {
  init() {
    this.appendDummyInput('TITLE').appendField('Tool capabilities');
    this.appendDummyInput()
      .appendField('full_punch_interval').appendField(new Blockly.FieldNumber(1.0, 0.1, 10, 0.1), 'FPI');
    this.appendDummyInput()
      .appendField('max_drop_level').appendField(new Blockly.FieldNumber(0, 0, 3, 1), 'DROP_LVL');
    this.appendDummyInput('CRACKY_HDR').appendField('--- cracky ---');
    this.appendDummyInput()
      .appendField('uses').appendField(new Blockly.FieldNumber(30, 1, 9999, 1), 'CR_USES')
      .appendField('maxlevel').appendField(new Blockly.FieldNumber(1, 0, 3, 1), 'CR_LVL');
    this.appendDummyInput()
      .appendField('time[1]').appendField(new Blockly.FieldNumber(3.0, 0.1, 20, 0.1), 'CR_T1')
      .appendField('time[2]').appendField(new Blockly.FieldNumber(1.5, 0.1, 20, 0.1), 'CR_T2')
      .appendField('time[3]').appendField(new Blockly.FieldNumber(0.5, 0.1, 20, 0.1), 'CR_T3');
    this.setOutput(true, 'ToolCaps');
    this.setColour('#a55b5b');
    this.setTooltip(() => t('blocks.toolCaps.tooltip'));
  }
};

// ── luanti_register_tool ─────────────────────
Blockly.Blocks['luanti_register_tool'] = {
  init() {
    this.appendDummyInput()
      .appendField(t('blocks.registerTool.title'))
      .appendField(new Blockly.FieldTextInput(getModName() + ':mytool'), 'NAME');
    this.appendDummyInput()
      .appendField(t('blocks.registerTool.desc')).appendField(new Blockly.FieldTextInput('My Tool'), 'DESC');
    this.appendValueInput('IMAGE')
      .setCheck('String')
      .appendField(t('blocks.registerTool.invImage'));
    this.appendValueInput('CAPS')
      .setCheck('ToolCaps')
      .appendField(t('blocks.registerTool.toolCaps'));

    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#a55b5b');
    this.setTooltip(() => t('blocks.registerTool.tooltip'));
  }
};

// ── luanti_craft_shaped ───────────────────────
// 3×3 grid of item-name text inputs
Blockly.Blocks['luanti_craft_shaped'] = {
  init() {
    this.appendDummyInput()
      .appendField(t('blocks.craftShaped.title'))
      .appendField(new Blockly.FieldTextInput(getModName() + ':item'), 'OUTPUT');
    this.appendDummyInput()
      .appendField(t('blocks.craftShaped.count')).appendField(new Blockly.FieldNumber(1, 1, 99, 1), 'COUNT');

    const grid = [
      ['R1C1','R1C2','R1C3'],
      ['R2C1','R2C2','R2C3'],
      ['R3C1','R3C2','R3C3'],
    ];
    grid.forEach(row => {
      const inp = this.appendDummyInput();
      row.forEach(cell => {
        inp.appendField(new Blockly.FieldTextInput(''), cell);
      });
    });

    this.appendDummyInput()
      .appendField(t('blocks.craftShaped.emptyHint'));

    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#5ba55b');
    this.setTooltip(() => t('blocks.craftShaped.tooltip'));
  }
};

// ── luanti_craft_shapeless ────────────────────
Blockly.Blocks['luanti_craft_shapeless'] = {
  init() {
    this.appendDummyInput()
      .appendField(t('blocks.craftShapeless.title'))
      .appendField(new Blockly.FieldTextInput(getModName() + ':item'), 'OUTPUT');
    this.appendDummyInput()
      .appendField(t('blocks.craftShapeless.count')).appendField(new Blockly.FieldNumber(1, 1, 99, 1), 'COUNT');

    // Up to 9 ingredient slots
    for (let i = 1; i <= 6; i++) {
      this.appendDummyInput()
        .appendField(`${t('blocks.craftShapeless.ingredient')} ${i}`)
        .appendField(new Blockly.FieldTextInput(''), `ING${i}`);
    }
    this.appendDummyInput().appendField(t('blocks.craftShapeless.emptyHint'));

    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#5ba55b');
    this.setTooltip(() => t('blocks.craftShapeless.tooltip'));
  }
};

// ── FieldCode — custom field with modal textarea editor ───────────────────────
class FieldCode extends Blockly.Field {
  constructor(value) {
    super(value || '-- schrijf hier Lua code\n');
    this.SERIALIZABLE = true;
  }

  static fromJson(options) {
    return new FieldCode(options['text'] || '');
  }

  initView() {
    this.createBorderRect_();
    this.borderRect_.setAttribute('rx', 4);
    this.textEl_ = Blockly.utils.dom.createSvgElement(
      'text',
      { class: 'blocklyText', x: 6, y: 14 },
      this.fieldGroup_
    );
    this.render_();
  }

  render_() {
    const lines = (this.getValue() || '').split('\n');
    const preview = (lines[0] || '').trim().substring(0, 28) || t('blocks.rawLua.previewEmpty');
    const extra   = lines.length > 1 ? t('blocks.rawLua.previewExtraLines', { n: lines.length - 1 }) : '';
    this.textEl_.textContent = preview + extra;
    const w = Math.max(180, (preview + extra).length * 7 + 16);
    this.size_ = new Blockly.utils.Size(w, 22);
    if (this.borderRect_) {
      this.borderRect_.setAttribute('width',  w);
      this.borderRect_.setAttribute('height', 22);
    }
  }

  doValueUpdate_(newValue) {
    super.doValueUpdate_(newValue);
    if (this.textEl_) this.render_();
  }

  showEditor_() {
    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,.75);' +
      'display:flex;align-items:center;justify-content:center;z-index:9999;';

    const box = document.createElement('div');
    box.style.cssText =
      'background:#1e1e2e;border:1px solid #3a3a54;border-radius:12px;' +
      'padding:16px;width:min(1040px, 94vw);height:min(720px, 90vh);' +
      'display:flex;flex-direction:column;gap:12px;';

    const title = document.createElement('div');
    title.textContent = t('fieldCode.title');
    title.style.cssText = 'color:#cdd6f4;font-weight:600;font-size:.95rem;flex-shrink:0;';

    const hint = document.createElement('div');
    hint.textContent = t('fieldCode.hint');
    hint.style.cssText = 'color:#585b70;font-size:.75rem;margin-top:-6px;flex-shrink:0;';

    const editorWrap = document.createElement('div');
    editorWrap.style.cssText =
      'flex:1;min-height:0;border:1px solid #3a3a54;border-radius:8px;overflow:hidden;';

    const ta = document.createElement('textarea');
    ta.value = this.getValue();
    editorWrap.appendChild(ta);

    const row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;flex-shrink:0;';

    const btnCancel = document.createElement('button');
    btnCancel.textContent = t('common.cancel');
    btnCancel.style.cssText =
      'background:transparent;border:1px solid #3a3a54;color:#7f849c;' +
      'border-radius:6px;padding:6px 14px;cursor:pointer;font-size:.85rem;';

    const btnSave = document.createElement('button');
    btnSave.textContent = t('fieldCode.save');
    btnSave.style.cssText =
      'background:#7c6af0;color:#fff;border:none;border-radius:6px;' +
      'padding:6px 16px;cursor:pointer;font-size:.85rem;font-weight:600;';

    const close = () => document.body.removeChild(overlay);
    const save  = () => { this.setValue(cm.getValue()); close(); };

    btnCancel.addEventListener('click', close);
    btnSave.addEventListener('click', save);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    row.append(btnCancel, btnSave);
    box.append(title, hint, editorWrap, row);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // CodeMirror moet in de DOM staan voordat hij zijn afmetingen kan meten
    const cm = CodeMirror.fromTextArea(ta, {
      mode: 'lua',
      theme: 'luanti',
      lineNumbers: true,
      tabSize: 2,
      indentUnit: 2,
      indentWithTabs: false,
      matchBrackets: true,
      styleActiveLine: true,
      viewportMargin: 10,
      extraKeys: {
        Tab: cm => cm.replaceSelection('  '),
        'Ctrl-Enter': () => save(),
        'Cmd-Enter': () => save(),
      },
    });
    cm.setSize('100%', '100%');
    setTimeout(() => {
      cm.refresh();
      cm.focus();
      const last = cm.lineCount() - 1;
      cm.setCursor(last, cm.getLine(last).length);
    }, 0);
  }
}

Blockly.fieldRegistry.register('field_code', FieldCode);

// ── luanti_raw_lua ────────────────────────────
Blockly.Blocks['luanti_raw_lua'] = {
  init() {
    this.appendDummyInput()
      .appendField(t('blocks.rawLua.label') + '  ');
    this.appendDummyInput()
      .appendField(new FieldCode('-- schrijf hier Lua code\n'), 'CODE');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#6a6a8a');
    this.setTooltip(() => t('blocks.rawLua.tooltip'));
  }
};

// ── luanti_craft_fuel ─────────────────────────
Blockly.Blocks['luanti_craft_fuel'] = {
  init() {
    this.appendDummyInput()
      .appendField(t('blocks.craftFuel.title'))
      .appendField(new Blockly.FieldTextInput(getModName() + ':myitem'), 'ITEM');
    this.appendDummyInput()
      .appendField(t('blocks.craftFuel.burntime')).appendField(new Blockly.FieldNumber(30, 1, 3600, 1), 'BURNTIME');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#5ba55b');
    this.setTooltip(() => t('blocks.craftFuel.tooltip'));
  }
};
