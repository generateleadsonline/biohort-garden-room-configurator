// Layout at 320, 360, 375, 390, 768, 1024 and 1440px: no sideways scrolling on any step, dialog,
// menu or tour card, and every touch target at least 44px. Inline text links in sentences are
// listed but exempt (WCAG 2.5.5's inline exception). Screenshots go to qa/layout/.
//   BASE=... node tools/qa/layout.mjs
import {mkdir} from 'node:fs/promises';
import {launch, openDesigner, check, failures, sleep, waitFor} from './pw.mjs';
const SIZES = [[320, 568], [360, 740], [375, 812], [390, 844], [768, 1024], [1024, 768], [1440, 900]];
await mkdir('qa/layout', {recursive: true});
const browser = await launch();
const MEASURE = () => {
  const vw = document.documentElement.clientWidth;
  const overflow = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - vw;
  const small = [], inline = [];
  const seen = new Set();
  for (let el of document.querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea')) {
    if (el.closest('.hp, .sprite, [hidden]')) continue;
    if (el.matches('input[type=radio], input[type=checkbox]') && el.closest('label')) el = el.closest('label');
    if (seen.has(el)) continue; seen.add(el);
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (!r.width || !r.height || cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (el.closest('dialog:not([open])') || (el.closest('#tour') && document.getElementById('tour').hidden) || (el.closest('#menu') && document.getElementById('menu').hidden)) continue;
    const id = (el.id ? '#' + el.id : el.tagName.toLowerCase()) + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '') + ` "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}"`;
    if (el.tagName === 'A' && el.closest('p, li, .note, .small-print, .hint, td') && !el.matches('.btn, .tour-link, .hphone, .hphone-mini')) { inline.push(id); continue; }
    if (r.width < 43.5 || r.height < 43.5) small.push(`${id} ${Math.round(r.width)}x${Math.round(r.height)}`);
  }
  return {overflow, small, inline};
};
for (const [w, h] of SIZES) for (const range of ['highline', 'neo', 'casanova']) {
  // HighLine is the default; Neo's 4 x 4 size grid and CasaNova's wall elements are the widest panels.
  if (range !== 'highline' && w > 768) continue;
  const {ctx, page, errors} = await openDesigner(browser, {viewport: {width: w, height: h}, query: '?qa=layout'});
  await waitFor(page, () => window.__cfg && document.querySelector('#step-content').children.length);
  if (range !== 'highline') await page.evaluate(r => window.__cfg.change({range: r}, {}), range);
  const issues = [];
  for (let i = 0; i < 8; i++) {
    await page.evaluate(i => window.__cfg.selectStep(i, {focusHeading: false}), i);
    await sleep(150);
    // Open the optional sections too: an extra wall element and a canopy, so every control is measured.
    if (i === 3) await page.evaluate(() => { const c = window.__cfg; const big = c.state.range === 'neo' ? '4D' : c.state.range === 'casanova' ? '4x6' : 'H5'; c.change({size: big}, {}); c.change({openings: [{id: 'q1', kind: c.state.range === 'casanova' ? 'tiltWindow' : 'door', wall: 'left', p: .5}]}, {}); c.selectStep(3, {focusHeading: false}); });
    if (i === 4) await page.evaluate(() => { const c = window.__cfg; if (c.state.range !== 'casanova') c.change({canopy: {left: c.state.range === 'neo' ? 'on' : 'L', right: 'none'}}, {}); c.selectStep(4, {focusHeading: false}); });
    const m = await page.evaluate(MEASURE);
    if (m.overflow > 0) issues.push(`${range} step ${i + 1} scrolls sideways by ${m.overflow}px`);
    for (const s of m.small) issues.push(`${range} step ${i + 1} small target ${s}`);
    await page.screenshot({path: `qa/layout/${w}-${range}-step${i + 1}.png`, fullPage: false});
  }
  if (range !== 'highline') { check(!issues.length, `${w}x${h} ${range}: no sideways scroll, every target 44px+`, issues.slice(0, 40).join(' | ')); check(!errors.length, `${w}x${h} ${range}: no page errors`, errors.slice(0, 3).join(' | ')); await ctx.close(); continue; }
  // Dialogs, the menu and the tour.
  for (const mode of ['callback', 'showroom', 'brochure', 'book', 'quote', 'pdf']) {
    await page.evaluate(m => { document.querySelector(`[data-open="${m}"]`) ? document.querySelector(`[data-open="${m}"]`).click() : null; }, mode).catch(() => {});
    await page.evaluate(m => { if (!document.getElementById('form-dialog').open) { window.__cfg.selectStep(7, {focusHeading: false}); } }, mode);
    if (!(await page.evaluate(() => document.getElementById('form-dialog').open))) await page.evaluate(m => document.querySelector(`[data-open="${m}"], [data-action="pdf"]`)?.click(), mode);
    await sleep(120);
    const m = await page.evaluate(MEASURE);
    if (m.overflow > 0) issues.push(`${mode} form scrolls sideways by ${m.overflow}px`);
    for (const s of m.small) issues.push(`${mode} form small target ${s}`);
    if (mode === 'callback') await page.screenshot({path: `qa/layout/${w}-form.png`});
    await page.evaluate(() => document.getElementById('form-dialog').close());
  }
  if (w < 720) {
    await page.click('#menu-toggle'); await sleep(100);
    const m = await page.evaluate(MEASURE);
    for (const s of m.small) issues.push(`menu small target ${s}`);
    if (m.overflow > 0) issues.push(`menu scrolls sideways by ${m.overflow}px`);
    await page.screenshot({path: `qa/layout/${w}-menu.png`});
    await page.click('#menu-toggle');
  }
  await page.evaluate(() => { window.__cfg.selectStep(0, {focusHeading: false}); document.querySelector('[data-action="compare"]').click(); });
  await sleep(100);
  let m = await page.evaluate(MEASURE);
  for (const s of m.small) issues.push(`compare small target ${s}`);
  if (m.overflow > 0) issues.push(`compare dialog scrolls sideways by ${m.overflow}px`);
  await page.screenshot({path: `qa/layout/${w}-compare.png`});
  await page.evaluate(() => document.getElementById('info-dialog').close());
  await page.evaluate(() => { localStorage.removeItem('bh-cfg-tour-v1'); document.getElementById('help').click(); });
  if (w < 720) await page.evaluate(() => { document.getElementById('help-menu').click(); });
  await sleep(200);
  m = await page.evaluate(MEASURE);
  for (const s of m.small) issues.push(`tour small target ${s}`);
  if (m.overflow > 0) issues.push(`tour scrolls sideways by ${m.overflow}px`);
  await page.screenshot({path: `qa/layout/${w}-tour.png`});
  check(!issues.length, `${w}x${h}: no sideways scroll, every target 44px+`, issues.slice(0, 40).join(' | '));
  check(!errors.length, `${w}x${h}: no page errors`, errors.slice(0, 3).join(' | '));
  await ctx.close();
}
await browser.close();
console.log(failures() ? `${failures()} failed` : 'All layout checks passed');
process.exit(failures() ? 1 : 0);
