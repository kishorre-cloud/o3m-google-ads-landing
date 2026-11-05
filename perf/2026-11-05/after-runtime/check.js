// Sanity + idle cost check for motion.js. Usage: node check.js <label>
const puppeteer = require('C:/Users/O3M/AppData/Local/Temp/claude/C--Users-O3M-AppData-Roaming-Claude-scratch-workspaces-36486a60-20e1-42f6-b19c-3d6b6180eae8-dcd112ef-59ba-45d8-9111-fc1ac01e3c65-scratch-2026-10-27-b7f2bc/cf0c8f4b-f137-4b7f-91c8-21d902649c45/scratchpad/qa/node_modules/puppeteer-core');
const fs = require('fs'), path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const label = process.argv[2] || 'run';
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const out = {};
  const vps = { desktop: [{ width: 1440, height: 900 }, 1], mobile4x: [{ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }, 4] };
  for (const [vl, [vp, thr]] of Object.entries(vps)) for (const pos of ['top', 'canvas.signal-field', 'canvas.adflux-net', 'canvas.contours']) {
    const page = await browser.newPage(); const errs = [];
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e)));
    const cdp = await page.target().createCDPSession(); await cdp.send('Performance.enable');
    await page.setViewport(vp); await cdp.send('Emulation.setCPUThrottlingRate', { rate: thr });
    await page.goto('http://localhost:8000/google-ads-management/', { waitUntil: 'load' }); await sleep(2500);
    if (pos !== 'top') { await page.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), pos); }
    await sleep(1500);
    const pix = pos === 'top' ? null : await page.evaluate(s => { const c = document.querySelector(s), x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return { bitmap: c.width + 'x' + c.height, nonBlank: n }; }, pos);
    const g = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
    const a = await g(); await sleep(5000); const b = await g();
    const ps = n => +(((b[n] - a[n]) * 1000) / 5).toFixed(0);
    const r = { taskMsPerS: ps('TaskDuration'), scriptMsPerS: ps('ScriptDuration'), styleMsPerS: ps('RecalcStyleDuration'), layoutMsPerS: ps('LayoutDuration'), layoutsPerS: (b.LayoutCount - a.LayoutCount) / 5, pix, errs };
    if (pos === 'top') r.heroPx = await page.evaluate(() => { const c = document.querySelector('canvas.signal-field'), x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return c.width + 'x' + c.height + ' nonBlank=' + n + ' smilPaused=' + document.getElementById('hero-svg').animationsPaused(); });
    out[vl + ' ' + pos] = r; console.log(vl, pos, JSON.stringify(r));
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'check-' + label + '.json'), JSON.stringify(out, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
