// Idle cost with each animated canvas centred in the viewport (desktop 1x, mobile 4x CPU throttle).
const puppeteer = require('C:/Users/O3M/AppData/Local/Temp/claude/C--Users-O3M-AppData-Roaming-Claude-scratch-workspaces-36486a60-20e1-42f6-b19c-3d6b6180eae8-dcd112ef-59ba-45d8-9111-fc1ac01e3c65-scratch-2026-10-27-b7f2bc/cf0c8f4b-f137-4b7f-91c8-21d902649c45/scratchpad/qa/node_modules/puppeteer-core');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  for (const [label, vp, thr] of [['desktop', { width: 1440, height: 900 }, 1], ['mobile4x', { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }, 4]]) {
    for (const sel of ['canvas.signal-field', 'canvas.adflux-net', 'canvas.contours']) for (const anims of ['on', 'cssPaused']) {
      const page = await browser.newPage(); const cdp = await page.target().createCDPSession(); await cdp.send('Performance.enable');
      await page.setViewport(vp); await cdp.send('Emulation.setCPUThrottlingRate', { rate: thr });
      await page.goto('http://localhost:8000/google-ads-management/', { waitUntil: 'load' }); await sleep(2500);
      await page.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), sel); await sleep(2500);
      if (anims === 'cssPaused') await page.evaluate(() => { document.getAnimations().forEach(a => a.pause()); const s = document.getElementById('hero-svg'); s.pauseAnimations(); });
      await sleep(500);
      const info = await page.evaluate(s => { const c = document.querySelector(s); return c.width + 'x' + c.height; }, sel);
      const g = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
      const a = await g(); await sleep(5000); const b = await g();
      const ps = n => +(((b[n] - a[n]) * 1000) / 5).toFixed(0);
      console.log(label, sel, 'bitmap=' + info, 'otherAnims=' + anims, JSON.stringify({ taskMsPerS: ps('TaskDuration'), scriptMsPerS: ps('ScriptDuration'), styleMsPerS: ps('RecalcStyleDuration'), layoutMsPerS: ps('LayoutDuration'), layoutsPerS: (b.LayoutCount - a.LayoutCount) / 5 }));
      await page.close();
    }
  }
  await browser.close();
})();
