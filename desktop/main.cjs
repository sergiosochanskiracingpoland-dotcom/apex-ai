'use strict';
const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const dashboardPath = app.isPackaged
  ? path.join(process.resourcesPath, 'dashboard', 'index.html')
  : path.resolve(__dirname, '..', 'index.html');

let win;
function createWindow() {
  if (!fs.existsSync(dashboardPath)) {
    dialog.showErrorBox('Apex AI', 'Nie znaleziono dashboardu index.html.');
    app.quit();
    return;
  }
  win = new BrowserWindow({
    title: 'Apex AI 0.3.0 — Race Engineer',
    width: 1400, height: 950, minWidth: 850, minHeight: 600,
    backgroundColor: '#090e18', show: false,
    webPreferences: {
      nodeIntegration: false, contextIsolation: true,
      sandbox: true, webSecurity: true
    }
  });
  // Local dashboard with no Node integration, no network access required.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (url !== win.webContents.getURL()) event.preventDefault();
  });
  win.once('ready-to-show', () => win.show());
  win.loadFile(dashboardPath);
  win.webContents.on('did-fail-load', (_event, code, message) => {
    if (code !== -3) dialog.showErrorBox('Apex AI — błąd', message);
  });
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'Apex AI', submenu: [
      { label: 'Odśwież', accelerator: 'F5', click: () => win.reload() },
      { label: 'Otwórz folder sesji ACC', click: () => {
        const folder = path.join(app.getPath('documents'), 'ApexAI', 'sessions');
        if (fs.existsSync(folder)) shell.openPath(folder);
        else dialog.showMessageBox(win, {type:'info',message:'Brak folderu sesji',detail:'Najpierw uruchom rejestrator ACC. Pliki trafią do Dokumenty\\ApexAI\\sessions.'});
      }},
      { type: 'separator' }, { label: 'Zamknij', role: 'quit' }
    ]},
    { label: 'Widok', submenu: [
      { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'resetZoom' },
      { type: 'separator' }, { role: 'togglefullscreen' }
    ]},
    { label: 'Pomoc', submenu: [
      { label: 'Instrukcja na GitHub', click: () => shell.openExternal('https://github.com/sergiosochanskiracingpoland-dotcom/apex-ai/tree/main/desktop') },
      { label: 'O programie', click: () => dialog.showMessageBox(win, {
        type:'info',message:'Apex AI 0.3.0',
        detail:'Pierwsza aplikacja desktopowa Windows. Import CSV i rejestrator PowerShell pozostają oddzielne; automatyczne zbieranie danych planowane na 0.3.1.'
      })}
    ]}
  ]));
}
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
