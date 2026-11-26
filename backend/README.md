# Backend: lead storage for the O3M landing page

Everything server-side lives in this folder. The landing page itself is in `../frontend/`.

```
backend/
├── supabase/
│   ├── migrations/            SQL: tables, security rules, lead intake function (run in order)
│   ├── functions/submit-lead/ TypeScript Edge Function the form posts to
│   │   ├── index.ts           wiring (Deno + Supabase client)
│   │   ├── handler.ts         request handling: CORS, honeypot, validation, calls the database
│   │   └── validate.ts        field rules (same as the browser, enforced again here)
│   └── config.toml            submit-lead runs without a login (visitors are anonymous)
├── tests/                     unit tests for the handler and validator
└── package.json               marks the folder for the Node test runner; nothing to install
```

## How a lead travels

```
Visitor fills the form  ──►  frontend/assets/js/landing.js  (checks, then POSTs multipart/form-data)
                                   │
                                   ▼
                      Supabase Edge Function  submit-lead
                      origin check · spam trap · validation · IP hashed
                                   │  calls
                                   ▼
                      public.ingest_website_lead()   (database function, service role only)
                      duplicate check · 5-per-hour limit · insert lead · timeline entry
                                   │
                                   ▼
                      leads / lead_activities  in the "O3M Directional Marketing" workspace
                                   │
                                   ▼
                      O3M CRM (crm/) reads them under row-level security
```

The browser never gets database access. `anon` (logged-out) has no rights on any table.

## What the function checks

| Check | Result |
|---|---|
| Origin not on the allow-list | 403 |
| Method other than POST / OPTIONS | 405 |
| Body over 50 KB or unsupported type | 413 / 400 |
| Hidden `bot_field` filled in | 200, nothing stored (bots learn nothing) |
| Field rules fail (name, email, mobile, company, goal, website, spend) | 400 with per-field messages |
| Same `lead_id` sent again | 200, stored once |
| More than 5 new leads from one visitor in an hour | 429 |
| Database error | 500, generic message, nothing about the visitor is logged |

Visitor IPs are stored only as a salted SHA-256 hash, used for the rate limit.

## Settings (all optional)

Set in Supabase Dashboard > Edge Functions > Secrets.

| Name | Default | Purpose |
|---|---|---|
| `ALLOWED_ORIGINS` | the Vercel URL, `o3mdm.com`, `localhost:8765` | Comma-separated sites allowed to post. **Replaces** the defaults when set. |
| `LEAD_WORKSPACE_SLUG` | `o3m` | Workspace that receives the leads |
| `RATE_LIMIT_PER_HOUR` | `5` | New leads per visitor per hour |
| `IP_HASH_SALT` | derived from the service-role key | Salt for the IP hash |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to the function automatically. Never put the service-role key in the frontend.

## Set up on a Supabase project

1. **Database.** Run the files in `supabase/migrations/` in order (Dashboard > SQL Editor, or `supabase db push`).
2. **Function.** Deploy `supabase/functions/submit-lead` with JWT verification **off**:
   ```
   supabase functions deploy submit-lead --no-verify-jwt --project-ref <project-ref>
   ```
3. **Frontend.** Put the function URL in `data-endpoint` on `#enquiry-form` in `frontend/google-ads-management/index.html`:
   `https://<project-ref>.supabase.co/functions/v1/submit-lead`
4. **Add your team** (after they have logins in Supabase Auth > Users):
   ```sql
   select public.add_member_by_email('o3m', 'person@o3mdm.com', 'owner');
   -- role keys: owner | manager | sales_agent | receptionist
   ```
5. Supabase Auth > Providers > Email: **turn off sign-ups** so only people you create can log in.

The project currently targeted is **O3M-CRM-Dev** (`qldgkjpohjsjuwfcskug`). To use a different project, repeat steps 1-4 there and change the URL in step 3.

## Tests

```
cd backend
node --test "tests/*.test.mjs"
```

Needs Node 22.18 or newer (it reads the `.ts` files directly). No packages to install.

## Changing the follow-up rule

New landing-page leads get a follow-up due one day later, with the note "Call back about the Google Ads consultation request". That is in `ingest_website_lead()` in `20261126010000_crm_core.sql`; change it with a new migration, not by editing the applied one.
