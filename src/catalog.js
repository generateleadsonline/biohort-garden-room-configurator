// Biohort garden buildings: the one design model shared by the page, the 3D scene, the PDF and the
// Netlify functions. Every range, size, colour and price is traceable to Biohort's own sources,
// read 13 Oct 2026 (research/):
//   catalogue/<range>.json   GB product pages (?country_id=gb): sizes, data sheets, accessories
//   roomle/<range>.md        their Roomle 3D configurator: option rules, included parts, add-ons
//   roomle/raw/gb-configurator-prices.json   every GB SKU priced by their configurator's own endpoint
//   Endkundenpreisliste_gb.pdf / _cn_GB.pdf  their 2026 GB price lists
// Sizes, SKUs and prices are generated into src/data/ (tools/build-catalog-data.mjs): nothing here
// types a price. An option without a published price is marked "Quoted" and never given a number.
// Where sources disagree, docs/CONFIRMATIONS.md records it. Keep ids stable: they live in share links.
import {SIZES} from './data/sizes.js';
import {PRICES} from './data/prices.js';
import {ACCESSORY_SKUS} from './data/accessories.js';

export const COMPANY = {
  name: 'Biohort',
  legal: 'Biohort GmbH, Pürnstein 43, 4120 Neufelden, Austria',
  phone: '+43 7282 7788 0',
  tel: '+43728277880',
  email: 'office@biohort.at',
  website: 'https://www.biohort.com/gb-en/',
  dealers: 'https://www.biohort.com/gb-en/contact/dealer-search',
  contact: 'https://www.biohort.com/gb-en/contact',
  assembly: 'https://www.biohort.com/gb-en/service/assembly-service',
  foundations: 'https://www.biohort.com/gb-en/service/foundation-tips',
  privacy: 'https://www.biohort.com/gb-en/data-protection',
  terms: 'https://www.biohort.com/gb-en/gtc',
  guarantee: 'https://www.biohort.com/gb-en/guarantee-conditions',
  catalogue: 'https://www.biohort.com/asset/downloads/files/Prospekte/Gesamtprospekte/Biohort-Product-Catalogue-EN.pdf',
  casanovaBrochure: 'https://www.biohort.com/asset/downloads/files/Prospekte/CasaNova_Prospekte/Biohort_CasaNova_EN.pdf',
  priceList: 'https://www.biohort.com/asset/Inhalte/Allgemeine-Seiten/Preislisten/Endkundenpreisliste_gb.pdf',
  priceListCasaNova: 'https://www.biohort.com/asset/Inhalte/Allgemeine-Seiten/Preislisten/Endkundenpreisliste_cn_GB.pdf',
  registered: 'Biohort GmbH, Neufelden, Austria. FN 453820 h, Regional Court Linz. VAT ATU 71089323'
};

// Swatch values sampled from Biohort's own colour chips (research/photos/_colours); `render` is the
// base colour the 3D uses under its lighting, from the median of each colour's studio renders.
export const COLOURS = {
  silver: {name: 'Metallic silver', hex: '#c8c9cb', render: '#bfc0c2'},
  quartz: {name: 'Metallic quartz grey', hex: '#9fa0a2', render: '#8f8e8a'},
  darkgrey: {name: 'Metallic dark grey', hex: '#6b6c6e', render: '#4f5052'},
  darkgreen: {name: 'Dark green', hex: '#396755', render: '#25503d'}
};

// Verified selling points (product pages, price lists, brochures), beside the step each supports.
export const USPS = {
  range: [
    {title: 'Made in Austria since 1980', text: 'Every Biohort building is made at the family company in Neufelden, Upper Austria.'},
    {title: '20-year guarantee', text: 'Maintenance-free for life, with a 20-year guarantee subject to Biohort\'s warranty terms and conditions.'}
  ],
  size: [
    {title: 'Double the steel', text: 'Double the sheet steel thickness compared to low-cost providers, galvanised with at least 150 g/m² of zinc and enamel coated.'},
    {title: 'Snow load up to 150 kg/m²', text: 'Storm-proof up to wind force 12 with professional assembly and anchoring (HighLine, AvantGarde, Panorama, Neo).'}
  ],
  colour: [
    {title: 'Colour that lasts', text: 'Polyamide enamel coating over galvanised steel, with stainless steel screws and hinges.'},
    {title: 'Grey white inside', text: 'Every range is grey white inside, so even a dark grey shed is bright to work in.'}
  ],
  openings: [
    {title: '3-way locking', text: 'Stainless steel door handle with a standard cylinder, a 3-way locking mechanism and a spare key (HighLine, AvantGarde, Panorama, Neo).'},
    {title: 'Doors that hold themselves', text: 'A gas spring helps the door open and close and holds it open or shut.'}
  ],
  roof: [
    {title: 'Built-in gutters', text: 'Integrated gutters with leaf traps and a hose connection; downpipe sets are an option.'},
    {title: 'Light from above', text: 'Acrylic glass skylights bring daylight inside: all round on HighLine, Panorama and CasaNova, across the front on AvantGarde.'}
  ],
  base: [
    {title: 'SmartBase: no concrete', text: 'Biohort\'s SmartBase and SmartBase PLUS foundations go down without concrete; SmartBase PLUS screws into the ground.'},
    {title: 'Aluminium floor', text: 'An aluminium floor frame with chequer-plate floor panels keeps the floor dry and level.'}
  ],
  inside: [
    {title: 'Storage included', text: 'Two shelves, two support rails, tool hangers and tool holders come with HighLine, AvantGarde and Panorama.'},
    {title: 'Room for bikes', text: 'BikeMax hangers, BikeHolder racks and the BikeLift store bicycles off the floor.'}
  ],
  price: [
    {title: 'Free delivery in Great Britain', text: 'Free kerbside delivery of garden sheds to mainland Great Britain, usually within 3 weeks. CasaNova delivery is confirmed when you order.'},
    {title: 'Prices including VAT', text: 'Biohort\'s published UK prices, including 20% VAT, from their own configurator and 2026 price list.'}
  ]
};

// ---- Ranges -------------------------------------------------------------------------------------
// `walls` gives the building's construction in metres, from Biohort's dimension tables
// (research/photos/FINDINGS.md): `grid` is the wall module doors and windows snap to.
export const RANGES = {
  highline: {
    id: 'highline', name: 'HighLine', family: 'Garden shed', roof: 'flat', tagline: 'Flat roof with an all-round skylight',
    text: 'Biohort\'s flat-roofed design shed: a 360° acrylic glass skylight under the roof, a gas-spring door and storage built in. The roof surface is always metallic quartz grey.',
    product: 'https://www.biohort.com/gb-en/p/garden-shed-highline', configurator: 'https://www.biohort.com/gb-en/r/konfigurator/B212BK',
    colours: ['silver', 'quartz', 'darkgrey'], defaultSize: 'H3', grid: .08, photo: '/assets/photos/highline'
  },
  avantgarde: {
    id: 'avantgarde', name: 'AvantGarde', family: 'Garden shed', roof: 'pent', tagline: 'Sloping roof with a front skylight',
    text: 'A pent roof that rises over the door, with a clear acrylic skylight across the front. Also made as the AvantGarde ECO*, with a corrugated door and a 2-way lock.',
    product: 'https://www.biohort.com/gb-en/p/garden-shed-avantgarde', configurator: 'https://www.biohort.com/gb-en/r/konfigurator/B212BT',
    colours: ['silver', 'quartz', 'darkgrey'], defaultSize: 'A6', grid: .08, photo: '/assets/photos/avantgarde'
  },
  europa: {
    id: 'europa', name: 'Europa', family: 'Garden shed', roof: 'apex', tagline: 'The classic apex roof, at a reasonable price',
    text: 'Tried and tested for decades: an apex roof, ribbed steel walls and a double door on every size. The only range made in dark green.',
    product: 'https://www.biohort.com/gb-en/p/garden-shed-europa', configurator: 'https://www.biohort.com/gb-en/r/konfigurator/7425D6',
    colours: ['silver', 'quartz', 'darkgrey', 'darkgreen'], defaultSize: '3', grid: .36, photo: '/assets/photos/europa'
  },
  panorama: {
    id: 'panorama', name: 'Panorama', family: 'Garden shed', roof: 'apex', tagline: 'Apex roof with a continuous skylight',
    text: 'An apex roof lifted on a continuous acrylic glass skylight that runs all the way round and fills both gables.',
    product: 'https://www.biohort.com/gb-en/p/garden-shed-panorama', configurator: 'https://www.biohort.com/gb-en/r/konfigurator/865AA3',
    colours: ['silver', 'quartz', 'darkgrey'], defaultSize: 'P3', grid: .08, photo: '/assets/photos/panorama'
  },
  neo: {
    id: 'neo', name: 'Neo', family: 'Garden shed', roof: 'neo', tagline: 'Smooth walls, flat roof, 16 sizes',
    text: 'Clean, smooth panels on a 56cm grid, a flat roof with a wooden ceiling, and a glazed strip in the door. Sixteen sizes from 1.8m to 3.48m square.',
    product: 'https://www.biohort.com/gb-en/p/garden-shed-neo', configurator: 'https://www.biohort.com/gb-en/r/konfigurator/C685BC',
    colours: ['silver', 'quartz', 'darkgrey'], defaultSize: '2B', grid: .28, photo: '/assets/photos/neo'
  },
  casanova: {
    id: 'casanova', name: 'CasaNova', family: 'Garden house', roof: 'casanova', tagline: 'Insulated garden house, 40mm walls',
    text: 'Biohort\'s insulated steel garden house: 40mm sandwich walls, an EPDM flat roof for 215 kg/m², and doors, glazing and windows placed module by module.',
    product: 'https://www.biohort.com/gb-en/p/casanova', configurator: 'https://www.biohort.com/gb-en/r/konfigurator/FF4232',
    colours: ['quartz', 'darkgrey'], defaultSize: '3x4', grid: 1, photo: '/assets/photos/casanova'
  }
};
export const RANGE_ORDER = ['highline', 'avantgarde', 'europa', 'panorama', 'neo', 'casanova'];
export const MODELS = {classic: {name: 'AvantGarde', text: 'Gas-spring door, 3-way lock, shelves, tool hangers and tool holders included.'}, eco: {name: 'AvantGarde ECO*', text: 'Corrugated door, T-handle cylinder lock with 2-way locking, door hooks instead of a gas spring. Standard equipment not included. *Model name, not an environmental claim.'}};

// ---- Sizes: grouped from the generated data --------------------------------------------------------
const sizeKey = c => String(c).replace(/\s+/g, '');
/** All variants of a range's size code: [{door, model, hinge, ext, int, area, base, kg, sku, opening}]. */
export function variantsOf(range, code) { return SIZES[range].filter(r => r.code === sizeKey(code)); }
export function sizeCodes(range) { return [...new Set(SIZES[range].map(r => r.code))]; }
const NATURAL = {highline: ['HS', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'], europa: ['1', '2', '2A', '3', '4', '4A', '5', '6', '7']};
export function sizeOrder(range) {
  const codes = sizeCodes(range);
  if (NATURAL[range]) return NATURAL[range].filter(c => codes.includes(c));
  if (range === 'neo') return codes.sort((a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]));
  return codes;
}
export const sizeLabel = (range, code) => (range === 'casanova' ? `${code.replace('x', ' x ')} m` : code);

// ---- Design state ---------------------------------------------------------------------------------
// Doors and windows beyond the building's own door live in `openings`: [{id, kind, wall, p, hinge, glass}],
// p the centre along the wall from its left end as you face it, 0..1.
export const WALLS = {front: 'Front', left: 'Left side', right: 'Right side', back: 'Back'};
export const WALL_ORDER = ['front', 'left', 'right', 'back'];

// Wall elements per range: width (m) for fitting, and the SKU line each adds.
export const KINDS = {
  door: {name: 'Additional door', w: .8, group: 'door'},
  double: {name: 'Additional double door', w: 1.6, group: 'door'},
  window: {name: 'Window unit', w: .815, group: 'window'},
  glassPanel: {name: 'Acrylic glass panel', w: .32, group: 'window'},
  glassElement: {name: 'Glass element', w: 1.0, group: 'window'},
  tiltWindow: {name: 'Tilt and turn window', w: 1.0, group: 'window'}
};

/** The wall elements each range offers, with Biohort's sizes and rules. */
export function kindsFor(s) {
  const r = s.range, code = s.size;
  switch (r) {
    case 'highline': return ['door', ...(code === 'HS' ? [] : ['double']), ...(code === 'HS' || code === 'H1' ? [] : ['window'])];
    case 'avantgarde': return ['door', ...(['A5', 'A6', 'A7', 'A8'].includes(code) ? ['double'] : []), ...(['A1', 'A2'].includes(code) ? [] : ['window'])];
    case 'europa': return ['double', ...(['1', '2A'].includes(code) ? [] : ['window'])];
    case 'panorama': return ['door', 'double', 'window'];
    case 'neo': return ['door', ...(code[1] !== 'A' && s.door !== 'double' ? ['double'] : []), 'glassPanel'];
    case 'casanova': return ['door', 'glassElement', 'tiltWindow'];
    default: return [];
  }
}
export function kindWidth(s, kind) {
  if (kind === 'double') return {europa: 1.42, neo: 1.73, casanova: 2.0}[s.range] ?? (s.range === 'avantgarde' && ['A1', 'A2', 'A3', 'A4'].includes(s.size) ? 1.45 : 1.61);
  if (kind === 'door') return {casanova: 1.0, neo: .89}[s.range] ?? .82;
  return KINDS[kind].w;
}

/** Exterior and wall sizes in metres. W is the door wall. */
export function dims(s) {
  const v = variantsOf(s.range, s.size).find(x => x.door === (s.range === 'europa' ? 'double' : s.door === 'double' && s.range !== 'casanova' ? 'double' : 'standard')) || variantsOf(s.range, s.size)[0];
  const [W, D, H] = v.ext.map(n => n / 100);
  // Biohort's Neo data sheet prints the 3B standard-door interior scrambled (276 x 208 x 220,
  // 4.58m²) and both 3B foundations as 229 x 217cm, which cannot fit a 2.92m-long shed. The
  // double-door row agrees with the size selector (6.07m²); the foundation is left to Biohort's plan.
  // Both are in docs/CONFIRMATIONS.md.
  const errata = s.range === 'neo' && s.size === '3B';
  const vi = errata ? variantsOf('neo', '3B').find(x => x.door === 'double') : v;
  const [iw, id, ih] = (vi.int || vi.ext).map(n => n / 100);
  // Wall faces from the roof size, per Biohort's dimension tables.
  const roofOver = {highline: .105, avantgarde: .03, europa: .1, panorama: .08, neo: .0475, casanova: .12}[s.range];
  let ww = W - 2 * roofOver, wd = D - 2 * roofOver;
  if (s.range === 'europa') wd = D - .04;
  if (s.range === 'avantgarde') wd = D - (D * 100 >= 380 ? .46 : .46);
  if (s.range === 'panorama') wd = D - .24;
  if (s.range === 'neo') { ww = W - .095; wd = D - .095; }
  if (s.range === 'casanova') { ww = W - .24; wd = D - .24; }
  return {W, D, H, iw, id, ih, ww: round3(ww), wd: round3(wd), area: vi.area, base: errata ? null : v.base, kg: v.kg, opening: v.opening};
}
const round3 = v => Math.round(v * 1000) / 1000;
export const wallLength = (s, wall) => { const d = dims(s); return wall === 'front' || wall === 'back' ? d.ww : d.wd; };

const MAIN_P = {highline: {HS: .5, H6: .62}, avantgarde: {A5: .64, A6: .64, A7: .64, A8: .64}, panorama: {}, neo: {}, europa: {}, casanova: {}};
/** Biohort's standard door position: their dimension tables' left/right wall widths. */
export function defaultDoorP(s) {
  const o = MAIN_P[s.range]?.[s.size];
  if (o) return o;
  if (s.range === 'highline' || s.range === 'panorama') return s.door === 'double' ? .5 : (1.27 + .4) / 2.54;
  if (s.range === 'neo') { const L = dims(s).ww; return s.door === 'double' ? .5 : (L - .33 - .44) / L; }
  return .5;
}

export const DEFAULT_RANGE = 'highline';
function baseState(range = DEFAULT_RANGE) {
  const R = RANGES[range];
  return {
    v: 1, range, model: 'classic', size: R.defaultSize, colour: R.colours.includes('darkgrey') ? 'darkgrey' : R.colours[0],
    door: range === 'europa' ? 'double' : 'standard', hinge: 'right', doorWall: 'front', doorP: null, doorGlass: false, gate: 'none',
    openings: [], canopy: {left: 'none', right: 'none'}, canopyWalls: {left: {back: false, side: false}, right: {back: false, side: false}},
    downpipe: 'none', foundation: 'none', floorPlate: false, anchors: false,
    pv: false, skylight: false, roofSupport: false, extLight: {front: false, left: false, right: false, back: false},
    gasSpring: false, panelling: false, insulation: false, sauna: 'none', led: 0, solar: 0, floraboard: 0, canopyGlass: 0, canopyFlora: 0, ramp: false,
    items: {}, step: 0
  };
}
export const clone = v => JSON.parse(JSON.stringify(v));
const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);
const int = (v, lo, hi) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo; };
const num = (v, lo, hi, f) => { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : f; };

// ---- Accessory SKUs ---------------------------------------------------------------------------------
// Each option names the research record it comes from; `resolve` picks the one SKU that fits the
// design's size, colour, door, model and hinge. Tests prove every offered option resolves.
function rows(range, name) { return ACCESSORY_SKUS[range]?.[name] || []; }
export function resolve(s, name, {opts = {}, size = s.size, hinge, side} = {}) {
  const list = rows(s.range, name).filter(r => !r.missing).filter(r =>
    (!r.sizes || r.sizes.map(sizeKey).includes(sizeKey(size))) &&
    (!r.colour || r.colour === s.colour) &&
    (!r.door || r.door === (s.door === 'double' ? 'double' : 'standard')) &&
    (!r.hinge || r.hinge === (hinge || s.hinge)) &&
    (r.side === undefined || r.side === side) &&
    Object.entries(opts).every(([k, v]) => r.opts?.[k] === v));
  return list.length ? list[0].sku : null;
}
export const priceOf = sku => (sku && PRICES[sku] ? PRICES[sku][0] : null);
export const titleOf = sku => (sku && PRICES[sku] ? PRICES[sku][1] : '');

// Inside fittings: counts beyond what the building includes. `n` names the research record per range;
// `pack` is what one count buys. Where Biohort's configurator includes some, `included` says how many.
const ALL_SHEDS = ['highline', 'avantgarde', 'europa', 'panorama'];
export const ITEMS = {
  shelves: {name: 'Shelves, 24.5cm deep', pack: 'pair', max: 8, tag: 'shelves', text: 'Galvanised shelves that hang on the support rails, 15kg each.',
    src: {highline: ['Shelves', {'package-unit': '2 pcs standard'}], avantgarde: ['Shelves', {'package-unit': '2 pcs standard'}], europa: ['Shelves', {'package-unit': '2 pcs standard'}], panorama: ['Shelves 2 pieces per package'], neo: ['Shelves 2 pieces per package (grey white)'], casanova: ['Shelves 2 pieces per package']}},
  deepShelves: {name: 'Shelves, 43.5cm deep', pack: 'pair', max: 6, tag: 'shelves', text: 'Deeper shelves for boxes and garden equipment.',
    src: {highline: ['Shelves', {'package-unit': '2 pcs deep'}], avantgarde: ['Shelves', {'package-unit': '2 pcs deep'}], europa: ['Shelves', {'package-unit': '2 pcs deep'}], panorama: ['Shelves 2 pieces per package (deep)'], neo: ['Shelves 2 pieces per package, deep (grey white)'], casanova: ['Shelves 2 pieces per package (deep)']}},
  cornerShelves: {name: 'Short corner shelves, 93cm', pack: 'pair', max: 4, tag: 'shelves', text: 'Short shelves that fit the corners of a CasaNova.', src: {casanova: ['Short Shelves 2 pieces per package (in corner)']}},
  cornerDeepShelves: {name: 'Short corner shelves, deep', pack: 'pair', max: 4, tag: 'shelves', text: 'Deep short shelves for the corners.', src: {casanova: ['Short Shelves 2 pieces per package, deep (in corner)']}},
  rails: {name: 'Support rails', pack: 'pair', max: 6, tag: 'rails', text: 'Wall rails that carry shelves, baskets, hooks and the folding table.',
    src: {highline: ['Garden Shed Support Rail (2 pieces)'], avantgarde: ['Garden Shed Support Rail (2 pieces)'], europa: ['Support Rail for Europa and Equipment Locker (2 pieces)'], panorama: ['Shelf Support Rails 2 pieces per package'], casanova: ['Shelf Support Rails 2 pieces per package']}},
  toolHangers: {name: 'Tool hangers', pack: 'set of 4', max: 4, tag: 'toolHangers', text: 'Hang rakes, brooms and spades on the wall.',
    src: {highline: [null, '47020'], avantgarde: [null, '47020'], europa: [null, '47020'], panorama: ['Tool Hangers 4 pieces per package'], neo: ['Tool Hangers 2 pieces per package']}},
  toolHolders: {name: 'Tool holders for the door', pack: 'pair', max: 3, tag: 'toolHolders', text: 'Holders on the inside of the door panel for small tools.',
    src: {highline: ['Tool Holder'], avantgarde: s => (s.model === 'eco' ? ['Neo/Eco Tool Holder'] : ['Tool Holder']), panorama: ['Tool Holder (2 pieces per package)'], neo: ['Tool Holder (2 pieces per package)']}},
  doorBaskets: {name: 'Door baskets', pack: 'pair', max: 2, tag: 'doorBaskets', text: 'Baskets that hang on the door for gloves and small things.',
    src: {highline: ['Door baskets'], avantgarde: ['Door baskets'], europa: ['Door baskets'], panorama: ['Door Baskets 2 pieces per package'], neo: ['Door Baskets 2 pieces per package']}},
  shelfBaskets: {name: 'Shelf baskets', pack: 'pair', max: 3, tag: 'shelfBaskets', text: 'Wire baskets that hang on the support rails.',
    src: {highline: ['Shelf baskets'], avantgarde: ['Shelf baskets'], europa: ['Shelf baskets'], panorama: ['Shelf Baskets 2 pieces per package'], neo: ['Shelf Baskets 2 pieces per package']}},
  hookSet: {name: 'Hook set', pack: 'set', max: 3, tag: 'hooks', text: 'A combination hook, a handle hook and a shovel hook.',
    src: {highline: ['Hook Set'], avantgarde: ['Hook Set'], europa: ['Hook Set'], panorama: ['Hook Set'], neo: ['Hook Set'], casanova: ['Hook Set']}},
  cornerHookSet: {name: 'Hook set for the corner', pack: 'set', max: 2, tag: 'hooks', text: 'A hook set on a short corner rail.', src: {casanova: ['Hook Set (in corner)']}},
  suspension: {name: 'Suspension basket', pack: 'basket', max: 2, tag: 'suspension', text: 'A hanging bag for small objects.',
    src: {highline: ['Suspension Basket'], avantgarde: ['Suspension Basket'], europa: ['Suspension Basket'], panorama: ['Suspension Basket'], neo: ['Suspension Basket']}},
  mountPanel: {name: 'Electrical mounting panel', pack: 'panel', max: 2, tag: 'mountPanel', text: 'A wall panel that hides cable runs for sockets and switches.',
    src: {highline: ['Electrical Mounting Panel'], avantgarde: ['Electrical Mounting Panel'], europa: [null, '46031'], panorama: ['Electric Mounting Panel'], neo: ['Electric Mounting Panel'], casanova: ['Electric Mounting Panel, uncoated']}},
  mountPanelCoated: {name: 'Electrical mounting panel, grey white', pack: 'panel', max: 2, tag: 'mountPanel', text: 'The mounting panel coated grey white to match the walls.', src: {casanova: ['Electric Mounting Panel, grey white coated']}},
  table: {name: 'Folding table', pack: 'table', max: 1, tag: 'table', text: 'A sturdy worktop that folds flat against the wall.',
    src: {highline: [null, '40011'], avantgarde: [null, '40011'], europa: [null, '40011'], panorama: ['Folding Table'], casanova: ['Folding Table']}},
  bikeMax: {name: 'BikeMax bicycle hanger', pack: 'hanger', max: 4, tag: 'bikes', text: 'Hangs a bike by its wheel from the wall, up to 29" wheels.',
    src: {highline: ['"BikeMax" Bicycle Hanger', {'package-unit': '1 pc'}], avantgarde: ['"BikeMax" Bicycle Hanger', {'package-unit': '1 pc'}], europa: ['"BikeMax" Bicycle Hanger, Europa Garden Shed', {'package-unit': '1 pc'}], panorama: ['Bicycle Hanger BikeMax 1 piece per package'], neo: ['Bicycle Hanger BikeMax 1 piece per package'], casanova: ['Bicycle Hanger BikeMax 1 piece per package']},
    pair: {highline: ['"BikeMax" Bicycle Hanger', {'package-unit': '2 pcs'}], avantgarde: ['"BikeMax" Bicycle Hanger', {'package-unit': '2 pcs'}], europa: ['"BikeMax" Bicycle Hanger, Europa Garden Shed', {'package-unit': '2 pcs'}], panorama: ['Bicycle Hanger BikeMax 2 pieces per package'], casanova: ['Bicycle Hanger BikeMax 2 pieces per package']}},
  bikeHolder: {name: 'BikeHolder bicycle rack', pack: 'rack', max: 1, tag: 'bikes', text: 'A floor rack that holds bikes upright by the front wheel.',
    src: {highline: [null, '49012'], avantgarde: [null, '49012'], europa: [null, '49012'], panorama: ['Bike Rack BikeHolder, set for 3 bikes'], neo: ['Bike Rack BikeHolder, set for 2 bikes']}},
  binBag: {name: 'Bin bag holder', pack: 'holder', max: 1, tag: 'binBag', text: 'Holds a bin bag open on the wall.',
    src: {highline: ['Bin bag holder for equipment locker, Europa, HighLine, AvantGarde and Panorama'], avantgarde: ['Bin bag holder for equipment locker, Europa, HighLine, AvantGarde and Panorama'], europa: ['Bin bag holder for equipment locker, Europa, HighLine, AvantGarde and Panorama'], panorama: ['Bin Bag Holder'], neo: ['Bin Bag Holder']}}
};
// What the building includes (Roomle "IGNORE" parts and the price lists' standard equipment).
export const INCLUDED = {
  highline: {shelves: 1, rails: 1, toolHangers: 1, toolHolders: 1},
  avantgarde: {shelves: 1, rails: 1, toolHangers: 1, toolHolders: 1},
  europa: {shelves: 1, rails: 1, toolHangers: 1},
  panorama: {shelves: 1, rails: 1, toolHangers: 1, toolHolders: 1},
  neo: {shelves: 1, toolHangers: 1, toolHolders: 1},
  casanova: {}
};
export function includedOf(s) { return s.range === 'avantgarde' && s.model === 'eco' ? {} : INCLUDED[s.range]; }
export function itemsFor(range) { return Object.keys(ITEMS).filter(k => ITEMS[k].src[range]); }
function itemSku(s, key, which = 'src') {
  let spec = ITEMS[key][which]?.[s.range];
  if (typeof spec === 'function') spec = spec(s);
  if (!spec) return null;
  const [name, opts] = spec;
  if (name === null) return opts; // a SKU taken from Biohort's configurator add-on list, not the page
  return resolve(s, name, {opts: opts || {}});
}
/** How many of a fitting a design can take. Tool holders: Biohort allows four or five per door leaf,
 * and two come with the building, so one more pair on a single door, three on a double door. */
export function itemMax(s, key) {
  if (key === 'toolHolders') return s.door === 'double' || s.range === 'europa' ? 3 : 1;
  return ITEMS[key].max;
}
/** Size limits on inside fittings, from the product pages and Biohort's configurator. */
export function itemFits(s, key) {
  if (s.range === 'casanova' && ['shelves', 'deepShelves', 'hookSet', 'table'].includes(key)) return !['3x2', '4x2'].includes(s.size);
  if (s.range === 'highline' && key === 'table') return !['HS', 'H1'].includes(s.size);
  return true;
}

// Biohort's own ground-anchor counts for gravel (data sheets), bought in packs of 4 and 6.
const ANCHORS = {
  highline: {HS: 8, H1: 8, H2: 10, H3: 10, H4: 12, H5: 12, H6: 12},
  avantgarde: {A1: 8, A2: 10, A3: 10, A4: 12, A5: 10, A6: 10, A7: 12, A8: 12},
  europa: {1: 4, 2: 6, '2A': 6, 3: 8, 4: 8, '4A': 8, 5: 10, 6: 10, 7: 12}
};
export const anchorCount = s => ANCHORS[s.range]?.[s.size] || 0;
function anchorPacks(n) { let best = null; for (let six = 0; six <= 4; six++) for (let four = 0; four <= 4; four++) { if (six * 6 + four * 4 < n) continue; const cost = six * 29 + four * 20; if (!best || cost < best.cost) best = {six, four, cost}; } return best; }

// ---- Options available per range and size ----------------------------------------------------------
export function canopyOptions(s) {
  if (s.range === 'highline') return ['HS', 'H1'].includes(s.size) ? [] : ['none', 'S', 'L'];
  if (s.range === 'avantgarde') return ['none', 'L'];
  if (s.range === 'europa') return ['1', '2A'].includes(s.size) ? [] : ['none', 'on'];
  if (s.range === 'neo') return s.size[0] === '1' ? [] : ['none', 'on'];
  return [];
}
export const hasCanopyWalls = s => ['highline', 'avantgarde', 'neo'].includes(s.range);
export function downpipeOptions(s) {
  if (['highline', 'panorama', 'europa'].includes(s.range)) return ['none', 'front', 'rear'];
  if (s.range === 'avantgarde') return ['none', 'rear'];
  if (s.range === 'casanova') return ['rear', 'front'];
  return [];
}
export function foundationOptions(s) { return s.range === 'casanova' ? ['none', 'frame'] : ['none', 'frame', 'smartbase', 'smartbaseplus']; }
export const FOUNDATIONS = {
  none: {name: 'Your own base', text: 'A concrete slab or point foundations to Biohort\'s plan, or paving. Not supplied.'},
  frame: {name: 'Aluminium floor frame', text: 'Square aluminium tubing on your base; add floor panels for a sealed metal floor.'},
  smartbase: {name: 'SmartBase', text: 'Aluminium boards and frame on adjustable feet: no concrete needed, 200 kg/m².'},
  smartbaseplus: {name: 'SmartBase PLUS', text: 'SmartBase on galvanised ground screws, 15cm height adjustable, with a screw-in driver.'}
};
export const doorWallOptions = s => {
  if (s.range === 'highline') return ['HS', 'H1'].includes(s.size) || (s.door === 'double' && ['H2', 'H3'].includes(s.size)) ? ['front'] : ['front', 'left', 'right'];
  if (s.range === 'neo') return s.door === 'double' && s.size[1] === 'A' ? ['front'] : ['front', 'left', 'right'];
  if (s.range === 'casanova') return ['front', 'left', 'right', 'back'];
  return ['front'];
};
export const hasDoubleDoor = s => s.range === 'europa' || (s.range === 'highline' && s.size !== 'HS') || ['avantgarde', 'panorama'].includes(s.range) || (s.range === 'neo' && s.size[1] !== 'A');

// ---- Normalise ----------------------------------------------------------------------------------------
/** Any input (a saved design, a share link, a form post) to a complete, valid design. */
export function normalise(input = {}) {
  const i = input && typeof input === 'object' ? input : {};
  const range = pick(i.range, RANGE_ORDER, DEFAULT_RANGE), R = RANGES[range];
  const s = baseState(range);
  s.model = range === 'avantgarde' ? pick(i.model, ['classic', 'eco'], 'classic') : 'classic';
  s.size = pick(sizeKey(i.size ?? ''), sizeCodes(range), R.defaultSize);
  s.colour = pick(i.colour, R.colours, s.colour);
  s.door = range === 'europa' ? 'double' : range === 'casanova' ? pick(i.door, ['standard', 'double'], 'standard') : pick(i.door, ['standard', 'double'], 'standard');
  if (s.door === 'double' && range !== 'casanova' && !hasDoubleDoor(s)) s.door = 'standard';
  s.hinge = pick(i.hinge, ['right', 'left'], 'right');
  if (range === 'panorama' && s.door === 'double') s.hinge = 'right';
  if (!['casanova', 'panorama'].includes(range)) s.hinge = 'right';
  s.gate = range === 'casanova' && !['3x2', '4x2'].includes(s.size) ? pick(i.gate, ['none', 'manual', 'electric'], 'none') : 'none';
  if (s.gate !== 'none') s.door = 'standard';
  s.doorWall = pick(i.doorWall, doorWallOptions(s), 'front');
  s.doorGlass = range === 'casanova' && s.gate === 'none' && Boolean(i.doorGlass);
  s.doorP = Number.isFinite(Number(i.doorP)) && i.doorP !== null ? num(i.doorP, 0, 1, null) : null;
  const canopy = canopyOptions(s);
  for (const k of ['left', 'right']) {
    s.canopy[k] = canopy.length ? pick(i.canopy?.[k], canopy, 'none') : 'none';
    const on = s.canopy[k] !== 'none' && hasCanopyWalls(s);
    s.canopyWalls[k] = {back: on && Boolean(i.canopyWalls?.[k]?.back), side: on && Boolean(i.canopyWalls?.[k]?.side)};
  }
  const anyCanopy = s.canopy.left !== 'none' || s.canopy.right !== 'none';
  s.downpipe = pick(i.downpipe, downpipeOptions(s), downpipeOptions(s)[0] || 'none');
  if (range === 'europa' && s.canopy.left !== 'none' && s.canopy.right !== 'none') s.downpipe = 'none';
  if (range === 'highline' && s.downpipe === 'rear') for (const k of ['left', 'right']) s.canopyWalls[k].back = false;
  s.foundation = pick(i.foundation, foundationOptions(s), 'none');
  s.floorPlate = s.foundation === 'frame' && Boolean(i.floorPlate);
  s.anchors = Boolean(ANCHORS[range]) && s.foundation === 'none' && Boolean(i.anchors);
  s.pv = range !== 'casanova' && Boolean(i.pv);
  s.skylight = range === 'casanova' && Boolean(i.skylight);
  s.roofSupport = range === 'casanova' && Boolean(i.roofSupport);
  for (const k of WALL_ORDER) s.extLight[k] = range === 'casanova' && Boolean(i.extLight?.[k]);
  s.gasSpring = ((range === 'avantgarde' && s.model === 'eco') || (range === 'europa' && s.size !== '2A')) && Boolean(i.gasSpring);
  s.panelling = range === 'neo' && Boolean(i.panelling);
  s.insulation = s.panelling && Boolean(i.insulation);
  s.sauna = range === 'casanova' && !['3x2', '4x2'].includes(s.size) ? pick(i.sauna, ['none', 'left', 'right'], 'none') : 'none';
  s.led = ['panorama', 'neo'].includes(range) ? int(i.led, 0, 2) : 0;
  s.solar = ['panorama', 'neo'].includes(range) ? int(i.solar, 0, 2) : 0;
  s.floraboard = ['highline', 'avantgarde', 'panorama', 'neo'].includes(range) ? int(i.floraboard, 0, 3) : 0;
  s.canopyGlass = range === 'neo' && anyCanopy ? int(i.canopyGlass, 0, 4) : 0;
  s.canopyFlora = range === 'neo' && anyCanopy ? int(i.canopyFlora, 0, 2) : 0;
  s.ramp = ['panorama', 'neo'].includes(range) ? Boolean(i.ramp) && s.door === 'double' && s.foundation === 'frame'
    : range === 'casanova' ? Boolean(i.ramp) && (s.door === 'double' || s.gate !== 'none') : false;
  for (const k of itemsFor(range)) { const v = int(i.items?.[k], 0, itemMax(s, k)); if (v && itemFits(s, k)) s.items[k] = v; }
  if (i.bikeLift && ['standard', 'swivel'].includes(i.bikeLift) && range !== 'casanova') s.bikeLift = range === 'europa' || range === 'highline' || range === 'avantgarde' ? 'standard' : i.bikeLift;
  else s.bikeLift = 'none';
  s.step = int(i.step, 0, 7);
  // Wall elements.
  const kinds = kindsFor(s);
  if (Array.isArray(i.openings)) {
    const seen = new Set();
    s.openings = i.openings.slice(0, 12).filter(o => o && kinds.includes(o.kind) && WALLS[o.wall]).map((o, k) => {
      const id = /^[a-z][a-z0-9]{0,7}$/.test(o.id) && !seen.has(o.id) ? o.id : `o${k + 1}`;
      seen.add(id);
      const out = {id, kind: o.kind, wall: o.wall, p: num(o.p, 0, 1, .5)};
      if (range === 'casanova' && ['door', 'tiltWindow'].includes(o.kind)) out.hinge = pick(o.hinge, ['right', 'left'], 'right');
      if (range === 'casanova' && o.kind === 'door') out.glass = Boolean(o.glass) && out.hinge === 'right';
      return out;
    });
  }
  if (range === 'neo' && s.door === 'double') s.openings = s.openings.filter(o => o.kind !== 'double');
  s.openings = fitOpenings(s, s.openings);
  return s;
}

/** The building's own door as a wall element, for fitting, the plan and the 3D. */
export function mainDoor(s) {
  const kind = s.gate !== 'none' ? 'gate' : s.door === 'double' || s.range === 'europa' ? 'double' : 'door';
  const w = kind === 'gate' ? 2.5 : kindWidth(s, kind === 'double' ? 'double' : 'door');
  const L = wallLength(s, s.doorWall);
  const p = s.doorP ?? defaultDoorP(s);
  return {id: 'main', kind, wall: s.doorWall, w, p: clampP(p, w, L, s)};
}
const EDGE = .06;
function clampP(p, w, L, s) {
  const grid = RANGES[s.range].grid;
  const half = w / 2, lo = EDGE + half, hi = L - EDGE - half;
  let c = Math.min(hi, Math.max(lo, p * L));
  if (grid >= .2) c = Math.min(hi, Math.max(lo, lo + Math.round((c - lo) / grid) * grid));
  return Math.round(c / L * 1e4) / 1e4;
}
export const openingWidth = (s, o) => (o.id === 'main' ? mainDoor(s).w : kindWidth(s, o.kind));

/** Pushes wall elements apart and inside their walls; drops ones that cannot fit beside the door. */
export function fitOpenings(s, list) {
  const main = mainDoor(s), out = [];
  for (const wall of WALL_ORDER) {
    const L = wallLength(s, wall), gap = .04;
    const items = list.filter(o => o.wall === wall).map(o => ({...o, w: kindWidth(s, o.kind)}));
    const fixed = main.wall === wall ? [{c: main.p * L, w: main.w}] : [];
    const placed = [];
    for (const o of items.sort((a, b) => a.p - b.p)) {
      let c = o.p * L;
      const free = x => fixed.concat(placed).every(f => Math.abs(x - f.c) >= (f.w + o.w) / 2 + gap) && x - o.w / 2 >= EDGE && x + o.w / 2 <= L - EDGE;
      let best = null;
      for (let k = 0; k <= 400 && best === null; k++) for (const sg of [1, -1]) { const x = c + sg * k * .01; if (free(x)) { best = x; break; } }
      if (best === null) continue;
      placed.push({c: best, w: o.w});
      out.push({id: o.id, kind: o.kind, wall: o.wall, p: Math.round(best / L * 1e4) / 1e4, ...(o.hinge ? {hinge: o.hinge} : {}), ...(o.glass !== undefined ? {glass: o.glass} : {})});
    }
  }
  return out;
}

// ---- Pricing --------------------------------------------------------------------------------------------
export const pounds = n => '£' + Math.round(n).toLocaleString('en-GB');
export const metres = n => `${+Number(n).toFixed(2)}m`;
const COLOUR_WORD = s => COLOURS[s.colour].name.toLowerCase();

/** The building's own SKU: range, size, door, model, hinge and colour. */
export function buildingSku(s) {
  const want = s.range === 'europa' ? 'double' : s.range === 'casanova' ? 'standard' : s.door;
  const v = variantsOf(s.range, s.size).find(x => x.door === want && (!x.model || x.model === s.model) && (!x.hinge || x.hinge === s.hinge));
  return v?.sku[s.colour] || null;
}

/** Every published line in the design: [{key, name, sku, qty, unit, total, note}], plus quoted items. */
export function linesFor(input) {
  const s = normalise(input), R = RANGES[s.range], lines = [], quoted = [];
  const add = (key, name, sku, qty = 1, note = '') => {
    if (!qty) return;
    const unit = priceOf(sku);
    if (unit === null) { quoted.push({key, name, qty, note: note || 'Not in the published GB price list'}); return; }
    lines.push({key, name, sku, qty, unit, total: unit * qty, title: titleOf(sku), note});
  };
  const quote = (key, name, note) => quoted.push({key, name, qty: 1, note});
  // Building.
  const b = buildingSku(s);
  const doorWord = s.range === 'casanova' ? `standard door, ${s.hinge} hinge` : s.door === 'double' || s.range === 'europa' ? 'double door' : 'standard door';
  add('building', `${R.name}${s.range === 'avantgarde' && s.model === 'eco' ? ' ECO*' : ''} ${sizeLabel(s.range, s.size)}, ${COLOUR_WORD(s)}, ${doorWord}`, b);
  // Doors.
  if (s.range === 'panorama' && s.door === 'standard' && s.hinge === 'left') add('hinge', 'Standard door with left door hinge', resolve(s, 'Standard Door with Left Door Hinge'));
  if (s.range === 'casanova') {
    if (s.door === 'double') add('doubleDoor', 'Double door panel', resolve(s, 'Double Door Panel', {hinge: s.hinge === 'right' ? 'left' : 'right'}));
    if (s.door === 'double' && s.doorWall !== 'front' && s.doorWall !== 'back') add('doubleSide', 'Side installation of the double door', resolve(s, 'Additional charge for side installation of the double door'));
    if (s.doorGlass) add('doorGlass', 'Glass insert for the door', resolve(s, 'Glass Insert for Door'));
    if (s.gate === 'manual') add('gate', 'Sectional overhead door, manual', resolve(s, 'Sectional Overhead Door, without electric opener'));
    // The price list offers the electric opener from 3 x 3; the brochure says "not for CasaNova 3 x 3".
    if (s.gate === 'electric' && s.size === '3x3') quote('gate', 'Sectional overhead door with electric opener', 'Biohort\'s price list and brochure disagree on 3 x 3: Biohort confirms');
    else if (s.gate === 'electric') add('gate', 'Sectional overhead door with electric opener', resolve(s, 'Sectional Overhead Door, with electric opener (including one remote)'));
  }
  const count = kind => s.openings.filter(o => o.kind === kind).length;
  const extraDoors = count('door') + count('double');
  if (s.range === 'highline') { add('doors', 'Additional door', resolve(s, 'Additional Door Garden Shed'), count('door')); if (count('double')) quote('doors', 'Additional double door', 'Offered in Biohort\'s configurator; no separate GB price published'); add('windows', 'Window unit', resolve(s, 'Window Unit Garden Shed'), count('window')); }
  if (s.range === 'avantgarde') { add('doors', 'Additional door', resolve(s, 'Additional Door Garden Shed AvantGarde Classic/ECO*', {opts: {variante: s.model === 'eco' ? 'AvantGarde ECO*' : 'AvantGarde'}}), count('door')); if (count('double')) quote('doors', 'Additional double door', 'Offered in Biohort\'s configurator for A5 to A8; no separate GB price published'); add('windows', 'Window unit', resolve(s, 'Window Unit Garden Shed'), count('window')); }
  if (s.range === 'europa') { add('doors', 'Additional double door', resolve(s, 'Additional Door Europa Garden Shed'), count('double')); add('windows', 'Window unit', resolve(s, 'Window Unit Europa Garden Shed'), count('window')); }
  if (s.range === 'panorama') { add('doors', 'Additional door', resolve(s, 'Additional Door'), count('door')); add('doors', 'Additional double door', resolve(s, 'Additional Door Double'), count('double')); add('windows', 'Window unit', resolve(s, 'Window Unit'), count('window')); }
  if (s.range === 'neo') { add('doors', 'Additional door', resolve(s, 'Additional Door'), count('door')); add('doors', 'Additional double door', resolve(s, 'Additional Double Door'), count('double')); add('glassPanels', 'Acrylic glass panel', resolve(s, 'Acrylic Glass Panel'), count('glassPanel')); }
  if (s.range === 'casanova') {
    for (const o of s.openings.filter(x => x.kind === 'door')) { add('doors', `Additional door, ${o.hinge} hinge`, resolve(s, 'Additional Door', {hinge: o.hinge})); if (o.glass) add('doorGlass', 'Glass insert for the additional door', resolve(s, 'Glass Insert for Door')); }
    add('glassElements', 'Glass element', resolve(s, 'Glass Element'), count('glassElement'));
    for (const o of s.openings.filter(x => x.kind === 'tiltWindow')) add('windows', `Tilt and turn window, ${o.hinge} hinge`, resolve(s, 'Tilt and Turn Window', {hinge: o.hinge}));
    if (s.door === 'double' && s.doorGlass) void 0;
  }
  if (s.range === 'avantgarde' && s.gasSpring) add('gasSpring', 'Gas spring set', resolve(s, 'Gas Spring Set', {opts: {'package-unit': '1 pc'}}));
  if (s.range === 'europa' && s.gasSpring) add('gasSpring', 'Gas spring retrofit set', ['4A', '5', '7'].includes(s.size) ? '40009' : '40008');
  if (s.ramp) add('ramp', 'Threshold access ramp', s.range === 'panorama' ? resolve(s, 'Threshold Access Ramp') : s.range === 'neo' ? resolve(s, 'Threshold Access Ramp') : resolve(s, s.gate !== 'none' ? 'Threshold Access Ramp for Sectional Overhead Door' : 'Threshold Access Ramp for Double Door'));
  // Roof and canopy.
  for (const k of ['left', 'right']) {
    const c = s.canopy[k];
    if (c === 'none') continue;
    const side = k === 'left' ? 'Left' : 'Right';
    if (s.range === 'highline') {
      // H5 and H6 share one canopy (Biohort's article title: "H5/H6"); the page data lists it under H6.
      add('canopy', `${side} side canopy ${c}`, resolve(s, 'Side Canopy HighLine Garden Shed', {opts: {'side-canopy-size': c}, size: s.size === 'H5' ? 'H6' : s.size}));
      if (s.canopyWalls[k].side) add('canopyWall', `${side} canopy side wall`, resolve(s, 'Side Wall for HighLine Side Canopy', {size: s.size === 'H5' ? 'H6' : s.size}));
      if (s.canopyWalls[k].back) add('canopyWall', `${side} canopy back wall`, resolve(s, 'Back Wall for HighLine Side Canopy', {opts: {'side-canopy-size': c}}));
    } else if (s.range === 'avantgarde') {
      add('canopy', `${side} side canopy`, resolve(s, 'Side canopy for garden shed AvantGarde', {opts: {'side-canopy-size': 'L'}}));
      if (s.canopyWalls[k].side) add('canopyWall', `${side} canopy side wall`, resolve(s, 'Side wall for side canopy for garden shed AvantGarde'));
      if (s.canopyWalls[k].back) add('canopyWall', `${side} canopy back wall`, resolve(s, 'Back wall for side canopy for garden shed AvantGarde', {opts: {'side-canopy-size': 'L'}}));
    } else if (s.range === 'europa') {
      add('canopy', `${side} side canopy`, resolve(s, 'Side Canopy Europa Garden Shed'));
    } else if (s.range === 'neo') {
      const band = s.size[0];
      add('canopy', `${side} side canopy`, resolve(s, `Side Canopy ${band}A, ${band}B, ${band}C, ${band}D`));
      if (s.canopyWalls[k].side) add('canopyWall', `${side} canopy side wall`, resolve(s, `Side Wall for Side Canopy ${band}A, ${band}B, ${band}C, ${band}D`));
      if (s.canopyWalls[k].back) add('canopyWall', `${side} canopy back wall`, resolve(s, 'Back Wall for Side Canopy'));
    }
  }
  if (s.canopyGlass) add('canopyGlass', 'Glass panel for the side canopy', resolve(s, 'Glass Panel for Side Canopy'), s.canopyGlass);
  if (s.canopyFlora) add('canopyFlora', 'FloraBoard for the side canopy', resolve(s, 'FloraBoard for Side Canopy'), s.canopyFlora);
  if (s.downpipe !== 'none' && s.range !== 'casanova') {
    const name = {highline: 'Rainwater Downpipe Set HighLine Garden Shed', avantgarde: 'Rainwater Downpipe Set AvantGarde® Garden Shed', europa: 'Rainwater Downpipe Set Europa Garden Shed', panorama: 'Rainwater Downpipe Set (2 pieces)'}[s.range];
    add('downpipe', 'Rainwater downpipe set (2 pieces)', resolve(s, name));
  }
  if (s.pv) add('pv', 'PV mounting system', s.range === 'europa' ? '47022' : s.range === 'neo' ? '47024' : '47023');
  if (s.floraboard) add('floraboard', 'FloraBoard (2 flower boxes on rails)', resolve(s, 'FloraBoard'), s.floraboard);
  if (s.led) add('led', 'LED light', resolve(s, 'LED Light'), s.led);
  if (s.solar) add('solar', 'Solar light', resolve(s, 'Solar Light'), s.solar);
  if (s.range === 'casanova') {
    if (s.skylight) add('skylight', 'Double glazed acrylic glass skylight', resolve(s, 'Double Glazed Acrylic Glass Skylight'));
    if (s.roofSupport) add('roofSupport', 'Roof supports, grey white', resolve(s, 'Roof Support White'));
    for (const k of WALL_ORDER) if (s.extLight[k]) add('extLight', `Preparation for external lighting, ${WALLS[k].toLowerCase()}`, resolve(s, 'Preparation for External Lighting', {side: Math.round(wallLength(s, k) + .24)}));
  }
  if (s.range === 'neo' && s.panelling) add('panelling', 'Interior panelling', resolve(s, 'Interior Panelling'));
  if (s.range === 'neo' && s.insulation) add('insulation', 'Insulation', resolve(s, 'Insulation'));
  if (s.sauna !== 'none') add('sauna', `Sauna module, ${s.sauna} door hinge`, resolve(s, 'Sauna Module', {hinge: s.sauna}));
  // Foundation.
  const F = {
    highline: ['Aluminium Floor Frame Garden Shed', 'Aluminium Floor Panel, Garden Shed', 'SmartBase Garden Shed Foundation', 'SmartBasePLUS for Garden Shed'],
    avantgarde: ['Aluminium Floor Frame AvantGarde Garden Shed', 'Aluminium Floor Panel, AvantGarde Garden Shed', 'SmartBase AvantGarde', 'SmartBasePLUS AvantGarde Garden Shed'],
    europa: ['Aluminium Floor Frame Europa Garden Shed', 'Aluminium Floor Panel, Europa Garden Shed', 'SmartBase Foundation Europa', 'SmartBasePLUS for Europa Garden Shed'],
    panorama: ['Aluminium Floor Frame', 'Aluminium Floor Panels', 'SmartBase', 'SmartBasePLUS'],
    neo: ['Aluminium Floor Frame', 'Aluminium Floor Panels', 'SmartBase', 'SmartBasePLUS'],
    casanova: ['Floor Frame', 'Floor Panels']
  }[s.range];
  if (s.foundation === 'frame') { add('foundation', 'Aluminium floor frame', resolve(s, F[0])); if (s.floorPlate) add('floorPlate', 'Aluminium floor panels', resolve(s, F[1])); }
  if (s.foundation === 'smartbase' || s.foundation === 'smartbaseplus') {
    const plus = s.foundation === 'smartbaseplus';
    add('foundation', plus ? 'SmartBase PLUS foundation' : 'SmartBase foundation', resolve(s, plus ? F[3] : F[2]));
    // One additional package for each extra door (price lists, Roomle fundamentZusatzpaket).
    if (extraDoors) add('foundation', `${plus ? 'SmartBase PLUS' : 'SmartBase'} additional package for each extra door`, plus ? '43405' : '43505', extraDoors);
  }
  if (s.anchors) {
    const n = anchorCount(s), packs = anchorPacks(n);
    if (packs.six) add('anchors', 'Ground anchors, 6 per pack', '41006', packs.six, `${n} anchors for a gravel base`);
    if (packs.four) add('anchors', 'Ground anchors, 4 per pack', '41004', packs.four, `${n} anchors for a gravel base`);
  }
  // Inside.
  for (const k of itemsFor(s.range)) {
    const n = s.items[k] || 0;
    if (!n) continue;
    if (k === 'bikeMax' && n >= 2 && ITEMS.bikeMax.pair[s.range]) {
      const pairs = Math.floor(n / 2), single = n % 2;
      add('bikeMax', 'BikeMax bicycle hangers, pair', itemSku(s, 'bikeMax', 'pair'), pairs);
      if (single) add('bikeMax', 'BikeMax bicycle hanger', itemSku(s, 'bikeMax'), 1);
      continue;
    }
    add(k, ITEMS[k].name + (ITEMS[k].pack === 'pair' ? ', pair' : ITEMS[k].pack === 'set of 4' ? ', set of 4' : ''), itemSku(s, k), n);
  }
  if (s.bikeLift !== 'none') {
    const name = s.bikeLift === 'swivel' ? 'BikeLift Swivelling' : s.range === 'neo' ? 'BikeLift Standard' : s.range === 'panorama' ? 'BikeLift Standard' : 'BikeLift';
    add('bikeLift', s.bikeLift === 'swivel' ? 'BikeLift, swivelling' : 'BikeLift', resolve(s, name, {opts: s.range === 'panorama' || s.range === 'neo' ? {} : {swivelling: 'Standard'}}));
    add('bikeLift', 'BikeLift mounting kit for a garden shed', s.range === 'neo' ? '49058' : '49057');
  }
  // Services Biohort does not price online.
  quote('assembly', 'Assembly', 'Biohort finds an assembly partner near you, who prices the work');
  if (s.foundation === 'none') quote('base', 'Concrete base or point foundations', 'Built to Biohort\'s foundation plan by you or a local contractor');
  return {lines, quoted, total: lines.reduce((t, l) => t + l.total, 0)};
}

/** The published price of a design, or why part of it is quoted. */
export function priceFor(input) {
  const s = normalise(input), {lines, quoted, total} = linesFor(s);
  const missing = quoted.filter(q => !['assembly', 'base'].includes(q.key));
  const status = missing.length ? 'part' : 'published';
  return {
    status, total, lines, quoted, missing, building: lines.find(l => l.key === 'building') || null,
    headline: pounds(total) + (missing.length ? ' + quoted items' : ''),
    caveat: s.range === 'casanova'
      ? 'Biohort\'s published UK prices including 20% VAT. Biohort\'s site shows free shipping within 6 weeks; the CasaNova price list prices delivery to your dealer, who arranges the last leg, so delivery is confirmed when you order. Assembly, foundations, electrics and any planning permission are separate.'
      : 'Biohort\'s published UK prices including 20% VAT and free kerbside delivery within 3 weeks to mainland Great Britain. Assembly and the base are separate unless you choose a Biohort foundation.'
  };
}

// ---- Words ---------------------------------------------------------------------------------------------
export function designName(input) {
  const s = normalise(input), R = RANGES[s.range];
  return `${R.name}${s.range === 'avantgarde' && s.model === 'eco' ? ' ECO*' : ''} ${sizeLabel(s.range, s.size)}`;
}
export function summaryLine(input) { const s = normalise(input); return `${designName(s)} in ${COLOURS[s.colour].name.toLowerCase()}`; }
const yesNo = v => (v ? 'Yes' : 'No');
export function openingLabel(s, o) {
  const base = o.kind === 'door' && s.range === 'europa' ? 'Additional double door' : KINDS[o.kind].name;
  return `${base}${o.hinge ? `, ${o.hinge} hinge` : ''}${o.glass ? ', glass insert' : ''}`;
}

/** The full specification as [section, [label, value][]] rows, for the panel, PDF and enquiry. */
export function specRows(input) {
  const s = normalise(input), R = RANGES[s.range], d = dims(s), inc = includedOf(s);
  const main = mainDoor(s);
  const doorText = s.gate !== 'none' ? `Sectional overhead door (${s.gate === 'electric' ? 'electric opener and one remote' : 'manual'}), 2.36m x 2.0m opening`
    : s.range === 'europa' ? `Double door, ${d.opening ? `${d.opening[0]} x ${d.opening[1]}cm` : '135 x 170cm'} clear opening`
    : `${s.door === 'double' ? 'Double door' : 'Standard door'}${s.range === 'casanova' || s.range === 'panorama' ? `, ${s.hinge} hinge` : ''}${d.opening ? `, ${d.opening[0]} x ${d.opening[1]}cm clear opening` : ''}${s.doorGlass ? ', glass insert' : ''}`;
  const rowsOut = [
    ['Your building', [
      ['Range', `${R.name}${s.range === 'avantgarde' ? ` (${MODELS[s.model].name})` : ''}: ${R.tagline.toLowerCase()}`],
      ['Size', `${sizeLabel(s.range, s.size)}: ${metres(d.W)} x ${metres(d.D)} including the roof, ${metres(d.H)} high`],
      ['Inside', `${metres(d.iw)} x ${metres(d.id)}, ${d.area.toFixed(2)}m² usable, ${metres(d.ih)} high`],
      ['Colour', `${COLOURS[s.colour].name}${s.range === 'highline' ? '; roof surface metallic quartz grey' : ''}; grey white inside`],
      ['Foundation size', d.base ? `${d.base[0]} x ${d.base[1]}cm` : 'See Biohort\'s foundation plan']
    ]],
    ['Doors and windows', [
      ['Main door', `${doorText}, ${WALLS[main.wall].toLowerCase()}`],
      ...s.openings.map(o => [openingLabel(s, o), WALLS[o.wall]]),
      ...(s.gasSpring ? [['Gas spring', 'Yes']] : []),
      ...(s.ramp ? [['Threshold ramp', 'Yes']] : [])
    ]],
    ['Roof and outside', [
      ['Roof', {flat: 'Flat roof, 360° acrylic glass skylight, integrated gutters', pent: 'Pent roof, front acrylic glass skylight, gutter at the back', apex: s.range === 'panorama' ? 'Apex roof on a continuous acrylic glass skylight, gutters both sides' : 'Apex roof, gutters both sides', neo: 'Flat roof with a 19mm plywood ceiling and EPDM membrane', casanova: 'Flat EPDM roof on three-layer plywood, all-round acrylic light band'}[R.roof]],
      ...(canopyOptions(s).length ? [['Side canopy', ['left', 'right'].filter(k => s.canopy[k] !== 'none').map(k => `${k[0].toUpperCase() + k.slice(1)}${['S', 'L'].includes(s.canopy[k]) ? ` (${s.canopy[k]})` : ''}${s.canopyWalls[k].back || s.canopyWalls[k].side ? ` with ${[s.canopyWalls[k].back && 'back wall', s.canopyWalls[k].side && 'side wall'].filter(Boolean).join(' and ')}` : ''}`).join(', ') || 'None']] : []),
      ...(downpipeOptions(s).length ? [['Downpipes', s.range === 'casanova' ? `Included, at the ${s.downpipe === 'front' ? 'front' : 'back'}` : s.downpipe === 'none' ? (s.range === 'neo' ? 'Included' : 'Gutter hose outlets only') : `Downpipe set at the ${s.downpipe === 'front' ? 'front' : 'back'}`]] : [['Downpipes', s.range === 'neo' ? 'Two included' : 'None']]),
      ...(s.pv ? [['PV mounting system', 'Yes']] : []),
      ...(s.floraboard ? [['FloraBoard', `${s.floraboard} set${s.floraboard > 1 ? 's' : ''}`]] : []),
      ...(s.led || s.solar ? [['Lights', [s.led && `${s.led} LED`, s.solar && `${s.solar} solar`].filter(Boolean).join(', ')]] : []),
      ...(s.range === 'casanova' ? [['Double glazed skylight', yesNo(s.skylight)], ['Grey white roof supports', yesNo(s.roofSupport)], ['External lighting cut-outs', WALL_ORDER.filter(k => s.extLight[k]).map(k => WALLS[k].toLowerCase()).join(', ') || 'None']] : [])
    ]],
    ['Base and floor', [
      ['Foundation', FOUNDATIONS[s.foundation].name + (s.foundation === 'frame' ? (s.floorPlate ? ' with aluminium floor panels' : ', no floor panels') : '')],
      ...(s.anchors ? [['Ground anchors', `${anchorCount(s)} for a gravel base`]] : [])
    ]],
    ['Inside', [
      ...(s.range === 'neo' ? [['Panelling', s.panelling ? `Interior panelling${s.insulation ? ' with insulation' : ''}` : 'None']] : []),
      ...(s.sauna !== 'none' ? [['Sauna module', `${s.sauna} door hinge`]] : []),
      ...Object.entries(inc).map(([k, n]) => [`${ITEMS[k].name} (included)`, `${n} ${ITEMS[k].pack}${n > 1 ? 's' : ''}`]),
      ...itemsFor(s.range).filter(k => s.items[k]).map(k => [ITEMS[k].name, `${s.items[k]} extra ${ITEMS[k].pack}${s.items[k] > 1 && !ITEMS[k].pack.endsWith('s') ? 's' : ''}`]),
      ...(s.bikeLift !== 'none' ? [['BikeLift', s.bikeLift === 'swivel' ? 'Swivelling, with mounting kit' : 'Standard, with mounting kit']] : [])
    ]]
  ];
  return rowsOut.map(([h, r]) => [h, r.length ? r : [['None', '']]]);
}

// ---- Share codes ----------------------------------------------------------------------------------------
// The design (never contact details) as compact JSON in base64url, so links and the PDF's QR code
// stay small. Unknown or damaged values fall back through normalise().
function compact(s) {
  const o = {r: s.range, z: s.size, c: s.colour};
  if (s.model !== 'classic') o.m = s.model;
  if (s.door !== 'standard') o.d = s.door;
  if (s.hinge !== 'right') o.h = s.hinge;
  if (s.doorWall !== 'front') o.w = s.doorWall;
  if (s.doorP !== null) o.p = Math.round(s.doorP * 1000);
  if (s.doorGlass) o.g = 1;
  if (s.gate !== 'none') o.t = s.gate;
  if (s.openings.length) o.o = s.openings.map(x => [x.kind, x.wall, Math.round(x.p * 1000), x.hinge === 'left' ? 1 : 0, x.glass ? 1 : 0]);
  if (s.canopy.left !== 'none' || s.canopy.right !== 'none') o.k = [s.canopy.left, s.canopy.right, +s.canopyWalls.left.back, +s.canopyWalls.left.side, +s.canopyWalls.right.back, +s.canopyWalls.right.side];
  if (s.downpipe !== (downpipeOptions(s)[0] || 'none')) o.dp = s.downpipe;
  if (s.foundation !== 'none') o.f = s.foundation;
  if (s.floorPlate) o.fp = 1;
  if (s.anchors) o.a = 1;
  const flags = ['pv', 'skylight', 'roofSupport', 'gasSpring', 'panelling', 'insulation', 'ramp'].filter(k => s[k]);
  if (flags.length) o.x = flags;
  const el = WALL_ORDER.filter(k => s.extLight[k]);
  if (el.length) o.el = el;
  for (const k of ['led', 'solar', 'floraboard', 'canopyGlass', 'canopyFlora']) if (s[k]) o[k] = s[k];
  if (s.sauna !== 'none') o.sa = s.sauna;
  if (s.bikeLift !== 'none') o.bl = s.bikeLift;
  if (Object.keys(s.items).length) o.i = s.items;
  return o;
}
function expand(o) {
  const x = Array.isArray(o.x) ? o.x : [];
  return {
    range: o.r, size: o.z, colour: o.c, model: o.m, door: o.d, hinge: o.h, doorWall: o.w, doorP: o.p !== undefined ? o.p / 1000 : null, doorGlass: Boolean(o.g), gate: o.t,
    openings: (Array.isArray(o.o) ? o.o : []).map((a, n) => ({id: `o${n + 1}`, kind: a[0], wall: a[1], p: a[2] / 1000, hinge: a[3] ? 'left' : 'right', glass: Boolean(a[4])})),
    canopy: Array.isArray(o.k) ? {left: o.k[0], right: o.k[1]} : undefined,
    canopyWalls: Array.isArray(o.k) ? {left: {back: Boolean(o.k[2]), side: Boolean(o.k[3])}, right: {back: Boolean(o.k[4]), side: Boolean(o.k[5])}} : undefined,
    downpipe: o.dp, foundation: o.f, floorPlate: Boolean(o.fp), anchors: Boolean(o.a),
    pv: x.includes('pv'), skylight: x.includes('skylight'), roofSupport: x.includes('roofSupport'), gasSpring: x.includes('gasSpring'), panelling: x.includes('panelling'), insulation: x.includes('insulation'), ramp: x.includes('ramp'),
    extLight: Object.fromEntries(WALL_ORDER.map(k => [k, Array.isArray(o.el) && o.el.includes(k)])),
    led: o.led, solar: o.solar, floraboard: o.floraboard, canopyGlass: o.canopyGlass, canopyFlora: o.canopyFlora, sauna: o.sa, bikeLift: o.bl, items: o.i
  };
}
const b64 = typeof btoa === 'function' ? t => btoa(t) : t => Buffer.from(t, 'binary').toString('base64');
const unb64 = typeof atob === 'function' ? t => atob(t) : t => Buffer.from(t, 'base64').toString('binary');
export function encodeDesign(input) {
  const json = JSON.stringify(compact(normalise(input)));
  return 'b1.' + b64(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function decodeDesign(code) {
  try {
    const t = String(code);
    if (!t.startsWith('b1.')) return null;
    const raw = t.slice(3).replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(unb64(raw + '='.repeat((4 - raw.length % 4) % 4))));
    const o = JSON.parse(json);
    if (!o || typeof o !== 'object' || !RANGES[o.r]) return null;
    return normalise(expand(o));
  } catch { return null; }
}
export const SITE = 'https://biohort-garden-room-configurator.netlify.app';
export const designURL = (input, origin = SITE) => `${origin}/configurator/#d=${encodeDesign(input)}`;
export const bookingURL = (input, origin = SITE) => `${origin}/configurator/?book=1#d=${encodeDesign(input)}`;
export function designReference(input) {
  const s = normalise(input);
  let n = 2166136261;
  for (const ch of encodeDesign(s)) n = Math.imul(n ^ ch.charCodeAt(0), 16777619);
  return 'BH-' + (n >>> 0).toString(36).toUpperCase().padStart(7, '0');
}
/** Biohort's own GB shop page for the building's SKU. */
export function shopURL(input) { const s = normalise(input), sku = buildingSku(s); return `${RANGES[s.range].product}/${sku}?country_id=gb`; }

// ---- Contact validation (shared with the server) ----------------------------------------------------------
const POSTCODE = /^(GIR ?0AA|[A-PR-UWYZ]([0-9]{1,2}|[A-HK-Y][0-9]{1,2}|[0-9][A-HJKS-UW]|[A-HK-Y][0-9][ABEHMNPRV-Y]) ?[0-9][ABD-HJLNP-UW-Z]{2})$/i;
export const validPostcode = v => POSTCODE.test(String(v || '').trim());
export function formatPostcode(v) {
  const t = String(v || '').toUpperCase().replace(/\s+/g, '');
  return t.length > 3 ? `${t.slice(0, -3)} ${t.slice(-3)}` : t;
}
export const validEmail = v => /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@.]{2,}$/.test(String(v || '').trim());
export const validName = v => /^[\p{L}][\p{L}\p{M} '’.-]{0,59}$/u.test(String(v || '').trim());

// Ofcom's UK numbering plan (National Telephone Numbering Plan): geographic 01 (10 or 11 digits)
// and 02 (only 020, 023, 024, 028, 029 are allocated), non-geographic 03 (030, 033, 034, 037),
// mobiles 071-075 and 077-079 plus 07624, corporate 055/056 and freephone 0800/0808. Premium 09,
// personal 070, pagers 076 and the 04/06 unallocated blocks are refused, as are Ofcom's
// drama ranges, which never connect.
const UK_NUMBER = /^0(?:1\d{8,9}|2[03489]\d{8}|3[0347]\d{8}|5[56]\d{8}|7(?:[1-57-9]\d{8}|624\d{6})|80[08]\d{6,7})$/;
const DRAMA = [/^07700900\d{3}$/, /^01632960\d{3}$/, /^011[3-8]4960\d{3}$/, /^01[2-6]14960\d{3}$/, /^01914980\d{3}$/, /^02079460\d{3}$/, /^02890180\d{3}$/, /^02920180\d{3}$/, /^03069990\d{3}$/, /^08081570\d{3}$/, /^09098790\d{3}$/];
export function parseUKPhone(input) {
  const raw = String(input || '').trim();
  if (!raw) return {valid: false, reason: 'empty'};
  if (/[^\d\s()+.\-]/.test(raw)) return {valid: false, reason: 'characters'};
  let d = raw.replace(/\(0\)/g, '').replace(/[^\d+]/g, '');
  if (d.startsWith('+44')) d = '0' + d.slice(3);
  else if (d.startsWith('0044')) d = '0' + d.slice(4);
  else if (d.startsWith('+') || d.startsWith('00')) return {valid: false, reason: 'international'};
  else if (d.startsWith('44') && d.length >= 12) d = '0' + d.slice(2);
  if (!d.startsWith('0')) d = '0' + d;
  if (!UK_NUMBER.test(d)) return {valid: false, reason: d.length < 10 ? 'short' : d.length > 11 ? 'long' : 'range'};
  if (DRAMA.some(re => re.test(d)) || /^0\d(\d)\1{7,8}$/.test(d)) return {valid: false, reason: 'fictional'};
  const kind = d.startsWith('07') ? 'mobile' : /^0[12]/.test(d) ? 'landline' : 'other';
  const display = d.startsWith('02') ? `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7)}` : /^0[157]/.test(d) ? `${d.slice(0, 5)} ${d.slice(5)}` : `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  return {valid: true, national: d, e164: '+44' + d.slice(1), display, kind};
}
export function phoneProblem(input) {
  const r = parseUKPhone(input);
  if (r.valid) return '';
  return {
    empty: 'Enter a UK phone number so Biohort\'s UK team can call you about your design.',
    characters: 'Use numbers only, for example 07700 123456.',
    international: `Enter a UK number. For a project outside the UK, call Biohort on ${COMPANY.phone}.`,
    short: 'That number is too short. UK numbers have 10 or 11 digits, such as 07700 123456.',
    long: 'That number is too long. UK numbers have 10 or 11 digits, such as 07700 123456.',
    range: 'That is not a UK mobile or landline number. Check it, for example 07700 123456 or 01632 123456.',
    fictional: 'That number is reserved and cannot be called. Enter the number we can reach you on.'
  }[r.reason];
}
