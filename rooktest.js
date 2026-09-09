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

// Een paar notities zoals ze uit Nhost komen: één voorreisnotitie (maakt u1 voorreiziger),
// een Ticket-notitie met boekingscodes, en een bijlage van iemand anders zonder afzender.
const NOTITIES=[
  {id:'a',user_id:'u1',dag:-13,soort:'notitie',type:'notitie',tekst:'Eerste voorreisdag',wie:'Test',created_at:'2026-09-01T10:00:00Z',updated_at:'2026-09-01T10:00:00Z'},
  {id:'b',user_id:'u1',dag:0,soort:'notitie',type:'ticket',tekst:'Boekingscodes\nSQ: ABC123\nJQ: DEF456\nSawadee: 1234567',wie:'Test',created_at:'2026-09-01T10:00:00Z',updated_at:'2026-09-01T10:00:00Z'},
  {id:'c',user_id:'u2',dag:5,soort:'bestand',type:'reservering',tekst:null,wie:null,file_id:'f1',naam:'ticket.pdf',mime:'application/pdf',grootte:12345,created_at:'2026-09-02T10:00:00Z',updated_at:'2026-09-02T10:00:00Z'},
  {id:'d',user_id:'u1',dag:9,soort:'notitie',type:'ticket',tekst:'MONA-ticket 10.30 uur',wie:'Test',created_at:'2026-09-03T10:00:00Z',updated_at:'2026-09-03T10:00:00Z'},
  {id:'e',user_id:'u2',dag:0,soort:'notitie',type:'verzekering',tekst:'Allianz, polis 12345678. Alarmcentrale +31 20 123 4567.',wie:'Anna',created_at:'2026-09-04T10:00:00Z',updated_at:'2026-09-04T10:00:00Z'}
];

// Start de app op een datum. login: 'voor' (voorreiziger), 'groep' (ingelogd, geen voorreis) of null.
// online: navigator.onLine. Het netwerk zelf faalt altijd, zodat ook de herhaalpogingen doorlopen.
// voorreis: JavaScript dat voorreis.js vervangt (VOORTEST), anders het echte bestand.
function start(datum,{login=null,online=false,voorreis=null}={}){
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
  for(const [login,voorreis] of [[null,null],['groep',null],['voor',null],[null,VOORTEST],['groep',VOORTEST],['voor',VOORTEST]]){
    for(const datum of datums){
      const {w,fouten}=start(datum,{login,voorreis});
      const naam=`${datum} ${login==null?'anoniem':login==='voor'?'ingelogd, voorreiziger':'ingelogd, groep'}${voorreis?', voorreis met programma':''}`;
      if(login) eis(fouten,$(w,'btnAlles').hidden===false,'tabblad Notities zichtbaar na herstel uit de kopie');
      blader(w,fouten);
      klik(w,'btnIndex',fouten); zoek(w,fouten,'uluru'); zoek(w,fouten,'& bar'); zoek(w,fouten,'sq');
      klik(w,'btnPrakt',fouten);
      if(login){ klik(w,'btnAlles',fouten); klik(w,'btnDieren',fouten); klik(w,'btnToday',fouten); const n=$(w,'nadd'); if(n) n.click(); const s=$(w,'shclose'); if(s) s.click(); }
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

  // Dieren: waarnemingen
  { const {w,fouten}=start('2026-10-06',{login:'groep'});
    eis(fouten,$(w,'btnDieren').hidden===false,'tabblad Dieren zichtbaar na inloggen');
    klik(w,'btnDieren',fouten);
    eis(fouten,$(w,'dieren').style.display==='block','tabblad Dieren opent');
    const knoppen=w.document.querySelectorAll('#dieren button.dier');
    eis(fouten,knoppen.length>=70,`raster met dieren (nu ${knoppen.length} knoppen)`);
    const koala=w.document.querySelector('#dieren button.dier[data-dier="koala"]');
    eis(fouten,!!koala,'knop Koala staat in het raster');
    if(koala) koala.click();
    await sleep(50);
    const q=JSON.parse(w.localStorage.getItem('aus_pending')||'[]');
    eis(fouten,q.length===1&&q[0].tabel==='waarnemingen'&&q[0].dier==='koala'&&q[0].dag===6&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d[+-]\d\d:\d\d$/.test(q[0].gezien_op),`waarneming zonder verbinding in de wachtrij met tabel, dag en tijd (nu ${JSON.stringify(q[0])})`);
    eis(fouten,/Vandaag gespot/.test($(w,'dieren').textContent)&&/Koala/.test($(w,'dieren').textContent)&&/1 waarneming wacht op verbinding/.test($(w,'dieren').textContent),'waarneming staat onder Vandaag gespot met de statusregel');
    eis(fouten,koala&&koala.classList.contains('mijn')||w.document.querySelector('#dieren button.dier[data-dier="koala"] .dtel'),'teller op de knop na de waarneming');
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
    $(w,'shdier').value='pauw'; $(w,'shdier').dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter'})); await sleep(300);
    let q2=JSON.parse(w.localStorage.getItem('aus_pending')||'[]');
    eis(fouten,q2.length===1&&q2[0].dier==='overig'&&q2[0].opmerking==='Pauw','getypte naam wordt genoteerd, met een hoofdletter');
    eis(fouten,!$(w,'sheet'),'blad sluit na het noteren');
    klik(w,'dander',fouten); $(w,'shdier').value='Wombat met jong'; $(w,'shsave').click(); await sleep(300);
    q2=JSON.parse(w.localStorage.getItem('aus_pending')||'[]');
    eis(fouten,q2.length===2&&q2[1].opmerking==='Wombat met jong','tweede naam via de knop Gespot');
    eis(fouten,/Wombat met jong/.test($(w,'dieren').textContent)&&/Pauw/.test($(w,'dieren').textContent),'andere dieren staan met hun naam in de lijst');
    // twee weghalen, dan is de wachtrij leeg
    const weg2=w.document.querySelector('#dieren .dweg'); if(weg2) weg2.click(); await sleep(50);
    // weghalen van een wachtende waarneming
    const weg=w.document.querySelector('#dieren .dweg'); if(weg) weg.click(); await sleep(50);
    eis(fouten,JSON.parse(w.localStorage.getItem('aus_pending')||'[]').length===0,'eigen wachtende waarneming weghalen');
    // de teller op de dagpagina
    w.localStorage.setItem('aus_pending',JSON.stringify([{tabel:'waarnemingen',dier:'vogelbekdier',dag:6,gezien_op:'2026-10-06T09:10:00+10:30',wie:'Test'}]));
    klik(w,'btnToday',fouten); klik(w,'btnIndex',fouten);
    const rij=[...w.document.querySelectorAll('#results .idx button')].find(b=>b.dataset.n==='6'); if(rij) rij.click();
    eis(fouten,!/gespot/.test($(w,'day').textContent),'dagpagina toont geen tellers');
    klik(w,'btnDieren',fouten);
    const lijst=w.document.querySelector('#dieren .dlijst');
    eis(fouten,lijst&&/Vogelbekdier/.test(lijst.textContent)&&!/\u00AD/.test(lijst.textContent),'naam in de lijst zonder zacht afbreekstreepje');
    eis(fouten,/\u00AD/.test(w.document.querySelector('#dieren button.dier[data-dier="vogelbekdier"] .dn').textContent),'naam op de knop mét zacht afbreekstreepje');
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
    klik(w,'btnDieren',fouten);
    eis(fouten,/1 waarneming kon niet worden verstuurd/.test($(w,'dieren').textContent)&&/versturen mislukt: field 'dag'/.test($(w,'dieren').textContent),'mislukte waarneming staat er net als een mislukte notitie, met de reden');
    const n=await w.flushPending();
    eis(fouten,n===2&&mutaties.join(',')==='insert_dagitems_one,insert_waarnemingen_one',`wachtrij stuurt elk item naar zijn eigen tabel, ook na een eerdere fout (nu ${n}, ${mutaties.join(',')})`);
    eis(fouten,JSON.parse(w.localStorage.getItem('aus_pending')||'[]').length===0,'wachtrij leeg na versturen');
    eis(fouten,opgehaald===1,'na het versturen is de kopie ververst');
    eis(fouten,!/kon niet worden verstuurd/.test($(w,'dieren').textContent),'statusregel verdwijnt van het scherm');
    eis(fouten,w.verstuurdTekst()==='Je notitie en je waarneming zijn verstuurd',`melding na versturen (nu '${w.verstuurdTekst()}')`);
    // met verbinding gaat een waarneming direct naar Nhost en komt in de kopie
    w.document.querySelector('#dieren button.dier[data-dier="quokka"]').click(); await sleep(50);
    const kopie=JSON.parse(w.localStorage.getItem('aus_cache_waarn')||'[]');
    eis(fouten,kopie.length===1&&kopie[0].id==='w1'&&kopie[0].dier==='quokka','waarneming met verbinding staat meteen in de kopie op de telefoon');
    $(w,'toast').querySelector('button').click(); await sleep(50);
    eis(fouten,JSON.parse(w.localStorage.getItem('aus_cache_waarn')||'[]').length===0&&mutaties[mutaties.length-1]==='delete_waarnemingen_by_pk','Ongedaan maken verwijdert bij Nhost');
    meld('6 okt: wachtrij en waarnemingen met verbinding',fouten); }
  { const {w,fouten}=start('2026-10-06');
    eis(fouten,$(w,'btnDieren').hidden===true,'tabblad Dieren verborgen zonder login');
    meld('6 okt anoniem: Dieren achter de login',fouten); }

  const fout=uitkomst.filter(([,f])=>f.length).length;
  console.log(fout?`\n${fout} van de ${uitkomst.length} scenario's met fouten.`:`\ngeen fouten in ${uitkomst.length} scenario's.`);
  process.exit(fout?1:0);
})();
