// The reviewed example PDF for the Configurators sheet: built from the local build (which
// verify-live.mjs proves is byte-identical to the live site) at the desktop tier, with its links
// pointing at the live site, so no live enquiry is ever submitted.
//   BASE=http://127.0.0.1:47391 node tools/qa/example-pdf.mjs docs/examples/<name>.pdf
import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import {launch, openDesigner, settled} from './pw.mjs';
import * as C from '../../src/catalog.js';
const out = process.argv[2] || 'docs/examples/my-retreat-garden-rooms-reviewed-example.pdf';
const LIVE = 'https://my-retreat-garden-configurator.netlify.app';
const design = C.normalise({range: 'clifton', use: 'office', width: 5.8, depth: 4, cladding: 'cedar', coverage: 'front-left', metal: 'anthracite', frame: 'anthracite', overhang: .6, extensions: {left: 0, right: .6}, deck: {front: 1.2}, deckColour: 'dark-grey',
  openings: [{id: 'd1', wall: 'front', type: 'slide4m', material: 'upvc', p: .45}, {id: 'w1', wall: 'left', type: 'openM', material: 'upvc', p: .55}]});
await mkdir(path.dirname(out), {recursive: true});
const browser = await launch();
const {page, errors} = await openDesigner(browser, {viewport: {width: 1440, height: 900}, query: `?qa=1&tier=high&pdforigin=${encodeURIComponent(LIVE)}`, hash: '#d=' + C.encodeDesign(design)});
await settled(page);
await page.evaluate(() => window.__cfg.selectStep(6, {focusHeading: false}));
const download = page.waitForEvent('download', {timeout: 900000});
await page.evaluate(() => window.__cfg.makePDF());
const d = await download;
await d.saveAs(out);
console.log('saved', out, d.suggestedFilename(), 'errors:', errors.slice(0, 3));
await browser.close();
