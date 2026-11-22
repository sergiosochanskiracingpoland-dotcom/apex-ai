'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const races=require('../race-library.cjs'),sessions=require('../session-library.cjs');
function setup(t){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'apex-race-'));
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 return dir;
}
function fixture(){
 const id='acc_20261122_140000_4321',s1='acc_20261122_140010_1234',s2='acc_20261122_141010_9876';
 return {id,s1,s2,raw:{
 schemaVersion:1,id,track:'imola',car:'ferrari_296_gt3',sessionType:2,
 startedAtUtc:'2026-11-22T14:00:00Z',endedAtUtc:'2026-11-22T14:40:00Z',
 stints:[s1,s2],positions:[{atUtc:'2026-11-22T14:00:00Z',lap:0,position:9},{atUtc:'2026-11-22T14:35:00Z',lap:21,position:4}],
 pitStops:[{entryAtUtc:'2026-11-22T14:10:00Z',exitAtUtc:'2026-11-22T14:11:20Z',
  entryLap:5,exitLap:5,positionBefore:8,positionAfter:10,laneSeconds:80.1,
  stationarySeconds:27.2,fuelBeforeLitres:15,fuelAfterLitres:65,fuelAddedLitres:50,
  tyreCompoundBefore:'DHE',tyreCompoundAfter:'DHE',pitBoxFirstSeenUtc:null}]
 }};
}
test('Can enumerate and open multiple stints belonging to the same race',t=>{
 const dir=setup(t),v=fixture();
 fs.writeFileSync(path.join(dir,v.id+'_race.json'),JSON.stringify(v.raw));
 const list=races.listRaces(dir);
 assert.equal(list.length,1);assert.equal(list[0].pitCount,1);assert.equal(list[0].stintCount,2);
 const report=races.loadRace(dir,v.id);
 assert.deepEqual(report.stints,[v.s1,v.s2]);
 assert.equal(report.positions[0].position,9);
 assert.equal(report.positions.at(-1).position,4);
 assert.equal(report.pitStops[0].laneSeconds,80.1);
 assert.equal(report.pitStops[0].fuelAddedLitres,50);
 assert.equal(report.pitStops[0].tyreCompoundAfter,'DHE');
});
test('Old session files stay readable without raceId and new ones link to reports',t=>{
 const dir=setup(t),v=fixture();
 for(const [index,key] of [v.s1,v.s2].entries()){
 fs.writeFileSync(path.join(dir,key+'_laps.csv'),'lap,time\n1,105.34\n');
 fs.writeFileSync(path.join(dir,key+'_samples.csv'),'timestamp_utc,speed_kmh\n2026-11-22T14:00:00Z,150\n');
 if(index===0)fs.writeFileSync(path.join(dir,key+'_meta.json'),JSON.stringify({raceId:v.id,sessionType:'2'}));
 }
 const entries=sessions.listSessions(dir);
 assert.equal(entries.length,2);
 assert.equal(entries.find(x=>x.key===v.s1).raceId,v.id);
 assert.equal(entries.find(x=>x.key===v.s2).raceId,null);
});
test('Unsafe report IDs and unbounded files are not processed',t=>{
 const dir=setup(t),v=fixture();
 assert.throws(()=>races.loadRace(dir,'../preferences.json'),/identyfikator/);
 fs.writeFileSync(path.join(dir,v.id+'_race.json'),'x'.repeat(1024*1024+1));
 assert.throws(()=>races.loadRace(dir,v.id),/duży/);
 assert.deepEqual(races.listRaces(dir),[]);
});
test('Open pit visit has unknown exit and service instead of invented facts',t=>{
 const dir=setup(t),v=fixture();
 v.raw.pitStops[0]={entryAtUtc:'2026-11-22T14:10:00Z',exitAtUtc:null,entryLap:5};
 fs.writeFileSync(path.join(dir,v.id+'_race.json'),JSON.stringify(v.raw));
 const p=races.loadRace(dir,v.id).pitStops[0];
 assert.equal(p.exitAtUtc,null);assert.equal(p.laneSeconds,null);
 assert.equal(p.fuelAddedLitres,null);assert.equal(p.tyreCompoundAfter,'');
});
