# Technical SEO audit: before and after

**Page:** `http://localhost:8000/google-ads-management/` (local static HTML/CSS/JS, `python -m http.server`). Not hosted.
**Before** = the baseline audit (`../baseline-audit.md`, 09:28–09:36 UTC) plus state before this task. **After** = this task (10:26–10:45 UTC, 2026-11-04).
**Tools:** Lighthouse 12.8.2 via npx (mobile, simulated throttling), puppeteer-core with system Chrome (headless), Python parsers.

**All performance numbers are lab numbers.** No field data (CrUX / real-user Core Web Vitals) was obtained: PageSpeed Insights returned HTTP 429 in the baseline, and the local page is not public.

| # | Item | Before | After | Evidence |
|---|---|---|---|---|
| 1 | HTTP status | 200 (local) | 200 (local) | curl |
| 2 | Indexability | No robots meta (indexable by default) | Unchanged: indexable, as required for the primary URL | `qa-seo-content-results.json` |
| 3 | Robots directives | None | None. Production must stay `index, follow`; any future staging host must send `noindex` | — |
| 4 | Canonical | `https://o3mdm.com/solutions/google-ads-management` (added earlier today) | Same; self-referencing once served there | QA read-back |
| 5 | Sitemap | Live URL is in o3mdm.com/sitemap.xml | N/A locally (no host) | `../evidence/sitemap-urls.txt` |
| 6 | Crawlable links | 45 links, anchors fine | All `<a href>`; 3 new contextual internal links; Lighthouse `crawlable-anchors` pass | Lighthouse run1 |
| 7 | Mobile responsiveness | No overflow | No overflow at 390/768/1040/1041/1440/1920 | cred / footer / seo QA |
| 8 | Semantic HTML | OK | New section uses `section` / `h2` / `ul` / `li`; FAQ buttons inside `h3` | outline read-back |
| 9 | Rendering | Content is in the static HTML; no JS needed for copy | Same: all copy, FAQ answers and service panels are in the HTML (hidden panels are still in the DOM) | `page-copy-extract.md` |
| 10 | Heading hierarchy | One H1; logical H2/H3 | One H1 containing "Google Ads management"; Lighthouse `heading-order` pass | QA outline |
| 11 | Duplicate metadata | — | Title and description unique on the page; `og:` tags mirror them | — |
| 12 | Broken links | All 200 (baseline) | New links (/technology/adflux, both industry pages, the Google Partners profile) were checked 200 on 2026-11-02/04 | `../evidence/live-link-status.txt`, evidence agent |
| 13 | Image optimisation | 1 PNG logo (64 KB), video posters (JPG) | Unchanged. The 1.36 MB PNG is on the **live** page only, not in the redesign | — |
| 14 | JS/CSS loading | 3 deferred scripts; o3m.css render-blocking | Unchanged (o3m.css is the critical CSS) | — |
| 15 | Font loading | Google Fonts CSS render-blocking (~874 ms est., baseline) | **Fixed:** loaded with `media="print" onload` and a `noscript` fallback. Lighthouse render-blocking savings down to 40 ms | Lighthouse run1 |
| 16 | Core Web Vitals (lab) | Mobile: FCP 2.7 s, LCP 3.2 s, TBT 0 ms, CLS 0 (single run) | Mobile, median of 3: **FCP 1.22 s, LCP 1.22 s, TBT 202 ms, CLS 0.0006**, Performance 97 (runs: 100 / 89 / 97) | `lighthouse-mobile-run1-3.json` |
| 17 | Accessibility | Lighthouse 100 | Lighthouse 100; `color-contrast` pass; new links have descriptive text; the Partners link announces "opens in a new tab" | Lighthouse |
| 18 | Structured data | `Service` only | `@graph`: **Organization** (legal name, logo, foundingDate 2010, phone, 2 verified addresses, parent Boonze 2005) + **Service** (provider = Organization, areaServed India). Valid JSON. No ratings, reviews or awards. | QA read-back |
| 19 | Social metadata | og:title / description / url / type / site_name / locale, twitter:card | Updated to the new description. **No og:image:** no approved image (approval list B17) | — |
| 20 | Console errors | Favicon 404 (fixed earlier today) | None (Lighthouse `errors-in-console` pass; puppeteer 0 errors) | — |
| 21 | Visible internal approval text | "Wording needs O3M approval" badge visible | **Removed** (and its CSS) | QA: `approvalText: false` |
| 22 | Form PII safety on JS failure | `<form>` had no method, so a JS failure would GET the fields into the URL | `method="post"` added; tracking script guarded with try/catch | Code and security review |

## Previous findings rechecked

| Earlier finding | Status now |
|---|---|
| Live mobile lab LCP about 5 s | **Live page only.** It needs the Next.js source; untouched. Local lab LCP is 1.2 s. |
| 1.36 MB illustration | Live page only; not in the redesign. |
| Green button/link contrast | Live page only. Local passes Lighthouse contrast. |
| No approved social image | Still open (B17). |
| Title, description, canonical, social tags, favicon, Service schema on local | Present; description and schema improved. |
| PageSpeed Insights 429 | Not retried. Field data is still unavailable; it needs a public URL plus an API key, or CrUX after launch. |
| Form endpoint empty / simulated | **Still open** (B18). The form is **not operational**. Click-ID capture was verified only against a mock endpoint. |

## Not checked

Server headers, compression and caching: Python's server is not representative and there is no host yet. Google Rich Results Test: it needs a public URL. A manual screen-reader pass.
