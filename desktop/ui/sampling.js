'use strict';
// Post-session sampling diagnostics based ONLY on saved CSV values.
// A 75 Hz loop is not proof of 75 unique game frames: show both rates.
(function(){
 function analyze(samples,targetHz=75){
  let prev=null,intervals=0,elapsedMs=0,physicsChanges=0,physicsDuplicates=0,
      duplicateEligible=0,over25=0,over40=0,pauses=0,invalid=0,maxGap=0;
  const durations=[];
  for(const s of samples||[]){
   if(!Number.isFinite(s.timestamp_ms)||!Number.isFinite(s.speed_kmh)||s.speed_kmh<30){
    prev=null;continue;
   }
   if(prev){
    const dt=s.timestamp_ms-prev.timestamp_ms;
    if(!Number.isFinite(dt)||dt<=0){invalid++;prev=s;continue;}
    if(dt>250){pauses++;prev=s;continue;}
    intervals++;elapsedMs+=dt;maxGap=Math.max(maxGap,dt);
    if(dt>25)over25++;
    if(dt>40)over40++;
    durations.push(dt);
    if(Number.isFinite(s.physics_packet_id)&&Number.isFinite(prev.physics_packet_id)){
      duplicateEligible++;
      if(s.physics_packet_id===prev.physics_packet_id)physicsDuplicates++;
      else physicsChanges++;
    }
   }
   prev=s;
  }
  const valid=intervals>0&&elapsedMs>0;
  durations.sort((a,b)=>a-b);
  const percentile=p=>durations.length?durations[Math.min(durations.length-1,Math.ceil(durations.length*p)-1)]:null;
  const savedHz=valid?intervals*1000/elapsedMs:null;
  const uniqueHz=valid&&duplicateEligible?physicsChanges*1000/elapsedMs:null;
  return Object.freeze({
   targetHz,savedHz,uniqueHz,goalPercent:valid?savedHz/targetHz*100:null,
   duplicatesPercent:duplicateEligible?physicsDuplicates/duplicateEligible*100:null,
   count:Array.isArray(samples)?samples.length:0,intervals,pauses,invalid,over25,over40,
   maxGapMs:intervals?maxGap:null,p95GapMs:percentile(.95),medianGapMs:percentile(.5),
   duplicateEligible,physicsChanges,physicsDuplicates
  });
 }
 window.ApexSamplingDiagnostics=Object.freeze({analyze});
})();
