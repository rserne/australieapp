#!/usr/bin/env node
// Rooktest voor app.js: start de app in een kale browser (jsdom) op een reeks datums, anoniem en
// ingelogd, bladert alle pagina's door, opent de tabbladen, zoekt en logt uit. Elke JavaScript-fout
// die daarbij optreedt, wordt gemeld. Draaien na een wijziging in app.js:  node rooktest.js
// Nodig: jsdom. Eenmalig installeren met  npm install -g jsdom  (of lokaal met npm install jsdom).
// Sluit af met code 1 als er iets mis is, net als check.js.
const fs=require('fs'), path=require('path'), {execSync}=require('child_process');
let JSDOM,VirtualConsole;
try{ ({JSDOM,VirtualConsole}=require('jsdom')); }
catch(e){
  try{ ({JSDOM,VirtualConsole}=require(path.join(execSync('npm root -g').toString().trim(),'jsdom'))); }
  catch(e2){ console.log('jsdom ontbreekt. Installeer het eenmalig met:  npm install -g jsdom'); process.exit(2); }
}

const lees=n=>fs.readFileSync(path.join(__dirname,n),'utf8');
const html=lees('index.html').replace(/<script[^>]*src="[^"]+"[^>]*><\/script>/g,'');   // scripts laden we zelf
// De scenario's draaien met het echte voorreis.js. De scenario's 'met programma' vervangen het door
// een testprogramma, zodat de dagopbouw ook wordt beproefd als het echte bestand leeg is.
const codeMet=voorreis=>lees('reis.js')+'\n;\n'+(voorreis??lees('voorreis.js'))+'\n;\n'+lees('dieren.js')+'\n;\n'+lees('dieren-iconen.js')+'\n;\n'+lees('app.js');
const VOORTEST=`const VOORDAGEN=[
{datum:"2026-09-18",k:"vlucht",t:"Vlucht Amsterdam – Cairns",p:"Schiphol → Cairns",tz:null,
 fl:[["SQ 323","Amsterdam Schiphol","Singapore Changi","10.20","05.30 (19 sep, lokale tijd)","Singapore Airlines · 25 kg"]],
 body:["Vertrek vanaf Schiphol."]},
{datum:"2026-09-19",k:"auto",t:"Naar Port Douglas",p:"Port Douglas",tz:10,body:["Met de huurauto langs de kust."],
 agenda:[["09.00","Ophalen huurauto","Bij de balie op het vliegveld."]],note:"Rijden aan de linkerkant."},
{datum:"2026-09-20",k:"vrij",t:"Port Douglas en het rif",p:"Port Douglas",h:"Cairns Plaza Hotel, Esplanade",tz:10,temp:"21–29°",
 body:["Een dag op het water."],prac:["Zonnebrand en een hoed."],
 wild:[["Kasuaris","Schuwe loopvogel in het regenwoud.",1],["Wombat","Alleen in de dierentuin.",3]],emoe:[2,"Langs de weg naar het noorden."],
 food:[["Barramundi","Witvis."]],rest:[["Ho Jiak","Hay Street",4.5,2,5,"Maleisisch.","Online."]],wash:"Wasserij naast het hotel.",tip:"Vroeg op."},
{datum:"2026-09-30",k:"vlucht",t:"Vlucht naar Sydney",p:"Cairns → Sydney",tz:10,body:["Naar de groep."]}
];`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// De dierensleutels uit dieren.js, voor de controle van het gegenereerde wachtwoord (een const in de
// app is geen eigenschap van window, dus we lezen het bestand hier zelf).
const DIER_SLEUTELS=require('vm').runInNewContext(lees('dieren.js')+';DIEREN',{}).map(d=>d.k);

// Een paar notities zoals ze uit Nhost komen: één voorreisnotitie (maakt u1 voorreiziger),
// een Ticket-notitie met boekingscodes, en een bijlage van iemand anders zonder afzender.
const NOTITIES=[
  {id:'a',user_id:'u1',dag:-13,soort:'notitie',type:'notitie',tekst:'Eerste voorreisdag',wie:'Test',created_at:'2026-09-01T10:00:00Z',updated_at:'2026-09-01T10:00:00Z'},
  {id:'b',user_id:'u1',dag:0,soort:'notitie',type:'ticket',tekst:'Boekingscodes\nSQ: ABC123\nJQ: DEF456\nSawadee: 1234567',wie:'Test',created_at:'2026-09-01T10:00:00Z',updated_at:'2026-09-01T10:00:00Z'},
  {id:'c',user_id:'u2',dag:5,soort:'bestand',type:'reservering',tekst:null,wie:null,file_id:'f1',naam:'ticket.pdf',mime:'application/pdf',grootte:12345,created_at:'2026-09-02T10:00:00Z',updated_at:'2026-09-02T10:00:00Z'},
  {id:'d',user_id:'u1',dag:9,soort:'notitie',type:'ticket',tekst:'MONA-ticket 10.30 uur',wie:'Test',created_at:'2026-09-03T10:00:00Z',updated_at:'2026-09-03T10:00:00Z'},
  {id:'e',user_id:'u2',dag:0,soort:'notitie',type:'verzekering',tekst:'Allianz, polis 12345678. Alarmcentrale +31 20 123 4567.',wie:'Anna',created_at:'2026-09-04T10:00:00Z',updated_at:'2026-09-04T10:00:00Z'}
];

// De reizigerslijst zoals die uit de tabel reizigers komt. u1 is de ingelogde testgebruiker; of hij de
// voorreis doet, beheerder is of gast, hangt af van het scenario. Anna doet de voorreis altijd, Piet
// alleen de groepsreis.
const REIZIGERS=(voor,beheer=false,gast=false)=>[
  {user_id:'u1',naam:'Test',voorreis:voor,reis:true,nareis:false,beheer,gast},
  {user_id:'u2',naam:'Anna',voorreis:true,reis:true,nareis:false,beheer:false,gast:false},
  {user_id:'u3',naam:'Piet',voorreis:false,reis:true,nareis:false,beheer:false,gast:false}
];

// Start de app op een datum. login: 'voor' (voorreiziger), 'groep' (ingelogd, geen voorreis), 'gast'
// (ingelogd als gast: wel de reis en de waarnemingen, geen notities) of null.
// online: navigator.onLine. Het netwerk zelf faalt altijd, zodat ook de herhaalpogingen doorlopen.
// voorreis: JavaScript dat voorreis.js vervangt (VOORTEST), anders het echte bestand.
// lijst: de kopie van de reizigerslijst. 'std' volgt login, null is geen kopie (terugval op de notities).
function start(datum,{login=null,online=false,voorreis=null,lijst='std'}={}){
  const code=codeMet(voorreis);
  const fouten=[];
  const vc=new VirtualConsole();
  vc.on('jsdomError',e=>fouten.push((e.detail&&e.detail.stack)||e.message));
  const dom=new JSDOM(html,{url:`https://rserne.github.io/australieapp/?datum=${datum}`,runScripts:'outside-only',
    pretendToBeVisual:true,virtualConsole:vc});
  const w=dom.window;
  w.fetch=()=>Promise.reject(new TypeError('Failed to fetch'));
  Object.defineProperty(w.navigator,'onLine',{value:online,configurable:true});
  w.indexedDB=undefined; w.confirm=()=>true; w.scrollTo=()=>{};
  w.requestAnimationFrame=cb=>setTimeout(cb,0);
  w.getComputedStyle=()=>({getPropertyValue:()=>''});
  if(!w.Element.prototype.scrollIntoView) w.Element.prototype.scrollIntoView=()=>{};   // jsdom kent het niet
  if(login){
    const notities=login==='voor'?NOTITIES:NOTITIES.filter(n=>n.dag>=0);
    w.localStorage.setItem('aus_sess',JSON.stringify({refreshToken:'x',tijd:Date.now(),user:{id:'u1',displayName:'Test',email:'test@example.org'}}));
    w.localStorage.setItem('aus_cache_all',JSON.stringify(notities));
    notities.forEach(n=>{ const k='aus_cache_'+n.dag, l=JSON.parse(w.localStorage.getItem(k)||'[]'); l.push(n); w.localStorage.setItem(k,JSON.stringify(l)); });
    // Een gast krijgt de notities toch in de kopie: de app hoort ze te negeren en bij het synchroniseren weg te halen.
    if(lijst) w.localStorage.setItem('aus_cache_reizigers',JSON.stringify(lijst==='std'?REIZIGERS(login==='voor',false,login==='gast'):lijst));
  }
  w.addEventListener('error',e=>fouten.push((e.error&&e.error.stack)||e.message));
  try{ w.eval(code); }catch(e){ fouten.push('bij laden: '+e.stack); }
  return {w,fouten};
}
const $=(w,id)=>w.document.getElementById(id);
const kop=w=>$(w,'num').textContent.replace(/\s+/g,' ').trim();
const klik=(w,id,fouten)=>{ try{ $(w,id).click(); }catch(e){ fouten.push(`klik op ${id}: `+e.stack); } };
function blader(w,fouten){
  let g=0; while(!$(w,'next').disabled&&g++<80) klik(w,'next',fouten);
  g=0;     while(!$(w,'prev').disabled&&g++<80) klik(w,'prev',fouten);
}
function zoek(w,fouten,term){
  try{ const q=$(w,'q'); q.value=term; q.dispatchEvent(new w.Event('input')); }catch(e){ fouten.push(`zoeken '${term}': `+e.stack); }
}

(async()=>{
  const uitkomst=[];   // [naam, fouten[]]
  const meld=(naam,fouten)=>{ const u=[...new Set(fouten)]; uitkomst.push([naam,u]); console.log(`  ${u.length?'FOUT':'ok  '}  ${naam}${u.length?` — ${u.length} fout(en)`:''}`); u.slice(0,3).forEach(f=>console.log('        '+f.split('\n').slice(0,2).join('\n        '))); };
  const eis=(fouten,ok,tekst)=>{ if(!ok) fouten.push('verwachting: '+tekst); };

  const datums=['2026-09-09','2026-09-18','2026-09-25','2026-09-30','2026-10-01','2026-10-04','2026-10-18','2026-10-29','2026-10-30','2026-11-15'];
  for(const [login,voorreis] of [[null,null],['groep',null],['voor',null],['gast',null],[null,VOORTEST],['groep',VOORTEST],['voor',VOORTEST],['gast',VOORTEST]]){
    for(const datum of datums){
      const {w,fouten}=start(datum,{login,voorreis});
      const naam=`${datum} ${login==null?'anoniem':login==='voor'?'ingelogd, voorreiziger':login==='gast'?'ingelogd, gast':'ingelogd, groep'}${voorreis?', voorreis met programma':''}`;
      if(login) eis(fouten,$(w,'btnAlles').hidden===(login==='gast'),`tabblad Notities ${login==='gast'?'verborgen voor een gast':'zichtbaar'} na herstel uit de kopie`);
      blader(w,fouten);
      klik(w,'btnIndex',fouten); zoek(w,fouten,'uluru'); zoek(w,fouten,'& bar'); zoek(w,fouten,'sq');
      klik(w,'btnPrakt',fouten);
      if(login){ if(login!=='gast') klik(w,'btnAlles',fouten); klik(w,'btnDieren',fouten); klik(w,'btnToday',fouten); const n=$(w,'nadd'); if(n) n.click(); const s=$(w,'shclose'); if(s) s.click(); }
      klik(w,'btnToday',fouten);
      await sleep(150);
      meld(naam,fouten);
    }
  }

  // Gerichte verwachtingen
  { const {w,fouten}=start('2026-09-25',{login:'groep'});
    eis(fouten,kop(w)==='Rondreis Australië',`groepslid zonder voorreis ziet op 25 sep de startpagina (nu: '${kop(w)}')`);
    meld('25 sep: groepslid landt op de startpagina',fouten); }
  { const {w,fouten}=start('2026-09-25',{login:'voor'});
    eis(fouten,/^Voorreis/.test(kop(w)),`voorreiziger ziet op 25 sep zijn voorreisdag (nu: '${kop(w)}')`);
    meld('25 sep: voorreiziger landt op zijn dag',fouten); }
  // De reizigerslijst is bepalend, niet de notities
  { const {w,fouten}=start('2026-09-25',{login:'groep',lijst:REIZIGERS(false)});
    w.localStorage.setItem('aus_cache_all',JSON.stringify(NOTITIES));   // mét de voorreisnotitie van u1
    klik(w,'btnIndex',fouten); klik(w,'btnToday',fouten);
    eis(fouten,kop(w)==='Rondreis Australië',`voorreisnotitie maakt je geen voorreiziger als de lijst nee zegt (nu: '${kop(w)}')`);
    const kaart=w.document.querySelector('.regio .rwie');
    eis(fouten,kaart&&kaart.textContent==='Anna',`kaart Voorreis noemt wie de voorreis doet (nu: '${kaart&&kaart.textContent}')`);
    eis(fouten,/Vertrek donderdag 1 oktober/.test($(w,'day').textContent),'groepslid telt af naar 1 oktober');
    meld('25 sep: lijst zegt geen voorreis, ondanks een voorreisnotitie',fouten); }
  { const {w,fouten}=start('2026-09-25',{login:'voor'});
    w.localStorage.setItem('aus_cache_all',JSON.stringify(NOTITIES.filter(n=>n.dag>=0)));   // zonder voorreisnotitie
    klik(w,'btnIndex',fouten); klik(w,'btnToday',fouten);
    eis(fouten,/^Voorreis/.test(kop(w)),`lijst maakt je voorreiziger, ook zonder voorreisnotitie (nu: '${kop(w)}')`);
    klik(w,'prev',fouten); while(!$(w,'prev').disabled) klik(w,'prev',fouten);
    eis(fouten,kop(w)==='Reisoverzicht','terugbladeren komt op het reisoverzicht');
    const kaart=w.document.querySelector('.regio .rwie');
    eis(fouten,kaart&&kaart.textContent==='Anna en Test',`kaart Voorreis noemt beide voorreizigers (nu: '${kaart&&kaart.textContent}')`);
    // de voorreiziger is op 25 september al acht dagen onderweg van zijn eigen 42
    const ovz=$(w,'day').textContent;
    eis(fouten,/Dag 8van 42/.test(ovz)&&/Nog 34 dagen te gaan/.test(ovz),`voorreisdagen tellen mee in de voortgang (nu: '${ovz.slice(0,50)}')`);
    const vk=[...w.document.querySelectorAll('.regio')].find(k=>k.querySelector('.rnaam').textContent==='Voorreis');
    eis(fouten,vk&&!vk.classList.contains('gehad'),'de voorreis is nog niet gedempt, want je zit er middenin');
    meld('25 sep: lijst zegt voorreis, zonder voorreisnotitie',fouten); }
  { const {w,fouten}=start('2026-09-15',{login:'voor'});
    eis(fouten,kop(w)==='Rondreis Australië','vóór zijn eigen vertrek ziet een voorreiziger de startpagina');
    eis(fouten,/Nog 3\s*dagen/.test($(w,'day').textContent)&&/Vertrek vrijdag 18 september/.test($(w,'day').textContent),
      `en telt die af naar zijn eigen vertrek (nu: '${$(w,'day').textContent.slice(0,40)}')`);
    meld('15 sep: voorreiziger telt thuis af',fouten); }
  { const {w,fouten}=start('2026-09-25',{login:'voor',lijst:null});
    eis(fouten,/^Voorreis/.test(kop(w)),`zonder reizigerslijst telt de voorreisnotitie nog (nu: '${kop(w)}')`);
    meld('25 sep: terugval op de notities zonder reizigerslijst',fouten); }
  { const {w,fouten}=start('2026-09-25',{login:'groep',lijst:REIZIGERS(false).map(r=>({...r,voorreis:false}))});
    eis(fouten,!w.document.querySelector('.regio[data-go^="-"]'),'zonder voorreizigers staat er geen kaart Voorreis');
    klik(w,'btnIndex',fouten);
    eis(fouten,![...w.document.querySelectorAll('#results .idxkop h3')].some(h=>h.textContent==='Voorreis'),'zonder voorreizigers geen kop Voorreis in Alle dagen');
    eis(fouten,!w.document.querySelector('#results .idxdeel'),'en dan ook geen kop Groepsreis: er valt niets te scheiden');
    klik(w,'btnToday',fouten); klik(w,'next',fouten);
    eis(fouten,kop(w)==='Dag 1van 29','zonder voorreizigers gaat de pijl van de startpagina naar dag 1');
    klik(w,'prev',fouten);
    eis(fouten,kop(w)==='Rondreis Australië','en terug vanaf dag 1 naar de startpagina, niet naar de voorreis');
    meld('25 sep: niemand doet de voorreis',fouten); }
  { const {w,fouten}=start('2026-10-05',{login:'groep',lijst:REIZIGERS(false).filter(r=>r.user_id!=='u1')});
    klik(w,'btnPrakt',fouten);
    const c=$(w,'acct').querySelector('.callout');
    eis(fouten,c&&c.classList.contains('let')&&/nog niet in de reizigerslijst/.test(c.textContent),'wie niet in de lijst staat, krijgt daar een waarschuwing over');
    meld('5 okt: ingelogd maar niet in de reizigerslijst',fouten); }
  { const {w,fouten}=start('2026-10-05',{login:'voor'});
    klik(w,'btnPrakt',fouten);
    const c=$(w,'acct').querySelector('.callout');
    eis(fouten,c&&!c.classList.contains('let')&&/Je reist mee met de voorreis en de groepsreis/.test(c.textContent),`inlogblok noemt je deelname (nu: '${c&&c.textContent.slice(0,90)}')`);
    meld('5 okt: deelname in het inlogblok',fouten); }
  // Beheer van de reizigerslijst: knop in Praktisch, eigen scherm, schuifpaneel voor een nieuwe reiziger
  { const {w,fouten}=start('2026-10-05',{login:'groep'});
    klik(w,'btnPrakt',fouten);
    eis(fouten,!$(w,'rbeheer'),'zonder beheer=true staat de knop Reizigers beheren er niet');
    meld('5 okt: geen beheerknop voor een gewone reiziger',fouten); }
  // Reisoverzicht tijdens de reis: bereikbaar via de eerste regel van Alle dagen en via terugbladeren
  { const {w,fouten}=start('2026-10-14',{login:'groep'});
    eis(fouten,kop(w)==='Dag 14van 29','Vandaag toont gewoon de dag zelf');
    klik(w,'btnIndex',fouten);
    const rij=w.document.querySelector('#results .idxstart button'); if(rij) rij.click();
    eis(fouten,$(w,'day').style.display!=='none'&&kop(w)==='Reisoverzicht',`de regel opent het reisoverzicht (nu: '${kop(w)}')`);
    const txt=$(w,'day').textContent;
    eis(fouten,/Dag 14van 29/.test(txt)&&/Nog 15 dagen te gaan/.test(txt),`voortgang in plaats van aftellen (nu: '${txt.slice(0,60)}')`);
    eis(fouten,!/Vertrek/.test(txt),'geen vertrekdatum meer tijdens de reis');
    const kaarten=[...w.document.querySelectorAll('#day .regio')];
    const gehad=kaarten.filter(k=>k.classList.contains('gehad')).map(k=>k.querySelector('.rnaam').textContent);
    eis(fouten,gehad.join(',')==='Voorreis,New South Wales,Tasmanië,Zuid-Australië',`de voorreis en de regio's die achter je liggen zijn gedempt (nu: ${gehad.join(',')||'geen'})`);
    const vic=kaarten.find(k=>k.querySelector('.rnaam').textContent==='Victoria');
    eis(fouten,vic&&!vic.classList.contains('gehad'),'de regio van vandaag niet');
    vic.click();
    eis(fouten,kop(w)==='Dag 14van 29','een tik op een regio brengt je naar de eerste dag ervan');
    // terugbladeren vanaf dag 1 komt nu ook bij het overzicht uit
    while(!$(w,'prev').disabled&&kop(w)!=='Reisoverzicht') klik(w,'prev',fouten);
    eis(fouten,kop(w)==='Reisoverzicht'&&$(w,'prev').disabled,'terugbladeren eindigt op het reisoverzicht');
    klik(w,'next',fouten);
    eis(fouten,kop(w)==='Dag 1van 29','en vooruit ga je naar dag 1');
    meld('14 okt: reisoverzicht tijdens de reis',fouten); }
  // Alle dagen: de groepsreis staat per regio, met een kop in de kleur van die regio
  { const {w,fouten}=start('2026-10-05',{login:'groep'});
    klik(w,'btnIndex',fouten);
    const koppen=[...w.document.querySelectorAll('#results .idxkop h3')].map(h=>h.textContent);
    eis(fouten,koppen.join(',')==='Voorreis,New South Wales,Tasmanië,Zuid-Australië,Victoria,Northern Territory,Queensland,West-Australië',
      `koppen per regio, op volgorde van de reis (nu: ${koppen.join(' | ')})`);
    const lijsten=[...w.document.querySelectorAll('#results .idx:not(.idxstart)')];
    eis(fouten,lijsten.length===koppen.length,`bij elke kop één lijst (nu ${lijsten.length} lijsten, ${koppen.length} koppen)`);
    // de regel naar het reisoverzicht staat bovenaan, vóór de eerste kop
    const eerste=w.document.querySelector('#results').firstElementChild;
    eis(fouten,eerste&&eerste.classList.contains('idxstart')&&/Reisoverzicht/.test(eerste.textContent),
      `bovenaan de regel Reisoverzicht (nu: '${eerste&&eerste.textContent.trim().slice(0,30)}')`);
    eis(fouten,!w.document.querySelector('#results .bar'),'het streepje aan de rand is weg');
    const deel=w.document.querySelector('#results .idxdeel');
    eis(fouten,deel&&deel.textContent==='Groepsreis'&&deel.nextElementSibling.querySelector('h3').textContent==='New South Wales',
      'een kop Groepsreis scheidt de voorreis van de eerste regio');
    const nsw=lijsten[1], nrs=[...nsw.querySelectorAll('button')].map(b=>b.dataset.n);
    eis(fouten,nrs.join(',')==='1,2,3,4,5',`New South Wales bevat dag 1 tot en met 5, inclusief de vliegdag (nu ${nrs.join(',')})`);
    eis(fouten,/^#/.test(nsw.style.getPropertyValue('--i')||'')&&/^#/.test(nsw.style.getPropertyValue('--id')||''),
      `de lijst draagt beide inktkleuren van de regio (nu '${nsw.style.getPropertyValue('--i')}' / '${nsw.style.getPropertyValue('--id')}')`);
    const nu=w.document.querySelector('#results .idx li.now');
    eis(fouten,nu&&nu.querySelector('.n').textContent==='5'&&nu.querySelector('.d').textContent==='vandaag',
      `de dag van vandaag is gemarkeerd en zegt 'vandaag' (nu: '${nu&&nu.querySelector('.d').textContent}')`);
    const rij=[...w.document.querySelectorAll('#results .idx button')].find(b=>b.dataset.n==='12'); if(rij) rij.click();
    eis(fouten,kop(w)==='Dag 12van 29','een tik op een rij opent die dag');
    meld('5 okt: Alle dagen per regio',fouten); }
  { const {w,fouten}=start('2026-10-05',{login:'groep',online:true,lijst:REIZIGERS(false,true)});
    const mutaties=[], aanmeldingen=[];
    let lijst=REIZIGERS(false,true);
    w.gql=async(q,v)=>{
      if(/^query/.test(q)&&/reizigers/.test(q)) return {reizigers:lijst};
      if(/update_reizigers_by_pk/.test(q)){ mutaties.push('update'); lijst=lijst.map(r=>r.user_id===v.id?{...r,...v.s}:r); return {update_reizigers_by_pk:{user_id:v.id}}; }
      if(/delete_reizigers_by_pk/.test(q)){ mutaties.push('delete'); lijst=lijst.filter(r=>r.user_id!==v.id); return {delete_reizigers_by_pk:{user_id:v.id}}; }
      if(/insert_reizigers_one/.test(q)){ mutaties.push('insert'); lijst=[...lijst,{...v.o,beheer:false}]; return {insert_reizigers_one:{user_id:v.o.user_id}}; }
      throw new Error('onverwachte query '+q.slice(0,40)); };
    w.fetch=async(url,o)=>{ if(/signup\/email-password/.test(url)){ aanmeldingen.push(JSON.parse(o.body)); return {ok:true,status:200,json:async()=>({session:{user:{id:'u9'}}})}; } throw new TypeError('Failed to fetch'); };
    klik(w,'btnPrakt',fouten);
    eis(fouten,!!$(w,'rbeheer'),'beheerder ziet de knop Reizigers beheren in Praktisch');
    klik(w,'rbeheer',fouten);
    eis(fouten,$(w,'beheer').style.display==='block'&&$(w,'prakt').style.display==='none','de knop opent het scherm Reizigers');
    eis(fouten,$(w,'btnPrakt').classList.contains('on'),'op het scherm Reizigers blijft de knop Praktisch oplichten');
    eis(fouten,/Reizigers/.test($(w,'hero').textContent)&&/reg-nsw\.jpg/.test($(w,'hero').style.backgroundImage),`kop van het scherm (nu: '${$(w,'hero').textContent.trim().slice(0,40)}')`);
    const box=$(w,'beheer');
    eis(fouten,box.querySelectorAll('.rlijst li').length===3,`beheerder ziet de drie reizigers (nu ${box.querySelectorAll('.rlijst li').length})`);
    const chipsPiet=[...box.querySelectorAll('.chip[data-id="u3"]')].map(c=>c.dataset.deel);
    eis(fouten,chipsPiet.join(',')==='voorreis,reis,nareis,gast,beheer',`per reiziger een chip Gast, vóór Beheer (nu: ${chipsPiet.join(',')})`);
    eis(fouten,!box.querySelector('.dweg[data-weg="u1"]')&&box.querySelector('.chip[data-id="u1"][data-deel="beheer"]').disabled,'jezelf kun je niet verwijderen of je beheer afnemen');
    eis(fouten,/nog niet opgehaald/.test(box.querySelector('.rstatus').textContent),'zonder ophaalstatus meldt het scherm dat de lijst nog niet is opgehaald');
    // een deel omzetten bij Piet
    box.querySelector('.chip[data-id="u3"][data-deel="voorreis"]').click(); await sleep(100);
    eis(fouten,mutaties.join(',')==='update'&&$(w,'beheer').querySelector('.chip[data-id="u3"][data-deel="voorreis"]').classList.contains('on'),'tik op een chip zet het deel aan en tekent de lijst opnieuw');
    eis(fouten,lijst.find(r=>r.user_id==='u3').voorreis===true,'wijziging is naar Nhost gestuurd');
    eis(fouten,/Lijst opgehaald/.test($(w,'beheer').querySelector('.rstatus').textContent),'na het verversen staat het tijdstip van ophalen op het scherm');
    // Piet gast maken
    $(w,'beheer').querySelector('.chip[data-id="u3"][data-deel="gast"]').click(); await sleep(100);
    eis(fouten,mutaties.join(',')==='update,update'&&lijst.find(r=>r.user_id==='u3').gast===true&&$(w,'beheer').querySelector('.chip[data-id="u3"][data-deel="gast"]').classList.contains('on'),'de chip Gast zet gast=true en licht op');
    // een nieuwe reiziger via het schuifpaneel
    klik(w,'radd',fouten);
    let sheet=$(w,'sheet');
    eis(fouten,sheet&&/Reiziger toevoegen/.test(sheet.textContent)&&$(w,'rnaam'),'plusknop opent het schuifpaneel');
    const chipsNieuw=[...sheet.querySelectorAll('#rdelen .chip')].map(c=>c.dataset.deel);
    eis(fouten,chipsNieuw.join(',')==='voorreis,reis,nareis,gast',`het paneel heeft ook een chip Gast, geen Beheer (nu: ${chipsNieuw.join(',')})`);
    const aanNieuw=[...sheet.querySelectorAll('#rdelen .chip.on')].map(c=>c.dataset.deel);
    eis(fouten,aanNieuw.join(',')==='reis,gast',`Groepsreis en Gast staan meteen aan, de rest niet (nu: ${aanNieuw.join(',')})`);
    // Het wachtwoord is een leesbaar tekstveld dat de app zelf vult: geen wachtwoordveld, anders zet iOS
    // een eigen voorstel in de sleutelhanger van de beheerder. Ook het e-mailveld mag geen username zijn.
    eis(fouten,$(w,'rpw').type==='text'&&$(w,'rpw').getAttribute('autocomplete')==='off'&&!sheet.querySelector('input[type="password"]'),'het wachtwoord staat in een gewoon tekstveld, zonder wachtwoordveld in het paneel');
    eis(fouten,$(w,'remail').getAttribute('autocomplete')==='off','het e-mailveld staat niet op username, zodat iOS er het adres van de beheerder niet bij aanbiedt');
    const sleutels=DIER_SLEUTELS, vorm=/^([a-z]+)-([a-z]+)-([a-z]+)-(\d{4})$/;
    const pw1=$(w,'rpw').value, m1=pw1.match(vorm);
    eis(fouten,m1&&m1.slice(1,4).every(x=>sleutels.includes(x))&&new Set(m1.slice(1,4)).size===3&&+m1[4]>=1000,`bij het openen staat er al een wachtwoord van drie verschillende dieren en een getal (nu: '${pw1}')`);
    $(w,'rpwnieuw').click();
    const pw2=$(w,'rpw').value;
    eis(fouten,vorm.test(pw2)&&pw2!==pw1,`de dobbelsteen maakt een nieuw wachtwoord (nu: '${pw2}')`);
    // kopiëren naar het klembord, met selecteren in het veld als terugval
    let klembord=null;
    w.navigator.clipboard={writeText:async t=>{klembord=t}};
    $(w,'rpwkopie').click(); await sleep(50);
    eis(fouten,klembord===pw2,'de knop zet het wachtwoord op het klembord');
    // de toast ligt achter het paneel, dus de knop zelf toont even een vinkje
    const kopieIcoon=$(w,'rpwkopie').innerHTML;
    eis(fouten,$(w,'rpwkopie').classList.contains('ok')&&/M5 12\.5/.test(kopieIcoon),'en toont even een vinkje in de knop');
    eis(fouten,!$(w,'toast')||!$(w,'toast').classList.contains('on'),'zonder toast, want die zou achter het paneel vallen');
    await sleep(1700);
    eis(fouten,!$(w,'rpwkopie').classList.contains('ok')&&$(w,'rpwkopie').innerHTML!==kopieIcoon,'daarna is het weer de kopieerknop');
    w.navigator.clipboard={writeText:async()=>{throw new Error('geweigerd')}};
    $(w,'rpwkopie').click(); await sleep(50);
    eis(fouten,$(w,'rpw').selectionStart===0&&$(w,'rpw').selectionEnd===pw2.length&&/geselecteerd/.test($(w,'rstat').textContent),'als kopiëren niet lukt, staat het wachtwoord geselecteerd in het veld en zegt de statusregel dat');
    $(w,'rpw').value='wombat-2026';
    eis(fouten,$(w,'rpw').value==='wombat-2026','zelf iets typen kan ook');
    $(w,'rnaam').value='Kees'; $(w,'remail').value='kees@voorbeeld.nl';
    sheet.querySelector('#rdelen .chip[data-deel="nareis"]').click();
    let gedeeld=null; w.navigator.share=async d=>{ gedeeld=d; };
    $(w,'rform').dispatchEvent(new w.Event('submit',{cancelable:true})); await sleep(300);
    eis(fouten,aanmeldingen.length===1&&aanmeldingen[0].email==='kees@voorbeeld.nl'&&aanmeldingen[0].options.displayName==='Kees','account aangemaakt via het aanmeldpunt met naam als displayName');
    eis(fouten,mutaties[mutaties.length-1]==='insert'&&lijst.some(r=>r.user_id==='u9'&&r.naam==='Kees'&&r.reis&&r.nareis&&r.gast===true&&!r.voorreis),`rij in reizigers met de gekozen delen en gast (nu ${JSON.stringify(lijst.find(r=>r.user_id==='u9'))})`);
    eis(fouten,$(w,'beheer').querySelectorAll('.rlijst li').length===4,'nieuwe reiziger staat in de lijst');
    // het paneel blijft open met het welkomstbericht om door te sturen
    sheet=$(w,'sheet');
    eis(fouten,sheet&&/Kees is toegevoegd/.test(sheet.textContent)&&$(w,'rwelkom')&&!$(w,'rform'),'na het toevoegen toont het paneel het welkomstbericht in plaats van het formulier');
    const wt=$(w,'rwelkom').value;
    eis(fouten,/^Hoi Kees,\n\nJe hebt nu toegang/.test(wt)&&/Adres: https:\/\/rserne\.github\.io\/australieapp\/\n\nE-mailadres: kees@voorbeeld\.nl\nWachtwoord: wombat-2026\n/.test(wt),`het bericht begint met de aanhef en heeft het adres, een lege regel, e-mail en wachtwoord (nu: '${wt.slice(0,170).replace(/\n/g,'⏎')}')`);
    eis(fouten,!/Notities/.test(wt)&&/nareis staat na dag 29/.test(wt)&&!/voorreis/.test(wt),'een gast krijgt geen regel over Notities, wel over zijn nareis');
    eis(fouten,/Dieren\. Tik op een dier/.test(wt)&&/mes en vork: tik daarop als je het hebt gegeten/.test(wt)&&wt.trim().endsWith("'Toevoegen aan startscherm'.")&&/'Zet op beginscherm'/.test(wt),'de tabbladen staan erin, met het mes en vork bij Dieren, en het startscherm staat helemaal onderaan');
    $(w,'rdeel').click(); await sleep(50);
    eis(fouten,gedeeld&&gedeeld.text===wt,'Delen geeft het bericht aan het deelmenu van de telefoon');
    klembord=null; w.navigator.clipboard={writeText:async t=>{ klembord=t; }};
    $(w,'rwelkom').value=wt+'\nGroet, Test';
    $(w,'rkopie').click(); await sleep(50);
    eis(fouten,klembord===wt+'\nGroet, Test'&&$(w,'rkopie').textContent==='Gekopieerd','Kopiëren zet de (aangepaste) tekst op het klembord en zegt dat in de knop');
    klik(w,'shclose',fouten); await sleep(260);
    eis(fouten,!$(w,'sheet'),'sluiten haalt het paneel weg');
    // een gewone reiziger met voorreis krijgt de regel over Notities en een zin over de voorreis
    const wt2=w.welkomTekst({naam:'Anna de Vries',email:'anna@voorbeeld.nl',pw:'koala-emoe-galah-1234',gast:false,voorreis:true,nareis:false});
    eis(fouten,/^Hoi Anna,/.test(wt2)&&/• Notities: tickets/.test(wt2)&&/Je doet ook de voorreis/.test(wt2)&&!/nareis/.test(wt2),'reiziger met voorreis: aanhef met voornaam, Notities en de voorreis');
    eis(fouten,JSON.parse(w.localStorage.getItem('aus_sess')).user.id==='u1','beheerder blijft zelf ingelogd na het aanmaken van een account');
    // verwijderen
    $(w,'beheer').querySelector('.dweg[data-weg="u2"]').click(); await sleep(100);
    eis(fouten,mutaties[mutaties.length-1]==='delete'&&$(w,'beheer').querySelectorAll('.rlijst li').length===3,'verwijderen haalt de rij weg en tekent de lijst opnieuw');
    // terug
    $(w,'rterug').click();
    eis(fouten,$(w,'prakt').style.display==='block'&&$(w,'beheer').style.display==='none','← Praktisch brengt je terug');
    meld('5 okt: beheerder wijzigt, voegt toe en verwijdert',fouten); }
  { const {w,fouten}=start('2026-10-05',{login:'groep',online:true,lijst:REIZIGERS(false,true)});
    w.gql=async q=>{ if(/^query/.test(q)) return {reizigers:REIZIGERS(false,true)}; throw new Error('onverwacht'); };
    w.fetch=async url=>{ if(/signup/.test(url)) return {ok:true,status:200,json:async()=>({session:null})}; throw new TypeError('Failed to fetch'); };
    klik(w,'btnPrakt',fouten); klik(w,'rbeheer',fouten); klik(w,'radd',fouten);
    $(w,'rnaam').value='Kees'; $(w,'remail').value='k@v.nl'; $(w,'rpw').value='wombat-2026';
    $(w,'rform').dispatchEvent(new w.Event('submit',{cancelable:true})); await sleep(150);
    eis(fouten,!!$(w,'sheet')&&/e-mailbevestiging/.test($(w,'rstat').textContent)&&!$(w,'rbtn').disabled,'zonder sessie uit het aanmeldpunt blijft het paneel open met uitleg');
    meld('5 okt: aanmelden met e-mailbevestiging aan',fouten); }
  { const {w,fouten}=start('2026-10-05',{login:'groep',online:true,lijst:REIZIGERS(false,true)});
    // Hasura weigert de query (kolom niet in de select-permissie): dat moet zichtbaar zijn
    w.gql=async q=>{ if(/^query/.test(q)&&/reizigers/.test(q)) throw new Error("field 'beheer' not found in type: 'reizigers'"); throw new Error('onverwacht'); };
    await w.syncReizigers();
    klik(w,'btnPrakt',fouten);
    const c=$(w,'acct').querySelector('.callout');
    eis(fouten,c&&c.classList.contains('let')&&/ophalen van de reizigerslijst mislukte/.test(c.textContent)&&/beheer/.test(c.textContent),`mislukt ophalen van de lijst staat met de reden in het inlogblok (nu: '${c&&c.textContent.slice(0,80)}')`);
    klik(w,'rbeheer',fouten);
    eis(fouten,/Ophalen mislukt/.test($(w,'beheer').querySelector('.rstatus').textContent),'en op het scherm Reizigers');
    meld('5 okt: mislukt ophalen van de reizigerslijst is zichtbaar',fouten); }
  // Zonder login of zonder beheer blijft het scherm dicht, ook na uitloggen erop
  { const {w,fouten}=start('2026-10-05',{login:'groep',online:true,lijst:REIZIGERS(false,true)});
    w.gql=async q=>{ if(/^query/.test(q)) return {reizigers:REIZIGERS(false,true)}; throw new Error('onverwacht'); };
    klik(w,'btnPrakt',fouten); klik(w,'rbeheer',fouten);
    const lo=$(w,'acct')&&$(w,'acct').querySelector('#logout');
    klik(w,'btnPrakt',fouten); $(w,'logout').click(); await sleep(200);
    eis(fouten,$(w,'beheer').style.display==='none','na uitloggen is het scherm Reizigers weg');
    meld('5 okt: uitloggen vanaf het beheer',fouten); }

  { const {w,fouten}=start('2026-10-09',{login:'groep'});
    eis(fouten,!!$(w,'notes-top'),'ticket van dag 9 staat er meteen, zonder op de server te wachten');
    const h2=$(w,'notes-top')&&$(w,'notes-top').querySelector('h2');
    eis(fouten,h2&&h2.textContent==='Vandaag nodig',`kop boven het ticket van vandaag (nu: '${h2&&h2.textContent}')`);
    klik(w,'prev',fouten);
    meld('9 okt: notities direct zichtbaar zonder verbinding',fouten); }
  { const {w,fouten}=start('2026-10-05',{login:'groep'});
    await sleep(100);
    const meta=w.document.querySelector('.nmeta');
    eis(fouten,meta&&/^Onbekend/.test(meta.textContent),`bijlage van een ander zonder afzender heet 'Onbekend' (nu: '${meta&&meta.textContent}')`);
    meld('5 okt: afzender van andermans notitie',fouten); }
  { const {w,fouten}=start('2026-09-25',{login:'voor'});
    klik(w,'btnPrakt',fouten); const lo=$(w,'logout'); if(lo) lo.click(); await sleep(200);
    klik(w,'btnIndex',fouten); klik(w,'btnIndex',fouten);
    eis(fouten,kop(w).length>0,'na uitloggen op een voorreisdag toont het dagtabblad weer een pagina');
    meld('25 sep: uitloggen op een voorreisdag en terug naar Vandaag',fouten); }
  { const {w,fouten}=start('2026-10-05',{login:'groep'});
    klik(w,'btnPrakt',fouten);
    const verz=$(w,'verz');
    eis(fouten,verz&&verz.querySelector('.nitem .ntext')&&/12345678/.test(verz.textContent),'Praktisch toont de verzekeringsnotitie onder Verzekeringen');
    eis(fouten,verz&&!verz.querySelector('[data-edit]'),'andermans verzekeringsnotitie heeft geen bewerkknop');
    klik(w,'vadd',fouten);
    const sheet=$(w,'sheet');
    eis(fouten,sheet&&!sheet.querySelector('#shtypes')&&/Verzekering toevoegen/.test(sheet.textContent),'formulier vanuit Verzekeringen heeft het type vast op Verzekering');
    klik(w,'shclose',fouten);
    klik(w,'btnAlles',fouten); await sleep(50);
    const koppen=[...w.document.querySelectorAll('#nlijst h2')].map(x=>x.textContent);
    eis(fouten,koppen.length&&koppen[koppen.length-1]==='Verzekeringen',`Verzekeringen staat onderaan in Notities (nu: ${koppen.join(' | ')})`);
    const label=w.document.querySelector('#nlijst .ndag.verz');
    eis(fouten,label&&/Praktisch/.test(label.textContent),'verzekeringskaart in Notities draagt het label Praktisch');
    if(label){ label.click(); eis(fouten,$(w,'prakt').style.display==='block','label Praktisch opent het tabblad Praktisch'); }
    klik(w,'btnIndex',fouten); zoek(w,fouten,'polis');
    const dn=w.document.querySelector('#results .dn');
    eis(fouten,dn&&dn.textContent==='Praktisch',`zoektreffer op een verzekering wijst naar Praktisch (nu: '${dn&&dn.textContent}')`);
    meld('5 okt: verzekeringen in Praktisch, Notities en zoeken',fouten); }
  { const {w,fouten}=start('2026-10-05');
    klik(w,'btnPrakt',fouten);
    eis(fouten,!$(w,'verz')&&!/Verzekeringen/.test($(w,'prakt').textContent),'zonder login staat het blok Verzekeringen er niet');
    meld('5 okt anoniem: Verzekeringen achter de login',fouten); }
  { const {w,fouten}=start('2026-10-05',{login:'groep',online:true});
    await sleep(4200);   // drie mislukte vernieuwpogingen: 0 + 1,2 + 2,4 s
    eis(fouten,$(w,'btnAlles').hidden===false,'na mislukte vernieuwing blijft de sessie uit de kopie staan');
    meld('5 okt: online zonder werkend netwerk, herhaalpogingen',fouten); }

  // Voorreis met programma
  const koppen=w=>[...w.document.querySelectorAll('#day h2')].map(x=>x.textContent);
  { const {w,fouten}=start('2026-09-20',{login:'voor',voorreis:VOORTEST});
    eis(fouten,/^Voorreis/.test(kop(w))&&/dag 3 van 13/.test(kop(w)),`kop van een voorreisdag met programma (nu: '${kop(w)}')`);
    eis(fouten,$(w,'title').textContent==='Port Douglas en het rif',`titel uit voorreis.js (nu: '${$(w,'title').textContent}')`);
    const k=koppen(w);
    ['Goed om te weten','Dieren spotten','Wat je hier moet proeven','Eten vanavond','Morgen'].forEach(x=>eis(fouten,k.includes(x),`blok '${x}' op een voorreisdag (nu: ${k.join(' | ')})`));
    eis(fouten,/Emoe-alert/.test($(w,'day').textContent),'emoe-alert op een voorreisdag');
    eis(fouten,/Cairns Plaza Hotel/.test($(w,'day').textContent),'hotel uit HOTELGEO op een voorreisdag');
    eis(fouten,!/Nog geen notities voor deze dag/.test($(w,'day').textContent),'geen lege-notitiesmelding op een dag met programma');
    const tmw=w.document.querySelector('#day .tomorrow .tt');
    eis(fouten,tmw&&tmw.textContent==='Nog geen notities',`Morgen wijst naar 21 sep, een dag zonder programma en zonder notities (nu: '${tmw&&tmw.textContent}')`);
    eis(fouten,/Voorreis · maandag 21 september/.test($(w,'day').textContent),'Morgen-label noemt de voorreisdag van morgen');
    klik(w,'nadd',fouten); klik(w,'shclose',fouten);
    meld('20 sep: voorreisdag met programma',fouten); }
  { const {w,fouten}=start('2026-09-19',{login:'voor',voorreis:VOORTEST});
    const tmw=w.document.querySelector('#day .tomorrow .tt');
    eis(fouten,tmw&&tmw.textContent==='Port Douglas en het rif',`Morgen toont de titel van 20 sep (nu: '${tmw&&tmw.textContent}')`);
    eis(fouten,/emoe-alert/.test(w.document.querySelector('#day .tomorrow').textContent)&&/was afgeven/.test(w.document.querySelector('#day .tomorrow').textContent),'Morgen meldt emoe-alert en was afgeven van een voorreisdag');
    eis(fouten,koppen(w).includes('Tijdschema'),'tijdschema op een voorreisdag');
    eis(fouten,/Reisdag · per auto/.test($(w,'day').textContent),'dagtype auto op een voorreisdag');
    klik(w,'next',fouten);
    eis(fouten,$(w,'title').textContent==='Port Douglas en het rif','volgende pijl komt op de dag met programma');
    meld('19 sep: Morgen-blok naar een voorreisdag met programma',fouten); }
  { const {w,fouten}=start('2026-09-30',{login:'voor',voorreis:VOORTEST});
    eis(fouten,/dag 13 van 13/.test(kop(w)),`laatste voorreisdag (nu: '${kop(w)}')`);
    eis(fouten,/Dag 1 · donderdag 1 oktober/.test($(w,'day').textContent),'Morgen op 30 sep wijst naar dag 1 van de groepsreis');
    eis(fouten,!/Vanavond klaarleggen/.test($(w,'day').textContent),'de kofferlijst van de groepsvertrekdag staat niet op een voorreisdag');
    klik(w,'next',fouten); eis(fouten,kop(w)==='Dag 1van 29','na de laatste voorreisdag volgt dag 1');
    klik(w,'prev',fouten); eis(fouten,$(w,'title').textContent==='Vlucht naar Sydney','terug vanaf dag 1 komt op de voorreisdag met programma');
    meld('30 sep: overgang van voorreis naar groepsreis',fouten); }
  { const {w,fouten}=start('2026-09-25',{login:'voor',voorreis:VOORTEST});
    const t=$(w,'title').textContent;
    eis(fouten,/^Voorreis/.test(kop(w))&&t==='Vrijdag 25 september',`dag zonder programma tussen dagen met programma blijft een notitiedag (nu: '${kop(w)}' / '${t}')`);
    eis(fouten,/Nog geen notities voor deze dag/.test($(w,'day').textContent),'notitiedag zonder notities toont de lege melding');
    meld('25 sep: voorreisdag zonder programma tussen dagen met programma',fouten); }
  { const {w,fouten}=start('2026-09-20',{login:'groep',voorreis:VOORTEST});
    eis(fouten,kop(w)==='Rondreis Australië',`groepslid zonder voorreisnotities ziet nog steeds de startpagina (nu: '${kop(w)}')`);
    const kaart=w.document.querySelector('.regio[data-go="-11"]');
    eis(fouten,!!kaart,'kaart Voorreis op de startpagina brengt je naar de voorreisdag van vandaag');
    if(kaart){ kaart.click(); eis(fouten,$(w,'title').textContent==='Port Douglas en het rif','via de kaart Voorreis kom je op het programma van vandaag'); }
    klik(w,'btnIndex',fouten);
    const rijen=[...w.document.querySelectorAll('#results .idx button')].filter(b=>+b.dataset.n<0);
    eis(fouten,rijen.length===13,`Alle dagen toont de voorreis per dag zodra er programma is (nu ${rijen.length} rijen)`);
    const rij20=rijen.find(b=>b.dataset.n==='-11');
    eis(fouten,rij20&&/Port Douglas en het rif/.test(rij20.textContent)&&/^3/.test(rij20.querySelector('.n').textContent),'rij van 20 sep toont volgnummer 3 en de titel');
    zoek(w,fouten,'wombat');
    const dn=w.document.querySelector('#results .dn'), src=w.document.querySelector('#results .src');
    eis(fouten,dn&&dn.textContent==='Voorreis'&&src&&src.textContent==='Dieren spotten',`zoeken vindt het voorreisprogramma (nu: '${dn&&dn.textContent}' / '${src&&src.textContent}')`);
    zoek(w,fouten,'huurauto');
    eis(fouten,[...w.document.querySelectorAll('#results .dn')].some(x=>x.textContent==='Voorreis'),'zoeken vindt het tijdschema van een voorreisdag');
    klik(w,'btnPrakt',fouten);
    eis(fouten,/Port Douglas/.test($(w,'clockbox').textContent),'klok in Praktisch gebruikt plaats en tijdzone van de voorreisdag');
    meld('20 sep: groepslid, Alle dagen, zoeken en klok met voorreisprogramma',fouten); }
  { const {w,fouten}=start('2026-09-20',{voorreis:VOORTEST});
    eis(fouten,kop(w)==='Rondreis Australië','anoniem blijft het programma van de voorreis verborgen');
    klik(w,'btnIndex',fouten); zoek(w,fouten,'wombat');
    eis(fouten,!w.document.querySelector('#results .dn')||[...w.document.querySelectorAll('#results .dn')].every(x=>x.textContent!=='Voorreis'),'anoniem zoeken vindt het voorreisprogramma niet');
    meld('20 sep anoniem: voorreisprogramma achter de login',fouten); }
  { const {w,fouten}=start('2026-10-05',{login:'groep',voorreis:VOORTEST});
    const tmw=w.document.querySelector('#day .tomorrow');
    eis(fouten,tmw&&/Dag 6/.test(tmw.textContent)&&tmw.querySelector('.ganaar'),'Morgen-blok op een groepsdag werkt via dagKnop');
    if(tmw){ tmw.querySelector('.ganaar').click(); eis(fouten,kop(w)==='Dag 6van 29',`tik op Morgen gaat naar dag 6 (nu: '${kop(w)}')`); }
    meld('5 okt: Morgen-blok op een gewone reisdag',fouten); }
  // Winkels bij het hotel: uit WINKELS in reis.js, per hotel, onder Eten vanavond. Zonder hotel geen blok.
  { const {w,fouten}=start('2026-10-03');
    const kaarten=()=>[...w.document.querySelectorAll('#day details.rcard')].filter(c=>!c.querySelector('.role'));
    const kopjes=()=>[...w.document.querySelectorAll('#day h2')].map(h=>h.textContent);
    eis(fouten,kopjes().includes('Winkels')&&kaarten().length===1&&/Woolworths Metro/.test(kaarten()[0].textContent),`dag 3 (Sydney) toont de winkel bij The Ultimo (nu ${kaarten().length} kaarten)`);
    const k=kaarten()[0];
    eis(fouten,/1 min lopen/.test(k.querySelector('.rkort').textContent)&&/open 7\.00–23\.00/.test(k.querySelector('.rkort').textContent),`de dichte kaart noemt looptijd en openingstijden (nu: '${k.querySelector('.rkort').textContent}')`);
    eis(fouten,kopjes().indexOf('Winkels')>kopjes().indexOf('Eten vanavond'),'het blok staat onder Eten vanavond');
    const route=k.querySelector('.btns a');
    eis(fouten,route&&/origin=-33\.88/.test(route.href)&&/travelmode=walking/.test(route.href),'Route vertrekt op de coördinaten van het hotel');
    w.ga(5);
    eis(fouten,kaarten().length===1&&/Woolworths Metro/.test(kaarten()[0].textContent),'dag 5 deelt het blok met dag 3, want het is hetzelfde hotel');
    w.ga(24);
    eis(fouten,kaarten().length===4&&/Coles/.test(kaarten()[0].textContent),`dag 24 (Perth) toont vier winkels (nu ${kaarten().length})`);
    w.ga(1);
    eis(fouten,!kopjes().includes('Winkels'),'dag 1 heeft geen hotel en dus geen blok');
    w.ga(13);
    eis(fouten,!kopjes().includes('Winkels'),'dag 13 heeft nog geen hotel en dus geen blok');
    klik(w,'btnIndex',fouten); zoek(w,fouten,'raine square');
    eis(fouten,[...w.document.querySelectorAll('#results .src')].some(s=>/^Winkel$/.test(s.textContent.trim())),'zoeken vindt een winkel op naam van de straat');
    meld('3 okt: winkels bij het hotel',fouten); }

  // Dieren: waarnemingen
  { const {w,fouten}=start('2026-10-06',{login:'groep'});
    eis(fouten,$(w,'btnDieren').hidden===false,'tabblad Dieren zichtbaar na inloggen');
    klik(w,'btnDieren',fouten);
    eis(fouten,$(w,'dieren').style.display==='block','tabblad Dieren opent');
    const knoppen=w.document.querySelectorAll('#dalle .drij');
    eis(fouten,knoppen.length>=55,`lijst met dieren (nu ${knoppen.length} regels)`);
    const koala=w.document.querySelector('#dalle .drij[data-dier="koala"]');
    eis(fouten,!!koala,'regel Koala staat in de lijst');
    // Kans vandaag: de dieren uit het programma van dag 6, met de kans erbij en de pauw als 'ander dier'
    const kans=$(w,'dieren').querySelector('.dlist');
    eis(fouten,kans&&/Vogelbekdier/.test(kans.textContent)&&/Pauw/.test(kans.textContent)&&kans.querySelector('.chance'),'Kans vandaag toont de dieren van dag 6 met kans');
    eis(fouten,/Kans vandaag/.test($(w,'dieren').textContent)&&!/Dag 6/.test($(w,'dieren').textContent),'kop Kans vandaag zonder de dag erachter');
    eis(fouten,/Dag 6 · Launceston/.test($(w,'hero').textContent),`de dag staat in de kop van het tabblad (nu: '${$(w,'hero').textContent.replace(/\s+/g,' ').trim()}')`);
    const pauw=kans&&[...kans.querySelectorAll('.drij')].find(r=>r.dataset.naam==='Pauw');
    eis(fouten,pauw&&pauw.dataset.dier==='overig'&&pauw.querySelector('svg'),'een dier zonder knop staat in Kans vandaag als ander dier, met het pootje');
    // zoeken en chips
    const chips=w.document.querySelectorAll('#dieren .dchip');
    eis(fouten,chips.length===6&&/Zoogdieren0\/15/.test(chips[0].textContent),`zonder waarnemingen alleen de zes groepschips (nu ${chips.length}, '${chips[0]&&chips[0].textContent}')`);
    eis(fouten,!w.document.querySelector('.dchip[data-filter]'),'geen filterchips zolang er niets is gespot of gegeten');
    // een groepschip filtert en springt niet
    const zeeChip=w.document.querySelector('#dieren .dchip[data-groep="zee"]'); zeeChip.click();
    let secties=[...w.document.querySelectorAll('#dalle .dgroep')].filter(g=>!g.hidden).map(g=>g.id);
    eis(fouten,secties.join(',')==='dg-zee'&&w.document.querySelector('#dieren .dchip[data-groep="zee"]').classList.contains('on'),`chip In zee filtert op die groep (nu ${secties.join(',')||'niets'})`);
    eis(fouten,!!w.document.querySelector('#dieren .dchip[data-groep="zee"] .chipx'),'aangezette chip toont een kruisje');
    w.document.querySelector('#dieren .dchip[data-groep="zee"]').click();
    const aantalSecties=[...w.document.querySelectorAll('#dalle .dgroep')].filter(g=>!g.hidden).length;
    eis(fouten,aantalSecties===6&&!w.document.querySelector('#dieren .dchip[data-groep="zee"]').classList.contains('on'),`nog een tik zet het filter uit (nu ${aantalSecties} groepen)`);
    const kopjes=[...$(w,'dieren').querySelectorAll('h2')].map(x=>x.textContent);
    eis(fouten,kopjes.includes('Ander dier'),`kopje boven de knop voor een ander dier (nu: ${kopjes.join(' | ')})`);
    const zoek=$(w,'dzoek'); zoek.value='krok'; zoek.dispatchEvent(new w.Event('input'));
    const zichtbaar=[...w.document.querySelectorAll('#dalle .drijwrap')].filter(r=>!r.hidden).map(r=>r.querySelector('.drij').dataset.dier);
    eis(fouten,zichtbaar.join(',')==='zoutwaterkrokodil,zoetwaterkrokodil',`zoeken op 'krok' laat twee krokodillen over (nu ${zichtbaar.join(',')})`);
    eis(fouten,[...w.document.querySelectorAll('#dalle .dgroep')].filter(g=>!g.hidden).length===1,'groepen zonder treffer verdwijnen bij zoeken');
    // een samengesteld synoniem als 'Rode reuzenkangoeroe en emoe' mag de kangoeroe niet onder 'emoe' vinden
    zoek.value='emoe'; zoek.dispatchEvent(new w.Event('input'));
    const opEmoe=[...w.document.querySelectorAll('#dalle .drijwrap')].filter(r=>!r.hidden).map(r=>r.querySelector('.drij').dataset.dier);
    eis(fouten,opEmoe.join(',')==='emoe',`zoeken op 'emoe' geeft alleen de emoe (nu ${opEmoe.join(',')||'niets'})`);
    zoek.value='buidelmarter'; zoek.dispatchEvent(new w.Event('input'));
    const opSyn=[...w.document.querySelectorAll('#dalle .drijwrap')].filter(r=>!r.hidden).map(r=>r.querySelector('.drij').dataset.dier);
    eis(fouten,opSyn.join(',')==='quoll',`zoeken op een los synoniem werkt nog wel (nu ${opSyn.join(',')||'niets'})`);
    zoek.value=''; zoek.dispatchEvent(new w.Event('input'));
    if(koala) koala.click();
    await sleep(50);
    const q=JSON.parse(w.localStorage.getItem('aus_pending')||'[]');
    eis(fouten,q.length===1&&q[0].tabel==='waarnemingen'&&q[0].dier==='koala'&&q[0].dag===6&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d[+-]\d\d:\d\d$/.test(q[0].gezien_op),`waarneming zonder verbinding in de wachtrij met tabel, dag en tijd (nu ${JSON.stringify(q[0])})`);
    const gesp=$(w,'dieren').querySelector('.dlijst');
    // de datum in de tussenkop komt van de klok, die in deze test niet meeloopt met ?datum
    eis(fouten,gesp&&/^Dag 6 · [A-Z][a-z]+dag \d+ \w+$/.test(gesp.querySelector('.ddag').textContent)&&/Koala/.test(gesp.textContent)&&/1 waarneming wacht op verbinding/.test($(w,'dieren').textContent),`waarneming staat onder Gespot, onder een tussenkop met dagnummer en datum (nu '${gesp&&gesp.querySelector('.ddag').textContent}')`);
    const koala2=w.document.querySelector('#dalle .drij[data-dier="koala"]')?.closest('.drijwrap');
    eis(fouten,koala2&&!koala2.classList.contains('mijn')&&koala2.classList.contains('gespot')&&koala2.querySelector('.dtel').textContent==='1','teller en tint op de regel na de waarneming, zonder onderscheid naar wie');
    eis(fouten,/Zoogdieren1\/15/.test(w.document.querySelectorAll('#dieren .dchip')[1].textContent),'chip telt mee');
    // de eerste waarneming levert meteen de kaart van de eerste prijs op; die sluiten we, de melding onderin blijft
    await sleep(400);
    const kaart0=w.document.querySelector('#sheet .sheet.prijs');
    eis(fouten,kaart0&&kaart0.dataset.prijs==='eerste'&&/nog 15 te verdienen/.test(kaart0.textContent),'de eerste waarneming brengt de kaart G\'day!, met het aantal andere prijzen');
    klik(w,'shclose',fouten); await sleep(260);
    // filter Gespot
    const chipGespot=()=>w.document.querySelector('.dchip[data-filter="gespot"]');
    chipGespot().click();
    eis(fouten,!!chipGespot().querySelector('.chipx'),'Gespot toont een kruisje als hij aanstaat');
    let zicht=[...w.document.querySelectorAll('#dalle .drijwrap')].filter(r=>!r.hidden).map(r=>r.querySelector('.drij').dataset.dier);
    eis(fouten,zicht.join(',')==='koala',`filter toont alleen wat al gespot is (nu ${zicht.join(',')||'niets'})`);
    eis(fouten,[...w.document.querySelectorAll('#dalle .dgroep')].filter(g=>!g.hidden).length===1,'groepen zonder gespot dier verdwijnen');
    eis(fouten,chipGespot().classList.contains('on'),'filterchip staat aan');
    eis(fouten,!w.document.querySelector('.dchip[data-filter="gegeten"]'),'zonder gegeten dier staat die chip er niet');
    eis(fouten,!!chipGespot(),'met een gespot dier staat de chip Gespot er wel');
    chipGespot().click();
    zicht=[...w.document.querySelectorAll('#dalle .drijwrap')].filter(r=>!r.hidden).length;
    eis(fouten,zicht>=55&&!chipGespot().classList.contains('on'),'filter uit toont weer alles');
    const t=$(w,'toast'); eis(fouten,t&&/Koala gespot om \d\d\.\d\d uur/.test(t.textContent)&&t.querySelector('button'),'melding met Ongedaan maken');
    if(t&&t.querySelector('button')) t.querySelector('button').click();
    await sleep(50);
    eis(fouten,JSON.parse(w.localStorage.getItem('aus_pending')||'[]').length===0,'Ongedaan maken haalt de waarneming uit de wachtrij');
    // een ander dier via het blad met één tekstveld
    klik(w,'dander',fouten);
    let sheet=$(w,'sheet');
    eis(fouten,sheet&&/Iets anders gezien/.test(sheet.textContent)&&$(w,'shdier')&&!sheet.querySelector('.chip'),'blad voor een ander dier opent, alleen een tekstveld');
    $(w,'shsave').click(); await sleep(50);
    eis(fouten,!!$(w,'sheet')&&JSON.parse(w.localStorage.getItem('aus_pending')||'[]').length===0,'leeg veld noteert niets en het blad blijft open');
    $(w,'shdier').value='pauw'; $(w,'shdier').dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter'})); await sleep(500);
    let q2=JSON.parse(w.localStorage.getItem('aus_pending')||'[]');
    eis(fouten,q2.length===1&&q2[0].dier==='overig'&&q2[0].opmerking==='Pauw','getypte naam wordt genoteerd, met een hoofdletter');
    // het blad is dicht, en omdat dit je eerste waarneming is, schuift de kaart van de eerste prijs omhoog
    const kaart1=w.document.querySelector('#sheet .sheet.prijs');
    eis(fouten,!$(w,'shdier')&&kaart1&&kaart1.dataset.prijs==='eerste'&&kaart1.querySelector('h3').textContent==='G\'day!','blad sluit na het noteren en de kaart G\'day! verschijnt');
    klik(w,'shclose',fouten); await sleep(260);
    eis(fouten,!$(w,'sheet'),'de kaart sluit weer');
    klik(w,'dander',fouten); $(w,'shdier').value='Wombat met jong'; $(w,'shsave').click(); await sleep(300);
    q2=JSON.parse(w.localStorage.getItem('aus_pending')||'[]');
    eis(fouten,q2.length===2&&q2[1].opmerking==='Wombat met jong','tweede naam via de knop Gespot');
    eis(fouten,/Wombat met jong/.test($(w,'dieren').textContent)&&/Pauw/.test($(w,'dieren').textContent),'andere dieren staan met hun naam in de lijst');
    // de groep Overig verschijnt zodra er zoiets is, met het pootje als icoon
    const ov=w.document.querySelector('#dg-overig');
    eis(fouten,ov&&/Overig/.test(ov.textContent)&&ov.querySelectorAll('.drij').length===2&&/2 van 2/.test(ov.textContent),`groep Overig met beide namen (nu ${ov?ov.querySelectorAll('.drij').length:0} regels)`);
    eis(fouten,ov&&[...ov.querySelectorAll('.drij')].every(r=>r.dataset.dier==='overig'&&r.querySelector('svg')),'regels in Overig dragen het pootje');
    // nog een keer hetzelfde dier: telt op in plaats van een tweede regel
    ov.querySelector('.drij').click(); await sleep(50);
    const ov2=w.document.querySelector('#dg-overig');
    eis(fouten,ov2.querySelectorAll('.drij').length===2&&[...ov2.querySelectorAll('.dtel')].some(t=>t.textContent==='2'),'nog een keer hetzelfde andere dier telt op');
    w.document.querySelector('.dchip[data-filter="gespot"]').click();
    eis(fouten,!w.document.querySelector('#dg-overig').hidden,'Overig blijft staan bij het filter Gespot');
    w.document.querySelector('.dchip[data-filter="gespot"]').click();
    // een ander dier op het bord: eerst via de knop Gegeten in het blad, daarna via het bestekje op de regel
    klik(w,'dander',fouten); $(w,'shdier').value='kangoeroeburger'; $(w,'shgegeten').click(); await sleep(300);
    q2=JSON.parse(w.localStorage.getItem('aus_pending')||'[]');
    eis(fouten,q2.length===4&&q2[3].dier==='overig'&&q2[3].opmerking==='Kangoeroeburger'&&q2[3].hoe==='gegeten','ander dier via de knop Gegeten wordt als gegeten genoteerd');
    const rijBurger=()=>[...w.document.querySelectorAll('#dg-overig .drijwrap')].find(r=>/Kangoeroeburger/.test(r.textContent));
    let rb=rijBurger();
    eis(fouten,rb&&rb.querySelector('.deet.aan')&&!rb.querySelector('.dtel')&&rb.dataset.gegeten==='1'&&rb.dataset.gespot==='0','regel in Overig toont het bestekje met 1 en geen gespot-teller');
    const ov3=w.document.querySelector('#dg-overig');
    eis(fouten,ov3.querySelectorAll('.drij').length===3&&/2 van 3/.test(ov3.textContent),`Overig telt de gegeten naam mee in het totaal, niet bij gespot (nu: ${ov3.querySelector('.dsub')?.textContent})`);
    rb.querySelector('.deet').click(); await sleep(50);
    q2=JSON.parse(w.localStorage.getItem('aus_pending')||'[]');
    eis(fouten,q2.length===5&&q2[4].opmerking==='Kangoeroeburger'&&q2[4].hoe==='gegeten','bestekje op een regel in Overig noteert nog een keer gegeten');
    rb=rijBurger();
    eis(fouten,rb&&rb.querySelector('.deet span')?.textContent==='2','bestekje telt op naar 2');
    w.document.querySelector('.dchip[data-filter="gegeten"]').click();
    eis(fouten,!w.document.querySelector('#dg-overig').hidden&&!rijBurger().hidden&&[...w.document.querySelectorAll('#dg-overig .drijwrap')].find(r=>/Pauw/.test(r.textContent)).hidden,'filter Gegeten houdt in Overig alleen de gegeten naam over');
    w.document.querySelector('.dchip[data-filter="gegeten"]').click();
    // alles weghalen, dan is de wachtrij leeg
    while(w.document.querySelector('#dieren .dweg')){ w.document.querySelector('#dieren .dweg').click(); await sleep(20); }
    // weghalen van een wachtende waarneming
    const weg=w.document.querySelector('#dieren .dweg'); if(weg) weg.click(); await sleep(50);
    eis(fouten,JSON.parse(w.localStorage.getItem('aus_pending')||'[]').length===0,'eigen wachtende waarneming weghalen');
    // de teller op de dagpagina
    w.localStorage.setItem('aus_pending',JSON.stringify([{tabel:'waarnemingen',dier:'vogelbekdier',dag:6,gezien_op:'2026-10-06T09:10:00+10:30',wie:'Test'}]));
    klik(w,'btnToday',fouten); klik(w,'btnIndex',fouten);
    const rij=[...w.document.querySelectorAll('#results .idx button')].find(b=>b.dataset.n==='6'); if(rij) rij.click();
    eis(fouten,!/gespot/.test($(w,'day').textContent),'dagpagina toont geen tellers');
    // waarnemingen van andere dagen staan ook in de lijst, met hun eigen tussenkop
    w.localStorage.setItem('aus_cache_waarn',JSON.stringify([{id:'z',user_id:'u2',dier:'koala',dag:20,gezien_op:'2026-10-20T08:00:00+09:30',wie:'Anna'}]));
    klik(w,'btnDieren',fouten);
    const lijst=w.document.querySelector('#dieren .dlijst');
    eis(fouten,lijst&&/Vogelbekdier/.test(lijst.textContent)&&!/\u00AD/.test(lijst.textContent),'naam in de lijst zonder zacht afbreekstreepje');
    const koppen=[...lijst.querySelectorAll('.ddag')].map(x=>x.textContent);
    eis(fouten,koppen.length===2&&koppen[0]==='Dag 20 · Dinsdag 20 oktober'&&/^Dag 6 · /.test(koppen[1]),
      `Gespot toont elke dag met dagnummer en datum, nieuwste bovenaan (nu: ${koppen.join(' | ')})`);
    eis(fouten,!/\u00AD/.test(w.document.querySelector('#dalle .drij[data-dier="vogelbekdier"]').textContent),'naam op de regel zonder zacht afbreekstreepje');
    // tik op een dier in Kans vandaag noteert het
    const vb=[...$(w,'dieren').querySelector('.dlist').querySelectorAll('.drij')].find(r=>r.dataset.dier==='vogelbekdier'); if(vb) vb.click(); await sleep(50);
    eis(fouten,JSON.parse(w.localStorage.getItem('aus_pending')||'[]').some(p=>p.dier==='vogelbekdier'),'tik in Kans vandaag noteert het dier');
    const pw=[...$(w,'dieren').querySelector('.dlist').querySelectorAll('.drij')].find(r=>r.dataset.naam==='Pauw'); if(pw) pw.click(); await sleep(50);
    eis(fouten,JSON.parse(w.localStorage.getItem('aus_pending')||'[]').some(p=>p.dier==='overig'&&p.opmerking==='Pauw'),'tik op een ander dier in Kans vandaag noteert het op naam');
    w.localStorage.setItem('aus_pending','[]');
    meld('6 okt: waarnemingen zonder verbinding',fouten); }
  { const {w,fouten}=start('2026-10-06',{login:'groep',online:true});
    // Nhost nagebootst: de wachtrij bevat een notitie en een waarneming, beide moeten naar hun eigen tabel
    const mutaties=[];
    let opgehaald=0;
    w.gql=async(q,v)=>{ const m=q.match(/insert_\w+_one|delete_\w+_by_pk/); if(m) mutaties.push(m[0]);
      if(/^query/.test(q)&&/waarnemingen/.test(q)){ opgehaald++; return {waarnemingen:[]}; }
      if(/insert_waarnemingen_one/.test(q)) return {insert_waarnemingen_one:{id:'w1'}};
      if(/insert_dagitems_one/.test(q)) return {insert_dagitems_one:{id:'n1',created_at:'2026-10-06T00:00:00Z'}};
      if(/delete_waarnemingen_by_pk/.test(q)) return {delete_waarnemingen_by_pk:{id:v.id}};
      throw new Error('onverwachte query'); };
    w.localStorage.setItem('aus_pending',JSON.stringify([
      {dag:6,tekst:'Oude notitie zonder tabel',wie:'Test',type:'notitie'},
      {tabel:'waarnemingen',dier:'emoe',dag:6,gezien_op:'2026-10-06T08:00:00+10:30',wie:'Test',fout:"field 'dag' not found in type: 'waarnemingen_insert_input'"}]));
    klik(w,'btnDieren',fouten); await sleep(20);
    eis(fouten,/1 waarneming kon niet worden verstuurd/.test($(w,'dieren').textContent)&&/versturen mislukt: field 'dag'/.test($(w,'dieren').textContent),'mislukte waarneming staat er net als een mislukte notitie, met de reden');
    eis(fouten,opgehaald===1,'het tabblad Dieren haalt de waarnemingen van de anderen op');
    const n=await w.flushPending();
    eis(fouten,n===2&&mutaties.join(',')==='insert_dagitems_one,insert_waarnemingen_one',`wachtrij stuurt elk item naar zijn eigen tabel, ook na een eerdere fout (nu ${n}, ${mutaties.join(',')})`);
    eis(fouten,JSON.parse(w.localStorage.getItem('aus_pending')||'[]').length===0,'wachtrij leeg na versturen');
    eis(fouten,opgehaald===2,'en na het versturen wordt de kopie opnieuw ververst');
    // terugkomen in de app: verversen, maar niet vaker dan eens in de vijf minuten
    let rondes=0; const echteSync=w.syncAlles; w.syncAlles=async()=>{rondes++;return [];};
    const terug=async min=>{ w.localStorage.setItem('aus_sync',JSON.stringify({tijd:new Date(Date.now()-min*60000).toISOString()}));
      w.document.dispatchEvent(new w.Event('visibilitychange')); await sleep(20); };
    await terug(1);
    eis(fouten,rondes===0,'de app naar voren halen ververst niets als de kopie net is opgehaald');
    await terug(6);
    eis(fouten,rondes===1,'is de kopie ouder dan vijf minuten, dan haalt hij alles opnieuw op');
    w.syncAlles=echteSync;
    eis(fouten,!/kon niet worden verstuurd/.test($(w,'dieren').textContent),'statusregel verdwijnt van het scherm');
    eis(fouten,w.verstuurdTekst()==='Je notitie en je waarneming zijn verstuurd',`melding na versturen (nu '${w.verstuurdTekst()}')`);
    // met verbinding gaat een waarneming direct naar Nhost en komt in de kopie
    w.document.querySelector('#dalle .drij[data-dier="quokka"]').click(); await sleep(50);
    const kopie=JSON.parse(w.localStorage.getItem('aus_cache_waarn')||'[]');
    eis(fouten,kopie.length===1&&kopie[0].id==='w1'&&kopie[0].dier==='quokka','waarneming met verbinding staat meteen in de kopie op de telefoon');
    $(w,'toast').querySelector('button').click(); await sleep(50);
    eis(fouten,JSON.parse(w.localStorage.getItem('aus_cache_waarn')||'[]').length===0&&mutaties[mutaties.length-1]==='delete_waarnemingen_by_pk','Ongedaan maken verwijdert bij Nhost');
    meld('6 okt: wachtrij en waarnemingen met verbinding',fouten); }
  // Gegeten: het bestekje naast de teller
  { const {w,fouten}=start('2026-10-06',{login:'groep'});
    klik(w,'btnDieren',fouten);
    const kang=w.document.querySelector('#dalle .drijwrap [data-dier="kangoeroe"]').closest('.drijwrap');
    eis(fouten,!!kang.querySelector('.deet'),'een eetbaar dier heeft een bestekknop');
    const koala=w.document.querySelector('#dalle .drijwrap [data-dier="koala"]').closest('.drijwrap');
    eis(fouten,!koala.querySelector('.deet'),'een niet-eetbaar dier heeft er geen');
    kang.querySelector('.deet').click(); await sleep(80);
    let q=JSON.parse(w.localStorage.getItem('aus_pending')||'[]');
    eis(fouten,q.length===1&&q[0].dier==='kangoeroe'&&q[0].hoe==='gegeten',`tik op het bestek noteert 'gegeten' (nu: ${JSON.stringify(q[0])})`);
    eis(fouten,/gegeten om/.test($(w,'toast').textContent),'de melding zegt gegeten, niet gespot');
    const kang2=w.document.querySelector('#dalle .drijwrap [data-dier="kangoeroe"]').closest('.drijwrap');
    eis(fouten,kang2.querySelector('.deet.aan')&&kang2.querySelector('.deet span').textContent==='1','de bestekknop kleurt op met het aantal erin');
    eis(fouten,!kang2.classList.contains('gespot')&&!kang2.querySelector('.dtel'),'gegeten telt niet mee als gespot');
    kang2.querySelector('.drij').click(); await sleep(80);
    q=JSON.parse(w.localStorage.getItem('aus_pending')||'[]');
    eis(fouten,q.length===2&&q[1].hoe==='gezien',`tik op de regel zelf noteert nog steeds 'gezien' (nu: ${q[1]&&q[1].hoe})`);
    const kang3=w.document.querySelector('#dalle .drijwrap [data-dier="kangoeroe"]').closest('.drijwrap');
    eis(fouten,kang3.classList.contains('gespot')&&kang3.querySelector('.dtel').textContent==='1'&&kang3.querySelector('.deet.aan'),'beide tellers staan naast elkaar');
    eis(fouten,/Op het bord kwamen er 1/.test($(w,'dieren').textContent)&&/1 soort die jullie ook in het wild zagen/.test($(w,'dieren').textContent),
      `'Tot nu toe' telt gegeten en allebei apart (nu: '${($(w,'dieren').textContent.match(/Jullie hebben[^]*?\./g)||[]).join(' ')}')`);
    eis(fouten,w.document.querySelector('#dieren .dlijst .wvork'),'in de lijst Gespot draagt een gegeten dier het bestekje');
    // zoeken en filteren blijven werken nu de rij een omhullende div heeft
    // de chip Gegeten verschijnt zodra er iets gegeten is en filtert op zijn eigen telling
    const chipGeg=()=>w.document.querySelector('.dchip[data-filter="gegeten"]');
    eis(fouten,chipGeg()&&/Gegeten1/.test(chipGeg().textContent),`chip Gegeten met eigen teller (nu: '${chipGeg()&&chipGeg().textContent}')`);
    chipGeg().click();
    let zicht2=[...w.document.querySelectorAll('#dalle .drijwrap')].filter(r=>!r.hidden).map(r=>r.querySelector('.drij').dataset.dier);
    eis(fouten,zicht2.join(',')==='kangoeroe',`filter Gegeten toont alleen wat gegeten is (nu ${zicht2.join(',')||'niets'})`);
    w.document.querySelector('.dchip[data-filter="gespot"]').click();
    zicht2=[...w.document.querySelectorAll('#dalle .drijwrap')].filter(r=>!r.hidden).map(r=>r.querySelector('.drij').dataset.dier);
    eis(fouten,zicht2.join(',')==='kangoeroe'&&!chipGeg().classList.contains('on'),'er staat er maar één tegelijk aan');
    w.document.querySelector('.dchip[data-filter="gespot"]').click();
    const dz=$(w,'dzoek'); dz.value='kangoeroe'; dz.dispatchEvent(new w.Event('input'));
    const zichtbaar=[...w.document.querySelectorAll('#dalle .drijwrap')].filter(r=>!r.hidden);
    eis(fouten,zichtbaar.length&&zichtbaar.every(r=>/kangoeroe/i.test(r.dataset.zoek)),`zoeken filtert de rijen (nu ${zichtbaar.length} zichtbaar)`);
    w.localStorage.setItem('aus_pending','[]');
    meld('6 okt: gegeten noteren met het bestekje',fouten); }
  { const {w,fouten}=start('2026-10-06');
    eis(fouten,$(w,'btnDieren').hidden===true,'tabblad Dieren verborgen zonder login');
    meld('6 okt anoniem: Dieren achter de login',fouten); }
  // Wie: de namenrij onder de filters. Ik voorop, dan de reizigers en daarna de gasten, op alfabet.
  // Aangevinkte mensen zijn 'wij': alleen hun waarnemingen tellen mee.
  { const lijst=[...REIZIGERS(false),{user_id:'u4',naam:'Bram',voorreis:false,reis:true,nareis:false,beheer:false,gast:true},
      {user_id:'u5',naam:'Aad',voorreis:false,reis:true,nareis:false,beheer:false,gast:true}];
    const {w,fouten}=start('2026-10-06',{login:'groep',lijst});
    const wn=(id,dier,wie,hoe,t)=>({id:id+dier+hoe,user_id:id,dier,dag:6,gezien_op:`2026-10-06T${t}:00+10:30`,wie,hoe});
    w.localStorage.setItem('aus_cache_waarn',JSON.stringify([
      wn('u1','koala','Test','gezien','08:00'),wn('u1','kangoeroe','Test','gegeten','19:00'),
      wn('u2','koala','Anna','gezien','08:05'),wn('u2','wombat','Anna','gezien','09:00'),
      wn('u3','emoe','Piet','gezien','10:00'),wn('u4','kangoeroe','Bram','gezien','11:00'),
      wn('u5','barramundi','Aad','gegeten','20:00')]));
    klik(w,'btnDieren',fouten);
    const rij=()=>w.document.querySelector('#dieren .dwierij');
    const namen=()=>[...w.document.querySelectorAll('#dieren .dchip[data-wie]')].map(c=>c.firstChild.textContent+' '+c.querySelector('span').textContent);
    const zicht=()=>[...w.document.querySelectorAll('#dalle .drijwrap')].filter(r=>!r.hidden).map(r=>r.querySelector('.drij').dataset.dier).join(',');
    const totNuToe=()=>{ const p=[...w.document.querySelectorAll('#dieren h2')].find(h=>h.textContent==='Tot nu toe'); return p?p.nextElementSibling.textContent:''; };
    const chipGespot=()=>w.document.querySelector('.dchip[data-filter="gespot"]');
    eis(fouten,!rij(),'zonder Gespot of Gegeten staat er geen namenrij');
    eis(fouten,/^Jullie hebben samen 5 dieren gespot, 4 verschillende soorten en 1 door jou\. Op het bord kwamen er 2, in 2 soorten, waarvan 1 soort die jullie ook in het wild zagen\.$/.test(totNuToe()),`zonder keuze telt de hele groep (nu: '${totNuToe()}')`);
    chipGespot().click();
    eis(fouten,!!rij()&&rij().previousElementSibling.classList.contains('dchips'),'met Gespot aan staat de namenrij onder de filterchips');
    eis(fouten,namen().join(' | ')==='Ik 1 | Anna 2 | Piet 1 | Aad 0 | Bram 1',`Ik voorop, dan de reizigers en de gasten op alfabet, met het aantal gespotte soorten (nu: ${namen().join(' | ')})`);
    eis(fouten,!w.document.querySelector('#dieren .dchip[data-wie].on'),'nog niemand aangevinkt');
    w.document.querySelector('.dchip[data-wie="u2"]').click();
    eis(fouten,JSON.stringify(JSON.parse(w.localStorage.getItem('aus_dwie')))==='["u2"]','de keuze staat op de telefoon');
    eis(fouten,w.document.querySelector('.dchip[data-wie="u2"]').classList.contains('on')&&w.document.querySelector('.dchip[data-wie="u2"] .chipx'),'aangevinkte naam licht op met een kruisje');
    eis(fouten,zicht()==='koala,wombat',`alleen wat Anna zag blijft over (nu ${zicht()||'niets'})`);
    eis(fouten,/Gespot2/.test(chipGespot().textContent)&&/Zoogdieren2\/15/.test(w.document.querySelector('.dchip[data-groep="zoogdier"]').textContent),'de chips tellen alleen Anna');
    eis(fouten,totNuToe()==='Anna heeft 2 dieren gespot, 2 verschillende soorten.',`Tot nu toe gaat over Anna (nu: '${totNuToe()}')`);
    const log=[...w.document.querySelectorAll('#dieren .dlijst li:not(.ddag) strong')].map(x=>x.textContent);
    eis(fouten,log.join(',')==='Wombat,Koala',`de lijst Gespot toont alleen Anna (nu: ${log.join(',')})`);
    w.document.querySelector('.dchip[data-wie="u1"]').click();
    eis(fouten,zicht()==='koala,wombat'&&w.document.querySelector('#dalle .drijwrap [data-dier="koala"]').closest('.drijwrap').querySelector('.dtel').textContent==='2','met Ik erbij telt de koala twee keer');
    eis(fouten,totNuToe()==='Jij en Anna hebben samen 3 dieren gespot, 2 verschillende soorten en 1 door jou. Op het bord kwamen er 1, in 1 soort.',`Tot nu toe over jou en Anna, in de volgorde van de rij (nu: '${totNuToe()}')`);
    // filter uit: alles terug naar de groep, de keuze blijft bewaard
    chipGespot().click();
    eis(fouten,!rij()&&zicht().split(',').length>=55&&/Jullie hebben samen 5 dieren/.test(totNuToe()),'Gespot uit: namenrij weg en weer de hele groep');
    chipGespot().click();
    eis(fouten,[...w.document.querySelectorAll('.dchip[data-wie].on')].map(c=>c.dataset.wie).join(',')==='u1,u2','Gespot weer aan: dezelfde mensen staan nog aangevinkt');
    // Gegeten: dezelfde rij, met het aantal gegeten soorten
    w.document.querySelector('.dchip[data-filter="gegeten"]').click();
    eis(fouten,namen().join(' | ')==='Ik 1 | Anna 0 | Piet 0 | Aad 1 | Bram 0',`onder Gegeten telt de rij gegeten soorten (nu: ${namen().join(' | ')})`);
    eis(fouten,zicht()==='kangoeroe','alleen wat jij en Anna aten blijft over');
    eis(fouten,/Zoogdieren1\/15/.test(w.document.querySelector('.dchip[data-groep="zoogdier"]').textContent)&&/Gegeten1/.test(w.document.querySelector('.dchip[data-filter="gegeten"]').textContent),'onder Gegeten tellen de groepschips gegeten soorten');
    const logKop=()=>[...w.document.querySelectorAll('#dieren h2')].find(h=>/^(Gespot|Gegeten)$/.test(h.textContent));
    const logNamen=()=>[...w.document.querySelectorAll('#dieren .dlijst li:not(.ddag) strong')].map(x=>x.textContent);
    eis(fouten,logKop()&&logKop().textContent==='Gegeten'&&logNamen().join(',')==='Kangoeroe',`de lijst onderaan heet nu Gegeten en toont alleen wat jij en Anna aten (nu: ${logNamen().join(',')})`);
    eis(fouten,w.document.querySelector('.dwierij').dataset.stand==='gegeten','de namenrij weet dat Gegeten aanstaat, voor de oranje rand');
    w.document.querySelector('.dchip[data-wie="u2"]').click();
    eis(fouten,totNuToe()==='Je hebt 1 dier gespot, 1 soort. Op het bord kreeg je er 1, in 1 soort.',`Tot nu toe over jou alleen (nu: '${totNuToe()}')`);
    // een tik op een dier noteert nog altijd onder je eigen naam
    w.document.querySelector('#dalle .drij[data-dier="kangoeroe"]').click(); await sleep(50);
    const q=JSON.parse(w.localStorage.getItem('aus_pending')||'[]');
    eis(fouten,q.length===1&&q[0].dier==='kangoeroe'&&q[0].wie==='Test','noteren gaat gewoon door onder je eigen naam');
    w.localStorage.setItem('aus_pending','[]');
    // iemand die niet meer in de rij staat valt uit de keuze
    w.localStorage.setItem('aus_dwie',JSON.stringify(['u9']));
    w.renderDieren();
    eis(fouten,!!rij()&&!w.document.querySelector('.dchip[data-wie].on')&&zicht()==='kangoeroe,barramundi',`een keuze zonder chip vervalt, zodat de lijst niet leeg blijft (nu ${zicht()})`);
    meld('6 okt: namenrij en wij-filter bij Dieren',fouten); }
  // Een aangezette groep schuift naar voren in de chiprij, en een lege lijst zegt welke filters dat doen
  { const {w,fouten}=start('2026-10-06',{login:'groep'});
    w.localStorage.setItem('aus_cache_waarn',JSON.stringify([{id:'a',user_id:'u2',dier:'koala',dag:6,gezien_op:'2026-10-06T08:00:00+10:30',wie:'Anna',hoe:'gezien'}]));
    klik(w,'btnDieren',fouten);
    const volgorde=()=>[...w.document.querySelectorAll('#dieren .dchips:not(.dwierij) .dchip')].map(c=>c.dataset.groep||c.dataset.filter);
    eis(fouten,volgorde().join(',')==='gespot,zoogdier,vogel,reptiel,klein,zee,zoetwater','zonder keuze staan de groepen in hun vaste volgorde');
    const logNamen=()=>[...w.document.querySelectorAll('#dieren .dlijst li:not(.ddag) strong')].map(x=>x.textContent);
    eis(fouten,logNamen().join(',')==='Koala','zonder filters staat de koala van Anna in de lijst onderaan');
    w.document.querySelector('.dchip[data-groep="zoogdier"]').click();
    eis(fouten,logNamen().join(',')==='Koala','met Zoogdieren aan blijft hij staan');
    w.document.querySelector('.dchip[data-groep="zee"]').click();
    eis(fouten,!logNamen().length&&/Niets met deze filters/.test($(w,'dieren').textContent),'met In zee aan is de lijst onderaan leeg, met een melding');
    eis(fouten,volgorde().join(',')==='gespot,zee,zoogdier,vogel,reptiel,klein,zoetwater',`de aangezette groep staat voorop, na de filterchips (nu: ${volgorde().join(',')})`);
    eis(fouten,w.document.querySelector('.dchip[data-groep="zee"]').classList.contains('on')&&[...w.document.querySelectorAll('#dalle .dgroep')].map(g=>g.id)[4]==='dg-zee','de lijst zelf houdt zijn volgorde');
    eis(fouten,$(w,'dleeg').hidden,'met alleen een groep is er niets leeg');
    w.document.querySelector('.dchip[data-filter="gespot"]').click();
    eis(fouten,!$(w,'dleeg').hidden&&$(w,'dleegtekst').textContent==='Geen dier gevonden met deze filters: In zee · Gespot.',`in zee is niets gespot, dus de melding noemt de filters (nu: '${$(w,'dleegtekst').textContent}')`);
    // elk getal in de chips houdt rekening met de andere filters: onder In zee is er niets gespot
    eis(fouten,/Gespot0/.test(w.document.querySelector('.dchip[data-filter="gespot"]').textContent)&&/Zoogdieren1\/15/.test(w.document.querySelector('.dchip[data-groep="zoogdier"]').textContent)&&/In zee0\//.test(w.document.querySelector('.dchip[data-groep="zee"]').textContent),'de chips Gespot en In zee tellen 0, Zoogdieren nog 1');
    eis(fouten,w.document.querySelector('.dchip[data-wie="u2"] span').textContent==='0','de naam Anna telt 0 binnen In zee');
    w.document.querySelector('.dchip[data-wie="u2"]').click();
    eis(fouten,$(w,'dleegtekst').textContent==='Geen dier gevonden met deze filters: In zee · Gespot · Anna.','ook een aangevinkte naam staat erbij');
    const dz=$(w,'dzoek'); dz.value='haai'; dz.dispatchEvent(new w.Event('input'));
    eis(fouten,/‘haai’ · In zee · Gespot · Anna/.test($(w,'dleegtekst').textContent),'en de zoekterm');
    klik(w,'dwis',fouten);
    eis(fouten,$(w,'dleeg').hidden&&$(w,'dzoek').value===''&&!w.document.querySelector('.dchip.on')&&[...w.document.querySelectorAll('#dalle .drijwrap')].filter(r=>!r.hidden).length>=55,'Filters wissen zet zoekterm, groep en Gespot uit');
    eis(fouten,JSON.stringify(JSON.parse(w.localStorage.getItem('aus_dwie')))==='["u2"]','de gekozen naam blijft bewaard voor de volgende keer');
    meld('6 okt: aangezette groep voorop en de lege melding',fouten); }
  // Prijzen: de regels uit dieren.js, de kast en de kaart. Alles over je eigen waarnemingen.
  { const {w,fouten}=start('2026-10-06',{login:'groep'});
    let nr=0;
    const wn=(dier,t,extra={})=>({id:'p'+(nr++),user_id:'u1',dier,dag:6,gezien_op:t,wie:'Test',hoe:'gezien',...extra});
    const T=(d,u='10:00')=>`2026-10-${String(d).padStart(2,'0')}T${u}:00+10:30`;
    const zet=lijst=>{ w.localStorage.setItem('aus_cache_waarn',JSON.stringify(lijst)); return w.verdiendePrijzen().map(x=>x.p.k); };
    klik(w,'btnDieren',fouten);
    eis(fouten,!zet([]).length&&![...w.document.querySelectorAll('#dieren h2')].some(h=>h.textContent==='Prijzenkast'),'zonder waarnemingen geen prijzen en geen kast');
    eis(fouten,zet([{...wn('koala',T(6)),user_id:'u2',wie:'Anna'}]).join()==='','waarnemingen van een ander tellen niet');
    eis(fouten,zet([wn('koala',T(6))]).join()==='eerste','de eerste eigen waarneming geeft G\'day!, en verder niets');
    // set: Tassie, met de datum van het laatste dier; de duivel om half tien geeft ook Nachtwacht
    zet([wn('wombat',T(6)),wn('wallaby',T(7,'09:00')),wn('tasmaanse-duivel',T(8,'21:30'))]);
    let gev=w.verdiendePrijzen();
    eis(fouten,gev.some(x=>x.p.k==='tassie'&&x.op===T(8,'21:30')),'Tassie na duivel, wombat en wallaby, verdiend op het moment van de laatste');
    eis(fouten,gev.some(x=>x.p.k==='nachtwacht'&&x.op===T(8,'21:30'))&&!gev.some(x=>x.p.k==='grote-vijf'),'half tien \'s avonds geeft Nachtwacht; twee van de grote vijf geeft niets');
    eis(fouten,!zet([wn('wombat',T(6),{hoe:'gegeten'}),wn('wallaby',T(7)),wn('tasmaanse-duivel',T(8))]).includes('tassie'),'een gegeten wombat telt niet voor Tassie');
    // tijd: de grenzen van Nachtwacht
    eis(fouten,zet([wn('possum',T(6,'18:59'))]).includes('nachtwacht')===false&&zet([wn('possum',T(6,'19:00'))]).includes('nachtwacht')&&zet([wn('possum',T(6,'05:29'))]).includes('nachtwacht')&&!zet([wn('possum',T(6,'05:30'))]).includes('nachtwacht'),'Nachtwacht loopt van 19.00 tot 05.30 uur');
    // keer: één emoe is genoeg, een gegeten emoe niet
    eis(fouten,!zet([wn('emoe',T(10),{hoe:'gegeten'})]).includes('emoe')&&zet([wn('emoe',T(10))]).includes('emoe'),'Emoe! bij de eerste gespotte emoe');
    // keuze met één: Zeldzaam bij de boomkangoeroe óf de quoll
    eis(fouten,!zet([wn('kangoeroe',T(10))]).includes('zeldzaam')&&zet([wn('quoll',T(10))]).includes('zeldzaam')&&zet([wn('boomkangoeroe',T(11))]).includes('zeldzaam'),'Geluksvogel bij een van de twee');
    // keuze: drie van vier papegaaien, en drie van tien gevaarlijke dieren
    eis(fouten,!zet([wn('galah',T(6)),wn('kaketoe',T(7))]).includes('papegaaien')&&zet([wn('galah',T(6)),wn('kaketoe',T(7)),wn('rosella',T(8)),wn('galah',T(9))]).includes('papegaaien'),'Herrie in de boom bij drie verschillende soorten, dubbele tellen niet');
    zet([wn('zoutwaterkrokodil',T(6)),wn('kasuaris',T(7)),wn('dingo',T(9))]); gev=w.verdiendePrijzen();
    eis(fouten,gev.some(x=>x.p.k==='levend'&&x.op===T(9)),'Gevaarlijk gezelschap bij drie van tien, op de datum van de derde');
    // groep: vier reptielen; skink en krokodil tellen mee, een gegeten krokodil niet
    eis(fouten,!zet([wn('skink',T(6)),wn('varaan',T(7)),wn('python',T(8))]).includes('koudbloedig')&&zet([wn('skink',T(6)),wn('varaan',T(7)),wn('python',T(8)),wn('zoutwaterkrokodil',T(9))]).includes('koudbloedig')&&!zet([wn('skink',T(6)),wn('varaan',T(7)),wn('python',T(8)),wn('zoutwaterkrokodil',T(9),{hoe:'gegeten'})]).includes('koudbloedig'),'Zonnekloppers bij vier gespotte reptielen');
    // soorten: vijftien, een ander dier met naam telt als soort, dezelfde naam maar één keer
    const soorten=['kangoeroe','wallaby','koala','wombat','quokka','emoe','galah','kaketoe','regenbooglori','ekster','ibis','pelikaan','skink','dolfijn'];
    const veertien=soorten.map((k,i)=>wn(k,T(6,String(8+i).padStart(2,'0')+':00')));
    eis(fouten,!zet(veertien).includes('lijstenmaker')&&!zet([...veertien,wn('overig',T(7),{opmerking:'Pauw'}),wn('overig',T(8),{opmerking:'pauw'})]).includes('lijstenmaker')===false,'Streepjes zetten bij vijftien soorten; een ander dier telt als soort, dezelfde naam één keer');
    eis(fouten,zet([...veertien,wn('overig',T(7),{opmerking:'Pauw'})]).includes('lijstenmaker'),'de vijftiende soort maakt hem compleet');
    // reeks: zeven dagen achter elkaar, een gat breekt de reeks
    const reeks=dagen=>dagen.map(d=>wn('ekster',T(d)));
    eis(fouten,!zet(reeks([6,7,8,9,10,12,13,14])).includes('reeks')&&zet(reeks([6,7,8,9,10,11,12])).includes('reeks'),'Week zonder missers vraagt zeven aaneengesloten dagen');
    eis(fouten,w.verdiendePrijzen().find(x=>x.p.k==='reeks').op===T(12),'verdiend op de zevende dag');
    // regios: zes van de zeven streken, via de indeling van de startpagina
    const per=w.dagenPerRegio(), streken=Object.keys(per);
    const perStreek=streken.map(r=>wn('ekster',T(per[r][0]),{dag:per[r][0]}));
    eis(fouten,streken.length===7&&!zet(perStreek.slice(0,5)).includes('australie')&&zet(perStreek.slice(0,6)).includes('australie'),`Kriskras bij zes van ${streken.length} streken`);
    // keuze gegeten: Bushtucker bij één van de drie van het bord, een gespotte telt niet
    eis(fouten,!zet([wn('kangoeroe',T(6)),wn('emoe',T(7)),wn('zoutwaterkrokodil',T(8))]).includes('bushtucker')&&zet([wn('emoe',T(7),{hoe:'gegeten'})]).includes('bushtucker'),'Bushtucker bij één gegeten van de drie');
    // keuze met twee: Kop boven water
    eis(fouten,!zet([wn('dolfijn',T(6))]).includes('walvis')&&zet([wn('dolfijn',T(6)),wn('zeehond',T(8))]).includes('walvis')&&w.verdiendePrijzen().find(x=>x.p.k==='walvis').op===T(8),'Kop boven water bij twee van drie, op de datum van de tweede');
    // herhaalbare prijzen (herhaal in dieren.js): hoe vaak je ze verdiende, en waar het opnieuw begint
    const keren=k=>(w.verdiendePrijzen().find(x=>x.p.k===k)||{keer:0}).keer;
    zet([wn('emoe',T(6)),wn('emoe',T(7)),wn('emoe',T(7,'16:42'))]);
    eis(fouten,keren('emoe')===3&&w.verdiendePrijzen().find(x=>x.p.k==='emoe').op===T(7,'16:42')&&w.verdiendePrijzen().find(x=>x.p.k==='emoe').eersteOp===T(6),'Emoe! telt elke emoe, met het eerste en het laatste tijdstip erbij');
    zet([wn('possum',T(6,'20:00')),wn('possum',T(6,'23:30')),wn('possum',T(7,'01:00')),wn('possum',T(9,'21:00'))]);
    eis(fouten,keren('nachtwacht')===2,'Nachtwacht telt per nacht: doorspotten na middernacht hoort bij de avond ervoor');
    zet(reeks([6,7,8,9,10,11,12,13]));
    const week1=keren('reeks');
    zet(reeks([6,7,8,9,10,11,12,13,14,15,16,17,18,19]));
    eis(fouten,week1===1&&keren('reeks')===2,'Week zonder missers telt elke volle week binnen dezelfde reeks');
    zet([wn('kangoeroe',T(6),{hoe:'gegeten'}),wn('emoe',T(7),{hoe:'gegeten'})]);
    eis(fouten,keren('bushtucker')===2,'Bushtucker telt door bij de tweede van het bord');
    zet([wn('quoll',T(6)),wn('boomkangoeroe',T(8)),wn('quoll',T(9))]);
    eis(fouten,keren('zeldzaam')===2,'Geluksvogel komt terug bij het andere dier, een tweede quoll telt niet');
    w.renderDieren(); w.document.querySelector('#dieren .pmed[data-prijs="zeldzaam"]').click(); await sleep(50);
    eis(fouten,w.document.querySelector('#sheet .psub').textContent==='2 van 2'&&w.document.querySelectorAll('#sheet .pdieren i').length===2,'en de kaart zegt dan 2 van 2, met allebei de dieren erop');
    klik(w,'shclose',fouten); await sleep(260);
    zet(perStreek); eis(fouten,keren('australie')===2,'Kriskras komt terug bij de zevende streek');
    zet([wn('koala',T(6)),wn('kangoeroe',T(7))]);
    eis(fouten,keren('eerste')===1&&keren('grote-vijf')===0,'een prijs zonder herhaal blijft bij een');
    // de kaart bij een herhaling: eigen tekst, de hoeveelste keer en de datum van de eerste
    zet([wn('emoe',T(6)),wn('emoe',T(8))]); w.renderDieren();
    w.document.querySelector('#dieren .pmed[data-prijs="emoe"]').click(); await sleep(50);
    const kh=w.document.querySelector('#sheet .sheet.prijs');
    eis(fouten,kh&&/Voor de 2e keer verdiend op donderdag 8 oktober/.test(kh.querySelector('.pdatum').textContent)&&/De eerste op dinsdag 6 oktober/.test(kh.querySelector('.pvaker').textContent),'de kaart zegt de hoeveelste keer, met de eerste keer eronder');
    eis(fouten,/Alweer een emoe! Nummer 2/.test(kh.querySelector('.ptekst').textContent)&&w.document.querySelector('#dieren .pmed[data-prijs="emoe"] .keer').textContent==='\u00d72','met de tekst voor een herhaling, en een telletje op de medaille');
    klik(w,'shclose',fouten); await sleep(260);
    // de stempelkaart: bij een korte keuzelijst staan de dieren die je nog mist er flauw bij
    zet([wn('emoe',T(6),{hoe:'gegeten'})]); w.renderDieren();
    w.document.querySelector('#dieren .pmed[data-prijs="bushtucker"]').click(); await sleep(50);
    const ks=w.document.querySelectorAll('#sheet .pdieren i');
    eis(fouten,ks.length===3&&[...ks].filter(i=>i.classList.contains('mist')).length===2&&!ks[1].classList.contains('mist'),'Bushtucker toont alle drie de dieren, met de twee die je mist als lege plek');
    eis(fouten,/nog niet gespot/.test(ks[0].getAttribute('title'))&&ks[1].getAttribute('title')==='Emoe','en de gemiste dieren zeggen dat ook in hun titel');
    klik(w,'shclose',fouten); await sleep(260);
    zet([wn('zoutwaterkrokodil',T(6)),wn('kasuaris',T(7)),wn('dingo',T(9))]); w.renderDieren();
    w.document.querySelector('#dieren .pmed[data-prijs="levend"]').click(); await sleep(50);
    eis(fouten,w.document.querySelectorAll('#sheet .pdieren i').length===3&&!w.document.querySelector('#sheet .pdieren i.mist'),'bij een lange lijst (Gevaarlijk gezelschap, tien dieren) alleen wat je zag');
    klik(w,'shclose',fouten); await sleep(260);
    // de stille herhaling: geen kaart meer, maar een regel in de melding onderin
    w.nuISO=()=>T(9,'16:42');
    zet([wn('emoe',T(6))]); w.renderDieren();
    w.document.querySelector('#dalle .drij[data-dier="emoe"]').click(); await sleep(450);
    eis(fouten,!$(w,'sheet')&&/^Alweer een emoe! Nummer 2, om 16\.42 uur/.test($(w,'toast').textContent)&&$(w,'toast').querySelector('button'),'de tweede emoe geeft geen kaart maar een melding, met Ongedaan maken');
    w.localStorage.setItem('aus_pending','[]');
    // de kast en de kaart
    zet([wn('wombat',T(6)),wn('wallaby',T(7,'09:00')),wn('tasmaanse-duivel',T(8,'21:30'))]);
    w.renderDieren();
    const medailles=[...w.document.querySelectorAll('#dieren .pmed')];
    eis(fouten,[...w.document.querySelectorAll('#dieren h2')].some(h=>h.textContent==='Prijzenkast')&&medailles.map(m=>m.dataset.prijs).join(',')==='tassie,nachtwacht,eerste'||medailles.map(m=>m.dataset.prijs).join(',')==='nachtwacht,tassie,eerste',`de kast toont de verdiende prijzen, nieuwste voorop (nu: ${medailles.map(m=>m.dataset.prijs).join(',')})`);
    eis(fouten,medailles.every(m=>m.querySelector('svg')&&m.querySelector('b').textContent&&!m.querySelector('small')),'elke medaille heeft een tekening en een naam, en geen datum eronder');
    eis(fouten,!$(w,'dieren').textContent.includes('De grote vijf')&&!$(w,'dieren').textContent.includes('nog'),'wat je niet hebt, staat nergens');
    let gedeeld=null; w.navigator.share=async d=>{ gedeeld=d; };
    medailles.find(m=>m.dataset.prijs==='tassie').click(); await sleep(50);
    const kaart=w.document.querySelector('#sheet .sheet.prijs');
    eis(fouten,kaart&&kaart.dataset.prijs==='tassie'&&kaart.querySelector('h3').textContent==='Tassie'&&kaart.querySelector('.psub').textContent==='3 van 3 gespot','tik op de medaille opent de kaart met naam en aantal');
    eis(fouten,kaart&&kaart.querySelectorAll('.pdieren i').length===3&&kaart.querySelector('.pring svg')&&/Verdiend op donderdag 8 oktober/.test(kaart.querySelector('.pdatum').textContent)&&kaart.style.getPropertyValue('--pk')==='#014747','met de drie dieren, de munt, de datum en de kleur van de prijs');
    $(w,'pdeel').click(); await sleep(50);
    eis(fouten,gedeeld&&/^Tassie, 3 van 3 gespot\./.test(gedeeld.text)&&/AustralieApp/.test(gedeeld.text),'Delen geeft naam, aantal, tekst en datum door');
    klik(w,'shclose',fouten); await sleep(260);
    eis(fouten,!$(w,'sheet'),'de kaart sluit');
    // het verdienmoment: twee prijzen tegelijk komen na elkaar
    w.nuISO=()=>T(9,'20:15');
    zet([wn('wombat',T(6)),wn('wallaby',T(7,'09:00'))]); w.renderDieren();
    w.document.querySelector('#dalle .drij[data-dier="tasmaanse-duivel"]').click(); await sleep(450);
    let k1=w.document.querySelector('#sheet .sheet.prijs');
    eis(fouten,k1&&k1.dataset.prijs==='nachtwacht','de tik die twee prijzen oplevert toont eerst de kaart die in dieren.js voorop staat');
    klik(w,'shclose',fouten); await sleep(450);
    let k2=w.document.querySelector('#sheet .sheet.prijs');
    eis(fouten,k2&&k2.dataset.prijs==='tassie','en na het sluiten de tweede');
    klik(w,'shclose',fouten); await sleep(260);
    eis(fouten,!$(w,'sheet')&&w.document.querySelectorAll('#dieren .pmed').length===3,'daarna staan ze in de kast');
    w.localStorage.setItem('aus_pending','[]');
    meld('6 okt: prijzen, kast en kaart',fouten); }
  // Boekingscodes per persoon: een regel met alleen een naam begint een blokje. Test (u1) is ingelogd;
  // hij krijgt zijn eigen SQ, de gedeelde Sawadee-code van boven de namen, en niets van Anna.
  { const {w,fouten}=start('2026-10-05',{login:'groep'});
    const codes=[...NOTITIES.filter(n=>n.dag>=0&&n.id!=='b'),{id:'b',user_id:'u1',dag:0,soort:'notitie',type:'ticket',
      tekst:'Boekingscodes\nSawadee: 1234567\nTest\nSQ: AAA111\nAnna en Piet\nSQ: BBB222\nJQ: CCC333',wie:'Test',created_at:'2026-09-01T10:00:00Z',updated_at:'2026-09-01T10:00:00Z'}];
    w.localStorage.setItem('aus_cache_all',JSON.stringify(codes));
    klik(w,'btnPrakt',fouten);
    const rij=n=>[...w.document.querySelectorAll('#prakt .row')].find(r=>r.textContent.includes(n));
    const code=n=>{ const r=rij(n), c=r&&r.querySelector('.r'); return c?c.textContent.trim():''; };
    eis(fouten,code('Singapore')==='AAA111',`eigen SQ-code uit het blokje Test (nu: '${code('Singapore')}')`);
    eis(fouten,code('Sawadee')==='1234567',`gedeelde code vóór de eerste naam geldt voor iedereen (nu: '${code('Sawadee')}')`);
    eis(fouten,code('Jetstar')==='',`code uit andermans blokje wordt niet getoond (nu: '${code('Jetstar')}')`);
    eis(fouten,!/Boekingscodes toevoegen/.test($(w,'prakt').textContent),'callout blijft weg zodra er een eigen code is');
    meld('5 okt: boekingscodes per persoon in de Ticket-notitie',fouten); }

  // Gast: doet mee met de waarnemingen en ziet de hele groepsreis, maar geen notities. De kopie op de
  // telefoon bevat hier wél notities (van vóór de gastvlag): de app hoort ze te negeren.
  { const {w,fouten}=start('2026-10-09',{login:'gast'});
    eis(fouten,$(w,'btnAlles').hidden===true&&$(w,'btnDieren').hidden===false,'gast heeft wel het tabblad Dieren, niet Notities');
    eis(fouten,kop(w)==='Dag 9van 29',`gast ziet de dag zelf (nu: '${kop(w)}')`);
    eis(fouten,!$(w,'notes-top')&&!$(w,'notes-rest')&&!$(w,'nadd'),'geen notitieblokken en geen knop Notitie toevoegen op de dag');
    eis(fouten,!/Vandaag nodig/.test($(w,'day').textContent)&&!/MONA-ticket 10\.30 uur/.test($(w,'day').textContent),'het ticket van dag 9 uit de kopie blijft weg');
    // dag 1: de vluchten zonder boekingscode
    klik(w,'btnIndex',fouten);
    const rij1=[...w.document.querySelectorAll('#results .idx button')].find(b=>b.dataset.n==='1'); if(rij1) rij1.click();
    eis(fouten,w.document.querySelector('#day .fcheck')&&!/Code /.test($(w,'day').textContent),'bij de vluchten van dag 1 staat geen boekingscode');
    klik(w,'btnPrakt',fouten);
    const p=$(w,'prakt');
    eis(fouten,!$(w,'verz')&&!/Verzekeringen/.test(p.textContent),'geen blok Verzekeringen');
    eis(fouten,!/Boekingscodes toevoegen/.test(p.textContent),'geen callout over boekingscodes');
    eis(fouten,![...p.querySelectorAll('.row .r')].some(c=>/ABC123|DEF456|1234567|na inloggen/.test(c.textContent)),'geen boekingscodes bij Vluchten en boekingen, ook niet \'na inloggen\'');
    const koppenP=[...p.querySelectorAll('h2')].map(h=>h.textContent);
    eis(fouten,koppenP.includes('Account')&&!koppenP.includes('Notities'),`kop boven het inlogblok heet Account (nu: ${koppenP.join(' | ')})`);
    const c=$(w,'acct').querySelector('.callout');
    eis(fouten,c&&!c.classList.contains('let')&&/Je reist mee met de groepsreis, als gast/.test(c.textContent)&&/tabblad Dieren/.test(c.textContent)&&!/tabblad Notities/.test(c.textContent)&&!/zie je niet/.test(c.textContent),`inlogblok noemt de gast, zonder te zeggen wat hij niet ziet (nu: '${c&&c.textContent.slice(0,140)}')`);
    // zoeken vindt geen notities, wel het programma en Praktisch
    klik(w,'btnIndex',fouten); zoek(w,fouten,'mona');
    eis(fouten,![...w.document.querySelectorAll('#results .src')].some(s=>/Notitie|Bijlage/.test(s.textContent)),'zoeken vindt de notities uit de kopie niet');
    zoek(w,fouten,'uluru');
    eis(fouten,!!w.document.querySelector('#results .hits'),'zoeken in het programma werkt gewoon');
    // Dieren werkt als voor iedereen
    klik(w,'btnDieren',fouten);
    eis(fouten,$(w,'dieren').style.display==='block'&&w.document.querySelectorAll('#dalle .drij').length>=55,'tabblad Dieren opent met de hele lijst');
    w.document.querySelector('#dalle .drij[data-dier="koala"]').click(); await sleep(50);
    const q=JSON.parse(w.localStorage.getItem('aus_pending')||'[]');
    eis(fouten,q.length===1&&q[0].tabel==='waarnemingen'&&q[0].dier==='koala'&&q[0].dag===9,`gast noteert een waarneming (nu ${JSON.stringify(q[0])})`);
    w.localStorage.setItem('aus_pending','[]');
    meld('9 okt: gast ziet de reis en de dieren, geen notities',fouten); }
  // Voorreis en nareis blijven voor een gast dicht, ook al doet Anna de voorreis. Zijn eigen vlag beslist.
  { const {w,fouten}=start('2026-09-25',{login:'gast',voorreis:VOORTEST});
    eis(fouten,kop(w)==='Rondreis Australië',`gast ziet vóór vertrek de startpagina (nu: '${kop(w)}')`);
    eis(fouten,!w.document.querySelector('.regio[data-go^="-"]'),'geen kaart Voorreis, ook al doet Anna de voorreis');
    eis(fouten,/Vertrek donderdag 1 oktober/.test($(w,'day').textContent),'gast telt af naar 1 oktober');
    eis(fouten,!$(w,'nadd'),'geen knop Notitie toevoegen op de startpagina');
    klik(w,'next',fouten); eis(fouten,kop(w)==='Dag 1van 29',`de pijl gaat naar dag 1 (nu: '${kop(w)}')`);
    klik(w,'prev',fouten); eis(fouten,kop(w)==='Rondreis Australië','en terug naar de startpagina, niet naar de voorreis');
    w.ga(-11);
    eis(fouten,kop(w)==='Rondreis Australië',`een voorreisdag rechtstreeks openen valt terug op de startpagina (nu: '${kop(w)}')`);
    klik(w,'btnIndex',fouten);
    eis(fouten,![...w.document.querySelectorAll('#results .idxkop h3')].some(h=>h.textContent==='Voorreis')&&!w.document.querySelector('#results .idxdeel'),'geen kop Voorreis en geen kop Groepsreis in Alle dagen');
    eis(fouten,/^1 t\/m 29 oktober/.test(w.document.querySelector('#hero .bsub').textContent),`de periode boven Alle dagen begint op 1 oktober (nu: '${w.document.querySelector('#hero .bsub').textContent}')`);
    zoek(w,fouten,'wombat');
    eis(fouten,![...w.document.querySelectorAll('#results .dn')].some(x=>x.textContent==='Voorreis'),'zoeken vindt het voorreisprogramma niet');
    meld('25 sep: gast, voorreis blijft verborgen',fouten); }
  // Met voorreis=true doet een gast de voorreis wel mee: dan ziet hij zijn dag, zonder notities
  { const {w,fouten}=start('2026-09-25',{login:'gast',voorreis:VOORTEST,lijst:REIZIGERS(true,false,true)});
    eis(fouten,/^Voorreis/.test(kop(w)),`gast met de vlag voorreis landt op zijn voorreisdag (nu: '${kop(w)}')`);
    eis(fouten,/geen programma/.test($(w,'day').textContent)&&!/notitie/i.test($(w,'day').textContent)&&!$(w,'nadd'),`een dag zonder programma is voor hem leeg, zonder notities of knop (nu: '${$(w,'day').textContent.trim().slice(0,60)}')`);
    klik(w,'prev',fouten); while(!$(w,'prev').disabled) klik(w,'prev',fouten);
    const kaart=w.document.querySelector('.regio[data-go^="-"] .rwie');
    eis(fouten,kaart&&kaart.textContent==='Anna en Test','de kaart Voorreis staat er dan wel, met zijn naam erop');
    const knopVoor=w.document.querySelector('.regio[data-go^="-"]'); if(knopVoor) knopVoor.click();
    eis(fouten,$(w,'title').textContent==='Vrijdag 25 september','via de kaart Voorreis kom je op de voorreisdag van vandaag');
    // 20 sep heeft programma; Morgen wijst naar 21 sep, een dag zonder programma
    w.ga(-11);
    const tmw=w.document.querySelector('#day .tomorrow .tt');
    eis(fouten,$(w,'title').textContent==='Port Douglas en het rif'&&tmw&&tmw.textContent==='Geen programma',`Morgen naar een lege voorreisdag zegt 'Geen programma' in plaats van een aantal notities (nu: '${tmw&&tmw.textContent}')`);
    eis(fouten,!$(w,'notes-top')&&!$(w,'notes-rest')&&!$(w,'nadd'),'ook een voorreisdag met programma heeft voor een gast geen notitieblokken');
    meld('25 sep: gast met de vlag voorreis',fouten); }
  // Synchroniseren slaat de notities over en haalt een oude kopie van de telefoon
  { const {w,fouten}=start('2026-10-09',{login:'gast',online:true});
    const queries=[];
    w.gql=async q=>{ const t=(q.match(/\{\s*(\w+)/)||[])[1]; queries.push(t);
      if(t==='reizigers') return {reizigers:REIZIGERS(false,false,true)};
      if(t==='waarnemingen') return {waarnemingen:[]};
      if(t==='dagitems') return {dagitems:[]};
      throw new Error('onverwachte query '+q.slice(0,40)); };
    eis(fouten,!!w.localStorage.getItem('aus_cache_all')&&!!w.localStorage.getItem('aus_cache_9'),'de kopie van de notities staat er nog, van vóór de gastvlag');
    const items=await w.syncAlles(true);
    eis(fouten,Array.isArray(items)&&items.length===0,'synchroniseren geeft voor een gast een lege lijst terug');
    eis(fouten,queries.join(',')==='reizigers,waarnemingen',`alleen de reizigerslijst en de waarnemingen worden opgehaald, geen notities (nu: ${queries.join(',')})`);
    eis(fouten,!w.localStorage.getItem('aus_cache_all')&&!w.localStorage.getItem('aus_cache_9')&&!w.localStorage.getItem('aus_cache_0'),'de oude kopie van de notities is van de telefoon');
    eis(fouten,!!w.localStorage.getItem('aus_cache_reizigers')&&!!w.localStorage.getItem('aus_cache_waarn')&&!!w.localStorage.getItem('aus_sync'),'de reizigerslijst, de waarnemingen en het synchronisatiemoment blijven staan');
    meld('9 okt: synchroniseren slaat de notities over voor een gast',fouten); }
  // Een gast logt voor het eerst in: de app haalt eerst de lijst op en tekent dan pas
  { const {w,fouten}=start('2026-10-09',{online:true});
    w.fetch=async url=>{ if(/signin\/email-password/.test(url)) return {ok:true,status:200,json:async()=>({session:{accessToken:'t',refreshToken:'r',accessTokenExpiresIn:900,user:{id:'u1',displayName:'Test',email:'test@example.org'}}})}; throw new TypeError('Failed to fetch'); };
    const queries=[];
    w.gql=async q=>{ const t=(q.match(/\{\s*(\w+)/)||[])[1]; queries.push(t);
      if(t==='reizigers') return {reizigers:REIZIGERS(false,false,true)};
      if(t==='waarnemingen') return {waarnemingen:[]};
      throw new Error('onverwachte query '+q.slice(0,40)); };
    klik(w,'btnPrakt',fouten);
    eis(fouten,$(w,'btnAlles').hidden===true,'anoniem is er geen tabblad Notities');
    $(w,'lemail').value='test@example.org'; $(w,'lpw').value='wombat-2026';
    $(w,'lform').dispatchEvent(new w.Event('submit',{cancelable:true})); await sleep(300);
    eis(fouten,$(w,'btnAlles').hidden===true&&$(w,'btnDieren').hidden===false,'na het inloggen als gast is het tabblad Notities er niet, Dieren wel');
    eis(fouten,!$(w,'verz')&&!/Boekingscodes toevoegen/.test($(w,'prakt').textContent),'Praktisch is meteen zonder de notitieblokken getekend');
    eis(fouten,queries.includes('reizigers')&&!queries.includes('dagitems'),`de lijst is opgehaald, de notities niet (nu: ${queries.join(',')})`);
    eis(fouten,/als gast/.test($(w,'acct').textContent),'inlogblok noemt de gast');
    klik(w,'btnToday',fouten);
    eis(fouten,kop(w)==='Dag 9van 29'&&!$(w,'notes-top')&&!$(w,'nadd'),'de dag staat er zonder notitieblokken');
    meld('9 okt: gast logt voor het eerst in',fouten); }

  // ============================================================
  // Uitgave 216: notities meteen uit de kopie, en een wachtrij die veilig is bij gelijktijdige handelingen.
  // De tests sturen Nhost zelf: elke insert wacht op een belofte die de test op het juiste moment vrijgeeft.
  // ============================================================
  // Een bestuurbare belofte. De catch voorkomt een 'unhandled rejection' als de test hem laat mislukken
  // voordat de app erop wacht.
  const stuur=()=>{ let res,rej; const p=new Promise((a,b)=>{res=a;rej=b}); p.catch(()=>{}); return {p,res,rej}; };
  // Nhost nagebootst voor de wachtrij: elke insert wacht op zijn eigen belofte, met als sleutel de tekst
  // van de notitie of het dier van de waarneming. verstuurd: wat er in welke volgorde is aangeboden.
  const nepNhost=w=>{
    const houd={}, verstuurd=[], teksten=[];
    const van=k=>(houd[k]=houd[k]||stuur());
    w.gql=async(q,v)=>{
      if(/^query/.test(q)&&/waarnemingen/.test(q)) return {waarnemingen:[]};
      if(/insert_dagitems_one/.test(q)){ const k=v.o.tekst; verstuurd.push(k); teksten.push(v.o.tekst); await van(k).p; return {insert_dagitems_one:{id:'n'+verstuurd.length,created_at:'2026-10-06T00:00:00Z'}}; }
      if(/insert_waarnemingen_one/.test(q)){ const k=v.o.dier; verstuurd.push(k); await van(k).p; return {insert_waarnemingen_one:{id:'w'+verstuurd.length}}; }
      throw new Error('onverwachte query '+q.slice(0,40));
    };
    // faal laat de lopende insert mislukken en zet een verse belofte klaar voor de volgende poging
    return {verstuurd,teksten,vrij:k=>van(k).res(),faal:(k,tijdelijk)=>{ const e=new Error('geweigerd: '+k); if(tijdelijk) e.tijdelijk=true; const h=van(k); delete houd[k]; h.rej(e); }};
  };
  const wachtrij=w=>JSON.parse(w.localStorage.getItem('aus_pending')||'[]');
  const notitie=(uid,tekst,dag=6)=>({uid,dag,tekst,wie:'Test',type:'notitie'});
  const waarneming=(uid,dier,t='08:00')=>({uid,tabel:'waarnemingen',dier,dag:6,gezien_op:`2026-10-06T${t}:00+10:30`,wie:'Test',hoe:'gezien'});
  // localStorage laten mislukken voor de wachtrij alleen; de rest van de opslag blijft werken
  const breekOpslag=w=>{ const orig=w.Storage.prototype.setItem;
    w.Storage.prototype.setItem=function(k,v){ if(k==='aus_pending') throw new Error('QuotaExceededError'); return orig.call(this,k,v); };
    return ()=>{ w.Storage.prototype.setItem=orig; }; };

  // 1. Notities meteen uit de kopie, terwijl de synchronisatie nog op Nhost wacht
  { const {w,fouten}=start('2026-10-05',{login:'groep',online:true});
    const hou=stuur(); let rondes=0;
    w.syncAlles=()=>{ rondes++; return hou.p; };   // Nhost antwoordt voorlopig niet
    w.localStorage.setItem('aus_pending',JSON.stringify([notitie('q1','Wachtende notitie',5)]));
    klik(w,'btnAlles',fouten); await sleep(20);
    const box=$(w,'alles'), items=()=>[...box.querySelectorAll('#nlijst .nitem')];
    eis(fouten,rondes===1,'Notities start één synchronisatie');
    eis(fouten,!/Laden…/.test(box.textContent)&&!!$(w,'nzoek'),'geen Laden… meer: het zoekveld en de lijst staan er meteen');
    eis(fouten,items().length===5&&/Wachtende notitie/.test(box.textContent)&&/wacht op verbinding/.test(box.textContent),`de vier notities uit de kopie plus de wachtende staan er direct (nu ${items().length})`);
    eis(fouten,/^Bijwerken…/.test($(w,'nstatus').textContent)&&/1 notitie wacht op verbinding/.test($(w,'nstatus').textContent),`status zegt Bijwerken… en telt de wachtende (nu: '${$(w,'nstatus').textContent}')`);
    await sleep(20);   // het tellen van de bijlagen is een aparte stap
    eis(fouten,w.document.querySelector('#hero .bsub')&&w.document.querySelector('#hero .bsub').textContent==='4 notities · 0 van 1 bijlagen offline',`banner telt de kopie (nu: '${w.document.querySelector('#hero .bsub')?.textContent}')`);
    // zoeken en filteren terwijl de synchronisatie nog loopt
    const zv=$(w,'nzoek'); zv.value='allianz'; zv.dispatchEvent(new w.Event('input')); await sleep(200);
    eis(fouten,items().length===1&&/12345678/.test(items()[0].textContent),'zoeken werkt terwijl de synchronisatie wacht');
    const chip=()=>box.querySelector('#typefilter .chip[data-f="verzekering"]');
    eis(fouten,!!chip(),'de typechip Verzekering staat er');
    if(chip()) chip().click();
    eis(fouten,chip()&&chip().classList.contains('on'),'de chip gaat aan');
    // even naar de dagpagina en terug: het scherm wordt opnieuw opgebouwd, met een nieuwe ronde
    // (het antwoord van de eerste ronde mag daar straks niet meer overheen schrijven)
    eis(fouten,rondes===1,'nog steeds één ronde');
    // Nhost antwoordt: één notitie gewijzigd en één erbij
    const vers=NOTITIES.filter(n=>n.dag>=0).map(n=>n.id==='e'?{...n,tekst:'Allianz, polis 99999999. Alarmcentrale +31 20 123 4567.'}:n)
      .concat([{id:'f',user_id:'u2',dag:7,soort:'notitie',type:'notitie',tekst:'Allianz-brochure meegenomen',wie:'Anna',created_at:'2026-09-05T10:00:00Z',updated_at:'2026-09-05T10:00:00Z'}]);
    w.localStorage.setItem('aus_sync',JSON.stringify({tijd:'2026-10-05T08:00:00+11:00'}));
    w.localStorage.setItem('aus_cache_all',JSON.stringify(vers));   // zoals de echte syncAlles doet
    hou.res(vers); await sleep(50);
    eis(fouten,$(w,'nzoek')===zv&&zv.value==='allianz'&&w._notZoek==='allianz','het zoekveld blijft staan, met de zoektekst');
    eis(fouten,chip()&&chip().classList.contains('on'),'de chip blijft aan');
    eis(fouten,items().length===1&&/99999999/.test(items()[0].textContent),`de lijst toont de verse tekst binnen zoekterm en filter (nu ${items().length}: '${items()[0]?.textContent.slice(0,60)}')`);
    eis(fouten,/^Bijgewerkt /.test($(w,'nstatus').textContent)&&/1 notitie wacht/.test($(w,'nstatus').textContent),`status zegt Bijgewerkt (nu: '${$(w,'nstatus').textContent}')`);
    eis(fouten,w.document.querySelector('#hero .bsub').textContent==='5 notities · 0 van 1 bijlagen offline',`banner telt de verse gegevens (nu: '${w.document.querySelector('#hero .bsub').textContent}')`);
    if(chip()) chip().click();
    eis(fouten,items().length===2&&/brochure/.test(box.textContent),'chip uit: de nieuwe notitie staat er ook');
    // Kon niet bijwerken: de kopie blijft staan en de status zegt niet Bijgewerkt
    w.syncAlles=async()=>null;
    w.renderAlles(); await sleep(30);
    eis(fouten,items().length===2&&/^Kon niet bijwerken, laatst opgeslagen versie/.test($(w,'nstatus').textContent),`bij een netwerkfout blijft alles zichtbaar met een passende status (nu: '${$(w,'nstatus').textContent}')`);
    // Een traag antwoord van een vervangen ronde bouwt het scherm niet opnieuw op
    const traag=stuur(); w.syncAlles=()=>traag.p;
    w.renderAlles(); await sleep(10);
    w.syncAlles=async()=>vers; w.renderAlles(); await sleep(30);
    const statusNa=$(w,'nstatus').textContent;
    eis(fouten,/^Bijgewerkt /.test(statusNa),'de nieuwere ronde zet de status');
    klik(w,'btnToday',fouten);
    traag.res([]); await sleep(30);
    eis(fouten,$(w,'nstatus').textContent===statusNa&&items().length===2,'het late antwoord van de oude ronde overschrijft niets');
    eis(fouten,$(w,'day').style.display==='block'&&$(w,'alles').style.display==='none','en brengt je niet naar een ander tabblad');
    meld('5 okt: Notities meteen uit de kopie, synchronisatie komt erachteraan',fouten); }

  // 2. Een item toevoegen terwijl een ander wordt verstuurd: het verdwijnt niet
  { const {w,fouten}=start('2026-10-06',{login:'groep',online:true});
    const nh=nepNhost(w);
    w.localStorage.setItem('aus_pending',JSON.stringify([notitie('a','A')]));
    const p=w.flushPending(); await sleep(10);
    eis(fouten,nh.verstuurd.join()==='A','A is onderweg');
    const r=w.pendingAdd(notitie(undefined,'C'));
    eis(fouten,r.ok&&typeof r.uid==='string'&&wachtrij(w).some(q=>q.uid===r.uid),'C komt met een eigen uid in de wachtrij terwijl A onderweg is');
    nh.vrij('A'); await sleep(10);
    eis(fouten,wachtrij(w).length===1&&wachtrij(w)[0].uid===r.uid,`na de bevestiging van A staat alleen C nog in de rij (nu: ${wachtrij(w).map(q=>q.tekst).join()||'leeg'})`);
    eis(fouten,nh.verstuurd.join()==='A,C','C gaat in een vervolgronde meteen mee');
    nh.vrij('C'); const n=await p;
    eis(fouten,n===2&&wachtrij(w).length===0,'beide zijn verstuurd en de rij is leeg');
    // hetzelfde met een waarneming erbij tijdens het versturen van een notitie
    w.localStorage.setItem('aus_pending',JSON.stringify([notitie('b','B')]));
    const p2=w.flushPending(); await sleep(10);
    klik(w,'btnDieren',fouten);
    Object.defineProperty(w.navigator,'onLine',{value:false,configurable:true});   // het bereik valt net weg
    w.document.querySelector('#dalle .drij[data-dier="koala"]').click(); await sleep(50);
    eis(fouten,wachtrij(w).length===2&&wachtrij(w)[1].dier==='koala','een waarneming tijdens het versturen komt gewoon in de gedeelde rij');
    Object.defineProperty(w.navigator,'onLine',{value:true,configurable:true});
    nh.vrij('B'); await sleep(10);
    eis(fouten,wachtrij(w).length===1&&wachtrij(w)[0].dier==='koala','de koala blijft na de bevestiging van B');
    nh.vrij('koala'); await p2; await sleep(20);
    eis(fouten,wachtrij(w).length===0&&nh.verstuurd.slice(-2).join()==='B,koala','en gaat daarna zelf weg');
    meld('6 okt: toevoegen tijdens het versturen',fouten); }

  // 3. Twee gelijktijdige flushPending-aanroepen sturen hetzelfde item één keer
  { const {w,fouten}=start('2026-10-06',{login:'groep',online:true});
    const nh=nepNhost(w);
    w.localStorage.setItem('aus_pending',JSON.stringify([notitie('a','A'),waarneming('e','emoe')]));
    const p1=w.flushPending(), p2=w.flushPending();
    eis(fouten,p1===p2,'de tweede aanroep sluit aan op de lopende ronde');
    await sleep(10);
    eis(fouten,nh.verstuurd.join()==='A','tijdens het wachten is A één keer aangeboden');
    nh.vrij('A'); await sleep(10); nh.vrij('emoe');
    const [n1,n2]=await Promise.all([p1,p2]);
    eis(fouten,n1===2&&n2===2&&nh.verstuurd.join()==='A,emoe'&&wachtrij(w).length===0,`elk item is precies één keer verstuurd en beide aanroepen krijgen dezelfde uitkomst (nu: ${n1}, ${n2}, ${nh.verstuurd.join()})`);
    // na een fout is de blokkering weg en start een nieuwe ronde gewoon
    w.localStorage.setItem('aus_pending',JSON.stringify([notitie('b','B')]));
    const p3=w.flushPending(); await sleep(10); nh.faal('B',true); const n3=await p3;
    eis(fouten,n3===0&&wachtrij(w).length===1&&!wachtrij(w)[0].fout,'een tijdelijke fout laat B zonder reden staan');
    const p4=w.flushPending();
    eis(fouten,p4!==p3,'daarna start een nieuwe ronde');
    await sleep(10); nh.faal('B',false); const n4=await p4;
    eis(fouten,n4===0&&wachtrij(w).length===1&&/geweigerd/.test(wachtrij(w)[0].fout),'een blijvende fout zet de reden erbij en laat het item staan');
    // Ongedaan maken van een waarneming die intussen is verstuurd
    w.localStorage.setItem('aus_pending','[]');
    Object.defineProperty(w.navigator,'onLine',{value:false,configurable:true});
    klik(w,'btnDieren',fouten);
    w.document.querySelector('#dalle .drij[data-dier="wombat"]').click(); await sleep(450);
    klik(w,'shclose',fouten); await sleep(260);   // de kaart van de eerste prijs
    eis(fouten,wachtrij(w).length===1&&wachtrij(w)[0].dier==='wombat'&&!!wachtrij(w)[0].uid,'de waarneming wacht, met uid');
    Object.defineProperty(w.navigator,'onLine',{value:true,configurable:true});
    nh.vrij('wombat'); await w.flushPending(); await sleep(20);
    eis(fouten,wachtrij(w).length===0,'de verbinding kwam terug: de wombat is verstuurd');
    const t=$(w,'toast'); if(t&&t.querySelector('button')) t.querySelector('button').click(); await sleep(20);
    eis(fouten,/intussen verstuurd/.test($(w,'toast').textContent),`Ongedaan maken zegt dat hij al weg is (nu: '${$(w,'toast').textContent}')`);
    meld('6 okt: twee gelijktijdige rondes en de blokkering daarna',fouten); }

  // 4. Een later wachtend item weggooien of bewerken terwijl een eerder item wordt verstuurd
  { const {w,fouten}=start('2026-10-06',{login:'groep',online:true});
    const nh=nepNhost(w);
    // weggooien: B (notitie) en de kangoeroe (waarneming, via het scherm Dieren) gaan niet meer mee
    w.localStorage.setItem('aus_pending',JSON.stringify([notitie('a','A'),notitie('b','B'),waarneming('k','kangoeroe'),notitie('c','C')]));
    const p=w.flushPending(); await sleep(10);
    eis(fouten,nh.verstuurd.join()==='A','A is onderweg, de rest wacht');
    const rd=w.pendingDelete('b');
    eis(fouten,rd.ok&&!wachtrij(w).some(q=>q.uid==='b'),'B is weggegooid terwijl A onderweg is');
    klik(w,'btnDieren',fouten);
    const weg=[...w.document.querySelectorAll('#dieren .dweg')].find(b=>b.dataset.weg==='wachtk');
    eis(fouten,!!weg,'de wachtende kangoeroe staat in de lijst Gespot met een kruisje');
    if(weg) weg.click(); await sleep(20);
    eis(fouten,!wachtrij(w).some(q=>q.uid==='k')&&wachtrij(w).some(q=>q.uid==='a')&&wachtrij(w).some(q=>q.uid==='c'),`de kangoeroe is weg, A en C staan er nog (nu: ${wachtrij(w).map(q=>q.uid).join()})`);
    // bewerken: C krijgt nieuwe tekst vóór zijn beurt
    const ru=w.pendingUpdate('c',{tekst:'C, aangepast',fout:undefined});
    eis(fouten,ru.ok&&wachtrij(w).find(q=>q.uid==='c').tekst==='C, aangepast','C is bewerkt terwijl A onderweg is');
    nh.vrij('A'); await sleep(10); nh.vrij('C, aangepast'); const n=await p;
    eis(fouten,n===2&&nh.verstuurd.join()==='A,C, aangepast'&&wachtrij(w).length===0,`B en de kangoeroe zijn overgeslagen, C ging met de nieuwe tekst (nu: ${nh.verstuurd.join(' | ')})`);
    meld('6 okt: weggooien en bewerken tijdens het versturen van een ander item',fouten); }

  // 5. Het item dat daadwerkelijk onderweg is, is op slot, ook vanuit een al geopend bewerkvenster
  { const {w,fouten}=start('2026-10-06',{login:'groep',online:true});
    const nh=nepNhost(w);
    w.syncAlles=async()=>NOTITIES.filter(x=>x.dag>=0);   // Notities zonder echte synchronisatie
    w.localStorage.setItem('aus_pending',JSON.stringify([notitie('a','A'),waarneming('e','emoe')]));
    // het bewerkvenster van A staat al open vóór het versturen begint
    klik(w,'btnAlles',fouten); await sleep(30);
    const knop=$(w,'alles').querySelector('[data-edit="wachta"]');
    eis(fouten,!!knop&&knop.dataset.uid==='a','de wachtende notitie heeft een bewerkknop met haar uid');
    if(knop) knop.click(); await sleep(20);
    eis(fouten,!!$(w,'sheet')&&$(w,'shtext').value==='A','het bewerkvenster staat open');
    $(w,'shtext').value='A, tijdens het versturen gewijzigd';
    const p=w.flushPending(); await sleep(10);
    eis(fouten,nh.verstuurd.join()==='A','A is onderweg');
    $(w,'shsave').click(); await sleep(20);
    eis(fouten,!!$(w,'sheet')&&$(w,'shtext').value==='A, tijdens het versturen gewijzigd','opslaan wordt geweigerd: het venster blijft open met de getypte tekst');
    eis(fouten,/wordt nu verstuurd/.test($(w,'shstat').textContent),`met de reden in het venster (nu: '${$(w,'shstat').textContent}')`);
    eis(fouten,wachtrij(w).find(q=>q.uid==='a').tekst==='A','de wachtrij is niet aangepast');
    // rechtstreeks: bewerken en weggooien van A weigeren, van de emoe (nog niet aan de beurt) niet
    const ru=w.pendingUpdate('a',{tekst:'A2'}), rd=w.pendingDelete('a');
    eis(fouten,!ru.ok&&/wordt nu verstuurd/.test(ru.reden)&&!rd.ok&&/wordt nu verstuurd/.test(rd.reden),'pendingUpdate en pendingDelete weigeren het onderweg zijnde item');
    eis(fouten,wachtrij(w).length===2&&wachtrij(w)[0].tekst==='A','en er is niets veranderd of verdwenen');
    klik(w,'shclose',fouten); await sleep(260);
    // via de knoppen op het scherm: bewerken en weggooien geven een melding, geen venster
    w.renderAlles(); await sleep(30);
    eis(fouten,/wordt verstuurd…/.test($(w,'alles').textContent),'de kaart zegt dat de notitie wordt verstuurd');
    $(w,'alles').querySelector('[data-edit="wachta"]').click(); await sleep(20);
    eis(fouten,!$(w,'sheet')&&/wordt nu verstuurd/.test($(w,'toast').textContent),'bewerken vanaf de kaart opent geen venster maar geeft de melding');
    $(w,'alles').querySelector('[data-del="wachta"]').click(); await sleep(30);
    eis(fouten,wachtrij(w).length===2&&/wordt nu verstuurd/.test($(w,'toast').textContent),'weggooien vanaf de kaart wordt geweigerd');
    // dezelfde blokkering voor een waarneming die onderweg is
    nh.vrij('A'); await sleep(10);
    eis(fouten,nh.verstuurd.join()==='A,emoe'&&wachtrij(w).length===1,'A is weg, de emoe is nu onderweg');
    klik(w,'btnDieren',fouten);
    const weg=[...w.document.querySelectorAll('#dieren .dweg')].find(b=>b.dataset.weg==='wachte');
    eis(fouten,!!weg&&/wordt verstuurd…/.test(weg.closest('li').textContent),'de lijst Gespot zegt dat de emoe wordt verstuurd');
    if(weg) weg.click(); await sleep(20);
    eis(fouten,wachtrij(w).length===1&&/wordt nu verstuurd/.test($(w,'toast').textContent),'weghalen van de onderweg zijnde waarneming wordt geweigerd');
    nh.vrij('emoe'); const n=await p; await sleep(20);
    eis(fouten,n===2&&wachtrij(w).length===0&&nh.teksten.join()==='A','na afloop is alles verstuurd, A met zijn oorspronkelijke tekst, en de rij is leeg');
    const ru2=w.pendingUpdate('a',{tekst:'A3'});
    eis(fouten,!ru2.ok&&/niet meer in de wachtrij/.test(ru2.reden),'een bewerking na het versturen zegt dat het item weg is');
    meld('6 okt: het onderweg zijnde item staat op slot',fouten); }

  // 6. Een oude wachtrij zonder uid's: inhoud blijft, uid's blijven gelijk na opnieuw uitlezen en herstart
  { const {w,fouten}=start('2026-10-06',{login:'groep'});
    const oud=[{dag:6,tekst:'Oud zonder tabel',wie:'Test',type:'notitie'},
      {tabel:'waarnemingen',dier:'emoe',dag:6,gezien_op:'2026-10-06T08:00:00+10:30',wie:'Test',fout:"field 'dag' not found"},
      {tabel:'dagitems',dag:6,tekst:'Tweede notitie',wie:'Test',type:'tip'}];
    w.localStorage.setItem('aus_pending',JSON.stringify(oud));
    const q1=w.pending(), uids=q1.map(p=>p.uid);
    eis(fouten,q1.length===3&&uids.every(u=>typeof u==='string'&&u.length>=8)&&new Set(uids).size===3,`elk item krijgt een eigen uid (nu: ${uids.join()})`);
    eis(fouten,q1[0].tekst==='Oud zonder tabel'&&!q1[0].tabel&&q1[1].dier==='emoe'&&q1[1].fout==="field 'dag' not found"&&q1[1].gezien_op===oud[1].gezien_op&&q1[2].type==='tip','inhoud, soort, tijdstip, volgorde en foutmelding blijven');
    eis(fouten,wachtrij(w).map(p=>p.uid).join()===uids.join(),'de uid\'s zijn meteen teruggeschreven');
    eis(fouten,w.pending().map(p=>p.uid).join()===uids.join(),'opnieuw uitlezen geeft dezelfde uid\'s');
    // herstart: een nieuw venster met dezelfde opslag
    const {w:w2,fouten:f2}=start('2026-10-06',{login:'groep'});
    w2.localStorage.setItem('aus_pending',w.localStorage.getItem('aus_pending'));
    eis(fouten,w2.pending().map(p=>p.uid).join()===uids.join(),'na een herstart dezelfde uid\'s');
    fouten.push(...f2);
    // op de dagpagina: het kruisje bij de tweede notitie haalt precies die weg
    klik(w,'btnToday',fouten);
    const kaarten=()=>[...$(w,'day').querySelectorAll('.nitem')].filter(li=>/wacht op verbinding|versturen mislukt/.test(li.textContent));
    eis(fouten,kaarten().length===2&&kaarten().every(li=>li.querySelector('[data-del]')?.dataset.uid),`beide wachtende notities staan op dag 6 met hun uid op de knop (nu ${kaarten().length})`);
    const tweede=kaarten().find(li=>/Tweede notitie/.test(li.textContent));
    if(tweede) tweede.querySelector('[data-del]').click(); await sleep(20);
    eis(fouten,wachtrij(w).length===2&&wachtrij(w).map(p=>p.uid).join()===[uids[0],uids[1]].join()&&/Oud zonder tabel/.test($(w,'day').textContent)&&!/Tweede notitie/.test($(w,'day').textContent),'precies de tweede notitie is weg, de emoe en de eerste blijven');
    // bewerken via de dagpagina landt op de juiste uid
    kaarten()[0].querySelector('[data-edit]').click(); await sleep(20);
    eis(fouten,!!$(w,'sheet')&&$(w,'shtext').value==='Oud zonder tabel','het bewerkvenster opent met de juiste notitie');
    $(w,'shtext').value='Oud, aangepast'; $(w,'shsave').click(); await sleep(260);
    eis(fouten,!$(w,'sheet')&&wachtrij(w)[0].tekst==='Oud, aangepast'&&wachtrij(w)[0].uid===uids[0]&&wachtrij(w)[1].dier==='emoe','de bewerking landt op het juiste item, de uid blijft');
    // de migratie kan niet worden weggeschreven: items blijven zichtbaar, uid's stabiel, versturen begint niet
    const {w:w3,fouten:f3}=start('2026-10-06',{login:'groep',online:true});
    w3.localStorage.setItem('aus_pending',JSON.stringify(oud));
    const herstel=breekOpslag(w3);
    const nh=nepNhost(w3);
    const a=w3.pending(), b=w3.pending();
    eis(fouten,a.length===3&&a.map(p=>p.uid).join()===b.map(p=>p.uid).join()&&a.every(p=>p.uid),'zonder geslaagde schrijfactie blijven de items zichtbaar, met dezelfde uid\'s');
    eis(fouten,wachtrij(w3).length===3&&!wachtrij(w3).some(p=>p.uid),'de oude items staan onveranderd in de opslag');
    const n=await w3.flushPending();
    eis(fouten,n===0&&nh.verstuurd.length===0&&wachtrij(w3).length===3,'versturen begint niet met uid\'s die niet zijn bewaard');
    klik(w3,'btnToday',fouten);
    eis(fouten,/Oud zonder tabel/.test($(w3,'day').textContent)&&/Tweede notitie/.test($(w3,'day').textContent),'de notities staan gewoon op de dagpagina');
    // de opslag herstelt: dezelfde uid's worden bewaard en versturen kan
    herstel();
    const c=w3.pending();
    eis(fouten,c.map(p=>p.uid).join()===a.map(p=>p.uid).join()&&wachtrij(w3).map(p=>p.uid).join()===a.map(p=>p.uid).join(),'zodra schrijven weer lukt, worden dezelfde uid\'s bewaard');
    ['Oud zonder tabel','emoe','Tweede notitie'].forEach(k=>nh.vrij(k));
    const n2=await w3.flushPending(); await sleep(20);
    eis(fouten,n2===3&&wachtrij(w3).length===0,`daarna gaat alles in één ronde weg (nu ${n2})`);
    fouten.push(...f3);
    meld('6 okt: oude wachtrij zonder uid\'s',fouten); }

  // 7. Mislukte opslag van de wachtrij: geen onterechte succesmelding en geen verloren tekst
  { const {w,fouten}=start('2026-10-06',{login:'groep'});   // zonder verbinding
    const herstel=breekOpslag(w);
    // een notitie via het formulier op de dagpagina
    klik(w,'nadd',fouten); await sleep(20);
    $(w,'shtext').value='Belangrijke tekst die niet verloren mag gaan'; $(w,'shsave').click(); await sleep(50);
    eis(fouten,!!$(w,'sheet')&&$(w,'shtext').value==='Belangrijke tekst die niet verloren mag gaan','het formulier blijft open met de tekst');
    eis(fouten,/Bewaren op de telefoon is mislukt/.test($(w,'shstat').textContent),`met een begrijpelijke foutmelding (nu: '${$(w,'shstat').textContent}')`);
    eis(fouten,!$(w,'toast')||!/Bewaard op de telefoon/.test($(w,'toast').textContent),'geen melding Bewaard op de telefoon');
    eis(fouten,wachtrij(w).length===0,'de wachtrij is niet aangeraakt');
    klik(w,'shclose',fouten); await sleep(260);
    // een waarneming
    klik(w,'btnDieren',fouten);
    w.document.querySelector('#dalle .drij[data-dier="koala"]').click(); await sleep(450);
    const t=$(w,'toast');
    eis(fouten,t&&/Koala: niet genoteerd/.test(t.textContent)&&/Bewaren op de telefoon is mislukt/.test(t.textContent)&&!t.querySelector('button'),`de waarneming meldt dat ze niet is bewaard, zonder Ongedaan maken (nu: '${t&&t.textContent}')`);
    eis(fouten,!w.document.querySelector('#sheet .sheet.prijs'),'en er komt geen prijskaart');
    eis(fouten,!w.document.querySelector('#dalle .drij[data-dier="koala"]').closest('.drijwrap').classList.contains('gespot')&&!$(w,'dieren').querySelector('.dlijst'),'de koala telt nergens als gespot');
    // bewerken, weggooien en opruimen van een bestaand wachtend item
    herstel();
    w.localStorage.setItem('aus_pending',JSON.stringify([notitie('q1','Blijft staan')]));
    const herstel2=breekOpslag(w);
    const ru=w.pendingUpdate('q1',{tekst:'Anders'});
    eis(fouten,!ru.ok&&/Bewaren op de telefoon is mislukt/.test(ru.reden)&&wachtrij(w)[0].tekst==='Blijft staan','bewerken meldt de mislukte opslag en laat de tekst zoals hij was');
    const rd=w.pendingDelete('q1');
    eis(fouten,!rd.ok&&/Weghalen is mislukt/.test(rd.reden)&&wachtrij(w).length===1,'weggooien meldt de mislukte opslag en laat het item staan');
    klik(w,'btnToday',fouten);
    const kn=[...$(w,'day').querySelectorAll('[data-edit]')].find(b=>b.dataset.uid==='q1'); if(kn) kn.click(); await sleep(20);
    $(w,'shtext').value='Anders, via het venster'; $(w,'shsave').click(); await sleep(20);
    eis(fouten,!!$(w,'sheet')&&$(w,'shtext').value==='Anders, via het venster'&&/Bewaren op de telefoon is mislukt/.test($(w,'shstat').textContent),'ook via het bewerkvenster blijft de tekst staan met de reden');
    klik(w,'shclose',fouten); await sleep(260);
    herstel2();
    meld('6 okt: mislukte opslag van de wachtrij, zonder verbinding',fouten); }
  { const {w,fouten}=start('2026-10-06',{login:'groep',online:true});
    // verstuurd, maar het opruimen mislukt: geen 'klaar', geen tweede verzending in deze sessie
    const nh=nepNhost(w);
    w.localStorage.setItem('aus_pending',JSON.stringify([notitie('q1','Eén keer')]));
    const herstel=breekOpslag(w);
    nh.vrij('Eén keer');
    const n=await w.flushPending();
    eis(fouten,n===1&&nh.verstuurd.length===1&&wachtrij(w).length===1,'verstuurd, maar het item staat nog in de rij omdat schrijven mislukte');
    eis(fouten,/verstuurd, maar de wachtrij op de telefoon kon niet worden bijgewerkt/.test(w.verstuurdTekst()),`de melding zegt dat het niet is afgerond (nu: '${w.verstuurdTekst()}')`);
    const n2=await w.flushPending();
    eis(fouten,n2===0&&nh.verstuurd.length===1&&wachtrij(w).length===1,'een volgende ronde in dezelfde sessie verstuurt het niet nog eens');
    herstel();
    const n3=await w.flushPending();
    eis(fouten,n3===0&&nh.verstuurd.length===1&&wachtrij(w).length===0,'zodra schrijven weer lukt, wordt het opgeruimd zonder nieuwe verzending');
    meld('6 okt: opruimen na verzending mislukt',fouten); }
  // Regressie: een verstuurd maar niet opgeruimd item is op slot. Anders zou een bewerking bij het
  // opruimen verdwijnen terwijl Nhost de oude tekst houdt, en zou weghalen hier voor 'weg' doorgaan.
  { const {w,fouten}=start('2026-10-06',{login:'groep',online:true});
    const nh=nepNhost(w);
    w.syncAlles=async()=>NOTITIES.filter(x=>x.dag>=0);
    w.localStorage.setItem('aus_pending',JSON.stringify([notitie('q1','Oorspronkelijk'),waarneming('e','emoe')]));
    // het bewerkvenster staat al open vóór het versturen begint
    klik(w,'btnAlles',fouten); await sleep(30);
    $(w,'alles').querySelector('[data-edit="wachtq1"]').click(); await sleep(20);
    eis(fouten,!!$(w,'sheet')&&$(w,'shtext').value==='Oorspronkelijk','het bewerkvenster staat open');
    const herstel=breekOpslag(w);
    nh.vrij('Oorspronkelijk'); nh.vrij('emoe');
    const n=await w.flushPending(); await sleep(20);
    eis(fouten,n===2&&nh.verstuurd.join()==='Oorspronkelijk,emoe'&&wachtrij(w).length===2,`beide zijn verstuurd maar staan nog in de rij, want opruimen mislukte (nu ${n}, ${wachtrij(w).length} in de rij)`);
    // opslaan vanuit het al geopende venster wordt geweigerd; de getypte tekst blijft staan
    $(w,'shtext').value='Gewijzigd na verzending'; $(w,'shsave').click(); await sleep(20);
    eis(fouten,!!$(w,'sheet')&&$(w,'shtext').value==='Gewijzigd na verzending'&&/al verstuurd/.test($(w,'shstat').textContent),`opslaan wordt geweigerd met de reden in het venster (nu: '${$(w,'shstat').textContent}')`);
    eis(fouten,wachtrij(w)[0].tekst==='Oorspronkelijk','de wachtrij houdt de verstuurde tekst');
    klik(w,'shclose',fouten); await sleep(260);
    // rechtstreeks: bewerken en weghalen weigeren voor de notitie én de waarneming
    const ru=w.pendingUpdate('q1',{tekst:'Anders'}), rd=w.pendingDelete('q1'), rw=w.pendingDelete('e');
    eis(fouten,!ru.ok&&/notitie is al verstuurd/.test(ru.reden)&&!rd.ok&&/notitie is al verstuurd/.test(rd.reden)&&!rw.ok&&/waarneming is al verstuurd/.test(rw.reden),`pendingUpdate en pendingDelete weigeren beide items met de reden (nu: '${ru.reden}' / '${rw.reden}')`);
    eis(fouten,wachtrij(w).length===2&&wachtrij(w)[0].tekst==='Oorspronkelijk','en er is niets veranderd of verdwenen');
    // via het scherm: de kaart zegt het, bewerken opent geen venster, weghalen doet niets
    w.renderAlles(); await sleep(30);
    eis(fouten,/verstuurd, wachtrij nog niet bijgewerkt/.test($(w,'alles').textContent),'de kaart zegt dat de notitie al is verstuurd');
    $(w,'alles').querySelector('[data-edit="wachtq1"]').click(); await sleep(20);
    eis(fouten,!$(w,'sheet')&&/al verstuurd/.test($(w,'toast').textContent),'bewerken vanaf de kaart opent geen venster maar geeft de melding');
    $(w,'alles').querySelector('[data-del="wachtq1"]').click(); await sleep(30);
    eis(fouten,wachtrij(w).length===2&&/al verstuurd/.test($(w,'toast').textContent),'weghalen vanaf de kaart wordt geweigerd');
    klik(w,'btnDieren',fouten);
    const weg=[...w.document.querySelectorAll('#dieren .dweg')].find(b=>b.dataset.weg==='wachte');
    eis(fouten,!!weg&&/verstuurd, wachtrij nog niet bijgewerkt/.test(weg.closest('li').textContent),'de lijst Gespot zegt het ook');
    if(weg) weg.click(); await sleep(20);
    eis(fouten,wachtrij(w).length===2&&/waarneming is al verstuurd/.test($(w,'toast').textContent),'weghalen van de waarneming wordt geweigerd');
    // de opslag herstelt: opruimen zonder nieuwe verzending, daarna is het item echt weg
    herstel();
    const n2=await w.flushPending(); await sleep(20);
    eis(fouten,n2===0&&nh.verstuurd.length===2&&wachtrij(w).length===0,`zodra schrijven weer lukt, worden beide opgeruimd zonder nieuwe verzending (nu ${n2}, ${nh.verstuurd.length} verstuurd, ${wachtrij(w).length} in de rij)`);
    eis(fouten,/niet meer in de wachtrij/.test(w.pendingUpdate('q1',{tekst:'x'}).reden),'daarna zegt bewerken dat het item weg is');
    meld('6 okt: verstuurd maar niet opgeruimd item staat op slot',fouten); }

  const fout=uitkomst.filter(([,f])=>f.length).length;
  console.log(fout?`\n${fout} van de ${uitkomst.length} scenario's met fouten.`:`\ngeen fouten in ${uitkomst.length} scenario's.`);
  process.exit(fout?1:0);
})();
