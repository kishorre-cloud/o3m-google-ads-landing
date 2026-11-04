# Measurement plan: organic SEO, AEO/GEO and future Google Ads

**Date:** 2026-11-04
**URL:** https://o3mdm.com/solutions/google-ads-management (after approved deployment)
Builds on `../2026-11-04/content-implementation/measurement-plan.md`.

## Current data status

| Source | Status |
|---|---|
| Search Console, GA4, Keyword Planner | **Not connected.** No first-party baseline. All volume, difficulty and CPC values are "unavailable" |
| PageSpeed Insights / CrUX | Not obtained (earlier 429; no public URL). Lab Lighthouse only |
| Localised search results | Firecrawl country=India only (city level not possible); WebSearch is not localised |
| AI assistants | Not tested (no access) |

## 1. Organic SEO

| KPI | Source | Cadence |
|---|---|---|
| Clicks, impressions, CTR, average position (page; primary and secondary clusters; non-brand) | Search Console | Monthly; compare at 4 / 8 / 12 weeks |
| Organic enquiries (`generate_lead`, `phone_click` where source = organic) | GA4 | Monthly |
| Organic landing-page conversion rate | GA4 | Monthly |
| Qualified lead rate from organic | CRM using captured UTM fields | Monthly |
| Core Web Vitals field status | Search Console / CrUX | Monthly |

**Baseline:** export the live page's last 3 months before deployment. **No verdict before 8 weeks.**

## 2. AEO / GEO (observational; not a ranking metric)

- **Monthly:** re-run `evidence/aeo-query-set.md` (23 prompts) and the 12 queries in `evidence/geo-baseline-observations.md`. Use the same tools and settings, and log the date and time.
- **Record for each run:**
  - whether O3M is mentioned or linked, and its position in the returned list
  - fact accuracy against `claims-and-entity-register.md`: founded 2010, Boonze relationship, offices, Premier Partner 2026, AdFlux definition
  - competitors and directories present
- **Manual AI-assistant checks** (ChatGPT, Gemini, Perplexity, Google AI Overviews / AI Mode), only where accounts are available. Record the prompt, date, answer excerpt, whether O3M is cited, and the cited URLs. Label these as manual, small-sample observations.
- **Entity hygiene tracker:** count of resolved off-page contradictions (o3m.in, Justdial, Google Business Profile phone, email, The Media Ant, partner naming) and new directory profiles (Clutch, GoodFirms).
- **Search Console** queries containing "o3m" / "adflux": branded demand trend.

## 3. Future Google Ads (kept separate from organic)

| Item | Requirement before launch |
|---|---|
| Form endpoint | Connected, validated server-side, leads land in the CRM with gclid / gbraid / wbraid / UTM |
| GTM | Container chosen (reuse `GTM-KFG4JJ9` or new) |
| GA4 | `generate_lead` on confirmed success only; `phone_click` on `tel:` |
| Google Ads | Primary "Lead form" and secondary "Phone click" conversions; enhanced conversions for leads if consent allows; Consent Mode v2 |
| Offline import (optional) | Qualified-lead and sale stages from the CRM, if O3M confirms the capability |
| KPIs | Conversions, cost per conversion, cost per qualified lead, qualified lead rate, all reported separately from organic |

## Checkpoint template

| Metric | Baseline | Checkpoint | Change | Note |
|---|---|---|---|---|
| Organic clicks / impressions / CTR | | | | |
| Avg position (primary cluster) | | | | |
| Organic enquiries / conversion rate | | | | |
| Qualified lead rate (organic) | | | | |
| AEO/GEO: queries with O3M present (of 12 / 23) | 3 / 12 (branded only, Firecrawl, 2026-11-04) | | | |
| Entity contradictions open | 8 (see register) | | | |
| Paid conversions / cost per qualified lead (separate) | | | | |
