import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DeviceModuleService } from '../device-module.service';
import { CommonModule } from '@angular/common';
import { TableModule, ButtonDirective, FormCheckComponent, FormCheckInputDirective, FormCheckLabelDirective, FormDirective, FormControlDirective, UtilitiesModule } from '@coreui/angular';
import { EnumService } from '../../../../shared/Enums/enum.service';
import {
  VideoCodec,
  AudioCodec,
  VideoResolution,
} from '../../../../shared/Enums/enum';
import { FormsModule } from '@angular/forms';
import { IconModule } from '@coreui/icons-angular';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-view-component-stream-profiles',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonDirective,
    FormsModule,
    FormCheckComponent,
    FormCheckInputDirective,
    FormCheckLabelDirective,
    FormDirective,
    FormControlDirective,
    UtilitiesModule,
    IconModule,
  ],
  templateUrl: './view-component-stream-profiles.component.html',
  styleUrl: './view-component-stream-profiles.component.scss',
})
export class ViewComponentStreamProfilesComponent implements OnInit {
  deviceId!: number;
  componentId!: number;
  profiles: any[] = [];
  VideoCodec = VideoCodec;
  AudioCodec = AudioCodec;
  VideoResolution = VideoResolution;
  loading: boolean = false;

  constructor(
    private deviceModuleService: DeviceModuleService,
    private route: ActivatedRoute,
    private enumService: EnumService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.deviceId = +params['deviceId']; // Convert to number
      this.componentId = +params['componentId']; // Convert to number
      this.loadProfiles();
    });
  }

  loadProfiles(): void {
    this.loading = true; 
    this.deviceModuleService
      .getStreamProfilesByComponentId(this.deviceId, this.componentId)
      .subscribe((response) => {
        this.profiles = response.data;
        this.profiles.sort((a, b) => { return (a.no - b.no); });
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

  update(profileId : number): void {
    var profile = this.profiles.find(profile => profile.id === profileId);

    if(profile === undefined)
      return;

    this.deviceModuleService.updateStreamProfile(profile).subscribe((response) => {
      this.toastr.success('Successfully updated stream Profile!');
         this.loadProfiles();
    });
  }

  getDescription(enumType: any, value: number): string {
    return this.enumService.getDescription(enumType, value);
  }
}
