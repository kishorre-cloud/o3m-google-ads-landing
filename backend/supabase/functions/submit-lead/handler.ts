// Request handling for the `submit-lead` function. Kept free of Deno-only APIs and of the
// Supabase client (it receives an `rpc` function instead) so it can be unit-tested in plain Node:
//   node --test backend/tests/
//
// Flow: CORS/origin check -> read body -> honeypot -> validate -> hash IP -> ingest_website_lead() RPC.
// The RPC does the duplicate check, the per-visitor rate limit and the inserts (see the migration).

import { validateLead } from './validate.ts';

export type RpcResult = { data: unknown; error: { message: string; code?: string } | null };

export type HandlerDeps = {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<RpcResult>;
  allowedOrigins: string[];
  /** Salt for the IP hash. Any secret string; the service-role key is used when none is configured. */
  ipSalt: string;
  workspaceSlug: string;
  maxPerHour: number;
  log?: (msg: string) => void;
};

const MAX_BODY_BYTES = 50_000;
const HONEYPOT_FIELD = 'bot_field';

function normOrigin(o: string): string {
  return o.trim().replace(/\/+$/, '');
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function clientIp(req: Request): string | null {
  const xff = req.headers.get('x-forwarded-for');
  const first = xff ? xff.split(',')[0].trim() : '';
  return first || req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || null;
}

async function readFields(req: Request): Promise<Record<string, string> | null> {
  const type = (req.headers.get('content-type') || '').toLowerCase();
  const out: Record<string, string> = {};
  try {
    if (type.includes('application/json')) {
      const j = await req.json();
      if (!j || typeof j !== 'object' || Array.isArray(j)) return null;
      for (const [k, v] of Object.entries(j as Record<string, unknown>)) {
        if (typeof v === 'string' || typeof v === 'number') out[k] = String(v);
      }
      return out;
    }
    if (type.includes('multipart/form-data') || type.includes('application/x-www-form-urlencoded')) {
      const fd = await req.formData();
      for (const [k, v] of fd.entries()) if (typeof v === 'string') out[k] = v; // files are ignored
      return out;
    }
  } catch {
    return null;
  }
  return null;
}

export function createHandler(deps: HandlerDeps): (req: Request) => Promise<Response> {
  const allowed = new Set(deps.allowedOrigins.map(normOrigin).filter(Boolean));
  const log = deps.log ?? (() => {});

  return async function handle(req: Request): Promise<Response> {
    const origin = req.headers.get('origin');
    const originOk = !origin || allowed.has(normOrigin(origin));

    const headers: Record<string, string> = {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Vary': 'Origin',
    };
    if (origin && originOk) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
      headers['Access-Control-Allow-Headers'] = 'content-type, accept';
      headers['Access-Control-Max-Age'] = '86400';
    }
    const reply = (body: unknown, status: number, extra: Record<string, string> = {}) =>
      new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { ...headers, ...extra } });

    if (req.method === 'OPTIONS') return reply(null, originOk ? 204 : 403);
    if (req.method !== 'POST') return reply({ ok: false, error: 'method_not_allowed' }, 405, { Allow: 'POST, OPTIONS' });
    if (!originOk) return reply({ ok: false, error: 'origin_not_allowed' }, 403);

    const declared = Number(req.headers.get('content-length') || 0);
    if (declared > MAX_BODY_BYTES) return reply({ ok: false, error: 'payload_too_large' }, 413);

    const fields = await readFields(req);
    if (!fields) return reply({ ok: false, error: 'bad_request' }, 400);

    // Honeypot: a real visitor never sees or fills this field. Pretend success so bots learn nothing.
    if ((fields[HONEYPOT_FIELD] || '').trim() !== '') return reply({ ok: true }, 200);

    const checked = validateLead(fields);
    if (!checked.ok) return reply({ ok: false, error: 'validation_failed', fields: checked.errors }, 400);

    const ip = clientIp(req);
    const ipHash = ip ? await sha256Hex(`${deps.ipSalt}|${ip}`) : null;

    const { data, error } = await deps.rpc('ingest_website_lead', {
      p_workspace_slug: deps.workspaceSlug,
      p_lead: checked.value,
      p_ip_hash: ipHash,
      p_max_per_hour: deps.maxPerHour,
    });

    if (error) {
      // Log the error code only; never the visitor's details.
      log(`ingest_website_lead failed: code=${error.code ?? 'n/a'} msg=${error.message}`);
      return reply({ ok: false, error: 'server_error' }, 500);
    }

    const status = (data as { status?: string } | null)?.status;
    if (status === 'rate_limited') return reply({ ok: false, error: 'rate_limited' }, 429, { 'Retry-After': '3600' });
    if (status === 'created' || status === 'duplicate') {
      return reply({ ok: true, id: checked.value.lead_id }, 200);
    }
    log(`ingest_website_lead returned unexpected status: ${String(status)}`);
    return reply({ ok: false, error: 'server_error' }, 500);
  };
}
