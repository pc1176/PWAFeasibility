import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationService } from './notification.service';
export interface LocationState {
  isTracking: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsServiceService {
  private broadcastChannel!: BroadcastChannel;
  private locationState = new BehaviorSubject<LocationState>({
    isTracking: false
  });
  private watchId: number | null = null;
  private wakeLock: any = null;
  private backgroundFetchRegistration: any = null;
  constructor(private notificationservice: NotificationService) {
    this.broadcastChannel = new BroadcastChannel('location_channel');
    this.setupLocationTracking();
    this.setupVisibilityChange();
  }
  
  private async requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock is active');
      }
    } catch (err) {
      console.error(`Failed to get wake lock: ${err}`);
    }
  }
  private setupVisibilityChange() {
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        // Reacquire wake lock when page becomes visible
        await this.requestWakeLock();
      }
    });
  }
  private setupLocationTracking() {
    // Listen for broadcast messages
    this.broadcastChannel.onmessage = async (event) => {
      if (event.data.type === 'GET_LOCATION') {
        await this.requestWakeLock();
        this.getCurrentLocation();
      } else if (event.data.type === 'STOP_LOCATION') {
        this.stopLocationTracking();
      }
    };
    // Initial location request
    this.getCurrentLocation();
  }

  private async getCurrentLocation() {
    console.log('Getting current location...' + new Date().toISOString());
    if ('geolocation' in navigator) {
      // Clear existing watch if any
      this.stopLocationTracking();
        navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          this.notificationservice.sendTestNotification('getting loc ' + new Date().toISOString());
          this.handlePosition(position);
          // Start continuous watching after getting initial position
          this.watchId = navigator.geolocation.watchPosition(
            this.handlePosition.bind(this),
            this.handleError.bind(this)
          );
        },
        this.handleError.bind(this)
      );
    }
  }

  private handlePosition(position: GeolocationPosition) {
    const locationData = {
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      },
      timestamp: position.timestamp
    };

    // Update state
    this.locationState.next({
      isTracking: true,
      currentLocation: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }
    });

    // Send location through broadcast channel
    this.broadcastChannel.postMessage({
      type: 'LOCATION_UPDATE',
      locationData
    });

    // Log successful update
    console.log('Location updated:', new Date().toISOString());
  }

  private handleError(error: GeolocationPositionError) {
    console.error('Geolocation error:', error);

    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.error('User denied geolocation permission');
        this.requestLocationPermission();
        break;
      case error.POSITION_UNAVAILABLE:
        console.error('Location information unavailable');
        // Retry after a delay with exponential backoff
        setTimeout(() => this.getCurrentLocation(), 5000);
        break;
      case error.TIMEOUT:
        console.error('Location request timed out');
        // Retry immediately with new watch
        this.getCurrentLocation();
        break;
    }
  }

  private stopLocationTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.locationState.next({ isTracking: false });
    }

    // Release wake lock
    if (this.wakeLock) {
      this.wakeLock.release()
        .then(() => {
          this.wakeLock = null;
          console.log('Wake Lock released');
        });
    }
  }

  getLocationState(): Observable<LocationState> {
    return this.locationState.asObservable();
  }

  private async requestLocationPermission(): Promise<string> {
    try {
      await navigator.geolocation.getCurrentPosition(() => { });
      return 'granted';
    } catch {
      return 'denied';
    }
  }

  // Cleanup method
  ngOnDestroy() {
    this.stopLocationTracking();
    this.broadcastChannel.close();
  }
}
