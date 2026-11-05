// Attribute idle main-thread cost by switching off one source at a time (runtime DOM only; no project files touched).
const puppeteer = require('C:/Users/O3M/AppData/Local/Temp/claude/C--Users-O3M-AppData-Roaming-Claude-scratch-workspaces-36486a60-20e1-42f6-b19c-3d6b6180eae8-dcd112ef-59ba-45d8-9111-fc1ac01e3c65-scratch-2026-10-27-b7f2bc/cf0c8f4b-f137-4b7f-91c8-21d902649c45/scratchpad/qa/node_modules/puppeteer-core');
const fs = require('fs'), path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const TOGGLES = {
  baseline: '0',
  credVideoPaused: `document.querySelector('.cred-video').pause()`,
  heroSmilPaused: `document.getElementById('hero-svg').pauseAnimations()`,
  cssAnimsPaused: `document.getAnimations().forEach(a => a.pause())`,
  signalFieldHidden: `document.querySelector('canvas.signal-field').style.visibility='hidden'; document.querySelector('canvas.signal-field').style.display='none'`,
  headerNoBackdrop: `document.querySelector('.site-header').style.backdropFilter='none'; document.querySelector('.site-header').style.webkitBackdropFilter='none'`,
  allOff: `document.querySelector('.cred-video').pause(); document.getElementById('hero-svg').pauseAnimations(); document.getAnimations().forEach(a => a.pause()); document.querySelectorAll('canvas').forEach(c => c.style.display='none'); document.querySelector('.site-header').style.backdropFilter='none'`
};
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const out = {};
  for (const pos of ['top', 'mid']) for (const [name, js] of Object.entries(TOGGLES)) {
    const page = await browser.newPage(); const cdp = await page.target().createCDPSession(); await cdp.send('Performance.enable');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:8000/google-ads-management/', { waitUntil: 'load' }); await sleep(3000);
    if (pos === 'mid') { await page.evaluate(() => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 2)); await sleep(1500); }
    await page.evaluate(js); await sleep(800);
    const g = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
    const a = await g(); await sleep(6000); const b = await g();
    const ps = n => +(((b[n] - a[n]) * 1000) / 6).toFixed(1);
    out[pos + ':' + name] = { taskMsPerS: ps('TaskDuration'), scriptMsPerS: ps('ScriptDuration'), styleMsPerS: ps('RecalcStyleDuration'), layoutMsPerS: ps('LayoutDuration'), stylePerS: +((b.RecalcStyleCount - a.RecalcStyleCount) / 6).toFixed(1), layoutPerS: +((b.LayoutCount - a.LayoutCount) / 6).toFixed(1) };
    if (name === 'baseline' && pos === 'mid') out.midView = await page.evaluate(() => { const e = document.elementFromPoint(innerWidth / 2, innerHeight / 2); const s = e && e.closest('section,[id]'); return s ? (s.id || s.className) : '?'; });
    if (name === 'baseline') out[pos + ':runningAnims'] = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').map(a => (a.animationName || a.constructor.name) + '@' + (a.effect && a.effect.target ? (a.effect.target.id || a.effect.target.className.baseVal || a.effect.target.className || a.effect.target.tagName) : '') + (a.effect && a.effect.pseudoElement || '')).reduce((m, k) => (m[k] = (m[k] || 0) + 1, m), {}));
    await page.close();
    console.error(pos, name, JSON.stringify(out[pos + ':' + name]));
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'attribute-idle-results.json'), JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
