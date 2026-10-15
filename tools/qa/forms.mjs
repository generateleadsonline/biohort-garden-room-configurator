// Every form: opened from its call to action, required fields enforced, UK phone rules, errors
// announced and focused, then (locally only) a real submission into the dev store, checked for the
// full specification and the design and booking links. The dialog serves callback, showroom,
// brochure and Book a call (stored as book-call); the price step has its own form, which unlocks
// the price, the shop link and the PDF. The PDF is saved to qa/downloads/.
// LIVE=1 checks validation only and never submits.
//   BASE=http://127.0.0.1:47391 node tools/qa/forms.mjs
import {mkdir} from 'node:fs/promises';
import {launch, openDesigner, check, failures, sleep, waitFor, BASE} from './pw.mjs';
const LIVE = process.env.LIVE === '1';
await mkdir('qa/downloads', {recursive: true});
const browser = await launch();
const {ctx, page, errors} = await openDesigner(browser, {viewport: {width: 1280, height: 860}, query: LIVE ? '?qa=layout' : '?qa=1&tier=low'});
await waitFor(page, () => window.__cfg && document.querySelector('#step-content').children.length);
// The brochure opens Biohort's own catalogue in a new tab: record it instead of leaving the page.
await page.evaluate(() => { window.__opened = []; window.open = u => { window.__opened.push(u); return null; }; });
const openers = {callback: '.header-ctas [data-open="callback"]', showroom: '.header-ctas [data-open="showroom"]', brochure: '.header-ctas [data-open="brochure"]', book: '[data-open="book"]'};
const person = {first: 'Qa', last: 'Tester', phone: '07911 123456', email: 'qa-test@generateleads.online', postcode: 'kt15 2qg'};
// The dev store lives as long as the server, so only enquiries made by this run are counted.
const before = LIVE ? new Set() : new Set(Object.keys(await (await fetch(BASE + '/__qa/store')).json()));
const fill = async v => { for (const [k, val] of Object.entries(v)) await page.fill('#f-' + k, val); };
for (const [mode, sel] of Object.entries(openers)) {
  await page.evaluate(() => { try { sessionStorage.removeItem('bh-receipt-v1'); sessionStorage.removeItem('bh-contact'); } catch {} });
  await page.evaluate(() => window.__cfg.selectStep(7, {focusHeading: false}));
  await page.evaluate(() => window.__cfg.resetReceipt());
  await page.click(sel);
  await waitFor(page, () => document.getElementById('form-dialog').open);
  // The dialog moves focus to First name 30ms after opening; filling before that sends keys astray.
  await waitFor(page, () => document.activeElement?.id === 'f-first', null, 5000);
  const title = await page.textContent('#form-title');
  for (const k of ['first', 'last', 'phone', 'email', 'postcode']) await page.fill('#f-' + k, '');
  await page.click('#form-submit');
  const errs = await page.evaluate(() => [...document.querySelectorAll('#lead-form .error:not([hidden])')].map(e => e.id));
  const focused = await page.evaluate(() => document.activeElement.id);
  check(['f-first-error', 'f-last-error', 'f-phone-error', 'f-email-error', 'f-postcode-error'].every(e => errs.includes(e)) && focused === 'f-first', `${mode} ("${title}"): empty submit names all five required fields, focus on first name`, errs.join(','));
  await fill({...person, phone: '0217 123 4567'});
  await page.click('#form-submit');
  check(await page.evaluate(() => !document.getElementById('f-phone-error').hidden && document.getElementById('f-phone').getAttribute('aria-invalid') === 'true'), `${mode}: an unallocated 021 number is refused`);
  await page.fill('#f-phone', '07700 900123'); await page.click('#form-submit');
  check(await page.evaluate(() => /reserved/.test(document.getElementById('f-phone-error').textContent)), `${mode}: an Ofcom drama number is refused`);
  await page.fill('#f-phone', '+44 7911 123456');
  if (LIVE) { await page.evaluate(() => document.getElementById('form-dialog').close()); continue; }
  const download = null;
  await page.click('#form-submit');
  await waitFor(page, () => !document.getElementById('form-done').hidden || !document.getElementById('form-error').hidden, null, 60000);
  const ref = await page.textContent('#done-ref').catch(() => '');
  check(/BHE-\d{8}-/.test(ref), `${mode}: submitted, reference shown`, ref);
  if (mode === 'brochure') check(await page.evaluate(() => window.__opened.some(u => /Biohort-Product-Catalogue-EN\.pdf$/.test(u)) && [...document.querySelectorAll('#done-actions a')].some(a => /Product-Catalogue-EN/.test(a.href))), 'brochure: opens Biohort\'s English product catalogue, with a link to it');
  if (download) {
    const d = await download;
    await d.saveAs(`qa/downloads/${mode}.pdf`);
    check(true, `${mode}: download saved`, d.suggestedFilename());
  }
  await page.evaluate(() => document.getElementById('form-dialog').close());
}
// The price step's form: errors as above, then (locally) it unlocks the price, the shop link and the PDF.
await page.evaluate(() => { try { sessionStorage.removeItem('bh-contact'); } catch {} window.__cfg.resetReceipt(); window.__cfg.selectStep(7, {focusHeading: false}); });
check(await page.evaluate(() => !document.getElementById('price-card') && Boolean(document.querySelector('#quote-locked .price-blur')) && !document.querySelector('[data-cta="shop"]')), 'price step: price and shop link hidden before details');
for (const k of ['first', 'last', 'phone', 'email', 'postcode']) await page.fill('#q-' + k, '');
await page.click('#q-submit');
const qErrs = await page.evaluate(() => [...document.querySelectorAll('#quote-form .error:not([hidden])')].map(e => e.id));
check(['q-first-error', 'q-last-error', 'q-phone-error', 'q-email-error', 'q-postcode-error'].every(e => qErrs.includes(e)) && await page.evaluate(() => document.activeElement.id) === 'q-first', 'price step form: empty send names all five required fields, focus on first name', qErrs.join(','));
for (const [k, v] of Object.entries({...person, phone: '07700 900123'})) await page.fill('#q-' + k, v);
await page.click('#q-submit');
check(await page.evaluate(() => /reserved/.test(document.getElementById('q-phone-error').textContent)), 'price step form: an Ofcom drama number is refused');
await page.fill('#q-phone', '+44 7911 123456');
if (!LIVE) {
  await page.click('#q-submit');
  await waitFor(page, () => document.getElementById('quote-unlocked') || !document.getElementById('q-form-error').hidden, null, 60000);
  check(await page.evaluate(() => /£\d/.test(document.querySelector('#price-card .big')?.textContent || '') && Boolean(document.querySelector('[data-cta="shop"]'))), 'price step form: sent, price and shop link shown');
  const download = page.waitForEvent('download', {timeout: 600000});
  await page.click('#step-content [data-action="pdf"]');
  const d = await download;
  await d.saveAs('qa/downloads/pdf.pdf');
  check(true, 'price step: PDF downloads once unlocked', d.suggestedFilename());
}
if (!LIVE) {
  const store = await (await fetch(BASE + '/__qa/store')).json();
  const recs = Object.entries(store).filter(([k, r]) => !before.has(k) && r.contact?.email === person.email).map(([, r]) => r);
  check(recs.length === 5 && ['callback', 'showroom', 'brochure', 'book-call', 'quote'].every(t => recs.some(r => r.type === t)), 'five enquiries stored, one per form (Book a call as book-call)', recs.map(r => r.type).join(','));
  for (const r of recs) {
    const okRec = r.contact.firstName === 'Qa' && r.contact.lastName === 'Tester' && r.contact.phone === '+447911123456' && r.contact.postcode === 'KT15 2QG' && r.design.specification.length >= 4 && /\/configurator\/#d=b1\./.test(r.design.url) && /\?book=1#d=/.test(r.design.bookingUrl) && r.design.price.status && r.design.price.lines.length >= 1;
    check(okRec, `${r.type}: stored with names, E.164 phone, postcode, full specification, priced lines and design and booking links`);
  }
}
check(!errors.length, 'no page errors', errors.slice(0, 3).join(' | '));
await ctx.close(); await browser.close();
console.log(failures() ? `${failures()} failed` : 'All form checks passed');
process.exit(failures() ? 1 : 0);
