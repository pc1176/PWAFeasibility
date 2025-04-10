import { TestBed } from '@angular/core/testing';

import { DeviceEventService } from './device-event.service';

describe('DeviceEventService', () => {
  let service: DeviceEventService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceEventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
