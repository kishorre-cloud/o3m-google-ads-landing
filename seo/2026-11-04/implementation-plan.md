# Implementation plan: one URL for SEO and Google Ads

**Date:** 2026-11-04
**Status:** plan only, awaiting approval. Nothing is committed, pushed or deployed. The live site has not been modified.
**Primary URL (canonical, indexable):** https://o3mdm.com/solutions/google-ads-management

## What changed from the earlier plan

- The page is **not** paid-only. One URL serves both organic search and Google Ads.
- The redesign will be **ported into the live Next.js route**, not deployed as a separate static page.
- On production the canonical is self-referencing. There is no `noindex` and no second public copy.
- The local static page (`website/google-ads-management/`) becomes a **design prototype and reference only**. It is never deployed publicly.
- Staging (for example Netlify deploy previews) may exist, but it must send `X-Robots-Tag: noindex` and stay out of the sitemap. Production must not.

## What is known about production (from the 2026-11-04 audit)

| Item | Finding | Evidence |
|---|---|---|
| Hosting | Netlify (`Server: Netlify`, `Cache-Status: "Netlify Edge"`) | `evidence/live-headers.txt` |
| Framework | Next.js, server-rendered (raw HTML matches the rendered DOM) | `baseline-audit.md` #16 |
| Tags | GTM `GTM-KFG4JJ9` loaded; GA4 `G-YW1YW7F5EN` referenced | `evidence/live-rendered-dom.html` |
| Consent | A consent-defaults script is present (Consent Mode), plus a cookie banner with "Essential Only / Accept All" | Rendered DOM; site check 2026-11-02 |
| Lead form on this page | None. The CTAs link to `/contact` | Rendered DOM: 5 × `href="/contact"` |
| Indexing | 200, self-canonical, `index, follow`, in the sitemap | `baseline-audit.md` |
| Mobile performance (lab) | LCP 5.0 s, TBT 310 ms, Performance 75 | `evidence/lighthouse-live-mobile.json` |
| Source code | **Not on this machine** | — |

---

## Launch blockers (must be resolved before production)

| # | Blocker | Owner | Why it blocks |
|---|---|---|---|
| B1 | Access to the Next.js source repository and the Netlify site: build command, production branch, deploy contexts, environment variables | O3M / developer | No change can reach the primary URL without it |
| B2 | Lead form endpoint: where does the `/contact` form post today (Netlify Forms, CRM, API, email)? Field mapping, spam protection, and where leads land | O3M | The page needs a working form to convert paid and organic visitors |
| B3 | Tracking access: GTM container `GTM-KFG4JJ9` (publish rights), GA4 property `G-YW1YW7F5EN`, and the Google Ads account (conversion actions, conversion IDs and labels) | O3M | Conversions cannot be configured or validated without access |
| B4 | Claim approvals: "Google Premier Partner" (visible on O3M's Google Partners profile; sign-off still needed) and "10,000+ Google Ads accounts" (unverified). Both are in the credibility video; if either is removed, the video must be re-rendered | O3M | Unapproved claims are a trust risk and a Google Ads policy risk |
| B5 | Privacy wording approval: remove the "Wording needs O3M approval" badge | O3M | Draft text is visible to users |
| B6 | Copy approval for the merged page: H1, new sections and FAQ answers (see Phase 2) | O3M | Business claims must be accurate and approved |
| B7 | Staging protection: deploy previews send `noindex` (and are optionally password-protected) | Developer | Prevents a competing indexed copy |
| B8 | Baseline exports from Search Console and GA4 for the URL, taken before launch | O3M | No before/after comparison is possible without them (`measurement-plan.md`) |

## Decisions needed from you

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | Header and footer on the production page | (a) the site-wide header and navigation; (b) the redesign's focused header plus its Google Ads-focused footer | (b) a focused header with a link back to o3mdm.com, plus the focused footer. It keeps paid visitors on the form while keeping crawlable links to key pages. Needs to be confirmed against how the Next.js layout works. |
| D2 | Form placement | (a) a form on the page, as in the redesign; (b) link to /contact as today | (a). A form on the landing page is better for Google Ads conversion rates and lets the campaign context be passed with the lead. |
| D3 | Phone-call tracking | (a) count clicks on `tel:` links only; (b) Google forwarding number / call extensions plus calls from the website (needs dynamic number insertion) | (a) at launch; (b) later if call volume justifies it |
| D4 | Offline conversion import (CRM → Google Ads) | Now or later | Capture `gclid` / `gbraid` / `wbraid` in hidden form fields from day one. Import later. This supports the lead-quality positioning. |
| D5 | Campaign-specific CTAs | URL-parameter variants on the same URL | Read a whitelisted parameter (for example `?cta=b2b`) to change only the CTA label and the pre-selected goal. Keep the canonical clean. No new URLs. |
| D6 | H1 wording | Live: "Google Ads Management for Businesses That Need More Than Clicks". Redesign: "Google Ads that bring qualified enquiries, not just clicks." | Keep the term "Google Ads management" in the H1. Example: "Google Ads management that brings qualified enquiries, not just clicks." |

---

## Phases

### Phase 0: Access and repository review (read-only, after B1)

1. Clone or locate the Next.js repository. Read its README, `package.json` scripts, `next.config.*`, `netlify.toml`, layout, metadata and schema helpers, and its form, consent and GTM components.
2. Record the deploy workflow: production branch, preview contexts, environment variables, and how the sitemap and robots.txt are generated.
3. Check git status; work on a new feature branch only.
4. Run the repository's own lint, type-check, test and build commands to get a green baseline.
5. Agents: `architect` for the porting approach (route component, client/server boundaries, assets); `Explore` to map the code.

### Phase 1: Keyword mapping and content inventory (before any copy change)

1. Reuse `keyword-map.md`. Primary theme: "Google Ads management services" / "Google Ads agency". Secondary themes: lead quality, India with the Chennai and Coimbatore teams, campaign types, buyer questions.
2. Build a section-by-section inventory: live page vs redesign. Mark each block **keep / merge / new / drop**. The live page has sections the redesign lacks, such as "What Google Ads Management Means at O3M", "Why Businesses Choose O3M" and the outcomes section. Dropping indexed content can reduce relevance, so merge it rather than delete it.
3. Map the Google Ads campaign themes to page sections, so each ad group lands on matching content:
   - Google Ads management / agency → hero and services
   - PPC management → services (synonym only)
   - B2B / manufacturing lead generation → industries and lead-quality sections
   - Performance Max / Shopping / ecommerce → services and the ecommerce block
   - Chennai / Coimbatore → the India-and-offices line, footer offices, local FAQ
4. Output: a copy deck for approval (B6).

### Phase 2: Copy deck (for approval, no build yet)

- **Title:** `Google Ads Management Services | O3M Directional Marketing`. Optional CTR test later: `… in India | O3M`.
- **Meta description:** around 155 characters, covering lead quality, campaign types, and the Chennai and Coimbatore teams.
- **H1** per D6. **H2/H3:** one topic per section, no keyword stuffing.
- **New body content** (from `on-page-recommendations.md`):
  - the India and offices line
  - the lead-quality mechanics: only what O3M actually does (CRM, offline conversions, spam filtering)
  - the dates made explicit: O3M founded 2010, Boonze est. 2005
  - the Premier Partner link to the Google Partners profile
- **FAQs:** the existing questions plus fee model, agency vs in-house, location coverage, account takeover, and reporting. **Answers must state O3M's real policy.**
- **Case studies:** a post-launch addition unless verified material exists. Never use placeholders.
- **Internal links:** contextual links to the two industry pages, AdFlux, Trust & Partnerships and Contact. Ask for links back from those pages, anchored "Google Ads management services".

### Phase 3: Build on a feature branch (after D1–D6 and B6)

1. Port the redesign into the existing `/solutions/google-ads-management` route, using the repository's components and conventions:
   - static markup becomes React or Server Components
   - `motion.js` and `landing.js` become client components, keeping the reduced-motion handling
   - videos and posters move into the repository's public assets
2. **Metadata API:** the title, the description and a self-referencing canonical. Open Graph and Twitter tags including `og:image` and `og:url`. Robots `index, follow` on production.
3. **Structured data:** keep the live blocks: Organization/ProfessionalService with both offices, Service, BreadcrumbList, and FAQPage rewritten to match the visible FAQ word for word. No ratings or reviews.
4. **Performance:**
   - `next/font` for Plus Jakarta Sans, removing the render-blocking Google Fonts CSS
   - `next/image` for raster images, including the 1.36 MB PNG
   - hero text visible at first paint, to fix the live 5.0 s LCP
   - videos with `preload="metadata"` and posters; the strip already uses media-gated sources
   - GTM loaded with `afterInteractive`, not delayed past conversions
5. **Accessibility:** fix the green contrast failures found on live (3.1–3.3:1). Keep focus states and the five credibility statements as HTML text.
6. **Campaign CTA variants (D5):** a whitelisted query parameter changes only the CTA label and the pre-selected goal. The server-rendered default is what search engines see.
7. **Staging:** deploy previews send `X-Robots-Tag: noindex` (`netlify.toml` headers for non-production contexts, or middleware) (B7).
8. Agents: `planner` for the step list, `code-reviewer` + `typescript-reviewer` after the changes, `security-reviewer` for the form (it handles user input).

### Phase 4: Form and conversion tracking (after B2, B3)

1. **Form:**
   - connect the real endpoint
   - server-side validation, plus a honeypot or Turnstile/reCAPTCHA
   - consent text
   - hidden fields: `gclid`, `gbraid`, `wbraid`, UTM parameters, the landing variant (D5)
   - success leads to a `/thank-you` route that is `noindex` and kept out of the sitemap
2. **GTM:**
   - **GA4:** `generate_lead` on confirmed form success (not on click), with the form goal as a parameter; `phone_click` on `tel:` links.
   - **Google Ads:** a primary "Lead form" conversion on form success; a secondary "Phone click" conversion; the conversion linker.
   - **Enhanced conversions for leads:** hashed email and phone, if consent and the account settings allow it.
   - **Consent Mode v2:** use the existing consent-defaults and banner. Tags respect the consent state.
3. Mark the GA4 key events and import them into Google Ads, or use the native Ads tag. Avoid counting the same conversion twice.
4. Optional (D4): offline conversion import from the CRM, for qualified lead and sale stages.

### Phase 5: Staging QA

| Check | Tool | Pass criteria |
|---|---|---|
| Build, lint, types, tests | Repository scripts | Green |
| Metadata, canonical, robots | Lighthouse SEO; view-source | Self-canonical; staging `noindex` header; production `index, follow` |
| Structured data | Rich Results Test (preview URL), validator.schema.org | No errors; matches visible content |
| Links | Link checker | No 4xx/5xx |
| Responsive | Puppeteer suites (`flow.js`, `cred.js`, `footer.js`, adapted) at 390/768/1040/1041/1440/1920 | No overflow; strip and footer correct |
| Accessibility | Lighthouse plus axe, a keyboard pass, a screen-reader spot check | No critical issues; contrast ≥ 4.5:1 |
| Performance | Lighthouse mobile ×3 (median); PSI with an API key | Lab LCP < 2.5 s, CLS < 0.1, TBT < 200 ms (lab targets, not field) |
| Form | End-to-end test submissions | Lead arrives in the CRM with the gclid/UTM fields; spam is blocked; errors are handled |
| Tracking | GTM Preview, GA4 DebugView, Google Tag Assistant | `generate_lead` and the Ads conversion fire once per real submission; `phone_click` fires; consent is respected |
| Paid relevance | Google Ads ad preview and diagnosis; landing-page checks | The final URL resolves to the canonical; parameters keep content relevant |

Agent: `e2e-runner` for the form and conversion journeys.

### Phase 6: Approval and launch (only with your explicit go-ahead)

1. Show you the diff, the staging URL and the QA results. Commit, push and deploy only on approval.
2. After deploy:
   - Search Console URL Inspection → request indexing
   - check the Google-selected canonical
   - update the sitemap `lastmod`
3. Google Ads: confirm the final URL; check conversion status ("Recording conversions") within 24–48 h.
4. Follow `measurement-plan.md`: checkpoints at 4, 8 and 12 weeks. Field Core Web Vitals come from Search Console and CrUX once data accrues.

---

## Dependencies by phase

| Phase | Depends on |
|---|---|
| 0 Review | B1 |
| 1–2 Mapping and copy | Phase 0; existing research |
| 3 Build | D1, D2, D5, D6, B6, B4 (claims), B5 |
| 4 Tracking and form | B2, B3, D3, D4 |
| 5 Staging QA | B7; Phases 3–4 |
| 6 Launch | B8; your approval |

## Not changing

- The primary URL. There are no redirects; the URL stays the same.
- Other site pages, except optional inbound internal links (each needs approval).
- The live site, until you approve Phase 6.
