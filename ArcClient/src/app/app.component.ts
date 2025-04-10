import { Component, HostListener, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { IconSetService } from '@coreui/icons-angular';
import { iconSubset } from './shared/icons/icon-subset';
import { PageTitleService } from './layouts/shared/services/pageTitle/page-title.service';
import { isPlatformBrowser } from '@angular/common';
import { SwPush } from '@angular/service-worker';
import { NotificationService } from './layouts/shared/services/notification.service';
@Component({
  selector: 'app-root',
  template: '<router-outlet />',
  standalone: true,
  imports: [RouterOutlet]
})

export class AppComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  debugInfo: any = null;
  errorMessage = '';
  private deferredPrompt: any;
  showInstallButton = false;
  private swPush = inject(SwPush);
  subscriptionStatus: { message: string, type: 'success' | 'error' } | null = null;
  
  isPushAvailable = false;
  isSubscribed = false;
  constructor(
    private router: Router,
    private pageTitleService: PageTitleService,
    private iconSetService: IconSetService,
    private notificationService: NotificationService) {
    this.pageTitleService.setTitle(undefined);
    // iconSet singleton
    this.iconSetService.icons = { ...iconSubset };
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkPushAvailability();
    } else {
      this.errorMessage = 'Push notifications are only available in browser environment';
      this.debugInfo = { error: 'Not a browser environment' };
    }
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
    });
  }
  
  private async checkPushAvailability() {
    this.debugInfo = {
      serviceWorkerSupported: 'serviceWorker' in navigator,
      pushManagerSupported: 'PushManager' in window,
      swPushEnabled: this.swPush.isEnabled,
      environment: {
        protocol: window.location.protocol,
        host: window.location.host,
        pathname: window.location.pathname
      }
    };

    if (!('serviceWorker' in navigator)) {
      this.errorMessage = 'Service Worker is not supported in this browser';
      return;
    }

    if (!('PushManager' in window)) {
      this.errorMessage = 'Push notifications are not supported in this browser';
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      this.debugInfo.registration = registration ? 'Found' : 'Not found';
      this.debugInfo.registrationScope = registration?.scope;
      
      if (!registration) {
        this.errorMessage = 'Service Worker is not registered. Please reload the page.';
        try {
          // Try registering manually with the correct path
          const swPath = '/ngsw-worker.js';
          const newRegistration = await navigator.serviceWorker.register(swPath, {
            scope: '/'
          });
          this.debugInfo.manualRegistration = 'Successful';
          this.debugInfo.manualRegistrationScope = newRegistration.scope;
          this.debugInfo.registeredServiceWorker = swPath;
          
          // Use the new registration for subscription check
          const subscription = await newRegistration.pushManager.getSubscription();
          this.updateSubscriptionState(subscription);
          this.isPushAvailable = true;
        } catch (regError) {
          this.debugInfo.manualRegistrationError = regError instanceof Error ? regError.message : 'Unknown error';
          return;
        }
      } else {
        const subscription = await registration.pushManager.getSubscription();
        this.updateSubscriptionState(subscription);
        this.isPushAvailable = true;
      }
      this.subscribeToNotifications();
    } catch (error) {
      console.error('Error checking service worker registration:', error);
      this.errorMessage = 'Error checking service worker registration. Please reload the page.';
      this.debugInfo.error = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  private updateSubscriptionState(subscription: PushSubscription | null) {
    this.isSubscribed = !!subscription;
    if (subscription) {
      this.debugInfo.existingSubscription = 'Found';
      this.debugInfo.subscriptionEndpoint = subscription.endpoint;
    } else {
      this.debugInfo.existingSubscription = 'None';
    }
  }

  async subscribeToNotifications() {
    try {
      await this.notificationService.subscribeToNotifications();
      this.subscriptionStatus = {
        message: 'Successfully subscribed to notifications!',
        type: 'success'
      };
      this.isSubscribed = true;
    } catch (err) {
      console.error('Subscription error:', err);
      this.subscriptionStatus = {
        message: 'Failed to subscribe to notifications. ' + (err instanceof Error ? err.message : ''),
        type: 'error'
      };
    }
  }
  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(event: any) {
    // Prevent the mini-infobar from appearing on mobile
    event.preventDefault();
    // Stash the event so it can be triggered later
    this.deferredPrompt = event;
    // Show the install button
    this.showInstallButton = true;
  }
  @HostListener('window:appinstalled', ['$event'])
  onAppInstalled(event: any) {
    this.showInstallButton = false;
  }
}
