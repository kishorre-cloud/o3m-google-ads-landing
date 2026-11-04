# Measurement plan — Google Ads Management page

Date: 2026-11-04
Page: https://o3mdm.com/solutions/google-ads-management

## First-party baseline: not available yet

No Google Search Console or GA4 connection or export was available in this session, so there is **no first-party baseline**. Nothing in these reports is GSC or GA4 data. Any third-party or public evidence (PageSpeed Insights, observed search results) is recorded separately in `baseline-audit.md` and `competitor-analysis.md` and must not be read as actual search performance.

## What to export before any change goes live

Export each of these for the exact URL above, for the last 3 months and the last 28 days.

| Source | Report | Fields |
|---|---|---|
| Search Console | Performance → Search results, filtered to the page | Queries: clicks, impressions, CTR, average position |
| Search Console | Same, by Countries and by Devices | Clicks, impressions, CTR, position |
| Search Console | URL Inspection for the page | Index status, Google-selected canonical, last crawl, mobile usability |
| Search Console | Page indexing; Enhancements (Breadcrumbs, FAQ if present) | Errors or warnings for this URL |
| Search Console | Core Web Vitals (mobile and desktop) | URL group status for LCP, INP, CLS |
| GA4 | Landing page report, filtered to the page and Session default channel group = Organic Search | Sessions, engaged sessions, engagement rate |
| GA4 | Key events from those sessions | Consultation form submits, phone clicks (`tel:`), thank-you page views |
| Google Ads | Keyword Planner, India and Chennai/Coimbatore locations | Avg. monthly searches and competition for the phrases in `keyword-research.csv` |

Save the raw exports beside this file, for example in `evidence/gsc-baseline-YYYY-MM-DD.csv`.

## KPIs

**Primary**
- Organic key events from this page: form submits and phone clicks.
- Organic clicks to this page from non-brand queries in the primary cluster in `keyword-map.md`.

**Secondary**
- Impressions and average position for the primary and secondary query themes.
- CTR on the page's top 20 queries, to judge whether the title and description changes work.
- Organic engagement rate on this page.
- Core Web Vitals status for this URL group (field data).

**Guardrails**
- Paid landing-page conversion rate stays flat or improves. SEO edits must not harm the consultation flow.
- No new indexing errors for the URL.

## Timing

1. Take the baseline exports on the day before deployment.
2. Note the deployment date, and request indexing in URL Inspection.
3. Check indexing and the Google-selected canonical after 1–2 weeks.
4. Compare performance at 4, 8 and 12 weeks after deployment, using the same weekdays and periods of equal length. Compare with the same period last year, if available, to account for seasonality.
5. Give no verdict before 8 weeks. Search changes take time to be crawled and settle, and rankings cannot be guaranteed.

## Report template (per checkpoint)

| Metric | Baseline (dates) | Checkpoint (dates) | Change | Note |
|---|---|---|---|---|
| Organic clicks (page) | | | | |
| Impressions (page) | | | | |
| CTR (page) | | | | |
| Avg. position, primary cluster | | | | |
| Non-brand clicks, primary cluster | | | | |
| Organic sessions (GA4) | | | | |
| Organic key events (GA4) | | | | |
| CWV status (mobile) | | | | |

Add: what changed on the page in this period (from `implementation-log.md`), other site changes or Google updates during the period, and the next actions.
