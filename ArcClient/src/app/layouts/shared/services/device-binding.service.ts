import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

interface DeviceIdentifier {
  deviceId: string;
  browserFingerprint: string;
  userAgent: string;
}

interface UserAuthenticationRequest {
  username: string;
  password: string;
  deviceInfo: DeviceIdentifier;
}

interface AuthenticationResponse {
  token: string;
  userId: string;
  deviceBindingStatus: 'new' | 'existing' | 'rejected';
  allowedDevicesCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceBindingService {

  private deviceInfoSubject = new BehaviorSubject<DeviceIdentifier | null>(null);
  private authTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient
  ) {
    this.initializeDeviceIdentification();
  }

  // Generate a unique device identifier
  private initializeDeviceIdentification() {
    const deviceInfo = this.generateDeviceIdentifier();
    this.deviceInfoSubject.next(deviceInfo);
  }

  // Generate comprehensive device fingerprint
  private generateDeviceIdentifier(): DeviceIdentifier {
    return {
      deviceId: this.generateUniqueDeviceId(),
      browserFingerprint: this.generateBrowserFingerprint(),
      userAgent: navigator.userAgent
    };
  }

  // Generate unique device ID
  private generateUniqueDeviceId(): string {
    // Combine multiple sources for more unique identification
    const navigatorId = [
      navigator.platform,
      navigator.hardwareConcurrency,
      navigator.language
    ].join('|');

    // Use a more robust fingerprinting technique
    const fingerprintBase = `${navigatorId}|${Date.now()}`;
    return this.hashCode(fingerprintBase).toString();
  }

  // Generate browser fingerprint
  private generateBrowserFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Complex fingerprinting technique
    const txt = 'abcdefghijklmnopqrstuvwxyz0123456789';
    ctx!.textBaseline = 'top';
    ctx!.font = '14px "Arial"';
    ctx!.textBaseline = 'alphabetic';
    ctx!.fillStyle = '#f60';
    ctx!.fillRect(125, 1, 62, 20);
    ctx!.fillStyle = '#069';
    ctx!.fillText(txt, 2, 15);
    ctx!.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx!.fillText(txt, 4, 17);

    return this.hashCode(canvas.toDataURL()).toString();
  }

  // Simple hash function for generating unique identifiers
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
