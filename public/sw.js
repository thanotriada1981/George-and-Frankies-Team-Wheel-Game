/**
 * Service Worker for NBA Team Wheel
 * Enables offline functionality for George & Frankie
 */

const CACHE_NAME = 'nba-team-wheel-v1.2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  
  // Database files
  '/database/nba/players/nba-2k25-master-ratings.json',
  '/database/nba/teams/team-info.json',
  '/database/nba/players/rosters.json',
  '/database/nba/lookup-functions/player-rating-lookup.js',
  '/database/shared/universal-lookup.js',
  '/database/shared/battle-system-integration.js',
  '/database/nfl/teams/team-info.json',
  '/database/mlb/teams/team-info.json',
  
  // Framework files
  '/frameworks/battle/battle-system.js',
  '/frameworks/multiplayer/online-multiplayer.js',
  
  // Data files
          '/database/nba_teams_data.json',
  
  // Source files
  '/src/nba/nba_data.js',
  
  // All NBA team logos
  '/assets/logos/nba/atlanta_hawks.svg',
  '/assets/logos/nba/boston_celtics.svg',
  '/assets/logos/nba/brooklyn_nets.svg',
  '/assets/logos/nba/charlotte_hornets.svg',
  '/assets/logos/nba/chicago_bulls.svg',
  '/assets/logos/nba/cleveland_cavaliers.svg',
  '/assets/logos/nba/dallas_mavericks.svg',
  '/assets/logos/nba/denver_nuggets.svg',
  '/assets/logos/nba/detroit_pistons.svg',
  '/assets/logos/nba/golden_state_warriors.svg',
  '/assets/logos/nba/houston_rockets.svg',
  '/assets/logos/nba/indiana_pacers.svg',
  '/assets/logos/nba/la_clippers.svg',
  '/assets/logos/nba/los_angeles_lakers.svg',
  '/assets/logos/nba/memphis_grizzlies.svg',
  '/assets/logos/nba/miami_heat.svg',
  '/assets/logos/nba/milwaukee_bucks.svg',
  '/assets/logos/nba/minnesota_timberwolves.svg',
  '/assets/logos/nba/new_orleans_pelicans.svg',
  '/assets/logos/nba/new_york_knicks.svg',
  '/assets/logos/nba/oklahoma_city_thunder.svg',
  '/assets/logos/nba/orlando_magic.svg',
  '/assets/logos/nba/philadelphia_76ers.svg',
  '/assets/logos/nba/phoenix_suns.svg',
  '/assets/logos/nba/portland_trail_blazers.svg',
  '/assets/logos/nba/sacramento_kings.svg',
  '/assets/logos/nba/san_antonio_spurs.svg',
  '/assets/logos/nba/toronto_raptors.svg',
  '/assets/logos/nba/utah_jazz.svg',
  '/assets/logos/nba/washington_wizards.svg'
];

// Install event - cache all files
self.addEventListener('install', event => {
  console.log('🏀 NBA Team Wheel: Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('🏀 NBA Team Wheel: Caching all files for offline use...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('🏀 NBA Team Wheel: All files cached successfully!');
        self.skipWaiting();
      })
      .catch(error => {
        console.error('🏀 NBA Team Wheel: Failed to cache files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🏀 NBA Team Wheel: Activating service worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🏀 NBA Team Wheel: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🏀 NBA Team Wheel: Service worker activated and ready!');
      self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request).then(response => {
          // Don't cache if not successful
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          // Cache the new response
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(error => {
          console.log('🏀 NBA Team Wheel: Network request failed, serving offline version');
          
          // If it's a navigation request, serve the main page
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          
          // For other requests, just fail gracefully
          return new Response('🏀 NBA Team Wheel: Content not available offline', {
            status: 404,
            statusText: 'Not Found'
          });
        });
      })
  );
});

// Listen for messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for when connection is restored
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('🏀 NBA Team Wheel: Background sync triggered');
    // Could sync player ratings updates here
  }
});

// Push notifications (for future multiplayer invites)
self.addEventListener('push', event => {
  if (event.data) {
    const notificationData = event.data.json();
    const options = {
      body: notificationData.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'nba-team-wheel',
      data: {
        url: notificationData.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(notificationData.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const targetUrl = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll().then(clientList => {
      // Check if game is already open
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if not already open
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

console.log('🏀 NBA Team Wheel: Service worker loaded and ready for offline gaming!'); 