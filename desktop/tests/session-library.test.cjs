'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const lib=require('../session-library.cjs');
function setup(t) {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'apx-test-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  return dir;
}
function writeStint(dir,key,opts={}) {
  const laps=opts.laps===false?'lap,time,s1,s2,s3,fuel,tyre_fl,tyre_fr,tyre_rl,tyre_rr,sector_source,track,track_name,car_model,car_name\n':
    'lap,time,s1,s2,s3,fuel,tyre_fl,tyre_fr,tyre_rl,tyre_rr,sector_source,track,track_name,car_model,car_name\n'+
    '1,104.782,20,40,44,50,80,80,80,80,estimated,imola,Imola Autodromo Enzo e Dino Ferrari,ferrari_296_gt3,Ferrari 296 GT3\n'+
    '2,105.310,20,40,45,48,82,82,82,82,estimated,imola,Imola Autodromo Enzo e Dino Ferrari,ferrari_296_gt3,Ferrari 296 GT3\n';
  const samples='timestamp_utc,completed_laps,sector_index,lap_progress,speed_kmh,gas,brake,gear,rpm,fuel\n2026-11-19T21:00:00.000Z,1,2,0.92,245,1,0,6,7700,50\n';
  fs.writeFileSync(path.join(dir,key+'_laps.csv'),laps);
  fs.writeFileSync(path.join(dir,key+'_samples.csv'),samples);
}
test('Automatically recognizes saved stints and sorts newest first',t=>{
  const dir=setup(t);
  writeStint(dir,'acc_20261118_170000_1234');
  writeStint(dir,'acc_20261119_180000_5678');
  const items=lib.listSessions(dir);
  assert.equal(items.length,2);
  assert.equal(items[0].key,'acc_20261119_180000_5678');
  assert.equal(items[0].lapCount,2);
  assert.equal(items[0].bestLap,104.782);
  assert.equal(items[0].trackName,'Imola Autodromo Enzo e Dino Ferrari');
  assert.equal(items[0].carName,'Ferrari 296 GT3');
});
test('Saves an outlap-only stint in history using collector metadata',t=>{
  const dir=setup(t),key='acc_20261119_185000_9999';
  writeStint(dir,key,{laps:false});
  fs.writeFileSync(path.join(dir,key+'_meta.json'),JSON.stringify({
    track:'ks_monza',trackName:'Autodromo Nazionale Monza',
    car:'porsche_992_gt3_r',carName:'Porsche 992 GT3 R',
    startedAtUtc:'2026-11-19T18:50:00Z',endedAtUtc:'2026-11-19T19:00:00Z'
  }));
  const [s]=lib.listSessions(dir);
  assert.equal(s.lapCount,0);
  assert.equal(s.trackName,'Autodromo Nazionale Monza');
  assert.equal(s.carName,'Porsche 992 GT3 R');
  assert.equal(s.ended,true);
  assert.ok(lib.loadSession(dir,key).samples.includes('245'));
});
test('Historical files remain readable without sidecar metadata',t=>{
  const dir=setup(t),key='acc_20261119_180000_5678';
  writeStint(dir,key);
  assert.equal(lib.latestSessionKey(dir),key);
  const loaded=lib.loadSession(dir,key);
  assert.ok(loaded.laps.includes('Ferrari 296 GT3'));
  assert.equal(loaded.samples.split('\n').length,3);
});
test('Ignores invalid keys and blocks path traversal',t=>{
  const dir=setup(t);
  fs.writeFileSync(path.join(dir,'evil_samples.csv'),'arbitrary\n');
  assert.deepEqual(lib.listSessions(dir),[]);
  assert.throws(()=>lib.loadSession(dir,'../../secrets'),/identyfikator/);
  assert.throws(()=>lib.filePaths(dir,'acc_20261119_180000_1234/../../x'),/identyfikator/);
});
test('Reads only full CSV rows when collector is still writing',t=>{
  const dir=setup(t),key='acc_20261119_180000_5678';
  writeStint(dir,key);
  fs.appendFileSync(path.join(dir,key+'_samples.csv'),'unfinished,1,2');
  const loaded=lib.loadSession(dir,key);
  assert.equal(loaded.samples.includes('unfinished'),false);
});
