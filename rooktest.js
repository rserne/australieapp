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
const code=lees('reis.js')+'\n;\n'+lees('app.js');
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
// online: navigator.onLine; het netwerk zelf faalt altijd, zodat ook de herhaalpogingen doorlopen.
function start(datum,{login=null,online=false}={}){
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
  for(const login of [null,'groep','voor']){
    for(const datum of datums){
      const {w,fouten}=start(datum,{login});
      const naam=`${datum} ${login==null?'anoniem':login==='voor'?'ingelogd, voorreiziger':'ingelogd, groep'}`;
      if(login) eis(fouten,$(w,'btnAlles').hidden===false,'tabblad Notities zichtbaar na herstel uit de kopie');
      blader(w,fouten);
      klik(w,'btnIndex',fouten); zoek(w,fouten,'uluru'); zoek(w,fouten,'& bar'); zoek(w,fouten,'sq');
      klik(w,'btnPrakt',fouten);
      if(login){ klik(w,'btnAlles',fouten); klik(w,'btnToday',fouten); const n=$(w,'nadd'); if(n) n.click(); const s=$(w,'shclose'); if(s) s.click(); }
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
    eis(fouten,$(w,'verz')&&/Na inloggen/.test($(w,'verz').textContent),'zonder login toont Verzekeringen alleen een uitleg');
    meld('5 okt anoniem: Verzekeringen achter de login',fouten); }
  { const {w,fouten}=start('2026-10-05',{login:'groep',online:true});
    await sleep(4200);   // drie mislukte vernieuwpogingen: 0 + 1,2 + 2,4 s
    eis(fouten,$(w,'btnAlles').hidden===false,'na mislukte vernieuwing blijft de sessie uit de kopie staan');
    meld('5 okt: online zonder werkend netwerk, herhaalpogingen',fouten); }

  const fout=uitkomst.filter(([,f])=>f.length).length;
  console.log(fout?`\n${fout} van de ${uitkomst.length} scenario's met fouten.`:`\ngeen fouten in ${uitkomst.length} scenario's.`);
  process.exit(fout?1:0);
})();
