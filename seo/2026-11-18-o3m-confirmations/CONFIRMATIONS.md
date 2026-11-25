# O3M business confirmations (2026-11-18)

O3M has confirmed the three facts below. They are closed and should not be raised again. They replace the "O3M confirmation required" items on the same topics in earlier reports (`2026-11-04-why-o3m-aeo-geo/claims-and-entity-register.md`, `2026-11-16-schema-technical-geo/SCHEMA-REPORT.md`, and the 2026-11-17 SEOMODE audit).

| # | Fact confirmed by O3M | How the page uses it | Change made |
|---|---|---|---|
| 1 | "10,000+ Google Ads accounts" refers to O3M only, not the Boonze group | One visible statement, in the credibility strip (`index.html` line 518, plus the strip videos): "10,000+ Google Ads accounts". It sits in O3M's strip with no group attribution and no timeframe | None. No timeframe added and the meaning not widened. It is not in the JSON-LD |
| 2 | O3M is currently an active Google Premier Partner | Credibility strip, Why O3M card 4, and the footer. Each links to https://www.google.com/partners/agency?id=5398339560 | None. Profile re-checked with Firecrawl on 2026-11-18 (live fetch, HTTP 200). It shows the 2026 Premier status (the page rendered in German as "2026 Premium-Partner") |
| 3 | Boonze Media Solutions is the parent company; O3M Directional Marketing is its child company | Visible: "Part of Boonze Media Solutions" (strip, footer) and "part of Boonze Media Solutions, its parent company" (Why O3M card 6) | JSON-LD: Boonze is now its own node, `https://boonze.com/#organization` (name, url, foundingDate 2005, `subOrganization` → O3M). O3M's `parentOrganization` now references that ID instead of an inline copy |

## Validation (2026-11-18)

- JSON parses, and all `@id` references resolve within the graph.
- Schema.org Validator (code input): 0 errors, 0 warnings.
- `delta.js` at 1440 and 390 passes: FAQ markup matches the visible text, no overflow, 0 page errors.

## Production note

boonze.com publishes no JSON-LD, so `https://boonze.com/#organization` is a new identifier. o3mdm.com's site-wide Organization node currently describes Boonze inline, with no `@id`. When the page goes live, use the same Boonze `@id` site-wide so both graphs name one Boonze entity.

AdFlux content was not changed.
