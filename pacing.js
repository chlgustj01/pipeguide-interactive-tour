// 발표용 강조 배분: 안내 커서는 짧게, 계산 결과·형성 과정·전후 비교는 충분히.
window.PGPresentation={
  cursorMs:250,beforeClickMs:100,afterActionMs:250,afterAnimationMs:3000,
  holdMs(phase,speed=1){
    speed=Math.max(1,Number(speed)||1);
    if(phase==='bAnimation')return 11000;
    if(['splitView','applied','bRechecked'].includes(phase))return Math.max(10000,12000/speed);
    if(['candidates','bAiReady','newCandidates'].includes(phase))return Math.max(6000,8000/speed);
    return Math.max(3000,5300/speed);
  },
  animationStepMs(step,defaultMs){
    if(step.flash)return 1800;
    if(step.pts)return step.ms?Math.max(1200,step.ms*1.5):Math.max(5000,Math.min(7000,defaultMs*2.2));
    return step.ms||defaultMs;
  }
};
