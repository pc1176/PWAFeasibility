import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeviceEventService {

  private deviceAddedSource = new Subject<void>();
  deviceAdded$ = this.deviceAddedSource.asObservable();

  notifyDeviceAdded() {
    this.deviceAddedSource.next();
  }
}
