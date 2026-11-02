(() => {
 const q=s=>document.querySelector(s), vp=q('#viewport'),cv=q('#canvas'),extent=q('#mobileExtent');
 const mq=matchMedia('(max-width:760px)');let zoom=1, focus=null,phase='',chapter=0;
 const mobile=()=>mq.matches&&!document.fullscreenElement;
 const target=()=>{const e=q('#hotspot');return {x:parseFloat(e.style.left)||0,y:parseFloat(e.style.top)||0,w:parseFloat(e.style.width)||1400,h:parseFloat(e.style.height)||880}};
 function paint(center){if(!mobile()){extent.style.display='none';vp.scrollLeft=0;vp.scrollTop=0;return false}const base=vp.clientWidth/1400,s=base*zoom;extent.style.display='block';extent.style.width=1400*s+'px';extent.style.height=880*s+'px';cv.style.transform=`scale(${s})`;cv.style.marginLeft='0';q('#zoomLabel').textContent=zoom.toFixed(1).replace('.0','')+'×';if(center){vp.scrollLeft=Math.max(0,(center.x+center.w/2)*s-vp.clientWidth/2);vp.scrollTop=Math.max(0,(center.y+center.h/2)*s-vp.clientHeight/2)}return true}
 window.PGMobile={fit:()=>paint(focus)};
 function all(){zoom=1;focus=null;paint();vp.scrollLeft=0;vp.scrollTop=0;mark('compareBoth')}
 function show(r){focus=r;zoom=Math.max(1,Math.min(4,Math.min(vp.clientWidth/r.w,vp.clientHeight/r.h)/(vp.clientWidth/1400)*.92));paint(r)}
 function mark(id){['compareBefore','compareAfter','compareBoth'].forEach(k=>q('#'+k).setAttribute('aria-pressed',String(k===id)))}
 function fillScreen(){if(!mobile())return;const app=q('#program').contentWindow.PGTour;const r=app?.target('#imView')||app?.target('#rtView')||app?.target('#pg-gen .view')||{x:0,y:80,w:950,h:700};focus=r;zoom=Math.max(1,Math.min(4,Math.max(vp.clientWidth/r.w,vp.clientHeight/r.h)/(vp.clientWidth/1400)));paint(r)}
 q('#viewAll').onclick=all;q('#viewFocus').onclick=()=>show(target());
 function resize(delta){const base=vp.clientWidth/1400,old=base*zoom;const cx=(vp.scrollLeft+vp.clientWidth/2)/old,cy=(vp.scrollTop+vp.clientHeight/2)/old;zoom=Math.max(1,Math.min(4,zoom+delta));focus={x:cx,y:cy,w:0,h:0};paint(focus)}
 q('#zoomIn').onclick=()=>resize(.5);q('#zoomOut').onclick=()=>resize(-.5);
 ['compareBefore','compareAfter'].forEach((id,i)=>q('#'+id).onclick=()=>{const r=q('#program').contentWindow.PGTour.target('#rtSplit');if(!r)return;show({x:r.x+i*r.w/2,y:r.y,w:r.w/2,h:r.h});mark(id)});
 q('#compareBoth').onclick=()=>{const r=q('#program').contentWindow.PGTour.target('#rtSplit');if(r)show(r);mark('compareBoth')};
 q('#mobileChapter').innerHTML=[...document.querySelectorAll('[data-ch]')].map(b=>`<option value="${b.dataset.ch}">${b.querySelector('b').textContent}</option>`).join('');
 q('#mobileChapter').onchange=()=>document.querySelector(`[data-ch="${q('#mobileChapter').value}"]`).click();
 function course(){const condensed=q('#course').value==='present';q('#mobileChapter').disabled=condensed;document.querySelector('.mobile-chapter').hidden=condensed}
 q('#course').addEventListener('change',course);
 document.addEventListener('pg-step-start',()=>{q('#mobileChapter').disabled=true;document.querySelectorAll('.mobile-view-tools button,.mobile-compare button').forEach(b=>b.disabled=true)});
 document.addEventListener('pg-step-ready',e=>{phase=e.detail.phase;chapter=e.detail.chapter;q('#mobileChapter').value=chapter;course();document.querySelectorAll('.mobile-view-tools button,.mobile-compare button').forEach(b=>b.disabled=false);document.querySelector('.mobile-compare').hidden=phase!=='splitView';all();if(document.body.classList.contains('presenting'))fillScreen();if(mobile()&&['bAnimation','newCandidates','newReview'].includes(phase)){const r=q('#program').contentWindow.PGTour.target('#rtView');if(r)show(r)}});
 document.addEventListener('pg-presentation',()=>{requestAnimationFrame(()=>{if(document.body.classList.contains('presenting'))fillScreen();else all()})});
 mq.addEventListener('change',()=>{zoom=1;focus=null;fit()});paint();
})();
