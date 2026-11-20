/* O3M · 16+ Years Google Ads journey (scroll-driven timeline).
   Source: O3m_part_10k_updated.zip › o3m-google-ads-story/script.js. Kept as supplied: the winding path built through
   every card pin, the line drawing to 60% of the viewport, inactive/highlight/active card states, the "just arrived"
   pop for the newest card, the background curves and the 10,000 count-up.
   Adapted for the landing page: the left year rail is gone (with its code); GSAP is not loaded on this site, so the
   intro, card entrances, arrival pop and count-up use the Web Animations API / requestAnimationFrame with the same
   timings and easings; the draw loop only runs while the section is near the viewport. */
(function () {
  'use strict';
  var root = document.getElementById('o3m-google-journey');
  if (!root) return;

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canAnimate = !reduce && typeof Element !== 'undefined' && 'animate' in Element.prototype;

  var stage = document.getElementById('o3m-stage');
  var cards = document.getElementById('o3m-cards');
  var svg   = document.getElementById('o3m-curve');
  var base  = document.getElementById('o3m-base');
  var prog  = document.getElementById('o3m-prog');
  var head  = document.getElementById('o3m-head');
  var ring  = document.getElementById('o3m-ring');
  var grad  = document.getElementById('o3m-grad');
  var slots = Array.prototype.slice.call(root.querySelectorAll('.o3m-slot'));
  if (!stage || !cards || !svg || !base || !prog || !head || !ring || !grad || !slots.length) return;

  var W = 0, H = 0, pathLen = 1, samples = [], pinsY = [];
  var curY = 0, lastY = -1, counted = false, frames = 0;
  var lastD = '', stageTop = 0, rootTop = 0, rootH = 1, slotTops = [];   // document-relative tops, re-measured when layout changes

  // Easings matching the supplied GSAP ones
  var EASE = { p3out: 'cubic-bezier(.215,.61,.355,1)', p2out: 'cubic-bezier(.25,.46,.45,.94)', p2inout: 'cubic-bezier(.455,.03,.515,.955)',
               back26: 'cubic-bezier(.34,1.8,.64,1)', back3: 'cubic-bezier(.34,2,.64,1)' };

  /* background curves: all start at the top of the section, draw in on load, then grow down with the reader (each at its own pace) */
  var bg = [['.bg1', .07], ['.bg2', .05], ['.bg3', .038], ['.bg4', .03]].map(function (c) {
    var el = root.querySelector(c[0]);
    if (!el) return null;
    el.style.strokeDasharray = 1; el.style.strokeDashoffset = reduce ? 0 : 1;
    return { el: el, lag: c[1], f: reduce ? 1 : 0, w: -1 };
  }).filter(Boolean);

  /* ---------------------------------------------------------------- build the winding path through every pin */
  // the frame loop derives viewport positions from these and scrollY, so it never reads layout after its own style writes
  function measure() {
    var sy = window.scrollY, rr = root.getBoundingClientRect();
    stageTop = stage.getBoundingClientRect().top + sy;
    rootTop = rr.top + sy; rootH = rr.height;
    slotTops = slots.map(function (s) { return s.getBoundingClientRect().top + sy; });
  }

  function build() {
    measure();
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) { W = w; H = h; return; }

    var ox = cards.offsetLeft, oy = cards.offsetTop;
    var pts = slots.map(function (s) { return { x: ox + s.offsetLeft + s.offsetWidth / 2, y: oy + s.offsetTop + 20 }; });
    pinsY = pts.map(function (p) { return p.y; });

    var d = 'M ' + pts[0].x + ' ' + Math.max(0, pts[0].y - 40) + ' L ' + pts[0].x + ' ' + pts[0].y;
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], dy = b.y - a.y;
      d += ' C ' + a.x + ' ' + (a.y + dy * .46) + ', ' + b.x + ' ' + (b.y - dy * .46) + ', ' + b.x + ' ' + b.y;
    }
    var last = pts[pts.length - 1], tail = h - last.y;     // tail sweeps toward the CTA below
    d += ' C ' + last.x + ' ' + (last.y + tail * .5) + ', ' + (w / 2) + ' ' + (h - tail * .4) + ', ' + (w / 2) + ' ' + h;
    lastY = -1;
    if (w === W && h === H && d === lastD) return;          // same geometry (load, fonts.ready, first ResizeObserver call): skip re-sampling
    W = w; H = h; lastD = d;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    grad.setAttribute('y2', H);

    base.setAttribute('d', d);
    prog.setAttribute('d', d);
    pathLen = prog.getTotalLength();

    samples = [];
    var N = 700;
    for (var k = 0; k <= N; k++) {
      var len = (k / N) * pathLen, pt = prog.getPointAtLength(len);
      samples.push([pt.y, len]);
    }
  }

  // path y only increases, so a y position maps to a length with a binary search
  function lenAtY(y) {
    var lo = 0, hi = samples.length - 1;
    if (!samples.length) return 0;
    if (y <= samples[0][0]) return 0;
    if (y >= samples[hi][0]) return pathLen;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (samples[mid][0] < y) lo = mid; else hi = mid; }
    var a = samples[lo], b = samples[hi], t = (y - a[0]) / ((b[0] - a[0]) || 1);
    return a[1] + (b[1] - a[1]) * t;
  }

  function countUp(el) {
    var to = +el.dataset.to;
    if (!canAnimate) { el.textContent = to.toLocaleString('en-US'); return; }
    var t0 = performance.now(), dur = 1800;
    (function step(now) {
      var t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 3);   // power3.out
      el.textContent = Math.round(to * e).toLocaleString('en-US');
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------------------------------------------------------------- "newly arrived" pop for each card */
  var BURST = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];
  slots.forEach(function (s) {
    var card = s.querySelector('.o3m-card');
    card.insertAdjacentHTML('beforeend', '<span class="o3m-shine" aria-hidden="true"><i></i></span><span class="o3m-ripple" aria-hidden="true"></span>');
  });

  function pop(slot) {
    if (!canAnimate) return;
    var card  = slot.querySelector('.o3m-card');
    var panel = slot.querySelector('.o3m-panel');
    var texts = slot.querySelectorAll('.o3m-row, .o3m-ctitle, .o3m-cdesc, .o3m-tag');

    // 1) the panel bounces in
    panel.animate([{ transform: 'scale(.93)' }, { transform: 'scale(1)' }], { duration: 750, easing: EASE.back26 });
    // 2) text rises in, one line after another
    Array.prototype.forEach.call(texts, function (t, i) {
      t.animate([{ transform: 'translateY(16px)', opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: 600, delay: 120 + i * 80, easing: EASE.p3out, fill: 'backwards' });
    });
    // 3) a shine sweeps across the card
    card.querySelector('.o3m-shine i').animate(
      [{ transform: 'translateX(-150%) skewX(-18deg)', opacity: 1 }, { transform: 'translateX(320%) skewX(-18deg)', opacity: 1 }],
      { duration: 950, delay: 100, easing: EASE.p2inout });
    // 4) ripple from the pin
    card.querySelector('.o3m-ripple').animate([{ transform: 'scale(1)', opacity: .9 }, { transform: 'scale(5.5)', opacity: 0 }], { duration: 900, easing: EASE.p2out });
    card.querySelector('.o3m-pin').animate([{ transform: 'scale(1.6)' }, { transform: 'scale(1)' }], { duration: 600, easing: EASE.back3 });
    // 5) a burst of Google-coloured dots
    var box = document.createElement('span');
    box.className = 'o3m-burst'; box.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 14; i++) { var b = document.createElement('b'); b.style.background = BURST[i % 4]; box.appendChild(b); }
    slot.appendChild(box);
    for (var j = 0; j < box.children.length; j++) {
      var ang = (j / box.children.length) * Math.PI * 2 + Math.random() * .4, dist = 70 + Math.random() * 70;
      box.children[j].animate(
        [{ transform: 'translate(0,0) scale(.4)', opacity: 1 }, { transform: 'translate(' + (Math.cos(ang) * dist).toFixed(1) + 'px,' + (Math.sin(ang) * dist).toFixed(1) + 'px) scale(1)', opacity: 0 }],
        { duration: 900 + Math.random() * 300, easing: EASE.p3out, fill: 'forwards' });
    }
    setTimeout(function () { box.remove(); }, 1400);
  }

  /* ---------------------------------------------------------------- card entrances: glide in from their own side, scrubbed by scroll
     (was a GSAP ScrollTrigger scrub from 'top 96%' to 'top 62%', smoothing .6 s) */
  var enter = slots.map(function (s, i) { return { card: s.querySelector('.o3m-card'), dir: i % 2 === 0 ? -1 : 1, p: -1 }; });
  function entrances(vh, sy) {
    var moving = false;
    if (!canAnimate) return moving;
    for (var i = 0; i < slots.length; i++) {
      var e = enter[i], top = slotTops[i] - sy;
      var target = Math.min(1, Math.max(0, (vh * .96 - top) / (vh * .34)));
      var p = e.p < 0 ? target : e.p + (target - e.p) * .12;
      if (Math.abs(target - p) < .001) p = target;
      if (p === e.p) continue;
      e.p = p; if (p !== target) moving = true;
      var q = 1 - p, k = 1 - Math.pow(1 - p, 3);   // power3.out on the scrubbed progress
      q = 1 - k;
      e.card.style.transform = p >= 1 ? '' : 'translate(' + (e.dir * 22 * q).toFixed(2) + '%,' + (40 * q).toFixed(1) + 'px) rotate(' + (e.dir * 5 * q).toFixed(2) + 'deg) scale(' + (.94 + .06 * k).toFixed(4) + ')';
      e.card.style.opacity = p >= 1 ? '' : k.toFixed(3);
    }
    return moving;
  }

  /* ---------------------------------------------------------------- the draw loop: the curve grows to where the eye is
     Runs while something is still easing; goes idle once everything has settled and wakes on scroll/resize. */
  var running = false, near = false;
  function frame() {
    if (!near) { running = false; return; }
    var moving = false;
    var vh = window.innerHeight, sy = window.scrollY;                    // read before any style write in this frame
    var target = Math.min(H, Math.max(0, vh * 0.6 - (stageTop - sy)));
    frames++;
    var p = Math.min(1, Math.max(0, (vh * 0.8 - (rootTop - sy)) / rootH));   // how far down the section the reader is
    curY = (reduce || frames < 3) ? target : curY + (target - curY) * 0.14;   // jump on first frames (e.g. reload mid-page)
    if (Math.abs(target - curY) < 0.05) curY = target; else moving = true;
    var draw = Math.abs(curY - lastY) > 0.05 && samples.length, len, pt;
    if (draw) { len = lenAtY(curY); pt = prog.getPointAtLength(len); }   // also before the writes, so it does not force a style recalc
    bg.forEach(function (b) {
      var goal = Math.max(p, 0.04);                                     // min .04 so a bit of every line shows at the very top
      b.f = reduce ? 1 : b.f + (goal - b.f) * b.lag;
      if (Math.abs(goal - b.f) < 1e-4) b.f = reduce ? 1 : goal; else moving = true;
      if (Math.abs(b.f - b.w) > 1e-4) { b.w = b.f; b.el.style.strokeDashoffset = 1 - b.f; }
    });
    if (entrances(vh, sy)) moving = true;

    if (draw) {
      lastY = curY;
      var f = len / pathLen;
      prog.style.strokeDashoffset = 1 - f;
      prog.style.opacity = f < 0.002 ? 0 : 1;

      var show = (f > 0.002 && f < 0.998) ? 1 : 0;
      head.setAttribute('cx', pt.x); head.setAttribute('cy', pt.y);
      ring.setAttribute('cx', pt.x); ring.setAttribute('cy', pt.y);
      head.style.opacity = show; ring.style.opacity = show;

      var fresh = [];
      slots.forEach(function (s, i) {
        var st = curY >= pinsY[i] ? 'active' : (curY >= pinsY[i] - vh * 0.3 ? 'highlight' : 'inactive');
        if (s.dataset.state !== st) { if (st === 'active') fresh.push(s); s.dataset.state = st; }
      });
      // pop only the newest card (and never on the very first frames, e.g. a reload mid-page)
      if (fresh.length && frames > 6) pop(fresh[fresh.length - 1]);

      var last = slots[slots.length - 1];
      if (!counted && last.dataset.state === 'active') { counted = true; countUp(last.querySelector('.o3m-count')); }
    }
    if (moving || frames < 8) requestAnimationFrame(frame); else running = false;
  }
  function start() { if (!running) { running = true; requestAnimationFrame(frame); } }

  build();
  if ('ResizeObserver' in window) {
    new ResizeObserver(function () { build(); start(); }).observe(stage);
    new ResizeObserver(measure).observe(document.body);   // content above/below changed height: the section may have moved
  } else window.addEventListener('resize', function () { build(); start(); });
  window.addEventListener('scroll', function () { if (near) start(); }, { passive: true });
  window.addEventListener('load', build);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      near = en[en.length - 1].isIntersecting;
      if (near) start();
    }, { rootMargin: '300px 0px' }).observe(root);
  } else { near = true; start(); }

  if (!canAnimate) return;

  /* ---------------------------------------------------------------- intro (headline word by word, arrow draws) and CTA entrance */
  var words = root.querySelectorAll('.o3m-title .wi');
  var arrows = root.querySelectorAll('.o3m-arrow path');
  var cta = document.getElementById('o3m-cta');
  Array.prototype.forEach.call(words, function (w) { w.style.transform = 'translateY(110%)'; });
  Array.prototype.forEach.call(arrows, function (a) { a.style.strokeDasharray = 1; a.style.strokeDashoffset = 1; });
  cta.style.opacity = 0; cta.style.transform = 'translateY(48px)';

  function intro() {
    Array.prototype.forEach.call(words, function (w, i) {
      w.animate([{ transform: 'translateY(110%)' }, { transform: 'none' }], { duration: 850, delay: 150 + i * 60, easing: EASE.p3out, fill: 'backwards' });
      w.style.transform = '';
    });
    Array.prototype.forEach.call(arrows, function (a, i) {
      a.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 700, delay: 1000 + i * 250, easing: EASE.p2out, fill: 'backwards' });
      a.style.strokeDashoffset = 0;
    });
  }
  function ctaIn(show) {
    cta.animate([{ opacity: show ? 0 : 1, transform: show ? 'translateY(48px)' : 'none' }, { opacity: show ? 1 : 0, transform: show ? 'none' : 'translateY(48px)' }],
      { duration: 900, easing: EASE.p3out });
    cta.style.opacity = show ? '' : 0; cta.style.transform = show ? '' : 'translateY(48px)';
  }

  if ('IntersectionObserver' in window) {
    var introDone = false, ctaShown = false;
    new IntersectionObserver(function (en, ob) {
      if (!introDone && en[en.length - 1].isIntersecting) { introDone = true; intro(); ob.disconnect(); }
    }, { threshold: 0.6 }).observe(root.querySelector('.o3m-head'));
    // play on enter (top 90%), reverse when scrolled back above it — as the supplied toggleActions 'play none none reverse'
    new IntersectionObserver(function (en) {
      var e = en[en.length - 1], below = e.boundingClientRect.top > 0;
      var show = e.isIntersecting || !below;
      if (show !== ctaShown) { ctaShown = show; ctaIn(show); }
    }, { rootMargin: '0px 0px -10% 0px' }).observe(cta);
  } else { intro(); cta.style.opacity = ''; cta.style.transform = ''; }
})();
