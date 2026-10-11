import { getStore } from '@netlify/blobs';

// Site-wide authenticated storage. Never expose store credentials or a list/read
// endpoint for enquiry data. Strong reads ensure an immediate PDF is available.
export function quoteStore() {
  return getStore({ name: 'biohort-private-quotes', region: 'eu-central-1', consistency: 'strong' });
}

export const quoteKey = token => `quotes/${token}`;
export const quoteExpiryDays = 30;
