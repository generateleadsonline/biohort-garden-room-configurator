// Cross-checks every price the configurator can charge (src/data/prices.js, from Biohort's configurator
// pricing endpoint) against Biohort's 2026 GB price lists (text extracted from the PDFs into
// research/pricelists/). Each price-list row carries one or more EANs (9003414 + SKU + check digit)
// and ends with the price in pounds. Exits non-zero on any disagreement.
//   node tools/check-price-list.mjs
import {readFile} from 'node:fs/promises';
import {PRICES} from '../src/data/prices.js';
const list = new Map();
for (const f of ['Endkundenpreisliste_gb-2026.txt', 'Endkundenpreisliste_cn_GB-2026.txt']) {
  const text = await readFile(`research/pricelists/${f}`, 'utf8');
  for (const line of text.split('\n')) {
    const price = line.match(/(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/);
    if (!price) continue;
    const value = Number(price[1].replace(/\./g, '').replace(',', '.'));
    const skus = [...line.matchAll(/9003414 (\d{5}) \d/g)].map(m => m[1]);
    // CasaNova's list prints article numbers on their own ("53012 ... 11.569,00").
    if (!skus.length) { const m = line.match(/^\s*(\d{5})\b/); if (m) skus.push(m[1]); }
    for (const k of skus) { if (!list.has(k)) list.set(k, new Set()); list.get(k).add(value); }
  }
}
let same = 0, differ = 0, absent = 0;
const bad = [];
for (const [sku, [price, title]] of Object.entries(PRICES)) {
  const p = list.get(sku);
  if (!p) { absent++; continue; }
  if (p.has(price)) same++; else { differ++; bad.push(`${sku} ${title}: configurator £${price}, price list £${[...p].join(' / ')}`); }
}
console.log(`${same} prices match the GB price list, ${differ} differ, ${absent} not printed in it (of ${Object.keys(PRICES).length}).`);
for (const b of bad) console.log('DIFFERS', b);
process.exit(differ ? 1 : 0);
