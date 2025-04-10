import { TestBed } from '@angular/core/testing';

import { DeviceBindingService } from './device-binding.service';

describe('DeviceBindingService', () => {
  let service: DeviceBindingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceBindingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
