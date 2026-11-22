'use strict';
const {contextBridge,ipcRenderer}=require('electron');
function watch(channel,callback){
 if(typeof callback!=='function')return()=>{};
 const handler=(_evt,data)=>callback(data);
 ipcRenderer.on(channel,handler);
 return()=>ipcRenderer.removeListener(channel,handler);
}
contextBridge.exposeInMainWorld('apexDesktop',Object.freeze({
 version:'0.3.5.1',
 listSessions:()=>ipcRenderer.invoke('apex:list-sessions'),
 loadSession:key=>ipcRenderer.invoke('apex:load-session',key),
 loadLatest:()=>ipcRenderer.invoke('apex:load-latest'),
 getLiveTelemetry:()=>ipcRenderer.invoke('apex:get-live'),
 getStatus:()=>ipcRenderer.invoke('apex:get-status'),
 getPreferences:()=>ipcRenderer.invoke('apex:prefs-get'),
 savePreferences:values=>ipcRenderer.invoke('apex:prefs-save',values),
 chooseWallpaper:()=>ipcRenderer.invoke('apex:prefs-wallpaper'),
 exportPreferences:()=>ipcRenderer.invoke('apex:prefs-export'),
 importPreferences:()=>ipcRenderer.invoke('apex:prefs-import'),
 checkUpdates:()=>ipcRenderer.invoke('apex:check-updates'),
 installUpdate:()=>ipcRenderer.invoke('apex:install-update'),
 openSessionsFolder:()=>ipcRenderer.invoke('apex:open-folder'),
 windowAction:action=>ipcRenderer.invoke('apex:window-action',action),
 onCollector:callback=>watch('apex:collector',callback),
 onUpdates:callback=>watch('apex:updates',callback)
}));
