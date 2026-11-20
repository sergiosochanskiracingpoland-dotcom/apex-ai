'use strict';
// Data-based rule engine, no simulated AI. Uses real timestamped lap samples.
// Estimate local time differences from interpolation by lap progress.
(function(){
 function lapPoints(samples,lap){
  const group=samples.filter(s=>s.completed_laps===lap-1&&Number.isFinite(s.lap_progress)&&
    Number.isFinite(s.timestamp_ms)&&s.in_pit!==1);
  if(group.length<100)return [];
  let from=0;
  for(let i=1;i<group.length;i++)if(group[i].lap_progress<group[i-1].lap_progress-.50)from=i;
  const points=group.slice(from);
  if(points.length<100)return [];
  const clean=[];
  let prev=-1;
  for(const p of points){
   if(p.lap_progress<0||p.lap_progress>1.01||p.lap_progress<prev-.02)continue;
   if(p.lap_progress<prev)continue;
   clean.push(p);prev=p.lap_progress;
  }
  if(!clean.length||clean[0].lap_progress>.12||clean[clean.length-1].lap_progress<.88)return [];
  return clean;
 }
 function interpolate(points,progress,field){
  if(points.length<2||progress<points[0].lap_progress||progress>points[points.length-1].lap_progress)return NaN;
  let lo=0,hi=points.length-1;
  while(lo<hi){
   const mid=(lo+hi)>>1;
   if(points[mid].lap_progress<progress)lo=mid+1;else hi=mid;
  }
  const right=points[lo],left=points[Math.max(0,lo-1)];
  if(lo===0)return Number(right[field]);
  const dx=right.lap_progress-left.lap_progress;
  if(dx<=0)return Number(right[field]);
  const alpha=(progress-left.lap_progress)/dx;
  return Number(left[field])+(Number(right[field])-Number(left[field]))*alpha;
 }
 function localDelta(a,b,start,end){
  if(!a.length||!b.length)return NaN;
  const tA0=interpolate(a,start,'timestamp_ms'),tA1=interpolate(a,end,'timestamp_ms');
  const tB0=interpolate(b,start,'timestamp_ms'),tB1=interpolate(b,end,'timestamp_ms');
  const delta=((tB1-tB0)-(tA1-tA0))/1000;
  if(!Number.isFinite(delta)||Math.abs(delta)>7||tA1<=tA0||tB1<=tB0)return NaN;
  return delta;
 }
 function segmentDeltas(a,b,count=20){
  const bars=[];
  for(let i=0;i<count;i++){
   const p0=i/count,p1=(i+1)/count;
   bars.push({start:p0,end:p1,delta:localDelta(a,b,p0,p1)});
  }
  return bars;
 }
 function brakingZones(a,b){
  if(!a.length)return [];
  const zones=[];
  let beginning=-1,lastActive=-1,peak=0;
  function finish(endIndex){
   if(beginning<0)return;
   const first=a[beginning],last=a[Math.max(beginning,endIndex)];
   if(last.timestamp_ms-first.timestamp_ms>=180&&peak>=.18&&last.lap_progress-first.lap_progress<.18){
    const start=Math.max(0,first.lap_progress-.01),end=Math.min(1,last.lap_progress+.02);
    const inZoneA=a.slice(beginning,endIndex+1);
    const inZoneB=b.filter(x=>x.lap_progress>=start&&x.lap_progress<=end);
    const min=points=>points.length?Math.min(...points.map(p=>p.speed_kmh).filter(Number.isFinite)):NaN;
    zones.push({start,end,mid:(start+end)/2,
     delta:localDelta(a,b,start,end),
     minA:min(inZoneA),minB:min(inZoneB)});
   }
   beginning=-1;lastActive=-1;peak=0;
  }
  for(let i=0;i<a.length;i++){
   const brake=Number(a[i].brake),active=Number.isFinite(brake)&&brake>=.18;
   if(active){
    if(beginning<0)beginning=i;
    lastActive=i;peak=Math.max(peak,brake);
   }else if(beginning>=0 && lastActive>=0 && a[i].timestamp_ms-a[lastActive].timestamp_ms>120){
    finish(lastActive);
   }
  }
  if(beginning>=0)finish(lastActive);
  return zones.filter((z,i)=>i===0||z.start-zones[i-1].end>.008).slice(0,30);
 }
 function analyze(samples,lapA,lapB){
  const a=lapPoints(samples,lapA),b=lapPoints(samples,lapB);
  return {lapsValid:a.length>0&&b.length>0,deltaBars:segmentDeltas(a,b),
   zones:brakingZones(a,b),pointsA:a,pointsB:b};
 }
 window.ApexRaceAnalysis={analyze,lapPoints,localDelta};
})();
