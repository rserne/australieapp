const HERO_HTML=document.getElementById('hero').innerHTML;
const WD=["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"];
const MN=["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
const dateFor=n=>{const d=new Date(START);d.setDate(d.getDate()+n-1);return d};
const fmtLong=d=>`${WD[d.getDay()]} ${d.getDate()} ${MN[d.getMonth()]}`;
const fmtShort=d=>`${d.getDate()} ${MN[d.getMonth()].slice(0,3)}`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// aantal beoordelingen afgerond weergeven: 5884 → ±5.900, 521 → ±520, 142 → 142
const fmtCount=c=>c>=1000?'±'+(Math.round(c/100)*100).toLocaleString('nl-NL'):c>=200?'±'+String(Math.round(c/10)*10):String(c);

// Dagen buiten de groepsreis, alleen voor notities. Voorreis: dag -1 is 30 september, -6 is
// 25 september (0 blijft 'Algemeen', daarom slaat de telling 0 over). Nareis: dag 30 is 30 oktober.
// De aantallen staan in reis.js. Wie er gaat, leest de app af uit de notities zelf.
const VOOR=typeof VOORREIS==='number'?VOORREIS:0, NA=typeof NAREIS==='number'?NAREIS:0;
const dagDatum=d=>dateFor(d<0?d+1:d);
const isBuiten=d=>d<0||d>29;
const buitenDagen=()=>[...Array.from({length:VOOR},(_,i)=>-VOOR+i),...Array.from({length:NA},(_,i)=>30+i)];
const fmtKort=d=>WD[d.getDay()].slice(0,2).replace(/^./,c=>c.toUpperCase())+' '+fmtShort(d);
const buitenLabel=d=>`${fmtKort(dagDatum(d))} · ${d<0?'voorreis':'nareis'}`;
const EINDE=100;   // positie van de afsluitpagina bij het bladeren
// Beeld en tint voor voorreis (voor=true) of nareis, met terugval op de reisfoto
const beeldBuiten=voor=>(typeof BUITEN==='object'&&BUITEN[voor?'voorreis':'nareis'])||{foto:'reg-reis.jpg',tone:TONE.reis};
// Volgnummer binnen de voorreis of nareis: dag -13 is voorreisdag 1, dag 30 is nareisdag 1.
const buitenVolgnr=n=>n<0?n+VOOR+1:n-29;

// Programma voor voorreis- en nareisdagen (VOORDAGEN in voorreis.js, later eventueel NADAGEN in
// nareis.js): dezelfde dagobjecten als DAYS, maar gekoppeld aan een datum in plaats van een nummer,
// zodat een langere voorreis de bestaande dagen niet verschuift. Een datum zonder programma blijft
// een dag met alleen notities. Ontbreekt het bestand of is de lijst leeg, dan is dat elke dag.
const VOORDG=typeof VOORDAGEN!=='undefined'&&Array.isArray(VOORDAGEN)?VOORDAGEN:[];
const NADG=typeof NADAGEN!=='undefined'&&Array.isArray(NADAGEN)?NADAGEN:[];
const isoDatum=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const buitenData=n=>{ if(!isBuiten(n)) return null; const iso=isoDatum(dagDatum(n)); return (n<0?VOORDG:NADG).find(d=>d.datum===iso)||null; };
// Programma van een dag: uit DAYS, of een voorreis-/nareisdag met programma. Null als er geen is.
const dagData=n=>isBuiten(n)?buitenData(n):(DAYS[n-1]||null);
// Dagnummer van een verwijzing in EXC of PACK: een nummer (1–29) of de datum van een voorreis- of
// nareisdag ('2026-09-20'), omgerekend naar het interne nummer (voorreis negatief, nareis 30 en hoger).
const dagNr=x=>{ if(typeof x!=='string') return x; const d=new Date(x+'T12:00:00');
  const v=Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate())-START)/864e5); return v<0?v:v+1; };

// De datum van vandaag. Testen op een andere dag: open de app met ?datum=2026-09-27 achter het adres.
// Geldt alleen voor die sessie. De geïnstalleerde app start altijd zonder parameter, dus op de echte datum.
function vandaagDatum(){
  const par=new URLSearchParams(location.search).get('datum');
  return /^\d{4}-\d{2}-\d{2}$/.test(par||'')?new Date(par+'T12:00:00'):new Date();
}
function todayInfo(){
  const n=vandaagDatum();
  const t=new Date(n.getFullYear(),n.getMonth(),n.getDate());
  const raw=Math.round((t-START)/864e5)+1;
  const before=raw<1, after=raw>29;
  // n: welke pagina 'Vandaag' toont. Vóór de reis de startpagina (0), na afloop de afsluitpagina
  // (30) als er een nareis is, anders dag 29. dag: bij welk notitienummer vandaag hoort, ook een
  // voorreis- of nareisdag. Null als vandaag buiten alles valt.
  const nPag=before?0:(after?(NA>0?EINDE:29):raw);
  const dag=(!before&&!after)?raw:(before&&raw-1>=-VOOR)?raw-1:(after&&raw<=29+NA)?raw:null;
  return {n:nPag,before,after,raw,dag};
}
let T=todayInfo();
let cur=T.n,view='day',clockTimer=null;
// Een geïnstalleerde app blijft dagen open staan. Na middernacht moet 'Vandaag' meebewegen.
function herbereken(){
  const oud=T, oudPag=vandaagPagina(); T=todayInfo();
  // raw telt mee: vóór de reis veranderen n, before en dag niet van dag op dag, het aftellen wel
  if(oud.raw===T.raw&&oud.n===T.n&&oud.before===T.before&&oud.after===T.after&&oud.dag===T.dag) return;
  if(view==='day'){ if(cur===oudPag) cur=vandaagPagina(); render(); }
  else if(view==='index') renderIndex();
  else if(view==='alles') renderAlles();
}

const PIN='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
const BED='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M2 16h20M6 10V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>';
const THERM='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.76V4a2 2 0 1 0-4 0v10.76a4.5 4.5 0 1 0 4 0Z"/></svg>';
const WALK='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="2"/><path d="m9 21 2-6 3-2-1-5 4 3 2 1M8 12l2-4M11 15l-2 6"/></svg>';
const KIND={
 vlucht:["Reisdag · vlucht",'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5a2.4 2.4 0 0 0-3.4-3.4L12.6 7.6 4.4 5.8 3 7.2l6.6 3.8-2.6 2.6-3-.4L3 14.6l3.4 1.3L7.7 19l1.4-1 -.4-3 2.6-2.6L15.1 19l1.4-1.4Z"/></svg>'],
 bus:["Reisdag · per bus",'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11M4 11h16M6 17v2M18 17v2"/><circle cx="7.5" cy="14.5" r=".8"/><circle cx="16.5" cy="14.5" r=".8"/></svg>'],
 auto:["Reisdag · per auto",'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13l2.2-5.3A2 2 0 0 1 7 6.5h10a2 2 0 0 1 1.8 1.2L21 13v5H3Z"/><path d="M3 13h18M5.5 18v2M18.5 18v2"/><circle cx="7.5" cy="15.5" r=".9"/><circle cx="16.5" cy="15.5" r=".9"/></svg>'],
 excursie:["Excursiedag",'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 20 6-11 4.5 8M11 20l4-7 6 7Z"/></svg>'],
 vrij:["Vrije dag",'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>']
};
const CHECK='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11.5l2 2 4.5-5"/><rect x="3.5" y="3.5" width="17" height="17" rx="4"/></svg>';
const PAW='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="flex:none;margin-top:3px;opacity:.7"><ellipse cx="7" cy="8.5" rx="2" ry="2.6"/><ellipse cx="17" cy="8.5" rx="2" ry="2.6"/><ellipse cx="11" cy="5" rx="2" ry="2.6"/><ellipse cx="13" cy="5" rx="2" ry="2.6" transform="translate(4 0)"/><path d="M12 11c-3 0-6 2.6-6 5.2 0 1.7 1.2 2.8 3 2.8 1 0 1.8-.4 3-.4s2 .4 3 .4c1.8 0 3-1.1 3-2.8C18 13.6 15 11 12 11Z"/></svg>';
const HOME='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/></svg>';
// De emoe uit de iconenset (dieren-iconen.js), bijgesneden tot de tekening zelf
const EMU='<svg width="18" height="18" viewBox="569.1 166.6 765.8 944.3" fill="currentColor" stroke="none"><path d="M1186.5 202c-4.3 1.6-4.8 3.5-4.2 13.8.3 5.3.9 10.6 1.3 11.7.6 1.6 0 1.3-3.3-1.2-5.3-4.3-15.6-9.1-21-9.9-5.5-.8-9.3 1.4-9.3 5.4 0 3.7.5 4.2 8.5 8.9 3.9 2.2 7.8 5 8.8 6.1 1.8 1.9 1.7 1.9-4.5.5-9.3-2.2-25.8-1.4-29.5 1.3-5.8 4.3-3.4 11.4 3.8 11.4 5.9 0 18.9 2.1 18.9 3.1 0 .5-.8.9-1.7.9-2.7 0-13.1 5.6-18.1 9.7-9 7.3-13.6 16.5-10 20.1 2.1 2.1 7.3 1.4 9.9-1.4 2.3-2.5 10.2-8.4 11.2-8.4.3 0-.4 2.7-1.4 6.1-6.6 21.3-3.9 47 8.2 75.9 18.4 44.2 22.6 56.6 25.4 75.5 8.1 54.6-16.7 99.9-57.2 104.5-20.2 2.2-43.8-5.1-69.9-21.6-6-3.9-19.6-13.2-30.2-20.7-32.4-22.9-54.4-34.9-77.7-42.6-67.7-22.1-147-7.2-205 38.7-11.6 9.2-22.5 19.3-28 25.9-3.6 4.4-8.6 8.5-17.1 14.2-24.6 16.3-40.4 33.6-47.8 52.3-2.9 7.5-3.3 11.8-1.1 15.1 1.4 2.1 1.1 2.7-4.5 9.5-24.2 29.6-38.2 65.8-36.8 95.2.9 18.6 4.8 27.4 12.3 27.4 4.5 0 6.7-2.2 12.1-12.1 2.5-4.5 5-8.6 5.6-9 .8-.4.9 0 .3 1.3-1.7 4-1.8 31.5-.2 40.1 4.5 23.6 15.6 36.1 24.6 27.5 1.5-1.5 3.6-5 4.6-7.7.9-2.8 3.6-9.2 5.8-14.4l4-9.4 1.8 8.8c2.1 10.1 5.5 17.8 9.9 22 2.5 2.4 4 3 7.5 3 5.9 0 8-2.2 15-15.8 3.2-6.2 6.9-13 8.3-15.1l2.4-3.9 2.5 5.1c2.6 5.6 6.2 8.2 11 8.2 4.4 0 6.6-2.2 13.3-13.1 3.5-5.5 6.6-9.7 7-9.2.4.4 1.3 2.9 2 5.4 2.3 8.9 10.7 15.8 19.1 15.9 5.1 0 13.4-2.6 20.6-6.5l6.2-3.4-3.4 8.1c-4.5 10.5-12.2 22.7-21.3 33.5-13 15.4-13.9 17.9-15.2 41.8-1.3 23.8-4.7 45.4-13.6 85.5-6.2 27.9-10.5 44.2-17.4 65.5-7.2 22.2-7.5 23.4-6 29.5 1.9 7.9 6.5 12.2 19.9 18.7 15.4 7.3 22.5 12 36.2 24.1 13 11.3 21.6 17.2 29.5 20.2 14.8 5.5 26.4-.9 26.4-14.7 0-4.1-.8-6.8-4-12.8l-4-7.6 6.2.8c3.5.4 11.9.8 18.8.8 13.8 0 18.3-1.4 22.4-6.9 3.1-4 2.9-12.1-.3-16.8-7.3-10.6-24.1-16.3-57.1-19.3-25.5-2.3-32.6-4.8-35.1-12.2-2.7-8.4 1-30.4 14.3-82.8 11.3-44.9 14-53.5 19.7-62.5 6.6-10.3 6.8-10.8 9.6-20.5 1.4-4.8 3.6-10.8 5-13.5 6.8-13.4 37.2-43.9 61.7-61.8l5.6-4.1 11.5 2.4c6.4 1.4 14.8 2.8 18.6 3.1l7.1.7 2.5 5.4c5.3 11.7 9.6 23.6 12.5 34.4 3.7 13.9 4.4 18.2 6.9 37.9 3.3 25.8 4.7 28.1 25.5 43 24.4 17.4 60.7 53.8 88.4 88.4 9.4 11.7 18.6 25.5 25.3 38.1 11.1 20.5 32.2 36.6 48.4 36.8 7.1.1 11.7-2 14.5-6.6 2.2-3.5 2.6-10.9 1-15.3-.6-1.5-.9-2.9-.7-3.1.3-.2 2.6.1 5.3.7 8.2 1.9 27.4 4 35.9 4 22.5 0 35.5-6.4 35.5-17.5 0-8.4-6.5-15.2-18.7-19.5l-6.4-2.3 4.3-2.4c8.3-4.7 11.8-9.5 11.8-16 0-6.1-2.9-10.4-9-13.5-9.8-5.1-21.4-3.8-51.7 5.8-13.6 4.4-15.6 4.8-25.3 4.8-9.9.1-10.8-.1-15.5-2.8-12-7-33.3-31.3-78-88.6-7-9.1-15-18.8-17.6-21.7-2.7-2.8-4.9-5.7-4.9-6.3s-2-5.5-4.5-11c-6.5-14.1-7.8-21.5-7.8-45 0-17.7 1.9-38 3.9-41.1 1.2-2.1 9.1-5.2 15.3-6 17.5-2.5 40.8-12.5 60.8-26 4-2.7 7.5-4.9 7.8-4.9s.5 2 .5 4.5c0 3.8.6 5.2 3.4 8.3 3.3 3.6 3.7 3.7 9.9 3.6 5.2 0 7.8-.7 14.1-3.7 9.5-4.5 13.1-7.1 22.7-16.5l7.6-7.4.6 3.9c1.3 7.7 8.5 10.4 15.9 6 8-4.7 24.8-24.8 27.3-32.7.8-2.6 2.3-2.5 2.7.1.2 1.2 1.5 3.1 3 4.2 4.2 3.1 8.2 1.4 14.1-5.8 9.7-12.1 19.6-35.5 23.3-55 2.3-12.5 2.1-11.9 4-10.1 2.3 2.4 7.7 2 10.1-.7 7.8-8.3 13.8-50.4 11.5-80.9-2.3-30.1-6.9-50.6-21.3-94.6-5.7-17.2-10.3-33.1-10.8-37-1.5-12.2 1.3-21.8 7.4-25.3 2.7-1.5 3.7-1.6 10.5-.3 11.8 2.2 21.6.5 26.4-4.5 5.6-5.8 4.2-15.8-3.4-24.4-1.8-2.1-3.1-3.9-2.9-4.1.2-.1 3.5-.8 7.3-1.5 11.9-2.1 15.6-5.2 15.6-13.2 0-3.5-.7-5.6-2.8-8.5-6.8-9.3-17.9-16.2-29.5-18.5-4.9-1-5.8-1.5-6.3-3.8-.4-1.4-2.5-6.2-4.7-10.6-7.6-14.9-22.5-26.8-37.4-29.7-3.2-.7-6-1.3-6.2-1.5-.2-.1.8-2.1 2.2-4.5 3-5.2 12.9-14.9 17.7-17.3 5.2-2.6 7-4.5 7-7.5 0-9.7-17-5.3-29.7 7.6-3.4 3.5-6.9 7.7-7.8 9.4-.8 1.6-1.9 3-2.3 3s-2-5.2-3.6-11.4c-1.5-6.3-3.3-11.9-3.9-12.4-2.1-1.6-4.1-2-6.2-1.2m36.3 52.5c3 1.4 7.5 4.1 9.8 6 5.4 4.4 11.7 13.9 13.9 20.7 3.6 11.6 4.1 12.1 13.6 13.2 2.5.3 7.1 1.5 10.2 2.6 5.8 2.2 15.4 9.7 14 11-.4.5-4.4 1.3-8.8 1.9-4.4.5-17.4 2.4-28.9 4.1-12.8 1.9-23.8 3-28.4 2.8-6.7-.3-7.5-.1-9.3 2.1-2.7 3.3-2.4 6.7 1.1 10.4 1.6 1.8 5 5.5 7.4 8.3 2.5 2.8 6.9 6.3 9.8 7.9 2.9 1.5 5.5 2.9 5.7 3.1.1.1-.9 1.9-2.4 3.8-6.4 8.4-8.3 24.7-4.5 40.2 1 4.4 5.9 20.2 10.9 35 9.1 27.5 14.6 48.9 17.8 69.4 2.2 14.6 2.5 49.6.4 61.8-.7 4.5-1.5 8.1-1.7 7.9-.2-.1-1.9-6.6-3.9-14.2-4-15.6-6.2-19.3-10.9-18.1s-5.5 3.9-4.4 15.1c1.9 19.3-.3 45.8-5.3 64.3-3 10.7-10.4 28.2-12.1 28.2-.4 0-.8-7-.8-15.5 0-14.2-.2-15.7-2-17.5-2.5-2.5-5.1-2.5-7.9-.3-1.5 1.3-2.6 4.6-4.1 12.1-2.5 12.5-6.4 23.6-12.4 34.8-5.7 10.7-16.6 25-16.6 21.8 0-.5.7-6.9 1.6-14.2 1.4-12.2 1.4-13.6-.1-15.8-1.6-2.5-4.4-3.1-7.4-1.5-.9.5-3.4 4.2-5.4 8.3-10 19.6-29.5 38.7-43.7 42.8-2.8.8-3 .7-3-2 0-3.2 4.4-16.2 6.9-20 .8-1.4 3.2-4.8 5.3-7.6 4.3-5.8 5.1-10.7 1.9-12.4-3.3-1.7-4.6-1.2-11.6 4.6-8 6.5-12.4 8.9-20.2 10.9-3.1.8-6 2.1-6.5 2.7-1.3 2.1-.9 5 .9 7 1 1.2 1.3 2.2.8 2.6-14.4 10.3-31.2 19.8-41.4 23.3-6.6 2.3-6.1 2.3-6.1-.3 0-2.9-2.8-5.8-5.7-5.8-1.5 0-5.8 2.6-10.8 6.5-14.4 11.3-29.9 18.5-48.7 22.7-8.7 1.9-13.2 2.3-28.8 2.3-18.1 0-35-1.8-35-3.6 0-.5.4-.9.8-.9.5 0 5.6-3.4 11.3-7.6 19.2-14.1 36.1-33.8 44.4-51.8 6.1-13.1 10.4-29.6 10.5-39.9 0-3.5-3.2-6.7-6.8-6.7-4.9 0-6.1 1.8-7.8 11.5-2.8 16.5-8.6 30.5-18.2 44-10.9 15.4-21.1 24.5-48.2 42.7-20.8 14-29.8 20.9-42.8 32.4-10.7 9.6-15 11.7-19.3 9.4-1.8-1-2-1.9-1.7-7.2.2-4.9 0-6.2-1.5-7.2-1.4-.9-2.5-.6-5.5 1.2-8.3 5.1-11.9 6.5-14.7 5.8-2.2-.6-2.6-1.1-2.1-2.9.4-1.2 1.8-6.7 3.3-12.1 2.1-8.4 3.3-10.8 7.1-15.5 13.7-16.8 22.7-36.3 25.4-54.7 1.1-7.7 1-8.5-.7-10.4-1-1.1-3-2-4.4-2-3.1 0-7.1 2.5-7.1 4.4 0 2.6-5.1 19-8.2 26.4-10.6 25.5-37.3 52.5-54.1 54.8-3.9.6-4.6.3-6.5-2-5.2-6.6-5-26.5.3-43.5 2-6.2 2.3-8.5 1.5-10-1.6-3.1-4-4-7.3-2.8-2.4.8-3.7 2.5-6.4 8.3-1.8 4.1-4.1 10.6-4.9 14.4-1.2 5.2-2.6 8.2-5.2 11.3-1.9 2.3-6.1 8.2-9.3 13-5.5 8.3-5.9 8.6-6.5 6.2-.4-1.5-.4-6.8 0-11.8.3-5.1.3-9.7-.1-10.3-1.7-2.4-4.9-3.3-7.3-2.1-3.1 1.6-18 23.7-25.4 37.8-3.2 6-6.1 10.7-6.5 10.4-.5-.2-1.6-3.3-2.6-6.7-2.1-7.6-2.4-25.4-.6-34.1 1.5-6.8.9-10.2-2-11.8-4.1-2.1-6.5-.3-13.2 9.9-8.4 12.7-14.4 23.8-18.3 33.7l-3.2 8-1.2-3c-.7-1.7-1.9-7.3-2.7-12.5-3.5-22.3 1.7-48 14.9-73.1 4.5-8.7 5-10.2 4-12.4-1.4-3-5.2-4.1-8.5-2.3-5.5 3-28.7 31.3-35.8 43.8-1.9 3.3-3.7 6-4.1 6-2.1.1.2-19.8 3.8-33.8 6.5-25.2 24.4-53.9 46.3-74.3 8.5-8 9.7-10.5 6.4-14.1-2.1-2.3-5.4-2.3-10.3.2-2.2 1.1-4 1.6-4 1.1 0-1.8 9.9-15.9 15.5-22 7.2-7.7 19-17 30.9-24.2 6.9-4.2 10.5-7.2 15.8-13.5 11.6-13.7 30-28.6 49.3-39.9 36.5-21.5 81.6-32 122.5-28.6 26.4 2.3 45.1 7.3 68 18.2 15.7 7.5 28.7 15.7 56 34.9 32.1 22.7 48.6 31.7 68.3 37.4 44 12.7 81-4.8 99.3-47.2 7.1-16.4 10-33.6 9.1-54.7-1-24.5-6.5-44.5-22.2-81.5-9.9-23.3-13.1-33.3-15.1-46-1.7-11.7-1.7-16.3.1-26.3 2-11.4 7.2-21.6 14.2-28.3 7.1-6.6 11.3-8 17.3-5.9 6.7 2.4 11.7 2 14.5-1.1 1.4-1.5 2.5-3.4 2.5-4.2 0-2.2 8.7-.9 15.8 2.3m42 77.9c4 4.1 7.2 8.2 7.2 9.1 0 1.6-.9 1.7-7.7 1.3-9.3-.6-22.7-4.9-30.5-9.9l-5.3-3.4 5-.7c2.8-.4 8.8-1.4 13.5-2.1 4.7-.8 9-1.5 9.6-1.6.6 0 4.3 3.2 8.2 7.3M999 747.9c-.8 5.3-1.1 15.9-.7 30.4.5 26.3 1.7 32.1 10.2 49.5 5.8 11.9 10 17.6 52.6 71.1 40.5 50.8 55.7 64.2 74.6 65.8 8.6.7 17.4-1 40-7.8 9.2-2.7 20-5.5 23.9-6.1 7.1-1.1 12.4-.6 12.4 1.2 0 3.4-19.8 11.1-33.6 13.2-8.5 1.2-12.4 3.5-12.4 7.3 0 4.7 2 5.6 16 7.6 20.8 2.9 37.5 7.9 38.7 11.6.7 2-6.3 2.8-22.7 2.7s-31-2.1-50.2-7c-11.6-2.9-11.3-2.9-13.8-.4-3.2 3.2-2.5 6 3.4 12 5.5 5.6 9.6 12.1 9.6 15.2 0 4.1-9.9.7-20.1-6.8-8-5.9-14.4-13.8-21.4-26.6-13.9-25.6-41.8-59.4-77.3-94-15.4-15-24.8-23-38.6-32.6-9.9-7-14-11.2-15.4-15.9-.6-2.1-1.8-9.7-2.7-16.8-3-25.1-7.5-43.5-15.4-63.3-2.3-5.6-4.1-10.5-4.1-10.7 0-.3 2.5-.5 5.6-.5 8 0 24.6-2.6 34-5.3 4.3-1.3 8-2.3 8.2-2.1.2.1-.2 3.9-.8 8.3m-179.1 14.7c6.2 0 6.5.2 7.2 2.8 1.1 4.1 3.8 6.6 7.1 6.6 1.5 0 2.8.3 2.8.6 0 .4-2.2 3.2-4.8 6.3-12.5 14.5-16.6 21.7-20.6 36.1-2 7.2-3.9 11.3-7.7 16.8-6.5 9.3-11 23.2-21.8 65.9-9.8 39-13.7 57.7-15.2 72.5-1 9.8-.9 12.2.5 17.8 1.9 7.5 3.7 10.3 9.5 14.7 6.5 5 15 7.1 38 9.3 11.3 1.1 24.1 2.9 28.4 4 8.1 2 17.8 6.6 18.4 8.7 1.1 3.4-19.7 2.1-45.7-2.8-5.8-1.1-11.9-2.2-13.7-2.5-3.5-.7-7.3 2.2-7.3 5.6 0 1.1 4.2 6.1 10.4 12.2 6.6 6.6 11.3 12.2 13 15.5 3.4 6.9 3.4 8.3-.4 8.3-6.6 0-12.7-3.9-30.5-19.4-12.7-11.1-23.6-18.4-36.1-24.2-5.4-2.5-10.7-5.3-11.6-6.1-3.6-3.2-3.2-7 2.7-24.3 9.8-28.8 19.9-70 26-105.2 4.7-27.8 5.6-34.9 6.4-52.8.9-18 1.1-18.6 11.1-30.5 8.4-10.1 13.7-17.7 19.6-28.9 3.7-7 4.9-8.6 6.3-7.9.9.4 4.5.8 8 .9"/><path d="M1225.3 273.4c-4 1.8-6.3 6.2-6.3 12.2 0 3.9.5 5.1 3.4 8 2.8 2.8 4.1 3.4 7.8 3.4 5 0 8.2-1.8 10.3-6 5.4-10.5-4.8-22.3-15.2-17.6m-45 16.6c-4.5 2.7-6.5 6.2-6.5 11.4 0 16 21.7 19.5 25.2 4.1 1.5-6.6-1.9-13.7-7.5-16.1-4.6-1.9-7.4-1.8-11.2.6m59.5 10.5c-1.7 3.8.3 7.5 4.1 7.5 2.9 0 9.1-4.2 9.1-6.1 0-1.3-6.3-3.9-9.5-3.9-1.7 0-2.9.8-3.7 2.5M738.3 540.9c-8.3 4.6-14.4 9.4-22 17.4-11 11.6-18.4 23.5-23.2 37.5-2.9 8.6-2.8 12.7.5 14.9 4.3 2.8 7.1.4 11.3-9.7 8.7-20.7 19.7-34.6 38.3-48.3 8.2-6.1 9.2-7.5 7.8-11.1-1.7-4.5-5.5-4.7-12.7-.7m381.9 37.1c-7.1 3.7-17.7 7-22.5 7-3 0-7.7 3.6-7.7 5.9 0 .9.7 2.7 1.6 3.9 5.5 7.8 43.4-5.9 43.4-15.7 0-6.2-4.4-6.5-14.8-1.1m1.1 33.9c-4.5 4-15.2 10-21.6 12.1-7.2 2.3-8.7 10-2.3 11.6 9.2 2.3 36.6-14.4 36.6-22.2 0-6.6-6.2-7.4-12.7-1.5M744.5 618c-2.9 1.1-12.7 13.3-18.5 22.9-8.2 13.8-14.6 35.5-12.7 43.3 1.3 4.9 8.6 5 10.5.1.5-1.6 1.8-6 2.8-9.8 3.6-14.3 10.8-28.6 21.1-41.9 5.9-7.7 6.7-11.5 3.1-14-2.5-1.8-3.4-1.9-6.3-.6"/></svg>';
const PLANE='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5a2.4 2.4 0 0 0-3.4-3.4L12.6 7.6 4.4 5.8 3 7.2l6.6 3.8-2.6 2.6-3-.4L3 14.6l3.4 1.3L7.7 19l1.4-1 -.4-3 2.6-2.6L15.1 19l1.4-1.4Z"/></svg>';
const EXTW='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="opacity:.75"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/></svg>';
const EXT='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="margin-left:6px;vertical-align:baseline;opacity:.55"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/></svg>';
const WASH='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="14" r="4.2"/><path d="M8 6h.01M12 6h.01"/></svg>';

const pad=n=>String(n).padStart(2,'0');
function offsetTime(off){
  const now=new Date();
  const utc=now.getTime()+now.getTimezoneOffset()*60000;
  const d=new Date(utc+off*3600000);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function nlTime(){
  try{
    return new Intl.DateTimeFormat('nl-NL',{timeZone:'Europe/Amsterdam',
      hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
  }catch(e){return offsetTime(1)}
}

function render(){
  if(cur===0||cur===EINDE){ renderBuiten(); return; }
  // Voorreis- en nareisdagen bestaan alleen voor wie is ingelogd. Zonder programma is het een dag met
  // alleen notities. Mét programma tekent deze functie hem als een gewone reisdag.
  if(isBuiten(cur)){
    if(!NH.user){ cur=T.before?0:1; render(); return; }
    if(!buitenData(cur)){ renderBuitenDag(); return; }
  }
  const buiten=isBuiten(cur), d=dagData(cur), date=dagDatum(cur);
  // buiten de groepsreis: één vaste foto en kleur (BUITEN in reis.js), geen regio per dag
  const bb=buiten?beeldBuiten(cur<0):{tone:TONE[d.r],foto:`reg-${d.r}.jpg`}, tone=bb.tone;
  const isToday=T.dag===cur;

  const hero=document.getElementById('hero');
  hero.style.setProperty('--tone',tone);
  hero.style.backgroundImage=`url(${bb.foto})`;
  hero.classList.add('foto');
  document.documentElement.style.setProperty('--tone',tone);
  document.querySelector('meta[name=theme-color]').setAttribute('content',tone);

  document.getElementById('eyebrow').innerHTML=
    (isToday?`<span class="dot live"></span>`:`<span class="dot" style="background:rgba(255,255,255,.4)"></span>`)
    +(isToday?`Vandaag · ${fmtLong(date)}`:fmtLong(date));
  document.getElementById('num').innerHTML=buiten
    ?`${cur<0?'Voorreis':'Nareis'}<small>dag ${buitenVolgnr(cur)} van ${cur<0?VOOR:NA}</small>`
    :`Dag ${d.n}<small>van 29</small>`;
  document.getElementById('title').textContent=d.t;

  const kd=KIND[d.k];
  document.getElementById('metabox').innerHTML='';
  document.getElementById('flagbox').innerHTML='';

  document.getElementById('track').style.width=buiten?'0%':(cur/29*100)+'%';
  document.getElementById('navlabel').textContent=isToday?'Vandaag':fmtShort(date);

  let h=`<div class="dagmeta">`+
    (kd?`<span class="dm">${kd[1]}${kd[0]}</span>`:'')+
    `<span class="dm">${PIN}${esc(d.p)}${REGION[d.r]?' · '+REGION[d.r]:''}</span>`+
    (d.h?(()=>{
      const g=HOTELGEO[d.h];
      // met coördinaten wijst de link naar precies dít pand, niet naar een andere vestiging
      const url=g?`https://www.google.com/maps/search/?api=1&query=${g[0]},${g[1]}`
                 :`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.h+', '+d.p+', Australia')}`;
      return `<a class="dm link" href="${url}" target="_blank" rel="noopener">${BED}${esc(d.h)}${EXTW}</a>`;})():'')+
    (d.temp?`<span class="dm">${THERM}${esc(d.temp)}</span>`:'')+
    (d.wash?`<span class="dm wash">${WASH}Was afgeven</span>`:'')+
    `</div>`;
  // Lange dagteksten worden ingekort tot acht regels, met een knop om ze open te vouwen.
  const langeTekst=d.body.join(' ').length>560;
  h+=`<div class="prose${langeTekst?' inkort':''}" id="dagtekst">${d.body.map(p=>`<p>${esc(p)}</p>`).join('')}</div>`+
     (langeTekst?`<button class="meerknop" type="button" id="meertekst">Meer</button>`:'');
  if(d.fl){
    h+=`<div class="flights">`+d.fl.map(([code,from,to,dep,arr,info])=>
      `<div class="flight"><div class="fcode">${PLANE}${esc(code)}</div>`+
      `<div class="fleg"><div class="fpt"><span class="ft">${esc(dep)}</span><span class="fp">${esc(from)}</span></div>`+
      `<span class="farr">→</span>`+
      `<div class="fpt"><span class="ft">${esc(arr)}</span><span class="fp">${esc(to)}</span></div></div>`+
      `<div class="finfo">${esc(info)}</div>`+
      (()=>{const k=code.split(' ')[0],c=CHECKIN[k];if(!c)return '';const bc=boekingscode(k);
        return `<a class="fcheck" href="${c[1]}" target="_blank" rel="noopener">`+
        `<span class="fc1">Online inchecken${EXTW}</span>`+
        `<span class="fc2">${bc?`Code ${esc(bc)} · `:''}${esc(c[2])}</span></a>`;})()+
      `</div>`).join('')+`</div>`;
  }
  if(d.agenda){
    // Staat er ergens een dagdeel in plaats van een kloktijd ('Ochtend'), dan krijgt de hele lijst een
    // bredere tijdkolom in een kleinere letter. Zo blijven de titels onder elkaar staan en loopt een
    // woord niet over de titel heen. Houd dagdelen daarom kort, hoogstens een woord van acht letters.
    const dagdeel=d.agenda.some(a=>!/\d/.test(a[0]));
    h+=`<h2>Tijdschema</h2><ol class="agenda${dagdeel?' woorden':''}">`+d.agenda.map(([tm,ti,tx,pv])=>
      `<li><span class="atime">${esc(tm)}</span><span class="abody"><strong>${esc(ti)}</strong><span class="sub">${esc(tx)}${pv&&NH.user?` <span class="privtag">${esc(pv)}</span>`:''}</span></span></li>`).join('')+`</ol>`;
  }
  if(NH.user) h+=`<div id="notes-top" class="notes"></div>`;
  if(d.wash) h+=`<div class="callout washing"><span class="ico">${WASH}</span><span><b>Was afgeven</b>${esc(d.wash)}</span></div>`;
  if(d.note) h+=cal(IC_LET,'Let op',d.note);
  if(d.tip)  h+=cal(IC_TIP,'Tip',d.tip);

  const exToday=EXC.filter(e=>dagNr(e[1])===cur);
  if(exToday.length){
    h+=`<h2>${exToday.some(e=>/^Geboekt/.test(e[2]))?'Geboekt en optioneel vandaag':'Optioneel vandaag'}</h2><ul class="list">`+
      exToday.map(([a,,c,om])=>`<li><div class="row"><span><strong>${esc(a)}</strong></span>`+
        `<span class="r${/^Geboekt/.test(c)?' booked':''}">${esc(c)}</span></div>`+
        (om?`<span class="sub" style="display:block;margin-top:4px">${esc(om)}</span>`:'')+
        `</li>`).join('')+`</ul>`;
  }
  const packToday=PACK.filter(p=>p[2].some(x=>dagNr(x)===cur));
  if(packToday.length){
    h+=`<h2>Uit je koffer vandaag</h2><ul class="list prac">`+
      packToday.map(([a,b])=>`<li><span class="b">✓</span><span><strong>${esc(a)}</strong>`+
        `<span class="sub">${esc(b)}</span></span></li>`).join('')+`</ul>`;
  }
  if(d.prac){
    h+=`<h2>Goed om te weten</h2><ul class="list prac">`+
      d.prac.map(x=>`<li><span class="b">•</span><span>${esc(x)}</span></li>`).join('')+`</ul>`;
  }
  if(d.wild){
    const dots=k=>`<span class="chance" title="${['','Geluk nodig','Goede kans','Bijna zeker'][k]}">${'●'.repeat(k)}${'○'.repeat(3-k)}</span>`;
    h+=`<h2>Dieren spotten</h2>`;
    if(d.emoe){
      const k=d.emoe[0];
      h+=`<div class="emoealert">${EMU}<span><b>Emoe-alert <span class="chance">${'●'.repeat(k)}${'○'.repeat(3-k)}</span></b>${esc(d.emoe[1])}</span></div>`;
    }
    h+=`<ul class="list wild">`+
      d.wild.map(([a,b,k])=>`<li>${PAW}<span class="wbody"><span class="wtop"><strong>${esc(a)}</strong>${dots(k)}</span><span class="sub">${esc(b)}</span></span></li>`).join('')+
      `</ul><div class="legend">`+
      // dezelfde bolletjes als in de lijst, zodat de afstanden overeenkomen
      [[3,'bijna zeker'],[2,'goede kans'],[1,'geluk nodig']]
        .map(([k,l])=>`<span class="leg">${dots(k)}${l}</span>`).join('')+`</div>`;
  }
  if(d.food){
    h+=`<h2>Wat je hier moet proeven</h2><ul class="list">`+
      d.food.map(([a,b])=>`<li><strong>${esc(a)}</strong><span class="sub">${esc(b)}</span></li>`).join('')+`</ul>`;
  }
  // Notities die je vandaag nodig hebt (tickets, reserveringen) staan boven bij het programma.
  // De rest staat verderop, vlak voor het eten. Beide blokken worden in één slag gevuld.
  if(NH.user) h+=`<div id="notes-rest" class="notes"></div>`;
  const morgen=volgende(cur);
  if(morgen!=null&&morgen!==EINDE) h+=`<h2>Morgen</h2>`+dagKnop(morgen,true,!buiten);
  if(d.rest){
    // Suggesties, geen voorschrift: alles staat dicht, je klapt zelf uit wat je wilt lezen.
    h+=`<h2>Eten vanavond</h2>`+
      (d.rnote?`<div class="callout" style="margin:0 0 14px"><span class="ico">${IC_KLOK}</span><span><b>Openingstijden</b>${esc(d.rnote)}</span></div>`:'')+
      d.rest.map(([nm,wh,rt,pr,wk,no,bk],ix)=>{
      const meta=RDATA[nm]||{};
      let b='';
      if(rt){
        b+=`<span class="badge rate">${SRC} ${rt.toFixed(1).replace('.',',')}/5${meta.c?` · ${fmtCount(meta.c)} beoordelingen`:''}</span>`;
        if(rt<MIN_SCORE) b+=`<span class="badge low">Onder je norm van ${String(MIN_SCORE).replace('.',',')}</span>`;
      }
      const pl=PRICE[pr]; if(pl) b+=`<span class="badge">${pl[0]}</span><span class="badge">${pl[1]}</span>`;
      if(meta.sluit) b+=`<span class="badge">Sluit ${meta.sluit} · keuken vaak eerder</span>`;
      const q=encodeURIComponent(nm+', '+wh+', Australia');
      const url='https://www.google.com/maps/search/?api=1&query='+q;
      const origin=d.h?encodeURIComponent(d.h+', '+d.p+', Australia'):'';
      const dir=origin?`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${q}&travelmode=walking`:url;
      let travel='';
      if(wk===-1) travel=`<span class="badge">In je eigen hotel</span>`;   // geen looptijd, je bent er al
      else if(wk===0) travel=`<span class="badge">Vervoer nodig · taxi of bus</span>`;
      else if(wk){
        travel=`<span class="badge">≈ ${wk} min lopen</span>`;
        if(wk>=15) travel+=`<span class="badge">≈ ${Math.max(5,Math.round(wk/4)+2)} min taxi</span>`;
        if(d.shuttle) travel+=`<span class="badge">${esc(d.shuttle)}</span>`;
      }
      let btns=`<a class="btn" href="${dir}" target="_blank" rel="noopener">Route</a>`+
               `<a class="btn" href="${url}" target="_blank" rel="noopener">Op de kaart</a>`;
      if(meta.tel) btns+=`<a class="btn" href="tel:${meta.tel.replace(/\s+/g,'')}">Bellen</a>`;
      // Samenvatting op één regel: genoeg om te kiezen zonder open te klappen.
      const kort=[meta.k||'', rt?rt.toFixed(1).replace('.',',')+'/5':'', '€'.repeat(pr||1),
        wk===-1?'in je eigen hotel':(wk===0?'vervoer nodig':(wk?wk+' min lopen':''))].filter(Boolean).join(' · ');
      return `<details class="card rcard"><summary>`+
             `<span class="rtop"><span class="role">${ROLE[Math.min(ix,2)]}</span>`+
             `<span class="rname">${esc(nm)}</span>`+
             `<span class="rkort">${kort}</span></span><span class="rchev">${ICO_CHEV}</span></summary>`+
             `<div class="rbody">`+
             `<div class="badges">${b}${travel}</div>`+
             `<div class="where">${PIN}${esc(wh)}</div><p>${esc(no)}</p>`+
             (bk?`<div class="book"><b>Reserveren</b><span>${esc(bk)}</span></div>`:'')+
             `<div class="btns">${btns}</div>`+
             `<div class="checked">Score en openingstijden: ${SRC}, gecontroleerd ${CHECKED}. Prijzen zijn een schatting op basis van de prijsklasse.${wk>0?(meta.wv?' Looptijd volgens Google Maps, vanaf het hotel.':' Looptijd geschat vanaf het hotel, met een kwart opslag voor de omweg om bouwblokken en water. Tik op Route voor de werkelijke wandelroute.'):''}</div>`+
             `</div></details>`;
    }).join('')+
    // De app geeft hints. Ter plekke kijk je vaak toch even rond op de kaart.
    (()=>{const bij=encodeURIComponent('restaurants '+(d.h?d.h+', ':'')+d.p+', Australia');
      return `<a class="rmore" href="https://www.google.com/maps/search/?api=1&query=${bij}" target="_blank" rel="noopener">`+
        `<span>${PIN} Meer restaurants in de buurt${d.h?' van het hotel':''}</span><span class="rchev">${ICO_CHEV}</span></a>`;})();
  }
  // Toevoegen staat onderaan de dag, in de stroom: geen knop die over de tekst zweeft.
  if(NH.user) h+=`<div class="dagadd"><button class="btn" id="nadd">＋ Notitie toevoegen</button></div>`;
  document.getElementById('day').innerHTML=h;
  const mt=document.getElementById('meertekst');
  if(mt) mt.onclick=()=>{ const t=document.getElementById('dagtekst');
    const dicht=t.classList.toggle('inkort'); mt.textContent=dicht?'Meer':'Minder'; };
  if(NH.user){
    renderNotes(cur);
    // Buiten de groepsreis kan een nieuwe notitie je voorreiziger of nareiziger maken. Dan moet
    // ook het bladeren mee, dus alles verversen in plaats van alleen de notities.
    document.getElementById('nadd').onclick=()=>openSheet({
      dag:cur,wie:NH.user.displayName||NH.user.email,onDone:buiten?versRender:()=>renderNotes(cur)});
  }
  koppelGaNaar();
  zetPijlen();
  window.scrollTo(0,0);
}
const cal=(ico,label,txt)=>`<div class="callout"><span class="ico">${ico}</span><span><b>${label}</b>${esc(txt)}</span></div>`;

// ---- Buiten de groepsreis: startpagina, voorreis- en nareisdagen, afsluitpagina ----
// Posities in het bladeren: 0 is de startpagina, -1 t/m -VOOR de voorreis, 1 t/m 29 de groepsreis,
// 30 en hoger de nareis, EINDE de afsluitpagina. Wie een voorreis- of nareisnotitie heeft geschreven,
// is voorreiziger of nareiziger. Dat volgt uit de notities, niet uit de code.
const alleNotities=()=>LS.get('aus_cache_all')||[];
const voorreiziger=()=>!!NH.user&&alleNotities().some(it=>it.dag<0&&it.user_id===NH.user.id);
const nareiziger=()=>!!NH.user&&alleNotities().some(it=>it.dag>29&&it.user_id===NH.user.id);
// Voorreis en nareis bestaan voor iedereen die is ingelogd, ook zonder notities, zodat je kunt meekijken.
const heeftVoor=()=>!!NH.user&&VOOR>0;
const heeftNa=()=>!!NH.user&&NA>0;
// Welke pagina 'Vandaag' toont. Vóór de reis de startpagina, behalve voor een voorreiziger tijdens
// zijn voorreis: die ziet zijn eigen dag. Na de reis de afsluitpagina, behalve voor een nareiziger
// tijdens zijn nareis (zonder nareis: dag 29). Wie thuis nog wacht, komt bij de voorreisnotities
// via de kaart Voorreis op de startpagina of door terug te bladeren vanaf dag 1.
function vandaagPagina(){
  if(T.before) return (T.dag!=null&&voorreiziger())?T.dag:0;
  if(T.after) return NA>0?((T.dag!=null&&nareiziger())?T.dag:EINDE):29;
  return T.raw;
}
// Bladeren. De pijl vanaf de startpagina volgt je eigen reis: een voorreiziger gaat naar de eerste
// voorreisdag, de anderen naar dag 1. Vanaf dag 1 terug kom je wel bij de voorreis, als die er is.
function volgende(c){
  if(c===0) return voorreiziger()?-VOOR:1;
  if(c<0) return c===-1?1:c+1;
  if(c>=1&&c<29) return c+1;
  if(c===29) return heeftNa()?30:(T.after&&NA>0?EINDE:null);
  if(c>29&&c<29+NA) return c+1;
  if(c>29&&c===29+NA) return T.after?EINDE:null;
  return null;
}
function vorige(c){
  if(c===EINDE) return heeftNa()?29+NA:29;
  if(c>30) return c-1;
  if(c===30) return 29;
  if(c>1&&c<=29) return c-1;
  if(c===1) return heeftVoor()?-1:(T.before?0:null);
  if(c<0) return c===-VOOR?(T.before?0:null):c-1;
  return null;
}
function ga(c){ if(c!=null){cur=c;render();} }
function zetPijlen(){
  document.getElementById('prev').disabled=vorige(cur)==null;
  document.getElementById('next').disabled=volgende(cur)==null;
}

// Knop naar een dag. Werkt voor reisdagen en voor voorreis- en nareisdagen, met of zonder programma.
// Als blok 'Morgen' (morgen=true) staat eronder of er een emoe-alert of wasdag aankomt, anders de plaats.
// koffer=false laat weg wat je vanavond moet klaarleggen. Dat hoort bij de groepsreis, dus wie op de
// laatste voorreisdag naar dag 1 kijkt, krijgt niet de paklijst van de vertrekdag uit Amsterdam.
function dagKnop(n,morgen,koffer){
  const d=dagData(n), buiten=isBuiten(n);
  const lbl=buiten?`${n<0?'Voorreis':'Nareis'} · ${fmtLong(dagDatum(n))}`:`Dag ${n} · ${fmtLong(dateFor(n))}`;
  let tt,sub='';
  if(d){
    const k=KIND[d.k];
    tt=esc(d.t);
    sub=morgen?[k?k[1]+k[0]:'',d.emoe?'emoe-alert':'',d.wash?'was afgeven':''].filter(Boolean).join(' · ')
              :[k?k[1]+k[0]:'',esc(d.p)].filter(Boolean).join(' · ');
  }else{
    const aantal=alleNotities().filter(it=>it.dag===n).length;
    tt=aantal?`${aantal} ${aantal===1?'notitie':'notities'}`:'Nog geen notities';
  }
  const p2=(morgen&&koffer!==false)?PACK.filter(p=>p[2].some(x=>dagNr(x)===n)).map(p=>p[0].toLowerCase()):[];
  return `<div class="tomorrow"><button class="ganaar" data-go="${n}">`+
    `<span class="txt"><span class="lbl">${lbl}</span><span class="tt">${tt}</span>`+
    (sub?`<span class="sub">${sub}</span>`:'')+
    (p2.length?`<span class="need">${CHECK}<span><b>Vanavond klaarleggen</b>${esc(p2.map((x,i)=>i?x:x.charAt(0).toUpperCase()+x.slice(1)).join(' · '))}</span></span>`:'')+
    `</span><span class="arw">→</span></button></div>`;
}
const koppelGaNaar=()=>document.querySelectorAll('.ganaar').forEach(b=>b.onclick=()=>ga(+b.dataset.go));
// Kop van de hero voor pagina's zonder eigen foto
function heroBuiten({tone,foto,eyebrow,num,titel,meta,track}){
  const hero=document.getElementById('hero');
  hero.style.setProperty('--tone',tone); hero.style.backgroundImage=`url(${foto})`; hero.classList.add('foto');
  document.documentElement.style.setProperty('--tone',tone);
  document.querySelector('meta[name=theme-color]').setAttribute('content',tone);
  document.getElementById('eyebrow').innerHTML=eyebrow;
  document.getElementById('num').innerHTML=num;
  document.getElementById('title').textContent=titel;
  document.getElementById('metabox').innerHTML=meta||''; document.getElementById('flagbox').innerHTML='';
  document.getElementById('track').style.width=track;
}

// Startpagina (vóór 1 oktober) en afsluitpagina (na de reis, als er een nareis is).
function renderBuiten(){
  const start=cur===0, vr=voorreiziger();
  const vandaagTxt=`<span class="dot live"></span>Vandaag · ${fmtLong(vandaagDatum())}`;
  const regios=Object.keys(REGION).filter(r=>r!=='reis'&&DAYS.some(d=>d.r===r));
  let h='';
  if(start){
    const kGroep=1-T.raw, kVoor=(-VOOR+1)-T.raw;   // dagen tot vertrek van de groep / van de voorreis
    // De kop noemt de reis. Het aftellen staat eronder, boven het raster.
    const bb=vr?beeldBuiten(true):{tone:TONE.reis,foto:'reg-reis.jpg'};
    heroBuiten({tone:bb.tone,foto:bb.foto,eyebrow:vandaagTxt,num:'Rondreis Australië',titel:'',track:'0%'});
    const k=vr?kVoor:kGroep, vertrek=vr?dagDatum(-VOOR):dateFor(1);
    h+=`<div class="aftel"><div class="anum">Nog ${k}<small>${k===1?'dag':'dagen'}</small></div><div class="asub">Vertrek ${fmtLong(vertrek)}</div></div>`;
    // De reis in beeld: een raster met per regio de foto die de app al heeft en, als er notities voor
    // zijn, de voorreis en nareis. Vliegdagen ('reis') tellen mee bij de regio waar je heen gaat, of bij
    // de laatste regio als er geen volgende is: dag 1 valt zo onder New South Wales, dag 28–29 onder
    // West-Australië. Tik op een kaart en je staat op de eerste dag ervan.
    const kaart=(go,naam,dagen,tone,foto)=>`<button type="button" class="regio ganaar" data-go="${go}" style="--tone:${tone};background-image:url(${foto})">`+
      `<span class="rnaam">${esc(naam)}</span><span class="rdagen">${dagen}</span></button>`;
    const bereik=(a,b)=>a.getMonth()===b.getMonth()?`${a.getDate()}–${fmtShort(b)}`:`${fmtShort(a)} – ${fmtShort(b)}`;
    const dagen=(a,b)=>a===b?`Dag ${a}`:`Dag ${a}–${b}`;
    const regioVan=i=>{ if(DAYS[i].r!=='reis') return DAYS[i].r;
      const na=DAYS.slice(i+1).find(d=>d.r!=='reis'), voor=[...DAYS.slice(0,i)].reverse().find(d=>d.r!=='reis');
      return (na||voor).r; };
    const per={}; DAYS.forEach((d,i)=>{ (per[regioVan(i)]=per[regioVan(i)]||[]).push(d.n); });
    h+=`<div class="regios">`+
      (heeftVoor()?kaart(T.dag!=null&&T.dag<0?T.dag:-VOOR,'Voorreis',bereik(dagDatum(-VOOR),dagDatum(-1)),beeldBuiten(true).tone,beeldBuiten(true).foto):'')+
      regios.map(r=>{ const dg=per[r], a=Math.min(...dg), b=Math.max(...dg);
        return kaart(a,REGION[r],dagen(a,b),TONE[r],`reg-${r}.jpg`);}).join('')+
      (heeftNa()?kaart(T.dag!=null&&T.dag>29?T.dag:30,'Nareis',bereik(dagDatum(30),dagDatum(29+NA)),beeldBuiten(false).tone,beeldBuiten(false).foto):'')+`</div>`;
  } else {
    heroBuiten({tone:beeldBuiten(false).tone,foto:beeldBuiten(false).foto,eyebrow:vandaagTxt,num:`Reis voorbij<small>29 dagen Australië</small>`,
      titel:`De groepsreis eindigde ${fmtLong(dateFor(29))}`,track:'100%'});
    h+=`<h2>Terugkijken</h2>`+dagKnop(29);
  }
  document.getElementById('navlabel').textContent='Vandaag';
  if(NH.user) h+=`<div class="dagadd"><button class="btn" id="nadd">＋ Notitie toevoegen</button></div>`;
  document.getElementById('day').innerHTML=h;
  koppelGaNaar();
  if(NH.user){
    document.getElementById('nadd').onclick=()=>openSheet({
      dag:T.dag??(LS.get('aus_laatste_dag')??0),wie:NH.user.displayName||NH.user.email,kiesDag:true,onDone:versRender});
  }
  zetPijlen();
  window.scrollTo(0,0);
}

const versRender=()=>syncAlles(true).then(()=>render());

// Eén voorreis- of nareisdag zonder programma: dezelfde kop als een reisdag, met alleen notities als
// inhoud. Een dag mét programma (voorreis.js) gaat via render().
function renderBuitenDag(){
  const dag=cur, voor=dag<0, date=dagDatum(dag);
  const isToday=T.dag===dag;
  const volgnr=buitenVolgnr(dag), tot=voor?VOOR:NA;
  heroBuiten({tone:beeldBuiten(voor).tone,foto:beeldBuiten(voor).foto,
    eyebrow:(isToday?`<span class="dot live"></span>Vandaag · `:`<span class="dot" style="background:rgba(255,255,255,.4)"></span>`)+fmtLong(date),
    num:`${voor?'Voorreis':'Nareis'}<small>dag ${volgnr} van ${tot}</small>`,
    titel:fmtLong(date).replace(/^./,c=>c.toUpperCase()),track:'0%'});
  document.getElementById('navlabel').textContent=isToday?'Vandaag':fmtShort(date);
  const aantal=alleNotities().filter(it=>it.dag===dag).length+pendingVan('dagitems').filter(p=>p.dag===dag).length;
  // Alleen #notes-rest: dan zet renderNotes alles in één lijst, op soort gesorteerd zoals in het tabblad Notities.
  let h=aantal?`<div id="notes-rest" class="notes"></div>`:`<div class="empty">Nog geen notities voor deze dag.</div>`;
  h+=`<div class="dagadd"><button class="btn" id="nadd">＋ Notitie toevoegen</button></div>`;
  document.getElementById('day').innerHTML=h;
  koppelGaNaar();
  renderNotes(dag);
  document.getElementById('nadd').onclick=()=>openSheet({dag,wie:NH.user.displayName||NH.user.email,onDone:()=>{syncAlles(true).then(()=>render());}});
  zetPijlen();
  window.scrollTo(0,0);
}

const IC_LET='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4.5M12 17.2h.01"/></svg>';
const IC_TIP='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .9 1.6h5.2c.1-.6.4-1.2.9-1.6A6 6 0 0 0 12 3Z"/></svg>';
const IC_KLOK='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>';
const IC_SLOT='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10.5" width="16" height="10.5" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/></svg>';
const IC_KOFFER='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7.5" width="18" height="13" rx="2.5"/><path d="M8.5 7.5V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v2.5"/><path d="M3 12.5h18"/></svg>';
const PLUS='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
const WIS='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6 18 18M18 6 6 18"/></svg>';
const MAG='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

// doorzoekbare tekst per dag, met vermelding waar het vandaan komt. N is het dagnummer voor EXC en PACK
function hooiberg(d,n){
  const bits=[[d.t,'Titel'],[d.p,'Plaats']];
  if(REGION[d.r]) bits.push([REGION[d.r],'Regio']);
  if(d.h) bits.push([d.h,'Hotel']);
  if(d.emoe) bits.push(['Emoe-alert: '+d.emoe[1],'Emoe-alert']);
  (d.wild||[]).forEach(w=>bits.push([w[0]+' — '+w[1],'Dieren spotten']));
  (d.agenda||[]).forEach(a=>bits.push([a[0]+' '+a[1]+'. '+a[2],'Tijdschema']));
  (d.fl||[]).forEach(f=>bits.push([f[0]+' '+f[1]+' → '+f[2]+', vertrek '+f[3]+', aankomst '+f[4]+'. '+f[5],'Vlucht']));
  d.body.forEach(x=>bits.push([x,'Programma']));
  (d.prac||[]).forEach(x=>bits.push([x,'Goed om te weten']));
  (d.food||[]).forEach(([a,b])=>bits.push([a+' — '+b,'Specialiteit']));
  (d.rest||[]).forEach(r=>bits.push([r[0]+((RDATA[r[0]]||{}).k?' — '+RDATA[r[0]].k:'')+' — '+r[1]+'. '+r[5]+(r[6]?' Reserveren: '+r[6]:''),'Restaurant']));
  if(d.note) bits.push([d.note,'Let op']);
  if(d.rnote) bits.push([d.rnote,'Openingstijden']);
  EXC.filter(e=>dagNr(e[1])===n).forEach(e=>bits.push([e[0]+' — '+e[3]+' Richtprijs '+e[2]+'.','Optionele excursie']));
  if(d.tip) bits.push([d.tip,'Tip']);
  if(d.wash) bits.push([d.wash,'Was afgeven']);
  PACK.filter(p=>p[2].some(x=>dagNr(x)===n)).forEach(p=>bits.push([p[0]+' — '+p[1],'Uit je koffer']));
  return bits;
}
const HAY=DAYS.map(d=>hooiberg(d,d.n));
// Voorreis- en nareisdagen met programma, op interne dagnummer. Alleen doorzocht voor wie is ingelogd.
const HAY_BUITEN=[...VOORDG,...NADG].map(d=>[dagNr(d.datum),hooiberg(d,dagNr(d.datum))]);
// Praktische informatie is niet aan een dag gebonden. Zoekresultaten hiervan openen het tabblad Praktisch
const HAY_PRAKT=[
  [SOS[0]+' — '+SOS[1],'Noodgevallen'],
  ...NOOD.map(([a,b])=>[a+' — '+b,'Noodgevallen']),
  ['Bagage — '+BAGAGE,'Bagage'],
  ...Object.values(CHECKIN).map(c=>[c[0]+' — online inchecken '+c[2],'Vluchten en boekingen'])
];

function snippet(text,term){
  const i=text.toLowerCase().indexOf(term);
  let from=Math.max(0,i-55), to=Math.min(text.length,i+term.length+95);
  if(from>0){const sp=text.indexOf(' ',from); if(sp>-1&&sp<i) from=sp+1}
  let out=esc(text.slice(from,to));
  const re=new RegExp('('+term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig');
  out=out.replace(re,'<mark>$1</mark>');
  return (from>0?'… ':'')+out+(to<text.length?' …':'');
}

// Boekingscodes staan in een Ticket-notitie: regels als "SQ: ABC123" of "Sawadee: 12345".
// Ze komen uit de lokale kopie, zodat het ook offline werkt. Zonder login: niets.
function boekingscode(sleutel){
  if(!NH.user) return null;
  const alle=LS.get('aus_cache_all')||[];
  const re=new RegExp('^\\s*'+sleutel+'\\s*[:=\\-–]\\s*([A-Z0-9]{4,12})\\s*$','im');
  // Tickets van een voorreis of nareis zijn van één persoon en tellen niet mee voor de groepsvluchten.
  for(const it of alle){ if(it.type!=='ticket'||!it.tekst||isBuiten(it.dag)) continue; const m=it.tekst.match(re); if(m) return m[1].toUpperCase(); }
  return null;
}
// notities uit de lokale kopie, zodat zoeken ook offline werkt
function notitieTreffers(term){
  if(!NH.user) return [];
  const alle=LS.get('aus_cache_all')||[];
  const uit=[];
  alle.forEach(it=>{
    const tekst=[it.tekst,it.naam].filter(Boolean).join(' — ');
    if(!tekst.toLowerCase().includes(term)) return;
    uit.push({dag:it.dag,type:it.type,tekst,bron:(it.soort==='bestand'?'Bijlage':'Notitie')+' · '+typeLabel(it.type)+' · '+(it.wie||'')});
  });
  return uit;
}
function drawResults(term){
  const box=document.getElementById('results');
  term=(term||'').trim().toLowerCase();
  if(term.length<2){
    // Voorreis en nareis krijgen één samenvattende regel. Per dag zou het een rij lege regels worden,
    // want zonder programma is er alleen een datum. De notities zelf vind je via het zoekveld hierboven.
    const aantal=b=>alleNotities().filter(it=>b==='voor'?it.dag<0:it.dag>29).length;
    const buitenRegel=(b,eerste,laatste)=>{
      const n=aantal(b), vandaag=T.dag!=null&&(b==='voor'?T.dag<0:T.dag>29);
      return `<ul class="idx"><li${vandaag?' class="now"':''}><button data-n="${vandaag?T.dag:eerste}">`+
        `<span class="bar" style="background:${beeldBuiten(b==='voor').tone}"></span>`+
        `<span class="t">${b==='voor'?'Voorreis':'Nareis'} · ${n?`${n} ${n===1?'notitie':'notities'}`:'nog geen notities'}</span>`+
        `<span class="d">${fmtShort(dagDatum(eerste))} – ${fmtShort(dagDatum(laatste))}</span></button></li></ul>`;
    };
    // Zodra er programma is, staat elke dag apart, net als bij de groepsreis. Een dag zonder
    // programma toont dan het aantal notities.
    const buitenLijst=(eerste,laatste)=>{
      let s=`<ul class="idx">`;
      for(let n=eerste;n<=laatste;n++){
        const d=buitenData(n), aantal=alleNotities().filter(it=>it.dag===n).length;
        s+=`<li${T.dag===n?' class="now"':''}><button data-n="${n}"><span class="bar" style="background:${beeldBuiten(n<0).tone}"></span>`+
          `<span class="n">${buitenVolgnr(n)}</span>`+
          `<span class="t">${d?esc(d.t):(aantal?`${aantal} ${aantal===1?'notitie':'notities'}`:'Nog geen notities')}</span>`+
          (d&&KIND[d.k]?`<span class="k" title="${KIND[d.k][0]}">${KIND[d.k][1]}</span>`:'')+
          (d&&d.emoe?`<span class="e" title="Emoe-alert">${EMU}</span>`:'')+
          (d&&d.wash?`<span class="w">${WASH}</span>`:'')+
          `<span class="d">${fmtShort(dagDatum(n))}</span></button></li>`;
      }
      return s+`</ul>`;
    };
    const heeftV=heeftVoor(), heeftN=heeftNa();
    let h='';
    if(heeftV) h+=`<h2>Voorreis</h2>`+(VOORDG.length?buitenLijst(-VOOR,-1):buitenRegel('voor',-VOOR,-1));
    if(heeftV||heeftN) h+=`<h2>Groepsreis</h2>`;
    h+=`<ul class="idx">`;
    DAYS.forEach(d=>{
      const now=(!T.before&&!T.after&&d.n===T.n)?' class="now"':'';
      h+=`<li${now}><button data-n="${d.n}"><span class="bar" style="background:${TONE[d.r]}"></span>`+
         `<span class="n">${d.n}</span><span class="t">${esc(d.t)}</span>`+
         (KIND[d.k]?`<span class="k" title="${KIND[d.k][0]}">${KIND[d.k][1]}</span>`:'')+
         (d.emoe?`<span class="e" title="Emoe-alert">${EMU}</span>`:'')+
         (d.wash?`<span class="w">${WASH}</span>`:'')+
         `<span class="d">${fmtShort(dateFor(d.n))}</span></button></li>`;
    });
    h+=`</ul>`;
    if(heeftN) h+=`<h2>Nareis</h2>`+(NADG.length?buitenLijst(30,29+NA):buitenRegel('na',30,29+NA));
    box.innerHTML=h;
  }else{
    let h='',hits=0;
    // eerst je eigen notities: die zoek je meestal gerichter
    notitieTreffers(term).forEach(t=>{
      hits++;
      const verz=isVerz(t);
      h+=`<li><button data-n="${verz?'verz':t.dag}"><div class="top">`+
         `<span class="dn">${verz?'Praktisch':t.dag===0?'Algemeen':isBuiten(t.dag)?(t.dag<0?'Voorreis':'Nareis'):'Dag '+t.dag}</span>`+
         `<span class="dt">${verz?'Verzekeringen':t.dag===0?'Niet aan een dag':isBuiten(t.dag)?(buitenData(t.dag)?esc(buitenData(t.dag).t):fmtLong(dagDatum(t.dag))):esc(DAYS[t.dag-1].t)}</span>`+
         `<span class="dd">${t.dag===0?'':fmtShort(dagDatum(t.dag))}</span></div>`+
         `<div class="sn">${snippet(t.tekst,term)}</div>`+
         `<div class="src">${esc(t.bron)}</div></button></li>`;
    });
    // Programma van de voorreis en nareis, alleen voor wie is ingelogd (net als de dagen zelf).
    // De voorreis staat vóór de groepsreis, de nareis erna: op volgorde van de reis.
    const buitenHits=voor=>{ if(!NH.user) return;
      HAY_BUITEN.filter(([n])=>voor?n<0:n>29).forEach(([n,bits])=>{
        const hit=bits.find(([txt])=>txt.toLowerCase().includes(term));
        if(!hit) return;
        hits++;
        h+=`<li><button data-n="${n}"><div class="top">`+
           `<span class="dn">${n<0?'Voorreis':'Nareis'}</span><span class="dt">${esc(buitenData(n).t)}</span>`+
           `<span class="dd">${fmtShort(dagDatum(n))}</span></div>`+
           `<div class="sn">${snippet(hit[0],term)}</div>`+
           `<div class="src">${hit[1]}</div></button></li>`;
      }); };
    buitenHits(true);
    DAYS.forEach((d,ix)=>{
      const hit=HAY[ix].find(([txt])=>txt.toLowerCase().includes(term));
      if(!hit)return;
      hits++;
      h+=`<li><button data-n="${d.n}"><div class="top">`+
         `<span class="dn">Dag ${d.n}</span><span class="dt">${esc(d.t)}</span>`+
         `<span class="dd">${fmtShort(dateFor(d.n))}</span></div>`+
         `<div class="sn">${snippet(hit[0],term)}</div>`+
         `<div class="src">${hit[1]}</div></button></li>`;
    });
    buitenHits(false);
    HAY_PRAKT.filter(([txt])=>txt.toLowerCase().includes(term)).slice(0,3).forEach(hit=>{
      hits++;
      h+=`<li><button data-n="prakt"><div class="top"><span class="dn">Praktisch</span><span class="dt">${esc(hit[1])}</span></div>`+
         `<div class="sn">${snippet(hit[0],term)}</div><div class="src">Tabblad Praktisch</div></button></li>`;
    });
    box.innerHTML=hits?`<ul class="hits">${h}</ul>`
      :`<div class="empty">Niets gevonden voor “${esc(term)}”.</div>`;
  }
  box.querySelectorAll('button[data-n]').forEach(b=>
    b.addEventListener('click',()=>{const n=b.dataset.n;
      // 'prakt' is het tabblad Praktisch, 'verz' het blok Verzekeringen daarin, 0 is een algemene
      // notitie. Al het andere is een dag, ook een negatieve (voorreis) of een boven de 29 (nareis).
      if(n==='prakt') switchTo('prakt');
      else if(n==='verz') naarPraktisch('verz');
      else if(+n===0) switchTo('alles');
      else {cur=+n;switchTo('day')}}));
}

function renderIndex(){
  document.getElementById('index').innerHTML=
    `<div class="search"><span class="mag">${MAG}</span>`+
    `<input id="q" type="search" placeholder="Zoek in de hele reis…" autocomplete="off" `+
    `autocorrect="off" autocapitalize="none" spellcheck="false">`+
    `<button class="wis" id="qwis" type="button" aria-label="Zoekveld wissen" hidden>${WIS}</button></div><div id="results"></div>`;
  const q=document.getElementById('q'), qw=document.getElementById('qwis');
  const toon=()=>{qw.hidden=!q.value};
  q.addEventListener('input',()=>{toon();drawResults(q.value)});
  qw.addEventListener('click',()=>{q.value='';toon();drawResults('');q.focus()});
  drawResults('');
}

function clockHTML(){
  // Op de start- en afsluitpagina is er geen dag: neem dan de eerste of laatste dag met een tijdzone,
  // zodat je vóór vertrek al ziet hoe laat het in Sydney is.
  const metTz=DAYS.filter(x=>x.tz!==null&&x.tz!==undefined);
  // Een voorreis- of nareisdag met programma én tijdzone telt als eigen dag (null is 'onderweg').
  const b=isBuiten(cur)?buitenData(cur):null;
  const d=(b&&'tz' in b)?b:cur<1?metTz[0]:cur>29?metTz[metTz.length-1]:DAYS[cur-1];
  const heeft=d.tz!==null&&d.tz!==undefined;
  // verschil met Nederland uitrekenen
  let diff='';
  if(heeft){
    const nu=new Date();
    const nl=new Date(nu.toLocaleString('en-US',{timeZone:'Europe/Amsterdam'}));
    const utc=nu.getTime()+nu.getTimezoneOffset()*60000;
    const daar=new Date(utc+d.tz*3600000);
    const u=Math.round((daar-nl)/360000)/10;
    const heel=Math.floor(Math.abs(u)), half=Math.abs(u)%1>=.4;
    diff=`${heel}${half?' en een half':''} uur ${u>0?'voor':'achter'} op Nederland`;
  }
  const here=heeft
    ?`<div class="clockcard here"><div class="lbl">${PIN}Ter plaatse</div>`+
     `<div class="t">${offsetTime(d.tz)}</div><div class="sub">${esc(d.p)}</div>`+
     `<div class="diff">${diff}</div></div>`
    :`<div class="clockcard here"><div class="lbl">${PLANE}Onderweg</div>`+
     `<div class="t">—</div><div class="sub">In het vliegtuig</div>`+
     `<div class="diff">Zet je telefoon op automatische tijd</div></div>`;
  return `<div class="clock">${here}`+
    `<div class="clockcard"><div class="lbl">${HOME}Thuis</div>`+
    `<div class="t">${nlTime()}</div><div class="sub">Nederland</div>`+
    `<div class="diff">${new Intl.DateTimeFormat('nl-NL',{timeZone:'Europe/Amsterdam',weekday:'long',day:'numeric',month:'long'}).format(new Date())}</div></div></div>`;
}
function renderPrakt(){
  let h=`<h2>Hoe laat is het</h2><div id="clockbox">${clockHTML()}</div>`;
  h+=`<h2>Wisselkoers</h2><div id="koers"></div>`;

  h+=`<h2>Noodgevallen</h2>
   <div class="sos"><div class="big">${esc(SOS[0])}</div>
   <p>${esc(SOS[1])}</p></div>
   <ul class="list">`+NOOD.map(([a,b])=>`<li><strong>${esc(a)}</strong><span class="sub">${linkify(b)}</span></li>`).join('')+`</ul>`;
  // Verzekeringsgegevens: notities van het type Verzekering, voor iedereen zichtbaar, door de
  // schrijver te wijzigen. Ze staan hier omdat je ze in een noodgeval als eerste zoekt.
  // Zonder login bestaat het blok niet, net als het tabblad Notities.
  if(NH.user) h+=`<h2>Verzekeringen</h2><div id="verz"></div>`;

  // Vluchten per maatschappij, afgeleid uit de dagen zelf: één bron
  const perMij={};
  DAYS.forEach(d=>(d.fl||[]).forEach(f=>{const k=f[0].split(' ')[0];(perMij[k]=perMij[k]||[]).push(f[0]);}));
  const codeCel=k=>{const bc=boekingscode(k);return bc?`<span class="r">${esc(bc)}</span>`:(NH.user?'':`<span class="r" style="opacity:.5">na inloggen</span>`)};
  h+=`<h2>Vluchten en boekingen</h2><ul class="list">`+
   Object.keys(CHECKIN).filter(k=>perMij[k]).map(k=>{const c=CHECKIN[k];
     return `<li><div class="row"><span><strong><a href="${c[1]}" target="_blank" rel="noopener">${esc(c[0])}${EXT}</a></strong>`+
       `<span class="sub">${[...new Set(perMij[k])].map(esc).join(' · ')} — inchecken ${esc(c[2])}</span></span>${codeCel(k)}</div></li>`;}).join('')+
   BOEKINGEN.map(([a,b,k])=>`<li><div class="row"><span><strong>${esc(a)}</strong><span class="sub">${linkify(b)}</span></span>${codeCel(k)}</div></li>`).join('')+
   `</ul>`+
   (NH.user&&!Object.keys(CHECKIN).some(boekingscode)
     ?`<div class="callout" style="margin-top:12px"><span class="ico">${IC_SLOT}</span><span><b>Boekingscodes toevoegen</b>Maak in Notities één notitie van het type Ticket, met per regel een maatschappij en de code, bijvoorbeeld <code>SQ: ABC123</code>. De codes verschijnen dan hier en bij de vluchten. Ze staan zo veilig achter de login en niet in de openbare app.</span></div>`:'')+
   `<div class="callout" style="margin-top:12px"><span class="ico">${IC_KOFFER}</span><span><b>Bagage</b>${esc(BAGAGE)}</span></div>`;

  h+=`<h2>Weergave</h2><div class="chips" id="themekeuze">`+
     THEMES.map(([k,l,ico])=>`<button type="button" class="chip" data-th="${k}">${ico}${l}</button>`).join('')+`</div>`;
  h+=`<h2>Notities</h2><div id="acct"></div>`;
  document.getElementById('prakt').innerHTML=h;
  renderKoers(document.getElementById('koers'));
  renderVerzekeringen(document.getElementById('verz'));
  const tk=document.getElementById('themekeuze');
  const markeer=()=>tk.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c.dataset.th===THEMES[themeIx][0]));
  tk.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{ themeIx=THEMES.findIndex(t=>t[0]===c.dataset.th); applyTheme(); markeer(); });
  markeer();
  renderAccount(document.getElementById('acct'));
  clearInterval(clockTimer);
  clockTimer=setInterval(()=>{
    const el=document.getElementById('clockbox');
    if(el&&view==='prakt') el.innerHTML=clockHTML(); else clearInterval(clockTimer);
  },20000);
}

// De periode onder 'Alle dagen' loopt vanaf de eerste voorreisdag als iemand die heeft.
const reisPeriode=()=>{
  const eind=dateFor(29), start=heeftVoor()?dagDatum(-VOOR):dateFor(1);
  return `${start.getDate()} ${start.getMonth()===eind.getMonth()?'':MN[start.getMonth()]} `.replace('  ',' ')+
    `t/m ${eind.getDate()} ${MN[eind.getMonth()]} ${eind.getFullYear()}`;
};
const BANNERS={
  index:['banner-dagen.jpg','Alle dagen',null],
  alles:['banner-notities.jpg','Notities',''],
  prakt:['banner-praktisch.jpg','Praktisch',''],
  dieren:['banner-dieren.jpg','Dieren','Gespot onderweg']
};
function renderKop(v){
  const hero=document.getElementById('hero');
  if(v==='day'){ hero.classList.remove('banner'); hero.innerHTML=HERO_HTML; render(); return; }
  const [img,titel,sub0]=BANNERS[v];
  const sub=v==='index'?reisPeriode():sub0;
  // Bij Dieren staat de dag als label in de kop. De lijst Kans hoeft hem dan niet te herhalen.
  // Vóór vertrek is er geen dag, dan blijft het label weg
  const label=v==='dieren'&&NH.user&&waarnDag()?dagLabel(waarnDag()):'';
  hero.classList.add('banner'); hero.classList.remove('foto');
  hero.style.backgroundImage=`url(${img})`;
  hero.innerHTML=`<div class="wrap">${label?`<span class="blabel">${esc(label)}</span>`:''}`+
    `<p class="btitel">${titel}</p>${sub?`<p class="bsub">${sub}</p>`:''}</div>`+
    `<div class="track"><i style="width:0"></i></div>`;
  document.querySelector('meta[name=theme-color]').setAttribute('content','#0E1013');
}
function switchTo(v){
  view=v;
  document.getElementById('day').style.display=v==='day'?'block':'none';
  document.getElementById('index').style.display=v==='index'?'block':'none';
  document.getElementById('prakt').style.display=v==='prakt'?'block':'none';
  document.getElementById('alles').style.display=v==='alles'?'block':'none';
  document.getElementById('dieren').style.display=v==='dieren'?'block':'none';
  document.getElementById('foot').style.display=v==='prakt'?'block':'none';
  document.getElementById('navbar').style.display=v==='day'?'block':'none';
  [['btnToday','day'],['btnIndex','index'],['btnPrakt','prakt'],['btnAlles','alles'],['btnDieren','dieren']].forEach(([id,k])=>{
    const b=document.getElementById(id); b.classList.toggle('on',v===k); b.setAttribute('aria-pressed',v===k);
  });
  renderKop(v);
  if(v==='index'){renderIndex();window.scrollTo(0,0)}
  else if(v==='prakt'){renderPrakt();window.scrollTo(0,0)}
  else if(v==='alles'){renderAlles();window.scrollTo(0,0)}
  else if(v==='dieren'){renderDieren();window.scrollTo(0,0)}
}
// Notities en Dieren bestaan alleen voor wie is ingelogd, want beide schrijven op naam.
function toonTabs(){
  document.getElementById('btnAlles').hidden=!NH.user;
  document.getElementById('btnDieren').hidden=!NH.user;
  document.querySelector('.tabbar .inner').classList.toggle('vier',!!NH.user);
  if(!NH.user&&(view==='alles'||view==='dieren')) switchTo('day');
}
document.getElementById('prev').onclick=()=>ga(vorige(cur));
document.getElementById('next').onclick=()=>ga(volgende(cur));
document.getElementById('btnToday').onclick=()=>{cur=vandaagPagina();switchTo('day')};
document.getElementById('btnIndex').onclick=()=>switchTo(view==='index'?'day':'index');
document.getElementById('btnPrakt').onclick=()=>switchTo(view==='prakt'?'day':'prakt');
document.getElementById('btnAlles').onclick=()=>switchTo(view==='alles'?'day':'alles');
document.getElementById('btnDieren').onclick=()=>switchTo(view==='dieren'?'day':'dieren');
document.addEventListener('keydown',e=>{
  if(view!=='day')return;
  if(e.target.matches('input,textarea,select')||document.getElementById('sheet'))return;
  if(e.key==='ArrowLeft') ga(vorige(cur));
  if(e.key==='ArrowRight') ga(volgende(cur));
});
const THEMES=[
 ['light','Licht','<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'],
 ['dark','Donker','<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>']
];
let themeIx=(()=>{const v=localStorage.getItem('aus_thema');const i=THEMES.findIndex(t=>t[0]===v);return i<0?0:i})();
function applyTheme(){
  const [key,label,ico]=THEMES[themeIx];
  const root=document.documentElement;
  root.setAttribute('data-theme',key);
  try{localStorage.setItem('aus_thema',key)}catch(e){}
  // iOS herverft de body niet altijd bij een themawissel: expliciet zetten en forceren
  const bg=getComputedStyle(root).getPropertyValue('--bg').trim();
  root.style.backgroundColor=bg;
  document.body.style.backgroundColor='transparent'; // de glasachtergrond zit op body::before
  document.body.style.opacity='0.999';
  requestAnimationFrame(()=>{document.body.style.opacity=''});
}
applyTheme();

// Vegen tussen dagen: alleen een duidelijk horizontale beweging telt,
// zodat scrollen (ook schuin) nooit per ongeluk een dag verspringt.
let x0=null,y0=null,t0=0;
document.addEventListener('touchstart',e=>{
  const t=e.changedTouches[0]; x0=t.clientX; y0=t.clientY; t0=Date.now();
},{passive:true});
document.addEventListener('touchend',e=>{
  if(x0===null||view!=='day')return;
  const t=e.changedTouches[0];
  const dx=t.clientX-x0, dy=t.clientY-y0, dt=Date.now()-t0;
  x0=y0=null;
  if(Math.abs(dx)<110) return;              // te kort
  if(Math.abs(dy)>45) return;               // te veel verticaal
  if(Math.abs(dx)<3*Math.abs(dy)) return;   // te schuin
  if(dt>700) return;                        // te traag: dat is slepen, geen vegen
  if(dx<0) ga(volgende(cur)); else if(dx>0) ga(vorige(cur));
},{passive:true});
// ============================================================
//  NOTITIES EN TICKETS, opslag bij Nhost (Frankfurt)
//  Zichtbaar voor wie inlogt. De server geeft alleen de rijen
//  van de groepsleden terug. Zonder inloggen bestaat dit blok niet.
// ============================================================
const NHOST_SUB='gjqqtpteurwdbealgmqh', NHOST_REG='eu-central-1';
const NH_AUTH=`https://${NHOST_SUB}.auth.${NHOST_REG}.nhost.run/v1`;
const NH_GQL=`https://${NHOST_SUB}.hasura.${NHOST_REG}.nhost.run/v1/graphql`;
const NH_STORE=`https://${NHOST_SUB}.storage.${NHOST_REG}.nhost.run/v1`;
const NH={user:null,access:null,exp:0,refresh:null};

// opslag op de telefoon: sessie, kopie van de notities, en wat nog verstuurd moet worden
const LS={
  get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},
  del(k){try{localStorage.removeItem(k)}catch(e){}}
};
function setSession(sess){
  if(!sess){NH.user=null;NH.access=null;NH.refresh=null;NH.exp=0;LS.del('aus_sess');return;}
  NH.user=sess.user;NH.access=sess.accessToken;NH.refresh=sess.refreshToken;
  NH.exp=Date.now()+((sess.accessTokenExpiresIn||900)-60)*1000;
  LS.set('aus_sess',{refreshToken:NH.refresh,tijd:Date.now(),user:{id:NH.user.id,displayName:NH.user.displayName,email:NH.user.email}});
}
// Alleen een 401 van de server betekent dat de sessie echt is verlopen. Bij elke andere storing,
// zoals vliegtuigmodus, wegvallend bereik of een radio die net weer opstart, mag je niet uitloggen.
function herstelUitKopie(saved,rt){
  const MAX=30*24*3600*1000;   // een maand: langer dan de reis duurt
  if(saved&&saved.user&&saved.tijd&&Date.now()-saved.tijd<MAX){
    NH.user=saved.user; NH.refresh=rt; return true;
  }
  return false;
}
// Er loopt altijd maar één vernieuwing tegelijk. Nhost geeft bij elke vernieuwing een nieuwe
// refresh token uit. Twee gelijktijdige aanvragen met dezelfde oude token zouden de tweede een
// 401 opleveren, en die zou hier ten onrechte als 'sessie verlopen' gelden.
let _refresh=null;
function nhRefresh(){
  if(!_refresh) _refresh=vernieuwSessie().finally(()=>{_refresh=null});
  return _refresh;
}
async function vernieuwSessie(pogingen){
  const saved=LS.get('aus_sess'); const rt=NH.refresh||(saved&&saved.refreshToken);
  if(!rt) return false;
  if(!navigator.onLine){ herstelUitKopie(saved,rt); return false; }   // niets te proberen: kopie gebruiken
  try{
    const r=await fetch(NH_AUTH+'/token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refreshToken:rt})});
    if(r.status===401){ setSession(null); return false; }        // sessie echt verlopen
    if(!r.ok){ herstelUitKopie(saved,rt); return false; }          // server hapert: ingelogd laten
    const j=await r.json(); setSession(j); return true;
  }catch(e){
    // netwerkfout: kort opnieuw proberen, want vlak na het uitzetten van de vliegtuigmodus
    // zegt de telefoon al 'online' terwijl de verbinding nog niet werkt
    if((pogingen||0)<2){
      await new Promise(r=>setTimeout(r,1200*((pogingen||0)+1)));
      return vernieuwSessie((pogingen||0)+1);
    }
    herstelUitKopie(saved,rt);
    return false;
  }
}
// Geeft alleen een token terug die nog geldig is. Na een mislukte vernieuwing dus niets,
// zodat we geen verlopen token naar Hasura sturen.
async function nhToken(){
  if(!NH.access||Date.now()>NH.exp) await nhRefresh();
  return (NH.access&&Date.now()<=NH.exp)?NH.access:null;
}
async function nhLogin(email,pw){
  const r=await fetch(NH_AUTH+'/signin/email-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:pw})});
  const j=await r.json().catch(()=>({}));
  if(!r.ok||!j.session) throw new Error(j.message||'Inloggen mislukt');
  setSession(j.session); return j.session.user;
}
// Bij uitloggen blijft er niets van de groep op de telefoon achter
async function wisPriveGegevens(){
  window._notZoek=''; window._notType=''; window._notVandaag=false; window._notBuiten='';
  await wisThumbUrls();
  try{ Object.keys(localStorage).filter(k=>k.startsWith('aus_')&&k!=='aus_thema'&&k!=='aus_koers').forEach(k=>localStorage.removeItem(k)); }catch(e){}
  try{ const db=await idb(); await new Promise(res=>{const t=db.transaction('files','readwrite').objectStore('files').clear();t.onsuccess=()=>res();t.onerror=()=>res()}); }catch(e){}
}
async function nhLogout(){ try{await fetch(NH_AUTH+'/signout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refreshToken:NH.refresh})})}catch(e){} setSession(null); }
// Een tijdelijke fout (geen verbinding, sessie even niet te vernieuwen, server antwoordt niet)
// mag later opnieuw. Een fout van Hasura zelf (rechten, ongeldige invoer) niet: die tonen we.
const tijdelijk=m=>{const e=new Error(m);e.tijdelijk=true;return e};
async function gql(query,variables){
  const t=await nhToken();
  if(!t){ if(!NH.user) throw new Error('Niet ingelogd'); throw tijdelijk(navigator.onLine?'Sessie kon niet worden vernieuwd':'Geen verbinding'); }
  let r; try{ r=await fetch(NH_GQL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},body:JSON.stringify({query,variables})}); }
  catch(e){ throw tijdelijk('Geen verbinding'); }
  let j; try{ j=await r.json(); }catch(e){ throw tijdelijk(`Server antwoordde met ${r.status}`); }
  if(j.errors) throw new Error(j.errors[0].message); return j.data;
}
const Q_ITEMS=`query($dag:Int!){dagitems(where:{dag:{_eq:$dag}},order_by:{created_at:asc}){id user_id dag soort type tekst wie file_id naam mime grootte created_at updated_at}}`;
const Q_ALL=`query{dagitems(order_by:{dag:asc,created_at:asc}){id user_id dag soort type tekst wie file_id naam mime grootte created_at updated_at}}`;
const M_INS=`mutation($o:dagitems_insert_input!){insert_dagitems_one(object:$o){id created_at}}`;
const M_UPD=`mutation($id:uuid!,$t:String,$ty:String){update_dagitems_by_pk(pk_columns:{id:$id},_set:{tekst:$t,type:$ty}){id}}`;
// types, in de volgorde waarin ze in de lijst staan. Verzekering staat achteraan: die gegevens
// hoop je niet nodig te hebben, dus in Notities staan ze helemaal onderin (en in Praktisch bij Noodgevallen).
const TYPES=[['ticket','Ticket'],['reservering','Reservering'],['adres','Adres'],['tip','Tip'],['notitie','Notitie'],['verzekering','Verzekering']];
const TYPE_STD=TYPES.findIndex(x=>x[0]==='notitie');
const typeLabel=t=>(TYPES.find(x=>x[0]===t)||TYPES[TYPE_STD])[1];
const typeRank=t=>{const i=TYPES.findIndex(x=>x[0]===t);return i<0?TYPE_STD:i};
const isVerz=it=>(it.type||'notitie')==='verzekering';
const M_DEL=`mutation($id:uuid!){delete_dagitems_by_pk(id:$id){id}}`;
// Waarnemingen van dieren: eigen tabel, dezelfde wachtrij en dezelfde kopie op de telefoon als notities.
const Q_WAARN=`query{waarnemingen(order_by:{gezien_op:asc}){id user_id dier dag gezien_op wie opmerking created_at}}`;
const M_INS_WAARN=`mutation($o:waarnemingen_insert_input!){insert_waarnemingen_one(object:$o){id}}`;
const M_DEL_WAARN=`mutation($id:uuid!){delete_waarnemingen_by_pk(id:$id){id}}`;
const alleWaarnemingen=()=>LS.get('aus_cache_waarn')||[];
// Dag apart bijwerken, alleen als hij echt verandert. Zo blijft gewoon bewerken werken
// ook als de rechten op de kolom dag ontbreken.
const M_UPD_DAG=`mutation($id:uuid!,$d:Int!){update_dagitems_by_pk(pk_columns:{id:$id},_set:{dag:$d}){id}}`;
async function verwijderItem(id,fileId){
  await gql(M_DEL,{id});
  if(fileId&&fileId!=='undefined'){ const weg=await deleteFile(fileId); if(!weg) toast('De notitie is weg. Het bestand wordt bij de volgende synchronisatie opgeruimd.'); }
}

// ---- Bijlagen offline bewaren (IndexedDB. LocalStorage is te klein voor bestanden) ----
const IDB_MAX=10*1024*1024;               // tot 10 MB automatisch meenemen
let _db=null;
function idb(){
  if(_db) return Promise.resolve(_db);
  return new Promise((res,rej)=>{
    const r=indexedDB.open('australieapp',1);
    r.onupgradeneeded=()=>{ if(!r.result.objectStoreNames.contains('files')) r.result.createObjectStore('files'); };
    r.onsuccess=()=>{_db=r.result;res(_db)}; r.onerror=()=>rej(r.error);
  });
}
async function idbGet(k){ try{const db=await idb();return await new Promise((res,rej)=>{const t=db.transaction('files').objectStore('files').get(k);t.onsuccess=()=>res(t.result);t.onerror=()=>rej(t.error)});}catch(e){return null} }
async function idbPut(k,v){ try{const db=await idb();await new Promise((res,rej)=>{const t=db.transaction('files','readwrite').objectStore('files').put(v,k);t.onsuccess=()=>res();t.onerror=()=>rej(t.error)});}catch(e){} }
async function idbDel(k){ try{const db=await idb();await new Promise(res=>{const t=db.transaction('files','readwrite').objectStore('files').delete(k);t.onsuccess=()=>res();t.onerror=()=>res()});}catch(e){} }
async function idbKeys(){ try{const db=await idb();return await new Promise(res=>{const t=db.transaction('files').objectStore('files').getAllKeys();t.onsuccess=()=>res(t.result||[]);t.onerror=()=>res([])});}catch(e){return []} }

// bijlage ophalen en bewaren. Geeft een adres terug dat ook offline werkt
async function localFileUrl(id){
  const blob=await idbGet(id);
  if(blob) return URL.createObjectURL(blob);
  return null;
}
async function cacheFile(it){
  if(!it.file_id) return false;
  if(await idbGet(it.file_id)) return true;
  if(!navigator.onLine) return false;
  if(it.grootte&&it.grootte>IDB_MAX) return false;
  try{
    const b=await fetchBlob(it.file_id); if(!b) return false;
    await idbPut(it.file_id,b); return true;
  }catch(e){ return false; }
}
// bij het opstarten: alle notities ophalen, per dag bewaren, bijlagen binnenhalen
let _sync=null;
async function syncAlles(force){
  if(_sync&&!force) return _sync;
  _sync=(async()=>{
    if(!NH.user||!navigator.onLine) return null;
    try{
      const d=await gql(Q_ALL); const items=d.dagitems;
      LS.set('aus_cache_all',items);
      const perDag={}; items.forEach(it=>{(perDag[it.dag]=perDag[it.dag]||[]).push(it)});
      for(const i of [...Array.from({length:30},(_,k)=>k),...buitenDagen()]) LS.set('aus_cache_'+i,perDag[i]||[]);
      // bijlagen die weg zijn ook uit de opslag halen
      const geldig=new Set(items.filter(x=>x.file_id).map(x=>x.file_id));
      (await idbKeys()).forEach(k=>{ if(!geldig.has(k)) idbDel(k); });
      for(const it of items.filter(x=>x.soort==='bestand')) await cacheFile(it);
      LS.set('aus_sync',{tijd:new Date().toISOString()});
      await syncWaarnemingen();
      return items;
    }catch(e){ return null; } finally { _sync=null; }
  })();
  return _sync;
}

// Waarnemingen apart ophalen. Mislukt dit (bijvoorbeeld omdat de tabel nog niet bestaat), dan blijven
// de notities gewoon werken en onthouden we de reden voor het scherm Dieren.
async function syncWaarnemingen(){
  if(!NH.user||!navigator.onLine) return;
  try{ const d=await gql(Q_WAARN); LS.set('aus_cache_waarn',d.waarnemingen); }catch(e){}
}
const MAX_UPLOAD=20*1024*1024;
const TOEGESTAAN=['image/jpeg','image/png','image/heic','image/heif','image/webp','application/pdf'];
async function uploadFile(file){
  const t=await nhToken(); if(!t) throw new Error('Niet ingelogd');
  if(file.size>MAX_UPLOAD) throw new Error(`${file.name} is groter dan 20 MB`);
  if(file.type&&!TOEGESTAAN.includes(file.type)) throw new Error(`${file.type||'dit bestandstype'} kan niet; gebruik een foto of pdf`);
  const fd=new FormData(); fd.append('file[]',file,file.name);
  const r=await fetch(NH_STORE+'/files',{method:'POST',headers:{'Authorization':'Bearer '+t},body:fd});
  const j=await r.json().catch(()=>({}));
  if(!r.ok||!j.processedFiles||!j.processedFiles.length) throw new Error(j.message||j.error?.message||'Uploaden mislukt');
  return j.processedFiles[0];
}
// Rechtstreeks ophalen met de token en als blob teruggeven. Geen presigned URL, dus geen
// adres dat na het delen zonder inloggen te openen is.
async function fetchBlob(id){
  const t=await nhToken(); if(!t) return null;
  try{
    const r=await fetch(`${NH_STORE}/files/${id}`,{headers:{'Authorization':'Bearer '+t}});
    if(!r.ok) return null; return await r.blob();
  }catch(e){ return null; }
}
async function fileUrl(id){
  const b=await fetchBlob(id); return b?URL.createObjectURL(b):null;
}
async function deleteFile(id){
  const t=await nhToken(); if(!t) return false;
  try{
    const r=await fetch(`${NH_STORE}/files/${id}`,{method:'DELETE',headers:{'Authorization':'Bearer '+t}});
    if(r.ok||r.status===404){ await idbDel(id); return true; }
    return false;
  }catch(e){ return false; }
}

// Wachtrij voor alles wat zonder verbinding is vastgelegd. Elk item draagt de tabel waar het heen moet
// (dagitems voor notities, waarnemingen voor dieren). Items van vóór de waarnemingen hebben geen tabel
// en zijn notities. pending() geeft de hele rij, de rest kijkt alleen naar de eigen tabel, maar de
// plek in de rij (pix) blijft die in de hele rij, zodat bewerken en weggooien op de juiste landen.
function pending(){return LS.get('aus_pending')||[]}
const tabelVan=p=>p.tabel||'dagitems';
const pendingVan=tabel=>pending().map((p,i)=>({...p,pix:i})).filter(p=>tabelVan(p)===tabel);
// Wachtende notities in dezelfde vorm als de notities van Nhost, met hun plek in de wachtrij (pix)
// erbij zodat je ze kunt bewerken of weggooien voordat ze zijn verstuurd.
const pendingAlsItems=()=>pendingVan('dagitems').map(p=>({...p,id:'wacht'+p.pix,user_id:NH.user.id,soort:'notitie',
  type:p.type||'notitie',created_at:new Date().toISOString(),pending:true}));
// Hetzelfde voor waarnemingen
const pendingWaarnemingen=()=>pendingVan('waarnemingen').map(p=>({...p,id:'wacht'+p.pix,user_id:NH.user.id,pending:true}));
// Eén item in de wachtrij versturen, naar de eigen tabel
async function verstuurPending(it){
  if(tabelVan(it)==='waarnemingen') return gql(M_INS_WAARN,{o:{dier:it.dier,dag:it.dag,gezien_op:it.gezien_op,wie:it.wie,opmerking:it.opmerking||null}});
  return gql(M_INS,{o:{dag:it.dag,soort:'notitie',tekst:it.tekst,wie:it.wie,type:it.type||'notitie'}});
}
// Notities die nog op verbinding wachten staan alleen op deze telefoon. Ze krijgen een eigen
// index als sleutel, zodat je ze kunt aanpassen of weggooien voordat ze zijn verstuurd.
function pendingUpdate(ix,velden){ const q=pending(); if(!q[ix])return; q[ix]={...q[ix],...velden}; LS.set('aus_pending',q); }
function pendingDelete(ix){ const q=pending(); q.splice(ix,1); LS.set('aus_pending',q); }
async function flushPending(){
  const q=pending(); if(!q.length||!navigator.onLine) return 0;
  const rest=[]; let verstuurd=0, waarn=0;
  LAATST_VERSTUURD.notities=0; LAATST_VERSTUURD.waarnemingen=0;
  for(const it of q){
    try{ await verstuurPending(it); verstuurd++; if(tabelVan(it)==='waarnemingen') waarn++; LAATST_VERSTUURD[tabelVan(it)==='waarnemingen'?'waarnemingen':'notities']++; }
    // Tijdelijk: gewoon laten staan. Blijvend (rechten, ongeldige invoer): ook laten staan, want de
    // tekst mag niet verloren gaan, maar met de reden erbij zodat je hem kunt aanpassen of weggooien.
    catch(e){ rest.push(e.tijdelijk?it:{...it,fout:e.message}); }
  }
  LS.set('aus_pending',rest);
  // Zijn er waarnemingen doorgekomen, dan is de eerdere reden voorbij. Kopie verversen zodat
  // de tellers kloppen, en het scherm Dieren bijwerken als dat openstaat.
  if(waarn){ await syncWaarnemingen(); if(view==='dieren') renderDieren(); }
  return verstuurd;
}
const mislukt=(tabel='dagitems')=>pendingVan(tabel).filter(p=>p.fout).length;
const LAATST_VERSTUURD={notities:0,waarnemingen:0};
// 'Je notitie is verstuurd', '2 notities en je waarneming zijn verstuurd'
function verstuurdTekst(){
  const n=LAATST_VERSTUURD.notities, w=LAATST_VERSTUURD.waarnemingen, d=[];
  if(n) d.push(n===1?'je notitie':`${n} notities`); if(w) d.push(w===1?'je waarneming':`${w} waarnemingen`);
  if(!d.length) return '';
  const t=d.join(' en ')+(n+w===1?' is':' zijn')+' verstuurd';
  return t.charAt(0).toUpperCase()+t.slice(1);
}

// Tekst veilig weergeven én links aanklikbaar maken. Eerst escapen tegen kwaadaardige
// invoer, daarna pas de gevonden adressen omzetten in een link.
function linkify(t){
  let h=esc(t||'');
  h=h.replace(/\b((?:https?:\/\/|www\.)[^\s<]+[^\s<.,;:!?)\]}"'])/gi,m=>{
    const url=/^www\./i.test(m)?'https://'+m:m;
    return `<a class="nlink" href="${url}" target="_blank" rel="noopener noreferrer">${m}</a>`;
  });
  h=h.replace(/\b([\w.+-]+@[\w-]+\.[\w.-]{2,})\b/g,'<a class="nlink" href="mailto:$1">$1</a>');
  h=h.replace(/(^|[\s(])(\+\d[\d\s().-]{7,}\d)/g,(m,pre,tel)=>
    `${pre}<a class="nlink" href="tel:${tel.replace(/[\s().-]/g,'')}">${tel}</a>`);
  return h;
}
const fmtWhen=iso=>{const d=new Date(iso);return `${WD[d.getDay()].slice(0,2)} ${d.getDate()} ${MN[d.getMonth()].slice(0,3)} ${pad(d.getHours())}.${pad(d.getMinutes())}`};
const fmtSize=b=>b>1048576?(b/1048576).toFixed(1).replace('.',',')+' MB':Math.round(b/1024)+' kB';
const ICO_PDF='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/><path d="M9 14h6M9 17h4"/></svg>';
const ICO_CHEV='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
const ICO_FILE='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/></svg>';

// Eén kaart voor een notitie of bijlage, gebruikt bij de dag én in het tabblad Notities.
// kop: wat links in de kopregel staat (typelabel, dagknop of naam). zonderNaam: de naam staat al
// in de kop, dus niet nog eens in de regel met de datum.
function noteCard(it,kop,{zonderNaam=false}={}){
  const mine=NH.user&&it.user_id===NH.user.id;
  // Alleen bij een eigen notitie valt de naam terug op het account. Een notitie van een ander
  // zonder afzender is 'Onbekend', niet jij.
  const wie=mine?(NH.user.displayName||it.wie||NH.user.email):(it.wie||'Onbekend');
  const lang=(it.tekst||'').split('\n').length>4||(it.tekst||'').length>280;
  const txt=it.tekst?`<span class="ntext${lang?' clamp':''}">${linkify(it.tekst)}</span>${lang?`<button class="nmore" type="button">Meer</button>`:''}`:'';
  const pix=it.pending?` data-pix="${it.pix}"`:'';
  const acts=mine?`<span class="nacts"><button class="nbtn" data-edit="${esc(it.id||'')}"${pix} aria-label="Bewerken">✎</button>`+
    `<button class="nbtn ndel" data-del="${esc(it.id||'')}"${pix}${it.file_id?` data-file="${esc(it.file_id)}"`:''} aria-label="Verwijderen">×</button></span>`:'';
  const head=`<div class="nhead">${kop}${acts}</div>`;
  const wanneer=it.pending?(it.fout?`versturen mislukt: ${esc(it.fout)}`:'wacht op verbinding'):fmtWhen(it.created_at);
  const bewerkt=(!it.pending&&it.updated_at&&it.updated_at!==it.created_at)?' · bewerkt':'';
  if(it.soort==='bestand'){
    const isImg=/^image\//.test(it.mime||'');
    const soort=isImg?'Afbeelding':(/pdf/.test(it.mime||'')?'PDF':'Bestand');
    // De bestandsregel is de tapzone. Het bijschrift staat eronder over de volle breedte,
    // zodat een lang bijschrift niet in een smalle kolom naast het icoon wordt geperst.
    return `<li class="nitem" data-id="${esc(it.id||'')}">${head}`+
      `<a class="nfilelink" href="#" data-open="${esc(it.file_id)}">`+
      `${isImg?`<img class="nthumb" alt="" data-thumb="${esc(it.file_id)}">`:`<span class="nicon">${isImg?ICO_FILE:ICO_PDF}</span>`}`+
      `<span class="nfname"><strong>${esc(it.naam||'bestand')}</strong>`+
      `<span class="nsize">${soort}${it.grootte?' · '+fmtSize(it.grootte):''}</span></span>`+
      `<span class="nopen">${ICO_CHEV}</span></a>`+
      (txt?`<span class="nbody">${txt}</span>`:'')+
      `<span class="sub nmeta">${zonderNaam?'':esc(wie)+' · '}${wanneer}${bewerkt}</span></li>`;
  }
  return `<li class="nitem" data-id="${esc(it.id||'')}">${head}<span class="nbody">${txt}</span>`+
    `<span class="sub nmeta">${zonderNaam?'':esc(wie)+' · '}${wanneer}${bewerkt}</span></li>`;
}
// Object-URL's voor miniaturen: één per bestand voor de hele sessie, in plaats van een nieuwe bij
// elke hertekening (die bleven tot nu toe allemaal in het geheugen staan). Bij uitloggen gaan ze weg.
const _thumbUrls=new Map();   // file_id → belofte van een URL
function thumbUrl(id){
  if(!_thumbUrls.has(id)){
    const p=(async()=>{ const u=await localFileUrl(id)||await fileUrl(id); if(!u) _thumbUrls.delete(id); return u; })();
    _thumbUrls.set(id,p);
  }
  return _thumbUrls.get(id);
}
async function wisThumbUrls(){ for(const p of _thumbUrls.values()){ const u=await p; if(u) URL.revokeObjectURL(u); } _thumbUrls.clear(); }
// Gedrag dat beide lijsten delen: miniaturen laden, bijlagen openen, Meer/Minder
function koppelKaarten(box){
  box.querySelectorAll('[data-thumb]').forEach(async img=>{const u=await thumbUrl(img.dataset.thumb); if(u) img.src=u;});
  box.querySelectorAll('[data-open]').forEach(a=>a.addEventListener('click',async e=>{ if(e.target.closest('.nmore')||e.target.closest('.nlink')) return; e.preventDefault();
    const u=await localFileUrl(a.dataset.open)||await fileUrl(a.dataset.open);
    if(u){
      const w=window.open(u,'_blank'); if(!w) location.href=u;
      setTimeout(()=>URL.revokeObjectURL(u),60000);   // het geopende venster heeft het bestand dan al
    } else toast('Deze bijlage staat nog niet op je telefoon. Open de app een keer met verbinding.');}));
  box.querySelectorAll('.nmore').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();const t=b.previousElementSibling;const open=t.classList.toggle('clamp');b.textContent=open?'Meer':'Minder';});
}

async function renderNotes(dag){
  const top=document.getElementById('notes-top'), rest=document.getElementById('notes-rest');
  if(!top&&!rest) return;
  const wie=NH.user.displayName||NH.user.email;
  const cacheKey='aus_cache_'+dag;
  // Eerst tekenen met wat er op de telefoon staat, daarna pas het antwoord van Nhost afwachten.
  // Anders staat een dag offline seconden leeg terwijl de notities er allang zijn.
  teken(LS.get(cacheKey)||[],'');
  let items=LS.get(cacheKey)||[], status='';
  try{ const d=await gql(Q_ITEMS,{dag}); items=d.dagitems; LS.set(cacheKey,items); status=`Bijgewerkt ${fmtWhen(new Date().toISOString())}`; }
  catch(e){ status=navigator.onLine?`Kon niet laden: ${e.message}`:'Geen verbinding, laatst opgeslagen versie'; }
  teken(items,status);

  function teken(items,status){
  const pend=pendingVan('dagitems').filter(p=>p.dag===dag);
  // user_id meegeven, anders herkent noteCard een wachtende notitie niet als de jouwe
  // en verschijnen de knoppen Bewerken en Verwijderen niet. pix is de plek in de hele wachtrij.
  const all=[...items,...pend.map(p=>({...p,soort:'notitie',pending:true,user_id:NH.user.id}))]
    .sort((a,b)=>typeRank(a.type)-typeRank(b.type)||String(a.created_at||'').localeCompare(String(b.created_at||'')));
  const tag=it=>`<span class="ntype ${esc(it.type||'notitie')}">${typeLabel(it.type)}</span>`;
  // Tickets en reserveringen heb je op een moment nodig. De rest is naslag.
  const nodig=top?all.filter(it=>it.type==='ticket'||it.type==='reservering'):[];
  const overig=all.filter(it=>!nodig.includes(it));
  const lijst=(kop,rij)=>rij.length?`<h2>${kop}</h2><ul class="list nlist">`+rij.map(it=>noteCard(it,tag(it))).join('')+`</ul>`:'';
  // Zonder notities blijft het blok helemaal weg: geen lege kop op een dag zonder items.
  if(top) top.innerHTML=lijst(dag===T.dag?'Vandaag nodig':'Nodig op deze dag',nodig);
  if(rest) rest.innerHTML=lijst('Notities',overig)+
    (overig.length||nodig.length?`<div class="nstatus">${esc(status)}</div>`:'');
  [top,rest].forEach(box=>{
    if(!box||!box.innerHTML) return;
    koppelKaarten(box);
    const refresh=()=>renderNotes(dag);
    box.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{
      const it=all.find(x=>x.id===b.dataset.edit)||all.find(x=>String(x.pix)===b.dataset.pix);
      if(it) openSheet({dag,wie,item:it,onDone:refresh});
    });
    box.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{
      if(!confirm('Verwijderen?')) return;
      if(b.dataset.pix!==undefined){ pendingDelete(+b.dataset.pix); refresh(); return; }
      try{ await verwijderItem(b.dataset.del,b.dataset.file); refresh(); }
      catch(e){ toast('Verwijderen mislukt: '+e.message); }
    });
  });
  }
}

// Dagkiezer: voorreis bovenaan, dan Algemeen, dan de groepsreis, eventueel de nareis.
// De extra dagen tonen een datum (het kopje van de groep zegt al wat het is) en, als er programma is, de titel.
function dagOpties(dag){
  const opt=(v,l)=>`<option value="${v}"${v===dag?' selected':''}>${l}</option>`;
  const voor=buitenDagen().filter(d=>d<0), na=buitenDagen().filter(d=>d>29);
  const bl=d=>{ const x=buitenData(d); return fmtKort(dagDatum(d))+(x?` · ${esc(x.t)}`:''); };
  return (voor.length?`<optgroup label="Voorreis">${voor.map(d=>opt(d,bl(d))).join('')}</optgroup>`:'')+
    opt(0,'Algemeen, niet aan een dag')+
    `<optgroup label="Groepsreis">${DAYS.map(x=>opt(x.n,`Dag ${x.n} · ${fmtShort(dateFor(x.n))} · ${esc(x.t)}`)).join('')}</optgroup>`+
    (na.length?`<optgroup label="Nareis">${na.map(d=>opt(d,bl(d))).join('')}</optgroup>`:'');
}
// type: vooraf gekozen type voor een nieuwe notitie. Vast: de typekeuze verbergen, zodat een
// verzekeringsnotitie niet per ongeluk van type verandert en uit het tabblad Praktisch verdwijnt.
function openSheet({dag,wie,item,onDone,kiesDag,type:typeStart,vast}){
  document.getElementById('sheet')?.remove();
  const isEdit=!!item, isFile=item&&item.soort==='bestand'&&!item.pending;
  let type=item?.type||typeStart||'notitie';
  const kop=vast?`${typeLabel(type)} ${isEdit?'bewerken':'toevoegen'}`:`${isEdit?'Bewerken':'Toevoegen'}${dag?` · ${isBuiten(dag)?buitenLabel(dag):'dag '+dag}`:''}`;
  const el=document.createElement('div'); el.id='sheet'; el.className='sheetwrap';
  el.innerHTML=`<div class="sheetbg"></div><div class="sheet" role="dialog" aria-modal="true">
    <div class="sheethead"><strong>${kop}</strong><button class="nbtn" id="shclose" aria-label="Sluiten">×</button></div>
    ${vast?'':`<div class="chips" id="shtypes">${TYPES.map(([k,l])=>`<button type="button" class="chip${type===k?' on':''}" data-t="${k}">${l}</button>`).join('')}</div>`}
    ${kiesDag?`<select id="shdag" class="shsel">${dagOpties(dag)}</select>`:''}
    ${isFile?`<div class="shfile">${ICO_FILE}<span>${esc(item.naam)}</span></div>`:''}
    <textarea id="shtext" rows="6" placeholder="${isFile?'Bijschrift…':type==='verzekering'?'Verzekeraar, polisnummer en het nummer van de alarmcentrale…':'Notitie…'}">${esc(item?.tekst||'')}</textarea>
    <div class="nrow">
      ${!isEdit?`<label class="btn nupload">${ICO_FILE} Foto of pdf<input type="file" id="shfile" accept="image/jpeg,image/png,image/heic,image/heif,image/webp,application/pdf" multiple hidden></label>`:''}
      <button class="btn primary" id="shsave">${isEdit?'Opslaan':'Bewaar notitie'}</button>
    </div>
    <div class="nstatus" id="shstat"></div></div>`;
  document.body.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('on'));
  const close=()=>{el.classList.remove('on');setTimeout(()=>el.remove(),220)};
  el.querySelector('.sheetbg').onclick=close; el.querySelector('#shclose').onclick=close;
  const dagVan=()=>kiesDag?+el.querySelector('#shdag').value:dag;
  el.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{type=c.dataset.t;el.querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x===c));});
  const ta=el.querySelector('#shtext'), st=el.querySelector('#shstat');
  setTimeout(()=>ta.focus(),250);

  el.querySelector('#shsave').onclick=async()=>{
    const t=ta.value.trim();
    if(isEdit&&item.pending){
      if(!t){ st.textContent='Typ eerst een notitie.'; return; }
      pendingUpdate(item.pix,{tekst:t,type,dag:dagVan(),fout:undefined});   // opnieuw proberen na aanpassing
      close(); onDone(); return;
    }
    if(isEdit){
      st.textContent='Opslaan…';
      try{
        // Eerst de dag: mislukt dat op de rechten in Nhost, dan is er nog niets half opgeslagen.
        if(kiesDag&&dagVan()!==item.dag){
          try{ await gql(M_UPD_DAG,{id:item.id,d:dagVan()}); }
          catch(e){ st.textContent=/not found in type/.test(e.message)
            ?'De dag wijzigen mag nog niet. Zet in Nhost bij de update-rechten van dagitems de kolom dag aan.'
            :'Dag wijzigen mislukt: '+e.message; return; }
        }
        await gql(M_UPD,{id:item.id,t:t||null,ty:type});
        if(kiesDag) LS.set('aus_laatste_dag',dagVan());
        close(); onDone();
      }catch(e){ st.textContent='Opslaan mislukt: '+e.message; }
      return;
    }
    if(!t){ st.textContent='Typ eerst een notitie, of kies een foto of pdf.'; return; }
    const rec={dag:dagVan(),tekst:t,wie,type};
    if(!navigator.onLine){ LS.set('aus_pending',[...pending(),rec]); close(); toast('Bewaard op de telefoon. Hij wordt verstuurd zodra er verbinding is.'); onDone(); return; }
    if(kiesDag) LS.set('aus_laatste_dag',dagVan());
    st.textContent='Opslaan…';
    try{ await gql(M_INS,{o:{...rec,soort:'notitie'}}); close(); onDone(); }
    catch(e){
      // Geen verbinding of server even weg: bewaren en later versturen. Een fout van Hasura zelf
      // (rechten, ongeldige invoer) gaat niet in de wachtrij. Die zou daar eindeloos blijven mislukken.
      if(e.tijdelijk){ LS.set('aus_pending',[...pending(),rec]); close(); toast('Bewaard op de telefoon. Hij wordt verstuurd zodra er verbinding is.'); onDone(); }
      else st.textContent='Opslaan mislukt: '+e.message;
    }
  };
  const fi=el.querySelector('#shfile');
  if(fi) fi.onchange=async e=>{
    const files=[...e.target.files]; if(!files.length) return;
    if(!navigator.onLine){ st.textContent='Uploaden lukt alleen met verbinding.'; return; }
    const bijschrift=ta.value.trim()||null;
    for(const f of files){
      st.textContent=`Uploaden: ${f.name}…`;
      let up=null;
      try{ up=await uploadFile(f);
        await gql(M_INS,{o:{dag:dagVan(),soort:'bestand',type,file_id:up.id,naam:f.name,mime:f.type||up.mimeType,grootte:f.size,wie,tekst:bijschrift}});
      }catch(err){
        if(up&&up.id) await deleteFile(up.id);   // niets laten rondslingeren
        st.textContent='Uploaden mislukt: '+err.message; return; }
    }
    close(); onDone();
  };
}

// Het tabblad Notities bestaat uit een vaste schil (zoekveld, plusknop, status) en een lijst
// die opnieuw getekend wordt bij elk filter of elke toetsaanslag. Het zoekveld blijft daarbij
// staan: dat scheelt het herstellen van focus en cursor, en het typen voelt rustig.
let alleItems=[], alleWie='';

async function renderAlles(){
  const box=document.getElementById('alles');
  if(!NH.user){ box.innerHTML=''; return; }
  const wie=alleWie=NH.user.displayName||NH.user.email;
  let items=LS.get('aus_cache_all')||[], status='';
  if(!box.querySelector('#nzoek')) box.innerHTML=`<div class="nstatus">Laden…</div>`;
  const verse=await syncAlles(true);
  if(verse){ items=verse; const t=LS.get('aus_sync'); status=`Bijgewerkt ${fmtWhen(t.tijd)}`; }
  else status=navigator.onLine?'Kon niet bijwerken, laatst opgeslagen versie':'Geen verbinding, laatst opgeslagen versie';
  const fout=mislukt(), wacht=pendingVan('dagitems').length-fout;
  if(wacht) status+=` · ${wacht} ${wacht===1?'notitie wacht':'notities wachten'} op verbinding`;
  if(fout) status+=` · ${fout} ${fout===1?'notitie kon':'notities konden'} niet worden verstuurd`;
  // hoeveel bijlagen staan er op de telefoon?
  const metBijlage=items.filter(x=>x.soort==='bestand');
  let bijl='';
  if(metBijlage.length){
    const opslag=await idbKeys();
    const offline=metBijlage.filter(x=>opslag.includes(x.file_id)).length;
    bijl=`${offline} van ${metBijlage.length} bijlagen offline`;
    status+=` · ${offline} van ${metBijlage.length} bijlagen offline beschikbaar`;
  }
  if(view==='alles'){
    const tekst=`${items.length} ${items.length===1?'notitie':'notities'}${bijl?' · '+bijl:''}`;
    const bs=document.querySelector('#hero .bsub');
    if(bs) bs.textContent=tekst;
    else { const w=document.querySelector('#hero .wrap'); if(w) w.insertAdjacentHTML('beforeend',`<p class="bsub">${tekst}</p>`); }
  }
  // notities die nog op verbinding wachten, horen ook hier zichtbaar te zijn
  alleItems=[...items,...pendingAlsItems()];

  box.innerHTML=`<div class="notes"><div class="zoekrij"><div class="search"><span class="mag">${MAG}</span>`+
    `<input id="nzoek" type="search" placeholder="Zoek in notities…" autocomplete="off" `+
    `autocorrect="off" autocapitalize="none" spellcheck="false" value="${esc(window._notZoek||'')}">`+
    `<button class="wis" id="nwis" type="button" aria-label="Zoekveld wissen"${(window._notZoek||'')?'':' hidden'}>${WIS}</button></div>`+
    `<button class="plusknop" id="aadd" aria-label="Notitie toevoegen">${PLUS}</button></div>`+
    `<div id="filterrij"></div><div id="nlijst"></div>`+
    `<div class="nstatus" style="margin-top:18px">${esc(status)}</div>`+
    (metBijlage.length?`<div class="nrow" style="margin-top:8px"><button class="btn" id="acache">Bijlagen opnieuw ophalen</button></div>`:'')+
    `</div>`;

  const zv=box.querySelector('#nzoek');
  zv.addEventListener('input',()=>{
    window._notZoek=zv.value;
    box.querySelector('#nwis').hidden=!zv.value;
    clearTimeout(zv._t); zv._t=setTimeout(tekenLijst,140);   // alleen de lijst, het veld blijft staan
  });
  box.querySelector('#nwis').onclick=()=>{ window._notZoek=''; zv.value=''; box.querySelector('#nwis').hidden=true; zv.focus(); tekenLijst(); };
  box.querySelector('#aadd').onclick=()=>openSheet({
    // Voorgeselecteerd: tijdens de reis vandaag, daarbuiten de dag die je het laatst koos.
    dag:T.dag??(LS.get('aus_laatste_dag')??0),wie,kiesDag:true,onDone:renderAlles});
  const cb=box.querySelector('#acache');
  if(cb) cb.onclick=async()=>{
    if(!navigator.onLine){ toast('Hiervoor heb je verbinding nodig'); return; }
    cb.textContent='Ophalen…';
    for(const it of alleItems.filter(x=>x.soort==='bestand')) await cacheFile(it);
    renderAlles();
  };
  tekenLijst();
}

function tekenLijst(){
  const box=document.getElementById('alles');
  const rij=box?.querySelector('#filterrij'), lijst=box?.querySelector('#nlijst');
  if(!rij||!lijst) return;
  const items=alleItems, wie=alleWie;
  const dagLabel=d=>d===0?'Algemeen':isBuiten(d)?buitenLabel(d):`Dag ${d} · ${fmtLong(dateFor(d))}`;
  const kaart=it=>noteCard(it,isVerz(it)
    ?`<button class="ndag verz" data-dag="prakt">Praktisch · Verzekeringen</button>`
    :`<button class="ndag${isBuiten(it.dag)?' buiten':''}" data-dag="${it.dag}">${dagLabel(it.dag)}</button>`);
  const zoek=(window._notZoek||'').trim().toLowerCase();
  const filter=window._notType||'';
  // Ook de dag waar een notitie bij hoort telt mee: 'Uluru' vindt zo de notities van dag 18 tot 20,
  // ook als dat woord er zelf niet in staat.
  const dagTekst=d=>{ if(!d) return 'algemeen';
    if(isBuiten(d)){ const x=buitenData(d); return `${buitenLabel(d)} ${fmtLong(dagDatum(d))} ${x?x.t+' '+x.p:''}`.toLowerCase(); }
    const x=DAYS[d-1]; return `dag ${d} ${fmtLong(dateFor(d))} ${x?x.t+' '+x.p:''}`.toLowerCase(); };
  const hooi=it=>[it.tekst,it.naam,it.wie,dagTekst(it.dag)].filter(Boolean).join(' ').toLowerCase();
  const raak=it=>!zoek||hooi(it).includes(zoek);
  // Twee losse assen: welke dag (vandaag, voorreis, nareis of alles) en welk soort. Ze werken samen.
  // 'Vandaag' volgt de echte datum: tijdens de voorreis dus de voorreisdag van vandaag.
  const vandaag=!!window._notVandaag&&T.dag!=null;
  const buiten=window._notBuiten||'';
  const inBuiten=(it,b)=>b==='voor'?it.dag<0:it.dag>29;
  const dagOk=it=>vandaag?it.dag===T.dag:(!buiten||inBuiten(it,buiten));
  const typeOk=it=>!filter||(it.type||'notitie')===filter;
  const zichtbaar=items.filter(it=>raak(it)&&dagOk(it)&&typeOk(it));
  // Elk telletje houdt rekening met de andere filters: 'Ticket 1' naast een actieve
  // Vandaag-chip betekent dus één ticket van vandaag.
  const naZoek=items.filter(raak);
  const inDag=naZoek.filter(dagOk);
  const telling={}; inDag.forEach(it=>{const t=it.type||'notitie'; telling[t]=(telling[t]||0)+1});
  const telVandaag=naZoek.filter(it=>it.dag===T.dag&&typeOk(it)).length;
  const telBuiten=b=>naZoek.filter(it=>inBuiten(it,b)&&typeOk(it)).length;
  // De chips Voorreis en Nareis verschijnen pas als iemand er een notitie voor heeft gemaakt.
  const dagChips=[];
  if(T.dag!=null) dagChips.push(['1','Vandaag',telVandaag,vandaag]);
  if(items.some(it=>it.dag<0)||buiten==='voor') dagChips.push(['voor','Voorreis',telBuiten('voor'),buiten==='voor']);
  if(items.some(it=>it.dag>29)||buiten==='na') dagChips.push(['na','Nareis',telBuiten('na'),buiten==='na']);

  // Links de dag, rechts het soort. Het streepje ertussen laat zien dat het twee vragen zijn.
  // Een actieve chip krijgt een kruisje, zodat zichtbaar is dat je hem ook weer uit kunt zetten.
  const uit=`<span class="chipx" aria-hidden="true">×</span>`;
  rij.innerHTML=items.length?`<div class="chips filters" id="typefilter">`+
    dagChips.map(([d,l,n,on])=>`<button type="button" class="chip dagchip${on?' on':''}" data-d="${d}"${on?' aria-pressed="true"':''}>${l}<span class="cnt">${n}</span>${on?uit:''}</button>`).join('')+
    (dagChips.length?`<span class="chipsplit" aria-hidden="true"></span>`:'')+
    TYPES.filter(([k])=>telling[k]||filter===k).map(([k,l])=>
      `<button type="button" class="chip${filter===k?' on':''}" data-f="${k}"${filter===k?' aria-pressed="true"':''}>${l}<span class="cnt">${telling[k]||0}</span>${filter===k?uit:''}</button>`).join('')+
    `</div>`:'';

  let h='';
  if(!items.length) h+=`<div class="empty">Nog geen notities.</div>`;
  else if(!zichtbaar.length){
    const wat=filter?`notities van het type ${typeLabel(filter).toLowerCase()}`:'notities';
    // Wie op nul uitkomt moet er in één tik weer uit kunnen, zonder te puzzelen welke chip het deed.
    h+=`<div class="empty">${zoek?`Niets gevonden voor “${esc(zoek)}”.`:`Geen ${wat}${vandaag?' voor vandaag':buiten?` van de ${buiten==='voor'?'voorreis':'nareis'}`:''}.`}`+
       `<button type="button" class="btn wisfilter" id="wisfilters">Alle filters wissen</button></div>`;
  }
  else if(filter||buiten) h+=`<ul class="list nlist">`+zichtbaar.map(kaart).join('')+`</ul>`;
  else {
    // Voorreis en nareis staan als eigen blok, op datum. De voorreis staat bovenaan zolang de
    // groepsreis nog niet begonnen is. Daarna zakt hij onder de gewone notities.
    const opDag=(a,b)=>a.dag-b.dag||String(a.created_at||'').localeCompare(String(b.created_at||''));
    const blok=(kop,rij)=>rij.length?`<h2>${kop}</h2><ul class="list nlist">`+rij.sort(opDag).map(kaart).join('')+`</ul>`:'';
    const voor=blok('Voorreis',zichtbaar.filter(it=>it.dag<0&&!isVerz(it))), na=blok('Nareis',zichtbaar.filter(it=>it.dag>29&&!isVerz(it)));
    if(T.before) h+=voor;
    TYPES.filter(([key])=>key!=='verzekering').forEach(([key,label])=>{
      const groep=zichtbaar.filter(it=>!isBuiten(it.dag)&&(it.type||'notitie')===key);
      if(groep.length) h+=`<h2>${label}</h2><ul class="list nlist">`+groep.map(kaart).join('')+`</ul>`;
    });
    if(!T.before) h+=voor;
    h+=na;
    // Verzekeringen helemaal onderaan: die gegevens hoop je niet nodig te hebben.
    h+=blok('Verzekeringen',zichtbaar.filter(isVerz));
  }
  lijst.innerHTML=h;

  const wf=lijst.querySelector('#wisfilters');
  if(wf) wf.onclick=()=>{ window._notVandaag=false; window._notBuiten=''; window._notType=''; window._notZoek='';
    const zv=box.querySelector('#nzoek'); if(zv){ zv.value=''; box.querySelector('#nwis').hidden=true; }
    tekenLijst(); };
  rij.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{
    // Elke chip is een schakelaar: nog een tik zet hem weer uit. Een aparte knop 'Alles'
    // is daarmee overbodig. Het totaal staat al in de banner.
    // De dagchips sluiten elkaar uit: een notitie hoort bij één dag.
    if(c.dataset.d==='1'){ window._notVandaag=!window._notVandaag; window._notBuiten=''; }
    else if(c.dataset.d){ window._notBuiten=(window._notBuiten===c.dataset.d)?'':c.dataset.d; window._notVandaag=false; }
    else window._notType=(window._notType===c.dataset.f)?'':c.dataset.f;
    tekenLijst();
  });
  koppelKaarten(lijst);
  lijst.querySelectorAll('.ndag').forEach(b=>b.onclick=()=>{
    if(b.dataset.dag==='prakt'){ naarPraktisch('verz'); return; }
    const dg=+b.dataset.dag;
    if(dg>=1&&dg<=29||isBuiten(dg)){cur=dg;switchTo('day')}
    else switchTo('prakt');});
  lijst.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{
    const it=items.find(x=>x.id===b.dataset.edit); if(it) openSheet({dag:it.dag,wie,item:it,onDone:renderAlles,kiesDag:true});
  });
  lijst.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{
    if(!confirm('Verwijderen?')) return;
    if(b.dataset.pix!==undefined){ pendingDelete(+b.dataset.pix); renderAlles(); return; }
    try{ await verwijderItem(b.dataset.del,b.dataset.file); renderAlles(); }
    catch(e){ toast('Verwijderen mislukt: '+e.message); }
  });
}

// ---- Wisselkoers AUD → EUR. Haalt de koers op met verbinding en onthoudt hem,
//      zodat je offline met de laatst bekende koers verder kunt rekenen. ----
const KOERS_TERUGVAL={koers:0.58,tijd:null};
async function haalKoers(){
  try{
    const r=await fetch('https://api.frankfurter.dev/v1/latest?base=AUD&symbols=EUR',{cache:'no-store'});
    if(!r.ok) return null;
    const j=await r.json();
    const k=j&&j.rates&&j.rates.EUR;
    if(!k) return null;
    const rec={koers:k,tijd:Date.now(),datum:j.date};
    LS.set('aus_koers',rec); return rec;
  }catch(e){ return null; }
}
function renderKoers(box){
  if(!box) return;
  const opgeslagen=LS.get('aus_koers');
  const teken=(rec,bezig)=>{
    const k=rec?rec.koers:KOERS_TERUGVAL.koers;
    const nlDatum=iso=>{const [j,m,dg]=String(iso).split('-').map(Number);
      return `${dg} ${MN[m-1]} ${j}`};
    const bron=rec?`Koers van ${rec.datum?nlDatum(rec.datum):fmtWhen(new Date(rec.tijd).toISOString())}`
                  :'Richtkoers, nog niet opgehaald';
    box.innerHTML=`<div class="koers">
      <div class="krij"><label for="kaud">AUD</label><input id="kaud" type="text" inputmode="decimal" value="100"></div>
      <div class="kpijl">≈</div>
      <div class="krij"><label for="keur">EUR</label><input id="keur" type="text" inputmode="decimal" value=""></div>
      <div class="knoot">1 AUD = ${k.toFixed(4).replace('.',',')} EUR · ${esc(bron)}${bezig?' · bijwerken…':''}</div>
      <div class="knoot2">Reken snel: deel door 2 en tel er een tiende bij. A$50 ≈ €${Math.round(50*k)}.</div>
    </div>`;
    const a=box.querySelector('#kaud'), e=box.querySelector('#keur');
    const num=v=>parseFloat(String(v).replace(',','.').replace(/[^\d.]/g,''));
    const fmt=v=>isFinite(v)?v.toFixed(2).replace('.',','):'';
    const naarEur=()=>{const v=num(a.value); e.value=isFinite(v)?fmt(v*k):''};
    const naarAud=()=>{const v=num(e.value); a.value=isFinite(v)?fmt(v/k):''};
    a.addEventListener('input',naarEur); e.addEventListener('input',naarAud);
    naarEur();
  };
  teken(opgeslagen,navigator.onLine);
  if(navigator.onLine){
    const oud=opgeslagen&&opgeslagen.tijd&&Date.now()-opgeslagen.tijd<6*3600*1000;
    if(!oud) haalKoers().then(r=>{ if(r&&document.body.contains(box)) teken(r,false); else teken(opgeslagen,false); });
    else teken(opgeslagen,false);
  }
}

// Verzekeringen in het tabblad Praktisch: per persoon of huishouden één notitie met verzekeraar,
// polisnummer en alarmcentrale. Uit de lokale kopie, dus ook offline.
function renderVerzekeringen(box){
  if(!box||!NH.user) return;
  const wie=NH.user.displayName||NH.user.email;
  const items=[...alleNotities(),...pendingAlsItems()].filter(isVerz)
    .sort((a,b)=>String(a.created_at||'').localeCompare(String(b.created_at||'')));
  // De kop van de kaart is de naam: daar zoek je op. De metaregel toont dan alleen de datum.
  const kop=it=>`<span class="ntype verzekering">${esc(it.wie||'Onbekend')}</span>`;
  // Dezelfde .notes-wrapper als bij de dag en in Notities: daar hangt de kaartopmaak aan.
  box.innerHTML=`<div class="notes">`+(items.length
    ?`<ul class="list nlist">${items.map(it=>noteCard(it,kop(it),{zonderNaam:true})).join('')}</ul>`
    :`<div class="empty">Nog geen verzekeringsgegevens. Zet per persoon of huishouden één notitie neer: verzekeraar, polisnummer en het nummer van de alarmcentrale.</div>`)+
    `<div class="dagadd" style="margin:14px 0 0"><button class="btn" id="vadd">＋ Verzekering toevoegen</button></div></div>`;
  const refresh=()=>syncAlles(true).then(()=>renderVerzekeringen(document.getElementById('verz')));
  box.querySelector('#vadd').onclick=()=>openSheet({dag:0,wie,type:'verzekering',vast:true,onDone:refresh});
  koppelKaarten(box);
  box.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{
    const it=items.find(x=>x.id===b.dataset.edit); if(it) openSheet({dag:it.dag,wie,item:it,vast:true,onDone:refresh});
  });
  box.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{
    if(!confirm('Verwijderen?')) return;
    if(b.dataset.pix!==undefined){ pendingDelete(+b.dataset.pix); refresh(); return; }
    try{ await verwijderItem(b.dataset.del,b.dataset.file); refresh(); }
    catch(e){ toast('Verwijderen mislukt: '+e.message); }
  });
}
// Na een sprong naar Praktisch het blok in beeld brengen. Eerst tekenen, dan scrollen.
function naarPraktisch(id){ switchTo('prakt'); requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({block:'start'})); }

function renderAccount(box){
  if(!box) return;
  if(NH.user){
    box.innerHTML=`<div class="callout" style="margin:0"><span class="ico">${IC_SLOT}</span><span><b>Ingelogd als ${esc(NH.user.displayName||NH.user.email)}</b>`+
      `Notities staan bij de dag zelf en bij elkaar in het tabblad Notities. <a href="#" id="logout">Uitloggen</a></span></div>`;
    box.querySelector('#logout').onclick=async e=>{e.preventDefault();
      if(navigator.onLine) await flushPending();
      const w=pending().length;
      if(w&&!confirm(`${w===1?'Er wacht nog 1 notitie of waarneming':'Er wachten nog '+w+' notities of waarnemingen'} op verbinding. Bij uitloggen ${w===1?'gaat die':'gaan die'} verloren. Toch uitloggen?`)) return;
      await nhLogout(); await wisPriveGegevens(); toonTabs(); renderPrakt();};
    return;
  }
  box.innerHTML=`<div class="callout" style="margin:0 0 14px"><span class="ico">${IC_SLOT}</span><span><b>Alleen voor de groep</b>Log in om notities en tickets te zien en toe te voegen. Zonder inloggen blijft dat deel onzichtbaar.</span></div>`+
    `<form class="ncompose login" id="lform" action="#" method="post" autocomplete="on">`+
    `<input id="lemail" name="username" type="email" autocomplete="username" inputmode="email" autocapitalize="none" placeholder="E-mailadres" required>`+
    `<input id="lpw" name="password" type="password" autocomplete="current-password" placeholder="Wachtwoord" required>`+
    `<div class="nrow"><button class="btn primary" id="lbtn" type="submit">Inloggen</button></div><div class="nstatus" id="lstat"></div></form>`;
  box.querySelector('#lform').addEventListener('submit',async e=>{
    e.preventDefault();
    const st=box.querySelector('#lstat'); st.textContent='Inloggen…';
    try{ await nhLogin(box.querySelector('#lemail').value.trim(),box.querySelector('#lpw').value); await flushPending(); toonTabs(); renderPrakt(); }
    catch(err){ st.textContent=err.message==='Inloggen mislukt'?'Onjuist e-mailadres of wachtwoord.':err.message; }
  });
}

function toast(msg,knop,actie){
  let t=document.getElementById('toast'); if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t);}
  t.textContent=msg;
  // Met een knop (Ongedaan maken) blijft de melding langer staan en verdwijnt na de tik meteen.
  if(knop){ const b=document.createElement('button'); b.type='button'; b.textContent=knop;
    b.onclick=()=>{ t.classList.remove('on'); clearTimeout(t._h); actie(); }; t.appendChild(b); }
  t.classList.add('on'); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('on'),knop?6000:3200);
}

// ---- Dieren: waarnemingen ----
// De lijst staat in dieren.js. Een waarneming is een rij in de tabel waarnemingen bij Nhost, met het
// dier (de sleutel uit de lijst, of 'overig' met de naam in opmerking), de dag, de plaatselijke tijd
// en wie het zag. Zonder verbinding gaat hij in dezelfde wachtrij als een notitie.
const DIER_LIJST=typeof DIEREN!=='undefined'&&Array.isArray(DIEREN)?DIEREN:[];
const DIER_GROEP=typeof DIER_GROEPEN!=='undefined'&&Array.isArray(DIER_GROEPEN)?DIER_GROEPEN:[];
const DIER_ICOON=typeof DIER_ICONEN==='object'&&DIER_ICONEN?DIER_ICONEN:{};
const dierVan=k=>DIER_LIJST.find(d=>d.k===k)||null;
// Namen in dieren.js kunnen een zacht afbreekstreepje bevatten voor op de knop. Overal elders weg.
const schoon=n=>String(n||'').replace(/\u00AD/g,'');
const dierNaam=w=>w.dier==='overig'?(w.opmerking||'Onbekend dier'):schoon((dierVan(w.dier)||{n:w.dier}).n);
// De dag waar een waarneming bij hoort: de dag waarin we zitten, anders de dag die openstaat
const waarnDag=()=>T.dag!=null?T.dag:(isBuiten(cur)||(cur>=1&&cur<=29)?cur:0);
// Hoe een dag heet, voor de kop van het tabblad Dieren en de tussenkoppen in de lijst Gespot
function dagLabel(n){
  if(n===0) return 'Niet aan een dag';
  if(isBuiten(n)) return `${n<0?'Voorreis':'Nareis'} · ${fmtShort(dagDatum(n))}`;
  const d=DAYS[n-1];
  return `Dag ${n}${d?' · '+d.p:''}`;
}
// Tijdstip als tekst mét het tijdverschil van de telefoon, zodat 15.32 uur in Kakadu 15.32 blijft,
// ook als de rij pas uren later bij de server aankomt en ook als iemand hem thuis bekijkt.
function nuISO(){
  const d=new Date(), p=n=>String(n).padStart(2,'0'), o=-d.getTimezoneOffset(), a=Math.abs(o);
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${o<0?'-':'+'}${p(Math.floor(a/60))}:${p(a%60)}`;
}
// Uur en minuut uit de tekst, zonder omrekening naar de tijdzone van de telefoon
const tijdVan=iso=>{ const m=String(iso||'').match(/T(\d\d):(\d\d)/); return m?`${m[1]}.${m[2]}`:''; };
const waarnemingen=()=>[...alleWaarnemingen(),...pendingWaarnemingen()];
// Aantal keer dat de groep een dier zag, op de sleutel
function dierTelling(){ const t={}; waarnemingen().forEach(w=>{ t[w.dier]=(t[w.dier]||0)+1; }); return t; }

async function registreerWaarneming(dier,opmerking){
  if(!NH.user) return;
  const wie=NH.user.displayName||NH.user.email;
  const rec={tabel:'waarnemingen',dier,dag:waarnDag(),gezien_op:nuISO(),wie,opmerking:opmerking||null};
  const naam=dierNaam(rec);
  let id=null;
  const inWachtrij=()=>LS.set('aus_pending',[...pending(),rec]);
  if(navigator.onLine){
    try{
      const d=await gql(M_INS_WAARN,{o:{dier:rec.dier,dag:rec.dag,gezien_op:rec.gezien_op,wie:rec.wie,opmerking:rec.opmerking}});
      id=d.insert_waarnemingen_one.id;
      LS.set('aus_cache_waarn',[...alleWaarnemingen(),{...rec,id,user_id:NH.user.id,created_at:rec.gezien_op}]);
    }catch(e){
      // Tijdelijk: in de wachtrij. Blijvend (tabel ontbreekt, rechten): ook in de wachtrij, met de reden
      // erbij, net als bij een notitie. De waarneming mag niet verloren gaan.
      if(e.tijdelijk) inWachtrij(); else LS.set('aus_pending',[...pending(),{...rec,fout:e.message}]);
    }
  } else inWachtrij();
  renderDieren();
  toast(`${naam} gespot om ${tijdVan(rec.gezien_op)} uur`,'Ongedaan maken',async()=>{
    if(id){
      try{ await gql(M_DEL_WAARN,{id}); }catch(e){ toast('Weghalen lukte niet. Probeer het straks opnieuw.'); return; }
      LS.set('aus_cache_waarn',alleWaarnemingen().filter(w=>w.id!==id));
    }else{
      const ix=pending().findIndex(q=>tabelVan(q)==='waarnemingen'&&q.gezien_op===rec.gezien_op&&q.dier===rec.dier);
      if(ix>=0) pendingDelete(ix);
    }
    renderDieren();
  });
}
async function verwijderWaarneming(w){
  if(w.pending){ pendingDelete(w.pix); renderDieren(); return; }
  const n=dierNaam(w);
  if(!confirm(`Je ${n.charAt(0).toLowerCase()+n.slice(1)} van ${tijdVan(w.gezien_op)} uur weghalen?`)) return;
  try{ await gql(M_DEL_WAARN,{id:w.id}); }catch(e){ toast(e.tijdelijk?'Geen verbinding. Probeer het straks opnieuw.':'Weghalen lukte niet. '+e.message); return; }
  LS.set('aus_cache_waarn',alleWaarnemingen().filter(x=>x.id!==w.id));
  renderDieren();
}
// Blad voor een dier dat niet in het raster staat: één tekstveld, meer niet.
function openDierSheet(){
  document.getElementById('sheet')?.remove();
  const el=document.createElement('div'); el.id='sheet'; el.className='sheetwrap';
  el.innerHTML=`<div class="sheetbg"></div><div class="sheet" role="dialog" aria-modal="true">
    <div class="sheethead"><strong>Iets anders gezien?</strong><button class="nbtn" id="shclose" aria-label="Sluiten">×</button></div>
    <input id="shdier" class="shinput" type="text" maxlength="60" placeholder="Wat heb je gezien?" autocomplete="off" autocapitalize="sentences" enterkeyhint="done">
    <div class="nrow"><button class="btn primary" id="shsave">Gespot</button></div></div>`;
  document.body.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('on'));
  const close=()=>{el.classList.remove('on');setTimeout(()=>el.remove(),220)};
  el.querySelector('.sheetbg').onclick=close; el.querySelector('#shclose').onclick=close;
  const inp=el.querySelector('#shdier');
  const bewaar=()=>{ const v=inp.value.trim(); if(!v){ inp.focus(); return; } close(); registreerWaarneming('overig',v.charAt(0).toUpperCase()+v.slice(1)); };
  el.querySelector('#shsave').onclick=bewaar;
  inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); bewaar(); } };
  setTimeout(()=>inp.focus(),250);
}
// Dier bij een naam uit een wild-blok van een dag, via de naam of een synoniem
const dierBijNaam=naam=>DIER_LIJST.find(d=>schoon(d.n)===naam||(d.syn||[]).includes(naam))||null;
// Twee kleuren per groep, licht en donker. De opmaak kiest met --g en --gd zelf de juiste.
const kleurVan=g=>{ const x=DIER_GROEP.find(y=>y[0]===g)||[]; return `--g:${x[2]||'#4B545F'};--gd:${x[3]||x[2]||'#98A2AE'}`; };
const kansDots=k=>`<span class="chance" title="${['','Geluk nodig','Goede kans','Bijna zeker'][k]||''}">${'●'.repeat(k)}${'○'.repeat(3-k)}</span>`;
// Waarop het zoekveld dit dier vindt: de naam en de synoniemen die één dier zijn. Synoniemen met 'en'
// erin ('Rode reuzenkangoeroe en emoe') zijn dagteksten die twee dieren noemen. Die staan er alleen om
// zo'n dagregel aan een dier te koppelen, en zouden bij het zoeken het verkeerde dier opleveren:
// wie 'emoe' typt, kreeg anders ook de kangoeroe te zien.
const zoekTekst=(dier,naam)=>[schoon(naam),...((dier&&dier.syn)||[]).filter(x=>!/ en /i.test(x))].join(' ').toLowerCase();
// Eén regel in de lijst: icoon in een rondje, naam, eventueel kans en tekst, en rechts de teller.
// dier is een dier uit de lijst of null (dan een 'ander dier' met alleen een naam).
function dierRij(dier,{naam,tekst,kans,tel,mijn,groep}){
  const k=dier?dier.k:'overig';
  // Een dier zonder eigen tekening krijgt het pootje, in de kleur van de groep waarin het staat.
  const ic=dier?(DIER_ICOON[dier.k]||PAW):PAW;
  return `<button type="button" class="drij${tel?' gespot':''}${mijn?' mijn':''}" data-dier="${k}" data-naam="${esc(naam)}"`+
    ` data-zoek="${esc(zoekTekst(dier,naam))}"`+
    ` data-gespot="${tel?1:0}" style="${kleurVan(groep)}">`+
    `<span class="dico">${ic}</span>`+
    `<span class="dtxt"><strong>${esc(schoon(naam))}${kans?kansDots(kans):''}</strong>${tekst?`<span class="sub">${esc(tekst)}</span>`:''}</span>`+
    (tel?`<span class="dtel">${tel}</span>`:'')+`</button>`;
}
function renderDieren(){
  const box=document.getElementById('dieren');
  if(!NH.user){ box.innerHTML=''; return; }
  const alle=waarnemingen(), tel=dierTelling();
  const mijn={}; alle.filter(w=>w.user_id===NH.user.id).forEach(w=>{ mijn[w.dier]=(mijn[w.dier]||0)+1; });
  // 'ander dier' telt op naam, want daar is geen sleutel
  const telAnder=naam=>alle.filter(w=>w.dier==='overig'&&(w.opmerking||'').toLowerCase()===naam.toLowerCase());
  let h='';
  // Statusregel in dezelfde vorm als die in Notities
  const fout=mislukt('waarnemingen'), wacht=pendingWaarnemingen().length-fout, st=[];
  if(wacht) st.push(`${wacht} ${wacht===1?'waarneming wacht':'waarnemingen wachten'} op verbinding`);
  if(fout) st.push(`${fout} ${fout===1?'waarneming kon':'waarnemingen konden'} niet worden verstuurd`);
  if(st.length) h+=`<p class="dstatus">${st.join(' · ')}</p>`;
  h+=`<p class="dintro">Tik op een dier zodra je het ziet.</p>`;

  // Kans vandaag: de dieren uit het programma van de dag, met de kans erbij
  const dag=waarnDag(), dd=dagData(dag), vandaag=dag===T.dag;
  const kansen=[];
  if(dd&&dd.emoe) kansen.push({dier:dierVan('emoe'),naam:'Emoe',tekst:dd.emoe[1],kans:dd.emoe[0]});
  ((dd&&dd.wild)||[]).forEach(([a,b,k])=>kansen.push({dier:dierBijNaam(a),naam:a,tekst:b,kans:k}));
  // Een dier uit de dagtekst zonder eigen knop hoort bij geen enkele groep, dus krijgt het de
  // neutrale kleur van Overig, waar de waarneming straks ook terechtkomt.
  if(kansen.length){
    h+=`<div class="dkop solo"><h2>${vandaag?'Kans vandaag':'Kans op deze dag'}</h2></div><div class="dlist">`+
      kansen.map(x=>{ const d=x.dier, n=d?(tel[d.k]||0):telAnder(x.naam).length, m=d?(mijn[d.k]||0):telAnder(x.naam).some(w=>w.user_id===NH.user.id);
        return dierRij(d,{naam:x.naam,tekst:x.tekst,kans:x.kans,tel:n,mijn:m,groep:d?d.g:'overig'}); }).join('')+
      `</div><p class="dhint">Uit het programma van ${vandaag?'vandaag':'deze dag'}. De rest van de lijst staat eronder.</p>`;
  }

  // Alle dieren: zoekveld, groepen als chips, per groep een lijst
  const perGroep=g=>DIER_LIJST.filter(d=>d.g===g);
  // Overig wordt niet uit de lijst gehaald maar uit de waarnemingen: elke naam die iemand onder
  // 'Iets anders gezien' heeft ingevoerd, één regel per naam. Alles daarin is per definitie gespot.
  const anderen=(()=>{ const m=new Map();
    alle.filter(w=>w.dier==='overig'&&w.opmerking).forEach(w=>{ const k=w.opmerking.trim().toLowerCase();
      const x=m.get(k)||{naam:w.opmerking.trim(),tel:0,mijn:0}; x.tel++; if(w.user_id===NH.user.id) x.mijn++; m.set(k,x); });
    return [...m.values()].sort((a,b)=>b.tel-a.tel||a.naam.localeCompare(b.naam)); })();
  const groepLijst=DIER_GROEP.filter(([g])=>g!=='overig'||anderen.length);
  const telGroep=g=>g==='overig'?[anderen.length,anderen.length]:[perGroep(g).filter(d=>tel[d.k]).length,perGroep(g).length];
  h+=`<div class="dkop"><h2>Alle dieren</h2></div>`+
    `<input id="dzoek" class="dzoek" type="search" placeholder="Zoek een dier" autocomplete="off" value="${esc(window._dzoek||'')}">`+
    `<div class="dchips">`+
      (()=>{ // Een aangezette chip krijgt een kruisje, net als de filters in Notities, zodat zichtbaar
             // is dat je hem ook weer uit kunt zetten.
        const uit=`<span class="chipx" aria-hidden="true">×</span>`, aan=window._dgespot;
        return `<button type="button" class="dchip dfilter${aan?' on':''}" id="dfilter"${aan?' aria-pressed="true"':''}>Eerder gespot<span>${DIER_LIJST.filter(d=>tel[d.k]).length+anderen.length}</span>${aan?uit:''}</button>`+
          groepLijst.map(([g,label])=>{ const [gs,tot]=telGroep(g), on=window._dgroep===g;
            return `<button type="button" class="dchip${on?' on':''}" data-groep="${g}"${on?' aria-pressed="true"':''} style="${kleurVan(g)}">${esc(label)}<span>${gs}/${tot}</span>${on?uit:''}</button>`; }).join('');
      })()+`</div>`+
    `<div id="dalle">`+groepLijst.map(([g,label])=>{ const [gs,tot]=telGroep(g); if(!tot) return '';
      const rijen=g==='overig'
        ? anderen.map(a=>dierRij(null,{naam:a.naam,tel:a.tel,mijn:a.mijn,groep:'overig'})).join('')
        : perGroep(g).map(d=>dierRij(d,{naam:d.n,tel:tel[d.k]||0,mijn:mijn[d.k]||0,groep:g})).join('');
      return `<section class="dgroep" id="dg-${g}" style="${kleurVan(g)}"><div class="dkop"><h2>${esc(label)}</h2><span class="dsub">${gs} van ${tot}</span></div><div class="dlist">`+
        rijen+`</div></section>`; }).join('')+`</div>`;
  h+=`<p class="dstatus" id="dleeg" hidden>Geen dier gevonden.</p>`+
    `<div class="dkop solo"><h2>Ander dier</h2></div>`+
    `<button type="button" class="dander" id="dander">${PAW}<span><b>Iets anders gezien?</b>Typ de naam van het dier.</span><span class="arw">→</span></button>`;

  // Gespot: alle waarnemingen, nieuwste bovenaan, met een tussenkop per kalenderdag. We groeperen op
  // de datum van de waarneming zelf en niet op het dagnummer: dan staat er ook een datum boven wat
  // iemand op een dag zonder nummer heeft gezien.
  const lijst=[...alle].sort((a,b)=>String(b.gezien_op).localeCompare(String(a.gezien_op)));
  h+=`<h2>Gespot</h2>`;
  if(!lijst.length) h+=`<p class="dstatus">Nog niets gespot. De eerste is voor jou.</p>`;
  else{
    let vorige=null;
    h+=`<ul class="list dlijst">`+lijst.map(w=>{
      const eigen=w.user_id===NH.user.id, dat=String(w.gezien_op||'').slice(0,10);
      let kop='';
      if(dat!==vorige){ vorige=dat;
        const dd2=new Date(dat+'T12:00:00'), lang=fmtLong(dd2).replace(/^./,c=>c.toUpperCase());
        const voor=w.dag>=1&&w.dag<=29?`Dag ${w.dag} · `:isBuiten(w.dag)?`${w.dag<0?'Voorreis':'Nareis'} · `:'';
        kop=`<li class="ddag">${esc(voor+lang)}</li>`; }
      return kop+`<li><span class="dtijd">${tijdVan(w.gezien_op)}</span><span class="wbody"><strong>${esc(dierNaam(w))}</strong>`+
        `<span class="sub">${esc(w.wie||'Onbekend')}${w.pending?(w.fout?` · versturen mislukt: ${esc(w.fout)}`:' · wacht op verbinding'):''}</span></span>`+
        (eigen?`<button class="dweg" data-weg="${w.id}" aria-label="Weghalen">×</button>`:'')+`</li>`;
    }).join('')+`</ul>`;
  }

  // Tot nu toe
  const soorten=new Set(alle.map(w=>w.dier==='overig'?'overig:'+(w.opmerking||'').toLowerCase():w.dier)).size;
  const jij=alle.filter(w=>w.user_id===NH.user.id).length;
  if(alle.length) h+=`<h2>Tot nu toe</h2><p class="dstatus">Jullie hebben samen ${alle.length} ${alle.length===1?'dier':'dieren'} gespot, ${soorten} ${soorten===1?'soort':'verschillende soorten'} en ${jij?jij:'nog geen'} door jou.</p>`;
  box.innerHTML=h;

  box.querySelectorAll('.drij').forEach(b=>b.onclick=()=>b.dataset.dier==='overig'?registreerWaarneming('overig',b.dataset.naam):registreerWaarneming(b.dataset.dier));

  // Het zoekveld en de chips filteren samen de lijst Alle dieren. Een chip is een schakelaar, geen
  // sprong naar beneden: zo houd je na het filteren de knop 'Ander dier' meteen in beeld. Er kan één
  // groep tegelijk aanstaan. Alles blijft staan na een tik op een dier, want dan wordt opnieuw getekend.
  const zoek=box.querySelector('#dzoek');
  const filter=()=>{ const q=zoek.value.trim().toLowerCase(); window._dzoek=q;
    const alleenGespot=!!window._dgespot, groep=window._dgroep||'';
    box.querySelectorAll('#dalle .drij').forEach(r=>{
      r.hidden=(!!q&&!r.dataset.zoek.includes(q))||(alleenGespot&&r.dataset.gespot!=='1'); });
    box.querySelectorAll('#dalle .dgroep').forEach(g=>{
      g.hidden=(!!groep&&g.id!=='dg-'+groep)||((!!q||alleenGespot)&&![...g.querySelectorAll('.drij')].some(r=>!r.hidden)); });
    const leeg=box.querySelector('#dleeg');
    if(leeg) leeg.hidden=![...box.querySelectorAll('#dalle .dgroep')].every(g=>g.hidden); };
  zoek.oninput=filter;
  box.querySelector('#dfilter').onclick=()=>{ window._dgespot=!window._dgespot; renderDieren(); };
  box.querySelectorAll('.dchip[data-groep]').forEach(c=>c.onclick=()=>{
    window._dgroep=window._dgroep===c.dataset.groep?'':c.dataset.groep; renderDieren(); });
  if(window._dzoek||window._dgespot||window._dgroep) filter();
  box.querySelector('#dander').onclick=openDierSheet;
  box.querySelectorAll('.dweg').forEach(b=>b.onclick=()=>{ const w=alle.find(x=>String(x.id)===b.dataset.weg); if(w) verwijderWaarneming(w); });
}

// Bij het openen: eerst de sessie en de notities uit de kopie op de telefoon, zodat alles er meteen
// staat, ook zonder verbinding. Daarna op de achtergrond vernieuwen bij Nhost. Alleen een 401 van
// de server logt uit. Een voorreiziger landt zo direct op zijn eigen dag in plaats van de startpagina.
{
  const saved=LS.get('aus_sess');
  if(saved) herstelUitKopie(saved,saved.refreshToken);
  toonTabs();
  if(cur===0||cur===EINDE) cur=vandaagPagina();   // voorreiziger of nareiziger: eigen dag
  render();
  const wasIngelogd=!!NH.user;
  nhRefresh().then(()=>{
    if(!!NH.user!==wasIngelogd){   // sessie bleek verlopen (of bestond nog niet): opnieuw tekenen
      toonTabs();
      if(view==='day'){ if(cur===0||isBuiten(cur)) cur=vandaagPagina(); render(); }
      else if(view==='prakt') renderPrakt();
    }
    if(!NH.user) return;
    flushPending();
    // alles op de achtergrond binnenhalen: notities én bijlagen. Wie voor het eerst op deze telefoon
    // inlogt, blijkt pas hierna voorreiziger te zijn. Dan schuift 'Vandaag' door naar zijn dag.
    syncAlles().then(items=>{ if(items&&view==='day'){ if(cur===0||cur===EINDE) cur=vandaagPagina(); render(); } });
  });
}
window.addEventListener('online',()=>{
  if(!NH.user) return;
  // even wachten tot de verbinding echt staat, dan pas vernieuwen en synchroniseren
  setTimeout(()=>{ nhRefresh().then(()=>flushPending()).then(aantal=>{
    const fn=mislukt('dagitems'), fw=mislukt('waarnemingen');
    if(fn) toast(fn===1?'Eén notitie kon niet worden verstuurd. Kijk in Notities.':`${fn} notities konden niet worden verstuurd. Kijk in Notities.`);
    else if(fw) toast(fw===1?'Eén waarneming kon niet worden verstuurd. Kijk bij Dieren.':`${fw} waarnemingen konden niet worden verstuurd. Kijk bij Dieren.`);
    else if(aantal) toast(verstuurdTekst());
    syncAlles(true).then(items=>{
      if(view==='alles') renderAlles(); else if(view==='day') render(); });
  }); },1500);
});

// ---- Versie en vernieuwen ----
// Eén nummer per uitgave. Sw.js heeft zijn eigen VERSION die je tegelijk ophoogt.
// De service worker merkt zelf op dat er een nieuwe versie is (nieuwe worker, of gewijzigde
// bestanden op de achtergrond) en meldt dat. De app hoeft daar niets meer voor op te halen.
const APP_VERSIE='2026-09-10-152';
document.getElementById('foot').innerHTML=`AustralieApp · versie ${APP_VERSIE}`;
function toonUpdateBalk(){
  if(document.getElementById('updatebar')) return;
  const b=document.createElement('div'); b.className='updatebar'; b.id='updatebar';
  b.innerHTML='<span>Er is een nieuwe versie van de app.</span><button>Vernieuwen</button>';
  // De nieuwe worker heeft de nieuwe bestanden al in zijn cache gezet en is al actief:
  // gewoon herladen is genoeg, en veiliger dan eerst alle caches wissen.
  b.querySelector('button').onclick=()=>location.reload();
  document.body.appendChild(b);
}
let swReg=null;
// Vragen of de service worker tijdens het laden al iets nieuws zag: die melding kan zijn
// binnengekomen voordat deze code draaide.
function vraagStatus(){
  navigator.serviceWorker?.ready.then(reg=>{
    (reg.active||navigator.serviceWorker.controller)?.postMessage({type:'status'});
  }).catch(()=>{});
}
document.addEventListener('visibilitychange',()=>{
  if(document.hidden) return;
  herbereken();                                  // na middernacht: 'Vandaag' verschuift
  if(swReg&&navigator.onLine) swReg.update().catch(()=>{});   // sw.js opnieuw ophalen: een paar honderd bytes
  vraagStatus();
});

// ---- Offline: service worker (alleen als de app van een website komt, niet als los bestand) ----
if('serviceWorker' in navigator && /^https?:/.test(location.protocol)){
  navigator.serviceWorker.register('./sw.js').then(reg=>{
    swReg=reg;
    reg.addEventListener('updatefound',()=>{
      const nw=reg.installing; if(!nw) return;
      nw.addEventListener('statechange',()=>{ if(nw.state==='installed'&&navigator.serviceWorker.controller) toonUpdateBalk(); });
    });
  }).catch(()=>{});
  navigator.serviceWorker.addEventListener('message',e=>{ if(e.data&&e.data.type==='nieuwe-versie') toonUpdateBalk(); });
  vraagStatus();                       // meteen bij het laden
  setTimeout(vraagStatus,3000);        // en nog eens, als het vergelijken op de achtergrond langer duurde
}
