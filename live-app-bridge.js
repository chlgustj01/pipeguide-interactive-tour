(() => {
 'use strict';
 const clone=x=>JSON.parse(JSON.stringify(x));const checkpoints=new Map();
 const fields=['gen','uploads','lines','_link','history','csv','dw','im','rd'];
 const rtFields=['sub','step','nstep','nf','nt','ndn','slot','reason','view','applied','anim','adn'];
 function capture(){const data={};for(const k of fields)if(App[k]!==undefined)data[k]=clone(App[k]);data.rt={};for(const k of rtFields)if(App.rt[k]!==undefined)data.rt[k]=clone(App.rt[k]);data.chat=clone({log:App.chat.log,draft:App.chat.draft,mode:'rule',open:App.chat.open});return data}
 function halt(){if(App.gen.spin){App.gen.spin=false;View3D.controls.autoRotate=false}if(App.rt.stopAnim){App.rt.stopAnim();App.rt.stopAnim=null}}
 function show(tab){if(tab==='drawing')tab+='@'+App.dw.step;if(tab==='impact')tab+='@'+App.im.step;App.go(tab)}
 const line=()=>App.lines.find(l=>l.tag==='733-443'&&l.tab===PID_LINK.TAB);
 function sample(){if(!App.uploads.some(u=>u.sample))App.loadSample()}
 function build(){sample();if(!App._link?.built)App.linkBuild()}
 function impact(){App.im.step=1;App.im.add=true;App.im.pre='733-443';show('impact');const s=document.querySelector('#imSize');if(s)s.value='50'}
 function spatial(){App._issues=null;const i=App.issues().find(i=>i.tag==='733-443'&&['clash','clr'].includes(i.cat)&&i.lineId);if(!i)throw Error('733-443 공간 문제가 없습니다. STEP 03에서 구경 변경·3D 반영을 먼저 실행하세요.');App.im.step=3;App.im.prob=i.id;show('impact');return i}
 function route(){const i=spatial();App.rd.mode='reroute';App.rd.lineId=i.lineId;App.rt.sub='fix';App.rt.step=1;App.rt.applied=null;App.rt.reason='발표 시연 · 구경 변경 후 공간 문제 개선';App.setSys(line().tab);show('route')}
 function newPipe(){App.rd.mode='new';App.rd.cands=[];App.rd.chosen=0;App.rt.sub='new';App.rt.nstep=1;App.rt.applied=null;App.chat.mode='rule';App.chat.open=true;const E=EQUIP.filter(e=>e.tab===PID_LINK.TAB);const a=E.find(e=>/Jockey/i.test(e.n))||E[0],b=E.find(e=>/소화.*헤더|fire.*header/i.test(e.n)&&e!==a)||E[1];App.rt.nf=a.id;App.rt.nt=b.id;App.rt.ndn=25;App.chat.draft=`${a.n}에서 ${b.n}까지 25A 배관 연결해 줘`;show('route');App.chatPaint()}
 async function enter(step){halt();document.querySelectorAll('#pgIntro,#pgWf,#pgIntroCover').forEach(e=>e.remove());if(step>1&&!App._link?.built)throw Error('먼저 STEP 01·02를 실행하세요. 모델 상태를 유지한 채 이어집니다.');if(step===0){App.dw.step=1;show('drawing')}if(step===1){if(!App.uploads.some(u=>u.sample))throw Error('먼저 STEP 01에서 샘플 도면을 불러오세요.');App.dw.step=4;show('drawing')}if(step===2)impact();if(step===3)route();if(step===4)newPipe();checkpoints.set(step,capture())}
 async function restore(step){halt();const c=checkpoints.get(step);if(!c)throw Error('저장된 STEP 복원 지점이 없습니다.');for(const k of fields)if(c[k]!==undefined){if(['gen','dw','im','rd'].includes(k))Object.assign(App[k],clone(c[k]));else App[k]=clone(c[k]);}Object.assign(App.rt,clone(c.rt));Object.assign(App.chat,clone(c.chat));App._issues=null;if(step<2){App.dw.step=step===0?1:4;show('drawing')}if(step===2)impact();if(step===3)route();if(step===4){show('route');App.chatPaint()}}
 function target(selector){if(selector.includes(',')){for(const part of selector.split(',')){const found=target(part.trim());if(found)return found;}return;}if(selector==='#pg-gen [data-line]'&&line())selector='#pg-gen [data-line="'+line().id+'"]';return [...document.querySelectorAll(selector)].find(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&!e.disabled})}
 function click(selector){const e=target(selector);if(!e)throw Error('클릭 대상이 없거나 비활성 상태입니다: '+selector);e.click()}
 const summary=()=>({lines:App.lines.length,built:!!App._link?.built,dn:line()?.model.dn,issues:App.issues().filter(i=>i.tag==='733-443'&&['clash','clr'].includes(i.cat)).length,candidates:App.rd.cands.length,history:App.history.length,newLines:App.history.filter(h=>h.type==='NEW').length});
 async function prepareSample(step){halt();App.uploads=[];App.lines=[];App._link={};App.history=[];App.dw.checked={};App.dw.item=null;App.dw.sel=null;App.im.ch=null;App.chat.log=[];App.rt.applied=null;App.rd.cands=[];App.loadSample();if(step>1)App.linkBuild();if(step>2){const g=App.linkGroups().find(g=>g.P.lines.some(l=>l.key==='733-443'));App.linkChange(g.key,'733-443',50);App.linkSyncSheets('733-443');App.linkApplyModel('733-443');}if(step>3){route();App.runRedesign();if(!App.rd.cands.length)throw Error('샘플 우회 후보 생성 실패');App.rd.chosen=0;App.applyRoute();}await enter(step);return summary();}
 window.PGLiveApp={enter,restore,prepareSample,target,click,summary,halt,async action(name){
  if(name==='sample'){if(!App.uploads.some(u=>u.sample))click('[data-dw="sample"]');App.dw.step=2;show('drawing')}
  else if(name==='review'){App.dw.step=3;show('drawing')}
  else if(name==='item')click('[data-dw="item"]');
  else if(name==='check')click('[data-dw="chk"]');
  else if(name==='ready')click('[data-dw="reviewed"]');
  else if(name==='confirmReady'){if(target('.askbox [data-a="yes"]'))click('.askbox [data-a="yes"]')}
  else if(name==='build'){click('[data-dw="build"]');if(!App._link?.built)throw Error('모델 생성 실패')}
  else if(name==='three'){App.setSys(PID_LINK.TAB);App.gen.region='er';App.gen.open[line().sys]=1;show('gen')}
  else if(name==='real')click('#pg-gen [data-k="real"] [data-v="1"]');
  else if(name==='selectPipe'){const l=line();App.gen.open[l.sys]=1;App.render_gen();click('#pg-gen [data-line="'+l.id+'"]')}
  else if(name==='rotate'){click('#pg-gen [data-act="spin"]');await new Promise(r=>setTimeout(r,2800));if(App.gen.spin)click('#pg-gen [data-act="spin"]')}
  else if(name==='fit')click('#pg-gen [data-act="fit"]');
  else if(name==='size'){const l=document.querySelector('#imLine');l.value=[...l.options].find(o=>o.value.endsWith('|733-443'))?.value||l.value;l.dispatchEvent(new Event('change',{bubbles:true}));const s=document.querySelector('#imSize');s.value='50';s.dispatchEvent(new Event('change',{bubbles:true}))}
  else if(name==='change')click('[data-im="addGo"]');
  else if(name==='sync')click('[data-im="sync"]');
  else if(name==='applyModel'){click('[data-im="apply"]');App.im.step=3;show('impact')}
  else if(name==='generate'){click('[data-rt="gen"]');if(!App.rd.cands.length)throw Error('기준 통과 후보 없음: '+App.rd.msg)}
  else if(name==='candidate')click('.rt-cand');
  else if(name==='split')click('[data-rt="view"][data-v="split"]');
  else if(name==='reviewRoute'){App.rt.step=3;App.render_route()}
  else if(name==='applyRoute')click('[data-rt="apply"]');
  else if(name==='send'){await App.chatSend(App.chat.draft);if(!App.rd.cands.length||App.rd.mode!=='new')throw Error('신규 연결 실패: '+App.chat.log.at(-1)?.text);App.rt.nstep=2;App.render_route();App.chatPaint();await PGTour.awaitAnimation()}
  else if(name==='replay'){click('[data-rt="replay"]');await PGTour.awaitAnimation()}
  else if(name==='reviewNew'){App.chat.open=false;App.rt.nstep=3;App.render_route()}
  else if(name==='register')click('[data-rt="napply"]');
  else if(name==='confirmRoute'){const n=App.history.length;click('.askbox [data-a="yes"]');if(App.history.length<=n)throw Error('경로 적용 변경 이력이 생성되지 않았습니다.')}
  else if(name==='confirmNew'){const n=App.lines.length;click('.askbox [data-a="yes"]');if(App.lines.length<=n||App.history.at(-1)?.type!=='NEW')throw Error('신규 배관 등록을 확인하지 못했습니다.');}
  return summary();
 }};
})();
