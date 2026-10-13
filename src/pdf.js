// "Your Biohort design" PDF: renders of the visitor's design (front three-quarter, all four sides,
// inside and from above), a dimensioned plan, the full specification, every published price with
// Biohort's article numbers, next steps and a link to book a call. Built in the browser from the
// live 3D scene's captures; loaded only when someone asks for it.
import {jsPDF} from 'jspdf';
import qrcode from 'qrcode-generator';
import {normalise, priceFor, pounds, metres, specRows, summaryLine, designName, RANGES, COMPANY, USPS, designURL, bookingURL, designReference, dims, mainDoor, openingLabel, shopURL, COLOURS} from './catalog.js';
import {geom, holeOf, canopyWidth} from './scene/building.js';
import {PDF_FONTS, PDF_LOGO} from './pdf-assets.js';

const C = {ink: '#1b1b1b', ink2: '#36332f', green: '#4e7a2b', greenBrand: '#669637', blue: '#2a4d8a', mist: '#f1f6ea', muted: '#5b5652', line: '#e3e2dd', sand: '#f5f5f2', paper: '#ffffff', soft: '#d9d6d0'};
const W = 210, H = 297, M = 16, CW = W - 2 * M, PAGES = 7;
const LOGO_W = 17, LOGO_H = LOGO_W * 203.9 / 346.86;

/**
 * @param input   a design (anything normalise() accepts)
 * @param views   {hero, front, back, left, right, interior, plan}: JPEG data URLs from the scene
 * @param options {contactName, preparedAt, origin, save = true}
 * @returns the jsPDF document (also saved unless save is false)
 */
export async function downloadPDF(input, views = {}, options = {}) {
  const s = normalise(input), r = RANGES[s.range], price = priceFor(s), d = dims(s);
  const origin = options.origin || 'https://biohort-garden-room-configurator.netlify.app';
  const link = designURL(s, origin), booking = bookingURL(s, origin), ref = designReference(s);
  const prepared = new Date(options.preparedAt || Date.now());
  const date = prepared.toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London'});
  const first = String(options.contactName || '').trim().split(/\s+/)[0].slice(0, 30);
  const pdf = new jsPDF({unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true});
  pdf.addFileToVFS('poppins-regular.ttf', PDF_FONTS.regular); pdf.addFont('poppins-regular.ttf', 'Poppins', 'normal');
  pdf.addFileToVFS('poppins-semibold.ttf', PDF_FONTS.semibold); pdf.addFont('poppins-semibold.ttf', 'Poppins', 'bold');
  pdf.setProperties({title: `Your Biohort ${designName(s)}`, subject: `${summaryLine(s)}: design, specification and price`, author: 'Biohort designer', creator: 'Biohort garden building designer', keywords: 'Biohort, garden shed, design, specification, price'});
  pdf.setLanguage('en-GB');

  const set = (size = 10, bold = false, colour = C.ink) => { pdf.setFont('Poppins', bold ? 'bold' : 'normal'); pdf.setFontSize(size); pdf.setTextColor(colour); };
  const para = (text, x, y, width, size = 9.5, colour = C.muted, line = 4.4, bold = false) => {
    set(size, bold, colour);
    const lines = pdf.splitTextToSize(String(text), width);
    pdf.text(lines, x, y, {lineHeightFactor: line / (size * .352778)});
    return y + lines.length * line;
  };
  const image = (data, x, y, w, h) => {
    if (typeof data !== 'string' || !/^data:image\/(png|jpeg);base64,/.test(data)) return false;
    try {
      const info = pdf.getImageProperties(data), fmt = data.startsWith('data:image/png') ? 'PNG' : 'JPEG';
      const k = Math.max(w / info.width, h / info.height), iw = info.width * k, ih = info.height * k;
      pdf.saveGraphicsState(); pdf.rect(x, y, w, h, null); pdf.clip(); pdf.discardPath();
      pdf.addImage(data, fmt, x - (iw - w) / 2, y - (ih - h) / 2, iw, ih, undefined, 'FAST');
      pdf.restoreGraphicsState();
      return true;
    } catch { return false; }
  };
  const missing = (x, y, w, h, label) => {
    pdf.setFillColor(C.sand); pdf.rect(x, y, w, h, 'F');
    para(`${label}: not available on this device. Your design link shows it in 3D.`, x + 6, y + h / 2, w - 12, 9, C.muted);
  };
  const shot = (key, x, y, w, h, label) => { if (!image(views[key], x, y, w, h)) missing(x, y, w, h, label); };
  const caption = (text, x, y) => { set(8.5, true, C.ink2); pdf.text(text, x, y); };
  const qr = (url, x, y, size) => {
    const code = qrcode(0, 'M'); code.addData(url, 'Byte'); code.make();
    const n = code.getModuleCount(), unit = size / (n + 4);
    pdf.setFillColor(C.paper); pdf.rect(x, y, size, size, 'F'); pdf.setFillColor(C.ink);
    for (let row = 0; row < n; row++) for (let col = 0; col < n; col++) if (code.isDark(row, col)) pdf.rect(x + (col + 2) * unit, y + (row + 2) * unit, unit + .02, unit + .02, 'F');
  };
  const button = (text, x, y, w, h, url, fill = C.green, colour = '#ffffff') => {
    pdf.setFillColor(fill); pdf.roundedRect(x, y, w, h, 1.2, 1.2, 'F');
    set(10.5, true, colour); pdf.text(text, x + w / 2, y + h / 2 + 1.3, {align: 'center'});
    pdf.link(x, y, w, h, {url});
  };
  const bullet = (items, x, y, width, size = 9.2) => {
    for (const item of items) { pdf.setFillColor(C.greenBrand); pdf.circle(x + 1, y - 1.2, .8, 'F'); y = para(item, x + 5, y, width - 5, size, C.ink2, 4.2) + 1.6; }
    return y;
  };
  function frame(page, title, sub) {
    if (page > 1) pdf.addPage();
    pdf.setFillColor(C.paper); pdf.rect(0, 0, W, H, 'F');
    pdf.addImage(PDF_LOGO, 'JPEG', M, 7.5, LOGO_W, LOGO_H, 'logo', 'FAST');
    set(8.5, true, C.ink); pdf.text(`${designName(s)}, ${COLOURS[s.colour].name.toLowerCase()}`, W - M, 13.5, {align: 'right'});
    set(7.4, false, C.muted); pdf.text(`Design ${ref}  |  ${date}`, W - M, 18.5, {align: 'right'});
    pdf.setDrawColor(C.greenBrand); pdf.setLineWidth(.5); pdf.line(M, 25, W - M, 25);
    if (title) { set(19, true, C.ink); pdf.text(title, M, 37); }
    if (sub) para(sub, M, 44, CW, 9.5, C.muted, 4.4);
    pdf.setFillColor(C.sand); pdf.rect(0, 284, W, 13, 'F');
    set(7.6, true, C.green); pdf.textWithLink('Book a call about this design', M, 289.6, {url: booking});
    set(7.4, false, C.muted); pdf.text(`Biohort ${COMPANY.phone}  |  ${COMPANY.email}`, M, 293.6);
    pdf.text(`Your Biohort design  |  ${page} of ${PAGES}`, W - M, 291.6, {align: 'right'});
  }

  // ---- 1. Cover --------------------------------------------------------------------------------
  frame(1);
  set(24, true, C.ink); pdf.text(`Your Biohort ${r.name}`, M, 40);
  para(`${summaryLine(s)}. ${first ? `Prepared for ${first}, ` : 'Prepared '}${date}.`, M, 47.5, CW, 10.5, C.muted, 4.8);
  shot('hero', M, 54, CW, 112, 'Front view');
  const py = 172;
  pdf.setFillColor(C.ink); pdf.roundedRect(M, py, CW, 50, 1.5, 1.5, 'F');
  set(9, false, C.soft); pdf.text(price.missing.length ? 'Published prices, plus quoted items' : 'Your price, including 20% VAT', M + 8, py + 10);
  set(28, true, '#ffffff'); pdf.text(pounds(price.total), M + 8, py + 22);
  para(`${price.lines.length} item${price.lines.length > 1 ? 's' : ''} at Biohort's published UK prices, itemised on page 6.${price.missing.length ? ` ${price.missing.length} quoted item${price.missing.length > 1 ? 's' : ''} priced by Biohort.` : ''}`, M + 8, py + 30, CW - 16, 8.8, C.soft, 4);
  para(price.caveat, M + 8, py + 40, CW - 16, 7.8, '#bdb8b1', 3.6);
  const usp = [USPS.range[1], USPS.size[0], USPS.price[0]];
  usp.forEach((u, i) => {
    const x = M + i * (CW / 3), w = CW / 3 - 4;
    set(9, true, C.ink); const t = pdf.splitTextToSize(u.title, w); pdf.text(t, x, 232);
    para(u.text, x, 232 + t.length * 4.2 + 1, w, 8, C.muted, 3.7);
  });
  button('Book a call about this design', M, 266, 78, 11, booking);
  set(8.5, false, C.ink2); pdf.textWithLink('Reopen your design in 3D', M + 84, 273, {url: link});

  // ---- 2. Every side -----------------------------------------------------------------------------
  frame(2, 'Every side of your building', `Front, back and both sides, as designed, in ${COLOURS[s.colour].name.toLowerCase()}.`);
  const gw = (CW - 6) / 2, gh = gw * .625;
  const md = mainDoor(s);
  [['front', 'Front'], ['back', 'Back'], ['left', 'Left side'], ['right', 'Right side']].forEach(([k, label], i) => {
    const x = M + (i % 2) * (gw + 6), y = 52 + Math.floor(i / 2) * (gh + 13);
    shot(k, x, y, gw, gh, label);
    caption(label, x, y + gh + 5);
    const items = [...(md.wall === k ? [md.kind === 'gate' ? 'sectional door' : md.kind === 'double' ? 'double door' : 'door'] : []), ...s.openings.filter(o => o.wall === k).map(o => openingLabel(s, o).toLowerCase())];
    if ((k === 'left' || k === 'right') && s.canopy[k] !== 'none') items.push('side canopy');
    set(7.6, false, C.muted); pdf.text(items.length ? items.join(', ') : 'Plain wall', x + 26, y + gh + 5);
  });
  para('Tools, bikes and plants are illustrative. Door and window positions snap to Biohort\'s wall panels and are confirmed when you order.', M, 52 + 2 * (gh + 13) + 2, CW, 8.4, C.muted, 3.9);

  // ---- 3. Inside and from above ------------------------------------------------------------------
  frame(3, 'Inside and from above', `Inside ${metres(d.iw)} x ${metres(d.id)}, ${d.area.toFixed(2)}m² usable and ${metres(d.ih)} high. Grey white walls.`);
  shot('interior', M, 52, CW, 104, 'Inside view');
  caption('Inside, from the door', M, 161);
  shot('plan', M, 168, CW, 104, 'Plan view');
  caption('From above, roof off', M, 277);

  // ---- 4. The plan ----------------------------------------------------------------------------------
  frame(4, 'Plan with dimensions', 'Walls in solid grey, the roof edge dashed, canopies hatched, door and window clear widths in millimetres.');
  drawPlan(pdf, s, M, 52, CW, 170, set);
  let y = 232;
  y = para(`Outside, including the roof: ${metres(d.W)} x ${metres(d.D)}, ${metres(d.H)} high. Base needed: ${d.base ? `${d.base[0]} x ${d.base[1]}cm` : 'see Biohort\'s foundation plan'}.`, M, y, CW, 9.2, C.ink2, 4.3) + 2;
  y = para(`Door: ${d.opening ? `${d.opening[0]} x ${d.opening[1]}cm clear opening` : 'see the specification'}${s.gate !== 'none' ? '; sectional door 236 x 200cm' : ''}. Leave about 80cm in front of a hinged door to open it.`, M, y, CW, 9.2, C.ink2, 4.3) + 2;
  para('Sizes from Biohort\'s data sheets and dimension tables. For foundations, use Biohort\'s own foundation plan for your size.', M, y, CW, 8.4, C.muted, 3.9);

  // ---- 5. Specification ----------------------------------------------------------------------------
  frame(5, 'Your specification', 'Everything you chose, and what comes with your building.');
  y = 54;
  for (const [section, rows] of specRows(s)) {
    if (y > 262) break;
    set(10, true, C.green); pdf.text(section, M, y); y += 2.5;
    pdf.setDrawColor(C.line); pdf.setLineWidth(.3); pdf.line(M, y, W - M, y); y += 5;
    for (const [k, v] of rows) {
      set(8.6, true, C.ink2); const kl = pdf.splitTextToSize(k, 46); pdf.text(kl, M, y);
      const end = para(v, M + 50, y, CW - 50, 8.6, C.ink, 4);
      y = Math.max(y + kl.length * 4, end) + 1.6;
      if (y > 272) break;
    }
    y += 3;
  }

  // ---- 6. Price --------------------------------------------------------------------------------------
  frame(6, 'Your price', 'Biohort\'s published UK prices for every part of your design, with their article numbers.');
  y = 54;
  set(8, true, C.muted); pdf.text('Item', M, y); pdf.text('Article', W - M - 52, y); pdf.text('Price', W - M, y, {align: 'right'});
  y += 2; pdf.setDrawColor(C.line); pdf.line(M, y, W - M, y); y += 5;
  for (const l of price.lines) {
    if (y > 238) { set(8, false, C.muted); pdf.text('And more: see your design link.', M, y); y += 6; break; }
    const nameLines = pdf.splitTextToSize(`${l.name}${l.qty > 1 ? ` (x ${l.qty})` : ''}`, CW - 62);
    set(8.6, false, C.ink2); pdf.text(nameLines, M, y);
    set(8, false, C.muted); pdf.text(l.sku, W - M - 52, y);
    set(8.6, true, C.ink); pdf.text(pounds(l.total), W - M, y, {align: 'right'});
    y += nameLines.length * 3.9 + 1.8;
  }
  for (const q of price.quoted) {
    if (y > 246) break;
    set(8.6, false, C.ink2); pdf.text(q.name, M, y);
    set(8, false, C.muted); pdf.text(pdf.splitTextToSize(q.note, 70)[0], W - M - 52 - 30, y);
    set(8.6, true, C.green); pdf.text('Quoted', W - M, y, {align: 'right'});
    y += 5.6;
  }
  pdf.setDrawColor(C.ink); pdf.setLineWidth(.4); pdf.line(M, y, W - M, y); y += 6;
  set(11, true, C.ink); pdf.text('Total, including 20% VAT', M, y); pdf.text(pounds(price.total), W - M, y, {align: 'right'}); y += 8;
  y = para(price.caveat, M, y, CW, 8.4, C.muted, 3.9) + 3;
  para(`Prices from Biohort's GB configurator and 2026 price lists (${COMPANY.priceList.replace('https://', '')}), read 13 October 2026. Biohort's prices do not constitute a binding offer; Biohort confirms your order. See this size in Biohort's shop: ${shopURL(s).replace('https://', '')}.`, M, Math.min(y, 268), CW, 7.6, C.muted, 3.5);

  // ---- 7. Next steps --------------------------------------------------------------------------------
  frame(7, 'What happens next', 'From your design to your building standing in the garden.');
  y = 56;
  const steps = [
    ['Send your design or book a call', 'Biohort\'s UK team checks every part with you, confirms the price and answers questions about your site.'],
    ['Prepare the base', `A level concrete slab or point foundations to Biohort's foundation plan${d.base ? ` (${d.base[0]} x ${d.base[1]}cm)` : ''}, or a Biohort SmartBase that needs no concrete.`],
    ['Free kerbside delivery', `To mainland Great Britain, ${s.range === 'casanova' ? 'within about 6 weeks' : 'usually within 3 weeks'}. The parts come in labelled boxes.`],
    ['Build it', 'With Biohort\'s photo-illustrated manual and assembly videos, or with an assembly partner Biohort finds near you.'],
    ['Enjoy it for decades', 'Maintenance-free steel with a 20-year guarantee, subject to Biohort\'s warranty terms and conditions.']
  ];
  steps.forEach(([t, dsc], i) => {
    pdf.setFillColor(C.green); pdf.circle(M + 4, y - 1.4, 4, 'F'); set(9.5, true, '#ffffff'); pdf.text(String(i + 1), M + 4, y + .2, {align: 'center'});
    set(10, true, C.ink); pdf.text(t, M + 12, y);
    y = para(dsc, M + 12, y + 5, CW - 12, 9, C.muted, 4.2) + 5;
  });
  y += 2;
  pdf.setFillColor(C.mist); pdf.roundedRect(M, y, CW, 58, 1.5, 1.5, 'F');
  set(12, true, C.ink); pdf.text('Book a call about this design', M + 6, y + 10);
  para('Choose a day and time and Biohort calls you to go through this design. The link opens your design with the booking form.', M + 6, y + 16, CW - 60, 9, C.ink2, 4.2);
  button('Book a call', M + 6, y + 32, 52, 11, booking);
  set(8.6, false, C.blue); pdf.textWithLink('Reopen your design in 3D', M + 64, y + 39, {url: link});
  qr(link, W - M - 44, y + 7, 38);
  set(7, false, C.muted); pdf.text('Scan to reopen your design', W - M - 25, y + 49.5, {align: 'center'});
  y += 66;
  set(10.5, true, C.ink); pdf.text('Talk to Biohort', M, y); y += 6;
  y = para(`Call ${COMPANY.phone} or email ${COMPANY.email}. Find a stockist near you at ${COMPANY.dealers.replace('https://', '')}.`, M, y, CW, 9, C.ink2, 4.3) + 3;
  para(`${r.name} is a registered trade mark of Biohort GmbH. ${COMPANY.registered}. Guarantee terms: ${COMPANY.guarantee.replace('https://', '')}.`, M, y, CW, 7.6, C.muted, 3.6);

  if (options.save !== false) pdf.save(`Biohort-${r.name}-${s.size.replace(/\s+/g, '')}-${ref}.pdf`);
  return pdf;
}

/** A dimensioned plan drawn in vectors: walls, roof edge, canopies, doors and windows, sizes. */
function drawPlan(pdf, s, x, y, w, h, set) {
  const g = geom(s), d = dims(s);
  const cl = canopyWidth(s, s.canopy.left), cr = canopyWidth(s, s.canopy.right);
  const roofW = d.W, roofD = d.D;
  const totalW = roofW + cl + cr + 1.6, totalD = roofD + 1.8;
  const k = Math.min(w / totalW, h / totalD);
  const ox = x + (w - totalW * k) / 2 + (cl + .8) * k + (roofW - g.ww) / 2 * k, oy = y + (h - totalD * k) / 2 + .9 * k + (roofD - g.wd) / 2 * k;
  const X = v => ox + v * k, Y = v => oy + v * k; // plan x from the left wall, y from the back wall
  const ovx = (roofW - g.ww) / 2, ovz = (roofD - g.wd) / 2;
  // Canopies, hatched.
  pdf.setFillColor('#e8efe0'); pdf.setDrawColor('#9fb487'); pdf.setLineWidth(.25);
  if (cl) pdf.rect(X(-ovx - cl), Y(-ovz), cl * k, roofD * k, 'FD');
  if (cr) pdf.rect(X(g.ww + ovx), Y(-ovz), cr * k, roofD * k, 'FD');
  // Roof edge, dashed.
  pdf.setDrawColor('#669637'); pdf.setLineWidth(.35); pdf.setLineDashPattern([1.2, .9], 0);
  pdf.rect(X(-ovx), Y(-ovz), roofW * k, roofD * k);
  pdf.setLineDashPattern([], 0);
  // Walls.
  const t = Math.max(g.t, .03);
  pdf.setFillColor('#4b4643'); pdf.rect(X(0), Y(0), g.ww * k, g.wd * k, 'F');
  pdf.setFillColor('#ffffff'); pdf.rect(X(t), Y(t), (g.ww - 2 * t) * k, (g.wd - 2 * t) * k, 'F');
  // Openings: a gap in the wall with a frame line and the clear width in mm.
  set(5.8, true, '#36332f');
  for (const o of [mainDoor(s), ...s.openings]) {
    const L = o.wall === 'front' || o.wall === 'back' ? g.ww : g.wd;
    const [h0, h1] = holeOf(s, g, o, L);
    let a, b, horiz, at;
    if (o.wall === 'front') { a = h0; b = h1; horiz = true; at = g.wd - t; }
    else if (o.wall === 'back') { a = g.ww - h1; b = g.ww - h0; horiz = true; at = 0; }
    else if (o.wall === 'left') { a = h0; b = h1; horiz = false; at = 0; }
    else { a = g.wd - h1; b = g.wd - h0; horiz = false; at = g.ww - t; }
    const door = o.id === 'main' || ['door', 'double'].includes(o.kind);
    pdf.setFillColor('#ffffff');
    if (horiz) pdf.rect(X(a), Y(at) - .05, (b - a) * k, t * k + .1, 'F'); else pdf.rect(X(at) - .05, Y(a), t * k + .1, (b - a) * k, 'F');
    pdf.setDrawColor(door ? '#4e7a2b' : '#2a4d8a'); pdf.setLineWidth(door ? .5 : .3);
    if (horiz) { const yy = Y(at + t / 2); pdf.line(X(a), yy, X(b), yy); } else { const xx = X(at + t / 2); pdf.line(xx, Y(a), xx, Y(b)); }
    const label = String(Math.round((h1 - h0) * 1000));
    if (o.wall === 'front') pdf.text(label, X((a + b) / 2), Y(g.wd) + 3.4, {align: 'center'});
    else if (o.wall === 'back') pdf.text(label, X((a + b) / 2), Y(0) - 1.6, {align: 'center'});
    else if (o.wall === 'left') pdf.text(label, X(0) - 1.4, Y((a + b) / 2) + 1, {align: 'right'});
    else pdf.text(label, X(g.ww) + 1.4, Y((a + b) / 2) + 1);
  }
  // Dimensions: walls and roof.
  pdf.setDrawColor('#1b1b1b'); pdf.setLineWidth(.25);
  const dimH = (x0, x1, yy, label) => { pdf.line(X(x0), yy, X(x1), yy); pdf.line(X(x0), yy - 1.2, X(x0), yy + 1.2); pdf.line(X(x1), yy - 1.2, X(x1), yy + 1.2); set(7.2, true, '#1b1b1b'); pdf.text(label, X((x0 + x1) / 2), yy + 3.6, {align: 'center'}); };
  const dimV = (y0, y1, xx, label, right = true) => { pdf.line(xx, Y(y0), xx, Y(y1)); pdf.line(xx - 1.2, Y(y0), xx + 1.2, Y(y0)); pdf.line(xx - 1.2, Y(y1), xx + 1.2, Y(y1)); set(7.2, true, '#1b1b1b'); pdf.text(label, xx + (right ? 1.8 : -1.8), Y((y0 + y1) / 2) + 1.2, {align: right ? 'left' : 'right'}); };
  const fy = Y(g.wd + ovz) + 6, fy2 = fy + 7;
  dimH(0, g.ww, fy, `${metres(g.ww)} walls`);
  dimH(-ovx, g.ww + ovx, fy2, `${metres(roofW)} roof`);
  const rx = X(g.ww + ovx + cr) + 5, rx2 = rx + 16;
  dimV(0, g.wd, rx, `${metres(g.wd)} walls`);
  dimV(-ovz, g.wd + ovz, rx2, `${metres(roofD)} roof`);
  if (cl) { set(6.2, false, '#4e7a2b'); pdf.text(`${metres(cl)} canopy`, X(-ovx - cl / 2), Y(g.wd / 2), {align: 'center'}); }
  if (cr) { set(6.2, false, '#4e7a2b'); pdf.text(`${metres(cr)} canopy`, X(g.ww + ovx + cr / 2), Y(g.wd / 2), {align: 'center'}); }
  set(6.4, true, '#5b5652');
  pdf.text('FRONT', X(g.ww / 2), fy2 + 8, {align: 'center'});
  pdf.text('BACK', X(g.ww / 2), Y(-ovz) - 3.2, {align: 'center'});
}
