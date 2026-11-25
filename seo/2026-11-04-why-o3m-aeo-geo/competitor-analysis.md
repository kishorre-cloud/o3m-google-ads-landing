# Competitor analysis: "Why us" cards, FAQ answers, proof and entity signals

**Date:** 2026-11-04
**Produced by:** `searchfit-seo:competitor-analyzer`. Condensed and reviewed by the main session.
**Builds on:** `../2026-11-04/competitor-analysis.md` and `../2026-11-04/content-implementation/competitor-analysis.md`.

## Method and limitations

- **Searches:** 4 WebSearch queries. **These are not localised google.co.in results**, and they were used only to find pages, not to rank them.
- **Pages:** 6 WebFetch attempts, 5 of which worked. The guessed Techmagnate service URL returned 404.
- **Quotes:** WebFetch returns model summaries, so short quotes may be paraphrased. JSON-LD was not visible on any page.
- **Fetch tool:** this agent cannot call Firecrawl (its toolset is WebSearch and WebFetch only). Firecrawl was used by the claims and GEO agents (see `claims-and-entity-register.md`, `evidence/geo-baseline-observations.md`).
- **Metrics:** traffic, domain authority, backlinks and rankings are unavailable. Competitor figures and badges are their own claims.

## Search observations (tool order, not rankings)

| Query | Useful agency pages | Notes |
|---|---|---|
| google ads agency why choose us | seo.com (WebFX) | Mostly guides, spam, listicles |
| google premier partner agency india… | Techmagnate (blog), NP Digital India and WhiteDigital (press), Webindia (Semrush directory) | **Premier Partner is claimed by several Indian agencies** and is not unique to O3M. Competitors back it with press releases, not directory links |
| google ads management agency faq lead quality | oneppcagency.co.uk, saasgrowthagency.com, template sites | No neutral FAQ source |
| ppc agency chennai | wildcreekstudio.com, budindia.com, wildnettechnologies.com, Clutch, Semrush, TechBehemoths, DesignRush | Directories and listicles are prominent |

## Pages analysed

| Page | "Why us" items | FAQs | Proof inside "why us" | Entity signals |
|---|---|---|---|---|
| O3M redesign | 6 cards | 8 | Directory link on the Premier Partner card | Legal name, 2 full addresses, partner-directory links |
| Wild Creek Studio (Chennai) | 5 numbered cards | 6 | "20+ years", unsourced | Founder named with bio; Clutch and GoodFirms badges; press links |
| SEO.com / WebFX (global, structure only) | 4 + 5 bullets | 0 | "Premier Google Partner", no link | Weak |
| Notion Graffiti (Chennai) | 6 long subsections | 11 | None | Address, author |
| IndiaNIC | 6 check items | 5 | None | Legal name, "Since 1998" |

## Patterns in "why us" sections

1. 4–6 items is the norm. O3M's 6 fits.
2. Competitor headings are interchangeable labels ("Transparent Reporting", "Proven PPC Expertise"). **O3M's specific-claim headings are stronger.**
3. Length: competitors run 9–22 words per item, except Notion Graffiti at 50–70. **O3M's 20–35 words is right.**
4. **No competitor puts a verifiable proof link inside a "why us" item.** O3M's Premier Partner card is the only one in the set.
5. "Outcome, not the click" slogans are now used by two competitors (Wild Creek, IndiaNIC). **O3M's distinctiveness is the named mechanism** (tracking first, CRM, follow-up), not the slogan.
6. Visual patterns: a check icon plus one line, or numbered cards. Nobody uses a "how to verify" line inside a card.

## FAQ and direct-answer patterns

- The best answers open with "Yes." / "No." or a concrete fact, and stay at 2–3 sentences of 25–60 words. The weak ones open with context or "It depends".
- Buyer-voice questions ("Can you take over an account someone else built?") read best.
- **Topics competitors cover that O3M does not:** account takeover, audit, time to results, guarantees, "tried before and it failed", reporting cadence, month-to-month terms, landing pages.
- **Topic nobody answers:** account and data ownership.
- FAQPage markup no longer gives rich results to most sites (Google change, August 2023). This rests on the agent's knowledge and was not fetched in this run. **Value comes from clear, quotable answers.**

## Entity and proof signals

| Signal | O3M | Competitors |
|---|---|---|
| Legal name | Yes | Some |
| Founding year | O3M 2010 / Boonze 2005 (two entities) | Mostly unsourced |
| Street addresses | 2 | 0–1 |
| Partner-directory links | Google, Amazon, Shopify | None |
| Named people | **No** | Wild Creek founder |
| Case studies with sources | **No** | Linked, figures unsourced |
| Review platforms | **No** | Wild Creek (Clutch, GoodFirms) |
| Press | **No** | Wild Creek |

**O3M leads on verifiable company facts. It trails on people, reviews, press and case studies.**

## Recommendations applied or recorded

| Card / FAQ | Recommendation | Action in this task |
|---|---|---|
| Measurement comes before optimisation | The most distinctive card; no competitor sets up tracking first | Kept, sharpened with the dependency on client systems |
| Our own technology | Add a link to /technology/adflux; one concrete capability; no "AI" in the heading | Applied |
| Google Premier Partner | Keep the directory link; explain what Premier means using Google's own wording | Applied, using verified profile wording (see claims register) |
| A certified team | The weakest card: an internal policy without proof | Reworded conservatively using the Google profile's statement; needs a count or named leads from O3M |
| Search marketing since 2005 | The heading credits 2005 to O3M when it is Boonze's date | Heading changed to name the group explicitly |
| FAQ 6 (agency vs in-house) | The first sentence doesn't answer | Rewritten to answer first |
| FAQ 7 (spend) | Opens with "It depends" | Rewritten to name the cost factors first |
| FAQ 8 (YouTube) | Low value | Merged into FAQ 1 |
| New FAQs: takeover, ownership, time to results, guarantees, reporting, "tried before" | Need O3M policy | Takeover / ownership / reporting / time to results recorded as pending. "Do you guarantee results?" is answerable from the evidence (O3M publishes no guarantees) **only if O3M approves the wording**, so it is not published |

## Clichés to avoid

"Best / No.1 / leading"; "outcome not the click" as a slogan; "data-driven", "ROI-first", "tailored", "full-funnel"; "transparent reporting" with no cadence; "certified specialists" with no count or link; "award-winning" with no named award; unsourced multipliers; "guaranteed results"; definition FAQs; badge images without directory links; founding years that mix up the group and the company.

## Sources

wildcreekstudio.com/digital-performance/ · seo.com/agency/google-ads-agency/ · notiongraffiti.com/?p=3361 · indianic.com/…/ppc-management-services · techmagnate.com/blog/certified-google-premier-partner-india/ (seen in search) · mediainfoline.com (NP Digital press) · observer-reporter.com (WhiteDigital press) · agencies.semrush.com/webindia-inc/ · oneppcagency.co.uk · budindia.com/ppc-agency-in-chennai.php · wildnettechnologies.com/best-ppc-agency-in-chennai · agencies.semrush.com/list/ppc/chennai
