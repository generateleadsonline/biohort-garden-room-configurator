// Every option must visibly change the 3D. For each option this applies the change the way the
// panel does (camera turns to the part and highlights it), draws the view, puts the old design
// back without moving the camera, draws again, and compares the two images. It also checks the
// highlight landed on the expected part. Needs the built site (BASE) and PLAYWRIGHT_CORE.
//   node tools/qa/option-sweep.mjs [filter]
import {writeFile, mkdir} from 'node:fs/promises';
import {launch, openDesigner, settled, check, failures, BASE} from './pw.mjs';
import * as C from '../../src/catalog.js';

const filter = new RegExp(process.argv[2] || '');
const cases = [];
const add = (name, from, patch, key, focus = {}) => cases.push({name, from: C.normalise(from), patch, key, focus});
for (const range of C.RANGE_ORDER) {
  const base = C.normalise({range});
  const other = C.RANGE_ORDER.find(r => r !== range);
  add(`${range}: range`, {range: other}, C.normalise({range}), 'range');
  if (range === 'avantgarde') add(`${range}: model ECO*`, base, {model: 'eco'}, 'model');
  for (const size of C.sizeOrder(range)) if (size !== base.size) add(`${range}: size ${size}`, base, {size, doorP: null}, 'size');
  for (const colour of C.RANGES[range].colours) if (colour !== base.colour) add(`${range}: colour ${colour}`, base, {colour}, 'colour');
  if (C.hasDoubleDoor(base) && !['europa', 'casanova'].includes(range)) add(`${range}: double door`, base, {door: 'double', doorP: null}, 'door');
  for (const w of C.doorWallOptions(base)) if (w !== 'front') add(`${range}: door on the ${w}`, base, {doorWall: w, doorP: null}, 'doorWall');
  add(`${range}: door position`, base, {doorP: .2}, 'doorP');
  if (range === 'panorama') add(`${range}: left hinge`, base, {hinge: 'left'}, 'hinge');
  if (range === 'casanova') {
    add(`${range}: left hinge`, base, {hinge: 'left'}, 'hinge');
    add(`${range}: double door`, base, {door: 'double', doorP: null}, 'door');
    add(`${range}: glass insert`, base, {doorGlass: true}, 'doorGlass');
    add(`${range}: sectional door`, base, {gate: 'manual', doorP: null}, 'gate');
    add(`${range}: sectional door, electric`, {...base, gate: 'manual'}, {gate: 'electric'}, 'gate');
  }
  for (const kind of C.kindsFor(base)) {
    const wall = kind === 'double' && range === 'casanova' ? 'left' : 'left';
    const o = {id: 'n1', kind, wall, p: .5, hinge: 'right'};
    const fitted = C.normalise({...base, openings: [o]}).openings;
    if (!fitted.length) { const back = C.normalise({...base, openings: [{...o, wall: 'back'}]}).openings; if (back.length) { add(`${range}: add ${kind}`, base, {openings: back}, 'opening', {id: 'n1', wall: 'back'}); continue; } }
    else add(`${range}: add ${kind}`, base, {openings: fitted}, 'opening', {id: 'n1', wall});
  }
  {
    const withDoor = C.normalise({...base, openings: [{id: 'n1', kind: C.kindsFor(base)[0], wall: 'left', p: .5}]});
    if (withDoor.openings.length) {
      add(`${range}: move an element along its wall`, withDoor, {openings: [{...withDoor.openings[0], p: .25}]}, 'opening', {id: 'n1', wall: 'left'});
      add(`${range}: remove an element`, withDoor, {openings: []}, 'wall', {wall: 'left', highlight: true});
    }
  }
  if (range === 'casanova') {
    const o = C.normalise({...base, openings: [{id: 'n1', kind: 'door', wall: 'left', p: .5, hinge: 'right'}]});
    add(`${range}: additional door left hinge`, o, {openings: [{...o.openings[0], hinge: 'left'}]}, 'opening', {id: 'n1', wall: 'left'});
    add(`${range}: additional door glass`, o, {openings: [{...o.openings[0], glass: true}]}, 'opening', {id: 'n1', wall: 'left'});
  }
  const can = C.canopyOptions(C.normalise({...base, size: C.sizeOrder(range).slice(-1)[0]}));
  const big = C.normalise({...base, size: C.sizeOrder(range).slice(-1)[0]});
  for (const side of ['left', 'right']) for (const v of can.filter(v => v !== 'none')) {
    add(`${range}: canopy ${side} ${v}`, big, {canopy: {...big.canopy, [side]: v}}, 'canopy', {side});
    if (C.hasCanopyWalls(big)) for (const which of ['back', 'side']) {
      const withC = C.normalise({...big, canopy: {...big.canopy, [side]: v}});
      add(`${range}: canopy ${side} ${v} ${which} wall`, withC, {canopyWalls: {...withC.canopyWalls, [side]: {...withC.canopyWalls[side], [which]: true}}}, 'canopyWall', {side, which});
    }
  }
  if (range === 'neo') {
    const withC = C.normalise({...big, canopy: {left: 'on', right: 'none'}});
    add(`${range}: canopy glass panel`, withC, {canopyGlass: 2}, 'canopyGlass');
    add(`${range}: canopy FloraBoard`, withC, {canopyFlora: 1}, 'canopyFlora');
  }
  for (const v of C.downpipeOptions(base)) if (v !== base.downpipe) add(`${range}: downpipe ${v}`, base, {downpipe: v}, 'downpipe');
  if (range !== 'casanova') add(`${range}: PV mounting`, base, {pv: true}, 'pv');
  if (['highline', 'avantgarde', 'panorama', 'neo'].includes(range)) add(`${range}: FloraBoard`, base, {floraboard: 1}, 'floraboard');
  if (['panorama', 'neo'].includes(range)) { add(`${range}: solar light`, base, {solar: 1}, 'solar'); add(`${range}: LED light`, base, {led: 1}, 'led'); }
  if (range === 'casanova') {
    add(`${range}: double glazed light band`, base, {skylight: true}, 'skylight');
    add(`${range}: grey white roof supports`, base, {roofSupport: true}, 'roofSupport');
    for (const w of C.WALL_ORDER) add(`${range}: external lighting ${w}`, base, {extLight: {...base.extLight, [w]: true}}, 'extLight', {wall: w});
    for (const v of ['left', 'right']) add(`${range}: sauna ${v}`, base, {sauna: v}, 'sauna');
  }
  for (const f of C.foundationOptions(base)) if (f !== 'none') add(`${range}: foundation ${f}`, base, {foundation: f}, 'foundation');
  add(`${range}: floor panels`, {...base, foundation: 'frame'}, {floorPlate: true}, 'floorPlate');
  if (C.anchorCount(base)) add(`${range}: ground anchors`, base, {anchors: true}, 'anchors');
  if (range === 'europa' || range === 'avantgarde') { const b2 = range === 'avantgarde' ? {...base, model: 'eco'} : base; add(`${range}: gas spring`, b2, {gasSpring: true}, 'gasSpring'); }
  if (['panorama', 'neo', 'casanova'].includes(range)) {
    const b2 = C.normalise(range === 'casanova' ? {...base, door: 'double'} : {...big, door: 'double', foundation: 'frame'});
    add(`${range}: threshold ramp`, b2, {ramp: true}, 'ramp');
  }
  if (range === 'neo') { add(`${range}: interior panelling`, base, {panelling: true}, 'panelling'); add(`${range}: insulation`, {...base, panelling: true}, {insulation: true}, 'insulation'); }
  for (const k of C.itemsFor(range)) { const b2 = range === 'casanova' && !C.itemFits(base, k) ? big : base; add(`${range}: ${k}`, b2, {items: {...b2.items, [k]: 1}}, 'item', {item: k}); }
  if (range !== 'casanova') for (const v of ['standard', ...(['panorama', 'neo'].includes(range) ? ['swivel'] : [])]) add(`${range}: BikeLift ${v}`, base, {bikeLift: v}, 'bikeLift');
}

const run = cases.filter(c => filter.test(c.name));
const browser = await launch('chromium', process.env.GPU ? {args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist']} : {});
const {page, errors} = await openDesigner(browser, {viewport: {width: 1100, height: 700}, query: '?qa=1&tier=' + (process.env.TIER || 'medium')});
await settled(page);
await page.evaluate(d => { window.__instantFocus = true; window.__sweepDebug = d; }, Boolean(process.env.DEBUG));
const results = [];
for (const c of run) {
  const r = await page.evaluate(async c => {
    const cfg = window.__cfg, frame = () => new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)));
    cfg.setState(c.from); await frame();
    cfg.change(c.patch, {key: c.key, focus: c.focus});
    await frame(); await new Promise(res => setTimeout(res, 60));
    const after = cfg.scene.frameBuffer();
    const dbg0 = cfg.scene._debug(), hl = dbg0.highlightTags || [], lit = (dbg0.selected || []).length;
    const view = cfg.scene.view;
    cfg.setState(c.from); await frame();
    const before = cfg.scene.frameBuffer();
    // Every pixel of the drawing buffer: a pixel counts when its colour moved by more than 30.
    let changed = 0;
    for (let i = 0; i < after.length; i += 4) if (Math.abs(after[i] - before[i]) + Math.abs(after[i + 1] - before[i + 1]) + Math.abs(after[i + 2] - before[i + 2]) > 30) changed++;
    const dbg = window.__sweepDebug ? {cam: cfg.scene._debug().camera.position.toArray().map(v => +v.toFixed(2)), err: cfg.scene._debug().lastError} : null;
    return {changed, total: after.length / 4, hl, lit, view, lost: cfg.scene.quality().lost, dbg};
  }, c);
  const pct = r.changed / r.total * 100;
  // The highlight must land on real parts whenever the change names some.
  const hlOk = !r.hl.length || r.lit > 0;
  check(r.changed >= 25 && hlOk, `${c.name}`, `${r.changed} of ${r.total} pixels changed (${pct.toFixed(2)}%), ${r.view} view, highlight [${r.hl.join(', ')}] on ${r.lit} parts${r.dbg && r.changed < 25 ? ' ' + JSON.stringify(r.dbg) : ''}`);
  results.push({...c, from: undefined, ...r});
}
check(!errors.length, 'no page errors during the sweep', errors.slice(0, 3).join(' | '));
await mkdir('qa', {recursive: true});
await writeFile('qa/option-sweep.json', JSON.stringify({base: BASE, at: new Date().toISOString(), cases: results.map(({name, changed, total, hl, view}) => ({name, changed, total, highlight: hl, view}))}, null, 1));
console.log(`${run.length} options checked, ${failures()} failed`);
await browser.close();
process.exit(failures() ? 1 : 0);
