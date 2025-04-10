import { Injectable } from '@angular/core';
import { AudioCodec, AudioCodecDescriptions, ComponentType, ComponentTypeDescriptions, ConnectionType, ConnectionTypeDescriptions, DeviceStatus, DeviceStatusDescriptions, DeviceType, DeviceTypeDescriptions, HttpStatusCode, HttpStatusCodeDescriptions, StreamingBitrate, StreamingBitrateDescriptions, VideoCodec, VideoCodecDescriptions, VideoResolution, VideoResolutionDescriptions } from './enum';

@Injectable({
  providedIn: 'root'
})
export class EnumService {
  getDescription(enumType: any, value: number): string {
    const enumMap = this.getEnumMap(enumType);
    return enumMap[value] || 'Unknown';
  }

  private getEnumMap(enumType: any): { [key: number]: string } {
    switch (enumType) {
        case HttpStatusCode:
            return HttpStatusCodeDescriptions;
        case DeviceType:
            return DeviceTypeDescriptions;
        case ConnectionType:
            return ConnectionTypeDescriptions;
        case DeviceStatus:
            return DeviceStatusDescriptions;
        case ComponentType:
            return ComponentTypeDescriptions;
        case VideoCodec:
            return VideoCodecDescriptions;
        case VideoResolution:
            return VideoResolutionDescriptions;
        case AudioCodec:
            return AudioCodecDescriptions;
        case StreamingBitrate:
            return StreamingBitrateDescriptions;
        default:
            return {};
    }
  }

}
