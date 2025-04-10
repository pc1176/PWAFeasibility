import { TestBed } from '@angular/core/testing';

import { DeviceModuleService } from './device-module.service';

describe('DeviceModuleService', () => {
  let service: DeviceModuleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceModuleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
