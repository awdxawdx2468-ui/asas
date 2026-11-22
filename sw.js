// أسس — عامل الخدمة: يحفظ واجهة التطبيق لتفتح بدون إنترنت. البيانات نفسها تُزامَن مع السيرفر من داخل التطبيق.
const V = 'asas-v33';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V && !k.startsWith('asas-preview-')).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.hostname.endsWith('supabase.co')) return; // طلبات البيانات تذهب للسيرفر مباشرة
  if (u.origin === location.origin && u.pathname.includes('/preview/')) return; // النسخة التجريبية لها عامل خدمة خاص
  const isPage = r.mode === 'navigate';
  if (isPage || u.origin === location.origin) {
    // الشبكة أولاً حتى تصل التحديثات فوراً، والنسخة المحفوظة عند انقطاع الإنترنت
    e.respondWith(fetch(r).then((res) => { const cp = res.clone(); caches.open(V).then((c) => c.put(isPage ? './' : r, cp)); return res; })
      .catch(() => caches.match(isPage ? './' : r).then((m) => m || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then((m) => m || fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(V).then((c) => c.put(r, cp)); } return res; })));
});
