const HERO_HTML=document.getElementById('hero').innerHTML;
const WD=["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"];
const MN=["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
const dateFor=n=>{const d=new Date(START);d.setDate(d.getDate()+n-1);return d};
const fmtLong=d=>`${WD[d.getDay()]} ${d.getDate()} ${MN[d.getMonth()]}`;
const fmtShort=d=>`${d.getDate()} ${MN[d.getMonth()].slice(0,3)}`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function todayInfo(){
  const n=new Date(), t=new Date(n.getFullYear(),n.getMonth(),n.getDate());
  const raw=Math.round((t-START)/864e5)+1;
  return {n:Math.min(29,Math.max(1,raw)),before:raw<1,after:raw>29,raw};
}
let T=todayInfo();
let cur=T.n,view='day',clockTimer=null;
// Een geïnstalleerde app blijft dagen open staan; na middernacht moet 'Vandaag' meebewegen.
function herbereken(){
  const oud=T; T=todayInfo();
  if(oud.n===T.n&&oud.before===T.before&&oud.after===T.after) return;
  if(view==='day'){ if(cur===oud.n) cur=T.n; render(); }
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
 excursie:["Excursiedag",'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 20 6-11 4.5 8M11 20l4-7 6 7Z"/></svg>'],
 vrij:["Vrije dag",'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>']
};
const CHECK='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11.5l2 2 4.5-5"/><rect x="3.5" y="3.5" width="17" height="17" rx="4"/></svg>';
const PAW='<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="flex:none;margin-top:3px;opacity:.7"><ellipse cx="7" cy="8.5" rx="2" ry="2.6"/><ellipse cx="17" cy="8.5" rx="2" ry="2.6"/><ellipse cx="11" cy="5" rx="2" ry="2.6"/><ellipse cx="13" cy="5" rx="2" ry="2.6" transform="translate(4 0)"/><path d="M12 11c-3 0-6 2.6-6 5.2 0 1.7 1.2 2.8 3 2.8 1 0 1.8-.4 3-.4s2 .4 3 .4c1.8 0 3-1.1 3-2.8C18 13.6 15 11 12 11Z"/></svg>';
const HOME='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/></svg>';
const EMU='<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><ellipse cx="9.5" cy="14.5" rx="6" ry="4.6"/><path d="M13.5 12.2c1.2-3.2 2.2-6 3.6-8.2.5-.8 1.5-1 2.1-.4l.9.9c.3.3.2.8-.2 1l-1.3.5c-.9 2.4-1.5 4.7-2.3 7z"/><path d="M6.5 18.5 5.6 23h1.3l1-4.2zM11.5 18.5l.9 4.5h-1.3l-1-4.2z"/></svg>';
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
  const d=DAYS[cur-1],date=dateFor(cur),tone=TONE[d.r];
  const isToday=!T.before&&!T.after&&cur===T.n;

  const hero=document.getElementById('hero');
  hero.style.setProperty('--tone',tone);
  hero.style.backgroundImage=`url(reg-${d.r}.jpg)`;
  hero.classList.add('foto');
  document.documentElement.style.setProperty('--tone',tone);
  document.querySelector('meta[name=theme-color]').setAttribute('content',tone);

  document.getElementById('eyebrow').innerHTML=
    (isToday?`<span class="dot live"></span>`:`<span class="dot" style="background:rgba(255,255,255,.4)"></span>`)
    +(isToday?`Vandaag · ${fmtLong(date)}`:fmtLong(date));
  document.getElementById('num').innerHTML=`Dag ${d.n}<small>van 29</small>`;
  document.getElementById('title').textContent=d.t;

  const kd=KIND[d.k];
  document.getElementById('metabox').innerHTML='';
  document.getElementById('flagbox').innerHTML='';

  document.getElementById('track').style.width=(cur/29*100)+'%';
  document.getElementById('navlabel').textContent=isToday?'Vandaag':fmtShort(date);

  let h=`<div class="dagmeta">`+
    (kd?`<span class="dm">${kd[1]}${kd[0]}</span>`:'')+
    `<span class="dm">${PIN}${esc(d.p)} · ${REGION[d.r]}</span>`+
    (d.h?(()=>{
      const g=HOTELGEO[d.h];
      // met coördinaten wijst de link naar precies dít pand, niet naar een andere vestiging
      const url=g?`https://www.google.com/maps/search/?api=1&query=${g[0]},${g[1]}`
                 :`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.h+', '+d.p+', Australia')}`;
      return `<a class="dm link" href="${url}" target="_blank" rel="noopener">${BED}${esc(d.h)}${EXTW}</a>`;})():'')+
    (d.temp?`<span class="dm">${THERM}${esc(d.temp)}</span>`:'')+
    (d.wash?`<span class="dm wash">${WASH}Was afgeven</span>`:'')+
    `</div>`;
  h+=`<div class="prose">${d.body.map(p=>`<p>${esc(p)}</p>`).join('')}</div>`;
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
    h+=`<h2>Tijdschema</h2><ol class="agenda">`+d.agenda.map(([tm,ti,tx,pv])=>
      `<li><span class="atime">${esc(tm)}</span><span class="abody"><strong>${esc(ti)}</strong><span class="sub">${esc(tx)}${pv&&NH.user?` <span class="privtag">${esc(pv)}</span>`:''}</span></span></li>`).join('')+`</ol>`;
  }
  if(T.before&&cur===1){
    const k=1-T.raw;
    h+=cal(IC_ZAND,'Aftellen',`Nog ${k} ${k===1?'dag':'dagen'} tot vertrek. De app springt vanzelf naar de juiste dag zodra de reis begint.`);
  }
  if(NH.user) h+=`<div id="notes-top" class="notes"></div>`;
  if(d.wash) h+=`<div class="callout washing"><span class="ico">${WASH}</span><span><b>Was afgeven</b>${esc(d.wash)}</span></div>`;
  if(d.note) h+=cal(IC_LET,'Let op',d.note);
  if(d.tip)  h+=cal(IC_TIP,'Tip',d.tip);

  const exToday=EXC.filter(e=>e[1]===cur);
  if(exToday.length){
    h+=`<h2>${exToday.some(e=>/^Geboekt/.test(e[2]))?'Geboekt en optioneel vandaag':'Optioneel vandaag'}</h2><ul class="list">`+
      exToday.map(([a,,c,om])=>`<li><div class="row"><span><strong>${esc(a)}</strong></span>`+
        `<span class="r${/^Geboekt/.test(c)?' booked':''}">${esc(c)}</span></div>`+
        (om?`<span class="sub" style="display:block;margin-top:4px">${esc(om)}</span>`:'')+
        `</li>`).join('')+`</ul>`;
  }
  const packToday=PACK.filter(p=>p[2].includes(cur));
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
      `</ul><div class="legend">● ● ● bijna zeker &nbsp; ● ● ○ goede kans &nbsp; ● ○ ○ geluk nodig</div>`;
  }
  if(d.food){
    h+=`<h2>Wat je hier moet proeven</h2><ul class="list">`+
      d.food.map(([a,b])=>`<li><strong>${esc(a)}</strong><span class="sub">${esc(b)}</span></li>`).join('')+`</ul>`;
  }
  // Notities die je vandaag nodig hebt (tickets, reserveringen) staan boven bij het programma;
  // de rest staat verderop, vlak voor het eten. Beide blokken worden in één slag gevuld.
  if(NH.user) h+=`<div id="notes-rest" class="notes"></div>`;
  if(cur<29){
    const t2=DAYS[cur],k2=KIND[t2.k];
    const p2=PACK.filter(p=>p[2].includes(cur+1)).map(p=>p[0].toLowerCase());
    h+=`<h2>Morgen</h2><div class="tomorrow"><button id="tmw">`+
       `<span class="txt"><span class="lbl">Dag ${t2.n} · ${fmtLong(dateFor(cur+1))}</span>`+
       `<span class="tt">${esc(t2.t)}</span>`+
       `<span class="sub">${k2?k2[1]+k2[0]:''}${t2.emoe?' · emoe-alert':''}${t2.wash?' · was afgeven':''}</span>`+
       (p2.length?`<span class="need">${CHECK}<span><b>Vanavond klaarleggen</b>${esc(p2.map((x,i)=>i?x:x.charAt(0).toUpperCase()+x.slice(1)).join(' · '))}</span></span>`:'')+
       `</span><span class="arw">→</span></button></div>`;
  }
  if(d.rest){
    // Suggesties, geen voorschrift: alles staat dicht, je klapt zelf uit wat je wilt lezen.
    h+=`<h2>Eten vanavond</h2>`+
      (d.rnote?`<div class="callout" style="margin:0 0 14px"><span class="ico">${IC_KLOK}</span><span><b>Openingstijden</b>${esc(d.rnote)}</span></div>`:'')+
      d.rest.map(([nm,wh,rt,pr,wk,no,bk],ix)=>{
      const meta=RDATA[nm]||{};
      let b='';
      if(rt){
        b+=`<span class="badge rate">${SRC} ${rt.toFixed(1).replace('.',',')}/5${meta.c?` · ${fmtCount(meta.c)} beoordelingen`:''}</span>`;
        if(rt<MIN_SCORE) b+=`<span class="badge low">Onder je norm van 4,4</span>`;
      }
      const pl=PRICE[pr]; if(pl) b+=`<span class="badge">${pl[0]}</span><span class="badge">${pl[1]}</span>`;
      if(meta.sluit) b+=`<span class="badge">Sluit ${meta.sluit} · keuken vaak eerder</span>`;
      const q=encodeURIComponent(nm+', '+wh+', Australia');
      const url='https://www.google.com/maps/search/?api=1&query='+q;
      const origin=d.h?encodeURIComponent(d.h+', '+d.p+', Australia'):'';
      const dir=origin?`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${q}&travelmode=walking`:url;
      let travel='';
      if(wk===0) travel=`<span class="badge">Vervoer nodig · taxi of bus</span>`;
      else if(wk){
        travel=`<span class="badge">≈ ${wk} min lopen</span>`;
        if(wk>=15) travel+=`<span class="badge">≈ ${Math.max(5,Math.round(wk/4)+2)} min taxi</span>`;
        if(d.n===18) travel+=`<span class="badge">Gratis resortshuttle</span>`;
      }
      let btns=`<a class="btn" href="${dir}" target="_blank" rel="noopener">Route</a>`+
               `<a class="btn" href="${url}" target="_blank" rel="noopener">Op de kaart</a>`;
      if(meta.tel) btns+=`<a class="btn" href="tel:${meta.tel.replace(/\s+/g,'')}">Bellen</a>`;
      // Samenvatting op één regel: genoeg om te kiezen zonder open te klappen.
      const kort=[rt?rt.toFixed(1).replace('.',',')+'/5':'', '€'.repeat(pr||1),
        wk===0?'vervoer nodig':(wk?wk+' min lopen':'')].filter(Boolean).join(' · ');
      return `<details class="card rcard"><summary>`+
             `<span class="rtop"><span class="role">${ROLE[Math.min(ix,2)]}</span>`+
             `<span class="rname">${esc(nm)}</span>`+
             `<span class="rkort">${kort}</span></span><span class="rchev">${ICO_CHEV}</span></summary>`+
             `<div class="rbody">`+
             `<div class="badges">${b}${travel}</div>`+
             `<div class="where">${PIN}${esc(wh)}</div><p>${esc(no)}</p>`+
             (bk?`<div class="book"><b>Reserveren</b><span>${esc(bk)}</span></div>`:'')+
             `<div class="btns">${btns}</div>`+
             `<div class="checked">Score en openingstijden: ${SRC}, gecontroleerd ${CHECKED}. Prijzen zijn een schatting op basis van de prijsklasse. Looptijd hemelsbreed geschat; tik op Route voor de echte wandelroute vanaf het hotel.</div>`+
             `</div></details>`;
    }).join('')+
    // De app geeft hints; ter plekke kijk je vaak toch even rond op de kaart.
    (()=>{const bij=encodeURIComponent('restaurants '+(d.h?d.h+', ':'')+d.p+', Australia');
      return `<a class="rmore" href="https://www.google.com/maps/search/?api=1&query=${bij}" target="_blank" rel="noopener">`+
        `<span>${PIN} Meer restaurants in de buurt${d.h?' van het hotel':''}</span><span class="rchev">${ICO_CHEV}</span></a>`;})();
  }
  // Toevoegen staat onderaan de dag, in de stroom: geen knop die over de tekst zweeft.
  if(NH.user) h+=`<div class="dagadd"><button class="btn" id="nadd">＋ Notitie toevoegen</button></div>`;
  document.getElementById('day').innerHTML=h;
  if(NH.user){
    renderNotes(cur);
    document.getElementById('nadd').onclick=()=>openSheet({
      dag:cur,wie:NH.user.displayName||NH.user.email,onDone:()=>renderNotes(cur)});
  }
  const tm=document.getElementById('tmw');
  if(tm) tm.addEventListener('click',()=>{if(cur<29){cur++;render()}});
  document.getElementById('prev').disabled=cur<=1;
  document.getElementById('next').disabled=cur>=29;
  window.scrollTo(0,0);
}
const cal=(ico,label,txt)=>`<div class="callout"><span class="ico">${ico}</span><span><b>${label}</b>${esc(txt)}</span></div>`;

const IC_LET='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4.5M12 17.2h.01"/></svg>';
const IC_TIP='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .9 1.6h5.2c.1-.6.4-1.2.9-1.6A6 6 0 0 0 12 3Z"/></svg>';
const IC_KLOK='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>';
const IC_SLOT='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10.5" width="16" height="10.5" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/></svg>';
const IC_KOFFER='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7.5" width="18" height="13" rx="2.5"/><path d="M8.5 7.5V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v2.5"/><path d="M3 12.5h18"/></svg>';
const IC_ZAND='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3h11M6.5 21h11"/><path d="M7.5 3v3.2c0 2 4.5 3.6 4.5 5.8s-4.5 3.8-4.5 5.8V21"/><path d="M16.5 3v3.2c0 2-4.5 3.6-4.5 5.8s4.5 3.8 4.5 5.8V21"/></svg>';
const PLUS='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
const WIS='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6 18 18M18 6 6 18"/></svg>';
const MAG='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

// doorzoekbare tekst per dag, met vermelding waar het vandaan komt
const HAY=DAYS.map(d=>{
  const bits=[[d.t,'Titel'],[d.p,'Plaats'],[REGION[d.r],'Regio']];
  if(d.h) bits.push([d.h,'Hotel']);
  if(d.emoe) bits.push(['Emoe-alert: '+d.emoe[1],'Emoe-alert']);
  (d.wild||[]).forEach(w=>bits.push([w[0]+' — '+w[1],'Dieren spotten']));
  (d.agenda||[]).forEach(a=>bits.push([a[0]+' '+a[1]+'. '+a[2],'Tijdschema']));
  (d.fl||[]).forEach(f=>bits.push([f[0]+' '+f[1]+' → '+f[2]+', vertrek '+f[3]+', aankomst '+f[4]+'. '+f[5],'Vlucht']));
  d.body.forEach(x=>bits.push([x,'Programma']));
  (d.prac||[]).forEach(x=>bits.push([x,'Goed om te weten']));
  (d.food||[]).forEach(([a,b])=>bits.push([a+' — '+b,'Specialiteit']));
  (d.rest||[]).forEach(r=>bits.push([r[0]+' — '+r[1]+'. '+r[5]+(r[6]?' Reserveren: '+r[6]:''),'Restaurant']));
  if(d.note) bits.push([d.note,'Let op']);
  if(d.rnote) bits.push([d.rnote,'Openingstijden']);
  EXC.filter(e=>e[1]===d.n).forEach(e=>bits.push([e[0]+' — '+e[3]+' Richtprijs '+e[2]+'.','Optionele excursie']));
  if(d.tip) bits.push([d.tip,'Tip']);
  if(d.wash) bits.push([d.wash,'Was afgeven']);
  PACK.filter(p=>p[2].includes(d.n)).forEach(p=>bits.push([p[0]+' — '+p[1],'Uit je koffer']));
  return bits;
});
// Praktische informatie is niet aan een dag gebonden; zoekresultaten hiervan openen het tabblad Praktisch
const HAY_PRAKT=[
  ['000 — Politie, brandweer en ambulance in heel Australië. Vanaf een mobiel werkt 112 ook.','Noodgevallen'],
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
  for(const it of alle){ if(it.type!=='ticket'||!it.tekst) continue; const m=it.tekst.match(re); if(m) return m[1].toUpperCase(); }
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
    uit.push({dag:it.dag,tekst,bron:(it.soort==='bestand'?'Bijlage':'Notitie')+' · '+typeLabel(it.type)+' · '+(it.wie||'')});
  });
  return uit;
}
function drawResults(term){
  const box=document.getElementById('results');
  term=(term||'').trim().toLowerCase();
  if(term.length<2){
    let h=`<ul class="idx">`;
    DAYS.forEach(d=>{
      const now=(!T.before&&!T.after&&d.n===T.n)?' class="now"':'';
      h+=`<li${now}><button data-n="${d.n}"><span class="bar" style="background:${TONE[d.r]}"></span>`+
         `<span class="n">${d.n}</span><span class="t">${esc(d.t)}</span>`+
         (KIND[d.k]?`<span class="k" title="${KIND[d.k][0]}">${KIND[d.k][1]}</span>`:'')+
         (d.emoe?`<span class="e" title="Emoe-alert">${EMU}</span>`:'')+
         (d.wash?`<span class="w">${WASH}</span>`:'')+
         `<span class="d">${fmtShort(dateFor(d.n))}</span></button></li>`;
    });
    box.innerHTML=h+`</ul>`;
  }else{
    let h='',hits=0;
    // eerst je eigen notities: die zoek je meestal gerichter
    notitieTreffers(term).forEach(t=>{
      hits++;
      h+=`<li><button data-n="${t.dag}"><div class="top">`+
         `<span class="dn">${t.dag===0?'Algemeen':'Dag '+t.dag}</span>`+
         `<span class="dt">${t.dag===0?'Niet aan een dag':esc(DAYS[t.dag-1].t)}</span>`+
         `<span class="dd">${t.dag===0?'':fmtShort(dateFor(t.dag))}</span></div>`+
         `<div class="sn">${snippet(t.tekst,term)}</div>`+
         `<div class="src">${esc(t.bron)}</div></button></li>`;
    });
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
    HAY_PRAKT.filter(([txt])=>txt.toLowerCase().includes(term)).slice(0,3).forEach(hit=>{
      hits++;
      h+=`<li><button data-n="-1"><div class="top"><span class="dn">Praktisch</span><span class="dt">${esc(hit[1])}</span></div>`+
         `<div class="sn">${snippet(hit[0],term)}</div><div class="src">Tabblad Praktisch</div></button></li>`;
    });
    box.innerHTML=hits?`<ul class="hits">${h}</ul>`
      :`<div class="empty">Niets gevonden voor “${esc(term)}”.</div>`;
  }
  box.querySelectorAll('button[data-n]').forEach(b=>
    b.addEventListener('click',()=>{const dg=+b.dataset.n; if(dg>=1){cur=dg;switchTo('day')} else if(dg<0) switchTo('prakt'); else switchTo('alles');}));
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
  const d=DAYS[cur-1];
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
   <div class="sos"><div class="big">000</div>
   <p>Politie, brandweer en ambulance in heel Australië. Vanaf een mobiel werkt 112 ook.</p></div>
   <ul class="list">`+NOOD.map(([a,b])=>`<li><strong>${esc(a)}</strong><span class="sub">${linkify(b)}</span></li>`).join('')+`</ul>`;

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

const BANNERS={
  index:['banner-dagen.jpg','Alle dagen','1 t/m 29 oktober 2026'],
  alles:['banner-notities.jpg','Notities',''],
  prakt:['banner-praktisch.jpg','Praktisch','']
};
function renderKop(v){
  const hero=document.getElementById('hero');
  if(v==='day'){ hero.classList.remove('banner'); hero.innerHTML=HERO_HTML; render(); return; }
  const [img,titel,sub]=BANNERS[v];
  hero.classList.add('banner'); hero.classList.remove('foto');
  hero.style.backgroundImage=`url(${img})`;
  hero.innerHTML=`<div class="wrap"><p class="btitel">${titel}</p>${sub?`<p class="bsub">${sub}</p>`:''}</div>`+
    `<div class="track"><i style="width:0"></i></div>`;
  document.querySelector('meta[name=theme-color]').setAttribute('content','#0E1013');
}
function switchTo(v){
  view=v;
  document.getElementById('day').style.display=v==='day'?'block':'none';
  document.getElementById('index').style.display=v==='index'?'block':'none';
  document.getElementById('prakt').style.display=v==='prakt'?'block':'none';
  document.getElementById('alles').style.display=v==='alles'?'block':'none';
  document.getElementById('foot').style.display=v==='prakt'?'block':'none';
  document.getElementById('navbar').style.display=v==='day'?'block':'none';
  [['btnToday','day'],['btnIndex','index'],['btnPrakt','prakt'],['btnAlles','alles']].forEach(([id,k])=>{
    const b=document.getElementById(id); b.classList.toggle('on',v===k); b.setAttribute('aria-pressed',v===k);
  });
  renderKop(v);
  if(v==='index'){renderIndex();window.scrollTo(0,0)}
  else if(v==='prakt'){renderPrakt();window.scrollTo(0,0)}
  else if(v==='alles'){renderAlles();window.scrollTo(0,0)}
}
// het vierde tabblad bestaat alleen voor wie is ingelogd
function toonTabs(){
  const b=document.getElementById('btnAlles');
  b.hidden=!NH.user;
  document.querySelector('.tabbar .inner').classList.toggle('vier',!!NH.user);
  if(!NH.user&&view==='alles') switchTo('day');
}
document.getElementById('prev').onclick=()=>{if(cur>1){cur--;render()}};
document.getElementById('next').onclick=()=>{if(cur<29){cur++;render()}};
document.getElementById('btnToday').onclick=()=>{cur=T.n;switchTo('day')};
document.getElementById('btnIndex').onclick=()=>switchTo(view==='index'?'day':'index');
document.getElementById('btnPrakt').onclick=()=>switchTo(view==='prakt'?'day':'prakt');
document.getElementById('btnAlles').onclick=()=>switchTo(view==='alles'?'day':'alles');
document.addEventListener('keydown',e=>{
  if(view!=='day')return;
  if(e.target.matches('input,textarea,select')||document.getElementById('sheet'))return;
  if(e.key==='ArrowLeft'&&cur>1){cur--;render()}
  if(e.key==='ArrowRight'&&cur<29){cur++;render()}
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
  if(dx<0&&cur<29){cur++;render()}else if(dx>0&&cur>1){cur--;render()}
},{passive:true});
// ============================================================
//  NOTITIES EN TICKETS — opslag bij Nhost (Frankfurt)
//  Zichtbaar voor wie inlogt; de server geeft alleen de rijen
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
// Alleen een 401 van de server betekent dat de sessie echt is verlopen. Elke andere storing —
// vliegtuigmodus, wegvallend bereik, een radio die net weer opstart — mag je niet uitloggen.
function herstelUitKopie(saved,rt){
  const MAX=30*24*3600*1000;   // een maand: langer dan de reis duurt
  if(saved&&saved.user&&saved.tijd&&Date.now()-saved.tijd<MAX){
    NH.user=saved.user; NH.refresh=rt; return true;
  }
  return false;
}
async function nhRefresh(pogingen){
  const saved=LS.get('aus_sess'); const rt=NH.refresh||(saved&&saved.refreshToken);
  if(!rt) return false;
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
      return nhRefresh((pogingen||0)+1);
    }
    herstelUitKopie(saved,rt);
    return false;
  }
}
async function nhToken(){ if(!NH.access||Date.now()>NH.exp) await nhRefresh(); return NH.access; }
async function nhLogin(email,pw){
  const r=await fetch(NH_AUTH+'/signin/email-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:pw})});
  const j=await r.json().catch(()=>({}));
  if(!r.ok||!j.session) throw new Error(j.message||'Inloggen mislukt');
  setSession(j.session); return j.session.user;
}
// Bij uitloggen blijft er niets van de groep op de telefoon achter
async function wisPriveGegevens(){
  window._notZoek=''; window._notType=''; window._notVandaag=false;
  try{ Object.keys(localStorage).filter(k=>k.startsWith('aus_')&&k!=='aus_thema'&&k!=='aus_koers').forEach(k=>localStorage.removeItem(k)); }catch(e){}
  try{ const db=await idb(); await new Promise(res=>{const t=db.transaction('files','readwrite').objectStore('files').clear();t.onsuccess=()=>res();t.onerror=()=>res()}); }catch(e){}
}
async function nhLogout(){ try{await fetch(NH_AUTH+'/signout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refreshToken:NH.refresh})})}catch(e){} setSession(null); }
async function gql(query,variables){
  const t=await nhToken(); if(!t) throw new Error('Niet ingelogd');
  const r=await fetch(NH_GQL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+t},body:JSON.stringify({query,variables})});
  const j=await r.json(); if(j.errors) throw new Error(j.errors[0].message); return j.data;
}
const Q_ITEMS=`query($dag:Int!){dagitems(where:{dag:{_eq:$dag}},order_by:{created_at:asc}){id user_id dag soort type tekst wie file_id naam mime grootte created_at updated_at}}`;
const Q_ALL=`query{dagitems(order_by:{dag:asc,created_at:asc}){id user_id dag soort type tekst wie file_id naam mime grootte created_at updated_at}}`;
const M_INS=`mutation($o:dagitems_insert_input!){insert_dagitems_one(object:$o){id created_at}}`;
const M_UPD=`mutation($id:uuid!,$t:String,$ty:String){update_dagitems_by_pk(pk_columns:{id:$id},_set:{tekst:$t,type:$ty}){id}}`;
// types, in de volgorde waarin ze in de lijst staan
const TYPES=[['ticket','Ticket'],['reservering','Reservering'],['adres','Adres'],['tip','Tip'],['notitie','Notitie']];
const typeLabel=t=>(TYPES.find(x=>x[0]===t)||TYPES[4])[1];
const typeRank=t=>{const i=TYPES.findIndex(x=>x[0]===t);return i<0?4:i};
const M_DEL=`mutation($id:uuid!){delete_dagitems_by_pk(id:$id){id}}`;
// Dag apart bijwerken, alleen als hij echt verandert; zo blijft gewoon bewerken werken
// ook als de rechten op de kolom dag ontbreken.
const M_UPD_DAG=`mutation($id:uuid!,$d:Int!){update_dagitems_by_pk(pk_columns:{id:$id},_set:{dag:$d}){id}}`;
async function verwijderItem(id,fileId){
  await gql(M_DEL,{id});
  if(fileId&&fileId!=='undefined'){ const weg=await deleteFile(fileId); if(!weg) toast('De notitie is weg; het bestand wordt bij de volgende synchronisatie opgeruimd.'); }
}

// ---- Bijlagen offline bewaren (IndexedDB; localStorage is te klein voor bestanden) ----
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

// bijlage ophalen en bewaren; geeft een adres terug dat ook offline werkt
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
      for(let i=0;i<=29;i++) LS.set('aus_cache_'+i,perDag[i]||[]);
      // bijlagen die weg zijn ook uit de opslag halen
      const geldig=new Set(items.filter(x=>x.file_id).map(x=>x.file_id));
      (await idbKeys()).forEach(k=>{ if(!geldig.has(k)) idbDel(k); });
      for(const it of items.filter(x=>x.soort==='bestand')) await cacheFile(it);
      LS.set('aus_sync',{tijd:new Date().toISOString()});
      return items;
    }catch(e){ return null; } finally { _sync=null; }
  })();
  return _sync;
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

// wachtrij voor notities die zonder verbinding zijn getypt
function pending(){return LS.get('aus_pending')||[]}
// Notities die nog op verbinding wachten staan alleen op deze telefoon; ze krijgen een eigen
// index als sleutel, zodat je ze kunt aanpassen of weggooien voordat ze zijn verstuurd.
function pendingUpdate(ix,velden){ const q=pending(); if(!q[ix])return; q[ix]={...q[ix],...velden}; LS.set('aus_pending',q); }
function pendingDelete(ix){ const q=pending(); q.splice(ix,1); LS.set('aus_pending',q); }
async function flushPending(){
  const q=pending(); if(!q.length||!navigator.onLine) return 0;
  const rest=[]; let verstuurd=0;
  for(const it of q){
    try{ await gql(M_INS,{o:{dag:it.dag,soort:'notitie',tekst:it.tekst,wie:it.wie,type:it.type||'notitie'}}); verstuurd++; }
    catch(e){ rest.push(it); }
  }
  LS.set('aus_pending',rest);
  return verstuurd;
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
// kop: wat links in de kopregel staat (typelabel of dagknop).
function noteCard(it,kop){
  const mine=NH.user&&it.user_id===NH.user.id;
  const wie=(mine&&NH.user.displayName)?NH.user.displayName:(it.wie||NH.user.displayName||NH.user.email);
  const lang=(it.tekst||'').split('\n').length>4||(it.tekst||'').length>280;
  const txt=it.tekst?`<span class="ntext${lang?' clamp':''}">${linkify(it.tekst)}</span>${lang?`<button class="nmore" type="button">Meer</button>`:''}`:'';
  const pix=it.pending?` data-pix="${it.pix}"`:'';
  const acts=mine?`<span class="nacts"><button class="nbtn" data-edit="${esc(it.id||'')}"${pix} aria-label="Bewerken">✎</button>`+
    `<button class="nbtn ndel" data-del="${esc(it.id||'')}"${pix}${it.file_id?` data-file="${esc(it.file_id)}"`:''} aria-label="Verwijderen">×</button></span>`:'';
  const head=`<div class="nhead">${kop}${acts}</div>`;
  const wanneer=it.pending?'wacht op verbinding':fmtWhen(it.created_at);
  const bewerkt=(!it.pending&&it.updated_at&&it.updated_at!==it.created_at)?' · bewerkt':'';
  if(it.soort==='bestand'){
    const isImg=/^image\//.test(it.mime||'');
    const soort=isImg?'Afbeelding':(/pdf/.test(it.mime||'')?'PDF':'Bestand');
    // De bestandsregel is de tapzone; het bijschrift staat eronder over de volle breedte,
    // zodat een lang bijschrift niet in een smalle kolom naast het icoon wordt geperst.
    return `<li class="nitem" data-id="${esc(it.id||'')}">${head}`+
      `<a class="nfilelink" href="#" data-open="${esc(it.file_id)}">`+
      `${isImg?`<img class="nthumb" alt="" data-thumb="${esc(it.file_id)}">`:`<span class="nicon">${isImg?ICO_FILE:ICO_PDF}</span>`}`+
      `<span class="nfname"><strong>${esc(it.naam||'bestand')}</strong>`+
      `<span class="nsize">${soort}${it.grootte?' · '+fmtSize(it.grootte):''}</span></span>`+
      `<span class="nopen">${ICO_CHEV}</span></a>`+
      (txt?`<span class="nbody">${txt}</span>`:'')+
      `<span class="sub nmeta">${esc(wie)} · ${wanneer}${bewerkt}</span></li>`;
  }
  return `<li class="nitem" data-id="${esc(it.id||'')}">${head}<span class="nbody">${txt}</span>`+
    `<span class="sub nmeta">${esc(wie)} · ${wanneer}${bewerkt}</span></li>`;
}
// Gedrag dat beide lijsten delen: miniaturen laden, bijlagen openen, Meer/Minder
function koppelKaarten(box){
  box.querySelectorAll('[data-thumb]').forEach(async img=>{const u=await localFileUrl(img.dataset.thumb)||await fileUrl(img.dataset.thumb); if(u) img.src=u;});
  box.querySelectorAll('[data-open]').forEach(a=>a.addEventListener('click',async e=>{ if(e.target.closest('.nmore')||e.target.closest('.nlink')) return; e.preventDefault();
    const u=await localFileUrl(a.dataset.open)||await fileUrl(a.dataset.open);
    if(u){const w=window.open(u,'_blank'); if(!w) location.href=u;} else toast('Deze bijlage staat nog niet op je telefoon; open de app een keer met verbinding.');}));
  box.querySelectorAll('.nmore').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();const t=b.previousElementSibling;const open=t.classList.toggle('clamp');b.textContent=open?'Meer':'Minder';});
}

async function renderNotes(dag){
  const top=document.getElementById('notes-top'), rest=document.getElementById('notes-rest');
  if(!top&&!rest) return;
  const wie=NH.user.displayName||NH.user.email;
  const cacheKey='aus_cache_'+dag;
  let items=LS.get(cacheKey)||[], status='';
  try{ const d=await gql(Q_ITEMS,{dag}); items=d.dagitems; LS.set(cacheKey,items); status=`Bijgewerkt ${fmtWhen(new Date().toISOString())}`; }
  catch(e){ status=navigator.onLine?`Kon niet laden: ${e.message}`:'Geen verbinding — laatst opgeslagen versie'; }
  const pend=pending().filter(p=>p.dag===dag);
  const all=[...items,...pend.map(p=>({...p,soort:'notitie',pending:true,
    pix:pending().findIndex(q=>q===p||(q.dag===p.dag&&q.tekst===p.tekst&&q.wie===p.wie))}))]
    .sort((a,b)=>typeRank(a.type)-typeRank(b.type)||String(a.created_at||'').localeCompare(String(b.created_at||'')));
  const tag=it=>`<span class="ntype ${esc(it.type||'notitie')}">${typeLabel(it.type)}</span>`;
  // Tickets en reserveringen heb je op een moment nodig; de rest is naslag.
  const nodig=all.filter(it=>it.type==='ticket'||it.type==='reservering');
  const overig=all.filter(it=>!nodig.includes(it));
  const lijst=(kop,rij)=>rij.length?`<h2>${kop}</h2><ul class="list nlist">`+rij.map(it=>noteCard(it,tag(it))).join('')+`</ul>`:'';
  // Zonder notities blijft het blok helemaal weg: geen lege kop op een dag zonder items.
  if(top) top.innerHTML=lijst('Vandaag nodig',nodig);
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

function openSheet({dag,wie,item,onDone,kiesDag}){
  document.getElementById('sheet')?.remove();
  const isEdit=!!item, isFile=item&&item.soort==='bestand'&&!item.pending;
  const el=document.createElement('div'); el.id='sheet'; el.className='sheetwrap';
  el.innerHTML=`<div class="sheetbg"></div><div class="sheet" role="dialog" aria-modal="true">
    <div class="sheethead"><strong>${isEdit?'Bewerken':'Toevoegen'}${dag?` · dag ${dag}`:''}</strong><button class="nbtn" id="shclose" aria-label="Sluiten">×</button></div>
    <div class="chips" id="shtypes">${TYPES.map(([k,l])=>`<button type="button" class="chip${(item?.type||'notitie')===k?' on':''}" data-t="${k}">${l}</button>`).join('')}</div>
    ${kiesDag?`<select id="shdag" class="shsel"><option value="0"${!dag?' selected':''}>Algemeen — niet aan een dag</option>${DAYS.map(x=>`<option value="${x.n}"${x.n===dag?' selected':''}>Dag ${x.n} · ${fmtShort(dateFor(x.n))} · ${esc(x.t)}</option>`).join('')}</select>`:''}
    ${isFile?`<div class="shfile">${ICO_FILE}<span>${esc(item.naam)}</span></div>`:''}
    <textarea id="shtext" rows="6" placeholder="${isFile?'Bijschrift…':'Notitie…'}">${esc(item?.tekst||'')}</textarea>
    <div class="nrow">
      ${!isEdit?`<label class="btn nupload">${ICO_FILE} Foto of pdf<input type="file" id="shfile" accept="image/jpeg,image/png,image/heic,image/heif,image/webp,application/pdf" multiple hidden></label>`:''}
      <button class="btn primary" id="shsave">${isEdit?'Opslaan':'Bewaar notitie'}</button>
    </div>
    <div class="nstatus" id="shstat"></div></div>`;
  document.body.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('on'));
  const close=()=>{el.classList.remove('on');setTimeout(()=>el.remove(),220)};
  el.querySelector('.sheetbg').onclick=close; el.querySelector('#shclose').onclick=close;
  let type=item?.type||'notitie';
  const dagVan=()=>kiesDag?+el.querySelector('#shdag').value:dag;
  el.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{type=c.dataset.t;el.querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x===c));});
  const ta=el.querySelector('#shtext'), st=el.querySelector('#shstat');
  setTimeout(()=>ta.focus(),250);

  el.querySelector('#shsave').onclick=async()=>{
    const t=ta.value.trim();
    if(isEdit&&item.pending){
      if(!t){ st.textContent='Typ eerst een notitie.'; return; }
      pendingUpdate(item.pix,{tekst:t,type,dag:dagVan()});
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
    if(!navigator.onLine){ LS.set('aus_pending',[...pending(),rec]); close(); toast('Bewaard op de telefoon; wordt verstuurd zodra er verbinding is.'); onDone(); return; }
    if(kiesDag) LS.set('aus_laatste_dag',dagVan());
    st.textContent='Opslaan…';
    try{ await gql(M_INS,{o:{...rec,soort:'notitie'}}); close(); onDone(); }
    catch(e){ LS.set('aus_pending',[...pending(),rec]); close(); toast('Bewaard op de telefoon; wordt verstuurd zodra er verbinding is.'); onDone(); }
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
  else status=navigator.onLine?'Kon niet bijwerken — laatst opgeslagen versie':'Geen verbinding — laatst opgeslagen versie';
  const wacht=pending().length;
  if(wacht) status+=` · ${wacht} ${wacht===1?'notitie wacht':'notities wachten'} op verbinding`;
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
  alleItems=[...items,...pending().map((p,i)=>({...p,id:'wacht'+i,pix:i,user_id:NH.user.id,soort:'notitie',
    type:p.type||'notitie',created_at:new Date().toISOString(),pending:true}))];

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
    dag:(!T.before&&!T.after)?T.n:(LS.get('aus_laatste_dag')??0),wie,kiesDag:true,onDone:renderAlles});
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
  const dagLabel=d=>d===0?'Algemeen':`Dag ${d} · ${fmtLong(dateFor(d))}`;
  const kaart=it=>noteCard(it,`<button class="ndag" data-dag="${it.dag}">${dagLabel(it.dag)}</button>`);
  const zoek=(window._notZoek||'').trim().toLowerCase();
  const filter=window._notType||'';
  // Ook de dag waar een notitie bij hoort telt mee: 'Uluru' vindt zo de notities van dag 18 tot 20,
  // ook als dat woord er zelf niet in staat.
  const dagTekst=d=>{ if(!d) return 'algemeen'; const x=DAYS[d-1];
    return `dag ${d} ${fmtLong(dateFor(d))} ${x?x.t+' '+x.p:''}`.toLowerCase(); };
  const hooi=it=>[it.tekst,it.naam,it.wie,dagTekst(it.dag)].filter(Boolean).join(' ').toLowerCase();
  const raak=it=>!zoek||hooi(it).includes(zoek);
  // Twee losse assen: welke dag (vandaag of alles) en welk soort. Ze werken samen.
  const vandaag=!!window._notVandaag;
  const dagOk=it=>!vandaag||it.dag===T.n;
  const typeOk=it=>!filter||(it.type||'notitie')===filter;
  const zichtbaar=items.filter(it=>raak(it)&&dagOk(it)&&typeOk(it));
  // Elk telletje houdt rekening met de andere filters: 'Ticket 1' naast een actieve
  // Vandaag-chip betekent dus één ticket van vandaag.
  const naZoek=items.filter(raak);
  const inDag=naZoek.filter(dagOk);
  const telling={}; inDag.forEach(it=>{const t=it.type||'notitie'; telling[t]=(telling[t]||0)+1});
  const telVandaag=naZoek.filter(it=>it.dag===T.n&&typeOk(it)).length;

  // Links de dag, rechts het soort; het streepje ertussen laat zien dat het twee vragen zijn.
  rij.innerHTML=items.length?`<div class="chips filters" id="typefilter">`+
    `<button type="button" class="chip dagchip${vandaag?' on':''}" data-d="1">Vandaag<span class="cnt">${telVandaag}</span></button>`+
    `<span class="chipsplit" aria-hidden="true"></span>`+
    `<button type="button" class="chip${filter?'':' on'}" data-f="">Alles<span class="cnt">${inDag.length}</span></button>`+
    TYPES.filter(([k])=>telling[k]||filter===k).map(([k,l])=>
      `<button type="button" class="chip${filter===k?' on':''}" data-f="${k}">${l}<span class="cnt">${telling[k]||0}</span></button>`).join('')+
    `</div>`:'';

  let h='';
  if(!items.length) h+=`<div class="empty">Nog geen notities.</div>`;
  else if(!zichtbaar.length){
    const wat=filter?`notities van het type ${typeLabel(filter).toLowerCase()}`:'notities';
    h+=`<div class="empty">${zoek?`Niets gevonden voor “${esc(zoek)}”.`:`Geen ${wat}${vandaag?' voor vandaag':''}.`}</div>`;
  }
  else if(filter) h+=`<ul class="list nlist" style="margin-top:14px">`+zichtbaar.map(kaart).join('')+`</ul>`;
  else TYPES.forEach(([key,label])=>{
    const groep=zichtbaar.filter(it=>(it.type||'notitie')===key);
    if(groep.length) h+=`<h2>${label}</h2><ul class="list nlist">`+groep.map(kaart).join('')+`</ul>`;
  });
  lijst.innerHTML=h;

  rij.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{
    if(c.dataset.d) window._notVandaag=!window._notVandaag;
    else window._notType=c.dataset.f;
    tekenLijst();
  });
  koppelKaarten(lijst);
  lijst.querySelectorAll('.ndag').forEach(b=>b.onclick=()=>{const dg=+b.dataset.dag; if(dg>=1){cur=dg;switchTo('day')} else switchTo('prakt');});
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
                  :'Richtkoers; nog niet opgehaald';
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

function renderAccount(box){
  if(!box) return;
  if(NH.user){
    box.innerHTML=`<div class="callout" style="margin:0"><span class="ico">${IC_SLOT}</span><span><b>Ingelogd als ${esc(NH.user.displayName||NH.user.email)}</b>`+
      `Notities staan bij de dag zelf en bij elkaar in het tabblad Notities. <a href="#" id="logout">Uitloggen</a></span></div>`;
    box.querySelector('#logout').onclick=async e=>{e.preventDefault();
      if(navigator.onLine) await flushPending();
      const w=pending().length;
      if(w&&!confirm(`${w===1?'Er wacht nog 1 notitie':'Er wachten nog '+w+' notities'} op verbinding. Bij uitloggen ${w===1?'gaat die':'gaan die'} verloren. Toch uitloggen?`)) return;
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

function toast(msg){
  let t=document.getElementById('toast'); if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t);}
  t.textContent=msg; t.classList.add('on'); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('on'),3200);
}

render();

// bij het openen: sessie herstellen, daarna opnieuw tekenen zodat de notitieblokken verschijnen
nhRefresh().then(ok=>{ toonTabs();
  if(NH.user){ flushPending();
    if(view==='day')render(); else if(view==='prakt')renderPrakt();
    // alles op de achtergrond binnenhalen: notities én bijlagen
    syncAlles().then(items=>{ if(items&&view==='day') render(); });
  } });
window.addEventListener('online',()=>{
  if(!NH.user) return;
  // even wachten tot de verbinding echt staat, dan pas vernieuwen en synchroniseren
  setTimeout(()=>{ nhRefresh().then(()=>flushPending()).then(aantal=>{
    if(aantal) toast(aantal===1?'Je notitie is verstuurd':`${aantal} notities zijn verstuurd`);
    syncAlles(true).then(items=>{
      if(view==='alles') renderAlles(); else if(view==='day') render(); });
  }); },1500);
});

// ---- Versie en vernieuwen ----
// Eén nummer per uitgave; sw.js heeft zijn eigen VERSION die je tegelijk ophoogt.
// De service worker merkt zelf op dat er een nieuwe versie is (nieuwe worker, of gewijzigde
// bestanden op de achtergrond) en meldt dat; de app hoeft daar niets meer voor op te halen.
const APP_VERSIE='2026-09-07-55';
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
