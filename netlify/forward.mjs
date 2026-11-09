// Shared by the server functions: hand a request to an iMBrace workflow and pass back only its answer.
// The workflow's address and the shared key come from the site's environment variables (set in Netlify, never in this
// repo or the page). Nothing else from iMBrace is passed back to the browser.
const PASS = ['ok', 'ref', 'state', 'message', 'ticket', 'kind', 'runbook', 'gap', 'sku', 'product', 'products', 'updated', 'source'];

export const json = (status, body, headers = {}) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
});

export async function forward(envName, payload, { timeoutMs = 50_000, headers = {} } = {}) {
  const url = process.env[envName], key = process.env.IMBRACE_FORM_KEY;
  if (!url || !key) return json(503, { ok: false, message: 'The demo is not connected to iMBrace right now. Please try again later.' });
  try {
    const res = await fetch(url, {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-demo-key': key },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(timeoutMs),
    });
    const body = await res.json().catch(() => null);
    if (!body || typeof body !== 'object') return json(502, { ok: false, message: 'iMBrace did not answer in time. Please try again.' });
    const safe = Object.fromEntries(Object.entries(body).filter(([k]) => PASS.includes(k)));
    return json(res.status, safe, headers);
  } catch {
    return json(504, { ok: false, message: 'iMBrace did not answer in time. Please try again.' });
  }
}

export async function readJson(req, max = 2000) {
  if (req.method !== 'POST') return { error: json(405, { ok: false, message: 'Use POST.' }) };
  const text = await req.text();
  if (text.length > max) return { error: json(413, { ok: false, message: 'That request is too large.' }) };
  try { return { body: JSON.parse(text) }; } catch { return { error: json(400, { ok: false, message: 'That request could not be read.' }) }; }
}
