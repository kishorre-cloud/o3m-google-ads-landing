# AEO and GEO content review

**Update 2026-11-04 (O3M decision):** O3M confirmed Boonze Media Solutions is O3M's **parent company**. Card 6 now reads "part of Boonze Media Solutions, its parent company", and `parentOrganization` was restored in the JSON-LD. The MCA registry (Tofler) lists no corporate parent, and boonze.com calls O3M a "sister company"; O3M may want to align boonze.com wording.


**Date:** 2026-11-04
**Page:** local redesign, `website/google-ads-management/index.html`
**Inputs:**
- `keyword-cluster-map.csv`: 20 clusters with answer status
- `evidence/aeo-query-set.md`: 23 test prompts
- `evidence/geo-baseline-observations.md`: 12 queries run on Firecrawl (country India) and WebSearch
- `claims-and-entity-register.md`

**Nothing here guarantees a ranking, an AI Overview citation, or a mention in ChatGPT or other generative engines.**

## 1. Question coverage (AEO)

| Buyer question (real phrasing from India autocomplete) | Where answered | Status |
|---|---|---|
| What is / what does Google Ads management include? | FAQ 1 "What does Google Ads management include?" (renamed); services; process | Answered, direct first sentence |
| How do you measure / improve lead quality? | FAQ 2 (renamed); chain stage 06; Why O3M card 1 | Answered (mechanism). Offline conversion import and spam filtering **need O3M input** |
| Is Google Ads good for B2B / manufacturing? | FAQ 3 (renamed); industries card | Answered |
| Ecommerce Google Ads | FAQ 4; industries; Shopping tab | Partly. Which ecommerce metrics O3M reports **needs O3M input** |
| Chennai / Coimbatore / India coverage | FAQ 5; hero; footer offices | Answered |
| Agency vs in-house | FAQ 6 (renamed, answer-first) | Answered |
| How much to spend / minimum budget | FAQ 7 (factors-first) | Partly. A minimum budget **needs O3M input** |
| How much does an agency charge / fees | — | **Unanswered: needs O3M fee model** |
| How long does Google Ads take to work | — | **Unanswered: needs O3M timeline** |
| Reporting: what and how often | — | **Unanswered: needs O3M cadence** |
| Account ownership, contracts | — | **Unanswered: needs O3M policy** |
| What is a Google Premier Partner? | Why O3M card 4 (now explains the tier) | Answered |
| What is AdFlux? | AdFlux section + card 3 + link | Answered (verified capabilities) |

**Changes made for answerability:**
- 4 FAQ questions were renamed to match real search phrasing.
- 2 answers were rewritten to put the answer in the first sentence.
- The YouTube FAQ was merged into FAQ 1, leaving 7 FAQs.
- The Why O3M cards were rewritten so each one stands alone (see `why-o3m-content.md`).

The page stays a service page: no definitions or tutorial sections were added.

## 2. Entity clarity (GEO)

| Fact | On the page | Consistent with official sources? |
|---|---|---|
| Name: O3M Directional Marketing (legal: … Pvt Ltd) | Footer, schema `legalName` | Yes |
| Website | Logo links, schema `url` | Yes |
| Service: Google Ads management | Title, H1, schema Service | Yes |
| Founded 2010 | Strip, Why O3M card 6, footer, schema `foundingDate` | Yes (MCA registry via Tofler) |
| Boonze Media Solutions, 2005 | Strip, card 6, footer | Date yes. **Relationship ambiguous:** "part of the group" (o3mdm.com/about) vs "sister company, spun out" (boonze.com); registry shows no parent. The schema `parentOrganization` was **removed** until O3M confirms |
| Offices: Chennai T. Nagar, Coimbatore Saibaba Colony | Footer with map links, schema addresses | Yes (contact page, Google Maps) |
| Phone +91 9500 123 131 | Header, footer, schema | Official site yes. **Google Business Profile shows 044 2432 3161:** inconsistent |
| Google Premier Partner 2026 | Strip, card 4 (with directory link), footer | Yes (Google Partners profile) |
| AdFlux = O3M's marketing performance and revenue-operations platform | AdFlux section, card 3 | Yes. Note that other unrelated companies use the "AdFlux" name |

### Off-page contradictions to fix (O3M action; not on this page)

- **o3m.in** claims "20+ years" and lists a third office (OMR, Perungudi).
- **Justdial Coimbatore** shows a different locality (unconfirmed; the page was blocked).
- **Email:** sales@ (o3m.in, Crunchbase) vs info@ (site).
- **Partner naming:** old names ("Premier SME", "AdWords") on several profiles.
- **Awards:** Boonze says 3 years of the Google satisfaction award; O3M says 4.
- **The Media Ant** directory says founded 2017 (wrong).
- **Experience lines:** "75-plus" vs "100-plus man-years", and team size from 23 to 77 across profiles.
- **Missing directory profiles:** no Clutch or GoodFirms profile found, yet directories dominate the Chennai and India results.

## 3. Generative / search baseline (observed, not AI-answer tests)

12 queries were run once each on Firecrawl (country India) and WebSearch (US, not localised), between 16:15 and 16:25 IST.

| Query type | O3M present? |
|---|---|
| Branded ("O3M Directional Marketing", "what does O3M do", "AdFlux O3M") | Yes: **#1 on Firecrawl** for all 3 (o3mdm.com or /technology/adflux). On WebSearch, only third-party profiles appear |
| Non-branded local and service queries (Chennai, Coimbatore, India, manufacturers, B2B, ecommerce, Premier Partner Chennai, how to evaluate an agency) | **No**, on both tools (9 of 9) |

**Who fills the non-branded results:** local agency pages with exact-match URLs (kay.org.in, which claims Premier Partner in Chennai), directories (Justdial, Clutch, IndiaMART, Semrush, GoodFirms) and agency-written "top N" lists.

**Branded fact accuracy:**
- Offices, Premier Partner and AdFlux are correct.
- "Founded 2010" appears only through a third-party interview.
- Boonze and "2026" are absent from snippets.

**Not tested (no access):** ChatGPT, Gemini, Perplexity, Copilot, Google AI Overviews.

## 4. What was implemented for GEO

- Consistent entity facts across visible copy and JSON-LD (Organization + Service). The unverified `parentOrganization` was removed.
- Named, attributable proof: a direct link to the Google Partners profile; links to the official AdFlux and industry pages.
- Self-contained factual paragraphs in the cards and FAQs.
- Content is in server HTML, including the service tabs and FAQ answers.

## 5. Deliberately not done

- **`llms.txt`:** Google's documentation says no special files or markup are needed to appear in AI Overviews or AI Mode, and no supported benefit for this page was found. Not added.
- **FAQPage schema:** FAQ rich results are limited to authoritative government and health sites (Google, 2023). The visible answers carry the value.
- **No fake reviews, authors, case studies or citations.**

## 6. Highest-impact next steps (need O3M)

1. Answer the 5 unanswered buyer questions: fees, time to results, reporting, ownership, minimum budget.
2. Publish 2–3 approved case studies and named strategists.
3. Fix the off-page entity contradictions, and create or claim Clutch and GoodFirms profiles plus both Google Business Profiles with consistent NAP (name, address, phone).
4. Re-run `evidence/aeo-query-set.md` monthly. Add AI-assistant checks manually, with dates, if accounts are available.
