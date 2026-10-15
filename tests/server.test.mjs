// The enquiry and diagnostics functions, run in-process against a memory store.
import test from 'node:test';
import assert from 'node:assert/strict';
import {handleEnquiry} from '../server/enquiry.mjs';
import {handleDiagnostics} from '../server/diagnostics.mjs';
import {encodeDesign, normalise} from '../src/catalog.js';

const memory = () => { const m = new Map(); return {m, async setJSON(k, v) { m.set(k, v); }, async get(k) { return m.get(k) ?? null; }}; };
const ORIGIN = 'https://biohort-garden-room-configurator.netlify.app';
const post = (body, headers = {}) => new Request(ORIGIN + '/api/enquiry', {method: 'POST', headers: {'content-type': 'application/json', origin: ORIGIN, ...headers}, body: JSON.stringify(body)});
const good = (extra = {}) => ({type: 'quote', firstName: 'Sam', lastName: 'Taylor', phone: '07911 123456', email: 'sam@example.com', postcode: 'kt152qg', design: encodeDesign(normalise({})), extra: {notes: 'Side access only'}, ...extra});

test('a valid enquiry is stored with the specification, price status and links to the design and booking', async () => {
  const store = memory();
  const res = await handleEnquiry(post(good()), {store});
  const body = await res.json();
  assert.equal(res.status, 200); assert.ok(body.ok); assert.match(body.reference, /^BHE-\d{8}-[A-Z2-9]{6}$/);
  const [key, rec] = [...store.m][0];
  assert.match(key, /^enquiries\/\d{4}-\d{2}-\d{2}\/BHE-/);
  assert.equal(rec.contact.firstName, 'Sam'); assert.equal(rec.contact.lastName, 'Taylor');
  assert.equal(rec.contact.phone, '+447911123456'); assert.equal(rec.contact.postcode, 'KT15 2QG');
  assert.equal(rec.design.price.total, 2699); assert.equal(rec.design.price.status, 'published');
  assert.deepEqual(rec.design.price.lines.map(l => l.sku), ['84040']);
  assert.ok(rec.design.url.startsWith(ORIGIN + '/configurator/#d=b1.'));
  assert.ok(rec.design.bookingUrl.includes('?book=1#d='));
  assert.ok(rec.design.shopUrl.includes('/garden-shed-highline/84040'));
  assert.ok(JSON.stringify(rec.design.specification).includes('Metallic dark grey'));
  assert.equal(rec.extra.notes, 'Side access only');
});

test('each contact field is validated on the server, with the field named', async () => {
  for (const [field, patch] of [['first', {firstName: ''}], ['last', {lastName: '1'}], ['phone', {phone: '07700 900123'}], ['phone', {phone: '0217 123 4567'}], ['email', {email: 'nope'}], ['postcode', {postcode: 'KT15'}]]) {
    const store = memory();
    const res = await handleEnquiry(post(good(patch)), {store});
    const body = await res.json();
    assert.equal(res.status, 400); assert.equal(body.field, field, JSON.stringify(patch)); assert.equal(store.m.size, 0);
  }
});

test('other origins, unknown forms, bad designs and oversized bodies are refused; the honeypot stores nothing', async () => {
  const store = memory();
  assert.equal((await handleEnquiry(post(good(), {origin: 'https://evil.example'}), {store})).status, 403);
  assert.equal((await handleEnquiry(post(good({type: 'spam'})), {store})).status, 400);
  assert.equal((await handleEnquiry(post(good({design: 'x'})), {store})).status, 400);
  assert.equal((await handleEnquiry(post(good({extra: {notes: 'x'.repeat(30000)}})), {store})).status, 413);
  const hp = await handleEnquiry(post(good({company: 'Acme'})), {store});
  assert.equal(hp.status, 200); assert.equal(store.m.size, 0);
  assert.equal((await handleEnquiry(new Request(ORIGIN + '/api/enquiry'), {store})).status, 405);
});

test('every form type is accepted', async () => {
  for (const type of ['callback', 'showroom', 'brochure', 'book-call', 'book', 'quote', 'pdf']) {
    const store = memory();
    assert.equal((await handleEnquiry(post(good({type})), {store})).status, 200, type);
    assert.equal([...store.m.values()][0].type, type);
  }
});

test('diagnostics: stored for a phone, read back by code, skipped for headless browsers', async () => {
  const store = memory();
  const req = ua => new Request(ORIGIN + '/api/diagnostics', {method: 'POST', headers: {'user-agent': ua}, body: JSON.stringify({report: '3D: safe', diagnostics: {rung: 'safe'}})});
  const a = await (await handleDiagnostics(req('Mozilla/5.0 (Linux; Android 16; Pixel 10) Chrome/141'), {store})).json();
  assert.ok(a.stored); assert.match(a.code, /^3D-[A-Z2-9]{8}$/);
  const got = await (await handleDiagnostics(new Request(ORIGIN + '/api/diagnostics?code=' + a.code), {store})).json();
  assert.equal(got.report.report, '3D: safe');
  const b = await (await handleDiagnostics(req('Mozilla/5.0 HeadlessChrome/141'), {store})).json();
  assert.equal(b.stored, false); assert.equal(store.m.size, 1);
});
