// The design model: published prices, pricing rules, sizes, normalisation, share codes and the
// UK phone and postcode rules. Prices are pinned to My Retreat's website (13 Oct 2026); if their
// price lists change, these tests should be the first thing to fail.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/catalog.js';

// Copied by hand from myretreatgardenrooms.co.uk/service/ashton-garden-room/ and
// /service/clifton-garden-room/ (research/site-2026-10-13/*.txt).
const SITE = {
  ashton: {'2.9x2.9': [19563, 21610, 22845], '4x2.9': [22927, 25132, 26573], '5.2x2.9': [25923, 27190, 28838], '5.2x3.4': [27338, 30313, 32063], '5.2x4': [30239, 33126, 34979], '5.8x4': [31257, 34223, 36179], '7x4': [33362, 36486, 38648]},
  clifton: {'2.9x2.9': [22321, 22149, 23416], '4x2.9': [26296, 25890, 27390], '5.2x2.9': [28806, 28196, 29899], '5.2x3.4': [31849, 31319, 33124], '5.2x4': [34583, 34132, 36040], '5.8x4': [35926, 35357, 37383], '7x4': [38639, 37858, 40097]}
};
const plain = (range, w, d, cladding, extra = {}) => ({range, width: w, depth: d, cladding, colour: C.CLADDINGS[cladding].colours[0].id, coverage: 'front-left', openings: [{id: 'd1', wall: 'front', type: 'slide2m', p: .5}, {id: 'w1', wall: 'left', type: 'openM', p: .5}], ...extra});

test('every published Ashton and Clifton price is returned exactly, for that size and cladding only', () => {
  let n = 0;
  for (const [range, rows] of Object.entries(SITE)) for (const [size, prices] of Object.entries(rows)) {
    const [w, d] = size.split('x').map(Number);
    ['thermowood', 'lap', 'cedar'].forEach((cl, i) => {
      const p = C.priceFor(plain(range, w, d, cl));
      assert.equal(p.status, 'published', `${range} ${size} ${cl}`);
      assert.equal(p.base, prices[i], `${range} ${size} ${cl}`);
      n++;
    });
  }
  assert.equal(n, 42);
});

test('the compact Ashton: £18,032 front-only, £19,066 two elevations, Thermowood and a single door only', () => {
  const base = plain('ashton', 2.9, 2.1, 'thermowood', {openings: [{wall: 'front', type: 'single', p: .4}, {wall: 'front', type: 'openS', p: .8}]});
  assert.equal(C.priceFor({...base, coverage: 'front'}).base, 18032);
  assert.equal(C.priceFor({...base, coverage: 'front-right'}).base, 19066);
  assert.equal(C.priceFor({...base, cladding: 'cedar', colour: 'natural'}).status, 'quoted');
  assert.equal(C.priceFor({...base, openings: [{wall: 'front', type: 'french', p: .5}]}).status, 'quoted');
  assert.equal(C.priceFor({...base, range: 'clifton'}).status, 'quoted', 'compact Clifton is priced on request');
});

test('no price is invented: made-to-measure sizes, quoted claddings, four sides and over 30m² are quoted', () => {
  assert.equal(C.priceFor(plain('clifton', 5.5, 3.4, 'cedar')).base, null);
  for (const cl of ['charred', 'vl', 'ecoscape']) assert.equal(C.priceFor(plain('clifton', 5.2, 3.4, cl)).base, null, cl);
  assert.equal(C.priceFor(plain('ashton', 5.2, 3.4, 'cedar', {coverage: 'all'})).base, null);
  assert.equal(C.priceFor(plain('ashton', 5.2, 3.4, 'cedar', {coverage: 'front'})).base, null);
  assert.equal(C.priceFor(plain('ashton', 7, 4.6, 'cedar')).base, null);
  const near = C.priceFor(plain('clifton', 5.5, 3.4, 'cedar')).nearest;
  assert.deepEqual([near.width, near.depth, near.price], [5.8, 4, 37383]);
});

test('upgrades never carry a number and are marked Upgrade or Quoted', () => {
  const s = plain('clifton', 5.2, 3.4, 'cedar', {extras: {aircon: true, usb: true, sedum: true}, deck: {front: 1.2}, electrics: 'premium', overhangSides: {left: true}, extensions: {right: .3}, sockets: 'black', walls: 'sage',
    openings: [{wall: 'front', type: 'bifold3', p: .5}, {wall: 'left', type: 'openM', p: .5}, {wall: 'back', type: 'openS', p: .3}]});
  const p = C.priceFor(s);
  assert.equal(p.status, 'base');
  assert.equal(p.base, 33124);
  for (const u of p.upgrades) { assert.ok(['Upgrade', 'Quoted'].includes(u.status), u.name); assert.ok(!/£\s?\d/.test(u.name), u.name); }
  const keys = p.upgrades.map(u => u.key);
  for (const k of ['aluminium', 'windows', 'overhangSides', 'extensions', 'deck', 'electrics', 'sockets', 'walls', 'aircon', 'usb', 'sedum']) assert.ok(keys.includes(k), k);
});

test('sizes follow the site minimum and the embedded tool limits', () => {
  assert.equal(C.normalise({width: 1, depth: 1}).width, 2.9);
  assert.equal(C.normalise({width: 1, depth: 1}).depth, 2.1);
  assert.equal(C.normalise({width: 99}).width, 10.7);
  assert.equal(C.maxDepthFor(5.2), 5.9);
  assert.equal(C.maxDepthFor(5.8), 5.2);
  assert.equal(C.maxDepthFor(7), 4.6);
  assert.equal(C.normalise({width: 7, depth: 8}).depth, 4.6);
  for (const [w, d] of C.PUBLISHED_SIZES) { const s = C.normalise({width: w, depth: d}); assert.deepEqual([s.width, s.depth], [w, d]); }
});

test('normalise keeps a design valid: Ashton has no overhang, bifolds are aluminium, openings fit their walls', () => {
  const s = C.normalise({range: 'ashton', overhang: .6, extensions: {left: .6}, openings: [{wall: 'front', type: 'bifold4', material: 'upvc', p: 0}, {wall: 'front', type: 'slide4l', p: .1}]});
  assert.equal(s.overhang, 0); assert.equal(s.extensions.left, 0);
  assert.equal(s.openings.length, 1, 'two 3.45m doors cannot both fit a 5.2m wall');
  assert.equal(C.normalise({openings: [{wall: 'front', type: 'bifold3', material: 'upvc', p: .5}]}).openings[0].material, 'alu');
  const {a, b, L} = C.wallSpan(s, 'front');
  for (const o of s.openings) { const c = o.p * L, hw = C.OPENINGS[o.type].w / 2; assert.ok(c - hw >= a - 2e-3 && c + hw <= b + 2e-3, `${c} ${hw}`); }
  assert.equal(C.normalise({cladding: 'vl', colour: 'c50', direction: 'vertical'}).direction, 'vertical');
  assert.equal(C.normalise({cladding: 'cedar', direction: 'horizontal'}).direction, 'vertical');
});

test('share codes round-trip every option and stay short', () => {
  const s = C.normalise({range: 'clifton', use: 'bar', width: 6.3, depth: 3.7, cladding: 'ecoscape', colour: 'havana', coverage: 'all', metal: 'black', frame: 'black', overhang: .3, overhangSides: {back: true}, extensions: {left: .3}, deck: {front: 2.4, right: .6}, deckColour: 'oak', floor: 'walnut', walls: 'blue', electrics: 'upgrade', sockets: 'chrome', lights: 'chrome', extras: {speakers: true, data: true}, openings: [{wall: 'front', type: 'frenchSide', p: .5}, {wall: 'back', type: 'openHigh', material: 'alu', p: .5}]});
  const code = C.encodeDesign(s);
  assert.ok(code.length < 110, `${code.length} chars`);
  const back = C.decodeDesign(code);
  const strip = x => JSON.stringify({...x, step: 0, openings: x.openings.map(o => ({...o, id: ''}))});
  assert.equal(strip(back), strip(s));
  assert.equal(C.decodeDesign('nonsense'), null);
  assert.equal(C.designReference(s), C.designReference(back));
});

test('UK phone numbers follow Ofcom numbering', () => {
  for (const ok of ['020 3818 5911', '+44 20 3818 5911', '01932 123456', '07911 123456', '+447911123456', '0044 7911 123456', '0333 880 6157', '0800 123 4567', '01697 73123']) assert.ok(C.parseUKPhone(ok).valid, ok);
  for (const [bad, why] of [['', 'empty'], ['07700 900123', 'fictional'], ['020 7946 0123', 'fictional'], ['0217 123 4567', 'range'], ['0909 123 4567', 'range'], ['0700 123 4567', 'range'], ['07624 1234', 'short'], ['07624 12345', 'range'], ['0123', 'short'], ['+33 1 23 45 67 89', 'international'], ['07911 123 4567 8', 'long'], ['call me', 'characters'], ['07777 777777', 'fictional']]) assert.equal(C.parseUKPhone(bad).reason, why, bad);
  assert.equal(C.parseUKPhone('07911123456').display, '07911 123456');
  assert.equal(C.parseUKPhone('02038185911').display, '020 3818 5911');
});

test('postcodes, emails and names', () => {
  for (const p of ['KT15 2QG', 'kt152qg', 'SW1A 1AA', 'GU1 1AA', 'M1 1AE']) assert.ok(C.validPostcode(p), p);
  for (const p of ['KT15', 'ZZ1 1ZZ', '12345']) assert.ok(!C.validPostcode(p), p);
  assert.equal(C.formatPostcode('kt152qg'), 'KT15 2QG');
  assert.ok(C.validEmail('sam@example.co.uk')); assert.ok(!C.validEmail('sam@example'));
  assert.ok(C.validName("Sian O'Neill")); assert.ok(C.validName('Zoë')); assert.ok(!C.validName('<b>'));
});

test('the specification lists every choice', () => {
  const s = C.normalise({extras: {aircon: true}, deck: {front: 1.2}});
  const text = JSON.stringify(C.specRows(s));
  for (const t of ['Clifton', '5.2m x 3.4m', 'Western Red Cedar', 'Front and left side', 'Anthracite grey', '600mm', 'Decking', 'Front: 2-panel sliding, mid (UPVC)', 'Howdens', 'Standard package', 'air conditioning', 'Steel floor frame']) assert.ok(text.includes(t), t);
});
