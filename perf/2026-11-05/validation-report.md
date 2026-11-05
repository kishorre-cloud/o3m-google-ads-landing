# Performance validation: before and after

**Date:** 2026-11-05. **Local only:** not deployed, committed or pushed.
**Lab data only:** Lighthouse 12.8.2 (simulated throttling) and headless Chrome traces. **None of this is real-user Core Web Vitals (CrUX).** Field data needs a public URL and real traffic.

**Reports:**
- `before/` and `after/` hold the Lighthouse HTML and JSON (`lh-<server>-<device>[-runN].report.html`).
- `runtime/` (before) and `after/` hold the Chrome-trace results (`desktop-results.json`, `mobile4x-results.json`).
- `diagnosis.md` has the root causes and the Docker assessment.

## Lighthouse (lab)

**Prod-like = the same files served with brotli/gzip (`serve@14`, port 4173), the closest local equivalent of Vercel.**

| Metric | Prod-like mobile, before (median of 3) | After (median of 3) | Prod-like desktop, before | After |
|---|---|---|---|---|
| Performance score | 97 (runs 97 / 99 / 85) | **99** (99 / 100 / 99) | 100 | 100 |
| FCP / LCP | 1.09 s | 1.11 s | 0.33 s | 0.29 s |
| TBT | 208 ms (138–514) | **82 ms** (44–92) | 12 ms | **0 ms** |
| CLS | 0.0006 | 0.0006 | 0.0035 | 0.0035 |
| Speed Index | 1.82 s | 1.48 s | 0.82 s | 0.63 s |
| Bytes loaded | 565 KB | **170 KB** | **2,566 KB** | **892 KB** |
| Main-thread work | 8.6 s | **3.7 s** | 1.6 s | 1.1 s |

**Dev server (python, no compression), mobile median:** score 98 → 100, TBT 152 → 44 ms, bytes 691 → 302 KB, main thread 5.4 → 4.0 s.

**LCP was already good.** It is the hero H1 (text) and stays at about 1.1–1.2 s on mobile. The page loads fast; what made it *feel* slow was main-thread work and large video downloads.

## Runtime (Chrome traces)

Desktop is measured at 1440 px with no CPU throttling. Mobile is 390 px with the CPU throttled 4×.

| Metric | Desktop before | Desktop after | Mobile 4× before | Mobile 4× after |
|---|---|---|---|---|
| Idle at top of page (main-thread ms per second) | 520 | **131** | 883 | **586** |
| Idle at mid-page (ms/s) | 254 | 194 | 612 | 229 |
| Load trace: main thread busy | 3,458 ms | **1,438 ms** | 6,228 ms | 4,982 ms |
| Load: motion.js script time | 705 ms | 164 ms | 549 ms | 240 ms |
| Load: long tasks | 5 | 2 | 7 | 5 |
| Scroll: frames per second (rAF sampler) | 40.5 | **55.3** | 43.6 | **50.6** |
| Scroll: p95 frame time | 66 ms | 33 ms | 50 ms | 33 ms |
| Scroll: frames over 50 ms | 63 | 2 | 33 | 2 |
| Scroll: long tasks | 0 | 0 | **9** | **0** |
| Scroll: landing.js forced style recalc | 538 ms | 46 ms | 689 ms | 143 ms |
| Hidden tab | 16 ms/s | 0.2 ms/s | 3 ms/s | 0.4 ms/s |

Interaction delays come mostly from a busy rendering pipeline, so they benefit from the same reduction. They were not re-measured separately.

## What changed

| Area | Change | Files |
|---|---|---|
| **Scroll handlers** | Read all layout first, then write; skip unchanged CSS-variable writes; pointermove stores coordinates only (one read per frame) | `landing.js` (tick, pointer), `motion.js` (onScroll, card and button pointer handlers) |
| **CSS animations** | `ping` (box-shadow) → transform/opacity ring. `crawl` (background-position) → transform on two pseudo-elements. Both pause when `#chain` is off screen. `.track-mark` moves with `translateY` instead of `top` (with an `@supports` fallback) | `o3m.css`, `landing.js` (`.in-view` observer) |
| **Canvases** | Hero field: rect cached instead of read every frame, DPR capped at 1.5, 30 fps cap with time-compensated simulation, colour/alpha bucketed strokes. AdFlux: gradients and strings built once, dots bucketed (60 fps kept for visual parity). Contours: reused buffer. Sizing via ResizeObserver, so script start-up forces no layout | `motion.js` |
| **Video** | Credibility strip re-encoded H.264 CRF 23: 1,669 KB → 739 KB (SSIM 0.993; visually identical in a side-by-side crop) and paused off screen. "Why" video: WebM dropped; desktop MP4 → 1280×720 CRF 23: 670 KB served → 538 KB (SSIM 0.997); `autoplay` removed, so it downloads only when scrolled into view (an IntersectionObserver plays it; a fallback plays it without IO) | `index.html`, `assets/video/*`, `landing.js`, `motion.js` |
| **Images** | Posters JPEG → WebP (76 KB → 35 KB; 65 KB → 25 KB at 1280 px). Logo 547 px PNG 62.5 KB → 316 px (2× display) PNG 26 KB | `assets/video/*.webp`, `assets/img/o3m-logo.png`, `index.html` |
| **Caching** | `vercel.json`: video/img `max-age=86400, stale-while-revalidate=604800`; CSS/JS `max-age=0, must-revalidate`, because file names are not versioned (avoids mixing old and new CSS/JS) | `vercel.json` |

Removed files (now unreferenced): `o3m-campaign-underperformance-motion.webm`, the two `.jpg` posters. They can be restored from git.

## Checks

- **Regression suites** (`C:\Claude\_qa`): all pass with 0 page errors.
  - Form: validation, sending, thank-you, failure state, FAQ, tabs.
  - Reduced-motion branch.
  - Credibility strip at 8 viewport/motion cases, plus the video-failure fallback.
  - Why O3M cards (grid, hover, focus, reduced motion), footer, click-ID capture.
- **Visual:** AdFlux before/after screenshots are identical; hero and card states are unchanged.
- **Review:** `code-reviewer` approved (no critical or high issues). Its fixes were applied:
  - cache headers split by type
  - no-IntersectionObserver fallback for the why video
  - the duplicate hero-SVG pause removed
  - AdFlux 60 fps restored
  - hero DPR set to 1.5 instead of 1
  - canvas position re-read when it becomes visible

## Known limits and not verified

- **Not measured:** Safari/Firefox, a real phone, a 120 Hz display, real-user Core Web Vitals.
- **Remaining work at the top of the page:** the hero's SVG `<animateMotion>` and the 30 fps particle field still run while the hero is visible (about 130 ms/s desktop, about 590 ms/s on a 4× throttled mobile). Reducing that further would change the hero design.
- **Remaining 60 style recalcs/s at mid-page** come from other on-screen CSS animations that are part of the design.
- **Mobile only:** the credibility-strip poster (35 KB) is still fetched even though the strip shows the HTML list there.
