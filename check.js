#!/usr/bin/env node
// Controleert reis.js vóór je een nieuwe versie online zet:  node check.js
// Sluit af met code 1 als er iets mis is, zodat je het ook in een git pre-commit hook kunt zetten.
const fs=require('fs'), vm=require('vm');
const NAMEN=['DAYS','PACK','EXC','HOTELGEO','RDATA','CHECKIN','TONE','REGION','BOEKINGEN','NOOD','BAGAGE'];
// const-declaraties komen niet op het context-object terecht; daarom halen we ze expliciet terug
const data=vm.runInNewContext(fs.readFileSync(__dirname+'/reis.js','utf8')+`;({${NAMEN.join(',')}})`,{});
const {DAYS,PACK,EXC,HOTELGEO,RDATA,CHECKIN,TONE,REGION,BOEKINGEN,NOOD,BAGAGE}=data;

const fouten=[], waarschuwingen=[];
const fout=m=>fouten.push(m), waarschuw=m=>waarschuwingen.push(m);

// Dagen
if(DAYS.length!==29) fout(`DAYS heeft ${DAYS.length} dagen, verwacht 29`);
DAYS.forEach((d,i)=>{
  const w=`dag ${d.n}`;
  if(d.n!==i+1) fout(`${w}: staat op positie ${i+1}`);
  if(!TONE[d.r]||!REGION[d.r]) fout(`${w}: onbekende regio '${d.r}'`);
  if(!['vlucht','bus','excursie','vrij'].includes(d.k)) fout(`${w}: onbekend dagtype '${d.k}'`);
  if(!d.t||!d.p) fout(`${w}: titel of plaats ontbreekt`);
  if(!Array.isArray(d.body)||!d.body.length) fout(`${w}: body ontbreekt`);
  if(!('tz' in d)) fout(`${w}: tz ontbreekt (null is toegestaan voor een vliegdag)`);
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
});

// Losse lijsten
Object.keys(HOTELGEO).forEach(h=>{ if(!DAYS.some(d=>d.h===h)) waarschuw(`HOTELGEO: '${h}' wordt op geen enkele dag gebruikt`); });
Object.keys(RDATA).forEach(n=>{ if(!DAYS.some(d=>(d.rest||[]).some(r=>r[0]===n))) waarschuw(`RDATA: '${n}' wordt op geen enkele dag gebruikt`); });
Object.entries(RDATA).forEach(([n,m])=>{ if(!/^\d\d\.\d\d$/.test(m.sluit||'')) fout(`RDATA ${n}: sluitingstijd '${m.sluit}' niet in de vorm 21.30`); });
EXC.forEach(e=>{ if(e.length!==4||e[1]<1||e[1]>29) fout(`EXC '${e[0]}': verwacht [naam, dag 1–29, prijs, tekst]`); });
PACK.forEach(p=>{ if(p.length!==3||!p[2].every(n=>n>=1&&n<=29)) fout(`PACK '${p[0]}': verwacht [naam, tekst, [dagen]]`); });
Object.entries(CHECKIN).forEach(([k,c])=>{ if(c.length!==3||!/^https:\/\//.test(c[1])) fout(`CHECKIN ${k}: verwacht [naam, url, wanneer]`); });
BOEKINGEN.forEach(b=>{ if(b.length!==3) fout(`BOEKINGEN '${b[0]}': verwacht [naam, tekst, sleutel]`); });
NOOD.forEach(n=>{ if(n.length!==2) fout(`NOOD '${n[0]}': verwacht [naam, tekst]`); });
if(typeof BAGAGE!=='string') fout('BAGAGE ontbreekt');

// Geen boekingscodes in openbare bestanden. Een PNR is 6 hoofdletters/cijfers; we zoeken naar bekende sleutels.
const bron=fs.readFileSync(__dirname+'/reis.js','utf8')+fs.readFileSync(__dirname+'/app.js','utf8');
const pnr=(bron.match(/\b(SQ|JQ|QF|TL)\s*[:=]\s*[A-Z0-9]{6}\b/g)||[]).filter(x=>!/ABC123/.test(x)); // ABC123 is het voorbeeld in de uitleg
if(pnr.length) fout(`Boekingscode in de code gevonden: ${pnr.join(', ')} — die hoort in een Ticket-notitie, niet in de openbare app`);

// Versienummers moeten samen omhoog
const app=fs.readFileSync(__dirname+'/app.js','utf8').match(/APP_VERSIE='([^']+)'/);
const sw=fs.readFileSync(__dirname+'/sw.js','utf8').match(/VERSION='v(\d+)'/);
if(app&&sw&&!app[1].endsWith('-'+sw[1])) waarschuw(`APP_VERSIE (${app[1]}) en VERSION in sw.js (v${sw[1]}) lopen niet gelijk`);

waarschuwingen.forEach(m=>console.log('  let op:  '+m));
fouten.forEach(m=>console.log('  FOUT:    '+m));
const wvAantal=Object.values(RDATA).filter(m=>m.wv).length;
console.log(`  info:    ${wvAantal} van de ${Object.keys(RDATA).length} looptijden zijn met Google Maps gecontroleerd.`);
console.log(fouten.length?`\n${fouten.length} fout(en), ${waarschuwingen.length} waarschuwing(en).`:`\nreis.js is in orde (${DAYS.length} dagen, ${Object.keys(RDATA).length} restaurants, ${EXC.length} excursies). ${waarschuwingen.length} waarschuwing(en).`);
process.exit(fouten.length?1:0);
