# O3M Google Ads landing page

- `website/` — static site: `/google-ads-management/` landing page, `/thank-you/` confirmation page, shared `assets/`.
- `hyperframes-video-source/` — editable HyperFrames composition for the 10s "Why campaigns underperform" video, with local fonts and the full-quality master in `renders/`.

## Preview locally

```bash
python -m http.server 8765 --directory website
```

Open http://localhost:8765/google-ads-management/

## Before launch

- Set `data-endpoint` on the enquiry `<form>`; until then submissions are simulated (`?simulate=fail` previews the error state).
- Google Premier Partner and 10,000+ Google Ads accounts were approved by O3M on 2026-11-04; remaining approval items are in `seo/2026-11-04/content-implementation/content-gap-and-approval-list.md`.
- `website/vercel.json` adds `X-Robots-Tag: noindex, nofollow` for the private Vercel preview. Remove that header before this page goes live at the primary URL.

## Re-render the video

```bash
cd hyperframes-video-source
npx hyperframes render . -q high -o renders/o3m-why-campaigns-motion.mp4
```
