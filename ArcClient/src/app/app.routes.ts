import { Routes } from '@angular/router';
import { authRoutes } from './layouts/auth/auth.routes';
import { applicationRoutes } from './layouts/application/application.routes';
import { PersistentDataDemoComponent } from './layouts/application/persistent-data-demo/persistent-data-demo.component';  
import { BluetoothdeviceComponent } from './layouts/application/bluetoothdevice/bluetoothdevice.component';
import { ViewmapComponent } from './layouts/application/viewmap/viewmap.component';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  ...applicationRoutes,
  ...authRoutes,
  { 
    path: 'persistent-data-demo', 
    component: PersistentDataDemoComponent 
  },
  {
    path: 'bluetooth', 
    component: BluetoothdeviceComponent
  },
  {
    path: 'View-map',
    component: ViewmapComponent,
  },
];
