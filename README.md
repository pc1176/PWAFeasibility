# PWA: Location Detection with Interval Timer

This feature demonstrates how to implement periodic location tracking in an Angular 18 Progressive Web App (PWA) using a custom service worker. The location is checked against a defined target every `10 seconds`, and actions are triggered based on proximity.

## 🚀 Features

- Periodic location checking (every 10 seconds)
- Proximity check using Haversine formula
- Custom Service Worker handling push notifications and location logic
- IndexedDB logging for debugging
- Push notification click handling with fallback logic

---

## 📍 Location Tracking Logic

The location tracking functionality is implemented inside the custom service worker (`custom-sw.js`) and uses `BroadcastChannel` and a periodic interval.

### 🔁 Step-by-Step Flow

1. **Start Tracking on Activation**

   On service worker activation, the `startLocationTracking()` function is triggered to begin periodic checks.

   ```js
   self.addEventListener('activate', (event) => {
     console.log('Service Worker activated');
     event.waitUntil(self.clients.claim());
     startLocationTracking();
   });

2. **Send periodic location check requests every 10 seconds**

    ```js
    const LOCATION_CHECK_INTERVAL = 10000; // 10 seconds
    const broadcastChannel = new BroadcastChannel('location_channel');

    function startLocationTracking() {
    if (!locationUpdateInterval) {
        locationUpdateInterval = setInterval(() => {
        logEvent('Checking location...');
        broadcastChannel.postMessage({ type: 'GET_LOCATION' });
        }, LOCATION_CHECK_INTERVAL);
    }
    }

3. **Handle incoming location from Angular app**

    ```js
    broadcastChannel.onmessage = (event) => {}

4. **Distance Calculation (Haversine Formula)**

    ```js
    function calculateDistance(lat1, lon1, lat2, lon2) {}

5. **Target Location Setup**

    ```js
    const targetLocation = {
    latitude: 22.2562714,
    longitude: 73.1833289,
    radius: 50 // in meters
    };

# 📡 Device Add & Sync Feature with Offline Support

This feature allows users to add device information (e.g., IP Camera or NVR) via a web form. If the backend service is unavailable at the time of submission, the device data is temporarily stored in the browser's `IndexedDB`. A background service periodically checks backend availability and syncs unsynced device data once the backend is reachable.

---

## ✨ Features

- Handles backend service unavailability gracefully.
- Offline-first approach: stores unsent device data in `IndexedDB`.
- Periodic background job checks:
  - If there is any pending data in `IndexedDB`
  - If the backend is available
  - If both conditions are met, the data is synced.

---

## 🏗️ Project Structure

| File | Description |
|------|-------------|
| `add-device.component.html` | Form UI for adding a new device |
| `add-device.component.ts` | Component logic to handle form submission and fallback to local storage |
| `index-db.service.ts` | Service to interact with `IndexedDB` |
| `devicesync.service.ts` | Periodic service that checks for unsynced data and pushes it to backend |
| `device-module.service.ts` | Service that actually makes API calls to the backend |

---

## 🧩 How It Works

### 1. Device Form Submission

When a user submits the form (`add-device.component.ts`):

- The app attempts to call the backend API.
- If the API call fails (due to network issues or server down):
  - The device is saved locally in `IndexedDB` via `IndexDbService`.

### 2. Periodic Sync Check

A service called `DeviceSyncService` runs periodically (using `setInterval`) to:

- Fetch any locally saved devices from `IndexedDB`.
- Check if the backend is currently reachable.
- If reachable, send all stored devices via API.
- On success, clear those entries from `IndexedDB`.

---

## 🗃️ IndexedDB Storage

All offline device entries are stored in the `DeviceSync` object store with fields like:

    ```json
    {
    "id": auto_increment,
    "Name": "Camera 1",
    "Address": "192.168.1.100",
    "HttpPort": 8080,
    "RtspPort": 554,
    "UserName": "admin",
    "Password": "123456",
    "Type": 1
    }

# 📱 Shake Detection Feature in Angular 18 PWA

This features describes the implementation of shake detection in an Angular 18 Progressive Web App (PWA) using a custom service. When a physical shake motion is detected via device accelerometer data, a custom event or logic can be triggered.

---

## 🚀 Features

- Detects shake gesture based on accelerometer motion.
- Works in compatible mobile browsers and PWA mode.
- Lightweight service that can be reused in any component.
- Excludes Bluetooth-related features for now.

---

## 🏗️ Project Structure

| File | Description |
|------|-------------|
| `shake.service.ts` | Handles accelerometer data and shake detection logic |
| `bluetoothdevice.component.ts` | Angular component using the `ShakeService` (only shake-related logic considered here) |

---

## 🧩 How It Works

### Shake Detection Logic

- Listens to `devicemotion` events from the browser.
- Computes acceleration deltas.
- Detects shake when the delta crosses a certain threshold within a time interval.

### Component Usage

The `ShakeService` is injected and started/stopped from a component (e.g., `BluetoothDeviceComponent`) like this:

    ```ts
    constructor(private shakeService: ShakeService) {}

    ngOnInit(): void {
    this.shakeService.startShakeDetection(() => {
        // Handle shake event here
        console.log('Shake detected!');
    });
    }

    ngOnDestroy(): void {
    this.shakeService.stopShakeDetection();
    }

# 🔷 Bluetooth Accessibility in Angular 18

This module enables Bluetooth device scanning and connection functionality in an Angular 18 application.

---

## 🚀 Features

- Scan for nearby Bluetooth Low Energy (BLE) devices.
- Display discovered devices with identifiers and names.
- Allow user to connect or disconnect to/from devices.
- Real-time UI feedback for scanning, connecting, and connected states.
- Graceful fallback UI when no devices are found.

---

## 📁 Component Overview

### Component: `BluetoothDeviceComponent`

Responsible for:

- Managing the Bluetooth scan process.
- Displaying available devices.
- Handling connection/disconnection to devices.

---

## 🖥️ UI Structure

- **Header Section**:
  - Displays the title.
  - Includes a button to initiate scanning.

- **Device List Section**:
  - Dynamically lists discovered devices.
  - Shows name and partial ID.
  - Provides a connection button for each device.
  - Indicates connection and loading state visually.

- **Empty State Section**:
  - Informs the user when no devices are found after scanning.

- **Permission Button**:
  - Optionally present to enable required permissions like motion access.

---

## 🧩 Behavior Summary

- Scan button triggers Bluetooth scanning process.
- Each listed device has:
  - Name
  - Shortened ID
  - A connect/disconnect button depending on the device state.
- State flags:
  - `isScanning`: Controls scanning button state.
  - `device.connecting`: Shows "Connecting..." state.
  - `device.connected`: Indicates active connection.
- If no devices are available and not currently scanning, a user-friendly message is shown.
- An optional permission request button is rendered for enabling features like shake detection.

---

## 🛠️ Requirements

- Web Bluetooth API-compatible browser (e.g., Chrome).
- User interaction is required to trigger scanning (due to browser restrictions).
- HTTPS context or localhost for Web Bluetooth functionality.

---

## 🔐 Permissions

- Motion permissions may be required depending on the environment.
- Users may need to grant Bluetooth access explicitly.

---

## 📱 Recommended Usage

Ideal for PWA installations where device communication via Bluetooth is necessary — such as IoT dashboards, sensor networks, or device management platforms.

---

## 📌 Notes

- Bluetooth features are dependent on hardware support and browser capability.
- This module currently does not implement automatic reconnection or pairing logic.

# 🗺️ View Map with Leafletjs.com in Angular 18 PWA

This feature integrates Leaflet.js to display interactive maps based on the user's current geolocation in an Angular 18 Progressive Web App (PWA).

---

## 🚀 Features

- Displays an interactive OpenStreetMap using Leaflet.js.
- Fetches the user’s current location using the Geolocation API.
- Shows current latitude and longitude on screen.
- Adds a marker and popup at the user’s location.
- Continuously monitors position changes using `watchPosition`.

---

## 🏗️ Component Overview

### Component: `ViewmapComponent`

Responsible for:

- Initializing the Leaflet map.
- Accessing the browser's geolocation services.
- Rendering location data visually on the map.
- Updating UI with real-time coordinates.

---

## 🗺️ Map Integration

- Map initialized using Leaflet.js.
- Tile layer served by OpenStreetMap.
- Marker placed at current location with popup message.
- Additional popup highlights "my current location".
- HTML container with ID `#map` used for rendering.

---

## 📍 Location Display

- Current latitude and longitude values shown below the map.
- Coordinates update dynamically based on geolocation tracking.

---

## 📦 Dependencies

- `leaflet` library.
- Browser support for the [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API).

---

## 🛠️ Requirements

- Must be served over HTTPS or `localhost` to access geolocation features.
- PWA-compatible browsers (e.g., Chrome, Edge, Safari).
- Mobile or desktop device with GPS or location access enabled.

---

## 🔐 Permissions

- Browser prompts user to allow location access.
- If denied, map will not center on user's location.

---

## 📌 Notes

- Leaflet styles and icons should be properly loaded for full functionality.
- Tracking stops automatically if destination latitude is matched (can be customized).
- Ensure proper handling of geolocation errors and timeouts.

# 📤 Web Share API in Angular 18 PWA

This feature enables sharing the device list using the native Web Share API in an Angular 18 Progressive Web App (PWA). If the API is unsupported, a fallback mechanism copies the device list to the clipboard.

---

## 🚀 Features

- Share device list using the browser’s native share dialog.
- Automatically formats device data for text-based sharing.
- Graceful fallback to clipboard copying on unsupported browsers.
- User feedback provided via toast notifications.

---

## 📁 Component Overview

### Component: `ViewDeviceComponent`

- Contains the `shareDeviceList()` method to trigger sharing.
- Formats device information via `formatDeviceListForSharing()`.
- Includes share button in the UI.

---

## 🖱️ User Interaction

- A "Share Device List" button is displayed when not loading.
- Clicking the button:
  - Uses Web Share API if available.
  - Falls back to clipboard copying otherwise.

---

## 🧩 UI Elements

- **Share Button**:
  - Visible at the top-right when data is loaded.
  - Triggers `shareDeviceList()` method.






