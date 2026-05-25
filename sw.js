const CACHE_NAME = 'vibe-coding-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/icon.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // 새 버전 즉시 적용
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // 예전 찌꺼기 삭제
          }
        })
      );
    })
  );
});

// 인터넷이 연결되어 있으면 새 파일을 가져오고, 끊기면 캐시를 보여줌 (Network First)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
