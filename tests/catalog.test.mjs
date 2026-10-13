// The design model: every published size, colour and door has Biohort's SKU and GB price; every
// option the designer offers resolves to a SKU for every size, colour and door it is offered with;
// share codes round-trip; UK phone numbers follow Ofcom's plan.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/catalog.js';
import {PRICES} from '../src/data/prices.js';
import {SIZES} from '../src/data/sizes.js';

const designs = function* () {
  for (const range of C.RANGE_ORDER) for (const size of C.sizeCodes(range)) for (const colour of C.RANGES[range].colours) for (const door of ['standard', 'double']) for (const model of range === 'avantgarde' ? ['classic', 'eco'] : ['classic']) for (const hinge of range === 'casanova' ? ['right', 'left'] : ['right']) {
    const s = C.normalise({range, size, colour, door, model, hinge});
    if (door === 'double' && s.door !== 'double') continue;
    yield s;
  }
};

test('every published size, colour and door has Biohort\'s SKU and GB price', () => {
  let n = 0;
  for (const range of C.RANGE_ORDER) for (const row of SIZES[range]) for (const sku of Object.values(row.sku)) { assert.ok(PRICES[sku], `${range} ${row.code} ${sku}`); n++; }
  assert.equal(n, 39 + 96 + 36 + 30 + 84 + 36);
  for (const s of designs()) assert.ok(C.buildingSku(s), `${s.range} ${s.size} ${s.colour} ${s.door}`);
});

test('pinned prices from Biohort\'s GB configurator and 2026 price list', () => {
  const p = d => C.priceFor(d).total;
  assert.equal(p({range: 'highline', size: 'H3', colour: 'darkgrey'}), 2699);
  assert.equal(p({range: 'highline', size: 'H2', colour: 'darkgrey', door: 'double'}), 2609);
  assert.equal(p({range: 'highline', size: 'H2', door: 'double', foundation: 'frame'}), 2609 + 219);
  assert.equal(p({range: 'europa', size: '3'}), 1299);
  assert.equal(p({range: 'europa', size: '5', foundation: 'frame'}), 2028);
  assert.equal(p({range: 'europa', size: '5', foundation: 'frame', canopy: {left: 'on'}}), 2377);
  assert.equal(p({range: 'neo', size: '2B', door: 'double', foundation: 'frame'}), 3978);
  assert.equal(p({range: 'neo', size: '2B', door: 'double', foundation: 'frame', panelling: true}), 4897);
  assert.equal(p({range: 'neo', size: '2B', door: 'double', foundation: 'frame', panelling: true, insulation: true}), 5066);
  assert.equal(p({range: 'neo', size: '2B', door: 'standard', foundation: 'frame', panelling: true, insulation: true}), 4906);
  assert.equal(p({range: 'avantgarde', size: 'A1'}), 1589);
  assert.equal(p({range: 'avantgarde', size: 'A1', model: 'eco'}), 1349);
  assert.equal(p({range: 'panorama', size: 'P2', door: 'double', foundation: 'frame'}), 2989 + 219);
  assert.equal(p({range: 'casanova', size: '3x4'}), 11569);
  assert.equal(p({range: 'casanova', size: '3x4', skylight: true}), 11569 + 319);
  assert.equal(p({range: 'casanova', size: '3x4', roofSupport: true}), 11569 + 329);
  assert.equal(p({range: 'highline', size: 'H3', canopy: {left: 'S'}}), 2699 + 1229);
  assert.equal(p({range: 'highline', size: 'H5', canopy: {left: 'L'}}), 3199 + 1749);
});

test('every option offered resolves to a priced SKU for every size, colour and door', () => {
  let checked = 0;
  for (const s of designs()) {
    const kinds = C.kindsFor(s);
    const can = C.canopyOptions(s);
    const items = Object.fromEntries(C.itemsFor(s.range).filter(k => C.itemFits(s, k)).map(k => [k, 2]));
    const full = C.normalise({...s, openings: kinds.map((k, i) => ({kind: k, wall: ['left', 'right', 'back'][i % 3], p: .5})),
      canopy: can.length ? {left: can[can.length - 1], right: can[1]} : undefined, canopyWalls: {left: {back: true, side: true}, right: {back: true, side: true}},
      downpipe: C.downpipeOptions(s).slice(-1)[0], foundation: 'frame', floorPlate: true, pv: true, skylight: true, roofSupport: true,
      extLight: {front: true, left: true, right: true, back: true}, gasSpring: true, panelling: true, insulation: true, sauna: 'right', led: 1, solar: 1,
      floraboard: 2, canopyGlass: 2, canopyFlora: 1, items, bikeLift: 'standard', doorGlass: true});
    for (const f of C.foundationOptions(s)) {
      const d = C.normalise({...full, foundation: f, anchors: f === 'none'});
      const p = C.priceFor(d);
      const unexpected = p.missing.filter(q => q.name !== 'Additional double door' && !(d.size === '3x3' && q.key === 'gate'));
      assert.deepEqual(unexpected, [], `${s.range} ${s.size} ${s.colour} ${s.door} ${f}`);
      for (const l of p.lines) assert.equal(l.unit, PRICES[l.sku][0]);
      checked++;
    }
  }
  assert.ok(checked > 1000, `${checked} designs`);
});

test('data-sheet errors are not shown: Neo 3B interior and foundation, CasaNova 3 x 3 electric door', () => {
  const d = C.dims(C.normalise({range: 'neo', size: '3B'}));
  assert.deepEqual([d.iw, d.id, d.area], [2.2, 2.76, 6.07]);
  assert.equal(d.base, null);
  const p = C.priceFor({range: 'casanova', size: '3x3', gate: 'electric'});
  assert.equal(p.status, 'part'); assert.ok(p.missing.some(q => q.key === 'gate'));
  assert.equal(C.priceFor({range: 'casanova', size: '3x4', gate: 'electric'}).status, 'published');
});

test('a size change drops what no longer fits, and keeps the rest', () => {
  const s = C.normalise({range: 'highline', size: 'H5', canopy: {left: 'L', right: 'none'}, openings: [{kind: 'window', wall: 'left', p: .5}]});
  assert.equal(s.canopy.left, 'L'); assert.equal(s.openings.length, 1);
  const hs = C.normalise({...s, size: 'HS'});
  assert.equal(hs.canopy.left, 'none'); assert.equal(hs.openings.length, 0);
  assert.equal(C.normalise({range: 'neo', size: '2A', door: 'double'}).door, 'standard');
  assert.equal(C.normalise({range: 'highline', size: 'HS', door: 'double'}).door, 'standard');
});

test('share codes round-trip every option, and damaged codes are refused', () => {
  for (const s of designs()) {
    const back = C.decodeDesign(C.encodeDesign(s));
    assert.deepEqual({...back, step: 0}, {...s, step: 0});
  }
  const rich = C.normalise({range: 'casanova', size: '4x6', colour: 'quartz', door: 'double', hinge: 'left', doorWall: 'left', doorGlass: false, openings: [{kind: 'glassElement', wall: 'front', p: .3}, {kind: 'tiltWindow', wall: 'back', p: .6, hinge: 'left'}], skylight: true, extLight: {front: true, left: false, right: true, back: false}, sauna: 'left', foundation: 'frame', floorPlate: true, items: {table: 1, bikeMax: 3}});
  const back = C.decodeDesign(C.encodeDesign(rich));
  assert.deepEqual(back.openings.map(o => [o.kind, o.wall, o.hinge]), rich.openings.map(o => [o.kind, o.wall, o.hinge]));
  assert.equal(C.priceFor(back).total, C.priceFor(rich).total);
  for (const bad of ['', 'b1.', 'b1.@@@', '2~1~2', 'b1.eyJyIjoibm9wZSJ9']) assert.equal(C.decodeDesign(bad), null);
  assert.ok(C.encodeDesign(rich).length < 400);
});

test('UK phone numbers follow Ofcom\'s numbering plan', () => {
  for (const ok of ['07911 123456', '+44 7911 123456', '020 7123 4567', '01632 961 123', '028 9012 3456', '0800 123 4567', '0300 123 4567']) assert.ok(C.parseUKPhone(ok).valid, ok);
  for (const bad of ['020 7946 0000', '07700 900123', '0217 123 4567', '+33 1 23 45 67 89', '0909 879 0000', '070 1234 5678', '12345', '07911 12345678', '07911 abc123']) assert.ok(!C.parseUKPhone(bad).valid, bad);
  assert.equal(C.parseUKPhone('+44 (0)7911 123456').e164, '+447911123456');
  assert.ok(C.validPostcode('SW1A 1AA')); assert.ok(!C.validPostcode('SW1A'));
});
