import { Component, OnInit } from '@angular/core';
import { ButtonDirective, TableModule, UtilitiesModule } from '@coreui/angular';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '../../../../shared/icons/icon-subset';
import { DeviceModuleService } from '../device-module.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EnumService } from '../../../../shared/Enums/enum.service';
import {
  DeviceType,
  DeviceTypeDescriptions,
} from '../../../../shared/Enums/enum';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-device',
  standalone: true,
  imports: [
    ButtonDirective,
    CommonModule,
    TableModule,
    UtilitiesModule,
    IconModule,
  ],
  providers: [IconSetService],
  templateUrl: './view-device.component.html',
  styleUrl: './view-device.component.scss',
})
export class ViewDeviceComponent implements OnInit {
  devices: any[] = [];
  deviceTypeDescriptions = DeviceTypeDescriptions;
  DeviceType = DeviceType;
  loading: boolean = false;

  constructor(
    private deviceModuleService: DeviceModuleService,
    private iconSetService: IconSetService,
    private router: Router,
    private enumService: EnumService,
    private toastr: ToastrService
  ) {
    iconSetService.icons = { ...iconSubset };
  }

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    this.loading = true; 
    this.deviceModuleService.getDevices().subscribe((response) => {
      this.devices = response.data;
      this.devices.sort((a, b) => { return (a.id - b.id); });
      this.loading = false;
    },
    (error) => {
      console.log(error);
      if (error.status === 0) {
        this.toastr.error('Server is currently offline. Please try again later.');
      } else {
        this.toastr.error(error.error.message || 'Please try again later.');
      }
      this.loading = false;
    });
  }

  deleteDevice(deviceId: number): void {

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {

        this.deviceModuleService.deleteDevie(deviceId).subscribe((response) => {
          console.log(response);
          if(response.data)
          {
            Swal.fire({
              title: "Deleted!",
              text: "Successfully deleted device!",
              icon: "success"
            });
            this.loadDevices();
          }
          else 
          {
            this.toastr.error('Please try again later.');
          }
        },
        (error) => {
          console.log(error);
          if (error.status === 0) {
            this.toastr.error(
              'Server is currently offline. Please try again later.'
            );
          } else {
            this.toastr.error(error.error.message || 'Please try again later.');
          }
        });
      }
    });
    
    
  }

  showComponents(deviceId: number): void {
    this.router.navigate(['/deviceManagement/viewComponents', deviceId]);
  }

  getDescription(enumType: any, value: number): string {
    return this.enumService.getDescription(enumType, value);
  }
  async shareDeviceList(): Promise<void> {
    // Format device data for sharing
    const deviceListText = this.formatDeviceListForSharing();
    
    // Check if Web Share API is supported
    if (navigator.share) {
      await navigator.share({
        title: 'Device List',
        text: deviceListText,
      })
      .then(() => {
        this.toastr.success('Device list shared successfully!');
      })
      .catch((error) => {
        console.error('Error sharing:', error);
        this.toastr.error('Failed to share device list.');
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      this.toastr.info('Web Share API is not supported in this browser.');
      
      // Create a temporary textarea to copy text to clipboard as fallback
      const textarea = document.createElement('textarea');
      textarea.value = deviceListText;
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        document.execCommand('copy');
        this.toastr.success('Device list copied to clipboard!');
      } catch (err) {
        this.toastr.error('Failed to copy device list to clipboard.');
      }
      
      document.body.removeChild(textarea);
    }
  }
  formatDeviceListForSharing(): string {
    // Create a formatted string of device information
    let formattedText = 'Device List:\n\n';
    
    this.devices.forEach(device => {
      formattedText += `ID: ${device.id}\n`;
      formattedText += `Name: ${device.name}\n`;
      formattedText += `Address: ${device.address}\n`;
      formattedText += `Type: ${this.getDescription(DeviceType, device.type)}\n`;
      formattedText += `HTTP Port: ${device.httpPort}\n`;
      formattedText += `RTSP Port: ${device.rtspPort}\n\n`;
    });
    
    return formattedText;
  }
}
