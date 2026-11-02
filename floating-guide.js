(() => {
 const q=s=>document.querySelector(s),demo=q('.demo'),callout=q('#callout'),player=q('.player');
 const panel=document.createElement('section');panel.id='floatingGuide';panel.setAttribute('aria-label','발표 안내 패널');panel.hidden=true;
 panel.innerHTML='<div class="guide-grip"><span>단계 안내</span><div><button id="guideMinimize" aria-label="설명 최소화" aria-expanded="true">−</button><button id="guideClose" aria-label="안내 패널 닫기">×</button></div></div>';
 const launcher=document.createElement('button');launcher.id='guideOpen';launcher.textContent='☰ 가이드 열기';launcher.setAttribute('aria-controls','floatingGuide');launcher.hidden=true;demo.append(panel,launcher);
 let attached=false,state='open';const mq=matchMedia('(max-width:760px)');
 function display(next){state=next;panel.hidden=next==='closed';launcher.hidden=next!=='closed';panel.classList.toggle('minimized',next==='mini');q('#guideMinimize').textContent=next==='mini'?'＋':'−';q('#guideMinimize').setAttribute('aria-expanded',String(next==='open'));q('#guideMinimize').setAttribute('aria-label',next==='mini'?'설명 펼치기':'설명 최소화')}
 function sync(){const active=mq.matches&&document.body.classList.contains('presenting');if(active&&!attached){panel.append(callout,player);attached=true;display(state)}else if(!active&&attached){demo.insertBefore(callout,panel);demo.insertBefore(player,panel);panel.hidden=true;launcher.hidden=true;attached=false}if(!active){panel.hidden=true;launcher.hidden=true}fit()}
 q('#guideMinimize').onclick=()=>display(state==='mini'?'open':'mini');q('#guideClose').onclick=()=>{display('closed');launcher.focus()};launcher.onclick=()=>{display('open');q('#guideMinimize').focus()};
 document.addEventListener('pg-presentation',sync);mq.addEventListener('change',sync);sync();
})();
