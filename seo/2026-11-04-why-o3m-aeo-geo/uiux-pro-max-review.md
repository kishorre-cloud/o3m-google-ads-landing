# UI UX Pro Max review: Why O3M cards

**Date:** 2026-11-04
**Skill:** `ui-ux-pro-max`, installed at `C:\Users\O3M\.claude\skills\ui-ux-pro-max`. I read its `SKILL.md` and `references/quick-reference.md` in full, and ran its search tool. Raw search output is in `evidence/uiux-pro-max-searches.txt`.

## Workflow followed (per SKILL.md)

1. **Requirements.** Product type: B2B agency service landing page. Audience: business owners and marketing managers. Style: the existing O3M brand. Stack: static HTML/CSS/JS with no `package.json`. The skill says "never assume a stack", so no stack preset was used; `html-tailwind` doesn't apply because the site has no Tailwind.
2. **No `--design-system` run.** The page already has an approved design system (O3M palette, Plus Jakarta Sans, card radius and borders), and this is one component. The skill's query contract says to use a single `--domain` for a targeted component concern.
3. **Domain searches:**

| Query | Domain | Result used |
|---|---|---|
| card hover lift focus | ux | **Hover States** (subtle visual change); **Focus Appearance** (2 px outline, 3:1 contrast) |
| hover vs tap touch | ux | **Hover vs Tap:** hover is not relied on; effects sit inside `@media (hover:hover)` |
| reduced motion | ux | **Reduced Motion**, **Excessive Motion** (1–2 animated elements), **Motion Sensitivity** (show the final state) |
| layout shift animation | ux | **Content Jumping**, **Continuous Animation** (no looping decoration) |
| trust credibility features | landing | **Trust & Authority + Conversion:** proof (certs, partner status) beside a clear CTA; static final state under reduced motion |
| stagger reveal grid → retry "stagger sequence entrance" | ux | **0 results on both tries.** As SKILL.md requires, I fell back to the skill's static rule list (`references/quick-reference.md`), not the database: `stagger-sequence` (30–50 ms per item), `transform-performance`, `layout-shift-avoid`, `excessive-motion` |
| trust professional service cards | style | **0 results.** No style change made; I kept the brand style (the skill's `consistency` rule) |

## Current component (before)

- `ul.why-grid > li.card[data-reveal]`: 3 → 2 → 1 columns at 1040 px and 760 px (the site's own breakpoints).
- The cards were plain: no icon, no accent, no hover state of their own.
- Motion came from site-wide JS: an 18 px fade-up reveal with a 60 ms stagger, and a 3D pointer tilt plus spotlight on fine pointers (`motion.js` §6).

## Design changes

| Element | Change | Skill rule |
|---|---|---|
| Structure | `li.why-item[data-reveal] > div.card.why-card`. The reveal stays on the `li`; the visual card is inside it, so the hover transform no longer fights the reveal transform | `layout-shift-avoid`, `transform-performance` |
| Icon tile | 44 × 44 tile, radius 12, with an inline SVG stroke icon (target, gauge, layers, badge, certificate, clock) in the existing brand tints: blue `#1D4ED8` on `#EFF6FF`, green `#15803D` on `#F0FDF4`, and yellow `#A16207` on `#FEFCE8` once only, for the Partner card. Icons are `aria-hidden` | `no-emoji-icons`, `icon-style-consistent`, `icon-context` |
| Accent bar | 3 px blue→green gradient (`#2563EB`→`#16A34A`) at the top. It rests at `scaleX(.16)` and grows to full width on hover or focus | `state-clarity`, brand palette |
| Hover / focus | `translateY(-4px)`, border `#BFDBFE` / `#93C5FD`, soft shadow. 240 ms with ease-out (`cubic-bezier(.2,.7,.2,1)`); the bar takes 450 ms | `duration-timing`, `easing`, `state-transition` |
| Keyboard | `:focus-within` gives the same state when a card's link is focused, plus a 2 px `#1D4ED8` outline with 3 px offset | `focus-states`, `keyboard-nav` |
| Touch | Hover styles only inside `@media (hover:hover)`. All information is visible without interaction | `hover-vs-tap` |
| Reveal | Existing fade-up kept; stagger tightened from 60 ms to **50 ms** per card | `stagger-sequence` |
| Tilt | The pointer 3D tilt is disabled for `.why-card` (one-line change in `motion.js`). The spotlight glow is kept | `excessive-motion`; avoids conflicting transforms |
| Reduced motion | The site already sets `transition:none` globally; cards now also have **no lift** (`transform:none`). The reveal is skipped, so cards are visible immediately | `reduced-motion`, motion sensitivity |
| Type | H3 20 px / 800 / `#0F172A`; body 16 px / 1.6 / `#475569` (existing tokens) | `readable-font-size`, `line-height`, `contrast-readability` |

**Not added:** looping, pulsing or floating animation; per-character text effects; new colours; new fonts; any animation library.

## Browser verification (headless Chrome via puppeteer, `C:\Claude\_qa\why.js`)

| Check | Result |
|---|---|
| Columns / rows | 1440: 3 × 2. 768: 2 × 3. 390: 1 × 6 |
| Equal heights | Per row: 369/369/369 and 318/318/318 at 1440 |
| Stagger | Opacity 120 ms after entering view: 0.42 → 0.17 → 0 … (sequential), all 1 after 1.4 s |
| Hover | `matrix(…, -4)` lift; bar `scaleX(1)`; border `#BFDBFE`; no inline tilt |
| Keyboard focus ("How AdFlux works" link) | Outline 2 px solid `#1D4ED8`; card lifts; bar full |
| Reduced motion | Visible before scrolling (opacity 1); no lift; bar full on hover/focus |
| Horizontal overflow | 0 at every width |
| CLS during load | 0.0034 desktop, 0 tablet/mobile. Reduced-motion run: 0.0825, attributed to header/hero text and navigation (font swap), **not the cards** |
| Lighthouse | `color-contrast`, `target-size`, `heading-order`: pass |

**Screenshots:** `evidence/desktop1440-rest.png`, `desktop1440-hover.png`, `desktop1440-focus.png`, `tablet768-rest.png`, `mobile390-rest.png`, `reduced1440-*.png`. On mobile, cards below the fold show as blank in element screenshots only because their scroll-reveal has not fired yet.
