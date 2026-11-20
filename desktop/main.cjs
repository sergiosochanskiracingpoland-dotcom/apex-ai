'use strict';
const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const sessionLibrary = require('./session-library.cjs');

const resources = app.isPackaged ? process.resourcesPath : __dirname;
const dashboardPath = app.isPackaged
  ? path.join(resources, 'dashboard', 'index.html')
  : path.resolve(__dirname, '..', 'archive', '0.2.15', 'index.html');
const bridgePath = app.isPackaged
  ? path.join(resources, 'dashboard', 'bridge.js')
  : path.join(__dirname, 'bridge.js');
const shellStylePath = app.isPackaged
  ? path.join(resources, 'dashboard', 'shell.css')
  : path.join(__dirname, 'shell.css');
const collectorPath = app.isPackaged
  ? path.join(resources, 'collector', 'ApexCollector.exe')
  : path.join(__dirname, 'collector', 'publish', 'ApexCollector.exe');
let win, collector = null, outputBuffer = '';
let currentKey = '', currentState = { code:'waiting', text:'Uruchom ACC, aby rozpocząć nagrywanie', laps:0 };
let updateStatus = {code:'idle', text:'Sprawdzanie aktualizacji po uruchomieniu'};
let updateTimer = null, isChecking = false;
let sessionsDir = '';
const MAX_FILE_BYTES = 70 * 1024 * 1024;
const safeKey = /^acc_\d{8}_\d{6}_\d{4,6}$/;

function send(channel, data) {
  if (win && !win.isDestroyed() && !win.webContents.isDestroyed())
    win.webContents.send(channel, data);
}
function setCollector(code, text, extras = {}) {
  currentState = { ...currentState, code, text, ...extras };
  send('apex:collector', { ...currentState, sessionKey:currentKey });
}
function setUpdate(code, text) {
  updateStatus = { code, text };
  send('apex:updates', updateStatus);
}
function keyPaths(key) {
  if (!safeKey.test(key)) return null;
  return {
    laps: path.join(sessionsDir, key + '_laps.csv'),
    samples: path.join(sessionsDir, key + '_samples.csv')
  };
}
function latestSession() { return sessionLibrary.latestSessionKey(sessionsDir); }
function csvSnapshot(file) {
  const stat = fs.statSync(file);
  if (stat.size > MAX_FILE_BYTES) throw new Error('Sesja jest za duża (>70 MB).');
  let csv = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/,'');
  const lastNewline = csv.lastIndexOf('\n');
  if (lastNewline < 0) throw new Error('Plik CSV nie ma pełnego wiersza.');
  if (lastNewline < csv.length-1) csv = csv.slice(0,lastNewline+1);
  return csv;
}
async function loadLatest() {
  const key = currentKey || latestSession();
  const pair = keyPaths(key);
  if (!pair || !fs.existsSync(pair.laps) || !fs.existsSync(pair.samples)) return null;
  const laps = csvSnapshot(pair.laps), samples = csvSnapshot(pair.samples);
  if (laps.trim().split('\n').length < 2 || samples.trim().split('\n').length < 100) return null;
  return { key, laps, samples };
}
function handleCollectorLine(line) {
  const parts = line.trim().split('|');
  const tag = parts[0], value = parts[1] || '';
  if (tag === 'STATE') {
    setCollector(value, parts.slice(2).join('|') || value);
  } else if (tag === 'SESSION' && safeKey.test(value)) {
    currentKey = value;
    setCollector('recording', 'Nagrywanie sesji ACC', {laps:0});
  } else if (tag === 'LAP') {
    const lap = Number(value);
    setCollector('recording', 'Okrążenie ' + (Number.isFinite(lap)?lap:'') + ' zapisane — odświeżam analizę', {laps:lap});
    send('apex:collector', { ...currentState, sessionKey:currentKey, refresh:true });
  } else if (tag === 'CLOSED') {
    send('apex:collector', { ...currentState, sessionKey:currentKey, refresh:true });
    setCollector('connected', 'Sesja zakończona; dane zapisane');
  } else if (tag === 'ERROR') {
    setCollector('warning', 'Ponawiam odczyt ACC: '+value.slice(0,150));
  }
}
function consumeOutput(chunk) {
  outputBuffer += chunk.toString('utf8');
  let pos;
  while ((pos = outputBuffer.indexOf('\n')) >= 0) {
    const line = outputBuffer.slice(0,pos);
    outputBuffer = outputBuffer.slice(pos+1);
    if (line.trim()) handleCollectorLine(line);
  }
  if (outputBuffer.length > 20000) outputBuffer = '';
}
function startCollector() {
  if (!fs.existsSync(collectorPath)) {
    setCollector('error','Brak ApexCollector.exe — instalacja aplikacji jest niekompletna.');
    return;
  }
  try {
    collector = spawn(collectorPath, [], {
      windowsHide:true, stdio:['ignore','pipe','pipe'],
      env:{ ...process.env, APEX_SESSIONS_DIR:sessionsDir }
    });
    collector.stdout.on('data', consumeOutput);
    collector.stderr.on('data', chunk => {
      const text = chunk.toString('utf8').trim();
      if (text) setCollector('warning',text.slice(0,160));
    });
    collector.on('error', error => setCollector('error','Nie można uruchomić kolektora: '+error.message));
    collector.on('exit', code => {
      collector=null;
      if (!app.isQuitting && code !== 0) setCollector('error','Rejestrator został zatrzymany (kod '+code+').');
    });
  } catch (error) {
    setCollector('error',String(error.message));
  }
}
function stopCollector() {
  if (!collector) return;
  try { collector.kill(); } catch {}
  collector = null;
}
function checkUpdates() {
  if (!app.isPackaged) { setUpdate('development','Sprawdzanie aktualizacji działa po instalacji wersji Setup.'); return; }
  if (isChecking) return;
  isChecking=true;
  setUpdate('checking','Sprawdzam aktualizacje…');
  autoUpdater.checkForUpdates()
    .catch(error => setUpdate('error','Nie udało się sprawdzić aktualizacji: '+error.message.slice(0,160)))
    .finally(() => { isChecking=false; });
}
function configureUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;
  autoUpdater.on('checking-for-update', () => setUpdate('checking','Sprawdzam aktualizacje…'));
  autoUpdater.on('update-not-available', () => setUpdate('current','Masz aktualną wersję '+app.getVersion()));
  autoUpdater.on('update-available', data => setUpdate('available','Dostępna wersja '+data.version+' — pobieranie…'));
  autoUpdater.on('download-progress', data => setUpdate('downloading','Pobieranie aktualizacji: '+Math.round(data.percent)+'%'));
  autoUpdater.on('error', error => setUpdate('error','Aktualizacja nie powiodła się: '+error.message.slice(0,150)));
  autoUpdater.on('update-downloaded', async data => {
    setUpdate('ready','Wersja '+data.version+' pobrana. Gotowa do instalacji.');
    if (!win || win.isDestroyed()) return;
    const response = await dialog.showMessageBox(win, {
      type:'question', title:'Aktualizacja Apex AI',
      message:'Nowa wersja Apex AI '+data.version+' została pobrana.',
      detail:'Zainstalować teraz? Bieżąca sesja zostanie zamknięta. Jeżeli wybierzesz „Później”, aktualizacja zainstaluje się po zakończeniu pracy.',
      buttons:['Zainstaluj i uruchom ponownie','Później'],defaultId:1,cancelId:1,noLink:true
    });
    if (response.response === 0) {
      stopCollector();
      setImmediate(() => autoUpdater.quitAndInstall(false, true));
    }
  });
  // Do not block the first application start with a network request.
  setTimeout(checkUpdates, 12000);
  updateTimer = setInterval(checkUpdates, 4 * 60 * 60 * 1000);
}
function createWindow() {
  if (!fs.existsSync(dashboardPath) || !fs.existsSync(bridgePath) || !fs.existsSync(shellStylePath)) {
    dialog.showErrorBox('Apex AI','Brak plików aplikacji. Zainstaluj program ponownie.');
    app.quit(); return;
  }
  win = new BrowserWindow({
    title:'Apex AI 0.3.3 — Race Engineer', width:1400,height:960,minWidth:850,minHeight:600,
    backgroundColor:'#090e18',show:false,
    webPreferences:{
      nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,
      preload:path.join(__dirname,'preload.cjs')
    }
  });
  win.webContents.setWindowOpenHandler(({url}) => {
    if (/^https:\/\//i.test(url) && url.startsWith('https://github.com/'))
      shell.openExternal(url);
    return {action:'deny'};
  });
  win.webContents.on('will-navigate',(event,url) => {
    if (url !== win.webContents.getURL()) event.preventDefault();
  });
  // Show the window after the new desktop shell is injected, avoiding a legacy UI flash.
  win.webContents.on('did-finish-load', async () => {
    try {
      await win.webContents.insertCSS(fs.readFileSync(shellStylePath,'utf8'));
      await win.webContents.executeJavaScript(fs.readFileSync(bridgePath,'utf8'));
      if (!win.isVisible()) win.show();
      send('apex:collector',{...currentState,sessionKey:currentKey,refresh:true});
      send('apex:updates',updateStatus);
    } catch (error) {
      dialog.showErrorBox('Apex AI — interfejs',error.message);
    }
  });
  win.loadFile(dashboardPath);
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {label:'Apex AI',submenu:[
      {label:'Odśwież',accelerator:'F5',click:()=>win.reload()},
      {label:'Otwórz folder sesji ACC',click:()=>shell.openPath(sessionsDir)},
      {type:'separator'},
      {label:'Sprawdź aktualizacje',click:checkUpdates},
      {type:'separator'},{label:'Zamknij',role:'quit'}
    ]},
    {label:'Widok',submenu:[
      {role:'zoomIn'},{role:'zoomOut'},{role:'resetZoom'},
      {type:'separator'},{role:'togglefullscreen'}
    ]},
    {label:'Pomoc',submenu:[
      {label:'Repozytorium Apex AI',click:()=>shell.openExternal('https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai')},
      {label:'O programie',click:()=>dialog.showMessageBox(win,{type:'info',message:'Apex AI 0.3.3',detail:'Nowy interfejs, automatyczna biblioteka stintów i pełny podgląd zapisanej telemetrii. Rejestracja ACC działa w tle; uruchamianie gry z aplikacji pojawi się później.'})}
    ]}
  ]));
}
ipcMain.handle('apex:load-latest', async () => {
  try { return await loadLatest(); }
  catch (error) { return {error:error.message}; }
});
ipcMain.handle('apex:list-sessions', async () => {
  try { return sessionLibrary.listSessions(sessionsDir); }
  catch (e) { return {error:e.message}; }
});
ipcMain.handle('apex:load-session', async (_event,key) => {
  try { return sessionLibrary.loadSession(sessionsDir,key); }
  catch (e) { return {error:e.message}; }
});
ipcMain.handle('apex:check-updates',() => {checkUpdates();return true;});
app.whenReady().then(() => {
  sessionsDir=path.join(app.getPath('documents'),'ApexAI','sessions');
  fs.mkdirSync(sessionsDir,{recursive:true});
  currentKey=latestSession();
  createWindow();
  startCollector();
  configureUpdater();
  app.on('activate',()=>{if (BrowserWindow.getAllWindows().length===0)createWindow();});
});
app.on('before-quit',()=>{app.isQuitting=true;stopCollector();if(updateTimer)clearInterval(updateTimer);});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
