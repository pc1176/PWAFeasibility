import { Component, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
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
} from '@coreui/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PageTitleService } from '../../shared/services/pageTitle/page-title.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';
import { DeviceBindingService } from '../../shared/services/device-binding.service';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
interface LoginForm {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
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
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  customStylesValidated = false;
  loginForm: LoginForm = {
    username: '',
    password: '',
  };
  loading: boolean = false;
  deviceId: string = '';
  constructor(
    private route: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private authService: AuthService,
    private router: Router, 
    private toastr: ToastrService,
    private deviceBindingService: DeviceBindingService
  ) {}

  async ngOnInit() {

    this.authService.isLoggedIn().subscribe(isValid => {
      if (isValid) {
        this.router.navigate(['/dashboard']);
      }
    });
    this.deviceId = await this.getDeviceId();
    this.route.data.subscribe((data) => {
      this.pageTitleService.setTitle(data['title'] ?? '');
    });
  }
  async getDeviceId(): Promise<string> {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
  }
  onLogin() {
    this.loading = true; 
    this.customStylesValidated = true;
    if (this.loginForm.username && this.loginForm.password) {
      this.authService
        .login({
          username: this.loginForm.username,
          password: this.loginForm.password,
        })
        .subscribe((response) => {
          if (response.status === 200) {
            this.router.navigate(['/dashboard']);
            this.toastr.success("Successfully logged in");
          } else {
            this.toastr.error(response.message || "Please try again later.");
          }
          this.loading = false;
        },
        (error) => {
          console.log(error);
          if (error.status === 0) {
            this.toastr.error("Server is currently offline. Please try again later.");
          } else {
            this.toastr.error(error.error.message || "Please try again later.");
          }
          this.loading = false;
        });
    } else {
      this.toastr.error("Username or password is empty!");
      this.loading = false;
    }
  }
}
