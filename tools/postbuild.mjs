// Checks the build has both 3D bundles and writes dist/build-manifest.json (path -> md5), which
// tools/qa/verify-live.mjs compares with the deployed site.
import {readdir, readFile, writeFile, stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root = 'dist', out = {};
async function walk(dir) {
  for (const e of await readdir(dir, {withFileTypes: true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (!p.endsWith('build-manifest.json')) out['/' + path.relative(root, p).split(path.sep).join('/')] = createHash('md5').update(await readFile(p)).digest('hex');
  }
}
// The 3D chunk's hashed name, so the page can prefetch it once the poster has painted and the
// download overlaps the wait before the 3D starts (src/app.js startAfterPoster).
const sceneChunk = (await readdir('dist/assets')).filter(f => /^scene-[\w-]+\.js$/.test(f));
if (sceneChunk.length !== 1) { console.error('expected one scene chunk, found', sceneChunk); process.exit(1); }
const page = await readFile('dist/index.html', 'utf8');
if (!page.includes('name="scene-chunk"')) await writeFile('dist/index.html', page.replace('</head>', `  <meta name="scene-chunk" content="/assets/${sceneChunk[0]}">\n</head>`));
await walk(root);
for (const need of ['/index.html', '/legacy/scene.js']) if (!out[need]) { console.error('missing', need); process.exit(1); }
const legacy = await readFile('dist/legacy/scene.js', 'utf8');
if (!/REVISION\s*=\s*"162"|"162"/.test(legacy)) { console.error('legacy bundle is not three r162'); process.exit(1); }
await writeFile('dist/build-manifest.json', JSON.stringify(out, null, 1));
const size = async f => (await stat(path.join(root, f))).size;
console.log(`build ok: ${Object.keys(out).length} files, legacy scene ${(await size('legacy/scene.js') / 1024).toFixed(0)} KB`);
