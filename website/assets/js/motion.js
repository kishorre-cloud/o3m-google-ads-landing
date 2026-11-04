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

  $$('canvas.signal-field').forEach(function (canvas) {
    var parts = [], rand = rng(2010), gather = canvas.hasAttribute('data-gather') && !reduced, blocks = [], gathered = false;
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
  $$('canvas.adflux-net').forEach(function (canvas) {
    var nodes = {}, links = [], pts = [], dots = [], vertical = false, R = 40;
    function link(a, b, dir, rgbA, rgbB, start) {
      var A = nodes[a], B = nodes[b], k = 0.42;
      var p1 = dir === 'h' ? [A.x + (B.x - A.x) * k, A.y] : [A.x, A.y + (B.y - A.y) * k];
      var p2 = dir === 'h' ? [B.x - (B.x - A.x) * k, B.y] : [B.x, B.y - (B.y - A.y) * k];
      var l = { p0: [A.x, A.y], p1: p1, p2: p2, p3: [B.x, B.y], a: rgbA, b: rgbB, start: start, to: b, samples: [] };
      for (var i = 0; i <= 28; i++) l.samples.push(bez(l, i / 28));
      links.push(l);
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
    }
    function build(w, h) {
      var n = w < 600 ? 150 : 280, rand = rng(4242), golden = Math.PI * (3 - Math.sqrt(5));
      pts = [];
      for (var i = 0; i < n; i++) {
        var y = 1 - (i / (n - 1)) * 2, rad = Math.sqrt(1 - y * y), th = golden * i;
        pts.push({ x: Math.cos(th) * rad, y: y, z: Math.sin(th) * rad, sx: rand() * w, sy: rand() * h, hue: rand() * 0.55 });
      }
      // a quiet dot grid across the whole panel floor, so the full width reads as one field
      dots = [];
      var step = w < 600 ? 26 : 30;
      for (var gx = step / 2; gx < w; gx += step) for (var gy = step / 2; gy < h; gy += step) dots.push([gx, gy]);
    }
    function drawLink(ctx, l, prog, alpha) {
      if (prog <= 0 || alpha <= 0) return;
      prog = Math.min(prog, 1);
      var last = Math.max(1, Math.round(prog * 28)), g = ctx.createLinearGradient(l.p0[0], l.p0[1], l.p3[0], l.p3[1]);
      g.addColorStop(0, rgba(l.a, 0.55 * alpha)); g.addColorStop(1, rgba(l.b, 0.55 * alpha));
      ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.beginPath();
      ctx.moveTo(l.samples[0][0], l.samples[0][1]);
      for (var i = 1; i <= last; i++) ctx.lineTo(l.samples[i][0], l.samples[i][1]);
      ctx.stroke();
    }
    function drawNode(ctx, nd, size, a, label) {
      if (a <= 0) return;
      var glow = ctx.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, size * 2.6);
      glow.addColorStop(0, rgba(nd.rgb, 0.35 * a)); glow.addColorStop(1, rgba(nd.rgb, 0));
      ctx.fillStyle = glow; ctx.fillRect(nd.x - size * 3, nd.y - size * 3, size * 6, size * 6);
      var s = size * (0.6 + 0.4 * a);
      ctx.save(); ctx.translate(nd.x, nd.y); ctx.rotate(-0.1);
      ctx.fillStyle = rgba(nd.rgb, a); ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-s / 2, -s / 2, s, s, s * 0.26); else ctx.rect(-s / 2, -s / 2, s, s);
      ctx.fill(); ctx.restore();
      if (label) netLabel(ctx, label, nd.x, nd.y + size / 2 + 18, a, false);
    }
    stage(canvas, {
      stillTime: 7600,
      resize: function (ctx, w, h) { layout(w, h); build(w, h); },
      frame: function (ctx, w, h, ms) {
        var t = (ms / 1000) % LOOP;
        var fadeOut = 1 - clamp((t - 9.3) / 0.6, 0, 1);            // network dims before the loop restarts
        var gather = ease(t / 1.2) * (1 - ease((t - 9.3) / 0.7));   // 0 scattered -> 1 sphere -> 0 scattered
        ctx.clearRect(0, 0, w, h);
        ctx.font = '600 ' + (w < 600 ? 11 : 12.5) + 'px "Plus Jakarta Sans", system-ui, sans-serif';
        ctx.textAlign = 'center';

        // floor grid: a slow wave of brightness travelling from the source towards the outcome
        for (var i = 0; i < dots.length; i++) {
          var d = dots[i], wv = Math.sin((vertical ? d[1] / h : d[0] / w) * 7 - t * (Math.PI * 2 / LOOP) * 2);
          ctx.fillStyle = 'rgba(147,197,253,' + (0.05 + 0.05 * Math.max(0, wv)).toFixed(3) + ')';
          ctx.fillRect(d[0] - 0.75, d[1] - 0.75, 1.5, 1.5);
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
        var glowS = ctx.createRadialGradient(S.x, S.y, 0, S.x, S.y, R * 1.7);
        glowS.addColorStop(0, 'rgba(37,99,235,' + (0.3 * gather).toFixed(3) + ')'); glowS.addColorStop(1, 'rgba(37,99,235,0)');
        ctx.fillStyle = glowS; ctx.fillRect(S.x - R * 2, S.y - R * 2, R * 4, R * 4);
        for (var p = 0; p < pts.length; p++) {
          var P = pts[p], x1 = P.x * cs - P.z * sn, z1 = P.x * sn + P.z * cs, y1 = P.y * ct - z1 * st, z2 = P.y * st + z1 * ct;
          var f = 2.8 / (2.8 + z2), tx = S.x + x1 * R * f, ty = S.y + y1 * R * f;
          var x = P.sx + (tx - P.sx) * gather, y = P.sy + (ty - P.sy) * gather, sz = (1.2 + 0.6 * f) * (1.5 - 0.5 * gather);
          ctx.fillStyle = rgba(journey(P.hue), (0.25 + 0.6 * clamp((1.4 - z2) / 2.4, 0, 1)) * (0.75 + 0.25 * gather));
          ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
        }
        var srcA = clamp((t - 0.8) / 0.5, 0, 1) * fadeOut;
        if (srcA > 0) netLabel(ctx, NET_LABELS.src, S.x, S.y + R + 26, srcA, false);

        // stage nodes appear as their first link arrives
        ['m1', 'm2', 'm3'].forEach(function (k, i) {
          drawNode(ctx, nodes[k], w < 600 ? 13 : 16, clamp((t - (1.8 + i * 0.2)) / 0.35, 0, 1) * fadeOut, NET_LABELS[k]);
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
        drawNode(ctx, O, w < 600 ? 18 : 24, outA, null);
        if (outA > 0) netLabel(ctx, NET_LABELS.out, O.x, O.y + (w < 600 ? 30 : 40) * 1.55 + 22, outA, true);
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

  /* ---------- 3b. Seams: an array of rounded blocks carrying one section's ground into the next,
     dissolving as the section rises (after KIMI's chequered seam, redrawn in O3M's block geometry). ---------- */
  var ACCENTS = [BLUE, GREEN, YELLOW];
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
    var host = canvas.parentNode, w = 0, h = 0, last = -1;
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
    function size() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width)); h = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(w * DPR); canvas.height = Math.round(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      last = -1; update();
    }
    function update() {
      var vh = window.innerHeight || 800, r = host.getBoundingClientRect();
      if (!reduced && (r.bottom < -50 || r.top > vh + 50)) return;
      var p = reduced ? 0.15 : clamp(1 - r.top / vh, 0, 1);
      if (Math.abs(p - last) < 0.002) return;
      last = p; draw(p);
    }
    if (!ctx) return null;
    size();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(size).observe(canvas);
    return update;
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

  /* ---------- 3d. Credibility strip video ----------
     The <source> only matches on wide screens without reduced motion (its media attribute), so phones never download
     it. Browsers choose a source once, so reload when the query starts matching, pause when it stops, and show the
     text list instead if the video can't load. */
  var credVid = document.querySelector('.cred-video'), credSrc = credVid && credVid.querySelector('source');
  if (credSrc && window.matchMedia) {
    var credBox = credVid.parentNode, credMq = window.matchMedia(credSrc.getAttribute('media'));
    credSrc.addEventListener('error', function () { if (credMq.matches) credBox.classList.add('no-video'); });
    if (credMq.matches && credVid.networkState === 3) credBox.classList.add('no-video'); // failed before this script ran
    var onCred = function () {
      if (!credMq.matches) { credVid.pause(); return; }
      credBox.classList.remove('no-video');
      if (credVid.networkState === 3) credVid.load(); // NETWORK_NO_SOURCE: nothing was picked at page load
      else { var pr = credVid.play(); if (pr && pr.catch) pr.catch(function () {}); }
    };
    if (credMq.addEventListener) credMq.addEventListener('change', onCred); else credMq.addListener(onCred);
  }

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
  var stepCards = $$('.steps .card'), steps = document.querySelector('.steps'), chainSteps = $$('#chain .step');
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
      steps.style.setProperty('--line', clamp(p / stepCards.length * 1.15, 0, 1).toFixed(3));
    }
    // chain: each step's lines drift at different rates around the screen's middle (depth, not scroll-jacking)
    for (var s = 0; s < chainSteps.length; s++) {
      var sr = chainSteps[s].getBoundingClientRect();
      if (sr.bottom < -100 || sr.top > vh + 100) continue;
      chainSteps[s].style.setProperty('--o', clamp((sr.top + sr.height / 2 - vh / 2) / (vh / 2), -1, 1).toFixed(3));
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
      var canTilt = !el.matches('.svc-card, .adflux, .ty-card, .why-card'); // why-cards lift in CSS instead
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
