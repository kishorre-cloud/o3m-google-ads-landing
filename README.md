# O3M Google Ads landing page

| Folder | What it is |
|---|---|
| `frontend/` | The public landing page (static HTML/CSS/JS): `/google-ads-management/`, `/thank-you/` and shared `assets/`. Deployed to Vercel. |
| `backend/` | Supabase: SQL migrations, the `submit-lead` Edge Function (TypeScript) and its tests. Stores every enquiry. See [backend/README.md](backend/README.md). |
| `crm/` | The O3M CRM the team uses to work the leads (in progress; the prototype is being connected to the backend). |
| `deploy/production/` | Prepared, inactive production configuration and the tracking guide. |
| `hyperframes-*`, `o3m-credibility-*` | Source projects for the videos used on the page. |
| `seo/`, `perf/` | Dated SEO and performance reports. |

When a visitor submits "Request a Consultation", the form posts to the backend, which saves the lead into the
O3M workspace; the visitor still lands on `/thank-you/`. The team then sees the lead in the CRM.

## Preview the frontend locally

```bash
python -m http.server 8765 --directory frontend
```

Open http://localhost:8765/google-ads-management/

## Vercel

The Vercel project for the landing page must use **Root Directory = `frontend`** (it was `website` before the folders were split).
`frontend/vercel.json` is the private-preview config (noindex). Do not change it for launch; see `deploy/production/`.

## Before launch

- The form posts to the Supabase Edge Function set in `data-endpoint` on `#enquiry-form`. Deploy the backend first ([backend/README.md](backend/README.md)); until then, submissions show the failure box.
- Google Premier Partner and 10,000+ Google Ads accounts were approved by O3M on 2026-11-04; remaining approval items are in `seo/2026-11-04/content-implementation/content-gap-and-approval-list.md`.
- `frontend/vercel.json` adds `X-Robots-Tag: noindex, nofollow` for the private Vercel preview. Remove that header before this page goes live at the primary URL.

## Tests

```bash
cd backend && node --test "tests/*.test.mjs"
```

## Re-render the video

```bash
cd hyperframes-video-source
npx hyperframes render . -q high -o renders/o3m-why-campaigns-motion.mp4
```
