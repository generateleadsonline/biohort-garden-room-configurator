import {getStore} from '@netlify/blobs';
import {handleDiagnostics} from '../../server/diagnostics.mjs';

export default request => handleDiagnostics(request, {store: getStore({name: 'biohort-3d-diagnostics', consistency: 'strong'})});
export const config = {path: '/api/diagnostics', rateLimit: {windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain']}};
