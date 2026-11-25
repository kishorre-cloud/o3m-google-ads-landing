# Performance diagnosis: O3M Google Ads landing page

**Date:** 2026-11-05
**Project:** `C:\Claude\o3m-google-ads-project\website`. Plain static HTML/CSS/JS: no framework, no bundler, no build step. There is no "production build" to compare with; the production-equivalent is the same files served compressed (Vercel, or `serve@14` locally on :4173).
**Evidence:** `before/` (Lighthouse JSON/HTML), `runtime/` (Chrome traces and scripts, runtime agent), `assets/` (encode tests, asset agent).

**All numbers below are lab measurements** (Lighthouse simulated throttling, or headless Chrome traces). **No real-user Core Web Vitals (CrUX) exist for this page.**

## 1. Lighthouse baseline (lab)

| Run | Perf | FCP | LCP | TBT | CLS | Speed Index | Bytes | Main-thread work |
|---|---|---|---|---|---|---|---|---|
| Dev (python, no gzip), mobile, median of 3 | 98 | 1.21 s | 1.21 s | 152 ms | 0.0006 | 1.86 s | 691 KB | 5.4 s |
| Prod-like (serve@14, brotli), mobile, median of 3 | 97 | 1.09 s | 1.09 s | 208 ms | 0.0006 | 1.82 s | 565 KB | 8.6 s |
| Prod-like mobile, run 3 (worst) | 85 | 1.26 s | 1.26 s | 514 ms | 0 | 3.71 s | 565 KB | 8.9 s |
| Prod-like desktop | 100 | 0.33 s | 0.33 s | 12 ms | 0.0035 | 0.82 s | **2,566 KB** | 1.6 s |

**What the numbers show:**
- **LCP and CLS are already good in the lab.** The LCP element is the hero H1 (text), at about 1.1–1.2 s on mobile.
- **TBT is the scores' weak point:** mobile runs vary from 97 to 208 to 514 ms.
- **Main-thread work is very high:** 5–9 s on mobile. Lighthouse attributes 4.0 s of it to `motion.js`, and "Style & Layout" is the largest category at 3.6 s.
- **Desktop downloads 2.6 MB, almost all of it video.**
- **Compression** (dev vs prod-like) only cuts text bytes (HTML/CSS/JS 179 KB → 48 KB). It doesn't touch the runtime cost.

## 2. Why the page feels slow (ranked)

| # | Bottleneck | Evidence (measured) | Impact |
|---|---|---|---|
| 1 | **Continuous main-thread work at idle.** Canvases (hero signal field, AdFlux network, contours), the hero SVG `<animateMotion>` and two infinite CSS animations on non-composited properties (`box-shadow` ping, `background-position` crawl) keep restyling and repainting | Idle at the top of the page: **520 ms/s desktop, 883 ms/s mobile (4x CPU)**. At mid-page: 254 / 612 ms/s. Ping 76–81 ms/s, crawl 62–67 ms/s, hero canvas about 300 ms/s, hero SVG about 150 ms/s | Jank, slow interactions (INP), battery |
| 2 | **Forced synchronous layout in scroll handlers.** `landing.js` `tick()` writes CSS variables (`--p`, `--fill`, `--mx`, `--my`, `--cp`) and then reads `getBoundingClientRect` in the same frame. `motion.js` `onScroll` does the same | Forced style recalc during scroll: 538 ms over 164 calls (desktop), 689 ms over 180 calls (mobile). **Every one of the 12 long tasks on mobile during scroll** (53–102 ms) is in this path | Scroll at **40–44 fps**, p95 frame time 50–66 ms |
| 3 | **Video weight** | Desktop load: video is 2.34 MB of 2.76 MB. Credibility strip MP4 is 1.67 MB at 1,333 kbps for 1920×320. The "why" video serves VP9 WebM (670 KB), which is larger than its own MP4 (614 KB). `autoplay` makes the below-fold "why" video download at load (overriding `preload=metadata`) | Slower desktop load, wasted data |
| 4 | **The credibility video decodes off screen** | About 30 decoded frames/s at mid-page (desktop) | Decoder, GPU and battery work |
| 5 | **Oversized images** | Logo PNG 62.5 KB at 547 px for a 158 px slot. Posters are JPEG, 76 KB and 65 KB | About 150 KB avoidable |
| 6 | **Load-time layout** | `motion.js` start-up forces a 142 ms layout (desktop); the first layout task on mobile is 587 ms | TBT |
| 7 | **No caching headers in `vercel.json`** | No Cache-Control set for `/assets` | Repeat visits re-validate |

**Interactions (Event Timing, lab):**
- FAQ: 40 ms desktop, 72–112 ms mobile.
- Services tab: 32–64 / 104 ms.
- Invalid form submit: 104 / 152 ms.
- Handlers themselves take 0.1–46 ms; the rest is waiting for a busy rendering pipeline (items 1–2).

**Not problems:**
- Fonts: the variable woff2 file is 27 KB, loads without blocking render, and every weight is used.
- CSS: 50 KB raw / 10 KB brotli, about 4.5% unused (an estimate).
- JS size: 63 KB raw / 17.6 KB brotli. Code-splitting would gain little; the cost is execution, not download.
- Third-party: only Google Fonts.
- Reduced motion and hidden tabs already stop the loops.

## 3. Docker assessment

**Docker gives no performance benefit here**, so it was not installed:
- The site is static files with no server code, database, or build toolchain to make reproducible.
- Production is a CDN (Vercel), which already serves compressed, edge-cached files.
- The slowness measured above comes from browser-side work and media size. A container would serve the same bytes and run the same JavaScript.
- For local parity, `npx serve` (compression on, as used for the prod-like measurements) is enough.

Docker would only make sense later if a form backend or another server component were added and needed a reproducible runtime.

## 4. Optimisation plan (preserve the design)

1. **Runtime:**
   - In `landing.js` `tick()` and `motion.js` `onScroll`/seams: read all layout first, then write.
   - Hero canvas: cache its rect, use DPR 1, cap at 30 fps.
   - AdFlux canvas: create gradients once, cap at 30 fps.
   - Contours: reuse its buffer.
   - Pause the hero SVG animation, `#chain` CSS loops and the credibility video when off screen.
   - Re-implement the `ping` effect with transform/opacity.
   - Defer canvas start-up past the first paint.
2. **Media:**
   - Re-encode the credibility strip (H.264 CRF 23, SSIM 0.993).
   - Drop the WebM; desktop "why" video becomes 1280×720 H.264 (SSIM 0.997).
   - Remove `autoplay` from the below-fold video (the IntersectionObserver plays it).
   - WebP posters; logo at 2x its displayed size.
3. **Delivery:** `Cache-Control` for `/assets` with a short max-age plus `stale-while-revalidate`. File names are not versioned, so no `immutable`.
