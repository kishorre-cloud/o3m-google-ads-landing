// Read-only runtime perf measurement for /google-ads-management/. Usage: node measure.js
const puppeteer = require('C:/Users/O3M/AppData/Local/Temp/claude/C--Users-O3M-AppData-Roaming-Claude-scratch-workspaces-36486a60-20e1-42f6-b19c-3d6b6180eae8-dcd112ef-59ba-45d8-9111-fc1ac01e3c65-scratch-2026-10-27-b7f2bc/cf0c8f4b-f137-4b7f-91c8-21d902649c45/scratchpad/qa/node_modules/puppeteer-core');
const fs = require('fs'), path = require('path');
const OUT = __dirname, URL = 'http://localhost:8000/google-ads-management/';
const CATS = ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.frame', 'v8.execute', 'blink.user_timing', 'loading'];
const sleep = ms => new Promise(r => setTimeout(r, ms));

// injected before page scripts: count rAF callbacks per source file, fps sampler, event timing
const INJECT = `(() => {
  const counts = {}; window.__raf = counts;
  const orig = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = function (cb) {
    const s = (new Error().stack || '').split('\\n')[2] || '';
    const m = s.match(/js\\/([a-z-]+\\.js):(\\d+)/); const k = m ? m[1] + ':' + m[2] : 'other';
    counts[k] = (counts[k] || 0) + 1; return orig(cb);
  };
  window.__frames = []; (function f(t) { window.__frames.push(t); orig(f); })(0);
  window.__ev = [];
  try { new PerformanceObserver(l => l.getEntries().forEach(e => window.__ev.push({ name: e.name, dur: e.duration, inDelay: e.processingStart - e.startTime, proc: e.processingEnd - e.processingStart, pres: e.startTime + e.duration - e.processingEnd, target: e.target && (e.target.id || e.target.className) }))).observe({ type: 'event', durationThreshold: 0, buffered: true }); } catch (x) {}
  window.__lt = [];
  try { new PerformanceObserver(l => l.getEntries().forEach(e => window.__lt.push({ start: e.startTime, dur: e.duration }))).observe({ type: 'longtask', buffered: true }); } catch (x) {}
})();`;

function analyze(file) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8')); const ev = raw.traceEvents || raw;
  const names = {}; ev.filter(e => e.ph === 'M' && e.name === 'thread_name').forEach(e => names[e.pid + ':' + e.tid] = e.args.name);
  const perThread = {}; ev.forEach(e => { const k = e.pid + ':' + e.tid; if (names[k] === 'CrRendererMain') perThread[k] = (perThread[k] || 0) + 1; });
  const main = Object.keys(perThread).sort((a, b) => perThread[b] - perThread[a])[0];
  const M = ev.filter(e => e.pid + ':' + e.tid === main && e.ph === 'X' && e.dur != null);
  const t0 = Math.min(...M.map(e => e.ts)), t1 = Math.max(...M.map(e => e.ts + e.dur)), span = (t1 - t0) / 1e3;
  const sum = n => M.filter(e => n.includes(e.name)).reduce((a, e) => a + e.dur, 0) / 1e3;
  const urlOf = e => { const d = e.args && (e.args.data || e.args.beginData) || {}; let u = d.url || (d.stackTrace && d.stackTrace[0] && d.stackTrace[0].url) || ''; return u.split('/').pop() || '(no url)'; };
  const byFile = {};
  const calls = M.filter(e => e.name === 'FunctionCall' || e.name === 'EvaluateScript' || e.name === 'v8.callFunction');
  calls.filter(e => e.name !== 'v8.callFunction').forEach(e => { const f = urlOf(e); byFile[f] = byFile[f] || { script: 0, forcedLayout: 0, forcedStyle: 0, n: 0 }; byFile[f].script += e.dur / 1e3; byFile[f].n++; });
  // forced reflow = Layout / UpdateLayoutTree nested inside a script call
  const forced = [];
  const lay = M.filter(e => e.name === 'Layout' || e.name === 'UpdateLayoutTree');
  const sortedCalls = calls.filter(e => e.name === 'FunctionCall').sort((a, b) => a.ts - b.ts);
  lay.forEach(l => {
    const c = sortedCalls.find(c => c.ts <= l.ts && c.ts + c.dur >= l.ts + l.dur);
    if (!c) return; const f = urlOf(c); byFile[f] = byFile[f] || { script: 0, forcedLayout: 0, forcedStyle: 0, n: 0 };
    if (l.name === 'Layout') byFile[f].forcedLayout += l.dur / 1e3; else byFile[f].forcedStyle += l.dur / 1e3;
    const st = (l.args.beginData && l.args.beginData.stackTrace) || (l.args.data && l.args.data.stackTrace) || [];
    forced.push({ kind: l.name, ms: +(l.dur / 1e3).toFixed(2), at: st.slice(0, 2).map(s => (s.url || '').split('/').pop() + ':' + (s.lineNumber + 1) + ' ' + s.functionName).join(' < ') || f });
  });
  const forcedAgg = {}; forced.forEach(x => { const k = x.kind + ' @ ' + x.at; forcedAgg[k] = forcedAgg[k] || { n: 0, ms: 0 }; forcedAgg[k].n++; forcedAgg[k].ms += x.ms; });
  const tasks = M.filter(e => e.name === 'RunTask' || e.name === 'ThreadControllerImpl::RunTask');
  const long = tasks.filter(e => e.dur > 50e3).map(t => {
    const inner = M.filter(e => e.ts >= t.ts && e.ts + e.dur <= t.ts + t.dur && e !== t);
    const top = {}; inner.forEach(e => { const k = e.name === 'FunctionCall' || e.name === 'EvaluateScript' ? e.name + ':' + urlOf(e) : e.name; top[k] = (top[k] || 0) + e.dur / 1e3; });
    return { ms: +(t.dur / 1e3).toFixed(1), at: +((t.ts - t0) / 1e3).toFixed(0), top: Object.entries(top).filter(([k]) => !/RunTask|ThreadController|ProfileCall/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => k + '=' + v.toFixed(1)) };
  });
  const all = ev.filter(e => e.ph === 'X' || e.ph === 'I' || e.ph === 'i' || e.ph === 'n' || e.ph === 'b');
  const drawFrames = ev.filter(e => e.name === 'DrawFrame').length, dropped = ev.filter(e => e.name === 'DroppedFrame').length;
  const raster = ev.filter(e => e.name === 'RasterTask' && e.dur).reduce((a, e) => a + e.dur, 0) / 1e3;
  const gpu = ev.filter(e => (e.name === 'GPUTask') && e.dur).reduce((a, e) => a + e.dur, 0) / 1e3;
  return {
    spanMs: +span.toFixed(0),
    mainBusyMs: +(tasks.reduce((a, e) => a + e.dur, 0) / 1e3).toFixed(0),
    scriptingMs: +sum(['FunctionCall', 'EvaluateScript', 'v8.compile', 'TimerFire', 'FireAnimationFrame', 'EventDispatch']).toFixed(0),
    styleMs: +sum(['UpdateLayoutTree']).toFixed(0), layoutMs: +sum(['Layout']).toFixed(0),
    prePaintMs: +sum(['PrePaint']).toFixed(0), paintMs: +sum(['Paint']).toFixed(0), layerizeMs: +sum(['Layerize', 'UpdateLayer', 'CompositeLayers', 'Commit']).toFixed(0),
    rasterMs: +raster.toFixed(0), gpuMs: +gpu.toFixed(0),
    layoutCount: M.filter(e => e.name === 'Layout').length, styleCount: M.filter(e => e.name === 'UpdateLayoutTree').length, paintCount: M.filter(e => e.name === 'Paint').length,
    drawFrames, droppedFrames: dropped, drawFps: +(drawFrames / (span / 1000)).toFixed(1),
    byFile: Object.fromEntries(Object.entries(byFile).map(([k, v]) => [k, { scriptMs: +v.script.toFixed(1), calls: v.n, forcedLayoutMs: +v.forcedLayout.toFixed(1), forcedStyleMs: +v.forcedStyle.toFixed(1) }])),
    longTasks: long.length, longTop: long.sort((a, b) => b.ms - a.ms).slice(0, 6),
    forcedReflows: Object.entries(forcedAgg).sort((a, b) => b[1].ms - a[1].ms).slice(0, 10).map(([k, v]) => ({ k, n: v.n, ms: +v.ms.toFixed(1) }))
  };
}

async function fpsStats(page, fromIdx) {
  return page.evaluate(i => {
    const f = window.__frames.slice(i).filter(Boolean); if (f.length < 3) return null;
    const d = []; for (let k = 1; k < f.length; k++) d.push(f[k] - f[k - 1]); d.sort((a, b) => a - b);
    const secs = (f[f.length - 1] - f[0]) / 1000;
    return { fps: +(d.length / secs).toFixed(1), p50: +d[d.length >> 1].toFixed(1), p95: +d[Math.floor(d.length * 0.95)].toFixed(1), max: +d[d.length - 1].toFixed(1), over50ms: d.filter(x => x > 50).length };
  }, fromIdx);
}

async function metrics(cdp) { const m = (await cdp.send('Performance.getMetrics')).metrics; return Object.fromEntries(m.map(x => [x.name, x.value])); }
function mdelta(a, b, secs) {
  const k = ['TaskDuration', 'ScriptDuration', 'LayoutDuration', 'RecalcStyleDuration'], c = ['LayoutCount', 'RecalcStyleCount'];
  const o = {}; k.forEach(n => o[n.replace('Duration', 'Ms/s')] = +(((b[n] - a[n]) * 1000) / secs).toFixed(1)); c.forEach(n => o[n + '/s'] = +((b[n] - a[n]) / secs).toFixed(1)); return o;
}

async function videos(page) {
  return page.evaluate(() => [...document.querySelectorAll('video')].map(v => { const r = v.getBoundingClientRect(), q = v.getVideoPlaybackQuality ? v.getVideoPlaybackQuality() : {};
    return { id: v.id || v.className, paused: v.paused, t: +v.currentTime.toFixed(2), net: v.networkState, ready: v.readyState, src: (v.currentSrc || '').split('/').pop(), onScreen: r.bottom > 0 && r.top < innerHeight && r.width > 0, display: getComputedStyle(v).display, frames: q.totalVideoFrames }; }));
}

async function run(name, vp, throttle) {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--enable-gpu-rasterization'] });
  const page = await browser.newPage(); const cdp = await page.target().createCDPSession();
  await page.setViewport(vp.mobile ? { width: vp.w, height: vp.h, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } : { width: vp.w, height: vp.h, deviceScaleFactor: 1 });
  if (vp.mobile) await page.setUserAgent('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36');
  await cdp.send('Performance.enable'); if (throttle) await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
  await page.evaluateOnNewDocument(INJECT);
  const res = { name };
  // (a) load + idle 5s at top
  await page.tracing.start({ path: path.join(OUT, name + '-load.json'), categories: CATS });
  await page.goto(URL, { waitUntil: 'load' }); await sleep(5000);
  await page.tracing.stop(); res.load = analyze(path.join(OUT, name + '-load.json'));
  res.rafAfterLoad = await page.evaluate(() => ({ ...window.__raf }));
  // idle at top 10s
  let r0 = await page.evaluate(() => ({ ...window.__raf })), m0 = await metrics(cdp), f0 = await page.evaluate(() => window.__frames.length), v0 = await videos(page);
  await sleep(10000);
  let m1 = await metrics(cdp), r1 = await page.evaluate(() => ({ ...window.__raf })), v1 = await videos(page);
  res.idleTop = { ...mdelta(m0, m1, 10), rafPerSec: Object.fromEntries(Object.keys(r1).map(k => [k, +(((r1[k] || 0) - (r0[k] || 0)) / 10).toFixed(1)]).filter(x => x[1])), fps: await fpsStats(page, f0), videos: v0.map((v, i) => ({ ...v, framesDelta: v1[i].frames - v.frames, tDelta: +(v1[i].t - v.t).toFixed(2) })) };
  // (b) scroll whole page with wheel
  const f1 = await page.evaluate(() => window.__frames.length), evN = await page.evaluate(() => window.__lt.length);
  await page.mouse.move(vp.w / 2, vp.h / 2);
  await page.tracing.start({ path: path.join(OUT, name + '-scroll.json'), categories: CATS });
  const ms0 = await metrics(cdp), ts = Date.now();
  for (let i = 0; i < 400; i++) {
    await page.mouse.wheel({ deltaY: 100 }); await sleep(30);
    if (i % 10 === 0 && await page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2)) break;
  }
  await sleep(500);
  const ms1 = await metrics(cdp), secs = (Date.now() - ts) / 1000;
  await page.tracing.stop(); res.scroll = analyze(path.join(OUT, name + '-scroll.json'));
  res.scroll.cdp = mdelta(ms0, ms1, secs); res.scroll.secs = +secs.toFixed(1); res.scroll.fps = await fpsStats(page, f1);
  res.scroll.longTasksAPI = await page.evaluate(n => window.__lt.slice(n).map(x => +x.dur.toFixed(0)), evN);
  // idle at middle 10s
  await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 2)); await sleep(1500);
  r0 = await page.evaluate(() => ({ ...window.__raf })); m0 = await metrics(cdp); v0 = await videos(page); const f2 = await page.evaluate(() => window.__frames.length);
  const midInfo = await page.evaluate(() => [...document.querySelectorAll('canvas')].map(c => { const r = c.getBoundingClientRect(); return c.className + (r.bottom > -80 && r.top < innerHeight + 80 ? ':visible' : ':off'); }));
  await sleep(10000);
  m1 = await metrics(cdp); r1 = await page.evaluate(() => ({ ...window.__raf })); v1 = await videos(page);
  res.idleMid = { scrollY: await page.evaluate(() => scrollY), canvases: midInfo, ...mdelta(m0, m1, 10), rafPerSec: Object.fromEntries(Object.keys(r1).map(k => [k, +(((r1[k] || 0) - (r0[k] || 0)) / 10).toFixed(1)]).filter(x => x[1])), fps: await fpsStats(page, f2), videos: v0.map((v, i) => ({ ...v, framesDelta: v1[i].frames - v.frames, tDelta: +(v1[i].t - v.t).toFixed(2) })) };
  // hidden tab: does work stop?
  const p2 = await browser.newPage(); await p2.bringToFront(); m0 = await metrics(cdp); await sleep(4000); m1 = await metrics(cdp);
  res.hiddenTab = mdelta(m0, m1, 4); await p2.close(); await page.bringToFront();
  // (5) interactions -> event timing
  await page.evaluate(() => { window.__ev.length = 0; });
  const clickAndWait = async sel => { await page.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), sel); await sleep(700); await page.click(sel); await sleep(900); };
  await clickAndWait('.faqbtn'); await clickAndWait('.faqbtn');
  await clickAndWait('.tablist [role="tab"][data-svc="pmax"]'); await clickAndWait('.tablist [role="tab"][data-svc="yt"]');
  await clickAndWait('#f-submit');
  if (vp.mobile) { await page.evaluate(() => scrollTo(0, 0)); await sleep(500); await clickAndWait('#menu-btn'); }
  else { await page.evaluate(() => scrollTo(0, 0)); await sleep(500); await clickAndWait('#mm-btn'); }
  res.interactions = await page.evaluate(() => window.__ev.filter(e => /click|pointerup|pointerdown|keydown/.test(e.name)).map(e => ({ ...e, dur: Math.round(e.dur), inDelay: +e.inDelay.toFixed(1), proc: +e.proc.toFixed(1), pres: +e.pres.toFixed(1) })));
  await browser.close();
  fs.writeFileSync(path.join(OUT, name + '-results.json'), JSON.stringify(res, null, 1));
  return res;
}

(async () => {
  const which = process.argv[2] || 'all';
  if (which === 'all' || which === 'desktop') console.log(JSON.stringify(await run('desktop', { w: 1440, h: 900 }, 0), null, 1));
  if (which === 'all' || which === 'mobile') console.log(JSON.stringify(await run('mobile4x', { w: 390, h: 844, mobile: true }, 4), null, 1));
})().catch(e => { console.error(e); process.exit(1); });
