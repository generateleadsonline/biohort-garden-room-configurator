import { validateConfig } from './validation.mjs';

export const PRICE_SOURCE = 'https://www.biohort.com/asset/Inhalte/Allgemeine-Seiten/Preislisten/Endkundenpreisliste_cn_GB.pdf';
const BASE = { '3x2': 8679, '3x3': 9989, '3x4': 11569, '3x5': 12949, '3x6': 14729, '4x2': 10519, '4x4': 13669, '4x5': 15249, '4x6': 16829 };
const FLOOR_FRAME = { '3x2': 379, '3x3': 439, '3x4': 499, '3x5': 559, '3x6': 629, '4x2': 439, '4x4': 559, '4x5': 629, '4x6': 679 };
const ACCESSORIES = {
  lights: ['External lighting preparation - one selected side', 59],
  table: ['Folding table', 139],
  shelf: ['Two standard shelves with two support rails', 158],
  bike: ['BikeMax bicycle hanger - one', 99],
};

export function priceConfig(input) {
  const cfg = validateConfig(input);
  const size = `${cfg.width}x${cfg.depth}`;
  const lineItems = [];
  const add = (label, quantity, unitPrice) => lineItems.push({ label, quantity, unitPrice, total: quantity * unitPrice });
  add(`CasaNova ${size} with standard door`, 1, BASE[size]);
  if (cfg.door !== 'standard') add('Double door panel upgrade', 1, 529);
  if (cfg.door === 'glass') add('Insulated glass inserts for double doors', 2, 1259);
  if (cfg.glass) add('Full-height insulated glass element', cfg.glass, 1439);
  if (cfg.window) add('Tilt-and-turn window', 1, 1439);
  for (const accessory of cfg.accessories) {
    if (accessory === 'floorframe') add(`Floor frame for ${size}`, 1, FLOOR_FRAME[size]);
    else add(ACCESSORIES[accessory][0], 1, ACCESSORIES[accessory][1]);
  }
  const total = lineItems.reduce((sum, line) => sum + line.total, 0);
  return {
    currency: 'GBP', total, subtotal: Math.round(total / 1.2 * 100) / 100,
    vatRate: 20, vatAmount: Math.round((total - total / 1.2) * 100) / 100,
    lineItems, sourceUrl: PRICE_SOURCE, sourceYear: 2026,
    basis: 'Biohort 2026 UK recommended retail list prices, including VAT and transport to the dealer warehouse. Nonbinding product budget; dealer confirmation required.',
    excluded: ['End-customer delivery and unloading arrangements', 'Foundation construction, groundworks and finished floor', 'Assembly and installation labour', 'Electrical connection, fixtures, heating and furniture', 'Planning requirements and site-specific work'],
    dimensions: { width: (cfg.width * 100 + 28) / 100, depth: (cfg.depth * 100 + 28) / 100, height: 2.505, nominalWidth: cfg.width, nominalDepth: cfg.depth, exteriorArea: Math.round((cfg.width + 0.28) * (cfg.depth + 0.28) * 100) / 100 },
  };
}
