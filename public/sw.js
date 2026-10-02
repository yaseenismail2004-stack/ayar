// عامل الخدمة لتطبيق أيار — يجعل الواجهة تفتح بدون إنترنت
// • الصفحات وملفات الواجهة: من الشبكة أولاً (حتى تصل التحديثات فوراً)، ومن النسخة المحفوظة عند الانقطاع
// • الخطوط والصور والمكتبات: من النسخة المحفوظة أولاً (لا تتغير)
// • واجهة البيانات /api: لا تُحفظ أبداً (عدا صور المنتجات وبيانات موقع العرض)
const VERSION = 'ayar-v5';
const SHELL = [
  '/admin', '/',
  '/css/style.css',
  '/js/app.js', '/js/db.js', '/js/charts.js', '/js/export.js', '/js/barcode.js', '/js/store.js',
  '/manifest.webmanifest',
  '/brand/logo-192.png', '/brand/logo-512.png', '/favicon-32.png', '/favicon-64.png', '/icons/icon-192.png',
  '/fonts/plex-arabic-400.woff2', '/fonts/plex-arabic-500.woff2', '/fonts/plex-arabic-600.woff2', '/fonts/plex-arabic-700.woff2',
  '/fonts/plex-latin-400.woff2', '/fonts/plex-latin-500.woff2', '/fonts/plex-latin-600.woff2', '/fonts/plex-latin-700.woff2',
  '/vendor/zxing-browser.min.js', '/vendor/html-to-image.js'
];
const IMMUTABLE = /^\/(fonts|vendor|brand|icons)\/|^\/favicon-|^\/api\/img\//;
const TIMEOUT = 3500;
// Safari يرفض ردوداً محفوظة فيها تحويل (redirect) لصفحات التنقل — ننسخها كرد عادي
const clean = async r => r.redirected ? new Response(await r.blob(), { status: r.status, statusText: r.statusText, headers: r.headers }) : r;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    // كل ملف على حدة: فشل ملف واحد لا يُفشل التثبيت
    await Promise.all(SHELL.map(u => fetch(u, { cache: 'reload' }).then(async r => r.ok && c.put(u, await clean(r))).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => { if (e.data === 'skip-waiting') self.skipWaiting(); });

const timeout = (p, ms) => new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('timeout')), ms); p.then(v => { clearTimeout(t); res(v); }, err => { clearTimeout(t); rej(err); }); });

async function networkFirst(req, key) {
  const c = await caches.open(VERSION);
  try {
    // no-cache: يتحقق من الخادم دائماً (يصل كل تحديث فوراً) — والنسخة المحفوظة احتياط للانقطاع
    // (طلبات التنقل لا تقبل خيارات إضافية، لذلك نبني طلباً جديداً بنفس العنوان)
    const fresh = req.mode === 'navigate' ? new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' }) : new Request(req, { cache: 'no-cache' });
    const r = await clean(await timeout(fetch(fresh), TIMEOUT));
    if (r.ok && (r.type === 'basic' || r.type === 'default')) c.put(key || req, r.clone());
    return r;
  } catch (err) {
    const hit = await c.match(key || req, { ignoreSearch: true });
    if (hit) return hit;
    throw err;
  }
}
async function cacheFirst(req) {
  const c = await caches.open(VERSION);
  const hit = await c.match(req, { ignoreSearch: !req.url.includes('/api/') });
  if (hit) return hit;
  const r = await fetch(req);
  if (r.ok && r.type === 'basic') c.put(req, r.clone());
  return r;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const p = url.pathname;

  // صفحات التطبيق: /admin و / (والمسارات القديمة تُحوَّل من الخادم)
  if (req.mode === 'navigate') {
    const key = p.startsWith('/admin') ? '/admin' : p === '/' || p === '/index.html' ? '/' : null;
    if (!key) return;
    e.respondWith(networkFirst(req, key).catch(() => caches.match(key)));
    return;
  }
  if (p.startsWith('/api/')) {
    if (p.startsWith('/api/img/')) e.respondWith(cacheFirst(req));
    else if (p === '/api/store') e.respondWith(networkFirst(req));
    return; // باقي واجهة البيانات تمر مباشرة للخادم
  }
  if (p === '/sw.js') return;
  e.respondWith(IMMUTABLE.test(p) ? cacheFirst(req) : networkFirst(req));
});
