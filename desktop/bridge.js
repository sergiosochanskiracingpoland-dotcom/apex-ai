'use strict';
/* Desktop UI shell for Apex AI 0.3.2, running in the legacy telemetry document.
   No change is made to the archived v0.2.15 analysis logic. */
(() => {
  const api = window.apexDesktop;
  const original = document.querySelector('body > main');
  if (!api || !original || document.getElementById('apx-shell')) return;

  const symbols = {
    home:'<path d="m3 10 9-7 9 7v11H3z"/><path d="M9 21v-8h6v8"/>',
    dashboard:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    stint:'<path d="M3 19V5m0 14h18M7 14l4-5 3 3 6-7"/>',
    history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v6l4 2"/>',
    setups:'<path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.2 2.2m8.4 8.4 2.2 2.2M18.4 5.6l-2.2 2.2m-8.4 8.4-2.2 2.2"/><circle cx="12" cy="12" r="4"/>',
    coach:'<rect x="4" y="7" width="16" height="13" rx="3"/><path d="M12 3v4M8 13h.01M16 13h.01M9 17h6"/>',
    drive:'<path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z"/><circle cx="12" cy="12" r="3"/><path d="M12 9V2m-3 11-6 4m12-4 6 4"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
    flag:'<path d="M5 21V4m0 0c5-4 9 4 14 0v11c-5 4-9-4-14 0"/>',
    trophy:'<path d="M8 4h8v8a4 4 0 0 1-8 0V4Zm-3 1H3v4a4 4 0 0 0 5 4m11-8h2v4a4 4 0 0 1-5 4M12 16v5m-4 0h8"/>',
    bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>'
  };
  function svg(name) {
    return '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(symbols[name]||symbols.dashboard)+'</svg>';
  }
  function safe(s) {return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function formatTime(n) {
    const t = Number(n);
    if (!(t>0 && t<600)) return '—';
    const ms=Math.round(t*1000);
    return Math.floor(ms/60000)+':'+String(Math.floor(ms%60000/1000)).padStart(2,'0')+'.'+String(ms%1000).padStart(3,'0');
  }
  function formatDate(value) {
    const d=new Date(value);
    return Number.isFinite(d.getTime()) ? d.toLocaleDateString('pl-PL',{day:'2-digit',month:'long',year:'numeric'}) : 'Data nieznana';
  }
  const links = [
    ['home','Strona główna','home'],
    ['dashboard','Dashboard','dashboard'],
    ['stint','Analiza stintu','stint'],
    ['history','Historia','history'],
    ['setups','Setupy','setups','WKRÓTCE'],
    ['coach','Inżynier AI','coach','WKRÓTCE'],
    ['drive','Jedź','drive','PLAN']
  ];
  const navHtml=links.map(([id,title,icon,coming])=>
    '<button type="button" class="apx-navbtn" data-view="'+id+'" aria-current="'+(id==='home'?'page':'false')+'" title="'+safe(title)+'">'+
    '<span class="apx-ico">'+svg(icon)+'</span>'+
    '<span class="apx-nav-label">'+safe(title)+'</span>'+
    (coming?'<span class="apx-soon">'+coming+'</span>':'')+'</button>').join('');

  const shell=document.createElement('div');
  shell.id='apx-shell';
  shell.innerHTML =
    '<aside id="apx-sidebar">'+
      '<div class="apx-brand"><span class="apx-brandmark">A</span><div class="apx-brandwords"><h2>APEX AI</h2><small>RACE INTELLIGENCE</small></div></div>'+
      '<div class="apx-nav-group">WORKSPACE</div><nav class="apx-nav" aria-label="Nawigacja Apex AI">'+navHtml+'</nav>'+
      '<div class="apx-sidebar-foot"><div class="apx-side-status"><span class="apx-led" id="apx-side-led" data-status="waiting"></span><span class="apx-sidecopy" id="apx-side-status">Oczekiwanie na ACC</span></div><span class="apx-version apx-sidecopy">APEX AI DESKTOP · 0.3.2</span></div>'+
    '</aside>'+
    '<div id="apx-workspace">'+
      '<header id="apx-topbar"><div class="apx-top-left">'+
        '<button class="apx-menu-toggle" id="apx-menu-toggle" type="button" aria-label="Zwiń lub rozwiń menu">'+svg('menu')+'</button>'+
        '<div><div class="apx-heading" id="apx-current-page">Strona główna</div><div class="apx-breadcrumb">APEX AI / <span id="apx-breadcrumb">Home</span></div></div>'+
      '</div><div class="apx-top-right">'+
        '<div class="apx-top-status" title="Status połączenia z ACC"><span class="apx-led" id="apx-top-led" data-status="waiting"></span><span class="apx-status-copy" id="apx-top-status-text">Oczekiwanie na ACC</span></div>'+
        '<button type="button" class="apx-top-update" id="apx-update-btn" title="Sprawdź aktualizacje">Sprawdź aktualizacje</button>'+
      '</div></header>'+
      '<div id="apx-content">'+
        '<div class="apx-page" id="apx-page-home">'+
          '<div class="apx-hero"><div class="apx-kicker">YOUR RACE. YOUR DATA.</div>'+
          '<h1>Witaj, <span>Kierowco.</span></h1>'+
          '<p>Twoje tempo. Twoje postępy. Każde okrążenie ma znaczenie. Wszystkie zarejestrowane stinty są automatycznie zapisywane w Twojej bibliotece.</p>'+
          '<div class="apx-home-actions"><button type="button" class="apx-button apx-button--accent" data-goto="history">'+svg('history')+' Otwórz bibliotekę '+svg('arrow')+'</button>'+
          '<button type="button" class="apx-button apx-button--soft" data-goto="dashboard">'+svg('dashboard')+' Dashboard</button></div></div>'+
          '<div class="apx-sectionlabel">Twój garaż danych <span>Statystyki zapisanych stintów</span></div>'+
          '<div class="apx-statgrid">'+
            '<div class="apx-metric"><div class="apx-metric-label">'+svg('flag')+' Zapisane stinty</div><strong id="apx-stats-stints">0</strong><small>wszystkie dotychczasowe sesje</small></div>'+
            '<div class="apx-metric"><div class="apx-metric-label">'+svg('clock')+' Pełne okrążenia</div><strong id="apx-stats-laps">0</strong><small>zarejestrowane czasy</small></div>'+
            '<div class="apx-metric"><div class="apx-metric-label">'+svg('trophy')+' Najlepszy czas</div><strong id="apx-stats-best">—</strong><small>najlepszy zapis w bibliotece</small></div>'+
          '</div>'+
          '<div id="apx-home-latest" class="apx-last"><div><small>OSTATNI STINT</small><h3>Jeszcze nie ma zapisanych stintów</h3><p>Po uruchomieniu ACC aplikacja rozpocznie zapisywanie danych.</p></div></div>'+
        '</div>'+
        '<div class="apx-page" id="apx-page-history" hidden>'+
          '<div class="apx-kicker">SESSION ARCHIVE</div><h1 class="apx-page-title">Twoja historia jazdy</h1>'+
          '<p class="apx-page-sub">Każdy stint z ACC zapisuje się automatycznie. Wybierz tor, samochód i datę, aby otworzyć pełną telemetrię i analizę okrążeń.</p>'+
          '<div class="apx-library-tools"><input class="apx-library-search" id="apx-history-search" type="search" placeholder="Szukaj toru, samochodu lub daty..." aria-label="Szukaj stintów">'+
          '<span class="apx-library-count" id="apx-history-count">Ładowanie biblioteki…</span></div>'+
          '<div id="apx-history-list" class="apx-list"></div>'+
        '</div>'+
        '<div class="apx-page" id="apx-page-future" hidden>'+
          '<div class="apx-kicker">DEVELOPMENT ROADMAP</div><h1 class="apx-page-title" id="apx-future-title">W przygotowaniu</h1>'+
          '<div class="apx-placeholder"><div class="apx-placeholder-icon" id="apx-future-icon">✦</div><h2 id="apx-future-heading">Już wkrótce</h2><p id="apx-future-copy">Ta funkcja pojawi się w kolejnych aktualizacjach.</p></div>'+
        '</div>'+
        '<div class="apx-page" id="apx-page-analytics" hidden>'+
          '<div class="apx-analysis-intro"><div><div class="apx-kicker">TELEMETRY WORKSPACE</div><h1 class="apx-page-title" id="apx-analysis-title">Dashboard</h1><p class="apx-page-sub" id="apx-analysis-desc">Wyniki jazdy i telemetria w jednym miejscu.</p></div>'+
          '<span class="apx-session-caption" id="apx-active-session">Nie wybrano stintu</span></div>'+
          '<div class="apx-empty" id="apx-analytics-empty"><strong>Twoje analizy pojawią się tutaj</strong>Wybierz stint w Historii lub uruchom ACC. Możesz też użyć przycisku „Załaduj sesję demo”, aby obejrzeć wykresy już dziś.</div>'+
          '<div id="apx-legacy-host"></div>'+
        '</div>'+
      '</div>'+
    '</div>';

  // Move the original telemetry UI under the new desktop shell.
  document.querySelector('body > header')?.remove();
  document.body.appendChild(shell);
  document.getElementById('apx-legacy-host').appendChild(original);
  document.body.classList.add('apx-ui');

  const $ = id => document.getElementById(id);
  const pageLabels = Object.fromEntries(links.map(x=>[x[0],x[1]]));
  const pages = {home:$('apx-page-home'),history:$('apx-page-history'),future:$('apx-page-future'),analytics:$('apx-page-analytics')};
  let currentView='home', currentKey='', currentMeta=null;
  let sessions=[],lastImportedKey='',lastImportedLapCount=-1;
  let lastRecordedKey='', importBusy=false,importTimer=null,scanBusy=false,loadedDemo=false;
  let collectorState='waiting';
  const futureTexts={
    setups:['Setupy','Setup Builder · wersja beta','Biblioteka setupów i generator AI są w planie. Na razie koncentrujemy się na niezawodnej telemetrii i historii jazdy.','⚙'],
    coach:['Inżynier AI','Twój inżynier wyścigowy','Czat oparty na rzeczywistych danych z sesji zostanie dodany w serii 0.4.x. Nie prezentujemy symulacji sztucznej inteligencji jako prawdziwego AI.','✦'],
    drive:['Jedź','Centrum uruchamiania symulatorów','Uruchamianie ACC i innych gier bezpośrednio z Apex AI pojawi się w jednej z następnych wersji 0.3.x. Obecnie uruchom grę normalnie — telemetria ACC zbiera się automatycznie.','▶']
  };
  function setView(view) {
    if(!pageLabels[view])return;
    currentView=view;
    document.querySelectorAll('.apx-navbtn').forEach(b=>b.setAttribute('aria-current',b.dataset.view===view?'page':'false'));
    Object.values(pages).forEach(x=>x.hidden=true);
    if(view==='home')pages.home.hidden=false;
    else if(view==='history'){pages.history.hidden=false;void refreshLibrary();}
    else if(view==='dashboard'||view==='stint'){
      pages.analytics.hidden=false;
      const legacyButton=document.querySelector('#nav [data-tab="'+view+'"]');
      if(legacyButton)legacyButton.click();
      $('apx-analysis-title').textContent=view==='stint'?'Analiza stintu':'Dashboard';
      $('apx-analysis-desc').textContent=view==='stint'?'Pełna telemetria, opony, paliwo, tempo, hamowania i porównania okrążeń.':'Przegląd wyników i analiza tempa kierowcy.';
    }else {
      pages.future.hidden=false;
      const [title,heading,copy,emoji]=futureTexts[view];
      $('apx-future-title').textContent=title;
      $('apx-future-heading').textContent=heading;
      $('apx-future-copy').textContent=copy;
      $('apx-future-icon').textContent=emoji;
    }
    $('apx-current-page').textContent=pageLabels[view];
    $('apx-breadcrumb').textContent=pageLabels[view];
    document.body.classList.remove('apx-mobile-open');
    $('apx-content').scrollIntoView({block:'start',behavior:'instant'});
  }
  document.querySelectorAll('.apx-navbtn').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.goto)));
  $('apx-menu-toggle').addEventListener('click',()=>{
    if(window.innerWidth<670)document.body.classList.toggle('apx-mobile-open');
    else document.body.classList.toggle('apx-collapsed');
  });
  $('apx-update-btn').addEventListener('click',()=>api.checkUpdates());

  function sessionLabel(s) {return (s.trackName||s.track||'Nieznany tor')+' · '+(s.carName||s.car||'Nieznany samochód');}
  function renderStats() {
    const totalLaps=sessions.reduce((sum,x)=>sum+(Number(x.lapCount)||0),0);
    const timed=sessions.map(x=>Number(x.bestLap)).filter(x=>x>0&&x<600);
    $('apx-stats-stints').textContent=String(sessions.length);
    $('apx-stats-laps').textContent=totalLaps.toLocaleString('pl-PL');
    $('apx-stats-best').textContent=formatTime(timed.length?Math.min(...timed):NaN);
    const last=sessions[0];
    if(!last)return;
    $('apx-home-latest').innerHTML=
      '<div><small>OSTATNI STINT</small><h3>'+safe(sessionLabel(last))+'</h3>'+
      '<p>'+safe(formatDate(last.date))+' · '+Number(last.lapCount||0)+' okrążeń · najlepsze '+safe(formatTime(last.bestLap))+'</p></div>'+
      '<button class="apx-button apx-button--soft" type="button" id="apx-open-latest">Otwórz sesję '+svg('arrow')+'</button>';
    $('apx-open-latest').addEventListener('click',()=>void openSession(last.key));
  }
  function renderHistory() {
    const search=$('apx-history-search').value.trim().toLocaleLowerCase('pl-PL');
    const matching=sessions.filter(s=>(sessionLabel(s)+' '+formatDate(s.date)).toLocaleLowerCase('pl-PL').includes(search));
    $('apx-history-count').textContent=matching.length+' z '+sessions.length+' stintów';
    $('apx-history-list').innerHTML=matching.length?matching.map(s=>
      '<button type="button" class="apx-stint" data-session-key="'+safe(s.key)+'" aria-label="Otwórz '+safe(sessionLabel(s))+'">'+
        '<span class="apx-card-top"><span class="apx-game">ASSETTO CORSA COMPETIZIONE</span><span class="apx-card-date">'+safe(formatDate(s.date))+'</span></span>'+
        '<h3>'+safe(s.trackName||s.track||'Nieznany tor')+'</h3><p>'+safe(s.carName||s.car||'Nieznany samochód')+'</p>'+
        '<span class="apx-card-stats"><span><b>'+Number(s.lapCount||0)+'</b> okr. &nbsp; <b>'+safe(formatTime(s.bestLap))+'</b> best</span><span class="apx-card-arrow">'+svg('arrow')+'</span></span>'+
      '</button>').join(''):
      '<div class="apx-empty" style="grid-column:1/-1"><strong>'+(search?'Brak pasujących stintów':'Biblioteka jest jeszcze pusta')+'</strong>'+
      (search?'Zmień wyszukiwaną frazę.':'Każdy nowy stint automatycznie zapisze się tutaj — bez klikania „Zapisz”.')+'</div>';
    $('apx-history-list').querySelectorAll('[data-session-key]').forEach(b=>{
      b.addEventListener('click',()=>void openSession(b.dataset.sessionKey));
    });
  }
  $('apx-history-search').addEventListener('input',renderHistory);
  async function refreshLibrary() {
    if(scanBusy)return;
    scanBusy=true;
    try {
      const data=await api.listSessions();
      if(data&&data.error)throw Error(data.error);
      if(Array.isArray(data)) {
        sessions=data;
        renderStats();
        renderHistory();
      }
    } catch(e) {
      $('apx-history-count').textContent='Nie udało się odczytać biblioteki';
      if(currentView==='history')
        $('apx-history-list').textContent=String(e.message||e);
    }finally {scanBusy=false;}
  }
  async function openSession(key,opts={}) {
    if(importBusy)return;
    importBusy=true;
    try {
      const data=await api.loadSession(key);
      if(!data)throw Error('Nie ma danych dla tego stintu.');
      if(data.error)throw Error(data.error);
      if(!data.samples)throw Error('Brak pliku telemetrii tego stintu.');
      const meta=sessions.find(x=>x.key===data.key)||null;
      const parsedSamples=parseSamplesCSV(data.samples);
      let parsedLaps=[];
      try{parsedLaps=parseCSV(data.laps);}catch(e){
        if(!/Brak poprawnych okrążeń/.test(String(e.message)))throw e;
      }
      const eligible=completeSpeedLaps(parsedSamples);
      rows=parsedLaps;telemetrySamples=parsedSamples;speedLaps=eligible;
      selectedSpeedLap=null;compareLapA=null;compareLapB=null;
      zoomStart=0;zoomEnd=100;cursorProgress=50;raceAnalysisCache=null;
      lapFileName=data.key+'_laps.csv';samplesFileName=data.key+'_samples.csv';
      demoActive=false;loadedDemo=false;
      clearLapDisplay();
      if(rows.length)show();
      showTelemetry();
      currentKey=data.key;currentMeta=meta;
      lastImportedKey=data.key;lastImportedLapCount=parsedLaps.length;
      $('apx-active-session').textContent=meta?sessionLabel(meta)+' · '+formatDate(meta.date):'Stint '+data.key;
      $('apx-analytics-empty').hidden=true;
      if(!opts.quiet)setView('stint');
    }catch(e) {
      if(!opts.quiet) {
        setView('history');
        $('apx-history-count').textContent='Nie można otworzyć stintu: '+String(e.message||e).slice(0,160);
      }
    }finally {importBusy=false;}
  }
  async function refreshCurrentSession() {
    const key=lastRecordedKey;
    if(!key||!/^acc_\d{8}_\d{6}_\d{4,6}$/.test(key))return;
    // Never replace a historic stint currently being inspected with live data.
    if(currentKey && currentKey!==key && currentView!=='home')return;
    try{
      const data=await api.loadSession(key);
      if(!data||data.error||!data.samples)return;
      let count=0;
      try{count=parseCSV(data.laps).length;}catch{}
      if(lastImportedKey===key&&lastImportedLapCount===count)return;
      await openSession(key,{quiet:true});
    }catch{}
  }
  function queueSync() {
    if(importTimer)clearTimeout(importTimer);
    importTimer=setTimeout(async()=>{
      await refreshLibrary();
      await refreshCurrentSession();
    },1100);
  }
  api.onCollector(msg=>{
    if(!msg)return;
    if(msg.code){
      collectorState=msg.code;
      const text=msg.text||msg.code;
      $('apx-top-status-text').textContent=text;
      $('apx-side-status').textContent=text;
      $('apx-top-led').dataset.status=msg.code;
      $('apx-side-led').dataset.status=msg.code;
    }
    if(msg.sessionKey&&/^acc_\d{8}_\d{6}_\d{4,6}$/.test(msg.sessionKey)){
      if(lastRecordedKey!==msg.sessionKey)lastRecordedKey=msg.sessionKey;
    }
    if(msg.refresh||msg.laps===0||msg.code==='recording')queueSync();
  });
  api.onUpdates(msg=>{
    if(msg?.text){
      $('apx-update-btn').textContent=msg.text;
      $('apx-update-btn').title='Sprawdź aktualizacje: '+msg.text;
    }
  });
  // Demo is an explicit preview, never represented as real session history.
  document.getElementById('demo')?.addEventListener('click',()=>{
    loadedDemo=true;currentKey='';currentMeta=null;
    $('apx-active-session').textContent='SESJA DEMO · fikcyjne dane';
    $('apx-analytics-empty').hidden=true;
  });
  // Start on the clean, minimalist home page, not on fictional demo telemetry.
  rows=[];telemetrySamples=[];speedLaps=[];demoActive=false;
  clearLapDisplay();showTelemetry();
  setView('home');
  void refreshLibrary().then(async()=>{
    const latest=sessions[0];
    if(latest && !currentKey) await openSession(latest.key,{quiet:true});
  });
  setInterval(()=>void refreshLibrary(),30000);
})();
