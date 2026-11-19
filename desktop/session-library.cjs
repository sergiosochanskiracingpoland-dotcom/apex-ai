'use strict';
/* Local, durable stint library. No account, cloud or database server required.
 * The ACC collector writes raw CSV + a metadata sidecar for every stint.
 * Older 0.3.1 sessions without metadata are indexed from their CSV lap headers. */
const fs=require('node:fs');
const path=require('node:path');
const KEY=/^acc_\d{8}_\d{6}_\d{4,6}$/;
const MAX_CSV_BYTES=100*1024*1024;
const MAX_LAPS_BYTES=2*1024*1024;
const MAX_LIST=1200;

function filePaths(dir,key) {
  if(typeof key!=='string'||!KEY.test(key)) throw Error('Nieprawidłowy identyfikator stintu.');
  return {
    laps:path.join(dir,key+'_laps.csv'),
    samples:path.join(dir,key+'_samples.csv'),
    meta:path.join(dir,key+'_meta.json')
  };
}
function dateFromKey(key) {
  const m=/^acc_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})_/.exec(key);
  return m ? [m[1],m[2],m[3]].join('-')+'T'+[m[4],m[5],m[6]].join(':') : null;
}
function readSmallText(file,maxBytes) {
  const stat=fs.statSync(file);
  if(!stat.isFile()||stat.size>maxBytes)throw Error('Plik jest za duży.');
  return fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'');
}
function readMeta(file) {
  try {
    const value=JSON.parse(readSmallText(file,8192));
    return value && typeof value==='object' && !Array.isArray(value)?value:{};
  }catch{return {};}
}
function nameFromGameId(text) {
  if(typeof text!=='string'||!text.trim())return '';
  return text.trim().replace(/[_-]+/g,' ').replace(/\b\w/g,x=>x.toUpperCase()).slice(0,110);
}
function lapSummary(file) {
  let csv;
  try{csv=readSmallText(file,MAX_LAPS_BYTES)}catch{return {laps:0,bestLap:null,track:'',car:'',trackName:'',carName:''};}
  const lines=csv.trim().split(/\r?\n/);
  if(!lines.length)return {laps:0,bestLap:null,track:'',car:'',trackName:'',carName:''};
  const cols=lines[0].split(',').map(x=>x.trim().toLowerCase());
  const idx=k=>cols.indexOf(k);
  const at=(c,k)=>c[idx(k)]||'';
  let count=0,best=Infinity,track='',car='',trackName='',carName='';
  for(const line of lines.slice(1)){
    if(!line.trim())continue;
    const c=line.split(',');
    if(!track)track=at(c,'track');
    if(!car)car=at(c,'car_model');
    if(!trackName)trackName=at(c,'track_name');
    if(!carName)carName=at(c,'car_name');
    const t=at(c,'time');
    let seconds=Number(t);
    if(t.includes(':')){
      const parts=t.split(':').map(Number);
      seconds=parts.length===2?parts[0]*60+parts[1]:NaN;
    }
    if(Number.isFinite(seconds)&&seconds>0&&seconds<600){count++;best=Math.min(best,seconds);}
  }
  return {laps:count,bestLap:Number.isFinite(best)?best:null,track,car,trackName,carName};
}
function sessionInfo(dir,key) {
  const files=filePaths(dir,key);
  if(!fs.existsSync(files.samples)||!fs.existsSync(files.laps))return null;
  const stat=fs.statSync(files.samples);
  if(!stat.isFile())return null;
  const meta=readMeta(files.meta);
  const old=lapSummary(files.laps);
  const track=String(meta.track||old.track||'').slice(0,100);
  const car=String(meta.car||old.car||'').slice(0,100);
  const trackName=String(meta.trackName||old.trackName||nameFromGameId(track)||'Nieznany tor').slice(0,125);
  const carName=String(meta.carName||old.carName||nameFromGameId(car)||'Nieznany samochód').slice(0,125);
  const date=typeof meta.startedAtUtc==='string' && !Number.isNaN(Date.parse(meta.startedAtUtc))
    ? meta.startedAtUtc :dateFromKey(key)||stat.birthtime.toISOString();
  return {
    key,game:'ACC',track,car,trackName,carName,date,
    lapCount:old.laps,bestLap:old.bestLap,
    samplesBytes:stat.size,
    ended:typeof meta.endedAtUtc==='string'&&!!meta.endedAtUtc
  };
}
function listSessions(dir) {
  if(!fs.existsSync(dir))return [];
  const names=fs.readdirSync(dir);
  const keys=names.filter(x=>x.endsWith('_samples.csv'))
    .map(x=>x.slice(0,-12)).filter(x=>KEY.test(x));
  keys.sort((a,b)=>b.localeCompare(a));
  const items=[];
  for(const key of keys.slice(0,MAX_LIST)){
    try{const s=sessionInfo(dir,key);if(s)items.push(s);}catch{}
  }
  return items;
}
function latestSessionKey(dir) {return listSessions(dir)[0]?.key||'';}
function csvSnapshot(file,maxBytes=MAX_CSV_BYTES) {
  const txt=readSmallText(file,maxBytes);
  const last=txt.lastIndexOf('\n');
  if(last===-1)throw Error('Plik nie zawiera pełnego wiersza CSV.');
  return txt.slice(0,last+1);
}
function loadSession(dir,key) {
  const files=filePaths(dir,key);
  if(!fs.existsSync(files.laps)||!fs.existsSync(files.samples))return null;
  return {
    key,
    laps:csvSnapshot(files.laps,MAX_LAPS_BYTES),
    samples:csvSnapshot(files.samples),
  };
}
module.exports={filePaths,listSessions,latestSessionKey,loadSession,dateFromKey};
