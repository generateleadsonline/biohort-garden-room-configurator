// The Biohort garden building designer: steps, options, the 3D preview's life cycle, forms,
// analytics and the first-visit tour. The design model, prices and rules live in catalog.js; the
// 3D in scene/; the PDF in pdf.js (loaded when it is asked for).
import './compat.js';
import {shimDialogs} from './compat.js';
import './styles.css';
import {
  COMPANY, USPS, RANGES, RANGE_ORDER, MODELS, COLOURS, KINDS, WALLS, WALL_ORDER, ITEMS, FOUNDATIONS,
  normalise, clone, priceFor, pounds, metres, specRows, encodeDesign, decodeDesign, designURL, designReference, summaryLine, designName,
  sizeOrder, sizeLabel, variantsOf, dims, priceOf, kindsFor, mainDoor, fitOpenings, wallLength, openingLabel,
  canopyOptions, hasCanopyWalls, downpipeOptions, foundationOptions, doorWallOptions, hasDoubleDoor, itemsFor, itemFits, itemMax, includedOf, anchorCount, shopURL,
  parseUKPhone, phoneProblem, validEmail, validPostcode, formatPostcode, validName
} from './catalog.js';
import {createBoot, RUNGS} from './scene/boot.js';
import {createTour} from './tour.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = v => String(v).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const params = new URLSearchParams(location.search);
const QA = params.has('qa');
const DEBUG3D = params.has('debug3d');
const STORAGE = 'bh-design-v1', RECEIPT = 'bh-receipt-v1';
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const stacked = () => matchMedia('(max-width: 1023px)').matches;
// On phones the 3D and the step bar stay pinned above the panel, so "into view" means just below the
// step bar: scrollIntoView put the top of each step (its title, and the price step's locked price
// and form heading) behind the 3D.
function reveal(el, {gap = 20, block = 'start'} = {}) {
  if (!el) return;
  const behavior = reduced() ? 'auto' : 'smooth';
  if (!stacked()) {
    // Beside the 3D the panel scrolls on its own: move only it, never the window.
    const body = $('#panel-body'), r = el.getBoundingClientRect(), b = body.getBoundingClientRect();
    const top = block === 'center' ? r.top - b.top - (b.height - r.height) / 2 : r.top - b.top - gap;
    if (Math.abs(top) > 2) body.scrollBy({top, behavior});
    return;
  }
  const top = el.getBoundingClientRect().top - ($('#steps').getBoundingClientRect().bottom + gap);
  if (Math.abs(top) > 2) window.scrollBy({top, behavior});
}

// ---- Analytics: every step and call to action, to the dataLayer when one exists -----------------
// Events carry no contact details. QA reads them back from window.__events.
const events = window.__events = [];
function track(name, values = {}) {
  const e = {event: 'bh_' + name, ...values, step: values.step ?? (state ? state.step + 1 : undefined)};
  events.push(e);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(e);
  try { window.dispatchEvent(new CustomEvent('bh:analytics', {detail: e})); } catch {}
}

// ---- State -------------------------------------------------------------------------------------
let state = normalise({});
const undoStack = [], redoStack = [];
const ui = {opening: null, view: 'outside', visited: new Set([0])};
let scene = null, receipt = null;

function restore() {
  const m = location.hash.match(/d=([^&]+)/);
  if (m) { const d = decodeDesign(decodeURIComponent(m[1])); if (d) { state = d; const st = Number(params.get('s')); if (st >= 0 && st <= 7) state.step = st; return 'link'; } }
  try { const raw = localStorage.getItem(STORAGE); if (raw) { state = normalise(JSON.parse(raw)); return 'device'; } } catch {}
  return null;
}
function persist() {
  const url = new URL(location.href);
  url.hash = 'd=' + encodeDesign(state);
  url.searchParams.delete('book');
  try { history.replaceState(null, '', url); } catch {}
  try { localStorage.setItem(STORAGE, JSON.stringify(state)); } catch {}
}

// ---- Steps -------------------------------------------------------------------------------------
const STEPS = [
  {id: 'range', label: 'Range', title: 'Choose your range', lede: 'Six ranges of Biohort steel garden buildings, made in Austria. Every price is Biohort\'s published UK price, including VAT.', usps: 'range'},
  {id: 'size', label: 'Size', title: 'Choose the size', lede: 'Biohort\'s published sizes, with the inside space and the base each one needs.', usps: 'size'},
  {id: 'colour', label: 'Colour', title: 'Choose the colour', lede: 'Metallic finishes over galvanised steel. Every range is grey white inside.', usps: 'colour'},
  {id: 'openings', label: 'Doors & windows', title: 'Doors and windows', lede: 'The door that comes with your building, then any extra doors, windows and glazing. Tap one in the 3D view to edit it.', usps: 'openings'},
  {id: 'roof', label: 'Roof & canopy', title: 'Roof, canopy and outside', lede: '', usps: 'roof'},
  {id: 'base', label: 'Foundation', title: 'Foundation and floor', lede: 'Every Biohort building needs a level base. Choose your own, or one of Biohort\'s.', usps: 'base'},
  {id: 'inside', label: 'Inside', title: 'Inside: storage and fittings', lede: 'What comes with your building, and every fitting you add, placed where Biohort fits them.', usps: 'inside'},
  {id: 'price', label: 'Your price', title: 'Your design and price', lede: '', usps: 'price'}
];
const STEP = Object.fromEntries(STEPS.map((s, i) => [s.id, i]));

// Where the camera goes, and what it highlights, when an option changes.
const WALL_DIR = {front: [-.2, .1, 1], back: [.2, .12, -1], left: [-1, .12, .2], right: [1, .12, .2]};
function focusFor(key, extra = {}) {
  const md = mainDoor(state);
  switch (key) {
    case 'range': case 'model': return {tags: [], whole: true, highlight: false, dir: [-.62, .2, 1]};
    case 'size': return {tags: [], whole: true, highlight: false, dir: [-.6, .55, 1]};
    case 'colour': return {tags: ['walls'], whole: true, dir: [-.62, .16, 1]};
    case 'door': case 'hinge': case 'doorWall': case 'doorP': case 'gate': case 'doorGlass': return {tags: ['door:main'], dir: WALL_DIR[md.wall]};
    case 'opening': return {tags: ['opening:' + extra.id], dir: WALL_DIR[extra.wall] || WALL_DIR.front};
    case 'wall': return {tags: ['wall:' + extra.wall], dir: WALL_DIR[extra.wall], whole: true, highlight: extra.highlight ?? false};
    case 'gasSpring': return {view: 'inside', tags: ['gasSpring'], facing: true};
    case 'ramp': return {tags: ['ramp'], dir: [-.3, .35, 1]};
    case 'canopy': return {tags: ['canopy:' + extra.side], dir: extra.side === 'left' ? [-1, .25, .6] : [1, .25, .6], whole: true};
    case 'canopyWall': return {tags: [`canopyWall:${extra.side}:${extra.which}`], dir: extra.which === 'back' ? (extra.side === 'left' ? [-.5, .25, -1] : [.5, .25, -1]) : (extra.side === 'left' ? [-1, .2, .3] : [1, .2, .3]), whole: true};
    case 'canopyGlass': return {tags: ['canopyGlass'], dir: [state.canopy.left !== 'none' ? -1 : 1, .2, .4], whole: true};
    case 'canopyFlora': return {tags: ['canopyFlora'], dir: [state.canopy.left !== 'none' ? -1 : 1, .2, .4], whole: true};
    case 'downpipe': return {tags: ['downpipe'], dir: state.downpipe === 'rear' ? [.6, .15, -1] : [-.6, .15, 1], whole: true};
    case 'pv': return {tags: ['pv'], dir: [-.5, 1.2, .8], whole: true};
    case 'floraboard': return {tags: ['floraboard'], dir: [-.7, .15, .7], whole: true};
    case 'solar': return {tags: ['solar'], dir: [-.3, .12, 1]};
    case 'led': return {view: 'inside', tags: ['led'], lookUp: true};
    case 'skylight': return {tags: ['doubleGlazing'], dir: [-.5, .25, 1]};
    case 'roofSupport': return {view: 'inside', tags: ['roofSupport', 'roofBars'], lookUp: true};
    case 'extLight': return {tags: ['extLight:' + extra.wall], dir: {front: [0, -.42, 1], back: [0, -.42, -1], left: [-1, -.42, 0], right: [1, -.42, 0]}[extra.wall], minDistance: 2.2, pad: .5};
    case 'foundation': return {tags: ['foundation'], dir: [-.6, .5, 1], whole: true};
    case 'floorPlate': return {view: 'inside', tags: ['floorPlate'], lookDown: true};
    case 'anchors': return {tags: ['anchors'], dir: [-.6, .45, 1], whole: true};
    case 'panelling': return {view: 'inside', tags: ['panelling']};
    case 'insulation': return {view: 'inside', tags: ['insulation'], facing: true};
    case 'sauna': return {view: 'inside', tags: ['sauna']};
    case 'bikeLift': return {view: 'inside', tags: ['bikeLift']};
    case 'item': return {view: 'inside', tags: [ITEM_TAG[extra.item] || ITEMS[extra.item].tag], facing: ['toolHolders', 'doorBaskets'].includes(extra.item)};
    default: return null;
  }
}
const ITEM_TAG = {shelves: 'shelves:std', deepShelves: 'shelves:deep', cornerShelves: 'shelves:std', cornerDeepShelves: 'shelves:deep', bikeMax: 'bikeMax', bikeHolder: 'bikeHolder', toolHolders: 'toolHolders', doorBaskets: 'doorBaskets', cornerHookSet: 'hooks', mountPanelCoated: 'mountPanel'};

/** Applies a change: undo history, the 3D, the camera turn and highlight, and an event. */
// A slider being dragged updates the 3D quietly (no panel re-render, which would drop the drag);
// its release records one undo step for the whole drag.
let dragBase = null;
function change(patch, {key, focus = {}, label, quiet = false} = {}) {
  if (quiet) dragBase = dragBase || clone(state);
  else { undoStack.push(dragBase || clone(state)); dragBase = null; if (undoStack.length > 60) undoStack.shift(); redoStack.length = 0; }
  const step = state.step;
  state = normalise({...state, ...patch, step});
  persist();
  if (quiet) renderPrice(); else render({keepFocus: true});
  scene?.update(state);
  const spec = key && focusFor(key, focus);
  if (spec && QA && window.__instantFocus) spec.instant = true;
  if (spec && scene) {
    if (spec.view && spec.view !== ui.view) setView(spec.view);
    if (!spec.view && ui.view !== 'outside' && ui.view !== 'plan') setView('outside');
    // In plan view the change is shown from above, without turning the camera away.
    if (ui.view === 'plan' && !spec.view) scene.focus({tags: spec.tags, view: 'plan', highlight: spec.highlight});
    else scene.focus(spec);
  }
  if (label) announce(label);
  track('option_change', {option: key || Object.keys(patch).join(','), range: state.range});
}
const delta = patch => priceFor(normalise({...state, ...patch})).total - priceFor(state).total;
const plus = n => (n > 0 ? `+${pounds(n)}` : n < 0 ? `−${pounds(-n)}` : 'Included');

// ---- Rendering the panel -------------------------------------------------------------------------
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const tagOf = (text, kind = '') => `<span class="tag${kind ? ' ' + kind : ''}">${esc(text)}</span>`;
function radioChoice(name, value, checked, title, desc = '', tag = '') {
  const id = `${name}-${value}`.replace(/[^a-z0-9-]/gi, '-');
  return `<label class="choice${checked ? ' is-on' : ''}" for="${id}"><input type="radio" id="${id}" name="${name}" value="${esc(value)}"${checked ? ' checked' : ''}><span class="mark" aria-hidden="true"></span><span><span class="t">${esc(title)}</span>${desc ? `<span class="d">${esc(desc)}</span>` : ''}</span>${tag}</label>`;
}
function checkChoice(name, checked, title, desc = '', tag = '', disabled = false) {
  const id = `chk-${name}`.replace(/[^a-z0-9-]/gi, '-');
  return `<label class="choice${checked ? ' is-on' : ''}${disabled ? ' is-off' : ''}" for="${id}"><input type="checkbox" id="${id}" name="${name}"${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}><span class="mark" aria-hidden="true"></span><span><span class="t">${esc(title)}</span>${desc ? `<span class="d">${esc(desc)}</span>` : ''}</span>${tag}</label>`;
}
function chip(name, value, checked, label) {
  const id = `${name}-${value}`.replace(/[^a-z0-9-]/gi, '-');
  return `<label class="chip${checked ? ' is-on' : ''}" for="${id}"><input type="radio" id="${id}" name="${name}" value="${esc(value)}"${checked ? ' checked' : ''}>${label}</label>`;
}
function stepper(key, value, min, max, label, sub = '', tag = '') {
  return `<div class="stepper-row"><div class="lbl"><span class="t" id="lbl-${key}">${esc(label)}</span>${sub ? `<span class="d">${esc(sub)}</span>` : ''}</div>${tag}<div class="stepper" role="group" aria-labelledby="lbl-${key}"><button type="button" class="step-btn" data-action="count" data-key="${key}" data-delta="-1" aria-label="One fewer: ${esc(label)}"${value <= min ? ' disabled' : ''}>${icon('minus')}</button><output aria-live="polite" id="out-${key}">${value}</output><button type="button" class="step-btn" data-action="count" data-key="${key}" data-delta="1" aria-label="One more: ${esc(label)}"${value >= max ? ' disabled' : ''}>${icon('plus')}</button></div></div>`;
}

function stepRange() {
  const cards = RANGE_ORDER.map(id => {
    const r = RANGES[id], on = state.range === id;
    const min = Math.min(...sizeOrder(id).flatMap(c => variantsOf(id, c).map(v => priceOf(Object.values(v.sku)[0]) || 1e9)));
    return `<label class="choice range-card${on ? ' is-on' : ''}" for="range-${id}"><input type="radio" id="range-${id}" name="range" value="${id}"${on ? ' checked' : ''}><img src="${r.photo}-480.webp" srcset="${r.photo}-480.webp 480w, ${r.photo}-640.webp 640w" sizes="(min-width:1024px) 190px, 45vw" width="480" height="360" alt="A Biohort ${esc(r.name)} ${esc(r.family.toLowerCase())}" loading="lazy"><span class="body"><span class="t">${esc(r.name)}</span><span class="d">${esc(r.tagline)}</span><span class="from">From ${pounds(min)}</span></span></label>`;
  }).join('');
  const r = RANGES[state.range];
  const model = state.range === 'avantgarde' ? `<fieldset class="group"><legend>Model</legend><div class="choice-list">${Object.entries(MODELS).map(([k, m]) => radioChoice('model', k, state.model === k, m.name, m.text, tagOf(plus(delta({model: k}))))).join('')}</div></fieldset>` : '';
  return `<fieldset class="group"><legend>Range</legend><div class="range-cards">${cards}</div><p class="note">${esc(r.text)}</p><button type="button" class="btn small ghost" data-action="compare" data-cta="compare-ranges">${icon('plan')}Compare the six ranges</button></fieldset>${model}`;
}

function sizeChoice(code) {
  const s0 = normalise({...state, size: code}), d = dims(s0), on = state.size === code;
  const p = priceFor({...s0, openings: [], canopy: {left: 'none', right: 'none'}, foundation: 'none', items: {}, bikeLift: 'none', pv: false, floraboard: 0}).building?.unit;
  return `<label class="size-card${on ? ' is-on' : ''}" for="size-${code}"><input type="radio" id="size-${code}" name="size" value="${esc(code)}"${on ? ' checked' : ''}><span class="code">${esc(sizeLabel(state.range, code))}</span><span class="dim">${metres(d.W)} x ${metres(d.D)}</span><span class="area">${d.area.toFixed(2)}m² inside</span><span class="price">${p && unlocked() ? pounds(p) : ''}</span></label>`;
}
function stepSize() {
  const R = state.range, d = dims(state);
  let grid;
  if (R === 'neo') {
    // Neo's sizes are a grid: the letter is the width, the number the depth.
    const widths = ['A', 'B', 'C', 'D'], depths = ['1', '2', '3', '4'];
    grid = `<div class="size-grid neo" role="radiogroup" aria-label="Neo sizes: width across, depth down">${depths.map(dn => widths.map(wl => sizeChoice(dn + wl)).join('')).join('')}</div><p class="group-note">Across: 1.80m, 2.36m, 2.92m and 3.48m wide. Down: the same depths.</p>`;
  } else grid = `<div class="size-grid">${sizeOrder(R).map(sizeChoice).join('')}</div>`;
  const doorTypes = R === 'europa' || R === 'casanova' ? '' : `<fieldset class="group"><legend>Door</legend><div class="chips">${chip('door', 'standard', state.door === 'standard', `Standard door ${R === 'neo' ? '83cm' : '76cm'}`)}${hasDoubleDoor({...state}) ? chip('door', 'double', state.door === 'double', `Double door <small>${plus(delta({door: 'double'}) - delta({door: 'standard'}))}</small>`) : ''}</div><p class="group-note">${R === 'highline' && state.size === 'HS' ? 'The HS has a standard door only.' : R === 'neo' && state.size[1] === 'A' ? 'Neo sizes 1.8m wide have a standard door only.' : 'The double door is part of the building: its price is Biohort\'s price for the whole shed.'}</p></fieldset>`;
  return `<fieldset class="group"><legend>Size</legend><p class="group-note">Sizes include the roof overhang. ${R === 'casanova' ? 'CasaNova is built on a 1m grid.' : ''}</p>${grid}</fieldset>
    <ul class="facts"><li>Outside <strong>${metres(d.W)} x ${metres(d.D)}</strong>, <strong>${metres(d.H)}</strong> high</li><li>Inside <strong>${metres(d.iw)} x ${metres(d.id)}</strong>, ${d.area.toFixed(2)}m²</li>${d.base ? `<li>Base needed <strong>${d.base[0]} x ${d.base[1]}cm</strong></li>` : ''}${d.opening ? `<li>Door opening <strong>${d.opening[0]} x ${d.opening[1]}cm</strong></li>` : ''}</ul>
    ${doorTypes}
    <p class="note">Garden buildings under 2.5m high near a boundary are usually permitted development in England. Check with your council if you live in a conservation area or a listed building.</p>`;
}

function stepColour() {
  const R = RANGES[state.range];
  const sw = R.colours.map(id => {
    const c = COLOURS[id], on = state.colour === id;
    return `<label class="swatch big${on ? ' is-on' : ''}" for="colour-${id}" title="${esc(c.name)}"><input type="radio" id="colour-${id}" name="colour" value="${id}"${on ? ' checked' : ''}><span class="c" data-hex="${c.hex}"></span><span class="visually-hidden">${esc(c.name)}</span></label>`;
  }).join('');
  return `<fieldset class="group"><legend>Colour</legend><div class="swatches">${sw}</div><p class="swatch-name">Selected: <strong>${esc(COLOURS[state.colour].name)}</strong></p>
    <p class="group-note">${state.range === 'highline' ? 'The HighLine\'s roof surface is always metallic quartz grey. ' : ''}Biohort\'s colours have no exact RAL match, and screens vary: see a sample at a Biohort stockist before you order.</p></fieldset>
    <p class="note">Every colour is the same price.</p>`;
}

function stepOpenings() {
  const R = state.range, md = mainDoor(state), walls = doorWallOptions(state);
  const L = wallLength(state, md.wall), pct = Math.round(md.p * 100);
  let main = `<fieldset class="group"><legend>Your building's door</legend>`;
  if (R === 'casanova') {
    main += `<div class="choice-list">${radioChoice('cnmain', 'standard', state.gate === 'none' && state.door === 'standard', 'Standard door', '90 x 198cm clear opening', tagOf('Included', 'inc'))}${radioChoice('cnmain', 'double', state.gate === 'none' && state.door === 'double', 'Double door', 'A second door panel: 187 x 198cm clear opening', tagOf(plus(delta({door: 'double', gate: 'none'}) - delta({door: 'standard', gate: 'none'}))))}${['3x2', '4x2'].includes(state.size) ? '' : `${radioChoice('cnmain', 'manual', state.gate === 'manual', 'Sectional overhead door', 'Hörmann, 42mm insulated, 2.36 x 2.0m opening', tagOf(plus(delta({gate: 'manual'}) - delta({gate: 'none', door: 'standard'}))))}${radioChoice('cnmain', 'electric', state.gate === 'electric', 'Sectional overhead door, electric', 'With an electric opener and one remote', tagOf(plus(delta({gate: 'electric'}) - delta({gate: 'none', door: 'standard'}))))}`}</div>`;
    if (state.gate === 'none') main += `<p class="group-title">Hinge</p><div class="chips">${chip('hinge', 'right', state.hinge === 'right', 'Right')}${chip('hinge', 'left', state.hinge === 'left', 'Left')}</div>${checkChoice('doorGlass', state.doorGlass, 'Glass insert', 'Insulated glass, 75 x 179cm, in the door leaf', tagOf(plus(delta({doorGlass: true}) - delta({doorGlass: false}))), state.hinge !== 'right' && state.door === 'standard')}`;
  } else if (R === 'panorama' && state.door === 'standard') {
    main += `<p class="group-title">Hinge</p><div class="chips">${chip('hinge', 'right', state.hinge === 'right', 'Right')}${chip('hinge', 'left', state.hinge === 'left', `Left <small>${plus(delta({hinge: 'left'}) - delta({hinge: 'right'}))}</small>`)}</div>`;
  } else {
    main += `<p class="group-note">${state.door === 'double' || R === 'europa' ? 'Double door' : 'Standard door'}, hinged on the right${R === 'europa' ? ': every Europa has a double door' : ''}. ${R === 'casanova' ? '' : 'Change the door type on the Size step.'}</p>`;
  }
  if (walls.length > 1) main += `<p class="group-title">Which wall</p><div class="chips">${walls.map(w => chip('doorWall', w, md.wall === w, esc(WALLS[w]))).join('')}</div>`;
  main += `<div class="slider-row"><label for="doorP">Position along the wall <output>${pct}%</output></label><span></span><input type="range" id="doorP" name="doorP" min="0" max="100" step="1" value="${pct}" aria-valuetext="${pct}% from the left as you face the ${esc(WALLS[md.wall].toLowerCase())}"><span></span></div>`;
  if ((R === 'europa' && state.size !== '2A') || (R === 'avantgarde' && state.model === 'eco')) main += checkChoice('gasSpring', state.gasSpring, R === 'europa' ? 'Gas spring retrofit set' : 'Gas spring set', 'Helps the door open and close and holds it open', tagOf(plus(delta({gasSpring: true}) - delta({gasSpring: false}))));
  if (['panorama', 'neo'].includes(R)) main += checkChoice('ramp', state.ramp, 'Threshold access ramp', 'For wheeling things in: double door and floor frame needed', state.door === 'double' && state.foundation === 'frame' ? tagOf(plus(delta({ramp: true}) - delta({ramp: false}))) : tagOf('Needs a double door and floor frame'), !(state.door === 'double' && state.foundation === 'frame'));
  if (R === 'casanova') main += checkChoice('ramp', state.ramp, 'Threshold access ramp', 'For the double door or the sectional door', state.door === 'double' || state.gate !== 'none' ? tagOf(plus(delta({ramp: true}) - delta({ramp: false}))) : tagOf('Needs a double or sectional door'), !(state.door === 'double' || state.gate !== 'none'));
  main += '</fieldset>';
  // Extra elements.
  const kinds = kindsFor(state);
  const rows = state.openings.map(o => {
    const Lw = wallLength(state, o.wall), p = Math.round(o.p * 100);
    const price = delta({openings: state.openings.filter(x => x.id !== o.id)});
    return `<div class="opening-row${ui.opening === o.id ? ' is-selected' : ''}" data-open="${o.id}" tabindex="-1">
      <div class="head">${esc(openingLabel(state, o))} ${tagOf(price ? pounds(-price) : 'Quoted')}<button type="button" class="remove" data-action="remove" data-id="${o.id}" aria-label="Remove the ${esc(openingLabel(state, o).toLowerCase())}">${icon('trash')}</button></div>
      <div class="field-row"><div class="field"><label for="kind-${o.id}">Type</label><select id="kind-${o.id}" data-field="kind" data-id="${o.id}">${kinds.map(k => `<option value="${k}"${k === o.kind ? ' selected' : ''}>${esc(R === 'europa' && k === 'double' ? 'Additional double door' : KINDS[k].name)}</option>`).join('')}</select></div>
      <div class="field"><label for="wall-${o.id}">Wall</label><select id="wall-${o.id}" data-field="wall" data-id="${o.id}">${WALL_ORDER.map(w => `<option value="${w}"${w === o.wall ? ' selected' : ''}>${WALLS[w]}</option>`).join('')}</select></div></div>
      ${R === 'casanova' && ['door', 'tiltWindow'].includes(o.kind) ? `<div class="chips" role="group" aria-label="Hinge">${['right', 'left'].map(h => `<button type="button" class="chip${o.hinge === h ? ' is-on' : ''}" aria-pressed="${o.hinge === h}" data-action="ohinge" data-id="${o.id}" data-h="${h}">${h === 'right' ? 'Right hinge' : 'Left hinge'}</button>`).join('')}${o.kind === 'door' && o.hinge === 'right' ? `<button type="button" class="chip${o.glass ? ' is-on' : ''}" aria-pressed="${Boolean(o.glass)}" data-action="oglass" data-id="${o.id}">Glass insert</button>` : ''}</div>` : ''}
      <div class="slider-row"><label for="pos-${o.id}">Position <output>${p}%</output></label><span></span><input type="range" id="pos-${o.id}" data-field="p" data-id="${o.id}" min="0" max="100" step="1" value="${p}" aria-valuetext="${p}% from the left as you face the ${esc(WALLS[o.wall].toLowerCase())}"><span></span></div>
      <p class="hint">${esc(Math.round(wallLength(state, o.wall) * 100))}cm wall</p>
    </div>`;
  }).join('');
  const addButtons = kinds.map(k => {
    const trial = normalise({...state, openings: [...state.openings, {id: 'zz', kind: k, wall: 'left', p: .5}]});
    const fits = trial.openings.some(o => o.id === 'zz') || WALL_ORDER.some(w => normalise({...state, openings: [...state.openings, {id: 'zz', kind: k, wall: w, p: .5}]}).openings.some(o => o.id === 'zz'));
    const price = fits ? priceFor(trial).total - priceFor(state).total : 0;
    return `<button type="button" class="btn small ghost" data-action="add" data-kind="${k}"${fits ? '' : ' disabled'}>${icon('plus')}${esc(R === 'europa' && k === 'double' ? 'Additional double door' : KINDS[k].name)}${fits ? ` <span class="small">${price ? '+' + pounds(price) : 'quoted'}</span>` : ''}</button>`;
  }).join('');
  return `${main}<fieldset class="group"><legend>Extra doors and windows</legend><div id="opening-list">${rows || '<p class="group-note">None yet.</p>'}</div><div class="add-row">${addButtons}</div><p class="group-note">${R === 'neo' ? 'Glass panels go on any wall, not next to a door, a corner or another panel. ' : ''}Positions snap to Biohort\'s wall panels; the exact panel is confirmed when you order.</p></fieldset>`;
}

function stepRoof() {
  const R = state.range, can = canopyOptions(state);
  let html = '';
  if (can.length) {
    const label = v => (v === 'none' ? 'None' : v === 'S' ? 'S, 1.50m' : v === 'L' ? (R === 'highline' ? 'L, 2.82m' : R === 'avantgarde' ? '2.43m' : 'L') : R === 'europa' ? '1.50m' : R === 'neo' ? 'Yes' : v);
    html += `<fieldset class="group"><legend>Side canopy</legend><p class="group-note">${R === 'highline' ? 'A covered space beside the shed, size S or L, with the downpipe included. The roof is always quartz grey.' : R === 'europa' ? 'A 1.5m lean-to beside the shed, with galvanised supports and a short downpipe.' : R === 'avantgarde' ? 'A 2.43m canopy that continues the sloping roof, with two downpipes.' : 'A canopy beside the Neo, with supports and two downpipes.'} Concrete or point foundations are needed under the supports.</p>${['left', 'right'].map(k => `<p class="group-title">${k === 'left' ? 'Left side' : 'Right side'}</p><div class="chips">${can.map(v => chip('canopy-' + k, v, state.canopy[k] === v, `${label(v)}${v !== 'none' ? ` <small>${plus(delta({canopy: {...state.canopy, [k]: v}}) - delta({canopy: {...state.canopy, [k]: 'none'}}))}</small>` : ''}`)).join('')}</div>${hasCanopyWalls(state) && state.canopy[k] !== 'none' ? `<div class="choice-list">${['back', 'side'].map(w => checkChoice(`cw-${k}-${w}`, state.canopyWalls[k][w], w === 'back' ? 'Back wall' : 'Side wall', w === 'back' ? 'Closes the canopy at the back' : 'Closes the canopy\'s outer side', tagOf(plus(delta({canopyWalls: {...state.canopyWalls, [k]: {...state.canopyWalls[k], [w]: true}}}) - delta({canopyWalls: {...state.canopyWalls, [k]: {...state.canopyWalls[k], [w]: false}}}))), R === 'highline' && w === 'back' && state.downpipe === 'rear')).join('')}</div>` : ''}`).join('')}</fieldset>`;
    if (R === 'neo' && (state.canopy.left !== 'none' || state.canopy.right !== 'none')) html += `<fieldset class="group"><legend>On the canopy</legend>${stepper('canopyGlass', state.canopyGlass, 0, 4, 'Glass panels for the canopy', '32cm tinted glass, full height', tagOf(pounds(priceFor(normalise({...state, canopyGlass: 1})).total - priceFor(normalise({...state, canopyGlass: 0})).total) + ' each'))}${stepper('canopyFlora', state.canopyFlora, 0, 2, 'FloraBoard for the canopy', 'Two flower boxes on rails', tagOf(pounds(priceFor(normalise({...state, canopyFlora: 1})).total - priceFor(normalise({...state, canopyFlora: 0})).total) + ' each'))}</fieldset>`;
  } else if (R === 'panorama') html += `<p class="note">The Panorama has no side canopy: its continuous skylight runs all the way round.</p>`;
  else if (R === 'casanova') html += '';
  else html += `<p class="note">Side canopies start from the next size up.</p>`;
  const dp = downpipeOptions(state);
  if (dp.length) html += `<fieldset class="group"><legend>Rainwater downpipes</legend><div class="chips">${dp.map(v => chip('downpipe', v, state.downpipe === v, `${v === 'none' ? 'None' : v === 'front' ? 'Front corners' : 'Back corners'}${R !== 'casanova' && v !== 'none' ? ` <small>${plus(delta({downpipe: v}) - delta({downpipe: 'none'}))}</small>` : ''}`)).join('')}</div><p class="group-note">${R === 'casanova' ? 'Two downpipes come with every CasaNova.' : 'Gutters have hose outlets as standard; the set adds two downpipes.'}${R === 'europa' && state.canopy.left !== 'none' && state.canopy.right !== 'none' ? ' With canopies on both sides, their downpipes take the water.' : ''}</p></fieldset>`;
  else if (R === 'neo') html += `<p class="note">Two rainwater downpipes come with every Neo.</p>`;
  const extras = [];
  if (R !== 'casanova') extras.push(checkChoice('pv', state.pv, 'PV mounting system', 'Rails to mount solar panels on the roof (panels not included)', tagOf(plus(delta({pv: true}) - delta({pv: false})))));
  if (R === 'casanova') {
    extras.push(checkChoice('skylight', state.skylight, 'Double glazed acrylic light band', 'A second acrylic sheet for better insulation', tagOf(plus(delta({skylight: true}) - delta({skylight: false})))));
    extras.push(checkChoice('roofSupport', state.roofSupport, 'Grey white roof supports', 'The roof bars inside coated grey white instead of plain aluminium', tagOf(plus(delta({roofSupport: true}) - delta({roofSupport: false})))));
  }
  let more = extras.length ? `<fieldset class="group"><legend>Roof extras</legend><div class="choice-list">${extras.join('')}</div></fieldset>` : '';
  if (['highline', 'avantgarde', 'panorama', 'neo'].includes(R)) more += `<fieldset class="group"><legend>On the walls</legend>${stepper('floraboard', state.floraboard, 0, 3, 'FloraBoard', 'Two flower boxes on rails in the shed\'s colour', tagOf(pounds(priceFor(normalise({...state, floraboard: 1})).total - priceFor(normalise({...state, floraboard: 0})).total) + ' a set'))}${['panorama', 'neo'].includes(R) ? stepper('solar', state.solar, 0, 2, 'Solar light', 'Outside, by the door', tagOf(pounds(priceFor(normalise({...state, solar: 1})).total - priceFor(normalise({...state, solar: 0})).total) + ' each')) : ''}</fieldset>`;
  if (R === 'casanova') more += `<fieldset class="group"><legend>External lighting</legend><p class="group-note">Cut-outs for spotlights in the soffit, per side. Spotlights are not included.</p><div class="choice-list">${WALL_ORDER.map(w => checkChoice('ext-' + w, state.extLight[w], `${WALLS[w]}`, '', tagOf(plus(delta({extLight: {...state.extLight, [w]: true}}) - delta({extLight: {...state.extLight, [w]: false}}))))).join('')}</div></fieldset>`;
  return html + more;
}

function stepBase() {
  const R = state.range, opts = foundationOptions(state);
  let html = `<fieldset class="group"><legend>Foundation</legend><div class="choice-list">${opts.map(f => radioChoice('foundation', f, state.foundation === f, R === 'casanova' && f === 'frame' ? 'Floor frame' : FOUNDATIONS[f].name, R === 'casanova' && f === 'frame' ? 'Aluminium floor frame on your base; it cannot be added later.' : FOUNDATIONS[f].text, tagOf(f === 'none' ? 'Not supplied' : plus(delta({foundation: f}) - delta({foundation: 'none'}))))).join('')}</div></fieldset>`;
  if (state.foundation === 'frame') html += `<fieldset class="group"><legend>Floor</legend><div class="choice-list">${checkChoice('floorPlate', state.floorPlate, 'Aluminium floor panels', '2mm aluminium chequer plate over the frame', tagOf(plus(delta({floorPlate: true}) - delta({floorPlate: false}))))}</div></fieldset>`;
  if (state.foundation === 'none' && anchorCount(state)) html += `<fieldset class="group"><legend>On gravel</legend><div class="choice-list">${checkChoice('anchors', state.anchors, `Ground anchors (${anchorCount(state)})`, 'Biohort\'s count for this size, for a base on gravel', tagOf(plus(delta({anchors: true}) - delta({anchors: false}))))}</div></fieldset>`;
  const d = dims(state);
  html += `<p class="note">${state.foundation === 'none' ? `Your own base: a concrete slab or point foundations ${d.base ? `${d.base[0]} x ${d.base[1]}cm` : ''} to Biohort's foundation plan. <a href="${COMPANY.foundations}" target="_blank" rel="noopener">Foundation tips</a>.` : state.foundation === 'frame' ? 'The floor frame sits on a level slab or point foundations.' : 'No concrete: the SmartBase levels itself on its feet or screws.'}</p>`;
  return html;
}

function stepInside() {
  const R = state.range, inc = includedOf(state);
  let html = '';
  const incl = Object.entries(inc).map(([k, n]) => `${n} ${ITEMS[k].pack}${n > 1 ? 's' : ''} of ${ITEMS[k].name.toLowerCase()}`);
  if (incl.length) html += `<p class="note">${icon('check')} Included: ${esc(incl.join(', '))}.</p>`;
  if (R === 'neo') html += `<fieldset class="group"><legend>Lining</legend><div class="choice-list">${checkChoice('panelling', state.panelling, 'Interior panelling', 'Panels over the inside walls, priced for this size and door', tagOf(plus(delta({panelling: true}) - delta({panelling: false}))))}${checkChoice('insulation', state.insulation, 'Insulation', 'Behind the panelling', state.panelling ? tagOf(plus(delta({insulation: true}) - delta({insulation: false}))) : tagOf('Needs the panelling'), !state.panelling)}</div></fieldset>`;
  if (R === 'casanova' && !['3x2', '4x2'].includes(state.size)) html += `<fieldset class="group"><legend>Sauna module</legend><div class="chips">${['none', 'left', 'right'].map(v => chip('sauna', v, state.sauna === v, v === 'none' ? 'None' : `${v === 'left' ? 'Left' : 'Right'} door hinge <small>${plus(delta({sauna: v}) - delta({sauna: 'none'}))}</small>`)).join('')}</div><p class="group-note">A 2 x 2m Scandinavian spruce sauna with heater, loungers and a glazed door.</p></fieldset>`;
  const groups = [
    ['Shelves and rails', ['shelves', 'deepShelves', 'cornerShelves', 'cornerDeepShelves', 'rails', 'shelfBaskets']],
    ['Tools and hooks', ['toolHangers', 'toolHolders', 'doorBaskets', 'hookSet', 'cornerHookSet', 'suspension', 'table']],
    ['Bikes', ['bikeMax', 'bikeHolder']],
    ['Electrics and more', ['mountPanel', 'mountPanelCoated', 'binBag']]
  ];
  for (const [title, keys] of groups) {
    const list = keys.filter(k => itemsFor(R).includes(k) && itemFits(state, k));
    let rows = list.map(k => {
      const it = ITEMS[k], one = priceFor(normalise({...state, items: {...state.items, [k]: (state.items[k] || 0) + 1}})).total - priceFor(state).total;
      const unit = k === 'bikeMax' ? priceFor(normalise({...state, items: {...state.items, bikeMax: 1}})).total - priceFor(normalise({...state, items: {...state.items, bikeMax: 0}})).total : one;
      return stepper('item-' + k, state.items[k] || 0, 0, itemMax(state, k), it.name, `${it.text}${inc[k] ? ` ${inc[k]} ${it.pack} included.` : ''}`, tagOf(`${pounds(unit)} a ${it.pack}`));
    }).join('');
    if (title === 'Bikes' && R !== 'casanova') rows += `<div class="stepper-row"><div class="lbl"><span class="t">BikeLift</span><span class="d">Lifts a bike to the roof on a crank, with the garden shed mounting kit.</span></div><div class="chips">${['none', 'standard', ...(['panorama', 'neo'].includes(R) ? ['swivel'] : [])].map(v => chip('bikeLift', v, state.bikeLift === v, v === 'none' ? 'None' : `${v === 'swivel' ? 'Swivelling' : 'Standard'} <small>${plus(delta({bikeLift: v}) - delta({bikeLift: 'none'}))}</small>`)).join('')}</div></div>`;
    if (title === 'Electrics and more' && ['panorama', 'neo'].includes(R)) rows += stepper('led', state.led, 0, 2, 'LED light', 'A ceiling light inside', tagOf(pounds(priceFor(normalise({...state, led: 1})).total - priceFor(normalise({...state, led: 0})).total) + ' each'));
    if (rows) html += `<fieldset class="group"><legend>${esc(title)}</legend>${rows}</fieldset>`;
  }
  return html;
}

// The price is gated: until the visitor sends their details (here or in any of the forms, which
// all carry the design), the price card is a blurred placeholder with the form beneath it. The real
// figures (and the link to the product in Biohort's shop) are not in the page before then. Book a
// call is open at any time (it is a lead form itself); the PDF, which carries the price, unlocks
// with it.
function stepPrice() {
  const p = priceFor(state), ref = designReference(state), open = unlocked();
  const lines = p.lines.map(l => `<tr><td>${esc(l.name)}${l.qty > 1 ? ` <span class="qty">x ${l.qty}</span>` : ''}<span class="sku">Article ${esc(l.sku)}</span></td><td>${pounds(l.total)}</td></tr>`).join('');
  const quoted = p.quoted.map(q => `<tr class="quoted"><td>${esc(q.name)}<span class="sku">${esc(q.note)}</span></td><td>${q.key === 'assembly' || q.key === 'base' ? 'Quoted' : 'Quoted'}</td></tr>`).join('');
  const spec = specRows(state).map(([h, rows]) => `<h3>${esc(h)}</h3><dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`).join('');
  let name = ''; try { name = JSON.parse(sessionStorage.getItem('bh-contact') || '{}').firstName || ''; } catch {}
  const gate = open
    ? `<div id="quote-unlocked"><div class="price-card" id="price-card"><p class="label">${p.missing.length ? 'Published prices, plus quoted items' : 'Your price, including VAT'}</p><p class="big">${pounds(p.total)}</p><p class="basis">${esc(summaryLine(state))}. ${esc(p.caveat)}</p>
    <table class="lines"><caption class="visually-hidden">Price breakdown</caption>${lines}${quoted}<tr class="total"><td>Total, including 20% VAT</td><td>${pounds(p.total)}</td></tr></table>
    <p class="caveat">Prices from Biohort's GB configurator and 2026 price list, read 13 October 2026. Design reference ${ref}.</p></div>
      <div class="next-step"><h2 class="group-title" id="thanks-title" tabindex="-1">${name ? `Thanks, ${esc(name)}. ` : ''}Your design is with Biohort.</h2><p>Biohort's UK team checks it and calls you to confirm every part and its price. Book a time to talk it through, download your PDF, or see it in Biohort's shop.</p></div></div>`
    : `<div id="quote-locked"><div class="price-card is-locked"><p class="label">${icon('lock')}Your price, including VAT</p><p class="big price-blur" aria-hidden="true">£0,000</p><p class="basis">Send your design to see its full price from Biohort's published UK prices, itemised with article numbers, and to download your illustrated PDF.</p></div><div id="quote-slot"></div></div>`;
  return `${gate}
  <div class="cta-stack">
    <div class="cta-row">
      <button type="button" class="btn tile${open ? '' : ' light'}" data-open="book" data-cta="book-call" data-placement="price">${icon('calendar')}<span><strong>Book a call</strong><small>Pick a day and time to talk it through</small></span></button>
      <button type="button" class="btn tile light" data-action="pdf" data-cta="download-pdf" data-placement="price">${icon(open ? 'download' : 'lock')}<span><strong>Download PDF</strong><small>${open ? 'Your design, views and price' : 'Unlocks with your price'}</small></span></button>
    </div>
    <p class="hint pdf-status" id="pdf-status" role="status"></p>
    <div class="cta-row">
      ${open ? `<a class="btn ghost" href="${esc(shopURL(state))}" target="_blank" rel="noopener" data-cta="shop" data-placement="price">${icon('outside')}See it in Biohort's shop</a>` : ''}
      <button type="button" class="btn ghost" data-action="share" data-cta="share" data-placement="price">${icon('share')}Share this design</button>
    </div>
  </div>
  <section class="spec" aria-labelledby="spec-title"><h2 class="group-title" id="spec-title">Your specification</h2>${spec}<p class="illustrative">Tools, bikes and plants in the 3D view are illustrative and not included.</p></section>
  <section aria-labelledby="next-title"><h2 class="group-title" id="next-title">What happens next</h2><ol class="next-steps">
    <li>Send your design. Biohort's UK team checks it and calls you to confirm every part.</li>
    <li>Prepare the base: your own slab to Biohort's foundation plan, or a Biohort SmartBase.</li>
    <li>${state.range === 'casanova' ? 'Delivery: Biohort shows free shipping within 6 weeks; your dealer confirms the delivery date and any charge.' : 'Free kerbside delivery to mainland Great Britain, usually within 3 weeks.'}</li>
    <li>Build it yourself with Biohort's illustrated manual and videos, or ask for an assembly partner near you.</li>
  </ol></section>`;
}

const RENDER = [stepRange, stepSize, stepColour, stepOpenings, stepRoof, stepBase, stepInside, stepPrice];

function renderSteps() {
  $('#steps').innerHTML = STEPS.map((s, i) => `<button type="button" data-step="${i}"${i === state.step ? ' aria-current="step"' : ''} class="${ui.visited.has(i) && i !== state.step ? 'done' : ''}" title="${esc(s.label)}"><span class="n">${i + 1}</span><span class="l">${esc(s.label)}</span></button>`).join('');
}
const scratch = document.createElement('div');
function renderPrice() {
  const p = priceFor(state);
  // Locked: a button to the price step instead of the figure. It wraps rather than overflow beside
  // the longest Next label, and the static HTML matches it, so the footer doesn't shift on load.
  // Only real changes are written, so the live region stays quiet.
  const html = !unlocked()
    ? `<button type="button" class="chip-lock" data-action="see-price" data-cta="see-price" data-placement="footer"><span class="t">${icon('lock')}See your price</span></button>`
    : `${esc(designName(state))}<strong>${pounds(p.total)}</strong><span class="plus">${p.missing.length ? '+ quoted items · ' : ''}inc VAT</span>`;
  scratch.innerHTML = html;
  if (scratch.innerHTML !== $('#price-chip').innerHTML) $('#price-chip').innerHTML = html;
}
function render({keepFocus = false} = {}) {
  const active = keepFocus ? document.activeElement : null;
  const activeId = active && active.id && $('#step-content').contains(active) ? active.id : null;
  const activeAction = !activeId && active?.dataset?.action ? `[data-action="${active.dataset.action}"]${active.dataset.key ? `[data-key="${active.dataset.key}"]` : ''}${active.dataset.delta ? `[data-delta="${active.dataset.delta}"]` : ''}${active.dataset.kind ? `[data-kind="${active.dataset.kind}"]` : ''}${active.dataset.id ? `[data-id="${active.dataset.id}"]` : ''}` : null;
  const s = STEPS[state.step];
  renderSteps();
  $('#panel-title').textContent = s.title;
  const lede = s.id === 'roof' ? (state.range === 'casanova' ? 'The light band, the roof bars and spotlight cut-outs.' : 'Canopy, downpipes and what goes on the roof and walls.') : s.id === 'price' ? `${summaryLine(state)}.` : s.lede;
  $('#panel-lede').textContent = lede;
  $('#step-content').innerHTML = RENDER[state.step]();
  // The price step's form is one element kept across renders, so what the visitor typed survives.
  const slot = $('#quote-slot');
  if (slot) { slot.replaceWith(quoteForm); quote.prefill(); }
  for (const el of $$('#step-content [data-hex]')) el.style.background = el.dataset.hex;
  $('#usps').innerHTML = '<h2 class="visually-hidden">Why Biohort</h2>' + (USPS[s.usps] || []).map(u => `<div class="usp">${icon('check')}<span><strong>${esc(u.title)}</strong>${esc(u.text)}</span></div>`).join('');
  renderPrice();
  $('#back').hidden = state.step === 0;
  $('#next').textContent = state.step === STEPS.length - 1 ? (unlocked() ? 'Book a call' : 'Show my price') : `Next: ${STEPS[state.step + 1].label}`;
  $('#undo').disabled = !undoStack.length; $('#redo').disabled = !redoStack.length;
  if (activeId) document.getElementById(activeId)?.focus({preventScroll: true});
  else if (activeAction) $('#step-content ' + activeAction)?.focus({preventScroll: true});
}

function selectStep(i, {focusHeading = true} = {}) {
  i = Math.max(0, Math.min(STEPS.length - 1, i));
  state.step = i; ui.visited.add(i);
  render(); persist();
  if (scene) {
    const id = STEPS[i].id;
    scene.setDimensions(id === 'size');
    if (id === 'inside' && ui.view !== 'inside') setView('inside');
    else if (id !== 'inside' && ui.view === 'inside') setView('outside');
    if (id === 'size') scene.focus(focusFor('size'));
    else if (id === 'openings') scene.focus({...focusFor('door'), highlight: false});
    else if (id === 'roof') scene.focus({tags: [], whole: true, highlight: false, dir: [-.55, .55, 1]});
    else if (id === 'base') scene.focus({tags: ['foundation'], whole: true, highlight: false, dir: [-.6, .45, 1]});
    else if (id === 'colour') scene.focus({...focusFor('colour'), highlight: false});
    else if (id === 'price' || id === 'range') scene.focus({tags: [], whole: true, highlight: false, dir: [-.62, .2, 1]});
  }
  if (focusHeading) {
    $('#panel-title').focus({preventScroll: true});
    if (stacked()) reveal($('#panel-title'));
    else $('#panel-body').scrollTop = 0;
  }
  track('step_view', {step: i + 1, step_name: STEPS[i].id});
  if (STEPS[i].id === 'price') track('price_view', {total: unlocked() ? priceFor(state).total : undefined, range: state.range, locked: !unlocked()});
}

// ---- Panel events --------------------------------------------------------------------------------
const content = $('#step-content');
let sliderTimer = null;
content.addEventListener('input', e => {
  const el = e.target;
  if (el.type !== 'range') return;
  const out = el.closest('.slider-row')?.querySelector('output');
  if (out) out.textContent = `${el.value}%`;
  clearTimeout(sliderTimer);
  sliderTimer = setTimeout(() => applyRange(el, false), 120);
});
content.addEventListener('change', e => {
  const el = e.target, name = el.name, v = el.value;
  if (el.type === 'range') { clearTimeout(sliderTimer); return applyRange(el, true); }
  if (el.matches('select[data-field]')) return editOpening(el.dataset.id, el.dataset.field, v);
  if (name === 'range') return change({...normalise({range: v}), step: state.step}, {key: 'range', label: `${RANGES[v].name}, ${priceFor(normalise({range: v})).headline}`});
  if (name === 'model') return change({model: v}, {key: 'model', label: MODELS[v].name});
  if (name === 'size') return change({size: v, doorP: null}, {key: 'size', label: `Size ${sizeLabel(state.range, v)}`});
  if (name === 'door') return change({door: v, doorP: null}, {key: 'door', label: v === 'double' ? 'Double door' : 'Standard door'});
  if (name === 'colour') return change({colour: v}, {key: 'colour', label: COLOURS[v].name});
  if (name === 'cnmain') return change(v === 'manual' || v === 'electric' ? {gate: v, door: 'standard', doorP: null} : {gate: 'none', door: v, doorP: null}, {key: 'gate', label: v === 'manual' || v === 'electric' ? 'Sectional overhead door' : v === 'double' ? 'Double door' : 'Standard door'});
  if (name === 'hinge') return change({hinge: v}, {key: 'hinge', label: `${v === 'left' ? 'Left' : 'Right'} hinge`});
  if (name === 'doorWall') return change({doorWall: v, doorP: null}, {key: 'doorWall', label: `Door on the ${WALLS[v].toLowerCase()}`});
  if (name === 'doorGlass') return change({doorGlass: el.checked}, {key: 'doorGlass'});
  if (name === 'gasSpring') return change({gasSpring: el.checked}, {key: 'gasSpring'});
  if (name === 'ramp') return change({ramp: el.checked}, {key: 'ramp'});
  if (name.startsWith('canopy-')) { const side = name.slice(7); return change({canopy: {...state.canopy, [side]: v}}, {key: 'canopy', focus: {side}, label: v === 'none' ? `No ${side} canopy` : `${side === 'left' ? 'Left' : 'Right'} side canopy`}); }
  if (name.startsWith('cw-')) { const [, side, which] = name.split('-'); return change({canopyWalls: {...state.canopyWalls, [side]: {...state.canopyWalls[side], [which]: el.checked}}}, {key: 'canopyWall', focus: {side, which}}); }
  if (name === 'downpipe') return change({downpipe: v}, {key: 'downpipe'});
  if (['pv', 'skylight', 'roofSupport', 'floorPlate', 'anchors', 'panelling', 'insulation'].includes(name)) return change({[name]: el.checked}, {key: name});
  if (name.startsWith('ext-')) { const w = name.slice(4); return change({extLight: {...state.extLight, [w]: el.checked}}, {key: 'extLight', focus: {wall: w}}); }
  if (name === 'foundation') return change({foundation: v}, {key: 'foundation', label: FOUNDATIONS[v].name});
  if (name === 'sauna') return change({sauna: v}, {key: 'sauna'});
  if (name === 'bikeLift') return change({bikeLift: v}, {key: 'bikeLift'});
});
function applyRange(el, final) {
  const v = Number(el.value) / 100, quiet = !final;
  if (el.name === 'doorP') change({doorP: v}, {key: 'doorP', quiet});
  else if (el.dataset.field === 'p') editOpening(el.dataset.id, 'p', v, quiet);
}
content.addEventListener('click', e => {
  const b = e.target.closest('[data-action]');
  if (!b || b.disabled) return;
  const a = b.dataset.action;
  if (a === 'count') {
    const key = b.dataset.key, d = Number(b.dataset.delta);
    if (key.startsWith('item-')) { const k = key.slice(5); return change({items: {...state.items, [k]: Math.max(0, (state.items[k] || 0) + d)}}, {key: 'item', focus: {item: k}, label: `${ITEMS[k].name}: ${Math.max(0, (state.items[k] || 0) + d)} extra`}); }
    const focusKey = {floraboard: 'floraboard', solar: 'solar', led: 'led', canopyGlass: 'canopyGlass', canopyFlora: 'canopyFlora'}[key];
    return change({[key]: Math.max(0, (state[key] || 0) + d)}, {key: focusKey});
  }
  if (a === 'add') addOpening(b.dataset.kind);
  else if (a === 'remove') {
    const o = state.openings.find(x => x.id === b.dataset.id);
    change({openings: state.openings.filter(x => x.id !== b.dataset.id)}, {key: 'wall', focus: {wall: o.wall, highlight: true}, label: `${openingLabel(state, o)} removed. Undo is under the 3D view.`});
  } else if (a === 'ohinge' || a === 'oglass') {
    const o = state.openings.find(x => x.id === b.dataset.id);
    const next = a === 'ohinge' ? {...o, hinge: b.dataset.h, glass: b.dataset.h === 'right' ? o.glass : false} : {...o, glass: !o.glass};
    ui.opening = o.id;
    change({openings: state.openings.map(x => (x.id === o.id ? next : x))}, {key: 'opening', focus: {id: o.id, wall: o.wall}});
  } else if (a === 'pdf') downloadPDF('price');
  else if (a === 'see-price') focusQuote();
  else if (a === 'share') openShare();
  else if (a === 'compare') openCompare();
});
content.addEventListener('focusin', e => {
  const row = e.target.closest('.opening-row');
  if (row && ui.opening !== row.dataset.open) { ui.opening = row.dataset.open; scene?.select(['opening:' + ui.opening]); $$('.opening-row').forEach(r => r.classList.toggle('is-selected', r === row)); }
});

function editOpening(id, field, value, live = false) {
  const o = state.openings.find(x => x.id === id); if (!o) return;
  const next = {...o, [field]: field === 'p' ? Number(value) : value};
  const fitted = fitOpenings(state, state.openings.map(x => (x.id === id ? next : x)));
  if (!fitted.find(x => x.id === id)) { toast(`That doesn't fit on the ${WALLS[next.wall].toLowerCase()} beside what's there. Try another wall or remove one.`); render(); return; }
  ui.opening = id;
  change({openings: fitted}, {key: 'opening', quiet: live, focus: {id, wall: next.wall}, label: field === 'kind' ? `${KINDS[value].name}` : field === 'wall' ? `Moved to the ${WALLS[value].toLowerCase()}` : undefined});
}
function addOpening(kind) {
  const id = 'o' + Date.now().toString(36).slice(-5);
  for (const wall of ['left', 'right', 'back', 'front']) {
    for (const p of [.5, .25, .75, .15, .85]) {
      const trial = normalise({...state, openings: [...state.openings, {id, kind, wall, p}]});
      if (!trial.openings.some(o => o.id === id)) continue;
      ui.opening = id;
      change({openings: trial.openings}, {key: 'opening', focus: {id, wall}, label: `${KINDS[kind].name} added to the ${WALLS[wall].toLowerCase()}`});
      requestAnimationFrame(() => $(`#kind-${id}`)?.focus());
      return;
    }
  }
  toast(`There's no room for another ${KINDS[kind].name.toLowerCase()}. Choose a bigger size or remove one first.`);
}

// ---- Footer, steps, history -----------------------------------------------------------------------
$('#steps').addEventListener('click', e => { const b = e.target.closest('[data-step]'); if (b) selectStep(Number(b.dataset.step)); });
$('#back').addEventListener('click', () => selectStep(state.step - 1));
$('#next').addEventListener('click', () => {
  if (state.step === STEPS.length - 1) {
    track('cta_click', {cta: unlocked() ? 'book-call' : 'show-price', placement: 'footer'});
    return unlocked() ? openForm('book', 'footer') : sendQuote('footer');
  }
  track('cta_click', {cta: 'next', placement: 'footer'});
  selectStep(state.step + 1);
});
$('#price-chip').addEventListener('click', e => { if (e.target.closest('[data-action="see-price"]')) focusQuote(); });
$('#undo').addEventListener('click', () => { if (!undoStack.length) return; redoStack.push(clone(state)); const step = state.step; state = normalise({...undoStack.pop(), step}); render(); persist(); scene?.update(state); toast('Undone'); track('undo'); });
$('#redo').addEventListener('click', () => { if (!redoStack.length) return; undoStack.push(clone(state)); const step = state.step; state = normalise({...redoStack.pop(), step}); render(); persist(); scene?.update(state); toast('Redone'); track('redo'); });

// ---- Stage controls ---------------------------------------------------------------------------------
function setView(v) {
  ui.view = v;
  $$('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
  if (scene && scene.view !== v) scene.setView(v);
}
$$('[data-view]').forEach(b => b.addEventListener('click', () => { startScene('view'); setView(b.dataset.view); track('view_change', {view: b.dataset.view}); }));
$('#zoom-in').addEventListener('click', () => { startScene('zoom'); scene?.zoom(1); track('zoom', {direction: 'in'}); });
$('#zoom-out').addEventListener('click', () => { startScene('zoom'); scene?.zoom(-1); track('zoom', {direction: 'out'}); });
$('#reset-view').addEventListener('click', () => { scene?.reset(); track('view_reset'); });
$('#dusk').addEventListener('click', () => {
  const on = $('#dusk').getAttribute('aria-pressed') !== 'true';
  $('#dusk').setAttribute('aria-pressed', String(on));
  scene?.setNight(on); track('dusk', {on});
});

let toastTimer = 0;
function toast(text) {
  const el = $('#toast');
  el.hidden = false; el.textContent = text;
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2800);
  announce(text);
}
function announce(text) { const a = $('#announce'); a.textContent = ''; setTimeout(() => { a.textContent = text; }, 30); }

// ---- Header menu, CTAs -----------------------------------------------------------------------------
const menu = $('#menu'), menuToggle = $('#menu-toggle');
menuToggle.addEventListener('click', () => {
  const open = menu.hidden;
  menu.hidden = !open; menuToggle.setAttribute('aria-expanded', String(open));
  if (open) menu.querySelector('button, a')?.focus();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { menu.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.focus(); } });
document.addEventListener('click', e => {
  if (!menu.hidden && !e.target.closest('#menu, #menu-toggle')) { menu.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); }
  const cta = e.target.closest('[data-cta]');
  if (cta) track('cta_click', {cta: cta.dataset.cta, placement: cta.dataset.placement || 'page'});
  const opener = e.target.closest('[data-open]');
  if (opener) { e.preventDefault(); if (!menu.hidden) { menu.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); } openForm(opener.dataset.open, opener.dataset.placement); }
});
$('#help').addEventListener('click', e => tour.start(e.currentTarget));
$('#help-menu').addEventListener('click', () => { menu.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); tour.start(menuToggle); });

// ---- Forms --------------------------------------------------------------------------------------
// The dialog serves the header and menu forms and Book a call; the price step has its own form,
// which unlocks the price. Any successful send unlocks it, since every form carries the
// design with the visitor's details.
const FORMS = {
  callback: {title: 'Request a callback', lede: 'Biohort\'s UK team calls you back about your design. It is attached to your request, so they can see exactly what you chose.', submit: 'Request my callback',
    fields: `<div class="field"><label for="f-time">Best time to call</label><select id="f-time" name="bestTime"><option>Any time</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select></div>`,
    done: 'Biohort will call you back. Your design and its full specification are attached to your request.'},
  showroom: {title: 'See a Biohort building near you', lede: 'Biohort sells through stockists across the UK, many with buildings on display. Tell us where you are and we\'ll put you in touch with the nearest one showing your range.', submit: 'Find my nearest display',
    extra: `<a class="tour-link" href="${COMPANY.dealers}" target="_blank" rel="noopener" data-cta="dealer-search" data-placement="showroom"><svg class="icon" aria-hidden="true"><use href="#i-pin"/></svg><span><strong>Search Biohort's stockists yourself</strong><small>Biohort's dealer search opens in a new tab.</small></span></a>`,
    fields: `<div class="field"><label for="f-visit">What would you like to see?</label><select id="f-visit" name="visit"><option>The range I've designed</option><option>Colour samples</option><option>Any Biohort building</option></select></div>`,
    done: 'We\'ll put you in touch with the nearest stockist showing your range. Your design is attached.'},
  brochure: {title: 'Download the brochure', lede: 'Biohort\'s English product catalogue: every range, size and accessory, with the CasaNova brochure if that\'s your range.', submit: 'Download the brochure',
    done: 'Your brochure is opening. If it doesn\'t, use the button below.'},
  book: {title: 'Book a design call', lede: 'Pick a day and time to talk it through. Biohort\'s UK team calls you to go through your design and confirm every part before you order.', submit: 'Request this call',
    fields: `<div class="field-row"><div class="field"><label for="f-day">Preferred day</label><input id="f-day" name="day" type="date"></div><div class="field"><label for="f-slot">Time</label><select id="f-slot" name="slot"><option>Morning</option><option>Afternoon</option><option>Evening</option></select></div></div>`,
    done: 'Biohort will confirm your design call. Your design and its full specification are attached.'}
};
// The pipeline's form types: Book a call is stored and reported as `book-call`.
const TYPE = {book: 'book-call'};
const FIELDS = ['first', 'last', 'phone', 'email', 'postcode'];
const unlocked = () => Boolean(receipt);

/** Validation, errors and the request body for one form whose inputs are named prefix + field. */
function formKit(form, prefix) {
  const input = id => form.querySelector(`#${prefix}${id}`), hint = `${prefix}phone-hint`;
  function fieldError(id, message) {
    const el = input(id), out = form.querySelector(`#${prefix}${id}-error`);
    if (message) { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', [`${prefix}${id}-error`, id === 'phone' ? hint : ''].filter(Boolean).join(' ')); out.textContent = message; out.hidden = false; }
    else { el.removeAttribute('aria-invalid'); if (id === 'phone') el.setAttribute('aria-describedby', hint); else el.removeAttribute('aria-describedby'); out.hidden = true; }
    return !message;
  }
  function validate() {
    const f = form.elements;
    const problems = {
      first: !f.firstName.value.trim() ? 'Enter your first name.' : !validName(f.firstName.value) ? 'Use letters only, for example Sam.' : '',
      last: !f.lastName.value.trim() ? 'Enter your last name.' : !validName(f.lastName.value) ? 'Use letters only, for example Taylor.' : '',
      phone: phoneProblem(f.phone.value),
      email: !f.email.value.trim() ? 'Enter your email address so Biohort can send your design.' : !validEmail(f.email.value) ? 'Enter an email address like name@example.com.' : '',
      postcode: !f.postcode.value.trim() ? 'Enter the postcode where the building will go.' : !validPostcode(f.postcode.value) ? 'Enter a full UK postcode, such as SW1A 1AA.' : ''
    };
    let first = null;
    for (const [k, msg] of Object.entries(problems)) { if (!fieldError(k, msg) && !first) first = k; }
    return first;
  }
  const problem = (id, value) => id === 'phone' ? phoneProblem(value) : id === 'email' ? (validEmail(value) ? '' : 'Enter an email address like name@example.com.') : id === 'postcode' ? (validPostcode(value) ? '' : 'Enter a full UK postcode, such as SW1A 1AA.') : (validName(value) ? '' : 'Use letters only.');
  for (const id of FIELDS) {
    input(id).addEventListener('blur', e => {
      if (!e.target.value.trim()) return;
      if (id === 'postcode' && validPostcode(e.target.value)) e.target.value = formatPostcode(e.target.value);
      if (id === 'phone') { const p = parseUKPhone(e.target.value); if (p.valid) e.target.value = p.display; }
      fieldError(id, problem(id, e.target.value));
    });
    // A corrected field clears its error as it is typed, not on blur: clearing it on blur moved the
    // send button under the pointer mid-click, so the click was lost.
    input(id).addEventListener('input', e => { if (e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim() && !problem(id, e.target.value)) fieldError(id, ''); });
  }
  return {
    form, input, fieldError, validate,
    reset() { for (const id of FIELDS) fieldError(id, ''); },
    prefill() { try { const saved = JSON.parse(sessionStorage.getItem('bh-contact') || 'null'); if (saved) for (const [k, v] of Object.entries(saved)) { const i = form.elements[k]; if (i && !i.value) i.value = v; } } catch {} },
    body(type, placement, extra) {
      const f = form.elements, phone = parseUKPhone(f.phone.value);
      return {
        type: TYPE[type] || type, placement,
        firstName: f.firstName.value.trim(), lastName: f.lastName.value.trim(), phone: phone.e164, phoneDisplay: phone.display,
        email: f.email.value.trim(), postcode: formatPostcode(f.postcode.value), marketing: f.marketing.checked, company: f.company.value,
        extra, design: encodeDesign(state), reference: designReference(state), page: location.origin + location.pathname,
        attribution: attribution()
      };
    }
  };
}

/** Posts one enquiry; returns the reference, or throws with the server's message. */
async function sendLead(kit, body) {
  const res = await fetch('/api/enquiry', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(body)});
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    if (data.field) { kit.fieldError(data.field, data.error); kit.input(data.field)?.focus(); }
    throw new Error(data.error || `The server said ${res.status}`);
  }
  receipt = data.reference;
  try { sessionStorage.setItem(RECEIPT, receipt); sessionStorage.setItem('bh-contact', JSON.stringify({firstName: body.firstName, lastName: body.lastName, phone: body.phoneDisplay, email: body.email, postcode: body.postcode})); } catch {}
  return data.reference;
}

const dialog = $('#form-dialog'), leadForm = $('#lead-form'), lead = formKit(leadForm, 'f-');
let formMode = 'callback', formOpener = null, formPlacement = '';

function openForm(mode, placement = '') {
  if (!FORMS[mode]) return;
  formMode = mode; formPlacement = placement || 'page';
  formOpener = document.activeElement;
  const f = FORMS[mode];
  $('#form-title').textContent = f.title;
  $('#form-lede').textContent = f.lede;
  $('#form-extra').innerHTML = f.extra || '';
  $('#form-mode-fields').innerHTML = f.fields || '';
  if (mode === 'book') { const d = $('#f-day'); const t = new Date(); d.min = t.toISOString().slice(0, 10); }
  $('#form-submit').textContent = f.submit;
  $('#form-view').hidden = false; $('#form-done').hidden = true;
  $('#form-error').hidden = true;
  lead.reset();
  lead.prefill();
  dialog.showModal();
  setTimeout(() => leadForm.elements.firstName.focus(), 30);
  track('form_open', {form: mode, placement: formPlacement});
}
dialog.addEventListener('close', () => { if (formOpener?.isConnected) formOpener.focus({preventScroll: true}); });

leadForm.addEventListener('submit', async e => {
  e.preventDefault();
  const bad = lead.validate();
  if (bad) { lead.input(bad).focus(); track('form_error', {form: formMode, field: bad}); return; }
  const button = $('#form-submit');
  const extra = {};
  for (const el of $$('#form-mode-fields [name]')) extra[el.name] = el.value;
  button.disabled = true; button.textContent = 'Sending…';
  $('#form-error').hidden = true;
  try {
    const reference = await sendLead(lead, lead.body(formMode, formPlacement, extra));
    track('form_success', {form: formMode, placement: formPlacement});
    render({keepFocus: true});
    showDone(reference);
  } catch (err) {
    const msg = $('#form-error');
    msg.textContent = `Your details didn't send: ${err.message}. Please try again, or call Biohort on ${COMPANY.phone}.`;
    msg.hidden = false;
    track('form_fail', {form: formMode});
  } finally {
    button.disabled = false; button.textContent = FORMS[formMode].submit;
  }
});
function showDone(reference) {
  const f = FORMS[formMode];
  $('#form-view').hidden = true; $('#form-done').hidden = false;
  $('#done-title').textContent = 'Thank you';
  $('#done-text').textContent = f.done;
  $('#done-ref').textContent = `Reference ${reference}`;
  const actions = [];
  if (formMode === 'brochure') {
    actions.push(`<a class="btn wide" href="${COMPANY.catalogue}" target="_blank" rel="noopener" data-cta="brochure-download" data-placement="form">${icon('download')}Biohort product catalogue (PDF)</a>`);
    if (state.range === 'casanova') actions.push(`<a class="btn light wide" href="${COMPANY.casanovaBrochure}" target="_blank" rel="noopener" data-cta="brochure-casanova" data-placement="form">${icon('download')}CasaNova brochure (PDF)</a>`);
  }
  actions.push(`<button type="button" class="btn${formMode === 'brochure' ? ' light' : ''} wide" data-action="done-price" data-cta="see-price" data-placement="form-done">See your price</button>`);
  actions.push(`<button type="button" class="btn light wide" data-action="done-pdf" data-cta="download-pdf" data-placement="form-done">${icon('download')}Download my design PDF</button>`);
  actions.push(`<a class="btn ghost wide" href="tel:${COMPANY.tel}" data-cta="phone" data-placement="form-done">${icon('phone')}Call ${COMPANY.phone}</a>`);
  $('#done-actions').innerHTML = actions.join('');
  $('#done-title').focus();
  if (formMode === 'brochure') { window.open(COMPANY.catalogue, '_blank', 'noopener'); track('brochure_download'); }
}
$('#done-actions').addEventListener('click', e => {
  if (e.target.closest('[data-action="done-pdf"]')) makePDF();
  if (e.target.closest('[data-action="done-price"]')) {
    dialog.close();
    if (state.step !== STEPS.length - 1) selectStep(STEPS.length - 1);
    else reveal($('#price-card'));
  }
});

// The price step's own form. Built once and moved into each render of the step (see render()).
const quoteForm = document.createElement('form');
quoteForm.id = 'quote-form'; quoteForm.className = 'quote-form'; quoteForm.noValidate = true;
quoteForm.setAttribute('aria-labelledby', 'quote-form-title');
quoteForm.innerHTML = `<h2 class="group-title" id="quote-form-title">Send your design to see your price</h2>
  <div class="field-row">
    <div class="field"><label for="q-first">First name</label><input id="q-first" name="firstName" autocomplete="given-name" required maxlength="60"><p class="error" id="q-first-error" hidden></p></div>
    <div class="field"><label for="q-last">Last name</label><input id="q-last" name="lastName" autocomplete="family-name" required maxlength="60"><p class="error" id="q-last-error" hidden></p></div>
  </div>
  <div class="field"><label for="q-phone">Phone number</label><input id="q-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="24" placeholder="07700 123456" aria-describedby="q-phone-hint"><p class="hint" id="q-phone-hint">A UK mobile or landline. Biohort's UK team will call you on it.</p><p class="error" id="q-phone-error" hidden></p></div>
  <div class="field"><label for="q-email">Email</label><input id="q-email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"><p class="error" id="q-email-error" hidden></p></div>
  <div class="field"><label for="q-postcode">Postcode of the garden</label><input id="q-postcode" name="postcode" autocomplete="postal-code" required maxlength="8" placeholder="SW1A 1AA" class="short"><p class="error" id="q-postcode-error" hidden></p></div>
  <div class="field"><label for="q-notes">Anything else Biohort should know? <span class="hint">Optional</span></label><textarea id="q-notes" name="notes" maxlength="1000" placeholder="Access, the base you have, timing"></textarea></div>
  <div class="field hp" aria-hidden="true"><label for="q-company">Company</label><input id="q-company" name="company" tabindex="-1" autocomplete="off"></div>
  <label class="check"><input type="checkbox" id="q-marketing" name="marketing"><span>Send me occasional news and offers from Biohort. Optional.</span></label>
  <p class="small-print">Free, with no obligation. Your design, its full specification and a link to it are sent with your details, and Biohort's UK team checks every part. We use your details only to reply to you. <a href="${COMPANY.privacy}" target="_blank" rel="noopener">Privacy policy</a>.</p>
  <p class="error form-error" id="q-form-error" role="alert" hidden></p>
  <button type="submit" class="btn wide" id="q-submit">${icon('lock')}<span>Show my price</span></button>`;
const quote = formKit(quoteForm, 'q-');
let quoteBusy = false;
quoteForm.addEventListener('submit', e => { e.preventDefault(); sendQuote('price'); });
async function sendQuote(placement) {
  if (quoteBusy) return;
  if (STEPS[state.step].id !== 'price') return focusQuote();
  const bad = quote.validate();
  if (bad) { const el = quote.input(bad); reveal(stacked() ? el.closest('.field') : el, {gap: 8, block: 'center'}); el.focus({preventScroll: true}); track('form_error', {form: 'quote', field: bad}); return; }
  const button = quoteForm.querySelector('#q-submit'), label = button.querySelector('span'), error = quoteForm.querySelector('#q-form-error');
  quoteBusy = true; button.disabled = true; label.textContent = 'Sending…'; error.hidden = true;
  try {
    await sendLead(quote, quote.body('quote', placement, {notes: quoteForm.elements.notes.value}));
    track('form_success', {form: 'quote', placement});
    render();
    $('#thanks-title')?.focus({preventScroll: true});
    reveal($('#quote-unlocked'));
    toast('Here is your price. Your PDF is ready.');
  } catch (err) {
    error.textContent = `Your details didn't send: ${err.message}. Please try again, or call Biohort on ${COMPANY.phone}.`;
    error.hidden = false;
    track('form_fail', {form: 'quote'});
  } finally {
    quoteBusy = false; button.disabled = false; label.textContent = 'Show my price';
  }
}
/** Takes the visitor to the price step's form (from the footer chip or a locked PDF button). */
function focusQuote() {
  if (unlocked()) { if (STEPS[state.step].id !== 'price') selectStep(STEPS.length - 1); return; }
  if (STEPS[state.step].id !== 'price') selectStep(STEPS.length - 1, {focusHeading: false});
  const first = quoteForm.querySelector('#q-first');
  reveal(stacked() ? quoteForm : first, {gap: 8, block: 'center'});
  first.focus({preventScroll: true});
}

function attribution() {
  const out = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid']) { const v = params.get(k); if (v) out[k] = v.slice(0, 120); }
  if (document.referrer) out.referrer = document.referrer.slice(0, 200);
  return out;
}

// ---- PDF ----------------------------------------------------------------------------------------
// The PDF carries the price, so it unlocks with it: until then the button points to the form.
function downloadPDF(placement) {
  if (unlocked()) return makePDF();
  const status = $('#pdf-status');
  if (status) status.textContent = 'Enter your details above to see your price and unlock your PDF.';
  track('pdf_locked', {placement});
  focusQuote();
}
let pdfBusy = false;
async function makePDF() {
  if (pdfBusy) return; pdfBusy = true;
  const status = $('#done-text');
  try {
    if (!scene) { startScene('pdf'); await waitFor(() => scene || fallback3d, 30000); }
    const views = scene ? scene.capture(['hero', 'front', 'back', 'left', 'right', 'interior', 'plan'], {width: 1800, height: 1125}) : {};
    for (const [k, v] of Object.entries(views)) if (v.startsWith('svg:')) views[k] = await rasterise(v.slice(4), 1600, 1000);
    const mod = await import('./pdf.js');
    let name = ''; try { name = JSON.parse(sessionStorage.getItem('bh-contact') || '{}').firstName || ''; } catch {}
    // QA can point the PDF's links at the live site while building an example locally.
    const origin = QA && /^https:\/\/[a-z0-9.-]+\.netlify\.app$/.test(params.get('pdforigin') || '') ? params.get('pdforigin') : location.origin;
    await mod.downloadPDF(state, views, {contactName: name, origin});
    track('pdf_download', {total: priceFor(state).total, views: Object.keys(views).length});
    if (dialog.open && !$('#form-done').hidden) status.textContent = 'Your PDF has downloaded: your design from every side, inside and in plan, its full specification, price and next steps.';
    else { toast('Your design PDF has downloaded.'); const s = $('#pdf-status'); if (s) s.textContent = 'Your PDF has downloaded: your design from every side, inside and in plan, its specification, price and next steps.'; }
  } catch (err) {
    console.error(err);
    const msg = `The PDF couldn't be made on this device. Your design is saved with your enquiry, and Biohort can send it to you: call ${COMPANY.phone}.`;
    if (dialog.open && !$('#form-done').hidden) status.textContent = msg; else toast(msg);
    track('pdf_fail', {error: String(err).slice(0, 80)});
  } finally { pdfBusy = false; }
}
function waitFor(fn, ms) { return new Promise(r => { const end = Date.now() + ms; (function poll() { if (fn() || Date.now() > end) r(); else setTimeout(poll, 200); })(); }); }
function rasterise(markup, w, h) {
  return new Promise((resolve, reject) => {
    const sized = markup.replace('<svg', `<svg width="${w}" height="${h}"`);
    const img = new Image();
    img.onload = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d'); ctx.fillStyle = '#e3e9e5'; ctx.fillRect(0, 0, w, h); ctx.drawImage(img, 0, 0, w, h); const out = c.toDataURL('image/jpeg', .9); c.width = c.height = 0; resolve(out); };
    img.onerror = reject;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sized);
  });
}

// ---- Share and compare dialogs ------------------------------------------------------------------
function openShare() {
  const link = designURL(state, location.origin);
  $('#share-link').value = link; $('#share-status').textContent = '';
  $('#share-dialog').showModal(); $('#share-link').select();
  track('share_open');
}
$('#share-copy').addEventListener('click', async () => {
  const link = $('#share-link').value;
  try { await navigator.clipboard.writeText(link); $('#share-status').textContent = 'Link copied.'; }
  catch { $('#share-link').select(); $('#share-status').textContent = 'Select the link and copy it.'; }
  track('share_copy');
});
function openCompare() {
  const rows = RANGE_ORDER.map(id => {
    const r = RANGES[id], codes = sizeOrder(id), ds = codes.map(c => dims(normalise({range: id, size: c})));
    const prices = codes.flatMap(c => variantsOf(id, c).map(v => priceOf(Object.values(v.sku)[0]) || 0)).filter(Boolean);
    return `<tr><th scope="row">${esc(r.name)}</th><td>${esc(r.tagline)}</td><td>${codes.length}</td><td>${Math.min(...ds.map(d => d.area)).toFixed(1)} to ${Math.max(...ds.map(d => d.area)).toFixed(1)}m²</td><td>${pounds(Math.min(...prices))}</td></tr>`;
  }).join('');
  $('#info-body').innerHTML = `<h2 id="info-title">Compare the six ranges</h2><div class="table-scroll" tabindex="0" role="region" aria-label="The six ranges compared, scrolls sideways"><table class="compare"><caption class="visually-hidden">Biohort ranges compared</caption><thead><tr><th scope="col">Range</th><th scope="col">Roof and light</th><th scope="col">Sizes</th><th scope="col">Inside</th><th scope="col">From</th></tr></thead><tbody>${rows}</tbody></table></div><p class="hint">Biohort's published UK prices including VAT, smallest size, standard door.</p><button type="button" class="btn wide" data-close-info>Back to my design</button>`;
  $('#info-dialog').showModal();
  track('compare_open');
}
$('#info-dialog').addEventListener('click', e => { if (e.target.closest('[data-close-info], [data-open]')) $('#info-dialog').close(); });

// ---- Tour ----------------------------------------------------------------------------------------
const tour = createTour({onEvent: (name, v) => track(name, v)});

// ---- 3D: started when it is needed ------------------------------------------------------------------
// The page paints a render of the default design straight away and starts the 3D on the first
// interaction (or at once for a shared design), so the 3D engine never delays the first paint.
const FALLBACK_TEXT = {
  context: "The 3D view couldn't start this time. Your design is saved, so loading it again is safe.",
  setup: "The 3D view couldn't start this time. Your design is saved, so loading it again is safe.",
  load: "The 3D view didn't download. Check your connection and load it again; your design is saved.",
  build: "The 3D view couldn't draw this design. Your choices and price still work, and Biohort sees every detail."
};
const TIER_PARAM = params.get('tier');
const LEGACY_SCENE = ['', 'legacy', 'scene.js'].join('/');
function preferredRung() {
  const memory = navigator.deviceMemory || 8;
  if (memory <= 2) return 'low';
  const coarse = matchMedia('(pointer: coarse)').matches;
  return coarse || memory <= 4 || Math.min(screen.width, screen.height) < 700 ? 'medium' : 'high';
}
function pickPart(hit) {
  if (hit.kind === 'opening') {
    const o = state.openings.find(x => x.id === hit.id); if (!o) return;
    ui.opening = o.id;
    if (STEPS[state.step].id !== 'openings') selectStep(STEP.openings, {focusHeading: false}); else render();
    scene?.focus(focusFor('opening', {id: o.id, wall: o.wall}));
    document.querySelector(`.opening-row[data-open="${o.id}"]`)?.scrollIntoView({block: 'nearest', behavior: reduced() ? 'auto' : 'smooth'});
    track('3d_pick', {part: 'opening'});
  } else {
    const step = {mainDoor: 'openings', canopy: 'roof', downpipe: 'roof', pv: 'roof', floraboard: 'roof', roof: 'roof', foundation: 'base', floor: 'base', anchors: 'base', inside: 'inside', walls: 'colour'}[hit.part];
    if (step && STEP[step] !== state.step) { selectStep(STEP[step], {focusHeading: false}); toast('Showing the options for what you tapped'); }
    track('3d_pick', {part: hit.part});
  }
}
const storage = name => { try { return window[name]; } catch { return null; } };
let firstScene = true, fallback3d = null, sceneError = null, started = false;
const boot = createBoot({
  container: $('#scene'),
  // Level 1 (WebGL 1 only) loads the same scene built on three.js r162, the last release with
  // WebGL 1 support. In development there is no legacy build, so the modern one stands in.
  load: level => (level === 1 && !import.meta.env.DEV ? import(/* @vite-ignore */ LEGACY_SCENE) : import('./scene/scene.js')),
  design: () => state,
  preferred: preferredRung(),
  override: RUNGS.includes(TIER_PARAM) ? TIER_PARAM : null,
  session: storage('sessionStorage'),
  local: storage('localStorage'),
  track: (n, v) => track(n.replace(/^configurator_/, ''), v),
  sceneOptions: {onViewChange: v => { ui.view = v; $$('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === v))); }, onPick: pickPart},
  onChange(phase, detail) {
    if (phase === 'loading' || phase === 'down') {
      scene = null;
      $('#stage-loader-text').textContent = firstScene ? 'Loading your 3D shed' : 'Reloading the 3D view';
      $('#stage-loader').hidden = false;
    } else if (phase === 'ready') sceneReady(detail);
    else if (phase === 'verified') { $('#poster').classList.add('is-gone'); }
    else if (phase === 'failed') sceneFailed3d(detail.reason, detail.error);
    debug3d();
  }
});
function sceneReady(next) {
  scene = next;
  scene.setDimensions(STEPS[state.step].id === 'size');
  const view = firstScene ? (STEPS[state.step].id === 'inside' ? 'inside' : 'outside') : ui.view;
  if (view !== 'outside') scene.setView(view, {animate: false});
  if ($('#dusk').getAttribute('aria-pressed') === 'true') scene.setNight(true);
  $('#stage-loader').hidden = true;
  $('#stage-fallback').hidden = true;
  if (boot.rung === 'svg') toast('Showing a simplified 3D view on this device. Every choice and your price work as normal.');
  if (!firstScene) return;
  firstScene = false;
  setTimeout(() => $('#stage-hint').classList.add('is-faded'), 6000);
  track('3d_shown', {rung: boot.rung});
}
function sceneFailed3d(reason, err) {
  if (err) console.error(err);
  scene = null; fallback3d = reason;
  $('#stage-loader').hidden = true; $('#stage-fallback').hidden = false; $('#poster').classList.add('is-gone');
  $('#fallback-caption').textContent = FALLBACK_TEXT[reason] || FALLBACK_TEXT.context;
  $('#fallback-retry').hidden = false;
  $('#stage').dataset.fallback = reason;
  sceneError = err ? String(err) : reason;
  track('3d_fallback', {reason, webgl: boot.gl, error: err ? String(err).slice(0, 120) : undefined});
}
$('#fallback-retry').addEventListener('click', () => { track('3d_retry', {reason: $('#stage').dataset.fallback}); persist(); location.reload(); });

function startScene(why) {
  if (started) return;
  started = true;
  for (const [t, f] of STARTERS) removeEventListener(t, f, true);
  track('3d_start', {trigger: why});
  boot.start();
}
const STARTERS = [];
for (const t of ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel', 'scroll']) {
  const f = () => startScene(t);
  STARTERS.push([t, f]);
  addEventListener(t, f, {capture: true, passive: true});
}

// As Yorkshire's start.js and designer.js, and the Outsiders build: the poster stays the LCP, and
// the 3D starts once the poster has painted, the page has loaded and nothing has downloaded or held
// the main thread for 3s (resource and long-task timings), at the next idle moment; 8s after the
// paint at the latest. Lighthouse stops recording about 2.3s after the last response, so the scene
// build never lands in its window, and nothing more is fetched before then. The panel is usable at
// once, the 3D replaces an identical render a few seconds later, and it never needs a click or a
// drag (any interaction starts it at once).
const SETTLE_MS = 3000, LATEST_MS = 8000;
function startAfterPoster() {
  let painted = false, busyUntil = performance.now();
  const busy = t => { busyUntil = Math.max(busyUntil, t); };
  const types = (window.PerformanceObserver && PerformanceObserver.supportedEntryTypes) || [];
  try { if (types.includes('resource')) new PerformanceObserver(l => l.getEntries().forEach(e => busy(e.responseEnd))).observe({type: 'resource', buffered: true}); } catch {}
  try { if (types.includes('longtask')) new PerformanceObserver(l => l.getEntries().forEach(e => busy(e.startTime + e.duration))).observe({type: 'longtask', buffered: true}); } catch {}
  const build = why => startScene(why);
  const settle = () => {
    if (started) return;
    const quiet = performance.now() - busyUntil;
    if (quiet < SETTLE_MS) return setTimeout(settle, SETTLE_MS - quiet + 50);
    if (window.requestIdleCallback) requestIdleCallback(() => build('auto'), {timeout: 1000}); else build('auto');
  };
  const paint = () => {
    if (painted || started) return;
    painted = true;
    if (document.readyState === 'complete') settle();
    else addEventListener('load', () => { busy(performance.now()); settle(); }, {once: true});
    setTimeout(() => build('auto-latest'), LATEST_MS);
  };
  try {
    const po = new PerformanceObserver(list => {
      if (list.getEntries().some(e => e.element && e.element.id === 'poster')) { po.disconnect(); setTimeout(paint, 0); }
    });
    po.observe({type: 'largest-contentful-paint', buffered: true});
  } catch {}
  const img = $('#poster');
  const afterLoad = () => setTimeout(() => requestAnimationFrame(() => setTimeout(paint, 50)), 100);
  if (img && !img.complete) { img.addEventListener('load', afterLoad, {once: true}); img.addEventListener('error', paint, {once: true}); } else afterLoad();
  setTimeout(paint, 3000);
}

// ?debug3d on any device shows what the 3D runs on and every step it took, with Copy report and
// Send report (anonymous; returns a reference to quote), so a phone that misbehaves can say why.
function debug3d() {
  if (!DEBUG3D) return;
  let box = $('#debug3d');
  if (!box) {
    box = document.createElement('aside'); box.id = 'debug3d'; box.className = 'debug3d'; box.setAttribute('aria-label', '3D diagnostics');
    box.innerHTML = '<pre></pre><div class="row"><button type="button" class="btn small light" data-d="copy">Copy report</button><button type="button" class="btn small light" data-d="send">Send report</button></div><p class="hint" role="status"></p>';
    document.body.append(box);
    box.addEventListener('click', async e => {
      const b = e.target.closest('[data-d]'); if (!b) return;
      const text = box.querySelector('pre').textContent, out = box.querySelector('.hint');
      if (b.dataset.d === 'copy') { try { await navigator.clipboard.writeText(text); out.textContent = 'Copied.'; } catch { out.textContent = 'Select the text above and copy it.'; } }
      else {
        try { const r = await fetch('/api/diagnostics', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({report: text, diagnostics: boot.diagnostics()})}); const d = await r.json(); out.textContent = d.code ? `Sent. Your reference is ${d.code}.` : 'Not sent.'; }
        catch { out.textContent = 'Not sent: no connection.'; }
      }
    });
  }
  const d = boot.diagnostics(), s = d.scene || {};
  const fb = $('#stage').dataset.fallback;
  box.querySelector('pre').textContent = [
    `3D: ${fb ? 'photo (' + fb + ')' : (d.rung || '-') + (d.verified ? '' : ' (starting)')} | WebGL ${d.gl}`,
    `GPU: ${s.gpu || '-'}`,
    `ratio ${s.ratio ?? '-'} | buffer ${s.buffer ? s.buffer.join('x') : '-'} | antialias ${s.context?.antialias ?? '-'} | max texture ${s.maxTexture ?? '-'}`,
    `extensions: ${s.extensions?.join(', ') || '-'}`,
    `textures ${s.textures?.textures ?? '-'} (scale ${s.textures?.scale ?? '-'}, flat ${s.textures?.failures ?? 0}) | frames ${s.frames ?? '-'}`,
    `first frame: ${s.samples?.length ? JSON.stringify(s.samples[0]) : '-'} | gl errors ${s.glErrors?.join(',') || '-'}`,
    `shader errors: ${s.shaderErrors?.join(' || ') || '-'}`,
    `error: ${sceneError || s.lastError || '-'}`,
    'steps:',
    ...d.log.map(e => `  +${e.t}ms ${e.rung || '-'} ${e.event}${e.detail ? ': ' + e.detail : ''}`),
    `screen ${screen.width}x${screen.height} @${devicePixelRatio} | memory ${navigator.deviceMemory || '?'}GB`,
    navigator.userAgent
  ].join('\n');
}

// QA hook for headless checks: ?qa=1 exposes the live scene, the design and the boot's report.
if (QA) {
  window.__cfg = {
    get scene() { return scene; }, get state() { return state; },
    get rung() { return boot.rung; }, get boot() { return boot.diagnostics(); },
    get attempt() { return Math.max(0, boot.diagnostics().log.filter(e => e.event === 'ready').length - 1); },
    get fallback() { return $('#stage').dataset.fallback || null; },
    change, selectStep, focusFor, priceFor: () => priceFor(state), start: startScene, STEP,
    resetReceipt() { receipt = null; try { sessionStorage.removeItem(RECEIPT); } catch {} render(); },
    unlock() { receipt = 'QA'; render(); }, get unlocked() { return unlocked(); },
    makePDF,
    setState(s, {keepCamera = true} = {}) { state = normalise({...s, step: state.step}); render(); scene?.update(state, {keepCamera}); }
  };
}

// ---- Start -----------------------------------------------------------------------------------------
shimDialogs();
const loadedFrom = restore();
try { receipt = sessionStorage.getItem(RECEIPT); } catch {}
ui.visited.add(state.step);
render();
persist();
track('configurator_view', {resumed: loadedFrom || 'new', range: state.range});
track('step_view', {step: state.step + 1, step_name: STEPS[state.step].id});
if (loadedFrom === 'link') toast('This shared design is ready to make your own.');
else if (loadedFrom === 'device') toast('Welcome back. Your design is as you left it.');
// A shared or saved design differs from the poster, so its 3D starts straight away; otherwise it
// starts once the poster has painted. ?qa=layout never starts it (layout checks measure the page).
if (loadedFrom || (QA && params.get('qa') !== 'layout') || DEBUG3D || TIER_PARAM) startScene(loadedFrom || 'qa');
else if (params.get('qa') !== 'layout') startAfterPoster();
if (params.get('book') === '1') setTimeout(() => openForm('book', 'pdf-link'), 300);
else if (!tour.seen() && !QA) setTimeout(() => tour.start($('#panel-title')), 600);
window.addEventListener('pagehide', e => { if (!e.persisted) scene?.dispose(); });
