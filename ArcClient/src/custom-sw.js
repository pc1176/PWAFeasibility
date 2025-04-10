// Import and use the Angular service worker
importScripts('./ngsw-worker.js');

let locationUpdateInterval = null;
const LOCATION_CHECK_INTERVAL = 10000; // 10 seconds
const broadcastChannel = new BroadcastChannel('location_channel');
let targetLocation = {
  latitude: 22.2562714,
  longitude: 73.1833289,
  radius: 50
};
function startLocationTracking() {
  if (!locationUpdateInterval) {
    locationUpdateInterval = setInterval(() => {
      logEvent('Checking location...');
      broadcastChannel.postMessage({ type: 'GET_LOCATION' });
    }, LOCATION_CHECK_INTERVAL);
  }
}
// Calculate distance between points
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Round coordinates to 1 decimal place
  const roundLat1 = Math.round(lat1 * 10) / 10;
  const roundLon1 = Math.round(lon1 * 10) / 10;
  const roundLat2 = Math.round(lat2 * 10) / 10;
  const roundLon2 = Math.round(lon2 * 10) / 10;

  // If rounded values are within 0.5 difference, return 0 distance
  if (Math.abs(roundLat1 - roundLat2) <= 0.5 && Math.abs(roundLon1 - roundLon2) <= 0.5) {
    return 0;
  }
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
// Handle location updates from the app
broadcastChannel.onmessage = (event) => {
  if (event.data.type === 'LOCATION_UPDATE') {
    logEvent('Received location update:', event.data.locationData.coords.latitude + ', ' + event.data.locationData.coords.longitude);
    const location = event.data.locationData;
    const distance = calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    );

    // Log current position and distance for debugging

    if (distance <= targetLocation.radius) {
      msg = 'LOCATION MATCH!', {
        currentLocation: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        },
        targetLocation: targetLocation,
        distance: distance,
        timestamp: new Date().toISOString()
      }
      console.log(msg + new Date().toISOString());
      logEvent(msg);
    }
  }
};

// Log when service worker is installed
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Log when service worker is activated
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
  startLocationTracking();
});

self.addEventListener('push', function (event) {
  console.log('Push event received');
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('Push data:', data);

      const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        data: {
          timestamp: data.timestamp,
          clickAction: 'open' // Add explicit click action
        },
        vibrate: [100, 50, 100],
        actions: [
          {
            action: 'open',
            title: 'Open App'
          }
        ],
        requireInteraction: true,
        tag: 'push-notification-' + Date.now()
      };

      event.waitUntil(
        self.registration.showNotification(data.title, options)
          .then(() => {
            console.log('Notification shown successfully');
          })
          .catch(error => {
            console.error('Error showing notification:', error);
          })
      );
    } catch (error) {
      console.error('Error processing push event:', error);
    }
  }
});

// Add explicit notification click handler
self.addEventListener('notificationclick', function (event) {
  console.log('Notification click event received');
  console.log('Notification data:', event.notification.data);
  console.log('Action clicked:', event.action);

  // Close the notification
  event.notification.close();

  // Verify the action
  if (event.action === 'open' || event.notification.data.clickAction === 'open') {
    console.log('Opening app...');

    event.waitUntil(
      (async () => {
        try {
          // Log all available clients
          const clients = await self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true
          });

          console.log('Total clients found:', clients.length);
          clients.forEach(client => {
            console.log('Client:', {
              url: client.url,
              displayMode: client.displayMode,
              focused: client.focused
            });
          });

          // Try to find PWA window
          let client = clients.find(client => client.displayMode === 'standalone');
          console.log('PWA client found:', client ? 'Yes' : 'No');

          if (client) {
            console.log('Focusing PWA window:', client.url);
            await client.focus();
          } else {
            // Try to find browser window
            client = clients.find(client => client.url.includes(self.location.origin));
            console.log('Browser client found:', client ? 'Yes' : 'No');

            if (client) {
              console.log('Focusing browser window:', client.url);
              await client.focus();
            } else {
              console.log('No existing client found, opening new window');
              try {
                console.log('Attempting to open in PWA mode');
                await self.clients.openWindow('/', {
                  displayMode: 'standalone'
                });
              } catch (error) {
                console.log('Failed to open in PWA mode:', error);
                console.log('Falling back to browser mode');
                await self.clients.openWindow('/');
              }
            }
          }
        } catch (error) {
          console.error('Error in notification click handler:', error);
          console.log('Final fallback: opening in new window');
          await self.clients.openWindow('/');
        }
      })()
    );
  } else {
    console.log('Unknown action clicked:', event.action);
  }
});


// Open IndexedDB database
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("locationDB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("logs")) {
        db.createObjectStore("logs", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("IndexedDB error");
  });
}

// Save log to IndexedDB
async function saveLogToDB(message) {
  const db = await openDB();
  const tx = db.transaction("logs", "readwrite");
  const store = tx.objectStore("logs");
  store.add({ time: new Date().toISOString(), message });
}

// Log Event in Service Worker
function logEvent(message) {
  saveLogToDB(message);
}
