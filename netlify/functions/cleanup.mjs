import { quoteStore } from './lib/store.mjs';

export function createCleanupHandler({ storeFactory = quoteStore, now = () => new Date() } = {}) {
  return async () => {
    let deleted = 0;
    try {
      const store = storeFactory();
      for await (const page of store.list({ prefix: 'quotes/', paginate: true })) {
        // Read expiry metadata only, avoiding unnecessary access to lead details.
        for (const entry of page.blobs) {
          const result = await store.getMetadata(entry.key);
          const expiry = Date.parse(result?.metadata?.expiresAt);
          if (Number.isFinite(expiry) && expiry <= now().getTime()) {
            await store.delete(entry.key);
            deleted++;
          }
        }
      }
      return Response.json({ deleted });
    } catch { return Response.json({ error: 'Retention cleanup could not complete.', deleted }, { status: 503 }); }
  };
}

export default createCleanupHandler();
export const config = { schedule: '0 2 * * *' };
