'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const bridge=fs.readFileSync(path.join(root,'bridge.js'),'utf8');
const css=fs.readFileSync(path.join(root,'shell.css'),'utf8');

test('History opens complete reports, rather than only the stint tab',()=>{
  assert.match(bridge,/if\(!opts\.quiet\)setView\('report'\)/);
  assert.match(bridge,/legacyTab=view==='report'\?'dashboard':view/);
  assert.match(bridge,/\$\('dashboard'\)\.classList\.remove\('hidden'\)/);
  assert.match(bridge,/\$\('stint'\)\.classList\.remove\('hidden'\)/);
});

test('Report has visible and accessible navigation to both analytics sections',()=>{
  assert.match(bridge,/data-report-target="dashboard"/);
  assert.match(bridge,/data-report-target="stint"/);
  assert.match(bridge,/data-goto="history"/);
  assert.match(bridge,/Raport stintu/);
  assert.match(css,/\.apx-report-toolbar\[hidden\]/);
  assert.match(css,/\.apx-report-section-heading/);
});

test('Historical source telemetry is reused for BOTH dashboard and stint',()=>{
  assert.match(bridge,/rows=parsedLaps;telemetrySamples=parsedSamples;speedLaps=eligible/);
  assert.match(bridge,/if\(rows\.length\)show\(\)/);
  assert.match(bridge,/showTelemetry\(\)/);
  assert.doesNotMatch(bridge,/openSession\(key,opts=\{\}\)[\s\S]{0,1800}rows=sample\(\)/);
});
