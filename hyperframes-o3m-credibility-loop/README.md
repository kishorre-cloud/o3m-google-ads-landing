# O3M credibility strip: HyperFrames 10-second loop

Two seamless 10-second loops of the O3M credibility strip, made from one shared design:

| File | Size | Use |
|---|---|---|
| `output/O3M_Credibility_Kinetic_Loop_10s.mp4` | 1920 × 240, 30 fps, 10.0 s, H.264 High, yuv420p, fast-start, no audio | Desktop strip |
| `output/O3M_Credibility_Kinetic_Loop_Mobile_1080x540_10s.mp4` | 1080 × 540, same settings | Phone strip (three rows) |
| `output/O3M_Credibility_Kinetic_Loop_Poster.png`, `..._Mobile_Poster.png` | Poster frames (9.5 s, the full resting composition) | `poster` attribute / fallback |
| `output/O3M_Credibility_Kinetic_Loop_Preview.gif`, `..._Mobile_Preview.gif` | 15 fps previews, half size | Review only |

## Content (exact, unchanged)

Founded 2010 · Part of Boonze Media Solutions, est. 2005 · Offices in Chennai & Coimbatore · Google Premier Partner · 10,000+ Google Ads accounts.
Line breaks are layout only; no words are added or changed. The "Needs O3M approval" labels are not included.
No Google logo or partner badge is used: the seal is a generic outline. The landmark is an original stylised illustration,
not a depiction of a specific building. The account icon is a cluster of windows and nodes, with no charts, arrows or values.

## Projects

HyperFrames allows one root composition per project, so the two formats are sibling projects:

- `desktop/index.html`: 1920 × 240 layout (one row; ribbons in the bands above and below the words, crossing behind the landmark)
- `mobile/index.html`: 1080 × 540 layout (three rows; ribbons in the gaps between rows, crossing behind the landmark)

Each project holds the same shared files. **Edit both copies together** (or edit one and copy it over):

- `assets/loop.js`: all motion. The ambient layer (ribbons, light trails, particles, glows) runs on a 10-second periodic clock;
  the emphasis layer replays each fact's moment (0–1.5 s 2010, 1.5–3.5 s Boonze, 3.5–5.5 s Offices + landmark,
  5.5–7.5 s Partner, 7.5–9.0 s 10,000+) and returns everything to rest before 10 s, so frame 300 equals frame 0.
- `assets/loop.css`: type, colour and art styles (Plus Jakarta Sans from `assets/fonts/`, O3M blue `#2563EB`, green `#16A34A`, yellow `#EAB308` as a tiny accent only).
- `assets/kit/`: the original kit SVGs (the pin and seal icons are used inline in `index.html`).

## Prerequisites

Node.js 18+ and Chrome; the HyperFrames CLI is fetched by `npx` (pinned to `hyperframes@0.8.151` in each `package.json`).
GSAP 3.14.2 loads from jsDelivr at render time, so rendering needs network access.

## Preview

```bash
cd desktop
npx hyperframes preview
```

Use the same command in `mobile/`. Either one opens the Studio preview in the browser.

## Render

```bash
cd desktop
npx hyperframes render . -q delivery -o ../output/O3M_Credibility_Kinetic_Loop_10s.mp4
```

```bash
cd mobile
npx hyperframes render . -q delivery -o ../output/O3M_Credibility_Kinetic_Loop_Mobile_1080x540_10s.mp4
```

Each render takes about 20 seconds on this machine.

## Notes

- Avoid applying Studio transforms to the ribbon layer (`svg.ribbon-layer`): a 3D tilt makes the ribbons cross the words.
- Ribbon geometry is measured from the live layout on every frame, so it follows any change to the text or the landmark size.
- The website was not changed by this task.
