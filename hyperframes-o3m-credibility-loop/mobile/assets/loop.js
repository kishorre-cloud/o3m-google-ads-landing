/* O3M credibility loop: shared motion for index.html (1920x240) and mobile.html (1080x540).
   Everything is a pure function of timeline time with a 10 s period, so frame 0 == frame 300.

   Ambient layer (always running, periodic):
     - ribbons: smooth splines through each layout's control points, with a gentle travelling sine
       offset (one full cycle per 10 s), drawn with the blue -> teal -> green brand gradient
     - light trails: a short bright dash that runs along each ribbon; it sits off-canvas at the wrap
     - particles: a few luminous dots riding the ribbons, one lap per 10 s
     - glows: two soft blue/green fields drifting on a 10 s sine
   Emphasis layer (one fact at a time, every fact always readable):
     0.0-1.5 Founded 2010 | 1.5-3.5 Boonze | 3.5-5.5 Offices + landmark | 5.5-7.5 Partner | 7.5-9.0 10,000+
     Each phase starts and ends at the rest state, so 9.0-10.0 is a calm hold that flows into 0.0. */
(function () {
  'use strict';
  var TAU = Math.PI * 2, LOOP = 10;

  function spline(pts) {
    // Catmull-Rom through the points, as cubic Beziers
    var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' +
        (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' +
        p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d;
  }
  function frac(x) { return x - Math.floor(x); }

  /* cfg.ribbons: [{ el: [pathEls...], pts: [[x,y]...], amp, waves, phase }]
     cfg.trails:  [{ el, ribbon, phase }]        cfg.particles: [{ el, ribbon, phase }]
     cfg.glows:   [{ el, dx, dy, phase }] */
  function ambient(tl, cfg) {
    var state = { p: 0 };
    function draw() {
      var t = state.p * LOOP, ph = state.p * TAU;
      // geometry comes from the live layout on every frame, so it never depends on when fonts arrived
      if (cfg.lanes) { var L = cfg.lanes(); cfg.ribbons.forEach(function (r) { r.pts = L[r.lane]; }); }
      cfg.ribbons.forEach(function (r) {
        var W = r.pts[r.pts.length - 1][0] - r.pts[0][0];
        var pts = r.pts.map(function (q, i) {
          // ends stay pinned off-canvas; the interior breathes
          var k = i === 0 || i === r.pts.length - 1 ? 0 : 1;
          return [q[0], q[1] + k * r.amp * Math.sin(ph + r.phase + ((q[0] - r.pts[0][0]) / W) * TAU * r.waves)];
        });
        var d = spline(pts);
        r.el.forEach(function (e) { e.setAttribute('d', d); });
        r.path = r.el[r.el.length - 1];
      });
      cfg.trails.forEach(function (tr) {
        // pathLength=1; dash .14 long; offset .14 -> -1 hides it beyond either end at the wrap
        var f = frac(t / LOOP + tr.phase);
        tr.el.setAttribute('stroke-dashoffset', (0.14 - f * 1.14).toFixed(4));
      });
      cfg.particles.forEach(function (pa) {
        var path = cfg.ribbons[pa.ribbon].path, L = path.getTotalLength();
        var f = frac(t / LOOP + pa.phase), q = path.getPointAtLength(f * L);
        var edge = Math.min(1, f / 0.06, (1 - f) / 0.06);
        pa.el.setAttribute('cx', q.x.toFixed(1)); pa.el.setAttribute('cy', q.y.toFixed(1));
        pa.el.setAttribute('opacity', (pa.alpha * Math.max(0, edge)).toFixed(3));
      });
      cfg.glows.forEach(function (g) {
        g.el.style.transform = 'translate(' + (g.dx * Math.sin(ph + g.phase)).toFixed(1) + 'px,' + (g.dy * Math.cos(ph + g.phase)).toFixed(1) + 'px)';
      });
    }
    tl.to(state, { p: 1, duration: LOOP, ease: 'none', onUpdate: draw }, 0);
    draw();
  }

  /* word highlight: a gradient copy of the words wipes across, holds, then fades back to rest */
  function wipe(tl, el, t0, len) {
    if (!el) return;
    tl.fromTo(el, { clipPath: 'inset(0% 100% 0% 0%)', opacity: 1 }, { clipPath: 'inset(0% 0% 0% 0%)', duration: len * 0.45, ease: 'power2.inOut' }, t0);
    tl.to(el, { opacity: 0, duration: len * 0.3, ease: 'power1.in' }, t0 + len * 0.7);
    tl.set(el, { clipPath: 'inset(0% 100% 0% 0%)', opacity: 1 }, t0 + len);
  }
  /* icon highlight: a bright copy of the icon's lines draws on over the resting icon, then fades */
  function drawOn(tl, els, t0, len) {
    if (!els || !els.length) return;
    tl.fromTo(els, { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, duration: len * 0.5, ease: 'power2.out', stagger: len * 0.04 }, t0);
    tl.to(els, { opacity: 0, duration: len * 0.3, ease: 'power1.in' }, t0 + len * 0.7);
    tl.set(els, { strokeDashoffset: 1, opacity: 1 }, t0 + len);
  }
  function lift(tl, el, t0, len, dy) {
    if (!el) return;
    tl.to(el, { y: -dy, duration: len * 0.35, ease: 'power2.out' }, t0);
    tl.to(el, { y: 0, duration: len * 0.45, ease: 'power2.inOut' }, t0 + len * 0.5);
  }
  function pulse(tl, el, t0, len, peak) {
    if (!el) return;
    tl.fromTo(el, { opacity: 0 }, { opacity: peak, duration: len * 0.35, ease: 'sine.out' }, t0);
    tl.to(el, { opacity: 0, duration: len * 0.5, ease: 'sine.inOut' }, t0 + len * 0.45);
  }

  function emphasis(tl, root) {
    var $ = function (s) { return root.querySelector(s); }, $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };

    // rest states set by script (GSAP owns these transforms)
    gsap.set(root.querySelectorAll('.uline'), { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(root.querySelectorAll('.ring'), { scale: 0.7 });

    // 1 | 0.0-1.5  Founded 2010: the year lifts and a gradient wipe runs through it
    lift(tl, $('#f1 .yr'), 0.15, 1.2, 5);
    wipe(tl, $('#f1 .yr .hl'), 0.1, 1.35);
    pulse(tl, $('#f1 .halo'), 0.1, 1.3, 0.85);

    // 2 | 1.5-3.5  Boonze: the company name wipes through, an underline traces beneath it
    wipe(tl, $('#f2 .co .hl'), 1.6, 1.8);
    tl.fromTo('#f2 .uline', { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, 1.75);
    tl.to('#f2 .uline', { opacity: 0, duration: 0.5, ease: 'power1.in' }, 2.9);
    tl.set('#f2 .uline', { scaleX: 0, opacity: 1 }, 3.45);
    pulse(tl, $('#f2 .halo'), 1.6, 1.8, 0.7);

    // 3 | 3.5-5.5  Offices: pin settles, route traces to the landmark, the landmark gains depth and light
    lift(tl, $('#f3 .pin'), 3.55, 1.0, 9);
    drawOn(tl, $$('#f3 .pin .ic-hl [pathLength]'), 3.6, 1.6);
    tl.fromTo('.route', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, 3.7);
    tl.to('.route', { opacity: 0, duration: 0.5 }, 4.9);
    tl.set('.route', { strokeDashoffset: 1, opacity: 1 }, 5.45);
    wipe(tl, $('#f3 .city .hl'), 3.75, 1.65);
    // landmark layers drift apart a few pixels for depth, then settle back
    [['.lm-sky', -7, 0], ['.lm-wings', -2, 0], ['.lm-tower', 0, -4], ['.lm-statue', 5, 0], ['.lm-palms', 7, 0]].forEach(function (l) {
      tl.to(root.querySelectorAll('.lm ' + l[0]), { x: l[1], y: l[2], duration: 0.9, ease: 'sine.inOut' }, 3.7);
      tl.to(root.querySelectorAll('.lm ' + l[0]), { x: 0, y: 0, duration: 0.8, ease: 'sine.inOut' }, 4.65);
    });
    tl.fromTo(root.querySelectorAll('.lm .lit'), { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.03, ease: 'sine.out' }, 3.8);
    tl.to(root.querySelectorAll('.lm .lit'), { opacity: 0, duration: 0.6, ease: 'sine.in' }, 4.85);
    pulse(tl, $('.lm-aura'), 3.6, 1.8, 1);

    // 4 | 5.5-7.5  Google Premier Partner: seal draws on, a soft ring opens, the words wipe through
    drawOn(tl, $$('#f4 .ic-hl [pathLength]'), 5.6, 1.7);
    // every tween starts from the rest state (ring hidden), so seeking to any frame is exact
    tl.set('#f4 .ring', { scale: 0.7, opacity: 0.55 }, 5.75);
    tl.to('#f4 .ring', { scale: 1.6, opacity: 0, duration: 1.0, ease: 'power2.out' }, 5.75);
    tl.set('#f4 .ring', { scale: 0.7, opacity: 0 }, 6.8);
    wipe(tl, $('#f4 .ttl .hl'), 5.75, 1.65);
    pulse(tl, $('#f4 .halo'), 5.6, 1.8, 0.8);

    // 5 | 7.5-9.0  10,000+: account windows lift in sequence, nodes light, a signal crosses the cluster
    $$('#f5 .acw').forEach(function (w, i) { lift(tl, w, 7.55 + i * 0.12, 0.9, 5); });
    tl.fromTo(root.querySelectorAll('#f5 .acn'), { scale: 1 }, { scale: 1.45, duration: 0.25, ease: 'power2.out', stagger: 0.1, yoyo: true, repeat: 1 }, 7.9);
    tl.fromTo('#f5 .acs', { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: 'power1.inOut' }, 7.85);
    tl.to('#f5 .acs', { opacity: 0, duration: 0.3 }, 8.6);
    tl.set('#f5 .acs', { strokeDashoffset: 1, opacity: 1 }, 8.95);
    lift(tl, $('#f5 .num'), 7.6, 1.2, 5);
    wipe(tl, $('#f5 .num .hl'), 7.6, 1.35);
    pulse(tl, $('#f5 .glint'), 8.05, 0.8, 1);
    pulse(tl, $('#f5 .halo'), 7.55, 1.4, 0.8);
    // 9.0-10.0: hold; the ambient layer carries the motion back to frame 0
  }

  window.O3MLoop = { ambient: ambient, emphasis: emphasis, spline: spline };
})();
