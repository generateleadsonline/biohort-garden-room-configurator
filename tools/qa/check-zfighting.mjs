// Renders a matrix of designs (every range and every published size, double doors, canopies with
// their walls, every wall element, foundation, roof extra and inside fitting)
// in headless Chrome with real WebGL, and fails if two visible faces share a plane and overlap:
// the z-fighting that shows as flicker and blotches on real GPUs. From the SMART configurator.
//   node tools/qa/check-zfighting.mjs        (needs Google Chrome; several minutes)
import {build} from 'esbuild';
import {createServer} from 'node:http';
import {readFile, mkdtemp, writeFile, rm, mkdir} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as C from '../../src/catalog.js';

const run = promisify(execFile);
const BASE = (process.env.BASE || '').replace(/\/$/, '');
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const tmp = await mkdtemp(path.join(process.env.SHOT_TMP || os.tmpdir(), 'bh-zfight-'));
const designs = [];
const add = (name, design) => designs.push([name, C.encodeDesign(design)]);
const allItems = range => Object.fromEntries(C.itemsFor(range).map(k => [k, Math.min(2, C.ITEMS[k].max)]));
for (const range of C.RANGE_ORDER) {
  for (const size of C.sizeOrder(range)) {
    add(`${range} ${size}`, {range, size});
    const d = C.normalise({range, size, door: 'double'});
    if (d.door === 'double' && !['europa', 'casanova'].includes(range)) add(`${range} ${size} double door`, d);
  }
  const big = C.sizeOrder(range).slice(-1)[0], small = C.sizeOrder(range)[0];
  const can = C.canopyOptions(C.normalise({range, size: big}));
  if (can.length) for (const v of can.filter(v => v !== 'none')) add(`${range} ${big} canopies ${v} both sides with walls`, {range, size: big, canopy: {left: v, right: v}, canopyWalls: {left: {back: true, side: true}, right: {back: true, side: true}}, canopyGlass: 3, canopyFlora: 2});
  const kinds = C.kindsFor(C.normalise({range, size: big}));
  add(`${range} ${big} every wall element`, {range, size: big, openings: kinds.flatMap((k, i) => [{kind: k, wall: ['left', 'right', 'back'][i % 3], p: .3}, {kind: k, wall: ['right', 'back', 'left'][i % 3], p: .75}])});
  for (const f of C.foundationOptions(C.normalise({range}))) add(`${range} foundation ${f}`, {range, foundation: f, floorPlate: true, anchors: true});
  add(`${range} ${big} every fitting inside`, {range, size: big, items: allItems(range), bikeLift: 'standard', led: 2, panelling: true, insulation: true});
  add(`${range} ${small} every fitting inside`, {range, size: small, items: allItems(range), bikeLift: 'standard', led: 1});
  add(`${range} roof extras and downpipes`, {range, downpipe: C.downpipeOptions(C.normalise({range})).slice(-1)[0], pv: true, floraboard: 3, solar: 2, ramp: true, door: 'double', foundation: 'frame', gasSpring: true});
  for (const w of ['left', 'right', 'back']) if (C.doorWallOptions(C.normalise({range, size: big})).includes(w)) add(`${range} ${big} door on the ${w}`, {range, size: big, doorWall: w});
}
add('avantgarde ECO* double door', {range: 'avantgarde', model: 'eco', size: 'A8', door: 'double', gasSpring: true});
add('casanova sectional door, electric, ramp', {range: 'casanova', size: '4x6', gate: 'electric', ramp: true});
add('casanova double door left hinge, glass, sauna, light band, roof supports, spotlights', {range: 'casanova', size: '4x6', door: 'double', hinge: 'left', doorGlass: true, sauna: 'left', skylight: true, roofSupport: true, extLight: {front: true, left: true, right: true, back: true}, openings: [{kind: 'glassElement', wall: 'front', p: .15}, {kind: 'tiltWindow', wall: 'right', p: .3, hinge: 'left'}, {kind: 'door', wall: 'back', p: .5, glass: true}]});

// ONLY=<text> re-checks just the designs whose name contains it (the JSON report is then not written).
if (process.env.ONLY) designs.splice(0, designs.length, ...designs.filter(([name]) => name.includes(process.env.ONLY)));

try {
  await build({entryPoints: [path.join(repo, 'tools/qa/harness.js')], outfile: path.join(tmp, 'harness.js'), bundle: true, format: 'esm', logLevel: 'silent'});
  await writeFile(path.join(tmp, 'index.html'), '<!doctype html><meta charset="utf-8"><style>html,body{margin:0;height:100%}#scene{position:absolute;inset:0}</style><div id="scene"></div><script type="module" src="harness.js"></script>');
  const server = createServer(async (req, res) => {
    const file = path.join(tmp, new URL(req.url, 'http://x').pathname.replace(/\/$/, '/index.html'));
    try { const body = await readFile(file); res.writeHead(200, {'Content-Type': file.endsWith('.js') ? 'text/javascript' : 'text/html'}); res.end(body); }
    catch { res.writeHead(404); res.end(); }
  }).listen(0, '127.0.0.1');
  await new Promise(r => server.on('listening', r));
  const port = server.address().port;
  let failures = 0;
  const results = [];
  for (let i = 0; i < designs.length; i += 3) {
    await Promise.all(designs.slice(i, i + 3).map(async ([name, code]) => {
      try {
        // BASE set: the deployed designer itself (?qa=1 exposes the scene); otherwise the harness.
        const url = BASE ? `${BASE}/configurator/?qa=1&tier=low#d=${code}` : `http://127.0.0.1:${port}/?tier=low#d=${code}`;
        const wait = BASE ? 'window.__cfg && window.__cfg.boot.verified' : 'window.__ready';
        const {stdout} = await run('node', [path.join(repo, 'tools/qa/shot.mjs'), url, '320', '240', '-', '--wait', wait, '--settle', '400', '--eval', path.join(repo, 'tools/qa/zfight.js'), '--timeout', '600000'], {env: {...process.env, SHOT_TMP: process.env.SHOT_TMP || tmp}, maxBuffer: 1e8});
        const visible = JSON.parse(stdout.slice(stdout.indexOf('['), stdout.lastIndexOf(']') + 1)).filter(f => f.visible);
        if (visible.length) failures++;
        results.push({name, code, visible});
        console.log(`${visible.length ? 'FAIL' : 'ok  '} ${name}${visible.map(f => `\n     ${f.pair} normal ${f.normal} near ${f.at}`).join('')}`);
      } catch (e) { failures++; console.log(`FAIL ${name}: could not render (${String(e.message || e).slice(0, 120)})`); results.push({name, code, error: true}); }
    }));
  }
  server.close();
  await mkdir(path.join(repo, 'qa'), {recursive: true});
  if (!process.env.ONLY) await writeFile(path.join(repo, BASE ? 'qa/zfighting-live.json' : 'qa/zfighting.json'), JSON.stringify({base: BASE || 'harness', at: new Date().toISOString(), designs: results}, null, 1));
  if (failures) { console.error(`${failures} design(s) with z-fighting`); process.exitCode = 1; }
  else console.log(`No visible z-fighting in ${designs.length} designs.`);
} finally { await rm(tmp, {recursive: true, force: true}); }
