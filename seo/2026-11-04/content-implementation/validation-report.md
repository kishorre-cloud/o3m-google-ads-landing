# Validation report

**Date:** 2026-11-04 (checks 10:26–10:50 UTC)
**Page:** `http://localhost:8000/google-ads-management/` (local only)
**Raw outputs:** `evidence/qa-*.json`, `evidence/lighthouse-mobile-run{1,2,3}.json`, `evidence/*.png`

## Completed checks

| Check | Method | Result |
|---|---|---|
| Build / lint / types | — | **Not applicable.** Static site with no tooling. `node --check landing.js`: pass |
| Metadata read-back | puppeteer | Title, description, canonical as intended; robots absent (indexable) |
| Heading outline | puppeteer | 1 H1; logical H2/H3; no duplicates |
| Structured data syntax | `JSON.parse` in page + Python | Valid; `@graph` = Organization, Service |
| Internal approval text | puppeteer text scan | None visible (`approvalText: false`) |
| Clichés / stuffing | grep | No banned phrases; natural keyword counts |
| Click-ID / UTM capture | puppeteer + intercepted **mock** endpoint | Landed with `gclid` and UTMs, navigated away (params gone), submitted. POST body contained gclid=TEST-GCLID-123, utm_source=google, utm_campaign=gads-mgmt, utm_term="google ads agency", landing_page without query; then the thank-you page |
| Form flow | `flow.js` | Empty submit gives 5 errors with focus on the name field; sending state; thank-you with goal; failure keeps entered data; FAQ and tabs work; 0 page errors |
| Credibility strip | `cred.js` (8 viewport and motion cases) | Video ≥1041 px, text list below and with reduced motion; text exact; no overflow |
| Footer | `footer.js` (4 widths) | Links and targets correct; nothing forbidden; no overflow |
| Responsive (new sections) | Screenshots at 1440 and 390 | No overflow; layout consistent with the existing design |
| Console | puppeteer + Lighthouse | 0 errors |
| Lighthouse mobile ×3 (lab) | Lighthouse 12.8.2 | Performance 100 / 89 / 97 (median 97); Accessibility 100; Best practices 100; SEO 100. Median FCP 1.22 s, LCP 1.22 s, TBT 202 ms, CLS 0.0006 |
| Accessibility specifics | Lighthouse | color-contrast, link-text, heading-order, crawlable-anchors: pass |
| Code review | `code-reviewer` agent | 2 findings: unguarded `URLSearchParams` (fixed, try/catch); attribution replacement rule (documented as last-touch) |
| Security review | `security-reviewer` agent | No XSS. Medium: form without `method` could leak PII via GET on JS failure (fixed). Lows: storage type check and re-cap (fixed); `?simulate=fail` (remove when endpoint is live); backend validation list (below) |

## Google Ads readiness

| Item | Status |
|---|---|
| CTA destinations | All lead to the `#enquiry` form; phone `tel:+919500123131` |
| Click ID capture | **Implemented and tested against a mock endpoint only** |
| Form endpoint | **Not configured.** Submissions are simulated. **The form is not operational.** |
| GTM / GA4 / Google Ads conversion tags | **Not implemented.** IDs and access needed (approval list B19) |
| Phone link | `tel:` present; click tracking awaits GTM |

## What the future backend must validate (from the security review)

- Allowlist field names. Cap lengths: click IDs ≤255 and `[A-Za-z0-9_-]`; UTMs ≤255; `landing_page` ≤2048 and on your own host.
- Re-validate email, mobile and goal server-side.
- Use parameterised writes, HTML-escape in admin views, and guard CSV formula injection (`= + - @`).
- Add rate limiting and a honeypot or CAPTCHA, an Origin/CORS check, HTTPS, and no raw PII in logs.
- Mention attribution data (gclid) in the privacy notice. Remove `?simulate=fail` once the endpoint is live.

## Not measured

- **Field Core Web Vitals:** no public URL; earlier PageSpeed Insights attempts returned 429.
- **Rich Results Test:** needs a public URL.
- **Localised google.co.in rankings; search volume, difficulty and CPC:** no Keyword Planner, Search Console or paid tool.
- **Manual screen-reader pass.**
- **Real lead delivery and conversion firing.**
