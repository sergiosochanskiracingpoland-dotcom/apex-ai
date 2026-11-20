'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const prefs=require('../preferences.cjs');

const appJS=fs.readFileSync(path.resolve(__dirname,'../ui/app.js'),'utf8');
const analysisJS=fs.readFileSync(path.resolve(__dirname,'../ui/analysis.js'),'utf8');
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
  progress>.36&&progress<.4?0.7:0,4,6200,53-lap*2,80,82,84,86,26,26,26,26,.03,0,0,0,0,0,0,0,0,0,0,lap*150+i];
  lines.push(v.join(','));
 }
 return {key:'acc_20261120_190000_1234',laps,samples:lines.join('\n')+'\n'};
}
async function makeDom(config={},withStint=true) {
 const window=new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>',
  {url:'file:///C:/Apex/ui/index.html',runScripts:'dangerously',pretendToBeVisual:true}).window;
 const fixture=data(),sessions=withStint?[{key:fixture.key,game:'ACC',lapCount:2,bestLap:104.782,
  trackName:'Imola',carName:'Ferrari 296 GT3',date:'2026-11-20T19:00:00Z'}]:[];
 let state=prefs.normalize(config);
 const saves=[];
 window.apexDesktop={
  version:'0.3.4',
  getPreferences:async()=>state,
  savePreferences:async v=>{state=prefs.normalize(v);saves.push(state);return state;},
  listSessions:async()=>sessions,
  loadSession:async()=>fixture,
  getStatus:async()=>({collector:{code:'waiting',text:'ACC not running'},updates:{code:'current',text:'Up to date'}}),
  getLiveTelemetry:async()=>({active:false}),
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
 window.eval(appJS);
 await new Promise(r=>setTimeout(r,100));
 return {window,getSaves:()=>saves};
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
 d.querySelector('[data-nav="settings"]').click();
 assert.ok(d.querySelector('[data-pref="language"]'));
 assert.ok(d.querySelector('[data-pref="wallpaper"]')===null);
 assert.ok(d.querySelector('[data-wallpaper="wec"]'));
 assert.ok(d.querySelector('[data-action="choose-wallpaper"]'));
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
