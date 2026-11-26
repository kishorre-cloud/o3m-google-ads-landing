// Supabase Edge Function (Deno): receives the landing page's "Request a Consultation" form.
// Deployed with JWT verification OFF, because the visitor is anonymous. Abuse protection is in
// handler.ts (origin check, honeypot, validation) and in the database (per-visitor rate limit).
//
// Optional settings (Supabase Dashboard > Edge Functions > Secrets):
//   ALLOWED_ORIGINS      comma-separated origins allowed to post. Replaces the defaults below.
//   LEAD_WORKSPACE_SLUG  workspace that receives the leads (default: o3m)
//   RATE_LIMIT_PER_HOUR  max new leads per visitor per hour (default: 5)
//   IP_HASH_SALT         salt for hashing visitor IPs (default: derived from the service-role key)

import { createClient } from 'npm:@supabase/supabase-js@2';
import { createHandler } from './handler.ts';

const DEFAULT_ORIGINS = [
  'https://o3m-google-ads-landing.vercel.app', // Vercel deployment
  'https://o3mdm.com',                         // production
  'https://www.o3mdm.com',
  'http://localhost:8765',                     // local preview (python -m http.server 8765)
  'http://127.0.0.1:8765',
];

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const configuredOrigins = Deno.env.get('ALLOWED_ORIGINS');
const perHour = Number(Deno.env.get('RATE_LIMIT_PER_HOUR') ?? 5);

Deno.serve(
  createHandler({
    rpc: (fn, args) => supabase.rpc(fn, args),
    allowedOrigins: configuredOrigins ? configuredOrigins.split(',') : DEFAULT_ORIGINS,
    ipSalt: Deno.env.get('IP_HASH_SALT') || serviceKey,
    workspaceSlug: Deno.env.get('LEAD_WORKSPACE_SLUG') || 'o3m',
    maxPerHour: Number.isFinite(perHour) && perHour > 0 ? perHour : 5,
    log: (m) => console.error(m),
  }),
);
