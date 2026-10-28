/* O3M "Signal" motion layer — shared by /google-ads-management/ and /thank-you/.
   One visual metaphor throughout: a signal travelling from search to outcome, drawn in the brand
   ramp Royal Blue -> Sea Green -> Honeycomb Yellow. Every feature is opt-in by element, pauses
   off screen, and collapses to a static state under prefers-reduced-motion. No copy is changed:
   the word reveal only wraps existing text nodes in spans. */
(function () {
  'use strict';

  function mq(q) { try { return window.matchMedia(q).matches; } catch (x) { return false; } }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  var reduced = mq('(prefers-reduced-motion: reduce)');
  var fine = mq('(hover: hover) and (pointer: fine)');
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  var BLUE = [37, 99, 235], GREEN = [22, 163, 74], YELLOW = [234, 179, 8], SKY = [147, 197, 253];
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  // position along the journey (0 = search, 1 = outcome) -> brand colour
  function journey(t) { t = clamp(t, 0, 1); return t < 0.55 ? mix(BLUE, GREEN, t / 0.55) : mix(GREEN, YELLOW, (t - 0.55) / 0.45); }
  function rgba(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a + ')'; }

  // small deterministic generator so particle layouts are stable between visits
  function rng(seed) { return function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

  // Pointer position shared by the canvases (client coordinates).
  var pointer = { x: -1e4, y: -1e4 };
  if (fine && !reduced) {
    window.addEventListener('pointermove', function (e) { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
  }

  /* A canvas that fills its CSS box, redraws while visible, and draws one still frame when motion is reduced. */
  function stage(canvas, api) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var w = 0, h = 0, visible = false, raf = 0, start = 0;
    function size() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width)); h = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(w * DPR); canvas.height = Math.round(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      api.resize(ctx, w, h);
      if (reduced || !visible) api.frame(ctx, w, h, api.stillTime || 0, true);
    }
    function loop(now) {
      raf = 0;
      if (!visible) return;
      if (!start) start = now;
      api.frame(ctx, w, h, now - start, false);
      raf = requestAnimationFrame(loop);
    }
    size();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(size).observe(canvas);
    else window.addEventListener('resize', size);
    if (reduced) return;
    if (typeof IntersectionObserver === 'undefined') { visible = true; raf = requestAnimationFrame(loop); return; }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        visible = en.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(loop);
      });
    }, { rootMargin: '80px' }).observe(canvas);
  }

  /* ---------- 1. Signal field: particles flowing left to right, coloured by journey stage ---------- */
  $$('canvas.signal-field').forEach(function (canvas) {
    var parts = [], rand = rng(2010);
    function spawn(p, w, h, anywhere) {
      p.x = anywhere ? rand() * w : -10 - rand() * 60;
      p.y = rand() * h; p.life = anywhere ? rand() : 0; p.speed = 0.6 + rand() * 0.9;
      return p;
    }
    stage(canvas, {
      stillTime: 0,
      resize: function (ctx, w, h) {
        var n = clamp(Math.round((w * h) / 6500), 50, 300);
        if (w < 700) n = Math.round(n * 0.6);
        parts = [];
        for (var i = 0; i < n; i++) parts.push(spawn({}, w, h, true));
      },
      frame: function (ctx, w, h, t, still) {
        if (still) {
          ctx.clearRect(0, 0, w, h);
          parts.forEach(function (p) { ctx.fillStyle = rgba(journey(p.x / w), 0.5); ctx.fillRect(p.x, p.y, 2, 2); });
          return;
        }
        // fade the previous frame so each particle leaves a short trail
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,0.14)';
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
        var r = canvas.getBoundingClientRect(), px = pointer.x - r.left, py = pointer.y - r.top;
        ctx.lineWidth = 1.4; ctx.lineCap = 'round';
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          var a = Math.sin(p.y * 0.0065 + t * 0.00028) * 0.85 + Math.cos(p.x * 0.0042 - t * 0.0002) * 0.55;
          var vx = (1 + Math.cos(a) * 0.55) * p.speed, vy = Math.sin(a) * 0.8 * p.speed;
          var dx = p.x - px, dy = p.y - py, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 150 && d > 0.1) { var f = (150 - d) / 150; vx += (dx / d) * f * 3.2; vy += (dy / d) * f * 3.2; }
          var nx = p.x + vx, ny = p.y + vy;
          p.life = Math.min(1, p.life + 0.02);
          ctx.strokeStyle = rgba(journey(p.x / w), 0.7 * p.life);
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
          p.x = nx; p.y = ny;
          if (p.x > w + 10 || p.y < -20 || p.y > h + 20) spawn(p, w, h, false);
        }
      }
    });
  });

  /* ---------- 2. Signal orb: a sphere of points that unfurls into a ring as its section scrolls through ---------- */
  $$('canvas.orb').forEach(function (canvas) {
    var pts = [], host = canvas.closest('section') || canvas, tilt = { x: 0, y: 0 };
    function build(n) {
      pts = [];
      var golden = Math.PI * (3 - Math.sqrt(5));
      for (var i = 0; i < n; i++) {
        var y = 1 - (i / (n - 1)) * 2, rad = Math.sqrt(1 - y * y), th = golden * i;
        var x = Math.cos(th) * rad, z = Math.sin(th) * rad, ang = Math.atan2(z, x);
        pts.push({ x: x, y: y, z: z, ang: ang, ring: 1.25 + ((i * 7919) % 100) / 100 * 0.45 });
      }
    }
    function progress() {
      var r = host.getBoundingClientRect(), vh = window.innerHeight || 800;
      return clamp((vh - r.top) / (vh + r.height), 0, 1);
    }
    stage(canvas, {
      stillTime: 0,
      resize: function (ctx, w) { build(w < 520 ? 700 : 1300); },
      frame: function (ctx, w, h, t, still) {
        ctx.clearRect(0, 0, w, h);
        var m = still ? 0.45 : clamp((progress() - 0.25) / 0.45, 0, 1);
        m = m * m * (3 - 2 * m);
        if (!still) {
          var r = canvas.getBoundingClientRect();
          var tx = pointer.x > -1e3 ? clamp((pointer.x - (r.left + r.width / 2)) / r.width, -1, 1) : 0;
          var ty = pointer.y > -1e3 ? clamp((pointer.y - (r.top + r.height / 2)) / r.height, -1, 1) : 0;
          tilt.x += (tx - tilt.x) * 0.05; tilt.y += (ty - tilt.y) * 0.05;
        }
        var cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.32;
        var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.6);
        g.addColorStop(0, 'rgba(37,99,235,0.28)'); g.addColorStop(1, 'rgba(37,99,235,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        var spin = t * 0.00022 + tilt.x * 0.6, rx = 0.3 + m * 0.75 + tilt.y * 0.25;
        var cs = Math.cos(spin), sn = Math.sin(spin), cr = Math.cos(rx), sr = Math.sin(rx);
        for (var i = 0; i < pts.length; i++) {
          var p = pts[i];
          var x = p.x + (Math.cos(p.ang) * p.ring - p.x) * m;
          var y = p.y + (p.y * 0.07 - p.y) * m;
          var z = p.z + (Math.sin(p.ang) * p.ring - p.z) * m;
          var x1 = x * cs - z * sn, z1 = x * sn + z * cs;
          var y1 = y * cr - z1 * sr, z2 = y * sr + z1 * cr;
          var f = 2.8 / (2.8 + z2), sx = cx + x1 * R * f, sy = cy + y1 * R * f;
          var hue = (p.y + 1) / 2 + ((p.ang / (Math.PI * 2) + 0.5) - (p.y + 1) / 2) * m;
          var s = 1.5 * f;
          ctx.fillStyle = rgba(journey(hue), 0.3 + 0.6 * clamp((1.4 - z2) / 2.4, 0, 1));
          ctx.fillRect(sx - s / 2, sy - s / 2, s, s);
        }
      }
    });
  });

  /* ---------- 3. Contour field (marching squares) behind the closing call to action ---------- */
  $$('canvas.contours').forEach(function (canvas) {
    var CELLS = 64, LINE_SCALE = 3.4, LINE_COUNT = 3, WAVE = 0.37, SPEED = 1.1, last = -1e9;
    function field(x, y, t) {
      var f = Math.sin(x + t * 0.6) * 0.5 + Math.sin(y * 0.85 - t * 0.45) * 0.45 +
        Math.sin((x + y) * 0.65 + t * 0.35) * 0.35 + Math.sin((x - y) * 0.95 - t * 0.55) * 0.25;
      return f * 0.5 + 0.5;
    }
    stage(canvas, {
      stillTime: 0,
      resize: function () { last = -1e9; },
      frame: function (ctx, w, h, ms, still) {
        if (!still && ms - last < 40) return; // ~25fps is plenty for slow contours
        last = ms;
        var t = (ms / 1000) * SPEED;
        var cols = w >= h ? CELLS : Math.max(8, Math.round((CELLS * w) / h)), rows = Math.max(8, Math.round((cols * h) / w));
        var sx = w / cols, sy = h / rows, aspect = w / h, v = new Float32Array((cols + 1) * (rows + 1));
        for (var j = 0; j <= rows; j++) for (var i = 0; i <= cols; i++) {
          var nx = ((i / cols) * 2 - 1) * aspect * LINE_SCALE, ny = ((j / rows) * 2 - 1) * LINE_SCALE;
          var qx = nx + Math.sin(ny * 0.8 + t * 0.7) * WAVE, qy = ny + Math.cos(nx * 0.7 - t * 0.6) * WAVE;
          v[j * (cols + 1) + i] = field(qx, qy, t) * LINE_COUNT;
        }
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(147,197,253,0.16)'; ctx.lineWidth = 1; ctx.beginPath();
        function seg(p, q) { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }
        for (var level = 0.5; level < LINE_COUNT; level += 1)
          for (var jj = 0; jj < rows; jj++) for (var ii = 0; ii < cols; ii++) {
            var a = v[jj * (cols + 1) + ii], b = v[jj * (cols + 1) + ii + 1], c = v[(jj + 1) * (cols + 1) + ii + 1], d = v[(jj + 1) * (cols + 1) + ii];
            var k = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
            if (k === 0 || k === 15) continue;
            var x0 = ii * sx, y0 = jj * sy;
            var top = [x0 + sx * ((level - a) / (b - a)), y0], right = [x0 + sx, y0 + sy * ((level - b) / (c - b))];
            var bottom = [x0 + sx * ((level - d) / (c - d)), y0 + sy], left = [x0, y0 + sy * ((level - a) / (d - a))];
            switch (k) {
              case 1: case 14: seg(left, bottom); break;
              case 2: case 13: seg(bottom, right); break;
              case 3: case 12: seg(left, right); break;
              case 4: case 11: seg(top, right); break;
              case 6: case 9: seg(top, bottom); break;
              case 7: case 8: seg(left, top); break;
              case 5: seg(left, top); seg(bottom, right); break;
              case 10: seg(left, bottom); seg(top, right); break;
            }
          }
        ctx.stroke();
      }
    });
  });

  if (reduced) {
    // Static end states only: full progress bars, nothing else moves.
    $$('.steps .card').forEach(function (c) { c.style.setProperty('--fill', '1'); });
    return;
  }

  /* ---------- 4. Word reveal on headings (wraps existing text nodes; the text itself is untouched) ---------- */
  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), nodes = [], n;
    while ((n = walker.nextNode())) if (n.nodeValue.trim()) nodes.push(n);
    var i = 0;
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement('span'); w.className = 'w'; w.style.setProperty('--i', i++);
        w.textContent = part; frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    });
    el.classList.add('words');
  }
  var heads = $$('.hero-title, main .h2, .cta h2, .adflux h2, .ty-card h1');
  heads.forEach(splitWords);
  if (typeof IntersectionObserver !== 'undefined') {
    var hio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('words-in'); hio.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    heads.forEach(function (h) { hio.observe(h); });
  } else heads.forEach(function (h) { h.classList.add('words-in'); });

  /* ---------- 5. Scroll-linked progress: page marker and the approach cards' signal bars ---------- */
  var bar = document.querySelector('.scroll-progress span');
  var stepCards = $$('.steps .card'), steps = document.querySelector('.steps');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var vh = window.innerHeight || 800;
    if (bar) {
      var max = document.documentElement.scrollHeight - vh;
      bar.style.transform = 'scaleX(' + (max > 0 ? clamp(window.scrollY / max, 0, 1) : 0).toFixed(4) + ')';
    }
    if (steps && stepCards.length) {
      var r = steps.getBoundingClientRect();
      var p = clamp((vh * 0.9 - r.top) / (r.height + vh * 0.35), 0, 1) * stepCards.length;
      stepCards.forEach(function (c, i) { c.style.setProperty('--fill', clamp(p - i, 0, 1).toFixed(3)); });
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req, { passive: true });
  onScroll();

  /* ---------- 6. Pointer spotlight and gentle tilt on cards (fine pointers only) ---------- */
  if (fine) {
    $$('.card, .aud article, .svc-card, .why-video, .adflux, .ty-card').forEach(function (el) {
      el.classList.add('spot');
      var canTilt = !el.matches('.svc-card, .adflux, .ty-card');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        if (canTilt && (!el.hasAttribute('data-reveal') || el.hasAttribute('data-in'))) {
          el.style.transition = 'transform .25s cubic-bezier(.2,.8,.2,1)';
          el.style.transform = 'perspective(1000px) rotateX(' + ((0.5 - y) * 4).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 5).toFixed(2) + 'deg) translateY(-3px)';
        }
      });
      el.addEventListener('pointerleave', function () {
        if (!canTilt) return;
        el.style.transition = 'transform .6s cubic-bezier(.34,1.4,.5,1)';
        el.style.transform = '';
      });
    });

    /* ---------- 7. Magnetic primary calls to action ---------- */
    $$('.hero-copy .btn, .cta .btn, .ty-actions .btn').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.transition = 'transform .15s ease-out, background-color .15s ease';
        btn.style.transform = 'translate(' + (dx * 8).toFixed(1) + 'px,' + (dy * 6).toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.transition = 'transform .5s cubic-bezier(.34,1.5,.5,1), background-color .15s ease';
        btn.style.transform = '';
      });
    });
  }

  /* ---------- 8. FAQ answers open with a short height/opacity ease (the toggle itself stays in landing.js) ---------- */
  $$('.faqbtn').forEach(function (b) {
    b.addEventListener('click', function () {
      var panel = document.getElementById(b.getAttribute('aria-controls'));
      if (!panel || panel.hidden || !panel.animate) return;
      var h = panel.scrollHeight;
      panel.animate([{ height: '0px', opacity: 0, overflow: 'hidden' }, { height: h + 'px', opacity: 1, overflow: 'hidden' }],
        { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
  });
})();
