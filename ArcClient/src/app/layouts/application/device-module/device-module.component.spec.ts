import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceModuleComponent } from './device-module.component';

describe('DeviceModuleComponent', () => {
  let component: DeviceModuleComponent;
  let fixture: ComponentFixture<DeviceModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceModuleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
