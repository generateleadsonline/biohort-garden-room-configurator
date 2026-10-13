// Confirms the deployed site serves exactly the files of this build: fetches every path in
// dist/build-manifest.json from the live origin and compares MD5s.
//   node tools/qa/verify-live.mjs https://my-retreat-garden-configurator.netlify.app
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const origin = (process.argv[2] || 'https://my-retreat-garden-configurator.netlify.app').replace(/\/$/, '');
const manifest = JSON.parse(await readFile('dist/build-manifest.json', 'utf8'));
let bad = 0;
const rows = [];
for (const [p, md5] of Object.entries(manifest)) {
  if (p === '/_headers') continue;
  const url = origin + (p === '/index.html' ? '/configurator/' : p);
  const res = await fetch(url, {cache: 'no-store'});
  const got = createHash('md5').update(Buffer.from(await res.arrayBuffer())).digest('hex');
  const ok = res.ok && got === md5;
  if (!ok) bad++;
  rows.push({path: p, status: res.status, ok});
  if (!ok) console.log(`FAIL ${p}: ${res.status} ${got} != ${md5}`);
}
const headers = Object.fromEntries((await fetch(origin + '/configurator/')).headers);
const csp = /default-src 'self'/.test(headers['content-security-policy'] || '');
if (!csp) { bad++; console.log('FAIL content-security-policy header missing'); }
await mkdir('qa', {recursive: true});
await writeFile('qa/verify-live.json', JSON.stringify({origin, at: new Date().toISOString(), files: rows.length, mismatched: bad, csp}, null, 1));
console.log(bad ? `${bad} problem(s)` : `All ${rows.length} live files match the build; CSP header present`);
process.exit(bad ? 1 : 0);
