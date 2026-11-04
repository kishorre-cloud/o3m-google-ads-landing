# Measurement plan: organic first, paid separately

**Date:** 2026-11-04
**URL to measure:** https://o3mdm.com/solutions/google-ads-management, once the redesign is deployed there with approval.
Builds on `../measurement-plan.md`.

## Current data status

| Source | Status |
|---|---|
| Google Search Console | Not connected; no export |
| GA4 | Not connected; the local page has no tags |
| Google Keyword Planner | Not available. Volume, difficulty and CPC are "unavailable" in `keyword-research.csv` |
| Localised google.co.in results | Not available; only unlocalised WebSearch and India Google Autocomplete (existence of a query, not its volume) |
| PageSpeed Insights / CrUX | 429 earlier; no public URL. Lab Lighthouse only |

**No baseline or result number in these reports is first-party data.**

## Baseline to take before deployment (live page, last 3 months and last 28 days)

1. **Search Console:** queries and pages for the URL (clicks, impressions, CTR, average position), split by country and device; URL Inspection; Core Web Vitals report.
2. **GA4:** organic landing-page sessions, engagement rate, and key events from this page.
3. **Keyword Planner** for the primary and secondary keywords in `keyword-research.csv`, run separately for India, Chennai and Coimbatore.

## KPIs

| Type | KPI | Source |
|---|---|---|
| Organic | Clicks, impressions, CTR, average position, overall and for the primary cluster (non-brand) | Search Console, filtered to the page |
| Organic | Organic enquiries: form `generate_lead` and `phone_click` with session source = organic | GA4 |
| Organic | Organic landing-page conversion rate | GA4 |
| Quality | Qualified lead rate (qualified ÷ all enquiries), by channel | CRM, using the captured `utm_*` and `gclid` fields |
| Paid (kept separate) | Google Ads conversions, cost per conversion, cost per qualified lead | Google Ads + CRM (offline import optional) |
| Experience | Core Web Vitals field status for the URL | Search Console / CrUX |

## Tracking to implement before launch (blocked on IDs and endpoint)

| Item | Detail |
|---|---|
| Container | GTM (reuse `GTM-KFG4JJ9` or a new one: O3M's decision) |
| GA4 events | `generate_lead` **only on confirmed form success** (thank-you load or a success event), with a `goal` parameter; `phone_click` on `tel:` |
| Google Ads | Primary "Lead form" conversion; secondary "Phone click"; conversion linker; enhanced conversions for leads if consent allows |
| Consent | Consent Mode v2, consistent with the o3mdm.com banner |
| CRM | Store `gclid`/`gbraid`/`wbraid` and UTMs per lead; these already arrive in the form POST |

## Timing

Deploy → request indexing → check canonical and indexing at 1–2 weeks → compare at **4, 8 and 12 weeks** against the baseline (same weekdays; year-on-year where seasonal). **No verdict before 8 weeks**, and no ranking claims without Search Console data.

## Checkpoint template

| Metric | Baseline (dates) | Checkpoint (dates) | Change | Note |
|---|---|---|---|---|
| Organic clicks | | | | |
| Organic impressions | | | | |
| Organic CTR | | | | |
| Avg position, primary cluster | | | | |
| Organic enquiries | | | | |
| Organic landing-page conversion rate | | | | |
| Qualified lead rate (organic) | | | | |
| Paid conversions (separate) | | | | |
| CWV status (mobile) | | | | |
