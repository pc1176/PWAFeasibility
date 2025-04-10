import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShakeService {

  private shakeSubject = new Subject<void>();
  shake$ = this.shakeSubject.asObservable();

  private lastX = 0;
  private lastY = 0;
  private lastZ = 0;
  private threshold = 15; // Adjust sensitivity
  private listening = false;

  constructor(private ngZone: NgZone) { }

  startListening() {
    if (this.listening || !window.DeviceMotionEvent) return;

    this.listening = true;
    window.addEventListener('devicemotion', this.onDeviceMotion, false);
  }

  stopListening() {
    this.listening = false;
    window.removeEventListener('devicemotion', this.onDeviceMotion, false);
  }

  private onDeviceMotion = (event: DeviceMotionEvent) => {
    if (!event.accelerationIncludingGravity) return;

    // Use default values (0) if x, y, or z are null
    const x = event.accelerationIncludingGravity.x ?? 0;
    const y = event.accelerationIncludingGravity.y ?? 0;
    const z = event.accelerationIncludingGravity.z ?? 0;
    const deltaX = Math.abs(this.lastX - x);
    const deltaY = Math.abs(this.lastY - y);
    const deltaZ = Math.abs(this.lastZ - z);

    if (deltaX + deltaY + deltaZ > this.threshold) {
      this.ngZone.run(() => this.shakeSubject.next());
    }

    this.lastX = x;
    this.lastY = y;
    this.lastZ = z;
  };
}
