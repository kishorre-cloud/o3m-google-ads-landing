# Schema report: Google Ads Management landing page

**Assessed:** `website/google-ads-management/index.html` at commit `3ef2a92` (file modified 2026-11-11), plus one correction made today (2026-11-16).
**Method:** the installed `claude-seo:seo-schema` skill (v2.6.2), together with `skills/seo/references/schema-types.md` and `seo-schema/references/deprecated-types-2024-2026.md`.
**Preview:** the Vercel preview redirects to Vercel sign-in (302), so all checks ran on the local source served at `localhost:8000`.

## 1. What the page contains

| Format | Found | Detail |
|---|---|---|
| JSON-LD | 1 block | `@context: https://schema.org`, one `@graph` holding 3 entity nodes: Organization, Service, FAQPage. The FAQPage node also carries the WebPage properties |
| Microdata | none | 0 `itemscope` / `itemprop` |
| RDFa | none | 0 `typeof`. The 6 `property="og:*"` attributes are Open Graph meta tags, not schema.org RDFa |

**`parse_html.py` result:** `schema_invalid.count = 0`.

**Raw vs rendered:** the JSON-LD in the raw HTML and in the rendered DOM is identical once line endings are normalised (10,000 chars vs 9,846 chars; the difference is exactly the 154 CRLF line endings). The JSON-LD is in the initial HTML, not injected by JavaScript.

## 2. Inventory by type

| Type | Detected | Applicable? | Action | Google rich-result eligibility | Validation | Evidence / reason |
|---|---|---|---|---|---|---|
| Organization | Yes, `https://o3mdm.com/#organization` | Yes | **Required correction (done):** removed the Google Partners directory URL from `sameAs`. Everything else kept | No rich result. Used for logo and knowledge-panel understanding | Valid | All values match o3mdm.com's own Organization JSON-LD and the contact page: name, founding date 2010, phone, email, both addresses, logo (200), 5 social `sameAs`. `legalName` "O3M Directional Marketing Pvt Ltd" matches the page footer and the o3mdm.com footer, Privacy and Terms pages. The Partners profile is a directory listing, not an identity profile, and o3mdm.com does not list it in `sameAs`. The visible links to it on the page are unchanged |
| `parentOrganization` (Boonze) | Yes | Kept, flagged | Keep as is (O3M-confirmed) | None | Valid | O3M confirmed "parent company" on 2026-11-04, and o3mdm.com's own Organization JSON-LD declares the same `parentOrganization`. Conflicting sources: boonze.com calls O3M a "sister company" and the MCA record lists no corporate parent. See section 5 |
| WebSite | No | Appropriate | **Optional, not added** | No rich result (the sitelinks search box is gone) | n/a | o3mdm.com already defines `https://o3mdm.com/#website` site-wide. When the page joins the production site, link to it with `isPartOf` instead of redefining it |
| WebPage | Yes, as properties on the FAQPage node (`…#webpage`) | Yes | Keep as is | None | Valid | `url` = canonical, `name` = `<title>`, `description` = meta description, `inLanguage` = `en` (= `<html lang>`), `about` → Service, `publisher` → Organization. FAQPage is a subtype of WebPage, so one node covers both |
| Service | Yes, `…#service` | Yes | Keep as is | None | Valid | Matches the live o3mdm.com Service node (same `@id`, `areaServed` India, `provider` → Organization). The description lists campaign types that appear as visible tabs. "Serving clients across India" is visible text, and o3mdm.com uses `areaServed: IN` |
| LocalBusiness / ProfessionalService | No | Not applicable on this page | None | n/a | n/a | o3mdm.com already marks up both offices as `ProfessionalService` (`#office-chennai`, `#office-coimbatore`). This is a service page, not a location page; the addresses on the Organization are enough |
| PostalAddress | Yes, 2 nested in Organization | Yes | Keep as is | n/a | Valid | Street, locality, region (Tamil Nadu), postal code (600017 / 641043) and country IN all match o3mdm.com/contact |
| ContactPoint | No (`telephone` and `email` are direct properties) | Appropriate | **Optional, not added** | n/a | n/a | o3mdm.com carries a "customer support" ContactPoint. Adding one here would only repeat the site-wide node |
| BreadcrumbList | No | **Not applicable** | None | Would be eligible, but there is no visible breadcrumb | n/a | The page has no visible breadcrumb trail. The live o3mdm.com page has one; re-check at release |
| FAQPage | Yes, 10 questions | Kept as information only | Keep as is | **None.** The skill reference states Google retired FAQ rich results for all sites on 2026-05-07 | Valid | All 10 question names and all 10 answer texts match the visible FAQ exactly (checked character by character after stripping tags). These are commercial FAQs written by O3M, so QAPage would be wrong |
| VideoObject | No | **Blocked** | None | Would need a public video | n/a | The two videos are decorative motion (aria-hidden) or a short explainer, on a private preview. There is no public URL and no verified upload date |
| Person | No | **Not applicable** | None | n/a | n/a | No named experts appear on the page |
| ImageObject | No (logo is a URL string) | Optional | Not added | n/a | n/a | The logo URL string is valid. o3mdm.com uses a logo ImageObject (`#logo`, SVG); either form is accepted |
| Review, AggregateRating, Product, SoftwareApplication, Offer, HowTo, Article, QAPage | No | Not applicable | None | n/a | n/a | No genuine reviews, products, prices or articles. HowTo is deprecated. AdFlux is locked |

## 3. Entity `@id` graph (after the fix)

```
https://o3mdm.com/#organization                          Organization
  ├─ address[2]            PostalAddress (Chennai, Coimbatore)
  ├─ parentOrganization    Organization "Boonze Media Solutions" (inline, no @id)
  └─ sameAs[5]             LinkedIn, Facebook, Instagram, YouTube, Twitter/X (= o3mdm.com list)
https://o3mdm.com/solutions/google-ads-management#service    Service
  └─ provider → #organization
https://o3mdm.com/solutions/google-ads-management#webpage    FAQPage (WebPage)
  ├─ about     → #service
  ├─ publisher → #organization
  └─ mainEntity[10] Question / Answer
```

- The `@id`s match the ones o3mdm.com already uses for the Organization, the Service and this page's WebPage, so the page will join the existing site graph rather than create a duplicate entity.
- Every `@id` reference resolves within the page.

## 4. Validation

| Check | Result |
|---|---|
| JSON parse, `@context` https, valid types, no deprecated types | Pass |
| Placeholders, relative URLs, http URLs | None found |
| `parse_html.py` `schema_invalid` | 0 |
| FAQPage text vs visible text | 10 of 10 questions and 10 of 10 answers identical |
| `delta.js` regression (1440 and 390) | Pass: JSON-LD valid, FAQ matches, 0 page errors |
| **Schema.org Validator** (code input via `validator.schema.org/validate`, 2026-11-16) | **0 errors, 0 warnings.** Raw output in `evidence/schema-org-validator.json` |
| **Google Rich Results Test** | **Not run, preview inaccessible.** It needs a public URL or an interactive session. FAQ is the only rich-result type present here, and it is retired |

Valid markup does not guarantee any rich result or ranking change.

## 5. O3M confirmation required

1. **Boonze relationship.** O3M's 2026-11-04 decision and o3mdm.com's JSON-LD say "parent company". boonze.com says "sister company" and the MCA record lists no corporate parent. `parentOrganization` stays on O3M's confirmation. Either O3M aligns boonze.com, or `parentOrganization` should be removed from both o3mdm.com and this page.
2. **Partners profile name field.** The profile's self-reported name, "O3M Directional Marketing Premier SME Partner", should be corrected in Google Partners (carried over from 2026-11-04).
