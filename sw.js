const CACHE_NAME = 'tano-evoluzione-v1.8';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './logo.png',
  './Background.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js'
];

// Installation - Cache des ressources
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching assets');
        return cache.addAll(ASSETS_TO_CACHE.map(url => new Request(url, {cache: 'reload'})));
      })
      .catch(err => console.error('❌ Cache failed:', err))
  );
  self.skipWaiting();
});

// Activation - Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch - Stratégie Network First avec fallback sur Cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip Firebase and external API calls
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('firebase') ||
      event.request.url.includes('gstatic.com/firebasejs')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseClone = response.clone();
        
        // Update cache with new version
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('📦 Serving from cache:', event.request.url);
            return cachedResponse;
          }
          
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('./');
          }
          
          return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Background Sync - Pour les données en attente
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-interventions') {
    console.log('🔄 Background sync triggered');
    event.waitUntil(syncInterventions());
  }
});

async function syncInterventions() {
  // Logic to sync pending interventions when back online
  console.log('🔄 Syncing interventions...');
}

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Tano Evoluzione';
  const options = {
    body: data.body || 'Nuova notifica',
    icon: './logo.png',
    badge: './logo.png',
    vibrate: [200, 100, 200],
    data: data.url || './',
    actions: [
      { action: 'open', title: 'Apri' },
      { action: 'close', title: 'Chiudi' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked');
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || './')
    );
  }
});

// Message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('✅ Service Worker loaded successfully');
```

---

## 💾 **Instructions étape par étape pour créer le fichier :**

### **Sur Windows :**

1. **Ouvrez le Bloc-notes** (Notepad)
   - Touche Windows → Tapez "Notepad" → Entrée

2. **Collez tout le code ci-dessus**
   - Sélectionnez tout le code JavaScript
   - Ctrl+C pour copier
   - Ctrl+V pour coller dans Notepad

3. **Enregistrez le fichier**
   - Fichier → Enregistrer sous
   - **Nom du fichier :** `sw.js` (exactement)
   - **Type :** Tous les fichiers (*)
   - **Emplacement :** Le dossier de votre projet (avec index.html)
   - Cliquez sur **Enregistrer**

---

### **Sur Mac :**

1. **Ouvrez TextEdit**
   - Applications → TextEdit

2. **Passez en mode texte brut**
   - Format → Make Plain Text (Shift+Cmd+T)

3. **Collez le code**
   - Cmd+V

4. **Enregistrez**
   - Fichier → Enregistrer sous
   - **Nom :** `sw.js`
   - **Format :** Plain Text
   - **Emplacement :** Votre dossier de projet

---

### **Avec VS Code (recommandé) :**

1. **Ouvrez VS Code**

2. **Créez un nouveau fichier**
   - File → New File
   - Ou Ctrl+N (Windows) / Cmd+N (Mac)

3. **Collez le code**

4. **Enregistrez**
   - File → Save As
   - **Nom :** `sw.js`
   - **Emplacement :** Dossier de votre projet

---

## ✅ **Vérification rapide :**

Après avoir créé le fichier, vérifiez :

- [ ] Le nom est exactement `sw.js` (pas `sw.js.txt`)
- [ ] Il est dans le même dossier que `index.html`
- [ ] La taille du fichier est d'environ 4-5 Ko
- [ ] Vous pouvez l'ouvrir et voir le code JavaScript

---

## 📂 **Structure finale de vos fichiers :**
```
votre-dossier/
│
├── index.html       ← Votre HTML mis à jour
├── manifest.json    ← Fichier de configuration PWA
├── sw.js           ← LE FICHIER QUE VOUS VENEZ DE CRÉER
├── logo.png        ← Votre logo
└── Background.png  ← Votre image de fond
