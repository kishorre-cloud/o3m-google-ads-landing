# Pending corrections pass (18 Nov 2026)

**Source:** `O3M Google Ads Landing Page – Pending Corrections (17 Nov).xlsx` (sheets: Pre-launch checklist, Pending fixes, Already done).

**Status:** local only, nothing committed, pushed or deployed. The Vercel preview still serves commit `1d92051`, so it lags behind these edits and the 18 Nov Boonze schema change.

**Agents:**
- `claude-seo:seo-schema`, in one agent: schema audit.
- `claude-seo:seo-technical`, in one agent: indexing checks and the link crawl.
- One `code-reviewer`: approved, with 3 low findings, all fixed.

## 1. Fixes implemented

| Workbook | Change | File |
|---|---|---|
| #13 | Campaign H2 now lists all six tabs: "Search, Performance Max, YouTube, Display, Remarketing and Shopping, each with a job to do." | `index.html` |
| #19 | "Skip to main content" link added as the first element; `<main id="main-content" tabindex="-1">`. `scroll-margin-top:84px` keeps the target clear of the sticky header | `index.html`, `o3m.css` |
| #17 | `lang="en-IN"` on the landing and thank-you pages; schema `inLanguage` is en-IN | `index.html`, `thank-you/index.html` |
| #10 | The 6 footer labels and the 2 office city names changed from headings to `<p>`, with the same styling. CSS selectors re-targeted | `index.html`, `o3m.css` |
| #18 | The logo and Privacy Policy links open in the same tab. External links are unchanged | `index.html` |
| #21 | The form error message now offers the phone number and info@o3mdm.com | `index.html` |
| #15 | "(PPC)" added to the hero intro and the account-management H2 | `index.html` |
| #11 | 3 FAQ answers now open with "O3M …" instead of "We …". The visible text and the FAQPage text are identical | `index.html` |
| 18 Nov confirmation | Boonze is an Organization node (`https://boonze.com/#organization`, `subOrganization` → O3M). O3M's `parentOrganization` references it by `@id` | `index.html` |
| Production config | Prepared separately, **not active**: `deploy/production/vercel.json` and `README.md`. The page is served at `/solutions/google-ads-management` with no noindex, `/thank-you` and the internal `/google-ads-management/` path are noindex, and there is no homepage redirect. `website/vercel.json` (the preview, noindex) is unchanged | `deploy/production/` |

## 2. Checks that passed

| Check | Result |
|---|---|
| JSON-LD | 7 nodes: O3M Organization with ContactPoint, Boonze Organization, WebSite, 2 offices, Service, FAQPage/WebPage. Schema.org validator: 0 errors, 0 warnings. All `@id`s resolve. No conflicts with the live o3mdm.com graph |
| FAQ | All 10 questions and 10 answers identical between the visible page and the FAQPage markup |
| Breadcrumb | No visible breadcrumb, so no BreadcrumbList (on purpose) |
| robots.txt / sitemap (production) | 200; `Allow: /`; sitemap valid with 22 URLs, including the canonical; no preview host |
| Canonical | `https://o3mdm.com/solutions/google-ads-management` in the local source, on the preview and on production |
| Meta robots / X-Robots-Tag | Local: none, so indexable once live. Preview: 302 to Vercel sign-in when logged out; with the share link, 200 + `noindex, nofollow`. Production: `index, follow`, no header. Thank-you page: `noindex, nofollow` |
| Link crawl | All internal o3mdm.com links: 200, 0 redirects. Credibility links (Google Partners, boonze.com, 2 Maps) all 200 and kept. All anchors resolve. **No incorrect destinations.** The footer self-link to the canonical is intentional |
| Responsive media | Credibility strip: phone video at 360–760 px, HTML list at 768–1040 px, desktop video at 1440–1920 px. The text list shows with reduced motion, blocked autoplay or a failed video. Strip CLS 0, no overflow, and each device loads only its own video. All assets 200 on desktop and mobile |
| Click IDs / UTMs | gclid, gbraid, wbraid, the 5 UTMs and landing_page are filled on submit, included in the form data, and survive a reload. Nothing is invented on a clean visit (desktop and mobile) |
| Regression | `flow.js` (validation, thank-you, error state, tabs, FAQ, video, reduced motion), `delta.js` (6 panels × 3 points, 10 FAQs, why-video at 0.85×), `why.js`, `seo-content.js`, `credmobile.js` (13 cases), `assets404.js`, `skiplink.js`: all pass with 0 page errors |
| Claims | Premier Partner re-checked on the profile (2026 Premier). 10,000+ is O3M-only, unchanged. AdFlux content is untouched |

## 3. Needs O3M input

- **Form endpoint**, for `data-endpoint` on `#enquiry-form`. Confirmed still empty: submissions are only simulated and no lead is sent. Needed: the URL that receives the POST (CRM webhook, AdFlux intake or email function), and the field names it expects.
- **Tracking.** Confirmed still missing: no GTM, gtag or dataLayer. Needed: the GTM container ID (`GTM-XXXXXXX`), *or* a GA4 measurement ID plus a Google Ads conversion ID and label. Also whether to use enhanced conversions, and whether o3mdm.com's cookie banner and Consent Mode apply.
- **Strategist statement (card 5, FAQ 6).**
  - The first sentence matches the Google Partners profile: at least 10 strategists, at least 50% certified.
  - The policy sentence "Our team members are required to keep their platform certifications up to date" (and FAQ 6's "keep their certifications current") has **no official evidence**. It has been pending since 4 Nov. O3M should approve it or have it removed.
  - Workbook #22 (a stronger headcount) also needs O3M's real figure.
- **Content still waiting on O3M's facts:**
  - #3 results and case studies;
  - #4 the management-fee FAQ;
  - #9 the last-updated date and named reviewer;
  - #12 the timeline and contract FAQs;
  - #5 an approved og:image;
  - #6 the page's role (replace the live page, or run as a campaign page).
- Confirm that sales monitors info@o3mdm.com (#21).

## 4. Deferred to production launch

- Choose the hosting route (`deploy/production/README.md`, option A or B). `/assets/` and `/thank-you/` must exist on o3mdm.com; both return 404 today.
- Remove the old Next.js route for this URL and its page-level JSON-LD (5-question FAQPage, WebPage, Service, BreadcrumbList).
- Use the same Boonze `@id` in o3mdm.com's site-wide graph.
- Put the endpoint and GTM ID into the production build.
- After launch:
  - check the live headers and HTML;
  - run the Rich Results Test and URL Inspection;
  - check the sitemap;
  - test a live lead using `?gclid=TEST123&utm_source=google&utm_medium=cpc` together with Tag Assistant;
  - run PageSpeed Insights (#16);
  - test on real Android and iPhone devices.

Screenshots: `screens/` (credibility strip, 13 cases).
