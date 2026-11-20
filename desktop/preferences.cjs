'use strict';
// Durable, validated preferences: stored in Electron userData, not in the telemetry folder.
// Images are kept as bounded data URLs so that exporting settings transfers a custom wallpaper.
const fs=require('node:fs');
const path=require('node:path');
const DEFAULT={
 version:1,setupComplete:false,driver:'Kierowco',language:'pl',
 accent:'#a46bfa',accent2:'#ed4c75',theme:'violet',
 wallpaper:'none',customWallpaper:'',blur:6,brightness:78,saturation:95,
 opacity:100,sidebarCompact:false,displayDensity:'normal',
 visibleWidgets:['pace','sectors','speed','pedals','fuel','tyres','compare','race','quality'],
 widgetOrder:['pace','sectors','speed','pedals','fuel','tyres','compare','race','quality']
};
const WIDGETS=new Set(DEFAULT.widgetOrder);
const WALLPAPERS=new Set(['none','gt3','gt3b','wec','wecb','f1','f1b','custom']);
const COLORS=/^#[0-9a-f]{6}$/i;
const IMG=/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
function safeName(name){return typeof name==='string'?name.replace(/[<>\u0000-\u001F]/g,'').trim().slice(0,45):'';}
function normalize(input){
  const a=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
  const n={...DEFAULT};
  n.version=1;
  n.setupComplete=a.setupComplete===true;
  n.driver=safeName(a.driver)||DEFAULT.driver;
  n.language=['pl','en'].includes(a.language)?a.language:'pl';
  n.accent=COLORS.test(a.accent||'')?a.accent:DEFAULT.accent;
  n.accent2=COLORS.test(a.accent2||'')?a.accent2:DEFAULT.accent2;
  n.theme=['violet','red','blue','green','custom'].includes(a.theme)?a.theme:'violet';
  n.wallpaper=WALLPAPERS.has(a.wallpaper)?a.wallpaper:'none';
  n.customWallpaper=typeof a.customWallpaper==='string'&&a.customWallpaper.length<=11_000_000&&IMG.test(a.customWallpaper)?a.customWallpaper:'';
  if(n.wallpaper==='custom'&&!n.customWallpaper)n.wallpaper='none';
  for(const [key,min,max]of [['blur',0,30],['brightness',10,100],['saturation',0,180],['opacity',0,100]]){
    const v=Number(a[key]);if(Number.isFinite(v)&&a[key]!==undefined)n[key]=Math.round(Math.min(max,Math.max(min,v)));
  }
  n.sidebarCompact=a.sidebarCompact===true;
  n.displayDensity=['compact','normal','comfortable'].includes(a.displayDensity)?a.displayDensity:'normal';
  const order=Array.isArray(a.widgetOrder)?a.widgetOrder.filter(x=>WIDGETS.has(x)):[];
  n.widgetOrder=[...new Set(order),...DEFAULT.widgetOrder.filter(x=>!order.includes(x))];
  n.visibleWidgets=Array.isArray(a.visibleWidgets)?[...new Set(a.visibleWidgets.filter(x=>WIDGETS.has(x)))]:DEFAULT.visibleWidgets.slice();
  return n;
}
function fileFor(dir){return path.join(dir,'preferences.json');}
function read(dir){
  try{return normalize(JSON.parse(fs.readFileSync(fileFor(dir),'utf8')));}
  catch{return normalize({});}
}
function write(dir,values){
  const cfg=normalize(values);
  fs.mkdirSync(dir,{recursive:true});
  const temp=fileFor(dir)+'.tmp';
  fs.writeFileSync(temp,JSON.stringify(cfg),'utf8');
  fs.renameSync(temp,fileFor(dir));
  return cfg;
}
function fromImage(file){
  const size=fs.statSync(file).size;
  if(size<=0||size>7_000_000)throw Error('Tapeta może mieć maksymalnie 7 MB.');
  const ext=path.extname(file).toLowerCase();
  const mime=({'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp'})[ext];
  if(!mime)throw Error('Obsługiwane formaty tapet: JPG, PNG, WEBP.');
  const content=fs.readFileSync(file);
  // Validate magic bytes to reject mislabeled executable files.
  const valid=mime==='image/jpeg'?content[0]===0xff&&content[1]===0xd8:
    mime==='image/png'?content.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):
    content.toString('ascii',0,4)==='RIFF'&&content.toString('ascii',8,12)==='WEBP';
  if(!valid)throw Error('Nieprawidłowy format obrazu.');
  return 'data:'+mime+';base64,'+content.toString('base64');
}
module.exports={DEFAULT,normalize,read,write,fromImage};
