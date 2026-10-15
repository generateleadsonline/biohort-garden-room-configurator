// The GLO configurator standard (audit of 15 Oct 2026), checked as a fresh visitor sees it, at
// 1440x900 and 390x844: the 3D starts by itself (a visible canvas, or the SVG drawing, within 10s
// with no interaction), the tour opens on the first visit, the price stays hidden until details
// are sent (Book a call and Download PDF on the price step), then unlocks with the PDF and Book a
// call (sent as type book-call), with the link to the product in Biohort's shop.
// Locally the forms post to tools/dev-api.mjs's in-memory store. LIVE=1 answers every POST inside
// the browser (ctx.route), so nothing reaches the live store and no funnel event is counted.
//   PLAYWRIGHT_CORE=.../playwright-core BASE=http://127.0.0.1:47391 node tools/qa/standard.mjs
import {mkdir} from 'node:fs/promises';
import {chromium, check, failures, sleep, waitFor, BASE} from './pw.mjs';
import * as C from '../../src/catalog.js';
const LIVE = process.env.LIVE === '1';
const figure = C.pounds(C.priceFor(C.normalise({})).total);
await mkdir('qa/standard', {recursive: true});
// The Mac's GPU through Metal, as a real visitor's browser has (SwiftShader takes minutes under load).
const browser = await chromium.launch({channel: 'chrome', args: ['--use-angle=metal', '--ignore-gpu-blocklist']});
for (const [label, opts] of [['desktop', {viewport: {width: 1440, height: 900}}], ['phone', {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 3}]]) {
  const ctx = await browser.newContext(opts);
  const posts = [];
  // Routing a request turns Playwright's HTTP cache off, so on live the POSTs are answered in the
  // browser only from the price step on; until then any POST at all fails the run.
  const early = [], LIVE_ROUTED = {on: false};
  ctx.on('request', r => { if (r.method() === 'POST' && !LIVE_ROUTED.on) early.push(r.url()); });
  const routePosts = async () => {
    if (!LIVE) return;
    await ctx.route('**/api/enquiry', route => { posts.push(JSON.parse(route.request().postData() || '{}')); route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({ok: true, reference: 'REF-20261015-QATEST'})}); });
    await ctx.route('**/api/diagnostics', route => route.fulfill({status: 200, contentType: 'application/json', body: '{"stored":false}'}));
    LIVE_ROUTED.on = true;
  };
  if (!LIVE) ctx.on('request', r => { if (r.method() === 'POST' && r.url().includes('/api/enquiry')) posts.push(JSON.parse(r.postData() || '{}')); });
  const page = await ctx.newPage();
  // On a phone the 3D, step bar and footer are pinned: scroll the target into the band between them.
  const tap = async sel => {
    await page.evaluate(sel => { const el = document.querySelector(sel); const top = innerWidth < 1024 ? document.getElementById('steps').getBoundingClientRect().bottom + 12 : 80; const r = el.getBoundingClientRect(); if (r.top < top || r.bottom > innerHeight - 100) { if (innerWidth < 1024) scrollBy(0, r.top - top); else el.scrollIntoView({block: 'center'}); } }, sel);
    await sleep(150);
    await page.click(sel);
  };
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.setDefaultTimeout(60000);
  const t0 = Date.now();
  await page.goto(BASE + '/configurator/', {waitUntil: 'domcontentloaded'});
  // No interaction at all: the 3D and the tour must come by themselves.
  let shown = null;
  try {
    await waitFor(page, () => [...document.querySelectorAll('#scene canvas, #scene svg')].some(el => { const r = el.getBoundingClientRect(); return r.width > 100 && r.height > 100 && getComputedStyle(el).visibility !== 'hidden'; }), null, 10000);
    shown = Date.now() - t0;
  } catch {}
  const what = await page.evaluate(() => document.querySelector('#scene canvas') ? 'canvas' : document.querySelector('#scene svg') ? 'svg' : 'nothing');
  check(shown !== null, `${label}: the 3D shows by itself within 10s, no interaction`, `${what} after ${shown ?? '>10000'}ms`);
  const tour = await waitFor(page, () => !document.getElementById('tour').hidden, null, Math.max(500, 10000 - (Date.now() - t0))).catch(() => false);
  check(tour, `${label}: the tour opened on the first visit`, `after ${Date.now() - t0}ms`);
  await sleep(1500);
  await page.screenshot({path: `qa/standard/${label}-first-screen.png`});
  const poster = await page.evaluate(() => document.getElementById('poster').classList.contains('is-gone'));
  check(poster, `${label}: the poster gave way to the live 3D`);
  if (label === 'phone') {
    const lay = await page.evaluate(() => ({stage: document.getElementById('stage').getBoundingClientRect().top, panel: document.getElementById('panel').getBoundingClientRect().top, foot: getComputedStyle(document.querySelector('.panel-foot')).position, next: document.getElementById('next').getBoundingClientRect().bottom <= innerHeight}));
    check(lay.stage < lay.panel && lay.foot === 'sticky' && lay.next, `${label}: 3D on top, Next bar fixed at the bottom`, JSON.stringify(lay));
  }
  await page.click('#tour-skip');
  check(!early.length, `${label}: no POST before the price step`, early.join(','));
  await routePosts();
  await page.click('#steps [data-step="1"]');
  await sleep(300);
  const sizePrices = await page.evaluate(() => [...document.querySelectorAll('.size-card .price')].map(e => e.textContent).filter(Boolean));
  check(!sizePrices.length, `${label}: size cards show no building price before details`, sizePrices.slice(0, 3).join(','));
  const chipBefore = await page.textContent('#price-chip');
  check(!/£\d/.test(chipBefore), `${label}: footer shows no price before details`, chipBefore.trim().replace(/\s+/g, ' '));
  // The price step, before any details.
  await page.click('#steps [data-step="7"]');
  await sleep(900);
  const inView = await page.evaluate(() => { const r = document.getElementById('panel-title').getBoundingClientRect(), band = innerWidth < 1024 ? document.getElementById('steps').getBoundingClientRect().bottom : document.getElementById('panel-body').getBoundingClientRect().top; return {title: Math.round(r.top), band: Math.round(band), ok: r.top >= band - 2 && r.bottom < innerHeight - 100}; });
  check(inView.ok, `${label}: the price step opens at its top, not behind the 3D`, JSON.stringify(inView));
  const locked = await page.evaluate(fig => ({
    figure: document.body.innerText.includes(fig), card: Boolean(document.getElementById('price-card')), lockedCard: Boolean(document.querySelector('#quote-locked .price-blur')),
    form: Boolean(document.querySelector('#step-content #quote-form #q-first')), shop: Boolean(document.querySelector('[data-cta="shop"]')),
    book: [...document.querySelectorAll('#step-content [data-open="book"]')].some(b => b.getClientRects().length), pdf: [...document.querySelectorAll('#step-content [data-action="pdf"]')].some(b => b.getClientRects().length),
    next: document.getElementById('next').textContent
  }), figure);
  check(!locked.figure && !locked.card && locked.lockedCard && !locked.shop, `${label}: price step hides the price (${figure}) and the shop link`, JSON.stringify(locked));
  check(locked.form && locked.book && locked.pdf, `${label}: price step has the lead form, Book a call and Download PDF`);
  await page.screenshot({path: `qa/standard/${label}-price-locked.png`});
  // A locked PDF points to the form and downloads nothing.
  let downloaded = false; page.once('download', () => { downloaded = true; });
  await tap('#step-content [data-action="pdf"]');
  await sleep(600);
  const pdfLocked = await page.evaluate(() => ({focus: document.activeElement.id, status: document.getElementById('pdf-status').textContent}));
  check(!downloaded && pdfLocked.focus === 'q-first' && /unlock/.test(pdfLocked.status), `${label}: Download PDF before details points to the form`, JSON.stringify(pdfLocked));
  // Empty send names every field.
  await tap('#q-submit');
  const errs = await page.evaluate(() => [...document.querySelectorAll('#quote-form .error:not([hidden])')].map(e => e.id));
  check(['q-first-error', 'q-last-error', 'q-phone-error', 'q-email-error', 'q-postcode-error'].every(e => errs.includes(e)), `${label}: empty send names all five required fields`, errs.join(','));
  await page.fill('#q-first', 'Qa'); await page.fill('#q-last', 'Tester'); await page.fill('#q-phone', '0217 123 4567'); await page.fill('#q-email', 'qa-test@generateleads.online'); await page.fill('#q-postcode', 'kt15 2qg');
  await tap('#q-submit');
  check(await page.evaluate(() => !document.getElementById('q-phone-error').hidden), `${label}: an unallocated 021 number is refused`);
  check(!(await page.evaluate(fig => document.body.innerText.includes(fig), figure)), `${label}: still no price after a refused send`);
  await page.fill('#q-phone', '07911 123456');
  // Playwright's own scrolling may move the window while filling; the send itself must not.
  await page.evaluate(() => scrollTo(0, 0));
  await tap('#q-submit');
  await waitFor(page, () => document.getElementById('quote-unlocked'), null, 30000).catch(async err => {
    console.log(await page.evaluate(() => ({error: document.getElementById('q-form-error')?.textContent, errs: [...document.querySelectorAll('#quote-form .error:not([hidden])')].map(e => e.id + ': ' + e.textContent), step: document.getElementById('panel-title').textContent, form: Boolean(document.getElementById('quote-form'))})), posts.length);
    throw err;
  });
  await sleep(500);
  const open = await page.evaluate(fig => ({
    card: document.querySelector('#price-card .big')?.textContent, chip: document.getElementById('price-chip').textContent.trim().replace(/\s+/g, ' '),
    book: [...document.querySelectorAll('#step-content [data-open="book"]')].some(b => b.getClientRects().length), pdf: [...document.querySelectorAll('#step-content [data-action="pdf"]')].some(b => b.getClientRects().length && !/Unlocks/.test(b.textContent)),
    winY: Math.round(scrollY), next: document.getElementById('next').textContent, has: document.body.innerText.includes(fig), shop: [...document.querySelectorAll('[data-cta="shop"]')].map(a => a.href)[0] || ''
  }), figure);
  check(open.card === figure && open.has && open.chip.includes(figure), `${label}: after a successful send the price shows`, JSON.stringify(open));
  check(open.book && open.pdf && open.next === 'Book a call', `${label}: Book a call and Download PDF unlocked`);
  if (label === 'desktop') check(open.winY === 0, `${label}: unlocking scrolls the panel, not the window`, `scrollY ${open.winY}`);
  check(/^https:\/\/www\.biohort\.com\/gb-en\//.test(open.shop), `${label}: the link to Biohort's GB shop appears after unlock`, open.shop);
  const quotePost = posts.find(p => p.type === 'quote');
  check(quotePost && quotePost.firstName === 'Qa' && quotePost.lastName === 'Tester' && quotePost.phone === '+447911123456' && /^KT15 2QG$/.test(quotePost.postcode) && quotePost.design, `${label}: the quote request carries names, phone, email, postcode and the design`, quotePost ? `${quotePost.type} ${quotePost.phone} ${quotePost.postcode}` : 'none');
  await page.screenshot({path: `qa/standard/${label}-price-unlocked.png`});
  // Book a call: day and time, sent as book-call.
  await tap('#step-content [data-open="book"]');
  await waitFor(page, () => document.getElementById('form-dialog').open);
  const fields = await page.evaluate(() => ({title: document.getElementById('form-title').textContent, day: Boolean(document.getElementById('f-day')), slot: Boolean(document.getElementById('f-slot')), prefilled: document.getElementById('f-first').value}));
  check(/Book a design call/.test(fields.title) && fields.day && fields.slot && fields.prefilled === 'Qa', `${label}: Book a call asks for a day and time, details prefilled`, JSON.stringify(fields));
  const d = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);
  await page.fill('#f-day', d);
  await page.click('#form-submit');
  await waitFor(page, () => !document.getElementById('form-done').hidden, null, 30000);
  const bookPost = posts.find(p => p.type === 'book-call');
  check(bookPost && bookPost.extra?.day === d && bookPost.extra?.slot, `${label}: Book a call is sent as type book-call with the day and time`, bookPost ? JSON.stringify(bookPost.extra) : 'none');
  const ev = await page.evaluate(() => (window.dataLayer || []).filter(e => e.event === 'bh_cta_click').map(e => e.cta));
  check(ev.includes('book-call') && ev.includes('download-pdf'), `${label}: Book a call and PDF clicks reach the dataLayer`, [...new Set(ev)].join(','));
  check(!errors.length, `${label}: no page errors`, errors.slice(0, 3).join(' | '));
  await ctx.close();
}
await browser.close();
console.log(failures() ? `${failures()} failed` : 'All standard checks passed');
process.exit(failures() ? 1 : 0);
