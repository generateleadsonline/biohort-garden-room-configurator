// Shared Playwright helpers for the QA scripts. playwright-core is not a dependency of the site:
// set PLAYWRIGHT_CORE to an install whose WebKit build is in ~/Library/Caches/ms-playwright.
import {createRequire} from 'module';
const require = createRequire(import.meta.url);
export const pw = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
export const {webkit, chromium, devices} = pw;
export const BASE = (process.env.BASE || 'http://127.0.0.1:47391').replace(/\/$/, '');
export const sleep = ms => new Promise(r => setTimeout(r, ms));
let failed = 0;
export const check = (ok, label, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  ' + detail : ''}`); if (!ok) failed++; return ok; };
export const failures = () => failed;
// Headless Chrome has no GPU here: SwiftShader gives it real (slow) WebGL.
export async function launch(type = 'chromium', opts = {}) {
  const angle = process.env.ANGLE || 'swiftshader';
  return type === 'webkit' ? webkit.launch(opts) : chromium.launch({channel: 'chrome', args: [`--use-angle=${angle}`, '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'], ...opts});
}
// Polls with plain evaluate calls: waitForFunction evaluates a string, which the live CSP refuses.
export async function waitFor(page, fn, arg, timeout = 90000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) { try { if (await page.evaluate(fn, arg)) return true; } catch {} await sleep(250); }
  throw new Error('timed out waiting for ' + String(fn).slice(0, 80));
}
export async function openDesigner(browser, {device, viewport, query = '?qa=1', init = [], tourSeen = true, hash = ''} = {}) {
  const ctx = await browser.newContext(device ? {...devices[device]} : {viewport: viewport || {width: 1440, height: 900}});
  for (const f of init) await ctx.addInitScript(typeof f === 'string' ? {content: f} : f);
  if (tourSeen) await ctx.addInitScript(() => { try { localStorage.setItem('bh-cfg-tour-v1', 'done'); } catch {} });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.setDefaultTimeout(120000);
  await page.goto(BASE + '/configurator/' + query + hash, {waitUntil: 'domcontentloaded', timeout: 180000});
  return {ctx, page, errors};
}
export const settled = page => waitFor(page, () => window.__cfg && (window.__cfg.boot.verified || window.__cfg.fallback), null, 400000);
export const frames = (page, n = 2) => page.evaluate(n => new Promise(r => { let k = 0; const f = () => (++k >= n ? setTimeout(r, 200) : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
