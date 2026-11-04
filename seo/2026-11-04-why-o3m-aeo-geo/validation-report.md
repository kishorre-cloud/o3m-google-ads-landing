# Validation report

**Date:** 2026-11-04 (final run about 11:45 UTC)
**Page:** `http://localhost:8000/google-ads-management/` (local only)
**Browser:** headless Chrome via puppeteer. Scripts are in `C:\Claude\_qa\` (`why.js`, `flow.js`, `footer.js`, `cred.js`, `seo-content.js`); raw results are in `evidence/qa-*.json`.

## Why O3M cards (actual browser output)

| Check | 1440 | 768 | 390 | 1440 reduced motion |
|---|---|---|---|---|
| Grid | 3×2 | 2×3 | 1×6 | 3×2 |
| Reveal | Staggered fade-up (0.42 → 0.17 → 0 at 120 ms) | Same | Same | None; visible at load |
| Hover lift + bar | −4 px, bar full, border `#BFDBFE` | n/a (touch) | n/a (touch) | No lift; bar and border change only |
| Keyboard focus on card link | 2 px `#1D4ED8` outline, card lift, bar full | — | — | Outline; no lift |
| 3D tilt on why-cards | None (disabled) | — | — | — |
| Horizontal overflow | 0 | 0 | 0 | 0 |
| Console errors | 0 | 0 | 0 | 0 |
| CLS | 0.0034 | 0 | 0 | 0.0825 (header/hero font swap, not the cards) |

## Regression

| Suite | Result |
|---|---|
| Form flow | Validation (5 errors, focus moves to the name field), sending state, thank-you page with goal, failure state keeps entries, FAQ toggle, tabs: **pass**, 0 errors |
| Credibility strip | 8 viewport and motion cases: video/list switching correct, statements exact, no overflow: **pass** |
| Footer | Links, targets, nothing forbidden, no overflow at 4 widths: **pass** |
| Click-ID capture | gclid and UTMs posted to a **mock** endpoint after navigation: **pass** |
| Internal approval text visible | None |

## SEO / technical

| Check | Result |
|---|---|
| Lighthouse mobile ×3 (lab) | Performance 99/99/100; Accessibility, Best Practices and SEO 100. Median FCP and LCP 1.21 s, TBT 100 ms, CLS 0.0006 |
| Lighthouse desktop (lab) | 100 / 100 / 100 / 100; LCP 0.31 s |
| Audits passed | canonical, document-title, meta-description, heading-order, link-text, crawlable-anchors, image-alt, color-contrast, target-size, errors-in-console |
| JSON-LD | Valid; Organization + Service |
| Content review | No clichés from the brief's list; no unsupported claims (each mapped in `why-o3m-content.md` / `claims-and-entity-register.md`); FAQ answers lead with the answer |

## Google Ads readiness (status, not claims)

| Item | Status |
|---|---|
| One primary URL | Canonical points to it |
| CTA and form | Present and validated |
| gclid / gbraid / wbraid / UTM | Captured and posted (mock-tested) |
| **Form endpoint** | **Pending.** Submissions are simulated |
| **GTM / GA4 / Google Ads conversions, call-click tracking** | **Pending.** Not implemented; IDs needed |

## Not validated

- Field Core Web Vitals (no public URL).
- Google Rich Results Test (needs a public URL).
- Real lead delivery.
- AI assistants (ChatGPT, Gemini, Perplexity, AI Overviews): no access.
- A manual screen-reader pass.
- Real touch devices (touch was emulated).
