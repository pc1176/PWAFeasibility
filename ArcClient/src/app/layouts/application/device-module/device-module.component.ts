import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonDirective} from '@coreui/angular';
import { Location } from '@angular/common';

@Component({
  selector: 'app-device-module',
  standalone: true,
  imports: [
    ButtonDirective,
    RouterModule,
    CommonModule,
  ],
  templateUrl: './device-module.component.html',
  styleUrl: './device-module.component.scss'
})
export class DeviceModuleComponent {

  constructor( private location: Location, private router: Router) {
     this.router.navigate(['deviceManagement/viewDevice']);
  }

  goBack(): void {
    this.location.back();
  }

}
