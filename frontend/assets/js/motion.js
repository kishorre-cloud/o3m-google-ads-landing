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

  /* A canvas that fills its CSS box, redraws while visible, and draws one still frame when motion is reduced.
     api.dpr overrides the backing-store scale, api.every is the minimum ms between drawn frames, and api.box
     (if given) is kept at the canvas's page position for pointer maths. */
  function stage(canvas, api) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var w = 0, h = 0, visible = false, raf = 0, start = 0, drawn = -1e9, scale = api.dpr || DPR;
    function size(cw, ch) {
      w = Math.max(1, Math.round(cw)); h = Math.max(1, Math.round(ch));
      canvas.width = Math.round(w * scale); canvas.height = Math.round(h * scale);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      if (api.box && fine) {
        // page position only moves when the layout does, so one read here replaces a read every frame
        var r = canvas.getBoundingClientRect();
        api.box.left = r.left + window.scrollX; api.box.top = r.top + window.scrollY;
      }
      drawn = -1e9;
      api.resize(ctx, w, h);
      if (reduced || !visible) api.frame(ctx, w, h, api.stillTime || 0, true);
    }
    function measure() { var r = canvas.getBoundingClientRect(); size(r.width, r.height); }
    function loop(now) {
      raf = 0;
      if (!visible) return;
      raf = requestAnimationFrame(loop);
      if (!start) start = now;
      if (!w || now - drawn < (api.every || 0)) return;
      drawn = now;
      api.frame(ctx, w, h, now - start, false);
    }
    // The observer's first callback runs after layout and before paint, so sizing there neither forces a layout
    // while this script evaluates nor leaves a blank first frame.
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(function (en) { size(en[0].contentRect.width, en[0].contentRect.height); }).observe(canvas);
    else { requestAnimationFrame(measure); window.addEventListener('resize', measure); }
    if (reduced) return;
    if (typeof IntersectionObserver === 'undefined') { visible = true; raf = requestAnimationFrame(loop); return; }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        visible = en.isIntersecting;
        if (visible && api.box && fine) { var r = en.boundingClientRect; api.box.left = r.left + window.scrollX; api.box.top = r.top + window.scrollY; }
        if (visible && !raf) raf = requestAnimationFrame(loop);
      });
    }, { rootMargin: '80px' }).observe(canvas);
  }

  /* ---------- 1. Signal field: particles flowing left to right, coloured by journey stage ----------
     With data-gather (hero), the field opens by drawing scattered signals onto the outlines of the
     three rounded brand blocks behind the form; the blocks then appear and the signals flow on. */
  var GATHER_MS = 1700, BLOCK_RGB = { b1: BLUE, b2: YELLOW, b3: GREEN };
  function blockTargets(canvas) {
    var holder = document.querySelector('.hero-blocks');
    if (!holder) return [];
    var c = canvas.getBoundingClientRect(), hr = holder.getBoundingClientRect();
    return $$('.blk', holder).map(function (b) {
      // offset* is the untransformed layout box, so the entrance scale/rotate doesn't skew the targets
      return { x: hr.left - c.left + b.offsetLeft, y: hr.top - c.top + b.offsetTop, s: b.offsetWidth,
        rgb: BLOCK_RGB[b.classList[1]] || BLUE };
    });
  }
  function perimeter(blk, u) {
    // u in [0,1) -> a point on the block's square outline (corners softened by the eye at this scale)
    var s = blk.s, q = (u * 4) % 4, f = q % 1, x, y;
    if (q < 1) { x = f * s; y = 0; } else if (q < 2) { x = s; y = f * s; } else if (q < 3) { x = s - f * s; y = s; } else { x = 0; y = s - f * s; }
    return [blk.x + x, blk.y + y];
  }
  // the block holder shares the form's sticky box, so it needs the form's height
  var enquiry = document.getElementById('enquiry'), blockHolder = document.querySelector('.hero-blocks');
  if (enquiry && blockHolder && typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(function () { blockHolder.style.setProperty('--form-h', enquiry.offsetHeight + 'px'); }).observe(enquiry);
  }

  // Trails are stroked in colour x alpha buckets (one stroke each) instead of one stroke per particle.
  var TONES = 16, LIVES = 4, TRAIL_STYLE = [], TRAIL_FADE = [];
  for (var tk = 0; tk < TONES; tk++) for (var lk = 1; lk <= LIVES; lk++) TRAIL_STYLE.push(rgba(journey((tk + 0.5) / TONES), 0.7 * lk / LIVES));
  // one 60 fps step fades 14%; a drawn frame that advances n steps fades as much as n of them would
  for (var fk = 0; fk <= 3; fk++) TRAIL_FADE.push('rgba(0,0,0,' + (1 - Math.pow(0.86, fk)).toFixed(4) + ')');
  $$('canvas.signal-field').forEach(function (canvas) {
    var parts = [], rand = rng(2010), gather = canvas.hasAttribute('data-gather') && !reduced, blocks = [], gathered = false;
    var box = { left: 0, top: 0 }, bins = TRAIL_STYLE.map(function () { return []; }), lastT = -1e9;
    function spawn(p, w, h, anywhere) {
      p.x = anywhere ? rand() * w : -10 - rand() * 60;
      p.y = rand() * h; p.life = anywhere ? rand() : 0; p.speed = 0.6 + rand() * 0.9;
      return p;
    }
    stage(canvas, {
      stillTime: 0,
      dpr: Math.min(DPR, 1.5), // soft particle field: 1.5x keeps trails crisp on retina at about half the pixels of 2x
      every: 30,
      box: box,
      resize: function (ctx, w, h) {
        var n = clamp(Math.round((w * h) / 6500), 50, 300);
        if (w < 700) n = Math.round(n * 0.6);
        parts = [];
        for (var i = 0; i < n; i++) parts.push(spawn({}, w, h, true));
        if (gather && !gathered) {
          blocks = blockTargets(canvas);
          parts.forEach(function (p, k) { p.sx = p.x; p.sy = p.y; p.blk = blocks.length ? blocks[k % blocks.length] : null; p.u = rand(); });
        }
      },
      frame: function (ctx, w, h, t, still) {
        if (still) {
          ctx.clearRect(0, 0, w, h);
          parts.forEach(function (p) { ctx.fillStyle = rgba(journey(p.x / w), 0.5); ctx.fillRect(p.x, p.y, 2, 2); });
          return;
        }
        // frames are capped, so advance the 60 fps simulation by the vsyncs that elapsed (at most 3)
        var steps = clamp(Math.round((t - lastT) / 16.7), 1, 3);
        lastT = t;
        if (gather && !gathered && blocks.length) {
          if (t < GATHER_MS) {
            var e = t / GATHER_MS; e = e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;
            ctx.clearRect(0, 0, w, h);
            for (var g = 0; g < parts.length; g++) {
              var q = parts[g], tg = perimeter(q.blk, q.u + t * 0.00006);
              q.x = q.sx + (tg[0] - q.sx) * e; q.y = q.sy + (tg[1] - q.sy) * e;
              ctx.fillStyle = rgba(mix(journey(q.sx / w), q.blk.rgb, e), 0.35 + 0.55 * e);
              ctx.fillRect(q.x - 1, q.y - 1, 2, 2);
            }
            return;
          }
          gathered = true;
          parts.forEach(function (p) { p.life = 1; });
        }
        // fade the previous frame so each particle leaves a short trail
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = TRAIL_FADE[steps];
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
        var px = fine ? pointer.x - (box.left - window.scrollX) : -1e4, py = fine ? pointer.y - (box.top - window.scrollY) : -1e4;
        for (var b = 0; b < bins.length; b++) bins[b].length = 0;
        for (var s = steps - 1; s >= 0; s--) {
          var ts = t - s * 16.7;
          for (var i = 0; i < parts.length; i++) {
            var p = parts[i];
            var a = Math.sin(p.y * 0.0065 + ts * 0.00028) * 0.85 + Math.cos(p.x * 0.0042 - ts * 0.0002) * 0.55;
            var vx = (1 + Math.cos(a) * 0.55) * p.speed, vy = Math.sin(a) * 0.8 * p.speed;
            if (fine) {
              var dx = p.x - px, dy = p.y - py, d = Math.sqrt(dx * dx + dy * dy);
              if (d < 150 && d > 0.1) { var f = (150 - d) / 150; vx += (dx / d) * f * 3.2; vy += (dy / d) * f * 3.2; }
            }
            var nx = p.x + vx, ny = p.y + vy;
            p.life = Math.min(1, p.life + 0.02);
            var lb = Math.round(p.life * LIVES); // 0 is below 9% alpha and still off the left edge: not drawn
            if (lb) bins[clamp((p.x / w * TONES) | 0, 0, TONES - 1) * LIVES + lb - 1].push(p.x, p.y, nx, ny);
            p.x = nx; p.y = ny;
            if (p.x > w + 10 || p.y < -20 || p.y > h + 20) spawn(p, w, h, false);
          }
        }
        ctx.lineWidth = 1.4; ctx.lineCap = 'round';
        for (b = 0; b < bins.length; b++) {
          var seg = bins[b];
          if (!seg.length) continue;
          ctx.strokeStyle = TRAIL_STYLE[b]; ctx.beginPath();
          for (var j = 0; j < seg.length; j += 4) { ctx.moveTo(seg[j], seg[j + 1]); ctx.lineTo(seg[j + 2], seg[j + 3]); }
          ctx.stroke();
        }
      }
    });
  });

  /* ---------- 2. AdFlux signal network (canvas.adflux-net) ----------
     Tells the panel's own sentence as a 10 s loop (signals 0-1.2 s, branches 1.1-2 s, revenue chain 2.3-3 s, outcomes 3.1-5.8 s, flow to 9.3 s, release): scattered signals gather into a sphere
     ("Google Ads performance"), branch to lead management, CRM visibility and sales execution,
     and converge on business outcomes, where a ring closes (visibility). Link colours follow the
     three capability tags: marketing performance (blue), revenue operations (green), performance
     visibility (yellow). Every label is a phrase from the panel copy; no values or charts. */
  var LOOP = 10, NET_LABELS = { src: 'Google Ads performance', m1: 'lead management', m2: 'CRM visibility', m3: 'sales execution', out: 'business outcomes' };
  function ease(x) { x = clamp(x, 0, 1); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function bez(l, u) {
    var a = 1 - u;
    return [a * a * a * l.p0[0] + 3 * a * a * u * l.p1[0] + 3 * a * u * u * l.p2[0] + u * u * u * l.p3[0],
      a * a * a * l.p0[1] + 3 * a * a * u * l.p1[1] + 3 * a * u * u * l.p2[1] + u * u * u * l.p3[1]];
  }
  // a label on a soft navy backing so passing lines never run through the words
  function netLabel(ctx, text, x, y, a, white) {
    var tw = ctx.measureText(text).width;
    ctx.fillStyle = 'rgba(11,21,48,' + (0.78 * a).toFixed(3) + ')';
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x - tw / 2 - 6, y - 12, tw + 12, 17, 5); else ctx.rect(x - tw / 2 - 6, y - 12, tw + 12, 17); ctx.fill();
    ctx.fillStyle = (white ? 'rgba(255,255,255,' : 'rgba(203,213,225,') + (0.95 * a).toFixed(3) + ')';
    ctx.fillText(text, x, y);
  }
  // Floor dots use 6 brightness levels and sphere points 10 hues x 8 depths, one fill per level, strings built once.
  var DOT_LEVELS = 6, DOT_STYLE = [], HUES = 10, DEPTHS = 8, SPHERE_STYLE = [];
  for (var dk = 0; dk < DOT_LEVELS; dk++) DOT_STYLE.push('rgba(147,197,253,' + (0.05 + 0.05 * dk / (DOT_LEVELS - 1)).toFixed(3) + ')');
  for (var hk = 0; hk < HUES; hk++) for (var zk = 0; zk < DEPTHS; zk++) SPHERE_STYLE.push(rgba(journey((hk + 0.5) / HUES * 0.55), 0.25 + 0.6 * zk / (DEPTHS - 1)));
  $$('canvas.adflux-net').forEach(function (canvas) {
    var nodes = {}, links = [], pts = [], dots = [], vertical = false, R = 40, font = '', g2d = null;
    // setting ctx.font resolves it against the canvas's computed style (a style recalc), so it is set only when the
    // context lost it (a resize resets the canvas state) or a web font finished loading, not on every frame
    var fontSet = '';
    if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', function () { fontSet = ''; });
    var dotLevel = new Uint8Array(0), sphereBins = SPHERE_STYLE.map(function () { return []; });
    function link(a, b, dir, rgbA, rgbB, start) {
      var A = nodes[a], B = nodes[b], k = 0.42;
      var p1 = dir === 'h' ? [A.x + (B.x - A.x) * k, A.y] : [A.x, A.y + (B.y - A.y) * k];
      var p2 = dir === 'h' ? [B.x - (B.x - A.x) * k, B.y] : [B.x, B.y - (B.y - A.y) * k];
      var l = { p0: [A.x, A.y], p1: p1, p2: p2, p3: [B.x, B.y], a: rgbA, b: rgbB, start: start, to: b, samples: [] };
      for (var i = 0; i <= 28; i++) l.samples.push(bez(l, i / 28));
      // full-strength gradient; the fade is applied with globalAlpha, which gives the same pixels
      l.grad = g2d.createLinearGradient(l.p0[0], l.p0[1], l.p3[0], l.p3[1]);
      l.grad.addColorStop(0, rgba(rgbA, 0.55)); l.grad.addColorStop(1, rgba(rgbB, 0.55));
      links.push(l);
    }
    function node(nd, size) {
      nd.size = size; nd.fill = rgba(nd.rgb, 1);
      nd.glow = g2d.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, size * 2.6);
      nd.glow.addColorStop(0, rgba(nd.rgb, 0.35)); nd.glow.addColorStop(1, rgba(nd.rgb, 0));
    }
    function layout(w, h) {
      vertical = w / h < 1.25;
      if (!vertical) {
        nodes = { src: { x: w * 0.16, y: h * 0.5 }, m1: { x: w * 0.47, y: h * 0.2 }, m2: { x: w * 0.53, y: h * 0.5 }, m3: { x: w * 0.47, y: h * 0.8 }, out: { x: w * 0.85, y: h * 0.5 } };
        R = Math.min(h * 0.27, w * 0.11);
      } else {
        nodes = { src: { x: w * 0.5, y: h * 0.18 }, m1: { x: w * 0.2, y: h * 0.48 }, m2: { x: w * 0.5, y: h * 0.52 }, m3: { x: w * 0.8, y: h * 0.48 }, out: { x: w * 0.5, y: h * 0.78 } };
        R = Math.min(h * 0.12, w * 0.2);
      }
      var d = vertical ? 'v' : 'h', across = vertical ? 'h' : 'v';
      nodes.m1.rgb = BLUE; nodes.m2.rgb = GREEN; nodes.m3.rgb = YELLOW; nodes.out.rgb = [255, 255, 255];
      links = [];
      // marketing performance: Google Ads performance -> the three operating stages
      link('src', 'm1', d, BLUE, BLUE, 1.1); link('src', 'm2', d, BLUE, BLUE, 1.3); link('src', 'm3', d, BLUE, BLUE, 1.5);
      // revenue operations: lead management -> CRM visibility -> sales execution
      link('m1', 'm2', across, GREEN, GREEN, 2.3); link('m2', 'm3', across, GREEN, GREEN, 2.55);
      // performance visibility: each stage -> business outcomes
      link('m1', 'out', d, GREEN, YELLOW, 3.1); link('m2', 'out', d, GREEN, YELLOW, 3.3); link('m3', 'out', d, GREEN, YELLOW, 3.5);
      node(nodes.m1, w < 600 ? 13 : 16); node(nodes.m2, w < 600 ? 13 : 16); node(nodes.m3, w < 600 ? 13 : 16); node(nodes.out, w < 600 ? 18 : 24);
      var S = nodes.src;
      S.glow = g2d.createRadialGradient(S.x, S.y, 0, S.x, S.y, R * 1.7);
      S.glow.addColorStop(0, 'rgba(37,99,235,0.3)'); S.glow.addColorStop(1, 'rgba(37,99,235,0)');
      font = '600 ' + (w < 600 ? 11 : 12.5) + 'px "Plus Jakarta Sans", system-ui, sans-serif';
    }
    function build(w, h) {
      var n = w < 600 ? 150 : 280, rand = rng(4242), golden = Math.PI * (3 - Math.sqrt(5));
      pts = [];
      for (var i = 0; i < n; i++) {
        var y = 1 - (i / (n - 1)) * 2, rad = Math.sqrt(1 - y * y), th = golden * i;
        pts.push({ x: Math.cos(th) * rad, y: y, z: Math.sin(th) * rad, sx: rand() * w, sy: rand() * h, hue: rand() * 0.55 });
        pts[i].hk = Math.min(HUES - 1, (pts[i].hue / 0.55 * HUES) | 0);
      }
      // a quiet dot grid across the whole panel floor, so the full width reads as one field
      dots = [];
      var step = w < 600 ? 26 : 30;
      for (var gx = step / 2; gx < w; gx += step) for (var gy = step / 2; gy < h; gy += step) dots.push([gx, gy]);
      dotLevel = new Uint8Array(dots.length);
    }
    function drawLink(ctx, l, prog, alpha) {
      if (prog <= 0 || alpha <= 0) return;
      prog = Math.min(prog, 1);
      var last = Math.max(1, Math.round(prog * 28));
      ctx.globalAlpha = alpha; ctx.strokeStyle = l.grad; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(l.samples[0][0], l.samples[0][1]);
      for (var i = 1; i <= last; i++) ctx.lineTo(l.samples[i][0], l.samples[i][1]);
      ctx.stroke(); ctx.globalAlpha = 1;
    }
    function drawNode(ctx, nd, a, label) {
      if (a <= 0) return;
      var size = nd.size, s = size * (0.6 + 0.4 * a);
      ctx.globalAlpha = a;
      ctx.fillStyle = nd.glow; ctx.fillRect(nd.x - size * 3, nd.y - size * 3, size * 6, size * 6);
      ctx.save(); ctx.translate(nd.x, nd.y); ctx.rotate(-0.1);
      ctx.fillStyle = nd.fill; ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-s / 2, -s / 2, s, s, s * 0.26); else ctx.rect(-s / 2, -s / 2, s, s);
      ctx.fill(); ctx.restore();
      ctx.globalAlpha = 1;
      if (label) netLabel(ctx, label, nd.x, nd.y + size / 2 + 18, a, false);
    }
    stage(canvas, {
      stillTime: 7600,
      resize: function (ctx, w, h) { g2d = ctx; fontSet = ''; layout(w, h); build(w, h); },
      frame: function (ctx, w, h, ms) {
        var t = (ms / 1000) % LOOP;
        var fadeOut = 1 - clamp((t - 9.3) / 0.6, 0, 1);            // network dims before the loop restarts
        var gather = ease(t / 1.2) * (1 - ease((t - 9.3) / 0.7));   // 0 scattered -> 1 sphere -> 0 scattered
        ctx.clearRect(0, 0, w, h);
        if (fontSet !== font) { ctx.font = font; fontSet = font; }
        ctx.textAlign = 'center';

        // floor grid: a slow wave of brightness travelling from the source towards the outcome
        for (var i = 0; i < dots.length; i++) {
          var d = dots[i], wv = Math.sin((vertical ? d[1] / h : d[0] / w) * 7 - t * (Math.PI * 2 / LOOP) * 2);
          dotLevel[i] = Math.round(Math.max(0, wv) * (DOT_LEVELS - 1));
        }
        for (var lv = 0; lv < DOT_LEVELS; lv++) {
          ctx.fillStyle = DOT_STYLE[lv]; ctx.beginPath();
          for (i = 0; i < dots.length; i++) if (dotLevel[i] === lv) ctx.rect(dots[i][0] - 0.75, dots[i][1] - 0.75, 1.5, 1.5);
          ctx.fill();
        }

        // links draw in, then carry pulses
        links.forEach(function (l) { drawLink(ctx, l, (t - l.start) / 0.8, fadeOut); });
        if (t > 1.9) {
          var flowA = clamp((t - 1.9) / 0.6, 0, 1) * fadeOut;
          links.forEach(function (l, li) {
            if (t < l.start + 0.8) return;
            for (var k = 0; k < 3; k++) {
              var u = ((t * 0.32 + k / 3 + li * 0.137) % 1), q = bez(l, u), c = mix(l.a, l.b, u);
              ctx.fillStyle = rgba(c, 0.25 * flowA); ctx.beginPath(); ctx.arc(q[0], q[1], 4.5, 0, Math.PI * 2); ctx.fill();
              ctx.fillStyle = rgba(mix(c, [255, 255, 255], 0.5), 0.95 * flowA); ctx.fillRect(q[0] - 1.25, q[1] - 1.25, 2.5, 2.5);
            }
          });
        }

        // the source sphere: scattered signals gather, then turn slowly
        var S = nodes.src, spin = t * (Math.PI * 2 / LOOP), cs = Math.cos(spin), sn = Math.sin(spin), tilt = 0.35, ct = Math.cos(tilt), st = Math.sin(tilt);
        if (gather > 0) { ctx.globalAlpha = gather; ctx.fillStyle = S.glow; ctx.fillRect(S.x - R * 2, S.y - R * 2, R * 4, R * 4); }
        for (var sb = 0; sb < sphereBins.length; sb++) sphereBins[sb].length = 0;
        for (var p = 0; p < pts.length; p++) {
          var P = pts[p], x1 = P.x * cs - P.z * sn, z1 = P.x * sn + P.z * cs, y1 = P.y * ct - z1 * st, z2 = P.y * st + z1 * ct;
          var f = 2.8 / (2.8 + z2), tx = S.x + x1 * R * f, ty = S.y + y1 * R * f;
          var x = P.sx + (tx - P.sx) * gather, y = P.sy + (ty - P.sy) * gather, sz = (1.2 + 0.6 * f) * (1.5 - 0.5 * gather);
          sphereBins[P.hk * DEPTHS + Math.round(clamp((1.4 - z2) / 2.4, 0, 1) * (DEPTHS - 1))].push(x - sz / 2, y - sz / 2, sz);
        }
        ctx.globalAlpha = 0.75 + 0.25 * gather;
        for (sb = 0; sb < sphereBins.length; sb++) {
          var bin = sphereBins[sb];
          if (!bin.length) continue;
          ctx.fillStyle = SPHERE_STYLE[sb]; ctx.beginPath();
          for (var q = 0; q < bin.length; q += 3) ctx.rect(bin[q], bin[q + 1], bin[q + 2], bin[q + 2]);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        var srcA = clamp((t - 0.8) / 0.5, 0, 1) * fadeOut;
        if (srcA > 0) netLabel(ctx, NET_LABELS.src, S.x, S.y + R + 26, srcA, false);

        // stage nodes appear as their first link arrives
        ['m1', 'm2', 'm3'].forEach(function (k, i) {
          drawNode(ctx, nodes[k], clamp((t - (1.8 + i * 0.2)) / 0.35, 0, 1) * fadeOut, NET_LABELS[k]);
        });

        // business outcomes: node lands, then a ring closes around it with three orbiting signals
        var O = nodes.out, outA = clamp((t - 4.1) / 0.4, 0, 1) * fadeOut, ring = ease((t - 4.4) / 1.4) * fadeOut;
        if (ring > 0) {
          var rr = w < 600 ? 30 : 40;
          ctx.strokeStyle = 'rgba(234,179,8,' + (0.7 * ring).toFixed(3) + ')'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(O.x, O.y, rr, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); ctx.stroke();
          ctx.strokeStyle = 'rgba(147,197,253,' + (0.18 * ring).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(O.x, O.y, rr * 1.55, 0, Math.PI * 2); ctx.stroke();
          for (var o = 0; o < 3; o++) {
            var an = spin * 1.5 + o * (Math.PI * 2 / 3);
            ctx.fillStyle = rgba([BLUE, GREEN, YELLOW][o], ring);
            ctx.beginPath(); ctx.arc(O.x + Math.cos(an) * rr * 1.55, O.y + Math.sin(an) * rr * 1.55, 3, 0, Math.PI * 2); ctx.fill();
          }
        }
        drawNode(ctx, O, outA, null);
        if (outA > 0) netLabel(ctx, NET_LABELS.out, O.x, O.y + (w < 600 ? 30 : 40) * 1.55 + 22, outA, true);
      }
    });
  });

  /* ---------- 3. Contour field (marching squares) behind the closing call to action ---------- */
  $$('canvas.contours').forEach(function (canvas) {
    var CELLS = 64, LINE_SCALE = 3.4, LINE_COUNT = 3, WAVE = 0.37, SPEED = 1.1, v = null;
    function field(x, y, t) {
      var f = Math.sin(x + t * 0.6) * 0.5 + Math.sin(y * 0.85 - t * 0.45) * 0.45 +
        Math.sin((x + y) * 0.65 + t * 0.35) * 0.35 + Math.sin((x - y) * 0.95 - t * 0.55) * 0.25;
      return f * 0.5 + 0.5;
    }
    stage(canvas, {
      stillTime: 0,
      every: 40, // ~25fps is plenty for slow contours
      resize: function () {},
      frame: function (ctx, w, h, ms) {
        var t = (ms / 1000) * SPEED;
        var cols = w >= h ? CELLS : Math.max(8, Math.round((CELLS * w) / h)), rows = Math.max(8, Math.round((cols * h) / w));
        var sx = w / cols, sy = h / rows, aspect = w / h, n = (cols + 1) * (rows + 1);
        if (!v || v.length < n) v = new Float32Array(n);
        for (var j = 0; j <= rows; j++) for (var i = 0; i <= cols; i++) {
          var nx = ((i / cols) * 2 - 1) * aspect * LINE_SCALE, ny = ((j / rows) * 2 - 1) * LINE_SCALE;
          var qx = nx + Math.sin(ny * 0.8 + t * 0.7) * WAVE, qy = ny + Math.cos(nx * 0.7 - t * 0.6) * WAVE;
          v[j * (cols + 1) + i] = field(qx, qy, t) * LINE_COUNT;
        }
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(147,197,253,0.16)'; ctx.lineWidth = 1; ctx.beginPath();
        function seg(x1, y1, x2, y2) { ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); }
        for (var level = 0.5; level < LINE_COUNT; level += 1)
          for (var jj = 0; jj < rows; jj++) for (var ii = 0; ii < cols; ii++) {
            var a = v[jj * (cols + 1) + ii], b = v[jj * (cols + 1) + ii + 1], c = v[(jj + 1) * (cols + 1) + ii + 1], d = v[(jj + 1) * (cols + 1) + ii];
            var k = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
            if (k === 0 || k === 15) continue;
            var x0 = ii * sx, y0 = jj * sy;
            // edge crossings as scalars (top = tx,y0; right = rx,ry; bottom = bx,by; left = x0,ly): no arrays per cell
            var tx = x0 + sx * ((level - a) / (b - a)), rx = x0 + sx, ry = y0 + sy * ((level - b) / (c - b));
            var bx = x0 + sx * ((level - d) / (c - d)), by = y0 + sy, ly = y0 + sy * ((level - a) / (d - a));
            switch (k) {
              case 1: case 14: seg(x0, ly, bx, by); break;
              case 2: case 13: seg(bx, by, rx, ry); break;
              case 3: case 12: seg(x0, ly, rx, ry); break;
              case 4: case 11: seg(tx, y0, rx, ry); break;
              case 6: case 9: seg(tx, y0, bx, by); break;
              case 7: case 8: seg(x0, ly, tx, y0); break;
              case 5: seg(x0, ly, tx, y0); seg(bx, by, rx, ry); break;
              case 10: seg(x0, ly, bx, by); seg(tx, y0, rx, ry); break;
            }
          }
        ctx.stroke();
      }
    });
  });

  /* ---------- 3b. Seams: an array of rounded blocks carrying one section's ground into the next,
     dissolving as the section rises (after KIMI's chequered seam, redrawn in O3M's block geometry). ---------- */
  var ACCENTS = [BLUE, GREEN, YELLOW];
  /* Layout cache for the scroll handlers below: element positions are kept document-relative and re-measured only when
     layout changes (body ResizeObserver, resize, canvas resize), and scrollY is taken from the scroll event, so the rAF
     handlers never read layout after another module's style writes in the same frame (a forced style recalc). */
  var sy = 0, vh = 800, layoutDirty = true, onLayout = [], hasRO = typeof ResizeObserver !== 'undefined';
  function fresh() { if (layoutDirty || !hasRO) { layoutDirty = false; sy = window.scrollY; vh = window.innerHeight || 800; onLayout.forEach(function (f) { f(); }); } }
  function dirty() { layoutDirty = true; }
  window.addEventListener('scroll', function () { sy = window.scrollY; }, { passive: true });
  window.addEventListener('resize', dirty, { passive: true });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', dirty, { passive: true }); // innerHeight follows pinch-zoom
  if (hasRO) new ResizeObserver(function () { layoutDirty = true; fresh(); }).observe(document.body);
  function hash(x, y) {
    var hh = Math.imul(x, 374761393) + Math.imul(y, 668265263);
    hh = Math.imul(hh ^ (hh >>> 13), 1274126177);
    return ((hh ^ (hh >>> 16)) >>> 0) / 4294967295;
  }
  function roundRect(ctx, x, y, s, r) {
    ctx.moveTo(x + r, y); ctx.arcTo(x + s, y, x + s, y + s, r); ctx.arcTo(x + s, y + s, x, y + s, r);
    ctx.arcTo(x, y + s, x, y, r); ctx.arcTo(x, y, x + s, y, r); ctx.closePath();
  }
  var seams = $$('canvas.seam').map(function (canvas) {
    var ctx = canvas.getContext('2d'), carry = canvas.getAttribute('data-carry') || '#FFFFFF';
    var host = canvas.parentNode, w = 0, h = 0, last = -1, hostTop = 0, hostH = 0;
    onLayout.push(function () { var b = host.getBoundingClientRect(); hostTop = b.top + sy; hostH = b.height; });
    function draw(progress) {
      var CELL = w < 700 ? 18 : 24, GAP = 3, SOLID = 0.16, LIFT = 1.6;
      ctx.clearRect(0, 0, w, h);
      var cols = Math.ceil(w / CELL), rows = Math.ceil(h / CELL), lift = progress * LIFT;
      // the block that touches the section above stays solid so there is no hairline between them
      ctx.fillStyle = carry; ctx.fillRect(0, 0, w, Math.max(0, (SOLID - lift) * h));
      var solidPath = new Path2D(), accentPaths = [new Path2D(), new Path2D(), new Path2D()];
      for (var y = 0; y < rows; y++) {
        var depth = y / Math.max(1, rows - 1) + lift;
        if (depth > 1) break;
        var solid = depth <= SOLID, fade = clamp(1 - (depth - SOLID) / (1 - SOLID), 0, 1);
        for (var x = 0; x < cols; x++) {
          if (!solid && (hash(x, y) > fade || (x + y) % 2)) continue;
          var path = solidPath;
          if (!solid && hash(x + 101, y + 57) < 0.05) path = accentPaths[(hash(x + 7, y + 3) * 3) | 0];
          var shrink = solid ? 0 : (1 - fade) * CELL * 0.18;
          roundRect(path, x * CELL + GAP / 2 + shrink, y * CELL + GAP / 2 + shrink, CELL - GAP - shrink * 2, 5);
        }
      }
      ctx.fillStyle = carry; ctx.fill(solidPath);
      accentPaths.forEach(function (p, i) { ctx.fillStyle = rgba(ACCENTS[i], 0.9); ctx.fill(p); });
    }
    function size(cw, ch) {
      w = Math.max(1, Math.round(cw)); h = Math.max(1, Math.round(ch));
      canvas.width = Math.round(w * DPR); canvas.height = Math.round(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      last = -1; layoutDirty = true; update();
    }
    function update() {
      fresh();
      var top = hostTop - sy, r = { top: top, bottom: top + hostH };
      if (!reduced && (r.bottom < -50 || r.top > vh + 50)) return;
      var p = reduced ? 0.15 : clamp(1 - r.top / vh, 0, 1);
      if (Math.abs(p - last) < 0.002) return;
      last = p; draw(p);
    }
    if (!ctx) return null;
    // sized from the observer (after layout), not here, so script evaluation never forces a layout
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(function (en) { size(en[0].contentRect.width, en[0].contentRect.height); }).observe(canvas);
    else requestAnimationFrame(function () { var r = canvas.getBoundingClientRect(); size(r.width, r.height); });
    return function () { if (w) update(); };
  }).filter(Boolean);
  if (seams.length && !reduced) {
    var seamTick = false;
    window.addEventListener('scroll', function () {
      if (seamTick) return; seamTick = true;
      requestAnimationFrame(function () { seamTick = false; seams.forEach(function (u) { u(); }); });
    }, { passive: true });
  }

  /* ---------- 3c. "Why campaigns underperform": the written list follows the video ----------
     Statement n is on screen from about n s to n+1 s; 7-9.4 s is the reconnected chain. The list
     stays fully readable; this only marks which point the animation is showing. */
  var whyVideo = document.getElementById('why-video'), probList = document.querySelector('.prob-list');
  if (whyVideo && probList) {
    var probs = $$('.prob', probList), vraf = 0, shown = -2, resolved = null;
    var follow = function () {
      vraf = 0;
      var t = whyVideo.currentTime || 0, idx = t >= 1.02 && t < 7 ? Math.floor(t - 0.02) - 1 : -1;
      var res = t >= 7.05 && t < 9.45;
      if (idx !== shown) { shown = idx; probs.forEach(function (p, i) { p.classList.toggle('live', i === idx); }); }
      if (res !== resolved) { resolved = res; probList.classList.toggle('resolved', res); }
      if (!whyVideo.paused) vraf = requestAnimationFrame(follow);
    };
    whyVideo.addEventListener('play', function () { if (!vraf) vraf = requestAnimationFrame(follow); });
    whyVideo.addEventListener('seeked', follow);
    if (!whyVideo.paused) vraf = requestAnimationFrame(follow);
  }

  /* ---------- 3d. Credibility strip: Glass Architecture V2 ----------
     Adapted from the approved responsive-demo.html: one <video>, its src set for the active breakpoint only (desktop
     >=1200px, tablet 768-1199px, mobile <768px), swapped when a breakpoint is crossed (resuming at the same time; the
     three versions share one timeline). Nothing loads until the strip is near the viewport, nothing loads with reduced
     motion (the CSS poster stays), and playback pauses off screen or in a background tab. */
  var credGlass = document.querySelector('.cred-glass');
  if (credGlass && window.matchMedia) (function () {
    var vid = credGlass.querySelector('.cred-glass-video');
    var rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    var base = '/assets/media/o3m-glass-architecture-v2/o3m-glass-';
    var bps = [['desktop', window.matchMedia('(min-width: 1200px)')], ['tablet', window.matchMedia('(min-width: 768px)')]]; // else mobile; same cascade as the CSS, so no width falls between
    var current = null, near = typeof IntersectionObserver === 'undefined', onScreen = near;
    var pick = function () { for (var i = 0; i < bps.length; i++) if (bps[i][1].matches) return bps[i][0]; return 'mobile'; };
    var play = function () {
      if (!onScreen || document.hidden || !current) return;
      var p = vid.play();
      if (p && p.catch) p.catch(function () {}); // autoplay refused: the poster stays visible
    };
    var apply = function () {
      if (rm.matches) {
        if (current) { vid.pause(); vid.removeAttribute('src'); vid.load(); current = null; }
        return;
      }
      if (!near) return;
      var name = pick();
      if (name === current) { play(); return; }
      var at = current ? vid.currentTime : 0;
      current = name;
      credGlass.classList.remove('no-video');
      vid.poster = base + name + '-poster.jpg';
      vid.src = base + name + '-20s.mp4'; // replaces the previous source, so only one video is ever loading
      if (at) vid.addEventListener('loadedmetadata', function () { if (at < vid.duration) vid.currentTime = at; }, { once: true });
      play();
    };
    vid.addEventListener('error', function () { if (current) credGlass.classList.add('no-video'); });
    bps.forEach(function (b) { if (b[1].addEventListener) b[1].addEventListener('change', apply); else b[1].addListener(apply); });
    if (rm.addEventListener) rm.addEventListener('change', apply); else rm.addListener(apply);
    document.addEventListener('visibilitychange', function () { if (document.hidden) vid.pause(); else play(); });
    if (!near) {
      new IntersectionObserver(function (entries) {
        var hit = entries[entries.length - 1];
        onScreen = hit.isIntersecting;
        if (onScreen && !near) { near = true; apply(); }
        else if (onScreen) play();
        else vid.pause();
      }, { rootMargin: '200px 0px' }).observe(credGlass);
    }
    apply();
  })();

  if (reduced) {
    // Static end states only: full progress bars, nothing else moves.
    $$('.steps .card').forEach(function (c) { c.style.setProperty('--fill', '1'); });
    var stepsEl = document.querySelector('.steps');
    if (stepsEl) stepsEl.style.setProperty('--line', '1');
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
    // The headline must never stay hidden, even if the observer never reports (e.g. a background tab).
    setTimeout(function () { $$('.hero-title, .ty-card h1').forEach(function (h) { h.classList.add('words-in'); }); }, 2500);
  } else heads.forEach(function (h) { h.classList.add('words-in'); });

  /* ---------- 5. Scroll-linked progress: page marker and the approach cards' signal bars ---------- */
  var bar = document.querySelector('.scroll-progress span');
  var stepCards = $$('.steps .card'), steps = document.querySelector('.steps');
  var ticking = false, lastBar = '', lastLine = '', lastFill = [], stepsTop = 0, stepsH = 0;
  onLayout.push(function () { if (steps) { var b = steps.getBoundingClientRect(); stepsTop = b.top + sy; stepsH = b.height; } });
  function onScroll() {
    ticking = false;
    // the steps position and the viewport height come from the layout cache; scrollHeight stays a live read because
    // transformed content can change the scrollable overflow without any element resizing
    fresh();
    var max = bar ? document.documentElement.scrollHeight - vh : 0;
    var r = steps && stepCards.length ? { top: stepsTop - sy, height: stepsH } : null;
    // unchanged values are not rewritten: each custom property write restyles the element's subtree
    if (bar) {
      var tf = 'scaleX(' + (max > 0 ? clamp(sy / max, 0, 1) : 0).toFixed(4) + ')';
      if (tf !== lastBar) { lastBar = tf; bar.style.transform = tf; }
    }
    if (r) {
      var p = clamp((vh * 0.9 - r.top) / (r.height + vh * 0.35), 0, 1) * stepCards.length;
      stepCards.forEach(function (c, i) {
        var f = clamp(p - i, 0, 1).toFixed(3);
        if (f !== lastFill[i]) { lastFill[i] = f; c.style.setProperty('--fill', f); }
      });
      var ln = clamp(p / stepCards.length * 1.15, 0, 1).toFixed(3);
      if (ln !== lastLine) { lastLine = ln; steps.style.setProperty('--line', ln); }
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req, { passive: true });
  req(); // first pass on the next frame rather than a forced layout while this script evaluates

  /* ---------- 6. Pointer spotlight and gentle tilt on cards (fine pointers only) ---------- */
  if (fine) {
    $$('.card, .aud article, .svc-card, .why-video, .adflux, .ty-card').forEach(function (el) {
      el.classList.add('spot');
      var canTilt = !el.matches('.svc-card, .adflux, .ty-card, .why-card'); // why-cards lift in CSS instead
      // pointermove can fire several times a frame; keep the latest position and read the rect once per frame
      var ex = 0, ey = 0, pr = 0;
      function paint() {
        pr = 0;
        var r = el.getBoundingClientRect(), x = (ex - r.left) / r.width, y = (ey - r.top) / r.height;
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        if (canTilt && (!el.hasAttribute('data-reveal') || el.hasAttribute('data-in'))) {
          el.style.transition = 'transform .25s cubic-bezier(.2,.8,.2,1)';
          el.style.transform = 'perspective(1000px) rotateX(' + ((0.5 - y) * 4).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 5).toFixed(2) + 'deg) translateY(-3px)';
        }
      }
      el.addEventListener('pointermove', function (e) { ex = e.clientX; ey = e.clientY; if (!pr) pr = requestAnimationFrame(paint); });
      el.addEventListener('pointerleave', function () {
        if (pr) { cancelAnimationFrame(pr); pr = 0; }
        if (!canTilt) return;
        el.style.transition = 'transform .6s cubic-bezier(.34,1.4,.5,1)';
        el.style.transform = '';
      });
    });

    /* ---------- 7. Magnetic primary calls to action ---------- */
    $$('.hero-copy .btn, .cta .btn, .ty-actions .btn').forEach(function (btn) {
      var ex = 0, ey = 0, pr = 0;
      function pull() {
        pr = 0;
        var r = btn.getBoundingClientRect();
        var dx = (ex - (r.left + r.width / 2)) / r.width, dy = (ey - (r.top + r.height / 2)) / r.height;
        btn.style.transition = 'transform .15s ease-out, background-color .15s ease';
        btn.style.transform = 'translate(' + (dx * 8).toFixed(1) + 'px,' + (dy * 6).toFixed(1) + 'px)';
      }
      btn.addEventListener('pointermove', function (e) { ex = e.clientX; ey = e.clientY; if (!pr) pr = requestAnimationFrame(pull); });
      btn.addEventListener('pointerleave', function () {
        if (pr) { cancelAnimationFrame(pr); pr = 0; }
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
