'use strict';
(() => {
const api=window.apexDesktop, root=document.getElementById('app');
if(!api||!root){document.body.textContent='Apex AI desktop bridge unavailable';return;}
const dict={
pl:{
 home:'Strona główna',dashboard:'Dashboard',stint:'Analiza stintu',history:'Historia',live:'Na torze',
 settings:'Ustawienia',setups:'Setupy',engineer:'Inżynier AI',drive:'Jedź',raceView:'Wyścig',
 workspace:'PRZESTRZEŃ KIEROWCY',waiting:'Oczekiwanie na ACC',connected:'ACC wykryte',recording:'Nagrywanie sesji ACC',
 welcome:'Witaj',driver:'Kierowco',heroSub:'Twoje tempo. Twoje postępy. Wszystkie przejazdy w jednym miejscu.',
 openHistory:'Otwórz bibliotekę',current:'Aktualny przejazd',recorded:'Zapisane stinty',laps:'Okrążenia',
 lastBest:'Best ostatniego stintu',lastSession:'OSTATNI STINT',noSessions:'Nie masz jeszcze zapisanych przejazdów.',
 startToSave:'Uruchom ACC, a Apex AI automatycznie zapisze Twój stint.',
 openSession:'Otwórz raport',noData:'Brak danych',sessionName:'Wybrany stint',showFull:'Pełny raport stintu',
 dashboardSub:'Najważniejsze dane z ostatnio wybranego przejazdu, z własnym układem widżetów.',
 stintSub:'Analiza okrążeń, paliwa, opon, hamowań i elektroniki na podstawie zapisanej telemetrii.',
 fullSub:'Kompletny raport wybranego przejazdu: wyniki, wykresy i analiza stintu.',
 historySub:'Każdy stint ACC trafia tu automatycznie. Otwórz dowolną sesję, aby obejrzeć wszystkie jej dane.',
 search:'Szukaj toru, auta lub daty…',noMatching:'Nie znaleziono pasujących stintów.',
 chooseSession:'Wybierz stint z Historii lub zaczekaj na dane ACC.',
 liveSub:'Podgląd rzeczywistych danych ACC. Brak połączenia oznacza brak pomiarów, a nie sesję demonstracyjną.',
 liveWaiting:'Oczekiwanie na aktywną jazdę w ACC',liveRecording:'Odczyty na żywo z ACC',
 speed:'Prędkość',gear:'Bieg',maxGear:'Najwyższy użyty bieg',rpm:'Obroty',fuel:'Paliwo',throttle:'Gaz',brake:'Hamulec',
 lapProgress:'Postęp okrążenia',tyreTemp:'Temperatury opon',tyrePressure:'Ciśnienie opon',
 lap:'Okrążenie',time:'Czas',best:'Najlepszy',average:'Średnia',deviation:'Odchylenie',
 sectors:'Sektory',race:'Analiza hamowań',pace:'Tempo okrążeń',speedPlot:'Prędkość na okrążeniu',pedals:'Gaz i hamulec',
 fuelPlot:'Zużycie paliwa',tyrePlot:'Temperatury opon',compare:'Porównanie okrążeń',
 quality:'Jakość telemetrii',analysis:'Wnioski z jazdy',overview:'Podsumowanie przejazdu',
 lapA:'Okrążenie A',lapB:'Okrążenie B',selectedLap:'Wybrane okrążenie',
 fullLap:'Całe okrążenie',samples:'Próbki',hz:'Częstotliwość efektywna',timeGaps:'Luki ponad 250 ms',
 section:'Sekcja',liveHint:'Rejestrator zbiera telemetrię niezależnie od tego widoku. Wyniki pojawią się automatycznie w Historii.',
 pitHint:'Stinty są rozdzielane przy zjeździe do boksu. Rejestrator ma ustawiony cel 75 zapisów na sekundę.',
 settingsSub:'Dostosuj interfejs do swojego stylu. Zmiany zapisują się automatycznie na tym komputerze.',
 personalize:'Personalizacja',driverName:'Nazwa kierowcy',language:'Język aplikacji',chooseTheme:'Gotowe motywy',
 customColors:'Własne kolory',primaryColor:'Kolor główny',secondaryColor:'Kolor dodatkowy',
 backdrop:'Tło aplikacji',wallpaperChoose:'Gotowe tapety',none:'Bez tapety',own:'Własna tapeta',
 upload:'Wybierz plik JPG / PNG / WEBP',wallHelp:'Tapety motorsportowe CC0 działają bez internetu. Własna tapeta zapisuje się lokalnie.',
 blur:'Rozmycie',brightness:'Jasność',saturation:'Nasycenie',opacity:'Widoczność tapety',
 layout:'Układ i widżety',density:'Gęstość interfejsu',compact:'Kompaktowa',normal:'Standardowa',
 comfortable:'Przestronna',sidebar:'Zwiń menu boczne',widgets:'Widżety Dashboardu',
 orderHelp:'Zmieniaj widoczność i kolejność strzałkami lub przeciąganiem. Układ zapamiętuje się automatycznie.',
 backup:'Przenieś ustawienia',export:'Eksportuj ustawienia',import:'Importuj ustawienia',
 backupHelp:'Eksport zawiera kolory, język, układ i ewentualną własną tapetę.',
 update:'Aktualizacje',checkUpdate:'Sprawdź aktualizacje',installUpdate:'Zainstaluj pobraną aktualizację',
 about:'O aplikacji',version:'Wersja',recorder:'Stan rejestratora',openFolder:'Otwórz folder sesji',
 settingsSaved:'Ustawienia zapisane',settingsImported:'Ustawienia zaimportowane',
 futureTitle:'W przygotowaniu',futureDescription:'To miejsce rozbudujemy w następnych wydaniach Apex AI.',
 planned:'PLANOWANE',close:'Zamknij',next:'Dalej',back:'Wstecz',finish:'Zakończ konfigurację',
 onboarding:'PIERWSZE URUCHOMIENIE',step:'KROK',stepOne:'Poznajmy kierowcę',stepOneSub:'Wybierz nazwę i język. Możesz je zmienić później w Ustawieniach.',
 stepTwo:'Twój styl',stepTwoSub:'Wybierz kolorystykę interfejsu lub ustaw własne akcenty.',
 stepThree:'Twój kokpit',stepThreeSub:'Wybierz tło aplikacji. Możesz też dodać własne zdjęcie później.',
 updateReady:'Aktualizacja gotowa do instalacji',updateCurrent:'Masz aktualną wersję Apex AI',updateChecking:'Sprawdzanie aktualizacji…',updateAvailable:'Dostępna nowa wersja',updateDownloading:'Pobieranie aktualizacji',updateError:'Błąd aktualizacji',
 ready:'Apex AI gotowe',status:'Status',copied:'Skopiowano',noLaps:'W tym stincie nie ma jeszcze pełnych okrążeń.',
 lapBest:'Najlepsze okrążenie',noValidCompare:'Za mało poprawnych próbek do porównania tych okrążeń.',
 dataLocal:'Dane pozostają lokalnie na Twoim komputerze.',showAll:'Pełna analiza',
 waitingUpdate:'Sprawdzanie aktualizacji…',unsaved:'Nie udało się zapisać ustawień',
 car:'Samochód',track:'Tor',date:'Data',avgFuel:'Średni spadek paliwa',
 sectorsEstimated:'Sektory szacunkowe z próbek ACC, nie oficjalne międzyczasy.',
 telemetryHint:'Wykresy pokazują wyłącznie rzeczywiste dane z zapisanej sesji.',
 raceInsights:'Obserwacje z danych',notice:'Ważne',test75:'Próbkowanie docelowe: 75 Hz. Rzeczywisty wynik sprawdź w Jakości telemetrii.',samplingDiagnostics:'Diagnostyka 75 Hz',target:'Cel',effectiveHz:'Zapisane próbki na sekundę',uniquePhysicsHz:'Nowe dane z ACC na sekundę',duplicateFrames:'Odczyty tych samych danych',goalAchievement:'Realizacja celu',p95Interval:'Odstęp dla 95% odczytów',delayedIntervals:'Odstępy powyżej 25 ms',maxGap:'Najdłuższy odstęp',medianInterval:'Mediana odstępu',samplingExplanation:'1 Hz to jeden zapis na sekundę. ACC może udostępniać nowe dane rzadziej, więc część odczytów powtarza te same dane. Podany odstęp oznacza, że co najmniej 95% zmierzonych przerw między odczytami było tak krótkich lub krótszych. Liczymy od 30 km/h i pomijamy przerwy dłuższe niż 250 ms.',
 demo:'Dane demonstracyjne nie są wczytywane automatycznie.',
 racePageSub:'Wyścigi i sesje zapisane od 0.3.6. Pozycje, pit stopy i stinty w jednym raporcie.',
 raceHistory:'Zapisane sesje wyścigowe',raceReport:'Analiza wyścigu',raceNoData:'Brak raportów wyścigowych z nowego rejestratora. Starsze stinty pozostają w Historii.',
 raceStints:'Stinty tego wyścigu',racePit:'Wizyty w pit lane',racePositions:'Zmiany pozycji',racePosition:'Pozycja',
 raceStart:'Start',raceFinish:'Ostatnia',raceDelta:'Zmiana pozycji',raceUnknown:'Brak danych',
 racePitDuration:'Czas w pit lane',raceStationary:'Postój z prędkością do 2 km/h',raceFuelAdded:'Zaobserwowany wzrost paliwa',
 raceCompound:'Mieszanka opon',raceTyresUnknown:'Wymiana opon: niepotwierdzona',raceRepairsUnknown:'Naprawy: brak danych z telemetrii',
 raceObserved:'Dane z pamięci ACC. Zmiana mieszanki nie dowodzi wymiany kompletu opon; czas w pit lane to nie czas serwisu.',
 raceVisitPending:'Wizyta trwa lub została przerwana',raceNoVisits:'Nie zarejestrowano wizyt w pit lane.',
 raceNoPosition:'ACC nie udostępniło prawidłowej pozycji wyścigowej.',raceTraining:'Sesja treningowa / nie wyścig',
 launchACC:'Uruchom ACC przez Steam',launchRequested:'Polecenie wysłane do Steam. Oczekiwanie na wykrycie ACC.',
 driveSub:'Uruchom Assetto Corsa Competizione. Apex AI zacznie nagrywać po rozpoczęciu jazdy.',
 driveNote:'Przycisk wysyła polecenie do Steam. Połączenie potwierdzamy dopiero, kiedy ACC naprawdę działa.',
 raceToReport:'Otwórz analizę wyścigu',raceRecorded:'Powiązane wyścigi',
 polish:'Polski',english:'English',now:'TERAZ'
},
en:{
 home:'Home',dashboard:'Dashboard',stint:'Stint analysis',history:'History',live:'On track',
 settings:'Settings',setups:'Setups',engineer:'AI engineer',drive:'Drive',raceView:'Race',
 workspace:'DRIVER WORKSPACE',waiting:'Waiting for ACC',connected:'ACC detected',recording:'Recording ACC session',
 welcome:'Welcome',driver:'Driver',heroSub:'Your pace. Your progress. Every run in one place.',
 openHistory:'Open session library',current:'Current run',recorded:'Saved stints',laps:'Laps',
 lastBest:'Last stint best',lastSession:'LAST STINT',noSessions:'No saved stints yet.',
 startToSave:'Launch ACC and Apex AI will automatically save every stint.',
 openSession:'Open report',noData:'No data',sessionName:'Selected stint',showFull:'Full stint report',
 dashboardSub:'Key statistics from the selected session in a customizable widget layout.',
 stintSub:'Laps, fuel, tyres, braking and electronics from recorded telemetry.',
 fullSub:'Complete report of the selected stint: results, charts and analysis.',
 historySub:'Every ACC stint is saved automatically. Open any session to inspect all of its data.',
 search:'Search track, car or date…',noMatching:'No matching stints found.',
 chooseSession:'Select a stint in History or wait for an ACC recording.',
 liveSub:'Real ACC live telemetry. No connection means no readings, not a demo session.',
 liveWaiting:'Waiting for active driving in ACC',liveRecording:'Live ACC data',
 speed:'Speed',gear:'Gear',maxGear:'Highest gear used',rpm:'RPM',fuel:'Fuel',throttle:'Throttle',brake:'Brake',
 lapProgress:'Lap progress',tyreTemp:'Tyre temperatures',tyrePressure:'Tyre pressures',
 lap:'Lap',time:'Time',best:'Best',average:'Average',deviation:'Deviation',
 sectors:'Sectors',race:'Braking analysis',pace:'Lap pace',speedPlot:'Lap speed',pedals:'Throttle and brake',
 fuelPlot:'Fuel consumption',tyrePlot:'Tyre temperatures',compare:'Compare laps',
 quality:'Telemetry quality',analysis:'Driving insights',overview:'Session overview',
 lapA:'Lap A',lapB:'Lap B',selectedLap:'Selected lap',
 fullLap:'Entire lap',samples:'Samples',hz:'Effective sampling',timeGaps:'Gaps over 250 ms',
 section:'Section',liveHint:'The collector records telemetry independently of this view. Stints are saved to History automatically.',
 pitHint:'Stints split on pit entry. The recorder aims for 75 saves per second.',
 settingsSub:'Customize your workspace. Preferences persist locally across launches and updates.',
 personalize:'Personalization',driverName:'Driver name',language:'App language',chooseTheme:'Theme presets',
 customColors:'Custom colors',primaryColor:'Primary accent',secondaryColor:'Secondary accent',
 backdrop:'App background',wallpaperChoose:'Wallpaper presets',none:'No wallpaper',own:'Custom wallpaper',
 upload:'Choose JPG / PNG / WEBP file',wallHelp:'CC0 motorsport wallpapers work offline. Uploaded wallpapers are saved locally.',
 blur:'Blur',brightness:'Brightness',saturation:'Saturation',opacity:'Wallpaper opacity',
 layout:'Layout and widgets',density:'UI density',compact:'Compact',normal:'Normal',
 comfortable:'Comfortable',sidebar:'Compact sidebar',widgets:'Dashboard widgets',
 orderHelp:'Use the arrows or drag to reorder and show or hide widgets. Your layout is saved automatically.',
 backup:'Export and import',export:'Export settings',import:'Import settings',
 backupHelp:'Exports include colors, language, widgets and your own wallpaper if selected.',
 update:'Updates',checkUpdate:'Check for updates',installUpdate:'Install downloaded update',
 about:'About',version:'Version',recorder:'Collector status',openFolder:'Open sessions folder',
 settingsSaved:'Settings saved',settingsImported:'Settings imported',
 futureTitle:'Coming soon',futureDescription:'This part will be developed in upcoming Apex AI releases.',
 planned:'PLANNED',close:'Close',next:'Next',back:'Back',finish:'Finish setup',
 onboarding:'FIRST LAUNCH',step:'STEP',stepOne:'Meet your driver',stepOneSub:'Choose your name and language. You can change both later in Settings.',
 stepTwo:'Your racing colors',stepTwoSub:'Choose a preset or customize both interface accent colors.',
 stepThree:'Your cockpit',stepThreeSub:'Choose an app wallpaper. You can upload your own photo later.',
 updateReady:'Update ready to install',updateCurrent:'Apex AI is up to date',updateChecking:'Checking for updates…',updateAvailable:'Update available',updateDownloading:'Downloading update',updateError:'Update failed',
 ready:'Apex AI ready',status:'Status',copied:'Copied',noLaps:'This stint has no complete laps yet.',
 lapBest:'Best lap',noValidCompare:'Not enough valid samples to compare these laps.',
 dataLocal:'Your telemetry stays on this computer.',showAll:'Full analysis',
 waitingUpdate:'Checking for updates…',unsaved:'Could not save preferences',
 futureDescription:'This part will be developed in upcoming Apex AI releases.',
 car:'Car',track:'Track',date:'Date',avgFuel:'Average fuel drop',
 sectorsEstimated:'Sectors estimated from ACC samples, not official sector splits.',
 telemetryHint:'Charts show real data from the selected session only.',
 raceInsights:'Data-driven observations',notice:'Note',test75:'Sampling target: 75 Hz. Check actual rates in Telemetry quality.',samplingDiagnostics:'75 Hz diagnostics',target:'Target',effectiveHz:'Saved samples per second',uniquePhysicsHz:'New ACC updates per second',duplicateFrames:'Reads of the same data',goalAchievement:'Target achieved',p95Interval:'Gap for 95% of reads',delayedIntervals:'Intervals above 25 ms',maxGap:'Longest interval',medianInterval:'Median interval',samplingExplanation:'1 Hz means one save per second. ACC may provide new data less often, so some reads repeat the same data. At least 95% of measured gaps between reads were this short or shorter. Measurements start at 30 km/h and skip gaps longer than 250 ms.',
 demo:'Demo telemetry is not loaded automatically.',
 racePageSub:'Races and sessions recorded since 0.3.6. Positions, pit visits and driving stints in one report.',
 raceHistory:'Saved races',raceReport:'Race analysis',raceNoData:'No new-format race reports yet. Older stints remain in History.',
 raceStints:'Driving stints',racePit:'Pit lane visits',racePositions:'Position changes',racePosition:'Position',
 raceStart:'Start',raceFinish:'Latest',raceDelta:'Position change',raceUnknown:'No data',
 racePitDuration:'Time in pit lane',raceStationary:'Stopped at 2 km/h or less',raceFuelAdded:'Observed fuel increase',
 raceCompound:'Tyre compound',raceTyresUnknown:'Tyre change: unconfirmed',raceRepairsUnknown:'Repairs: no telemetry data',
 raceObserved:'Values come from ACC shared memory. Compound changes do not prove a tyre change, and lane time is not service time.',
 raceVisitPending:'Pit visit ongoing or incomplete',raceNoVisits:'No pit lane visits recorded.',
 raceNoPosition:'ACC did not provide valid standings.',raceTraining:'Practice / non-race session',
 launchACC:'Launch ACC via Steam',launchRequested:'Command sent to Steam. Waiting for ACC detection.',
 driveSub:'Launch Assetto Corsa Competizione. Apex AI automatically records when you start driving.',
 driveNote:'This button asks Steam to launch ACC. Game connection is only confirmed when ACC is detected.',
 raceToReport:'Open race analysis',raceRecorded:'Linked races',
 polish:'Polski',english:'English',now:'LIVE'
}
};
// Six licensed CC0 motorsport photos are cropped to 1920x1080
// and bundled inside the installer. No external image loading at runtime.
const wallpaperPresets={
 gt3:{title:'GT3 · Toyota GR',file:'gt3.jpg',original:'Toyota_GR_GT3_Prototype_cropped.jpg',author:'TTTNIS',license:'CC0 1.0'},
 gt3b:{title:'GT3 · Toyota Rear',file:'gt3b.jpg',original:'Toyota_GR_GT3_Prototype_rear.jpg',author:'TTTNIS',license:'CC0 1.0'},
 wec:{title:'Le Mans · 2023',file:'wec.jpg',original:'Car_65_Manuel_Maldonado_in_Le_Mans_2023.jpg',author:'Briansoprano',license:'CC0 1.0'},
 wecb:{title:'Le Mans · Classic',file:'wecb.jpg',original:'24_hours_of_Le_Mans_1990.jpg',author:'RandolphGuffey',license:'CC0 1.0'},
 f1:{title:'F1 · 2026',file:'f1.jpg',original:'2026_f1_regulation.jpg',author:'BlackFlash06',license:'CC0 1.0'},
 f1b:{title:'F1 · Audi',file:'f1b.jpg',original:'Audi_Revolut_F1.jpg',author:'Mustang Joe',license:'CC0 1.0'}
};
const themes={
 violet:['#a46bfa','#ed4c75'],red:['#f35c69','#b52a47'],
 blue:['#62a9ff','#5859fa'],green:['#54d6ac','#278bab']
};
const icons={
 raceView:'<path d="M5 3v18M5 5h13l-3 4 3 4H5"/><path d="M9 9h2m4 0h2m-5 3h2"/>',
 home:'<path d="m3 10 9-7 9 7v11H3z"/><path d="M9 21v-8h6v8"/>',
 dashboard:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 stint:'<path d="M3 19V5m0 14h18M7 14l4-5 3 3 6-7"/>',
 history:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v6l4 2"/>',
 live:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',
 setups:'<path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.2 2.2m8.4 8.4 2.2 2.2M18.4 5.6l-2.2 2.2m-8.4 8.4-2.2 2.2"/><circle cx="12" cy="12" r="4"/>',
 engineer:'<rect x="4" y="7" width="16" height="13" rx="3"/><path d="M12 3v4M8 13h.01M16 13h.01M9 17h6"/>',
 drive:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 9V3m-3 10-5 3m11-3 5 3"/>',
 settings:'<path d="M10 2h4l1 3 3 1 3-1 2 4-2 2v3l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-3L1 9l2-4 3 1 3-1z"/><circle cx="12" cy="12" r="3"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
 trophy:'<path d="M8 4h8v8a4 4 0 0 1-8 0V4Zm-3 1H3v4a4 4 0 0 0 5 4m11-8h2v4a4 4 0 0 1-5 4M12 16v5m-4 0h8"/>',
 flag:'<path d="M5 21V4m0 0c5-4 9 4 14 0v11c-5 4-9-4-14 0"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
 folder:'<path d="M3 6h7l2 3h9v12H3z"/>'
};
const state={
 cfg:null,view:'home',sessions:[],races:[],selectedRace:null,launchRequested:false,search:'',currentKey:'',currentMeta:null,
 laps:[],samples:[],selectedLap:1,lapA:1,lapB:2,
 collector:{code:'waiting',text:''},updater:{code:'idle',text:''},live:null,
 onboardingStep:0,dragWidget:null,loading:false,lastError:''
};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const t=k=>(dict[state.cfg?.language||'pl']||dict.pl)[k]||dict.pl[k]||k;
const symbol=k=>'<span class="symbol"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'+(icons[k]||icons.dashboard)+'</svg></span>';
const date=v=>{const d=new Date(v);return Number.isFinite(d.getTime())?d.toLocaleDateString(state.cfg?.language==='en'?'en-GB':'pl-PL',{day:'numeric',month:'long',year:'numeric'}):'—';};
const time=v=>{const a=Number(v);if(!(a>0&&a<600))return '—';const ms=Math.round(a*1000);return Math.floor(ms/60000)+':'+String(Math.floor(ms%60000/1000)).padStart(2,'0')+'.'+String(ms%1000).padStart(3,'0');};
const num=(v,d=1)=>Number.isFinite(Number(v))?Number(v).toFixed(d):'—';
const avg=arr=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:NaN;
const std=arr=>arr.length>1?Math.sqrt(arr.reduce((a,b)=>a+(b-avg(arr))**2,0)/arr.length):NaN;
const localWallpaper=file=>new URL('./wallpapers/'+file,document.baseURI).href;
const wikiFile=file=>'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(file);
const E=id=>document.getElementById(id);
const WIDGETS=['pace','sectors','speed','pedals','fuel','tyres','compare','race','quality'];
let savePending=null,toastTimer=null;
function toast(msg) {
  let x=E('toast');if(!x){x=document.createElement('div');x.id='toast';x.className='toast';root.appendChild(x);}
  x.textContent=msg;x.hidden=false;
  if(toastTimer)clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{if(x)x.hidden=true;},3300);
}
function collectorLabel(){return ['waiting','connected','recording'].includes(state.collector.code)?t(state.collector.code):state.collector.text||t('waiting');}
function updaterLabel(){const code=state.updater.code;const keys={ready:'updateReady',current:'updateCurrent',checking:'updateChecking',available:'updateAvailable',downloading:'updateDownloading',error:'updateError'};if(!keys[code])return state.updater.text||'0.3.6';const p=(state.updater.text||'').match(/(\d+)%/);return t(keys[code])+(p?' '+p[1]+'%':'');}
function style(){
  const c=state.cfg;
  document.documentElement.style.setProperty('--accent1',c.accent);
  document.documentElement.style.setProperty('--accent2',c.accent2);
  document.documentElement.style.setProperty('--glow',c.accent+'33');
  document.documentElement.lang=c.language;
  document.body.className='density-'+c.displayDensity;
  const back=E('wallpaper');
  if(back){
    let url='';
    if(c.wallpaper==='custom'&&c.customWallpaper)url=c.customWallpaper;
    else if(wallpaperPresets[c.wallpaper])url=localWallpaper(wallpaperPresets[c.wallpaper].file);
    back.style.backgroundImage=url?'url("'+url+'")':'none';
    back.style.opacity=c.wallpaper==='none'?'0':String(c.opacity/100);
    back.style.filter='blur('+c.blur+'px) brightness('+(c.brightness/100)+') saturate('+(c.saturation/100)+')';
  }
  const preview=E('wallpaper-preview-image');
  if(preview){
    const image=c.wallpaper==='custom'?c.customWallpaper:wallpaperPresets[c.wallpaper]?localWallpaper(wallpaperPresets[c.wallpaper].file):'';
    preview.style.backgroundImage=image?'url("'+image+'")':'none';
    preview.style.opacity=image?String(c.opacity/100):'0';
    preview.style.filter='blur('+(c.blur/3)+'px) brightness('+(c.brightness/100)+') saturate('+(c.saturation/100)+')';
  }
}
function persist(){if(savePending)clearTimeout(savePending);savePending=setTimeout(async()=>{
  try{
   const saved=await api.savePreferences(state.cfg);
   if(!saved||saved.error){toast(t('unsaved')+': '+(saved?.error||'unknown'));return;}
   state.cfg=saved;
  }catch(e){toast(t('unsaved')+': '+e.message);}
},220);}
function patch(key,value){state.cfg[key]=value;style();persist();}
function cleanName(x){
 const aliases={
  imola:'Imola Autodromo Enzo e Dino Ferrari',monza:'Autodromo Nazionale Monza',
  ferrari_296_gt3:'Ferrari 296 GT3',porsche_992_gt3_r:'Porsche 992 GT3 R',
  silverstone:'Silverstone',spa:'Circuit de Spa-Francorchamps'
 };
 const raw=String(x||'').trim();
 return aliases[raw.toLowerCase()]||raw.replace(/[_-]/g,' ').replace(/\b[a-z]/g,c=>c.toUpperCase());
}
function nameSession(s){
 return [cleanName(s.trackName||s.track)||'?',cleanName(s.carName||s.car)||'?'].join(' · ');
}
function navItems(){
 return [['home','home'],['dashboard','dashboard'],['stint','stint'],['history','history'],['live','live'],
 ['raceView','raceView'],['drive','drive'],['setups','setups'],['engineer','engineer']];
}
function shell(){
 const c=state.cfg,short=c.sidebarCompact;
 root.innerHTML=
 '<div id="wallpaper"></div><div id="wallpaper-shade"></div>'+
 '<div class="titlebar"><div class="titleleft"><span class="mark">A</span>APEX AI <small>RACE INTELLIGENCE · 0.3.6</small></div>'+
 '<div class="windowcontrols"><button class="winbtn" data-action="minimize" title="Minimize">−</button>'+
 '<button class="winbtn" data-action="maximize" title="Maximize">□</button>'+
 '<button class="winbtn close" data-action="close" title="Close">×</button></div></div>'+
 '<div class="layout'+(short?' compact':'')+'" id="layout"><aside><div class="brand"><span class="mark">A</span><div class="brandword"><strong>APEX AI</strong><small>RACE INTELLIGENCE</small></div></div>'+
 '<div class="navcaption">'+esc(t('workspace'))+'</div><nav class="navitems" id="nav">'+navItems().map(([k,icon])=>
 '<button class="navitem'+(state.view===k?' active':'')+'" data-nav="'+k+'" title="'+esc(t(k))+'">'+symbol(icon)+
 '<span class="navlabel">'+esc(t(k))+'</span>'+( ['setups','engineer','drive'].includes(k)?'<span class="soon">'+esc(t('planned'))+'</span>':'')+'</button>').join('')+'</nav>'+
 '<div class="navspacer"></div><div class="navbottom"><button class="navitem'+(state.view==='settings'?' active':'')+'" data-nav="settings" title="'+esc(t('settings'))+'">'+symbol('settings')+
 '<span class="navlabel">'+esc(t('settings'))+'</span></button>'+
 '<div class="mutedline"><i class="dot '+esc(state.collector.code)+'"></i><span id="side-status">'+esc(collectorLabel())+'</span><br><span style="opacity:.6">APEX AI 0.3.6</span></div></div></aside>'+
 '<div class="contentarea"><div class="topbar"><div class="top-left"><button class="ghost-square" data-action="toggle-sidebar" title="Menu">'+symbol('menu')+'</button>'+
 '<div class="top-page"><strong id="top-title">'+esc(t(state.view==='report'?'showFull':state.view))+'</strong><small>APEX AI / <span id="top-subtitle">'+esc(t(state.view==='report'?'history':state.view))+'</span></small></div></div>'+
 '<div class="top-right"><span class="connection"><i id="connection-dot" class="dot '+esc(state.collector.code)+'"></i><span id="connection-label">'+esc(state.collector.text||t('waiting'))+'</span></span>'+
 '<span class="version" id="update-label">'+esc(updaterLabel())+'</span></div></div>'+
 '<main id="page"></main></div></div><div class="toast" id="toast" hidden></div>';
 style();renderPage();
}
function navigate(view){
 const allow=['home','dashboard','stint','history','live','raceView','settings','report','setups','engineer','drive'];
 if(!allow.includes(view))return;
 state.view=view;
 document.querySelectorAll('[data-nav]').forEach(x=>x.classList.toggle('active',x.dataset.nav===view||view==='report'&&x.dataset.nav==='history'));
 if(E('top-title'))E('top-title').textContent=t(view==='report'?'showFull':view);
 if(E('top-subtitle'))E('top-subtitle').textContent=t(view==='report'?'history':view);
 renderPage();
 E('page').scrollTop=0;
 if(view==='raceView'&&!state.selectedRace&&state.races[0])void openRace(state.races[0].id,true);
 if(['dashboard','stint','report'].includes(view)&&!state.currentKey&&state.sessions[0])
   void openSession(state.sessions[0].key,true);
}
function head(kicker,title,sub,extra=''){
 return '<div class="page-head"><div><div class="kicker">'+esc(kicker)+'</div><h1>'+esc(title)+'</h1><p class="subtitle">'+esc(sub)+'</p></div>'+extra+'</div>';
}
function metric(label,value,hint='') {
 return '<div class="glass metric"><small>'+esc(label)+'</small><strong>'+esc(value)+'</strong><em>'+esc(hint)+'</em></div>';
}
function lapMetrics() {
 const good=state.laps.filter(x=>Number.isFinite(x.time)&&x.time>0&&x.time<600);
 return {good,best:good.length?Math.min(...good.map(x=>x.time)):NaN,mean:avg(good.map(x=>x.time)),sd:std(good.map(x=>x.time))};
}
function sessionHead() {
 const s=state.currentMeta;
 return '<span class="small">'+(s?esc(nameSession(s))+' · '+esc(date(s.date)):esc(t('noData')))+'</span>';
}
function home(){
 const latest=state.sessions[0],total=state.sessions.reduce((n,s)=>n+(Number(s.lapCount)||0),0);
 return '<div class="hero"><div class="kicker">YOUR RACE · YOUR DATA</div><h1>'+esc(t('welcome'))+', <span class="gradient">'+esc(state.cfg.language==='en'&&state.cfg.driver==='Kierowco'?'Driver':state.cfg.driver)+'.</span></h1>'+
 '<p class="subtitle">'+esc(t('heroSub'))+'</p><div class="buttons">'+
 '<button class="btn primary" data-nav="history">'+symbol('history')+esc(t('openHistory'))+' →</button>'+
 '<button class="btn" data-nav="live">'+symbol('live')+esc(t('current'))+'</button></div></div>'+
 '<h2 class="sectionhead">'+esc(t('overview'))+'</h2><div class="summary-grid">'+
 metric(t('recorded'),String(state.sessions.length),'ACC')+metric(t('laps'),String(total),'ACC')+
 metric(t('lastBest'),latest?time(latest.bestLap):'—',latest?date(latest.date):'')+
 metric(t('recorder'),state.collector.code==='recording'?t('recording'):t('waiting'),'ACC')+
 '</div><div class="glass last-session"><div><small>'+esc(t('lastSession'))+'</small><h3>'+
 (latest?esc(nameSession(latest)):esc(t('noSessions')))+
 '</h3><p>'+(latest?esc(date(latest.date)+' · '+latest.lapCount+' '+t('laps')+' · '+time(latest.bestLap)):esc(t('startToSave')))+
 '</p></div>'+(latest?'<button class="btn" data-open="'+esc(latest.key)+'">'+esc(t('openSession'))+' →</button>':'')+'</div>';
}
function parseCSV(text){
 if(!text||typeof text!=='string')return [];
 const lines=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/);
 if(lines.length<2)return [];
 const keys=lines.shift().toLowerCase().split(',');
 return lines.map(line=>{
  const cells=line.split(',');const obj={};
  for(let i=0;i<keys.length;i++){
   const key=keys[i].trim(),v=(cells[i]||'').trim();
   if(['track','track_name','car_name','car_model','sector_source'].includes(key)){obj[key]=v;continue;}
   if(key==='time'&&v.includes(':')){const parts=v.split(':').map(Number);obj[key]=parts.length===2?parts[0]*60+parts[1]:NaN;continue;}
   obj[key]=v===''?NaN:Number(v);
  }
  return obj;
 }).filter(x=>Number.isFinite(x.lap)||Number.isFinite(x.completed_laps));
}
// ACC Physics CSV stores the raw gear in both old and new sessions.
// Shared memory encodes reverse as 0, neutral as 1, and first as 2.
function accGear(raw){
 return Number.isInteger(raw)&&raw>=0?raw-1:null;
}
function gearLabel(raw){
 const gear=accGear(raw);
 if(gear===null)return '—';
 if(gear===-1)return 'R';
 return gear===0?'N':String(gear);
}
function parseSamples(text){
 if(!text||typeof text!=='string')return [];
 const lines=text.replace(/^\uFEFF/,'').trim().split(/\r?\n/);
 if(lines.length<2)return [];
 const header=lines.shift().split(',').map(x=>x.trim());
 const numeric=['completed_laps','sector_index','lap_progress','speed_kmh','gas','brake','gear','rpm','fuel',
 'tyre_fl','tyre_fr','tyre_rl','tyre_rr','pressure_fl','pressure_fr','pressure_rl','pressure_rr',
 'steer_input','g_x','g_y','g_z','tc_action','abs_action','in_pit','physics_packet_id',
 'race_position','in_pit_lane','session_type','session_time_left_s','mandatory_pit_done'];
 const entries=numeric.map(k=>[k,header.indexOf(k)]).filter(x=>x[1]>=0);
 const ts=header.indexOf('timestamp_utc');
 const result=[];
 for(const line of lines){
  if(!line)continue;
  const fields=line.split(',');
  if(fields.length!==header.length)continue;
  const obj={};
  for(const [k,i]of entries){const raw=fields[i];obj[k]=raw===''?NaN:Number(raw);}
  const stamp=ts>=0?Date.parse(fields[ts]):NaN;
  obj.timestamp_ms=stamp;result.push(obj);
 }
 return result;
}
async function openSession(key,quiet=false){
 if(state.loading)return;
 state.loading=true;
 try{
  const file=await api.loadSession(key);
  if(!file||file.error)throw Error(file?.error||'Session not found');
  state.laps=parseCSV(file.laps);
  state.samples=parseSamples(file.samples);
  state.currentKey=key;
  state.currentMeta=state.sessions.find(s=>s.key===key)||null;
  state.selectedLap=state.laps[0]?.lap||1;
  state.lapA=state.laps[0]?.lap||1;
  state.lapB=state.laps.length>1?state.laps[state.laps.length-1].lap:state.lapA;
  if(!quiet)navigate('report');else if(['dashboard','stint','report'].includes(state.view))renderPage();
 }catch(e){toast(String(e.message||e));}
 finally{state.loading=false;}
}
function pointsFor(lap){
 let all=state.samples.filter(s=>s.completed_laps===lap-1&&Number.isFinite(s.lap_progress)&&
 s.lap_progress>=0&&s.lap_progress<=1.01&&s.in_pit!==1);
 if(all.length<50)return [];
 let cut=0;for(let i=1;i<all.length;i++)if(all[i].lap_progress<all[i-1].lap_progress-.5)cut=i;
 all=all.slice(cut);
 // Do not invent missing telemetry; groups must cover most of the lap.
 if(all.length<60||Math.min(...all.map(x=>x.lap_progress))>.15||Math.max(...all.map(x=>x.lap_progress))<.8)return [];
 return all;
}
function seriesLap(lap,field){
 const points=pointsFor(lap);
 return points.filter(p=>Number.isFinite(p[field])).map(p=>[Math.min(1,Math.max(0,p.lap_progress)),p[field]]);
}
function chart(series,unit='',opts={}){
 const arr=series.flatMap(s=>s.points.map(x=>x[1]).filter(Number.isFinite));
 if(!arr.length)return '<div class="empty"><strong>'+esc(t('noData'))+'</strong>'+esc(t('telemetryHint'))+'</div>';
 const mn=Number.isFinite(opts.min)?opts.min:Math.min(...arr);
 const mx=Number.isFinite(opts.max)?opts.max:Math.max(...arr);
 let low=mn,high=mx;if(high-low<.001){low-=1;high+=1;}
 else if(!Number.isFinite(opts.min)&&!Number.isFinite(opts.max)){const pad=(high-low)*.12;low-=pad;high+=pad;}
 const L=53,R=732,T=19,B=217,xx=x=>L+(R-L)*Math.min(1,Math.max(0,x));
 const yy=y=>B-(y-low)/(high-low)*(B-T);
 let out='<svg role="img" aria-label="'+esc(unit)+' chart" viewBox="0 0 765 258" xmlns="http://www.w3.org/2000/svg">';
 for(let i=0;i<=4;i++){
  const y=T+(B-T)*i/4,val=high-(high-low)*i/4;
  out+='<line class="chart-grid" x1="'+L+'" y1="'+y+'" x2="'+R+'" y2="'+y+'"/>'+
   '<text class="chart-label" text-anchor="end" x="'+(L-9)+'" y="'+(y+3)+'">'+(Math.abs(val)>100?val.toFixed(0):val.toFixed(1))+'</text>';
 }
 for(let i=0;i<=4;i++)out+='<text class="chart-label" text-anchor="middle" x="'+xx(i/4)+'" y="242">'+i*25+'%</text>';
 const maxPoints=500;
 for(const s of series){
  const arr0=s.points.filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1]));
  const step=Math.max(1,Math.ceil(arr0.length/maxPoints));
  let path='';
  for(let j=0;j<arr0.length;j+=step){const p=arr0[j];path+=(path?'L':'M')+xx(p[0]).toFixed(1)+','+yy(p[1]).toFixed(1);}
  if(arr0.length){const last=arr0[arr0.length-1];path+='L'+xx(last[0]).toFixed(1)+','+yy(last[1]).toFixed(1);}
  out+='<path d="'+path+'" stroke="'+(s.color||'#a46bfa')+'" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
 }
 return out+'</svg>';
}
function legend(items){return '<div class="chart-legend">'+items.map(x=>'<span><i style="background:'+x.color+'"></i>'+esc(x.label)+'</span>').join('')+'</div>';}
function chartCard(id,title,content,caption='',wide=false){
 return '<section class="glass widget '+(wide?'wide':'')+'" data-widget="'+id+'"><div class="widget-header"><h3>'+esc(title)+'</h3></div>'+
 '<div class="widget-graph">'+content+'</div>'+(caption?'<div class="widget-caption">'+esc(caption)+'</div>':'')+'</section>';
}
function paceCard(){
 const laps=state.laps.filter(x=>Number.isFinite(x.time));
 const n=laps.length;
 const times=laps.map(x=>x.time);
 const pts=laps.map((x,i)=>[n<2?.5:i/(n-1),x.time]);
 return chartCard('pace',t('pace'),chart([{color:state.cfg.accent,points:pts}],'s',{min:Math.max(0,Math.min(...times)-.7)}),
  t('telemetryHint'));
}
function sectorsCard(){
 const lines=['s1','s2','s3'].map((key,i)=>({
   color:[state.cfg.accent2,'#f6ad5b',state.cfg.accent][i],
   label:'S'+(i+1),
   points:state.laps.map((x,j)=>[state.laps.length<2?.5:j/(state.laps.length-1),x[key]]).filter(p=>Number.isFinite(p[1]))
 }));
 return chartCard('sectors',t('sectors'),chart(lines,'s')+legend(lines),t('sectorsEstimated'));
}
function lapSelect(name,current){
 return '<label class="field"><span>'+esc(t(name))+'</span><select data-lap="'+name+'">'+
 state.laps.map(x=>'<option value="'+x.lap+'"'+(Number(current)===Number(x.lap)?' selected':'')+'>'+
 esc(t('lap'))+' '+x.lap+' · '+time(x.time)+'</option>').join('')+'</select></label>';
}
function speedCard(){
 const pts=seriesLap(state.selectedLap,'speed_kmh');
 return '<section class="glass widget" data-widget="speed"><div class="widget-header"><h3>'+esc(t('speedPlot'))+'</h3>'+lapSelect('selectedLap',state.selectedLap)+'</div>'+
 '<div class="widget-graph">'+chart([{points:pts,color:state.cfg.accent}], 'km/h',{min:0})+'</div><p class="widget-caption">'+esc(t('telemetryHint'))+'</p></section>';
}
function pedalsCard(){
 const a=seriesLap(state.selectedLap,'gas').map(p=>[p[0],p[1]*100]);
 const b=seriesLap(state.selectedLap,'brake').map(p=>[p[0],p[1]*100]);
 const lines=[{label:t('throttle'),points:a,color:state.cfg.accent},{label:t('brake'),points:b,color:state.cfg.accent2}];
 return chartCard('pedals',t('pedals'),chart(lines,'%',{min:0,max:100})+legend(lines),t('telemetryHint'));
}
function fuelCard(){
 const pts=state.laps.map((x,i)=>[state.laps.length<2?.5:i/(state.laps.length-1),x.fuel]).filter(x=>Number.isFinite(x[1]));
 return chartCard('fuel',t('fuelPlot'),chart([{points:pts,color:'#58dbc1'}],'L'),t('telemetryHint'));
}
function tyreCard(){
 const keys=['tyre_fl','tyre_fr','tyre_rl','tyre_rr'],colors=['#5edac4','#f6b16e','#999ff5','#e875b2'];
 const lines=keys.map((key,i)=>({label:key.substring(5).toUpperCase(),color:colors[i],points:state.laps.map((x,j)=>[state.laps.length<2?.5:j/(state.laps.length-1),x[key]]).filter(x=>Number.isFinite(x[1]))}));
 return chartCard('tyres',t('tyrePlot'),chart(lines,'°C')+legend(lines),t('telemetryHint'));
}
function compareCard(){
 const a=seriesLap(state.lapA,'speed_kmh'),b=seriesLap(state.lapB,'speed_kmh');
 const lines=[{label:'A · '+state.lapA,color:state.cfg.accent,points:a},{label:'B · '+state.lapB,color:'#f3ae5d',points:b}];
 return '<section class="glass widget wide" data-widget="compare"><div class="widget-header"><h3>'+esc(t('compare'))+'</h3>'+
 '<div class="row">'+lapSelect('lapA',state.lapA)+lapSelect('lapB',state.lapB)+'</div></div>'+
 '<div class="widget-graph">'+chart(lines,'km/h',{min:0})+legend(lines)+'</div>'+
 '<p class="widget-caption">'+esc(t('noValidCompare'))+'</p></section>';
}
function qualityCard(){
 const d=window.ApexSamplingDiagnostics?.analyze(state.samples,75);
 if(!d)return chartCard('quality',t('quality'),'<div class="empty">'+esc(t('noData'))+'</div>');
 const fmtHz=v=>Number.isFinite(v)?num(v,1)+' Hz':'—';
 const status=Number.isFinite(d.savedHz)?d.savedHz>=72?'✓':d.savedHz>=60?'~':'!':'—';
 return '<section class="glass widget" data-widget="quality">'+
 '<div class="widget-header"><h3>'+esc(t('quality'))+' · '+esc(t('samplingDiagnostics'))+'</h3>'+
 '<span style="color:var(--accent1);font-size:12px;font-weight:700">'+status+' '+esc(t('target'))+': 75 Hz</span></div>'+
 '<div class="summary-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));margin:0">'+
 metric(t('samples'),String(d.count))+metric(t('effectiveHz'),fmtHz(d.savedHz))+
 metric(t('uniquePhysicsHz'),Number.isFinite(d.uniqueHz)?num(d.uniqueHz,1):'—')+
 metric(t('duplicateFrames'),Number.isFinite(d.duplicatesPercent)?num(d.duplicatesPercent,1)+'%':'—')+
 metric(t('goalAchievement'),Number.isFinite(d.goalPercent)?num(d.goalPercent,1)+'%':'—')+
 metric(t('p95Interval'),Number.isFinite(d.p95GapMs)?num(d.p95GapMs,0)+' ms':'—')+
 metric(t('delayedIntervals'),String(d.over25),'Δt > 25 ms')+
 metric(t('timeGaps'),String(d.pauses),'Δt > 250 ms')+
 metric(t('maxGap'),Number.isFinite(d.maxGapMs)?num(d.maxGapMs,0)+' ms':'—')+
 metric(t('medianInterval'),Number.isFinite(d.medianGapMs)?num(d.medianGapMs,0)+' ms':'—')+
 '</div><p class="widget-caption" style="margin-top:14px">'+esc(t('samplingExplanation'))+'</p></section>';
}
function raceCard(){
 const data=window.ApexRaceAnalysis?.analyze(state.samples,state.lapA,state.lapB);
 if(!data?.lapsValid)return chartCard('race',t('race'),'<div class="empty">'+esc(t('noValidCompare'))+'</div>');
 const deltas=data.deltaBars.filter(x=>Number.isFinite(x.delta));
 const big=data.zones.filter(x=>Number.isFinite(x.delta)).sort((a,b)=>b.delta-a.delta).slice(0,10);
 const width=690,height=155,baseline=78,scale=58/Math.max(.2,...deltas.map(x=>Math.abs(x.delta)));
 let svg='<svg role="img" aria-label="Local lap time delta" viewBox="0 0 730 195"><line x1="30" x2="710" y1="'+baseline+'" y2="'+baseline+'" stroke="#b2a0c0" opacity=".5"/>';
 for(const v of deltas){
  const x=30+v.start*width;
  const h=Math.abs(v.delta)*scale;
  svg+='<rect x="'+x.toFixed(2)+'" y="'+(v.delta>0?baseline-h:baseline)+'" width="'+(width/20-3)+'" height="'+h.toFixed(2)+'" fill="'+(v.delta>0?'#e6a35d':'#50cbaa')+'"/>';
 }
 svg+='<text class="chart-label" x="30" y="184">0%</text><text class="chart-label" x="345" y="184">50%</text><text class="chart-label" x="675" y="184">100%</text></svg>';
 const rows=big.map(z=>'<tr><td>'+Math.round(z.start*100)+'–'+Math.round(z.end*100)+'%</td>'+
 '<td>'+num(z.minA,1)+' km/h</td><td>'+num(z.minB,1)+' km/h</td>'+
 '<td style="color:'+(z.delta>0?'#eeb07b':'#70e5c0')+'">'+(z.delta>0?'+':'')+num(z.delta,3)+' s</td></tr>').join('');
 return '<section class="glass widget wide" data-widget="race"><div class="widget-header"><h3>'+esc(t('race'))+' · Race Analysis</h3>'+
 '<div class="row">'+lapSelect('lapA',state.lapA)+lapSelect('lapB',state.lapB)+'</div></div>'+
 '<p class="small">'+(state.cfg.language==='en'
  ?'Local time differences: orange = B slower; green = B faster. Estimates from timestamped samples.'
  :'Lokalne różnice czasu: pomarańczowy = B wolniejsze, zielony = B szybsze. Szacunki z próbek z czasem UTC.')+'</p>'+
 svg+legend([{color:'#e6a35d',label:'B > A'},{color:'#50cbaa',label:'B < A'}])+
 '<h3 style="margin:23px 0 10px">'+(state.cfg.language==='en'?'Detected braking zones':'Wykryte strefy hamowania')+'</h3>'+
 (rows?'<div class="data-table-wrap"><table><thead><tr><th>'+esc(t('section'))+'</th><th>Min A</th><th>Min B</th><th>Δ B−A</th></tr></thead><tbody>'+rows+'</tbody></table></div>':
 '<p class="small">'+esc(t('noValidCompare'))+'</p>')+
 '<p class="widget-caption">'+(state.cfg.language==='en'
 ?'Estimated zones based on brake input above 18%; not official track corner locations.'
 :'Szacunkowe strefy na podstawie hamulca powyżej 18%; nie są oficjalnymi zakrętami toru.')+'</p></section>';
}
const widgetRender={pace:paceCard,sectors:sectorsCard,speed:speedCard,pedals:pedalsCard,fuel:fuelCard,tyres:tyreCard,compare:compareCard,race:raceCard,quality:qualityCard};
function widgets(ids){return '<div class="widget-grid">'+ids.map(x=>widgetRender[x]?.()||'').join('')+'</div>';}
function noSession(){return '<div class="empty"><strong>'+esc(t('noData'))+'</strong>'+esc(t('chooseSession'))+'</div>';}
function dashboard(){
 return head('PERFORMANCE CENTER',t('dashboard'),t('dashboardSub'),sessionHead())+raceJump()+
 (state.currentKey?'<div class="summary-grid">'+summaryStats()+'</div>'+
 widgets(state.cfg.widgetOrder.filter(w=>state.cfg.visibleWidgets.includes(w))):
 noSession());
}
function summaryStats(){
 const m=lapMetrics();
 return metric(t('laps'),String(m.good.length))+metric(t('best'),time(m.best))+
 metric(t('average'),time(m.mean))+metric(t('deviation'),Number.isFinite(m.sd)?num(m.sd,2)+' s':'—');
}
function stintTable(){
 if(!state.laps.length)return noSession();
 return '<section class="glass widget wide"><div class="widget-header"><h3>'+esc(t('overview'))+'</h3></div>'+
 '<div class="data-table-wrap"><table><thead><tr>'+['lap','time','S1','S2','S3','fuel','tyreTemp'].map(x=>'<th>'+esc(t(x))+'</th>').join('')+'</tr></thead>'+
 '<tbody>'+state.laps.map(x=>'<tr><td>'+x.lap+'</td><td class="table-highlight">'+time(x.time)+'</td>'+
 ['s1','s2','s3'].map(k=>'<td>'+num(x[k],3)+'</td>').join('')+
 '<td>'+num(x.fuel,1)+' L</td><td>'+num(avg(['tyre_fl','tyre_fr','tyre_rl','tyre_rr'].map(k=>x[k]).filter(Number.isFinite)),1)+'°C</td></tr>').join('')+'</tbody></table></div></section>';
}
function tyrePressureCard(){
 const keys=['pressure_fl','pressure_fr','pressure_rl','pressure_rr'],colors=['#5edac4','#f6b16e','#999ff5','#e875b2'];
 const lines=keys.map((key,i)=>({label:key.substring(9).toUpperCase(),color:colors[i],points:state.samples.filter(x=>Number.isFinite(x[key])&&Number.isFinite(x.lap_progress)).filter((x,j)=>j%120===0).map(x=>[x.lap_progress,x[key]])}));
 return chartCard('pressure',t('tyrePressure'),chart(lines,'PSI')+legend(lines));
}
function electronicsCard(){
 const useful=state.samples.filter(s=>s.speed_kmh>30);
 const tc=useful.filter(s=>s.gas>.15&&s.tc_action>0).length;
 const abs=useful.filter(s=>s.brake>.15&&s.abs_action>0).length;
 let rpmMax=0,gearMax=0;
 for(const x of state.samples){
  if(Number.isFinite(x.rpm)&&x.rpm>rpmMax)rpmMax=x.rpm;
  gearMax=Math.max(gearMax,accGear(x.gear)??0);
 }
 return '<section class="glass widget"><div class="widget-header"><h3>Electronics · TC / ABS</h3></div>'+
 '<div class="summary-grid" style="grid-template-columns:repeat(2,minmax(0,1fr))">'+
 metric('Max RPM',rpmMax?String(Math.round(rpmMax)):'—')+metric(t('maxGear'),gearMax?String(gearMax):'—')+
 metric('TC',useful.length?num(tc/useful.length*100,1)+'%':'—')+
 metric('ABS',useful.length?num(abs/useful.length*100,1)+'%':'—')+'</div>'+
 '<p class="widget-caption">'+esc(t('telemetryHint'))+'</p></section>';
}
function insights(){
 const m=lapMetrics(),arr=m.good.map(x=>x.time);
 let parts=[];
 if(arr.length<5)parts.push(state.cfg.language==='en'?'Fewer than 5 complete laps: trend estimates are unreliable.':'Mniej niż 5 pełnych okrążeń — trend tempa może być niemiarodajny.');
 if(arr.length>=5){
  const span=Math.max(1,Math.floor(arr.length/3)),trend=avg(arr.slice(-span))-avg(arr.slice(0,span));
  parts.push(state.cfg.language==='en'
   ?'Average pace change from first to last third: '+num(trend,2)+' s. A positive value means slower late laps.'
   :'Zmiana średniego tempa pomiędzy pierwszą a ostatnią tercją: '+num(trend,2)+' s. Wartość dodatnia oznacza wolniejszą końcówkę.');
 }
 if(Number.isFinite(m.sd))parts.push((state.cfg.language==='en'?'Lap time standard deviation: ':'Odchylenie standardowe czasów: ')+num(m.sd,2)+' s.');
 const fuels=m.good.map(x=>x.fuel).filter(Number.isFinite);
 const drop=fuels.length>1?(fuels[0]-fuels[fuels.length-1])/(fuels.length-1):NaN;
 if(Number.isFinite(drop)&&drop>.02)parts.push(t('avgFuel')+': '+num(drop,2)+' L/'+t('lap')+'.');
 else parts.push(state.cfg.language==='en'?'Fuel drop cannot be estimated reliably from these samples.':'Nie można wiarygodnie oszacować spadku poziomu paliwa.');
 return '<section class="glass widget wide"><div class="widget-header"><h3>'+esc(t('raceInsights'))+'</h3></div>'+
 parts.map(p=>'<p class="insight">'+esc(p)+'</p>').join('')+'</section>';
}
function stint(){
 return head('STINT INTELLIGENCE',t('stint'),t('stintSub'),sessionHead())+raceJump()+
 (state.currentKey?'<div class="summary-grid">'+summaryStats()+'</div><div class="widget-grid">'+
 stintTable()+fuelCard()+tyreCard()+tyrePressureCard()+electronicsCard()+raceCard()+qualityCard()+insights()+'</div>':noSession());
}
function report(){
 return head('SESSION ARCHIVE',t('showFull'),t('fullSub'),sessionHead())+
 '<div class="buttons" style="margin:0 0 24px"><button class="btn" data-nav="history">'+symbol('history')+esc(t('history'))+'</button>'+
 '<button class="btn" data-nav="dashboard">'+symbol('dashboard')+esc(t('dashboard'))+'</button>'+
 '<button class="btn" data-nav="stint">'+symbol('stint')+esc(t('stint'))+'</button></div>'+raceJump()+
 (state.currentKey?'<div class="summary-grid">'+summaryStats()+'</div>'+
 '<h2 class="sectionhead">'+esc(t('dashboard'))+'</h2>'+widgets(WIDGETS)+
 '<h2 class="sectionhead" style="margin-top:30px">'+esc(t('stint'))+'</h2><div class="widget-grid">'+stintTable()+tyrePressureCard()+electronicsCard()+insights()+'</div>':noSession());
}
function history(){
 const query=state.search.trim().toLocaleLowerCase(state.cfg.language==='en'?'en':'pl');
 const list=state.sessions.filter(x=>(nameSession(x)+' '+date(x.date)).toLowerCase().includes(query));
 return head('SESSION ARCHIVE',t('history'),t('historySub'))+
 '<div class="toolbar"><input id="session-search" type="search" value="'+esc(state.search)+'" placeholder="'+esc(t('search'))+'" style="min-width:270px;flex:1;max-width:550px" />'+
 '<span class="small">'+list.length+' / '+state.sessions.length+'</span></div>'+
 (list.length?'<div class="library-grid">'+list.map(x=>'<div class="history-race-item"><button class="session-card" data-open="'+esc(x.key)+'">'+
 '<small>ACC · '+esc(date(x.date))+'</small><h3>'+esc(cleanName(x.trackName||x.track)||t('track'))+'</h3>'+
 '<p>'+esc(cleanName(x.carName||x.car)||t('car'))+'</p><footer><span>'+Number(x.lapCount||0)+' '+esc(t('laps'))+' · <b>'+time(x.bestLap)+'</b></span>'+
 '<span style="color:var(--accent1)">↗</span></footer></button>'+(x.raceId?'<button class="btn history-race-link" data-open-race="'+esc(x.raceId)+'">'+symbol('raceView')+esc(t('raceToReport'))+'</button>':'')+'</div>').join('')+'</div>':
 '<div class="empty"><strong>'+esc(state.search?t('noMatching'):t('noSessions'))+'</strong>'+esc(t('startToSave'))+'</div>');
}
function live(){
 return head('LIVE ACC DATA',t('live'),t('liveSub'))+
 '<div class="buttons"><button class="btn" data-nav="raceView">'+symbol('raceView')+esc(t('raceToReport'))+'</button></div>'+ 
 '<div class="live-status"><i id="live-dot" class="dot"></i><span id="live-conn">'+esc(t('liveWaiting'))+'</span>'+
 '<span class="small" id="live-key" style="margin-left:auto"></span></div>'+
 '<div class="live-grid">'+
 ['speed','gear','rpm','fuel','race-position'].map(x=>'<div class="glass metric"><small>'+esc(x==='race-position'?t('racePosition'):t(x))+'</small><strong id="live-'+x+'">—</strong><em>'+
 (x==='speed'?'km/h':x==='fuel'?'L':'ACC')+'</em></div>').join('')+'</div>'+
 '<div class="widget-grid"><div class="glass widget"><div class="widget-header"><h3>'+esc(t('pedals'))+'</h3></div>'+
 '<div class="pedal"><span>'+esc(t('throttle'))+'</span><div class="pedalbar"><div id="gas-fill"></div></div><b id="gas-num">—</b></div>'+
 '<div class="pedal brake"><span>'+esc(t('brake'))+'</span><div class="pedalbar"><div id="brake-fill"></div></div><b id="brake-num">—</b></div>'+
 '<div class="pedal"><span>'+esc(t('lapProgress'))+'</span><div class="pedalbar"><div id="progress-fill"></div></div><b id="progress-num">—</b></div></div>'+
 '<div class="glass widget"><div class="widget-header"><h3>'+esc(t('tyreTemp'))+' / '+esc(t('tyrePressure'))+'</h3></div>'+
 '<div class="data-table-wrap"><table><thead><tr><th></th><th>FL</th><th>FR</th><th>RL</th><th>RR</th></tr></thead><tbody>'+
 '<tr><td>°C</td>'+['fl','fr','rl','rr'].map(x=>'<td id="temp-'+x+'">—</td>').join('')+'</tr>'+
 '<tr><td>PSI</td>'+['fl','fr','rl','rr'].map(x=>'<td id="press-'+x+'">—</td>').join('')+'</tr>'+
 '</tbody></table></div></div></div>'+
 '<div class="insight" style="margin-top:18px">'+esc(t('liveHint'))+'</div>'+
 '<div class="insight">'+esc(t('pitHint'))+'</div>';
}
function noPreview(){return '<div class="preset-preview none">✦</div>';}
function wallpaperOptions(){
 const list=[['none',t('none')],...Object.entries(wallpaperPresets).map(([id,v])=>[id,v.title]),['custom',t('own')]];
 return '<div class="preset-grid">'+list.map(([id,name])=>{
  let image=id==='custom'?(state.cfg.customWallpaper||''):wallpaperPresets[id]?localWallpaper(wallpaperPresets[id].file):'';
  return '<button class="preset'+(state.cfg.wallpaper===id?' selected':'')+'" data-wallpaper="'+id+'"'+(id==='custom'&&!state.cfg.customWallpaper?' disabled':'')+'>'+
  '<div class="preset-preview '+(id==='none'?'none':'')+'"'+(image?' style="background-image:url(&quot;'+esc(image)+'&quot;)"':'')+'>'+
  (id==='none'?'✦':id==='custom'?'✚':'')+'</div><span>'+esc(name)+'</span></button>';
 }).join('')+'</div>';
}
function themeOptions(){
 return '<div class="presets-color">'+Object.entries(themes).map(([id,cols])=>
 '<button class="swatch'+(state.cfg.theme===id?' selected':'')+'" data-theme="'+id+'">'+
 '<i style="background:'+cols[0]+'"></i><i style="background:'+cols[1]+'"></i>'+esc(id)+'</button>').join('')+'</div>';
}
function prefInput(key,label,min,max,unit){
 return '<div class="field"><label for="range-'+key+'">'+esc(label)+': <b id="val-'+key+'">'+state.cfg[key]+(unit||'')+'</b></label>'+
 '<input type="range" id="range-'+key+'" data-pref="'+key+'" min="'+min+'" max="'+max+'" value="'+state.cfg[key]+'"></div>';
}
function widgetOptions(){
 return state.cfg.widgetOrder.map((w,i)=>'<div class="widget-row" draggable="true" data-dragwidget="'+w+'">'+
 '<input type="checkbox" data-widget-toggle="'+w+'" id="wig-'+w+'"'+(state.cfg.visibleWidgets.includes(w)?' checked':'')+'>'+
 '<strong>'+esc(t(w))+'</strong><button data-move-widget="'+w+'" data-direction="-1" title="Up"'+(i===0?' disabled':'')+'>↑</button>'+
 '<button data-move-widget="'+w+'" data-direction="1" title="Down"'+(i===state.cfg.widgetOrder.length-1?' disabled':'')+'>↓</button></div>').join('');
}
function settings(){
 return head('PERSONAL WORKSPACE',t('settings'),t('settingsSub'))+
 '<div class="settings-grid">'+
 '<section class="glass settings-card"><h3>'+esc(t('personalize'))+'</h3>'+
 '<div class="field"><label>'+esc(t('driverName'))+'</label><input id="driver-name" data-pref="driver" type="text" maxlength="45" value="'+esc(state.cfg.driver)+'"></div>'+
 '<div class="field"><label>'+esc(t('language'))+'</label><select data-pref="language">'+
 '<option value="pl"'+(state.cfg.language==='pl'?' selected':'')+'>'+esc(t('polish'))+'</option>'+
 '<option value="en"'+(state.cfg.language==='en'?' selected':'')+'>'+esc(t('english'))+'</option></select></div>'+
 '<p>'+esc(t('chooseTheme'))+'</p>'+themeOptions()+
 '<div class="row"><div class="field"><label>'+esc(t('primaryColor'))+'</label><input type="color" data-pref="accent" value="'+esc(state.cfg.accent)+'"></div>'+
 '<div class="field"><label>'+esc(t('secondaryColor'))+'</label><input type="color" data-pref="accent2" value="'+esc(state.cfg.accent2)+'"></div></div></section>'+
 '<section class="glass settings-card"><h3>'+esc(t('layout'))+'</h3>'+
 '<div class="field"><label>'+esc(t('density'))+'</label><select data-pref="displayDensity">'+
 ['compact','normal','comfortable'].map(x=>'<option value="'+x+'"'+(state.cfg.displayDensity===x?' selected':'')+'>'+esc(t(x))+'</option>').join('')+'</select></div>'+
 '<label class="row" style="margin:20px 0"><input type="checkbox" data-pref="sidebarCompact"'+(state.cfg.sidebarCompact?' checked':'')+'>'+esc(t('sidebar'))+'</label>'+
 '<h3 style="margin-top:25px">'+esc(t('widgets'))+'</h3><p>'+esc(t('orderHelp'))+'</p>'+
 widgetOptions()+'</section>'+
 '<section class="glass settings-card wide"><h3>'+esc(t('backdrop'))+'</h3><p>'+esc(t('wallHelp'))+'</p>'+
 wallpaperOptions()+'<button class="btn" data-action="choose-wallpaper">'+symbol('folder')+esc(t('upload'))+'</button>'+
 '<div class="wallpaper-preview" id="wallpaper-preview"><div id="wallpaper-preview-image"></div><div class="wallpaper-preview-label">APEX AI · WALLPAPER PREVIEW</div></div>'+
 '<div class="sliders" style="margin:25px 0">'+prefInput('blur',t('blur'),0,30,' px')+
 prefInput('brightness',t('brightness'),10,100,'%')+prefInput('saturation',t('saturation'),0,180,'%')+
 prefInput('opacity',t('opacity'),0,100,'%')+'</div>'+
 '<button class="btn tiny" data-action="reset-wallpaper">'+esc(state.cfg.language==='en'?'Reset wallpaper adjustments':'Przywróć ustawienia tapety')+'</button>'+
 '<div class="credits">'+Object.values(wallpaperPresets).map(p=>
 esc(p.title)+' — '+esc(p.author)+' ('+esc(p.license)+'). <a class="external" href="'+esc(wikiFile(p.original))+'" target="_blank" rel="noopener">Wikimedia Commons</a>').join(' · ')+'</div></section>'+
 '<section class="glass settings-card"><h3>'+esc(t('backup'))+'</h3><p>'+esc(t('backupHelp'))+'</p>'+
 '<div class="buttons"><button class="btn" data-action="export">'+symbol('download')+esc(t('export'))+'</button>'+
 '<button class="btn" data-action="import">'+symbol('folder')+esc(t('import'))+'</button></div>'+
 '<p class="small">'+esc(t('dataLocal'))+'</p></section>'+
 '<section class="glass settings-card"><h3>'+esc(t('update'))+'</h3>'+
 '<p id="update-text">'+esc(updaterLabel())+'</p>'+
 '<div class="buttons"><button class="btn" data-action="check-updates">'+esc(t('checkUpdate'))+'</button>'+
 (state.updater.code==='ready'?'<button class="btn primary" data-action="install-update">'+esc(t('installUpdate'))+'</button>':'')+'</div>'+
 '<p class="small">'+esc(t('test75'))+'</p></section>'+
 '<section class="glass settings-card wide"><h3>'+esc(t('about'))+'</h3><div class="row">'+
 '<span class="small">'+esc(t('version'))+': <b>0.3.6</b></span>'+
 '<span class="small">'+esc(t('recorder'))+': <b id="recorder-settings">'+esc(state.collector.text||t('waiting'))+'</b></span>'+
 '<button class="btn tiny" data-action="open-folder">'+symbol('folder')+esc(t('openFolder'))+'</button></div></section></div>';
}
function onboard(){
 const step=state.onboardingStep;
 const title=[t('stepOne'),t('stepTwo'),t('stepThree')][step],sub=[t('stepOneSub'),t('stepTwoSub'),t('stepThreeSub')][step];
 let body=step===0?
 '<div class="field"><label>'+esc(t('driverName'))+'</label><input type="text" data-pref="driver" maxlength="45" value="'+esc(state.cfg.driver)+'"></div>'+
 '<div class="field"><label>'+esc(t('language'))+'</label><select data-pref="language"><option value="pl"'+(state.cfg.language==='pl'?' selected':'')+'>Polski</option>'+
 '<option value="en"'+(state.cfg.language==='en'?' selected':'')+'>English</option></select></div>':
 step===1?'<p class="small">'+esc(t('chooseTheme'))+'</p>'+themeOptions()+
 '<div class="row"><div class="field"><label>'+esc(t('primaryColor'))+'</label><input type="color" data-pref="accent" value="'+esc(state.cfg.accent)+'"></div>'+
 '<div class="field"><label>'+esc(t('secondaryColor'))+'</label><input type="color" data-pref="accent2" value="'+esc(state.cfg.accent2)+'"></div></div>':
 '<p class="small">'+esc(t('wallpaperChoose'))+'</p>'+wallpaperOptions()+
 '<button class="btn" data-action="choose-wallpaper">'+esc(t('upload'))+'</button><p class="small">'+esc(t('wallHelp'))+'</p>';
 return '<div class="onboard-outer"><section class="glass onboard"><span class="steps">'+esc(t('onboarding'))+
 ' · '+esc(t('step'))+' '+(step+1)+'/3</span><h1 style="margin-top:24px">'+esc(title)+'</h1><p class="subtitle">'+esc(sub)+'</p>'+
 body+'<div class="buttons">'+(step>0?'<button class="btn" data-action="onboard-back">'+esc(t('back'))+'</button>':'')+
 '<button class="btn primary" data-action="'+(step===2?'onboard-finish':'onboard-next')+'">'+esc(t(step===2?'finish':'next'))+' →</button></div></section></div>';
}

function raceJump(meta=state.currentMeta){
 return meta?.raceId?'<div class="buttons" style="margin:0 0 18px"><button class="btn" data-open-race="'+esc(meta.raceId)+'">'+symbol('raceView')+esc(t('raceToReport'))+' →</button></div>':'';
}
function drivePage(){
 const status=collectorLabel();
 return head('RACE LAUNCHER',t('drive'),t('driveSub'))+
 '<section class="glass widget wide"><div class="widget-header"><h3>Assetto Corsa Competizione</h3><span class="small">STEAM · 805550</span></div>'+
 '<div class="summary-grid">'+metric(t('status'),status,'ACC')+
 metric(t('recorder'),state.collector.code==='recording'?t('recording'):t('waiting'),'75 Hz')+'</div>'+
 '<div class="buttons"><button class="btn primary" data-action="launch-acc">'+symbol('drive')+esc(t('launchACC'))+'</button>'+
 '<button class="btn" data-nav="live">'+symbol('live')+esc(t('live'))+'</button>'+
 '<button class="btn" data-nav="raceView">'+symbol('raceView')+esc(t('raceView'))+'</button></div>'+
 '<p class="widget-caption">'+esc(t('driveNote'))+'</p>'+
 (state.launchRequested?'<p class="small" style="color:var(--accent1)">'+esc(t('launchRequested'))+'</p>':'')+
 '</section>';
}
function racePage(){
 const list=state.races||[],r=state.selectedRace;
 let html=head('RACE INTELLIGENCE',t('raceReport'),t('racePageSub'))+
 '<section class="glass widget wide"><div class="widget-header"><h3>'+esc(t('raceHistory'))+'</h3><span class="small">'+list.length+' ACC</span></div>'+
 (list.length?'<div class="race-list">'+list.slice(0,50).map(x=>
 '<button class="btn race-choice'+(r?.id===x.id?' active':'')+'" data-open-race="'+esc(x.id)+'">'+
 '<b>'+esc(cleanName(x.track)||x.track)+'</b> · '+esc(cleanName(x.car)||x.car)+
 ' · '+esc(date(x.date))+' · '+Number(x.pitCount||0)+' pit</button>').join('')+'</div>':
 '<p class="small">'+esc(t('raceNoData'))+'</p>')+'</section>';
 if(!r)return html;
 const isRace=r.sessionType===2;
 const pos=(r.positions||[]).filter(x=>Number.isInteger(x.position)&&x.position>0&&x.position<=200);
 const first=pos[0]?.position,last=pos[pos.length-1]?.position;
 const change=first&&last?first-last:null;
 const pits=r.pitStops||[],finished=pits.filter(p=>!!p.exitAtUtc);
 const raceStints=state.sessions.filter(s=>s.raceId===r.id);
 const value=v=>typeof v==='number'&&Number.isFinite(v)?num(v,1):'—';
 html+='<div class="summary-grid">'+
 metric(t('racePit'),String(finished.length),pits.length>finished.length?'+'+(pits.length-finished.length)+' '+t('raceVisitPending'):'ACC')+
 metric(t('raceStints'),String(r.stints?.length||0),'ACC')+
 metric(t('raceStart'),isRace&&first?'P'+first:'—',isRace?'ACC':t('raceTraining'))+
 metric(t('raceFinish'),isRace&&last?'P'+last:'—',isRace?'ACC':t('raceTraining'))+
 metric(t('raceDelta'),isRace&&change!==null?(change>0?'+':'')+change:'—',t('racePosition'))+
 '</div>'+
 '<section class="glass widget wide"><div class="widget-header"><h3>'+esc(t('racePit'))+'</h3></div>'+
 '<p class="widget-caption">'+esc(t('raceObserved'))+'</p>';
 if(!pits.length)html+='<p class="small">'+esc(t('raceNoVisits'))+'</p>';
 else html+='<div class="data-table-wrap"><table><thead><tr><th>#</th><th>'+esc(t('lap'))+'</th><th>'+
 esc(t('racePitDuration'))+'</th><th>'+esc(t('raceStationary'))+'</th><th>'+esc(t('raceFuelAdded'))+
 '</th><th>'+esc(t('raceCompound'))+'</th></tr></thead><tbody>'+
 pits.map((p,i)=>{
 const changed=p.tyreCompoundAfter&&p.tyreCompoundBefore&&p.tyreCompoundAfter!==p.tyreCompoundBefore;
 const tyre=changed?p.tyreCompoundBefore+' → '+p.tyreCompoundAfter:t('raceTyresUnknown');
 return '<tr><td>'+(i+1)+'</td><td>'+esc(p.entryLap??'—')+'</td>'+
 '<td>'+esc(p.exitAtUtc?value(p.laneSeconds)+' s':t('raceVisitPending'))+'</td>'+
 '<td>'+esc(p.exitAtUtc?value(p.stationarySeconds)+' s':'—')+'</td>'+
 '<td>'+esc(Number.isFinite(p.fuelAddedLitres)?'+'+value(p.fuelAddedLitres)+' L':'—')+'</td>'+
 '<td>'+esc(tyre)+'</td></tr>';
 }).join('')+'</tbody></table></div>';
 html+='<p class="small">'+esc(t('raceRepairsUnknown'))+'</p></section>'+
 '<section class="glass widget wide"><div class="widget-header"><h3>'+esc(t('racePositions'))+'</h3></div>';
 if(!pos.length||!isRace)html+='<p class="small">'+esc(t('raceNoPosition'))+'</p>';
 else html+='<div class="data-table-wrap"><table><thead><tr><th>'+esc(t('lap'))+'</th><th>'+esc(t('racePosition'))+'</th><th>UTC</th></tr></thead><tbody>'+
 pos.slice(-35).map(x=>'<tr><td>'+esc(x.lap)+'</td><td>P'+esc(x.position)+'</td><td>'+esc(new Date(x.atUtc).toLocaleTimeString())+'</td></tr>').join('')+
 '</tbody></table></div>';
 html+='</section><section class="glass widget wide"><div class="widget-header"><h3>'+esc(t('raceStints'))+'</h3></div>'+
 '<div class="buttons">'+(r.stints||[]).map(key=>{
 const m=raceStints.find(x=>x.key===key)||state.sessions.find(x=>x.key===key);
 return '<button class="btn" data-open="'+esc(key)+'">'+esc(m?nameSession(m):key)+
 ' · '+esc(m?String(m.lapCount||0)+' '+t('laps'):'ACC')+'</button>';
 }).join('')+'</div></section>';
 return html;
}
async function openRace(id,quiet=false){
 if(!id||typeof api.loadRace!=='function')return;
 try{
  const race=await api.loadRace(id);
  if(!race||race.error){toast(race?.error||t('raceNoData'));return;}
  state.selectedRace=race;
  if(!quiet)navigate('raceView');else if(state.view==='raceView')renderPage();
 }catch(e){toast(String(e.message||e));}
}
async function refreshRaces(){
 if(typeof api.listRaces!=='function')return;
 try{
  const list=await api.listRaces();
  if(!Array.isArray(list))return;
  const old=state.races.map(x=>x.id+'|'+x.pitCount+'|'+x.stintCount).join(',');
  state.races=list;
  if(state.view==='raceView'){
   const id=state.selectedRace?.id||list[0]?.id;
   if(id)await openRace(id,true);
   else if(old)renderPage();
  }
 }catch{}
}

function placeholder(){
 return head('ROADMAP',t(state.view),t('futureDescription'))+
 '<section class="glass placeholder"><div class="symbol">✦</div><h2>'+esc(t('futureTitle'))+'</h2>'+
 '<p>'+esc(t('futureDescription'))+'</p></section>';
}
function renderPage(){
 const page=E('page');if(!page)return;
 const before=page.scrollTop;
 page.innerHTML=!state.cfg.setupComplete?onboard():
 state.view==='home'?home():state.view==='dashboard'?dashboard():state.view==='stint'?stint():
 state.view==='report'?report():state.view==='history'?history():state.view==='live'?live():
 state.view==='drive'?drivePage():state.view==='raceView'?racePage():
 state.view==='settings'?settings():placeholder();
 page.scrollTop=before;
 if(state.view==='live')updateLiveDOM();
}
function updateStatus(){
 const c=state.collector;
 const label=collectorLabel();
 for(const id of ['connection-label','side-status','recorder-settings'])if(E(id))E(id).textContent=label;
 for(const id of ['connection-dot'])if(E(id))E(id).className='dot '+c.code;
 if(E('update-label'))E('update-label').textContent=state.updater.text||'0.3.6';
 if(E('update-text'))E('update-text').textContent=updaterLabel();
 if(E('live-dot')){E('live-dot').className='dot '+c.code;}
 if(E('live-conn'))E('live-conn').textContent=c.code==='recording'?t('liveRecording'):t('liveWaiting');
}
function updateLiveDOM(){
 if(state.view!=='live')return;
 const item=state.live;
 const connected=state.collector.code==='recording'&&item?.active&&item?.sample;
 const s=connected?item.sample:{};
 const set=(id,value)=>{if(E(id))E(id).textContent=value;};
 set('live-key',connected?item.key:'');
 set('live-speed',connected?num(s.speed_kmh,0):'—');
 set('live-gear',connected?gearLabel(s.gear):'—');
 set('live-rpm',connected?num(s.rpm,0):'—');
 set('live-fuel',connected?num(s.fuel,1):'—');
 set('live-race-position',connected&&Number.isInteger(s.race_position)&&s.race_position>0?'P'+s.race_position:'—');
 for(const [key,field]of [['gas','gas'],['brake','brake'],['progress','lap_progress']]){
  const p=connected&&Number.isFinite(Number(s[field]))?Math.round(Math.min(100,Math.max(0,s[field]*100))):0;
  if(E(key+'-fill'))E(key+'-fill').style.width=p+'%';
  set(key+'-num',connected?p+'%':'—');
 }
 for(const k of ['fl','fr','rl','rr']){
  set('temp-'+k,connected?num(s['tyre_'+k],1):'—');
  set('press-'+k,connected?num(s['pressure_'+k],1):'—');
 }
 updateStatus();
}
async function refreshSessions(){
 try{
  const list=await api.listSessions();
  if(!Array.isArray(list))return;
  const fingerprint=a=>a.map(x=>x.key+'|'+x.lapCount).join(',');
  const changed=fingerprint(list)!==fingerprint(state.sessions);
  state.sessions=list;
  if(changed&&['home','history'].includes(state.view)&&state.cfg?.setupComplete)renderPage();
 }catch{}
}
function syncPrefsFromInput(target){
 const key=target.dataset.pref;if(!key)return;
 let v=target.type==='checkbox'?target.checked:target.type==='range'?Number(target.value):target.value;
 if(key==='driver'){v=String(v).slice(0,45);if(!v.trim())v=state.cfg.driver;}
 patch(key,v);
 if(key==='language'){shell();return;}
 if(key==='sidebarCompact'){shell();return;}
 if(key==='displayDensity'){style();return;}
 if(key==='accent'||key==='accent2'){
  state.cfg.theme='custom';persist();document.querySelectorAll('.swatch').forEach(x=>x.classList.remove('selected'));
 }
 if(key==='driver'&&state.view==='home')renderPage();
 if(target.type==='range'){const label=E('val-'+key);if(label)label.textContent=v+(key==='blur'?' px':'%');}
}
async function click(e){
 const b=e.target.closest('button,[data-nav],[data-open]');if(!b)return;
 if(b.dataset.openRace){void openRace(b.dataset.openRace);return;}
 if(b.dataset.nav){navigate(b.dataset.nav);return;}
 if(b.dataset.open){void openSession(b.dataset.open);return;}
 if(b.dataset.theme){
  state.cfg.theme=b.dataset.theme;
  [state.cfg.accent,state.cfg.accent2]=themes[b.dataset.theme]||themes.violet;
  persist();style();renderPage();return;
 }
 if(b.dataset.wallpaper){
  if(b.dataset.wallpaper==='custom'&&!state.cfg.customWallpaper)return;
  const firstSelection=state.cfg.wallpaper==='none'&&b.dataset.wallpaper!=='none';
  state.cfg.wallpaper=b.dataset.wallpaper;
  if(firstSelection&&state.cfg.brightness<=35)state.cfg.brightness=78;
  persist();renderPage();style();return;
 }
 if(b.dataset.moveWidget){
  const index=state.cfg.widgetOrder.indexOf(b.dataset.moveWidget),j=index+Number(b.dataset.direction);
  if(index<0||j<0||j>=state.cfg.widgetOrder.length)return;
  [state.cfg.widgetOrder[index],state.cfg.widgetOrder[j]]=[state.cfg.widgetOrder[j],state.cfg.widgetOrder[index]];
  persist();renderPage();return;
 }
 const action=b.dataset.action;
 if(!action)return;
 try {
  if(action==='launch-acc'){
   const result=await api.launchGame('acc');
   if(result?.error){toast(result.error);return;}
   if(result?.requested){state.launchRequested=true;renderPage();toast(t('launchRequested'));}
   return;
  }
  if(action==='minimize'||action==='maximize'||action==='close'){await api.windowAction(action);return;}
  if(action==='toggle-sidebar'){patch('sidebarCompact',!state.cfg.sidebarCompact);shell();return;}
  if(action==='check-updates'){await api.checkUpdates();return;}
  if(action==='install-update'){await api.installUpdate();return;}
  if(action==='open-folder'){await api.openSessionsFolder();return;}
  if(action==='reset-wallpaper'){
   state.cfg.blur=6;state.cfg.brightness=78;state.cfg.saturation=95;state.cfg.opacity=100;
   persist();renderPage();style();return;
  }
  if(action==='choose-wallpaper'){
   const result=await api.chooseWallpaper();
   if(result?.data){state.cfg.customWallpaper=result.data;state.cfg.wallpaper='custom';if(state.cfg.brightness<=35)state.cfg.brightness=78;persist();renderPage();style();}
   else if(result?.error)toast(result.error);
   return;
  }
  if(action==='export'){
   const result=await api.exportPreferences();
   if(result?.error)toast(result.error);else if(result?.path)toast(result.path);return;
  }
  if(action==='import'){
   const result=await api.importPreferences();
   if(result?.error)toast(result.error);else if(result?.preferences){state.cfg=result.preferences;shell();toast(t('settingsImported'));}
   return;
  }
  if(action==='onboard-next'){state.onboardingStep=Math.min(2,state.onboardingStep+1);renderPage();return;}
  if(action==='onboard-back'){state.onboardingStep=Math.max(0,state.onboardingStep-1);renderPage();return;}
  if(action==='onboard-finish'){
    state.cfg.setupComplete=true;
    const saved=await api.savePreferences(state.cfg);
    if(!saved||saved.error)throw Error(saved?.error||t('unsaved'));
    state.cfg=saved;navigate('home');toast(t('ready'));return;
  }
 }catch(err){toast(String(err.message||err));}
}
function change(e){
 const target=e.target;
 if(target.dataset.pref){syncPrefsFromInput(target);return;}
 if(target.dataset.widgetToggle){
  const id=target.dataset.widgetToggle;
  state.cfg.visibleWidgets=target.checked?
   [...new Set([...state.cfg.visibleWidgets,id])]:state.cfg.visibleWidgets.filter(x=>x!==id);
  persist();return;
 }
 if(target.dataset.lap){
  const n=Number(target.value);
  if(target.dataset.lap==='selectedLap')state.selectedLap=n;
  else if(target.dataset.lap==='lapA')state.lapA=n;
  else if(target.dataset.lap==='lapB')state.lapB=n;
  renderPage();return;
 }
}
function input(e){
 const target=e.target;
 if(target.id==='session-search'){
  const position=target.selectionStart;
  state.search=target.value;
  const page=E('page'),scroll=page.scrollTop;
  const newhtml=history();page.innerHTML=newhtml;page.scrollTop=scroll;
  const next=E('session-search');next.focus();next.setSelectionRange(position,position);return;
 }
 if(target.type==='range'&&target.dataset.pref)syncPrefsFromInput(target);
 if(target.type==='color'&&target.dataset.pref)syncPrefsFromInput(target);
 if(target.dataset.pref==='driver')syncPrefsFromInput(target);
}
function startDrag(e){
 const row=e.target.closest('[data-dragwidget]');if(!row)return;
 state.dragWidget=row.dataset.dragwidget;
 e.dataTransfer.effectAllowed='move';
 e.dataTransfer.setData('text/plain',state.dragWidget);
 row.setAttribute('aria-grabbed','true');
}
function dragOver(e){const row=e.target.closest('[data-dragwidget]');if(!row||!state.dragWidget)return;e.preventDefault();row.classList.add('drop');}
function drop(e){
 const row=e.target.closest('[data-dragwidget]');if(!row||!state.dragWidget)return;
 e.preventDefault();const arr=state.cfg.widgetOrder.filter(x=>x!==state.dragWidget);
 const index=arr.indexOf(row.dataset.dragwidget);
 arr.splice(Math.max(0,index),0,state.dragWidget);
 state.cfg.widgetOrder=arr;state.dragWidget=null;persist();renderPage();
}
root.addEventListener('click',e=>void click(e));
root.addEventListener('change',change);
root.addEventListener('input',input);
root.addEventListener('dragstart',startDrag);
root.addEventListener('dragover',dragOver);
root.addEventListener('drop',drop);
root.addEventListener('dragend',()=>{state.dragWidget=null;document.querySelectorAll('.drop,[aria-grabbed]').forEach(x=>{x.classList.remove('drop');x.removeAttribute('aria-grabbed');});});
async function boot(){
 try{
  state.cfg=await api.getPreferences();
  state.sessions=await api.listSessions();
  if(!Array.isArray(state.sessions))state.sessions=[];
  state.races=typeof api.listRaces==='function'?await api.listRaces():[];
  if(!Array.isArray(state.races))state.races=[];
  const status=await api.getStatus();
  if(status?.collector)state.collector=status.collector;
  if(status?.updates)state.updater=status.updates;
  shell();
  if(state.cfg.setupComplete&&state.sessions[0])void openSession(state.sessions[0].key,true);
  api.onCollector(msg=>{
   if(!msg)return;
   if(msg.code){state.collector={...state.collector,...msg};updateStatus();}
   if(msg.refresh||msg.code==='recording'){void refreshSessions();void refreshRaces();}
  });
  api.onUpdates(msg=>{if(!msg)return;state.updater=msg;updateStatus();if(state.view==='settings')renderPage();});
  setInterval(()=>void refreshSessions(),15000);
  setInterval(()=>void refreshRaces(),15000);
  let liveBusy=false;
  setInterval(async()=>{if(state.view!=='live'||liveBusy)return;liveBusy=true;try{state.live=await api.getLiveTelemetry();updateLiveDOM();}catch{}finally{liveBusy=false;}},150);
 }catch(e){root.textContent='Apex AI: '+String(e.message||e);}
}
void boot();
})();
