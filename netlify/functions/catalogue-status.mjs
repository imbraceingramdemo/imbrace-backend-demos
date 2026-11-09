// GET /api/catalogue-status?ref=WEB-5001: where a catalogue request has got to, read live from iMBrace.
import { forward, json } from '../forward.mjs';

export default async (req) => {
  if (req.method !== 'GET') return json(405, { ok: false, message: 'Use GET.' });
  const ref = new URL(req.url).searchParams.get('ref') ?? '';
  if (!/^WEB-\d{1,6}$/.test(ref)) return json(400, { ok: false, message: 'That is not a request reference.' });
  return forward('IMBRACE_CATALOGUE_READ_URL', { action: 'status', ref }, { timeoutMs: 25_000 });
};
export const config = { path: '/api/catalogue-status' };
