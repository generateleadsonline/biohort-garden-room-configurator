import { QuoteError } from './validation.mjs';

export const privateHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'Netlify-CDN-Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
};

export function json(data, status = 200, extraHeaders = {}) {
  return Response.json(data, { status, headers: { ...privateHeaders, ...extraHeaders } });
}

export function checkOrigin(request) {
  const origin = request.headers.get('origin');
  if (request.headers.get('sec-fetch-site') === 'cross-site' || (origin && origin !== new URL(request.url).origin)) {
    throw new QuoteError('Please submit your design from this configurator.', 403);
  }
}

export async function readBoundedJson(request) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new QuoteError('Use a JSON enquiry request.', 415);
  const maximum = 2_050_000;
  if (Number(request.headers.get('content-length')) > maximum) throw new QuoteError('Your preview is too large. Please try again.', 413);
  const reader = request.body?.getReader();
  if (!reader) throw new QuoteError('Your enquiry is empty.', 400);
  let bytes = 0;
  const chunks = [];
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    bytes += part.value.byteLength;
    if (bytes > maximum) { await reader.cancel(); throw new QuoteError('Your preview is too large. Please try again.', 413); }
    chunks.push(part.value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new QuoteError('Your enquiry could not be read. Please try again.', 400); }
}

export function errorResponse(error) {
  if (error instanceof QuoteError) return json({ error: error.message, fields: error.fields }, error.status);
  // No fallback success, public PII logging or client-generated quote tokens.
  return json({ error: 'We could not securely save your enquiry. Your price has not been unlocked. Please try again shortly.' }, 503);
}
