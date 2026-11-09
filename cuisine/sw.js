// Ma cuisine keto : fonctionne hors connexion après la première ouverture.
const CACHE='cuisine-v1';
const CORE=['/cuisine','/cuisine/manifest.json','/cuisine/icon-192.png','/cuisine/icon-512.png','/cuisine/zxing-browser.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET')return;
  // page : le réseau d'abord (nouvelle version), sinon la copie enregistrée
  if(r.mode==='navigate'&&u.pathname.startsWith('/cuisine')){e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put('/cuisine',c));return res}).catch(()=>caches.match('/cuisine')));return}
  // fichiers de l'app et polices : la copie enregistrée, mise à jour en arrière-plan
  if((u.origin===location.origin&&u.pathname.startsWith('/cuisine/'))||/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}return res}).catch(()=>hit);return hit||net}))}
  // Open Food Facts et Supabase : toujours le réseau (l'app garde ses propres copies)
});
