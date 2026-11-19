'use strict';
const { contextBridge, ipcRenderer } = require('electron');
function listen(channel, callback) {
  if (typeof callback !== 'function') return () => {};
  const handler = (_event, data) => callback(data);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}
contextBridge.exposeInMainWorld('apexDesktop', Object.freeze({
  version: '0.3.1',
  loadLatest: () => ipcRenderer.invoke('apex:load-latest'),
  checkUpdates: () => ipcRenderer.invoke('apex:check-updates'),
  onCollector: (callback) => listen('apex:collector', callback),
  onUpdates: (callback) => listen('apex:updates', callback)
}));
