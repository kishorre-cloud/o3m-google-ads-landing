// Pure validation for the enquiry form. No Deno or network APIs here, so it can be unit-tested
// with plain Node (see backend/tests/validate.test.mjs).
//
// The rules mirror the browser checks in frontend/assets/js/landing.js (validate()). The browser
// check is a convenience; this one is the real gate, because anyone can POST to the endpoint.

export const GOALS = ['leads', 'ecom', 'both', 'unsure'] as const;
export const SPENDS = ['none', 'lt1', '1to5', '5to20', 'gt20', 'discuss'] as const;

export const TRACKING_KEYS = [
  'gclid', 'gbraid', 'wbraid',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'landing_page',
] as const;

export type LeadRow = {
  lead_id: string | null;
  name: string;
  email: string;
  mobile: string;
  company: string;
  goal: (typeof GOALS)[number];
  website: string | null;
  spend: string | null;
  industry: string | null;
  message: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  landing_page: string | null;
};

export type ValidationResult =
  | { ok: true; value: LeadRow }
  | { ok: false; errors: Record<string, string> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WEBSITE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i;
const LEAD_ID = /^[a-z0-9]{6,40}$/i;
// Control characters Postgres text cannot hold (NUL) or that have no place in a form value.
// Tab, newline and carriage return are kept (the message box may contain them).
// deno-lint-ignore no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function clean(v: unknown, max: number): string {
  return typeof v === 'string' ? v.replace(CONTROL, '').trim().slice(0, max) : '';
}

function optional(v: unknown, max: number): string | null {
  const s = clean(v, max);
  return s === '' ? null : s;
}

export function validateLead(input: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  const name = clean(input.name, 200);
  if (name.length < 2) errors.name = 'Enter your full name.';

  const email = clean(input.email, 254);
  if (!EMAIL.test(email)) errors.email = 'Enter a valid email.';

  const mobile = clean(input.mobile, 40);
  const digits = mobile.replace(/[^0-9]/g, '');
  if (digits.length < 10 || digits.length > 15 || /[^0-9+\-\s()]/.test(mobile)) {
    errors.mobile = 'Enter a valid mobile number (10-15 digits).';
  }

  const company = clean(input.company, 200);
  if (company.length < 2) errors.company = 'Enter your company name.';

  const goal = clean(input.goal, 20);
  if (!(GOALS as readonly string[]).includes(goal)) errors.goal = 'Choose your primary goal.';

  const website = optional(input.website, 300);
  if (website && !WEBSITE.test(website)) errors.website = 'Enter a valid website.';

  const spend = optional(input.spend, 20);
  if (spend && !(SPENDS as readonly string[]).includes(spend)) errors.spend = 'Unknown spend range.';

  if (Object.keys(errors).length) return { ok: false, errors };

  const leadId = clean(input.lead_id, 40);

  const row: LeadRow = {
    lead_id: LEAD_ID.test(leadId) ? leadId : null,
    name,
    email,
    mobile,
    company,
    goal: goal as LeadRow['goal'],
    website,
    spend,
    industry: optional(input.industry, 100),
    message: optional(input.message, 2000),
    gclid: null,
    gbraid: null,
    wbraid: null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
    landing_page: null,
  };
  for (const k of TRACKING_KEYS) row[k] = optional(input[k], 500);

  return { ok: true, value: row };
}
