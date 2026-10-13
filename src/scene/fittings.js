// Inside a Biohort building: the storage it comes with and every fitting the design adds, each where
// Biohort's photographs and configurator put it. Support rails stand in bays of 72cm on the back
// wall and carry the shelves, shelf baskets, hooks and the folding table; bikes go on a side wall;
// tool holders and door baskets on the inside of the door; the mounting panel beside the door.
// Inside coordinates: `u` runs along a wall from left to right as you face it from inside, centred.
import * as THREE from 'three';
import {includedOf, WALL_ORDER} from '../catalog.js';

const BAY = .76; // a 72cm shelf between two rails

export function fitOut(root, s, room, kit) {
  const {box, cyl, group, add, std, materials: M, lights} = kit;
  const {ww, wd, t, floorY} = room;
  const iw = ww - 2 * t, id = wd - 2 * t;
  const inside = group(root, 'inside');
  const metal = s.range === 'neo' ? std('#e9e8e3', {roughness: .5, metalness: .2}) : M.galv;
  const inc = includedOf(s);
  const n = k => (inc[k] || 0) + (s.items[k] || 0);

  // ---- Free space on each wall, inside, as [u0, u1] intervals -------------------------------------
  const L = side => (side === 'front' || side === 'back' ? iw : id);
  const blocked = Object.fromEntries(WALL_ORDER.map(w => [w, []]));
  for (const o of [room.mainDoor, ...s.openings]) {
    const Lw = o.wall === 'front' || o.wall === 'back' ? ww : wd;
    const [x0, x1] = room.holeOf(o, Lw);
    blocked[o.wall].push([Lw / 2 - x1 - .1, Lw / 2 - x0 + .1]);
  }
  if (s.sauna !== 'none') blocked[s.sauna === 'left' ? 'left' : 'right'].push([-id / 2, -id / 2 + 2.1]);
  const used = Object.fromEntries(WALL_ORDER.map(w => [w, []]));
  /** Finds room for `w` metres on a wall, from the preferred end; marks it used. */
  function claim(side, w, fromRight = false) {
    const lim = L(side) / 2 - .04;
    for (let k = 0; k <= 200; k++) {
      const c = fromRight ? lim - w / 2 - k * .02 : -lim + w / 2 + k * .02;
      if (c - w / 2 < -lim - 1e-6 || c + w / 2 > lim + 1e-6) break;
      if (blocked[side].concat(used[side]).every(([a, b]) => c + w / 2 <= a || c - w / 2 >= b)) { used[side].push([c - w / 2, c + w / 2]); return c; }
    }
    return null;
  }
  const order = (...pref) => pref.concat(WALL_ORDER.filter(w => !pref.includes(w)));
  function claimAny(sides, w, fromRight = false) { for (const side of sides) { const c = claim(side, w, fromRight); if (c !== null) return {side, u: c}; } return null; }
  /** A group flat against a wall's inside face, local +z into the room, local x along the wall. */
  function onWall(side, u, y, out = 0, ...tags) {
    const gr = group(inside, ...tags);
    if (side === 'back') { gr.position.set(u, y, -wd / 2 + t + out); gr.rotation.y = 0; }
    if (side === 'front') { gr.position.set(-u, y, wd / 2 - t - out); gr.rotation.y = Math.PI; }
    if (side === 'left') { gr.position.set(-ww / 2 + t + out, y, -u); gr.rotation.y = Math.PI / 2; }
    if (side === 'right') { gr.position.set(ww / 2 - t - out, y, u); gr.rotation.y = -Math.PI / 2; }
    return gr;
  }

  // ---- Panelling and insulation (Neo) -----------------------------------------------------------------
  let lining = 0;
  if (s.range === 'neo' && s.panelling) {
    const ins = s.insulation ? .03 : 0;
    lining = .012 + ins;
    const ply = kit.tex.plywood();
    const pm = std('#ffffff', {map: ply.map, roughness: .65});
    const foam = std('#d9d4b8', {roughness: .95});
    for (const side of WALL_ORDER) {
      const Lw = L(side), h = room.top - floorY - .01;
      const pg = onWall(side, 0, floorY + h / 2, ins + .006, 'panelling');
      const segs = [];
      let a = -Lw / 2 + .002;
      for (const [b0, b1] of blocked[side].slice().sort((p, q) => p[0] - q[0])) { if (b0 > a) segs.push([a, Math.min(b0 + .1, Lw / 2 - .002)]); a = Math.max(a, b1 - .1); }
      if (a < Lw / 2 - .002) segs.push([a, Lw / 2 - .002]);
      for (const [p0, p1] of segs) if (p1 - p0 > .05) {
        box(pg, p1 - p0, h, .012, (p0 + p1) / 2, 0, 0, pm, 'panelling');
        if (ins) box(pg, p1 - p0 - .004, h - .004, ins - .002, (p0 + p1) / 2, 0, -ins / 2 - .005, foam, 'panelling', 'insulation');
        // Insulation shows at the board edges: a foam strip where the panelling stops at a door.
        if (ins) for (const x of [p0, p1]) if (Math.abs(x) < Lw / 2 - .01) box(pg, .004, h - .004, ins + .012, x + (x === p0 ? .002 : -.002), 0, -ins / 2, foam, 'insulation');
      }
    }
  }
  const wallOut = lining;

  // ---- Support rails, shelves and what hangs on them ----------------------------------------------------
  const rails = n('rails');
  const shelves = 2 * (n('shelves') + n('cornerShelves')), deep = 2 * (n('deepShelves') + n('cornerDeepShelves'));
  const bays = Math.max(rails, (shelves + deep) ? 1 : 0, s.items.shelfBaskets || s.items.hookSet || s.items.table ? 1 : 0);
  const bayAt = [];
  for (let i = 0; i < bays; i++) {
    const spot = claimAny(order('back', i % 2 ? 'right' : 'left', 'left', 'right'), BAY, i % 2 === 1);
    if (!spot) break;
    bayAt.push(spot);
    const rg = onWall(spot.side, spot.u, 0, wallOut, 'rails');
    for (const dx of [-BAY / 2 + .015, BAY / 2 - .015]) box(rg, .03, 1.85, .025, dx, floorY + .95, .013, metal, 'rails');
  }
  // Shelves fill bays from the bottom up, deep ones low; at most five per bay.
  const slots = bayAt.map(() => []);
  let k = 0;
  const shelfList = [...Array(deep).fill('deep'), ...Array(shelves).fill('std')];
  for (const kind of shelfList) {
    const b = k % Math.max(1, bayAt.length); k++;
    if (!bayAt.length || slots[b].length >= 5) continue;
    slots[b].push(kind);
  }
  slots.forEach((list, b) => {
    const spot = bayAt[b];
    list.forEach((kind, i) => {
      const d = kind === 'deep' ? .435 : .245, y = floorY + .35 + i * .34;
      const sg = onWall(spot.side, spot.u, y, wallOut, 'shelves', kind === 'deep' ? 'shelves:deep' : 'shelves:std');
      box(sg, BAY - .05, .012, d, 0, 0, d / 2 + .028, metal, 'shelves');
      box(sg, BAY - .05, .035, .01, 0, .012, d + .028, metal, 'shelves');
      // Something on each shelf, so they read as shelves from the doorway.
      const pots = std(i % 2 ? '#b8643e' : '#4f6f8f', {roughness: .8});
      box(sg, .16, .14, .14, -BAY / 4, .077, d / 2 + .03, pots, 'shelves');
      box(sg, .12, .2, .1, BAY / 6, .105, d / 2 + .02, std('#d5a24a', {roughness: .7}), 'shelves');
    });
  });
  // Shelf baskets hang on the rails, below any shelves.
  for (let i = 0; i < 2 * (s.items.shelfBaskets || 0); i++) {
    const spot = bayAt[i % Math.max(1, bayAt.length)] || claimAny(order('back'), BAY);
    if (!spot) break;
    const bg = onWall(spot.side, spot.u + (i % 2 ? .18 : -.18), floorY + 1.55 - Math.floor(i / 2) * .3, wallOut, 'shelfBaskets');
    wireBasket(bg, .32, .18, .22, metal, 'shelfBaskets');
  }
  // Hook sets: combination, handle and shovel hooks on the rails.
  for (let i = 0; i < (s.items.hookSet || 0) + (s.items.cornerHookSet || 0); i++) {
    const spot = bayAt[(i + 1) % Math.max(1, bayAt.length)] || claimAny(order('right', 'left'), .4);
    if (!spot) break;
    const hg = onWall(spot.side, spot.u, floorY + 1.25 + (i % 2) * .2, wallOut, 'hooks');
    for (const dx of [-.22, 0, .22]) hook(hg, dx, metal, 'hooks');
    tool(hg, -.22, 'spade');
  }
  if (s.items.table) {
    const spot = bayAt[0] || claimAny(order('back', 'right'), BAY);
    if (spot) {
      const tg = onWall(spot.side, spot.u, floorY + .9, wallOut + .002, 'table');
      box(tg, .96, .025, .575, 0, 0, .3, std('#d9d2c1', {roughness: .6}), 'table');
      box(tg, .9, .02, .02, 0, -.02, .58, metal, 'table');
      for (const dx of [-.42, .42]) { const br = box(tg, .02, .02, .5, dx, -.2, .25, metal, 'table'); br.rotation.x = .75; }
    }
  }

  // ---- Tool hangers, the mounting panel, the bin bag holder ---------------------------------------------
  const hangers = n('toolHangers') * (s.range === 'neo' ? 2 : 4);
  if (hangers) {
    const spot = claimAny(order('right', 'left', 'back'), Math.min(1.6, hangers * .14 + .1), true);
    if (spot) {
      const hg = onWall(spot.side, spot.u, floorY + 1.45, wallOut, 'toolHangers');
      for (let i = 0; i < hangers; i++) {
        const dx = -(hangers - 1) * .07 + i * .14;
        box(hg, .03, .1, .03, dx, 0, .02, metal, 'toolHangers');
        box(hg, .03, .02, .09, dx, -.05, .06, metal, 'toolHangers');
        if (i % 2 === 0) tool(hg, dx, i % 4 === 0 ? 'rake' : 'broom');
      }
    }
  }
  for (const [key, coated] of [['mountPanel', false], ['mountPanelCoated', true]]) for (let i = 0; i < (s.items[key] || 0); i++) {
    const spot = claimAny(order(room.mainDoor.wall, 'right', 'left'), .4);
    if (!spot) break;
    const pg = onWall(spot.side, spot.u, floorY + 1.05, wallOut, 'mountPanel');
    box(pg, .36, 2.0, .05, 0, 0, .025, coated ? std('#efeeea', {roughness: .5}) : metal, 'mountPanel');
    box(pg, .16, .09, .045, 0, .2, .07, std('#f4f4f2', {roughness: .4}), 'mountPanel', 'socket');
    box(pg, .09, .09, .045, 0, .45, .07, std('#f4f4f2', {roughness: .4}), 'mountPanel', 'socket');
  }
  if (s.items.binBag) {
    const spot = claimAny(order(room.mainDoor.wall === 'front' ? 'front' : 'back', 'right', 'left'), .5);
    if (spot) {
      const bg = onWall(spot.side, spot.u, floorY, wallOut, 'binBag');
      box(bg, .4, .02, .3, 0, .75, .17, metal, 'binBag');
      add(bg, new THREE.CylinderGeometry(.19, .16, .72, 18), std('#2b2d2e', {roughness: .9}), 0, .38, .17, 'binBag');
    }
  }
  if (s.items.suspension) for (let i = 0; i < s.items.suspension; i++) {
    const spot = claimAny(order('right', 'left', 'back'), .3);
    if (!spot) break;
    const sg = onWall(spot.side, spot.u, floorY + 1.4, wallOut, 'suspension');
    box(sg, .26, .02, .03, 0, .15, .015, metal, 'suspension');
    add(sg, new THREE.CylinderGeometry(.13, .1, .32, 14, 1, true), std('#4a5a63', {roughness: .9, side: THREE.DoubleSide}), 0, -.02, .14, 'suspension');
  }

  // ---- Bikes: BikeMax hangers, the BikeHolder rack and the BikeLift ---------------------------------------
  const bikeMax = s.items.bikeMax || 0;
  for (let i = 0; i < bikeMax; i++) {
    const spot = claimAny(order('left', 'right', 'back'), .32);
    if (!spot) break;
    const bg = onWall(spot.side, spot.u, floorY, wallOut, 'bikes', 'bikeMax');
    box(bg, .06, 2.06 - .2, .03, 0, 1.0, .015, metal, 'bikes');
    box(bg, .05, .05, .2, 0, 1.85, .1, metal, 'bikes');
    bike(bg, 0, .05, .4, 'vertical', i);
  }
  if (s.items.bikeHolder) {
    const count = s.range === 'neo' ? 2 : 3;
    const spot = claimAny(order('left', 'right', 'back'), count * .35 + .1);
    if (spot) {
      const bg = onWall(spot.side, spot.u, floorY, wallOut, 'bikes', 'bikeHolder');
      box(bg, count * .35, .03, .3, 0, .015, .2, metal, 'bikes');
      for (let i = 0; i < count; i++) {
        const dx = -(count - 1) * .175 + i * .35;
        box(bg, .06, .35, .03, dx, .19, .2, metal, 'bikes');
        if (i < 2) bike(bg, dx, 0, 1.0, 'upright', i);
      }
    }
  }
  if (s.bikeLift !== 'none') {
    const spot = claimAny(order('left', 'right', 'back'), .5, true);
    if (spot) {
      const lg = onWall(spot.side, spot.u, floorY, wallOut, 'bikes', 'bikeLift');
      box(lg, .17, 1.85, .43, 0, .95, .2, s.range === 'neo' ? std('#e9e8e3', {roughness: .5}) : std('#55585a', {roughness: .5, metalness: .4}), 'bikes', 'bikeLift');
      box(lg, .5, .04, .6, 0, 1.55, .5, metal, 'bikes', 'bikeLift');
      bike(lg, 0, 1.18, .55, 'side', 0);
    }
  }

  // ---- On the door: tool holders and door baskets ---------------------------------------------------------
  const doorSide = room.mainDoor.wall, dL = doorSide === 'front' || doorSide === 'back' ? ww : wd;
  const [dx0, dx1] = room.holeOf(room.mainDoor, dL);
  const doorU = dL / 2 - (dx0 + dx1) / 2, doorW = dx1 - dx0;
  const holders = 2 * n('toolHolders'), baskets = 2 * (s.items.doorBaskets || 0);
  if (holders || baskets) {
    const dg = onWall(doorSide, doorU, floorY, .035, 'doorFittings');
    for (let i = 0; i < holders; i++) {
      const y = .55 + i * .28, dx = (i % 2 ? 1 : -1) * Math.min(.18, doorW / 5);
      box(dg, .3, .05, .06, dx, y, .03, metal, 'toolHolders');
      tool(dg, dx, 'trowel', y);
    }
    for (let i = 0; i < baskets; i++) {
      const bgr = group(dg, 'doorBaskets');
      bgr.position.set((i % 2 ? 1 : -1) * Math.min(.16, doorW / 5), 1.25 + Math.floor(i / 2) * .3, .02);
      wireBasket(bgr, .32, .15, .12, metal, 'doorBaskets');
    }
  }

  // ---- Lights ------------------------------------------------------------------------------------------------
  const lamp = std('#fff6e0', {emissive: '#ffd79a', emissiveIntensity: .35, roughness: .3});
  for (let i = 0; i < s.led; i++) {
    const x = (i - (s.led - 1) / 2) * Math.min(1, iw / 2), y = room.ceil - .03;
    box(inside, .3, .04, .08, x, y, 0, std('#f2f2ef', {roughness: .4}), 'led');
    box(inside, .26, .006, .05, x, y - .023, 0, lamp, 'led', 'lamp');
    lights.push({kind: 'interior', position: new THREE.Vector3(x, y - .1, 0), power: 1});
  }

  // ---- CasaNova sauna module ---------------------------------------------------------------------------------
  if (s.sauna !== 'none') {
    const side = s.sauna === 'left' ? -1 : 1;
    const sg = group(inside, 'sauna');
    const sw = 2.0, sd = 2.0, sh = 2.08;
    sg.position.set(side * (iw / 2 - sw / 2 - .02), floorY, -id / 2 + sd / 2 + .02);
    const spruce = std('#d7b98a', {roughness: .75});
    const ply = kit.tex.plywood();
    spruce.map = ply.map;
    box(sg, sw, sh, .05, 0, sh / 2, sd / 2 - .025, spruce, 'sauna');
    box(sg, .05, sh, sd - .1, -side * (sw / 2 - .025), sh / 2, 0, spruce, 'sauna');
    box(sg, sw - .02, .04, sd - .02, 0, sh - .02, 0, spruce, 'sauna');
    // Its glazed door, hinged as chosen.
    add(sg, new THREE.PlaneGeometry(.6, 1.8), M.glass, side * -.3, .95, sd / 2 + .002, 'sauna', 'glass').renderOrder = 2;
    box(sg, .64, 1.84, .02, side * -.3, .95, sd / 2 - .01, std('#b98f58', {roughness: .7}), 'sauna');
    box(sg, 1.8, .05, .5, 0, .45, -sd / 2 + .3, spruce, 'sauna');
    box(sg, 1.8, .05, .5, 0, .9, -sd / 2 + .3, spruce, 'sauna');
    box(sg, .4, .5, .3, side * (sw / 2 - .3), .35, sd / 2 - .3, std('#3b3d3f', {roughness: .5}), 'sauna');
  }

  // ---- Helpers ---------------------------------------------------------------------------------------------
  function wireBasket(gr, w, h, d, mat, tagName) {
    box(gr, w, .006, d, 0, -h / 2, d / 2 + .01, mat, tagName);
    for (const x of [-w / 2, w / 2]) box(gr, .006, h, d, x, 0, d / 2 + .01, mat, tagName);
    box(gr, w, h, .006, 0, 0, d + .01, mat, tagName);
    for (let i = 1; i < 6; i++) box(gr, .003, h, .003, -w / 2 + w * i / 6, 0, d + .014, mat, tagName);
  }
  function hook(gr, dx, mat, tagName) {
    box(gr, .025, .06, .025, dx, 0, .015, mat, tagName);
    const c = add(gr, new THREE.TorusGeometry(.05, .007, 6, 12, Math.PI), mat, dx, -.03, .06, tagName);
    c.rotation.y = Math.PI / 2;
  }
  function tool(gr, dx, kind, y = 0) {
    const wood = std('#a4794b', {roughness: .8}), head = std('#5c6266', {roughness: .5, metalness: .5});
    if (kind === 'trowel') { box(gr, .025, .14, .025, dx, y + .08, .05, wood, 'tools'); box(gr, .08, .1, .006, dx, y - .02, .05, head, 'tools'); return; }
    const len = kind === 'spade' ? .95 : 1.3;
    cyl(gr, .014, .014, len, dx, -len / 2 + .05, .07, wood, 8, 'tools');
    if (kind === 'rake') box(gr, .3, .03, .04, dx, -len + .05, .07, head, 'tools');
    else if (kind === 'broom') box(gr, .3, .07, .06, dx, -len + .05, .07, std('#3b3b3b', {roughness: .9}), 'tools');
    else box(gr, .18, .26, .02, dx, -len - .05, .07, head, 'tools');
  }
  // A simple bicycle: wheels, frame, bars and saddle. `mode` hangs it by its front wheel, stands it
  // upright in a rack, or lays it on the BikeLift's arms.
  function bike(gr, x, y, z, mode, i) {
    const bg = group(gr, 'bikes', 'bike');
    const tyre = std('#1f2021', {roughness: .9}), frame = std(['#2f6db0', '#b03a2e', '#2f2f31'][i % 3], {roughness: .4, metalness: .3});
    const wheel = (wx, wy) => { const w = add(bg, new THREE.TorusGeometry(.33, .02, 8, 28), tyre, wx, wy, 0, 'bikes'); w.rotation.y = 0; cyl(bg, .02, .02, .06, wx, wy, 0, M.stainless, 8, 'bikes').rotation.x = Math.PI / 2; };
    wheel(-.52, .35); wheel(.52, .35);
    const tube = (x0, y0, x1, y1, r = .016) => { const l = Math.hypot(x1 - x0, y1 - y0); const m = cyl(bg, r, r, l, (x0 + x1) / 2, (y0 + y1) / 2, 0, frame, 8, 'bikes'); m.rotation.z = Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2; };
    tube(-.52, .35, -.05, .35); tube(-.05, .35, -.18, .78); tube(-.18, .78, .38, .78); tube(-.05, .35, .38, .78); tube(.38, .78, .52, .35); tube(-.52, .35, -.18, .78);
    box(bg, .22, .04, .08, -.2, .83, 0, tyre, 'bikes');
    box(bg, .04, .04, .5, .4, .92, 0, tyre, 'bikes');
    if (mode === 'vertical') { bg.rotation.z = Math.PI / 2; bg.rotation.y = Math.PI / 2; bg.position.set(x, y + .95, z); }
    else if (mode === 'upright') { bg.rotation.y = Math.PI / 2; bg.position.set(x, y, z - .35); }
    else { bg.rotation.y = 0; bg.position.set(x, y, z); bg.scale.set(.9, .9, .9); }
  }
}
