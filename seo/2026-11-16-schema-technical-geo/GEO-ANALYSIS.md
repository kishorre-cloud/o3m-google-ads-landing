# GEO analysis: Google Ads Management landing page

**Date:** 2026-11-16. **Method:** the installed `claude-seo:seo-geo` skill (v2.6.2), with `references/google-ai-optimization-guide.md` and `references/llmstxt-evidence.md`.

**Scope:** source-based readiness only, from the local page. The preview is private and the new page is not public, so **no AI visibility was measured.** No DataForSEO, SE Ranking or AI-platform tool was used.

## 1. GEO readiness: 69 / 100 (heuristic checklist)

This uses the skill's own weights (25 / 20 / 15 / 20 / 20). It is a prioritisation checklist, **not a Google score and not a citation probability.**

| Criterion (weight) | Score | Basis |
|---|---|---|
| Citability (25) | 17 | The 10 FAQ answers open with a direct answer (50–94 words each). Hero and service panels state what O3M does and how it is measured. The facts are specific and verified: founded 2010, two offices, 2026 Premier Partner, 10,000+ accounts (O3M-approved). Missing: original data, sourced figures, and answers to fees, timeline and reporting cadence |
| Structural readability (20) | 16 | 1 H1, 16 H2, 35 H3 in a logical order. Some headings are questions ("Where does your next enquiry get lost?"). Structured points (`<dl>`) per campaign type. A real FAQ. No comparison tables. FAQ answers are collapsed until clicked |
| Multimodal (15) | 9 | Two videos, each with an HTML text equivalent. Logo and images have alt text. No data charts. No VideoObject, because no public video URL exists |
| Authority and brand (20) | 10 | Verified identity, matching the official o3mdm.com entity. 5 official profiles in `sameAs`. Visible links to the Google Partners profile, both offices on Google Maps, and the Trust page. Missing: named experts with credentials, publish/update dates, case studies and testimonials |
| Technical accessibility (20) | 17 | Static HTML: 2,969 words without JavaScript. JSON-LD in the initial HTML. Production robots.txt allows all search and AI crawlers. Deductions: content behind accordions and tabs, and no field CWV data yet |

## 2. Platform readiness (qualitative, not measured)

| Platform | Readiness | Measured? |
|---|---|---|
| Google AI Overviews / AI Mode | Fits the page: answers come from the Googlebot index, so this follows normal ranking. Eligible once the page is public and indexed | **Not measured** |
| ChatGPT Search | OAI-SearchBot is allowed on production. The answer blocks are extractable as raw HTML | **Not measured** |
| Perplexity | PerplexityBot is allowed on production. Same raw-HTML content | **Not measured** |

No platform scores are given, because no measurement tool was run. Crawler access alone does not show citation behaviour.

## 3. Findings

- **Crawler access:** see the table in `TECHNICAL-INDEXABILITY.md` section 4. Search and training crawlers are reported separately there. All are allowed on production; all are blocked on the private preview.
- **llms.txt:** absent (404) on o3mdm.com. It carries no weight here, and Google Search ignores it. It was not created.
- **Entity clarity:** fixed today. `sameAs` now lists only O3M identity profiles and matches o3mdm.com exactly. The organization `@id` matches the site-wide one, so AI and search systems see one O3M entity.
- **Brand mentions:** official LinkedIn, YouTube, Facebook, Instagram and X profiles exist (linked from o3mdm.com). Wikipedia, Reddit and third-party mention presence were **not checked**. Nothing was created.
- **Server-side rendering:** passes. It is a static page, and the raw and rendered titles, canonicals, robots and JSON-LD are identical.

## 4. Highest-impact changes (business input needed; nothing invented)

1. Answer the open buyer questions on the page: fees or how pricing works, time to results, reporting cadence, account ownership. These need O3M's facts.
2. Add real proof: named O3M specialists with roles, case studies or results O3M can verify. Add Person markup only once these are visible.
3. Add a visible "last updated" date that O3M maintains.
4. Make sure the page ranks in classic Search after launch, since AI Overviews draw mainly from well-ranking pages.
5. Consider showing the first FAQ answers expanded by default. This is a design change, so it needs approval.

## 5. Schema for AI discoverability

Nothing beyond the fix in `SCHEMA-REPORT.md` is recommended. There is no evidence that extra schema raises AI citations.
