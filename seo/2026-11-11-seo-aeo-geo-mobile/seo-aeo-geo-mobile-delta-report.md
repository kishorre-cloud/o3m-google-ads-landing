# SEO, AEO, GEO and mobile credibility video: delta report

**Date:** 2026-11-11. **Status:** local only. Nothing was deployed, committed or pushed, and the live o3mdm.com site was not touched.

**Project:**
- Static HTML/CSS/vanilla JS with no build step, in `C:\Claude\o3m-google-ads-project\website`.
- `/google-ads-management/` is served from `website/google-ads-management/index.html`.
- Git branch: `feature/v2-cinematic-editorial` @ `406a0b1`. The working tree was clean before this task.

## 1. Root cause: the credibility video did not show on phones

There was no broken source. The page was built that way:

- The strip had **one** `<video>` with a single `<source media="(min-width: 1041px) and (prefers-reduced-motion: no-preference)">`.
- `o3m.css` displayed `.cred-video` only inside `@media (min-width:1041px) and (prefers-reduced-motion:no-preference)`.
- Below 1041px the source never matched, so no video was fetched. The CSS showed the HTML list.
- This was deliberate: the 1920×320 strip's smallest text is 23px, so below 1041px it would render under 12.5px.
- **No phone asset existed.**

The poster attribute caused a second, smaller problem: the 35 KB desktop poster was fetched on phones even though it was never shown.

## 2. Fix

**New phone composition:**
- Made in HyperFrames as a new sibling project, `o3m-credibility-motion-graphic-mobile/`.
- Built from the approved strip source. It keeps the same statements, palette, type, ribbons, emphasis timing and spark, stacked in one column at 1080×1000.
- Its smallest text is 40px, which is about 13.3px at 360px wide and 14.4px at 390px.
- The desktop composition and asset are unchanged.

**Page (`index.html`):**
- A second `<video class="cred-video cred-video-m">` with a `<source media="(max-width: 760px) and (prefers-reduced-motion: no-preference)">`.
- It is `muted loop playsinline`, `aria-hidden`, and `preload="none"` with **no autoplay**. It loads only when the strip scrolls into view, the same pattern as the why-video.
- The `poster` attributes were replaced by CSS background images set only inside each video's media query, so a hidden video's poster is never fetched.
- The HTML list stays as the only text for screen readers and crawlers. It is visually hidden only while a video is showing, so nothing is duplicated.

**CSS (`o3m.css`):**
- `.cred-video-d` uses `aspect-ratio:6/1` and `.cred-video-m` uses `aspect-ratio:27/25`, so space is reserved before the media loads.
- The display rules and posters are set per media query.
- Every selector is scoped to `.cred*`.

**JS (`motion.js` §3d):**
- Handles both videos.
- On a source error, or a `play()` rejection with `NotAllowedError` (for example iOS Low Power Mode), it shows the HTML list.
- It pauses off screen (IntersectionObserver), in a background tab (`visibilitychange`), and when the video's own query no longer matches.
- It reloads when a query starts matching.
- Without IntersectionObserver it starts playback directly.

**Widths:**
- 1041px and wider: desktop video, unchanged.
- 761–1040px (tablet): the existing HTML grid. This is intentional. The horizontal strip is unreadable at this width, and the stacked video would be 700px or more tall.
- 760px and narrower: phone video.

### Asset sizes

| Asset | Size | Fetched when |
|---|---|---|
| `o3m-credibility-strip.mp4` (desktop, unchanged) | 739,339 B | 1041px and wider, motion allowed (autoplay, as before) |
| `o3m-credibility-strip-poster.webp` (unchanged) | 35,168 B | 1041px and wider, motion allowed |
| `o3m-credibility-strip-mobile.mp4` (**new**, H.264 CRF 26, SSIM 0.990) | 544,129 B | 760px and narrower, motion allowed, **only after the strip scrolls into view** |
| `o3m-credibility-strip-mobile-poster.webp` (**new**) | 41,868 B | 760px and narrower, motion allowed |

## 3. Test results (Puppeteer and headless Chrome, `C:\Claude\_qa\credmobile.js`; raw output in `credmobile-results.json`)

| Case | Shown | Media fetched | Plays and advances | Strip CLS | Paused off screen |
|---|---|---|---|---|---|
| 1920 | Desktop video | desktop mp4 + poster only | yes (1.0 s per 1 s) | 0 | yes |
| 1440 | Desktop video | desktop mp4 + poster only | yes | 0 | yes |
| 1040 | HTML grid | none | n/a | 0 | n/a |
| 768 | HTML grid (3 + 2) | none | n/a | 0 | n/a |
| 760 | Phone video | phone poster at load; phone mp4 on scroll | yes | 0 | yes |
| 400 | Phone video | same | yes | 0 | yes |
| 390 | Phone video | same | yes | 0 | yes |
| 360 | Phone video | same | yes | 0 | yes |
| 390 reduced motion | HTML list | none | n/a | 0 | n/a |
| 1440 reduced motion | HTML list | none | n/a | 0 | n/a |
| 390 autoplay refused (simulated `NotAllowedError`) | HTML list | phone poster only | n/a | 0 | n/a |
| 390 phone mp4 request aborted | HTML list | (aborted) | n/a | 0 | n/a |
| 1440 desktop mp4 request aborted | HTML list | (aborted) | n/a | 0 | n/a |

**In every case:**
- All 5 statements are present in the DOM.
- There is no horizontal overflow and there are 0 page errors.
- Videos are muted, `playsinline` and loop.
- No device fetched both videos.

**Screenshots** (`screens/`):
- `cred-1920.png`, `cred-1440.png`, `cred-768.png`
- `cred-390.png`, `cred-400.png`, `cred-360.png`
- `cred-390-reduced.png`, `cred-390-autoplay-blocked.png`, `cred-390-media-fails.png`

**Regression suites, all pass with 0 page errors:**
- `flow.js`: form, thank-you, tabs, FAQ, why-video, reduced motion.
- `why.js`: Why O3M cards, including AdFlux card focus.
- `seo-content.js`: links and copy.
- `delta.js`: why-video rate 0.85, 6 panels, 10 FAQs, JSON-LD equal to the visible FAQ.

**Lighthouse 12.8.2, prod-like mobile (`serve@14`), lab data, interleaved A/B, 3 runs each:**

| Build | Perf (median) | FCP / LCP (ms) | TBT (ms) | CLS | Bytes |
|---|---|---|---|---|---|
| HEAD `406a0b1` | 93 | 2561 / 2636 | 0 | 0.0006 | 172 KB |
| This change | 93 | 2552 / 2627 | 0 | 0.0006 | 179 KB |

- There is no regression.
- Absolute FCP is higher than on 2026-11-05 (1.1 s) for **both** builds, because this machine was busier (Pixel Office and several servers running). It is not caused by the code.
- The reports are in `perf/2026-11-11-mobile-cred/ab/`.

**Code review:**
- `code-reviewer` approved.
- 1 MEDIUM finding (a blocked autoplay would leave the iOS play glyph over the poster) is fixed: it now falls back to the list.
- 1 LOW finding (a non-matching video can start in browsers that ignore `<source media>`) is fixed: the video now pauses if its query does not match.

**Not tested:**
- A real iPhone or Android device, Safari, Firefox.
- A real network-offline run; an aborted request was used instead.

## 4. Technical SEO, AEO and GEO

See `robots-sitemap-schema-validation.md` for robots.txt, the sitemap, preview vs production behaviour and the schema.

**Changes:**
- **JSON-LD:**
  - Organization `sameAs` added. It lists the 5 social profiles linked from the official o3mdm.com homepage (LinkedIn, Facebook, Instagram, YouTube, Twitter/X) and the Google Partners profile.
  - The existing FAQPage node now carries WebPage properties: `@id …#webpage`, `url` (= canonical), `name` (= `<title>`), `description` (= meta description), `inLanguage: en`, `about` → Service, `publisher` → Organization.
  - No other metadata changed.

**Verified unchanged, with no edit needed:**
- Title and meta description are unique.
- Canonical is `https://o3mdm.com/solutions/google-ads-management`.
- `<html lang="en">`.
- og:title, og:description, og:url and `twitter:card=summary`.
- The favicon returns 200 and the logo has alt text.
- The thank-you page has `noindex, nofollow`.

**Links:**
- Every external and internal `https` link returns 200 with no redirect, checked with `curl -L` on 2026-11-11.
- No internal link redirects back to this page.
- The footer link "Google Ads Management" points to the canonical URL. Once live, that is a normal self-link in the services nav, not a redirect. It was left unchanged.
- The only redirect seen was `twitter.com/o3mdm` → 301 to x.com. It is used only in `sameAs`, exactly as the official homepage links it.

**AEO** (buyer questions from `seo/2026-11-04-why-o3m-aeo-geo/aeo-geo-content-review.md`):
- These are answered on the page with a direct first sentence: what management includes, lead quality, B2B, ecommerce, Chennai/Coimbatore/India coverage, agency vs in-house, budget factors, Premier Partner, AdFlux.
- Still unanswered, because they need O3M's input: fees, time to results, reporting cadence, account ownership and contracts, minimum budget.
- No copy was changed: no factual gap could be filled with verified facts.

**GEO and entity:**
- Name, URL, phone, email and both offices match o3mdm.com/contact.
- Google Partners profile, re-checked with Firecrawl on 2026-11-11: "2026 Premier Partner". This matches the strip and the card, and both link to the profile.
- The Boonze "parent company" wording is unchanged, as O3M approved on 2026-11-04.
- No `llms.txt` was created: it has no maintenance owner and is not a Google requirement.

**AI answer and citation visibility was not measured.** No AI-search tool was used, and the page is not public. No ranking, rich-result or citation improvement is claimed.

## 5. AdFlux and credibility links

- **AdFlux: unchanged.** No diff hunk touches it. The `code-reviewer` hashed the AdFlux lines in HEAD and in the working copy and they match. The `<section aria-labelledby="adflux-title">` block is identical.
- **Credibility links: unchanged.** These are the Google Partners profile, boonze.com, the Google Maps links for both offices, and the Trust & Partnerships page.

## 6. Tools used

- Bash: git, curl, ffmpeg, ffprobe.
- HyperFrames 0.8.151: check, snapshot, render.
- Puppeteer-core with Chrome.
- Lighthouse 12.8.2 via npx, served by `serve@14`.
- Firecrawl scrape: the Google Partners profile.
- One `code-reviewer` agent.

**Not used:** Rich Results Test and Schema Markup Validator (they need a public URL), Search Console, and AI-search tools.

## 7. Files

**Changed:**
- `website/google-ads-management/index.html`
- `website/assets/css/o3m.css`
- `website/assets/js/motion.js`

**New:**
- `website/assets/video/o3m-credibility-strip-mobile.mp4`
- `website/assets/video/o3m-credibility-strip-mobile-poster.webp`
- `o3m-credibility-motion-graphic-mobile/`: composition source, README and render master
- this folder
- `perf/2026-11-11-mobile-cred/`

**Not changed:**
- `website/vercel.json`
- earlier reports

## 8. Launch dependencies (unchanged by this task, still open)

- Remove the preview-only `X-Robots-Tag: noindex, nofollow` from the **production** configuration only.
- Confirm the production route serves `/solutions/google-ads-management` with a self-canonical.
- After launch: Rich Results Test, URL Inspection, and check that robots.txt and the sitemap still list the URL.
- O3M inputs still needed:
  - form endpoint
  - GTM, GA4 and Google Ads IDs
  - an approved og:image
  - fees, timeline, reporting cadence, account ownership
  - case studies and testimonials
- O3M should also correct the self-reported Partners profile name field ("…Premier SME Partner").
