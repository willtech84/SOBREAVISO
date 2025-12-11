// Service Worker para Sobreaviso RX
const CACHE_NAME = 'sobreaviso-v1';
const urlsToCache = [
  '/SOBREAVISO/',
  '/SOBREAVISO/index.html',
  '/SOBREAVISO/manifest.json'
];

// Instalação
self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cacheando arquivos');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação
self.addEventListener('activate', event => {
  console.log('[Service Worker] Ativado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retorna resposta do cache
        if (response) {
          return response;
        }
        
        // Clone da requisição
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Verifica se a resposta é válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone da resposta
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        }).catch(() => {
          // Se offline e não tem no cache, retorna página offline
          if (event.request.mode === 'navigate') {
            return caches.match('/SOBREAVISO/');
          }
          return new Response('Você está offline!');
        });
      })
  );
});

// Mensagens do app
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});