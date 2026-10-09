// AustralieApp, service worker
// Bewaart de app op de telefoon zodat hij zonder verbinding opent, en haalt op de
// achtergrond nieuwe bestanden op. Hoog VERSION op bij elke uitgave (samen met APP_VERSIE in app.js).
const VERSION='v246';
const CACHE='australieapp-'+VERSION;
// Code en inhoud: zonder deze bestanden werkt de app niet, dus installeren mislukt als één ervan ontbreekt.
// De paklijst staat erbij omdat een nieuwe versie de oude cache weggooit. Zonder deze regel is hij daarna
// pas weer offline te openen als iemand hem eerst met verbinding heeft geopend.
const CODE=['./','./index.html','./app.css','./reis.js','./voorreis.js','./dieren.js','./dieren-iconen.js','./verhalen.js','./app.js','./manifest.webmanifest','./paklijst.html'];
// Beelden: fijn om te hebben, maar een ontbrekende foto mag de installatie niet blokkeren.
const BEELD=['./icon-512.png','./icon-maskable-512.png','./icon-paklijst.png',
  './banner-dagen.jpg','./banner-notities.jpg','./banner-praktisch.jpg','./banner-dieren.jpg',
  './reg-nsw.jpg','./reg-tas.jpg','./reg-sa.jpg','./reg-vic.jpg','./reg-red.jpg','./reg-qld.jpg','./reg-wa.jpg','./reg-reis.jpg','./reg-voorreis.jpg','./reg-nareis.jpg'];
// Van deze bestanden vergelijken we oud en nieuw. Is een codebestand (CODE) veranderd, dan volgt een
// nieuwe versie; een andere pagina naast de app wordt alleen bijgewerkt.
const TEKST=/(\/|\.html|\.js|\.css|\.webmanifest)$/;
// De pagina haalt app.js op vóórdat app.js zijn luisteraar heeft. Een melding op dat moment
// zou verloren gaan. Daarom onthouden we het ook, zodat de pagina er alsnog naar kan vragen.
let nieuwGezien=false;
async function meldNieuw(){
  nieuwGezien=true;
  const cl=await self.clients.matchAll({type:'window'});
  cl.forEach(w=>w.postMessage({type:'nieuwe-versie'}));
}
self.addEventListener('message',e=>{
  if(e.data&&e.data.type==='status'&&nieuwGezien&&e.source) e.source.postMessage({type:'nieuwe-versie'});
});

// cache:'reload' dwingt een verse kopie af. Anders kan de tussencache van GitHub Pages
// (tien minuten) een oude index.html in een nieuwe versie van onze cache zetten.
const vers=u=>new Request(u,{cache:'reload'});

// Eén gewijzigd codebestand betekent een nieuwe uitgave. Dan halen we álle codebestanden vers op,
// in twee stappen. Eerst komt alles binnen en wordt elk bestand helemaal uitgelezen, zonder dat er
// iets in de cache gaat. Pas als de hele set compleet is, gaat hij in één keer de cache in en volgt
// de melding. Mislukt er ook maar één bestand (slecht bereik, een fout van de server), dan blijft de
// cache zoals hij was en probeert de worker het de volgende keer opnieuw. Zo staat er bij half bereik
// nooit een nieuwe app.js naast een oude reis.js.
// Wat dit niet oplost: vlak na een push kan de tussencache van GitHub Pages (tien minuten) nog een
// oud bestand leveren dat wel compleet binnenkomt. De volgende controle trekt dat recht.
const SLEUTELS=new Set(CODE.map(u=>new URL(u,self.location).href));
let _vernieuwing=null;
function vernieuwAlles(c){
  if(!_vernieuwing) _vernieuwing=(async()=>{
    // Stap 1: alles ophalen en volledig binnenhalen. Eén mislukking breekt de hele ronde af.
    const binnen=await Promise.all(CODE.map(async u=>{
      const r=await fetch(vers(u));
      if(!r.ok) throw new Error(`${u}: ${r.status}`);
      return {u,inhoud:await r.blob(),headers:r.headers};
    }));
    // Is er echt iets veranderd? De tussencache kan ook gewoon de oude versie teruggeven, en dan
    // hoeft er niets te gebeuren en ook geen melding te komen.
    let anders=false;
    for(const b of binnen){
      const oud=await c.match(b.u,{ignoreVary:true});
      if(!oud||await oud.text()!==await b.inhoud.text()){ anders=true; break; }
    }
    if(!anders) return;
    // Nooit terug naar een oudere app.js: vlak na een push kan de tussencache er nog een leveren.
    // Het nummer achter APP_VERSIE loopt bij elke uitgave op, dus een lager nummer is een oude kopie.
    const nr=t=>+((String(t).match(/APP_VERSIE='[^']*-(\d+)'/)||[])[1]||0);
    const oudeApp=await c.match('./app.js',{ignoreVary:true}), nieuweApp=binnen.find(b=>b.u==='./app.js');
    if(oudeApp&&nieuweApp&&nr(await nieuweApp.inhoud.text())<nr(await oudeApp.text())) return;
    // Stap 2: de hele set in één keer de cache in, en dan pas melden.
    await Promise.all(binnen.map(b=>c.put(b.u,new Response(b.inhoud,{status:200,headers:b.headers}))));
    await meldNieuw();
  })().catch(()=>{}).finally(()=>{_vernieuwing=null});
  return _vernieuwing;
}

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE);
    await c.addAll(CODE.map(vers));
    await Promise.allSettled(BEELD.map(async u=>{
      try{ const r=await fetch(vers(u)); if(r.ok) await c.put(u,r); }catch(err){}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k.startsWith('australieapp-')&&k!==CACHE).map(k=>caches.delete(k))
  )).then(()=>self.clients.claim()));
});

// Eigen bestanden: eerst uit de cache (direct, ook offline), daarna op de achtergrond vernieuwen.
// Verzoeken naar Nhost, Frankfurter en Google gaan ongemoeid door.
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(e.request.method!=='GET'||url.origin!==self.location.origin) return;
  // Sleutel zonder ?datum=… en dergelijke, anders komt elke testdatum als aparte kopie in de cache.
  const sleutel=url.origin+url.pathname;
  e.respondWith((async()=>{
    const c=await caches.open(CACHE);
    const cached=await c.match(sleutel,{ignoreVary:true});
    const fresh=fetch(new Request(e.request.url,{cache:'no-cache'})).then(async r=>{
      if(!r||!r.ok) return r;
      const isTekst=TEKST.test(url.pathname);
      // Foto's gaan gewoon de cache in. Vergelijken kost alleen maar stroom.
      if(!isTekst||!cached){ await c.put(sleutel,r.clone()); return r; }
      const oud=await cached.clone().text(), nieuw=await r.clone().text();
      // Ongewijzigd: niets te doen. Bewust niet opnieuw wegschrijven, want een trage oude kopie
      // zou dan een net vernieuwde set kunnen overschrijven.
      if(oud===nieuw) return r;
      // Gewijzigd. Een codebestand zetten we niet los in de cache, want dan staat het nieuw naast
      // oude bestanden. Dat doet vernieuwAlles, met de hele set tegelijk. Een losse pagina naast
      // de app (geen codebestand) mag wel meteen.
      if(!SLEUTELS.has(sleutel)) await c.put(sleutel,r.clone());
      await vernieuwAlles(c);
      return r;
    }).catch(()=>null);
    // Bij een cachetreffer gaat het antwoord meteen de deur uit. Zonder deze regel mag de browser
    // (iOS vooral) de worker dan stoppen voordat het vergelijken klaar is, en gaat de melding verloren.
    e.waitUntil(fresh);
    return cached||(await fresh)||new Response(
      'Geen verbinding en nog geen kopie op deze telefoon. Open de app één keer met internet.',
      {status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
  })());
});
