# Production configuration (prepared, not active)

This folder holds the configuration for the **approved production launch** only. Nothing here is used by the private Vercel preview. The preview keeps using `frontend/vercel.json`, which applies `X-Robots-Tag: noindex, nofollow` to every path and sits behind Vercel Authentication. Do not change that file for launch.

**Production URL:** `https://o3mdm.com/solutions/google-ads-management`. It is served without a trailing slash; the slash form 301-redirects to it, which matches the current live site.

## Option A: the page is served by a Vercel project at o3mdm.com

Use `vercel.json` from this folder in place of `frontend/vercel.json` **in the production project only**. It:

- rewrites `/solutions/google-ads-management` to `google-ads-management/index.html`, and redirects (301) the trailing-slash form to it;
- sends **no** `X-Robots-Tag` on the page, so it can be indexed;
- keeps `X-Robots-Tag: noindex, nofollow` on `/thank-you` and `/thank-you/` (the page also has a `noindex` meta tag);
- sends `X-Robots-Tag: noindex, nofollow` on the internal path `/google-ads-management/`, so only `/solutions/google-ads-management` can be indexed (headers match the requested path, so the rewritten production URL is not affected);
- keeps the cache headers for `/assets/` from the preview;
- has no `/` → `/google-ads-management/` redirect, because the site's homepage must stay intact.

## Option B: the page is served by the existing o3mdm.com site (Netlify / Next.js)

Apply the same rules in that site's own configuration:

| Requirement | Detail |
|---|---|
| Page route | `/solutions/google-ads-management` returns this page's HTML with 200 and **no** `noindex` header. Remove the old Next.js route for this URL, and its page-level JSON-LD (5-question FAQPage, WebPage, Service, BreadcrumbList). This avoids duplicate entities |
| Assets | `/assets/css/`, `/assets/js/`, `/assets/img/`, `/assets/video/` served from the root (the page uses root-absolute paths). All return 404 on o3mdm.com today |
| Thank-you | `/thank-you/` served with the `noindex` meta tag (already in the HTML), left out of `sitemap.xml` |
| Site-wide JSON-LD | Keep the `@id`s used on this page: `https://o3mdm.com/#organization`, `#website`, `#office-chennai`, `#office-coimbatore`, and Boonze as `https://boonze.com/#organization` (`parentOrganization` / `subOrganization`). The live site still describes Boonze inline |

## Values only O3M can supply (fill in at launch, not before)

- **Form endpoint:** the `data-endpoint` attribute on `#enquiry-form` in `frontend/google-ads-management/index.html`. While it is empty, `landing.js` only simulates a submission, and no lead is sent.
- **Google Tag Manager container ID** (or the GA4 measurement ID and the Google Ads conversion ID and label).
- **Cookie banner / Consent Mode:** only if o3mdm.com uses them.

## Link to change at launch

On `frontend/thank-you/index.html`, the "Return to O3M" button links to `/google-ads-management/` (this campaign page, which is where it lives on the Vercel preview). On the production host the page is served at `/solutions/google-ads-management`, and `/google-ads-management/` is the noindex internal path, so change the button's `href` to `/solutions/google-ads-management` when deploying with `deploy/production/vercel.json`.

## After launch

1. Check the live response headers and raw HTML: canonical, no `noindex`, every `/assets/` request returns 200.
2. Run Google's Rich Results Test and the Schema.org validator on the live URL.
3. Use URL Inspection in Search Console and request indexing. Confirm `sitemap.xml` still lists the URL (add `<lastmod>` if the site can keep it accurate).
4. Submit a live test lead from the ad URL, `?gclid=TEST123&utm_source=google&utm_medium=cpc`. Confirm it arrives with those values and that the conversion shows in Tag Assistant.
