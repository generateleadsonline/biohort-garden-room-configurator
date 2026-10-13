// Every form: opened from its call to action, required fields enforced, UK phone rules, errors
// announced and focused, then (locally only) a real submission into the dev store, checked for the
// full specification and the design and booking links. The PDF and brochure downloads are saved
// to qa/downloads/. LIVE=1 checks validation only and never submits.
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
const openers = {callback: '.header-ctas [data-open="callback"]', showroom: '.header-ctas [data-open="showroom"]', brochure: '.header-ctas [data-open="brochure"]', book: '[data-open="book"]', quote: '[data-open="quote"]', pdf: '[data-action="pdf"]'};
const person = {first: 'Qa', last: 'Tester', phone: '07911 123456', email: 'qa-test@generateleads.online', postcode: 'kt15 2qg'};
// The dev store lives as long as the server, so only enquiries made by this run are counted.
const before = LIVE ? new Set() : new Set(Object.keys(await (await fetch(BASE + '/__qa/store')).json()));
const fill = async v => { for (const [k, val] of Object.entries(v)) await page.fill('#f-' + k, val); };
for (const [mode, sel] of Object.entries(openers)) {
  await page.evaluate(() => { try { sessionStorage.removeItem('bh-receipt-v1'); sessionStorage.removeItem('bh-contact'); } catch {} });
  await page.evaluate(() => window.__cfg.selectStep(7, {focusHeading: false}));
  // A fresh page state: the PDF button opens the form only before any enquiry.
  await page.evaluate(() => window.__cfg.resetReceipt());
  await page.click(sel);
  await waitFor(page, () => document.getElementById('form-dialog').open);
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
  const download = mode === 'pdf' ? page.waitForEvent('download', {timeout: 600000}) : null;
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
if (!LIVE) {
  const store = await (await fetch(BASE + '/__qa/store')).json();
  const recs = Object.entries(store).filter(([k, r]) => !before.has(k) && r.contact?.email === person.email).map(([, r]) => r);
  check(recs.length === 6, 'six enquiries stored, one per form', `${recs.length}`);
  for (const r of recs) {
    const okRec = r.contact.firstName === 'Qa' && r.contact.lastName === 'Tester' && r.contact.phone === '+447911123456' && r.contact.postcode === 'KT15 2QG' && r.design.specification.length >= 4 && /\/configurator\/#d=b1\./.test(r.design.url) && /\?book=1#d=/.test(r.design.bookingUrl) && r.design.price.status && r.design.price.lines.length >= 1;
    check(okRec, `${r.type}: stored with names, E.164 phone, postcode, full specification, priced lines and design and booking links`);
  }
}
check(!errors.length, 'no page errors', errors.slice(0, 3).join(' | '));
await ctx.close(); await browser.close();
console.log(failures() ? `${failures()} failed` : 'All form checks passed');
process.exit(failures() ? 1 : 0);
