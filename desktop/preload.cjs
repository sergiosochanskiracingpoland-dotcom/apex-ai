'use strict';
const { contextBridge, ipcRenderer } = require('electron');
function listen(channel, callback) {
  if (typeof callback !== 'function') return () => {};
  const handler = (_event, data) => callback(data);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}
contextBridge.exposeInMainWorld('apexDesktop', Object.freeze({
  version: '0.3.2',
  loadLatest: () => ipcRenderer.invoke('apex:load-latest'),
  listSessions: () => ipcRenderer.invoke('apex:list-sessions'),
  loadSession: (key) => ipcRenderer.invoke('apex:load-session',key),
  checkUpdates: () => ipcRenderer.invoke('apex:check-updates'),
  onCollector: (callback) => listen('apex:collector', callback),
  onUpdates: (callback) => listen('apex:updates', callback)
}));
