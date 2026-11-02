/* Single-instance bridge. Never call Academy prepare(): it resets model state. */
(() => {
  'use strict';
  const titles=['P&ID 도면 분석','기관실 3D 모델 생성','변경 영향 분석','배관 경로 개선','AI 신규 배관 연결'];
  const shell=document.createElement('section');shell.id='pg-guided';shell.hidden=true;
  shell.innerHTML=`<header><div><small>DX ACADEMY · PIPEGUIDE · LIVE v2</small><h1 id="live-title"></h1></div><label>시연 모드 <select id="live-mode"><option value="auto">자동 가이드</option><option value="manual">직접 시연</option><option value="free">자유 조작</option></select></label><button id="live-pause">일시정지</button><button id="live-restore">STEP 시작 상태 복원</button><button id="live-sample">샘플로 이 STEP 준비</button><button id="live-close">발표 복귀</button></header><div class="live-work"><div id="live-viewport"><div id="live-canvas"><iframe id="live-app" title="PipeGuide 실제 프로그램" allow="fullscreen" sandbox="allow-scripts allow-downloads"></iframe><div id="live-spot"></div><div id="live-cursor" aria-hidden="true">➤<i></i></div></div></div><section class="live-coach"><span class="live-badge">● LIVE + GUIDE</span><p id="live-progress"></p><h2 id="live-action"></h2><p id="live-copy"></p><output id="live-result" aria-live="polite"></output><button id="live-run">가이드 시작</button><button id="live-return" hidden>시연 완료 · 다음 발표로</button><p class="live-note">실제 샘플 계산 · OCR은 사전 인식 결과 사용<br>자연어는 API 키 없는 규칙 해석 모드</p></section></div>`;
  document.body.append(shell);
  const frame=shell.querySelector('iframe');let bootPromise,api,active=-1,origin=0,transition=0;
  function fit(){const v=document.querySelector('#live-viewport'),c=document.querySelector('#live-canvas');const scale=Math.min(v.clientWidth/1400,v.clientHeight/880);c.style.transform=`scale(${scale})`;c.style.left=(v.clientWidth-1400*scale)/2+'px';c.style.top=(v.clientHeight-880*scale)/2+'px';}
  new ResizeObserver(fit).observe(document.querySelector('#live-viewport'));
  const pending=new Map();let sequence=0,resolveBoot;
  function request(method,...args){return new Promise((resolve,reject)=>{
    const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(Error('프로그램 응답 시간 초과: '+method))},120000);
    pending.set(id,{resolve,reject,timer});frame.contentWindow.postMessage({pgLive:1,id,method,args},'*');
  })}
  addEventListener('message',e=>{
    if(e.source!==frame.contentWindow||e.data?.pgLive!==1)return;
    const m=e.data;
    if(m.event==='ready'){resolveBoot?.();return}
    if(m.event==='guide-click'){window.PGGuide?.run();return}
    if(m.event==='escape'){close();return}
    const job=pending.get(m.id);if(!job)return;clearTimeout(job.timer);pending.delete(m.id);
    if(m.error)job.reject(Error(m.error));else job.resolve(m.value);
  });
  function boot(){
    if(bootPromise)return bootPromise;
    bootPromise=new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>{bootPromise=null;reject(Error('프로그램 로딩 시간 초과. 단일 HTML을 다시 열어 주세요.'))},45000);
      resolveBoot=()=>{
        clearTimeout(timeout);resolveBoot=null;
        api=Object.fromEntries(['enter','restore','prepareSample','action','summary','halt','watch','target'].map(method=>[method,(...args)=>request(method,...args)]));
        resolve(api);
      };
      const embedded=document.getElementById('pg-embedded-program');
      if(embedded){frame.srcdoc=JSON.parse(embedded.textContent);return;}
      Promise.all(['program.html','live-app-bridge.js','pacing.js'].map(async name=>{const r=await fetch(name);if(!r.ok)throw Error('파일 로딩 실패: '+name);return r.text()})).then(([app,bridge,pacing])=>{
        app=app.replaceAll('parent.PGPresentation','window.PGPresentation');
        const at=app.lastIndexOf('</body>');
        frame.srcdoc=app.slice(0,at)+'<script>'+pacing+'\n'+bridge+'<'+ '/script>'+app.slice(at);
      }).catch(error=>{clearTimeout(timeout);bootPromise=null;reject(Error(error.message+' · 파일 직접 실행은 PipeGuide-Guided-Live.html을 사용하세요.'))});
    });return bootPromise;
  }
  async function open(step){const turn=++transition;window.PGGuide?.stop();document.querySelector('#live-action').textContent='프로그램을 준비하고 있습니다';document.querySelector('#live-result').textContent='';document.querySelector('#live-run').disabled=true;document.querySelector('#live-return').hidden=true;origin=window.PGSlides.current();active=step;shell.hidden=false;fit();document.querySelectorAll('video').forEach(v=>v.pause());document.querySelector('#live-title').textContent=`STEP 0${step+1} · ${titles[step]}`;try{await boot();if(turn!==transition)return;await api.enter(step);if(turn!==transition)return;await window.PGGuide.start(step,api)}catch(e){if(turn!==transition)return;document.querySelector('#live-action').textContent='이 STEP을 준비해 주세요';document.querySelector('#live-copy').textContent='이전 STEP을 진행하거나 상단의 ‘샘플로 이 STEP 준비’를 누르세요.';document.querySelector('#live-result').textContent=e.message}}
  function close(next=false){transition++;window.PGGuide?.stop();api?.halt().catch(()=>{});shell.hidden=true;if(next)window.PGSlides.go(Math.min(origin+1,21));document.querySelectorAll('.slide.active video').forEach(v=>v.play().catch(()=>{}));}
  window.PGLive={open,close,isOpen:()=>!shell.hidden,frame,fit,get api(){return api},get step(){return active}};
  // Replace prototype launch buttons with five explicit handoffs.
  document.querySelectorAll('.pg-live-launch').forEach(b=>b.remove());
  [6,7,8,9,10].forEach((n,i)=>{const b=document.createElement('button');b.className='pg-live-launch';b.textContent=`● STEP 0${i+1} LIVE · ${titles[i]}`;b.onclick=e=>{e.stopPropagation();open(i)};document.querySelectorAll('section.slide')[n].append(b)});
  shell.addEventListener('click',e=>e.stopPropagation());
  document.querySelector('#live-close').onclick=()=>close();document.querySelector('#live-return').onclick=()=>close(true);
  document.querySelector('#live-sample').onclick=async()=>{const turn=++transition;window.PGGuide.stop();document.querySelector('#live-result').textContent='현재 시연 상태를 샘플로 바꾸어 이 STEP을 준비합니다.';try{await boot();if(turn!==transition)return;await api.prepareSample(active);if(turn!==transition)return;await window.PGGuide.start(active,api)}catch(e){if(turn!==transition)return;document.querySelector('#live-result').textContent=e.message}};
  document.querySelector('#live-restore').onclick=async()=>{const turn=++transition;window.PGGuide.stop();try{await boot();if(turn!==transition)return;await api.restore(active);if(turn!==transition)return;await window.PGGuide.start(active,api)}catch(e){if(turn!==transition)return;document.querySelector('#live-result').textContent=e.message}};
  document.addEventListener('keydown',e=>{if(!shell.hidden&&e.key==='Escape'){e.preventDefault();close()}},true);
})();
