import { jsPDF } from 'jspdf';
import { PRICE_SOURCE } from './pricing.mjs';
import { pdfLogo } from './pdf-logo.mjs';

const GREEN = [96, 125, 59], INK = [37, 46, 40], MUTED = [105, 108, 110], PALE = [239, 238, 230], LINE = [224, 226, 226];
const colors = { dark: 'Metallic dark grey', quartz: 'Metallic quartz grey' };
const doors = { standard: 'Standard solid door', double: 'Solid double doors', glass: 'Double doors with insulated glass inserts' };
const bases = { existing: 'Existing base - suitability to be checked', concrete: 'Concrete foundation - specification required', advice: 'Foundation advice requested' };
const accessories = { lights: 'External lighting preparation (fixtures excluded)', table: 'Folding table', shelf: 'Two shelves with support rails', bike: 'BikeMax bicycle hanger', floorframe: 'Floor frame' };
const gbp = amount => `GBP ${Number(amount).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const latin = value => String(value).replace(/[\u2010-\u2015]/g, '-').replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\u00d7/g, 'x').replace(/[^\x20-\x7e\xa0-\xff\n]/g, '');
const safeName = value => /^[\x20-\x7e\xa0-\xff]+$/.test(value) ? value : 'your project';

export function publicDesignUrl(origin, cfg) {
  const url = new URL('/', origin);
  url.searchParams.set('design', JSON.stringify(cfg));
  return url.href;
}

function isometricRoom(doc, cfg, x, y, width = 155) {
  const scale = width / 155;
  const P = (a, b) => [x + a * scale, y + b * scale];
  const polygon = (points, fill) => {
    doc.setFillColor(...fill); doc.setDrawColor(...INK); doc.setLineWidth(0.3);
    const start = P(...points[0]);
    const deltas = points.slice(1).map((p, i) => [(p[0] - points[i][0]) * scale, (p[1] - points[i][1]) * scale]);
    deltas.push([(points[0][0] - points.at(-1)[0]) * scale, (points[0][1] - points.at(-1)[1]) * scale]);
    doc.lines(deltas, ...start, [1, 1], 'FD', true);
  };
  const finish = cfg.color === 'dark' ? [69, 75, 77] : [134, 138, 134];
  polygon([[10, 35], [110, 25], [110, 96], [10, 111]], finish);
  polygon([[110, 25], [152, 3], [152, 69], [110, 96]], finish.map(c => Math.max(0, c - 22)));
  for (let k = 0; k < 11; k++) { doc.setDrawColor(...finish.map(c => Math.max(0, c - 14))); doc.line(...P(12 + k * 9, 35 - k * 0.9), ...P(12 + k * 9, 110 - k * 1.3)); }
  polygon([[6, 33], [109, 21], [155, 0], [51, 12]], [57, 61, 63]);
  polygon([[6, 33], [109, 21], [109, 26], [6, 38]], [41, 45, 47]);
  const dw = cfg.door === 'standard' ? 22 : 42;
  const dx = cfg.doorPosition === 'left' ? 18 : cfg.doorPosition === 'right' ? 103 - dw : 59 - dw / 2;
  polygon([[dx, 46], [dx + dw, 43 - dw * 0.03], [dx + dw, 98 - dw * 0.12], [dx, 103]], [33, 37, 39]);
  if (cfg.door === 'glass') {
    polygon([[dx + 2, 48], [dx + dw - 2, 46], [dx + dw - 2, 94], [dx + 2, 99]], [182, 207, 214]);
    doc.setDrawColor(...INK); doc.line(...P(dx + dw / 2, 46), ...P(dx + dw / 2, 98));
  }
  for (let k = 0; k < cfg.glass; k++) polygon([[115 + k * 16, 32 - k * 8], [127 + k * 16, 26 - k * 8], [127 + k * 16, 80 - k * 8], [115 + k * 16, 87 - k * 8]], [164, 191, 202]);
  doc.setDrawColor(...LINE); doc.setLineWidth(0.4); doc.line(...P(2, 119), ...P(113, 104));
}

export function buildQuotePdf(record, origin = 'https://www.biohort.com') {
  const { config: cfg, pricing: price } = record;
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  doc.setProperties({ title: `Your Biohort CasaNova design - ${record.reference}`, subject: 'Personalised design guide and nonbinding UK list-price product budget', author: 'Biohort design configurator', creator: 'Biohort configurator' });
  const W = 210, M = 18, CW = W - 2 * M;
  let page = 0;
  const text = (value, x, y, size = 10, weight = 'normal', color = INK, options = {}) => {
    doc.setFont('helvetica', weight); doc.setFontSize(size); doc.setTextColor(...color); doc.text(Array.isArray(value) ? value.map(latin) : latin(value), x, y, options);
  };
  const para = (value, x, y, width = CW, size = 10, color = MUTED) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(size);
    const lines = doc.splitTextToSize(latin(value), width);
    doc.setTextColor(...color); doc.text(lines, x, y, { lineHeightFactor: 1.4 });
    return y + lines.length * size * 0.3528 * 1.4;
  };
  const box = (x, y, w, h, fill = PALE) => { doc.setFillColor(...fill); doc.roundedRect(x, y, w, h, 2, 2, 'F'); };
  const rule = y => { doc.setDrawColor(...LINE); doc.setLineWidth(0.3); doc.line(M, y, W - M, y); };
  const label = (value, x, y) => text(value.toUpperCase(), x, y, 8, 'bold', GREEN);
  const section = (value, y) => { text(value, M, y, 17, 'bold'); return y + 9; };
  const footer = () => {
    rule(279); text(record.reference, M, 286, 8, 'bold', MUTED);
    text('Design guide - dealer confirmation required', 78, 286, 8, 'normal', MUTED);
    text(`${page} / 6`, W - M, 286, 8, 'normal', MUTED, { align: 'right' });
  };
  const newPage = (number, kicker, title, intro) => {
    if (number > 1) doc.addPage();
    page = number;
    doc.addImage(pdfLogo, 'PNG', M, 9, 31, 18.2);
    text('CASANOVA / YOUR DESIGN GUIDE', W - M, 19, 8, 'bold', MUTED, { align: 'right' });
    label(kicker, M, 38); text(title, M, 52, 26, 'bold');
    if (intro) para(intro, M, 62, CW, 10);
    footer();
  };
  const row = (left, right, y, height = 13) => {
    text(left, M + 3, y + 5, 9, 'normal', MUTED);
    const lines = doc.splitTextToSize(latin(right), 101);
    text(lines, M + 67, y + 5, 9, 'bold');
    doc.setDrawColor(...LINE); doc.line(M, y + height, W - M, y + height);
  };

  // 1. The exact saved configuration leads the guide.
  newPage(1, 'A room for your life', 'Your space. Your way.', `Prepared for ${safeName(record.contact.name)}. A personalised CasaNova design for ${cfg.purpose.toLowerCase()}.`);
  box(M, 80, CW, 121);
  if (record.previewImage) {
    try {
      const image = doc.getImageProperties(record.previewImage);
      const fit = Math.min((CW - 8) / image.width, 108 / image.height);
      const iw = image.width * fit, ih = image.height * fit;
      doc.addImage(record.previewImage, 'PNG', M + (CW - iw) / 2, 84 + (110 - ih) / 2, iw, ih);
    } catch { isometricRoom(doc, cfg, M + 8, 88, 155); }
  } else isometricRoom(doc, cfg, M + 8, 88, 155);
  text('Illustrative design. Furniture, surroundings and opening positions require confirmation.', M + 5, 196, 7, 'normal', MUTED);
  label('YOUR CASANOVA', M, 214);
  text(`${cfg.width} x ${cfg.depth} module`, M, 225, 22, 'bold');
  text(`${price.dimensions.width.toFixed(2)}m x ${price.dimensions.depth.toFixed(2)}m overall`, M, 236, 11, 'normal', MUTED);
  text(colors[cfg.color], M, 246, 11);
  box(128, 210, 64, 51, [236, 240, 227]);
  label('PRODUCT BUDGET', 134, 220);
  text(gbp(price.total), 134, 234, 20, 'bold');
  para('UK list prices incl. VAT. Delivery to your site, assembly and base work are separate.', 134, 242, 53, 8);

  // 2. Plan clarity, not a false architectural drawing.
  newPage(2, 'Make the fit clear', 'Your footprint & layout.', 'Use these dimensions to start a conversation about placement, access and how you want to use the space.');
  const maxW = 128, maxH = 121;
  const scale = Math.min(maxW / cfg.width, maxH / cfg.depth);
  const pw = cfg.width * scale, ph = cfg.depth * scale, px = (W - pw) / 2, py = 91;
  doc.setFillColor(239, 241, 239); doc.setDrawColor(...INK); doc.setLineWidth(1.6); doc.rect(px, py, pw, ph, 'FD');
  doc.setDrawColor(...LINE); doc.setLineWidth(0.25);
  for (let k = 1; k < cfg.width; k++) doc.line(px + k * scale, py, px + k * scale, py + ph);
  for (let k = 1; k < cfg.depth; k++) doc.line(px, py + k * scale, px + pw, py + k * scale);
  const doorW = (cfg.door === 'standard' ? 0.95 : 1.87) * scale;
  const dx = cfg.doorPosition === 'left' ? px + scale * 0.12 : cfg.doorPosition === 'right' ? px + pw - doorW - scale * 0.12 : px + (pw - doorW) / 2;
  doc.setDrawColor(...GREEN); doc.setLineWidth(2); doc.line(dx, py + ph, dx + doorW, py + ph);
  for (let k = 0; k < cfg.glass; k++) { doc.setDrawColor(96, 158, 172); doc.setLineWidth(2); const wy = py + 10 + k * 1.03 * scale; doc.line(px + pw, wy, px + pw, wy + 0.83 * scale); }
  if (cfg.window) { doc.setDrawColor(96, 158, 172); doc.setLineWidth(2); doc.line(px, py + ph / 2 - 0.4 * scale, px, py + ph / 2 + 0.4 * scale); }
  text(`${cfg.width}m nominal module`, W / 2, py + ph / 2, 11, 'bold', INK, { align: 'center' });
  text(`${cfg.depth}m depth`, W / 2, py + ph / 2 + 8, 10, 'normal', MUTED, { align: 'center' });
  text('GARDEN / FRONT', W / 2, py + ph + 10, 8, 'bold', MUTED, { align: 'center' });
  doc.setDrawColor(...MUTED); doc.setLineWidth(0.3); doc.line(px, py - 8, px + pw, py - 8); doc.line(px, py - 11, px, py - 5); doc.line(px + pw, py - 11, px + pw, py - 5);
  text(`${price.dimensions.width.toFixed(2)}m overall incl. roof overhang`, W / 2, py - 13, 9, 'bold', INK, { align: 'center' });
  text(`${price.dimensions.depth.toFixed(2)}m overall`, px + pw + 7, py + ph / 2 + 21, 8, 'normal', INK, { angle: 90 });
  const by = 233;
  box(M, by, CW, 33); label('DIMENSIONS TO DISCUSS', M + 5, by + 8);
  para(`Overall height: 2.505m. Overall roof footprint: ${price.dimensions.exteriorArea}m2. Module dimensions are size names, not exact internal usable space. Final base, openings, clearances and internal dimensions must be checked with the dealer.`, M + 5, by + 15, CW - 10, 8);
  text('Plan is indicative; green = entrance, blue = glazing. Final positions require approval.', M, 226, 8, 'normal', MUTED);

  // 3. Specification becomes a useful handoff to a dealer.
  newPage(3, 'Every choice, in one place', 'Your specification.', 'A concise record of the design you saved. Keep this page with your reference when requesting a dealer quotation.');
  const specs = [
    ['Product', `Biohort CasaNova ${cfg.width} x ${cfg.depth}`],
    ['Exterior finish', colors[cfg.color]],
    ['Entrance', doors[cfg.door]],
    ['Entrance preference', `${cfg.doorPosition} on front wall - indicative`],
    ['Full-height glass', cfg.glass ? `${cfg.glass} insulated glass element${cfg.glass > 1 ? 's' : ''}` : 'None selected'],
    ['Additional window', cfg.window ? 'One tilt-and-turn window' : 'None selected'],
    ['Foundation', bases[cfg.foundation]],
    ['Assembly preference', cfg.assembly === 'professional' ? 'Professional assembly requested - quote separately' : 'Self assembly'],
    ['Intended use', cfg.purpose],
    ['Project timing', cfg.timeline],
  ];
  box(M, 80, CW, 130);
  specs.forEach(([a, b], index) => row(a, b, 80 + index * 13));
  section('Selected accessories', 225);
  para(cfg.accessories.length ? cfg.accessories.map(item => accessories[item]).join('; ') + '.' : 'No optional accessories selected. You can revise your design before asking for your final quotation.', M, 235, CW, 10);
  para('Door glazing and full glass wall elements are separate selections. Lighting preparation means cutouts only; fixtures and electrical work are excluded.', M, 255, CW, 8);

  // 4. Official list-price arithmetic, with prominent exclusions.
  newPage(4, 'An informed starting point', 'Your product budget.', 'Based on Biohort\'s published 2026 UK recommended retail list. This is a nonbinding product budget, not a final installed quotation.');
  let y = 82;
  box(M, y - 5, CW, 11, INK); text('PRODUCT / SELECTED UPGRADE', M + 4, y + 2, 8, 'bold', [255, 255, 255]); text('QTY', 153, y + 2, 8, 'bold', [255, 255, 255], { align: 'right' }); text('TOTAL', W - M - 4, y + 2, 8, 'bold', [255, 255, 255], { align: 'right' });
  y += 14;
  for (const item of price.lineItems) {
    const wrapped = doc.splitTextToSize(latin(item.label), 117);
    const h = Math.max(8, wrapped.length * 3.7 + 2);
    text(wrapped, M + 3, y, 9); text(String(item.quantity), 151, y, 9, 'normal', MUTED, { align: 'right' }); text(gbp(item.total), W - M - 3, y, 9, 'bold', INK, { align: 'right' });
    y += h; rule(y - 4);
  }
  y += 3;
  box(M, y, CW, 27, [236, 240, 227]); label('PRODUCT TOTAL INCL. 20% VAT', M + 5, y + 9); text(gbp(price.total), W - M - 5, y + 17, 23, 'bold', INK, { align: 'right' });
  text(`VAT component: ${gbp(price.vatAmount)}`, M + 5, y + 20, 8, 'normal', MUTED);
  y += 36;
  text('What this covers', M, y, 11, 'bold'); y = para('Selected product and accessories, VAT, and transport to the dealer warehouse. Dealer terms and delivery arrangements must be confirmed.', M, y + 6, CW, 8) + 6;
  text('Quote separately', M, y, 11, 'bold');
  para('Delivery to your garden and unloading; foundation, groundworks and finished floor; assembly labour; electrical connection, fixtures, heating and furniture; planning or other site work.', M, y + 6, CW, 8);
  text('View the official 2026 UK price list', M, 267, 8, 'bold', GREEN);
  doc.link(M, 263, 70, 6, { url: PRICE_SOURCE });

  // 5. Practical readiness replaces generic sales filler.
  newPage(5, 'Plan a smooth project', 'Prepare your garden.', 'These checks help your dealer assess feasibility and produce a complete quotation. Take photos and measurements before your conversation.');
  const checklist = [
    ['01', 'Placement & space', `Mark the ${price.dimensions.width.toFixed(2)}m x ${price.dimensions.depth.toFixed(2)}m overall footprint. Check door operation, maintenance clearance and nearby trees or structures. Confirm exact tolerances before base construction.`],
    ['02', 'A suitable foundation', 'Ask for the current CasaNova foundation plan. The base must be level, load bearing and correctly dimensioned. Existing slabs require a suitability check. A floor frame is an accessory, not foundation construction.'],
    ['03', 'Delivery & access', 'Record access width, turns, steps, parking and unloading arrangements. UK list transport is to the dealer warehouse. Your dealer should confirm end-customer delivery and how materials reach the installation area.'],
    ['04', 'Planning & services', 'Check local requirements for your intended use and position. Do not assume planning permission is unnecessary. Ask qualified professionals about power, heating, ventilation and any other services you need.'],
    ['05', 'Final specification', 'Confirm door handing, final opening positions, glass compatibility, drainage and accessory locations before ordering. Some selected components cannot be retrofitted, so resolve decisions with the dealer early.'],
  ];
  let cy = 86;
  for (const [n, title, copy] of checklist) {
    box(M, cy - 5, 14, 14, [236, 240, 227]); text(n, M + 7, cy + 4, 11, 'bold', GREEN, { align: 'center' });
    text(title, M + 21, cy, 12, 'bold'); para(copy, M + 21, cy + 7, CW - 21, 9); cy += 36;
  }

  // 6. Useful contact handoff and editable public design link, no PII in URL.
  newPage(6, 'Bring your design to life', 'Your next step.', 'You have a clear starting specification. A Biohort dealer can confirm the exact product, installation feasibility and complete project cost.');
  box(M, 82, CW, 33, [236, 240, 227]); label('YOUR DESIGN REFERENCE', M + 5, 91); text(record.reference, M + 5, 104, 18, 'bold');
  const steps = [
    ['1', 'Review and refine', 'Open your saved design to adjust size, finish or glazing. A changed specification needs a new product budget and guide.'],
    ['2', 'Request a complete quotation', 'Share this guide and your site photos with a dealer. Ask for product, home delivery, foundation, assembly and services as separate lines.'],
    ['3', 'Approve before ordering', 'Confirm drawings, dimensions, opening positions, warranty conditions and dealer terms. This guide does not place an order or reserve a delivery date.'],
  ];
  let sy = 132;
  for (const [n, title, copy] of steps) { text(n, M, sy, 17, 'bold', GREEN); text(title, M + 14, sy, 12, 'bold'); para(copy, M + 14, sy + 7, CW - 14, 9); sy += 34; }
  const designUrl = publicDesignUrl(origin, cfg);
  box(M, 234, 85, 20, INK); text('RETURN TO YOUR DESIGN', M + 42.5, 246, 9, 'bold', [255, 255, 255], { align: 'center' }); doc.link(M, 234, 85, 20, { url: designUrl });
  box(109, 234, 83, 20, GREEN); text('FIND A BIOHORT DEALER', 150.5, 246, 9, 'bold', [255, 255, 255], { align: 'center' }); doc.link(109, 234, 83, 20, { url: 'https://www.biohort.com/gb-en/contact/dealer-search' });
  para('Prepared from your saved configuration. Quote access lasts 30 days. This guide is a concept produced by the configurator; dealer approval and current product documentation take precedence.', M, 263, CW, 8);

  return new Uint8Array(doc.output('arraybuffer'));
}
