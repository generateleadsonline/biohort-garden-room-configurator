// axe-core over every step, every dialog, the menu and the tour, at desktop and phone widths.
// The page's CSP refuses injected scripts, so this context bypasses CSP for axe only.
//   AXE=/path/to/axe.min.js BASE=... node tools/qa/a11y.mjs
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {launch, check, failures, sleep, waitFor, BASE, devices} from './pw.mjs';
const axe = await readFile(process.env.AXE, 'utf8');
const browser = await launch();
const all = [];
for (const [label, opts] of [['desktop', {viewport: {width: 1440, height: 900}}], ['phone', {...devices['Pixel 7']}]]) {
  const ctx = await browser.newContext({...opts, bypassCSP: true});
  await ctx.addInitScript(() => { try { localStorage.setItem('bh-cfg-tour-v1', 'done'); } catch {} });
  const page = await ctx.newPage();
  page.setDefaultTimeout(120000);
  await page.goto(BASE + '/configurator/?qa=layout', {waitUntil: 'domcontentloaded'});
  await waitFor(page, () => window.__cfg && document.querySelector('#step-content').children.length);
  await page.addScriptTag({content: axe});
  const run = async state => {
    const r = await page.evaluate(async () => (await window.axe.run(document, {resultTypes: ['violations']})).violations.map(v => ({id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 4).map(n => n.target.join(' '))})));
    all.push({label, state, violations: r});
    check(!r.length, `${label} ${state}: no axe violations`, r.map(v => `${v.id} (${v.impact}) ${v.nodes.join(', ')}`).join(' | '));
  };
  for (let i = 0; i < 7; i++) { await page.evaluate(i => window.__cfg.selectStep(i, {focusHeading: false}), i); await sleep(150); await run(`step ${i + 1}`); }
  for (const mode of ['callback', 'showroom', 'brochure', 'book', 'quote']) {
    await page.evaluate(m => document.querySelector(`[data-open="${m}"]`).click(), mode); await sleep(150);
    await run(`${mode} form`);
    if (mode === 'callback') {
      await page.click('#form-submit'); await sleep(150); await run('callback form with errors');
    }
    await page.evaluate(() => document.getElementById('form-dialog').close());
  }
  await page.evaluate(() => { window.__cfg.selectStep(0, {focusHeading: false}); document.querySelector('[data-action="westbury"]').click(); }); await sleep(150); await run('Westbury dialog');
  await page.evaluate(() => document.getElementById('westbury-dialog').close());
  await page.evaluate(() => { window.__cfg.selectStep(6, {focusHeading: false}); document.querySelector('[data-action="share"]').click(); }); await sleep(150); await run('share dialog');
  await page.evaluate(() => document.getElementById('share-dialog').close());
  if (label === 'phone') { await page.click('#menu-toggle'); await sleep(100); await run('menu open'); await page.click('#menu-toggle'); }
  await page.evaluate(() => document.getElementById(innerWidth < 720 ? 'help-menu' : 'help').click()); await sleep(200); await run('tour open');
  await ctx.close();
}
await mkdir('qa', {recursive: true});
await writeFile('qa/a11y.json', JSON.stringify({base: BASE, at: new Date().toISOString(), runs: all}, null, 1));
await browser.close();
console.log(failures() ? `${failures()} failed` : 'No accessibility violations');
process.exit(failures() ? 1 : 0);
