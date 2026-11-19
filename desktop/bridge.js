'use strict';
/* Injected into the dashboard's normal renderer world after Electron has loaded it.
 * The original 0.2.15 dashboard is unchanged and preserved in archive/. */
(() => {
  if (!window.apexDesktop || document.getElementById('apex-desktop-bar')) return;
  const css = document.createElement('style');
  css.textContent = `
  #apex-desktop-bar { display:flex; align-items:center;flex-wrap:wrap;gap:12px;padding:14px 5%;background:#0b1824;border-bottom:1px solid #294458;color:#e6f6f1;font:14px system-ui,sans-serif; }
  #apex-desktop-bar .apex-dot {width:9px;height:9px;border-radius:50%;background:#eebd67;box-shadow:0 0 8px #eebd6788;}
  #apex-desktop-bar .apex-dot.recording {background:#53d9bd;box-shadow:0 0 8px #53d9bd88;}
  #apex-desktop-bar .apex-dot.error {background:#ff756b;box-shadow:0 0 8px #ff756b88;}
  #apex-desktop-bar .apex-state {flex:1;min-width:230px;}
  #apex-desktop-bar .apex-updates {color:#93bfd5;font-size:12px;}
  #apex-desktop-bar button {padding:7px 11px;font-size:12px;border-radius:8px;}
  #apex-desktop-bar .apex-hint {font-size:12px;color:#94afbd;flex-basis:100%;margin:0;}
  `;
  document.head.appendChild(css);
  const bar = document.createElement('div');
  bar.id = 'apex-desktop-bar';
  bar.setAttribute('role','status');
  bar.innerHTML = '<span class="apex-dot" id="apex-dot"></span>' +
    '<strong>ACC LIVE</strong><span class="apex-state" id="apex-connection">Czekam na ACC…</span>' +
    '<span class="apex-updates" id="apex-update-status">Aktualizacje: sprawdzam…</span>' +
    '<button type="button" id="apex-update-check">Sprawdź aktualizacje</button>' +
    '<p class="apex-hint">Apex AI 0.3.1: uruchom ACC i jedź. Rejestracja oraz import po ukończonym okrążeniu są automatyczne; nie uruchamiaj starego Start-ApexACC.cmd.</p>';
  const header=document.querySelector('header');
  if(header)header.insertAdjacentElement('afterend',bar);else document.body.prepend(bar);
  const label=document.getElementById('apex-connection');
  const update=document.getElementById('apex-update-status');
  const dot=document.getElementById('apex-dot');
  document.getElementById('apex-update-check').addEventListener('click',()=>window.apexDesktop.checkUpdates());

  let lastKey='',lastLapCount=0,importing=false,retryTimer=null;
  async function importSession() {
    if (importing) return;
    importing=true;
    try {
      const data = await window.apexDesktop.loadLatest();
      if (!data) return;
      if (data.error) throw new Error(data.error);
      if (!data.key || !data.laps || !data.samples) return;
      const importedRows = parseCSV(data.laps);
      if (data.key===lastKey && importedRows.length===lastLapCount) return;
      const importedSamples = parseSamplesCSV(data.samples);
      const importedLaps = completeSpeedLaps(importedSamples);
      if (!importedLaps.length) return;
      rows=importedRows;
      telemetrySamples=importedSamples;
      speedLaps=importedLaps;
      selectedSpeedLap=null;
      compareLapA=null;compareLapB=null;
      zoomStart=0;zoomEnd=100;cursorProgress=50;raceAnalysisCache=null;
      lapFileName=data.key+'_laps.csv';samplesFileName=data.key+'_samples.csv';
      demoActive=false;
      show();
      showTelemetry();
      lastKey=data.key;lastLapCount=importedRows.length;
      label.textContent='ACC: automatycznie wczytano '+importedRows.length+' okrążeń (dane '+data.key+')';
    } catch (e) {
      label.textContent='Błąd automatycznego importu: '+String(e.message).slice(0,140);
    } finally {importing=false;}
  }
  function scheduleImport() {
    if(retryTimer)clearTimeout(retryTimer);
    // The collector writes one more fresh sample immediately after announcing a lap.
    retryTimer=setTimeout(importSession,1400);
  }
  window.apexDesktop.onCollector(msg=>{
    if(!msg)return;
    if(msg.code) {
      dot.className='apex-dot'+(msg.code==='recording'?' recording':
        msg.code==='error'||msg.code==='busy'?' error':'');
      label.textContent='ACC: '+(msg.text||msg.code);
    }
    if(msg.refresh)scheduleImport();
  });
  window.apexDesktop.onUpdates(msg=>{
    if(msg && msg.text)update.textContent='Aktualizacje: '+msg.text;
  });
  scheduleImport();
})();
