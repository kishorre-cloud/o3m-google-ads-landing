# Enquiry form and conversion tracking

Status (2026-11-24): code is ready, but nothing is measured and no lead is sent until O3M supplies the items under "Open questions". No tracking ID is set in the site. Do not invent one.

## 1. Enquiry endpoint contract

The form is `website/google-ads-management/index.html`, `<form id="enquiry-form" ... data-endpoint="">`. Put the endpoint URL in `data-endpoint`.

The endpoint must:

- Accept `POST` with `multipart/form-data` (the browser sends `new FormData(form)`, header `Accept: application/json`).
- Allow CORS for the production site origin if it is on another host.
- Return 2xx only after the lead is stored. Any non-2xx is shown to the visitor as a failure.
- Optional JSON body: `{"ok": false}` or `{"success": false}` with a 2xx status is also treated as a failure. Any other 2xx body (JSON or not) is success.
- Respond within 15 seconds. After 15 seconds the request is aborted and the visitor sees the failure box.

Fields sent: the visible form fields (name, email, mobile, company, goal, website and the optional fields, using the `name` attributes in the HTML) plus the hidden attribution fields `gclid`, `gbraid`, `wbraid`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `landing_page`.

Behaviour in `website/assets/js/landing.js`:

- Empty `data-endpoint`: every valid submit shows the failure box (phone and email). Nothing is faked and nothing is sent.
- On localhost / 127.0.0.1 / [::1] only, `?simulate=success` or `?simulate=fail` previews the outcome without sending anything. Production hosts ignore it.
- On confirmed success the page stores `o3m-lead` = `{id, goal}` in sessionStorage and redirects to `/thank-you/`. `id` is a random per-submission ID generated in the browser.

## 2. Where the GTM container ID goes

Both pages have an inert loader at the top of `<head>`:

- `website/google-ads-management/index.html`
- `website/thank-you/index.html`

Replace the empty string in `})('');` with the container ID (format `GTM-XXXXXXX`) on BOTH pages. With an empty or invalid ID, or on a local host, no Google script loads.

Then bump the `?v=` cache tags if landing.js changes, and redeploy.

## 3. dataLayer event

The thank-you page pushes exactly one event per confirmed submit, then deletes `o3m-lead`. A direct visit, reload or Back pushes nothing.

```js
{ event: 'generate_lead', form_id: 'enquiry-form', lead_id: '<per-submission id>', lead_goal: 'leads' | 'ecom' | 'both' | 'unsure' }
```

No personal data is in the dataLayer.

## 4. GTM setup (once the container exists)

1. Tag: Google tag (GA4 configuration) with the GA4 measurement ID. Trigger: All Pages.
2. Tag: Conversion Linker. Trigger: All Pages.
3. Data Layer Variables (version 2): `lead_id`, `form_id`, `lead_goal`.
4. Trigger: Custom Event, event name `generate_lead`, fires on some events where Page Hostname equals the production hostname.
5. Tag: GA4 Event, event name `generate_lead`, parameters `form_id`, `lead_id`, `lead_goal`. Trigger: step 4. In GA4 Admin, mark `generate_lead` as a key event.
6. Google Ads conversion, choose ONE as the primary conversion, not both:
   - Option A: Google Ads Conversion Tracking tag with the conversion ID and label, Transaction ID = `{{DLV - lead_id}}`, trigger from step 4.
   - Option B: import the GA4 `generate_lead` key event into Google Ads.
   If both exist, set the other one to secondary so leads are not counted twice.

## 5. Open questions for O3M

1. Enquiry endpoint URL and field mapping into the CRM or inbox (which system stores the lead, and which field names it expects).
2. GTM container decision. The live o3mdm.com uses GTM-KFG4JJ9 and GA4 G-YW1YW7F5EN. Reusing them on this page is NOT approved. O3M must confirm: reuse that container, or create a new one.
3. Google Ads conversion ID and label (if Option A).
4. Production hostname for the trigger filter.
5. Consent Mode v2 and the consent banner / CMP to use (needed before tags fire for EEA/UK visitors; O3M to decide for India traffic).
6. Enhanced conversions for leads: wanted? It needs hashed email/phone, which this page does not put in the dataLayer today.
7. Spam protection: honeypot, rate limit or CAPTCHA on the endpoint side.
8. Deduplication: should the endpoint store and return a `submission_id`, and should it match `lead_id`?

## 6. How to test once IDs exist

1. Set the GTM ID on both pages and a real `data-endpoint`; deploy to a non-production test host, or use GTM Preview against production.
2. Open GTM Preview (Tag Assistant) on the landing page URL.
3. Submit the form with test data. Check: the endpoint stored the lead; the page went to `/thank-you/`; Tag Assistant shows one `generate_lead` event with `lead_id`, `form_id`, `lead_goal`; the GA4 event tag and the Ads conversion tag fired once.
4. Reload the thank-you page: no new `generate_lead`.
5. In GA4 Admin > DebugView, confirm `generate_lead` arrives with the parameters.
6. Stop the endpoint (or point it at a URL that returns 500) and submit: the failure box shows and no `generate_lead` fires.
7. In Google Ads, the conversion action shows "Recording conversions" after a real ad click lead (can take hours).
