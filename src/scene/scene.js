// The 3D preview: renderer, garden setting, cameras, focus and highlight, captures for the PDF.
// The building itself comes from building.js; textures are procedural (textures.js).
// Adapted from the SMART configurator's scene (same boot ladder, tiers and diagnostics); the
// OutlinePass highlight is replaced by a tint-and-edges overlay that draws on every tier,
// including WebGL1, the safe Lambert tier and the SVG fallback.
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {buildRoom, extents, geom, canopyWidth, holeOf} from './building.js';
import {createTextures} from './textures.js';
import {FlatSVGRenderer} from './svg.js';
import {mainDoor} from '../catalog.js';

// The highlight: a clear blue that reads over grey steel, green lawn and the white interior.
const SIGNAL = new THREE.Color('#2f7fd8');
const ease = t => 1 - Math.pow(1 - t, 3);

// What each device class can afford. Phones share one memory budget across every tab of the
// site and drop WebGL when it runs out, so they get quarter-memory textures, a lower pixel
// ratio and smaller PDF renders. `low` is for a second attempt after a lost context and for
// WebGL1 devices: no post-processing and cheaper shadows. `safe` is for a GPU whose full shaders
// fail or draw nothing: simple Lambert shading, no shadows, no reflections, no antialiasing.
// `svg` is for a browser with no usable WebGL at all: the same scene, flat-shaded, drawn as SVG.
export const TIERS = {
  high: {ratio: 2, textures: 1, shadow: 2048, softShadows: true, outline: true, antialias: true, capture: 1800, cache: 40},
  medium: {ratio: 1.5, textures: .5, shadow: 1024, softShadows: true, outline: true, antialias: true, capture: 1440, cache: 18},
  low: {ratio: 1.25, textures: .5, shadow: 1024, softShadows: false, outline: false, antialias: true, capture: 1200, cache: 14},
  safe: {ratio: 1, textures: .5, shadow: 0, softShadows: false, outline: false, antialias: false, capture: 1200, cache: 14, simple: true},
  svg: {ratio: 1, textures: .5, shadow: 0, softShadows: false, outline: false, antialias: false, capture: 1600, cache: 40}
};

/**
 * Builds the preview in `container`. Failures carry `err.stage`: 'context' when no WebGL context
 * could be made, 'setup' for anything after that. Either way nothing is left behind: a context
 * that exists is lost on purpose and its canvas removed, because a leaked context still counts
 * against the browser's cap and makes the next attempt fail for the wrong reason.
 */
export function createScene(container, options = {}) {
  const tier = TIERS[options.tier] ? options.tier : 'high', T = TIERS[tier];
  let renderer;
  if (tier === 'svg') renderer = new FlatSVGRenderer();
  else {
    const canvas = document.createElement('canvas');
    try {
      renderer = new THREE.WebGLRenderer({canvas, antialias: T.antialias, preserveDrawingBuffer: false, powerPreference: tier === 'high' ? 'high-performance' : 'default'});
    } catch (err) {
      releaseContext(canvas);
      throw staged(err, 'context');
    }
  }
  const undo = [];
  try {
    return setupScene(container, renderer, {...options, tier}, undo);
  } catch (err) {
    for (const f of undo.reverse()) { try { f(); } catch {} }
    try { renderer.dispose(); } catch {}
    if (renderer.isWebGLRenderer) { try { renderer.forceContextLoss(); } catch {} }
    renderer.domElement.remove();
    container.querySelectorAll('.scene-overlay').forEach(el => el.remove());
    throw staged(err, 'setup');
  }
}
function staged(err, stage) {
  const e = err instanceof Error ? err : new Error(String(err));
  e.stage = e.stage || stage;
  return e;
}
// The constructor can throw after it made a context. Asking again returns that same context, or
// makes one we drop at once; either way none stays alive.
function releaseContext(canvas) {
  for (const type of ['webgl2', 'webgl']) {
    try {
      const gl = canvas.getContext(type);
      if (gl) { gl.getExtension('WEBGL_lose_context')?.loseContext(); return; }
    } catch {}
  }
}

function setupScene(container, renderer, {onLost = () => {}, onBroken = () => {}, onVerified = () => {}, onPick = () => {}, onViewChange = () => {}, tier}, undo) {
  const T = TIERS[tier];
  const svg = tier === 'svg', simple = Boolean(T.simple);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let ratio = Math.min(window.devicePixelRatio || 1, T.ratio);
  renderer.setPixelRatio(ratio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .96;
  renderer.shadowMap.enabled = !svg && !simple;
  renderer.shadowMap.type = T.softShadows ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
  // Some GPUs make a context and then fail to link the shaders, drawing nothing at all. Every
  // failure is kept for ?debug3d; any one means surfaces are missing, so the page steps down.
  let broken = null, verified = false;
  const shaderErrors = [];
  if (!svg) {
    renderer.debug.onShaderError = (gl, program, vertex, fragment) => {
      const log = [gl.getProgramInfoLog(program), gl.getShaderInfoLog(vertex), gl.getShaderInfoLog(fragment)].filter(Boolean).join(' | ').replace(/\s+/g, ' ').slice(0, 300);
      shaderErrors.push(log || 'link failed, no log');
      console.warn('A 3D shader failed to link on this GPU:', log);
      if (!broken) { broken = 'shader'; if (verified) setTimeout(() => { if (!disposed && !lost) onBroken('shader'); }); }
    };
  }
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', 'Interactive 3D preview of your Biohort building. Drag to look around, scroll or pinch to zoom.');
  container.appendChild(renderer.domElement);
  const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  overlay.setAttribute('class', 'scene-overlay');
  overlay.setAttribute('aria-hidden', 'true');
  container.appendChild(overlay);

  const scene = new THREE.Scene();
  const tex = createTextures(renderer, {scale: T.textures, flat: svg});
  undo.push(() => tex.dispose());
  let envMap = null;
  if (!svg && !simple) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    envMap = pmrem.fromScene(new RoomEnvironment(), .04).texture;
    pmrem.dispose();
  }
  scene.environment = envMap;
  // Three.js r162 (the WebGL1 build) has no scene-wide environment intensity, so there each
  // material's own intensity is scaled instead.
  const nativeEnvIntensity = 'environmentIntensity' in scene;
  function setEnvironmentIntensity(v) {
    scene.environmentIntensity = v;
    if (nativeEnvIntensity) return;
    scene.traverse(o => {
      for (const m of o.material ? [].concat(o.material) : []) {
        if (!('envMapIntensity' in m)) continue;
        if (m.userData.envBase === undefined) m.userData.envBase = m.envMapIntensity;
        m.envMapIntensity = m.userData.envBase * v;
      }
    });
  }
  setEnvironmentIntensity(.55);

  // Sky: a soft vertical gradient behind a garden that fades into it.
  const sky = (top, horizon, ground) => {
    const c = document.createElement('canvas'); c.width = 4; c.height = 512;
    const g = c.getContext('2d').createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, top); g.addColorStop(.55, horizon); g.addColorStop(1, ground);
    const ctx = c.getContext('2d'); ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 512);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const daySky = svg ? new THREE.Color('#d3e0e6') : sky('#a9c4d6', '#dfe8ea', '#e3e9e5');
  const duskSky = svg ? new THREE.Color('#3a4258') : sky('#1c2a40', '#5b5d73', '#2d332f');
  scene.background = daySky;
  scene.fog = new THREE.Fog('#e3e9e5', 16, 46);

  const hemi = new THREE.HemisphereLight('#e4eef6', '#71805b', 1.05);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff0da', 2.7);
  sun.position.set(-7, 10, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(T.shadow, T.shadow);
  sun.shadow.bias = -.0002; sun.shadow.normalBias = .02; sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight('#d9e6f2', .55);
  fill.position.set(8, 5, -6);
  scene.add(fill);
  // Daylight through the glazing: a soft fill inside the room, so the plastered walls and ceiling
  // read grey white, as in Biohort's interior photos. Placed by update(); no shadows.
  // No falloff (decay 0): an even daylight fill, without a hotspot or rings on the plaster.
  const inner = new THREE.PointLight('#fff6ea', 0, 0, 0);
  inner.castShadow = false;
  scene.add(inner);

  // Garden: lawn, a gravel margin, a path to the door, shrubs and a fence line behind.
  const garden = new THREE.Group();
  scene.add(garden);
  const lawnTex = tex.lawn();
  const lawn = new THREE.Mesh(new THREE.CircleGeometry(60, 64), new THREE.MeshStandardMaterial({map: lawnTex.map, normalMap: lawnTex.normalMap, roughness: .95, color: '#ffffff'}));
  lawn.rotation.x = -Math.PI / 2; lawn.receiveShadow = true; lawn.userData.ground = true;
  lawn.geometry.attributes.uv.array.forEach((v, i, a) => { a[i] = (v - .5) * 120; });
  garden.add(lawn);

  const camera = new THREE.PerspectiveCamera(35, 1, .05, 200);
  const controls = new OrbitControls(camera, renderer.domElement);
  undo.push(() => controls.dispose());
  // SVG frames are slow; damping would keep drawing them after the finger lifts.
  controls.enableDamping = !reducedMotion.matches && !svg;
  controls.dampingFactor = .09;
  controls.rotateSpeed = .6;
  controls.zoomSpeed = .8;
  controls.enablePan = false;

  // Highlight: a translucent tint over the changed part plus its outline edges, in a group of
  // its own so it never touches the room's materials. Plain materials only, so it draws on every
  // tier: WebGL1, the safe Lambert tier and (the tint) the SVG fallback.
  const hl = new THREE.Group();
  hl.name = 'highlight';
  scene.add(hl);
  const hlFill = new THREE.MeshBasicMaterial({color: SIGNAL, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4});
  const hlLine = new THREE.LineBasicMaterial({color: SIGNAL, transparent: true, opacity: 0});
  let selected = [], hlMeshes = null, hlStrength = 0;
  function rebuildHighlight() {
    for (const o of [...hl.children]) { hl.remove(o); if (o.isLineSegments) o.geometry.dispose(); }
    hlMeshes = selected;
    for (const m of selected) {
      m.updateWorldMatrix(true, false);
      const fill = new THREE.Mesh(m.geometry, hlFill);
      fill.matrixAutoUpdate = false; fill.matrix.copy(m.matrixWorld); fill.renderOrder = 3;
      hl.add(fill);
      if (!svg) {
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 35), hlLine);
        edges.matrixAutoUpdate = false; edges.matrix.copy(m.matrixWorld); edges.renderOrder = 4;
        hl.add(edges);
      }
    }
  }

  let state = null, room = null, env = null, disposed = false, frame = 0, night = false;
  let view = 'outside', anim = null, pulse = null, persistent = [], persistentTags = [], lightRig = [];
  let groundExtras = null;
  let size = {w: 1, h: 1};
  const look = {fov: 35};

  // The hedge closes the view from the front; seen from behind it would only block the room.
  function hedgeFor(cam) {
    const h = groundExtras?.userData.hedge;
    if (h) h.visible = cam.position.z > h.userData.z + .6;
  }
  function disposeObject(o) {
    o.traverse(m => { if (m.geometry) m.geometry.dispose(); });
  }

  function landscaping(s, extents) {
    if (groundExtras) { garden.remove(groundExtras); disposeObject(groundExtras); groundExtras.userData.mats?.forEach(m => m.dispose()); }
    const g = new THREE.Group(); groundExtras = g; garden.add(g);
    const mats = [];
    const mk = (pair, colour = '#ffffff', rough = .9) => { const m = new THREE.MeshStandardMaterial({color: colour, map: pair?.map || null, normalMap: pair?.normalMap || null, roughness: rough}); mats.push(m); return m; };
    const gravel = mk(tex.gravel()), paving = mk(tex.paving());
    const G = geom(s), w = G.ww, d = G.wd, {x0, x1, z0, z1} = extents;
    // Gravel margin around the building and its canopies.
    const gw = x1 - x0 + .9, gd = z1 - z0 + .9;
    const gv = new THREE.Mesh(new THREE.PlaneGeometry(gw, gd), gravel);
    gv.rotation.x = -Math.PI / 2; gv.position.set((x0 + x1) / 2, .004, (z0 + z1) / 2); gv.receiveShadow = true; gv.userData.ground = true;
    const uv = gv.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * gw, uv.getY(i) * gd);
    g.add(gv);
    // Stepping-stone path from the door into the garden (doors on the front only; side doors keep
    // the gravel).
    const md = mainDoor(s);
    const px = md.wall === 'front' ? md.p * w - w / 2 : 0;
    for (let i = 0; i < 4 && md.wall === 'front'; i++) {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(.9, .04, .6), paving);
      slab.position.set(px + Math.sin(i * 1.3) * .08, .02, z1 + .55 + i * .82); slab.receiveShadow = slab.castShadow = true; slab.userData.ground = true;
      const u2 = slab.geometry.attributes.uv; for (let k = 0; k < u2.count; k++) u2.setXY(k, u2.getX(k) * .9, u2.getY(k) * .6);
      g.add(slab);
    }
    // Shrubs and a fence give scale without stealing focus.
    const leafMat = new THREE.MeshStandardMaterial({color: '#4d6e3f', roughness: .9}); mats.push(leafMat);
    const leafMat2 = new THREE.MeshStandardMaterial({color: '#6c8a4f', roughness: .9}); mats.push(leafMat2);
    const rand = (() => { let v = 7; return () => (v = (v * 16807) % 2147483647) / 2147483647; })();
    const shrub = (x, z, s0) => {
      const sg = new THREE.Group(); sg.position.set(x, 0, z); g.add(sg);
      for (let i = 0; i < 7; i++) {
        const m = new THREE.Mesh(new THREE.IcosahedronGeometry(.28 * s0 * (.7 + rand() * .5), 1), i % 2 ? leafMat : leafMat2);
        m.position.set((rand() - .5) * .5 * s0, .25 * s0 + rand() * .35 * s0, (rand() - .5) * .5 * s0);
        m.castShadow = m.receiveShadow = true; sg.add(m);
      }
    };
    shrub(x0 - .9, -d / 2 + .3, 1.2); shrub(x1 + .9, -d / 2 + .6, 1); shrub(x0 - .7, Math.min(d / 2 - .2, z1 - .4), .8);
    // A clipped hedge well behind the room closes the view without competing with it.
    const hedge = new THREE.MeshStandardMaterial({color: '#3f5a35', roughness: .95}); mats.push(hedge);
    const hz = Math.min(-d / 2 - 3.6, extents.z0 - 2.2);
    const hedgeGroup = new THREE.Group(); hedgeGroup.userData.z = hz; g.add(hedgeGroup); g.userData.hedge = hedgeGroup;
    for (let x = x0 - 4; x < x1 + 4; x += .9) {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(.75 + rand() * .2, 1), x % 2 ? hedge : leafMat);
      m.scale.set(1, 1.35 + rand() * .2, .8); m.position.set(x, .85, hz + (rand() - .5) * .3);
      m.castShadow = m.receiveShadow = true; hedgeGroup.add(m);
    }
    g.userData.mats = mats;
  }

  // Safe tier: swap physically based materials for Lambert ones (colour and texture kept, no
  // normal maps, no reflections). Their shaders are a fraction of the size, which is what a GPU
  // that could not link the full ones needs.
  const simpler = new WeakMap();
  function simplify(root, owned) {
    const swap = m => {
      if (!m?.isMeshStandardMaterial) return m;
      let l = simpler.get(m);
      if (!l) {
        l = new THREE.MeshLambertMaterial({
          color: m.color, map: m.map, emissive: m.emissive, emissiveIntensity: m.emissiveIntensity,
          transparent: m.transparent, opacity: m.opacity, side: m.side, depthWrite: m.depthWrite, visible: m.visible,
          polygonOffset: m.polygonOffset, polygonOffsetFactor: m.polygonOffsetFactor, polygonOffsetUnits: m.polygonOffsetUnits
        });
        l.name = m.name; l.userData = m.userData;
        simpler.set(m, l); owned?.push(l);
      }
      return l;
    };
    root.traverse(o => { if (o.isMesh) o.material = Array.isArray(o.material) ? o.material.map(swap) : swap(o.material); });
  }

  // SVG has no textures: give each textured material the colour its texture would have had.
  function flatColours() {
    scene.traverse(o => {
      for (const m of o.material ? [].concat(o.material) : []) {
        if (m.userData.flatColour || !m.map?.userData.hex) continue;
        m.color.multiply(new THREE.Color(m.map.userData.hex));
        m.userData.flatColour = true;
      }
    });
  }

  const extentsOf = s => extents(s);


  // ---- Lights for dusk: a few real lights where the room's lamps are -------------------------
  function rigLights(list) {
    for (const l of lightRig) { scene.remove(l); l.dispose?.(); }
    lightRig = [];
    if (!night) return;
    const interior = list.filter(l => l.kind === 'interior').slice(0, 4);
    for (const l of interior) {
      const p = new THREE.PointLight('#ffd8a8', 5 * (l.power || 1), 7, 1.6);
      p.position.copy(l.position); scene.add(p); lightRig.push(p);
    }
    const outside = list.filter(l => l.kind !== 'interior').slice(0, 5);
    for (const l of outside) {
      if (l.kind === 'down' || l.kind === 'updown') {
        const s = new THREE.SpotLight('#ffcf94', 6, 4.5, .75, .65, 1.4);
        s.position.copy(l.position); s.target.position.copy(l.position).add(new THREE.Vector3(0, -2, .25));
        scene.add(s, s.target); lightRig.push(s, s.target);
        if (l.kind === 'updown') {
          const u = new THREE.SpotLight('#ffcf94', 3, 2.2, .5, .7, 1.4);
          u.position.copy(l.position); u.target.position.copy(l.position).add(new THREE.Vector3(0, 2, 0));
          scene.add(u, u.target); lightRig.push(u, u.target);
        }
      } else {
        const p = new THREE.PointLight('#ffc98a', 2.5, 4, 1.8); p.position.copy(l.position); scene.add(p); lightRig.push(p);
      }
    }
  }

  function applyLighting() {
    scene.background = night ? duskSky : daySky;
    scene.fog.color.set(night ? '#2f3534' : '#e3e9e5');
    hemi.intensity = night ? .14 : 1.05;
    hemi.color.set(night ? '#5b6f96' : '#e4eef6');
    sun.intensity = night ? .18 : 2.7;
    sun.color.set(night ? '#9fb4ff' : '#fff0da');
    fill.intensity = night ? .05 : .9;
    inner.intensity = night ? 0 : svg ? .25 : .55;
    inner.distance = 0;
    setEnvironmentIntensity(night ? .07 : .55);
    renderer.toneMappingExposure = night ? 1.2 : .96;
    // Flat shading has no tone mapping: light it as plain Lambert, sky plus one sun.
    if (svg) { hemi.intensity = night ? .35 : 1.25; sun.intensity = night ? .08 : .55; fill.intensity = night ? .02 : .12; }
    room?.group.traverse(o => {
      if (o.isMesh && o.userData.tags?.includes('lamp')) { o.material.emissiveIntensity = night ? 4 : .35; }
    });
    rigLights(room?.lights || []);
  }

  function fitShadow(ext) {
    const r = Math.max(ext.x1 - ext.x0, ext.z1 - ext.z0) / 2 + 2.5;
    const cam = sun.shadow.camera;
    cam.left = -r; cam.right = r; cam.top = r; cam.bottom = -r; cam.near = 1; cam.far = 40;
    cam.updateProjectionMatrix();
    sun.target.position.set((ext.x0 + ext.x1) / 2, 0, (ext.z0 + ext.z1) / 2);
  }

  // ---- Views -----------------------------------------------------------------------------
  const roomBox = () => {
    const e = extentsOf(state);
    return new THREE.Box3(new THREE.Vector3(e.x0 - .2, 0, e.z0 - .25), new THREE.Vector3(e.x1 + .2, e.top + .05, e.z1 + .1));
  };
  /** Distance at which a box fits the frame from a given direction. */
  function fitDistance(boxIn, dir, fov, aspect, margin = 1.1) {
    const c = boxIn.getCenter(new THREE.Vector3());
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize();
    if (right.lengthSq() < .1) right.set(1, 0, 0);
    const up = new THREE.Vector3().crossVectors(dir, right).normalize();
    const tanY = Math.tan(THREE.MathUtils.degToRad(fov / 2)), tanX = tanY * aspect;
    let dist = 0;
    for (const x of [boxIn.min.x, boxIn.max.x]) for (const y of [boxIn.min.y, boxIn.max.y]) for (const z of [boxIn.min.z, boxIn.max.z]) {
      const p = new THREE.Vector3(x, y, z).sub(c);
      const near = p.dot(dir);
      dist = Math.max(dist, near + Math.abs(p.dot(right)) / tanX * margin, near + Math.abs(p.dot(up)) / tanY * margin);
    }
    return dist;
  }

  function insideViewpoint(lookAt = null) {
    const G = geom(state), iw = G.iw, id = G.id, md = mainDoor(state);
    const eye = Math.min(1.55, G.top - G.B - .15) + G.floorY;
    // Stand just inside the door at eye height, looking across the building.
    const L = md.wall === 'front' || md.wall === 'back' ? G.ww : G.wd, c = md.p * L;
    let pos, at;
    if (md.wall === 'front') { const x = THREE.MathUtils.clamp(c - G.ww / 2, -iw / 2 + .35, iw / 2 - .35); pos = new THREE.Vector3(x, eye, Math.max(-id / 2 + .3, id / 2 - .25)); at = new THREE.Vector3(-x * .35, G.floorY + 1.0, -id / 2); }
    else if (md.wall === 'back') { const x = THREE.MathUtils.clamp(G.ww / 2 - c, -iw / 2 + .35, iw / 2 - .35); pos = new THREE.Vector3(x, eye, Math.min(id / 2 - .3, -id / 2 + .25)); at = new THREE.Vector3(-x * .35, G.floorY + 1.0, id / 2); }
    else if (md.wall === 'left') { const z = THREE.MathUtils.clamp(-G.wd / 2 + c, -id / 2 + .35, id / 2 - .35); pos = new THREE.Vector3(Math.min(iw / 2 - .3, -iw / 2 + .25), eye, z); at = new THREE.Vector3(iw / 2, G.floorY + 1.0, -z * .35); }
    else { const z = THREE.MathUtils.clamp(G.wd / 2 - c, -id / 2 + .35, id / 2 - .35); pos = new THREE.Vector3(Math.max(-iw / 2 + .3, iw / 2 - .25), eye, z); at = new THREE.Vector3(-iw / 2, G.floorY + 1.0, -z * .35); }
    return {pos, at: lookAt || at};
  }

  function poseFor(name, opts = {}) {
    const aspect = size.w / size.h;
    if (name === 'inside') {
      const {pos, at} = insideViewpoint(opts.lookAt);
      const dir = at.clone().sub(pos).normalize();
      return {view: 'inside', fov: aspect < .9 ? 84 : 74, position: pos, target: pos.clone().addScaledVector(dir, .02)};
    }
    if (name === 'plan') {
      const b = roomBox();
      b.max.y = 1;
      // Room for the dimension pills and wall names around the plan.
      b.expandByVector(new THREE.Vector3(.95, 0, .95));
      const c = b.getCenter(new THREE.Vector3());
      const dist = fitDistance(b, new THREE.Vector3(0, 1, .0001).normalize(), 30, aspect, 1.12);
      return {view: 'plan', fov: 30, position: new THREE.Vector3(c.x, dist + 1, c.z + .001), target: new THREE.Vector3(c.x, 0, c.z)};
    }
    const dir = (opts.dir || new THREE.Vector3(-.62, .2, 1)).clone().normalize();
    const b = opts.box || roomBox();
    const c = b.getCenter(new THREE.Vector3());
    // Just above eye level, as in Biohort's product photographs, so the roof line reads.
    if (!opts.box) c.y = Math.min(c.y, 1.15);
    const fov = 35;
    const dist = Math.max(opts.minDistance || 0, fitDistance(b, dir, fov, aspect, opts.margin || (opts.box ? 1.08 : 1.2)));
    return {view: 'outside', fov, position: c.clone().addScaledVector(dir, dist), target: c};
  }

  function configureControls(name) {
    controls.enableRotate = name !== 'plan';
    controls.enablePan = name === 'plan';
    controls.screenSpacePanning = true;
    controls.enableZoom = name !== 'inside';
    if (name === 'outside') {
      controls.minPolarAngle = .12; controls.maxPolarAngle = 1.5;
      const ext = extentsOf(state);
      controls.minDistance = 2.2; controls.maxDistance = Math.max(ext.x1 - ext.x0, ext.z1 - ext.z0) * 3 + 12;
      controls.rotateSpeed = .6;
      controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
    } else if (name === 'inside') {
      controls.minPolarAngle = .5; controls.maxPolarAngle = 2.4;
      controls.minDistance = 0; controls.maxDistance = .05;
      controls.rotateSpeed = -.35;
    } else {
      controls.minDistance = 2; controls.maxDistance = 80;
      controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
      controls.touches.ONE = THREE.TOUCH.PAN;
    }
    if (name !== 'plan') controls.touches.ONE = THREE.TOUCH.ROTATE;
  }

  function applyViewVisibility() {
    if (!room) return;
    const hideRoof = view === 'plan';
    room.group.traverse(o => {
      const t = o.userData.tags;
      if (!t || !o.isMesh) return;
      if (['roof', 'ceiling', 'skylight', 'pv', 'led'].some(k => t.includes(k))) o.visible = !hideRoof;
    });
    renderOverlay();
  }

  function moveTo(pose, animate = true) {
    const changed = pose.view !== view;
    view = pose.view;
    configureControls(view);
    applyViewVisibility();
    const from = {position: camera.position.clone(), target: controls.target.clone(), fov: camera.fov};
    if (!animate || reducedMotion.matches || changed && (view === 'inside' || from.position.distanceTo(pose.position) > 60)) {
      camera.position.copy(pose.position); controls.target.copy(pose.target); camera.fov = pose.fov; camera.updateProjectionMatrix();
      anim = null; controls.update(); request();
    } else {
      anim = {start: performance.now(), duration: changed ? 700 : 650, from, to: pose};
      request();
    }
    if (changed) onViewChange(view);
  }

  // Interpolates around the target (not through the building) for orbit moves.
  function step(now) {
    if (!anim) return false;
    const t = Math.min(1, (now - anim.start) / anim.duration), k = ease(t);
    const target = anim.from.target.clone().lerp(anim.to.target, k);
    const a = new THREE.Spherical().setFromVector3(anim.from.position.clone().sub(anim.from.target));
    const b = new THREE.Spherical().setFromVector3(anim.to.position.clone().sub(anim.to.target));
    let dTheta = b.theta - a.theta;
    if (dTheta > Math.PI) dTheta -= 2 * Math.PI; if (dTheta < -Math.PI) dTheta += 2 * Math.PI;
    const s = new THREE.Spherical(a.radius + (b.radius - a.radius) * k, a.phi + (b.phi - a.phi) * k, a.theta + dTheta * k);
    camera.position.copy(target).add(new THREE.Vector3().setFromSpherical(s));
    controls.target.copy(target);
    camera.fov = anim.from.fov + (anim.to.fov - anim.from.fov) * k;
    camera.updateProjectionMatrix();
    if (t === 1) anim = null;
    return true;
  }

  // ---- Highlight -------------------------------------------------------------------------
  function meshesTagged(tags) {
    const list = [];
    room?.group.traverse(o => {
      if (o.isMesh && o.visible && o.userData.tags && tags.some(t => o.userData.tags.includes(t)) && !o.userData.tags.includes('glass')) list.push(o);
    });
    return list;
  }
  function boxOf(meshes) {
    const b = new THREE.Box3();
    for (const m of meshes) b.expandByObject(m);
    return b;
  }
  function setOutline() {
    selected = pulse ? pulse.meshes : persistent;
    if (selected !== hlMeshes) rebuildHighlight();
  }

  // ---- Render loop -----------------------------------------------------------------------
  function request() { if (!disposed && !lost && !frame) frame = requestAnimationFrame(render); }
  let frames = 0, lastError = null, lost = false, lastFrame = 0, slowFrames = 0;
  function render(now) {
    frame = 0; frames++;
    if (disposed || lost) return;
    adapt(now);
    const moving = step(now);
    const damped = controls.update();
    let pulsing = false;
    if (pulse) {
      // Time-based, but never shorter than ~40 drawn frames, so slow devices still see it.
      pulse.frames = (pulse.frames || 0) + 1;
      const t = Math.min((now - pulse.start) / 1000, pulse.frames / 13);
      // Two quick beats, then settle; persistent selections stay faintly tinted.
      hlStrength = t < 0 ? 0 : t < 1.6 ? .55 + .45 * Math.abs(Math.sin(t * Math.PI * 1.25)) : Math.max(0, 1 - (t - 1.6) / 1.4);
      if (t > 3) { pulse = null; setOutline(); }
      pulsing = true;
    } else hlStrength = persistent.length ? .5 : 0;
    hl.visible = hlStrength > 0 && selected.length > 0;
    hlFill.opacity = .34 * hlStrength;
    hlLine.opacity = Math.min(1, 1.1 * hlStrength);
    hedgeFor(camera);
    try { renderer.render(scene, camera); } catch (err) { lastError = String(err); }
    renderOverlay();
    if (!verified && !checked) verifyFrame();
    if (moving || damped || pulsing) request();
  }

  // A context that renders nothing is worse than none: read one sky pixel back from the first
  // frame. The sky is never near black, even at dusk, so black means the GPU drew nothing.
  // A context that renders nothing is worse than none. Read back three points (top, middle,
  // bottom) of the frame just drawn: sky, building and ground are never near black, even at
  // dusk. One driver hiccup is forgiven: black has to repeat over three frames to count.
  let checked = false, blankFrames = 0;
  const samples = [];
  function verifyFrame() {
    let blank = false;
    if (!svg && !broken) {
      try {
        const gl = renderer.getContext(), b = renderer.getDrawingBufferSize(new THREE.Vector2()), px = new Uint8Array(4);
        const read = [];
        for (const fy of [.92, .5, .08]) {
          gl.readPixels(b.x >> 1, Math.round(b.y * fy), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
          read.push([px[0], px[1], px[2]]);
        }
        samples.push(read);
        blank = read.every(([r, g, b2]) => r + g + b2 < 12);
        const err = gl.getError();
        if (err) glErrors.push(err);
      } catch (err) { samples.push(String(err)); }
    }
    if (blank && ++blankFrames < 3) { request(); return; }
    if (blank) broken = 'blank';
    checked = true;
    // Let this frame finish before the page tears the scene down.
    setTimeout(() => {
      if (disposed || lost) return;
      if (broken) onBroken(broken);
      else { verified = true; onVerified(); }
    });
  }
  const glErrors = [];

  // Slow GPUs: when continuous frames (a camera move, a pulse) average under ~20 per second,
  // step the pixel ratio down, never below 1. Fewer pixels is the cheapest win on a phone.
  function adapt(now) {
    const dt = now - lastFrame;
    lastFrame = now;
    if (!(dt > 0 && dt < 250)) return;
    slowFrames = dt > 50 ? slowFrames + 1 : Math.max(0, slowFrames - 2);
    if (slowFrames < 20 || ratio <= 1) return;
    slowFrames = 0;
    ratio = Math.max(1, Math.round((ratio - .25) * 4) / 4);
    renderer.setPixelRatio(ratio);
    size = {w: 0, h: 0};
    resize();
  }
  controls.addEventListener('change', request);
  controls.addEventListener('start', () => { anim = null; });

  // ---- Overlay: dimensions in plan view, wall names --------------------------------------
  let showDims = false;
  function project(v) {
    const p = v.clone().project(camera);
    return [(p.x + 1) / 2 * size.w, (1 - p.y) / 2 * size.h, p.z];
  }
  function renderOverlay() {
    if (!state || (!showDims && view !== 'plan')) { if (overlay.firstChild) overlay.innerHTML = ''; return; }
    const w = geom(state).ww, d = geom(state).wd, y = view === 'plan' ? .01 : .02, plan = view === 'plan';
    const ext = extentsOf(state), m = v => `${+v.toFixed(2)}m`, G = geom(state);
    const lines = [];
    const pill = (x, yy, label, cls = '') => {
      const wpx = Math.max(44, label.length * 7.4 + 18);
      lines.push(`<g class="pill ${cls}" transform="translate(${x.toFixed(1)} ${yy.toFixed(1)})"><rect x="${-wpx / 2}" y="-12" width="${wpx}" height="24" rx="12"/><text text-anchor="middle" dy="4">${label}</text></g>`);
    };
    const dim = (a, b, label, cls = '') => {
      const [x1, y1, z1] = project(a), [x2, y2, z2] = project(b);
      if (z1 > 1 || z2 > 1) return;
      const ang = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(ang) * 6, ny = Math.cos(ang) * 6;
      lines.push(`<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><line class="tick ${cls}" x1="${x1 - nx}" y1="${y1 - ny}" x2="${x1 + nx}" y2="${y1 + ny}"/><line class="tick ${cls}" x1="${x2 - nx}" y1="${y2 - ny}" x2="${x2 + nx}" y2="${y2 + ny}"/>`);
      pill((x1 + x2) / 2, (y1 + y2) / 2, label, cls);
    };
    const V3 = (x, z) => new THREE.Vector3(x, y, z);
    // Overall size including the roof, and the walls' own size, as Biohort's data sheets give them.
    dim(V3(-G.W / 2, ext.z1 + .45), V3(G.W / 2, ext.z1 + .45), `${m(G.W)} roof`);
    dim(V3(ext.x1 + .45, G.D / 2), V3(ext.x1 + .45, -G.D / 2), `${m(G.D)} roof`);
    if (plan) {
      dim(V3(-w / 2, ext.z1 + .95), V3(w / 2, ext.z1 + .95), `${m(w)} walls`, 'minor');
      dim(V3(ext.x0 - .45, d / 2), V3(ext.x0 - .45, -d / 2), `${m(d)} walls`, 'minor');
      for (const k of ['left', 'right']) {
        const cw = canopyWidth(state, state.canopy[k]);
        if (!cw) continue;
        const xa = k === 'left' ? ext.x0 : ext.x1 - cw, xb = k === 'left' ? ext.x0 + cw : ext.x1;
        dim(V3(xa, -d / 2 - .55), V3(xb, -d / 2 - .55), `${m(cw)} canopy`, 'minor');
      }
      // Each door and window's clear width, just outside its wall.
      for (const o of [mainDoor(state), ...state.openings]) {
        const L = o.wall === 'front' || o.wall === 'back' ? w : d, u = o.p * L, out = .3;
        const pos = o.wall === 'front' ? V3(u - w / 2, d / 2 + out) : o.wall === 'back' ? V3(w / 2 - u, -d / 2 - out) : o.wall === 'left' ? V3(-w / 2 - out, -d / 2 + u) : V3(w / 2 + out, d / 2 - u);
        const [px, py] = project(pos);
        const [a0, a1] = holeOf(state, G, o, L);
        pill(px, py, `${Math.round((a1 - a0) * 1000)}`, 'opening');
      }
      const names = [['Front', 0, ext.z1 + 1.45], ['Back', 0, ext.z0 - .45], ['Left', ext.x0 - 1.0, -d * .25], ['Right', ext.x1 + 1.05, -d * .25]];
      for (const [n, x, z] of names) {
        const [px, py] = project(V3(x, z));
        lines.push(`<text class="wall-name" x="${px.toFixed(1)}" y="${py.toFixed(1)}" text-anchor="middle">${n}</text>`);
      }
      lines.push(`<text class="plan-note" x="${(size.w / 2).toFixed(1)}" y="${(size.h - 14).toFixed(1)}" text-anchor="middle">Inside ${m(G.iw)} x ${m(G.id)}, ${G.area.toFixed(2)}m² usable, ${m(G.H)} high</text>`);
    }
    overlay.setAttribute('viewBox', `0 0 ${size.w} ${size.h}`);
    overlay.innerHTML = lines.join('');
  }

  // ---- Picking openings ------------------------------------------------------------------
  const ray = new THREE.Raycaster();
  let downAt = null;
  renderer.domElement.addEventListener('pointerdown', e => { downAt = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener('pointerup', e => {
    if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6 || !room) return;
    const r = renderer.domElement.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    const hit = ray.intersectObject(room.group, true).find(h => h.object.visible);
    const tags = hit?.object.userData.tags || [];
    const tag = tags.find(t => t.startsWith('opening:'));
    if (tag) onPick({kind: 'opening', id: tag.slice(8)});
    else if (hit) {
      const part = ['mainDoor', 'canopy', 'downpipe', 'pv', 'floraboard', 'foundation', 'floor', 'anchors', 'inside', 'roof', 'walls'].find(t => tags.includes(t));
      if (part) onPick({kind: 'part', part});
    }
  });

  // ---- Size and context loss -------------------------------------------------------------
  function resize() {
    const rect = container.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    if (Math.abs(rect.width - size.w) < .5 && Math.abs(rect.height - size.h) < .5) return;
    size = {w: rect.width, h: rect.height};
    renderer.setSize(size.w, size.h, false);
    camera.aspect = size.w / size.h; camera.updateProjectionMatrix();
    if (state) moveTo(poseFor(view), false);
    request();
  }
  const ro = new ResizeObserver(resize);
  undo.push(() => ro.disconnect());
  ro.observe(container);
  // Phones drop WebGL under memory pressure, and often when the tab is in the background. The
  // page rebuilds the preview in a fresh context rather than giving up on 3D.
  renderer.domElement.addEventListener('webglcontextlost', e => {
    e.preventDefault();
    if (disposed || lost) return;
    lost = true;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    onLost();
  });

  // ---- Public API ------------------------------------------------------------------------
  let designKey = '';
  const api = {
    update(next, {refit = false, keepCamera = false} = {}) {
      if (disposed) return;
      // Changing step alone never rebuilds the room.
      const key = JSON.stringify({...next, step: 0});
      if (key === designKey && !refit) return;
      designKey = key;
      const first = !state;
      const sizeChanged = state && (state.size !== next.size || state.range !== next.range || JSON.stringify(state.canopy) !== JSON.stringify(next.canopy));
      // Build first: a design that fails to build leaves the last room standing.
      tex.begin();
      let built;
      try { built = buildRoom(next, tex); } catch (err) {
        lastError = String(err); designKey = '';
        if (first) throw err;
        console.error(err);
        return;
      }
      state = next;
      if (room) { scene.remove(room.group); disposeObject(room.group); room.materials.forEach(m => m.dispose()); }
      room = built;
      scene.add(room.group);
      const ext = extentsOf(state);
      landscaping(state, ext);
      tex.prune(T.cache);
      if (svg) flatColours();
      if (simple) { simplify(room.group, room.materials); simplify(groundExtras, groundExtras.userData.mats); simplify(lawn); }
      fitShadow(ext);
      inner.position.set(0, geom(state).ceil - .3, 0);
      inner.userData.area = geom(state).ww * geom(state).wd;
      applyLighting();
      persistent = persistentTags.length ? meshesTagged(persistentTags) : [];
      if (pulse) pulse.meshes = meshesTagged(pulse.tags);
      setOutline();
      applyViewVisibility();
      if (first) { resize(); moveTo(poseFor('outside'), false); }
      else if ((refit || sizeChanged) && !keepCamera) moveTo(poseFor(view), true);
      request();
    },
    setView(name, {animate = true} = {}) {
      if (!state) return;
      moveTo(poseFor(name), animate);
    },
    get view() { return view; },
    /**
     * Turns to a part and outlines it. spec: {tags, view?, dir?, lookAt?, persist?}
     * Outside parts are framed from `dir`; inside parts turn the walk-in camera to face them.
     */
    focus(input) {
      if (!state || !room) return;
      // A room rebuilt this tick has not had its world matrices computed yet; framing it from
      // stale ones aims the camera at the origin.
      scene.updateMatrixWorld(true);
      const d = input.dir;
      const spec = {...input, dir: d ? (Array.isArray(d) ? new THREE.Vector3(...d) : new THREE.Vector3(d.x, d.y, d.z)) : undefined};
      const tags = spec.tags || [];
      const wantView = spec.view || 'outside';
      if (wantView === 'inside') {
        const meshes = meshesTagged(tags);
        const G = geom(state);
        const at = spec.lookAt ? new THREE.Vector3(...spec.lookAt) : meshes.length ? boxOf(meshes).getCenter(new THREE.Vector3()) : null;
        if (at && spec.lookDown) at.y = G.floorY;
        if (at && spec.lookUp) at.y = G.ceil - .05;
        const pose = poseFor('inside', {lookAt: at});
        // Fittings on the door or right beside the viewpoint are seen from across the building.
        if (at && (spec.facing || pose.position.distanceTo(at) < 1.1)) {
          const lim = v => THREE.MathUtils.clamp(v, -1, 1);
          const pos = new THREE.Vector3(lim(-at.x / Math.max(.01, G.iw / 2)) * (G.iw / 2 - .3), pose.position.y, lim(-at.z / Math.max(.01, G.id / 2)) * (G.id / 2 - .3));
          if (pos.distanceTo(at) < .9) pos.set(-Math.sign(at.x || 1) * (G.iw / 2 - .3), pose.position.y, -Math.sign(at.z || 1) * (G.id / 2 - .3));
          pose.position.copy(pos);
          pose.target.copy(pos.clone().addScaledVector(at.clone().sub(pos).normalize(), .02));
        }
        if (spec.fov) pose.fov = spec.fov;
        moveTo(pose, !spec.instant);
      } else if (wantView === 'plan') {
        moveTo(poseFor('plan'), !spec.instant);
      } else {
        // Frame the part with some of the room around it, from the side it faces.
        const meshes = tags.length ? meshesTagged(tags) : [];
        let b = meshes.length ? boxOf(meshes) : roomBox();
        if (spec.context !== false) {
          const room0 = roomBox();
          const pad = spec.pad ?? .35;
          const size0 = b.getSize(new THREE.Vector3());
          b = b.clone().expandByVector(new THREE.Vector3(Math.max(pad, size0.x * .15), Math.max(pad * .7, .3), Math.max(pad, size0.z * .15)));
          if (spec.whole) b = room0;
          b.min.y = Math.max(0, b.min.y);
        }
        const pose = poseFor('outside', {dir: spec.dir, box: b, minDistance: spec.minDistance || 3});
        if (spec.lookUp && meshes.length) { pose.position.y = Math.max(.6, pose.position.y - 1.2); }
        moveTo(pose, !spec.instant);
      }
      if (spec.highlight !== false && tags.length) {
        pulse = {tags, start: performance.now() + (reducedMotion.matches ? 0 : 250), meshes: meshesTagged(tags)};
        setOutline();
      } else if (pulse) {
        // A move that highlights nothing ends any earlier highlight: it may name a part that is gone.
        pulse = null; setOutline();
      }
      request();
    },
    select(tags) {
      scene.updateMatrixWorld(true);
      persistentTags = tags || [];
      persistent = tags?.length ? meshesTagged(tags) : [];
      setOutline(); request();
    },
    zoom(direction) {
      if (view === 'inside') {
        camera.fov = THREE.MathUtils.clamp(camera.fov - direction * 8, 38, 88); camera.updateProjectionMatrix(); request(); return;
      }
      const offset = camera.position.clone().sub(controls.target);
      const dist = THREE.MathUtils.clamp(offset.length() * (direction > 0 ? .8 : 1.25), controls.minDistance, controls.maxDistance);
      const to = {view, fov: camera.fov, position: controls.target.clone().add(offset.setLength(dist)), target: controls.target.clone()};
      anim = reducedMotion.matches ? null : {start: performance.now(), duration: 260, from: {position: camera.position.clone(), target: controls.target.clone(), fov: camera.fov}, to};
      if (!anim) { camera.position.copy(to.position); }
      request();
    },
    reset() { moveTo(poseFor(view === 'plan' ? 'plan' : view), true); },
    setNight(on) { night = Boolean(on); applyLighting(); request(); },
    setDimensions(on) { showDims = Boolean(on); renderOverlay(); request(); },
    /** Renders named views at a fixed size for the PDF; the visible preview is untouched. */
    capture(names = ['hero', 'front', 'rear', 'interior', 'plan'], {width = 1600, height = 1000} = {}) {
      if (!state || lost || renderer.getContext().isContextLost()) return {};
      // A phone renders the PDF views smaller, keeping the drawing buffer inside its budget.
      if (width > T.capture) { height = Math.round(height * T.capture / width); width = T.capture; }
      const cam = new THREE.PerspectiveCamera(35, width / height, .05, 200);
      const saved = {night, view, size: renderer.getSize(new THREE.Vector2()), ratio: renderer.getPixelRatio(), shadow: sun.shadow.mapSize.x};
      const out = {};
      const wasPulse = pulse, wasHl = hl.visible;
      hl.visible = false;
      try {
        renderer.setPixelRatio(1);
        renderer.setSize(width, height, false);
        const prevSize = size; size = {w: width, h: height};
        for (const name of names) {
          const isDusk = name === 'dusk';
          if (night !== isDusk) { night = isDusk; applyLighting(); }
          let pose;
          const side = (x, yy, z) => poseFor('outside', {dir: new THREE.Vector3(x, yy, z), margin: 1.08});
          if (name === 'hero' || name === 'dusk') pose = side(-.62, .2, 1);
          else if (name === 'front') pose = side(0, .14, 1);
          else if (name === 'back') pose = side(0, .16, -1);
          else if (name === 'left') pose = side(-1, .16, 0);
          else if (name === 'right') pose = side(1, .16, 0);
          else if (name === 'aerial') pose = side(-.5, 1.1, .8);
          else if (name === 'interior') pose = poseFor('inside');
          else if (name === 'interior2') {
            const G = geom(state);
            const pos = new THREE.Vector3(G.iw / 2 - .3, G.floorY + 1.45, -G.id / 2 + .3);
            pose = {view: 'inside', fov: 74, position: pos, target: new THREE.Vector3(-G.iw / 4, G.floorY + 1.0, G.id / 2)};
          } else pose = poseFor('plan');
          view = pose.view;
          applyViewVisibility();
          cam.fov = pose.fov; cam.aspect = width / height; cam.updateProjectionMatrix();
          cam.position.copy(pose.position); cam.lookAt(pose.target);
          hedgeFor(cam);
          renderer.render(scene, cam);
          // The SVG tier hands back markup; the page rasterises it for the PDF.
          out[name] = svg ? 'svg:' + new XMLSerializer().serializeToString(renderer.domElement) : renderer.domElement.toDataURL('image/jpeg', .9);
        }
        size = prevSize;
      } catch { /* The PDF falls back to photography and drawings for any missing view. */ }
      finally {
        if (night !== saved.night) { night = saved.night; applyLighting(); }
        view = saved.view; applyViewVisibility();
        renderer.setPixelRatio(saved.ratio);
        renderer.setSize(saved.size.x, saved.size.y, false);
        pulse = wasPulse; hl.visible = wasHl;
        if (!lost) renderer.render(scene, camera);
      }
      return out;
    },
    /**
     * QA: draws the current camera's view (highlight hidden) and returns a w x h grid of RGB
     * samples, so a check can prove that an option changed what the shopper sees.
     */
    /** QA: the full drawing buffer of the current view, highlight hidden. */
    frameBuffer() {
      if (!state || svg || lost) return null;
      const was = hl.visible; hl.visible = false;
      hedgeFor(camera);
      renderer.render(scene, camera);
      const gl = renderer.getContext(), b = renderer.getDrawingBufferSize(new THREE.Vector2());
      const buf = new Uint8Array(b.x * b.y * 4);
      gl.readPixels(0, 0, b.x, b.y, gl.RGBA, gl.UNSIGNED_BYTE, buf);
      hl.visible = was; request();
      return buf;
    },
    pixels(w = 96, h = 60) {
      if (!state || svg || lost) return null;
      const was = hl.visible; hl.visible = false;
      hedgeFor(camera);
      renderer.render(scene, camera);
      const gl = renderer.getContext(), b = renderer.getDrawingBufferSize(new THREE.Vector2());
      const buf = new Uint8Array(b.x * b.y * 4);
      gl.readPixels(0, 0, b.x, b.y, gl.RGBA, gl.UNSIGNED_BYTE, buf);
      hl.visible = was;
      const out = [];
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const x = Math.floor((i + .5) / w * b.x), y = Math.floor((j + .5) / h * b.y), k = (y * b.x + x) * 4;
        out.push(buf[k], buf[k + 1], buf[k + 2]);
      }
      request();
      return out;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect(); controls.dispose();
      if (room) { disposeObject(room.group); room.materials.forEach(m => m.dispose()); }
      if (groundExtras) disposeObject(groundExtras);
      tex.dispose(); envMap?.dispose(); for (const o of hl.children) if (o.isLineSegments) o.geometry.dispose(); hlFill.dispose(); hlLine.dispose();
      renderer.dispose();
      // Hand the context back now: browsers cap live contexts, and iOS counts their memory.
      if (!lost) renderer.forceContextLoss();
      renderer.domElement.remove(); overlay.remove();
    },
    /** What the device is running, for QA and for the page's analytics. */
    quality: () => ({tier, ratio, highlight: selected.length, lost, broken, ...tex.stats(), webgl: svg ? 0 : renderer.capabilities.isWebGL2 === false ? 1 : 2, svg: svg ? renderer.info : undefined}),
    /** Everything ?debug3d shows about this attempt. */
    diagnostics() {
      const d = {tier, gpu: api.gpu(), ratio, frames, verified, broken, shaderErrors: shaderErrors.slice(0, 3), glErrors: glErrors.slice(0, 5), samples: samples.slice(0, 3), lastError, textures: tex.stats()};
      if (!svg) {
        try {
          const gl = renderer.getContext(), a = gl.getContextAttributes() || {};
          d.webgl = renderer.capabilities.isWebGL2 === false ? 1 : 2;
          d.context = {antialias: a.antialias, alpha: a.alpha, lost: gl.isContextLost()};
          d.maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE);
          d.extensions = ['EXT_color_buffer_float', 'EXT_color_buffer_half_float', 'KHR_parallel_shader_compile', 'OES_texture_float_linear'].filter(e => gl.getExtension(e));
          d.buffer = renderer.getDrawingBufferSize(new THREE.Vector2()).toArray();
        } catch (err) { d.contextError = String(err); }
      } else d.svg = renderer.info;
      return d;
    },
    /** The GPU's name, for the ?debug3d panel. */
    gpu() {
      if (svg) return 'none (SVG)';
      try {
        const gl = renderer.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info');
        return String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
      } catch { return 'unknown'; }
    },
    // QA only. Expose just the classes the z-fighting check needs: the whole namespace would
    // defeat tree shaking and add 160KB.
    _debug: () => ({scene, camera, controls, room, view, state, selected, hlStrength, highlightTags: pulse ? pulse.tags : persistentTags, pulse, anim, frames, frame, lastError, THREE: {Raycaster: THREE.Raycaster, Vector3: THREE.Vector3, DoubleSide: THREE.DoubleSide}})
  };
  return api;
}
