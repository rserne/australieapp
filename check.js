#!/usr/bin/env node
// Controleert reis.js en voorreis.js vóór je een nieuwe versie online zet:  node check.js
// Sluit af met code 1 als er iets mis is, zodat je het ook in een git pre-commit hook kunt zetten.
const fs=require('fs'), vm=require('vm');
const NAMEN=['START','DAYS','PACK','EXC','HOTELGEO','RDATA','CHECKIN','TONE','REGION','BOEKINGEN','NOOD','BAGAGE','VOORREIS','NAREIS','BUITEN','SOS'];
// const-declaraties komen niet op het context-object terecht. Daarom halen we ze expliciet terug
const data=vm.runInNewContext(fs.readFileSync(__dirname+'/reis.js','utf8')+`;({${NAMEN.join(',')}})`,{});
const {START,DAYS,PACK,EXC,HOTELGEO,RDATA,CHECKIN,TONE,REGION,BOEKINGEN,NOOD,BAGAGE,VOORREIS,NAREIS,BUITEN,SOS}=data;

const fouten=[], waarschuwingen=[];
const fout=m=>fouten.push(m), waarschuw=m=>waarschuwingen.push(m);

// Programma van de voorreis: hetzelfde dagobject als DAYS, op datum. Het bestand hoort er altijd te zijn
// (de service worker haalt het op bij het installeren). Zonder programma is de lijst leeg.
let VOORDAGEN=[];
if(!fs.existsSync(__dirname+'/voorreis.js')) fout('voorreis.js ontbreekt (mag leeg zijn: const VOORDAGEN=[];)');
else{
  VOORDAGEN=vm.runInNewContext(fs.readFileSync(__dirname+'/voorreis.js','utf8')+';VOORDAGEN',{});
  if(!Array.isArray(VOORDAGEN)){ fout('voorreis.js: VOORDAGEN moet een lijst zijn'); VOORDAGEN=[]; }
}
// Datum van een intern dagnummer (voorreis -VOORREIS…-1, groepsreis 1…29, nareis 30…) als 2026-09-20
const isoVan=t=>`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
const datumVan=n=>{ const t=new Date(START); t.setDate(t.getDate()+(n<0?n:n-1)); return isoVan(t); };
const voorDatums=Array.from({length:VOORREIS},(_,i)=>datumVan(-VOORREIS+i));
const naDatums=Array.from({length:NAREIS},(_,i)=>datumVan(30+i));
// EXC en PACK verwijzen naar een dag met een nummer (1–29) of de datum van een voorreis- of nareisdag
const dagRef=x=>(Number.isInteger(x)&&x>=1&&x<=29)||voorDatums.includes(x)||naDatums.includes(x);
const alleDagen=[...DAYS,...VOORDAGEN];
const KINDS=['vlucht','bus','auto','excursie','vrij'];

// Eén dag controleren. Buiten de groepsreis (voorreis.js) zijn regio, dagtype en tijdzone niet verplicht.
function controleerDag(d,w,buiten){
  if(buiten){
    if('r' in d) waarschuw(`${w}: r wordt buiten de groepsreis niet gebruikt (vaste voorreisfoto), haal het weg`);
    if('k' in d&&!KINDS.includes(d.k)) fout(`${w}: onbekend dagtype '${d.k}'`);
  }else{
    if(!TONE[d.r]||!REGION[d.r]) fout(`${w}: onbekende regio '${d.r}'`);
    if(!KINDS.includes(d.k)) fout(`${w}: onbekend dagtype '${d.k}'`);
    if(!('tz' in d)) fout(`${w}: tz ontbreekt (null is toegestaan voor een vliegdag)`);
  }
  if(!d.t||!d.p) fout(`${w}: titel of plaats ontbreekt`);
  if(!Array.isArray(d.body)||!d.body.length) fout(`${w}: body ontbreekt`);
  // Australië loopt van UTC+8 (Perth) tot UTC+11 (zomertijd in het zuidoosten), in halve uren
  if('tz' in d&&d.tz!==null&&(typeof d.tz!=='number'||d.tz<8||d.tz>11||(d.tz*2)%1!==0)) fout(`${w}: tz '${d.tz}' is geen Australische tijdzone (8 t/m 11, of null)`);
  ['temp','wash','note','tip','rnote','shuttle'].forEach(k=>{ if(k in d&&typeof d[k]!=='string') fout(`${w}: ${k} moet tekst zijn`); });
  if('prac' in d&&(!Array.isArray(d.prac)||!d.prac.every(x=>typeof x==='string'))) fout(`${w}: prac moet een lijst met teksten zijn`);
  if(d.h&&!HOTELGEO[d.h]) waarschuw(`${w}: hotel '${d.h}' heeft geen coördinaten in HOTELGEO (link zoekt op naam)`);
  (d.fl||[]).forEach(f=>{
    if(f.length!==6) fout(`${w}: vlucht ${f[0]} heeft ${f.length} velden, verwacht 6`);
    if(!CHECKIN[String(f[0]).split(' ')[0]]) waarschuw(`${w}: vlucht ${f[0]} heeft geen maatschappij in CHECKIN`);
  });
  (d.rest||[]).forEach(r=>{
    if(r.length!==7) fout(`${w}: restaurant ${r[0]} heeft ${r.length} velden, verwacht 7 [naam, waar, score, prijs, loopmin, tekst, boeken]`);
    if(!RDATA[r[0]]) fout(`${w}: restaurant '${r[0]}' ontbreekt in RDATA`);
    else if(!RDATA[r[0]].k) waarschuw(`${w}: restaurant '${r[0]}' heeft geen keukentype (k) in RDATA`);
    if(typeof r[2]!=='number'||r[2]<1||r[2]>5) fout(`${w}: restaurant ${r[0]} heeft een vreemde score ${r[2]}`);
    if(![1,2,3,4].includes(r[3])) fout(`${w}: restaurant ${r[0]} heeft prijsklasse ${r[3]}, verwacht 1–4`);
    // loopminuten: een getal, 0 = vervoer nodig, -1 = in het hotel zelf
    if(r[4]!==null&&r[4]!==undefined&&(typeof r[4]!=='number'||r[4]<-1)) fout(`${w}: restaurant ${r[0]} heeft loopminuten '${r[4]}'`);
  });
  (d.wild||[]).forEach(x=>{ if(x.length!==3||![1,2,3].includes(x[2])) fout(`${w}: dier '${x[0]}' verwacht [naam, tekst, kans 1–3]`); });
  (d.agenda||[]).forEach(a=>{ if(a.length<3||a.length>4) fout(`${w}: agendapunt '${a[1]}' verwacht [tijd, titel, tekst, privé?]`); });
  (d.food||[]).forEach(x=>{ if(x.length!==2) fout(`${w}: gerecht '${x[0]}' verwacht [naam, tekst]`); });
  if(d.emoe&&(d.emoe.length!==2||![1,2,3].includes(d.emoe[0]))) fout(`${w}: emoe verwacht [kans 1–3, tekst]`);
}

// Dagen van de groepsreis
if(DAYS.length!==29) fout(`DAYS heeft ${DAYS.length} dagen, verwacht 29`);
DAYS.forEach((d,i)=>{
  const w=`dag ${d.n}`;
  if(d.n!==i+1) fout(`${w}: staat op positie ${i+1}`);
  controleerDag(d,w,false);
});

// Dagen van de voorreis: elke datum één keer, binnen de voorreis, op volgorde
const gezien=new Set();
VOORDAGEN.forEach((d,i)=>{
  const w=`voorreis ${d.datum||'(zonder datum)'}`;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d.datum||'')) fout(`${w}: datum ontbreekt of niet in de vorm 2026-09-20`);
  else if(!voorDatums.includes(d.datum)) fout(`${w}: valt buiten de voorreis (${voorDatums[0]} t/m ${voorDatums[voorDatums.length-1]}, VOORREIS=${VOORREIS})`);
  else if(gezien.has(d.datum)) fout(`${w}: staat er twee keer in`);
  else if(i&&VOORDAGEN[i-1].datum>d.datum) waarschuw(`${w}: staat niet op datumvolgorde`);
  gezien.add(d.datum);
  controleerDag(d,w,true);
});

// Dieren (dieren.js): sleutels uniek en in een bekende groep. Elk dier uit een wild-blok dat op naam
// of synoniem aan de lijst is te koppelen, krijgt in de app een teller; de rest kan onder 'Ander dier'.
let DIEREN=[], DIER_GROEPEN=[];
if(!fs.existsSync(__dirname+'/dieren.js')) fout('dieren.js ontbreekt');
else{
  ({DIEREN,DIER_GROEPEN}=vm.runInNewContext(fs.readFileSync(__dirname+'/dieren.js','utf8')+';({DIEREN,DIER_GROEPEN})',{}));
  let ICONEN={};
  if(!fs.existsSync(__dirname+'/dieren-iconen.js')) fout('dieren-iconen.js ontbreekt');
  else ICONEN=vm.runInNewContext(fs.readFileSync(__dirname+'/dieren-iconen.js','utf8')+';DIER_ICONEN',{});
  // Tien iconen zijn met een dunnere pen getekend en dragen daarom een stroke-width, waarmee ze even
  // zwaar ogen als de rest. Node kan svg's niet tekenen, dus de dikte zelf meten we hier niet. Wel of
  // die verdikking er nog is: bij een nieuwe export van zo'n icoon raak je hem anders ongemerkt kwijt.
  const VERDIKT=['quoll','emoe','boomkangoeroe','bultrug','manta','vogelbekdier','anemoonvis','barramundi','doejong','koraalbaars'];
  Object.entries(ICONEN).forEach(([k,svg])=>{
    if(!/^<svg[\s>]/.test(svg)||!/viewBox=/.test(svg)) fout(`dieren-iconen.js: icoon '${k}' is geen svg met viewBox`);
    if(!DIEREN.some(d=>d.k===k)) waarschuw(`dieren-iconen.js: icoon '${k}' hoort bij geen enkel dier in dieren.js`);
    if(VERDIKT.includes(k)&&!/stroke-width="/.test(svg)) waarschuw(`dieren-iconen.js: '${k}' is dun getekend en mist nu zijn stroke-width`);
  });
  const groepen=new Set(DIER_GROEPEN.map(g=>g[0])), sleutels=new Set();
  DIER_GROEPEN.forEach(g=>{ [2,3].forEach(i=>{ if(!/^#[0-9A-Fa-f]{6}$/.test(g[i]||'')) fout(`dieren.js: groep '${g[0]}' mist een kleur voor het ${i===2?'lichte':'donkere'} thema (verwacht #rrggbb)`); }); });
  DIEREN.forEach(d=>{
    if(!/^[a-z0-9-]+$/.test(d.k||'')) fout(`dieren.js: sleutel '${d.k}' mag alleen kleine letters, cijfers en streepjes bevatten`);
    if(sleutels.has(d.k)) fout(`dieren.js: sleutel '${d.k}' staat er twee keer in`);
    sleutels.add(d.k);
    if(d.k==='overig') fout(`dieren.js: 'overig' is gereserveerd voor een dier buiten de lijst`);
    if(!d.n) fout(`dieren.js: dier '${d.k}' heeft geen naam`);
    if(!groepen.has(d.g)) fout(`dieren.js: dier '${d.k}' heeft onbekende groep '${d.g}'`);
    if('ic' in d&&!/^<svg[\s>]/.test(d.ic||'')) fout(`dieren.js: icoon van '${d.k}' is geen svg`);
    if(d.syn&&!Array.isArray(d.syn)) fout(`dieren.js: syn van '${d.k}' moet een lijst zijn`);
  });
  const schoon=n=>String(n||'').replace(/\u00AD/g,'');
  const bekend=naam=>DIEREN.some(d=>schoon(d.n)===naam||(d.syn||[]).includes(naam));
  const zonder=new Set();
  alleDagen.forEach(d=>(d.wild||[]).forEach(w=>{ if(!bekend(w[0])) zonder.add(w[0]); }));
  const metIcoon=DIEREN.filter(d=>d.ic||ICONEN[d.k]).length;
  DIEREN.filter(d=>!d.ic&&!ICONEN[d.k]).forEach(d=>waarschuw(`dieren.js: '${d.k}' heeft geen icoon en krijgt de eerste letter`));
  console.log(`  info:    ${DIEREN.length} dieren in dieren.js, ${metIcoon} met icoon. ${zonder.size} ${zonder.size===1?'dier uit de dagen heeft':'dieren uit de dagen hebben'} geen eigen knop (die vallen onder Ander dier).`);
}

// Losse lijsten
Object.keys(HOTELGEO).forEach(h=>{ if(!alleDagen.some(d=>d.h===h)) waarschuw(`HOTELGEO: '${h}' wordt op geen enkele dag gebruikt`); });
// Coördinaten binnen Australië. Vangt vooral verwisselde breedte- en lengtegraad
Object.entries(HOTELGEO).forEach(([h,g])=>{ if(!Array.isArray(g)||g.length!==2||g[0]<-44||g[0]>-10||g[1]<112||g[1]>154) fout(`HOTELGEO '${h}': [${g}] ligt niet in Australië (verwacht [-44…-10, 112…154])`); });
if(!Array.isArray(SOS)||SOS.length!==2||!SOS.every(x=>typeof x==='string')) fout('SOS: verwacht [nummer, tekst]');
Object.keys(RDATA).forEach(n=>{ if(!alleDagen.some(d=>(d.rest||[]).some(r=>r[0]===n))) waarschuw(`RDATA: '${n}' wordt op geen enkele dag gebruikt`); });
// Sluitingstijd mag ontbreken (dan toont de app er geen badge), maar als hij er staat moet de vorm kloppen
Object.entries(RDATA).forEach(([n,m])=>{ if(!('sluit' in m)) waarschuw(`RDATA ${n}: geen sluitingstijd bekend`);
  else if(!/^\d\d\.\d\d$/.test(m.sluit||'')) fout(`RDATA ${n}: sluitingstijd '${m.sluit}' niet in de vorm 21.30`); });
EXC.forEach(e=>{ if(e.length!==4||!dagRef(e[1])) fout(`EXC '${e[0]}': verwacht [naam, dag 1–29 of datum van een voorreisdag, prijs, tekst]`); });
PACK.forEach(p=>{ if(p.length!==3||!Array.isArray(p[2])||!p[2].every(dagRef)) fout(`PACK '${p[0]}': verwacht [naam, tekst, [dagen: 1–29 of datum van een voorreisdag]]`); });
Object.entries(CHECKIN).forEach(([k,c])=>{ if(c.length!==3||!/^https:\/\//.test(c[1])) fout(`CHECKIN ${k}: verwacht [naam, url, wanneer]`); });
BOEKINGEN.forEach(b=>{ if(b.length!==3) fout(`BOEKINGEN '${b[0]}': verwacht [naam, tekst, sleutel]`); });
NOOD.forEach(n=>{ if(n.length!==2) fout(`NOOD '${n[0]}': verwacht [naam, tekst]`); });
if(typeof BAGAGE!=='string') fout('BAGAGE ontbreekt');
['voorreis','nareis'].forEach(k=>{ const b=BUITEN&&BUITEN[k]; if(!b||!/\.(jpg|png|svg)$/.test(b.foto||'')||!/^#[0-9A-Fa-f]{6}$/.test(b.tone||'')) fout(`BUITEN.${k}: verwacht {foto:"….jpg", tone:"#rrggbb"}`); });
[['VOORREIS',VOORREIS],['NAREIS',NAREIS]].forEach(([n,v])=>{ if(!Number.isInteger(v)||v<0||v>60) fout(`${n} moet een geheel getal van 0 t/m 60 zijn (nu ${v})`); });

// Geen boekingscodes in openbare bestanden. Een PNR is 6 hoofdletters/cijfers. We zoeken naar bekende sleutels.
const lees=n=>fs.existsSync(__dirname+'/'+n)?fs.readFileSync(__dirname+'/'+n,'utf8'):'';
const bron=lees('reis.js')+lees('voorreis.js')+lees('app.js');
const sleutels=[...Object.keys(CHECKIN),...BOEKINGEN.map(b=>b[2])].join('|');   // dezelfde sleutels als in de Ticket-notitie
const pnr=(bron.match(new RegExp(`\\b(${sleutels})\\s*[:=]\\s*[A-Z0-9]{6,8}\\b`,'g'))||[]).filter(x=>!/ABC123/.test(x)); // ABC123 is het voorbeeld in de uitleg
if(pnr.length) fout(`Boekingscode in de code gevonden: ${pnr.join(', ')} — die hoort in een Ticket-notitie, niet in de openbare app`);

// Beelden: alles waar de app naar verwijst moet in BEELD van sw.js staan (anders offline geen foto),
// en hoort in de map te staan. Een ontbrekend bestand is een waarschuwing: wie check.js draait in een
// map met alleen de codebestanden, heeft de foto's misschien elders.
const swBron=fs.readFileSync(__dirname+'/sw.js','utf8'), appBron=fs.readFileSync(__dirname+'/app.js','utf8');
const html=fs.readFileSync(__dirname+'/index.html','utf8'), manifest=fs.readFileSync(__dirname+'/manifest.webmanifest','utf8');
// voorreis.js moet worden geladen én offline beschikbaar zijn
if(!/<script src="voorreis\.js">/.test(html)) fout('index.html laadt voorreis.js niet');
if(!/'\.\/voorreis\.js'/.test(swBron)) fout('sw.js: CODE mist ./voorreis.js');
if(!/<script src="dieren\.js">/.test(html)) fout('index.html laadt dieren.js niet');
if(!/'\.\/dieren\.js'/.test(swBron)) fout('sw.js: CODE mist ./dieren.js');
if(!/<script src="dieren-iconen\.js">/.test(html)) fout('index.html laadt dieren-iconen.js niet');
if(!/'\.\/dieren-iconen\.js'/.test(swBron)) fout('sw.js: CODE mist ./dieren-iconen.js');
const beeldBlok=(swBron.match(/const BEELD=\[([\s\S]*?)\];/)||['',''])[1];
const inBeeld=new Set([...beeldBlok.matchAll(/'\.\/([^']+)'/g)].map(m=>m[1]));
const verwezen=new Set([
  ...Object.keys(TONE).map(r=>`reg-${r}.jpg`),
  ...Object.values(BUITEN).map(b=>b.foto),
  ...[...appBron.matchAll(/'(banner-[a-z]+\.jpg)'/g)].map(m=>m[1]),
  ...[...html.matchAll(/href="([^"]+\.png)"/g)].map(m=>m[1]),
  ...[...manifest.matchAll(/"src":\s*"([^"]+)"/g)].map(m=>m[1])
]);
verwezen.forEach(b=>{ if(!inBeeld.has(b)) fout(`sw.js BEELD mist '${b}', dat de app wel gebruikt`); });
inBeeld.forEach(b=>{ if(!verwezen.has(b)) waarschuw(`sw.js BEELD noemt '${b}', maar niets in de app verwijst ernaar`); });
const weg=[...verwezen].filter(b=>!fs.existsSync(__dirname+'/'+b));
if(weg.length) waarschuw(weg.length===verwezen.size?`geen van de ${weg.length} beelden staat in deze map (alleen code hier? dan is dit in orde)`:`beeld ontbreekt in deze map: ${weg.join(', ')}`);

// Versienummers moeten samen omhoog
const app=fs.readFileSync(__dirname+'/app.js','utf8').match(/APP_VERSIE='([^']+)'/);
const sw=fs.readFileSync(__dirname+'/sw.js','utf8').match(/VERSION='v(\d+)'/);
if(app&&sw&&!app[1].endsWith('-'+sw[1])) waarschuw(`APP_VERSIE (${app[1]}) en VERSION in sw.js (v${sw[1]}) lopen niet gelijk`);

waarschuwingen.forEach(m=>console.log('  let op:  '+m));
fouten.forEach(m=>console.log('  FOUT:    '+m));
const wvAantal=Object.values(RDATA).filter(m=>m.wv).length;
console.log(`  info:    ${wvAantal} van de ${Object.keys(RDATA).length} looptijden zijn met Google Maps gecontroleerd.`);
const voorTxt=VOORDAGEN.length?`, voorreis ${VOORDAGEN.length} van ${VOORREIS} dagen met programma`:`, voorreis alleen notities`;
console.log(fouten.length?`\n${fouten.length} fout(en), ${waarschuwingen.length} waarschuwing(en).`:`\nreis.js is in orde (${DAYS.length} dagen, ${Object.keys(RDATA).length} restaurants, ${EXC.length} excursies${voorTxt}). ${waarschuwingen.length} waarschuwing(en).`);
process.exit(fouten.length?1:0);
