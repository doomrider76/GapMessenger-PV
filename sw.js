const CACHE = 'GapApps-v1.1.6';   // فقط وقتی فایل‌های عکس/فونت عوض شد این را یکی بالا ببر
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './extras.css',
  './extras.js',
  './manifest.json',
  './Logo.png',
  './Font.ttf',
  './blue-tick.png',
  './yellow-tick.png',
  './green-tick.png',
  './personal-tick.png',
  './vipgold.png'
];

// نصب: هر فایل جدا و مستقیم از سرور (نه از کش مرورگر) گرفته می‌شود؛
// اگر یکی‌شان نبود یا خطا داد، کل نصب خراب نمی‌شود (قبلاً addAll همه را با هم رد می‌کرد)
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

// صفحه و کد (html/js/css/json): اول از سرور (با چک نسخه)، اگر اینترنت نبود یا کند بود (۴ ثانیه) از کش
function networkFirst(req) {
  return new Promise(resolve => {
    let done = false;
    const fromCache = () => caches.match(req, { ignoreSearch: true })
      .then(c => c || caches.match('./index.html'));
    const timer = setTimeout(() => {
      fromCache().then(c => { if (c && !done) { done = true; resolve(c); } });
    }, 4000);
    fetch(req, { cache: 'no-cache' }).then(res => {
      clearTimeout(timer);
      if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      if (!done) { done = true; resolve(res); }
    }).catch(() => {
      clearTimeout(timer);
      if (!done) fromCache().then(c => { done = true; resolve(c || Response.error()); });
    });
  });
}

// عکس و فونت: فوری از کش نشان بده، و پشت صحنه نسخه‌ی تازه را بگیر (دفعه‌ی بعد تازه است)
function staleWhileRevalidate(req) {
  return caches.match(req, { ignoreSearch: true }).then(cached => {
    const net = fetch(req).then(res => {
      if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => cached || Response.error());
    return cached || net;
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.url.includes('pollinations.ai')) {
    e.respondWith(fetch(req).catch(() => new Response('', { status: 503 })));
    return;
  }
  if (new URL(req.url).origin !== self.location.origin) return;   // سایت‌های دیگر دست نخورند

  const d = req.destination;
  if (req.mode === 'navigate' || d === 'document' || d === 'script' || d === 'style' || d === 'manifest') {
    e.respondWith(networkFirst(req));
  } else {
    e.respondWith(staleWhileRevalidate(req));
  }
});
