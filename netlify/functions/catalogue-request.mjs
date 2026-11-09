// POST /api/catalogue-request {product, note}: hands the visitor's two choices to iMBrace's catalogue workflow.
import { forward, readJson } from '../forward.mjs';

export default async (req) => {
  const { body, error } = await readJson(req);
  if (error) return error;
  return forward('IMBRACE_CATALOGUE_FORM_URL', { product: String(body?.product ?? '').slice(0, 120), note: String(body?.note ?? '').slice(0, 120) }, { timeoutMs: 25_000 });
};
export const config = { path: '/api/catalogue-request' };
