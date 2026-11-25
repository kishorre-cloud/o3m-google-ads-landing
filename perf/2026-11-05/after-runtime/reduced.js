// Reduced-motion sanity: no errors, still frames drawn, no canvas rAF loops.
const puppeteer = require('C:/Users/O3M/AppData/Local/Temp/claude/C--Users-O3M-AppData-Roaming-Claude-scratch-workspaces-36486a60-20e1-42f6-b19c-3d6b6180eae8-dcd112ef-59ba-45d8-9111-fc1ac01e3c65-scratch-2026-10-27-b7f2bc/cf0c8f4b-f137-4b7f-91c8-21d902649c45/scratchpad/qa/node_modules/puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  for (const w of [1440, 390]) {
    const page = await browser.newPage(), errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => m.type() === 'error' && errs.push(m.text()));
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]); await page.setViewport({ width: w, height: 900 });
    await page.goto('http://localhost:8000/google-ads-management/', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 1500));
    const px = await page.evaluate(() => [...document.querySelectorAll('canvas')].map(c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return c.className + ':' + n; }));
    console.log(w, 'errs', errs, px.join(' '));
    await page.close();
  }
  await browser.close();
})();
