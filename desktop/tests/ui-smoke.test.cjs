'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const prefs=require('../preferences.cjs');

const appJS=fs.readFileSync(path.resolve(__dirname,'../ui/app.js'),'utf8');
const analysisJS=fs.readFileSync(path.resolve(__dirname,'../ui/analysis.js'),'utf8');
const samplingJS=fs.readFileSync(path.resolve(__dirname,'../ui/sampling.js'),'utf8');
const sampleHeader='timestamp_utc,completed_laps,sector_index,lap_progress,speed_kmh,gas,brake,gear,rpm,fuel,tyre_fl,tyre_fr,tyre_rl,tyre_rr,pressure_fl,pressure_fr,pressure_rl,pressure_rr,steer_input,g_x,g_y,g_z,tc_action,abs_action,tyre_wear_fl_raw,tyre_wear_fr_raw,tyre_wear_rl_raw,tyre_wear_rr_raw,in_pit,physics_packet_id';
function data() {
 const laps='lap,time,s1,s2,s3,fuel,tyre_fl,tyre_fr,tyre_rl,tyre_rr,sector_source,track,track_name,car_model,car_name\n'+
 '1,104.782,22.4,33.2,49.1,54,78,79,80,81,estimated,imola,Imola Autodromo Enzo e Dino Ferrari,ferrari_296_gt3,Ferrari 296 GT3\n'+
 '2,105.123,22.8,33.1,49.2,51,79,80,82,83,estimated,imola,Imola Autodromo Enzo e Dino Ferrari,ferrari_296_gt3,Ferrari 296 GT3\n';
 const start=Date.UTC(2026,10,20,19,0,0);
 let lines=[sampleHeader];
 for(let lap=0;lap<3;lap++)for(let i=0;i<150;i++) {
  const progress=i/149,sec=progress<.4?0:progress<.7?1:2;
  const v=[new Date(start+lap*120000+i*760).toISOString(),lap,sec,progress.toFixed(4),
  (120+130*Math.abs(Math.sin(progress*9))).toFixed(2),progress>.5?1:.5,
  progress>.36&&progress<.4?0.7:0,[0,1,2,7][i%4],6200,53-lap*2,80,82,84,86,26,26,26,26,.03,0,0,0,0,0,0,0,0,0,0,lap*150+i];
  lines.push(v.join(','));
 }
 return {key:'acc_20261120_190000_1234',laps,samples:lines.join('\n')+'\n'};
}
async function makeDom(config={},withStint=true,liveSample=null) {
 const window=new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>',
  {url:'file:///C:/Apex/ui/index.html',runScripts:'dangerously',pretendToBeVisual:true}).window;
 const fixture=data(),sessions=withStint?[{key:fixture.key,game:'ACC',lapCount:2,bestLap:104.782,
  trackName:'Imola',carName:'Ferrari 296 GT3',date:'2026-11-20T19:00:00Z',raceId:'acc_20261120_190000_9999',sessionType:2}]:[];
 let state=prefs.normalize(config);
 const saves=[];let launches=0;
 const raceId='acc_20261120_190000_9999';
 const race={schemaVersion:1,id:raceId,track:'imola',car:'ferrari_296_gt3',sessionType:2,
 stints:[fixture.key],positions:[{atUtc:'2026-11-20T19:00:00Z',lap:0,position:7},{atUtc:'2026-11-20T19:17:00Z',lap:8,position:3}],
 pitStops:[{entryAtUtc:'2026-11-20T19:04:00Z',exitAtUtc:'2026-11-20T19:05:00Z',entryLap:2,laneSeconds:60,stationarySeconds:20,fuelAddedLitres:38,tyreCompoundBefore:'DHE',tyreCompoundAfter:'DHE'}]};
 window.apexDesktop={
  version:'0.3.6.5',
  getPreferences:async()=>state,
  savePreferences:async v=>{state=prefs.normalize(v);saves.push(state);return state;},
  listSessions:async()=>sessions,
  listRaces:async()=>withStint?[{id:raceId,track:'imola',car:'ferrari_296_gt3',date:'2026-11-20T19:00:00Z',pitCount:1,stintCount:1}]:[],
  loadRace:async()=>race,
  launchGame:async game=>{if(game==='acc')launches++;return {requested:true,game};},
  loadSession:async()=>fixture,
  getStatus:async()=>({collector:{code:liveSample?'recording':'waiting',text:'ACC status'},updates:{code:'current',text:'Up to date'}}),
  getLiveTelemetry:async()=>({active:!!liveSample,sample:liveSample}),
  checkUpdates:async()=>true,
  installUpdate:async()=>false,
  openSessionsFolder:async()=>null,
  windowAction:async()=>true,
  onCollector:()=>()=>{},
  onUpdates:()=>()=>{},
  chooseWallpaper:async()=>null,
  exportPreferences:async()=>null,
  importPreferences:async()=>null
 };
 window.eval(analysisJS);
 window.eval(samplingJS);
 window.eval(appJS);
 await new Promise(r=>setTimeout(r,100));
 return {window,getSaves:()=>saves,getLaunches:()=>launches};
}
test('Fresh installation has a functional first-run wizard and completes setup',async t=>{
 const {window,getSaves}=await makeDom({setupComplete:false,driver:'Tester'},false);
 t.after(()=>window.close());
 const root=window.document;
 assert.match(root.querySelector('#page').textContent,/KROK 1\/3/);
 root.querySelector('[data-action="onboard-next"]').click();
 assert.match(root.querySelector('#page').textContent,/KROK 2\/3/);
 root.querySelector('[data-action="onboard-next"]').click();
 assert.match(root.querySelector('#page').textContent,/KROK 3\/3/);
 root.querySelector('[data-action="onboard-finish"]').click();
 await new Promise(r=>setTimeout(r,60));
 assert.match(root.querySelector('#page').textContent,/Witaj/);
 assert.ok(getSaves().some(x=>x.setupComplete===true));
});
test('Dashboard, history report and settings all render using new UI',async t=>{
 const {window}=await makeDom({setupComplete:true,driver:'Driver',language:'pl'});
 t.after(()=>window.close());
 const d=window.document;
 assert.ok(d.querySelector('.titlebar'));assert.ok(d.querySelector('.layout'));
 d.querySelector('[data-nav="history"]').click();
 assert.match(d.querySelector('#page').textContent,/Imola/);
 d.querySelector('[data-open]').click();
 await new Promise(r=>setTimeout(r,100));
 assert.match(d.querySelector('#page').textContent,/Pełny raport/);
 assert.ok(d.querySelector('[data-widget="race"]'));
 assert.ok(d.querySelector('[data-widget="quality"]'));
 assert.match(d.querySelector('[data-widget="quality"]').textContent,/75 Hz/);
 const quality=d.querySelector('[data-widget="quality"]').textContent;
 assert.match(quality,/Zapisane próbki na sekundę/);
 assert.match(quality,/Nowe dane z ACC na sekundę/);
 assert.match(quality,/Odczyty tych samych danych/);
 assert.match(quality,/Odstęp dla 95% odczytów/);
 const gear=[...d.querySelectorAll('#page .metric small')].find(x=>x.textContent==='Najwyższy użyty bieg');
 assert.equal(gear.nextElementSibling.textContent,'6');
 d.querySelector('[data-nav="settings"]').click();
 assert.ok(d.querySelector('[data-pref="language"]'));
 assert.ok(d.querySelector('[data-pref="wallpaper"]')===null);
 assert.ok(d.querySelector('[data-wallpaper="wec"]'));
 assert.ok(d.querySelector('[data-action="choose-wallpaper"]'));
});
test('History refresh and opening a new renderer keep one card per saved stint',async t=>{
 const config={setupComplete:true,language:'pl'};
 for(let reload=0;reload<2;reload++){
  const {window}=await makeDom(config);
  t.after(()=>window.close());
  const document=window.document;
  for(let refresh=0;refresh<3;refresh++){
   document.querySelector('[data-nav="dashboard"]').click();
   document.querySelector('[data-nav="history"]').click();
   await new Promise(resolve=>setTimeout(resolve,30));
   const entries=document.querySelectorAll('#page [data-open]');
   assert.equal(entries.length,1);
   assert.equal(entries[0].dataset.open,data().key);
  }
 }
});
test('Switching to English updates all navigation and settings',async t=>{
 const {window}=await makeDom({setupComplete:true,driver:'Max',language:'en'});
 t.after(()=>window.close());
 const d=window.document;
 assert.match(d.querySelector('#page').textContent,/Welcome, Max/);
 d.querySelector('[data-nav="settings"]').click();
 assert.match(d.querySelector('#page').textContent,/Settings/);
 assert.match(d.querySelector('#page').textContent,/Export settings/);
});
test('Live view shows no invented measurements when ACC is disconnected',async t=>{
 const {window}=await makeDom({setupComplete:true,driver:'Max',language:'en'},false);
 t.after(()=>window.close());
 const d=window.document;
 d.querySelector('[data-nav="live"]').click();
 assert.match(d.querySelector('#live-conn').textContent,/Waiting/);
 assert.equal(d.querySelector('#live-speed').textContent,'—');
});

test('CC0 wallpaper is loaded from local package, not external Wikimedia URLs',async t=>{
 const {window}=await makeDom({setupComplete:true,wallpaper:'none'},false);
 t.after(()=>window.close());
 const d=window.document;
 d.querySelector('[data-nav="settings"]').click();
 assert.equal(d.querySelectorAll('[data-wallpaper]').length,8);
 d.querySelector('[data-wallpaper="gt3"]').click();
 const background=d.getElementById('wallpaper').style.backgroundImage;
 assert.match(background,/wallpapers\/gt3\.jpg/);
 assert.doesNotMatch(background,/wikimedia\.org/);
 const preview=d.getElementById('wallpaper-preview-image').style.backgroundImage;
 assert.match(preview,/wallpapers\/gt3\.jpg/);
});
test('Blur/brightness/saturation/opacity update wallpaper visibly and reset to defaults',async t=>{
 const {window,getSaves}=await makeDom({setupComplete:true,wallpaper:'wec',blur:6,brightness:78},false);
 t.after(()=>window.close());
 const d=window.document;
 d.querySelector('[data-nav="settings"]').click();
 const slider=d.querySelector('[data-pref="blur"]');
 slider.value='18';
 slider.dispatchEvent(new window.Event('input',{bubbles:true}));
 assert.match(d.getElementById('wallpaper').style.filter,/blur\(18px\)/);
 assert.match(d.getElementById('wallpaper-preview-image').style.filter,/blur\(6px\)/);
 const bright=d.querySelector('[data-pref="brightness"]');
 bright.value='95';
 bright.dispatchEvent(new window.Event('input',{bubbles:true}));
 assert.match(d.getElementById('wallpaper').style.filter,/brightness\(0\.95\)/);
 d.querySelector('[data-action="reset-wallpaper"]').click();
 assert.match(d.getElementById('wallpaper').style.filter,/blur\(6px\)/);
 assert.match(d.getElementById('wallpaper').style.filter,/brightness\(0\.78\)/);
 await new Promise(r=>setTimeout(r,300));
 assert.equal(getSaves().at(-1).blur,6);
 assert.equal(getSaves().at(-1).brightness,78);
});
test('Existing 0.3.4 wallpaper preference remains compatible',()=>{
 const old=prefs.normalize({version:1,wallpaper:'gt3',brightness:35});
 assert.equal(old.wallpaper,'gt3');
 assert.equal(old.brightness,35);
 const added=prefs.normalize({wallpaper:'f1b'});
 assert.equal(added.wallpaper,'f1b');
});

test('ACC live telemetry displays reverse, neutral and all six forward gears',async t=>{
 const sample={speed_kmh:40,gear:0};
 const {window}=await makeDom({setupComplete:true},false,sample);
 t.after(()=>window.close());
 const d=window.document;
 d.querySelector('[data-nav="live"]').click();
 for(const [raw,label] of [[0,'R'],[1,'N'],[2,'1'],[3,'2'],[4,'3'],[5,'4'],[6,'5'],[7,'6'],[null,'—']]){
  sample.gear=raw;
  await new Promise(r=>setTimeout(r,180));
  assert.equal(d.querySelector('#live-gear').textContent,label);
 }
});
test('English report explains the four sampling measurements',async t=>{
 const {window}=await makeDom({setupComplete:true,language:'en'});
 t.after(()=>window.close());
 const d=window.document;
 d.querySelector('[data-nav="history"]').click();
 d.querySelector('[data-open]').click();
 await new Promise(r=>setTimeout(r,100));
 const quality=d.querySelector('[data-widget="quality"]').textContent;
 assert.match(quality,/Saved samples per second/);
 assert.match(quality,/New ACC updates per second/);
 assert.match(quality,/Reads of the same data/);
 assert.match(quality,/Gap for 95% of reads/);
});
test('Race view shows observed pit lane time, position changes and linked stint',async t=>{
 const {window}=await makeDom({setupComplete:true,driver:'Tester'});
 t.after(()=>window.close());
 const d=window.document;
 d.querySelector('[data-nav="raceView"]').click();
 await new Promise(r=>setTimeout(r,140));
 const page=d.querySelector('#page');
 assert.match(page.textContent,/Analiza wyścigu/);
 assert.match(page.textContent,/60,0 s|60.0 s|60 s/);
 assert.match(page.textContent,/38,0 L|38.0 L|38 L/);
 assert.match(page.textContent,/P7/);
 assert.match(page.textContent,/P3/);
 assert.match(page.textContent,/Wymiana opon: niepotwierdzona/);
 assert.match(page.textContent,/Naprawy: brak danych/);
 assert.ok(page.querySelector('[data-open]'));
 d.querySelector('[data-nav="history"]').click();
 assert.ok(d.querySelector('[data-open-race]'),'history links race report');
});
test('Drive sends launch request and does not claim ACC actually connected',async t=>{
 const {window,getLaunches}=await makeDom({setupComplete:true},false);
 t.after(()=>window.close());
 const d=window.document;
 d.querySelector('[data-nav="drive"]').click();
 assert.match(d.querySelector('#page').textContent,/Uruchom ACC przez Steam/);
 d.querySelector('[data-action="launch-acc"]').click();
 await new Promise(r=>setTimeout(r,60));
 assert.equal(getLaunches(),1);
 assert.match(d.querySelector('#page').textContent,/Oczekiwanie na wykrycie ACC/);
});
