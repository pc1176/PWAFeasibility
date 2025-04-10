import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './default-layout';
import { AuthGuard } from '../../core/guards/authGuard/auth.guard';

export const applicationRoutes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Dashboard',
    },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'deviceManagement',
        data: {
          title: 'Device Management',
        },
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./device-module/device-module.component').then(
                (m) => m.DeviceModuleComponent
              ),
            children: [
              {
                path: 'addDevice',
                loadComponent: () =>
                  import(
                    './device-module/add-device/add-device.component'
                  ).then((m) => m.AddDeviceComponent),
                data: {
                  title: 'Add Device',
                },
              },
              {
                path: 'viewDevice',
                loadComponent: () =>
                  import(
                    './device-module/view-device/view-device.component'
                  ).then((m) => m.ViewDeviceComponent),
                data: {
                  title: 'View Device',
                },
              },
              {
                path: 'viewComponents/:deviceId',
                loadComponent: () =>
                  import(
                    './device-module/view-device-componets/view-device-componets.component'
                  ).then((m) => m.ViewDeviceComponetsComponent),
                data: {
                  title: 'View Device Components',
                },
              },
              {
                path: 'profiles',
                loadComponent: () =>
                  import(
                    './device-module/view-component-stream-profiles/view-component-stream-profiles.component'
                  ).then((m) => m.ViewComponentStreamProfilesComponent),
                data: {
                  title: 'Profiles',
                },
              },
            ],
          },
        ],
      },
      {
        path: 'videoPlayer',
        loadComponent: () =>
          import('./video-player/video-player.component').then(
            (m) => m.VideoPlayerComponent
          ),
        data: {
          title: 'Video Player',
        },
      },
      {
        path: 'playback',
        loadComponent: () =>
          import('./playback/playback.component').then(
            (m) => m.PlaybackComponent
          ),
        data: {
          title: 'Playback',
        },
      },
    ],
  },
];
