// Builds src/data/sizes.js and src/data/prices.js from the research captured on 13 Oct 2026:
//   research/catalogue/<range>.json            sizes, dimensions, SKUs per colour and door (GB product pages)
//   research/roomle/raw/gb-configurator-prices.json   every GB SKU and its price, from Biohort's own
//                                              configurator pricing endpoint (/api/ext/configurator/data)
// No size, dimension or price is typed by hand: re-run after refreshing the research.
//   node tools/build-catalog-data.mjs
import {readFile, writeFile} from 'node:fs/promises';

const RANGES = ['highline', 'avantgarde', 'europa', 'panorama', 'neo', 'casanova'];
const COLOUR_ID = {'Metallic silver': 'silver', 'Metallic quartz grey': 'quartz', 'Metallic dark grey': 'darkgrey', 'Dark green': 'darkgreen'};
const index = JSON.parse(await readFile('research/roomle/raw/gb-configurator-prices.json', 'utf8'));
const GB = new Map(index.products.map(p => [String(p.sku), p]));

const out = {};
const used = new Set();
for (const id of RANGES) {
  const d = JSON.parse(await readFile(`research/catalogue/${id}.json`, 'utf8'));
  out[id] = d.sizes.map(s => {
    const v = String(s.variant || '').toLowerCase();
    const door = /double/.test(v) ? 'double' : 'standard';
    const hinge = /left door hinge/.test(v) ? 'left' : /right door hinge/.test(v) ? 'right' : undefined;
    const model = id === 'avantgarde' ? (/eco/i.test(s.model || s.dataSheetGroup || '') ? 'eco' : 'classic') : undefined;
    const sku = {};
    for (const [name, code] of Object.entries(s.skus || {})) {
      const c = COLOUR_ID[name];
      if (!c) throw new Error(`${id} ${s.code}: unknown colour ${name}`);
      if (!GB.has(String(code))) throw new Error(`${id} ${s.code} ${name}: SKU ${code} is not in the GB price index`);
      sku[c] = String(code); used.add(String(code));
    }
    const row = {code: s.code.replace(/\s+/g, ''), door, ext: s.exteriorCm, int: s.interiorCm, area: s.effectiveM2, base: s.foundationCm, kg: s.weightKg, sku};
    if (hinge) row.hinge = hinge;
    if (model) row.model = model;
    const op = s.doorOpeningCm || s.doorOpening;
    if (Array.isArray(op)) row.opening = op.slice(0, 2);
    else if (op && op.w) row.opening = [op.w, op.h];
    return row;
  });
}
// Every accessory SKU the catalogue may use: anything the research lists for these ranges.
for (const id of RANGES) {
  const d = JSON.parse(await readFile(`research/catalogue/${id}.json`, 'utf8'));
  for (const a of d.accessories || []) {
    for (const k of [a.sku, ...(a.skus || []), ...(a.variants || []).map(v => v.sku)]) if (k && GB.has(String(k))) used.add(String(k));
  }
}
// Accessories, normalised from both research formats into [{sku, sizes, colour, door, opts}]:
//   variants[{sku, options: {size: 'H2, P2, A3, A5', color, ...}}]    (HighLine, AvantGarde, Europa files)
//   skusBySize {'2B': sku, '2B double door': sku} / skusByColour / sku (Panorama, Neo, CasaNova files)
const accessories = {}, listOnly = {};
const sizeTokens = (text, codes) => {
  const norm = t => t.replace(/\s+/g, '').toUpperCase();
  const set = new Set(codes.map(norm));
  return String(text).split(/[,/]|\band\b/).map(t => norm(t.replace(/\(.*?\)/g, '').replace(/^(size|Neo|Europa|AvantGarde)/i, ''))).filter(t => set.has(t));
};
for (const id of RANGES) {
  const d = JSON.parse(await readFile(`research/catalogue/${id}.json`, 'utf8'));
  const codes = [...new Set(out[id].map(r => r.code))];
  const list = accessories[id] = {};
  for (const a of d.accessories || []) {
    const rows = [];
    // A SKU the configurator's index lacks but the GB price list prints keeps the price list's price and says so.
    const push = (sku, extra = {}) => {
      if (!sku) return; sku = String(sku);
      if (!GB.has(sku)) {
        if (typeof a.priceGBP === 'number' && /Preisliste|price list/i.test(a.source || '')) { listOnly[sku] = [a.priceGBP, `${a.name} (GB price list)`, a.source]; rows.push({sku, ...extra}); }
        else rows.push({sku, missing: true, ...extra});
        return;
      }
      used.add(sku); rows.push({sku, ...extra});
    };
    for (const v of a.variants || []) {
      const o = v.options || {};
      const extra = {};
      if (o.size) { const t = sizeTokens(o.size, codes); extra.sizes = t.length ? t : null; extra.sizeText = o.size; }
      if (o.color) extra.colour = COLOUR_ID[o.color] || o.color;
      for (const [k, val] of Object.entries(o)) if (!['size', 'color'].includes(k)) (extra.opts ||= {})[k] = val;
      push(v.sku, extra);
    }
    for (const [k, sku] of Object.entries(a.skusBySize || {})) {
      const door = /double/i.test(k) ? 'double' : /standard/i.test(k) ? 'standard' : undefined;
      const code = k.replace(/(standard|double) door/i, '').trim().replace(/\s+/g, '');
      const side = k.match(/^(\d) m side$/);
      push(sku, side ? {side: Number(side[1])} : {sizes: [code], ...(door ? {door} : {})});
    }
    for (const [k, v] of Object.entries(a.skusByColour || {})) {
      // CasaNova nests hinge -> colour -> sku; the sauna module is hinge -> sku.
      if (v && typeof v === 'object') for (const [c, sku] of Object.entries(v)) push(sku, {colour: COLOUR_ID[c] || c, hinge: k.toLowerCase()});
      else if (/^(left|right)$/i.test(k)) push(v, {hinge: k.toLowerCase()});
      else push(v, {colour: COLOUR_ID[k] || k});
    }
    if (!rows.length && a.sku) push(a.sku, a.fits ? {sizes: a.fits.map(f => String(f).replace(/\s+/g, ''))} : {});
    if (!rows.length && Array.isArray(a.skus)) for (const k of a.skus) push(k);
    list[a.name.trim()] = rows;
  }
}
const prices = {};
for (const k of [...used].sort()) { const p = GB.get(k); prices[k] = [p.price_gbp_inc_vat, p.title.replace(/\s+/g, ' ').trim()]; }
for (const [k, [price, title]] of Object.entries(listOnly)) if (!prices[k]) prices[k] = [price, title];
console.log('from the GB price list only:', Object.entries(listOnly).map(([k, v]) => `${k} ${v[0]} ${v[2]}`).join('; '));
const head = '// Generated by tools/build-catalog-data.mjs from research captured 13 Oct 2026. Do not edit.\n';
await writeFile('src/data/sizes.js', head + `// Every published UK size of the six ranges: code, door variant, exterior/interior cm (W x D x H, W = the door side),\n// effective m², foundation cm, weight kg and the SKU per colour.\nexport const SIZES = ${JSON.stringify(out)};\n`);
await writeFile('src/data/accessories.js', head + `// Every accessory the research lists for each range, as Biohort SKUs by size, colour and door. catalog.js picks\n// from these by name; tests/catalog.test.mjs proves each option resolves for every size and colour it offers.\nexport const ACCESSORY_SKUS = ${JSON.stringify(accessories)};\n`);
await writeFile('src/data/prices.js', head + `// GB prices in pounds including 20% VAT, with Biohort's article title, from their configurator's pricing endpoint\n// (${index.source}, fetched ${index.fetched}).\nexport const PRICES = ${JSON.stringify(prices)};\n`);
console.log(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.length])), Object.keys(prices).length, 'SKUs priced');
