# Validation report

**Date:** 2026-11-04 (checks ran 09:40–09:43 UTC)
**Page tested:** `http://localhost:8000/google-ads-management/` (local redesign, served by `python -m http.server`)
**Not tested here:** the live page. It was audited but not changed (see `baseline-audit.md`).

## Build, lint, types

- The site is static HTML, CSS and JS: there is no `package.json`, no build, no lint and no type-check.
- **Not run:** nothing exists to run.

## Metadata, crawl and structured data

Tool: Lighthouse 12.8.2 via `npx`, mobile, simulated throttling. Raw output: `evidence/lighthouse-local-mobile-after.json`, fetchTime 2026-11-04T09:42:47Z.

| Check | Result |
|---|---|
| `document-title` | Pass |
| `meta-description` | Pass |
| `canonical` | Pass (absolute URL, one tag) |
| `is-crawlable` | Pass |
| `errors-in-console` | Pass (the favicon 404 is gone) |
| JSON-LD | Parses as valid JSON with `@type` Service. Lighthouse's `structured-data` audit is manual-only and gives no score. |

**Not run: Google Rich Results Test and Schema Markup Validator.** Both need a public URL or a manual paste. **Next step:** paste the `<script type="application/ld+json">` block into https://validator.schema.org.

## Performance (lab only)

Lighthouse mobile, simulated throttling, local Python server (no compression or caching), so the numbers are indicative only.

| Metric | Before (audit, 09:35Z) | After (09:42Z) |
|---|---|---|
| Performance score | 88 | 92 |
| FCP | 2.7 s | 2.3 s |
| LCP | 3.2 s | 2.3 s |
| TBT | 0 ms | 170 ms |
| CLS | 0 | 0.001 |
| Accessibility / Best practices / SEO | 100 / 96 / 100 | 100 / 100 / 100 |

The head edits do not change page weight or render-blocking resources. The FCP/LCP/TBT differences are most likely run-to-run lab variance, not an improvement from these edits. The best-practices change from 96 to 100 is real: it is the favicon fix.

**Field Core Web Vitals (LCP, INP, CLS): unavailable.** The PageSpeed Insights API returned 429 (daily quota), and Chrome UX Report data for this URL was not retrieved. INP cannot be measured in a lab run. Re-run PSI with an API key, or read the Search Console Core Web Vitals report.

## Regression (puppeteer + system Chrome, headless)

| Suite | What it checks | Result |
|---|---|---|
| `flow.js` | Empty-submit validation (5 errors, focus moves to the first field), sending state, redirect to thank-you, failure state keeps entries, FAQ toggle, reduced-motion video | Pass, 0 page errors |
| `cred.js` | Credibility strip: video at 1041px and wider, text list below 1041px and with reduced motion, no horizontal overflow, the five statements exact | Pass at 8 viewport and motion combinations |
| `footer.js` | Footer links and targets, no excluded links, no overflow at 1440/1920/768/390 | Pass, 0 errors |

## Link check

The baseline audit (`evidence/live-link-status.txt`, `evidence/local-and-asset-status.txt`) found every internal and external link returns 200. The exceptions are the live page's Facebook link (400) and LinkedIn link (403 to a login wall). Both look like bot blocking; check them in a browser. The local redesign has neither link.

## Accessibility

Lighthouse accessibility score: 100 (automated checks only). No manual screen-reader pass was done in this SEO task. The head-only changes affect nothing a screen reader reads.

## Responsive

Covered by `cred.js` and `footer.js` at 390, 768, 1040, 1041, 1440 and 1920 px: no horizontal overflow. The layout was not changed.
