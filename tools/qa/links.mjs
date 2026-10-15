// The PDF's links: "Reopen your design" restores the exact design, and "Book a call" restores it
// and opens the booking form. Nothing is submitted.   BASE=... node tools/qa/links.mjs
import {launch, check, failures, waitFor, BASE} from './pw.mjs';
import * as C from '../../src/catalog.js';
const design = C.normalise({range: 'neo', size: '3C', colour: 'quartz', door: 'double', canopy: {left: 'on'}, canopyWalls: {left: {back: true, side: false}}, foundation: 'smartbase', panelling: true, insulation: true, openings: [{kind: 'glassPanel', wall: 'right', p: .4}], items: {shelves: 2, bikeHolder: 1}});
const expectChip = C.pounds(C.priceFor(design).total);
const browser = await launch();
for (const [label, url, form] of [['design link', C.designURL(design, BASE), false], ['booking link', C.bookingURL(design, BASE), true]]) {
  const ctx = await browser.newContext({viewport: {width: 1280, height: 860}});
  await ctx.addInitScript(() => { try { localStorage.setItem('bh-cfg-tour-v1', 'done'); } catch {} });
  const page = await ctx.newPage(); page.setDefaultTimeout(120000);
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(url + (url.includes('?') ? '' : ''), {waitUntil: 'domcontentloaded'});
  await waitFor(page, () => document.getElementById('price-chip').textContent.length > 5);
  // A new visitor: the price stays locked until details are sent, then it is the design's own.
  const lockedChip = await page.textContent('#price-chip');
  check(!/£\d/.test(lockedChip), `${label}: price locked for a new visitor`, lockedChip.trim());
  await page.evaluate(() => { try { sessionStorage.setItem('bh-receipt-v1', 'BHE-QA'); } catch {} });
  await page.goto('about:blank'); await page.goto(url, {waitUntil: 'domcontentloaded'});
  await waitFor(page, () => document.getElementById('price-chip').textContent.length > 5);
  if (form) await waitFor(page, () => document.getElementById('form-dialog').open, null, 15000).catch(() => {});
  else await page.waitForTimeout(800);
  const got = await page.evaluate(() => ({hash: location.hash, chip: document.getElementById('price-chip').textContent, dialog: document.getElementById('form-dialog').open, title: document.getElementById('form-title').textContent, toast: document.getElementById('toast').textContent}));
  const code = decodeURIComponent((got.hash.match(/d=([^&]+)/) || [])[1] || '');
  const same = JSON.stringify({...C.decodeDesign(code), step: 0}) === JSON.stringify({...design, step: 0});
  check(same && got.chip.includes(expectChip), `${label}: reopens the exact design and its price (${expectChip})`, got.chip);
  if (form) check(got.dialog && /Book a design call/.test(got.title), `${label}: opens the booking form`, got.title);
  else check(!got.dialog && /shared design/.test(got.toast), `${label}: no form, a welcome note`, got.toast);
  check(!errors.length, `${label}: no page errors`, errors.join(' | '));
  await ctx.close();
}
await browser.close();
console.log(failures() ? `${failures()} failed` : 'All link checks passed');
process.exit(failures() ? 1 : 0);
