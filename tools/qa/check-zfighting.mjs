// Renders a matrix of designs (every range and every published size, the smallest and largest
// rooms, each cladding and coverage, overhangs, extensions, decks and every door and window type)
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
const base = C.normalise({});
const designs = [];
const add = (name, patch) => designs.push([name, C.encodeDesign({...base, ...patch})]);
for (const range of C.RANGE_ORDER) for (const [w, d] of C.PUBLISHED_SIZES) if (!(range === 'clifton' && w === 2.9 && d === 2.1)) add(`${range} ${w}x${d}`, {range, width: w, depth: d});
add('ashton smallest 2.9x2.1 front only', {range: 'ashton', width: 2.9, depth: 2.1, cladding: 'thermowood', coverage: 'front', openings: [{wall: 'front', type: 'single', p: .35}, {wall: 'front', type: 'openS', p: .8}]});
add('clifton widest 10.7x2.8', {width: 10.7, depth: 2.8, openings: [{wall: 'front', type: 'slide4l', p: .3}, {wall: 'front', type: 'bifold4', p: .72}]});
add('clifton deepest 2.9x9.6', {width: 2.9, depth: 9.6, openings: [{wall: 'front', type: 'single', p: .5}, {wall: 'left', type: 'openTallM', p: .3}, {wall: 'right', type: 'fixedTallM', p: .7}]});
for (const cl of C.CLADDING_ORDER) add(`cladding ${cl} all sides`, {cladding: cl, colour: C.CLADDINGS[cl].colours[0].id, coverage: 'all', direction: C.CLADDINGS[cl].direction});
for (const cov of Object.keys(C.COVERAGE)) add(`ashton lap coverage ${cov}`, {range: 'ashton', cladding: 'lap', colour: 'c76', direction: 'horizontal', coverage: cov});
add('vl vertical black', {range: 'ashton', cladding: 'vl', colour: 'c50', direction: 'vertical', frame: 'black'});
add('clifton 300 overhang, both 300 extensions', {overhang: .3, extensions: {left: .3, right: .3}});
add('clifton 600 overhang, 600 extensions, all side overhangs', {overhangSides: {left: true, right: true, back: true}, extensions: {left: .6, right: .6}});
add('clifton decks all sides with extensions and sedum', {deck: {front: 2, left: 1, right: 1, back: 1.2}, extensions: {left: .6, right: .3}, extras: {...base.extras, sedum: true, aircon: true}});
add('ashton decks and every upgrade', {range: 'ashton', deck: {front: 1.5, left: .6, right: 0, back: .8}, deckColour: 'black', electrics: 'premium', extras: {aircon: true, sedum: true, extSocket: true, data: true, usb: true, speakers: true, security: true}});
add('every door type', {width: 10.7, depth: 2.8, openings: [{wall: 'front', type: 'french', p: .1}, {wall: 'front', type: 'frenchSide', p: .32}, {wall: 'front', type: 'slide2l', p: .6}, {wall: 'front', type: 'single', p: .88}, {wall: 'back', type: 'bifold3l', p: .25}, {wall: 'back', type: 'slide4m', p: .7}]});
add('every window type', {width: 9.6, depth: 3.4, openings: [{wall: 'front', type: 'fixedS', p: .05}, {wall: 'front', type: 'fixedM', p: .17}, {wall: 'front', type: 'fixedTallS', p: .3}, {wall: 'front', type: 'fixedTallM', p: .42}, {wall: 'front', type: 'openS', p: .55}, {wall: 'front', type: 'openM', p: .67}, {wall: 'front', type: 'openHigh', p: .8}, {wall: 'front', type: 'openTallS', p: .91}, {wall: 'back', type: 'openTallM', p: .5}, {wall: 'left', type: 'bifold3', material: 'alu', p: .5}]});
add('aluminium everything', {openings: [{wall: 'front', type: 'french', material: 'alu', p: .3}, {wall: 'front', type: 'openM', material: 'alu', p: .75}, {wall: 'right', type: 'fixedTallM', material: 'alu', p: .5}]});
for (const u of Object.keys(C.USES)) add(`use ${u}`, {use: u});

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
  await writeFile(path.join(repo, BASE ? 'qa/zfighting-live.json' : 'qa/zfighting.json'), JSON.stringify({base: BASE || 'harness', at: new Date().toISOString(), designs: results}, null, 1));
  if (failures) { console.error(`${failures} design(s) with z-fighting`); process.exitCode = 1; }
  else console.log(`No visible z-fighting in ${designs.length} designs.`);
} finally { await rm(tmp, {recursive: true, force: true}); }
