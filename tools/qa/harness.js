// Dev harness: renders the 3D preview alone from a design code, for headless checks.
// Build: npx esbuild tools/qa/harness.js --bundle --format=esm --outfile=<dir>/harness.js
// URL: index.html?view=outside|inside|plan&night=1&dims=1&tier=high#d=<design code>
import {createScene} from '../../src/scene/scene.js';
import {decodeDesign, normalise} from '../../src/catalog.js';
const q = new URLSearchParams(location.search);
const code = (location.hash.match(/d=([^&]+)/) || [])[1];
const state = (code && decodeDesign(decodeURIComponent(code))) || normalise(q.get('json') ? JSON.parse(q.get('json')) : {});
const el = document.getElementById('scene');
const scene = createScene(el, {tier: q.get('tier') || 'high', onBroken: r => console.error('broken', r), onLost: () => console.error('lost')});
window.__scene = scene; window.__state = state;
scene.update(state);
if (q.get('night') === '1') scene.setNight(true);
if (q.get('view')) scene.setView(q.get('view'), {animate: false});
if (q.get('dims') === '1') scene.setDimensions(true);
if (q.get('focus')) scene.focus(JSON.parse(q.get('focus')));
window.__t0 = performance.now(); setTimeout(() => { window.__ready = true; window.__readyAt = performance.now(); }, 300);
