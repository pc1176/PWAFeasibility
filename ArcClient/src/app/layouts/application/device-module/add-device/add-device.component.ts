import { Component } from '@angular/core';
import { NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardGroupComponent,
  TextColorDirective,
  CardComponent,
  CardBodyComponent,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormControlDirective,
  ButtonDirective,
  FormFeedbackComponent,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  RowDirective,
  GridModule,
} from '@coreui/angular';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DeviceModuleService } from '../device-module.service';
import { ToastrService } from 'ngx-toastr';
import { DeviceEventService } from '../../../shared/services/deviceEvent/device-event.service';
import { DevicesyncService } from '../../../shared/services/devicesync.service';
interface DeviceForm {
  Name: string;
  Address: string;
  HttpPort: number;
  RtspPort: number;
  UserName: string;
  Password: string;
  Type: number; // 1 for IP Camera, 2 for NVR
}

@Component({
  selector: 'app-add-device',
  standalone: true,
  imports: [
    GridModule,
    RouterModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardGroupComponent,
    TextColorDirective,
    CardComponent,
    CardBodyComponent,
    FormDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    FormFeedbackComponent,
    FormsModule,
    NgStyle,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    RowDirective,
  ],
  templateUrl: './add-device.component.html',
  styleUrls: ['./add-device.component.scss'],
})
export class AddDeviceComponent {
  customStylesValidated = false;
  deviceForm: DeviceForm = {
    Name: '192.168.111.180',
    Address: '192.168.111.180',
    HttpPort: 80,
    RtspPort: 554,
    UserName: 'admin',
    Password: 'admin',
    Type: 1, // Default to IP Camera
  };

  constructor(
    private deviceModuleService: DeviceModuleService,
    private router: Router,
    private toastr: ToastrService,
    private deviceEventService: DeviceEventService,
    private deviceSyncService: DevicesyncService
  ) { }

  async onSubmit() {
    this.customStylesValidated = true;
    console.log(this.deviceForm);

    if (
      this.deviceForm.Name &&
      this.deviceForm.Address &&
      this.deviceForm.HttpPort &&
      this.deviceForm.RtspPort &&
      this.deviceForm.UserName &&
      this.deviceForm.Password
    ) {
      (await this.deviceModuleService.addDevice(this.deviceForm)).subscribe({
        next: (response) => {
          if (response.offline) {
            this.toastr.info('Device saved offline. Will sync when connection is restored.');
            // Trigger a sync attempt
            this.deviceSyncService.syncPendingDevices();
          } else {
            this.toastr.success('Successfully added device!');
          }
          this.deviceEventService.notifyDeviceAdded();
          this.router.navigate(['/deviceManagement/viewDevice']);
        },
        error: (error) => {
          console.error('Error adding device:', error);
          if (error.status === 0) {
            this.toastr.error('Server is currently offline. Please try again later.');
          } else {
            this.toastr.error(error.error?.message || 'Failed to add device. Please try again.');
          }
        }
      });
    } else {
      this.toastr.error('Please fill out all fields correctly.');
    }
  }
}
