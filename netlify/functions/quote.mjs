import { randomUUID } from 'node:crypto';
import { validateSubmission } from './lib/validation.mjs';
import { priceConfig } from './lib/pricing.mjs';
import { quoteStore, quoteKey, quoteExpiryDays } from './lib/store.mjs';
import { checkOrigin, readBoundedJson, json, errorResponse } from './lib/http.mjs';

export function createQuoteHandler({ storeFactory = quoteStore, now = () => new Date(), uuid = randomUUID } = {}) {
  return async request => {
    if (request.method !== 'POST') return json({ error: 'Use POST to save an enquiry.' }, 405, { Allow: 'POST' });
    try {
      checkOrigin(request);
      const submission = validateSubmission(await readBoundedJson(request));
      const token = uuid();
      const createdAt = now().toISOString();
      const reference = `BH-${createdAt.slice(0, 10).replaceAll('-', '')}-${token.slice(0, 8).toUpperCase()}`;
      const pricing = priceConfig(submission.config);
      const expiresAt = new Date(Date.parse(createdAt) + quoteExpiryDays * 86_400_000).toISOString();
      const record = { schema: 1, token, reference, createdAt, expiresAt, ...submission, pricing };
      // The write must finish before any price or download capability is sent.
      await storeFactory().setJSON(quoteKey(token), record, { metadata: { createdAt, expiresAt, schema: 1 } });
      return json({ token, reference, createdAt, expiresAt, pricing, config: submission.config }, 201);
    } catch (error) { return errorResponse(error); }
  };
}

export default createQuoteHandler();
export const config = {
  path: '/api/quote',
  rateLimit: { action: 'rate_limit', aggregateBy: ['ip', 'domain'], windowSize: 60, windowLimit: 12 },
};
