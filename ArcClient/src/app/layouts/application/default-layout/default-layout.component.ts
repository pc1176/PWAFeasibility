import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  INavData,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective
} from '@coreui/angular';
import { DefaultFooterComponent, DefaultHeaderComponent } from './';
import { DeviceModuleService } from '../device-module/device-module.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { DeviceEventService } from '../../shared/services/deviceEvent/device-event.service';
import { PersistentDataService } from '../../shared/services/persistent-data.service';
import { NotificationService } from '../../shared/services/notification.service';
function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

@Component({
  selector: 'app-default-layout',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    RouterLink,
    IconDirective,
    NgScrollbar,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    DefaultHeaderComponent,
    ShadowOnScrollDirective,
    ContainerComponent,
    RouterOutlet,
    DefaultFooterComponent
  ],
  templateUrl: './default-layout.component.html',
  styleUrl: './default-layout.component.scss'
})
export class DefaultLayoutComponent implements OnInit, OnDestroy {
  navItems: INavData[] = [];
  loading: boolean = false;
  // Example of persistent data usage
  lastVisitTimestamp: string | null = null;
  private locationCheckInterval: any;
  private readonly CHECK_INTERVAL_MS = 5000; // 5 seconds
  private readonly FIXED_LAT = 22.2562714;
  private readonly FIXED_LNG = 73.1833289;
  private readonly THRESHOLD_METERS = 50;
  constructor(
    private deviceModuleService: DeviceModuleService,
    private toastr: ToastrService,
    private deviceEventService: DeviceEventService,
    private persistentDataService: PersistentDataService,
    private notificationservice: NotificationService
  ) { }
  trackingActive = false;
  ngOnInit(): void {
    this.loading = true;
    // this.initializePwa();
    this.initializePersistentData();
    //this.initializeNotifications();
    this.loadNavItems();

    this.deviceEventService.deviceAdded$.subscribe(() => {
      this.loadNavItems();
    });
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));


  }
  ngOnDestroy(): void {
    this.stopLocationChecks();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }
  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.startLocationChecks();
    } else {
      this.stopLocationChecks();
    }
  }

  private startLocationChecks(): void {
    if (this.locationCheckInterval) return;

    this.locationCheckInterval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          if (this.isLocationMatch(lat, lng, this.FIXED_LAT, this.FIXED_LNG, this.THRESHOLD_METERS)) {
            this.notificationservice.sendTestNotification('getting loc ' + new Date().toISOString());
            console.log('📍 Location matched!');
          } else {
            console.log('Not matched. Current:', lat, lng);
          }
        },
        (error) => {
          console.error('Location error', error);
        }
      );
    }, this.CHECK_INTERVAL_MS);
  }

  private stopLocationChecks(): void {
    if (this.locationCheckInterval) {
      clearInterval(this.locationCheckInterval);
      this.locationCheckInterval = null;
    }
  }

  private isLocationMatch(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    threshold: number
  ): boolean {
    const toRad = (val: number) => (val * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= threshold;
  }
  // private initializePwa() {
  //   if ('serviceWorker' in navigator) {
  //     navigator.serviceWorker.register('/firebase-messaging-sw.js')
  //       .then((registration) => {
  //         console.log('Service Worker registered with scope:', registration.scope);
  //       })
  //       .catch((error) => {
  //         console.error('Service Worker registration failed:', error);
  //       });
  //   }
  //   // Other initialization code...
  // }

  private initializePersistentData() {
    // Example: Track when the user last visited the app
    const now = new Date().toISOString();

    // Get the last visit time from persistent storage
    this.persistentDataService.getPersistentData<string>('lastVisitTime', now)
      .subscribe(timestamp => {
        if (timestamp) {
          this.lastVisitTimestamp = timestamp;
          console.log('Last visit time:', timestamp);
        }

        // Update the last visit time to now
        this.persistentDataService.updatePersistentData('lastVisitTime', now)
          .subscribe();
      });

    // Example: Store user preferences or settings
    this.persistentDataService.getPersistentData<any>('settings', {
      theme: 'light',
      notifications: true,
      language: 'en'
    }).subscribe(settings => {
      console.log('User settings loaded:', settings);
      // Apply settings to your app
    });
  }

  // private initializeNotifications() {
  //   // Check and renew push notification subscription
  //   this.notificationService.checkAndRenewSubscription().subscribe(
  //     success => {
  //       if (success) {
  //         this.toastr.success('Push notifications enabled', 'Notifications');
  //       }
  //     },
  //     error => {
  //       console.error('Error initializing notifications:', error);
  //       this.toastr.error('Failed to enable push notifications', 'Notifications');
  //     }
  //   );
  // }

  loadNavItems(): void {
    this.loading = true;
    this.deviceModuleService.getDeviecComponentListForSideBar().subscribe(
      response => {
        if (response.status === 200) {
          this.navItems = this.mapDevicesToNavItems(response.data);

          // Example: Store the last loaded nav items
          this.persistentDataService.updatePersistentData('cachedNavItems', this.navItems)
            .subscribe();
        }
        this.loading = false;
      },
      error => {
        console.log(error);
        if (error.status === 0) {
          this.toastr.error('Server is currently offline. Please try again later.');

          // Example: Load nav items from cache when offline
          this.persistentDataService.getPersistentData<INavData[]>('cachedNavItems')
            .subscribe(cachedNavItems => {
              if (cachedNavItems) {
                this.navItems = cachedNavItems;
                this.toastr.info('Loaded navigation from cache');
              }
            });
        } else {
          this.toastr.error(error.error.message || 'Please try again later.');
        }
        this.loading = false;
      }
    );
  }

  onScrollbarUpdate($event: any) {
    // if ($event.verticalUsed) {
    // console.log('verticalUsed', $event.verticalUsed);
    // }
  }

  mapDevicesToNavItems(devices: any[]): INavData[] {
    const navItems: INavData[] = [
      {
        name: 'Dashboard',
        url: '/dashboard',
        iconComponent: { name: 'cil-speedometer' },
      },
      {
        name: 'DeviceModule',
        url: '/deviceManagement',
        iconComponent: { name: 'cil-storage' },
      },
      {
        name: 'Playback',
        url: '/playback',
        iconComponent: { name: 'cil-MediaPlay' },
      },
      {
        name: 'Persistent Data Demo',
        url: '/persistent-data-demo',
        iconComponent: { name: 'cil-save' },
      },
      {
        name: 'Bluetooth access',
        url: '/bluetooth',
        iconComponent: { name: 'cil-save' },
      },
      {
        name: 'View map',
        url: '/View-map',
        iconComponent: { name: 'cil-save' },
      },
      {
        name: 'Devices',
        title: true
      }
    ];

    devices.forEach(device => {
      const deviceNavItem: INavData = {
        name: device.name,
        iconComponent: { name: 'cil-devices' },
        children: device.components.map((component: { name: any; componentId: any; }) => ({
          name: component.name,
          url: `/videoPlayer`,
          linkProps: { queryParams: { 'deviceId': `${device.id}`, 'cameraId': `${component.componentId}` } },
          iconComponent: { name: 'cil-camera' },
          attributes: { "draggable": "true" }
        }))
      };
      navItems.push(deviceNavItem);
    });

    return navItems;
  }
}
