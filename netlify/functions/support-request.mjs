// POST /api/support-request {problem}: hands the visitor's choice to iMBrace's service desk workflow and waits for its
// answer (iMBrace files the ticket, its assistant picks the fix guide, and the workflow checks it: about 10-20 seconds).
import { forward, readJson } from '../forward.mjs';

export default async (req) => {
  const { body, error } = await readJson(req);
  if (error) return error;
  return forward('IMBRACE_SUPPORT_FORM_URL', { problem: String(body?.problem ?? '').slice(0, 160) }, { timeoutMs: 55_000 });
};
export const config = { path: '/api/support-request' };
