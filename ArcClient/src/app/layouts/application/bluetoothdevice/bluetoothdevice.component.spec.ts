import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BluetoothdeviceComponent } from './bluetoothdevice.component';

describe('BluetoothdeviceComponent', () => {
  let component: BluetoothdeviceComponent;
  let fixture: ComponentFixture<BluetoothdeviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BluetoothdeviceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BluetoothdeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
