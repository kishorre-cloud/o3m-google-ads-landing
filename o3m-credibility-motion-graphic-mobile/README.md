# O3M credibility strip: phone layout (1080 × 1000, 10 s loop)

Phone companion to `../o3m-credibility-motion-graphic` (the approved 1920 × 320 strip). The statements, palette, Plus Jakarta Sans type, ribbons, light trails, glows, 2-second emphasis windows and the single yellow spark are all the same. The five statements are stacked in one column, so the smallest text (40 px) still renders at about 13 px on a 360 px screen.

Founded 2010 · Part of Boonze Media Solutions, est. 2005 · Offices in Chennai & Coimbatore · Google Premier Partner · 10,000+ Google Ads accounts. The wording is exact; line breaks are layout only.

## Files

| File | Use |
|---|---|
| `index.html` | The composition (all layout and motion) |
| `output/o3m_credibility_strip_mobile.mp4` | Render master (HyperFrames delivery quality, about 2.1 MB). Not served |
| `output/o3m_credibility_strip_mobile_poster.png` | Frame at 9.5 s (all statements at rest) |
| `../website/assets/video/o3m-credibility-strip-mobile.mp4` | Web copy: H.264 High CRF 26, yuv420p, fast-start, no audio, 544 KB (SSIM 0.990 vs master) |
| `../website/assets/video/o3m-credibility-strip-mobile-poster.webp` | Web poster (quality 80, 42 KB) |

## Rebuild

```bash
npx --yes hyperframes@0.8.151 check
npx --yes hyperframes@0.8.151 render . -q delivery -o output/o3m_credibility_strip_mobile.mp4
ffmpeg -i output/o3m_credibility_strip_mobile.mp4 -an -c:v libx264 -profile:v high -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart ../website/assets/video/o3m-credibility-strip-mobile.mp4
ffmpeg -ss 9.5 -i output/o3m_credibility_strip_mobile.mp4 -frames:v 1 -c:v libwebp -quality 80 ../website/assets/video/o3m-credibility-strip-mobile-poster.webp
```

GSAP loads from jsDelivr at render time, so rendering needs network access. If you change a statement, change it in both projects and in the HTML list in `website/google-ads-management/index.html`.
