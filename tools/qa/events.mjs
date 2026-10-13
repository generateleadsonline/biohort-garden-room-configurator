// Analytics: every call to action and every step must send an event. Clicks every [data-cta] the
// page shows (header, menu, price step, dialogs), walks all eight steps, and reads window.__events.
//   BASE=... node tools/qa/events.mjs
import {launch, openDesigner, check, failures, sleep, waitFor} from './pw.mjs';
const browser = await launch();
const results = {};
for (const [label, viewport] of [['desktop', {width: 1440, height: 900}], ['phone', {width: 390, height: 844}]]) {
  const {ctx, page, errors} = await openDesigner(browser, {viewport, query: '?qa=layout'});
  await waitFor(page, () => window.__cfg && document.querySelector('#step-content').children.length);
  await page.evaluate(() => { window.open = () => null; document.addEventListener('click', e => { const a = e.target.closest('a[href]'); if (a) e.preventDefault(); }, true); });
  for (let i = 0; i < 8; i++) await page.click(`#steps [data-step="${i}"]`);
  await page.click('#back'); await page.click('#next');
  const ctas = new Set();
  const clickAll = async () => {
    const list = await page.evaluate(() => [...document.querySelectorAll('[data-cta]')].filter(el => el.getClientRects().length && !el.closest('[hidden], dialog:not([open])')).map((el, i) => { el.dataset.qa = String(i); return {i, cta: el.dataset.cta}; }));
    for (const {i, cta} of list) {
      ctas.add(cta);
      await page.evaluate(i => document.querySelector(`[data-qa="${i}"]`)?.click(), i);
      await sleep(60);
      await page.evaluate(() => { for (const d of document.querySelectorAll('dialog[open]')) d.close(); document.getElementById('tour').hidden || document.getElementById('tour-skip').click(); });
    }
  };
  await clickAll();
  await page.evaluate(() => window.__cfg.selectStep(0, {focusHeading: false})); await clickAll();
  await page.evaluate(() => window.__cfg.selectStep(7, {focusHeading: false})); await clickAll();
  if (label === 'phone') { await page.click('#menu-toggle'); await clickAll(); }
  await page.evaluate(() => window.__cfg.change({colour: 'quartz'}, {key: 'colour'}));
  const ev = await page.evaluate(() => window.__events);
  const fired = new Set(ev.filter(e => e.event === 'bh_cta_click').map(e => e.cta));
  const missing = [...ctas].filter(c => !fired.has(c));
  check(!missing.length && ctas.size >= 8, `${label}: every call to action sends bh_cta_click`, `${ctas.size} CTAs: ${[...ctas].join(', ')}${missing.length ? ' | missing ' + missing.join(', ') : ''}`);
  const steps = new Set(ev.filter(e => e.event === 'bh_step_view').map(e => e.step));
  check([1, 2, 3, 4, 5, 6, 7, 8].every(s => steps.has(s)), `${label}: every step sends bh_step_view`, [...steps].join(','));
  const kinds = new Set(ev.map(e => e.event));
  check(['bh_form_open', 'bh_option_change', 'bh_configurator_view'].every(k => kinds.has(k)), `${label}: form opens and option changes are tracked`, [...kinds].join(', '));
  check(ev.every(e => !JSON.stringify(e).includes('@')), `${label}: no contact details in analytics events`);
  check(!errors.length, `${label}: no page errors`, errors.slice(0, 3).join(' | '));
  results[label] = [...kinds];
  await ctx.close();
}
await browser.close();
console.log(failures() ? `${failures()} failed` : 'All analytics checks passed');
process.exit(failures() ? 1 : 0);
