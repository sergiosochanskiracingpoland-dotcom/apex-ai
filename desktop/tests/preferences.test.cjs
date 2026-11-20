'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const prefs=require('../preferences.cjs');

test('Preference defaults are safe and complete',()=>{
 const c=prefs.normalize({});
 assert.equal(c.language,'pl');
 assert.equal(c.setupComplete,false);
 assert.equal(c.wallpaper,'none');
 assert.ok(c.widgetOrder.includes('race'));
 assert.ok(c.visibleWidgets.includes('quality'));
});
test('Preference values are normalized including user colors and widget order',()=>{
 const c=prefs.normalize({setupComplete:true,driver:' Apex Racing ',language:'en',
  accent:'#000000',accent2:'#FFCC00',blur:100,brightness:-50,
  widgetOrder:['fuel','speed','fuel','bad'],visibleWidgets:['speed','bad'],
  wallpaper:'custom',customWallpaper:'malicious'});
 assert.equal(c.driver,'Apex Racing');
 assert.equal(c.accent,'#000000');
 assert.equal(c.accent2,'#FFCC00');
 assert.equal(c.blur,30);assert.equal(c.brightness,10);
 assert.deepEqual(c.widgetOrder.slice(0,2),['fuel','speed']);
 assert.deepEqual(c.visibleWidgets,['speed']);
 assert.equal(c.wallpaper,'none');assert.equal(c.customWallpaper,'');
});
test('Persisted preferences survive app restart and keep widget customization',t=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'apex-prefs-'));
 t.after(()=>fs.rmSync(folder,{recursive:true,force:true}));
 prefs.write(folder,{setupComplete:true,driver:'Tester',language:'en',
  accent:'#134eef',wallpaper:'wec',widgetOrder:['race','fuel'],
  visibleWidgets:['fuel']});
 const loaded=prefs.read(folder);
 assert.equal(loaded.setupComplete,true);assert.equal(loaded.driver,'Tester');
 assert.equal(loaded.language,'en');assert.equal(loaded.accent,'#134eef');
 assert.equal(loaded.wallpaper,'wec');assert.equal(loaded.widgetOrder[0],'race');
 assert.deepEqual(loaded.visibleWidgets,['fuel']);
});
test('Import of invalid shape cannot write executable code to settings',()=>{
 const c=prefs.normalize({language:'xx',accent:'javascript:alert(1)',
  wallpaper:'../../../secrets',driver:'<script>x</script>',opacity:'-100'});
 assert.equal(c.language,'pl');assert.equal(c.wallpaper,'none');
 assert.notEqual(c.accent,'javascript:alert(1)');
 assert.ok(!c.driver.includes('<'));
 assert.equal(c.opacity,0);
});
test('Custom images require real JPG/PNG/WEBP signatures and size limits',t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'apex-wall-'));
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const file=path.join(dir,'image.png');
 fs.writeFileSync(file,Buffer.from('89504e470d0a1a0a000000', 'hex'));
 const uri=prefs.fromImage(file);
 assert.ok(uri.startsWith('data:image/png;base64,'));
 fs.writeFileSync(file,'not an image');
 assert.throws(()=>prefs.fromImage(file),/format/);
});
