# Executive summary: Why O3M redesign, SEO, AEO and GEO

**Update 2026-11-04 (O3M decision):** O3M confirmed Boonze Media Solutions is O3M's **parent company**. Card 6 now reads "part of Boonze Media Solutions, its parent company", and `parentOrganization` was restored in the JSON-LD. The MCA registry (Tofler) lists no corporate parent, and boonze.com calls O3M a "sister company"; O3M may want to align boonze.com wording.


**Date:** 2026-11-04
**Scope:** local redesign only (`website/google-ads-management/`, static HTML/CSS/JS). Nothing was deployed, committed or pushed, and the live site is untouched.

## What changed

1. **Why O3M cards (design).**
   - Each card gained an icon tile, a blue-to-green accent bar, and a 4 px lift with a soft shadow on hover or keyboard focus.
   - The scroll reveal now staggers at 50 ms per card.
   - The 3D tilt was removed from these cards.
   - Under reduced motion there is no animation; on touch devices nothing depends on hover.
   - Verified in the browser at 1440, 768 and 390 px.
2. **Why O3M cards (copy).** Each card is now a self-contained, evidence-backed claim:
   - The Premier Partner card explains the tier and links to Google's profile.
   - The certification card cites Google's public profile instead of a broad "certified team".
   - The heritage card separates O3M (2010) from the Boonze group (2005).
   - The AdFlux card uses verified wording and links to the AdFlux page.
3. **FAQs (AEO).** 4 questions were renamed to match real India autocomplete phrasing, 2 answers now lead with the answer, and the YouTube FAQ was merged into FAQ 1, leaving 7 FAQs.
4. **Entity (GEO).** Schema facts now match the verified ones. `parentOrganization` was removed because Boonze describes O3M as a "sister company, spun out", which conflicts with "part of the group", and the registry shows no parent.

## Key findings

- **The claims are mostly verified.**
  - Verified: Premier Partner 2026 (Google profile), founding in 2010 (MCA registry via Tofler), Boonze established in 2005, both offices, the AdFlux definition, and the tracking services.
  - Partially verified: the certification scope and the Boonze relationship.
- **Search visibility today.** O3M appears #1 only for branded queries (Firecrawl, country India). It is **absent from all 9 non-branded local and service queries**, where local agency pages, directories (Justdial, Clutch, IndiaMART) and "top N" lists dominate.
- **Off-page entity contradictions.**
  - o3m.in: "20+ years" and a third office.
  - Google Business Profile: a different phone number.
  - Email: sales@ vs info@.
  - The Media Ant: "founded 2017".
  - Award counts differ between Boonze and O3M.
- **The biggest content gaps** need O3M input: fees, time to results, reporting cadence, account ownership, case studies and named people.

## Tests

- **Lab Lighthouse:** mobile median Performance 99 and LCP 1.21 s; desktop 100. Accessibility, Best Practices and SEO are 100.
- **Regression:** the form, credibility strip, footer and click-ID suites pass, with 0 console errors.
- **Not measured:** field Core Web Vitals and AI-assistant answers.

## Pending O3M approval or access

1. Card 5 wording, which cites Google's self-reported strategist figures.
2. The exact Boonze relationship ("part of the group" or "sister company").
3. The 5 earlier wording items (see `../2026-11-04/content-implementation/content-gap-and-approval-list.md`).
4. Fee model, time to results, reporting, ownership, minimum budget, case studies, named strategists.
5. Off-page fixes: o3m.in, Justdial, Google Business Profile phone, directory profiles.
6. Form endpoint, GTM / GA4 / Google Ads IDs, an approved og:image, and a Search Console / GA4 baseline.

No ranking, AI citation or traffic outcome is claimed or guaranteed.
