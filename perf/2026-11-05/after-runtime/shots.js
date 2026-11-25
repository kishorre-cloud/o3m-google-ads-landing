// Before/after screenshots of hero and AdFlux, plus pointer moves to exercise the throttled handlers.
const puppeteer = require('C:/Users/O3M/AppData/Local/Temp/claude/C--Users-O3M-AppData-Roaming-Claude-scratch-workspaces-36486a60-20e1-42f6-b19c-3d6b6180eae8-dcd112ef-59ba-45d8-9111-fc1ac01e3c65-scratch-2026-10-27-b7f2bc/cf0c8f4b-f137-4b7f-91c8-21d902649c45/scratchpad/qa/node_modules/puppeteer-core');
const fs = require('fs'), path = require('path'), sleep = ms => new Promise(r => setTimeout(r, ms));
const BEFORE = process.argv[2];
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  for (const which of ['before', 'after']) {
    const page = await browser.newPage(), errs = []; await page.setViewport({ width: 1440, height: 900 });
    page.on('pageerror', e => errs.push(String(e))); page.on('console', m => m.type() === 'error' && errs.push(m.text()));
    await page.setRequestInterception(true);
    page.on('request', r => (which === 'before' && r.url().includes('motion.js')) ? r.respond({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(BEFORE, 'utf8') }) : r.continue());
    await page.goto('http://localhost:8000/google-ads-management/', { waitUntil: 'load' });
    for (let i = 0; i < 20; i++) { await page.mouse.move(700 + i * 20, 400 + i * 5); await sleep(30); }
    await sleep(2500);
    await page.screenshot({ path: path.join(__dirname, 'shot-hero-' + which + '.png') });
    await page.evaluate(() => document.querySelector('canvas.adflux-net').scrollIntoView({ block: 'center' }));
    await sleep(6500);
    const el = await page.$('canvas.adflux-net'); await el.screenshot({ path: path.join(__dirname, 'shot-adflux-' + which + '.png') });
    await page.evaluate(() => document.querySelector('.steps').scrollIntoView({ block: 'center' })); await sleep(400);
    const card = await page.$('.steps .card'); const b = await card.boundingBox();
    for (let i = 0; i < 10; i++) { await page.mouse.move(b.x + 20 + i * 10, b.y + 20 + i * 5); await sleep(20); }
    await sleep(300);
    const st = await page.evaluate(() => { const c = document.querySelector('.steps .card'); return [c.style.getPropertyValue('--mx'), c.style.transform, c.style.getPropertyValue('--fill'), document.getElementById('hero-svg').animationsPaused(), document.querySelector('.cred-video').paused]; });
    console.log(which, 'errs', errs, 'card', JSON.stringify(st));
    await page.close();
  }
  await browser.close();
})();
