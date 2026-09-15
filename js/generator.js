// ─────────────────────────────────────────────
// Lua code generator for Luanti blocks
// ─────────────────────────────────────────────

const luaGenerator = new Blockly.Generator('Lua');

// Operator precedence (not really used here but required)
luaGenerator.ORDER_ATOMIC = 0;
luaGenerator.ORDER_NONE = 99;

// Escape a string for Lua
function luaStr(s) {
  return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

// ── texture_picker ────────────────────────────
luaGenerator.forBlock['luanti_texture_picker'] = function(block) {
  const tex = block.getFieldValue('TEX');
  return [luaStr(tex === '__NONE__' ? '' : tex), luaGenerator.ORDER_ATOMIC];
};

// ── texture_color ─────────────────────────────
// Effen kleur i.p.v. een geüpload plaatje: Luanti's "[fill" texture-modifier
// genereert de tegel direct vanuit de kleurcode, zonder bestand nodig te hebben.
luaGenerator.forBlock['luanti_texture_color'] = function(block) {
  const color = block.getFieldValue('COLOR') || '#ffffff';
  // Let op: Luanti's texture-modifiers gebruiken GEEN sluithaakje "]" —
  // "[fill:..." loopt door tot het einde van de string of een volgende
  // "^". Een "]" toevoegen maakt hem onderdeel van de kleurcode, en dan
  // faalt Luanti met "Invalid color" / "baseimg is NULL".
  return [luaStr(`[fill:16x16:${color}`), luaGenerator.ORDER_ATOMIC];
};

// ── side_texture ───────────────────────────────
// Wordt uitgelezen door register_node (via SIDE_OVERRIDES). Los op de
// workspace levert dit blokje zelf geen Lua-code op.
luaGenerator.forBlock['luanti_side_texture'] = function() {
  return '';
};

// ── on_event / acties ──────────────────────────
// Worden uitgelezen door register_node (via EVENTS/ACTIONS, zie
// genActionLines hieronder). Los op de workspace leveren ze zelf geen
// Lua-code op.
luaGenerator.forBlock['luanti_on_event'] = function() {
  return '';
};
luaGenerator.forBlock['luanti_on_near'] = function() {
  return '';
};
luaGenerator.forBlock['luanti_action_play_sound'] = function() {
  return '';
};
luaGenerator.forBlock['luanti_action_set_node'] = function() {
  return '';
};
luaGenerator.forBlock['luanti_action_wait'] = function() {
  return '';
};

// Zet een keten actie-blokjes (luanti_action_*) om in Lua-regels. Wordt
// gebruikt voor het "doe:"-slot van luanti_on_event én — recursief —
// voor het "doe dan:"-slot van luanti_action_wait. Regels van geneste
// acties (bv. binnen een wachtblok) komen al relatief ingesprongen
// terug; de aanroeper hoeft alleen zijn eigen basis-inspringing toe te
// voegen.
function genActionLines(startBlock) {
  const lines = [];
  let b = startBlock;
  while (b) {
    if (b.type === 'luanti_action_play_sound') {
      const sound = b.getFieldValue('SOUND');
      const gain  = b.getFieldValue('GAIN');
      if (sound && sound !== '__NONE__') {
        lines.push(`core.sound_play(${luaStr(sound)}, {pos = pos, gain = ${gain}, max_hear_distance = 16})`);
      }
    } else if (b.type === 'luanti_action_set_node') {
      const nodeName = b.getFieldValue('NODENAME');
      if (nodeName) {
        lines.push(`core.set_node(pos, {name = ${luaStr(nodeName)}})`);
      }
    } else if (b.type === 'luanti_action_wait') {
      const seconds = b.getFieldValue('SECONDS');
      const innerLines = genActionLines(b.getInputTargetBlock('ACTIONS'));
      // "pos" opnieuw als parameternaam gebruiken zodat geneste acties
      // (die allemaal naar "pos" verwijzen) ongewijzigd blijven werken —
      // core.after() geeft zelf geen pos door, dus die moet expliciet
      // als extra argument meegegeven worden.
      lines.push(`core.after(${seconds}, function(pos)`);
      innerLines.forEach(l => lines.push(`    ${l}`));
      lines.push(`end, pos)`);
    } else if (b.type === 'luanti_raw_lua') {
      // Eigen Lua-code mag ook als actie gebruikt worden — de code komt
      // regel voor regel in de callback terecht, "pos" is beschikbaar
      // net als bij de andere acties.
      const code = b.getFieldValue('CODE');
      if (code && code.trim()) {
        code.split('\n').forEach(l => lines.push(l));
      }
    }
    b = b.nextConnection && b.nextConnection.targetBlock();
  }
  return lines;
}

// Passthrough for plain text blocks
luaGenerator.forBlock['text'] = function(block) {
  const val = block.getFieldValue('TEXT') || '';
  return [luaStr(val), luaGenerator.ORDER_ATOMIC];
};

luaGenerator.forBlock['math_number'] = function(block) {
  const n = block.getFieldValue('NUM');
  return [String(n), luaGenerator.ORDER_ATOMIC];
};

// ── node_groups ───────────────────────────────
luaGenerator.forBlock['luanti_node_groups'] = function(block) {
  const cracky   = block.getFieldValue('CRACKY');
  const crumbly  = block.getFieldValue('CRUMBLY');
  const choppy   = block.getFieldValue('CHOPPY');
  const obh      = block.getFieldValue('OBH');

  const parts = [];
  if (+cracky  > 0) parts.push(`cracky = ${cracky}`);
  if (+crumbly > 0) parts.push(`crumbly = ${crumbly}`);
  if (+choppy  > 0) parts.push(`choppy = ${choppy}`);
  if (+obh     > 0) parts.push(`oddly_breakable_by_hand = ${obh}`);

  const code = parts.length ? `{${parts.join(', ')}}` : '{}';
  return [code, luaGenerator.ORDER_ATOMIC];
};

// ── node_drop ─────────────────────────────────
luaGenerator.forBlock['luanti_node_drop'] = function(block) {
  const item  = luaGenerator.valueToCode(block, 'ITEM',  luaGenerator.ORDER_NONE) || luaStr('');
  const count = block.getFieldValue('COUNT');
  const code  = `{items = {{items = {${item}}, rarity = 1, count = ${count}}}}`;
  return [code, luaGenerator.ORDER_ATOMIC];
};

// ── register_node ─────────────────────────────
luaGenerator.forBlock['luanti_register_node'] = function(block) {
  const name      = block.getFieldValue('NAME');
  const desc      = block.getFieldValue('DESC');
  const light     = block.getFieldValue('LIGHT');
  const diggable  = block.getFieldValue('DIGGABLE')  === 'TRUE';
  const climbable = block.getFieldValue('CLIMBABLE') === 'TRUE';
  const sunlight  = block.getFieldValue('SUNLIGHT')  === 'TRUE';
  const drawtype  = block.getFieldValue('DRAWTYPE');

  // Eén standaard-texture rondom (TEXTURE), met optioneel per-zijde
  // uitzonderingen via aangekoppelde luanti_side_texture-blokjes
  // (SIDE_OVERRIDES). Uitzonderingen overschrijven de standaard.
  const defaultTex = luaGenerator.valueToCode(block, 'TEXTURE', luaGenerator.ORDER_NONE) || '';

  const overrides = {};
  let sideBlock = block.getInputTargetBlock('SIDE_OVERRIDES');
  while (sideBlock) {
    const side = sideBlock.getFieldValue('SIDE');
    const tex  = luaGenerator.valueToCode(sideBlock, 'TEX', luaGenerator.ORDER_NONE);
    if (tex) overrides[side] = tex;
    sideBlock = sideBlock.nextConnection && sideBlock.nextConnection.targetBlock();
  }

  // Collect all 6 tile slots (top, bottom, right, left, back, front).
  // Lege plekken (geen override én geen standaard-texture) vallen terug
  // op eender welke texture die wél is ingesteld, zodat er nooit een
  // kale/lege tile in de array belandt.
  const tileKeys = ['TOP','BOTTOM','RIGHT','LEFT','BACK','FRONT'];
  const raw = tileKeys.map(k => overrides[k] || defaultTex || '');
  const fallback = raw.find(Boolean) || '';
  const [top, bottom, right, left, back, front] = raw.map(v => v || fallback);

  // Luanti's tiles-array betekent iets anders per lengte, dus alleen
  // inkorten als de waarden dat ook écht toestaan:
  //   1 entry   → alle 6 zijden identiek
  //   2 entries → [top+bottom, de 4 zijkanten]
  //   3 entries → [top, bottom, de 4 zijkanten]
  //   6 entries → elke zijde apart (altijd correct, ongeacht welke gelijk zijn)
  const sidesEqual = right === left && left === back && back === front;
  let tilesCode = '';
  if (!fallback) {
    // Geen enkele texture ingesteld — laat tiles helemaal weg
  } else if (top === bottom && sidesEqual && top === right) {
    tilesCode = top;
  } else if (top === bottom && sidesEqual) {
    tilesCode = [top, right].join(', ');
  } else if (sidesEqual) {
    tilesCode = [top, bottom, right].join(', ');
  } else {
    tilesCode = [top, bottom, right, left, back, front].join(', ');
  }

  const groupsV = luaGenerator.valueToCode(block, 'GROUPS', luaGenerator.ORDER_NONE);
  const dropV   = luaGenerator.valueToCode(block, 'DROP',   luaGenerator.ORDER_NONE);

  // Gebeurtenissen (EVENTS): elk "Wanneer ..." blokje levert acties
  // (zoals geluid afspelen) die we bundelen tot de bijpassende
  // Minetest-callback. "dug" gebruikt after_dig_node zodat we niet
  // zelf het verwijderen van de node hoeven te herimplementeren.
  const CALLBACKS = {
    HIT:        { name: 'on_punch',        params: 'pos, node, puncher, pointed_thing' },
    RIGHTCLICK: { name: 'on_rightclick',   params: 'pos, node, clicker, itemstack, pointed_thing' },
    DIG:        { name: 'after_dig_node',  params: 'pos, oldnode, oldmetadata, digger' },
  };
  const eventActionLines = { HIT: [], RIGHTCLICK: [], DIG: [] };
  // "Speler in de buurt"-triggers hebben geen node-definitie-callback in
  // Minetest — die worden apart als core.register_abm() gegenereerd,
  // ná de node-registratie (zie onderaan).
  const nearBlocks = [];
  const extraTopLevel = [];

  let eventBlock = block.getInputTargetBlock('EVENTS');
  while (eventBlock) {
    if (eventBlock.type === 'luanti_on_event') {
      const evt = eventBlock.getFieldValue('EVENT');
      if (CALLBACKS[evt]) {
        eventActionLines[evt] = eventActionLines[evt].concat(
          genActionLines(eventBlock.getInputTargetBlock('ACTIONS'))
        );
      }
    } else if (eventBlock.type === 'luanti_on_near') {
      nearBlocks.push(eventBlock);
    } else if (eventBlock.type === 'luanti_raw_lua') {
      // Een Eigen-code-blok direct in "Gebeurtenissen" (i.p.v. in een
      // "doe:"-slot) hoort niet bij een specifieke trigger — de code
      // komt gewoon los ná de node-registratie te staan.
      const code = eventBlock.getFieldValue('CODE');
      if (code && code.trim()) extraTopLevel.push(code.trim());
    }
    eventBlock = eventBlock.nextConnection && eventBlock.nextConnection.targetBlock();
  }

  const lines = [];
  lines.push(`core.register_node(${luaStr(name)}, {`);
  lines.push(`    description = ${luaStr(desc)},`);
  if (drawtype !== 'normal') lines.push(`    drawtype = ${luaStr(drawtype)},`);
  if (tilesCode)    lines.push(`    tiles = {${tilesCode}},`);
  if (+light > 0)   lines.push(`    light_source = ${light},`);
  if (!diggable)    lines.push(`    diggable = false,`);
  if (climbable)    lines.push(`    climbable = true,`);
  if (sunlight)     lines.push(`    sunlight_propagates = true,`);
  if (groupsV)      lines.push(`    groups = ${groupsV},`);
  if (dropV)        lines.push(`    drop = ${dropV},`);
  for (const key of ['HIT', 'RIGHTCLICK', 'DIG']) {
    const actionLines = eventActionLines[key];
    if (!actionLines.length) continue;
    const { name: cbName, params } = CALLBACKS[key];
    lines.push(`    ${cbName} = function(${params})`);
    actionLines.forEach(l => lines.push(`        ${l}`));
    lines.push(`    end,`);
  }
  lines.push(`})`);

  // Aparte ABM per "speler in de buurt"-trigger: controleert elke
  // seconde alle verbonden spelers en voert de acties uit voor wie
  // binnen de opgegeven straal is.
  const abmBlocks = [];
  nearBlocks.forEach(nb => {
    const radius = nb.getFieldValue('RADIUS');
    const actionLines = genActionLines(nb.getInputTargetBlock('ACTIONS'));
    if (!actionLines.length) return;
    const abm = [];
    abm.push(`core.register_abm({`);
    abm.push(`    label = ${luaStr('Speler nabij: ' + name)},`);
    abm.push(`    nodenames = {${luaStr(name)}},`);
    abm.push(`    interval = 1,`);
    abm.push(`    chance = 1,`);
    abm.push(`    action = function(pos, node)`);
    abm.push(`        for _, player in ipairs(core.get_connected_players()) do`);
    abm.push(`            if vector.distance(pos, player:get_pos()) <= ${radius} then`);
    actionLines.forEach(l => abm.push(`                ${l}`));
    abm.push(`            end`);
    abm.push(`        end`);
    abm.push(`    end,`);
    abm.push(`})`);
    abmBlocks.push(abm.join('\n'));
  });

  return [lines.join('\n')].concat(abmBlocks, extraTopLevel).join('\n\n') + '\n';
};

// ── register_craftitem ────────────────────────
luaGenerator.forBlock['luanti_register_craftitem'] = function(block) {
  const name  = block.getFieldValue('NAME');
  const desc  = block.getFieldValue('DESC');
  const stack = block.getFieldValue('STACK');
  const image = luaGenerator.valueToCode(block, 'IMAGE', luaGenerator.ORDER_NONE);

  const lines = [];
  lines.push(`core.register_craftitem(${luaStr(name)}, {`);
  lines.push(`    description = ${luaStr(desc)},`);
  if (image)       lines.push(`    inventory_image = ${image},`);
  if (+stack !== 99) lines.push(`    stack_max = ${stack},`);
  lines.push(`})`);
  return lines.join('\n') + '\n';
};

// ── tool_caps ─────────────────────────────────
luaGenerator.forBlock['luanti_tool_caps'] = function(block) {
  const fpi    = block.getFieldValue('FPI');
  const dropL  = block.getFieldValue('DROP_LVL');
  const uses   = block.getFieldValue('CR_USES');
  const maxlvl = block.getFieldValue('CR_LVL');
  const t1     = block.getFieldValue('CR_T1');
  const t2     = block.getFieldValue('CR_T2');
  const t3     = block.getFieldValue('CR_T3');

  const code = [
    '{',
    `        full_punch_interval = ${fpi},`,
    `        max_drop_level = ${dropL},`,
    `        groupcaps = {`,
    `            cracky = {`,
    `                times = {[1]=${t1}, [2]=${t2}, [3]=${t3}},`,
    `                uses = ${uses},`,
    `                maxlevel = ${maxlvl},`,
    `            },`,
    `        },`,
    `    }`,
  ].join('\n');
  return [code, luaGenerator.ORDER_ATOMIC];
};

// ── register_tool ─────────────────────────────
luaGenerator.forBlock['luanti_register_tool'] = function(block) {
  const name  = block.getFieldValue('NAME');
  const desc  = block.getFieldValue('DESC');
  const image = luaGenerator.valueToCode(block, 'IMAGE', luaGenerator.ORDER_NONE);
  const caps  = luaGenerator.valueToCode(block, 'CAPS',  luaGenerator.ORDER_NONE);

  const lines = [];
  lines.push(`core.register_tool(${luaStr(name)}, {`);
  lines.push(`    description = ${luaStr(desc)},`);
  if (image) lines.push(`    inventory_image = ${image},`);
  if (caps)  lines.push(`    tool_capabilities = ${caps},`);
  lines.push(`})`);
  return lines.join('\n') + '\n';
};

// ── craft_shaped ──────────────────────────────
luaGenerator.forBlock['luanti_craft_shaped'] = function(block) {
  const output = block.getFieldValue('OUTPUT');
  const count  = block.getFieldValue('COUNT');

  const rows = [
    ['R1C1','R1C2','R1C3'],
    ['R2C1','R2C2','R2C3'],
    ['R3C1','R3C2','R3C3'],
  ];

  const luaRows = rows.map(row => {
    const cells = row.map(c => luaStr(block.getFieldValue(c) || ''));
    return `        {${cells.join(', ')}}`;
  });

  const outputVal = +count > 1 ? `${luaStr(output)} ${count}` : output;

  return [
    `core.register_craft({`,
    `    output = ${luaStr(outputVal)},`,
    `    recipe = {`,
    luaRows.join(',\n'),
    `    },`,
    `})`,
    '',
  ].join('\n');
};

// ── craft_shapeless ───────────────────────────
luaGenerator.forBlock['luanti_craft_shapeless'] = function(block) {
  const output = block.getFieldValue('OUTPUT');
  const count  = block.getFieldValue('COUNT');

  const ings = [];
  for (let i = 1; i <= 6; i++) {
    const val = block.getFieldValue(`ING${i}`);
    if (val && val.trim()) ings.push(`        ${luaStr(val)}`);
  }

  const outputVal = +count > 1 ? `${output} ${count}` : output;

  return [
    `core.register_craft({`,
    `    type = "shapeless",`,
    `    output = ${luaStr(outputVal)},`,
    `    recipe = {`,
    ings.join(',\n'),
    `    },`,
    `})`,
    '',
  ].join('\n');
};

// ── craft_fuel ────────────────────────────────
luaGenerator.forBlock['luanti_craft_fuel'] = function(block) {
  const item     = block.getFieldValue('ITEM');
  const burntime = block.getFieldValue('BURNTIME');
  return [
    `core.register_craft({`,
    `    type = "fuel",`,
    `    recipe = ${luaStr(item)},`,
    `    burntime = ${burntime},`,
    `})`,
    '',
  ].join('\n');
};

// ── raw_lua ───────────────────────────────────
luaGenerator.forBlock['luanti_raw_lua'] = function(block) {
  return block.getFieldValue('CODE') + '\n';
};

// Chain code from connected "next" blocks — zonder deze override
// negeert de generator alles wat onder een blok is vastgeklikt.
luaGenerator.scrub_ = function(block, code, opt_thisOnly) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  const nextCode = (!opt_thisOnly && nextBlock) ? luaGenerator.blockToCode(nextBlock) : '';
  return code + nextCode;
};

// ── Main entry point ──────────────────────────
function generateLuaCode(workspace) {
  // scrub returns a generator instance string of all top-level blocks
  const allBlocks = workspace.getTopBlocks(true);
  const parts = [];
  for (const block of allBlocks) {
    try {
      const code = luaGenerator.blockToCode(block);
      if (typeof code === 'string' && code.trim()) {
        parts.push(code.trim());
      }
    } catch (e) {
      parts.push(`-- [ERROR in block "${block.type}"]: ${e.message}`);
    }
  }
  return parts.join('\n\n');
}
