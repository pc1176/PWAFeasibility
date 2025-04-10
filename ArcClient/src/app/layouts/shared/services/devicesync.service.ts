import { Injectable, OnDestroy } from '@angular/core';
import { IndexDbService } from './index-db.service';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS } from '../../../core/config/endpoints';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root'
})
export class DevicesyncService implements OnDestroy {
  private baseUrl = API_ENDPOINTS.BASE_URL;
  private isOnline: boolean = navigator.onLine;
  private syncInterval: any = null;

  constructor(
    private indexedDBService: IndexDbService,
    private http: HttpClient,
    private toastr: ToastrService
  ) {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    this.startSync();
  }

  private handleOnline() {
    this.isOnline = true;
    this.syncPendingDevices();
    this.toastr.info('Connection restored. Syncing pending devices...');
  }

  private handleOffline() {
    this.isOnline = false;
    this.toastr.warning('Connection lost. Changes will be saved offline.');
  }

  public async syncPendingDevices() {
    if (!this.isOnline) return;

    try {
      const pendingDevices = await this.indexedDBService.getPendingDevices();

      if (pendingDevices.length === 0) return;

      for (const device of pendingDevices) {
        try {
          const formData = new FormData();
          formData.append('Name', device.data.Name);
          formData.append('Address', device.data.Address);
          formData.append('HttpPort', device.data.HttpPort);
          formData.append('RtspPort', device.data.RtspPort);
          formData.append('UserName', device.data.UserName);
          formData.append('Password', device.data.Password);
          formData.append('Type', device.data.Type);

          const response = await this.http.post<any>(  // Changed from DeviceData to any
            `${this.baseUrl}${API_ENDPOINTS.DEVICE.ADD}`,
            formData
          ).toPromise();

          if (response) {
            await this.indexedDBService.removePendingDevice(device.id!);
          }
        } catch (error) {
          console.error('Failed to sync device:', error);
          this.toastr.error(`Failed to sync device: ${device.data.Name}`);
        }
      }
    } catch (error) {
      console.error('Error during sync:', error);
      this.toastr.error('Error syncing devices');
    }
  }

  startSync(intervalMs: number = 30000) {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      this.syncPendingDevices();
    }, intervalMs);
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  ngOnDestroy() {
    this.stopSync();
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
  }
}
