// Run from the project root:  node --test backend/tests/
// Tests the real handler and validator code with a fake database call (no network, no Supabase).

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../supabase/functions/submit-lead/handler.ts';
import { validateLead } from '../supabase/functions/submit-lead/validate.ts';

const ORIGIN = 'https://o3m-google-ads-landing.vercel.app';

function makeHandler(rpcImpl) {
  const calls = [];
  const logs = [];
  const handler = createHandler({
    rpc: async (fn, args) => {
      calls.push({ fn, args });
      return rpcImpl ? rpcImpl(fn, args) : { data: { status: 'created', id: 'x' }, error: null };
    },
    allowedOrigins: [ORIGIN, 'http://localhost:8765/'],
    ipSalt: 'test-salt',
    workspaceSlug: 'o3m',
    maxPerHour: 5,
    log: (m) => logs.push(m),
  });
  return { handler, calls, logs };
}

const VALID = {
  name: 'Asha Raman', email: 'asha@acme.in', mobile: '+91 98765 43210', company: 'Acme Industries',
  goal: 'leads', website: 'acme.in', spend: '1to5', industry: 'Real Estate', message: 'Need help',
  gclid: 'G123', utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'brand',
  landing_page: 'https://o3m-google-ads-landing.vercel.app/google-ads-management/', lead_id: 'k3j2h1abc9',
};

function formRequest(fields, { origin = ORIGIN, headers = {}, method = 'POST' } = {}) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  const h = { ...headers };
  if (origin) h.origin = origin;
  return new Request('https://x.supabase.co/functions/v1/submit-lead', { method, body: fd, headers: h });
}

test('valid multipart submit is stored via the RPC and returns ok', async () => {
  const { handler, calls } = makeHandler();
  const res = await handler(formRequest(VALID, { headers: { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' } }));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, id: 'k3j2h1abc9' });
  assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].fn, 'ingest_website_lead');
  assert.equal(calls[0].args.p_workspace_slug, 'o3m');
  assert.equal(calls[0].args.p_max_per_hour, 5);
  const lead = calls[0].args.p_lead;
  assert.equal(lead.name, 'Asha Raman');
  assert.equal(lead.mobile, '+91 98765 43210');
  assert.equal(lead.spend, '1to5');
  assert.equal(lead.gclid, 'G123');
  assert.equal(lead.lead_id, 'k3j2h1abc9');
});

test('the visitor IP is sent only as a salted hash, never raw', async () => {
  const { handler, calls } = makeHandler();
  await handler(formRequest(VALID, { headers: { 'x-forwarded-for': '203.0.113.9' } }));
  const h = calls[0].args.p_ip_hash;
  assert.match(h, /^[0-9a-f]{64}$/);
  assert.ok(!JSON.stringify(calls[0].args).includes('203.0.113.9'));
});

test('same IP gives the same hash; different IP gives a different one', async () => {
  const { handler, calls } = makeHandler();
  await handler(formRequest(VALID, { headers: { 'x-forwarded-for': '203.0.113.9' } }));
  await handler(formRequest(VALID, { headers: { 'x-forwarded-for': '203.0.113.9' } }));
  await handler(formRequest(VALID, { headers: { 'x-forwarded-for': '198.51.100.7' } }));
  assert.equal(calls[0].args.p_ip_hash, calls[1].args.p_ip_hash);
  assert.notEqual(calls[0].args.p_ip_hash, calls[2].args.p_ip_hash);
});

test('no IP header: p_ip_hash is null (rate limit skipped, lead still stored)', async () => {
  const { handler, calls } = makeHandler();
  const res = await handler(formRequest(VALID));
  assert.equal(res.status, 200);
  assert.equal(calls[0].args.p_ip_hash, null);
});

test('JSON body is accepted too', async () => {
  const { handler, calls } = makeHandler();
  const res = await handler(new Request('https://x/functions/v1/submit-lead', {
    method: 'POST', headers: { 'content-type': 'application/json', origin: ORIGIN }, body: JSON.stringify(VALID),
  }));
  assert.equal(res.status, 200);
  assert.equal(calls.length, 1);
});

test('honeypot filled: pretends success, stores nothing', async () => {
  const { handler, calls } = makeHandler();
  const res = await handler(formRequest({ ...VALID, bot_field: 'http://spam.example' }));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(calls.length, 0);
});

test('invalid fields: 400 with per-field errors, nothing stored', async () => {
  const { handler, calls } = makeHandler();
  const res = await handler(formRequest({ ...VALID, name: 'A', email: 'nope', mobile: '123', goal: 'zzz', company: '' }));
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error, 'validation_failed');
  for (const k of ['name', 'email', 'mobile', 'goal', 'company']) assert.ok(body.fields[k], `missing error for ${k}`);
  assert.equal(calls.length, 0);
});

test('origin not on the allow-list is rejected before anything else', async () => {
  const { handler, calls } = makeHandler();
  const res = await handler(formRequest(VALID, { origin: 'https://evil.example' }));
  assert.equal(res.status, 403);
  assert.equal(res.headers.get('access-control-allow-origin'), null);
  assert.equal(calls.length, 0);
});

test('allow-list entries are matched ignoring a trailing slash', async () => {
  const { handler } = makeHandler();
  const res = await handler(formRequest(VALID, { origin: 'http://localhost:8765' }));
  assert.equal(res.status, 200);
});

test('no Origin header (server-to-server / curl) is allowed but still validated', async () => {
  const { handler, calls } = makeHandler();
  const res = await handler(formRequest(VALID, { origin: null }));
  assert.equal(res.status, 200);
  assert.equal(calls.length, 1);
});

test('OPTIONS preflight: 204 with CORS headers for an allowed origin, 403 otherwise', async () => {
  const { handler } = makeHandler();
  const ok = await handler(new Request('https://x/f', { method: 'OPTIONS', headers: { origin: ORIGIN } }));
  assert.equal(ok.status, 204);
  assert.equal(ok.headers.get('access-control-allow-origin'), ORIGIN);
  assert.match(ok.headers.get('access-control-allow-methods'), /POST/);
  const bad = await handler(new Request('https://x/f', { method: 'OPTIONS', headers: { origin: 'https://evil.example' } }));
  assert.equal(bad.status, 403);
});

test('GET is not allowed', async () => {
  const { handler } = makeHandler();
  const res = await handler(new Request('https://x/f', { method: 'GET', headers: { origin: ORIGIN } }));
  assert.equal(res.status, 405);
});

test('oversized body is refused', async () => {
  const { handler, calls } = makeHandler();
  const res = await handler(new Request('https://x/f', {
    method: 'POST', headers: { origin: ORIGIN, 'content-type': 'application/json', 'content-length': '999999' }, body: '{}',
  }));
  assert.equal(res.status, 413);
  assert.equal(calls.length, 0);
});

test('unsupported content type is a 400', async () => {
  const { handler } = makeHandler();
  const res = await handler(new Request('https://x/f', {
    method: 'POST', headers: { origin: ORIGIN, 'content-type': 'text/plain' }, body: 'hello',
  }));
  assert.equal(res.status, 400);
});

test('database says duplicate: still a success for the visitor (safe retry)', async () => {
  const { handler } = makeHandler(async () => ({ data: { status: 'duplicate' }, error: null }));
  const res = await handler(formRequest(VALID));
  assert.equal(res.status, 200);
  assert.equal((await res.json()).ok, true);
});

test('database says rate_limited: 429 with Retry-After', async () => {
  const { handler } = makeHandler(async () => ({ data: { status: 'rate_limited' }, error: null }));
  const res = await handler(formRequest(VALID));
  assert.equal(res.status, 429);
  assert.equal(res.headers.get('retry-after'), '3600');
  assert.equal((await res.json()).ok, false);
});

test('database error: generic 500, nothing about the visitor leaks into the log or response', async () => {
  const { handler, logs } = makeHandler(async () => ({ data: null, error: { message: 'boom', code: 'XX000' } }));
  const res = await handler(formRequest(VALID));
  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { ok: false, error: 'server_error' });
  assert.equal(logs.length, 1);
  assert.ok(!logs[0].includes('asha@acme.in') && !logs[0].includes('Asha'));
});

test('unexpected RPC result is a 500, not a false success', async () => {
  const { handler } = makeHandler(async () => ({ data: { status: 'weird' }, error: null }));
  const res = await handler(formRequest(VALID));
  assert.equal(res.status, 500);
});

// ---------------------------------------------------------------- validator
test('validator: optional fields may be empty; values are trimmed and control characters removed', () => {
  const r = validateLead({ name: '  Asha Raman ', email: 'a@b.co', mobile: '9876543210', company: 'Acme', goal: 'unsure', message: 'hi\u0000 there\nline2' });
  assert.equal(r.ok, true);
  assert.equal(r.value.name, 'Asha Raman');
  assert.equal(r.value.website, null);
  assert.equal(r.value.spend, null);
  assert.equal(r.value.message, 'hi there\nline2');
});

test('validator: mobile rules match the browser (10-15 digits, limited punctuation)', () => {
  const base = { name: 'Asha', email: 'a@b.co', company: 'Acme', goal: 'leads' };
  assert.equal(validateLead({ ...base, mobile: '98765 43210' }).ok, true);
  assert.equal(validateLead({ ...base, mobile: '+91 (98765) 43210' }).ok, true);
  assert.equal(validateLead({ ...base, mobile: '123456789' }).ok, false);
  assert.equal(validateLead({ ...base, mobile: '1234567890123456' }).ok, false);
  assert.equal(validateLead({ ...base, mobile: '98765abc43210' }).ok, false);
});

test('validator: website, spend and goal are checked against the allowed values', () => {
  const base = { name: 'Asha', email: 'a@b.co', company: 'Acme', mobile: '9876543210', goal: 'leads' };
  assert.equal(validateLead({ ...base, website: 'not a site' }).ok, false);
  assert.equal(validateLead({ ...base, website: 'https://acme.in/path' }).ok, true);
  assert.equal(validateLead({ ...base, spend: 'gt20' }).ok, true);
  assert.equal(validateLead({ ...base, spend: 'millions' }).ok, false);
  assert.equal(validateLead({ ...base, goal: 'both' }).ok, true);
});

test('validator: over-long values are cut to the database limits; bad lead_id becomes null', () => {
  const r = validateLead({ name: 'N'.repeat(500), email: 'a@b.co', mobile: '9876543210', company: 'C'.repeat(500), goal: 'leads',
    message: 'm'.repeat(5000), gclid: 'g'.repeat(900), lead_id: 'bad id!' });
  assert.equal(r.ok, true);
  assert.equal(r.value.name.length, 200);
  assert.equal(r.value.company.length, 200);
  assert.equal(r.value.message.length, 2000);
  assert.equal(r.value.gclid.length, 500);
  assert.equal(r.value.lead_id, null);
});

test('validator: non-string values (objects, arrays) are treated as empty, not crashed on', () => {
  const r = validateLead({ name: { a: 1 }, email: ['x'], mobile: null, company: 5, goal: undefined });
  assert.equal(r.ok, false);
  assert.ok(r.errors.name && r.errors.email && r.errors.mobile && r.errors.company && r.errors.goal);
});
