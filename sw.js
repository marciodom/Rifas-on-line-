// service-worker.js
const CACHE_NAME = 'rifas-online-v2';
const urlsToCache = [
  'https://marciodom.github.io/Rifas-on-line-/',
  'https://marciodom.github.io/Rifas-on-line-/manifest.json',
  'https://marciodom.github.io/Rifas-on-line-/icons/icon-192.png',
  'https://marciodom.github.io/Rifas-on-line-/icons/icon-512.png'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptação de requisições (offline first)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se encontrado
        if (response) {
          return response;
        }
        
        // Clona a requisição porque ela só pode ser usada uma vez
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Verifica se a resposta é válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clona a resposta porque ela só pode ser usada uma vez
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then(cache => {
            // Não armazena em cache URLs com dados dinâmicos
            if (!event.request.url.includes('lotece.com.br')) {
              cache.put(event.request, responseToCache);
            }
          });
          
          return response;
        }).catch(() => {
          // Fallback offline para páginas principais
          if (event.request.mode === 'navigate') {
            return caches.match('https://marciodom.github.io/Rifas-on-line-/');
          }
        });
      })
  );
});

// Sincronização em segundo plano (opcional)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-rifas') {
    event.waitUntil(syncRifas());
  }
});

async function syncRifas() {
  // Função para sincronizar dados quando estiver online
  console.log('Sincronizando rifas...');
}