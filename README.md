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
- Approve or remove the elements marked `data-pending` (Google Premier Partner, 10,000+ accounts, privacy wording).

## Re-render the video

```bash
cd hyperframes-video-source
npx hyperframes render . -q high -o renders/o3m-why-campaigns-motion.mp4
```
