// Procedural material textures, drawn on canvases at runtime: no image downloads, no third-party
// assets. Each surface gets a colour map and a normal map derived from a height map, so ribs,
// grooves and pressings catch the light. Geometry UVs are in metres; `size` is the real width and
// height one tile covers, so every rib and corrugation is drawn at its true pitch.
import * as THREE from 'three';

const PX = 1024;

function seeded(seed) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function hashSeed(text) {
  let h = 2166136261;
  for (const c of String(text)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
function canvas(w, h = w) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}
const clamp = (v, a = 0, b = 255) => Math.max(a, Math.min(b, v));
function rgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function shade([r, g, b], f, warm = 0) {
  return `rgb(${clamp(r * f + warm)},${clamp(g * f)},${clamp(b * f - warm)})`;
}

/** Sobel normal map from a greyscale height canvas (white is high). Tiles seamlessly. */
function normalFrom(height, strength) {
  const w = height.width, h = height.height;
  const src = height.getContext('2d').getImageData(0, 0, w, h).data;
  const out = canvas(w, h), ctx = out.getContext('2d');
  const img = ctx.createImageData(w, h), d = img.data;
  const at = (x, y) => src[(((y + h) % h) * w + ((x + w) % w)) * 4] / 255;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1)) - (at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1));
      const dy = (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1)) - (at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1));
      let nx = -dx * strength, ny = dy * strength, nz = 1;
      const len = Math.hypot(nx, ny, nz);
      const i = (y * w + x) * 4;
      d[i] = (nx / len * .5 + .5) * 255; d[i + 1] = (ny / len * .5 + .5) * 255; d[i + 2] = (nz / len * .5 + .5) * 255; d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return out;
}

/** Fine speckle in place: breaks up flat colour the way real surfaces do. */
function speckle(c, amount, seed) {
  const ctx = c.getContext('2d'), img = ctx.getImageData(0, 0, c.width, c.height), d = img.data, rand = seeded(seed);
  for (let i = 0; i < d.length; i += 4) {
    const n = (rand() - .5) * amount;
    d[i] = clamp(d[i] + n); d[i + 1] = clamp(d[i + 1] + n); d[i + 2] = clamp(d[i + 2] + n);
  }
  ctx.putImageData(img, 0, 0);
}

/**
 * `scale` below 1 allocates every canvas at a fraction of its designed size (phones use .5, a
 * quarter of the memory) while the drawing code keeps working in designed pixels.
 */
export function createTextures(renderer, {scale = 1, flat: flatOnly = false} = {}) {
  const cache = new Map();
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const k = scale;
  let gen = 0, failures = 0;
  // Shadows the unscaled helper: a canvas at the device's budget, drawn in designed pixels.
  const canvas = (w, h = w) => {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
    const ctx = c.getContext('2d');
    // iOS Safari returns null once a site's canvases pass its memory budget.
    if (!ctx) throw new Error('2D canvas unavailable');
    if (k !== 1) ctx.scale(k, k);
    return c;
  };
  // Zero-size canvases give their memory back at once; waiting for garbage collection is what
  // pushes iPhones over the budget.
  const free = c => { c.width = c.height = 0; };
  // Fewer pixels make each height step steeper, so the strength scales with them.
  const normal = (h, strength) => { const n = normalFrom(h, strength * k); free(h); return n; };
  const make = (c, colour = true, repeat = true) => {
    const t = new THREE.CanvasTexture(c);
    if (colour) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = anisotropy;
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    // Once the GPU holds its copy the canvas is only memory. A lost context rebuilds every
    // texture from scratch, so nothing needs it again.
    t.onUpdate = () => { t.onUpdate = null; free(c); };
    return t;
  };
  // A surface that could not be drawn renders in its flat colour rather than stopping the 3D.
  const flat = hex => {
    if (!hex) return {map: null, normalMap: null, roughness: .8, size: [1, 1]};
    const t = new THREE.DataTexture(new Uint8Array([...rgb(hex), 255]), 1, 1);
    t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true;
    // The SVG renderer reads this to colour the material, as it draws no textures.
    t.userData.hex = hex;
    return {map: t, normalMap: null, roughness: .8, size: [1, 1]};
  };
  const memo = (key, hex, build) => {
    let entry = cache.get(key);
    if (!entry) {
      let value;
      if (flatOnly) value = flat(hex);
      else try { value = build(); } catch (err) { failures++; console.warn('Texture drawn flat:', key, err); value = flat(hex); }
      entry = {value, used: gen};
      cache.set(key, entry);
    }
    entry.used = gen;
    return entry.value;
  };
  const release = pair => { for (const t of [pair.map, pair.normalMap]) t?.dispose(); };
  // UVs are metres, so a tile covering `size` metres repeats every `size`.
  const set = (pair, sx, sy) => {
    for (const t of [pair.map, pair.normalMap].filter(Boolean)) t.repeat.set(1 / sx, 1 / sy);
    return {...pair, size: [sx, sy]};
  };

  /**
   * Coated steel sheet in one of Biohort's colours. `profile` is the wall's pressing, in metres:
   *   {type: 'rib', pitch, rib}         embossed vertical ribs (HighLine, AvantGarde, Panorama walls)
   *   {type: 'trapezoid', pitch, crest} trapezoid corrugation (Europa walls and roofs)
   *   {type: 'groove', pitch, groove}   flat sheet with fine pressed grooves (door leaves, Neo)
   *   {type: 'smooth'}                  plain sheet (CasaNova cassettes, fascias, trims)
   * Metallic paint: fine flake speckle and a soft sheen across the sheet, never a mirror.
   */
  function steel(hex, profile = {type: 'smooth'}, horizontal = false) {
    const key = `steel:${hex}:${JSON.stringify(profile)}:${horizontal}`;
    return memo(key, hex, () => {
      const base = rgb(hex), rand = seeded(hashSeed(key));
      // One tile covers whole repeats of the pressing, so ribs stay at their true pitch.
      let tile, marks = [];
      if (profile.type === 'groups') {
        tile = profile.count * profile.pitch + profile.gap;
        for (let i = 0; i < profile.count; i++) marks.push(profile.gap / 2 + i * profile.pitch + profile.pitch / 2);
      } else if (profile.type === 'smooth') tile = 1;
      else { const n = Math.max(1, Math.round(1 / profile.pitch)); tile = profile.pitch * n; for (let i = 0; i < n; i++) marks.push(i * profile.pitch + profile.pitch / 2); }
      const S = 512, px = S / tile;
      const c = canvas(S), h = canvas(S), ctx = c.getContext('2d'), hctx = h.getContext('2d');
      if (horizontal) for (const k of [ctx, hctx]) { k.translate(S, 0); k.rotate(Math.PI / 2); }
      ctx.fillStyle = shade(base, 1); ctx.fillRect(0, 0, S, S);
      hctx.fillStyle = '#808080'; hctx.fillRect(0, 0, S, S);
      for (const m of marks) {
        const x = m * px;
        if (profile.type === 'rib' || profile.type === 'groups') {
          // A narrow raised rib: a highlight on its lit shoulder and a fine shadow on the other.
          const w = Math.max(2, (profile.rib || .012) * px);
          const g = hctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
          g.addColorStop(0, '#808080'); g.addColorStop(.3, '#d8d8d8'); g.addColorStop(.7, '#d8d8d8'); g.addColorStop(1, '#808080');
          hctx.fillStyle = g; hctx.fillRect(x - w / 2, 0, w, S);
          ctx.fillStyle = shade(base, 1.1); ctx.fillRect(x - w / 2, 0, w * .4, S);
          ctx.fillStyle = shade(base, .86); ctx.fillRect(x + w * .1, 0, w * .4, S);
        } else if (profile.type === 'trapezoid') {
          const crest = (profile.crest || .03) * px, flank = (profile.flank || .012) * px, x0 = x - crest / 2 - flank;
          const g = hctx.createLinearGradient(x0, 0, x0 + crest + 2 * flank, 0);
          g.addColorStop(0, '#606060'); g.addColorStop(flank / (crest + 2 * flank), '#c8c8c8'); g.addColorStop(1 - flank / (crest + 2 * flank), '#c8c8c8'); g.addColorStop(1, '#606060');
          hctx.fillStyle = g; hctx.fillRect(x0, 0, crest + 2 * flank, S);
          ctx.fillStyle = shade(base, 1.08); ctx.fillRect(x0, 0, flank, S);
          ctx.fillStyle = shade(base, .9); ctx.fillRect(x0 + flank + crest, 0, flank, S);
        } else if (profile.type === 'groove') {
          // A fine pressed seam, a shadow line with a highlight beside it.
          const w = Math.max(1.5, (profile.groove || .003) * px);
          hctx.fillStyle = '#404040'; hctx.fillRect(x - w / 2, 0, w, S);
          ctx.fillStyle = shade(base, .72); ctx.fillRect(x - w / 2, 0, w, S);
          ctx.fillStyle = shade(base, 1.07); ctx.fillRect(x + w / 2, 0, 1.2, S);
        }
      }
      // Metallic paint: an even, fine flake, never patchy, so tiles never show.
      const img = ctx.getImageData(0, 0, c.width, c.height), d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const f = rand(), v = f > .992 ? 14 : f < .008 ? -10 : (rand() - .5) * 4;
        d[i] = clamp(d[i] + v); d[i + 1] = clamp(d[i + 1] + v); d[i + 2] = clamp(d[i + 2] + v);
      }
      ctx.putImageData(img, 0, 0);
      return set({map: make(c), normalMap: make(normal(h, profile.type === 'smooth' ? .2 : 2.4), false), roughness: .38}, tile, tile);
    });
  }

  /** Spaced capitals on a clear ground, for lettering milled into a fascia. */
  function lettering(text) {
    return memo('letters:' + text, null, () => {
      const c = canvas(1024, 128), ctx = c.getContext('2d');
      ctx.clearRect(0, 0, 1024, 128);
      ctx.fillStyle = '#ffffff'; ctx.font = '600 92px system-ui, Helvetica, Arial, sans-serif'; ctx.textBaseline = 'middle';
      const letters = [...text], gap = 1024 / (letters.length + .5);
      letters.forEach((ch, i) => { ctx.textAlign = 'center'; ctx.fillText(ch, gap * (i + .75), 66); });
      return {map: make(c, true, false), normalMap: null, roughness: .5};
    });
  }

  /** Clear acrylic glazing: faint streaks so it reads as a sheet, not a hole. */
  function acrylic() {
    return memo('acrylic', '#dfe9ee', () => {
      const c = canvas(256), ctx = c.getContext('2d'), rand = seeded(91);
      ctx.fillStyle = '#eef3f5'; ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,255,255,${.05 + rand() * .12})`; ctx.fillRect(rand() * 256, 0, 2 + rand() * 10, 256); }
      return set({map: make(c), normalMap: null, roughness: .08}, .6, .6);
    });
  }

  /** Biohort's aluminium floor panels: a pressed grid of raised squares. */
  function aluFloor() {
    return memo('alufloor', '#c3c6c8', () => {
      const S = 512, cell = .025, tile = cell * 16, px = S / tile;
      const c = canvas(S), h = canvas(S), ctx = c.getContext('2d'), hctx = h.getContext('2d');
      ctx.fillStyle = '#c3c6c8'; ctx.fillRect(0, 0, S, S); hctx.fillStyle = '#505050'; hctx.fillRect(0, 0, S, S);
      for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) {
        const x = i * cell * px, y = j * cell * px, w = cell * px * .72;
        hctx.fillStyle = '#d8d8d8'; hctx.fillRect(x + 2, y + 2, w, w);
        ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x + 2, y + 2, w, 2);
        ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(x + 2, y + 2 + w - 2, w, 2);
      }
      speckle(c, 10, 63);
      return set({map: make(c), normalMap: make(normal(h, 2), false), roughness: .45}, tile, tile);
    });
  }

  /** A cast concrete slab or strip foundation, lightly mottled. */
  function concrete() {
    return memo('concrete', '#b9b6af', () => {
      const c = canvas(512), ctx = c.getContext('2d'), rand = seeded(13);
      ctx.fillStyle = '#b9b6af'; ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 2600; i++) { ctx.fillStyle = `rgba(${rand() < .5 ? '90,88,84' : '220,218,212'},${.05 + rand() * .1})`; ctx.beginPath(); ctx.arc(rand() * 512, rand() * 512, 1 + rand() * 6, 0, 6.283); ctx.fill(); }
      const h = canvas(256); h.getContext('2d').fillStyle = '#808080'; h.getContext('2d').fillRect(0, 0, 256, 256); speckle(h, 40, 7);
      return set({map: make(c), normalMap: make(normal(h, 1), false), roughness: .95}, 1.2, 1.2);
    });
  }

  /** Three-layer plywood (CasaNova's ceiling): pale birch with soft grain. */
  function plywood() {
    return memo('plywood', '#d8c39d', () => {
      const S = 512, c = canvas(S), ctx = c.getContext('2d'), rand = seeded(29), base = rgb('#d8c39d');
      ctx.fillStyle = shade(base, 1); ctx.fillRect(0, 0, S, S);
      for (let i = 0; i < 70; i++) {
        ctx.strokeStyle = shade(base, .82 + rand() * .2); ctx.globalAlpha = .25 + rand() * .3; ctx.lineWidth = 1 + rand() * 2;
        const y0 = rand() * S, a = 4 + rand() * 10, k = 1 + Math.floor(rand() * 3);
        ctx.beginPath(); for (let x = 0; x <= S; x += 8) { const y = y0 + a * Math.sin(6.283 * k * x / S + i); if (x) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.stroke();
      }
      ctx.globalAlpha = 1; speckle(c, 6, 31);
      return set({map: make(c), normalMap: null, roughness: .7}, 1.25, 1.25);
    });
  }

  /** EPDM roof membrane: dark, faintly granular rubber. */
  function epdm() {
    return memo('epdm', '#2d2f30', () => {
      const rand = seeded(3), c = canvas(512), h = canvas(512), ctx = c.getContext('2d');
      ctx.fillStyle = '#2d2f30'; ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 6000; i++) { ctx.fillStyle = `rgba(${rand() < .5 ? '0,0,0' : '90,92,94'},.18)`; ctx.fillRect(rand() * 512, rand() * 512, 2, 2); }
      h.getContext('2d').fillStyle = '#808080'; h.getContext('2d').fillRect(0, 0, 512, 512); speckle(h, 30, 3);
      return set({map: make(c), normalMap: make(normal(h, 1), false), roughness: .88}, 1.2, 1.2);
    });
  }
  /** Lawn, with mown stripes and blade speckle. */
  function lawn() {
    return memo('lawn', '#6a8649', () => {
      const rand = seeded(17), c = canvas(PX), ctx = c.getContext('2d');
      ctx.fillStyle = '#6a8649'; ctx.fillRect(0, 0, PX, PX);
      for (let s = 0; s < 2; s++) { ctx.fillStyle = s % 2 ? 'rgba(255,255,230,.025)' : 'rgba(20,40,0,.025)'; ctx.fillRect(0, s * PX / 2, PX, PX / 2); }
      for (let i = 0; i < 90000; i++) {
        const g = rand();
        ctx.fillStyle = g < .45 ? 'rgba(46,72,30,.55)' : g < .85 ? 'rgba(125,152,86,.5)' : 'rgba(170,180,110,.45)';
        const x = rand() * PX, y = rand() * PX;
        ctx.fillRect(x, y, 1.3, 2.6 + rand() * 3);
      }
      const h = canvas(512); h.getContext('2d').fillStyle = '#808080'; h.getContext('2d').fillRect(0, 0, 512, 512); speckle(h, 90, 21);
      return set({map: make(c), normalMap: make(normal(h, 1.4), false), roughness: .95}, 3, 3);
    });
  }

  /** Riven paving slabs for the path and patio. */
  function paving() {
    return memo('paving', '#c8c4ba', () => {
      const rand = seeded(5), c = canvas(512), h = canvas(512), ctx = c.getContext('2d'), hctx = h.getContext('2d');
      ctx.fillStyle = '#8f8b82'; ctx.fillRect(0, 0, 512, 512); hctx.fillStyle = '#000'; hctx.fillRect(0, 0, 512, 512);
      const n = 2, s = 512 / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const f = .9 + rand() * .18;
        ctx.fillStyle = `rgb(${200 * f},${196 * f},${186 * f})`; ctx.fillRect(i * s + 3, j * s + 3, s - 6, s - 6);
        hctx.fillStyle = '#d8d8d8'; hctx.fillRect(i * s + 3, j * s + 3, s - 6, s - 6);
      }
      speckle(c, 22, 8); speckle(h, 40, 9);
      return set({map: make(c), normalMap: make(normal(h, 2), false), roughness: .9}, 1.2, 1.2);
    });
  }

  function gravel() {
    return memo('gravel', '#a49d90', () => {
      const rand = seeded(23), c = canvas(512), h = canvas(512), ctx = c.getContext('2d'), hctx = h.getContext('2d');
      ctx.fillStyle = '#a49d90'; ctx.fillRect(0, 0, 512, 512); hctx.fillStyle = '#202020'; hctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 9000; i++) {
        const x = rand() * 512, y = rand() * 512, r = 1.5 + rand() * 3.5, f = .7 + rand() * .5;
        ctx.fillStyle = `rgb(${190 * f},${182 * f},${168 * f})`; ctx.beginPath(); ctx.ellipse(x, y, r, r * .8, rand() * 3, 0, 6.283); ctx.fill();
        hctx.fillStyle = `rgb(${200 * f},${200 * f},${200 * f})`; hctx.beginPath(); hctx.ellipse(x, y, r, r * .8, 0, 0, 6.283); hctx.fill();
      }
      return set({map: make(c), normalMap: make(normal(h, 2.2), false), roughness: 1}, .8, .8);
    });
  }

  return {
    steel, acrylic, aluFloor, concrete, lawn, paving, gravel, plywood, epdm, lettering,
    /** Starts a rebuild: textures the new room does not ask for become free to prune. */
    begin() { gen++; },
    /**
     * Frees the least recently used textures beyond `limit`. Never one the current room uses,
     * and never the lawn, which the garden keeps for the life of the scene.
     */
    prune(limit) {
      const old = [...cache].filter(([key, e]) => e.used < gen && key !== 'lawn').sort((a, b) => a[1].used - b[1].used);
      for (const [key, e] of old) {
        if (cache.size <= limit) break;
        release(e.value); cache.delete(key);
      }
    },
    stats: () => ({textures: cache.size, failures, scale: k}),
    dispose() { for (const e of cache.values()) release(e.value); cache.clear(); }
  };
}
