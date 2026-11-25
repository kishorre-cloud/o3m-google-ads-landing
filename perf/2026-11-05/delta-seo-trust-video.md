# Delta report: targeted SEO, trust and video updates

**Date:** 2026-11-05. Local only: nothing committed, pushed or deployed.

## 1. Files changed

- `website/google-ads-management/index.html`: campaign panels, FAQ, Why O3M card 6, footer email, JSON-LD.
- `website/assets/js/landing.js`: why-video playback rate.
- `website/assets/css/o3m.css`: `.svc-points`, `.faq-a a`; removed the unused `.svc-copy p:last-child` rule.

## 2. Changes by item

| # | Item | Change |
|---|---|---|
| 1 | **E-E-A-T** | Trust shown, not claimed: verified offices, phone and **email** (new, footer), an About link on the heritage card, partner-profile link (existing), and a transparent process in the campaign panels and FAQs. No new credentials, people or results were invented. Based on Google's helpful-content guidance: trust matters most, E-E-A-T is not itself a ranking factor, and fabricated credentials are deceptive |
| 2 | **Video speed** | Why-campaigns-underperform video (`#why-video`): playbackRate and defaultPlaybackRate **1.0 → 0.85**, so the 10.0 s loop now takes about 11.8 s. Measured: 1.71 s of video advances in 2 s. No re-encode; poster, lazy start and compression unchanged; the problem list follows currentTime, so it stays in sync. The credibility strip video was **not** changed |
| 3 | **Select Campaign** | Each of the 6 panels now reads **The situation → Our approach → How we judge it** (`<dl class="svc-points">`), with no campaign definitions. Tabs, keyboard arrows and the CTA are unchanged |
| 4 | **Remarketing** | Panel covers who is eligible (site visitors and ad engagers, within consent and Google audience policies), excluding people who have already converted where tracking allows, matching the message to their interest, and monitoring frequency, audience quality and conversions. States that it supports new-customer campaigns rather than replacing them |
| 5 | **AdFlux** | Existing section already uses only verified capabilities (re-checked). New FAQ "What role does AdFlux play…", written as feature → use → benefit, with the conditional CRM wording kept and a link to the product page |
| 6 | **B2B FAQ** | Now "How does O3M generate and improve qualified B2B enquiries through Google Ads?" Covers buyer search intent, ad and landing-page alignment, forms that support qualification, lead-quality review with the client, long cycles plus remarketing, and a link to the manufacturing page. No offline-conversion or lead-scoring claim |
| 7 | **FAQs** | 10 distinct questions, each answer opening with a direct answer, 50–94 words. New: campaign-type choice, AdFlux role, what to prepare. The YouTube FAQ was folded into "What does Google Ads management include?" No pricing, guarantees or timelines |
| 8 | **Internal links** | Added: manufacturing page (B2B FAQ), ecommerce page (ecommerce FAQ), /technology/adflux (AdFlux FAQ), /contact (locations FAQ), /about (Why O3M card 6), mailto:info@o3mdm.com (footer and FAQ). All return 200 |
| 9 | **Offices and trust** | Chennai (Palani Towers, Venkatanarayana Rd, Parthasarathi Puram, T. Nagar 600017) and Coimbatore (54, Bharathi Park 7th Cross Rd, Saibaba Colony 641043) match o3mdm.com/contact. Phone +91 9500 123 131 and info@o3mdm.com are verified |
| 10 | **Structured data** | One `@graph`: Organization (email added), Service, and **FAQPage** (10 Q&As generated from the visible FAQ; text matches exactly). No LocalBusiness (Organization already carries both addresses). No VideoObject (no public URL yet). FAQ rich results are not expected for this site type |

## 3. Evidence (Firecrawl, 2026-11-05; earlier register 2026-11-04)

- **o3mdm.com/contact:** offices, phone, email, "works outside Chennai and Coimbatore: Yes".
- **o3mdm.com/technology/adflux:** definition; capabilities (performance across channels, CPL, CPA, ROAS; lead management, CRM adoption, response times, pipeline, attribution visibility; workflow visibility; AI/LLM-assisted analysis); "designed to work with CRM … without replacing existing tools". Nothing is marked as planned.
- **developers.google.com/search/docs/fundamentals/creating-helpful-content:** the E-E-A-T guidance cited above.
- **Partner claims:** Google Premier Partner and 10,000+ accounts were approved by O3M on 2026-11-04, so they are kept. Partners profile link returns 200.
- **Service capabilities:** o3mdm.com Google Ads page (`../../seo/2026-11-04/content-implementation/evidence/o3m-official-evidence.md`).

## 4. Tests

| Test | Result |
|---|---|
| `delta.js` (1440 and 390) | Video rate 0.85; 6 panels × 3 points each; FAQ 10 unique; FAQ opens with its link; JSON-LD valid, FAQPage = visible text; no overflow; 0 errors |
| `flow.js` | Form validation, thank-you, FAQ, tabs, reduced motion: pass |
| `why.js`, `seo-content.js` | Pass (cards, click-ID capture) |
| Lighthouse prod-like mobile ×3 (lab) | Median performance 99, TBT 86 ms, 172 KB; Accessibility, Best Practices and SEO 100. No regression versus the perf pass (99 / 82 ms / 170 KB) |
| `code-reviewer` | Approved; 1 low finding (dead CSS rule), fixed |

Rich Results Test was not run: the page is not public.

## 5. O3M confirmation needed

- Exclusion of converted users, and frequency monitoring, in remarketing (written as the standard process; confirm).
- The "what to prepare" FAQ: access to Google Ads, GA4 and CRM.
- Reporting cadence and fees (not published).
- Named experts, case studies and testimonials (none published).

## 6. Not done

Nothing in scope was left undone. The credibility-strip video speed was left unchanged because the feedback referred to "the relevant video" and the moving chain video was the clear match. Say if the strip should be slowed too.
