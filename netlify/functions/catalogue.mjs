// GET /api/catalogue: the catalogue read live from iMBrace (every active product's facts and its approved text).
// Netlify's edge keeps a copy for a minute, so a busy page doesn't call iMBrace on every visit.
import { forward, json } from '../forward.mjs';

export default async (req) => {
  if (req.method !== 'GET') return json(405, { ok: false, message: 'Use GET.' });
  return forward('IMBRACE_CATALOGUE_READ_URL', { action: 'catalogue' }, {
    timeoutMs: 25_000, headers: { 'cache-control': 'public, max-age=0, must-revalidate', 'netlify-cdn-cache-control': 'public, s-maxage=60' },
  });
};
export const config = { path: '/api/catalogue' };
