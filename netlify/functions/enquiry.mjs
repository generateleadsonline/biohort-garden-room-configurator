import {getStore} from '@netlify/blobs';
import {handleEnquiry} from '../../server/enquiry.mjs';

export default request => handleEnquiry(request, {store: getStore({name: 'biohort-enquiries', consistency: 'strong'})});
export const config = {path: '/api/enquiry', rateLimit: {windowLimit: 20, windowSize: 60, aggregateBy: ['ip', 'domain']}};
