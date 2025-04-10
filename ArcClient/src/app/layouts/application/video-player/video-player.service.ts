import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../../../core/config/endpoints';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { DeviceModuleService } from '../device-module/device-module.service';

interface ResponseModel {
  data: any;
  status: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class VideoPlayerService {
  constructor(
    private http: HttpClient,
    private deviceModuleService: DeviceModuleService
  ) {}

  getWebRtcUrl(deviceId: number, cameraId: number): Observable<ResponseModel> {
    return this.deviceModuleService.getStreamProfileByComponent(deviceId, cameraId, 1).pipe(
      switchMap((response) => {
        let rtspURL = response.data.url;
        rtspURL = rtspURL.replace("rtsp://", "rtsp://admin:admin@");

        return this.http.get<ResponseModel>(
          `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.GETWEBRTCURL}?rtspUrl=${encodeURIComponent(rtspURL)}`
        );
      }),
      catchError((error) => {
        return throwError(error);
      })
    );
  }
}
