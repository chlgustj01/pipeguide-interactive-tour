// Run with the static server running: node tests/live-presentation.cjs
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.PIPEGUIDE_PRESENTATION_URL || (process.env.PIPEGUIDE_BASE_URL || 'http://127.0.0.1:8000') + '/presentation.html');
    if (process.env.PIPEGUIDE_OFFLINE) await page.context().setOffline(true);
    assert.equal(await page.locator('section.slide').count(), 22);
    assert.equal(await page.locator('.pg-live-launch').count(), 5);
    await page.evaluate(() => { PGSlides.go(6); document.querySelector('#live-mode').value = 'manual'; });
    await page.locator('section.slide.active .pg-live-launch').click();
    await page.waitForFunction(() => window.PGLive.api && PGGuide.state.step === 0 && !document.querySelector('#live-run').disabled);
    // A real iframe click must execute exactly once and advance the guide.
    const frame = await (await page.locator('#live-app').elementHandle()).contentFrame();
    await frame.locator('[data-dw="sample"]').click();
    await page.waitForFunction(() => PGGuide.state.index === 1 && !PGGuide.state.busy);
    await page.click('#live-pause');
    assert.equal(await page.evaluate(() => PGGuide.state.paused), true);
    await page.selectOption('#live-mode', 'free');
    assert.equal(await page.locator('#live-spot').isVisible(), false);
    await page.selectOption('#live-mode', 'manual');
    await page.evaluate(() => PGGuide.stop());
    const results = await page.evaluate(async () => {
      const api = PGLive.api, w = PGLive.frame.contentWindow;
      w.__presentationInstance = 'retained';
      const groups = [
        ['review', 'item', 'check', 'ready', 'confirmReady'],
        ['build', 'three', 'real', 'selectPipe', 'rotate', 'fit'],
        ['size', 'change', 'sync', 'applyModel'],
        ['generate', 'candidate', 'split', 'reviewRoute', 'applyRoute', 'confirmRoute'],
        ['send', 'replay', 'reviewNew', 'register', 'confirmNew']
      ];
      const out = [];
      for (let step = 0; step < groups.length; step++) {
        if (step) await api.enter(step);
        const before = api.summary();
        for (const action of groups[step]) await api.action(action);
        const after = api.summary();
        if (step === 2) {
          await api.restore(step);
          if (api.summary().dn !== before.dn) throw Error('STEP 03 restore failed');
          for (const action of groups[step]) await api.action(action);
        }
        out.push({ step, before, after });
      }
      if (w.__presentationInstance !== 'retained') throw Error('iframe instance replaced');
      return out;
    });
    assert.equal(results[1].after.lines, 20);
    assert.equal(results[2].before.dn, 20);
    assert.equal(results[2].after.dn, 50);
    assert.ok(results[2].after.issues > 0);
    assert.ok(results[3].after.history > results[3].before.history);
    assert.equal(results[4].after.lines, results[4].before.lines + 1);
    assert.equal(results[4].after.newLines, results[4].before.newLines + 1);
    await page.click('#live-close');
    assert.equal(await page.evaluate(() => PGSlides.current()), 6);
    await page.evaluate(() => { document.querySelector('#live-mode').value = 'auto'; PGLive.open(0); });
    await page.waitForFunction(() => PGGuide.state.index >= 1 && !PGGuide.state.busy);
    await page.click('#live-pause');
    const pausedIndex = await page.evaluate(() => PGGuide.state.index);
    await page.waitForTimeout(2200);
    assert.equal(await page.evaluate(() => PGGuide.state.index), pausedIndex);
    await page.click('#live-pause');
    await page.waitForFunction(i => PGGuide.state.index > i, pausedIndex);
    await page.evaluate(() => PGLive.close(true));
    assert.equal(await page.evaluate(() => PGSlides.current()), 7);
    const recovered = await page.evaluate(async () => { await PGLive.api.prepareSample(4); return PGLive.api.summary(); });
    assert.equal(recovered.lines, 20);
    assert.equal(recovered.dn, 50);
    assert.equal(recovered.issues, 0);
    assert.equal(recovered.newLines, 0);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ passed: true, steps: results, pageErrors: errors }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
