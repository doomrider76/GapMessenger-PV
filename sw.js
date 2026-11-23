// نسخه‌ی کش: هر بار فایل‌های برنامه (js/css/html) یا عکس/فونت عوض شد این را یکی بالا ببر تا همه‌ی کاربرها فوری نسخه‌ی جدید را بگیرند.
// (حتی اگر بالا نبری، فایل‌ها پشت صحنه خودشان تازه می‌شوند و باز شدن بعدی برنامه نسخه‌ی جدید را نشان می‌دهد)
const CACHE = 'GapApps-v1.4.0';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './extras.css',
  './script.js',
  './auth.js',
  './features.js',
  './extras.js',
  './flags.js',
  './manifest.json',
  './Logo.png',
  './Font.ttf',
  './blue-tick.png',
  './yellow-tick.png',
  './green-tick.png',
  './personal-tick.png',
  './vipgold.png'
];

// نصب: هر فایل جدا و مستقیم از سرور (نه از کش مرورگر) گرفته می‌شود؛ اگر یکی‌شان نبود، نصب خراب نمی‌شود
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.all(ASSETS.map(u =>
        fetch(new Request(u, { cache: 'reload' }))
          .then(res => (res && res.ok) ? c.put(u, res) : null)
          .catch(() => null)
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// نسخه‌های قدیمی همان فایل (مثلاً script.js?v=old) را از کش پاک می‌کند تا فقط تازه‌ترین بماند
function dropOldSiblings(cache, req) {
  const u = new URL(req.url);
  return cache.keys().then(keys => Promise.all(keys.map(k => {
    const ku = new URL(k.url);
    return (ku.pathname === u.pathname && ku.search !== u.search) ? cache.delete(k) : null;
  })));
}

// همه‌چیز (صفحه، کد، عکس، فونت): فوری از کش، و پشت صحنه نسخه‌ی تازه را بگیر (باز شدن بعدی تازه است)
// → باز شدن برنامه به اینترنت وابسته نیست و صفر میلی‌ثانیه شبکه می‌خواهد
function cacheFirst(e) {
  const req = e.request;
  return caches.open(CACHE).then(cache =>
    cache.match(req)
      .then(hit => hit || cache.match(req, { ignoreSearch: true }))
      .then(cached => {
        const net = fetch(req.url, { cache: 'no-cache' }).then(res => {
          if (res && res.status === 200) {
            return cache.put(req, res.clone()).then(() => dropOldSiblings(cache, req)).then(() => res);
          }
          return res;
        }).catch(() => null);
        if (cached) { e.waitUntil(net); return cached; }
        return net.then(res => res || cache.match('./index.html')).then(res => res || Response.error());
      })
  );
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.url.includes('pollinations.ai')) {
    e.respondWith(fetch(req).catch(() => new Response('', { status: 503 })));
    return;
  }
  if (new URL(req.url).origin !== self.location.origin) return;   // سایت‌های دیگر دست نخورند
  e.respondWith(cacheFirst(e));
});
