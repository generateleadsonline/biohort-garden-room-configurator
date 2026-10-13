// POST /api/enquiry: every form on the designer (callback, showroom, brochure, book a call,
// send my design, PDF). Validates the contact details (UK phone by Ofcom's numbering rules),
// rebuilds the design from its code on the server, and stores the enquiry with the full
// specification, every priced line with Biohort's article numbers, and links to the design and to
// book a call. Nothing is emailed: records sit in the private Netlify Blobs store `biohort-enquiries`.
import {decodeDesign, specRows, priceFor, designURL, bookingURL, summaryLine, designReference, shopURL, parseUKPhone, validEmail, validPostcode, formatPostcode, validName, SITE} from '../src/catalog.js';

export const TYPES = ['callback', 'showroom', 'brochure', 'book', 'quote', 'pdf'];
const MAX_BODY = 24 * 1024;
const json = (status, body) => new Response(JSON.stringify(body), {status, headers: {'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store'}});
const clean = (v, n = 200) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);

export function reference(now = new Date(), rand = Math.random) {
  const d = now.toISOString().slice(0, 10).replace(/-/g, '');
  let s = '';
  for (let i = 0; i < 6; i++) s += 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(rand() * 32)];
  return `BHE-${d}-${s}`;
}

/** Same-origin browsers only: a page on another site cannot post leads into the store. */
function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

export async function handleEnquiry(request, {store, now = () => new Date(), rand = Math.random} = {}) {
  if (request.method !== 'POST') return json(405, {ok: false, error: 'Use POST.'});
  if (!sameOrigin(request)) return json(403, {ok: false, error: 'This form only accepts enquiries from the designer.'});
  const text = await request.text();
  if (text.length > MAX_BODY) return json(413, {ok: false, error: 'That enquiry is too large.'});
  let b;
  try { b = JSON.parse(text); } catch { return json(400, {ok: false, error: 'That enquiry could not be read.'}); }
  if (!b || typeof b !== 'object') return json(400, {ok: false, error: 'That enquiry could not be read.'});
  const type = TYPES.includes(b.type) ? b.type : null;
  if (!type) return json(400, {ok: false, error: 'Unknown form.'});
  // Honeypot: bots fill the hidden company field. Answer as if accepted, store nothing.
  if (clean(b.company)) return json(200, {ok: true, reference: reference(now(), rand)});
  const errors = [];
  if (!validName(b.firstName)) errors.push(['first', 'Enter your first name.']);
  if (!validName(b.lastName)) errors.push(['last', 'Enter your last name.']);
  const phone = parseUKPhone(b.phone);
  if (!phone.valid) errors.push(['phone', 'Enter a UK mobile or landline number, such as 07700 123456.']);
  if (!validEmail(b.email)) errors.push(['email', 'Enter an email address like name@example.com.']);
  if (!validPostcode(b.postcode)) errors.push(['postcode', 'Enter a full UK postcode, such as SW1A 1AA.']);
  if (errors.length) return json(400, {ok: false, field: errors[0][0], error: errors[0][1], fields: errors.map(e => e[0])});
  const design = decodeDesign(b.design);
  if (!design) return json(400, {ok: false, error: 'The design could not be read. Reload the page and try again.'});

  const ref = reference(now(), rand);
  const price = priceFor(design);
  const origin = (() => { try { return new URL(request.url).origin; } catch { return SITE; } })();
  const record = {
    reference: ref, createdAt: now().toISOString(), type, placement: clean(b.placement, 40),
    contact: {
      firstName: clean(b.firstName, 60), lastName: clean(b.lastName, 60), phone: phone.e164, phoneDisplay: phone.display, phoneKind: phone.kind,
      email: clean(b.email, 254).toLowerCase(), postcode: formatPostcode(b.postcode), marketing: b.marketing === true
    },
    extra: Object.fromEntries(Object.entries(b.extra && typeof b.extra === 'object' ? b.extra : {}).slice(0, 8).map(([k, v]) => [clean(k, 30), clean(v, 1000)])),
    design: {
      code: b.design, reference: designReference(design), summary: summaryLine(design),
      url: designURL(design, origin), bookingUrl: bookingURL(design, origin), shopUrl: shopURL(design),
      specification: specRows(design),
      price: {status: price.status, total: price.total, headline: price.headline, lines: price.lines.map(l => ({sku: l.sku, name: l.name, qty: l.qty, unit: l.unit, total: l.total})), quoted: price.quoted}
    },
    page: clean(b.page, 300), attribution: Object.fromEntries(Object.entries(b.attribution && typeof b.attribution === 'object' ? b.attribution : {}).slice(0, 10).map(([k, v]) => [clean(k, 30), clean(v, 200)])),
    userAgent: clean(request.headers.get('user-agent'), 300),
    consent: 'Submitted on the Biohort garden building designer, which says the design, its specification and a link to it are sent with the details, used only to reply, with a link to Biohort\'s privacy policy.'
  };
  try { await store.setJSON(`enquiries/${record.createdAt.slice(0, 10)}/${ref}`, record); }
  catch (err) { console.error('enquiry store failed', err?.message); return json(503, {ok: false, error: 'We could not save your details just now'}); }
  return json(200, {ok: true, reference: ref, design: record.design.url});
}
