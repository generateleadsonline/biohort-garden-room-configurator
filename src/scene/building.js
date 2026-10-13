// Builds a Biohort garden building as a Three.js group. Metres; x to the right as you face the
// door wall, y up, z towards you. The wall footprint is centred on the origin, so the front wall's
// outer face is at z = wd / 2.
//
// Construction from Biohort's dimension tables, their Roomle configurator's construction grid and
// their photographs (research/photos/FINDINGS.md):
//  HighLine   ribbed panels to 1.89m, round corner posts, a 360° acrylic band to the 2.095m fascia
//             underside, a 125mm fascia, 105mm overhang; roof surface always quartz grey
//  AvantGarde ribbed panels to 1.93m, a pent roof rising to the door, a front acrylic band and
//             triangular side panes, 390mm overhang over the door, 70mm at the back, 30mm at the sides
//  Europa     ribbed panels (four ribs then a plain band, 720mm repeat) to 1.81m eaves, an apex roof
//             at about 10°, ridge front to back, 100mm eaves and 20mm gable overhang, logo badge
//  Panorama   HighLine's wall set to 1.80m, an acrylic strip to the 1.96m gutters and acrylic gables,
//             an apex roof to 2.27m, 80mm eaves and 105mm gable overhang
//  Neo        smooth panels with a seam every 280mm to 2.05m, rounded corners, a 155mm fascia,
//             47.5mm overhang, plywood ceiling, a glazed strip in the standard door
//  CasaNova   40mm sandwich panels, a joint every metre, an acrylic light band, a deep fascia to
//             2.505m with a 120mm overhang, plywood and EPDM roof
// Every part is tagged (userData.tags) so the scene can frame and highlight it.
import * as THREE from 'three';
import {COLOURS, dims, mainDoor, openingWidth, WALL_ORDER} from '../catalog.js';
import {fitOut} from './fittings.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const INSIDE = '#e6e5df';

// Per range: wall pressing, wall top, roof and door heights (m above the wall base).
const RANGE_GEOMETRY = {
  highline: {t: .022, top: 1.885, fascia: .125, over: .105, post: 'round', profile: {type: 'rib', pitch: .08, rib: .012}, door: 1.84, clear: 1.82, joint: .8},
  avantgarde: {t: .022, top: 1.9, fascia: .14, over: .03, post: 'round', profile: {type: 'rib', pitch: .08, rib: .012}, door: 1.84, clear: 1.82, joint: .8},
  europa: {t: .02, top: 1.775, fascia: .05, over: .1, gable: .02, post: 'angle', profile: {type: 'groups', pitch: .088, count: 4, gap: .18, rib: .014}, door: 1.73, clear: 1.71, joint: .72},
  panorama: {t: .022, top: 1.86, fascia: .05, over: .08, gable: .105, post: 'round', profile: {type: 'rib', pitch: .08, rib: .012}, door: 1.84, clear: 1.82, joint: .8},
  neo: {t: .025, top: 2.045, fascia: .155, over: .0475, post: 'rounded', profile: {type: 'groove', pitch: .28, groove: .003}, door: 2.02, clear: 2.0, joint: .56},
  casanova: {t: .04, top: 2.04, fascia: .265, over: .12, post: 'square', profile: {type: 'groove', pitch: 1.0, groove: .004}, door: 2.0, clear: 1.98, joint: 1.0}
};
const BASE_STRIP = .035;

/** Heights and sizes the scene, the plan and the fittings share. */
export function geom(s) {
  const d = dims(s), G = RANGE_GEOMETRY[s.range];
  const B = {none: .05, frame: .09, smartbase: .1, smartbaseplus: .12}[s.foundation];
  const ww = d.ww, wd = d.wd, t = G.t;
  const floorY = B + (s.foundation === 'frame' && s.floorPlate ? .003 : s.foundation === 'smartbase' || s.foundation === 'smartbaseplus' ? .002 : 0) + .001;
  const roofTop = B + d.H;
  const eaves = s.range === 'europa' ? B + 1.81 : s.range === 'panorama' ? B + 1.96 : s.range === 'avantgarde' ? B + 1.93 : null;
  const ceil = s.range === 'casanova' ? B + 2.24 : s.range === 'neo' ? B + 2.05 : s.range === 'highline' ? B + 2.095 : s.range === 'avantgarde' ? B + 1.93 : B + 1.86;
  return {...d, ...G, B, ww, wd, t, iw: ww - 2 * t, id: wd - 2 * t, floorY, top: B + G.top, roofTop, eaves, ceil};
}

/** Where the building and its canopies end, for framing, the plan and landscaping. */
export function extents(s) {
  const g = geom(s);
  const cw = k => canopyWidth(s, s.canopy[k]);
  const ovX = g.over, ovZf = s.range === 'avantgarde' ? .39 : s.range === 'europa' ? .02 : s.range === 'panorama' ? .105 : g.over, ovZb = s.range === 'avantgarde' ? .07 : ovZf;
  const front = s.ramp ? .25 : 0;
  return {
    x0: -g.ww / 2 - ovX - cw('left'), x1: g.ww / 2 + ovX + cw('right'),
    z0: -g.wd / 2 - ovZb - (s.downpipe === 'rear' ? .1 : 0), z1: g.wd / 2 + Math.max(ovZf, front), top: g.roofTop + (s.pv ? .05 : 0)
  };
}
export function canopyWidth(s, c) {
  if (c === 'none' || !c) return 0;
  return {highline: c === 'S' ? 1.39 : 2.73, avantgarde: 2.43, europa: 1.445, neo: 3.0}[s.range] || 0;
}

/** A box whose UVs are in metres on every face, so tiled textures keep their true scale. */
export function metricBox(w, h, d) {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv;
  const dimsUV = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let i = 0; i < uv.count; i++) { const [a, b] = dimsUV[Math.floor(i / 4)]; uv.setXY(i, uv.getX(i) * a, uv.getY(i) * b); }
  return g;
}
/** Splits an extruded solid's groups: 0 the lid at z=0, 1 the lid at depth, 2 the edges. */
function splitLids(geometry) {
  const [lids, sides] = geometry.groups;
  const half = lids.count / 2;
  geometry.clearGroups();
  geometry.addGroup(lids.start, half, 0);
  geometry.addGroup(lids.start + half, half, 1);
  geometry.addGroup(sides.start, sides.count, 2);
  return geometry;
}

// Wall frames: origin at the wall's left end as you face it from outside, local x along the wall,
// local z out of the building; the outer face is at z = 0.
const SIDES = {
  front: {rot: 0, origin: (w, d) => V(-w / 2, 0, d / 2), length: (w, d) => w},
  back: {rot: Math.PI, origin: (w, d) => V(w / 2, 0, -d / 2), length: (w, d) => w},
  left: {rot: -Math.PI / 2, origin: (w, d) => V(-w / 2, 0, -d / 2), length: (w, d) => d},
  right: {rot: Math.PI / 2, origin: (w, d) => V(w / 2, 0, d / 2), length: (w, d) => d}
};

/** Builds the design. `tex` is the texture factory. Returns {group, lights, materials, geom}. */
export function buildRoom(s, tex) {
  const g = geom(s), R = s.range;
  const {ww, wd, t, B} = g;
  const root = new THREE.Group();
  root.name = 'building';
  const lights = [], materials = [];
  const keep = m => (materials.push(m), m);
  const std = (colour, o = {}) => keep(new THREE.MeshStandardMaterial({color: colour, roughness: .7, ...o}));
  const tag = (o, ...tags) => { o.userData.tags = [...(o.userData.tags || []), ...tags]; return o; };
  const add = (parent, geometry, material, x = 0, y = 0, z = 0, ...tags) => {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    parent.add(m); return tag(m, ...tags);
  };
  const box = (parent, bw, bh, bd, x, y, z, material, ...tags) => add(parent, metricBox(bw, bh, bd), material, x, y, z, ...tags);
  const group = (parent, ...tags) => { const gr = new THREE.Group(); parent.add(gr); return tag(gr, ...tags); };
  const cyl = (parent, r0, r1, h, x, y, z, material, seg = 20, ...tags) => add(parent, new THREE.CylinderGeometry(r0, r1, h, seg), material, x, y, z, ...tags);

  // ---- Materials --------------------------------------------------------------------------------
  const col = COLOURS[s.colour].render;
  const steelMat = (hex, profile, o = {}) => { const p = tex.steel(hex, profile); return std('#ffffff', {map: p.map, normalMap: p.normalMap, roughness: p.roughness, metalness: .42, ...o}); };
  const outer = steelMat(col, g.profile); outer.name = 'walls-outer';
  const inner = steelMat(INSIDE, g.profile, {metalness: .15, roughness: .55}); inner.name = 'walls-inner';
  const smooth = steelMat(col, {type: 'smooth'});
  const smoothIn = steelMat(INSIDE, {type: 'smooth'}, {metalness: .15, roughness: .55});
  const roofHex = R === 'highline' ? COLOURS.quartz.render : col;
  const roofMat = steelMat(roofHex, R === 'europa' ? {type: 'groove', pitch: .25, groove: .004} : {type: 'smooth'});
  const roofUnder = steelMat(R === 'neo' || R === 'casanova' ? '#d8c39d' : INSIDE, R === 'panorama' || R === 'avantgarde' ? {type: 'trapezoid', pitch: .2, crest: .05, flank: .02} : {type: 'smooth'}, {metalness: .1});
  if (R === 'neo' || R === 'casanova') { const p = tex.plywood(); roofUnder.map = p.map; roofUnder.color.set('#ffffff'); roofUnder.metalness = 0; }
  const acrylicPair = tex.acrylic();
  const acrylic = keep(new THREE.MeshPhysicalMaterial({color: '#d4e2e8', map: acrylicPair.map, roughness: .06, metalness: 0, transparent: true, opacity: .2, envMapIntensity: 1.4, side: THREE.DoubleSide, depthWrite: false}));
  const tinted = keep(new THREE.MeshPhysicalMaterial({color: '#7f8b90', roughness: .06, metalness: 0, transparent: true, opacity: .45, envMapIntensity: 1.6, side: THREE.DoubleSide, depthWrite: false}));
  const glass = keep(new THREE.MeshPhysicalMaterial({color: '#a9bfc4', roughness: .03, metalness: 0, transparent: true, opacity: .22, envMapIntensity: 1.8, side: THREE.DoubleSide, depthWrite: false}));
  const alu = std('#c6cacd', {roughness: .32, metalness: .75});
  const galv = std('#aeb3b5', {roughness: .45, metalness: .6});
  const stainless = std('#d4d6d6', {roughness: .22, metalness: .9});
  const dark = std('#2a2c2d', {roughness: .6, metalness: .2});
  const hidden = std('#3a3a38', {roughness: 1}); hidden.name = 'hidden';
  const conc = tex.concrete();
  const concrete = std('#ffffff', {map: conc.map, normalMap: conc.normalMap, roughness: .95});

  // ---- Base and foundation ---------------------------------------------------------------------------
  const base = group(root, 'foundation');
  const bw = (g.base?.[0] || ww * 100 + 3) / 100, bd = (g.base?.[1] || wd * 100 + 3) / 100;
  if (s.foundation === 'none' || s.foundation === 'frame') {
    // The customer's concrete slab: Biohort's foundation size, a little proud of the ground.
    box(base, bw + .1, .05, bd + .1, 0, .025, 0, concrete, 'foundation', 'slab');
    if (s.foundation === 'frame') {
      // Aluminium floor frame: 40mm square tubing around the footprint and across it.
      const fy = .05 + .02, inset = .018;
      box(base, ww - .004, .04, .04, 0, fy, wd / 2 - inset, alu, 'foundation', 'floorFrame');
      box(base, ww - .004, .04, .04, 0, fy, -wd / 2 + inset, alu, 'foundation', 'floorFrame');
      box(base, .04, .04, wd - .084, -ww / 2 + inset, fy, 0, alu, 'foundation', 'floorFrame');
      box(base, .04, .04, wd - .084, ww / 2 - inset, fy, 0, alu, 'foundation', 'floorFrame');
      const n = Math.max(1, Math.round(ww / .9) - 1);
      for (let i = 1; i <= n; i++) box(base, .04, .036, wd - .085, -ww / 2 + ww * i / (n + 1), fy - .002, 0, alu, 'foundation', 'floorFrame');
    }
  } else {
    // SmartBase: aluminium boards and frame on adjustable feet; PLUS stands on ground screws.
    const plus = s.foundation === 'smartbaseplus', top = B, deck = .03;
    const boards = tex.steel('#c3c7ca', {type: 'groove', pitch: .2, groove: .004});
    const deckMat = std('#ffffff', {map: boards.map, normalMap: boards.normalMap, roughness: .4, metalness: .7});
    box(base, ww + .02, deck, wd + .02, 0, top - deck / 2, 0, deckMat, 'foundation', 'smartbase');
    box(base, ww + .024, .045, .03, 0, top - deck - .022, wd / 2 - .005, alu, 'foundation', 'smartbase');
    box(base, ww + .024, .045, .03, 0, top - deck - .022, -wd / 2 + .005, alu, 'foundation', 'smartbase');
    const nx = Math.max(2, Math.round(ww / .8) + 1), nz = Math.max(2, Math.round(wd / .8) + 1);
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      if (i > 0 && i < nx - 1 && j > 0 && j < nz - 1) continue;
      const x = -ww / 2 + .06 + (ww - .12) * i / (nx - 1), z = -wd / 2 + .06 + (wd - .12) * j / (nz - 1);
      const h = top - deck - .045;
      cyl(base, .018, .018, h, x, h / 2, z, plus ? galv : alu, 12, 'foundation', 'smartbase');
      if (plus) cyl(base, .05, .05, .012, x, .006, z, galv, 18, 'foundation', 'smartbase', 'screws');
      else box(base, .09, .006, .09, x, .003, z, alu, 'foundation', 'smartbase');
    }
  }
  if (s.anchors) {
    // Biohort's ground anchors for a gravel base: a bracket at the wall foot, staked into the ground.
    const total = {HS: 8, H1: 8, H2: 10, H3: 10, H4: 12, H5: 12, H6: 12, A1: 8, A2: 10, A3: 10, A4: 12, A5: 10, A6: 10, A7: 12, A8: 12, 1: 4, 2: 6, '2A': 6, 3: 8, 4: 8, '4A': 8, 5: 10, 6: 10, 7: 12}[s.size] || 8;
    const perim = 2 * (ww + wd);
    for (const side of WALL_ORDER) {
      const L = side === 'front' || side === 'back' ? ww : wd, k = Math.max(1, Math.round(total * L / perim));
      for (let i = 0; i < k; i++) {
        const u = -L / 2 + L * (i + .5) / k;
        const an = group(base, 'anchors');
        const [x, z, a2] = side === 'front' ? [u, wd / 2, 0] : side === 'back' ? [-u, -wd / 2, Math.PI] : side === 'left' ? [-ww / 2, -u, -Math.PI / 2] : [ww / 2, u, Math.PI / 2];
        an.position.set(x, 0, z); an.rotation.y = a2;
        box(an, .045, .09, .004, 0, B + .045, .004, galv, 'anchors');
        box(an, .045, .004, .1, 0, B - .002, .054, galv, 'anchors');
        cyl(an, .006, .006, .14, 0, B - .06, .095, galv, 8, 'anchors');
      }
    }
  }

  // ---- Walls with their openings -------------------------------------------------------------------
  const walls = group(root, 'walls');
  const md = mainDoor(s);
  const elements = [md, ...s.openings];
  const wallH = g.top - B - BASE_STRIP;
  const wallInfo = {};
  for (const [side, def] of Object.entries(SIDES)) {
    const L = def.length(ww, wd);
    const wg = group(walls, 'wall:' + side);
    wg.position.copy(def.origin(ww, wd)); wg.position.y = B; wg.rotation.y = def.rot;
    wallInfo[side] = {g: wg, L};
    const els = elements.filter(o => o.wall === side);
    // Front and back walls run full width; the sides sit between them.
    const a = side === 'front' || side === 'back' ? 0 : t, b = side === 'front' || side === 'back' ? L : L - t;
    const shape = new THREE.Shape();
    shape.moveTo(a, BASE_STRIP); shape.lineTo(b, BASE_STRIP); shape.lineTo(b, BASE_STRIP + wallH); shape.lineTo(a, BASE_STRIP + wallH); shape.lineTo(a, BASE_STRIP);
    for (const o of els) {
      const [x0, x1, y0, y1] = holeOf(s, g, o, L);
      if (y0 <= BASE_STRIP + .001) {
        // A door: cut it as a notch from the bottom edge, so no sliver of wall sits in the threshold.
        continue;
      }
      const h = new THREE.Path(); h.moveTo(x0, y0); h.lineTo(x0, y1); h.lineTo(x1, y1); h.lineTo(x1, y0); h.lineTo(x0, y0);
      shape.holes.push(h);
    }
    const geo = notchedWall(shape, s, g, els, L, a, b, wallH);
    const wall = add(wg, splitLids(new THREE.ExtrudeGeometry(geo, {depth: t, bevelEnabled: false})), [inner, outer, hidden], 0, 0, -t, 'walls', 'wall:' + side, 'cladding');
    wall.userData.solid = true;
    // Panel joints: a fine vertical profile every module, 1.5mm proud of the face.
    const jointMat = R === 'neo' || R === 'casanova' ? smooth : outer;
    for (let x = a + g.joint; x < b - .1; x += g.joint) {
      if (els.some(o => { const [x0, x1] = holeOf(s, g, o, L); return x > x0 - .03 && x < x1 + .03; })) continue;
      box(wg, R === 'casanova' ? .006 : .01, wallH - .004, .0016, x, BASE_STRIP + wallH / 2, .0008 + .0004, jointMat, 'walls', 'wall:' + side, 'joints');
    }
    // Base strip along the bottom.
    box(wg, b - a, BASE_STRIP - .002, t + .006, (a + b) / 2, BASE_STRIP / 2, -t / 2 + .001, R === 'neo' ? galv : alu, 'walls', 'baseStrip');
    for (const o of els) buildOpening(wg, o, L, side);
  }

  /** A wall outline with every door cut as a notch from its bottom edge. */
  function notchedWall(shape, s0, g0, els, L, a, b, h) {
    const doors = els.map(o => holeOf(s0, g0, o, L)).filter(([, , y0]) => y0 <= BASE_STRIP + .001).sort((p, q) => p[0] - q[0]);
    if (!doors.length) return shape;
    const out = new THREE.Shape();
    out.moveTo(a, BASE_STRIP);
    for (const [x0, x1, , y1] of doors) { out.lineTo(Math.max(a, x0), BASE_STRIP); out.lineTo(Math.max(a, x0), y1); out.lineTo(Math.min(b, x1), y1); out.lineTo(Math.min(b, x1), BASE_STRIP); }
    out.lineTo(b, BASE_STRIP); out.lineTo(b, BASE_STRIP + h); out.lineTo(a, BASE_STRIP + h); out.lineTo(a, BASE_STRIP);
    out.holes = shape.holes;
    return out;
  }

  // ---- Corner posts ----------------------------------------------------------------------------------
  const posts = group(root, 'posts');
  const postTop = R === 'highline' ? g.top + (2.095 - 1.855) - .002 : R === 'panorama' ? B + 1.958 : R === 'avantgarde' ? g.top + .001 : g.top;
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const x = sx * ww / 2, z = sz * wd / 2;
    if (g.post === 'round') cyl(posts, .033, .033, postTop - B, x, B + (postTop - B) / 2, z, R === 'highline' || R === 'panorama' ? smooth : smooth, 24, 'posts');
    else if (g.post === 'angle') {
      const h = g.top - B - .002, leg = .045, th = .003;
      box(posts, leg, h, th, x - sx * (leg / 2 - .001), B + h / 2, z + sz * (th / 2 + .0008), smooth, 'posts');
      box(posts, th, h, leg, x + sx * (th / 2 + .0008), B + h / 2, z - sz * (leg / 2 - .001), smooth, 'posts');
    } else if (g.post === 'rounded') {
      const h = g.top - B - .002;
      cyl(posts, .036, .036, h, x - sx * .012, B + h / 2, z - sz * .012, smooth, 20, 'posts');
    } else {
      const h = g.top - B - .002;
      box(posts, .07, h, .07, x - sx * .033, B + h / 2, z - sz * .033, smooth, 'posts');
    }
  }

  // ---- Roof ------------------------------------------------------------------------------------------
  const roof = group(root, 'roof');
  if (R === 'highline' || R === 'neo' || R === 'casanova') flatRoof();
  else if (R === 'avantgarde') pentRoof();
  else apexRoof();

  function band(y0, y1, mullionEvery, tags = []) {
    // An acrylic band between the wall top and the roof, on mullions; drawn inside the post line.
    const h = y1 - y0;
    for (const side of WALL_ORDER) {
      const {g: wg, L} = wallInfo[side];
      const a = side === 'front' || side === 'back' ? .035 : t + .035, b = L - a;
      const pane = add(wg, new THREE.PlaneGeometry(b - a, h - .004), acrylic, (a + b) / 2, y0 - B + h / 2, -t / 2, 'skylight', 'glass', ...tags);
      pane.castShadow = false; pane.renderOrder = 2;
      const n = Math.max(1, Math.round((b - a) / mullionEvery));
      for (let i = 1; i < n; i++) box(wg, .03, h - .004, .03, a + (b - a) * i / n, y0 - B + h / 2, -t / 2, smooth, 'skylight', 'mullions', ...tags);
      // Frame rails above and below the acrylic.
      box(wg, b - a, .022, t + .012, (a + b) / 2, y0 - B + .011, -t / 2, smooth, 'skylight', ...tags);
    }
  }

  function flatRoof() {
    const ov = g.over, K = ww + 2 * ov, Lr = wd + 2 * ov;
    const bandTop = R === 'highline' || R === 'casanova' ? g.roofTop - g.fascia : null;
    if (bandTop) band(g.top, bandTop, R === 'casanova' ? 1.0 : .64, R === 'casanova' && s.skylight ? ['doubleGlazing'] : []);
    if (R === 'casanova' && s.skylight) {
      // Double glazing: a second acrylic sheet 20mm inside the first, in its own frame.
      for (const side of WALL_ORDER) {
        const {g: wg, L} = wallInfo[side];
        const a = side === 'front' || side === 'back' ? .08 : t + .08, b = L - a, h = bandTop - g.top;
        const p2 = add(wg, new THREE.PlaneGeometry(b - a, h - .03), acrylic, (a + b) / 2, g.top - B + h / 2, -t - .022, 'skylight', 'glass', 'doubleGlazing');
        p2.castShadow = false; p2.renderOrder = 2;
        box(wg, b - a, .018, .02, (a + b) / 2, g.top - B + h - .02, -t - .022, alu, 'skylight', 'doubleGlazing');
      }
    }
    const fasciaBottom = g.roofTop - g.fascia;
    const y0 = R === 'neo' ? g.top : fasciaBottom;
    // The fascia is a closed box: four sides, a top cap and a soffit, mitred at the corners.
    const ft = .02, top = g.roofTop;
    const fm = R === 'highline' ? steelMat(col, {type: 'smooth'}) : smooth;
    box(roof, K, top - y0, ft, 0, (top + y0) / 2, Lr / 2 - ft / 2, fm, 'roof', 'fascia');
    box(roof, K, top - y0, ft, 0, (top + y0) / 2, -Lr / 2 + ft / 2, fm, 'roof', 'fascia');
    box(roof, ft, top - y0, Lr - 2 * ft - .002, -K / 2 + ft / 2, (top + y0) / 2, 0, fm, 'roof', 'fascia');
    box(roof, ft, top - y0, Lr - 2 * ft - .002, K / 2 - ft / 2, (top + y0) / 2, 0, fm, 'roof', 'fascia');
    // Roof surface just below the fascia's top edge, so it never shares its plane.
    const surf = R === 'casanova' ? std('#ffffff', {map: tex.epdm().map, normalMap: tex.epdm().normalMap, roughness: .9}) : roofMat;
    box(roof, K - 2 * ft - .004, .01, Lr - 2 * ft - .004, 0, top - .012, 0, surf, 'roof', 'roofDeck');
    // Soffit under the overhang, and the ceiling inside.
    box(roof, K - 2 * ft - .004, .008, Lr - 2 * ft - .004, 0, y0 + .004, 0, roofUnder, 'roof', 'ceiling', 'soffit');
    if (R === 'highline') {
      // Ventilation slots in a row along the fascia underside.
      for (const sz of [1, -1]) for (let x = -K / 2 + .2; x < K / 2 - .2; x += .12) box(roof, .06, .002, .014, x, y0 - .0005, sz * (Lr / 2 - .045), dark, 'roof', 'vents');
    }
    if (R === 'casanova') {
      // The milled CASA NOVA lettering on the front fascia: a slim recessed plate.
      box(roof, .62, .045, .002, -K / 2 + .55, (top + y0) / 2, Lr / 2 + .0011, dark, 'roof', 'fascia', 'logo');
      if (s.roofSupport) roofBars(std('#efeeea', {roughness: .5}), 'roofSupport');
      else roofBars(alu, 'roofBars');
      // External lighting: 68mm cut-outs in the soffit, a spotlight in each.
      for (const k of WALL_ORDER) if (s.extLight[k]) spotRow(k, y0);
    } else if (R === 'neo') roofBars(galv, 'roofBars');
  }

  function roofBars(mat, name) {
    const y = R === 'casanova' ? g.ceil - .03 : g.ceil - .025;
    const n = Math.max(1, Math.round(wd / (R === 'casanova' ? 1 : .56)) - 1);
    for (let i = 1; i <= n; i++) box(roof, ww - 2 * t - .01, .05, .04, 0, y, -wd / 2 + wd * i / (n + 1), mat, 'roof', 'ceiling', name);
  }
  function spotRow(k, y0) {
    const L = k === 'front' || k === 'back' ? ww : wd, n = Math.max(2, Math.round(L + .24));
    for (let i = 0; i < n; i++) {
      const u = -L / 2 + L * (i + .5) / n, off = g.over / 2;
      const [x, z] = k === 'front' ? [u, wd / 2 + off] : k === 'back' ? [u, -wd / 2 - off] : k === 'left' ? [-ww / 2 - off, u] : [ww / 2 + off, u];
      // The 68mm cut-out with a spotlight fitted (spotlights are illustrative: not included).
      cyl(roof, .046, .046, .012, x, y0 - .005, z, stainless, 24, 'roof', 'extLight', 'extLight:' + k);
      cyl(roof, .034, .034, .004, x, y0 - .0125, z, std('#fff6e0', {emissive: '#ffd79a', emissiveIntensity: .6}), 24, 'roof', 'extLight', 'extLight:' + k, 'lamp');
      lights.push({kind: 'down', position: V(x, y0 - .05, z)});
    }
  }

  function pentRoof() {
    // AvantGarde: high over the door, falling to the gutter at the back.
    const front = .39, back = .07, side = g.over;
    const zF = wd / 2 + front, zB = -wd / 2 - back, xL = -ww / 2 - side, xR = ww / 2 + side;
    const yB = g.eaves + .02, yF = g.roofTop - .02;
    const slope = (yF - yB) / (zF - zB);
    const yAt = z => yB + slope * (z - zB);
    // Acrylic: the front band and the triangles between the flat wall tops and the sloping roof.
    band(g.top, yAt(wd / 2) - .05, .6);
    for (const k of ['left', 'right']) {
      const {g: wg, L} = wallInfo[k];
      const sh = new THREE.Shape();
      const zAt = u => (k === 'left' ? -wd / 2 + u : wd / 2 - u);
      const a = t + .035, b = L - t - .035;
      const y0 = g.top - B + .001;
      sh.moveTo(a, y0); sh.lineTo(b, y0); sh.lineTo(b, yAt(zAt(b)) - B - .06); sh.lineTo(a, yAt(zAt(a)) - B - .06); sh.lineTo(a, y0);
      const tri = add(wg, new THREE.ShapeGeometry(sh), acrylic, 0, 0, -t / 2 - .003, 'skylight', 'glass');
      tri.castShadow = false; tri.renderOrder = 2;
    }
    const slab = new THREE.Shape();
    slab.moveTo(zB, yB); slab.lineTo(zF, yF); slab.lineTo(zF, yF + .05); slab.lineTo(zB, yB + .05); slab.lineTo(zB, yB);
    const sg = new THREE.ExtrudeGeometry(slab, {depth: xR - xL, bevelEnabled: false});
    const m = add(roof, splitLids(sg), [roofMat, roofMat, roofUnder], 0, 0, 0, 'roof', 'roofDeck');
    m.rotation.y = -Math.PI / 2; m.position.x = xR;
    m.userData.solid = true;
    // Fascia across the high front edge and the gutter at the back.
    box(roof, xR - xL + .004, g.fascia, .02, 0, yF + .05 - g.fascia / 2 + .002, zF + .011, smooth, 'roof', 'fascia');
    box(roof, xR - xL + .004, .07, .06, 0, yB - .01, zB - .031, smooth, 'roof', 'gutter');
    // Underside: the roof's ribbed sheet seen from inside.
    void slope;
  }

  function apexRoof() {
    const eaveOv = g.over, gableOv = g.gable;
    const K = ww + 2 * eaveOv, Lr = wd + 2 * gableOv;
    const yE = g.eaves, yR = g.roofTop - (R === 'europa' ? .035 : .04);
    const half = K / 2;
    if (R === 'panorama') band(g.top, yE - .015, .64, ['eavesStrip']);
    // Gables: ribbed steel on Europa, acrylic on Panorama.
    for (const sz of [1, -1]) {
      const sh = new THREE.Shape();
      const top0 = g.top, wallHalf = ww / 2;
      const yAtX = x => yE + (yR - yE) * (1 - Math.abs(x) / half) - .02;
      sh.moveTo(-wallHalf, top0); sh.lineTo(wallHalf, top0); sh.lineTo(wallHalf, Math.max(top0, yAtX(wallHalf))); sh.lineTo(0, yAtX(0)); sh.lineTo(-wallHalf, Math.max(top0, yAtX(-wallHalf))); sh.lineTo(-wallHalf, top0);
      if (R === 'europa') {
        const gm = add(root, splitLids(new THREE.ExtrudeGeometry(sh, {depth: t, bevelEnabled: false})), [inner, outer, hidden], 0, 0, sz * wd / 2 - (sz > 0 ? t : 0), 'roof', 'gable', 'walls');
        if (sz < 0) { gm.rotation.y = Math.PI; gm.position.z = -wd / 2 + t; }
        gm.userData.solid = true;
        if (sz > 0) {
          // Biohort's logo badge at the ridge.
          box(root, .2, .07, .004, 0, yAtX(0) - .12, wd / 2 + .0021, std('#e9eaeb', {roughness: .35, metalness: .6}), 'roof', 'badge');
        }
      } else {
        const p = add(root, new THREE.ShapeGeometry(sh), acrylic, 0, 0, sz * (wd / 2 - t / 2), 'roof', 'skylight', 'glass', 'gable');
        p.castShadow = false; p.renderOrder = 2;
        if (sz < 0) p.rotation.y = Math.PI;
      }
    }
    // Two roof planes from the eaves to the ridge, running front to back.
    const th = .03;
    for (const sx of [-1, 1]) {
      const sh = new THREE.Shape();
      const r0 = sx * .001;
      sh.moveTo(r0, yR); sh.lineTo(sx * half, yE); sh.lineTo(sx * half, yE + th); sh.lineTo(r0, yR + th); sh.lineTo(r0, yR);
      const geo = new THREE.ExtrudeGeometry(sh, {depth: Lr, bevelEnabled: false});
      const m = add(roof, splitLids(geo), [roofMat, roofMat, roofUnder], 0, 0, -Lr / 2, 'roof', 'roofDeck');
      if (sx < 0) m.userData.mirror = true;
      m.userData.solid = true;
    }
    // Ridge cap and the eaves gutters with their outlets.
    const cap = add(roof, new THREE.CylinderGeometry(.03, .03, Lr + .01, 12, 1, false, 0, Math.PI), smooth, 0, yR + th - .006, 0, 'roof', 'ridge');
    cap.rotation.x = Math.PI / 2; cap.rotation.y = Math.PI / 2;
    for (const sx of [-1, 1]) box(roof, .06, .07, Lr + .004, sx * (half + .028), yE - .02, 0, smooth, 'roof', 'gutter');
  }

  // ---- Doors and windows -----------------------------------------------------------------------------
  /** [x0, x1, y0, y1] of an element's opening in wall coordinates. */
  function buildOpening(wg, o, L, side) {
    const [x0, x1, y0, y1] = holeOf(s, g, o, L);
    const og = group(wg, o.id === 'main' ? 'door:main' : 'opening:' + o.id, o.id === 'main' ? 'mainDoor' : 'openings', 'doors');
    const W0 = x1 - x0, H0 = y1 - y0, cx = (x0 + x1) / 2;
    const kind = o.id === 'main' ? md.kind : o.kind;
    // Frame: two jambs and a head, proud of the wall face, in the building colour.
    const fw = .03, fz = .006;
    const jamb = (y1 + fw) - y0;
    box(og, fw, jamb, t + .012, x0 - fw / 2 - .0005, y0 + jamb / 2, -t / 2, smooth, 'frames');
    box(og, fw, jamb, t + .012, x1 + fw / 2 + .0005, y0 + jamb / 2, -t / 2, smooth, 'frames');
    box(og, W0 + .002, fw, t + .012, cx, y1 + fw / 2 + .0004, -t / 2, smooth, 'frames');
    if (y0 > BASE_STRIP + .001) box(og, W0 + .002, fw, t + .012, cx, y0 - fw / 2 - .0004, -t / 2, smooth, 'frames');
    if (kind === 'window' || kind === 'glassPanel' || kind === 'glassElement' || kind === 'tiltWindow') return windowIn(og, kind, x0, x1, y0, y1, fz);
    if (kind === 'gate') return gateIn(og, x0, x1, y0, y1);
    // Leaves.
    const leaves = kind === 'double' ? 2 : 1;
    const lw = W0 / leaves - .004;
    // Europa's leaves carry the wall pressing; the AvantGarde ECO*'s door is corrugated.
    const eco = R === 'avantgarde' && s.model === 'eco';
    const leafMat = R === 'europa' ? outer : eco ? steelMat(col, {type: 'trapezoid', pitch: .1, crest: .045, flank: .015}) : smooth;
    for (let i = 0; i < leaves; i++) {
      const lx = x0 + .002 + lw / 2 + i * (lw + .004);
      const leaf = box(og, lw, H0 - .004, .03, lx, y0 + (H0 - .004) / 2 + .002, -.015 + fz, leafMat, 'doors', 'leaf');
      leaf.material = [leafMat, leafMat, leafMat, leafMat, leafMat, R === 'europa' ? inner : smoothIn];
      if (R === 'neo' || R === 'casanova') {
        // Three fine horizontal grooves across the leaf.
        for (const f of [.3, .52, .74]) box(og, lw - .06, .004, .002, lx, y0 + H0 * f, fz + .0011, dark, 'doors', 'grooves');
      }
      if (R === 'neo' && kind === 'door') {
        // The tinted glazed strip toward the hinge edge (standard on the Neo's standard door).
        const gx = lx + lw / 2 - .08 - .065;
        add(og, new THREE.PlaneGeometry(.13, 1.5), tinted, gx, y0 + H0 * .52, fz + .0012, 'doors', 'glass', 'doorGlassStrip').renderOrder = 2;
      }
      const isMainLeaf = leaves === 1 || i === (R === 'casanova' ? (s.hinge === 'right' ? 0 : 1) : 1);
      const glazed = R === 'casanova' && ((o.id === 'main' && s.doorGlass && isMainLeaf) || (o.glass && o.id !== 'main'));
      if (glazed) {
        add(og, new THREE.PlaneGeometry(.75 * lw / .95, 1.79), glass, lx, y0 + H0 / 2 + .02, fz + .0013, 'doors', 'glass', 'doorGlass').renderOrder = 2;
        box(og, .75 * lw / .95 + .02, 1.79 + .02, .002, lx, y0 + H0 / 2 + .02, fz + .0002, dark, 'doors', 'doorGlass');
      }
    }
    // Handle: lever and cylinder on the leading edge; Europa has a T-handle at the meeting edge.
    const hingeRight = o.id === 'main' ? s.hinge !== 'left' : o.hinge !== 'left';
    const hx = leaves === 2 ? cx + (R === 'europa' ? .06 : -.06) : hingeRight ? x0 + .08 : x1 - .08;
    const hy = y0 + 1.0;
    if (R === 'europa' || (R === 'avantgarde' && s.model === 'eco')) { box(og, .025, .12, .02, hx, hy, fz + .012, stainless, 'doors', 'handle'); box(og, .1, .022, .02, hx, hy + .03, fz + .03, stainless, 'doors', 'handle'); }
    else {
      cyl(og, .026, .026, .012, hx, hy, fz + .006, stainless, 18, 'doors', 'handle').rotation.x = Math.PI / 2;
      box(og, .13, .02, .018, hx + (hingeRight ? .05 : -.05), hy, fz + .026, stainless, 'doors', 'handle');
      cyl(og, .02, .02, .01, hx, hy - .1, fz + .005, stainless, 16, 'doors', 'handle').rotation.x = Math.PI / 2;
    }
    // Gas spring (standard on most ranges, an option on Europa and AvantGarde ECO*): inside, at the top.
    const spring = R === 'europa' || (R === 'avantgarde' && s.model === 'eco') ? s.gasSpring : true;
    if (spring && o.id === 'main') {
      const sx = hingeRight ? x1 - .25 : x0 + .25;
      const sp = cyl(og, .009, .009, .38, sx, y1 - .06, -t - .045, dark, 10, 'doors', 'gasSpring');
      sp.rotation.z = Math.PI / 2 - .25;
      cyl(og, .005, .005, .2, sx + (hingeRight ? -.2 : .2), y1 - .1, -t - .045, stainless, 8, 'doors', 'gasSpring').rotation.z = Math.PI / 2 - .25;
    }
    void side;
  }

  function windowIn(og, kind, x0, x1, y0, y1, fz) {
    const W0 = x1 - x0, H0 = y1 - y0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    if (kind === 'glassPanel') {
      add(og, new THREE.PlaneGeometry(W0 - .004, H0 - .004), tinted, cx, cy, -t / 2, 'windows', 'glass').renderOrder = 2;
      return;
    }
    if (kind === 'window') {
      // Biohort's window unit: a wall element with a hinged, metal-framed clear window, 50 x 60cm.
      const sash = .028;
      box(og, W0 + .002, sash, .03, cx, y1 - sash / 2, fz - .006, smooth, 'windows', 'sash');
      box(og, W0 + .002, sash, .03, cx, y0 + sash / 2, fz - .006, smooth, 'windows', 'sash');
      box(og, sash, H0 - 2 * sash, .03, x0 + sash / 2, cy, fz - .006, smooth, 'windows', 'sash');
      box(og, sash, H0 - 2 * sash, .03, x1 - sash / 2, cy, fz - .006, smooth, 'windows', 'sash');
      add(og, new THREE.PlaneGeometry(W0 - 2 * sash, H0 - 2 * sash), glass, cx, cy, fz - .006, 'windows', 'glass').renderOrder = 2;
      box(og, .08, .015, .02, cx, y0 + .08, fz + .012, stainless, 'windows', 'handle');
      return;
    }
    // CasaNova glass element and tilt and turn window: aluminium frames, insulated glass.
    const fr = .045;
    box(og, W0, fr, .06, cx, y1 - fr / 2, -t / 2, alu, 'windows', 'sash');
    box(og, W0, fr, .06, cx, y0 + fr / 2, -t / 2, alu, 'windows', 'sash');
    box(og, fr, H0 - 2 * fr, .06, x0 + fr / 2, cy, -t / 2, alu, 'windows', 'sash');
    box(og, fr, H0 - 2 * fr, .06, x1 - fr / 2, cy, -t / 2, alu, 'windows', 'sash');
    add(og, new THREE.PlaneGeometry(W0 - 2 * fr, H0 - 2 * fr), glass, cx, cy, -t / 2, 'windows', 'glass').renderOrder = 2;
    if (kind === 'tiltWindow') box(og, .02, .12, .02, x0 + fr + .03, cy, .012, stainless, 'windows', 'handle');
  }

  function gateIn(og, x0, x1, y0, y1) {
    // CasaNova's sectional overhead door: Hörmann, insulated, silver, horizontal sections.
    const W0 = x1 - x0, H0 = y1 - y0, n = 4;
    const sect = steelMat('#c5c8ca', {type: 'groove', pitch: .1, groove: .002}, {metalness: .5});
    for (let i = 0; i < n; i++) {
      const sh = H0 / n - .006;
      box(og, W0 - .006, sh, .042, (x0 + x1) / 2, y0 + .003 + i * (H0 / n) + sh / 2, -.012, sect, 'doors', 'gate');
    }
    box(og, .12, .025, .03, (x0 + x1) / 2, y0 + .25, .026, stainless, 'doors', 'gate', 'handle');
    if (s.gate === 'electric') box(og, .5, .12, .3, (x0 + x1) / 2, y1 + .1, -t - .2, std('#3a3d40', {roughness: .5}), 'doors', 'gate', 'opener');
  }

  // ---- Side canopies ---------------------------------------------------------------------------------
  for (const k of ['left', 'right']) {
    const c = s.canopy[k];
    if (c === 'none') continue;
    const cg = group(root, 'canopy', 'canopy:' + k);
    const sx = k === 'left' ? -1 : 1, cw = canopyWidth(s, c);
    const inner0 = ww / 2 + g.over, x0 = sx * inner0, x1 = sx * (inner0 + cw);
    const depth = R === 'avantgarde' ? wd + .46 : R === 'europa' ? wd + .04 : wd + 2 * g.over;
    const zc = R === 'avantgarde' ? (.39 - .07) / 2 : 0;
    let yTop, yLow;
    if (R === 'europa') { yTop = g.eaves - .02; yLow = B + 1.56; }
    else if (R === 'avantgarde') { yTop = g.roofTop - .04; yLow = g.eaves; }
    else { yTop = g.roofTop; yLow = g.roofTop; }
    const roofHex2 = R === 'highline' ? COLOURS.quartz.render : col;
    const cm = steelMat(roofHex2, {type: 'smooth'});
    if (R === 'europa') {
      // Lean-to: falls from under the eaves to 1.56m at its outer edge.
      const sh = new THREE.Shape();
      sh.moveTo(0, yTop); sh.lineTo(sx * cw, yLow); sh.lineTo(sx * cw, yLow + .03); sh.lineTo(0, yTop + .03); sh.lineTo(0, yTop);
      const m = add(cg, splitLids(new THREE.ExtrudeGeometry(sh, {depth, bevelEnabled: false})), [cm, cm, cm], x0 + sx * .004, 0, -depth / 2, 'canopy', 'roof');
      m.userData.solid = true;
    } else if (R === 'avantgarde') {
      const zF = zc + depth / 2, zB = zc - depth / 2;
      const sh = new THREE.Shape();
      sh.moveTo(zB, yLow); sh.lineTo(zF, yTop); sh.lineTo(zF, yTop + .05); sh.lineTo(zB, yLow + .05); sh.lineTo(zB, yLow);
      let xa = Math.min(x0, x1), xb = Math.max(x0, x1);
      if (sx > 0) xa += .003; else xb -= .003;
      const m = add(cg, splitLids(new THREE.ExtrudeGeometry(sh, {depth: xb - xa, bevelEnabled: false})), [cm, cm, cm], 0, 0, 0, 'canopy', 'roof');
      m.rotation.y = -Math.PI / 2; m.position.x = xb;
      m.userData.solid = true;
    } else {
      const h = R === 'highline' ? g.fascia : g.fascia;
      box(cg, cw - .006, h, depth, (x0 + x1) / 2 + sx * .003, yTop - h / 2, 0, cm, 'canopy', 'roof', 'fascia');
    }
    // Supports at the outer edge, aluminium with height-adjustable feet (Europa: galvanised).
    const postH = (R === 'europa' ? yLow : R === 'avantgarde' ? yLow : yTop - g.fascia) - .002;
    const postX = x1 - sx * .05;
    const zs = R === 'avantgarde' && wd > 3 ? [-depth / 2 + zc + .08, zc, depth / 2 + zc - .08] : [-depth / 2 + zc + .08, depth / 2 + zc - .08];
    for (const z of zs) { box(cg, .07, postH, .07, postX, postH / 2, z, R === 'europa' ? galv : alu, 'canopy', 'canopyPosts'); box(cg, .12, .01, .12, postX, .005, z, alu, 'canopy', 'canopyPosts'); }
    // Optional walls: the back wall closes the canopy's rear, the side wall its outer side.
    const wallTop2 = (R === 'europa' ? yLow : postH) - .02;
    if (s.canopyWalls[k].back) {
      const bwid = cw - .1;
      const bwm = box(cg, bwid, wallTop2 - B, .02, (x0 + x1) / 2 - sx * .02, B + (wallTop2 - B) / 2, -depth / 2 + zc + .045, outer, 'canopy', 'canopyWall', 'canopyWall:' + k + ':back');
      bwm.material = [outer, outer, outer, outer, outer, inner];
    }
    if (s.canopyWalls[k].side) {
      const swl = depth - .2;
      const sw = box(cg, .02, wallTop2 - B, swl, postX - sx * .05, B + (wallTop2 - B) / 2, zc, outer, 'canopy', 'canopyWall', 'canopyWall:' + k + ':side');
      sw.material = [outer, outer, outer, outer, outer, outer];
    }
    if (R === 'neo' && (s.canopyGlass || s.canopyFlora) && k === (s.canopy.left !== 'none' ? 'left' : 'right')) {
      // Glass panels and FloraBoards on the canopy's outer posts line.
      for (let i = 0; i < s.canopyGlass; i++) {
        const z = -depth / 2 + .4 + i * .36;
        add(cg, new THREE.PlaneGeometry(.29, 1.96), tinted, postX - sx * .04, B + 1.0, z, 'canopy', 'canopyGlass', 'glass').rotation.y = Math.PI / 2;
        for (const dz of [-.152, .152]) box(cg, .03, 2.0, .014, postX - sx * .04, B + 1.0, z + dz, smooth, 'canopy', 'canopyGlass');
        for (const dy of [0, 1.99]) box(cg, .03, .016, .318, postX - sx * .04, B + .01 + dy, z, smooth, 'canopy', 'canopyGlass');
      }
      for (let i = 0; i < s.canopyFlora; i++) planter(cg, postX - sx * .09, depth / 2 - .6 - i * .95, sx > 0 ? Math.PI / 2 : -Math.PI / 2, 'canopyFlora');
    }
  }

  // ---- Downpipes, PV rails, FloraBoards, lights, ramp ------------------------------------------------
  if (s.downpipe !== 'none' || R === 'neo' || R === 'casanova') {
    const dpg = group(root, 'downpipe');
    const rear = s.downpipe === 'rear' || (R === 'neo' || R === 'casanova') && s.downpipe !== 'front';
    const zs = rear ? -wd / 2 - .06 : wd / 2 + .06;
    const top = (R === 'europa' || R === 'panorama' || R === 'avantgarde' ? g.eaves : g.roofTop - g.fascia) - .01;
    const xs = R === 'neo' || R === 'casanova' || s.downpipe !== 'none' ? [-ww / 2 - .03, ww / 2 + .03] : [];
    const pm = R === 'casanova' || R === 'neo' ? smooth : smooth;
    for (const x of xs) {
      if (R === 'avantgarde' && !rear) continue;
      cyl(dpg, .035, .035, top - .1, x, .1 + (top - .1) / 2, zs, pm, 16, 'downpipe');
      const elbow = cyl(dpg, .035, .035, .14, x, .085, zs + (rear ? -.05 : .05), pm, 16, 'downpipe');
      elbow.rotation.x = rear ? -Math.PI / 4 : Math.PI / 4;
    }
  }
  if (s.pv) {
    // PV mounting rails across the roof.
    const pvg = group(root, 'pv');
    const y = R === 'europa' || R === 'panorama' ? g.roofTop + .03 : g.roofTop + .022;
    for (const f of [-.3, .3]) box(pvg, ww * .82, .03, .035, 0, y, f * wd, alu, 'pv');
    for (const f of [-.36, -.12, .12, .36]) box(pvg, .03, .03, wd * .7, f * ww, y + .03, 0, alu, 'pv');
  }
  function planter(parent, x, z, rotY, name) {
    const pg = group(parent, name);
    pg.position.set(x, 0, z); pg.rotation.y = rotY;
    const railMat = smooth;
    for (const dx of [-.3, .3]) box(pg, .03, 1.88, .02, dx, B + .94, .011, railMat, name);
    for (const y of [.75, 1.35]) {
      box(pg, .82, .2, .25, 0, B + y, .14, smooth, name, 'planter');
      const leaves = std(y > 1 ? '#5b7f3e' : '#6f8f45', {roughness: .9});
      for (let i = 0; i < 6; i++) add(pg, new THREE.IcosahedronGeometry(.075, 1), leaves, -.32 + i * .128, B + y + .14, .14 + (i % 2 ? .03 : -.03), name, 'plants');
    }
  }
  if (s.floraboard) {
    const free = WALL_ORDER.filter(w => w !== md.wall).concat(md.wall);
    for (let i = 0; i < s.floraboard; i++) {
      const w = free[i % free.length], L = w === 'front' || w === 'back' ? ww : wd;
      const used = elements.filter(o => o.wall === w).map(o => holeOf(s, g, o, L));
      let u = L * (i < free.length ? .25 : .7);
      for (let k = 0; k < 20 && used.some(([a, b]) => u + .45 > a && u - .45 < b); k++) u = (u + .3) % (L - .5) + .25;
      const off = .006 + .003;
      const pos = w === 'front' ? [-ww / 2 + u, wd / 2 + off, 0] : w === 'back' ? [ww / 2 - u, -wd / 2 - off, Math.PI] : w === 'left' ? [-ww / 2 - off, -wd / 2 + u, -Math.PI / 2] : [ww / 2 + off, wd / 2 - u, Math.PI / 2];
      planter(root, pos[0], pos[1], pos[2], 'floraboard');
    }
  }
  for (let i = 0; i < s.solar; i++) {
    const sg = group(root, 'solar');
    const x = -ww / 2 + .3 + i * .5;
    sg.position.set(x, B + 1.7, wd / 2 + .004);
    box(sg, .12, .16, .04, 0, 0, .02, dark, 'solar');
    box(sg, .16, .008, .12, 0, .12, .05, std('#1f3150', {roughness: .3, metalness: .4}), 'solar');
    cyl(sg, .03, .03, .004, 0, -.08, .02, std('#fff6e0', {emissive: '#ffd79a', emissiveIntensity: .35}), 16, 'solar', 'lamp');
    lights.push({kind: 'down', position: V(x, B + 1.6, wd / 2 + .1)});
  }
  if (s.ramp) {
    // Threshold access ramp: a galvanised plate from the threshold to the ground.
    const {g: wg0, L} = wallInfo[md.wall], [hx0, hx1] = holeOf(s, g, md, L);
    const rg = group(wg0, 'ramp');
    const rise = B + BASE_STRIP - .005, run = .22, len = Math.hypot(run, rise);
    const r = box(rg, hx1 - hx0, .012, len, (hx0 + hx1) / 2, BASE_STRIP - .006 - rise / 2, run / 2 + .012, galv, 'ramp');
    r.rotation.x = Math.atan2(rise, run);
  }
  function wallLen(w) { return w === 'front' || w === 'back' ? ww : wd; }

  // ---- Inside: floor, ceiling, lights and the chosen fittings -------------------------------------------
  const iw = ww - 2 * t, id = wd - 2 * t;
  if (s.foundation === 'frame' && s.floorPlate) {
    const fp = tex.aluFloor();
    box(root, iw - .004, .004, id - .004, 0, B + .001, 0, std('#ffffff', {map: fp.map, normalMap: fp.normalMap, roughness: .42, metalness: .75}), 'floor', 'floorPlate');
  } else if (s.foundation === 'none' || s.foundation === 'frame') {
    box(root, iw - .004, .004, id - .004, 0, .05 + .002 + (s.foundation === 'frame' ? .0 : 0), 0, concrete, 'floor');
  }
  if (R === 'neo' || R === 'casanova' || R === 'highline' || R === 'avantgarde') { /* ceilings come with the roof */ }
  const kit = {std, add, box, group, cyl, tag, materials: {alu, galv, stainless, dark, smooth, smoothIn, inner, outer, glass, tinted}, lights, tex};
  fitOut(root, s, {...g, iw, id, mainDoor: md, wallInfo, holeOf: (o, L) => holeOf(s, g, o, L)}, kit);

  // Every mesh carries its groups' tags too, so a part can be framed and highlighted by any of them.
  root.traverse(o => {
    if (!o.isMesh) return;
    const all = new Set(o.userData.tags || []);
    for (let p = o.parent; p && p !== root; p = p.parent) for (const tg of p.userData.tags || []) all.add(tg);
    o.userData.tags = [...all];
  });
  return {group: root, lights, materials, geom: g};
}

/** Clear door openings from Biohort's data sheets, in metres. */
export function clearWidth(s, kind) {
  if (kind === 'double') return {europa: 1.35, highline: 1.55, panorama: 1.55, neo: 1.67, casanova: 1.87}[s.range] ?? (['A1', 'A2', 'A3', 'A4'].includes(s.size) ? 1.39 : 1.545);
  return {neo: .83, casanova: .9}[s.range] ?? .76;
}

/** An element's opening in its wall's coordinates: [x0, x1, y0, y1], y from the wall base. */
export function holeOf(s, g, o, L) {
  const w = openingWidth(s, o), c = o.p * L;
  const kind = o.id === 'main' ? mainDoor(s).kind : o.kind;
  const BS = BASE_STRIP;
  if (kind === 'gate') return [c - 2.36 / 2, c + 2.36 / 2, BS, BS + 2.0 - .02];
  if (kind === 'door' || kind === 'double') {
    const cw = clearWidth(s, kind);
    return [c - cw / 2, c + cw / 2, BS, BS + g.clear - .02];
  }
  if (kind === 'window') return [c - .815 / 2 + .05, c + .815 / 2 - .05, 1.05, 1.05 + .62];
  if (kind === 'glassPanel') return [c - .14, c + .14, BS + .08, BS + 1.95];
  if (kind === 'glassElement') return [c - .45, c + .45, BS + .1, BS + 1.92];
  if (kind === 'tiltWindow') return [c - .45, c + .45, 1.19, 1.19 + .65];
  return [c - w / 2, c + w / 2, BS, BS + 1.8];
}
