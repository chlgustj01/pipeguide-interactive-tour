const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
 const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try {
  const page = await browser.newPage({viewport:{width:1600,height:1000}}), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.PIPEGUIDE_PRESENTATION_URL||'http://127.0.0.1:8000/PipeGuide-Guided-Live.html');
  await page.context().setOffline(true);
  await page.evaluate(()=>{ PGSlides.go(6); PGLive.open(0); });
  // Force the loading-time interactions from the reported failure.
  const early = await page.evaluate(async()=>{
   const unready=!PGGuide.state.ready;
   if(unready){
    const select=document.querySelector('#live-mode');select.value='auto';select.dispatchEvent(new Event('change'));
    await PGGuide.run();
   }
   return {unready,runDisabled:document.querySelector('#live-run').disabled,pauseDisabled:document.querySelector('#live-pause').disabled};
  });
  assert.equal(early.unready,true);assert.equal(early.runDisabled,true);assert.equal(early.pauseDisabled,true);
  const results=[];
  for(let step=0;step<5;step++){
   if(step)await page.evaluate(step=>{PGSlides.go(6+step);PGLive.open(step)},step);
   await page.waitForFunction(step=>PGGuide.state.ready&&PGGuide.state.step===step,step,{timeout:45000});
   await page.waitForFunction(()=>PGGuide.state.done||(PGGuide.state.paused&&!PGGuide.state.busy),null,{timeout:180000});
   const state=await page.evaluate(()=>({guide:PGGuide.state,model:PGLive.api.summary(),text:document.querySelector('#live-result').textContent}));
   assert.equal(state.guide.done,true,JSON.stringify(state));
   results.push(state.model);console.log('AUTO STEP',step+1,JSON.stringify(state.model));
   await page.click('#live-return');
   assert.equal(await page.evaluate(()=>PGSlides.current()),7+step);
  }
  assert.equal(results[1].lines,20);assert.equal(results[2].dn,50);assert.ok(results[2].issues>0);
  assert.equal(results[3].issues,0);assert.equal(results[4].lines,21);assert.equal(results[4].newLines,1);
  assert.deepEqual(errors,[]);
  console.log('PASS: loading-time controls guarded; five UI macros completed offline; no JavaScript errors.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
