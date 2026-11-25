# Technical indexability: Google Ads Management landing page

**Date:** 2026-11-16. **Method:** the installed `claude-seo:seo-technical` skill (v2.6.2), its scripts, and curl. Raw outputs are in `evidence/`.

## 1. Environments

| | Vercel preview `o3m-google-ads-landing.vercel.app/google-ads-management/` | Intended production `https://o3mdm.com/solutions/google-ads-management` |
|---|---|---|
| HTTP for Googlebot UA | **302 → `vercel.com/sso-api`** (Vercel Authentication) | 200, `text/html` (this is still the **current live page**, not the new one) |
| Header `X-Robots-Tag` | `noindex, nofollow` from `website/vercel.json` (unchanged; seen on the authenticated fetch of the 406a0b1 deployment) | none |
| Meta robots | none in the new page source | `index, follow` (current live page) |
| Canonical | `https://o3mdm.com/solutions/google-ads-management` | same (self-referencing) |
| robots.txt | 302 to SSO (not crawlable; intended) | 200: `User-Agent: *` / `Allow: /` / `Sitemap: https://o3mdm.com/sitemap.xml`. Valid; blocks nothing |
| Sitemap (`sitemap_discovery.py --json`) | n/a | `found`: `https://o3mdm.com/sitemap.xml`, declared in robots.txt, 200, urlset, **valid**. The canonical URL is listed (1 match). No preview host appears |

**Assessment:** the preview is deliberately private and noindex, and that was kept. The sign-in redirect is not evidence that production will be non-indexable. Nothing points crawlers at the preview: the canonical, the sitemap and robots.txt all use o3mdm.com.

## 2. Page checks (local source, `localhost:8000`)

| Check | Result |
|---|---|
| Status / redirects | 200, no redirect chain (`render_page.py`) |
| Raw HTML content (`agentic_check.py`) | 2,969 words without JavaScript. This is a static page with no SPA framework (`is_spa: False`) |
| Raw vs rendered (Puppeteer, desktop 1440 and mobile 390) | Title, canonical and meta robots are identical in raw, desktop and mobile. 1 H1, 16 H2, 35 H3 in all three. JSON-LD is identical (CRLF only) |
| `render_page.py --mode always` | **Failed:** "playwright error: BrowserContext.new_page: Target crashed". `js_gap` is null, so the skill's `agentic_check.py` fallback and the Puppeteer comparison above were used instead |
| Mobile/desktop parity | Same headings, FAQ (10), structured data and robots. No horizontal overflow at either width |
| Content behind interaction | The 10 FAQ answers and 5 of the 6 campaign panels are in the raw HTML but carry `hidden` until clicked (`parse_html.py`: 2,414 chars hidden by attribute). Google indexes such content, but it is less likely to be used for "read more" deep links. This is a design choice; content was not changed (see the summary) |
| Images and video | Covered by the 2026-11-05 and 2026-11-11 work (lazy why-video, phone credibility video loaded on scroll, posters in WebP). Not redone |
| Core Web Vitals | **Lab only:** Lighthouse mobile median 93 on 2026-11-11 (A/B, same as HEAD). **Field data (CrUX / Search Console): not available**, because the page is not public |

## 3. Security and transport (`transport_check.py https://o3mdm.com/`)

- TLSv1.3, certificate valid (59 days left at check time), HTTP redirects to HTTPS.
- Low: `hsts-weak`, the Strict-Transport-Security header is weak.
- Low: `csp-report-only`, the Content-Security-Policy is report-only.

These are security and trust items on the production host, not ranking factors, and they are outside this project.

## 4. AI crawler access

Production `robots.txt` has only a `User-agent: *` / `Allow: /` group, so every crawler that obeys robots.txt is allowed. No crawler-specific rules exist. The preview is closed to all crawlers by Vercel Authentication.

| User-agent | What it governs | Production (o3mdm.com) | Preview |
|---|---|---|---|
| Googlebot | Google Search indexing, including AI Overviews / AI Mode eligibility | Allowed | Blocked (SSO) |
| Google-Extended | Gemini / Vertex training and grounding (no effect on Search or AI Overviews) | Allowed | Blocked (SSO) |
| OAI-SearchBot | ChatGPT Search citability | Allowed | Blocked (SSO) |
| GPTBot | OpenAI model training only | Allowed | Blocked (SSO) |
| ChatGPT-User | User-triggered browsing (robots.txt "may not apply") | n/a (user-triggered) | Blocked (SSO) |
| Claude-SearchBot | Claude search citability | Allowed | Blocked (SSO) |
| ClaudeBot | Anthropic model training only | Allowed | Blocked (SSO) |
| PerplexityBot | Perplexity search index | Allowed | Blocked (SSO) |
| Applebot | Siri / Spotlight / Safari discovery | Allowed | Blocked (SSO) |
| Applebot-Extended | Apple Intelligence training opt-out label (does not crawl) | Not opted out | n/a |
| CCBot, Bytespider | Training datasets | Allowed | Blocked (SSO) |

No change was made or recommended. Whether to block training-only crawlers (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, Bytespider) is an O3M licensing decision, not an SEO fix. Blocking them would not affect search citability, which is governed by the search crawlers listed separately above. Allowing a crawler does not guarantee citations or traffic.

## 5. llms.txt and licensing

- `https://o3mdm.com/llms.txt` returns 404 (an HTML 404 page). This is reported only. Google states that Search ignores llms.txt, so it is not a fix, and it was not created.
- RSL licensing: none found. It is optional policy work.

## 6. Severity summary

- **Critical / High:** none.
- **Medium:** none for the page itself.
- **Release blockers** (production only): see `IMPLEMENTATION-SUMMARY.md` section 5.
- **Low:** weak HSTS and report-only CSP on o3mdm.com (host-level).
- **Info:** FAQ and tab content hidden behind clicks; `render_page.py` crash (environment).
