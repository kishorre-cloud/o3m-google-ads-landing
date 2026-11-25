# robots.txt, sitemap and schema validation

**Date:** 2026-11-11. Checked with curl unless noted otherwise. No file in this area was created or changed, except the JSON-LD listed in section 4.

## 1. Production (o3mdm.com, hosted outside this project)

| Check | Result |
|---|---|
| `https://o3mdm.com/robots.txt` | 200 `text/plain`. Contents: `User-Agent: *` / `Allow: /` / `Sitemap: https://o3mdm.com/sitemap.xml`. Valid syntax. Blocks nothing: the page, CSS, JS, images, fonts and video can all be crawled |
| `https://o3mdm.com/sitemap.xml` | 200 `application/xml`. Holds 22 `<loc>` entries, all absolute HTTPS on o3mdm.com. Includes `https://o3mdm.com/solutions/google-ads-management` (priority 0.9). No preview hostname |
| `https://o3mdm.com/sitemap_index.xml` | 404 (none exists, and none is needed) |
| `https://o3mdm.com/solutions/google-ads-management` | 200 (still the current live page) |

**Decision:** create no robots.txt or sitemap in this project.
- The official domain already has both, and they already cover the canonical URL.
- A second sitemap would compete with it.
- A robots.txt here would only be served on the Vercel preview, which must stay non-indexable.

After launch, re-check that both files still return 200 and that the sitemap still lists the URL.

## 2. Vercel preview (`o3m-google-ads-landing.vercel.app`)

| Check | Result |
|---|---|
| `/google-ads-management/` logged out | 302 to `vercel.com/sso-api` (Vercel Authentication). Crawlers cannot fetch it |
| `/robots.txt`, `/sitemap.xml` logged out | 302 to SSO (no such files are deployed) |
| `X-Robots-Tag` | `noindex, nofollow` on all paths, from `website/vercel.json` `"source": "/(.*)"`. Seen on the authenticated fetch of deployment `dpl_J7enuWLYgLk9sSCa1qNCYoRhkRYH` (commit 406a0b1, 2026-11-05). `vercel.json` is unchanged |
| Canonical in rendered HTML | `https://o3mdm.com/solutions/google-ads-management` (points to the intended production URL) |

**The preview noindex is intentional and was kept.** No preview robots.txt was added: a `Disallow` there would stop crawlers from ever seeing the noindex.

## 3. What production needs at launch (not done here)

1. Use a production configuration **without** the `X-Robots-Tag` header block. Keep it on preview builds only, by deploying production from a config that omits the block or from host rules. Do not delete it globally while the preview is in use.
2. Serve the page at `https://o3mdm.com/solutions/google-ads-management`. Its existing canonical is then self-referencing.
3. Check the headers and rendered HTML on the live URL. Then run the Rich Results Test and the Schema Markup Validator, and request indexing in Search Console.

## 4. Structured data (`index.html`, one JSON-LD `@graph`)

| Node | `@id` | Notes |
|---|---|---|
| Organization | `https://o3mdm.com/#organization` | name, legalName, url, logo (200), foundingDate 2010, telephone, email, 2 PostalAddresses (match o3mdm.com/contact), parentOrganization Boonze Media Solutions (2005, O3M-approved wording). **New:** `sameAs`: LinkedIn, Facebook, Instagram, YouTube, Twitter/X (exact URLs linked from the o3mdm.com homepage), Google Partners profile |
| Service | `…/google-ads-management#service` | Google Ads management, areaServed India, provider → Organization. Unchanged |
| FAQPage (also the WebPage) | `…/google-ads-management#webpage` (was `#faq`; the old id was not referenced anywhere) | **New:** url (= canonical), name (= `<title>`), description (= meta description), inLanguage `en` (= `<html lang>`), about → Service, publisher → Organization. 10 Questions, unchanged |

**Validation:**
- **Syntax:** JSON parses (`delta.js` and `code-reviewer`).
- **References:** every `@id` reference resolves within the graph.
- **FAQ match:** the 10 `mainEntity` names equal the visible `.faqbtn` text exactly (`delta.js` `faqMatch: true` at 1440 and 390).
- **Official validators:** Rich Results Test and Schema Markup Validator were **not run**, because the page is not public. This is pending until launch.

**Not added, on purpose:**
- `BreadcrumbList`: no visible breadcrumb.
- `LocalBusiness`: Organization already carries both offices, and the page is not a branch page.
- `Product` / `SoftwareApplication` for AdFlux: AdFlux is locked.
- `Review` / `AggregateRating`, `Person`, `VideoObject`: there is no verified data and no public video URL.
- FAQ rich results are not expected for this site type, and valid markup does not guarantee any rich result or ranking.

## 5. Metadata

These were checked in the rendered HTML and left unchanged:
- title, meta description, canonical, `lang="en"`
- og:type, og:site_name, og:locale `en_IN`, og:url, og:title, og:description
- `twitter:card summary`
- favicon (200)

**Open:** `og:image`, which is waiting for an O3M-approved image. None was invented.
