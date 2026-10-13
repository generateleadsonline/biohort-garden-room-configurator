// Screenshots of every step for one design, for a quick look at the panel and the 3D together.
//   BASE=http://127.0.0.1:4841 OUT=<dir> node tools/qa/steps-shots.mjs '<design json>' [width height]
import {writeFile, mkdir} from 'node:fs/promises';
import {launch, openDesigner, settled, sleep} from './pw.mjs';
import {encodeDesign} from '../../src/catalog.js';
const design = JSON.parse(process.argv[2] || '{}');
const [W, H] = [Number(process.argv[3] || 1440), Number(process.argv[4] || 900)];
const out = process.env.OUT || 'qa-out/steps';
await mkdir(out, {recursive: true});
const browser = await launch('chromium', process.env.GPU ? {args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist']} : {});
const {page, errors} = await openDesigner(browser, {viewport: {width: W, height: H}, hash: '#d=' + encodeDesign(design)});
await settled(page);
for (let i = 0; i < 8; i++) {
  await page.evaluate(i => { window.__instantFocus = true; window.__cfg.selectStep(i); }, i);
  await sleep(900);
  await page.screenshot({path: `${out}/${design.range || 'highline'}-${W}-step${i + 1}.png`});
}
console.log('errors:', errors.length ? errors.join('\n') : 'none');
await browser.close();
