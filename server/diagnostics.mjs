// /api/diagnostics: anonymous 3D reports from ?debug3d (Send report). POST stores one and returns a
// short code to quote; GET ?code= reads it back. Headless browsers and crawlers (Netlify's deploy
// screenshot among them) are answered but not stored.
const json = (status, body) => new Response(JSON.stringify(body), {status, headers: {'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store'}});
const BOT = /HeadlessChrome|bot\b|crawler|spider|Lighthouse/i;
export async function handleDiagnostics(request, {store, rand = Math.random, now = () => new Date()} = {}) {
  const url = new URL(request.url);
  if (request.method === 'GET') {
    const code = url.searchParams.get('code') || '';
    if (!/^3D-[A-Z0-9]{8}$/.test(code)) return json(400, {ok: false, error: 'Give ?code=3D-XXXXXXXX'});
    const rec = await store.get('reports/' + code, {type: 'json'});
    return rec ? json(200, {ok: true, report: rec}) : json(404, {ok: false, error: 'No report with that code'});
  }
  if (request.method !== 'POST') return json(405, {ok: false});
  const text = await request.text();
  if (text.length > 64 * 1024) return json(413, {ok: false});
  let body; try { body = JSON.parse(text); } catch { return json(400, {ok: false}); }
  const ua = request.headers.get('user-agent') || '';
  let code = '3D-';
  for (let i = 0; i < 8; i++) code += 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(rand() * 32)];
  if (BOT.test(ua)) return json(200, {ok: true, code, stored: false});
  await store.setJSON('reports/' + code, {code, at: now().toISOString(), ua: ua.slice(0, 300), report: String(body.report || '').slice(0, 20000), diagnostics: body.diagnostics || null});
  return json(200, {ok: true, code, stored: true});
}
