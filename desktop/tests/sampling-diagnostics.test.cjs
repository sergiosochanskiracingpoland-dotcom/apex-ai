'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const source=fs.readFileSync(path.join(__dirname,'../ui/sampling.js'),'utf8');
function evaluate(){
 const window=new JSDOM('<html><body></body></html>',{url:'file:///C:/Apex/ui/index.html',runScripts:'dangerously'}).window;
 window.eval(source);
 return window;
}
function samples(n,ms,packetRatio=1){
 const a=[];
 for(let i=0;i<n;i++)a.push({timestamp_ms:i*ms,speed_kmh:180,physics_packet_id:Math.floor(i*packetRatio),completed_laps:0});
 return a;
}
test('Real 75Hz output is not confused with ~50Hz physics updates',t=>{
 const w=evaluate();t.after(()=>w.close());
 const r=w.ApexSamplingDiagnostics.analyze(samples(451,1000/75,2/3));
 assert.ok(Math.abs(r.savedHz-75)<.1,'recorded sample Hz');
 assert.ok(Math.abs(r.uniqueHz-50)<.3,'unique game packet Hz');
 assert.ok(r.duplicatesPercent>32 && r.duplicatesPercent<35);
 assert.ok(Math.abs(r.goalPercent-100)<1);
 assert.equal(r.over25,0);
});
test('Old 50Hz CSVs remain supported and reveal their actual rate',t=>{
 const w=evaluate();t.after(()=>w.close());
 const r=w.ApexSamplingDiagnostics.analyze(samples(300,20));
 assert.ok(Math.abs(r.savedHz-50)<.01);
 assert.ok(r.goalPercent>66 && r.goalPercent<67);
 assert.equal(r.duplicateEligible,299);
 assert.equal(r.pauses,0);
});
test('Exclude stationary samples, long gaps and count slow scheduling',t=>{
 const w=evaluate();t.after(()=>w.close());
 const a=[
 {timestamp_ms:0,speed_kmh:5,physics_packet_id:0},
 {timestamp_ms:13,speed_kmh:140,physics_packet_id:1},
 {timestamp_ms:27,speed_kmh:145,physics_packet_id:2},
 {timestamp_ms:62,speed_kmh:143,physics_packet_id:3},
 {timestamp_ms:460,speed_kmh:130,physics_packet_id:4},
 {timestamp_ms:474,speed_kmh:130,physics_packet_id:4}
 ];
 const r=w.ApexSamplingDiagnostics.analyze(a);
 assert.equal(r.intervals,3);
 assert.equal(r.pauses,1);
 assert.equal(r.over25,1);
 assert.equal(r.over40,0);
 assert.equal(r.physicsDuplicates,1);
 assert.ok(Number.isFinite(r.p95GapMs));
});
test('No traffic never reports fictitious Hz',t=>{
 const w=evaluate();t.after(()=>w.close());
 const r=w.ApexSamplingDiagnostics.analyze([]);
 assert.equal(r.savedHz,null);
 assert.equal(r.uniqueHz,null);
 assert.equal(r.goalPercent,null);
 assert.equal(r.count,0);
});
