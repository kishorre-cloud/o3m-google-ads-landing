// Pause one CSS animation by name at mid-page to find which off-screen animation keeps the main thread busy.
const puppeteer = require('C:/Users/O3M/AppData/Local/Temp/claude/C--Users-O3M-AppData-Roaming-Claude-scratch-workspaces-36486a60-20e1-42f6-b19c-3d6b6180eae8-dcd112ef-59ba-45d8-9111-fc1ac01e3c65-scratch-2026-10-27-b7f2bc/cf0c8f4b-f137-4b7f-91c8-21d902649c45/scratchpad/qa/node_modules/puppeteer-core');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const out = {};
  for (const pos of ['top', 'mid']) for (const keep of ['none', 'drift', 'crawl', 'ping']) {
    const page = await browser.newPage(); const cdp = await page.target().createCDPSession(); await cdp.send('Performance.enable');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:8000/google-ads-management/', { waitUntil: 'load' }); await sleep(3000);
    if (pos === 'mid') { await page.evaluate(() => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 2)); await sleep(1500); }
    // pause everything except the one CSS animation under test; stop canvases, SMIL and video too
    await page.evaluate(k => { document.getAnimations().forEach(a => { if (a.animationName !== k) a.pause(); }); document.querySelectorAll('canvas').forEach(c => c.style.display = 'none'); document.getElementById('hero-svg').pauseAnimations(); document.querySelectorAll('video').forEach(v => v.pause()); }, keep);
    await sleep(800);
    const g = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
    const a = await g(); await sleep(5000); const b = await g();
    out[pos + ':only-' + keep] = { taskMsPerS: +(((b.TaskDuration - a.TaskDuration) * 1000) / 5).toFixed(1), styleMsPerS: +(((b.RecalcStyleDuration - a.RecalcStyleDuration) * 1000) / 5).toFixed(1), stylePerS: (b.RecalcStyleCount - a.RecalcStyleCount) / 5 };
    console.log(pos + ':only-' + keep, JSON.stringify(out[pos + ':only-' + keep]));
    await page.close();
  }
  // video alone, off screen at top
  for (const pos of ['top', 'mid']) {
    const page = await browser.newPage(); const cdp = await page.target().createCDPSession(); await cdp.send('Performance.enable');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:8000/google-ads-management/', { waitUntil: 'load' }); await sleep(3000);
    if (pos === 'mid') { await page.evaluate(() => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 2)); await sleep(1500); }
    await page.evaluate(() => { document.getAnimations().forEach(a => a.pause()); document.querySelectorAll('canvas').forEach(c => c.style.display = 'none'); document.getElementById('hero-svg').pauseAnimations(); });
    await sleep(800);
    const g = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
    const f0 = await page.evaluate(() => document.querySelector('.cred-video').getVideoPlaybackQuality().totalVideoFrames);
    const a = await g(); await sleep(5000); const b = await g();
    const f1 = await page.evaluate(() => document.querySelector('.cred-video').getVideoPlaybackQuality().totalVideoFrames);
    console.log(pos + ':only-credVideo', JSON.stringify({ taskMsPerS: +(((b.TaskDuration - a.TaskDuration) * 1000) / 5).toFixed(1), decodedFramesPerS: (f1 - f0) / 5 }));
    await page.close();
  }
  await browser.close();
})();
