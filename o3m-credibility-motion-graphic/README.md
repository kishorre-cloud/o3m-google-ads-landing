# O3M credibility strip: text-only motion graphic

**The video:** `output/o3m_credibility_strip.mp4`. It is 1920 × 320 at 30 fps, 10.0 s long, encoded H.264 High / yuv420p with fast-start, and has no audio track. It is a seamless 10-second loop.

Also in `output/`:
- `o3m_credibility_strip_poster.png`: a poster frame (9.5 s, all statements at rest)
- `o3m_credibility_strip_preview.gif`: a 15 fps half-size preview
- `o3m_credibility_strip_contact_sheet.png`: frames at 0, 1, 3, 5, 7, 9 and 9.95 s

## What it shows
Five statements in a fixed horizontal layout, all on screen for the whole loop:

Founded 2010 · Part of Boonze Media Solutions, est. 2005 · Offices in Chennai & Coimbatore · Google Premier Partner · 10,000+ Google Ads accounts

- **Text:** real HTML text in Plus Jakarta Sans (`assets/fonts/`). Line breaks are layout only.
- **Nothing extra:** no icons, logos, badges, charts or illustrations.
- **Camera:** fixed, with no pan, zoom or tilt.
- **Motion:** each statement gets a 2-second moment in turn (0–2, 2–4, 4–6, 6–8, 8–10 s): a short gradient underline, a blue-to-green gradient wipe through the words, and a soft glow behind them. It then returns to rest, so the words never move or disappear.
- **Background:** two fine blue → teal → green ribbons with light trails run only in the bands above and below the type. Two soft blue and green glows drift, and a faint sheen crosses once per loop.
- **Yellow:** used once, as a small spark at the end of the final underline.
- **Loop:** every background element is periodic with a 10-second period, and every moment of emphasis ends at the rest state, so the last frame flows into the first.

## Tools
[HyperFrames](https://hyperframes.heygen.com) 0.8.151 (HTML rendered to video), with GSAP 3.14.2 for the timeline.

## Prerequisites
Node.js 18+ and Google Chrome. The HyperFrames CLI is fetched by `npx`, pinned in `package.json`. GSAP loads from jsDelivr, so a render needs network access.

## Preview
```bash
npx hyperframes preview
```

## Render (exact command used)
```bash
npx hyperframes render . -q delivery -o output/o3m_credibility_strip.mp4
```
It takes about 21 seconds on the build machine.

## Editing
Everything is in `index.html`:
- **Layout and type:** CSS variables, `.lbl`, `.main`, `.num`, `.sub`
- **Ribbons:** the `ribbons` array (`y` = band height; keep these above 70 and below 250 so they stay clear of the text)
- **Emphasis timing:** the loop over `#c1`–`#c5`

Keep every motion periodic within 10 seconds so the loop stays seamless.
