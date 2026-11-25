// Forced (script-initiated) layouts from motion.js during load; 'before' serves the pre-refactor copy via interception.
const puppeteer = require('C:/Users/O3M/AppData/Local/Temp/claude/C--Users-O3M-AppData-Roaming-Claude-scratch-workspaces-36486a60-20e1-42f6-b19c-3d6b6180eae8-dcd112ef-59ba-45d8-9111-fc1ac01e3c65-scratch-2026-10-27-b7f2bc/cf0c8f4b-f137-4b7f-91c8-21d902649c45/scratchpad/qa/node_modules/puppeteer-core');
const fs = require('fs'), path = require('path');
const BEFORE = process.argv[2];
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  for (const which of ['before', 'after']) {
    const page = await browser.newPage(); await page.setViewport({ width: 1440, height: 900 });
    await page.setRequestInterception(true);
    page.on('request', r => (which === 'before' && r.url().includes('motion.js')) ? r.respond({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(BEFORE, 'utf8') }) : r.continue());
    const file = path.join(__dirname, 'startup-' + which + '.json');
    await page.tracing.start({ path: file, categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline'] });
    await page.goto('http://localhost:8000/google-ads-management/', { waitUntil: 'load' }); await new Promise(r => setTimeout(r, 1500));
    await page.tracing.stop();
    const ev = JSON.parse(fs.readFileSync(file, 'utf8')).traceEvents;
    const lay = ev.filter(e => e.name === 'Layout' && e.ph === 'X');
    const forced = lay.filter(e => JSON.stringify(e.args).includes('motion.js'));
    const evalM = ev.filter(e => e.name === 'EvaluateScript' && JSON.stringify(e.args).includes('motion.js'));
    console.log(which, 'motion.js eval ms', evalM.map(e => (e.dur / 1e3).toFixed(1)).join(','), '| forced layouts from motion.js:', forced.length, 'total ms', (forced.reduce((a, e) => a + e.dur, 0) / 1e3).toFixed(1));
    fs.unlinkSync(file);
    await page.close();
  }
  await browser.close();
})();
