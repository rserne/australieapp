// AustralieApp, service worker
// Bewaart de app op de telefoon zodat hij zonder verbinding opent, en haalt op de
// achtergrond nieuwe bestanden op. Hoog VERSION op bij elke uitgave (samen met APP_VERSIE in app.js).
const VERSION='v130';
const CACHE='australieapp-'+VERSION;
// Code en inhoud: zonder deze bestanden werkt de app niet, dus installeren mislukt als één ervan ontbreekt.
const CODE=['./','./index.html','./app.css','./reis.js','./voorreis.js','./dieren.js','./dieren-iconen.js','./app.js','./manifest.webmanifest'];
// Beelden: fijn om te hebben, maar een ontbrekende foto mag de installatie niet blokkeren.
const BEELD=['./icon-512.png','./icon-maskable-512.png',
  './banner-dagen.jpg','./banner-notities.jpg','./banner-praktisch.jpg','./banner-dieren.jpg',
  './reg-nsw.jpg','./reg-tas.jpg','./reg-sa.jpg','./reg-vic.jpg','./reg-red.jpg','./reg-qld.jpg','./reg-wa.jpg','./reg-reis.jpg','./reg-voorreis.jpg','./reg-nareis.jpg'];
// Alleen van deze bestanden vergelijken we oud en nieuw om een nieuwe versie te melden.
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

// Eén gewijzigd tekstbestand betekent een nieuwe uitgave. Dan halen we eerst álle codebestanden
// vers op en melden pas daarna, zodat de pagina na 'Vernieuwen' geen mengsel van oud en nieuw
// krijgt: GitHub Pages cachet per bestand, dus app.js kan al nieuw zijn terwijl reis.js nog oud is.
// Dat sluit een mengsel niet helemaal uit (de tussencache kan één bestand nog even vasthouden),
// maar het venster wordt van 'tot de volgende keer openen' teruggebracht tot één moment.
let _vernieuwing=null;
function vernieuwAlles(c){
  if(!_vernieuwing) _vernieuwing=(async()=>{
    await Promise.allSettled(CODE.map(async u=>{
      try{ const r=await fetch(vers(u)); if(r.ok) await c.put(u,r); }catch(err){}
    }));
    await meldNieuw();
  })().finally(()=>{_vernieuwing=null});
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
      // alleen voor codebestanden lezen we de inhoud. Foto's vergelijken kost alleen maar stroom
      const oud=(isTekst&&cached)?await cached.clone().text():null;
      const nieuw=isTekst?await r.clone().text():null;
      await c.put(sleutel,r.clone());
      if(isTekst&&oud!==null&&oud!==nieuw) await vernieuwAlles(c);
      return r;
    }).catch(()=>null);
    return cached||(await fresh)||new Response(
      'Geen verbinding en nog geen kopie op deze telefoon. Open de app één keer met internet.',
      {status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
  })());
});
