# Technical SEO audit (rechecked)

**Date:** 2026-11-04 (checks 11:20–11:40 UTC)
**Page:** `http://localhost:8000/google-ads-management/`. Static HTML served by `python -m http.server`; not hosted.
**Tools:** Lighthouse 12.8.2 via npx (mobile ×3, desktop ×1), puppeteer with system Chrome, Python.

**All performance numbers are lab data, not field Core Web Vitals.** No public URL exists and no CrUX or PageSpeed Insights data was obtained.

| Item | Result | Evidence |
|---|---|---|
| Status code | 200 (local server); no redirects | curl |
| Indexability | No robots meta, so indexable (intended for the production URL) | QA read-back |
| Canonical | `https://o3mdm.com/solutions/google-ads-management` (the one official URL) | QA; Lighthouse `canonical` pass |
| Title / description | 58 / 159 chars; unique | QA |
| H1/H2/H3 | 1 H1 (contains "Google Ads management"); logical; Lighthouse `heading-order` pass | QA outline |
| Internal and external links | All crawlable `<a href>`; new: "How AdFlux works" → /technology/adflux. Destinations were checked 200 on 2026-11-02/04 | Lighthouse `crawlable-anchors`, `link-text` pass |
| Crawlable HTML | All copy, FAQ answers and card text in static HTML; icons are decorative SVG | `../2026-11-04/content-implementation/evidence/page-copy-extract.md` |
| Sitemap / robots | Not in the local project (static folder with no host). Production o3mdm.com already lists the URL | `../2026-11-04/evidence/sitemap-urls.txt` |
| Mobile | No horizontal overflow at 390 / 768 / 1040 / 1041 / 1440 / 1920 | QA suites |
| Images | 2 logo PNGs (alt set), video posters JPG. **The 1.36 MB illustration from the earlier audit is on the live page, not in this project** | file listing |
| Fonts | Google Fonts CSS loads without blocking render (`media=print` swap); `display=swap` | head |
| Layout stability | Lighthouse CLS 0.0006 (mobile) / 0.0035 (desktop). In a reduced-motion puppeteer run, CLS 0.08 from the header/hero font swap. That is pre-existing and not in the cards; mitigation option: a `size-adjust` fallback font | QA |
| Lab performance, mobile (median of 3) | Performance 99 · FCP 1.21 s · LCP 1.21 s · TBT 100 ms · CLS 0.0006 | `evidence/lighthouse-mobile-run{1,2,3}.json` |
| Lab performance, desktop | Performance 100 · LCP 0.31 s · TBT 0 · CLS 0.0035 | `evidence/lighthouse-desktop.json` |
| Accessibility | Lighthouse 100; `color-contrast`, `target-size`, `image-alt` pass; keyboard focus visible on card links; reduced motion respected | Lighthouse, why.js |
| **Green contrast concern from the earlier audit** | **Live page only.** Local passes contrast | Lighthouse |
| Structured data | `@graph` of Organization + Service. Valid JSON. `parentOrganization` removed (relationship unconfirmed). No ratings, reviews, awards or FAQPage | QA |
| Social metadata | og:title / description / url / type / site_name / locale, twitter:card. **No og:image: no approved image** | head |
| Console | 0 errors (puppeteer, Lighthouse `errors-in-console` pass) | QA |

## Earlier findings rechecked

| Earlier finding | Now |
|---|---|
| Mobile lab LCP about 5 s | Live page only (Next.js source not available). Local: 1.2 s lab |
| 1.36 MB illustration | Live page only |
| Green button/link contrast | Live page only; local passes |
| Incomplete social image | Still open: needs an approved 1200×630 image |
| Form endpoint empty | **Still pending.** Submissions are simulated |
