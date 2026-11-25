# Technical SEO Checklist: Google Ads Management page (2026-11-04)

- **Live:** https://o3mdm.com/solutions/google-ads-management
- **Local:** website/google-ads-management/index.html, served at http://localhost:8000/google-ads-management/
- **Evidence:** all files are in `evidence/`. Full detail is in baseline-audit.md.
- **Key:** PASS / FAIL / WARN / N/A.

| Item | Live status | Local status | Evidence | Action |
|---|---|---|---|---|
| HTTP status | PASS 200 | PASS 200 (local server) | live-headers.txt, local-headers.txt | None |
| http to https | PASS 301, 1 hop | N/A (not deployed) | live-headers.txt | None |
| www to non-www | PASS for https://www (1 hop). WARN for http://www (2 hops). | N/A | live-headers.txt | Optional: make http://www a single 301 |
| Trailing slash | PASS: /path/ returns 301 to /path | N/A. Folder URL; the no-slash URL returns 301 to /path/ on the Python server | live-headers.txt, local-headers.txt | Match the live no-slash convention on deploy |
| Canonical | PASS: self-referencing | FAIL: missing | live-head-extract.html, local-head-extract.html | Add canonical for the final URL |
| Robots meta / X-Robots-Tag | PASS: `index, follow`, no header | FAIL: none set (defaults to indexable) | live-head-extract.html | Choose index (replacement) or noindex (paid-only) |
| robots.txt | PASS: Allow /, Sitemap declared | N/A | robots.txt | None |
| Sitemap inclusion | PASS: listed (line 52 of 22 URLs). WARN: no lastmod. | N/A | sitemap.xml, sitemap-excerpt.txt | Add lastmod |
| Content in raw HTML (no JS) | PASS: headings, copy, FAQ and links match the rendered DOM | PASS: all copy, FAQ and credibility text in raw HTML | live-rendered-dom.html, local-rendered-dom.html | None |
| Title | PASS: 36 characters | PASS: 49 characters | *-parsed-outline.txt | Optional: enrich the live title |
| Meta description | WARN: 164 characters | WARN: 201 characters | *-parsed-outline.txt | Trim to about 155 characters |
| Single H1 | PASS (1) | PASS (1) | *-parsed-outline.txt | None |
| Heading hierarchy / duplicates | PASS: no duplicates | PASS: no duplicates | *-parsed-outline.txt | None |
| Image alt | PASS: 3/3 have alt | PASS: 2/2 have alt; decorative SVG/canvas aria-hidden | *-parsed-outline.txt | None |
| Internal links | PASS: all 200 | PASS: all 200 (absolute to o3mdm.com) | live-link-status.txt, local-and-asset-status.txt | None |
| External links | PASS. WARN: Facebook 400 and LinkedIn 403 (likely bot blocks) | PASS: Boonze, Maps, Google Partners return 200 | live-link-status.txt, local-and-asset-status.txt | Check FB and LinkedIn manually |
| JSON-LD | PASS: Organization, WebSite, ProfessionalService x2, WebPage, Breadcrumb, Service, FAQPage | FAIL: none | live-jsonld.json | Port to local; rewrite the FAQPage block for the local FAQ |
| Schema matches visible content | PASS: addresses, phone and dates match; no ratings or reviews | N/A | live-jsonld.json, live-parsed-outline.txt | None |
| FAQPage validity | PASS: 5/5 questions visible | N/A (no schema; FAQ visible) | baseline-audit.md finding 18 | Expect no rich result (Google restricts FAQ rich results) |
| Open Graph / Twitter | WARN: title, description, site_name, locale and card present; no og:image, twitter:image or og:url | FAIL: none | live-head-extract.html | Add a full set with a 1200x630 image |
| lang | PASS `en` | PASS `en` | *-parsed-outline.txt | Optional `en-IN` |
| Viewport | PASS | PASS | *-head-extract.html | None |
| hreflang | N/A (single language) | N/A | grep: 0 matches | None |
| Favicon | PASS | FAIL: /favicon.ico 404 | server log, lighthouse-local-*.json | Add icon link |
| Analytics / conversion tag | PASS: GTM-KFG4JJ9 | FAIL: none; form endpoint empty | live-raw.html, index.html line 174 | Add GTM or Ads tag and the form endpoint before launch |
| Draft or pending content | N/A | FAIL: visible "Wording needs O3M approval" badge; 3 data-pending claims | index.html lines 258, 280-281, 637 | Resolve before launch |
| Credibility statements as HTML text | PASS: Founded 2010, Est. 2005, both cities, Premier Partner and 10,000+ in the text | PASS: all 5 as `<li>` text | local-parsed-outline.txt, live text check | None |
| Video poster / size / preload / muted / playsinline | N/A (no video on live) | PASS for both videos | index.html lines 271, 296 | None |
| Video reduced motion | N/A | PASS for cred-video (source media query). WARN for why-video (JS-only; HTML autoplay) | landing.js lines 183-186 | Remove HTML autoplay |
| PSI / CrUX field data | UNAVAILABLE (429 quota; brief URL path 404) | UNAVAILABLE (localhost) | psi-*.json | Retry PSI with an API key |
| Lab performance, mobile | WARN: perf 75; LCP 5.0 s, TBT 310 ms, CLS 0 | WARN: perf 88; LCP 3.2 s, FCP 2.7 s, TBT 0, CLS 0 | lighthouse-summary.txt | Live: hero LCP and GTM. Local: fonts and CSS. |
| Lab performance, desktop | PASS: perf 100; LCP 0.5 s | PASS: perf 99; LCP 0.8 s | lighthouse-summary.txt | None |
| Lighthouse SEO | PASS 100 / 100 | PASS 100 / 100 | lighthouse-summary.txt | None |
| Lighthouse accessibility | WARN 96 (contrast) | PASS 100 | lighthouse-summary.txt | Darken brand green to #15803d for text and buttons |
| Image weight | WARN: 1.36 MB PNG illustration | WARN: 62.5 KB PNG logo at 158x55 | local-and-asset-status.txt | WebP/AVIF or SVG |
| Compression / caching | PASS: br, 20,813 B transfer; Cache-Control must-revalidate on HTML | Not representative (python http.server) | live-headers.txt (end), lighthouse-local-*.json | Check on the production host |

## Update after implementation (main session, 2026-11-04 09:43 UTC)

The table above is the **baseline** (before changes). These local items changed afterwards. Details: `implementation-log.md`; checks: `validation-report.md`.

| Item | Local status now |
|---|---|
| Canonical | Added: `https://o3mdm.com/solutions/google-ads-management` (Lighthouse `canonical` pass) |
| Title | `Google Ads Management Services \| O3M Directional Marketing` (58 chars) |
| Meta description | 159 chars (was 201) |
| Open Graph / Twitter | og:type, og:site_name, og:locale, og:url, og:title, og:description, twitter:card added; no og:image (no approved image) |
| Favicon | Linked to https://o3mdm.com/favicon.ico; console error gone (best-practices 96 to 100) |
| JSON-LD | `Service` with provider `Organization` added; Breadcrumb/FAQPage/Organization-with-addresses to port only if this page replaces the live URL |
| Robots meta | Unchanged (none = index, follow by default). `noindex` for a paid-only deployment is an owner decision |
