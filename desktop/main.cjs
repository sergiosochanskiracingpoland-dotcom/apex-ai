'use strict';
const releaseVersion='0.3.5.1';
const {app,BrowserWindow,Menu,shell,dialog,ipcMain,nativeImage}=require('electron');
const {autoUpdater}=require('electron-updater');
const {spawn}=require('node:child_process');
const path=require('node:path');
const fs=require('node:fs');
const library=require('./session-library.cjs');
const preferences=require('./preferences.cjs');

const resources=app.isPackaged?process.resourcesPath:__dirname;
const uiFile=path.join(resources,'ui','index.html');
const collectorFile=app.isPackaged?path.join(resources,'collector','ApexCollector.exe'):
  path.join(__dirname,'collector','publish','ApexCollector.exe');

let win=null,collector=null,outputBuffer='',sessionsDir='',prefsDir='';
let currentKey='';
let collectorState={code:'waiting',text:'ACC not running',laps:0};
let updateState={code:'idle',text:'Checking for updates shortly'};
let isChecking=false,updateReady=false,updateTimer=null;
const VALID_KEY=/^acc_\d{8}_\d{6}_\d{4,6}$/;
const UPDATE_HOURS=4;

function send(channel,message){
  if(win&&!win.isDestroyed()&&!win.webContents.isDestroyed())win.webContents.send(channel,message);
}
function collectorUpdate(code,text,other={}){
  collectorState={...collectorState,code,text,...other};
  send('apex:collector',{...collectorState,sessionKey:currentKey});
}
function updaterUpdate(code,text){
  updateState={code,text};
  send('apex:updates',updateState);
}
function handleLine(line){
  const parts=line.trim().split('|'),event=parts[0],detail=parts[1]||'';
  if(event==='STATE')collectorUpdate(detail,parts.slice(2).join('|'));
  else if(event==='SESSION'&&VALID_KEY.test(detail)){
    currentKey=detail;collectorUpdate('recording','Recording ACC telemetry',{laps:0});
  }else if(event==='LAP'){
    const lap=Number(detail);
    collectorUpdate('recording','Lap '+(Number.isFinite(lap)?lap:'')+' recorded',{laps:lap});
    send('apex:collector',{...collectorState,sessionKey:currentKey,refresh:true});
  }else if(event==='CLOSED'){
    send('apex:collector',{...collectorState,sessionKey:currentKey,refresh:true});
    collectorUpdate('connected','Stint archived to History');
  }else if(event==='ERROR'){
    collectorUpdate('error','ACC telemetry: '+detail.slice(0,150));
  }
}
function startCollector(){
 if(!fs.existsSync(collectorFile)){
  collectorUpdate('error','ApexCollector.exe missing from this installation');return;
 }
 try{
  collector=spawn(collectorFile,[],{windowsHide:true,stdio:['ignore','pipe','pipe'],
   env:{...process.env,APEX_SESSIONS_DIR:sessionsDir}});
  collector.stdout.on('data',chunk=>{
   outputBuffer+=chunk.toString('utf8');
   let n;
   while((n=outputBuffer.indexOf('\n'))>=0){
    const line=outputBuffer.slice(0,n);outputBuffer=outputBuffer.slice(n+1);
    if(line.trim())handleLine(line);
   }
   if(outputBuffer.length>20000)outputBuffer='';
  });
  collector.stderr.on('data',chunk=>collectorUpdate('error',chunk.toString('utf8').slice(0,160)));
  collector.on('error',e=>collectorUpdate('error','Failed to start ACC collector: '+e.message));
  collector.on('exit',code=>{
   collector=null;
   if(!app.isQuitting&&code!==0)collectorUpdate('error','ACC collector exited with code '+code);
  });
 }catch(e){collectorUpdate('error',String(e.message||e));}
}
function stopCollector(){if(collector){try{collector.kill();}catch{}collector=null;}}
function checkUpdates(){
 if(!app.isPackaged){updaterUpdate('development','Updater works in installed builds');return;}
 if(isChecking||updateReady)return;
 isChecking=true;updaterUpdate('checking','Checking for updates…');
 autoUpdater.checkForUpdates().catch(e=>updaterUpdate('error','Update check failed: '+e.message.slice(0,180)))
  .finally(()=>{isChecking=false;});
}
function installUpdate(){
 if(!updateReady)return false;
 stopCollector();
 setImmediate(()=>autoUpdater.quitAndInstall(false,true));
 return true;
}
function configureUpdater(){
 autoUpdater.autoDownload=true;
 autoUpdater.autoInstallOnAppQuit=true;
 autoUpdater.allowPrerelease=false;
 autoUpdater.on('checking-for-update',()=>updaterUpdate('checking','Checking for updates…'));
 autoUpdater.on('update-not-available',()=>updaterUpdate('current','Apex AI '+releaseVersion+' is up to date'));
 autoUpdater.on('update-available',info=>updaterUpdate('available','Version '+info.version+' available — downloading'));
 autoUpdater.on('download-progress',info=>updaterUpdate('downloading','Downloading '+Math.round(info.percent)+'%'));
 autoUpdater.on('error',e=>updaterUpdate('error','Update error: '+e.message.slice(0,180)));
 autoUpdater.on('update-downloaded',async info=>{
  updateReady=true;
  updaterUpdate('ready','Version '+info.version+' ready to install');
  if(!win||win.isDestroyed())return;
  const answer=await dialog.showMessageBox(win,{type:'question',title:'Apex AI update',
   message:'Apex AI '+info.version+' is ready.',
   detail:'Install now? Your current ACC session will close. If you choose Later, the update installs after quitting.',
   buttons:['Install and restart','Later'],defaultId:1,cancelId:1});
  if(answer.response===0)installUpdate();
 });
 setTimeout(checkUpdates,12000);
 updateTimer=setInterval(checkUpdates,UPDATE_HOURS*3600*1000);
}
function sampleFromFile(key){
 if(!VALID_KEY.test(key))return null;
 const file=path.join(sessionsDir,key+'_samples.csv');
 if(!fs.existsSync(file))return null;
 const f=fs.openSync(file,'r');
 try{
  const stat=fs.fstatSync(f);
  if(stat.size<150)return null;
  const length=Math.min(stat.size,65536),buf=Buffer.alloc(length);
  fs.readSync(f,buf,0,length,stat.size-length);
  const text=buf.toString('utf8');
  const lines=text.split(/\r?\n/);
  // Last line may be partial while the collector is writing.
  let line='';
  for(let i=lines.length-1;i>=0;i--){
   const part=lines[i];if(part&&part.startsWith('20')&&part.split(',').length===30){line=part;break;}
  }
  if(!line)return null;
  const cols=line.split(',');
  const names=['timestamp_utc','completed_laps','sector_index','lap_progress','speed_kmh','gas','brake',
    'gear','rpm','fuel','tyre_fl','tyre_fr','tyre_rl','tyre_rr','pressure_fl','pressure_fr',
    'pressure_rl','pressure_rr','steer_input','g_x','g_y','g_z','tc_action','abs_action',
    'tyre_wear_fl_raw','tyre_wear_fr_raw','tyre_wear_rl_raw','tyre_wear_rr_raw','in_pit','physics_packet_id'];
  const sample={};
  for(let i=0;i<names.length;i++){
   const value=Number(cols[i]);
   sample[names[i]]=i===0?cols[i]:(cols[i]===''||!Number.isFinite(value)?null:value);
  }
  if(!Number.isFinite(Date.parse(sample.timestamp_utc)))return null;
  return sample;
 }finally{fs.closeSync(f);}
}
function liveTelemetry(){
 const active=collectorState.code==='recording'&&VALID_KEY.test(currentKey);
 if(!active)return {active:false,key:currentKey};
 try{
  const sample=sampleFromFile(currentKey);
  const age=sample?Date.now()-Date.parse(sample.timestamp_utc):Infinity;
  if(age<0||age>4000)return {active:false,key:currentKey};
  return {active:true,key:currentKey,sample};
 }catch{return {active:false,key:currentKey};}
}
function trustedExternal(url){
 try{
  const u=new URL(url);
  if(u.protocol!=='https:')return false;
  return ['github.com','commons.wikimedia.org','creativecommons.org'].includes(u.hostname);
 }catch{return false;}
}
function createWindow(){
 if(!fs.existsSync(uiFile)){
  dialog.showErrorBox('Apex AI','Missing desktop UI resources. Reinstall Apex AI.');app.quit();return;
 }
 win=new BrowserWindow({
  title:'Apex AI '+releaseVersion,width:1450,height:960,minWidth:900,minHeight:650,
  show:false,frame:false,backgroundColor:'#090a0f',autoHideMenuBar:true,
  webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,
   preload:path.join(__dirname,'preload.cjs')}
 });
 Menu.setApplicationMenu(null);
 win.webContents.setWindowOpenHandler(({url})=>{
  if(trustedExternal(url))void shell.openExternal(url);
  return {action:'deny'};
 });
 win.webContents.on('will-navigate',(e,url)=>{
  if(url!==win.webContents.getURL())e.preventDefault();
 });
 win.once('ready-to-show',()=>win.show());
 win.loadFile(uiFile);
 win.webContents.on('did-finish-load',()=>{
  send('apex:collector',{...collectorState,sessionKey:currentKey});
  send('apex:updates',updateState);
 });
}
function wrapError(f){return async(...args)=>{try{return await f(...args);}catch(e){return {error:String(e.message||e)};}};}
ipcMain.handle('apex:list-sessions',wrapError(()=>library.listSessions(sessionsDir)));
ipcMain.handle('apex:load-session',wrapError((_evt,key)=>library.loadSession(sessionsDir,key)));
ipcMain.handle('apex:load-latest',wrapError(()=>{
 const key=library.latestSessionKey(sessionsDir);
 return key?library.loadSession(sessionsDir,key):null;
}));
ipcMain.handle('apex:get-live',wrapError(liveTelemetry));
ipcMain.handle('apex:get-status',()=>({collector:collectorState,updates:updateState,version:releaseVersion}));
ipcMain.handle('apex:check-updates',()=>{checkUpdates();return true;});
ipcMain.handle('apex:install-update',()=>installUpdate());
ipcMain.handle('apex:window-action',(_e,action)=>{
 if(!win||win.isDestroyed())return false;
 if(action==='minimize')win.minimize();
 else if(action==='maximize'){if(win.isMaximized())win.unmaximize();else win.maximize();}
 else if(action==='close')win.close();
 else return false;
 return true;
});
ipcMain.handle('apex:open-folder',wrapError(()=>shell.openPath(sessionsDir)));
ipcMain.handle('apex:prefs-get',wrapError(()=>preferences.read(prefsDir)));
ipcMain.handle('apex:prefs-save',wrapError((_event,values)=>preferences.write(prefsDir,values)));
ipcMain.handle('apex:prefs-wallpaper',wrapError(async()=>{
 const result=await dialog.showOpenDialog(win,{title:'Select Apex AI wallpaper',
  properties:['openFile'],filters:[{name:'Images',extensions:['jpg','jpeg','png','webp']}]});
 if(result.canceled||!result.filePaths.length)return null;
 const data=preferences.fromImage(result.filePaths[0]);
 if(nativeImage.createFromDataURL(data).isEmpty())throw Error('Cannot decode selected wallpaper.');
 return {data};
}));
ipcMain.handle('apex:prefs-export',wrapError(async()=>{
 const saved=preferences.read(prefsDir);
 const selection=await dialog.showSaveDialog(win,{title:'Export Apex AI settings',
  defaultPath:'ApexAI-preferences.json',filters:[{name:'JSON',extensions:['json']}]});
 if(selection.canceled||!selection.filePath)return null;
 fs.writeFileSync(selection.filePath,JSON.stringify(saved,null,2),'utf8');
 return {path:selection.filePath};
}));
ipcMain.handle('apex:prefs-import',wrapError(async()=>{
 const selection=await dialog.showOpenDialog(win,{title:'Import Apex AI settings',
  properties:['openFile'],filters:[{name:'JSON',extensions:['json']}]});
 if(selection.canceled||!selection.filePaths.length)return null;
 const file=selection.filePaths[0],stat=fs.statSync(file);
 if(stat.size>11_500_000)throw Error('Settings file is too large.');
 const incoming=JSON.parse(fs.readFileSync(file,'utf8'));
 const cfg=preferences.write(prefsDir,incoming);
 return {preferences:cfg};
}));
app.whenReady().then(()=>{
 sessionsDir=path.join(app.getPath('documents'),'ApexAI','sessions');
 prefsDir=path.join(app.getPath('userData'),'settings');
 fs.mkdirSync(sessionsDir,{recursive:true});
 currentKey=library.latestSessionKey(sessionsDir);
 createWindow();
 startCollector();
 configureUpdater();
 app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});
});
app.on('before-quit',()=>{app.isQuitting=true;stopCollector();if(updateTimer)clearInterval(updateTimer);});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
