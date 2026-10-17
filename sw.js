// Commander-Tafel – Offline-Cache
const CACHE='tafel-v3';
const CORE=['./','./index.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // Scryfall-Suche immer live (nicht cachen)
  if(url.hostname==='api.scryfall.com')return;
  // Seite selbst: zuerst Netz (für Updates), sonst Cache
  if(req.mode==='navigate'||(url.origin===location.origin&&url.pathname.endsWith('.html'))){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));return r}).catch(()=>caches.match(req).then(r=>r||caches.match('./'))));return}
  // Schriften und Kartenbilder: Cache zuerst, dann Netz
  if(/fonts\.(googleapis|gstatic)\.com$|cards\.scryfall\.io$/.test(url.hostname)||url.origin===location.origin){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok||r.type==='opaque'){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r})))}
});
