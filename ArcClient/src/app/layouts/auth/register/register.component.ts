import { Component, OnInit } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective } from '@coreui/angular';
import { ActivatedRoute } from '@angular/router';
import { PageTitleService } from '../../shared/services/pageTitle/page-title.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ContainerComponent, RowComponent, ColComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})

export class RegisterComponent implements OnInit {
  constructor(private route: ActivatedRoute, private pageTitleService : PageTitleService) {
  }

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.pageTitleService.setTitle(data['title'] ?? '');
    });
  }
}
