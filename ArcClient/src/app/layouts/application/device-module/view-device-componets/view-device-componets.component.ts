import { Component, OnInit } from '@angular/core';
import { DeviceModuleService } from '../device-module.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonDirective, TableModule, UtilitiesModule } from '@coreui/angular';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { CommonModule } from '@angular/common';
import { iconSubset } from '../../../../shared/icons/icon-subset';
import { EnumService } from '../../../../shared/Enums/enum.service';
import { ComponentType } from '../../../../shared/Enums/enum';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-view-device-componets',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    UtilitiesModule,
    IconModule,
    ButtonDirective,
  ],
  providers: [IconSetService],
  templateUrl: './view-device-componets.component.html',
  styleUrl: './view-device-componets.component.scss',
})
export class ViewDeviceComponetsComponent implements OnInit {
  deviceId!: number;
  components: any[] = [];
  ComponentType = ComponentType;
  loading: boolean = false;

  constructor(
    private deviceModuleService: DeviceModuleService,
    private route: ActivatedRoute,
    private iconSetService: IconSetService,
    private enumService: EnumService,
    private router: Router,
    private toastr: ToastrService
  ) {
    iconSetService.icons = { ...iconSubset };
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.deviceId = +params['deviceId']; // Convert to number
      this.loadComponents();
    });
  }

  loadComponents(): void {
    this.loading = true; 
    this.deviceModuleService
      .getComponentsByDeviceId(this.deviceId)
      .subscribe((response) => {
        this.components = response.data;
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

  showProfiles(deviceId: number, componentId: number): void {
    this.router.navigate(['/deviceManagement/profiles'], {
      queryParams: { deviceId, componentId },
    });
  }

  getDescription(enumType: any, value: number): string {
    return this.enumService.getDescription(enumType, value);
  }
}
