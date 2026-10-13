// The reviewed example PDF for the Configurators sheet: built from the local build (which
// verify-live.mjs proves is byte-identical to the live site) at the desktop tier, with its links
// pointing at the live site, so no live enquiry is ever submitted.
//   BASE=http://127.0.0.1:47391 node tools/qa/example-pdf.mjs docs/examples/<name>.pdf
import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import {launch, openDesigner, settled} from './pw.mjs';
import * as C from '../../src/catalog.js';
const out = process.argv[2] || 'docs/examples/biohort-reviewed-example.pdf';
const LIVE = 'https://biohort-garden-room-configurator.netlify.app';
// A full HighLine H5: double door, a window and an extra door, an L canopy with both walls,
// downpipes, floor frame and panels, storage, bikes and the BikeLift.
const design = C.normalise(process.env.DESIGN ? JSON.parse(process.env.DESIGN) : {range: 'highline', size: 'H5', colour: 'quartz', door: 'double',
  openings: [{id: 'w1', kind: 'window', wall: 'left', p: .35}, {id: 'd2', kind: 'door', wall: 'back', p: .5}],
  canopy: {left: 'none', right: 'L'}, canopyWalls: {left: {back: false, side: false}, right: {back: true, side: false}}, downpipe: 'front',
  foundation: 'frame', floorPlate: true, floraboard: 1, items: {shelves: 1, deepShelves: 1, rails: 1, hookSet: 1, table: 1, bikeMax: 2, doorBaskets: 1}});
await mkdir(path.dirname(out), {recursive: true});
const browser = await launch('chromium', process.env.GPU ? {args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist']} : {});
const {page, errors} = await openDesigner(browser, {viewport: {width: 1440, height: 900}, query: `?qa=1&tier=high&pdforigin=${encodeURIComponent(LIVE)}`, hash: '#d=' + C.encodeDesign(design)});
await settled(page);
await page.evaluate(() => window.__cfg.selectStep(7, {focusHeading: false}));
const download = page.waitForEvent('download', {timeout: 900000});
await page.evaluate(() => window.__cfg.makePDF());
const d = await download;
await d.saveAs(out);
console.log('saved', out, d.suggestedFilename(), 'errors:', errors.slice(0, 3));
await browser.close();
