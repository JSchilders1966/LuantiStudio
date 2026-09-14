// ─────────────────────────────────────────────
// LuantiStudio — voorbeelden
// Elke functie bouwt een workspace op met blokken + eigen Lua.
// ─────────────────────────────────────────────

function placeBlock(ws, type, fields, x, y) {
  const block = ws.newBlock(type);
  for (const [k, v] of Object.entries(fields)) {
    block.setFieldValue(v, k);
  }
  block.initSvg();
  block.render();
  block.moveBy(x, y);
  return block;
}

function placeLua(ws, code, x, y) {
  return placeBlock(ws, 'luanti_raw_lua', { CODE: code }, x, y);
}

// ── Hulpfunctie: mod naam ophalen ─────────────
function mod() { return getModName(); }

// showConfirmModal() komt uit js/ui.js (gedeeld met het projectmenu).

// ═══════════════════════════════════════════════
// 1. GROEIENDE BOOM
// ═══════════════════════════════════════════════
function loadVoorbeeldBoom(ws) {
  ws.clear();
  const m = mod();

  placeBlock(ws, 'luanti_register_node', {
    NAME: m + ':sapling',
    DESC: 'Boom zaailing',
    DRAWTYPE: 'plantlike',
    SUNLIGHT: 'TRUE',
    DIGGABLE: 'TRUE',
  }, 40, 60);

  placeBlock(ws, 'luanti_register_node', {
    NAME: m + ':tree',
    DESC: 'Boom stam',
    DRAWTYPE: 'normal',
  }, 40, 340);

  placeLua(ws, `-- ABM: laat de zaailing groeien tot een boom
minetest.register_abm({
    label = "Boom groei",
    nodenames = {"${m}:sapling"},
    interval = 10,   -- controleer elke 10 seconden
    chance = 4,      -- 1 op 4 kans per check
    action = function(pos, node)
        -- Controleer of er genoeg licht is
        if minetest.get_node_light(pos) and minetest.get_node_light(pos) < 10 then
            return
        end

        local height = math.random(4, 7)

        -- Bouw de stam omhoog
        for i = 0, height do
            local p = {x = pos.x, y = pos.y + i, z = pos.z}
            if minetest.get_node(p).name == "air" or i == 0 then
                minetest.set_node(p, {name = "${m}:tree"})
            end
        end

        -- Bladeren rondom de top
        for dx = -2, 2 do
            for dz = -2, 2 do
                for dy = height - 2, height + 1 do
                    -- Maak ronde kroon door hoeken weg te laten
                    if math.abs(dx) + math.abs(dz) < 4 then
                        local lpos = {x = pos.x + dx, y = pos.y + dy, z = pos.z + dz}
                        if minetest.get_node(lpos).name == "air" then
                            minetest.set_node(lpos, {name = "default:leaves"})
                        end
                    end
                end
            end
        end
    end,
})`, 40, 600);
}

// ═══════════════════════════════════════════════
// 2. GELUIDSNODE
// ═══════════════════════════════════════════════
function loadVoorbeeldGeluid(ws) {
  ws.clear();
  const m = mod();

  placeBlock(ws, 'luanti_register_node', {
    NAME: m + ':soundnode',
    DESC: 'Geluidsnode — stap erop of sla erop!',
    DRAWTYPE: 'normal',
  }, 40, 60);

  placeLua(ws, `-- Geluid bij aanslaan (on_punch)
-- Overschrijf de node definitie met callbacks
local old_def = minetest.registered_nodes["${m}:soundnode"]
if old_def then
    minetest.override_item("${m}:soundnode", {
        on_punch = function(pos, node, puncher, pointed_thing)
            minetest.sound_play("default_dig_cracky", {
                pos = pos,
                gain = 1.0,
                max_hear_distance = 16,
            })
        end,
    })
end

-- ABM: geluid wanneer speler op de node staat (footstep effect)
minetest.register_abm({
    label = "Footstep geluid",
    nodenames = {"${m}:soundnode"},
    interval = 0.5,
    chance = 1,
    action = function(pos, node)
        for _, player in ipairs(minetest.get_connected_players()) do
            local ppos = player:get_pos()
            -- Controleer of speler direct boven de node staat
            if math.abs(ppos.x - pos.x) < 0.6 and
               math.abs(ppos.y - (pos.y + 1)) < 0.8 and
               math.abs(ppos.z - pos.z) < 0.6 then
                minetest.sound_play("default_footstep", {
                    pos = pos,
                    gain = 0.4,
                    max_hear_distance = 6,
                    to_player = player:get_player_name(),
                })
            end
        end
    end,
})`, 40, 340);
}

// ═══════════════════════════════════════════════
// 3. KLEURWISSELENDE NODE
// ═══════════════════════════════════════════════
function loadVoorbeeldKleur(ws) {
  ws.clear();
  const m = mod();

  // Drie kleurnodes naast elkaar
  const colors = [
    [m + ':node_rood',  'Kleur node — Rood',  40,  60],
    [m + ':node_groen', 'Kleur node — Groen', 40, 300],
    [m + ':node_blauw', 'Kleur node — Blauw', 40, 540],
  ];
  for (const [name, desc, x, y] of colors) {
    placeBlock(ws, 'luanti_register_node', { NAME: name, DESC: desc }, x, y);
  }

  placeLua(ws, `-- ABM: wissel elke 3 seconden van kleur
-- (De texturen bepalen de kleur; gebruik gekleurde PNG-bestanden)
local kleur_volgorde = {
    "${m}:node_rood",
    "${m}:node_groen",
    "${m}:node_blauw",
}

minetest.register_abm({
    label = "Kleur wissel",
    nodenames = kleur_volgorde,
    interval = 3,
    chance = 1,
    action = function(pos, node)
        for i, naam in ipairs(kleur_volgorde) do
            if node.name == naam then
                -- Ga naar de volgende kleur (of terug naar rood)
                local volgende = kleur_volgorde[(i % #kleur_volgorde) + 1]
                minetest.set_node(pos, {name = volgende})

                -- Kleine visuele flash: licht even aan
                minetest.add_particlespawner({
                    amount = 4,
                    time = 0.3,
                    minpos = {x=pos.x-0.4, y=pos.y+0.5, z=pos.z-0.4},
                    maxpos = {x=pos.x+0.4, y=pos.y+1.0, z=pos.z+0.4},
                    minvel = {x=-0.5, y=0.5, z=-0.5},
                    maxvel = {x=0.5,  y=1.5, z=0.5},
                    minacc = {x=0, y=-2, z=0},
                    maxacc = {x=0, y=-1, z=0},
                    minexptime = 0.4,
                    maxexptime = 0.8,
                    minsize = 0.3,
                    maxsize = 0.7,
                    texture = "spark.png",
                    glow = 10,
                })
                return
            end
        end
    end,
})`, 420, 60);
}

// ═══════════════════════════════════════════════
// 4. CONFETTI NODE
// ═══════════════════════════════════════════════
function loadVoorbeeldConfetti(ws) {
  ws.clear();
  const m = mod();

  placeBlock(ws, 'luanti_register_node', {
    NAME: m + ':confettinode',
    DESC: 'Confetti node — kom dichtbij!',
    DRAWTYPE: 'normal',
    LIGHT: '8',
  }, 40, 60);

  placeLua(ws, `-- Confetti-kleuren: gebruik kleine gekleurde PNG-textures
-- of verwijzing naar bestaande texturen in je textuurpack
local confetti_textures = {
    "wool_red.png",
    "wool_yellow.png",
    "wool_green.png",
    "wool_blue.png",
    "wool_orange.png",
    "wool_violet.png",
    "wool_pink.png",
    "wool_cyan.png",
}

-- ABM: spuit confetti als speler binnen 5 blokken komt
minetest.register_abm({
    label = "Confetti effect",
    nodenames = {"${m}:confettinode"},
    interval = 0.4,
    chance = 1,
    action = function(pos, node)
        local spelers_dichtbij = false

        for _, player in ipairs(minetest.get_connected_players()) do
            local ppos = player:get_pos()
            local afstand = vector.distance(pos, ppos)

            if afstand < 5 then
                spelers_dichtbij = true

                -- Kies willekeurige confetti-textuur
                local tex = confetti_textures[math.random(#confetti_textures)]

                minetest.add_particlespawner({
                    amount = 12,
                    time = 0.4,
                    -- Schiet confetti omhoog vanuit de node
                    minpos = {x = pos.x - 0.3, y = pos.y + 1.0, z = pos.z - 0.3},
                    maxpos = {x = pos.x + 0.3, y = pos.y + 1.5, z = pos.z + 0.3},
                    -- Willekeurige richting
                    minvel = {x = -3, y = 3,  z = -3},
                    maxvel = {x =  3, y = 8,  z =  3},
                    -- Zwaartekracht
                    minacc = {x = 0, y = -6, z = 0},
                    maxacc = {x = 0, y = -4, z = 0},
                    -- Levensduur
                    minexptime = 1.0,
                    maxexptime = 2.5,
                    -- Grootte van confetti-stukjes
                    minsize = 0.4,
                    maxsize = 1.2,
                    texture = tex,
                    glow = 3,
                    -- Rotatie
                    minrotation = 0,
                    maxrotation = math.pi * 2,
                    minangularvelocity = -3,
                    maxangularvelocity = 3,
                })
            end
        end
    end,
})

-- Bonus: geluid bij confetti als speler echt dichtbij (< 2 blokken)
minetest.register_abm({
    label = "Confetti geluid",
    nodenames = {"${m}:confettinode"},
    interval = 1.5,
    chance = 1,
    action = function(pos, node)
        for _, player in ipairs(minetest.get_connected_players()) do
            if vector.distance(pos, player:get_pos()) < 2 then
                minetest.sound_play("default_place_node_hard", {
                    pos = pos,
                    gain = 0.3,
                    max_hear_distance = 6,
                    to_player = player:get_player_name(),
                })
            end
        end
    end,
})`, 40, 340);
}

// ── Dispatch ──────────────────────────────────
const VOORBEELDEN = {
  boom:      { labelKey: 'examples.boom',     fn: loadVoorbeeldBoom },
  geluid:    { labelKey: 'examples.geluid',   fn: loadVoorbeeldGeluid },
  kleur:     { labelKey: 'examples.kleur',    fn: loadVoorbeeldKleur },
  confetti:  { labelKey: 'examples.confetti', fn: loadVoorbeeldConfetti },
};

async function laadVoorbeeld(key, ws) {
  const v = VOORBEELDEN[key];
  if (!v) return false;
  const ok = await showConfirmModal(t('examples.confirmLoad', { label: t(v.labelKey) }));
  if (!ok) return false;
  v.fn(ws);
  Blockly.svgResize(ws);
  return true;
}
