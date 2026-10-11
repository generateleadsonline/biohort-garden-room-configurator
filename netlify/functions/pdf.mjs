import { quoteStore, quoteKey } from './lib/store.mjs';
import { validToken } from './lib/validation.mjs';
import { json, privateHeaders } from './lib/http.mjs';
import { buildQuotePdf } from './lib/pdf-document.mjs';

export function createPdfHandler({ storeFactory = quoteStore, now = () => new Date(), buildPdf = buildQuotePdf } = {}) {
  return async request => {
    if (request.method !== 'GET') return json({ error: 'Use GET to download your design guide.' }, 405, { Allow: 'GET' });
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    if (!validToken(token)) return json({ error: 'Submit your enquiry to unlock your design guide.' }, 401);
    try {
      const record = await storeFactory().get(quoteKey(token), { type: 'json', consistency: 'strong' });
      if (!record || record.token !== token || record.schema !== 1) return json({ error: 'This guide is unavailable. Please submit your design again.' }, 404);
      if (!record.expiresAt || !Number.isFinite(Date.parse(record.expiresAt)) || Date.parse(record.expiresAt) <= now().getTime()) return json({ error: 'Your guide link has expired. Submit your saved design for a new guide.' }, 410);
      const bytes = buildPdf(record, url.origin);
      return new Response(bytes, { status: 200, headers: { ...privateHeaders, 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="Biohort-${record.reference}.pdf"` } });
    } catch { return json({ error: 'Your design guide is temporarily unavailable. Please try again shortly.' }, 503); }
  };
}

export default createPdfHandler();
export const config = { path: '/api/pdf', rateLimit: { action: 'rate_limit', aggregateBy: ['ip', 'domain'], windowSize: 60, windowLimit: 30 } };
