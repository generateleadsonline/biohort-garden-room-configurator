// Local stand-in for Netlify: serves the API handlers with an in-memory Blobs store, and (with
// STATIC_DIR=dist) the built site with the same headers and redirects, so QA never posts a real
// enquiry. PORT defaults to 8899 (Vite proxies /api there). Records print to stdout and are kept
// at /__qa/store for tests.
import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
import {handleEnquiry} from '../server/enquiry.mjs';
import {handleDiagnostics} from '../server/diagnostics.mjs';

const PORT = Number(process.env.PORT || 8899), STATIC = process.env.STATIC_DIR;
const mem = new Map();
const store = {
  async setJSON(k, v) { mem.set(k, JSON.parse(JSON.stringify(v))); },
  async get(k, o) { const v = mem.get(k); return v === undefined ? null : o?.type === 'json' ? v : JSON.stringify(v); }
};
const TYPES = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.json': 'application/json'};
let headerRules = [];
if (STATIC) {
  try {
    const text = await readFile(path.join(STATIC, '_headers'), 'utf8');
    let cur = null;
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      if (!/^\s/.test(line)) { cur = {pattern: line.trim(), headers: {}}; headerRules.push(cur); }
      else { const i = line.indexOf(':'); cur.headers[line.slice(0, i).trim()] = line.slice(i + 1).trim(); }
    }
  } catch {}
}
const headersFor = p => Object.assign({}, ...headerRules.filter(r => r.pattern === '/*' || (r.pattern.endsWith('/*') && p.startsWith(r.pattern.slice(0, -1)))).map(r => r.headers));

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/enquiry' || url.pathname === '/api/diagnostics') {
    const chunks = []; for await (const c of req) chunks.push(c);
    const headers = new Headers(); for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k.toLowerCase(), v);
    const request = new Request(url, {method: req.method, headers, body: req.method === 'POST' ? Buffer.concat(chunks) : undefined});
    const out = await (url.pathname === '/api/enquiry' ? handleEnquiry : handleDiagnostics)(request, {store});
    if (url.pathname === '/api/enquiry' && out.status === 200) console.log('[dev-api] stored', [...mem.keys()].pop());
    res.writeHead(out.status, Object.fromEntries(out.headers)); res.end(Buffer.from(await out.arrayBuffer()));
    return;
  }
  if (url.pathname === '/__qa/store') { res.writeHead(200, {'content-type': 'application/json'}); res.end(JSON.stringify(Object.fromEntries(mem))); return; }
  if (!STATIC) { res.writeHead(404); res.end(); return; }
  if (url.pathname === '/') { res.writeHead(302, {location: '/configurator/'}); res.end(); return; }
  let file = path.join(STATIC, decodeURIComponent(url.pathname));
  if (url.pathname.startsWith('/configurator')) file = path.join(STATIC, 'index.html');
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    let body = await readFile(file);
    const type = TYPES[path.extname(file)] || 'application/octet-stream', extra = {};
    // Compress text like Netlify does, so local Lighthouse runs are comparable.
    if (/text|javascript|json|svg/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '')) { body = gzipSync(body); extra['content-encoding'] = 'gzip'; }
    res.writeHead(200, {'content-type': type, ...headersFor(url.pathname), ...extra}); res.end(body);
  }
  catch { res.writeHead(404, {'content-type': 'text/plain'}); res.end('not found'); }
}).listen(PORT, '127.0.0.1', () => console.log(`[dev-api] http://127.0.0.1:${PORT}${STATIC ? ' (serving ' + STATIC + ')' : ''}`));
