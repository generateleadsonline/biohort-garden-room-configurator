import test from 'node:test';
import assert from 'node:assert/strict';
import { deflateSync } from 'node:zlib';
import { validateConfig, validateSubmission, validatePreviewImage } from '../netlify/functions/lib/validation.mjs';
import { priceConfig } from '../netlify/functions/lib/pricing.mjs';
import { createQuoteHandler } from '../netlify/functions/quote.mjs';
import { createPdfHandler } from '../netlify/functions/pdf.mjs';
import { buildQuotePdf, publicDesignUrl } from '../netlify/functions/lib/pdf-document.mjs';
import { createCleanupHandler } from '../netlify/functions/cleanup.mjs';

const config = { width: 3, depth: 4, color: 'dark', door: 'glass', doorPosition: 'left', glass: 1, window: false, foundation: 'advice', assembly: 'professional', purpose: 'Relax & unwind', timeline: 'Just exploring', accessories: [] };
const payload = () => ({ name: 'Design QA', email: 'qa@example.com', postcode: 'SW1A 1AA', config: { ...config, accessories: [] } });
const token = 'd517a8c1-f465-4d2b-9700-5509b486f10d';
const now = () => new Date('2026-10-11T10:00:00.000Z');
const post = data => new Request('https://biohort-test.netlify.app/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://biohort-test.netlify.app' }, body: JSON.stringify(data) });
const record = () => ({ schema: 1, token, reference: 'BH-20261011-D517A8C1', createdAt: now().toISOString(), expiresAt: '2026-11-10T10:00:00.000Z', ...validateSubmission(payload()), pricing: priceConfig(config) });

test('Published UK price matrix supports nine genuine sizes and excludes 4x3', () => {
  for (const [size, price] of Object.entries({ '3x2': 8679, '3x3': 9989, '3x4': 11569, '3x5': 12949, '3x6': 14729, '4x2': 10519, '4x4': 13669, '4x5': 15249, '4x6': 16829 })) {
    const [width, depth] = size.split('x').map(Number);
    assert.equal(priceConfig({ ...config, width, depth, door: 'standard', glass: 0 }).total, price);
  }
  assert.throws(() => validateConfig({ ...config, width: 4, depth: 3 }), /unavailable/);
});

test('Quote accounts for each glass insert, glazed wall and selected accessory once', () => {
  const price = priceConfig({ ...config, window: true, accessories: ['lights', 'table', 'shelf', 'bike', 'floorframe'] });
  assert.equal(price.total, 11569 + 529 + 2 * 1259 + 1439 + 1439 + 59 + 139 + 158 + 99 + 499);
  assert.equal(price.total, price.lineItems.reduce((sum, item) => sum + item.total, 0));
  assert.equal(price.vatAmount + price.subtotal, price.total);
  assert.deepEqual(price.dimensions, { width: 3.28, depth: 4.28, height: 2.505, nominalWidth: 3, nominalDepth: 4, exteriorArea: 14.04 });
  assert.throws(() => validateConfig({ ...config, depth: 2, accessories: ['shelf'] }), /deeper/);
  assert.throws(() => validateConfig({ ...config, accessories: ['lights', 'lights'] }), /accessories/);
});

test('Contact validation retains optional consent and gives useful field errors', () => {
  const checked = validateSubmission({ ...payload(), postcode: 'sw1a1aa', phone: '', marketing: false });
  assert.equal(checked.contact.postcode, 'SW1A 1AA');
  assert.equal(checked.contact.marketing, false);
  assert.throws(() => validateSubmission({ ...payload(), name: '', email: 'x', postcode: 'missing' }), error => Object.keys(error.fields).length === 3);
  assert.throws(() => validateSubmission({ ...payload(), country: 'Austria' }), /choices/);
});

test('PNG admission rejects arbitrary data and excessive dimensions', () => {
  assert.throws(() => validatePreviewImage('https://example.com/image.png'), /preview/);
  const bytes = Buffer.alloc(33);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(bytes);
  bytes.write('IHDR', 12); bytes.writeUInt32BE(50000, 16); bytes.writeUInt32BE(50000, 20);
  assert.throws(() => validatePreviewImage(`data:image/png;base64,${bytes.toString('base64')}`), /large/);
  const chunk = (type, data) => { const c = Buffer.alloc(data.length + 12); c.writeUInt32BE(data.length); c.write(type, 4); data.copy(c, 8); return c; };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(1, 0); ihdr.writeUInt32BE(1, 4); ihdr[8] = 8; ihdr[9] = 6;
  const malicious = Buffer.concat([bytes.subarray(0, 8), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(Buffer.alloc(1_000_000))), chunk('IEND', Buffer.alloc(0))]);
  assert.throws(() => validatePreviewImage(`data:image/png;base64,${malicious.toString('base64')}`), /invalid/);
});

test('Price stays locked until a persistent write succeeds and contact data is not returned', async () => {
  let stored;
  const handler = createQuoteHandler({ storeFactory: () => ({ setJSON: async (_key, entry) => { stored = entry; } }), now, uuid: () => token });
  const response = await handler(post(payload()));
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.equal(result.token, token); assert.equal(stored.contact.email, 'qa@example.com'); assert.equal(stored.pricing.total, result.pricing.total);
  assert.equal('contact' in result, false); assert.equal('email' in result, false);
  assert.match(response.headers.get('cache-control'), /no-store/);
  const failed = createQuoteHandler({ storeFactory: () => ({ setJSON: async () => { throw new Error('storage offline'); } }) });
  const denied = await failed(post(payload()));
  assert.equal(denied.status, 503); assert.equal('token' in await denied.json(), false);
});

test('Quote endpoint rejects cross-site and invalid submissions without writes', async () => {
  let writes = 0;
  const handler = createQuoteHandler({ storeFactory: () => ({ setJSON: async () => { writes++; } }) });
  const crossSite = new Request('https://biohort-test.netlify.app/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://other.example' }, body: JSON.stringify(payload()) });
  assert.equal((await handler(crossSite)).status, 403);
  assert.equal((await handler(post({ ...payload(), config: { ...config, width: 4, depth: 3 } }))).status, 422);
  assert.equal(writes, 0);
});

test('PDF gate fails closed for absent, unknown, expired or unavailable tokens', async () => {
  const missing = createPdfHandler({ storeFactory: () => ({ get: async () => null }), now });
  assert.equal((await missing(new Request('https://biohort-test.netlify.app/api/pdf'))).status, 401);
  assert.equal((await missing(new Request(`https://biohort-test.netlify.app/api/pdf?token=${token}`))).status, 404);
  const expired = createPdfHandler({ storeFactory: () => ({ get: async () => ({ ...record(), expiresAt: '2020-01-01T00:00:00Z' }) }), now });
  assert.equal((await expired(new Request(`https://biohort-test.netlify.app/api/pdf?token=${token}`))).status, 410);
  const offline = createPdfHandler({ storeFactory: () => ({ get: async () => { throw new Error('offline'); } }), now });
  assert.equal((await offline(new Request(`https://biohort-test.netlify.app/api/pdf?token=${token}`))).status, 503);
});

test('Saved quote produces a real six-page PDF and public edit links exclude contact details', async () => {
  const entry = record();
  const bytes = buildQuotePdf(entry, 'https://biohort-test.netlify.app');
  assert.match(Buffer.from(bytes).toString('latin1', 0, 20), /^%PDF-/);
  assert.equal((Buffer.from(bytes).toString('latin1').match(/\/Type \/Page\b/g) ?? []).length, 6);
  const url = publicDesignUrl('https://biohort-test.netlify.app', entry.config);
  assert.deepEqual(JSON.parse(new URL(url).searchParams.get('design')), entry.config);
  assert.equal(url.includes('qa%40'), false); assert.equal(url.includes(token), false);
  const handler = createPdfHandler({ storeFactory: () => ({ get: async () => entry }), now });
  const response = await handler(new Request(`https://biohort-test.netlify.app/api/pdf?token=${token}`));
  assert.equal(response.status, 200); assert.equal(response.headers.get('content-type'), 'application/pdf');
  assert.match(response.headers.get('content-disposition'), /attachment/);
});

test('Nightly retention deletes only records whose saved expiry has elapsed', async () => {
  const removed = [];
  const store = {
    list: async function* () { yield { blobs: [{ key: 'quotes/expired' }, { key: 'quotes/current' }, { key: 'quotes/invalid' }] }; },
    getMetadata: async key => ({ metadata: { expiresAt: key.endsWith('expired') ? '2026-10-10T00:00:00Z' : key.endsWith('current') ? '2026-10-20T00:00:00Z' : 'invalid' } }),
    delete: async key => { removed.push(key); },
  };
  const response = await createCleanupHandler({ storeFactory: () => store, now })();
  assert.equal(response.status, 200); assert.deepEqual(removed, ['quotes/expired']);
  assert.equal((await response.json()).deleted, 1);
});
