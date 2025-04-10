import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, from, map, Observable, of, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/config/endpoints';
import { IndexDbService } from '../../shared/services/index-db.service';
interface ResponseModel {
  data: any;
  status: number;
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class DeviceModuleService {
  private baseUrl = API_ENDPOINTS.BASE_URL;

  constructor(private http: HttpClient, private indexedDBService: IndexDbService,) {}

  tempDevice: any[] = [
    {
      id: 1,
      name: '192.168.111.180',
      address: '192.168.111.180',
      httpPort: 80,
      rtspPort: 554,
      type: 1,
      userName: 'admin',
      password: 'admin',
      protocol: '',
      version: '1.0.0',
      cameraCount: 0,
      alarmCount: 0,
      sensorCount: 0,
      status: 1,
      components: [],
    },
    {
      id: 2,
      name: 'fgd',
      address: 'dfgdgdgf',
      httpPort: 80,
      rtspPort: 554,
      type: 1,
      userName: 'dfsgdsg',
      password: 'fghdfh',
      protocol: '',
      version: '1.0.0',
      cameraCount: 0,
      alarmCount: 0,
      sensorCount: 0,
      status: 1,
      components: [],
    },
    {
      id: 3,
      name: 'ghjg',
      address: 'gfhjgfhj',
      httpPort: 80,
      rtspPort: 554,
      type: 1,
      userName: 'ghjghj',
      password: 'gfjgfhj',
      protocol: '',
      version: '1.0.0',
      cameraCount: 0,
      alarmCount: 0,
      sensorCount: 0,
      status: 1,
      components: [],
    },
  ];

  getDevices(id?: number): Observable<ResponseModel> {
    let params = new HttpParams();
    if (id !== undefined) {
      params = params.append('id', id.toString());
    }

    return this.http.get<ResponseModel>(
      `${this.baseUrl}${API_ENDPOINTS.DEVICE.GET}`,
      {
        params,
      }
    );
    // .pipe(
    //   map((response) => {
    //     return response;
    //   }),
    //   catchError((error) => {
    //     // Log the error (or show a notification)
    //     console.error('An error occurred:', error);

    //     return of({
    //       data: this.tempDevice,
    //       status: 200,
    //       message: "Devices retrieved successfully.",
    //     });
    //     // Return an observable with a user-facing error message
    //     // return throwError(() => new Error('Failed to load devices. Please try again later.'));
    //   })
    // );
  }

  async addDevice(deviceData: any): Promise<Observable<any>> {
    const formData = new FormData();
    formData.append('Name', deviceData.Name);
    formData.append('Address', deviceData.Address);
    formData.append('HttpPort', deviceData.HttpPort);
    formData.append('RtspPort', deviceData.RtspPort);
    formData.append('UserName', deviceData.UserName);
    formData.append('Password', deviceData.Password);
    formData.append('Type', deviceData.Type);
    return this.http.post(
      `${this.baseUrl}${API_ENDPOINTS.DEVICE.ADD}`,
      formData
    ).pipe(
      catchError(error => {
        // If we're offline or server error
        if (error.status === 0 || error.status === 502) {
          // Convert the IndexedDB promise to an observable
          return from(this.indexedDBService.addPendingDevice(deviceData))
            .pipe(
              map(() => ({
                success: true,
                offline: true,
                message: 'Device saved for offline sync'
              }))
            );
        }
        return throwError(() => error);
      })
    );
  }

  deleteDevie(deviceId: any): Observable<ResponseModel> {
    return this.http.delete<ResponseModel>(
      `${this.baseUrl}${API_ENDPOINTS.DEVICE.DELETE}?id=${deviceId}`
    );
  }

  getComponentsByDeviceId(deviceId: number): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(
      `${this.baseUrl}${API_ENDPOINTS.DEVICECOMPONENT.GETBYDEVICE}?deviceId=${deviceId}`
    );
  }

  getStreamProfileByComponent(
    deviceId: number,
    componentId: number,
    streamProfileId: number
  ): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(
      `${this.baseUrl}${API_ENDPOINTS.DEVICECOMPONENT.GETSTREAMPROFILEBYCOPONENT}?deviceId=${deviceId}&componentId=${componentId}&profileNo=${streamProfileId}`
    );
  }

  getStreamProfilesByComponentId(
    deviceId: number,
    componentId: number
  ): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(
      `${this.baseUrl}${API_ENDPOINTS.STREAMPROFILE.GETBYCOMPONENT}?deviceId=${deviceId}&componentId=${componentId}`
    );
  }

  updateStreamProfile(profile: any): Observable<ResponseModel> {
    console.log(profile);
    return this.http.post<ResponseModel>(
      `${this.baseUrl}${API_ENDPOINTS.STREAMPROFILE.UPDATE}`,
      profile
    );
  }

  getDeviecComponentListForSideBar(): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(
      `${this.baseUrl}${API_ENDPOINTS.DEVICE.GETNAMELIST}`
    );
  }
}
