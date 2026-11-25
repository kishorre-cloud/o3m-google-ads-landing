// Functional check of landing.js/o3m.css perf refactor. Usage: node verify.js
const puppeteer = require('C:/Users/O3M/AppData/Local/Temp/claude/C--Users-O3M-AppData-Roaming-Claude-scratch-workspaces-36486a60-20e1-42f6-b19c-3d6b6180eae8-dcd112ef-59ba-45d8-9111-fc1ac01e3c65-scratch-2026-10-27-b7f2bc/cf0c8f4b-f137-4b7f-91c8-21d902649c45/scratchpad/qa/node_modules/puppeteer-core');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const out = {};
  for (const [name, w, h, mob] of [['desktop', 1440, 900, false], ['mobile', 390, 844, true]]) {
    const page = await b.newPage(); const errs = [];
    page.on('console', m => m.type() === 'error' && errs.push(m.text())); page.on('pageerror', e => errs.push(String(e)));
    await page.setViewport({ width: w, height: h, isMobile: mob, hasTouch: mob });
    await page.goto('http://localhost:8000/google-ads-management/', { waitUntil: 'networkidle0' }); await sleep(800);
    const state = () => page.evaluate(() => {
      const c = document.getElementById('chain'), hero = document.getElementById('hero');
      const ring = getComputedStyle(document.querySelector('#chain .rnode.on'), '::before');
      const cr = getComputedStyle(c, '::before');
      const t = document.querySelector('.track').getBoundingClientRect(), m = document.querySelector('.track-mark').getBoundingClientRect();
      const cp = parseFloat(getComputedStyle(c).getPropertyValue('--cp'));
      return { inView: c.classList.contains('in-view'), ringPlay: ring.animationPlayState, ringName: ring.animationName, ringOpacity: ring.opacity,
        crawlPlay: cr.animationPlayState, p: hero.style.getPropertyValue('--p'), cp,
        markCenterErr: t.height ? +((m.top + m.height / 2) - (t.top + cp * t.height)).toFixed(2) : null,
        video: (v => v && { preload: v.preload, paused: v.paused, autoplayAttr: v.hasAttribute('autoplay') })(document.getElementById('why-video')) };
    });
    const top = await state();
    await page.evaluate(() => document.getElementById('chain').scrollIntoView()); await sleep(700);
    await page.evaluate(() => scrollBy(0, innerHeight * 0.6)); await sleep(700);
    const mid = await state();
    await page.screenshot({ path: __dirname + '/chain-' + name + '.png' });
    await page.evaluate(() => scrollBy(0, innerHeight * 0.8)); await sleep(700);
    const mid2 = await state();
    await page.evaluate(() => document.getElementById('why-video') && document.getElementById('why-video').scrollIntoView({ block: 'center' })); await sleep(1200);
    const vid = await state();
    out[name] = { top, mid, mid2, vid, errs };
    await page.close();
  }
  await b.close(); console.log(JSON.stringify(out, null, 1));
})();
