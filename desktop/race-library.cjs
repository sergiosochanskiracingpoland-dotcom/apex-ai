'use strict';
const fs=require('node:fs'),path=require('node:path');
const ID=/^acc_\d{8}_\d{6}_\d{4,6}$/;
const MAX_RACE_BYTES=1024*1024;
function racePath(folder,id){
 if(!ID.test(String(id)))throw Error('Nieprawidłowy identyfikator wyścigu.');
 return path.join(folder,id+'_race.json');
}
function loadRace(folder,id){
 const f=racePath(folder,id);
 if(!fs.existsSync(f))return null;
 const stat=fs.statSync(f);
 if(!stat.isFile()||stat.size>MAX_RACE_BYTES)throw Error('Raport wyścigu jest zbyt duży.');
 const r=JSON.parse(fs.readFileSync(f,'utf8'));
 if(!r||r.schemaVersion!==1||r.id!==id||!Array.isArray(r.stints)||
    !Array.isArray(r.pitStops)||!Array.isArray(r.positions))throw Error('Nieprawidłowy raport wyścigu.');
 const str=v=>String(v||'').slice(0,100);
 const sanePos=p=>Number.isInteger(p?.position)&&p.position>=1&&p.position<=200&&
    Number.isInteger(p.lap)&&p.lap>=0&&p.lap<=100000&&typeof p.atUtc==='string';
 const numeric=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max?v:null;
 const visit=p=>{
   const raw=p&&typeof p==='object'?p:{};
   return {
    entryAtUtc:typeof raw.entryAtUtc==='string'?raw.entryAtUtc:null,
    exitAtUtc:typeof raw.exitAtUtc==='string'?raw.exitAtUtc:null,
    entryLap:numeric(raw.entryLap,0,100000),exitLap:numeric(raw.exitLap,0,100000),
    laneSeconds:numeric(raw.laneSeconds,0,7200),
    stationarySeconds:numeric(raw.stationarySeconds,0,7200),
    fuelAddedLitres:numeric(raw.fuelAddedLitres,0,500),
    fuelBeforeLitres:numeric(raw.fuelBeforeLitres,0,500),
    fuelAfterLitres:numeric(raw.fuelAfterLitres,0,500),
    tyreCompoundBefore:str(raw.tyreCompoundBefore),
    tyreCompoundAfter:str(raw.tyreCompoundAfter),
    positionBefore:numeric(raw.positionBefore,1,200),
    positionAfter:numeric(raw.positionAfter,1,200),
    pitBoxFirstSeenUtc:typeof raw.pitBoxFirstSeenUtc==='string'?raw.pitBoxFirstSeenUtc:null
   };
 };
 return {
  id,game:'ACC',track:str(r.track),car:str(r.car),
  sessionType:Number.isInteger(r.sessionType)?r.sessionType:-1,
  startedAtUtc:str(r.startedAtUtc),endedAtUtc:str(r.endedAtUtc)||null,
  stints:[...new Set(r.stints.filter(s=>typeof s==='string'&&ID.test(s)))].slice(0,200),
  pitStops:r.pitStops.slice(0,100).map(visit),
  positions:r.positions.filter(sanePos).slice(0,3000)
 };
}
function listRaces(folder){
 if(!fs.existsSync(folder))return [];
 const all=fs.readdirSync(folder).filter(x=>x.endsWith('_race.json'));
 all.sort((a,b)=>b.localeCompare(a));
 return all.slice(0,500).flatMap(file=>{
  try{
   const id=file.slice(0,-10),r=loadRace(folder,id);
   return r?[{id:r.id,track:r.track,car:r.car,date:r.startedAtUtc,
      sessionType:r.sessionType,stintCount:r.stints.length,
      pitCount:r.pitStops.length,ended:!!r.endedAtUtc}]:[];
  }catch{return [];}
 });
}
module.exports={racePath,loadRace,listRaces};
