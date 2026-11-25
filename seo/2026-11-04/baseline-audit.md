# Baseline SEO Audit: Google Ads Management page

- **Date:** 2026-11-04. Captures ran 09:28 to 09:36 UTC (14:58 to 15:06 IST).
- **Live:** https://o3mdm.com/solutions/google-ads-management (Next.js on Netlify, source not on this machine)
- **Local:** C:\Claude\o3m-google-ads-project\website\google-ads-management\index.html, served at http://localhost:8000/google-ads-management/ by `python -m http.server 8000`. Git branch `feature/v2-cinematic-editorial` (HEAD b1be58d), with uncommitted changes to index.html, o3m.css and motion.js, and two untracked credibility-strip video files.
- **Mode:** read-only. No website file was edited.
- **Evidence:** all raw outputs are in `evidence/` next to this file.
- **Method note:** some brief items were not delivered as asked. PageSpeed Insights (PSI) returned no data. The field data the brief asked for (Chrome UX Report, CrUX) is therefore **unavailable**. All performance numbers below are **lab** numbers from Lighthouse CLI 12.8.2, run on this machine with simulated throttling. They are not PSI numbers.
- **Overall score:** not computed. The only scores reported are Lighthouse category scores.

## Summary table

| # | Severity | Page | Finding |
|---|----------|------|---------|
| 1 | High | local | No canonical, robots meta, Open Graph/Twitter tags or JSON-LD. Deploying it over the live URL would remove the Organization, Service, Breadcrumb and FAQPage schema, the canonical and the social tags. |
| 2 | High (launch blocker, not SEO) | local | No GTM/gtag/Google Ads conversion tag. The form has `data-endpoint=""`, so submissions are only simulated. |
| 3 | Medium | live | Mobile lab LCP is 5.0 s, TBT 310 ms and TTI 5.1 s. Lighthouse mobile performance score is 75. |
| 4 | Medium | local | The deployment URL and indexing intent are undefined. A second indexable Google Ads page could compete with the live page for the same queries. |
| 5 | Medium | local | A visible "Wording needs O3M approval" badge is in the form privacy line. The two `data-pending` claims (Premier Partner, 10,000+ accounts) are unresolved. |
| 6 | Medium | local | Render-blocking Google Fonts CSS and o3m.css: about 1,260 ms estimated savings on mobile. Mobile lab FCP 2.7 s, LCP 3.2 s. |
| 7 | Medium | live | Lighthouse colour-contrast failures: white on #16a34a, and #16a34a on white or #f8fafc, at 3.14 to 3.29:1. |
| 8 | Low | live | No og:image, twitter:image or og:url. Social shares have no image. |
| 9 | Low | live | /images/google-ads-why-o3m-v2.png is a 1,359,137-byte PNG with no width/height in the HTML and not served through next/image. |
| 10 | Low | live | http://www redirects in 2 hops (to https://www, then to the apex). |
| 11 | Low | live | The sitemap has no `<lastmod>` entries. |
| 12 | Low | local | No favicon (404). Lighthouse best-practices is 96 because of this console error. |
| 13 | Low | local | Description is 201 characters and will be cut off in results (about 155 to 160 is typical). |
| 14 | Low | local | `#why-video` has the HTML `autoplay` attribute. Reduced-motion users may see it start before the deferred JS pauses it. |
| 15 | Low | both | The footer line "Founded 2010 · Est. 2005" is ambiguous: 2005 is the Boonze date, not O3M's. |
| 16 | Info | live | Indexability and crawling are good: 200 OK, self-canonical, `index, follow`, in the sitemap, content server-rendered. |
| 17 | Info | local | All five credibility statements are present as HTML text. Both videos have poster, width/height, preload, muted and playsinline. |
| 18 | Info | live | The structured data matches the visible content. There are no review or rating claims. The FAQPage questions are visible. |

## Findings

### 1. High: local page has no canonical, robots, social tags or structured data
- **Evidence:** run at 09:31 UTC: `curl http://localhost:8000/google-ads-management/`, then parsed with Python html.parser (evidence/local-head-extract.html, evidence/local-parsed-outline.txt). In `<head>` (index.html lines 3-15) the only tags are charset, viewport, title, description, the font/CSS links and three deferred scripts. The rendered DOM (Chrome headless `--dump-dom`, evidence/local-rendered-dom.html) also has 0 JSON-LD blocks.
- **Impact:** if this file replaces https://o3mdm.com/solutions/google-ads-management, the page loses things the live page has now:
  - a self-canonical
  - explicit `index, follow`
  - Organization and ProfessionalService schema with both office addresses
  - Service and BreadcrumbList schema
  - FAQPage schema (5 questions)
  - og:title, og:description, og:site_name, og:locale and twitter:card
- **Fix:** add `<link rel="canonical">` pointing to the URL it will be served at. Add the matching robots meta. Add OG/Twitter tags, including og:image and og:url. Port the live JSON-LD (evidence/live-jsonld.json), and change the FAQPage block to the 5 local FAQ questions and answers word for word. The local questions differ from the live ones.

### 2. High (launch blocker, not SEO): no tracking, and the form does not submit
- **Evidence:** index.html line 174: `data-endpoint=""` (the in-file comment says "Left empty, submissions are simulated"). `grep -c 'gtag\|googletagmanager'` returns 0 for index.html and for all 3 JS files. The live page loads GTM-KFG4JJ9.
- **Impact:** a Google Ads landing page without a conversion tag or a working form cannot record or optimise conversions.
- **Fix:** set the form endpoint. Add the same GTM container as the live site, or the Google Ads tag. Fire the conversion on the thank-you page, which already has `noindex, nofollow`.

### 3. Medium: live mobile performance (lab)
- **Evidence:** `npx -y lighthouse@12 https://o3mdm.com/solutions/google-ads-management --only-categories=performance,seo,accessibility,best-practices` (mobile default, simulated throttling), fetchTime 2026-11-04T09:34:30Z. Output: evidence/lighthouse-live-mobile.json, summarised in evidence/lighthouse-summary.txt.
- **Mobile lab results:**
  - Scores: Performance 75, Accessibility 96, Best Practices 100, SEO 100
  - FCP 1.1 s, LCP 5.0 s, TBT 310 ms, CLS 0, Speed Index 2.6 s, TTI 5.1 s
  - Total page weight 639 KiB
  - LCP element: hero `<p class="text-sky-100/90 ...">`
  - Main-thread work 3.6 s. Third-party code (GTM/GA) blocked the main thread for 270 ms.
  - Unused JS: 132 KiB estimated savings. Preconnect to googletagmanager.com: about 300 ms estimated savings.
- **Desktop lab results** (`--preset=desktop`, 09:34:51Z):
  - Scores: Performance 100, Accessibility 96, Best Practices 100, SEO 100
  - FCP 0.3 s, LCP 0.5 s, TBT 10 ms, CLS 0
- **Field data (CrUX):** unavailable, because PSI returned 429 (see Measurement status).
- **Impact:** LCP above 2.5 s on mobile hurts landing-page experience, both as a Core Web Vitals signal and in Google Ads landing-page experience.
- **Fix:** find out why a text element is LCP at 5.0 s. It is probably a hydration or animation delay that hides the hero text. Render the hero text visible from first paint. Load GTM after interaction or idle, and add a preconnect to googletagmanager.com. Reduce client JS (132 KiB unused).

### 4. Medium: local page's indexing intent is undefined
- **Evidence:** the local page has no canonical and no robots meta. Its links point to absolute o3mdm.com URLs, including the footer link to /solutions/google-ads-management. Its title and H1 target the same topic as the live page.
- **Impact:** if it is deployed at a new path (for example /google-ads-management/) and left indexable, two pages compete for "Google Ads management" queries.
- **Fix:** decide on one of two options.
  - (a) It replaces the live URL: then finding 1 applies.
  - (b) It is a paid-traffic-only page: add `<meta name="robots" content="noindex, follow">` and do not list it in the sitemap. Google Ads does not need the landing page to be indexed.

### 5. Medium: unapproved wording and claims visible on the local page
- **Evidence:** index.html line 258 shows `<span class="flag" data-pending>Wording needs O3M approval</span>` as a yellow badge (o3m.css line 24 `.flag{display:inline-block...}`). Lines 280-281 and 637 are `data-pending` claims. No CSS hides `[data-pending]`.
- **Impact:** visible draft text and unverified claims damage trust. Ad claims that cannot be substantiated are a Google Ads policy risk.
- **Fix:** before launch, remove the badge. Confirm or remove the claims. If the claims are removed, re-render the credibility video, as the comment on line 278 says.

### 6. Medium: local render-blocking CSS (lab, local server)
- **Evidence:** Lighthouse mobile on http://localhost:8000/google-ads-management/ at 09:35:12Z (evidence/lighthouse-local-mobile.json).
- **Mobile lab results:**
  - Scores: Performance 88, Accessibility 100, Best Practices 96, SEO 100
  - FCP 2.7 s, LCP 3.2 s (element: H1 `#hero-title`), TBT 0 ms, CLS 0, Speed Index 3.4 s
  - Render-blocking: fonts.googleapis.com CSS (874 ms) and o3m.css (618 ms)
- **Desktop lab results:** Performance 99, LCP 0.8 s, CLS 0.003.
- **Caveat:** Python http.server has no gzip and no cache headers, so the "text compression" and "cache TTL" failures do not reflect production. The local performance numbers are indicative only.
- **Fix:**
  - Self-host the Plus Jakarta Sans woff2 files (the live site already self-hosts its font via next/font), or at least preload them.
  - Inline the critical CSS.
  - Serve with gzip/brotli and long cache headers.
  - Convert o3m-logo.png (62,509 B, shown at 158x55) to WebP/SVG. The live site has /brand/o3m-logo.svg.

### 7. Medium: live colour contrast
- **Evidence:** Lighthouse `color-contrast` audit (live mobile and desktop JSON).
  - White text on #16a34a buttons (`/contact`, `/about` CTAs): 3.29:1 at 16px.
  - #16a34a eyebrow text at 12px on #fff and #f8fafc: 3.29:1 and 3.14:1.
- **Impact:** fails WCAG AA (4.5:1). This is the reason the accessibility score is 96.
- **Fix:** use #15803d or darker for green text, and for button backgrounds that carry white text. The local page already passes (accessibility 100).

### 8. Low: live has no social image or og:url
- **Evidence:** `grep og:image|twitter:image|og:url` on evidence/live-raw.html returns 0 matches.
- **Fix:** add a 1200x630 og:image and twitter:image, and set og:url to the canonical URL.

### 9. Low: live unoptimised illustration
- **Evidence:** `curl -L https://o3mdm.com/images/google-ads-why-o3m-v2.png` downloaded 1,359,137 bytes. The raw `<img>` has `loading="lazy"` but no width/height, and the src is not /_next/image.
- **Lighthouse estimates:** "Properly size images" 59 KiB savings (mobile); "next-gen formats" 58 KiB. The image is lazy, so the lab run may not have measured its full weight.
- **Fix:** use next/image with width/height, or export a WebP/AVIF at the displayed size.

### 10. Low: live www redirect chain
- **Evidence:** `curl -I http://www.o3mdm.com/solutions/google-ads-management` returns 301 to https://www.o3mdm.com/... and then 301 to https://o3mdm.com/... (2 hops, evidence/live-headers.txt).
- **Other redirects behave correctly:**
  - http (apex): 1 hop
  - https://www: 1 hop
  - trailing slash: 301 to the no-slash URL
- **Fix:** optional. Add a Netlify rule from http://www to https://o3mdm.com in one hop.

### 11. Low: sitemap has no lastmod
- **Evidence:** https://o3mdm.com/sitemap.xml returned 200 `application/xml` at 09:30:41 UTC. It has 22 `<loc>` entries with priority only. The page URL is at line 52 (evidence/sitemap-excerpt.txt).
- **Fix:** add `lastmod` from the content-change date.

### 12. Low: local has no favicon
- **Evidence:** the server log shows `GET /favicon.ico 404` during the Lighthouse runs. The Lighthouse `errors-in-console` audit failed with the 404, which brings best-practices to 96.
- **Fix:** add `<link rel="icon">` pointing to the live /icon.svg or a local copy.

### 13. Low: title and description lengths
- **Live:**
  - Title "Google Ads Management Services | O3M": 36 characters. OK, could add more value.
  - Description: 164 characters. Slightly long, so it may be cut off.
- **Local:**
  - Title "Google Ads Management — O3M Directional Marketing": 49 characters. OK.
  - Description: 201 characters. Too long.
- **Evidence:** measured with Python `len()` on the HTML-unescaped strings.
- **Fix:** cut the local description to about 150 to 158 characters and put the outcome first. For example: "Google Ads management for qualified enquiries, not just clicks: Search, Performance Max, YouTube and Shopping, with tracking, CRM and follow-up reviewed together." Check the length after editing.

### 14. Low: local reduced-motion timing for #why-video
- **Evidence:** index.html line 296 has `autoplay muted loop playsinline preload="metadata"`. landing.js lines 183-186 remove autoplay, pause the video and add controls under `prefers-reduced-motion: reduce`, but only after the deferred script runs. The CSS reduced-motion rule (o3m.css line 369) does not affect video playback.
- **Fix:** omit `autoplay` in the HTML and start the video from JS only when motion is allowed. The credibility video already handles this through its `<source media="... (prefers-reduced-motion: no-preference)">`.

### 15. Low: ambiguous founding line
- **Evidence:** the live text and local line 590 both read "Part of Boonze Media Solutions / Founded 2010 · Est. 2005". The schema says foundingDate 2010 for O3M and 2005 for the parent, and the local credibility strip says this clearly.
- **Fix:** change the footer to "Founded 2010 · Part of Boonze Media Solutions (est. 2005)".

### 16. Info: live indexability and crawlability pass
- **Evidence** (evidence/live-headers.txt, evidence/robots.txt, evidence/live-head-extract.html):
  - `curl -I` at 09:28:57 UTC: HTTP/1.1 200, Server Netlify, HSTS, no X-Robots-Tag header.
  - `<meta name="robots" content="index, follow">`.
  - Canonical is https://o3mdm.com/solutions/google-ads-management.
  - robots.txt contains `User-Agent: * / Allow: /` and `Sitemap: https://o3mdm.com/sitemap.xml`.
- **Raw HTML vs JS:**
  - The raw HTML (156,405 bytes) and the Chrome headless rendered DOM have the same 36 headings (diff is empty), title and JSON-LD.
  - Link count is 63 raw and 64 rendered. The rendered DOM adds one `/privacy` link, probably a consent banner.
  - Visible text is 1,055 words raw and 1,092 rendered.
  - All copy, FAQ answers (`<details>`) and links are server-rendered.
- **Headings:** H1 count is 1: "Google Ads Management for Businesses That Need More Than Clicks". There are no duplicate headings. Full outline is in evidence/live-parsed-outline.txt.
- **Images:** 3, all with non-empty alt text.
- **Page settings:** lang="en", viewport `width=device-width, initial-scale=1`. No hreflang tags, which is acceptable for a single-language site. og:locale is en_IN.
- **Video:** the live page has no `<video>` and no `<iframe>`, except the GTM noscript iframe.

### 17. Info: local credibility text and video checks pass
- **Five statements:** each one is a `<li>` in `.cred-list` (index.html lines 275-281) and is present in the parsed text: "Founded 2010", "Part of Boonze Media Solutions, est. 2005", "Offices in Chennai &amp; Coimbatore", "Google Premier Partner", "10,000+ Google Ads accounts".
- **Desktop display:** at >=1041px with motion allowed, the list is visually clipped (o3m.css lines 632-635) while the video shows the same words. The text stays in the DOM and is read by screen readers, because the video is aria-hidden. Below 1041px, with reduced motion, or on error, the list is visible. This is content parity, not deceptive hidden text.
- **`.cred-video`** (line 271):
  - poster: o3m-credibility-strip-poster.jpg (200 OK, 76,308 B)
  - width/height 1920x320, preload="metadata", muted, playsinline, autoplay loop
  - aria-hidden="true", tabindex="-1"
  - The source (1,668,821 B mp4) is gated by `media="(min-width: 1041px) and (prefers-reduced-motion: no-preference)"`. motion.js lines 447-458 pause and reload on media changes.
- **`#why-video`** (line 296):
  - poster (200 OK), 1920x1080, preload="metadata", muted, playsinline
  - aria-label plus aria-describedby, with a text list of the six points (lines 302-310)
  - Mobile gets a 290,523 B mp4 through `media="(max-width: 760px)"`
  - Reduced motion is handled in JS (see finding 14)
- **Other local checks:**
  - All 11 local assets and /thank-you/ returned 200 (evidence/local-and-asset-status.txt). The thank-you page has `noindex, nofollow`.
  - H1 count is 1: "Google Ads that bring qualified enquiries, not just clicks." There are no duplicate headings. The raw and rendered heading outlines are identical. JS word-splitting does not change the H1 text.
  - Images: 2, both the logo with alt "O3M Directional Marketing". All decorative SVG/canvas elements are aria-hidden.
  - FAQ answers are in the raw HTML with the `hidden` attribute (accordion). Google indexes this content.
  - lang="en" and viewport are present. Mobile Lighthouse SEO score is 100.
  - Spelling is mixed: "optimisation" in the H2, "Optimization" in the H3. Pick one; en-IN usually uses -isation.

### 18. Info: live structured data matches visible content
- **Blocks** (full JSON is in evidence/live-jsonld.json): Organization, WebSite, 2 x ProfessionalService (Chennai and Coimbatore), WebPage, BreadcrumbList, Service and FAQPage.
- **Addresses:** both addresses match the visible footer exactly:
  - Palani Towers, Venkatanarayana Rd, Parthasarathi Puram, T. Nagar, Chennai 600017
  - 54, Bharathi Park 7th Cross Rd, Saibaba Colony, Coimbatore 641043
- **Other facts:** telephone +919500123131 matches the visible tel: link. foundingDate 2010 and parent Boonze 2005 match the visible text.
- **Ratings:** there is no AggregateRating or Review.
- **FAQPage:** all 5 questions and answer openings were found in the visible text (Python check). The schema is valid. Google shows FAQ rich results only for authoritative government and health sites since 2023, so expect no rich result.
- **Optional improvement:** add a `provider` link from the Service block to the office ProfessionalService entries.

## Links checked
Checked with `curl -L -A "Chrome UA"` at about 09:30 UTC. Full results are in evidence/live-link-status.txt and evidence/local-and-asset-status.txt.
- **Live page:** 63 anchors, 32 unique HTTP URLs. All o3mdm.com internal links return 200, as do boonze.com, Google Partners, the Amazon partner directory, Shopify partners, Instagram and YouTube.
  - twitter.com/o3mdm redirects to x.com/o3mdm (200).
  - facebook.com/IndianMarketingFirm returns **400** and linkedin.com/company/1157128/ returns **403** after redirecting to a login page. Both are typical bot blocking. Check them manually in a browser.
- **Local page:** 45 anchors: 29 in-page (#services, #chain, #faq, #enquiry) or tel: links, and 16 absolute URLs. All absolute URLs returned 200, including both Google Maps links. The anchor texts are in evidence/local-parsed-outline.txt.

## Measurement status
| Metric | Status |
|---|---|
| PSI mobile/desktop (live) | **Unavailable.** The brief's endpoint path `/pagespeedinsights/v5/` returned a Google 404 (evidence/psi-*-wrongpath-404.html). The correct `/pagespeedonline/v5/runPagespeed` returned **429 RESOURCE_EXHAUSTED**, "Queries per day" quota (evidence/psi-mobile.json, psi-desktop.json). The keyless request uses a shared quota. Retry with `&key=API_KEY`. |
| CrUX field LCP/INP/CLS (live) | **Unavailable.** It depends on PSI, which returned no data. |
| Lab metrics (live + local) | Measured with Lighthouse 12.8.2 on this machine (Chrome headless, simulated throttling) at 09:34-09:36 UTC. |
| Local performance in production conditions | Not measured. Python http.server has no compression or caching. |
