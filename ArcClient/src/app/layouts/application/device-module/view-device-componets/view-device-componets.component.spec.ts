import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDeviceComponetsComponent } from './view-device-componets.component';

describe('ViewDeviceComponetsComponent', () => {
  let component: ViewDeviceComponetsComponent;
  let fixture: ComponentFixture<ViewDeviceComponetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDeviceComponetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDeviceComponetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
